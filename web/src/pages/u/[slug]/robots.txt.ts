import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async ({ params, url }) => {
  const slug = params.slug!
  const env = (await import('cloudflare:workers' as string)).env as { CONTENT?: R2Bucket }
  let robotsDirective = 'Allow: /'
  if (env.CONTENT) {
    const siteObj = await env.CONTENT.get(`${slug}/site.md`)
    if (siteObj) {
      const md = await siteObj.text()
      const m = /^robots:\s*(.+)/m.exec(md)
      if (m) robotsDirective = m[1].trim()
    }
  }
  const body = `User-agent: *\n${robotsDirective}\nSitemap: ${url.origin}/u/${slug}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } })
}
