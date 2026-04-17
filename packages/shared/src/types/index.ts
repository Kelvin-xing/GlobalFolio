export type TransactionType =
  | "buy"
  | "sell"
  | "dividend"
  | "interest"
  | "transfer"
  | "split"
  | "reverse_split"
  | "drip"
  | "spinoff"
  | "merger"
  | "return_of_capital"
  | "bonus";

export type ValuationMethod = "market" | "manual" | "formula";

export type AccountType =
  | "checking"
  | "savings"
  | "brokerage"
  | "crypto"
  | "retirement"
  | "other";
