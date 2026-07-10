import type { APIRoute } from 'astro'
import { createSchemaMap, gitLastmod } from '@jdevalk/astro-seo-graph'
import { SITE } from '../lib/seo-site'

// AI-agent discovery of the site's JSON-LD knowledge graph — a sitemap-
// style XML listing of schema.org *endpoints* (a handful of URLs, e.g.
// /schema.json), not every page on the site. This is NOT the page sitemap
// Search Console needs — that's /sitemap.xml, a completely separate,
// hand-built artifact (see data/text/seo.md §0, WP-2 correction).
//
// Prerendered — same reasoning as /sitemap.xml: its `.xml` extension is
// served with the correct Content-Type by Cloudflare's static-asset
// pipeline either way (unlike /schema.json and /.well-known/api-catalog,
// which lose their real Content-Type when prerendered — see those files'
// headers for why they stay on-demand SSR instead), and prerendering is
// required for `gitLastmod` below to have any chance of running — it
// shells out to a local `git` binary and only works at `astro build` time,
// never inside the deployed Cloudflare Worker (data/text/seo.md §0 finding
// 3). In practice, verified against this exact build: the Cloudflare
// adapter's prerender phase resolves `process.cwd()` to `/`, not the
// project root, so `gitLastmod` returns null here today and every entry
// falls back to `new Date()` (the build date) below — degrades safely,
// and would start returning real commit dates for free if that cwd quirk
// is ever fixed upstream.
export const prerender = true

// One entry per schema.org JSON endpoint this site exposes. /schema.json
// (WP-2 point 3) is the only one today — add future schema endpoints here
// as they ship. This file is the single discovery list an agent crawler
// reads to find every JSON-LD graph on the site.
const SCHEMA_ENDPOINTS: ReadonlyArray<{ path: string; file: string }> = [
  { path: '/schema.json', file: 'src/pages/schema.json.ts' },
]

export const GET: APIRoute = createSchemaMap({
  siteUrl: SITE.url,
  entries: SCHEMA_ENDPOINTS.map(({ path, file }) => ({
    path,
    lastModified: gitLastmod(file) ?? new Date(),
  })),
})
