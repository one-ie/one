// robots.txt as a route, not a public/ static file — the static version
// hardcoded the sitemap origin and silently drifted from SITE.url (it
// pointed crawlers at one.ie's sitemap). Deriving from SITE keeps the
// "rebrand = edit seo-site.ts only" contract honest.
import type { APIRoute } from 'astro'
import { SITE } from '@/lib/seo-site'

export const prerender = true

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${SITE.url}/sitemap.xml
`
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
