import type { APIRoute } from 'astro'
import { importSkill } from '../../../lib/skill/import'

export const prerender = false

type CfEnv = { SERVER_SECRET?: string; CONTENT?: R2Bucket }

async function getEnv(): Promise<CfEnv> {
  const mod = (await import('cloudflare:workers' as string)) as { env?: CfEnv }
  return (mod.env ?? {}) as CfEnv
}

export const POST: APIRoute = async ({ request }) => {
  const env = await getEnv()
  if (!env.CONTENT || !env.SERVER_SECRET) {
    return new Response(JSON.stringify({ error: 'not configured' }), { status: 503 })
  }
  const body = (await request.json()) as { slug?: string; refs?: string[] }
  if (!body.slug || !Array.isArray(body.refs) || body.refs.length === 0) {
    return new Response(JSON.stringify({ error: 'slug and refs required' }), { status: 400 })
  }
  const results = await Promise.allSettled(
    body.refs.map(ref => importSkill(ref, body.slug!, env.CONTENT!))
  )
  const refreshed = results.filter(r => r.status === 'fulfilled' && r.value !== null).length
  const failed = results.length - refreshed
  return new Response(
    JSON.stringify({ refreshed, failed, total: body.refs.length }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
