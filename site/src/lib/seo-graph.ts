// Site-wide JSON-LD graph — the baseline every page gets via Layout.astro's
// `graph` prop (contract 2, data/text/seo.md §0). Builds Organization +
// WebSite once (deduplicated by @id if repeated) plus a WebPage node for the
// current URL, then merges in whatever page-specific graph a caller already
// assembled (e.g. WP-3's BlogPosting/TechArticle/BreadcrumbList pieces).
//
// Identity values (name, url, description) come from seo-site.ts only —
// never hardcode `one.ie` or a business name here, so a workspace rebrand
// doesn't leave stale entities in the graph.
import type { Organization } from 'schema-dts'
import {
  assembleGraph,
  buildPiece,
  buildWebPage,
  buildWebSite,
  makeIds,
  type GraphEntity,
  type IdFactory,
  type WebPageType,
} from '@jdevalk/seo-graph-core'
import { SITE } from './seo-site'

/**
 * Single IdFactory for the whole site. Every @id anywhere in the graph —
 * site-wide singletons or per-page nodes — must come from this factory (or
 * one built with the same `siteUrl`) so cross-references actually resolve.
 * Exported so other packages (schema endpoints, per-page schema) can stay in
 * the same @id namespace instead of minting their own.
 */
export const ids: IdFactory = makeIds({ siteUrl: SITE.url })

/** Stable slug for the site's single Organization entity. */
const ORGANIZATION_SLUG = 'primary'
const organizationId = ids.organization(ORGANIZATION_SLUG)

/**
 * Organization + WebSite — the two site-wide singletons. Built fresh on
 * every call; `assembleGraph`'s first-wins dedup-by-@id collapses repeats
 * across pages down to one each.
 */
function siteWideEntities(): GraphEntity[] {
  return [
    buildPiece<Organization>({
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      logo: `${SITE.url}/vespio-logo.svg`,
      sameAs: [
        'https://github.com/one-ie/one',
        'https://x.com/one_ie',
        'https://discord.gg/one',
        'https://linkedin.com/company/one-ie',
      ],
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

export interface PageGraphOptions {
  /** Canonical URL of the current page — becomes the WebPage @id. */
  url: string
  /** Page title — becomes the WebPage `name`. */
  title: string
  /** WebPage subtype. Defaults to `'WebPage'`; use `'CollectionPage'` for
   *  index/listing pages, `'ProfilePage'` for about-style pages. */
  pageType?: WebPageType
  /**
   * A page-specific graph a caller already assembled (typically the output
   * of `assembleGraph()` from a page's own piece builders — e.g. WP-3's
   * BlogPosting/TechArticle/BreadcrumbList nodes). Its `@graph` entities are
   * merged in alongside the site-wide + WebPage baseline below. This is
   * exactly the `graph` prop Layout.astro receives from a page — pass it
   * straight through.
   */
  callerGraph?: Record<string, unknown> | null
}

/**
 * Build the JSON-LD graph for one page: Organization + WebSite (site-wide)
 * plus a WebPage node for `url`, merged with any caller-supplied graph.
 * Layout.astro calls this for every page so nothing ships with zero
 * structured data, even when no page-specific graph is passed in.
 */
export function buildPageGraph(opts: PageGraphOptions): Record<string, unknown> {
  const { url, title, pageType = 'WebPage', callerGraph } = opts

  const basePieces: GraphEntity[] = [
    ...siteWideEntities(),
    buildWebPage(
      {
        url,
        name: title,
        isPartOf: { '@id': ids.website },
      },
      ids,
      pageType,
    ),
  ]

  const callerPieces = Array.isArray(callerGraph?.['@graph'])
    ? (callerGraph['@graph'] as GraphEntity[])
    : []

  return assembleGraph([...basePieces, ...callerPieces], {
    warnOnDanglingReferences: true,
  })
}
