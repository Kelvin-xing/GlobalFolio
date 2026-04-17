"use client";

import { useState } from "react";
import { useRecordCorporateAction } from "@/hooks/use-queries";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ActionType = "split" | "reverse_split" | "dividend" | "drip" | "bonus" | "return_of_capital";

interface Holding {
  id: string;
  name: string;
  ticker?: string | null;
  quantity: string;
  currency: string;
}

interface Props {
  holding: Holding;
  open: boolean;
  onClose: () => void;
}

const ACTION_TYPES: { value: ActionType; label: string; description: string }[] = [
  {
    value: "split",
    label: "Stock Split",
    description: "Increases shares by a ratio (e.g. 2:1 doubles shares, halves price)",
  },
  {
    value: "reverse_split",
    label: "Reverse Split",
    description: "Decreases shares by a ratio (e.g. 1:10 reduces to 1/10 of shares)",
  },
  {
    value: "dividend",
    label: "Cash Dividend",
    description: "Cash payment received — recorded as income, holding unchanged",
  },
  {
    value: "drip",
    label: "DRIP (Dividend Reinvestment)",
    description: "Dividend reinvested as new shares at the dividend price",
  },
  {
    value: "bonus",
    label: "Bonus Shares",
    description: "Free shares issued (stock dividend / scrip) — zero cost added",
  },
  {
    value: "return_of_capital",
    label: "Return of Capital",
    description: "Capital returned to shareholders — recorded as income",
  },
];

function previewMessage(
  type: ActionType,
  holding: Holding,
  form: Record<string, string>
): string | null {
  const qty = parseFloat(holding.quantity);
  if (isNaN(qty)) return null;

  if (type === "split" && form.ratioFrom && form.ratioTo) {
    const from = parseFloat(form.ratioFrom);
    const to = parseFloat(form.ratioTo);
    if (from > 0 && to > 0) {
      const newQty = ((qty * to) / from).toLocaleString();
      return `${qty.toLocaleString()} → ${newQty} shares (×${(to / from).toFixed(4)})`;
    }
  }
  if (type === "reverse_split" && form.ratioFrom && form.ratioTo) {
    const from = parseFloat(form.ratioFrom);
    const to = parseFloat(form.ratioTo);
    if (from > 0 && to > 0) {
      const newQty = ((qty * to) / from).toLocaleString();
      return `${qty.toLocaleString()} → ${newQty} shares (×${(to / from).toFixed(4)})`;
    }
  }
  if (type === "bonus" && form.quantity) {
    const bonus = parseFloat(form.quantity);
    if (bonus > 0) {
      return `${qty.toLocaleString()} + ${bonus.toLocaleString()} = ${(qty + bonus).toLocaleString()} shares`;
    }
  }
  if (type === "drip" && form.quantity) {
    const drip = parseFloat(form.quantity);
    if (drip > 0) {
      return `${qty.toLocaleString()} + ${drip.toLocaleString()} = ${(qty + drip).toLocaleString()} shares`;
    }
  }
  return null;
}

export function CorporateActionDialog({ holding, open, onClose }: Props) {
  const [actionType, setActionType] = useState<ActionType>("split");
  const [form, setForm] = useState<Record<string, string>>({
    ratioFrom: "1",
    ratioTo: "2",
    amount: "",
    quantity: "",
    price: "",
    currency: holding.currency,
    executedAt: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const record = useRecordCorporateAction();

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const base = {
      holdingId: holding.id,
      type: actionType,
      executedAt: new Date(form.executedAt).toISOString(),
      note: form.note || undefined,
    };

    let payload: Record<string, unknown>;

    switch (actionType) {
      case "split":
      case "reverse_split":
        payload = { ...base, ratioFrom: form.ratioFrom, ratioTo: form.ratioTo };
        break;
      case "dividend":
      case "return_of_capital":
        payload = { ...base, amount: form.amount, currency: form.currency };
        break;
      case "drip":
        payload = {
          ...base,
          quantity: form.quantity,
          price: form.price,
          amount: form.amount,
          currency: form.currency,
        };
        break;
      case "bonus":
        payload = { ...base, quantity: form.quantity };
        break;
    }

    try {
      await record.mutateAsync(payload!);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record action");
    }
  };

  if (!open) return null;

  const selectedMeta = ACTION_TYPES.find((a) => a.value === actionType)!;
  const preview = previewMessage(actionType, holding, form);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold">Record Corporate Action</h2>
            <p className="text-sm text-muted-foreground">
              {holding.ticker ? `${holding.name} (${holding.ticker})` : holding.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value as ActionType);
                setError(null);
              }}
              className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {ACTION_TYPES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">{selectedMeta.description}</p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Effective Date</label>
            <input
              type="date"
              required
              value={form.executedAt}
              onChange={(e) => update("executedAt", e.target.value)}
              className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Split ratio fields */}
          {(actionType === "split" || actionType === "reverse_split") && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {actionType === "split" ? "Old Ratio (From)" : "Old Ratio (From)"}
                </label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  required
                  value={form.ratioFrom}
                  onChange={(e) => update("ratioFrom", e.target.value)}
                  className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  {actionType === "split" ? "New Ratio (To)" : "New Ratio (To)"}
                </label>
                <input
                  type="number"
                  min="0.000001"
                  step="any"
                  required
                  value={form.ratioTo}
                  onChange={(e) => update("ratioTo", e.target.value)}
                  className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {/* Quantity field (bonus / drip) */}
          {(actionType === "bonus" || actionType === "drip") && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {actionType === "bonus" ? "Bonus Shares Received" : "Shares Received"}
              </label>
              <input
                type="number"
                min="0.000001"
                step="any"
                required
                placeholder="0"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Price field (drip only) */}
          {actionType === "drip" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Price per Share</label>
              <input
                type="number"
                min="0"
                step="any"
                required
                placeholder="0.00"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {/* Amount + Currency (dividend / drip / return_of_capital) */}
          {(actionType === "dividend" || actionType === "drip" || actionType === "return_of_capital") && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1.5">Amount</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => update("amount", e.target.value)}
                  className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Currency</label>
                <input
                  type="text"
                  maxLength={3}
                  required
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value.toUpperCase())}
                  className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Note (optional)</label>
            <input
              type="text"
              maxLength={500}
              placeholder="e.g. AAPL 4:1 split"
              value={form.note}
              onChange={(e) => update("note", e.target.value)}
              className="w-full bg-input text-foreground rounded-lg px-3 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Impact preview */}
          {preview && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2 text-sm text-blue-400">
              <span className="font-medium">Impact preview: </span>
              {preview}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Action recorded and cost basis recalculated.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={record.isPending || success}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors",
                record.isPending || success
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {record.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {record.isPending ? "Recording…" : "Record Action"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
