import type { APIRoute } from 'astro'
import { checkToken } from '../../../lib/passkey'
import { listConnections } from '../../../lib/db/tools'

export const prerender = false

// TODO: replace with ToolProviderAdapter.tools() once Composio SDK is installed
const AVAILABLE_PROVIDERS = ['slack', 'stripe', 'github', 'shopify'] as const

async function getEnv() {
  const mod = (await import('cloudflare:workers' as string)) as {
    env?: { DB?: D1Database; SERVER_SECRET?: string }
  }
  return mod.env as { DB?: D1Database; SERVER_SECRET?: string }
}

// GET /api/tools
// Returns connected tool connections for the authenticated owner plus the
// static list of available providers.
// Auth: SERVER_SECRET Bearer token + challenge/slug params
export const GET: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) {
    return new Response(JSON.stringify({ error: 'not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const slug = url.searchParams.get('slug')
  const challenge = url.searchParams.get('challenge')
  const token = url.searchParams.get('token')

  if (!slug || !challenge || !token) {
    return new Response(JSON.stringify({ error: 'missing params' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!(await checkToken(env.SERVER_SECRET, challenge, token))) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const connected = await listConnections(env.DB, slug)

  return new Response(
    JSON.stringify({ connected, available: AVAILABLE_PROVIDERS }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
