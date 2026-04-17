import { db } from "..";
import { accounts } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getAccountsByUser(userId: string) {
  return db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(accounts.name);
}

export async function getAccountById(id: string, userId: string) {
  const result = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function createAccount(data: {
  userId: string;
  name: string;
  institution?: string;
  type: string;
  currency: string;
  region?: string;
}) {
  const result = await db.insert(accounts).values(data).returning();
  return result[0];
}

export async function updateAccount(
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    institution: string;
    type: string;
    currency: string;
    region: string;
  }>
) {
  const result = await db
    .update(accounts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning();
  return result[0] ?? null;
}

export async function deleteAccount(id: string, userId: string) {
  const result = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .returning();
  return result[0] ?? null;
}
