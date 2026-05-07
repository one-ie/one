import type { APIRoute } from 'astro'
import { updateSiteTokens, COLOR_KEYS } from '../../lib/site'
import { slugExists } from '../../lib/slug'

export const prerender = false

const HEX_OR_HSL = /^#[0-9a-fA-F]{3,6}$|^hsl\(/

export const POST: APIRoute = async ({ request }) => {
  const env = (await import('cloudflare:workers' as string)).env as {
    DB?: D1Database
    CONTENT?: R2Bucket
  }
  if (!env.DB || !env.CONTENT) return new Response('not configured', { status: 503 })

  const form = await request.formData()
  const slug = (form.get('slug') as string | null)?.trim()
  if (!slug) return new Response('missing slug', { status: 400 })

  if (!await slugExists(slug, env.DB)) return new Response('not found', { status: 404 })

  // Handle logo upload
  const logoFile = form.get('logo') as File | null
  if (logoFile && logoFile.size > 0) {
    const buffer = await logoFile.arrayBuffer()
    await env.CONTENT.put(`${slug}/logo`, buffer, {
      customMetadata: { contentType: logoFile.type || 'image/png' },
    })
  }

  // Handle color tokens and site name
  const updates: Record<string, string> = {}
  for (const key of COLOR_KEYS) {
    const val = (form.get(key) as string | null)?.trim()
    if (val && HEX_OR_HSL.test(val)) updates[key] = val
  }
  const name = (form.get('name') as string | null)?.trim()
  if (name) updates['name'] = name.slice(0, 80)

  if (Object.keys(updates).length > 0) {
    const existing = await env.CONTENT.get(`${slug}/site.md`)
    const existingMd = existing ? await existing.text() : ''
    const updated = updateSiteTokens(existingMd, updates)
    await env.CONTENT.put(`${slug}/site.md`, updated, {
      customMetadata: { contentType: 'text/markdown' },
    })
  }

  return new Response(null, { status: 302, headers: { location: `/u/${slug}/settings` } })
}
