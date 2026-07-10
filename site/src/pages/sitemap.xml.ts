import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { gitLastmod } from '@jdevalk/astro-seo-graph'
import { SITE } from '../lib/seo-site'

// The classic SEO sitemap — the artifact Search Console needs. This is a
// completely different artifact from /schema-map.xml (AI-agent discovery
// of the JSON-LD graph — cosmetically similar XML, different purpose and
// audience entirely). See data/text/seo.md §0, WP-2: `createSchemaMap`
// from the package is NOT a page sitemap ("serves a sitemap-style XML
// listing of the site's schema.org endpoints" per its own docstring) — the
// package ships no builder for this one, so it is hand-built here as a
// plain Astro API route.
//
// Prerendered: every URL below comes from either a static page file or a
// content collection resolved from markdown already committed to git —
// nothing here is request-scoped. `gitLastmod` shells out to a local `git`
// binary and only works at `astro build` time in a real checkout — it
// cannot run inside the deployed Cloudflare Worker (data/text/seo.md §0
// finding 3), so this route must stay prerendered to even attempt it.
//
// In practice, verified against this exact build: the Cloudflare adapter's
// prerender phase itself resolves `process.cwd()` to `/`, not the project
// root, so `git log -- <relative path>` fails and `gitLastmod` returns
// null for every call here today — every lastmod below currently falls
// back to `fallback` (frontmatter `date` for blog, the build date
// otherwise). Left in rather than removed: it degrades safely to that
// fallback, and starts producing real commit dates for free if this
// cwd quirk is ever fixed upstream, with no code change needed here.
export const prerender = true

function isoDate(gitPath: string, fallback: Date = new Date()): string {
  return (gitLastmod(gitPath) ?? fallback).toISOString().slice(0, 10)
}

// Canonical URL form must match how the page actually serves, or Google is
// handed a <loc> that 307s to a different URL on every crawl (data/text/
// seo.md §1: "only canonical, indexable URLs"). Verified against `astro
// preview`: prerendered routes (directory-style static output,
// `index.html` under a folder) serve — and self-canonicalize — at a
// trailing slash; on-demand SSR routes serve at the exact requested path,
// no trailing slash. Astro.url.origin also differs by the same split
// (SITE.url when prerendered, the live request origin when SSR), which is
// exactly why this file builds every `loc` from SITE.url regardless —
// that's the one origin that's always correct.
function withSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

interface SitemapUrl {
  loc: string
  lastmod: string
}

// Every static page under src/pages/ that is a real, canonical, indexable
// URL — everything except error pages (404/500), API routes
// (src/pages/api/**), .well-known/**, and this file's own sibling discovery
// endpoints (schema.json, schema-map.xml, api-catalog — those are agent-
// facing, not page content, and are X-Robots-Tag: noindex already). Dynamic
// [slug] routes (blog, docs, products) can't be listed statically here —
// they're enumerated from their real content collection entries below.
//
// `prerendered` must match each page's own `export const prerender` value
// (verified against `astro preview`, see `withSlash` above for why): pages
// with no explicit flag default to on-demand SSR under this site's
// `output: 'server'`.
const STATIC_PAGES: ReadonlyArray<{ path: string; file: string; prerendered: boolean }> = [
  { path: '/', file: 'src/pages/index.astro', prerendered: false }, // stays SSR — reads live Cloudflare env (seo.md §0 finding 2)
  { path: '/components', file: 'src/pages/components.astro', prerendered: false },
  { path: '/design', file: 'src/pages/design.astro', prerendered: true },
  { path: '/lifecycle', file: 'src/pages/lifecycle.astro', prerendered: false },
  { path: '/motion', file: 'src/pages/motion.astro', prerendered: true },
  { path: '/patterns', file: 'src/pages/patterns.astro', prerendered: true },
  { path: '/payments', file: 'src/pages/payments.astro', prerendered: false }, // reads live Cloudflare env
  { path: '/plugins', file: 'src/pages/plugins.astro', prerendered: false },
  { path: '/signin', file: 'src/pages/signin.astro', prerendered: false },
  { path: '/signup', file: 'src/pages/signup.astro', prerendered: false },
  { path: '/speed', file: 'src/pages/speed.astro', prerendered: true },
  { path: '/wallet', file: 'src/pages/wallet.astro', prerendered: false }, // reads live Cloudflare env
  { path: '/blog', file: 'src/pages/blog/index.astro', prerendered: true },
  { path: '/docs', file: 'src/pages/docs/index.astro', prerendered: true },
  { path: '/products', file: 'src/pages/products/index.astro', prerendered: true },
]

async function buildUrls(): Promise<SitemapUrl[]> {
  const staticUrls: SitemapUrl[] = STATIC_PAGES.map(({ path, file, prerendered }) => ({
    loc: new URL(prerendered ? withSlash(path) : path, SITE.url).href,
    lastmod: isoDate(file),
  }))

  const [blogPosts, docsPages, products] = await Promise.all([
    getCollection('blog'),
    getCollection('docs'),
    getCollection('products'),
  ])

  // Blog frontmatter carries a real `date` — prefer it over the build date
  // when git has no usable history (squashed/absorbed content, or — as
  // verified here — this build environment's gitLastmod always returning
  // null; see the module header), matching WP-3's stated policy for
  // per-page schema. Docs has no frontmatter date field, so it falls back
  // to the build date. blog/[slug] and docs/[slug] are both prerendered
  // (WP-3, getStaticPaths()) — trailing slash to match. products/[slug]
  // stays SSR (reads live Cloudflare env, same as /payments and /wallet)
  // — no trailing slash.
  const blogUrls: SitemapUrl[] = blogPosts.map((post) => ({
    loc: new URL(withSlash(`/blog/${post.id}`), SITE.url).href,
    lastmod: isoDate(`src/content/blog/${post.id}.md`, post.data.date),
  }))

  const docsUrls: SitemapUrl[] = docsPages.map((entry) => ({
    loc: new URL(withSlash(`/docs/${entry.id}`), SITE.url).href,
    lastmod: isoDate(`src/content/docs/${entry.id}.md`),
  }))

  const productUrls: SitemapUrl[] = products.map((product) => ({
    loc: new URL(`/products/${product.id}`, SITE.url).href,
    lastmod: isoDate(`src/content/products/${product.id}.md`),
  }))

  return [...staticUrls, ...blogUrls, ...docsUrls, ...productUrls]
}

export const GET: APIRoute = async () => {
  const urls = await buildUrls()

  // §9's "the 200-but-empty sitemap" killer: a naive "does it 200?" check
  // passes while Google is handed nothing — it cost a real site 6 days of
  // no indexing. Made structurally impossible here, not merely checked
  // for: since this route is prerendered, throwing fails `astro build`
  // itself rather than shipping an empty sitemap that quietly 200s.
  if (urls.length === 0) {
    throw new Error('sitemap.xml: enumerated zero indexable URLs — refusing to ship an empty sitemap.')
  }

  // No <priority>/<changefreq> — Google ignores both; including them is
  // the smell that marks a sitemap as hand-rolled (data/text/seo.md §1, §0).
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`,
  )
  .join('\n')}
</urlset>
`

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
