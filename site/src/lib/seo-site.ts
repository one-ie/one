// Single source of the site's production identity for SEO surfaces that
// need a static value at build time (llms.txt, IndexNow, sitemap, JSON-LD
// site-wide nodes) — contexts with no per-request Astro.url to derive from.
// Rebranding this template (new workspace.toml slug/name) means editing
// only this file; nothing else in src/ may repeat these literals.
export const SITE = {
  url: 'https://one.ie',
  name: 'ONE',
  description: 'The open-source Astro starter that ships payments, AI, and plugins on day one.',
}
