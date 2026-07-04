import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

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

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.log(`[stripe] payment succeeded: ${intent.id} ${intent.amount} ${intent.currency}`)
      // Fulfil here: grant access, send a receipt, write your DB.
      break
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      console.warn(`[stripe] payment failed: ${intent.id}`)
      break
    }
    default:
      break
  }

  return Response.json({ received: true })
}
