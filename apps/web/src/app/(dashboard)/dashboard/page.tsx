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
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, BarChart3, PieChart as PieIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#ef4444",
];

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
      {/* subtle accent top bar */}
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
    } | undefined;
    isLoading: boolean;
  };
  const [range, setRange] = useState<string>("1Y");
  const { data: history } = useNetWorthHistory(range) as {
    data: Array<{ snapshotDate: string; netWorth: string }> | undefined;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const dailyNum = parseFloat(summary?.dailyChange || "0");
  const trend = dailyNum > 0 ? "up" : dailyNum < 0 ? "down" : "neutral";
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  // Pie chart data
  const pieData = Object.entries(summary?.byAssetClass || {}).map(
    ([name, value]) => ({ name, value: parseFloat(value) })
  );

  // Line chart data
  const chartData = (history || []).map((s) => ({
    date: s.snapshotDate,
    netWorth: parseFloat(s.netWorth),
  }));

  const formatCurrency = (v: string | number) => {
    const num = typeof v === "string" ? parseFloat(v) : v;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: summary?.baseCurrency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Portfolio overview · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
          trend === "up" ? "bg-emerald-500/10 text-emerald-500" :
          trend === "down" ? "bg-red-500/10 text-red-500" :
          "bg-muted text-muted-foreground"
        )}>
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
          accent={trend === "up" ? "bg-emerald-500" : trend === "down" ? "bg-red-500" : "bg-blue-600"}
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
          title="Asset Classes"
          value={String(Object.keys(summary?.byAssetClass || {}).length)}
          subtitle="diversified"
          icon={PieIcon}
          trend="neutral"
          accent="bg-amber-500"
        />
      </div>

      {/* Net Worth Chart */}
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
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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
                contentStyle={{ background: "#0F172A", border: "1px solid #1e2d47", borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: "#64748B", marginBottom: 4 }}
                itemStyle={{ color: "#F1F5F9" }}
                formatter={(v: number) => [formatCurrency(v), "Net Worth"]}
                labelFormatter={(l) => new Date(l).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
          <div className="flex h-[280px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No snapshot data yet.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Snapshots are taken daily.</p>
            </div>
          </div>
        )}
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Donut chart — hero of the dashboard */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Asset Allocation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">By asset class</p>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={72}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.9} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span style={{ fontSize: 12, color: "#94A3B8" }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ background: "#0F172A", border: "1px solid #1e2d47", borderRadius: 10, fontSize: 12 }}
                  itemStyle={{ color: "#F1F5F9" }}
                  formatter={(v: number) => [formatCurrency(v), ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <PieIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Add holdings to see allocation</p>
              </div>
            </div>
          )}
        </div>

        {/* Currency breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold">Currency Exposure</h2>
            <p className="text-xs text-muted-foreground mt-0.5">By base currency value</p>
          </div>
          {Object.keys(summary?.byCurrency || {}).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(summary!.byCurrency)
                .sort(([, a], [, b]) => parseFloat(b) - parseFloat(a))
                .map(([currency, value], i) => {
                  const total = parseFloat(summary!.totalAssets || "1");
                  const pct = total > 0 ? (parseFloat(value) / total) * 100 : 0;
                  return (
                    <div key={currency}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full flex-shrink-0"
                            style={{ background: COLORS[i % COLORS.length] }}
                          />
                          <span className="text-sm font-mono font-semibold">{currency}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground text-xs font-mono">{pct.toFixed(1)}%</span>
                          <span className="font-mono">{formatCurrency(value)}</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
              })}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Wallet className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Add holdings to see currency breakdown</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
