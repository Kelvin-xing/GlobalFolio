"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  ArrowLeftRight,
  PieChart,
  BadgeDollarSign,
  Target,
  Settings,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; disabled?: boolean };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/holdings", label: "Holdings", icon: Briefcase },
      { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/accounts", label: "Accounts", icon: Briefcase },
      { href: "/dashboard/import", label: "Import CSV", icon: Upload },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/analysis", label: "Analysis", icon: PieChart, disabled: true },
      { href: "/dashboard/dividends", label: "Dividends", icon: BadgeDollarSign, disabled: true },
      { href: "/dashboard/goals", label: "Goals", icon: Target, disabled: true },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-60 border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex flex-col gap-5 p-4 h-full overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 select-none">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.disabled ? "#" : item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-blue-600/15 text-blue-400 shadow-[inset_2px_0_0_#2563EB]"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                      item.disabled && "opacity-35 pointer-events-none"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 flex-shrink-0 transition-colors",
                        isActive ? "text-blue-400" : "text-sidebar-foreground/60 group-hover:text-foreground"
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.disabled && (
                      <span className="rounded-full bg-sidebar-accent px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-sidebar-foreground/40">
                        Soon
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
