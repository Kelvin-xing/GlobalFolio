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
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316",
];

const RANGES = ["1W", "1M", "3M", "6M", "YTD", "1Y", "5Y", "ALL"] as const;

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {subtitle && (
        <p
          className={cn(
            "mt-1 text-xs",
            trend === "up" && "text-green-600 dark:text-green-400",
            trend === "down" && "text-red-600 dark:text-red-400",
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
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net Worth"
          value={formatCurrency(summary?.netWorth || "0")}
          subtitle={`${dailyNum >= 0 ? "+" : ""}${formatCurrency(summary?.dailyChange || "0")} (${summary?.dailyChangePercent || "0"}%)`}
          icon={Wallet}
          trend={trend}
        />
        <StatCard
          title="Total Assets"
          value={formatCurrency(summary?.totalAssets || "0")}
          icon={TrendIcon}
          trend="neutral"
        />
        <StatCard
          title="Holdings"
          value={String(summary?.holdingsCount || 0)}
          icon={BarChart3}
          trend="neutral"
        />
        <StatCard
          title="Asset Classes"
          value={String(Object.keys(summary?.byAssetClass || {}).length)}
          icon={PieIcon}
          trend="neutral"
        />
      </div>

      {/* Net Worth Chart */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Net Worth Over Time</h2>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                  range === r
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorNw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short" })}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{ fontSize: 12 }}
                width={80}
              />
              <Tooltip
                formatter={(v: number) => [formatCurrency(v), "Net Worth"]}
                labelFormatter={(l) => new Date(l).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorNw)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No snapshot data yet. Snapshots are taken daily.
          </div>
        )}
      </div>

      {/* Asset Allocation */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">By Asset Class</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Add holdings to see allocation
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-4 font-semibold">By Currency</h2>
          {Object.keys(summary?.byCurrency || {}).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(summary!.byCurrency).map(([currency, value]) => {
                const total = parseFloat(summary!.totalAssets || "1");
                const pct = total > 0 ? (parseFloat(value) / total) * 100 : 0;
                return (
                  <div key={currency}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{currency}</span>
                      <span>{formatCurrency(value)}</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              Add holdings to see currency breakdown
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
