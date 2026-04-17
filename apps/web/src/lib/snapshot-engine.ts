import { db } from "@/db";
import { holdings, users, snapshots } from "@/db/schema";
import { getLatestRates } from "@/db/queries/exchange-rates";
import { eq } from "drizzle-orm";
import Decimal from "decimal.js";

/**
 * Generate daily snapshot for a user.
 * Called by the cron job or manually.
 */
export async function generateSnapshotForUser(userId: string) {
  // Get user info
  const user = await db
    .select({ baseCurrency: users.baseCurrency })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const baseCurrency = user[0]?.baseCurrency || "USD";

  // Get holdings
  const holdingsList = await db
    .select()
    .from(holdings)
    .where(eq(holdings.userId, userId));

  // Get rates
  const rates = await getLatestRates(baseCurrency);
  const ratesMap: Record<string, string> = {};
  for (const r of rates) {
    ratesMap[`${r.baseCurrency}_${r.quoteCurrency}`] = r.rate!;
  }

  let totalAssets = new Decimal(0);
  const byAssetClass: Record<string, string> = {};
  const byCurrency: Record<string, string> = {};

  for (const h of holdingsList) {
    const price = h.lastPrice || h.costBasis || "0";
    const qty = h.quantity || "0";
    let value = new Decimal(price).mul(new Decimal(qty));

    // Convert to base currency
    if (h.currency !== baseCurrency) {
      const inverseKey = `${h.currency}_${baseCurrency}`;
      const key = `${baseCurrency}_${h.currency}`;
      if (ratesMap[inverseKey]) {
        value = value.mul(new Decimal(ratesMap[inverseKey]));
      } else if (ratesMap[key]) {
        value = value.div(new Decimal(ratesMap[key]));
      }
    }

    totalAssets = totalAssets.plus(value);

    const ac = h.assetClass || "other";
    byAssetClass[ac] = (new Decimal(byAssetClass[ac] || "0"))
      .plus(value)
      .toFixed(2);
    byCurrency[h.currency] = (new Decimal(byCurrency[h.currency] || "0"))
      .plus(value)
      .toFixed(2);
  }

  const today = new Date().toISOString().split("T")[0];

  await db
    .insert(snapshots)
    .values({
      userId,
      snapshotDate: today,
      totalAssets: totalAssets.toFixed(2),
      totalLiabilities: "0.00",
      netWorth: totalAssets.toFixed(2),
      breakdown: { byAssetClass, byCurrency },
    })
    .onConflictDoUpdate({
      target: [snapshots.userId, snapshots.snapshotDate],
      set: {
        totalAssets: totalAssets.toFixed(2),
        totalLiabilities: "0.00",
        netWorth: totalAssets.toFixed(2),
        breakdown: { byAssetClass, byCurrency },
      },
    });
}

/**
 * Generate snapshots for all users.
 */
export async function generateAllSnapshots() {
  const allUsers = await db.select({ id: users.id }).from(users);
  for (const u of allUsers) {
    try {
      await generateSnapshotForUser(u.id);
    } catch (err) {
      console.error(`Snapshot failed for user ${u.id}:`, err);
    }
  }
}
