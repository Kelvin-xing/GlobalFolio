import { upsertRate } from "@/db/queries/exchange-rates";

const SUPPORTED_CURRENCIES = ["USD", "TWD", "HKD", "CNY", "JPY", "EUR", "GBP", "BRL"];

/**
 * Fetch exchange rates from API and store in DB.
 * Uses exchangerate-api.com (free tier) or FMP as fallback.
 */
export async function fetchAndStoreRates() {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    console.warn("EXCHANGE_RATE_API_KEY not set, skipping rate fetch");
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  // Fetch USD-based rates
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${encodeURIComponent(apiKey)}/latest/USD`
  );

  if (!res.ok) {
    throw new Error(`Exchange rate API error: ${res.status}`);
  }

  const data = await res.json();
  const rates = data.conversion_rates;

  if (!rates) {
    throw new Error("No conversion_rates in response");
  }

  // Store each pair
  for (const quote of SUPPORTED_CURRENCIES) {
    if (quote === "USD") continue;
    const rate = rates[quote];
    if (rate) {
      await upsertRate({
        baseCurrency: "USD",
        quoteCurrency: quote,
        rate: String(rate),
        snapshotDate: today,
      });
    }
  }

  console.log(`Exchange rates updated for ${today}`);
}
