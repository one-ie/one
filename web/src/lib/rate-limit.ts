// Per-isolate sliding-window limiter. Module-scope Map persists across
// requests within the same CF Workers isolate but not across isolates —
// the limit is approximate, not strict. For strict limits, bind
// Cloudflare's RateLimiting API in wrangler.toml.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface LimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSec: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): LimitResult {
  const b = buckets.get(key)
  if (!b || b.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: now + windowMs }
    buckets.set(key, fresh)
    if (buckets.size > 10_000) sweep(now)
    return { allowed: true, remaining: limit - 1, resetAt: fresh.resetAt, retryAfterSec: 0 }
  }
  if (b.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: b.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    }
  }
  b.count++
  return { allowed: true, remaining: limit - b.count, resetAt: b.resetAt, retryAfterSec: 0 }
}

function sweep(now: number) {
  for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
}

export function clientKey(req: Request): string {
  const cf = (req as Request & { headers: Headers }).headers
  return (
    cf.get('cf-connecting-ip') ??
    cf.get('x-real-ip') ??
    cf.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'anon'
  )
}
