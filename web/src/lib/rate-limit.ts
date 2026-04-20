// Strict: Cloudflare RateLimiting binding (cross-isolate, see wrangler.toml).
// Fallback: per-isolate sliding-window Map — approximate but zero config.

interface Bucket {
  count: number
  resetAt: number
}

interface CfRateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>
}

const buckets = new Map<string, Bucket>()

export interface LimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSec: number
}

export async function rateLimit(
  env: { RATE_LIMITER?: CfRateLimiter },
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): Promise<LimitResult> {
  if (env.RATE_LIMITER) {
    const { success } = await env.RATE_LIMITER.limit({ key })
    const retry = Math.ceil(windowMs / 1000)
    return {
      allowed: success,
      remaining: success ? limit - 1 : 0,
      resetAt: now + windowMs,
      retryAfterSec: success ? 0 : retry,
    }
  }
  return memoryLimit(key, limit, windowMs, now)
}

function memoryLimit(key: string, limit: number, windowMs: number, now: number): LimitResult {
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
  const h = req.headers
  return (
    h.get('cf-connecting-ip') ??
    h.get('x-real-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'anon'
  )
}
