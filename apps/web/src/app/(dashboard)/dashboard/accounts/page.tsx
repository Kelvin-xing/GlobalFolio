"use client";

import { useState } from "react";
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
} from "@/hooks/use-queries";
import { Plus, Trash2, Building2 } from "lucide-react";

interface Account {
  id: string;
  name: string;
  institution?: string | null;
  type: string;
  currency: string;
  region?: string | null;
}

function AddAccountDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const createAccount = useCreateAccount();
  const [form, setForm] = useState({
    name: "",
    institution: "",
    type: "brokerage",
    currency: "USD",
    region: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAccount.mutateAsync({
      ...form,
      institution: form.institution || undefined,
      region: form.region || undefined,
    });
    setForm({ name: "", institution: "", type: "brokerage", currency: "USD", region: "" });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Add Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Account Name *</label>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Institution</label>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
              value={form.institution}
              onChange={(e) => setForm({ ...form, institution: e.target.value })}
              placeholder="e.g. Fidelity, Schwab"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <select
                className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {["checking", "savings", "brokerage", "crypto", "retirement", "other"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
              disabled={createAccount.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createAccount.isPending ? "Adding..." : "Add Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts() as {
    data: Account[] | undefined;
    isLoading: boolean;
  };
  const deleteAccount = useDeleteAccount();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Accounts</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (accounts || []).length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-lg font-medium">No accounts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an account to organize your holdings
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-4 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(accounts || []).map((a) => (
            <div
              key={a.id}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{a.name}</h3>
                  {a.institution && (
                    <p className="text-sm text-muted-foreground">
                      {a.institution}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteAccount.mutate(a.id)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {a.type}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {a.currency}
                </span>
                {a.region && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {a.region}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddAccountDialog open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
