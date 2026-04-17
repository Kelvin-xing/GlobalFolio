export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getHoldingsByUser } from "@/db/queries/holdings";
import { getLatestSnapshot } from "@/db/queries/snapshots";
import { getLatestRates } from "@/db/queries/exchange-rates";
import { fetchAndStoreRates } from "@/lib/exchange-rate-service";
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

  // Always fetch USD-based rates (exchange service stores USD as base)
  // Auto-refresh if empty or stale (date older than today)
  const today = new Date().toISOString().split("T")[0];
  let rates = await getLatestRates("USD");
  const isStale =
    rates.length === 0 ||
    String(rates[0]?.snapshotDate ?? "").slice(0, 10) < today;
  if (isStale) {
    try {
      await fetchAndStoreRates();
      rates = await getLatestRates("USD");
    } catch (e) {
      console.error("Failed to refresh exchange rates:", e);
    }
  }

  // Build USD → X rate map  (1 USD = X units of that currency)
  const usdRates: Record<string, number> = { USD: 1 };
  for (const r of rates) {
    if (r.quoteCurrency && r.rate) {
      usdRates[r.quoteCurrency] = parseFloat(r.rate);
    }
  }

  // Convert any amount from fromCurrency → baseCurrency via USD bridge
  function convertToBase(amount: Decimal, fromCurrency: string): Decimal {
    if (fromCurrency === baseCurrency) return amount;
    // Step 1: fromCurrency → USD  (1 USD = usdRates[fromCurrency])
    let inUSD = amount;
    if (fromCurrency !== "USD") {
      const rate = usdRates[fromCurrency];
      inUSD = rate ? amount.div(rate) : amount;
    }
    // Step 2: USD → baseCurrency
    if (baseCurrency === "USD") return inUSD;
    const baseRate = usdRates[baseCurrency];
    return baseRate ? inUSD.mul(baseRate) : inUSD;
  }

  // Calculate totals
  const holdingsList = await getHoldingsByUser(userId);
  let totalAssets = new Decimal(0);
  const byAssetClass: Record<string, Decimal> = {};
  const byCurrency: Record<string, Decimal> = {};
  const bySegment: Record<string, Decimal> = {}; // key: "CURRENCY|assetClass"

  for (const h of holdingsList) {
    const price = h.lastPrice || h.costBasis || "0";
    const qty = h.quantity || "0";
    const marketValue = convertToBase(
      new Decimal(price).mul(new Decimal(qty)),
      h.currency
    );

    totalAssets = totalAssets.plus(marketValue);

    totalAssets = totalAssets.plus(marketValue);

    const ac = h.assetClass || "other";
    byAssetClass[ac] = (byAssetClass[ac] || new Decimal(0)).plus(marketValue);
    byCurrency[h.currency] = (byCurrency[h.currency] || new Decimal(0)).plus(marketValue);

    const segKey = `${h.currency}|${ac}`;
    bySegment[segKey] = (bySegment[segKey] || new Decimal(0)).plus(marketValue);
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
    bySegment: serializeMap(bySegment),
    holdingsCount: holdingsList.length,
  });
}
