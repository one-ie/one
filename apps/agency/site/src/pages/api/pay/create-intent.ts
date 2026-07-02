import type { APIRoute } from 'astro'
import { getEnv } from '../../../lib/cf-env'

export const prerender = false

const PRICES: Record<string, number> = { pro: 2900, team: 9900 }

// Payment intent endpoint — configure STRIPE_SECRET_KEY in .env
// Full implementation requires: bun add stripe
export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const { planId } = await request.json() as { planId?: string }
  const amount = planId ? PRICES[planId] : undefined
  if (!amount) return Response.json({ error: 'invalid plan' }, { status: 400 })

  // Add stripe: bun add stripe, then implement payment intent creation
  return Response.json({ error: 'Stripe integration not yet configured' }, { status: 501 })
}
