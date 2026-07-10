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
          ['/wallet', '/lifecycle', '/payments', '/signin', '/signup'].includes(href),
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
