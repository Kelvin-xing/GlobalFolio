export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { getHoldingById, updateHolding } from "@/db/queries/holdings";
import { createTransaction, getTransactionsForRecalc } from "@/db/queries/transactions";
import { recalculateCostBasisFromHistory } from "@globalfolio/shared";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const corporateActionSchema = z.discriminatedUnion("type", [
  // Stock Split: quantity *= ratioTo / ratioFrom  (e.g. 2:1 split → ratioFrom=1, ratioTo=2)
  z.object({
    type: z.literal("split"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    ratioFrom: z.string().refine((v) => Number(v) > 0, { message: "ratioFrom must be > 0" }),
    ratioTo: z.string().refine((v) => Number(v) > 0, { message: "ratioTo must be > 0" }),
    note: z.string().max(500).optional(),
  }),
  // Reverse Split: quantity *= ratioFrom / ratioTo  (e.g. 1:10 reverse → ratioFrom=10, ratioTo=1)
  z.object({
    type: z.literal("reverse_split"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    ratioFrom: z.string().refine((v) => Number(v) > 0, { message: "ratioFrom must be > 0" }),
    ratioTo: z.string().refine((v) => Number(v) > 0, { message: "ratioTo must be > 0" }),
    note: z.string().max(500).optional(),
  }),
  // Cash Dividend: records income, does not change holding
  z.object({
    type: z.literal("dividend"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    amount: z.string().refine((v) => Number(v) > 0, { message: "amount must be > 0" }),
    currency: z.string().length(3),
    note: z.string().max(500).optional(),
  }),
  // DRIP (Dividend Reinvestment Plan): adds shares at dividend price
  z.object({
    type: z.literal("drip"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    quantity: z.string().refine((v) => Number(v) > 0, { message: "quantity must be > 0" }),
    price: z.string().refine((v) => Number(v) > 0, { message: "price must be > 0" }),
    amount: z.string().refine((v) => Number(v) > 0, { message: "amount must be > 0" }),
    currency: z.string().length(3),
    note: z.string().max(500).optional(),
  }),
  // Bonus shares (stock dividend / scrip): adds shares at zero cost
  z.object({
    type: z.literal("bonus"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    quantity: z.string().refine((v) => Number(v) > 0, { message: "quantity must be > 0" }),
    note: z.string().max(500).optional(),
  }),
  // Spinoff: records a new holding creation event
  z.object({
    type: z.literal("spinoff"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    amount: z.string().refine((v) => Number(v) >= 0),
    currency: z.string().length(3),
    note: z.string().max(500).optional(),
  }),
  // Return of capital
  z.object({
    type: z.literal("return_of_capital"),
    executedAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
    amount: z.string().refine((v) => Number(v) > 0),
    currency: z.string().length(3),
    note: z.string().max(500).optional(),
  }),
]);

const COST_BASIS_TYPES = new Set(["split", "reverse_split", "drip", "bonus"]);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = applyRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: holdingId } = await params;

  const holding = await getHoldingById(holdingId, session.user.id);
  if (!holding) {
    return NextResponse.json({ error: "Holding not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = corporateActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const action = parsed.data;
  const executedAt = new Date(action.executedAt);

  // Build the transaction record
  let txData: Parameters<typeof createTransaction>[0];

  switch (action.type) {
    case "split":
    case "reverse_split":
      txData = {
        holdingId,
        type: action.type,
        quantity: null,
        price: null,
        amount: "0",
        fee: null,
        currency: holding.currency,
        ratioFrom: action.ratioFrom,
        ratioTo: action.ratioTo,
        executedAt,
        note: action.note ?? null,
      };
      break;

    case "dividend":
    case "spinoff":
    case "return_of_capital":
      txData = {
        holdingId,
        type: action.type,
        quantity: null,
        price: null,
        amount: action.amount,
        fee: null,
        currency: action.currency,
        ratioFrom: null,
        ratioTo: null,
        executedAt,
        note: action.note ?? null,
      };
      break;

    case "drip":
      txData = {
        holdingId,
        type: "drip",
        quantity: action.quantity,
        price: action.price,
        amount: action.amount,
        fee: null,
        currency: action.currency,
        ratioFrom: null,
        ratioTo: null,
        executedAt,
        note: action.note ?? null,
      };
      break;

    case "bonus":
      txData = {
        holdingId,
        type: "bonus",
        quantity: action.quantity,
        price: null,
        amount: "0",
        fee: null,
        currency: holding.currency,
        ratioFrom: null,
        ratioTo: null,
        executedAt,
        note: action.note ?? null,
      };
      break;
  }

  const tx = await createTransaction(txData);

  // Recalculate cost basis if the action type affects quantity/cost
  if (COST_BASIS_TYPES.has(action.type)) {
    const txs = await getTransactionsForRecalc(holdingId);
    if (txs.length > 0) {
      const { quantity, costBasis } = recalculateCostBasisFromHistory(
        txs.map((t) => ({
          type: t.type,
          quantity: t.quantity,
          price: t.price,
          amount: t.amount,
          fee: t.fee,
          ratioFrom: t.ratioFrom,
          ratioTo: t.ratioTo,
          executedAt: t.executedAt,
        }))
      );
      await updateHolding(holdingId, session.user.id, { quantity, costBasis });
    }
  }

  return NextResponse.json(tx, { status: 201 });
}
