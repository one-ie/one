import type { APIRoute } from 'astro'
import { z } from 'zod'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

type CfEnv = {
  SERVER_SECRET?: string
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

/** POST /api/skills/:name/enable
 *
 * Body: { agent_id: string, enabled: boolean }
 *
 * enabled=true  → INSERT OR IGNORE INTO agent_skills
 * enabled=false → DELETE FROM agent_skills
 */
export const POST: APIRoute = async ({ params, request }) => {
  const { name } = params
  if (!name) return Response.json({ error: 'name required' }, { status: 400 })

  const env = await getEnv() as unknown as CfEnv

  if (!env.SERVER_SECRET || !env.DB) {
    return Response.json({ error: 'not configured' }, { status: 503 })
  }

  const ownerId = checkAuth(request, env.SERVER_SECRET)
  if (!ownerId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const bodySchema = z.object({ agent_id: z.string(), enabled: z.boolean() })
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: 'invalid body' }, { status: 400 })
  const { agent_id, enabled } = parsed.data

  if (enabled) {
    await env.DB
      .prepare('INSERT OR IGNORE INTO agent_skills (agent_id, skill_name) VALUES (?, ?)')
      .bind(agent_id, name)
      .run()
  } else {
    await env.DB
      .prepare('DELETE FROM agent_skills WHERE agent_id = ? AND skill_name = ?')
      .bind(agent_id, name)
      .run()
  }

  return Response.json({ ok: true, enabled })
}
