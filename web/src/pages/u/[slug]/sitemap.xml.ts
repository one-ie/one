import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug!
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket }
  if (!env.CONTENT) return new Response('', { status: 503 })

  const listed = await env.CONTENT.list({ prefix: `${slug}/` })
  const base = url.origin
  const urls = listed.objects
    .filter(o => !o.key.includes('/_workspace/') && !o.key.includes('/_versions/') && !o.key.includes('/_recovery/'))
    .map(o => {
      const rest = o.key.slice(slug.length + 1)
      const [kind, ...parts] = rest.split('/')
      const name = parts.join('/')
      const loc = `${base}/u/${slug}/${kind}/${name}`
      const lastmod = new Date().toISOString().slice(0, 10)
      return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`
    })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' },
  })
}
