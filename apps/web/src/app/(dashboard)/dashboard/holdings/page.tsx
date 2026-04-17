"use client";

import { useState } from "react";
import {
  useHoldings,
  useCreateHolding,
  useDeleteHolding,
} from "@/hooks/use-queries";
import { Plus, Trash2, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Holding {
  id: string;
  name: string;
  ticker?: string | null;
  assetClass: string;
  quantity: string;
  costBasis?: string | null;
  lastPrice?: string | null;
  currency: string;
  accountId?: string | null;
}

function AddHoldingDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createHolding = useCreateHolding();
  const [form, setForm] = useState({
    name: "",
    ticker: "",
    assetClass: "stock",
    quantity: "",
    costBasis: "",
    currency: "USD",
    valuationMethod: "market",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createHolding.mutateAsync({
      ...form,
      ticker: form.ticker || null,
      costBasis: form.costBasis || null,
    });
    setForm({
      name: "",
      ticker: "",
      assetClass: "stock",
      quantity: "",
      costBasis: "",
      currency: "USD",
      valuationMethod: "market",
    });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Add Holding</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name *</label>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Ticker</label>
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.ticker}
                onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                placeholder="e.g. AAPL"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Asset Class *</label>
              <select
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.assetClass}
                onChange={(e) => setForm({ ...form, assetClass: e.target.value })}
              >
                {["stock", "etf", "bond", "fund", "crypto", "cash", "insurance", "real_estate", "other"].map(
                  (ac) => (
                    <option key={ac} value={ac}>
                      {ac.replace("_", " ")}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Quantity *</label>
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                type="number"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Cost Basis</label>
              <input
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                type="number"
                step="any"
                value={form.costBasis}
                onChange={(e) => setForm({ ...form, costBasis: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency *</label>
              <select
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              >
                {["USD", "TWD", "HKD", "CNY", "JPY", "EUR", "GBP", "BRL"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createHolding.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createHolding.isPending ? "Adding..." : "Add Holding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HoldingsPage() {
  const { data: holdings, isLoading } = useHoldings() as {
    data: Holding[] | undefined;
    isLoading: boolean;
  };
  const deleteHolding = useDeleteHolding();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = (holdings || []).filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.ticker && h.ticker.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Holdings</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Holding
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search holdings..."
          className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-lg font-medium">No holdings yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first holding to get started
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Holding
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Ticker</th>
                <th className="px-4 py-3 text-left font-medium">Class</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3 text-right font-medium">Value</th>
                <th className="px-4 py-3 text-right font-medium">Currency</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const price = parseFloat(h.lastPrice || h.costBasis || "0");
                const qty = parseFloat(h.quantity || "0");
                const value = price * qty;
                return (
                  <tr key={h.id} className="border-b hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {h.ticker || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                        {h.assetClass.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {parseFloat(h.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {h.currency}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteHolding.mutate(h.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AddHoldingDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
