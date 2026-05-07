import type { APIRoute } from 'astro'
import { z } from 'zod'
import { listAgents, createAgent } from '@/lib/db/agents'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

function checkAuth(request: Request, secret: string): string | null {
  const auth = request.headers.get('Authorization') ?? ''
  const match = auth.match(/^Bearer\s+(.+)$/)
  if (!match) return null
  // Accept SERVER_SECRET → maps to a synthetic owner id
  if (match[1] === secret) return 'server'
  // Accept <ownerId>:<token> — caller passes their owner id prefixed
  const sep = match[1].indexOf(':')
  if (sep > 0) {
    const maybeId = match[1].slice(0, sep)
    const maybeToken = match[1].slice(sep + 1)
    if (maybeToken === secret) return maybeId
  }
  return null
}

export const GET: APIRoute = async ({ request }) => {
  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
  const ownerId = checkAuth(request, SERVER_SECRET)
  if (!ownerId) return unauthorized()

  const agents = await listAgents(DB, ownerId)
  return Response.json(agents)
}

export const POST: APIRoute = async ({ request }) => {
  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })
  const ownerId = checkAuth(request, SERVER_SECRET)
  if (!ownerId) return unauthorized()

  const bodySchema = z.object({
    slug: z.string(),
    name: z.string(),
    frontmatter: z.string().optional(),
    body: z.string().optional(),
  })
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: 'invalid body' }, { status: 400 })
  const { slug, name, frontmatter, body: agentBody } = parsed.data

  const agent = await createAgent(DB, {
    owner_id: ownerId,
    slug,
    name,
    frontmatter: frontmatter ?? '',
    body: agentBody ?? '',
    state: 'draft',
    generation: 0,
  })

  return Response.json(agent, { status: 201 })
}
