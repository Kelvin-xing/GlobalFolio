"use client";

import { useDashboardSummary, useNetWorthHistory } from "@/hooks/use-queries";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  PieChart as PieIcon,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Semantic color palette: same asset class → same hue family ──
const ASSET_CLASS_PALETTE: Record<string, string[]> = {
  equity:      ["#2563EB", "#3b82f6", "#60a5fa", "#93c5fd"],
  etf:         ["#059669", "#10b981", "#34d399", "#6ee7b7"],
  bond:        ["#d97706", "#f59e0b", "#fbbf24", "#fde68a"],
  crypto:      ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd"],
  cash:        ["#475569", "#64748b", "#94a3b8", "#cbd5e1"],
  real_estate: ["#dc2626", "#ef4444", "#f87171", "#fca5a5"],
  commodity:   ["#ea580c", "#f97316", "#fb923c", "#fdba74"],
  other:       ["#0891b2", "#06b6d4", "#22d3ee", "#67e8f9"],
};

const ASSET_CLASS_LABELS: Record<string, string> = {
  equity: "Equities",
  etf: "ETFs",
  bond: "Bonds",
  crypto: "Crypto",
  cash: "Cash",
  real_estate: "Real Estate",
  commodity: "Commodities",
  other: "Other",
};

const RANGES = ["1W", "1M", "3M", "6M", "YTD", "1Y", "5Y", "ALL"] as const;

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  accent?: string;
}) {
  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-border/80 hover:shadow-lg cursor-default overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-[2px]", accent || "bg-blue-600/40")} />
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold tracking-tight">{value}</p>
      {subtitle && (
        <p
          className={cn(
            "mt-1.5 text-xs font-medium",
            trend === "up" && "text-emerald-500",
            trend === "down" && "text-red-500",
            trend === "neutral" && "text-muted-foreground"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── Custom tooltip for donut ──
function DonutTooltip({
  active,
  payload,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  formatter: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="font-medium mb-1" style={{ color: item.payload.color }}>
        {item.name}
      </p>
      <p className="font-mono font-bold text-foreground">{formatter(item.value)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary() as {
    data: {
      baseCurrency: string;
      totalAssets: string;
      netWorth: string;
      dailyChange: string;
      dailyChangePercent: string;
      holdingsCount: number;
      byAssetClass: Record<string, string>;
      byCurrency: Record<string, string>;
      bySegment: Record<string, string>; // "CURRENCY|assetClass" → value in base currency
    } | undefined;
    isLoading: boolean;
  };

  const [range, setRange] = useState<string>("1Y");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const { data: history } = useNetWorthHistory(range) as {
    data: Array<{ snapshotDate: string; netWorth: string }> | undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const dailyNum = parseFloat(summary?.dailyChange || "0");
  const trend = dailyNum > 0 ? "up" : dailyNum < 0 ? "down" : "neutral";
  const TrendIcon = dailyNum < 0 ? TrendingDown : TrendingUp;

  const formatCurrency = (v: string | number) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: summary?.baseCurrency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // ── Build segment data for donut: each slice = currency × asset class ──
  const segmentEntries = Object.entries(summary?.bySegment || {})
    .map(([key, val]) => {
      const [currency, assetClass] = key.split("|");
      return { key, currency, assetClass: assetClass || "other", value: parseFloat(val) };
    })
    .filter((s) => s.value > 0)
    .sort((a, b) => b.value - a.value);

  // Assign semantic colors: same asset class → same hue, different currencies → different shades
  const assetClassIndexMap: Record<string, number> = {};
  const segmentColors: Record<string, string> = {};
  for (const seg of segmentEntries) {
    const palette = ASSET_CLASS_PALETTE[seg.assetClass] || ASSET_CLASS_PALETTE.other;
    const idx = assetClassIndexMap[seg.assetClass] ?? 0;
    segmentColors[seg.key] = palette[idx % palette.length];
    assetClassIndexMap[seg.assetClass] = idx + 1;
  }

  const pieData = segmentEntries.map((s) => ({
    name: `${s.currency} ${ASSET_CLASS_LABELS[s.assetClass] || s.assetClass}`,
    value: s.value,
    color: segmentColors[s.key],
    key: s.key,
    currency: s.currency,
    assetClass: s.assetClass,
  }));

  // Group by asset class for the legend panel
  const legendGroups: Record<string, typeof pieData> = {};
  for (const item of pieData) {
    if (!legendGroups[item.assetClass]) legendGroups[item.assetClass] = [];
    legendGroups[item.assetClass].push(item);
  }

  const totalValue = parseFloat(summary?.totalAssets || "0");
  const activeItem = pieData.find((p) => p.key === activeKey) ?? null;

  // Net worth history
  const chartData = (history || []).map((s) => ({
    date: s.snapshotDate,
    netWorth: parseFloat(s.netWorth),
  }));

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
            trend === "up"
              ? "bg-emerald-500/10 text-emerald-500"
              : trend === "down"
              ? "bg-red-500/10 text-red-500"
              : "bg-muted text-muted-foreground"
          )}
        >
          <TrendIcon className="h-3 w-3" />
          {dailyNum >= 0 ? "+" : ""}{summary?.dailyChangePercent || "0"}% today
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(summary?.netWorth || "0")}
          subtitle={`${dailyNum >= 0 ? "+" : ""}${formatCurrency(summary?.dailyChange || "0")} today`}
          icon={Wallet}
          trend={trend}
          accent={
            trend === "up"
              ? "bg-emerald-500"
              : trend === "down"
              ? "bg-red-500"
              : "bg-blue-600"
          }
        />
        <StatCard
          title="Total Assets"
          value={formatCurrency(summary?.totalAssets || "0")}
          icon={TrendIcon}
          trend="neutral"
          accent="bg-blue-600"
        />
        <StatCard
          title="Holdings"
          value={String(summary?.holdingsCount || 0)}
          subtitle="across all accounts"
          icon={BarChart3}
          trend="neutral"
          accent="bg-violet-500"
        />
        <StatCard
          title="Currencies"
          value={String(Object.keys(summary?.byCurrency || {}).length)}
          subtitle={`${Object.keys(summary?.byAssetClass || {}).length} asset classes`}
          icon={Globe}
          trend="neutral"
          accent="bg-amber-500"
        />
      </div>

      {/* ── Hero section: big donut (3/5) + breakdown legend (2/5) ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

        {/* Donut chart — dominant element */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card p-5">
          <div className="mb-1">
            <h2 className="text-sm font-semibold">Portfolio Allocation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              By currency &amp; asset class · converted to {summary?.baseCurrency || "USD"}
            </p>
          </div>

          {pieData.length > 0 ? (
            <div className="relative">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={115}
                    outerRadius={175}
                    paddingAngle={2}
                    dataKey="value"
                    strokeWidth={0}
                    onMouseEnter={(_, idx) => setActiveKey(pieData[idx]?.key ?? null)}
                    onMouseLeave={() => setActiveKey(null)}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={entry.color}
                        opacity={activeKey === null || activeKey === entry.key ? 1 : 0.28}
                        style={{ cursor: "pointer", transition: "opacity 0.15s" }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip formatter={formatCurrency} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center label — shows hovered item or total */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {activeItem ? activeItem.name : "Net Worth"}
                </p>
                <p className="font-mono text-3xl font-bold tracking-tight mt-1">
                  {activeItem
                    ? formatCurrency(activeItem.value)
                    : formatCurrency(summary?.netWorth || "0")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeItem
                    ? `${totalValue > 0 ? ((activeItem.value / totalValue) * 100).toFixed(1) : "0"}% of portfolio`
                    : (summary?.baseCurrency || "USD")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <PieIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No holdings yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Import your portfolio to see allocation
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Breakdown legend — interactive, synced with donut hover */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 flex flex-col min-h-0">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hover a row to highlight the slice
            </p>
          </div>

          {Object.keys(legendGroups).length > 0 ? (
            <div className="flex-1 overflow-y-auto space-y-5 pr-0.5">
              {Object.entries(legendGroups).map(([assetClass, items]) => {
                const groupTotal = items.reduce((s, i) => s + i.value, 0);
                const groupPct = totalValue > 0 ? (groupTotal / totalValue) * 100 : 0;
                const baseColor = (
                  ASSET_CLASS_PALETTE[assetClass] || ASSET_CLASS_PALETTE.other
                )[0];

                return (
                  <div key={assetClass}>
                    {/* Asset class group header */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                          style={{ background: baseColor }}
                        />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {ASSET_CLASS_LABELS[assetClass] || assetClass}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {groupPct.toFixed(1)}%
                        </span>
                        <span className="font-mono text-xs font-semibold">
                          {formatCurrency(groupTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Group total bar */}
                    <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${groupPct}%`, background: baseColor }}
                      />
                    </div>

                    {/* Per-currency sub-rows */}
                    {items.map((item) => {
                      const pct = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
                      return (
                        <div
                          key={item.key}
                          className={cn(
                            "flex items-center justify-between rounded-md px-2 py-1.5 -mx-2 transition-colors cursor-default",
                            activeKey === item.key
                              ? "bg-muted/80"
                              : "hover:bg-muted/40"
                          )}
                          onMouseEnter={() => setActiveKey(item.key)}
                          onMouseLeave={() => setActiveKey(null)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                              style={{ background: item.color }}
                            />
                            <span className="font-mono text-xs font-medium">
                              {item.currency}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {pct.toFixed(1)}%
                            </span>
                            <span className="font-mono text-xs">
                              {formatCurrency(item.value)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-muted-foreground">No data</p>
            </div>
          )}
        </div>
      </div>

      {/* Net Worth History */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Net Worth Over Time</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Historical portfolio value</p>
          </div>
          <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150",
                  range === r
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v) =>
                  new Date(v).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 11, fill: "#64748B" }}
                width={80}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0F172A",
                  border: "1px solid #1e2d47",
                  borderRadius: 10,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#64748B", marginBottom: 4 }}
                itemStyle={{ color: "#F1F5F9" }}
                formatter={(v: number) => [formatCurrency(v), "Net Worth"]}
                labelFormatter={(l) =>
                  new Date(l).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                }
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#2563EB"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorNw)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[240px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No snapshot data yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Snapshots are taken daily.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
