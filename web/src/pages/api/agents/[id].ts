import type { APIRoute } from 'astro'
import { z } from 'zod'
import { getAgent, patchAgentFrontmatter } from '@/lib/db/agents'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

function checkAuth(request: Request, secret: string): boolean {
  const auth = request.headers.get('Authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  if (!match) return false
  if (match[1] === secret) return true
  const sep = match[1].indexOf(':')
  if (sep > 0) return match[1].slice(sep + 1) === secret
  return false
}

export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB } = rawEnv
  if (!DB) return Response.json({ error: 'not configured' }, { status: 503 })

  const agent = await getAgent(DB, id)
  if (!agent) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(agent)
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
  if (!checkAuth(request, SERVER_SECRET)) return unauthorized()

  const agent = await getAgent(DB, id)
  if (!agent) return Response.json({ error: 'not found' }, { status: 404 })

  const bodySchema = z.object({
    frontmatter: z.string().optional(),
    name: z.string().optional(),
    state: z.enum(['draft', 'live', 'paused', 'evolving']).optional(),
  })
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: 'invalid body' }, { status: 400 })
  const { frontmatter } = parsed.data
  if (typeof frontmatter !== 'string') {
    return Response.json({ error: 'frontmatter string required' }, { status: 400 })
  }

  await patchAgentFrontmatter(DB, id, frontmatter)
  return Response.json({ ok: true })
}

export const DELETE: APIRoute = async ({ params, request }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
  if (!checkAuth(request, SERVER_SECRET)) return unauthorized()

  const agent = await getAgent(DB, id)
  if (!agent) return Response.json({ error: 'not found' }, { status: 404 })

  await DB.prepare('DELETE FROM agents WHERE id = ?').bind(id).run()
  return Response.json({ ok: true })
}
