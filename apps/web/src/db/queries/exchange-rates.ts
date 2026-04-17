import { db } from "..";
import { exchangeRates } from "../schema";
import { eq, and, desc } from "drizzle-orm";

export async function upsertRate(data: {
  baseCurrency: string;
  quoteCurrency: string;
  rate: string;
  snapshotDate: string;
}) {
  return db
    .insert(exchangeRates)
    .values(data)
    .onConflictDoUpdate({
      target: [
        exchangeRates.baseCurrency,
        exchangeRates.quoteCurrency,
        exchangeRates.snapshotDate,
      ],
      set: { rate: data.rate },
    })
    .returning();
}

export async function getLatestRates(baseCurrency: string = "USD") {
  // Get the most recent snapshot date for this base currency
  const latest = await db
    .select({ snapshotDate: exchangeRates.snapshotDate })
    .from(exchangeRates)
    .where(eq(exchangeRates.baseCurrency, baseCurrency))
    .orderBy(desc(exchangeRates.snapshotDate))
    .limit(1);

  if (!latest[0]) return [];

  return db
    .select()
    .from(exchangeRates)
    .where(
      and(
        eq(exchangeRates.baseCurrency, baseCurrency),
        eq(exchangeRates.snapshotDate, latest[0].snapshotDate)
      )
    );
}
