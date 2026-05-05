import type { APIRoute } from 'astro'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database }
  if (!env.DB) return new Response('DB not configured', { status: 503 })

  const body = await request.formData()
  const slug = body.get('slug') as string | null
  const wallet = body.get('wallet') as string | null
  const agentverseKey = body.get('agentverse_key') as string | null

  if (!slug) return new Response('missing slug', { status: 400 })

  const updates: string[] = []
  const values: (string | null)[] = []

  if (wallet !== null) { updates.push('wallet = ?'); values.push(wallet || null) }
  if (agentverseKey) { updates.push('agentverse_key_enc = ?'); values.push(agentverseKey) }

  if (updates.length === 0) {
    return new Response(null, { status: 302, headers: { location: `/u/${slug}/settings` } })
  }

  values.push(slug)
  await env.DB.prepare(`UPDATE owners SET ${updates.join(', ')} WHERE slug = ?`)
    .bind(...values)
    .run()

  return new Response(null, { status: 302, headers: { location: `/u/${slug}/settings` } })
}
