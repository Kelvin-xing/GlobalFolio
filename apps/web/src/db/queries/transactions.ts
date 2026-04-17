import { db } from "..";
import { transactions } from "../schema";
import { eq, desc } from "drizzle-orm";

export async function getTransactionsByHolding(holdingId: string) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.holdingId, holdingId))
    .orderBy(desc(transactions.executedAt));
}

export async function createTransaction(data: {
  holdingId: string;
  type: string;
  quantity: string;
  price: string;
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
