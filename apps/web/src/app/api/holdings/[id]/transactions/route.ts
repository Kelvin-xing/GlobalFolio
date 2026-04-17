export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { getHoldingById, updateHolding } from "@/db/queries/holdings";
import {
  getTransactionsByHolding,
  getTransactionsForRecalc,
  createTransaction,
} from "@/db/queries/transactions";
import { recalculateCostBasisFromHistory } from "@globalfolio/shared";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const TRANSACTION_TYPES = [
  "buy", "sell", "dividend", "interest", "transfer",
  "split", "reverse_split", "drip", "spinoff", "merger",
  "return_of_capital", "bonus",
] as const;

const createTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  quantity: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  amount: z.string(),
  fee: z.string().nullable().optional(),
  currency: z.string().length(3),
  ratioFrom: z.string().nullable().optional(),
  ratioTo: z.string().nullable().optional(),
  executedAt: z.string().datetime({ offset: true }),
  note: z.string().max(500).nullable().optional(),
});

async function verifyHoldingOwnership(holdingId: string, userId: string) {
  const holding = await getHoldingById(holdingId, userId);
  return holding;
}

async function recalcHolding(holdingId: string, userId: string) {
  const txs = await getTransactionsForRecalc(holdingId);
  if (txs.length === 0) return;

  const { quantity, costBasis } = recalculateCostBasisFromHistory(txs);
  await updateHolding(holdingId, userId, { quantity, costBasis });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const holding = await verifyHoldingOwnership(id, session.user.id);
  if (!holding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data = await getTransactionsByHolding(id);
  return NextResponse.json(data);
}

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

  const { id } = await params;
  const holding = await verifyHoldingOwnership(id, session.user.id);
  if (!holding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = createTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const tx = await createTransaction({
    holdingId: id,
    ...parsed.data,
    executedAt: new Date(parsed.data.executedAt),
  });

  // Recalculate cost basis after buy/sell/split-type transactions
  const recalcTypes = ["buy", "sell", "split", "reverse_split", "drip", "bonus"];
  if (recalcTypes.includes(parsed.data.type)) {
    await recalcHolding(id, session.user.id);
  }

  return NextResponse.json(tx, { status: 201 });
}
