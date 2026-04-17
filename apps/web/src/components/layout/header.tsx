"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "next-auth/react";
import { Sun, Moon, Menu, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border/60 bg-background/80 backdrop-blur-md px-4 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="lg:hidden cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer group">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_18px_rgba(37,99,235,0.6)] transition-shadow">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
          </svg>
        </span>
        <span className="text-sm font-semibold tracking-tight">GlobalFolio</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 hidden dark:block" />
          <Moon className="h-4 w-4 block dark:hidden" />
        </button>

        {session?.user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border/60">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-foreground leading-none">
                {session.user.name?.split(" ")[0] || "Account"}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {session.user.email}
              </span>
            </div>
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name || "avatar"}
                className="h-7 w-7 rounded-full ring-2 ring-border"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                {(session.user.name || session.user.email || "U")[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
