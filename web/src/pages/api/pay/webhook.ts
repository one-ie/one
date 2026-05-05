import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

interface PayContent {
  rail: string; from: string; to: string; ref: string
  status: 'captured' | 'refunded' | 'failed' | 'disputed'
  provider: 'stripe'; planId?: string
}

async function emitPaySignal(opts: { amount: number } & PayContent, base: string): Promise<void> {
  await fetch(`${base}/api/signal`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      receiver: 'substrate:pay',
      data: {
        weight: opts.amount,
        tags: ['pay', opts.rail, opts.status === 'refunded' ? 'refund' : opts.status === 'failed' ? 'fail' : 'accept'],
        content: { rail: opts.rail, from: opts.from, to: opts.to, ref: opts.ref, status: opts.status, provider: opts.provider, planId: opts.planId },
      },
    }),
  }).catch(() => {})
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'webhook not configured' }, { status: 503 })
  }
  const sig = request.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'missing stripe-signature' }, { status: 400 })

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
    httpClient: Stripe.createFetchHttpClient(),
  })
  const body = await request.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return Response.json({ error: 'invalid signature' }, { status: 400 })
  }

  const base = url.origin

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const planId = pi.metadata?.planId
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: pi.id, status: 'captured', provider: 'stripe', planId, amount: pi.amount / 100 }, base)
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: pi.id, status: 'failed', provider: 'stripe', planId: pi.metadata?.planId, amount: pi.amount / 100 }, base)
      break
    }
    case 'charge.refunded': {
      const ch = event.data.object as Stripe.Charge
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: ch.id, status: 'refunded', provider: 'stripe', amount: (ch.amount_refunded || ch.amount || 0) / 100 }, base)
      break
    }
    case 'charge.dispute.created': {
      const d = event.data.object as Stripe.Dispute
      await emitPaySignal({ rail: 'card', from: 'anon', to: 'one', ref: d.id, status: 'disputed', provider: 'stripe', amount: (d.amount || 0) / 100 }, base)
      break
    }
    default:
      break
  }

  return Response.json({ received: true })
}
