import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import { SITE } from '../lib/seo-site'

// The feed advertised by Layout.astro's <link rel="alternate"
// type="application/rss+xml" href={`${SITE.url}/rss.xml`}> (see Layout.astro)
// — must be served at exactly `/rss.xml` for that tag to resolve.
//
// Prerendered: every item below comes from the `blog` content collection,
// resolved from markdown already committed to git — nothing here is
// request-scoped (same reasoning as sitemap.xml.ts and schema-map.xml.ts).
// Confirmed safe against this exact build's Cloudflare adapter: a
// prerendered endpoint becomes a static asset whose Content-Type is guessed
// from the file extension, which silently discards a handler's intended
// Content-Type for `.json` (see schema.json.ts's header note — that file
// stays SSR for exactly this reason). `.xml` doesn't have that problem:
// verified by building `sitemap.xml.ts`/`schema-map.xml.ts` (both
// prerendered `.xml` routes already) and inspecting `astro preview`
// response headers — Cloudflare's static pipeline serves `.xml` as
// `application/xml`, which is also exactly what `@astrojs/rss`'s own
// `rss()` helper sets by default (read node_modules/@astrojs/rss/dist/
// index.js: `getRssResponse` hardcodes `Content-Type: application/xml`,
// not `application/rss+xml`) — so prerendering changes nothing here.
export const prerender = true

// Canonical link form must match how blog/[slug].astro actually serves
// (prerendered via getStaticPaths() => directory-style output => trailing
// slash — verified the same way sitemap.xml.ts's `withSlash` comment
// documents), or feed readers get a link that 307s on every fetch.
function withSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

export const GET: APIRoute = async (context) => {
  const posts = await getCollection('blog')

  return rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: new URL(withSlash(`/blog/${post.id}`), SITE.url).href,
      })),
  })
}
