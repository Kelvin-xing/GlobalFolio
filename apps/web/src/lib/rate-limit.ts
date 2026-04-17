import { NextRequest, NextResponse } from "next/server";

/**
 * Simple in-process rate limiter using a sliding window counter.
 *
 * ⚠️  On serverless (Vercel) this state is per-instance only.
 *     For multi-instance production deployments, swap this out for
 *     Upstash Redis (@upstash/ratelimit). This implementation is
 *     sufficient as a first-line defence and works perfectly in
 *     single-instance environments.
 */

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

// Prune stale entries every 5 minutes to avoid memory leaks
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;
let lastPrune = Date.now();

function pruneStaleEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  for (const [key, entry] of store) {
    if (now - entry.windowStart > windowMs) {
      store.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Requests allowed per window */
  limit: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

/**
 * Returns true if the request is within the rate limit, false if exceeded.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const { limit, windowMs } = config;
  pruneStaleEntries(windowMs);

  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

/**
 * Get the client IP from a Next.js request.
 * Respects X-Forwarded-For set by Vercel's reverse proxy.
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Default configs for common route types.
 */
export const RATE_LIMITS = {
  /** General API routes: 60 req/min per IP */
  api: { limit: 60, windowMs: 60_000 },
  /** Auth routes: 10 req/min per IP (brute-force protection) */
  auth: { limit: 10, windowMs: 60_000 },
  /** Mutation routes (POST/PUT/DELETE): 30 req/min per IP */
  mutation: { limit: 30, windowMs: 60_000 },
} satisfies Record<string, RateLimitConfig>;

/**
 * Helper to return a 429 Too Many Requests response.
 */
export function rateLimitedResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: { "Retry-After": "60" },
    }
  );
}

/**
 * Convenience wrapper: check rate limit and return a 429 if exceeded.
 * Returns null if within limit, or a NextResponse to return immediately.
 *
 * Usage:
 *   const limited = applyRateLimit(req, RATE_LIMITS.mutation);
 *   if (limited) return limited;
 */
export function applyRateLimit(
  req: NextRequest,
  config: RateLimitConfig = RATE_LIMITS.api
): NextResponse | null {
  const ip = getClientIP(req);
  const allowed = checkRateLimit(ip, config);
  return allowed ? null : rateLimitedResponse();
}
