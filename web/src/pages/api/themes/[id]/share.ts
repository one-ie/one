import type { APIRoute } from 'astro'
import { getTheme } from '@/lib/db/themes'
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

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })

  const ownerId = checkAuth(request, SERVER_SECRET)
  if (!ownerId) return unauthorized()

  const theme = await getTheme(DB, id)
  if (!theme) return Response.json({ error: 'not found' }, { status: 404 })

  const result = await DB.prepare(
    'UPDATE themes SET is_public = 1 WHERE id = ? AND owner_id = ?'
  )
    .bind(id, ownerId)
    .run()

  if (!result.success) {
    return Response.json({ error: 'not found or not owner' }, { status: 404 })
  }

  return Response.json({ ok: true, shareUrl: '/design?theme=' + id })
}
