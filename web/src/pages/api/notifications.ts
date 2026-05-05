import type { APIRoute } from 'astro'
import { checkToken } from '../../lib/passkey'

export const prerender = false

async function getEnv() {
  const mod = (await import('cloudflare:workers' as string)) as { env?: { DB?: D1Database; SERVER_SECRET?: string } }
  return mod.env as { DB?: D1Database; SERVER_SECRET?: string }
}

export const GET: APIRoute = async ({ url }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) return new Response('not configured', { status: 503 })

  const slug = url.searchParams.get('slug')
  const challenge = url.searchParams.get('challenge')
  const token = url.searchParams.get('token')
  if (!slug || !challenge || !token) return new Response('missing params', { status: 400 })
  if (!await checkToken(env.SERVER_SECRET, challenge, token))
    return new Response('unauthorized', { status: 401 })

  const rows = await env.DB
    .prepare('SELECT id, kind, payload, ts, read FROM notifications WHERE slug = ? ORDER BY ts DESC LIMIT 50')
    .bind(slug)
    .all<{ id: string; kind: string; payload: string | null; ts: number; read: number }>()

  return new Response(JSON.stringify(rows.results), { headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) return new Response('not configured', { status: 503 })

  const action = url.searchParams.get('action')
  let body: { slug?: string; challenge?: string; token?: string; id?: string }
  try {
    body = await request.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }
  if (!body.slug || !body.challenge || !body.token) return new Response('missing fields', { status: 400 })
  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token))
    return new Response('unauthorized', { status: 401 })

  if (action === 'mark-read') {
    if (body.id) {
      await env.DB.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND slug = ?')
        .bind(body.id, body.slug).run()
    } else {
      await env.DB.prepare('UPDATE notifications SET read = 1 WHERE slug = ?')
        .bind(body.slug).run()
    }
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
}
