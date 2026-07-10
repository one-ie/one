import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEnv, getCfCtx } from '../../../lib/cf-env'
import { one, unwrap } from '../../../lib/one'

export const prerender = false

const ws = 'template' // workspace slug — same value one.config.ts wires into chat()/track()

/**
 * Land a verified payment on the workspace timeline (/u/<slug>/in) via
 * thread:append — the same surface the track plugin feeds, so card payments
 * and visitor events share one timeline. thread:append is workspace-scoped
 * by construction; world:in was rejected for this because without a tag
 * subscription (world:subscribe needs a human session, not this agent key)
 * it routes payment details to the PUBLIC world feed.
 *
 * Failures only log: a missed timeline entry must never turn into a non-200
 * that Stripe would retry forever.
 */
async function recordPayment(intent: Stripe.PaymentIntent, status: 'succeeded' | 'failed'): Promise<void> {
  try {
    const client = await one()
    if (!client) return
    const amount = `${(intent.amount / 100).toFixed(2)} ${intent.currency.toUpperCase()}`
    const res = unwrap<{ ok: boolean; threadId?: string; error?: string }>(
      await client.ask('thread:append', {
        slug: ws,
        group: 'payments',
        sender: 'stripe-webhook',
        chatName: 'Stripe',
        content: `Payment ${status}: ${amount} (${intent.id})`,
        tags: ['stripe', 'payment', `payment-${status}`],
      }),
      'thread:append',
    )
    if (!res.ok) throw new Error(res.error ?? 'thread:append returned ok: false')
    console.log(`[one] payment ${status} recorded → thread ${res.threadId}`)
  } catch (e) {
    console.warn(`[one] payment ${status} not recorded: ${e instanceof Error ? e.message : e}`)
  }
}

// Stripe webhook — signature-verified before any event is trusted.
// constructEventAsync (not constructEvent) because Workers only has
// SubtleCrypto, which is async. An unverifiable payload gets a 400 so
// Stripe retries; a verified event gets a 200 even if we don't act on
// its type (returning non-200 would make Stripe retry forever).
export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  const secretKey = env.STRIPE_SECRET_KEY as string | undefined
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET as string | undefined
  if (!secretKey || !webhookSecret) {
    return Response.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const sig = request.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  const stripe = new Stripe(secretKey, {
    httpClient: Stripe.createFetchHttpClient(),
  })

  let event: Stripe.Event
  try {
    const payload = await request.text()
    event = await stripe.webhooks.constructEventAsync(
      payload,
      sig,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'verification failed'
    return Response.json({ error: `Webhook verification failed: ${msg}` }, { status: 400 })
  }

  let timeline: Promise<void> | null = null
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.log(`[stripe] payment succeeded: ${intent.id} ${intent.amount} ${intent.currency}`)
      // Fulfil here: grant access, send a receipt, write your DB.
      timeline = recordPayment(intent, 'succeeded')
      break
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.warn(`[stripe] payment failed: ${intent.id}`)
      timeline = recordPayment(intent, 'failed')
      break
    }
    default:
      break
  }

  // waitUntil so the 200 to Stripe never waits on the timeline write; if the
  // Workers ctx is unavailable (Node dev) awaiting inline is fine.
  if (timeline) {
    const ctx = await getCfCtx()
    if (ctx) ctx.waitUntil(timeline)
    else await timeline
  }

  return Response.json({ received: true })
}
