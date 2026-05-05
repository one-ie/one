import type { APIRoute } from 'astro'
import { checkToken } from '../../lib/passkey'

export const prerender = false

async function getEnv() {
  const mod = (await import('cloudflare:workers' as string)) as { env?: { DB?: D1Database; SERVER_SECRET?: string } }
  return mod.env as { DB?: D1Database; SERVER_SECRET?: string }
}

export const POST: APIRoute = async ({ request, url }) => {
  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) return new Response('not configured', { status: 503 })

  const action = url.searchParams.get('action') ?? 'register'
  let body: { slug?: string; host?: string; challenge?: string; token?: string }
  try {
    body = await request.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }
  if (!body.slug || !body.challenge || !body.token) return new Response('missing fields', { status: 400 })
  if (!await checkToken(env.SERVER_SECRET, body.challenge, body.token))
    return new Response('unauthorized', { status: 401 })

  if (action === 'register') {
    if (!body.host) return new Response('host required', { status: 400 })
    const verifyToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    await env.DB.prepare('INSERT OR REPLACE INTO domains (host, slug, verify_token, verified) VALUES (?, ?, ?, 0)')
      .bind(body.host, body.slug, verifyToken).run()
    return new Response(
      JSON.stringify({ verifyToken, txtRecord: `_one-verify.${body.host}` }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  }

  if (action === 'verify') {
    if (!body.host) return new Response('host required', { status: 400 })
    const row = await env.DB
      .prepare('SELECT verify_token FROM domains WHERE slug = ? AND host = ?')
      .bind(body.slug, body.host)
      .first<{ verify_token: string }>()
    if (!row) return new Response('domain not registered', { status: 404 })

    const dnsRes = await fetch(
      `https://cloudflare-dns.com/dns-query?name=_one-verify.${body.host}&type=TXT`,
      { headers: { Accept: 'application/dns-json' } },
    )
    const dnsData = await dnsRes.json() as { Answer?: Array<{ data: string }> }
    const txtValues = (dnsData.Answer ?? []).map(a => a.data.replace(/"/g, ''))
    if (!txtValues.includes(row.verify_token)) {
      return new Response(
        JSON.stringify({ verified: false, found: txtValues }),
        { headers: { 'Content-Type': 'application/json' } },
      )
    }

    await env.DB.prepare('UPDATE domains SET verified = 1 WHERE slug = ? AND host = ?')
      .bind(body.slug, body.host).run()
    return new Response(JSON.stringify({ verified: true }), { headers: { 'Content-Type': 'application/json' } })
  }

  return new Response('unknown action', { status: 400 })
}
