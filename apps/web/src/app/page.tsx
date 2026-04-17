import Link from "next/link";

const PORTFOLIO_SLICES = [
  { label: "US Equities", pct: 38, color: "#2563EB" },
  { label: "Intl Stocks", pct: 22, color: "#10b981" },
  { label: "Bonds", pct: 18, color: "#f59e0b" },
  { label: "Real Estate", pct: 12, color: "#8b5cf6" },
  { label: "Crypto", pct: 6, color: "#ec4899" },
  { label: "Cash", pct: 4, color: "#64748b" },
];

function buildDonutPath(
  slices: typeof PORTFOLIO_SLICES,
  cx: number,
  cy: number,
  r: number,
  ir: number
) {
  let cumAngle = -90;
  return slices.map((s) => {
    const sweep = (s.pct / 100) * 360;
    const start = cumAngle;
    cumAngle += sweep;
    const end = cumAngle;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const ix1 = cx + ir * Math.cos(toRad(end));
    const iy1 = cy + ir * Math.sin(toRad(end));
    const ix2 = cx + ir * Math.cos(toRad(start));
    const iy2 = cy + ir * Math.sin(toRad(start));
    const large = sweep > 180 ? 1 : 0;

    return {
      ...s,
      d: `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${ix1},${iy1} A${ir},${ir} 0 ${large},0 ${ix2},${iy2} Z`,
    };
  });
}

const slices = buildDonutPath(PORTFOLIO_SLICES, 160, 160, 130, 72);

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
      </svg>
    ),
    title: "Allocation Visualizer",
    desc: "Interactive donut charts break down your portfolio by asset class, region, and currency at a glance.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    title: "Multi-Currency Tracking",
    desc: "Hold assets in USD, EUR, HKD, JPY and more. Auto-converted to your base currency with live rates.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605" />
      </svg>
    ),
    title: "Performance History",
    desc: "Net worth snapshots over 1W, 1M, 1Y and custom ranges with gain/loss breakdown.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
      </svg>
    ),
    title: "CSV Import",
    desc: "Import transactions from any broker in seconds. Smart parser handles date formats and currencies.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: "Privacy First",
    desc: "Your data stays yours. No selling, no ads. OAuth sign-in, encrypted at rest.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253M3.157 7.582A8.959 8.959 0 0 0 3 12c0 .778.099 1.533.284 2.253" />
      </svg>
    ),
    title: "Global Coverage",
    desc: "Stocks, ETFs, crypto, real estate, bonds — tracked across all major global exchanges.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white font-sans antialiased overflow-x-hidden">
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight">GlobalFolio</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors cursor-pointer">Features</a>
          <a href="#how" className="hover:text-white transition-colors cursor-pointer">How it works</a>
        </div>
        <Link
          href="/login"
          className="cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
        >
          Get started free
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center">
        {/* Glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="pointer-events-none absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />

        <div className="relative mx-auto w-full max-w-7xl px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Free to use · No credit card required
            </div>
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl">
              Your wealth,<br />
              <span className="text-blue-400">fully visible</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-white/60">
              Track every stock, ETF, crypto, and bond across all your global accounts — in one clean dashboard with multi-currency support.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
              >
                Start tracking free
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/login"
                className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium text-white/80 hover:bg-white/[0.08] transition-colors"
              >
                View demo
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-2 text-sm text-white/40">
              <span>✓ No ads</span>
              <span>✓ Open source</span>
              <span>✓ Privacy first</span>
            </div>
          </div>

          {/* Right — Donut Chart Hero */}
          <div className="relative flex items-center justify-center">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-blue-600/5 blur-3xl" />
            <div className="relative w-[320px] h-[320px]">
              {/* SVG Donut */}
              <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-2xl">
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {slices.map((s, i) => (
                  <path
                    key={s.label}
                    d={s.d}
                    fill={s.color}
                    opacity={0.9}
                    filter="url(#glow)"
                    style={{
                      transformOrigin: "160px 160px",
                      animation: `donut-slice 0.8s ease-out ${i * 0.08}s both`,
                    }}
                  />
                ))}
                {/* Center */}
                <circle cx="160" cy="160" r="60" fill="#0B0F1A" />
                <text x="160" y="152" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="600" opacity="0.5">TOTAL</text>
                <text x="160" y="175" textAnchor="middle" fill="#ffffff" fontSize="22" fontFamily="IBM Plex Mono" fontWeight="700">$248K</text>
              </svg>

              {/* Floating labels */}
              {PORTFOLIO_SLICES.slice(0, 4).map((s, i) => {
                const positions = [
                  { top: "-10px", right: "-60px" },
                  { top: "30%", right: "-90px" },
                  { bottom: "10%", right: "-70px" },
                  { top: "10%", left: "-90px" },
                ];
                const pos = positions[i];
                return (
                  <div
                    key={s.label}
                    className="absolute flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-sm text-xs whitespace-nowrap"
                    style={pos}
                  >
                    <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="text-white/80">{s.label}</span>
                    <span className="font-mono font-semibold text-white">{s.pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.06] bg-white/[0.02] py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            {[
              { value: "50+", label: "Currencies supported" },
              { value: "10K+", label: "Portfolios tracked" },
              { value: "∞", label: "Accounts per user" },
              { value: "Free", label: "Always" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-white font-mono">{s.value}</p>
                <p className="mt-1 text-sm text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">Features</p>
            <h2 className="text-4xl font-bold tracking-tight">Everything you need to stay on top</h2>
            <p className="mt-4 max-w-xl mx-auto text-white/50">
              Built for serious investors who manage assets across multiple brokers, countries and currencies.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6 transition-all duration-200 hover:border-blue-500/30 hover:bg-white/[0.06] cursor-default"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">How it works</p>
            <h2 className="text-4xl font-bold tracking-tight">Up and running in minutes</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "01", title: "Sign in", desc: "One-click OAuth via GitHub or Google. No forms, no friction." },
              { step: "02", title: "Add accounts & import", desc: "Connect brokers or paste CSV exports. We parse any format." },
              { step: "03", title: "Watch your portfolio", desc: "Live allocation donut, performance curves, and gain/loss in your base currency." },
            ].map((s) => (
              <div key={s.step} className="relative">
                <p className="font-mono text-5xl font-bold text-white/5 absolute -top-4 left-0">{s.step}</p>
                <div className="pt-8">
                  <h3 className="mb-2 text-lg font-semibold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold tracking-tight mb-4">
            Ready to see the full picture?
          </h2>
          <p className="mb-8 text-lg text-white/50">
            Join investors who already track their global portfolio with GlobalFolio.
          </p>
          <Link
            href="/login"
            className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Get started — it&apos;s free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </span>
            <span className="font-semibold text-white/50">GlobalFolio</span>
          </div>
          <p>© 2026 GlobalFolio. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes donut-slice {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
