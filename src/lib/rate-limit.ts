/**
 * In-memory sliding window rate limiter for API routes.
 * No external dependencies — drop-in for development and small deployments.
 * Replace with Upstash Redis (same interface) when scaling horizontally.
 *
 * Usage:
 *   const { success, remaining } = rateLimit(ip, { limit: 10, windowMs: 60_000 });
 *   if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Unix timestamp (ms) when the oldest request in the window expires */
  resetAt: number;
}

// Store: identifier → sorted list of request timestamps (ms)
const store = new Map<string, number[]>();

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, timestamps] of store.entries()) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      store.delete(key);
    } else {
      store.set(key, valid);
    }
  }
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { limit: 60, windowMs: 60_000 }
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();
  const cutoff = now - windowMs;

  cleanup(windowMs);

  const timestamps = (store.get(identifier) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= limit) {
    const resetAt = timestamps[0] + windowMs; // when the oldest entry expires
    return { success: false, remaining: 0, resetAt };
  }

  timestamps.push(now);
  store.set(identifier, timestamps);

  const resetAt = timestamps.length > 0 ? timestamps[0] + windowMs : now + windowMs;
  return { success: true, remaining: limit - timestamps.length, resetAt };
}

// Pre-configured limiters for common use cases
export const rateLimiters = {
  /** General API routes: 60 req/min */
  api: (id: string) => rateLimit(id, { limit: 60, windowMs: 60_000 }),
  /** Auth endpoints: 10 req/min (brute-force protection) */
  auth: (id: string) => rateLimit(id, { limit: 10, windowMs: 60_000 }),
  /** Expensive operations (search, payments): 20 req/min */
  expensive: (id: string) => rateLimit(id, { limit: 20, windowMs: 60_000 }),
};
