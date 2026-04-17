export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { getHoldingById, updateHolding } from "@/db/queries/holdings";
import {
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionsForRecalc,
} from "@/db/queries/transactions";
import { recalculateCostBasisFromHistory } from "@globalfolio/shared";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const TRANSACTION_TYPES = [
  "buy", "sell", "dividend", "interest", "transfer",
  "split", "reverse_split", "drip", "spinoff", "merger",
  "return_of_capital", "bonus",
] as const;

const updateTransactionSchema = z.object({
  type: z.enum(TRANSACTION_TYPES).optional(),
  quantity: z.string().nullable().optional(),
  price: z.string().nullable().optional(),
  amount: z.string().optional(),
  fee: z.string().nullable().optional(),
  currency: z.string().length(3).optional(),
  ratioFrom: z.string().nullable().optional(),
  ratioTo: z.string().nullable().optional(),
  executedAt: z.string().datetime({ offset: true }).optional(),
  note: z.string().max(500).nullable().optional(),
});

async function verifyOwnership(holdingId: string, txId: string, userId: string) {
  const [holding, tx] = await Promise.all([
    getHoldingById(holdingId, userId),
    getTransactionById(txId),
  ]);
  if (!holding) return null;
  if (!tx || tx.holdingId !== holdingId) return null;
  return { holding, tx };
}

async function recalcHolding(holdingId: string, userId: string) {
  const txs = await getTransactionsForRecalc(holdingId);
  if (txs.length === 0) {
    // All transactions removed — zero out or leave as manual
    return;
  }
  const { quantity, costBasis } = recalculateCostBasisFromHistory(txs);
  await updateHolding(holdingId, userId, { quantity, costBasis });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; txId: string }> }
) {
  const limited = applyRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, txId } = await params;
  const owned = await verifyOwnership(id, txId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updated = await updateTransaction(txId, {
    ...parsed.data,
    executedAt: parsed.data.executedAt ? new Date(parsed.data.executedAt) : undefined,
  });

  const recalcTypes = ["buy", "sell", "split", "reverse_split", "drip", "bonus"];
  const prevType = owned.tx.type;
  const newType = parsed.data.type ?? prevType;
  if (recalcTypes.includes(prevType) || recalcTypes.includes(newType)) {
    await recalcHolding(id, session.user.id);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; txId: string }> }
) {
  const limited = applyRateLimit(_req, RATE_LIMITS.mutation);
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, txId } = await params;
  const owned = await verifyOwnership(id, txId, session.user.id);
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deleted = await deleteTransaction(txId);

  const recalcTypes = ["buy", "sell", "split", "reverse_split", "drip", "bonus"];
  if (recalcTypes.includes(owned.tx.type)) {
    await recalcHolding(id, session.user.id);
  }

  return NextResponse.json(deleted);
}
