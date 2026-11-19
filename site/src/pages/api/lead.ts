import type { APIRoute } from 'astro'
import { chatConfig } from '../../lib/chat-config'
import { allowLead, captureLead, type CounterStore } from '../../lib/front-desk'
import { getEnv } from '../../lib/cf-env'
import { one } from '../../lib/one'

export const prerender = false

// The lead form's door. It files the lead with lead:capture into THIS site's
// workspace (chatConfig.ws) under its page (chatConfig.page), server-side with
// the site's key — never a workspace the form body names, and never a browser
// POST to one.ie (cross-origin). The answer is lead:capture's own: 200 only when
// the lead was filed, a named refusal otherwise, so nobody is thanked for a lead
// that went nowhere. Junk (a bad email or phone, the honeypot) is refused in
// leadCaptureRequest before any call; a flood is held by the per-IP limit below.

// No KV binding (local dev, a site not yet configured): an in-isolate count, so
// the limit still holds per isolate rather than not at all.
const local = new Map<string, string>()
const memory: CounterStore = {
  get: async (k) => local.get(k) ?? null,
  put: async (k, v) => { if (local.size > 5000) local.clear(); local.set(k, v) },
}

export const POST: APIRoute = async ({ request }) => {
  const env = (await getEnv()) as unknown as { KV?: CounterStore }
  const ip = request.headers.get('cf-connecting-ip') ?? ''
  const gate = await allowLead(env.KV ?? memory, ip).catch(() => allowLead(memory, ip))
  if (!gate.ok) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(gate.retryAfter) } })
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }
  const client = await one()
  const ask = client ? (receiver: string, data: Record<string, unknown>) => client.ask(receiver, data) as Promise<{ kind: string; result?: unknown }> : null
  const out = await captureLead(ask, body, chatConfig)
  return Response.json(out.json, { status: out.status })
}
