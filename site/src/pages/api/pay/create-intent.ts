import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEnv } from '../../../lib/cf-env'
import { resolvePlan } from '../../../lib/plan-pricing'

export const prerender = false

// Real Stripe PaymentIntent creation — same shape the ONE shop plugin's
// checkout uses (provider: 'stripe'). Fail-closed: without STRIPE_SECRET_KEY
// this stays a 503 and the /payments page shows the preview instead.
// createFetchHttpClient makes the SDK run on Cloudflare Workers (no Node http).
export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const secretKey = env.STRIPE_SECRET_KEY as string | undefined
  if (!secretKey) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  let body: { planId?: string; amountCents?: number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  // Either a named plan or an explicit amount — never a client-supplied free-form
  // price for a plan (that would let a buyer set their own plan price).
  const plan = resolvePlan(body.planId)
  const amount = plan ? plan.cents : Number(body.amountCents)
  if (!Number.isFinite(amount) || !amount || amount < 50) {
    return Response.json({ error: 'invalid plan or amount (min 50 cents)' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  try {
    const intent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      ...(body.planId ? { metadata: { planId: body.planId } } : {}),
    })
    // Echo the resolved amount back so the client never needs its own copy
    // of PLANS — it always displays exactly what was actually charged.
    return Response.json({ clientSecret: intent.client_secret, amountCents: amount })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    return Response.json({ error: msg }, { status: 502 })
  }
}
