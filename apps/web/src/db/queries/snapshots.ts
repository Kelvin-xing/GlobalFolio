import { db } from "..";
import { snapshots } from "../schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export async function upsertSnapshot(data: {
  userId: string;
  snapshotDate: string;
  totalAssets: string;
  totalLiabilities: string;
  netWorth: string;
  breakdown: Record<string, unknown>;
}) {
  return db
    .insert(snapshots)
    .values(data)
    .onConflictDoUpdate({
      target: [snapshots.userId, snapshots.snapshotDate],
      set: {
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        netWorth: data.netWorth,
        breakdown: data.breakdown,
      },
    })
    .returning();
}

export async function getSnapshotsByUser(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const conditions = [eq(snapshots.userId, userId)];
  if (startDate) conditions.push(gte(snapshots.snapshotDate, startDate));
  if (endDate) conditions.push(lte(snapshots.snapshotDate, endDate));

  return db
    .select()
    .from(snapshots)
    .where(and(...conditions))
    .orderBy(snapshots.snapshotDate);
}

export async function getLatestSnapshot(userId: string) {
  const result = await db
    .select()
    .from(snapshots)
    .where(eq(snapshots.userId, userId))
    .orderBy(desc(snapshots.snapshotDate))
    .limit(1);
  return result[0] ?? null;
}
