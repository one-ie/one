import type { APIRoute } from 'astro'
import { subscribeToAudience } from '@oneie/plugin-newsletter'
import { getEnv } from '../../../lib/cf-env'
import { one } from '../../../lib/one'

export const prerender = false

// Wires the footer newsletter form to the ONE backend's audience/CRM —
// subscribeToAudience() calls audience:subscribe, which writes a
// consent:email:pending tag and starts double opt-in, so a subscriber
// becomes a real CRM contact, not just a form log. Standalone mode (no
// ONE_API_KEY) has no CRM to write to, so 503 there, matching
// create-intent.ts's pattern for backend-less degradation.
export const POST: APIRoute = async ({ request }) => {
  let body: { email?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 })
  }

  const address = body.email?.trim()
  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    return Response.json({ error: 'invalid_email' }, { status: 400 })
  }

  const client = await one()
  if (!client) return Response.json({ error: 'backend_not_connected' }, { status: 503 })

  const env = await getEnv()
  const workspace = env.AGENCY_SLUG || 'template'

  try {
    await subscribeToAudience(client, { workspace, address, list: 'newsletter', ref: 'footer' })
    return Response.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'subscribe failed'
    return Response.json({ error: msg }, { status: 502 })
  }
}
