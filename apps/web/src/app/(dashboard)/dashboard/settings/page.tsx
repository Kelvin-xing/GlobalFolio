"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import { Save, Check } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { baseCurrency, setBaseCurrency } = useUIStore();
  const [saved, setSaved] = useState(false);
  const [localCurrency, setLocalCurrency] = useState(baseCurrency);

  useEffect(() => {
    setLocalCurrency(baseCurrency);
  }, [baseCurrency]);

  const handleSave = async () => {
    setBaseCurrency(localCurrency);

    // Also update in DB
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseCurrency: localCurrency }),
      });
    } catch {
      // Zustand already persisted locally
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <p className="mt-1">{session?.user?.name || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="mt-1">{session?.user?.email || "—"}</p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 font-semibold">Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Base Currency</label>
              <p className="mb-2 text-xs text-muted-foreground">
                All values will be converted to this currency on the dashboard
              </p>
              <select
                className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm"
                value={localCurrency}
                onChange={(e) => setLocalCurrency(e.target.value)}
              >
                {["USD", "TWD", "HKD", "CNY", "JPY", "EUR", "GBP", "BRL"].map(
                  (c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
