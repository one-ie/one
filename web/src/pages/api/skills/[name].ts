import type { APIRoute } from 'astro'
import { getEnv } from '@/lib/cf-env'

export const prerender = false

type CfEnv = {
  SERVER_SECRET?: string
  CONTENT?: R2Bucket
  DB?: D1Database
}

interface SkillFrontmatter {
  name?: string
  description?: string
  price?: string | number
  author?: string
}

/** Parse minimal YAML frontmatter from a markdown string.
 *  Splits on `---` delimiters and extracts `key: value` lines.
 *  No external yaml package needed.
 */
function parseFrontmatter(text: string): { meta: SkillFrontmatter; body: string } {
  const trimmed = text.trimStart()
  if (!trimmed.startsWith('---')) return { meta: {}, body: text }

  const afterOpen = trimmed.slice(3)
  const closeIdx = afterOpen.indexOf('\n---')
  if (closeIdx === -1) return { meta: {}, body: text }

  const fmBlock = afterOpen.slice(0, closeIdx)
  const body = afterOpen.slice(closeIdx + 4).trimStart()

  const meta: SkillFrontmatter = {}
  for (const line of fmBlock.split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '')
    if (key === 'name') meta.name = value
    else if (key === 'description') meta.description = value
    else if (key === 'price') meta.price = isNaN(Number(value)) ? value : Number(value)
    else if (key === 'author') meta.author = value
  }
  return { meta, body }
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

/** GET /api/skills/:name
 *
 * Auth required to know which workspace to read from.
 * Reads `<ownerSlug>/skills/<name>/SKILL.md` from R2.
 * Returns parsed frontmatter fields + first 500 chars of body.
 */
export const GET: APIRoute = async ({ params, request }) => {
  const { name } = params
  if (!name) return Response.json({ error: 'name required' }, { status: 400 })

  const env = await getEnv() as unknown as CfEnv

  if (!env.SERVER_SECRET || !env.CONTENT || !env.DB) {
    return Response.json({ error: 'not configured' }, { status: 503 })
  }

  const ownerId = checkAuth(request, env.SERVER_SECRET)
  if (!ownerId) return Response.json({ error: 'unauthorized' }, { status: 401 })

  if (ownerId === 'server') {
    return Response.json({ error: 'owner-scoped token required' }, { status: 400 })
  }

  const ownerRow = await env.DB
    .prepare('SELECT slug FROM owners WHERE slug = ?')
    .bind(ownerId)
    .first<{ slug: string }>()
  if (!ownerRow) return Response.json({ error: 'owner not found' }, { status: 404 })

  const key = `${ownerRow.slug}/skills/${name}/SKILL.md`
  const obj = await env.CONTENT.get(key)
  if (!obj) return Response.json({ error: 'not found' }, { status: 404 })

  const raw = await obj.text()
  const { meta, body } = parseFrontmatter(raw)

  return Response.json({
    name: meta.name ?? name,
    description: meta.description ?? null,
    price: meta.price ?? null,
    author: meta.author ?? null,
    content: body.slice(0, 500),
  })
}
