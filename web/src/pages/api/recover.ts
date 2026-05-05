import type { APIRoute } from 'astro'

export const prerender = false

// POST /api/recover — initiate magic-link device enrolment
// Body: { slug, email }
// Returns: { ok: true, token } — caller emails the link; token is HMAC-signed, 15min TTL
export const POST: APIRoute = async ({ request }) => {
  const env = (await import('cloudflare:workers' as string)).env as {
    DB?: D1Database
    SESSION?: KVNamespace
    SERVER_SECRET?: string
  }
  if (!env.DB || !env.SESSION || !env.SERVER_SECRET) {
    return new Response('not configured', { status: 503 })
  }

  const { slug, email } = await request.json() as { slug?: string; email?: string }
  if (!slug || !email) return new Response('missing slug or email', { status: 400 })

  const row = await env.DB.prepare('SELECT slug FROM owners WHERE slug = ?').bind(slug).first<{ slug: string }>()
  if (!row) return new Response('slug not found', { status: 404 })

  const ts = Date.now()
  const payload = `${slug}:${email}:${ts}`
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.SERVER_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))))
    .map(b => b.toString(16).padStart(2, '0')).join('')

  const token = `${btoa(payload)}.${sig}`
  await env.SESSION.put(`recover:${token}`, JSON.stringify({ slug, email, ts }), { expirationTtl: 900 })

  return new Response(JSON.stringify({ ok: true, token, link: `/api/recover?token=${encodeURIComponent(token)}` }), {
    headers: { 'content-type': 'application/json' },
  })
}

// GET /api/recover?token=... — verify token, return slug for passkey registration
export const GET: APIRoute = async ({ url }) => {
  const env = (await import('cloudflare:workers' as string)).env as { SESSION?: KVNamespace }
  if (!env.SESSION) return new Response('not configured', { status: 503 })

  const token = url.searchParams.get('token')
  if (!token) return new Response('missing token', { status: 400 })

  const stored = await env.SESSION.get(`recover:${token}`)
  if (!stored) return new Response('token expired or invalid', { status: 410 })

  const { slug } = JSON.parse(stored) as { slug: string }
  await env.SESSION.delete(`recover:${token}`)

  return new Response(JSON.stringify({ ok: true, slug, action: 'begin-passkey-registration' }), {
    headers: { 'content-type': 'application/json' },
  })
}
