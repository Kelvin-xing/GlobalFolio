export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
