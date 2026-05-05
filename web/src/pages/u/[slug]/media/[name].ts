import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket }
  const { slug, name } = params as { slug: string; name: string }
  if (!env.CONTENT || !slug || !name) return new Response('not found', { status: 404 })

  const obj = await env.CONTENT.get(`${slug}/media/${name}`)
  if (!obj) return new Response('not found', { status: 404 })

  const contentType = obj.httpMetadata?.contentType ?? 'application/octet-stream'
  return new Response(obj.body, {
    headers: {
      'content-type': contentType,
      'cache-control': 'public, max-age=31536000, immutable',
      etag: `"${obj.customMetadata?.sha ?? name}"`,
    },
  })
}
