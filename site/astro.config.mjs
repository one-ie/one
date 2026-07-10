import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import seoGraph from '@jdevalk/astro-seo-graph/integration'
import oneIntegration from './one.config.ts'
import { SITE } from './src/lib/seo-site.ts'

export default defineConfig({
  site: SITE.url,
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
    sessions: false,
  }),
  build: {
    inlineStylesheets: 'always',
  },
  integrations: [
    react(),
    oneIntegration,
    seoGraph({
      validateH1: true,
      validateUniqueMetadata: true,
      validateImageAlt: true,
      validateMetadataLength: true,
      validateInternalLinks: {
        // The validator only sees prerendered pages on disk (astro-seo-graph
        // limitation, not a real 404) — index.astro and every auth/session
        // route are intentionally SSR-only (see data/text/seo.md §0 finding
        // 2), so links to them and their in-page anchors read as false
        // "not in the build" warnings. Everything else still validates.
        skip: (href) =>
          href === '/' ||
          href.startsWith('/#') ||
          href.startsWith('/payments') || // includes query-string variants, e.g. /payments?plan=pro
          href.startsWith('/products/') || // dynamic product slugs (e.g. own-your-stack) — real SSR routes, reads live Cloudflare env same as /payments
          // Real trailing-slash redirects (not false positives) from
          // @oneie/plugin-blog (BlogPost.astro, PostCard.tsx) and
          // @oneie/plugin-docs (DocsLayout.astro, SidebarDocs.tsx,
          // DocsIndex.astro) — data/text/seo.md Phase 3, WP-11: investigated
          // and confirmed no plugin config controls this, and Astro's
          // `trailingSlash` option doesn't apply to prerendered pages (only
          // `build.format`, which would be a site-wide URL-shape change).
          // Correct fix is upstream in the plugins. Known, bounded risk:
          // this pattern would also silence a genuinely broken future link
          // shaped like these but missing its trailing slash for a real
          // reason — acceptable until the plugins are fixed.
          href === '/blog' ||
          href === '/docs' ||
          ((href.startsWith('/blog/') || href.startsWith('/docs/')) && !href.endsWith('/')) ||
          [
            '/wallet',
            '/lifecycle',
            '/payments',
            '/signin',
            '/signup',
            '/components',
            // On-demand SSR discovery endpoints (WP-2) and the build-output-root
            // llms.txt — none are prerendered HTML pages, so the disk-scanning
            // validator can't see them; they're real 200s at runtime (see
            // site/scripts/seo-gate.sh, which checks the actual runtime response).
            '/schema.json',
            '/.well-known/api-catalog',
            '/llms.txt',
          ].includes(href),
      },
      llmsTxt: {
        title: SITE.name,
        siteUrl: SITE.url,
        summary: SITE.description,
      },
      // indexNow: intentionally omitted — gated on a rebrand-verified prod
      // deploy, see data/text/seo.md §0 Phase 2, WP-7
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['react', 'react-dom', '@astrojs/react', 'better-auth'],
      // Dev-only stability fix: the workerd module runner keeps stale
      // deps_ssr hashes whenever Vite re-optimizes a lazily-discovered SSR
      // dep ("optimized dependencies changed. reloading"), 500-ing every
      // SSR route until a manual restart. The runner serves all routes fine
      // with no optimized SSR deps at all, so freeze that state.
      optimizeDeps: {
        noDiscovery: true,
        include: [],
      },
    },
  },
})
