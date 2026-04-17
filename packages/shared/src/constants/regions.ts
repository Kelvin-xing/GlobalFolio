export const REGIONS = [
  { value: "US", label: "United States" },
  { value: "HK", label: "Hong Kong" },
  { value: "CN", label: "China" },
  { value: "JP", label: "Japan" },
  { value: "EU", label: "Europe" },
  { value: "UK", label: "United Kingdom" },
  { value: "BR", label: "Brazil" },
  { value: "TW", label: "Taiwan" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];
