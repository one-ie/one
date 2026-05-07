import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

type CfEnv = {
  SERVER_SECRET?: string
  CONTENT?: R2Bucket
  DB?: D1Database
}

function checkAuth(request: Request, secret: string): string | null {
  const auth = request.headers.get('Authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  if (!match) return null
  if (match[1] === secret) return 'server'
  const sep = match[1].indexOf(':')
  if (sep > 0) {
    const maybeId = match[1].slice(0, sep)
    const maybeToken = match[1].slice(sep + 1)
    if (maybeToken === secret) return maybeId
  }
  return null
}

/** GET /api/skills?agent=<id>
 *
 * - ?agent=<id>  → list skills for that agent (no auth required, public names)
 * - no agent     → list all skills for the session owner (cookie → ctx.locals.slug)
 *                  or Authorization: Bearer <slug>:<SERVER_SECRET> for server/SDK callers
 */
export const GET: APIRoute = async ({ request, url, locals }) => {
  const env = await getEnv() as unknown as CfEnv

  const agentId = url.searchParams.get('agent')

  if (agentId) {
    // Public: list enabled skills for a given agent
    if (!env.DB) return Response.json({ error: 'DB not configured' }, { status: 503 })
    const rows = await env.DB
      .prepare('SELECT skill_name FROM agent_skills WHERE agent_id = ?')
      .bind(agentId)
      .all<{ skill_name: string }>()
    const skills = (rows.results ?? []).map(r => ({ name: r.skill_name, enabled: true }))
    return Response.json({ skills })
  }

  if (!env.CONTENT || !env.DB) return Response.json({ error: 'not configured' }, { status: 503 })

  // Resolve owner: session cookie (via middleware) takes priority, then Bearer token
  let ownerSlug: string | null = (locals as { slug?: string }).slug ?? null

  if (!ownerSlug) {
    // Server/SDK path: Authorization: Bearer <slug>:<SERVER_SECRET>
    if (!env.SERVER_SECRET) return Response.json({ error: 'unauthorized' }, { status: 401 })
    const ownerId = checkAuth(request, env.SERVER_SECRET)
    if (!ownerId || ownerId === 'server') return Response.json({ error: 'unauthorized' }, { status: 401 })
    ownerSlug = ownerId
  }

  const prefix = `${ownerSlug}/skills/`
  const listed = await env.CONTENT.list({ prefix })
  const nameSet = new Set<string>()
  for (const obj of listed.objects) {
    // Key shape: <slug>/skills/<name>/SKILL.md
    const rest = obj.key.slice(prefix.length)
    const slash = rest.indexOf('/')
    if (slash > 0) nameSet.add(rest.slice(0, slash))
  }

  const skills = Array.from(nameSet).map(name => ({ name, enabled: true }))
  return Response.json({ skills })
}
