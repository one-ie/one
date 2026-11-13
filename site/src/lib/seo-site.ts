// Single source of the site's production identity for SEO surfaces that
// need a static value at build time (llms.txt, IndexNow, sitemap, JSON-LD
// site-wide nodes) — contexts with no per-request Astro.url to derive from.
// Rebranding this template (new workspace.toml slug/name) means editing
// only this file; nothing else in src/ may repeat these literals.
export const SITE = {
  // The origin this instance is actually served from (deploy-template.sh).
  // ONE's own: open.one.ie since 2026-11-12 (template.one.ie 301s to it).
  // NOT one.ie — that's the ONE platform, a different site: canonicals,
  // sitemap <loc>s, and JSON-LD @ids pointing there de-index this site.
  url: 'https://open.one.ie',
  name: 'ONE',
  description: 'The open-source Astro starter that ships payments, AI, and plugins on day one.',
  // Your GitHub repo as owner/name. The front page shows its live star count
  // (lib/github-stars.ts); empty shows no count, so a fresh clone never shows
  // another project's stars. A deploy can set it without editing this file
  // through the SITE_REPO var (scripts/deploy-template.sh does, for ONE's own).
  repo: '',
}
