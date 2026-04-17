"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { ChevronRight, Globe, ArrowRight } from "lucide-react";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "TWD", name: "New Taiwan Dollar", flag: "🇹🇼" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
];

const REGIONS = [
  { code: "US", name: "United States" },
  { code: "TW", name: "Taiwan" },
  { code: "HK", name: "Hong Kong" },
  { code: "CN", name: "China" },
  { code: "JP", name: "Japan" },
  { code: "EU", name: "Europe" },
  { code: "UK", name: "United Kingdom" },
  { code: "BR", name: "Brazil" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const setBaseCurrency = useUIStore((s) => s.setBaseCurrency);
  const [step, setStep] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [loadDemo, setLoadDemo] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggleRegion = (code: string) => {
    setSelectedRegions((prev) =>
      prev.includes(code) ? prev.filter((r) => r !== code) : [...prev, code]
    );
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      setBaseCurrency(selectedCurrency);

      // Save to DB
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseCurrency: selectedCurrency,
          regions: selectedRegions,
        }),
      });

      // Mark onboarding complete
      await fetch("/api/onboarding/complete", { method: "POST" });

      // Load demo data if selected
      if (loadDemo) {
        await fetch("/api/onboarding/demo", { method: "POST" });
      }

      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Step indicators */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 w-8 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-6 text-center">
            <Globe className="mx-auto h-16 w-16 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Welcome to Globalfolio</h1>
              <p className="mt-2 text-muted-foreground">
                Let&apos;s set up your global investment dashboard
              </p>
            </div>
            <div>
              <h2 className="mb-3 font-semibold">Select your base currency</h2>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCurrency(c.code)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
                      selectedCurrency === c.code
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="font-medium">{c.code}</span>
                    <span className="text-muted-foreground">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mx-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold">Which regions do you invest in?</h1>
            <p className="text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.code}
                  onClick={() => toggleRegion(r.code)}
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    selectedRegions.includes(r.code)
                      ? "border-primary bg-primary/5"
                      : "hover:bg-accent"
                  }`}
                >
                  <span className="font-medium">{r.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mx-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <h1 className="text-2xl font-bold">Start with demo data?</h1>
            <p className="text-muted-foreground">
              We can populate your dashboard with sample holdings so you can
              explore the features right away.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setLoadDemo(true)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  loadDemo ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <p className="font-medium">Yes, load demo data</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get sample holdings across multiple asset classes and regions
                </p>
              </button>
              <button
                onClick={() => setLoadDemo(false)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  !loadDemo ? "border-primary bg-primary/5" : "hover:bg-accent"
                }`}
              >
                <p className="font-medium">No, start empty</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  I&apos;ll add my holdings manually
                </p>
              </button>
            </div>

            <button
              onClick={handleComplete}
              disabled={saving}
              className="mx-auto flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Setting up..." : "Get Started"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
