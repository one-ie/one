import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

const PRICES: Record<string, number> = { pro: 2900, team: 9900 }

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const { planId, sessionId } = await request.json() as { planId?: string; sessionId?: string }
  const amount = planId ? PRICES[planId] : undefined
  if (!amount) return Response.json({ error: 'invalid plan' }, { status: 400 })

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
  })

  const idempotencyKey = await sha256Hex(`${planId}:${sessionId ?? request.headers.get('cf-ray') ?? crypto.randomUUID()}`)

  const pi = await stripe.paymentIntents.create(
    {
      amount, currency: 'usd',
      payment_method_types: ['card'],
      metadata: { planId: planId ?? '' },
    },
    { idempotencyKey },
  )
  return Response.json({ clientSecret: pi.client_secret, amount })
}
