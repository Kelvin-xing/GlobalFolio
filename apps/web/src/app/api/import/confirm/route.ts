export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { getHoldingsByUser, updateHolding } from "@/db/queries/holdings";
import {
  getTransactionsForRecalc,
} from "@/db/queries/transactions";
import { recalculateCostBasisFromHistory } from "@globalfolio/shared";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const VALID_TYPES = [
  "buy", "sell", "dividend", "interest", "transfer",
  "split", "reverse_split", "drip", "spinoff", "merger",
  "return_of_capital", "bonus",
] as const;

/** Schema for a single mapped + validated import row */
const importRowSchema = z.object({
  holdingId: z.string().uuid("Invalid holding ID"),
  type: z.enum(VALID_TYPES),
  executedAt: z.string().datetime({ offset: true }).or(
    // Also accept plain date strings YYYY-MM-DD
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  ),
  quantity: z.string().refine((v) => !isNaN(Number(v)), { message: "quantity must be numeric" }).nullable().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)), { message: "price must be numeric" }).nullable().optional(),
  amount: z.string().refine((v) => !isNaN(Number(v)), { message: "amount must be numeric" }),
  currency: z.string().length(3),
  fee: z.string().refine((v) => !isNaN(Number(v)), { message: "fee must be numeric" }).nullable().optional(),
  ratioFrom: z.string().nullable().optional(),
  ratioTo: z.string().nullable().optional(),
  note: z.string().max(500).nullable().optional(),
});

const confirmBodySchema = z.object({
  rows: z.array(importRowSchema).min(1).max(10_000),
});

const COST_BASIS_TYPES = new Set([
  "buy", "sell", "split", "reverse_split", "drip", "bonus",
]);

export async function POST(req: NextRequest) {
  const limited = applyRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = confirmBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const rows = parsed.data.rows;

  // Verify every referenced holdingId belongs to this user
  const userHoldings = await getHoldingsByUser(userId);
  const ownedIds = new Set(userHoldings.map((h) => h.id));
  const invalidHolding = rows.find((r) => !ownedIds.has(r.holdingId));
  if (invalidHolding) {
    return NextResponse.json(
      { error: `Holding ${invalidHolding.holdingId} not found or not owned by user` },
      { status: 403 }
    );
  }

  // Bulk insert
  const inserts = rows.map((r) => ({
    holdingId: r.holdingId,
    type: r.type,
    quantity: r.quantity ?? null,
    price: r.price ?? null,
    amount: r.amount,
    fee: r.fee ?? "0",
    currency: r.currency,
    ratioFrom: r.ratioFrom ?? null,
    ratioTo: r.ratioTo ?? null,
    executedAt: new Date(r.executedAt),
    note: r.note ?? null,
  }));

  await db.insert(transactions).values(inserts);

  // Recalculate cost basis for every affected holding that has cost-basis-relevant transaction types
  const affectedHoldingIds = [
    ...new Set(
      rows.filter((r) => COST_BASIS_TYPES.has(r.type)).map((r) => r.holdingId)
    ),
  ];

  await Promise.all(
    affectedHoldingIds.map(async (holdingId) => {
      const txs = await getTransactionsForRecalc(holdingId);
      if (txs.length === 0) return;
      const { quantity, costBasis } = recalculateCostBasisFromHistory(
        txs.map((t) => ({
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          amount: t.amount,
          fee: t.fee,
          ratioFrom: t.ratioFrom,
          ratioTo: t.ratioTo,
        }))
      );
      await updateHolding(holdingId, { quantity, costBasis });
    })
  );

  return NextResponse.json(
    { inserted: rows.length, recalculated: affectedHoldingIds.length },
    { status: 201 }
  );
}
