export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getHoldingsByUser } from "@/db/queries/holdings";
import { getLatestSnapshot } from "@/db/queries/snapshots";
import { getLatestRates } from "@/db/queries/exchange-rates";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Decimal from "decimal.js";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's base currency
  const user = await db
    .select({ baseCurrency: users.baseCurrency })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  const baseCurrency = user[0]?.baseCurrency || "USD";

  // Get holdings and rates
  const [holdingsList, rates] = await Promise.all([
    getHoldingsByUser(userId),
    getLatestRates(baseCurrency),
  ]);

  // Build rates map
  const ratesMap: Record<string, string> = {};
  for (const r of rates) {
    ratesMap[`${r.baseCurrency}_${r.quoteCurrency}`] = r.rate!;
  }

  // Calculate totals
  let totalAssets = new Decimal(0);
  const byAssetClass: Record<string, Decimal> = {};
  const byCurrency: Record<string, Decimal> = {};

  for (const h of holdingsList) {
    const price = h.lastPrice || h.costBasis || "0";
    const qty = h.quantity || "0";
    let marketValue = new Decimal(price).mul(new Decimal(qty));

    // Convert to base currency
    if (h.currency !== baseCurrency) {
      const key = `${baseCurrency}_${h.currency}`;
      const inverseKey = `${h.currency}_${baseCurrency}`;
      if (ratesMap[inverseKey]) {
        marketValue = marketValue.mul(new Decimal(ratesMap[inverseKey]));
      } else if (ratesMap[key]) {
        marketValue = marketValue.div(new Decimal(ratesMap[key]));
      }
    }

    totalAssets = totalAssets.plus(marketValue);

    // Group by asset class
    const ac = h.assetClass || "other";
    byAssetClass[ac] = (byAssetClass[ac] || new Decimal(0)).plus(marketValue);

    // Group by currency
    byCurrency[h.currency] = (byCurrency[h.currency] || new Decimal(0)).plus(marketValue);
  }

  // Get previous day snapshot for daily change
  const prevSnapshot = await getLatestSnapshot(userId);
  const prevNetWorth = prevSnapshot?.netWorth
    ? new Decimal(prevSnapshot.netWorth)
    : new Decimal(0);
  const dailyChange = totalAssets.minus(prevNetWorth);
  const dailyChangePercent = prevNetWorth.isZero()
    ? "0"
    : dailyChange.div(prevNetWorth).mul(100).toFixed(2);

  // Serialize
  const serializeMap = (m: Record<string, Decimal>) =>
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v.toFixed(2)]));

  return NextResponse.json({
    baseCurrency,
    totalAssets: totalAssets.toFixed(2),
    totalLiabilities: "0.00",
    netWorth: totalAssets.toFixed(2),
    dailyChange: dailyChange.toFixed(2),
    dailyChangePercent,
    byAssetClass: serializeMap(byAssetClass),
    byCurrency: serializeMap(byCurrency),
    holdingsCount: holdingsList.length,
  });
}
