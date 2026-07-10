import { defineCollection } from 'astro:content'
import { glob, type Loader } from 'astro/loaders'
import { z } from 'zod'
// SEO frontmatter lint (WP-3, data/text/seo.md §0/§3): neither
// @oneie/plugin-blog nor @oneie/plugin-docs expose a content-collection
// schema extension point of their own (their index.ts only injects routes —
// see their src/index.ts — the Zod schemas below live entirely in this
// site's content.config.ts). That makes this file the extension point:
// additive `seo` fields, never a change to the existing fields the plugins'
// own components already read (BlogPost.astro/PostCard.tsx read
// `entry.data.image` as a plain string — must stay a string, not become
// imageSchema's {src,alt} shape).
import { seoSchema, gitLastmod } from '@jdevalk/astro-seo-graph'

// dateModified via git, done correctly for THIS deploy target
// (data/text/seo.md §0 finding 3 + WP-3 entry) — with one correction to the
// plan's own assumption, verified empirically while building this: the plan
// assumed a prerendered route's frontmatter script runs in the plain Node
// `astro build` process, where a real git binary + full checkout are
// reachable. On this repo's actual adapter (@astrojs/cloudflare,
// `output:'server'`), that is NOT where prerendering happens — it runs
// inside a workerd/Miniflare sandbox (confirmed: `process.cwd()` is `/` and
// `gitLastmod()` returns null there even for files with real git history).
// So calling gitLastmod() directly from blog/[slug].astro or
// docs/[slug].astro — even guarded by `prerender = true` — would silently
// always fall back to frontmatter, never actually using git.
//
// The one place that *does* run in the real Node process is content sync
// ("[content] Syncing content" in the build log, well before "Building
// server entrypoints..." spins up the sandbox) — i.e. right here, inside a
// collection's `loader`. This wraps the ordinary `glob()` loader: run it
// unmodified, then for every entry it stored, resolve gitLastmod() against
// the entry's real file and stash the ISO string (or null) back into the
// store directly — bypassing `parseData`/schema validation a second time,
// which is fine, since this value is computed, never author-supplied.
// blog/[slug].astro and docs/[slug].astro read `entry.data.gitLastmod`
// (already resolved, already a plain string) — no gitLastmod call, and no
// git binary dependency, anywhere in their own code.
function withGitLastmod(base: Loader): Loader {
  return {
    ...base,
    async load(context) {
      await base.load(context)
      for (const [id, entry] of context.store.entries()) {
        const lastmod = entry.filePath ? gitLastmod(entry.filePath, { depth: 20 }) : null
        context.store.set({
          ...entry,
          id,
          // MutableDataStore.scopedStore().set() short-circuits to a no-op
          // whenever the passed `digest` matches what's already stored
          // (verified by reading node_modules/astro/dist/content/mutable-
          // data-store.js — it's a cache-hit fast path) — spreading `entry`
          // above carries over the *unchanged* digest the base loader just
          // set, which made this update silently do nothing. Clearing it
          // forces the write through; this collection is small and build-
          // time only, so recomputing on every sync is cheap.
          digest: undefined,
          data: { ...entry.data, gitLastmod: lastmod ? lastmod.toISOString() : null },
        })
      }
    },
  }
}

// Products for sale on this site — one markdown file per product. Priced
// server-side only: link.ts's resolveProduct() reads this collection, never
// a client-sent amount, so a buyer can never tamper with a catalog price.
const ProductSchema = z.object({
  name: z.string(),
  priceCents: z.number().int().positive(),
  description: z.string(),
  // Optional richer fields for a full product landing page (src/pages/products/[slug].astro).
  // Absent on a minimal product — the catalog card and nav link still work with just the three above.
  tagline: z.string().optional(),
  bullets: z.array(z.string()).optional(),
})

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ProductSchema,
})

// Blog posts — powers @oneie/plugin-blog's injected /blog + /blog/[slug] routes.
const blog = defineCollection({
  loader: withGitLastmod(glob({ pattern: '**/*.md', base: './src/content/blog' })),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      category: z.string().optional(),
      // Plain string, read by the plugin's own BlogPost.astro/PostCard.tsx
      // as an <img src> — NOT wrapped in imageSchema, which would change
      // its shape to {src, alt} and break those (foreign) components.
      image: z.string().optional(),
      tags: z.array(z.string()).optional(),
      // Additive per-entry SEO override (site/src/pages/blog/[slug].astro
      // reads title/description length here; falls back to the fields
      // above when absent). seoSchema enforces its own title/description
      // length lint (5-120 / 15-160 chars) and requires `alt` whenever
      // `seo.image` is set — decorative overrides must pass `alt: ''`
      // explicitly, never omit it.
      seo: seoSchema(image).optional(),
      // Computed by withGitLastmod() above, not authored in frontmatter —
      // ISO date string, or null when the file has no (or only excluded)
      // git history (e.g. merge-loop-absorbed content). Falls back to
      // `date` in that case — see blog/[slug].astro.
      gitLastmod: z.string().nullable().optional(),
    }),
})

// Docs — powers @oneie/plugin-docs' /docs + /docs/[slug] routes.
const docs = defineCollection({
  loader: withGitLastmod(glob({ pattern: '**/*.md', base: './src/content/docs' })),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string().optional(),
      order: z.number().optional(),
      // Optional — most docs have no natural "publish date"; when absent,
      // site/src/pages/docs/[slug].astro falls back to the computed
      // `gitLastmod` below and only emits a TechArticle node when a date
      // resolves from one source or the other (see that file's comments).
      publishDate: z.coerce.date().optional(),
      seo: seoSchema(image).optional(),
      // Computed by withGitLastmod() above — see the blog schema's comment.
      gitLastmod: z.string().nullable().optional(),
    }),
})

export const collections = { products, blog, docs }
