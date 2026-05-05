import type { APIRoute } from 'astro'

export const prerender = false

type KVLike = {
  get(k: string): Promise<string | null>
  put(k: string, v: string, opts?: { expirationTtl?: number }): Promise<void>
}

export const POST: APIRoute = async ({ request }) => {
  const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database; CHAT_CACHE?: KVLike }
  if (!env.DB) return new Response('not configured', { status: 503 })

  const ip =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Forwarded-For') ??
    'unknown'
  const hour = Math.floor(Date.now() / 3600000)

  if (env.CHAT_CACHE) {
    const key = `ratelimit:report:${ip}:${hour}`
    const count = parseInt((await env.CHAT_CACHE.get(key)) ?? '0', 10)
    if (count >= 5) return new Response('rate limited', { status: 429 })
    await env.CHAT_CACHE.put(key, String(count + 1), { expirationTtl: 3600 })
  }

  let body: { host?: string; path?: string; kind?: string; body?: string }
  try {
    body = await request.json()
  } catch {
    return new Response('invalid json', { status: 400 })
  }

  await env.DB.prepare('INSERT INTO reports (host, path, kind, body) VALUES (?, ?, ?, ?)')
    .bind(body.host ?? null, body.path ?? null, body.kind ?? null, body.body ?? null)
    .run()

  return new Response(null, { status: 201 })
}
