import type { APIRoute } from 'astro'
import { getCollection, type CollectionEntry } from 'astro:content'
import { createSchemaEndpoint, breadcrumbsFromUrl } from '@jdevalk/astro-seo-graph'
import { buildWebPage, buildArticle, buildBreadcrumbList, buildPiece, buildWebSite } from '@jdevalk/seo-graph-core'
import type { Organization } from 'schema-dts'
import { ids } from '../lib/seo-graph'
import { SITE } from '../lib/seo-site'

// Corpus-wide JSON-LD `@graph` across the blog + docs collections combined
// — the single URL an AI agent hits instead of crawling page-by-page (see
// data/text/seo.md §0, WP-2, point 3). `/schema-map.xml` (point 2) lists
// this endpoint for discovery; this file is what it points at.
//
// Deliberately NOT prerendered. Tried `prerender = true` first: under this
// site's `output: 'server'` + Cloudflare adapter, a prerendered endpoint
// becomes a static asset, and Cloudflare's static-asset pipeline serves it
// with a Content-Type guessed from the file extension (`.json` →
// `application/json`), silently discarding the `application/ld+json`
// header `createSchemaEndpoint` sets — confirmed by building with
// `prerender = true` and inspecting response headers under `astro
// preview`. Staying a real on-demand SSR route preserves the header, but
// means this file must never call `gitLastmod` (build-time-only — shells
// out to a local `git` binary unavailable inside the deployed Worker, see
// data/text/seo.md §0 finding 3); dates below come from content-collection
// frontmatter only.

// Reuse WP-1's single IdFactory + Organization slug (src/lib/seo-graph.ts)
// so this document's Organization/WebSite @id values are the exact same
// entities referenced on every HTML page, not a second, drifting
// definition of "ONE" as a business.
const ORGANIZATION_SLUG = 'primary' // must match src/lib/seo-graph.ts's ORGANIZATION_SLUG
const organizationId = ids.organization(ORGANIZATION_SLUG)

// Docs entries have no frontmatter date field today (DocsSchema in
// src/content.config.ts — title/description/order only). Module-scope so
// it's stable for the life of this Worker isolate rather than drifting on
// every request. Real fix: add a date field to DocsSchema (foreign file,
// out of scope here).
const DOCS_FALLBACK_DATE = new Date()

type Entry =
  | { kind: 'blog'; entry: CollectionEntry<'blog'> }
  | { kind: 'docs'; entry: CollectionEntry<'docs'> }

async function collectEntries(): Promise<Entry[]> {
  const [blogPosts, docsPages] = await Promise.all([getCollection('blog'), getCollection('docs')])
  const entries: Entry[] = [
    ...blogPosts.map((entry) => ({ kind: 'blog' as const, entry })),
    ...docsPages.map((entry) => ({ kind: 'docs' as const, entry })),
  ]

  // §9's "200-but-empty" killer, applied to this endpoint: an unhandled
  // throw here propagates as a request-time error (500), not a quiet empty
  // 200 — this is a real on-demand SSR route (see header note above), so
  // this check runs on every request, not just at build.
  if (entries.length === 0) {
    throw new Error(
      'schema.json: blog + docs collections are both empty — refusing to serve an empty JSON-LD @graph.',
    )
  }

  return entries
}

function siteWideEntities() {
  // Same @id as src/lib/seo-graph.ts's Organization + WebSite (shared
  // `ids` factory + slug) — re-embedded here so an agent that fetches only
  // /schema.json (never crawls the HTML pages) gets a self-contained,
  // resolvable graph instead of dangling references to entities defined
  // solely in each page's own <head>.
  return [
    buildPiece<Organization>({
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
    }),
    buildWebSite(
      {
        url: `${SITE.url}/`,
        name: SITE.name,
        description: SITE.description,
        publisher: { '@id': organizationId },
      },
      ids,
    ),
  ]
}

function piecesFor(item: Entry) {
  const isBlog = item.kind === 'blog'
  const segment = isBlog ? 'blog' : 'docs'
  const id = item.entry.id
  const url = new URL(`/${segment}/${id}`, SITE.url).href
  const title = item.entry.data.title
  const description = isBlog
    ? (item.entry as CollectionEntry<'blog'>).data.description
    : ((item.entry as CollectionEntry<'docs'>).data.description ?? title)
  const datePublished = isBlog ? (item.entry as CollectionEntry<'blog'>).data.date : DOCS_FALLBACK_DATE

  const crumbs = breadcrumbsFromUrl({
    url,
    siteUrl: SITE.url,
    pageName: title,
    names: { blog: 'Blog', docs: 'Docs' },
  })

  return [
    ...siteWideEntities(),
    buildWebPage(
      {
        url,
        name: title,
        description,
        isPartOf: { '@id': ids.website },
        breadcrumb: { '@id': ids.breadcrumb(url) },
      },
      ids,
    ),
    buildArticle(
      {
        url,
        isPartOf: { '@id': ids.webPage(url) },
        author: { '@id': organizationId, name: SITE.name },
        publisher: { '@id': organizationId, name: SITE.name },
        headline: title,
        description,
        datePublished,
      },
      ids,
      isBlog ? 'BlogPosting' : 'TechArticle',
    ),
    buildBreadcrumbList({ url, items: crumbs }, ids),
  ]
}

export const GET: APIRoute = createSchemaEndpoint({
  entries: collectEntries,
  mapper: piecesFor,
})
