import type { APIRoute } from 'astro'
import { createApiCatalog } from '@jdevalk/astro-seo-graph'
import { SITE } from '../../lib/seo-site'

// RFC 9727 API catalog at /.well-known/api-catalog (application/linkset+json,
// RFC 9264) — so an agent crawler discovers every API surface this site
// exposes or fronts in one fetch (data/text/seo.md §0, WP-2, point 4).
//
// Deliberately NOT prerendered. Under this site's `output: 'server'` +
// Cloudflare adapter, a prerendered endpoint becomes a static asset with no
// file extension here (`api-catalog` has none), and Cloudflare's
// static-asset pipeline serves it with no Content-Type header at all,
// discarding `createApiCatalog`'s `application/linkset+json` — confirmed
// by building with `prerender = true` and inspecting response headers
// under `astro preview`. Staying a real on-demand SSR route preserves it;
// this file has no request-scoped state, so the only cost is re-running
// a cheap, allocation-only function per request.
export const GET: APIRoute = createApiCatalog({
  siteUrl: SITE.url,
  // The corpus-wide schema.json endpoint (WP-2 point 3) mixes node types
  // (WebPage + BlogPosting + TechArticle + BreadcrumbList across two
  // collections) rather than one collection's single type, so it's listed
  // under `additional` with an explicit type array instead of
  // `schemaEndpoints` (which auto-types a single schema.org type per
  // entry — accurate for one-collection-per-file setups, not this one).
  additional: [
    {
      anchor: '/schema.json',
      type: [
        'https://schema.org/WebPage',
        'https://schema.org/BlogPosting',
        'https://schema.org/TechArticle',
        'https://schema.org/BreadcrumbList',
      ],
    },
    // The ONE backend gateway this site fronts — one of four coordinated
    // ONE surfaces (one.ie, pay.one.ie, api.one.ie, github.com/one-ie/one;
    // see the root workspace CLAUDE.md's four-surface table). This is
    // where a crawling agent discovers one.ie is not an island.
    {
      anchor: 'https://api.one.ie',
      serviceDoc: 'https://github.com/one-ie/one',
    },
  ],
  // Path of the createSchemaMap route (WP-2 point 2) — discovery list of
  // every schema.org JSON endpoint on the site.
  schemaMap: { path: '/schema-map.xml' },
})
