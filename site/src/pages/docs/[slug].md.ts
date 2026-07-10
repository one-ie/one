// Markdown alternate for a docs page (WP-8b, data/text/seo.md Phase 3) — see
// blog/[slug].md.ts for the full rationale (identical for docs): SSR-native
// `createMarkdownEndpoint`, distinct `.md` URL (not content negotiation),
// deliberately not prerendered for the same Content-Type-mangled-by-
// Cloudflare's-static-pipeline reason documented in src/pages/schema.json.ts,
// and no manual `X-Robots-Tag` — the package already sets
// `noindex, follow` unconditionally.
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph'
import { SITE } from '../../lib/seo-site'

export const GET: APIRoute = createMarkdownEndpoint({
  entries: () => getCollection('docs'),
  mapper: (entry, slug) => {
    if (entry.id !== slug) return null

    const seoTitle = entry.data.seo?.title ?? entry.data.title
    const seoDescription = entry.data.seo?.description ?? entry.data.description
    // Trailing-slash canonical, matching docs/[slug].astro's `Astro.url.href`
    // for this same page — see blog/[slug].md.ts's identical comment.
    const canonical = `${SITE.url}/docs/${entry.id}/`
    // Docs have no required frontmatter date (docs/[slug].astro's identical
    // comment) — resolution order: explicit `publishDate`, then the
    // build-time-computed git signal, then omitted entirely rather than
    // fabricated.
    const gitDate = entry.data.gitLastmod ? new Date(entry.data.gitLastmod) : null
    const pubDate = entry.data.publishDate ?? gitDate ?? undefined
    const updatedDate = gitDate ?? entry.data.publishDate ?? undefined

    return {
      frontmatter: {
        title: seoTitle,
        canonical,
        pubDate,
        updatedDate,
        description: seoDescription,
      },
      body: entry.body ?? '',
    }
  },
})
