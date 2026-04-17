import { db } from "..";
import { holdings } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export async function getHoldingsByUser(userId: string) {
  return db
    .select()
    .from(holdings)
    .where(eq(holdings.userId, userId))
    .orderBy(desc(holdings.updatedAt));
}

export async function getHoldingById(id: string, userId: string) {
  const result = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.id, id), eq(holdings.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createHolding(data: {
  userId: string;
  accountId?: string | null;
  name: string;
  ticker?: string | null;
  assetClass: string;
  quantity: string;
  costBasis?: string | null;
  currency: string;
  valuationMethod?: string;
  lastPrice?: string | null;
  lastPriceAt?: Date | null;
  isDemo?: boolean;
}) {
  const result = await db.insert(holdings).values(data).returning();
  return result[0];
}

export async function updateHolding(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    ticker: string | null;
    accountId: string | null;
    assetClass: string;
    quantity: string;
    costBasis: string | null;
    currency: string;
    valuationMethod: string;
    lastPrice: string | null;
    lastPriceAt: Date | null;
  }>
) {
  const result = await db
    .update(holdings)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(holdings.id, id), eq(holdings.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteHolding(id: string, userId: string) {
  const result = await db
    .delete(holdings)
    .where(and(eq(holdings.id, id), eq(holdings.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteDemoHoldings(userId: string) {
  return db
    .delete(holdings)
    .where(and(eq(holdings.userId, userId), eq(holdings.isDemo, true)))
    .returning();
}
