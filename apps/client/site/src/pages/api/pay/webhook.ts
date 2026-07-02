import type { APIRoute } from 'astro'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

// Stripe webhook handler — configure STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET in .env
// Full implementation: docs.stripe.com/webhooks
export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.STRIPE_WEBHOOK_SECRET) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const sig = request.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'No signature' }, { status: 400 })

  // Signature verification MUST run before any event is trusted. Until it is
  // implemented, do not return 200 { received: true } — a 200 tells Stripe the
  // event was processed and stops retries, so an unverified/forged payload would
  // be silently accepted. Implement with the Stripe SDK, then handle events:
  //   const stripe = new Stripe(env.STRIPE_SECRET_KEY)
  //   const body = await request.text()
  //   const event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET)
  //   switch (event.type) { case 'payment_intent.succeeded': ... }
  return Response.json({ error: 'Webhook verification not yet configured' }, { status: 501 })
}
