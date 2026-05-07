import type { APIRoute } from 'astro'
import { getEnv } from '../../../../lib/cf-env'

export const prerender = false

type CfEnv = {
  SERVER_SECRET?: string
  CONTENT?: R2Bucket
}

// Minimal frontmatter parser — extracts YAML-style key: value pairs from
// a ---\n...\n--- block at the top of a markdown file.
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}
  const result: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const value = line.slice(colon + 1).trim()
    if (key) result[key] = value
  }
  return result
}

// Rewrites a single frontmatter key in the raw markdown content.
// If the key doesn't exist in the frontmatter it is appended before `---`.
function setFrontmatterKey(content: string, key: string, value: string): string {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!fmMatch) {
    // No frontmatter — prepend one
    return `---\n${key}: ${value}\n---\n${content}`
  }
  const body = fmMatch[1]
  const keyRe = new RegExp(`^(${key}:\\s*).*$`, 'm')
  const updatedBody = keyRe.test(body)
    ? body.replace(keyRe, `$1${value}`)
    : `${body}\n${key}: ${value}`
  return content.replace(fmMatch[0], `---\n${updatedBody}\n---`)
}

// GET /api/payments/accept-links/:slug — public, no auth required
export const GET: APIRoute = async ({ params }) => {
  const { slug } = params
  if (!slug) return Response.json({ error: 'slug required' }, { status: 400 })

  const env = (await getEnv()) as CfEnv
  if (!env.CONTENT) {
    return Response.json({ error: 'storage not configured' }, { status: 503 })
  }

  // Slug format: ownerSlug--skillSlug (double-dash separator) or just skillSlug
  // for the owner's own skills. Accept-link slugs correspond to skill paths.
  // The path in R2 is: ${ownerSlug}/skills/${skillSlug}/SKILL.md
  // TODO: W5 — resolve ownerSlug via auth context or subdomain routing;
  //   for now we expect slug = "ownerSlug--skillSlug" format.
  const parts = slug.split('--')
  if (parts.length < 2) {
    return Response.json(
      { error: 'slug must be in format ownerSlug--skillSlug' },
      { status: 400 },
    )
  }
  const ownerSlug = parts[0]
  const skillSlug = parts.slice(1).join('--')

  const obj = await env.CONTENT.get(`${ownerSlug}/skills/${skillSlug}/SKILL.md`)
  if (!obj) {
    return Response.json({ error: 'skill not found' }, { status: 404 })
  }

  const raw = await obj.text()
  const fm = parseFrontmatter(raw)

  return Response.json({
    slug,
    price: fm['price'] ?? null,
    currency: fm['currency'] ?? 'USD',
    description: fm['description'] ?? null,
  })
}

// PATCH /api/payments/accept-links/:slug — auth required
export const PATCH: APIRoute = async ({ params, request }) => {
  const { slug } = params
  if (!slug) return Response.json({ error: 'slug required' }, { status: 400 })

  const env = (await getEnv()) as CfEnv
  if (!env.SERVER_SECRET || !env.CONTENT) {
    return Response.json({ error: 'not configured' }, { status: 503 })
  }

  const auth = request.headers.get('Authorization') ?? ''
  if (auth !== `Bearer ${env.SERVER_SECRET}`) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: { price?: string; currency?: string; description?: string }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  if (!body.price && !body.currency && !body.description) {
    return Response.json({ error: 'nothing to update' }, { status: 400 })
  }

  const parts = slug.split('--')
  if (parts.length < 2) {
    return Response.json(
      { error: 'slug must be in format ownerSlug--skillSlug' },
      { status: 400 },
    )
  }
  const ownerSlug = parts[0]
  const skillSlug = parts.slice(1).join('--')
  const r2Key = `${ownerSlug}/skills/${skillSlug}/SKILL.md`

  const obj = await env.CONTENT.get(r2Key)
  if (!obj) {
    return Response.json({ error: 'skill not found' }, { status: 404 })
  }

  let raw = await obj.text()

  // Read-modify-write — update each provided field in the frontmatter
  if (body.price !== undefined) raw = setFrontmatterKey(raw, 'price', body.price)
  if (body.currency !== undefined) raw = setFrontmatterKey(raw, 'currency', body.currency)
  if (body.description !== undefined) raw = setFrontmatterKey(raw, 'description', body.description)

  await env.CONTENT.put(r2Key, raw, { httpMetadata: { contentType: 'text/markdown' } })

  return Response.json({ ok: true })
}
