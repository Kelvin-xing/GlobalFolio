import Decimal from "decimal.js";

Decimal.set({ precision: 30 });

/**
 * Convert an amount from one currency to another.
 * rates: Record of "FROM_TO" → rate string, e.g. { "USD_JPY": "150.5" }
 */
export function convertCurrency(
  amount: string,
  from: string,
  to: string,
  rates: Record<string, string>
): string {
  if (from === to) return amount;

  const directKey = `${from}_${to}`;
  if (rates[directKey]) {
    return new Decimal(amount).mul(new Decimal(rates[directKey])).toFixed(18);
  }

  const inverseKey = `${to}_${from}`;
  if (rates[inverseKey]) {
    return new Decimal(amount).div(new Decimal(rates[inverseKey])).toFixed(18);
  }

  // Try cross via USD
  if (from !== "USD" && to !== "USD") {
    const fromUsd = rates[`${from}_USD`] || (rates[`USD_${from}`] ? undefined : undefined);
    const usdTo = rates[`USD_${to}`] || (rates[`${to}_USD`] ? undefined : undefined);

    if (rates[`${from}_USD`] && rates[`USD_${to}`]) {
      const inUsd = new Decimal(amount).mul(new Decimal(rates[`${from}_USD`]));
      return inUsd.mul(new Decimal(rates[`USD_${to}`])).toFixed(18);
    }
    if (rates[`USD_${from}`] && rates[`USD_${to}`]) {
      const inUsd = new Decimal(amount).div(new Decimal(rates[`USD_${from}`]));
      return inUsd.mul(new Decimal(rates[`USD_${to}`])).toFixed(18);
    }
  }

  throw new Error(`No exchange rate found for ${from} → ${to}`);
}

/**
 * Format a numeric string for display with locale-aware formatting.
 */
export function formatCurrency(
  amount: string,
  currency: string,
  locale: string = "en-US"
): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}
