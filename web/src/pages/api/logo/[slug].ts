import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params as { slug: string }
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket }
  if (!env.CONTENT) return new Response(null, { status: 503 })

  const obj = await env.CONTENT.get(`${slug}/logo`)
  if (!obj) return new Response(null, { status: 404 })

  const contentType = obj.customMetadata?.contentType ?? 'image/png'
  return new Response(obj.body as unknown as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
