import type { APIRoute } from 'astro'
import { buildAgentCard } from '../../../../lib/artifacts/a2a'

export const prerender = false

function parseMeta(md: string): Record<string, unknown> {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!m) return {}
  const meta: Record<string, unknown> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i < 0) continue
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    meta[k] = v
  }
  return meta
}

export const GET: APIRoute = async ({ params, request }) => {
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket }
  const { slug } = params
  if (!slug || !env.CONTENT) return new Response('not found', { status: 404 })
  const obj = await env.CONTENT.get(`${slug}/agent.md`)
  if (!obj) return new Response('not found', { status: 404 })
  const meta = parseMeta(await obj.text())
  const host = new URL(request.url).host
  const card = buildAgentCard({
    name: (meta.name as string | undefined) ?? slug,
    summary: meta.summary as string | undefined,
    description: meta.description as string | undefined,
    skills: Array.isArray(meta.skills) ? (meta.skills as string[]) : undefined,
    host,
    slug,
  })
  return new Response(JSON.stringify(card, null, 2), { headers: { 'content-type': 'application/json' } })
}
