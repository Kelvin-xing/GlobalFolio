import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function mutator<T>(url: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

type AccountRow = {
  id: string;
  name: string;
  type: string;
  currency: string;
  institution: string | null;
  createdAt: string | null;
};

// ─── Accounts ────────────────────────────────────
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetcher<AccountRow[]>("/api/accounts"),
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      mutator("/api/accounts", "POST", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutator(`/api/accounts/${id}`, "PUT", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutator(`/api/accounts/${id}`, "DELETE"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

// ─── Holdings ────────────────────────────────────
// ─── Holdings ────────────────────────────────────

type HoldingRow = {
  id: string;
  name: string;
  ticker: string | null;
  assetClass: string;
  quantity: string;
  costBasis: string | null;
  lastPrice: string | null;
  currency: string;
  accountId: string | null;
};

export function useHoldings() {
  return useQuery({
    queryKey: ["holdings"],
    queryFn: () => fetcher<HoldingRow[]>("/api/holdings"),
  });
}

export function useCreateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      mutator("/api/holdings", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      mutator(`/api/holdings/${id}`, "PUT", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteHolding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mutator(`/api/holdings/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

type DashboardSummary = Record<string, unknown>;
type HistoryPoint = { date: string; value: number };
type ExchangeRates = Record<string, number>;

// ─── Dashboard ───────────────────────────────────
export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => fetcher<DashboardSummary>("/api/dashboard/summary"),
  });
}

export function useNetWorthHistory(range: string = "1Y") {
  return useQuery({
    queryKey: ["dashboard", "history", range],
    queryFn: () => fetcher<HistoryPoint[]>(`/api/dashboard/history?range=${range}`),
  });
}

export function useExchangeRates() {
  return useQuery({
    queryKey: ["exchangeRates"],
    queryFn: () => fetcher<ExchangeRates>("/api/exchange-rates"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

type TransactionRow = {
  id: string;
  holdingId: string | null;
  type: string;
  quantity: string | null;
  price: string | null;
  amount: string;
  fee: string | null;
  currency: string;
  ratioFrom: string | null;
  ratioTo: string | null;
  executedAt: string;
  note: string | null;
  createdAt: string | null;
  holding?: { id: string; name: string; ticker?: string | null } | null;
};

// ─── Transactions ─────────────────────────────────
export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetcher<TransactionRow[]>("/api/transactions"),
    staleTime: 30 * 1000,
  });
}

export function useHoldingTransactions(holdingId: string) {
  return useQuery({
    queryKey: ["transactions", "holding", holdingId],
    queryFn: () => fetcher<TransactionRow[]>(`/api/holdings/${holdingId}/transactions`),
    enabled: !!holdingId,
    staleTime: 30 * 1000,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ holdingId, ...data }: { holdingId: string } & Record<string, unknown>) =>
      mutator(`/api/holdings/${holdingId}/transactions`, "POST", data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", "holding", vars.holdingId] });
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      holdingId,
      txId,
      ...data
    }: { holdingId: string; txId: string } & Record<string, unknown>) =>
      mutator(`/api/holdings/${holdingId}/transactions/${txId}`, "PUT", data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", "holding", vars.holdingId] });
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ holdingId, txId }: { holdingId: string; txId: string }) =>
      mutator(`/api/holdings/${holdingId}/transactions/${txId}`, "DELETE"),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", "holding", vars.holdingId] });
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useRecordCorporateAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ holdingId, ...data }: { holdingId: string } & Record<string, unknown>) =>
      mutator(`/api/holdings/${holdingId}/corporate-actions`, "POST", data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["holdings"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["transactions", "holding", vars.holdingId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
