// Markdown alternate for a blog post (WP-8b, data/text/seo.md Phase 3,
// implementing WP-8a's spike verdict). `createMarkdownEndpoint` is genuinely
// SSR-native — a plain per-request APIRoute, no build-time/prerender
// coupling — and serves this at a DISTINCT `.md` URL, not content
// negotiation on the HTML URL. `blog/[slug].astro` derives this same URL
// via `deriveMdUrl(pageUrl)` and advertises it as a
// `<link rel="alternate" type="text/markdown">` via Layout's
// `mdAlternateHref` prop; this file is what that link actually points at.
//
// Deliberately NOT prerendered — see src/pages/schema.json.ts's comment for
// the identical reasoning: under this site's `output: 'server'` + Cloudflare
// adapter, a prerendered endpoint becomes a static asset served through
// Cloudflare's static-asset pipeline, which assigns Content-Type by file
// extension rather than honoring what the handler sets. That pipeline's
// MIME table has no confirmed entry for `.md` → `text/markdown`, the same
// class of risk that broke `schema.json.ts`'s `application/ld+json` header
// when tried under `prerender = true` — so on-demand SSR is the safe
// default here too, and it's what's verified working (see the curl checks
// run against `bun run preview`).
//
// `X-Robots-Tag: noindex, follow` is NOT set here — createMarkdownEndpoint
// (site/node_modules/@jdevalk/astro-seo-graph/dist/markdown-routes.js)
// already sets it unconditionally; setting it again here would just be a
// redundant duplicate header.
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { createMarkdownEndpoint } from '@jdevalk/astro-seo-graph'
import { SITE } from '../../lib/seo-site'

export const GET: APIRoute = createMarkdownEndpoint({
  entries: () => getCollection('blog'),
  mapper: (post, slug) => {
    if (post.id !== slug) return null

    const seoTitle = post.data.seo?.title ?? post.data.title
    const seoDescription = post.data.seo?.description ?? post.data.description
    // Trailing-slash canonical, matching what blog/[slug].astro's
    // `Astro.url.href` resolves to for this same page (this site's
    // dynamic routes build under the directory-format default) — keeps
    // this endpoint's embedded canonical in lockstep with the HTML page's
    // real canonical, not a second, potentially-drifting computation of it.
    const canonical = `${SITE.url}/blog/${post.id}/`
    const dateModified = post.data.gitLastmod ? new Date(post.data.gitLastmod) : post.data.date

    return {
      frontmatter: {
        title: seoTitle,
        canonical,
        pubDate: post.data.date,
        updatedDate: dateModified,
        description: seoDescription,
        tags: post.data.tags,
        categories: post.data.category ? [post.data.category] : undefined,
      },
      body: post.body ?? '',
    }
  },
})
