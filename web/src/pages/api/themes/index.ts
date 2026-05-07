import type { APIRoute } from 'astro'
import { listThemes } from '@/lib/db/themes'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

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

export const GET: APIRoute = async ({ request }) => {
  const rawEnv = await getEnv() as unknown as { DB: D1Database; SERVER_SECRET: string }
  const { DB, SERVER_SECRET } = rawEnv
  if (!DB || !SERVER_SECRET) return Response.json({ error: 'not configured' }, { status: 503 })

  const ownerId = checkAuth(request, SERVER_SECRET)

  const community = await listThemes(DB, null)
  const publicThemes = community.filter(t => t.is_public === 1)

  if (!ownerId) {
    return Response.json({ mine: [], community: publicThemes })
  }

  const mine = await listThemes(DB, ownerId)
  return Response.json({ mine, community: publicThemes })
}
