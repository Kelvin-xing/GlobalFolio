"use client";

import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0B0F1A] overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[100px]" />
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">GlobalFolio</h1>
            <p className="mt-1 text-sm text-white/50">
              Your global investment portfolio, simplified
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-white/30">
            Sign in to continue
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/80 transition-all duration-150 hover:bg-white/[0.10] hover:text-white hover:border-white/20"
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </button>

            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/80 transition-all duration-150 hover:bg-white/[0.10] hover:text-white hover:border-white/20"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] text-white/25 leading-relaxed">
            By continuing, you agree to our Terms of Service.<br />
            No credit card required. Free forever.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-white/25">
          <span>Privacy first</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>No ads</span>
          <span className="h-1 w-1 rounded-full bg-white/20" />
          <span>Open source</span>
        </div>
      </div>
    </div>
  );
}

