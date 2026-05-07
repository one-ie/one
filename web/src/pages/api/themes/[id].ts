import type { APIRoute } from 'astro'
import { z } from 'zod'
import { getTheme, patchTheme } from '@/lib/db/themes'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

function unauthorized(): Response {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
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

export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB } = rawEnv
  if (!DB) return Response.json({ error: 'not configured' }, { status: 503 })

  const theme = await getTheme(DB, id)
  if (!theme) return Response.json({ error: 'not found' }, { status: 404 })

  return Response.json(theme)
}

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })

  const ownerId = checkAuth(request, SERVER_SECRET)
  if (!ownerId) return unauthorized()

  const theme = await getTheme(DB, id)
  if (!theme) return Response.json({ error: 'not found' }, { status: 404 })

  const bodySchema = z.object({ tokens: z.string() })
  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) return Response.json({ error: 'invalid body' }, { status: 400 })
  const { tokens } = parsed.data

  await patchTheme(DB, id, tokens)
  const updated = await getTheme(DB, id)
  return Response.json(updated)
}
