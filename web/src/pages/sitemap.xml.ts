import type { APIContext } from 'astro'

export const prerender = false

const ROUTES = ['/', '/chat']

export async function GET({ site, url }: APIContext) {
  const origin = site?.origin ?? url.origin
  const urls = ROUTES.map(
    (p) => `  <url><loc>${origin}${p}</loc></url>`
  ).join('\n')
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
