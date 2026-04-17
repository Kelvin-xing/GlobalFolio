"use client";

import { useState, useMemo } from "react";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useHoldings,
} from "@/hooks/use-queries";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUpDown,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Holding {
  id: string;
  name: string;
  ticker?: string | null;
  currency: string;
}

interface Transaction {
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TX_TYPES = [
  "buy", "sell", "dividend", "interest", "transfer",
  "split", "reverse_split", "drip", "spinoff", "merger",
  "return_of_capital", "bonus",
] as const;

const TYPE_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  buy:              { label: "Buy",            color: "text-emerald-500", icon: <TrendingUp className="h-3 w-3" /> },
  sell:             { label: "Sell",           color: "text-red-500",     icon: <TrendingDown className="h-3 w-3" /> },
  dividend:         { label: "Dividend",       color: "text-blue-500",    icon: <TrendingUp className="h-3 w-3" /> },
  interest:         { label: "Interest",       color: "text-blue-400",    icon: <TrendingUp className="h-3 w-3" /> },
  transfer:         { label: "Transfer",       color: "text-purple-500",  icon: <Minus className="h-3 w-3" /> },
  split:            { label: "Split",          color: "text-orange-500",  icon: <Minus className="h-3 w-3" /> },
  reverse_split:    { label: "Rev. Split",     color: "text-orange-600",  icon: <Minus className="h-3 w-3" /> },
  drip:             { label: "DRIP",           color: "text-teal-500",    icon: <TrendingUp className="h-3 w-3" /> },
  spinoff:          { label: "Spin-off",       color: "text-violet-500",  icon: <Minus className="h-3 w-3" /> },
  merger:           { label: "Merger",         color: "text-yellow-500",  icon: <Minus className="h-3 w-3" /> },
  return_of_capital:{ label: "Return of Cap.", color: "text-pink-500",    icon: <TrendingDown className="h-3 w-3" /> },
  bonus:            { label: "Bonus",          color: "text-cyan-500",    icon: <TrendingUp className="h-3 w-3" /> },
};

function fmt(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(Number(amount));
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ─── Add / Edit Dialog ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  holdingId: "",
  type: "buy" as string,
  quantity: "",
  price: "",
  amount: "",
  fee: "",
  currency: "USD",
  ratioFrom: "",
  ratioTo: "",
  executedAt: new Date().toISOString().slice(0, 10),
  note: "",
};

function TransactionDialog({
  open,
  onClose,
  holdings,
  editTx,
}: {
  open: boolean;
  onClose: () => void;
  holdings: Holding[];
  editTx?: Transaction | null;
}) {
  const create = useCreateTransaction();
  const update = useUpdateTransaction();

  const [form, setForm] = useState(() =>
    editTx
      ? {
          holdingId: editTx.holdingId ?? "",
          type: editTx.type,
          quantity: editTx.quantity ?? "",
          price: editTx.price ?? "",
          amount: editTx.amount,
          fee: editTx.fee ?? "",
          currency: editTx.currency,
          ratioFrom: editTx.ratioFrom ?? "",
          ratioTo: editTx.ratioTo ?? "",
          executedAt: editTx.executedAt.slice(0, 10),
          note: editTx.note ?? "",
        }
      : { ...EMPTY_FORM }
  );

  // Auto-fill currency from selected holding
  const selectedHolding = holdings.find((h) => h.id === form.holdingId);
  const isSplitType = form.type === "split" || form.type === "reverse_split";
  const needsQtyPrice = ["buy", "sell", "drip", "bonus", "split", "reverse_split"].includes(form.type);

  const handleHoldingChange = (holdingId: string) => {
    const h = holdings.find((h) => h.id === holdingId);
    setForm((f) => ({ ...f, holdingId, currency: h?.currency ?? f.currency }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      holdingId: form.holdingId,
      type: form.type,
      quantity: form.quantity || null,
      price: form.price || null,
      amount: form.amount || "0",
      fee: form.fee || null,
      currency: form.currency,
      ratioFrom: form.ratioFrom || null,
      ratioTo: form.ratioTo || null,
      executedAt: new Date(form.executedAt).toISOString(),
      note: form.note || null,
    };

    if (editTx) {
      await update.mutateAsync({ txId: editTx.id, ...payload, holdingId: editTx.holdingId! });
    } else {
      await create.mutateAsync(payload);
    }
    onClose();
  };

  if (!open) return null;

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border bg-background p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold">
          {editTx ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Holding */}
          {!editTx && (
            <div>
              <label className="text-sm font-medium">Holding *</label>
              <select
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.holdingId}
                onChange={(e) => handleHoldingChange(e.target.value)}
                required
              >
                <option value="">Select holding…</option>
                {holdings.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.ticker ? `${h.ticker} — ` : ""}{h.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Type + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <select
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TX_TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.executedAt}
                onChange={(e) => setForm({ ...form, executedAt: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Quantity + Price (for buy/sell/drip/bonus) */}
          {needsQtyPrice && !isSplitType && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price per unit</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Split ratio */}
          {isSplitType && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">From (old shares)</label>
                <input
                  type="number" step="any" min="1"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.ratioFrom}
                  onChange={(e) => setForm({ ...form, ratioFrom: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To (new shares)</label>
                <input
                  type="number" step="any" min="1"
                  className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  value={form.ratioTo}
                  onChange={(e) => setForm({ ...form, ratioTo: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
          )}

          {/* Amount + Currency + Fee */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium">
                {isSplitType ? "Amount (optional)" : "Total Amount *"}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required={!isSplitType}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <input
                type="text"
                maxLength={3}
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm uppercase"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Fee / Commission</label>
            <input
              type="number" step="any" min="0"
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Note</label>
            <input
              type="text"
              maxLength={500}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Optional note…"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? "Saving…" : editTx ? "Update" : "Add Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmDialog({
  tx,
  onConfirm,
  onClose,
}: {
  tx: Transaction;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const deleteTx = useDeleteTransaction();

  const handleDelete = async () => {
    await deleteTx.mutateAsync({ holdingId: tx.holdingId!, txId: tx.id });
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-xl">
        <h2 className="mb-2 text-base font-semibold">Delete Transaction</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          This will permanently delete this transaction. If it was a buy/sell,
          the holding&apos;s cost basis will be recalculated.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTx.isPending}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {deleteTx.isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<Transaction & { holding?: { id: string; name: string; ticker?: string | null } | null }>();

export default function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: holdingsData = [] } = useHoldings();

  const [sorting, setSorting] = useState<SortingState>([
    { id: "executedAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  const holdings = holdingsData as Holding[];

  const filteredData = useMemo(() => {
    let data = transactions as Transaction[];
    if (typeFilter !== "all") data = data.filter((tx) => tx.type === typeFilter);
    return data;
  }, [transactions, typeFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("executedAt", {
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 text-xs font-medium"
            onClick={() => column.toggleSorting()}
          >
            Date <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: (info) => (
          <span className="text-sm tabular-nums">{fmtDate(info.getValue())}</span>
        ),
      }),
      columnHelper.accessor("holding", {
        header: "Holding",
        cell: (info) => {
          const h = info.getValue();
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{h?.name ?? "—"}</span>
              {h?.ticker && (
                <span className="text-xs text-muted-foreground">{h.ticker}</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => {
          const meta = TYPE_META[info.getValue()] ?? { label: info.getValue(), color: "", icon: null };
          return (
            <span className={`flex items-center gap-1 text-xs font-medium ${meta.color}`}>
              {meta.icon} {meta.label}
            </span>
          );
        },
      }),
      columnHelper.accessor("quantity", {
        header: () => <span className="text-right block">Quantity</span>,
        cell: (info) => {
          const v = info.getValue();
          if (!v) return <span className="text-center block text-muted-foreground">—</span>;
          return (
            <span className="text-right block text-sm tabular-nums">
              {Number(v).toLocaleString("en-US", { maximumFractionDigits: 8 })}
            </span>
          );
        },
      }),
      columnHelper.accessor("price", {
        header: () => <span className="text-right block">Price</span>,
        cell: (info) => {
          const v = info.getValue();
          const currency = info.row.original.currency;
          if (!v) return <span className="text-center block text-muted-foreground">—</span>;
          return (
            <span className="text-right block text-sm tabular-nums">
              {fmt(v, currency)}
            </span>
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: () => <span className="text-right block">Amount</span>,
        cell: (info) => {
          const tx = info.row.original;
          const isSell = tx.type === "sell" || tx.type === "return_of_capital";
          return (
            <span
              className={`text-right block text-sm font-medium tabular-nums ${
                isSell ? "text-red-500" : "text-emerald-500"
              }`}
            >
              {isSell ? "-" : "+"}{fmt(info.getValue(), tx.currency)}
            </span>
          );
        },
      }),
      columnHelper.accessor("fee", {
        header: () => <span className="text-right block">Fee</span>,
        cell: (info) => {
          const v = info.getValue();
          const currency = info.row.original.currency;
          if (!v || v === "0") return <span className="text-center block text-muted-foreground">—</span>;
          return (
            <span className="text-right block text-xs text-muted-foreground tabular-nums">
              {fmt(v, currency)}
            </span>
          );
        },
      }),
      columnHelper.accessor("note", {
        header: "Note",
        cell: (info) => (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {info.getValue() ?? ""}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        cell: (info) => {
          const tx = info.row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setEditTx(tx)}
                className="rounded p-1.5 hover:bg-muted"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => setDeleteTx(tx)}
                className="rounded p-1.5 hover:bg-destructive/10"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          );
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} across all holdings
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                className="rounded-lg border bg-background py-2 pl-9 pr-3 text-sm w-56"
                placeholder="Search transactions…"
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <select
              className="rounded-lg border bg-background px-3 py-2 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All types</option>
              {TX_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_META[t]?.label ?? t}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <ArrowUpDown className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground">
                Add your first transaction to track cost basis and returns.
              </p>
              <button
                onClick={() => setAddOpen(true)}
                className="mt-1 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((hg) => (
                    <tr key={hg.id} className="border-b bg-muted/30">
                      {hg.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {table.getRowModel().rows.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No transactions match your filters.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {addOpen && (
        <TransactionDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          holdings={holdings}
        />
      )}
      {editTx && (
        <TransactionDialog
          open={!!editTx}
          onClose={() => setEditTx(null)}
          holdings={holdings}
          editTx={editTx}
        />
      )}
      {deleteTx && (
        <DeleteConfirmDialog
          tx={deleteTx}
          onConfirm={() => setDeleteTx(null)}
          onClose={() => setDeleteTx(null)}
        />
      )}
    </>
  );
}
