import type { APIRoute } from 'astro'
import { z } from 'zod'
import { checkToken } from '../../../../lib/passkey'
import { createConnection } from '../../../../lib/db/tools'

export const prerender = false

async function getEnv() {
  const mod = (await import('cloudflare:workers' as string)) as {
    env?: { DB?: D1Database; SERVER_SECRET?: string }
  }
  return mod.env as { DB?: D1Database; SERVER_SECRET?: string }
}

// POST /api/tools/:provider/connect
// Initiates a tool connection for the given provider.
// Body: { slug: string; challenge: string; token: string; scopes?: string[] }
// Returns: { ok: true; redirectUrl: string; connectionId: string }
//
// TODO: once Composio SDK is installed, replace the stub block below with:
//   const adapter = new ComposioAdapter(env.COMPOSIO_API_KEY)
//   const { redirectUrl, state } = await adapter.connect({
//     ownerId: slug,
//     provider,
//     callbackUrl: `${origin}/api/tools/${provider}/callback`,
//     scopes: body.scopes,
//   })
//   return { ok: true, redirectUrl, connectionId: state }
export const POST: APIRoute = async ({ request, params }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) {
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const provider = params.provider
  if (!provider) {
    return new Response(JSON.stringify({ error: 'provider required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const bodySchema = z.object({
    slug: z.string(),
    challenge: z.string(),
    token: z.string(),
    scopes: z.array(z.string()).optional(),
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

  // Stub: record a pending connection. Real OAuth redirect wired here once
  // Composio adapter is available (see TODO above).
  const connection = await createConnection(env.DB, {
    owner_id: body.slug,
    provider,
    account: 'pending',
    scopes: JSON.stringify(body.scopes ?? []),
    refresh_at: null,
  })

  return new Response(
    JSON.stringify({ ok: true, redirectUrl: '#stub', connectionId: connection.id }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
