import { db } from "..";
import { transactions, holdings } from "../schema";
import { eq, desc, asc, and, inArray } from "drizzle-orm";

export async function getTransactionsByHolding(holdingId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.holdingId, holdingId))
    .orderBy(desc(transactions.executedAt));
}

export async function getTransactionsByHoldingAsc(holdingId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.holdingId, holdingId))
    .orderBy(asc(transactions.executedAt));
}

export async function getTransactionById(id: string) {
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  return result[0] ?? null;
}

/** All transactions for a user (via holdings ownership join) */
export async function getTransactionsByUser(userId: string) {
  const userHoldings = await db
    .select({ id: holdings.id, name: holdings.name, ticker: holdings.ticker })
    .from(holdings)
    .where(eq(holdings.userId, userId));

  if (userHoldings.length === 0) return [];

  const holdingIds = userHoldings.map((h) => h.id);
  const holdingMap = Object.fromEntries(userHoldings.map((h) => [h.id, h]));

  const rows = await db
    .select()
    .from(transactions)
    .where(inArray(transactions.holdingId, holdingIds))
    .orderBy(desc(transactions.executedAt));

  return rows.map((tx) => ({
    ...tx,
    holding: tx.holdingId ? holdingMap[tx.holdingId] : null,
  }));
}

export async function createTransaction(data: {
  holdingId: string;
  type: string;
  quantity?: string | null;
  price?: string | null;
  amount: string;
  fee?: string | null;
  currency: string;
  ratioFrom?: string | null;
  ratioTo?: string | null;
  executedAt: Date;
  note?: string | null;
}) {
  const result = await db.insert(transactions).values(data).returning();
  return result[0];
}

export async function updateTransaction(
  id: string,
  data: Partial<{
    type: string;
    quantity: string | null;
    price: string | null;
    amount: string;
    fee: string | null;
    currency: string;
    ratioFrom: string | null;
    ratioTo: string | null;
    executedAt: Date;
    note: string | null;
  }>
) {
  const result = await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id))
    .returning();
  return result[0] ?? null;
}

export async function deleteTransaction(id: string) {
  const result = await db
    .delete(transactions)
    .where(eq(transactions.id, id))
    .returning();
  return result[0] ?? null;
}

/** Get all buy/sell/split transactions for cost basis recalculation */
export async function getTransactionsForRecalc(holdingId: string) {
  return db
    .select({
      type: transactions.type,
      quantity: transactions.quantity,
      price: transactions.price,
      amount: transactions.amount,
      fee: transactions.fee,
      ratioFrom: transactions.ratioFrom,
      ratioTo: transactions.ratioTo,
      executedAt: transactions.executedAt,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.holdingId, holdingId),
        inArray(transactions.type, [
          "buy", "sell", "split", "reverse_split", "drip", "bonus",
        ])
      )
    )
    .orderBy(asc(transactions.executedAt));
}
