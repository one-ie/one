import type { APIRoute } from 'astro'

export const prerender = false

type CfEnv = { DB?: D1Database; SERVER_SECRET?: string }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return (mod.env ?? {}) as CfEnv
}

type DnsAnswer = { name: string; type: number; TTL: number; data: string }
type DnsResponse = { Status: number; Answer?: DnsAnswer[] }

/** Resolve CNAME records for `domain` via DNS-over-HTTPS (Google). */
async function resolveCname(domain: string): Promise<string | null> {
  const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=CNAME`
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
  if (!res.ok) return null
  const data = await res.json() as DnsResponse
  // RRTYPE 5 = CNAME
  const record = (data.Answer ?? []).find(a => a.type === 5)
  if (!record) return null
  // data field ends with a trailing dot per DNS convention — strip it
  return record.data.replace(/\.$/, '')
}

/** Returns true if `cname` resolves (directly or via suffix) to `one.ie`. */
function pointsToOneIe(cname: string): boolean {
  return cname === 'one.ie' || cname.endsWith('.one.ie')
}

export const GET: APIRoute = async ({ params, request }) => {
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })

  const env = await getEnv()
  if (!env.DB || !env.SERVER_SECRET) return json({ ok: false, reason: 'not configured' }, 503)

  // Auth: Bearer <SERVER_SECRET>
  const auth = request.headers.get('Authorization') ?? ''
  if (auth !== `Bearer ${env.SERVER_SECRET}`) {
    return json({ ok: false, reason: 'unauthorized' }, 401)
  }

  const domain = params.domain
  if (!domain) return json({ ok: false, reason: 'domain param missing' }, 400)

  // Confirm domain is registered
  const row = await env.DB
    .prepare('SELECT slug, verified FROM domains WHERE host = ?')
    .bind(domain)
    .first<{ slug: string; verified: number }>()
  if (!row) return json({ ok: false, reason: 'domain not registered' }, 404)

  // Already verified — return early
  if (row.verified === 1) {
    return json({ ok: true, verified: true, cname: 'one.ie' })
  }

  // DNS lookup via Google DoH
  let cname: string | null
  try {
    cname = await resolveCname(domain)
  } catch (err) {
    return json({ ok: false, reason: `dns lookup failed: ${String(err)}` }, 502)
  }

  if (!cname) {
    return json({ ok: false, reason: 'no CNAME record found' })
  }

  if (!pointsToOneIe(cname)) {
    return json({ ok: false, reason: `CNAME points to ${cname}, not one.ie` })
  }

  // Mark verified in D1
  await env.DB
    .prepare('UPDATE domains SET verified = 1 WHERE host = ?')
    .bind(domain)
    .run()

  return json({ ok: true, verified: true, cname })
}
