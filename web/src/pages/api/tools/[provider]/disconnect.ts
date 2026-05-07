import type { APIRoute } from 'astro'
import { z } from 'zod'
import { checkToken } from '../../../../lib/passkey'
import { deleteConnection } from '../../../../lib/db/tools'

export const prerender = false

async function getEnv() {
  const mod = (await import('cloudflare:workers' as string)) as {
    env?: { DB?: D1Database; SERVER_SECRET?: string }
  }
  return mod.env as { DB?: D1Database; SERVER_SECRET?: string }
}

// POST /api/tools/:provider/disconnect
// Removes a tool connection by ID.
// Body: { slug: string; challenge: string; token: string; connectionId: string }
// Returns: { ok: true }
//
// TODO: once Composio SDK is installed, also call:
//   const adapter = new ComposioAdapter(env.COMPOSIO_API_KEY)
//   await adapter.disconnect({ ownerId: slug, connectionId: body.connectionId })
// before deleting from D1, so the external connection is revoked.
export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) {
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const bodySchema = z.object({
    slug: z.string(),
    challenge: z.string(),
    token: z.string(),
    connectionId: z.string(),
  })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'invalid body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const body = parsed.data

  if (!(await checkToken(env.SERVER_SECRET, body.challenge, body.token))) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  await deleteConnection(env.DB, body.connectionId)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
