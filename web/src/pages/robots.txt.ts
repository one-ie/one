import type { APIContext } from 'astro'

export const prerender = false

export async function GET({ site, url }: APIContext) {
  const origin = site?.origin ?? url.origin
  const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
