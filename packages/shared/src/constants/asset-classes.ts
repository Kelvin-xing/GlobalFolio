export const ASSET_CLASSES = [
  { value: "stock", label: "Stock" },
  { value: "etf", label: "ETF" },
  { value: "bond", label: "Bond" },
  { value: "fund", label: "Fund" },
  { value: "crypto", label: "Crypto" },
  { value: "cash", label: "Cash / Deposit" },
  { value: "insurance", label: "Insurance" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number]["value"];
