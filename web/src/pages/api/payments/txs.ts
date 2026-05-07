import type { APIRoute } from 'astro'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

type CfEnv = { SERVER_SECRET?: string }
type TxType = 'x402' | 'stripe'

export const GET: APIRoute = async ({ request, locals }) => {
  const env = (await getEnv()) as CfEnv

  const sessionSlug = (locals as { slug?: string }).slug
  if (!sessionSlug) {
    if (!env.SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
    const auth = request.headers.get('Authorization') ?? ''
    if (auth !== `Bearer ${env.SERVER_SECRET}`) {
      return Response.json({ error: 'unauthorized' }, { status: 401 })
    }
  }

  const url = new URL(request.url)
  const typeParam = url.searchParams.get('type') ?? 'x402'
  const limitParam = parseInt(url.searchParams.get('limit') ?? '20', 10)
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20

  const type: TxType = typeParam === 'stripe' ? 'stripe' : 'x402'

  // TODO: schema gap — no payments history table exists yet.
  //   x402: KV stores receipts as `x402:${slug}:${receipt}` (idempotency keys
  //   only, no amounts or timestamps) — not listable as a history feed.
  //   stripe: Stripe events would need to be recorded via webhook → D1 insert.
  //   Resolution: add a `payments` D1 table with columns:
  //     id, owner_slug, type (x402|stripe), amount, currency, slug,
  //     receipt, created_at — populated by x402 middleware + Stripe webhook.

  return Response.json({
    type,
    limit,
    txs: [] as unknown[],
    total: 0,
  })
}
