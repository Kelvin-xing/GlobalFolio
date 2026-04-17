"use client";

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/holdings", label: "Holdings", icon: Briefcase },
  { href: "/dashboard/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/dashboard/analysis", label: "Analysis", icon: PieChart, disabled: true },
  { href: "/dashboard/dividends", label: "Dividends", icon: BadgeDollarSign, disabled: true },
  { href: "/dashboard/goals", label: "Goals", icon: Target, disabled: true },
  { href: "/dashboard/accounts", label: "Accounts", icon: Briefcase },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-60 border-r bg-sidebar transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                item.disabled && "opacity-40 pointer-events-none"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-[10px] text-muted-foreground">P1</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
