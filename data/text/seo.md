---
title: Technical SEO Playbook — business node (ONE template)
audience: Tony (one.ie / Vespio template optimisation)
source: OO field manual — distilled from 10+ live client Astro builds, cutovers, and recovery work — merged with the repo-specific implementation plan for this template
date: 2026-07-10
version: 3.1
status: shareable (client data scrubbed) · §0 is execution-ready — parallel work packages with exclusive file ownership
---

# Technical SEO Playbook — business node

Everything in sections 1–11 and the appendix is scar tissue from real builds, not theory — the OO field manual, distilled from 10+ live client Astro builds, cutovers, and recovery work, including one recovery where a migration shipped with redirects drafted but never deployed and the client lost more than half their inbound call volume for 3 weeks before anyone noticed. Technical SEO failures are silent. **The point of this doc: a template with perfect technical SEO baked in, so every site instance forked from this repo starts perfect by default.**

Section 0 is repo-specific and execution-ready: it maps the playbook's plumbing requirements (§1) onto this actual codebase, names the mechanism — [`@jdevalk/astro-seo-graph`](https://github.com/jdevalk/seo-graph/tree/main/packages/astro-seo-graph) — that implements most of them, and breaks the work into packages (WP-0…WP-8) designed to be dispatched to multiple agents in parallel: exclusive file ownership per package, frozen interface contracts so no package waits on another's implementation, and per-package acceptance criteria phrased as runnable checks. Every other section is the general standard the packages implement; wherever it intersects something concrete in this repo, a **Repo:** note says so. Sections 1–11 are the spec agents cite; §0 is the dispatch sheet.

---

## 0. Execution plan — current state, shared contracts, parallel work packages

**Current state (verified 2026-07-10):**

| Surface | Status |
| --- | --- |
| `site/src/layouts/Layout.astro` | Hand-rolled canonical + OG + Twitter meta, per-page props. No JSON-LD. No `<h1>` validation. |
| `site/public/robots.txt` | `Allow: /` only — no sitemap directive, no agent-specific rules (good: nothing is blocking AI crawlers today, see §1 and §9) |
| Sitemap | None |
| `llms.txt` | None |
| Structured data | None |
| Content collections | `blog` (`@oneie/plugin-blog`), `docs` (`@oneie/plugin-docs`) — both `injectRoutes: false`, wrapped in this site's own `Layout.astro` via `src/pages/blog/*` and `src/pages/docs/*` |
| Rendering mode | `output: 'server'` on `@astrojs/cloudflare` — SSR, not static. This matters everywhere the playbook or a package assumes a static build: a static `_redirects` file may not apply at all on this deploy shape (§1, §9), and markdown-alternate serving needs the SSR content-negotiation path, not the SSG one (§6) |
| Workspace identity | `workspace.toml` — `slug`, `name` swap per business when this template is forked. Nothing in this plan or the site config may hardcode `one.ie` or `slug = "template"` as a literal — read from `workspace.toml` / `one.config.ts` so a rebrand doesn't leave stale SEO metadata pointing at the wrong entity |

**Implementation core: `@jdevalk/astro-seo-graph`.** It treats structured data as a knowledge graph (schema.org JSON-LD `@graph`), not a checklist of meta tags — and it ships the AI-crawler-facing primitives (`llms.txt`, markdown alternates, sitemap, API catalog) as first-class outputs of the same build step that produces the human-facing HTML. One integration satisfies most of §1's plumbing table at once. We do not hand-roll `<Seo>` components, sitemaps, or `llms.txt` — the package owns that surface; this plan owns what we point it at.

### Verified against the installed package (2026-07-10) — read before dispatching

`@jdevalk/astro-seo-graph@2.2.0` + `@jdevalk/seo-graph-core@0.7.0` are installed in `site/`. Two findings correct assumptions made earlier in this plan; every agent must treat these as fact, not the narrative prose elsewhere in this doc, if the two ever disagree:

1. **The integration's default export lives at a subpath, not the package root.** `import seoGraph from '@jdevalk/astro-seo-graph/integration'` — the bare `'@jdevalk/astro-seo-graph'` import only exports the non-integration helpers (`createSchemaEndpoint`, `createSchemaMap`, `createApiCatalog`, `seoSchema`, `imageSchema`, `gitLastmod`, `breadcrumbsFromUrl`, `buildSeoContext`, etc.) — those import from the root as shown in their own JSDoc examples.
2. **`validateH1` / `validateUniqueMetadata` / `validateImageAlt` / `validateInternalLinks` only scan prerendered HTML on disk at build time.** Direct quote from the type: *"Only static pages are checked (SSR pages are not present on disk at build time)."* This site's `astro.config.mjs` sets `output: 'server'` with no page currently opting into `export const prerender = true` (verified — grepped every candidate page, none set it). **As configured today, all four validators run and pass with zero warnings, not because the site is clean, but because there is nothing on disk for them to scan.** That is exactly the silent-failure shape §9 warns about — a build-time check everyone assumes is protecting them and isn't. The fix is narrower than it first looks, split by file ownership:
   - `blog/index.astro`, `docs/index.astro` take no route params and read nothing request-scoped — flipping `export const prerender = true` is a safe one-line addition. **WP-0 does these two.**
   - **`index.astro` must stay SSR — do not prerender it.** Verified by reading the page: it calls `getEnv()` (`src/lib/cf-env.ts`), which imports the `cloudflare:workers` module to read live Worker bindings (`STRIPE_PUBLIC_KEY` et al.) and gates the homepage's payment demo (`stripeLive`) on whether they're present. `cloudflare:workers` only resolves inside a deployed Worker at request time — at `astro build` time (a Node process, not a Worker) the import throws, is caught, and returns `{}`. Prerendering would bake `stripeLive: false` into the static HTML permanently, silently killing the live demo for every visitor — exactly the class of bug §9 warns about, just inverted (empty env baked in by prerendering, not a missing env var). The homepage therefore has **no build-time H1/metadata/alt-text validation** for now — a real, documented gap, not a silent one. A future fix would hoist the `<Seo>`-relevant static markup out from under the env-gated payment section (e.g. a client island for just that widget) so the rest of the page can prerender; that's a genuine refactor, out of scope for this pass.
   - `blog/[slug].astro`, `docs/[slug].astro` are dynamic routes — a dynamic route can't just flip the flag; Astro requires `export async function getStaticPaths()` enumerating every slug at build time before it can prerender, which also changes the current "entry not found → `Astro.redirect('/blog')`" runtime logic (enumerated paths won't miss; only a genuinely bad URL would, and that becomes a real 404 rather than a redirect). Neither reads request-scoped env, so both are safe to prerender once `getStaticPaths()` exists. This touches the same content-collection logic WP-3 already owns, so **WP-3 does these two**, folded into its per-page-schema work rather than split out separately.
   Pages with dynamic auth/session state (`signin`, `signup`, `wallet`, `payments`) stay SSR and are exempt from build-time validation — apply §2's per-page rules to those manually.
3. **`gitLastmod(filePath, options)` is synchronous and shells out to a local `git` binary against a real filesystem path.** It cannot run inside a deployed Cloudflare Worker (no git, often no full filesystem) — it only works where the checkout and git binary both exist: at `astro build` time (a build script, an Astro `astro:build:setup`/loader hook, or a content-collection transform that runs during the Node build step), never inside an SSR request handler. WP-3 must compute `dateModified` values at build time and bake them into what the SSR route reads (frontmatter-adjacent data or a generated lookup), not call `gitLastmod` per-request.

Every agent below is also told to read `site/node_modules/@jdevalk/astro-seo-graph/AGENTS.md` (written for AI coding agents specifically) and the relevant `.d.ts` files under `site/node_modules/@jdevalk/astro-seo-graph/dist/` before writing code — treat those as the source of truth over any code snippet in this document.

### Shared contracts (every agent reads this before starting)

Three contracts let the Phase-1 packages run in parallel without coordinating mid-flight:

1. **Site identity module.** WP-0 creates `site/src/lib/seo-site.ts` exporting `SITE = { url, name, description }`, derived from `one.config.ts` / `workspace.toml` values. This is the only place the production origin is defined — every other package imports it; no package writes `one.ie` or `template` as a literal anywhere else.
2. **Layout Props contract (frozen), mirroring `SeoProps` exactly.** WP-1 extends `Layout.astro`'s existing `Props` — all current props unchanged, so no existing call site breaks — with exactly two optional additions, typed identically to the package's own `SeoProps` fields so no adapter layer is needed: `graph?: Record<string, unknown> | null` (the assembled JSON-LD `@graph`, typically the output of `assembleGraph()`/piece builders from `@jdevalk/seo-graph-core`, passed straight through to `<Seo>`'s `graph` prop) and `noindex?: boolean` (passed straight through to `<Seo>`'s `noindex` prop — emits robots noindex and omits canonical per Google guidance). WP-3 codes against this signature immediately, without waiting for WP-1's implementation to land.
3. **File ownership is exclusive.** A package edits only the files it owns (matrix below). If an agent cannot meet its acceptance criteria without touching a foreign file, it stops and reports the conflict — that's a bug in this plan to fix here, not scope to grab in a branch.

| Package | Owns (exclusive) |
|---|---|
| WP-0 | `site/package.json`, `site/bun.lock`, `site/astro.config.mjs`, `site/src/lib/seo-site.ts` (new) |
| WP-1 | `site/src/layouts/Layout.astro`, `site/src/lib/seo-graph.ts` (new) |
| WP-2 | `site/src/pages/sitemap.xml.ts`, `site/src/pages/schema-map.xml.ts`, `site/src/pages/schema.json.ts`, `site/src/pages/.well-known/api-catalog.ts` (all new) |
| WP-3 | `site/src/pages/blog/*.astro`, `site/src/pages/docs/*.astro`, plus whatever collection-config file its plugin investigation identifies |
| WP-4 | `site/scripts/seo-gate.sh` (new) |
| WP-5 | `site/scripts/seo-drift.sh`, `site/scripts/seo-snapshots/` (new) |
| WP-6 | `site/public/robots.txt` |
| WP-8 | Phase 1: spike report only, no code · Phase 2: markdown routes for blog/docs, coordinated with WP-3's owner |

### Phase 0 — foundation (serial; must merge before Phase 1 dispatch)

**WP-0 — install, wire integration, create the identity module.**

```bash
cd site
bun add @jdevalk/astro-seo-graph @jdevalk/seo-graph-core
```

Wire in `site/astro.config.mjs`, alongside `react()` and `oneIntegration`:

```ts
import seoGraph from '@jdevalk/astro-seo-graph/integration' // subpath import — verified, see above

integrations: [
  react(),
  oneIntegration,
  seoGraph({
    validateH1: true,
    validateUniqueMetadata: true,
    validateImageAlt: true,
    validateMetadataLength: true, // title 30–65, description 70–200 (package defaults)
    validateInternalLinks: true,
    llmsTxt: {
      title: SITE.name, // from seo-site.ts (contract 1) — never a literal here
      siteUrl: SITE.url,
      summary: SITE.description,
    },
    // indexNow: off until the rollout order below reaches it — needs a key file + verified prod deploy first
  }),
],
```

Build-time validation runs on every `astro build` — but only against prerendered output (finding 2 above). Two things WP-0 must do, not just the integration wiring:

1. Add `export const prerender = true` to `blog/index.astro` and `docs/index.astro` only. **Not `index.astro`** — it depends on live Cloudflare Worker env bindings for its payment demo (see finding 2); prerendering it would silently and permanently disable that feature. (The `[slug].astro` routes need `getStaticPaths()` first — that's WP-3's job, folded into its content-collection work, not WP-0's.)
2. Create `site/src/lib/seo-site.ts` (contract 1) so the `SITE.url`/`SITE.name`/`SITE.description` values above are read from one place, not repeated as literals.

**WP-0 acceptance:**
- `bun run build` completes, and the build output actually contains prerendered HTML files for `blog/index.astro` and `docs/index.astro` (confirm in `dist/` — this is the check that the prerender flags took effect, not just that the build succeeded). Confirm `index.astro` did **not** get prerendered and still renders live Stripe-key-dependent content correctly in `astro preview`.
- Deliberately break one thing per validator in a scratch copy of a prerendered page (two `<h1>`s, an `<img>` with no `alt`) and confirm the build emits a warning naming it, then revert — proves the validators are actually scanning something, not silently passing on an empty file set. (Full coverage — including the homepage and blog/docs detail pages — needs the future homepage refactor noted above and WP-3's `getStaticPaths()` work respectively; note both gaps in the report rather than blocking on them.)
- The build emits `llms.txt` (check where the package places it under `output: 'server'` and record the location in the report — SSR output may differ from the static-mode docs).
- The production origin appears exactly once in `src/`: inside `seo-site.ts`.

### Phase 1 — parallel (dispatch all simultaneously once WP-0 merges; WP-4/WP-5/WP-8a have no dependency and can dispatch alongside WP-0)

**WP-1 — `<Seo>` swap + site-wide graph.** Replace `Layout.astro`'s hand-rolled canonical/OG/Twitter block with the package's `<Seo>` component; leave the theme/anti-FOUC scripts and everything outside the meta block untouched. Implement contract 2 (`schema`, `noindex` props). Emit `Organization` + `WebSite` + per-page `WebPage` nodes from `seo-graph.ts`, identity values imported from `seo-site.ts`.
*Acceptance:* build passes; the rendered `<head>` of `/` contains one `application/ld+json` block whose JSON parses and whose `@graph` includes `Organization`, `WebSite`, `WebPage` with `@id` cross-references that resolve (§3); OG/Twitter output for `/`, one blog post, and one docs page is equivalent to before the swap except for additions — diff the rendered heads, attach the diff to the report.

**WP-2 — discovery endpoints.** Four new SSR endpoints (this site is `output: 'server'` — endpoints, not static files). **Correction verified against the installed package: `createSchemaMap` is not a page sitemap** — its own docstring says it "serves a sitemap-style XML listing of the site's schema.org endpoints", i.e. a handful of URLs like `/schema.json` for AI-agent discovery of the JSON-LD graph, not every page on the site. That means this package produces two *different* artifacts, both needed, neither substituting for the other:
   1. **`/sitemap.xml`** — the classic SEO sitemap §1 and §10 require (only 200-status, canonical, indexable URLs; `lastmod` included; no `priority`/`changefreq`) — this package has no ready-made builder for it, so hand-build it as a plain Astro API route: enumerate the site's real indexable routes and emit standard `<urlset>` XML. This is the one Search Console needs.
   2. **`/schema-map.xml`** via `createSchemaMap` — lists the schema.org JSON endpoint(s) from point 3 below, for AI-agent discovery of the knowledge graph. Cosmetically similar output format, entirely different purpose and audience.
   3. **`createSchemaEndpoint`** — the corpus-wide JSON-LD `@graph` across blog + docs, the single URL an agent hits instead of crawling page-by-page. Feeds the `entries` list `/schema-map.xml` (point 2) points at.
   4. **`createApiCatalog`** at `/.well-known/api-catalog` (RFC 9727, `application/linkset+json`) listing the schema endpoint, the schema map, plus the ONE surfaces this site fronts (`api.one.ie`, per the root `CLAUDE.md` four-surface table — this is where a crawling agent discovers that one.ie is one of four coordinated surfaces, not an island).
   Every endpoint must return 500 rather than an empty 200 payload — §9's "200-but-empty sitemap" killer, made structurally impossible rather than merely checked for. Does NOT touch `robots.txt` (that's WP-6, post-deploy).
*Acceptance:* against `astro preview`, all four routes curl to 200 with the correct content-type; `/sitemap.xml` URL count > 0 and matches the indexable route count the agent enumerates from `src/pages/`; `/schema-map.xml` and `/.well-known/api-catalog` correctly reference the `/schema.json`-style endpoint from point 3, not each other.

**WP-3 — content collections + per-page schema.** Step one is an investigation gate: verify `@oneie/plugin-blog` / `@oneie/plugin-docs` expose a frontmatter-schema extension point; if they don't, stop and report — do not fork the plugins. Then: wrap frontmatter with the package's `seoSchema`/`imageSchema` Zod helpers (decorative images set `alt: ''` explicitly). For `dateModified`: `gitLastmod()` is synchronous and shells out to git against a real filesystem path — it must be called at `astro build` time (a content-collection loader/transform, or a small build script run before `astro build`), never inside the deployed SSR route, since the Cloudflare Worker runtime has no git binary or full checkout. Compute it once per entry at build time, fall back to frontmatter `publishDate` when it returns `null` (which it will for squashed or absorbed history — `merge-loop`-absorbed content's git life starts at the absorption commit, not the content's true origin, so frontmatter is the source of truth there), and bake the resolved date into whatever the page component reads. Pass `BlogPosting` (blog) / `TechArticle` (docs) + `BreadcrumbList` (via `breadcrumbsFromUrl`) nodes, assembled with `@jdevalk/seo-graph-core`'s piece builders, through the contract-2 `graph` prop from `blog/[slug].astro` / `docs/[slug].astro` (both already marked `prerender = true` by WP-0, so `dateModified` is resolvable at build time here).
*Acceptance:* build passes; a rendered blog post's head contains `BlogPosting` with `datePublished` and `dateModified`; a deliberately invalid frontmatter fixture (title > 65 chars) fails the build, then the fixture is removed; confirm no `gitLastmod` call is reachable from a non-prerendered (SSR) route.

**WP-4 — launch-gate script (independent — no WP-0 dependency).** `site/scripts/seo-gate.sh <base-url>`: §10 as executable checks. robots.txt has no `Disallow: /` and (post-WP-6) has a `Sitemap:` line; `curl -I` shows no `x-robots-tag: noindex`; `/` source has no robots-meta noindex; a garbage URL returns 404, not a soft-404 200; sitemap returns 200 AND contains > 0 URLs; the primary CSS asset returns 200 with `text/css` (§9's 200-but-broken-page — a status check on HTML alone cannot see this); JSON-LD on `/` fetches and parses; a fetch with a GPTBot user-agent returns 200, not 403 (CDN-level AI-bot block detection from outside). Non-zero exit on any failure; output shaped like the §10 checklist.
*Acceptance:* the script correctly *fails* against a deliberately broken target (point it at a URL known to soft-404) and passes its structural checks against `astro preview`.

**WP-5 — drift monitor (independent — no WP-0 dependency).** `site/scripts/seo-drift.sh` implementing §11: snapshot robots.txt, canonicals of key pages, JSON-LD validity, sitemap URL count, and per-money-page word count + section list into `seo-snapshots/`; subsequent runs diff against the snapshot and exit non-zero on regression. Any new `Disallow` in robots.txt is the loudest alarm — §11 calls the robots diff the single highest-value check on the list.
*Acceptance:* two consecutive runs against preview pass clean; hand-mutating a snapshot to simulate drift produces a non-zero exit that names the regressed check.

**WP-8a — markdown-alternates spike (research only, no code).** Determine whether the package's markdown alternates + `Accept: text/markdown` negotiation work under `output: 'server'` on the Cloudflare adapter — the documented Transform Rules recipe is static-only and must not be assumed to port. Deliverable: a written go/no-go naming the SSR mechanism (likely content negotiation inside the `[slug].astro` routes, which already have per-request server control), consumed by WP-8b in Phase 2.

### Phase 2 — gated tail (serial, after Phase 1 merges and a prod deploy is verified)

1. **WP-6 — `robots.txt` `Sitemap:` directive.** One-line change, only after WP-2's sitemap URL is verified live in prod. Same PR: run WP-4's gate against prod and attach the output.
2. **Human gates (not agent work):** Cloudflare dashboard "block AI bots" toggle (§9 — CDN-level, invisible to this repo; WP-4's GPTBot check verifies the outcome from outside); Search Console + Bing Webmaster verification and sitemap submission (§1).
3. **WP-7 — IndexNow. BLOCKED until `workspace.toml` no longer reads `slug = "template"`.** IndexNow is an effectively irreversible signal to search engines — don't announce URLs for an identity about to change. Key file at the site root, initial full submission, then incremental mode.
4. **WP-8b — markdown alternates** per the WP-8a verdict: `.md` responses for blog/docs with `X-Robots-Tag: noindex, follow` so they never compete with the HTML in search.

### Dispatch notes

- One agent per package, briefed with: this file, its WP entry, the shared contracts, and the playbook sections its acceptance criteria cite.
- File ownership is disjoint by construction, so worktree isolation is optional; use it anyway if WP-1 and WP-3 run simultaneously, since both build the same site and a broken intermediate state in one shouldn't block the other's `astro build`.
- Merge order within Phase 1 is free — contract 2 exists precisely so WP-3 never waits on WP-1. If WP-1 shipped a different Props signature than the contract, that's a WP-1 acceptance failure, not a WP-3 rebase problem.
- After Phase 1 merges: a single verification agent runs `bun run build`, starts `astro preview`, executes `scripts/seo-gate.sh` against it, and reports against the §10 checklist. Green means verified on the running URL, not "the code is in the repo".

**Don't:** reimplement anything the package already does (canonical logic, OG/Twitter fallback, hreflang normalization, `x-default`) — extend its config, don't fork its behavior.

---

## 1. What the template must ship with (the plumbing)

Every site instance should get these for free. If a human has to remember them per-site, they will eventually be forgotten.

| Item | Standard | Why |
|---|---|---|
| `robots.txt` | Allow all by default, sitemap line included. Staging variants must be impossible to ship (see section 9) | One stray `Disallow: /` de-indexes the whole site |
| Sitemap | Auto-generated from routes. Only 200-status, canonical, indexable URLs. Under 50,000 URLs and 50MB. Include `lastmod`; skip `priority` and `changefreq` (Google ignores both, they just mark the sitemap as hand-rolled) | Google trusts a clean sitemap; junk URLs in it poison crawl priority |
| Canonical | Self-referencing canonical on every page, derived from a single `site:` config value. Never hardcode the domain in pages | One config value = zero drift. Wrong canonical is worse than missing |
| Custom 404 | A real `404.astro` / `404.html` that returns HTTP 404 | Without it, some hosts (CF Pages included) serve the homepage with a 200 for every broken URL. Google indexes infinite soft-404 junk and your "all pages return 200" QA passes falsely |
| HTTPS | Valid cert, every HTTP URL 301s to HTTPS, zero mixed-content warnings | Table stakes for ranking and browser trust; mixed content silently breaks pages |
| Meta defaults | Title + description as required props on the base layout, with template-level fallback and a length lint (title under 60 chars, description under 160) | Missing meta is the most common template-instance bug |
| OG / social | `og:title`, `og:description`, `og:image` (real image, not a gradient), `twitter:card` in the base layout | Free CTR on every share |
| Schema slots | JSON-LD injected per page type from structured data, not pasted into content (section 3) | Schema drift and invalid JSON kill rich results silently |
| `llms.txt` | A stub at minimum: what the business is, key pages, NAP (name, address, phone) | The robots.txt of AI crawlers. Cheap now, valuable as agents browse more |
| Redirects mechanism | One documented place (e.g. `_redirects` OR middleware, pick one primary). Know the precedence if both exist, and know your deploy model: on an SSR/Worker deploy a static `_redirects` file may not apply at all | Two redirect systems that can shadow each other is a debugging tarpit (section 9) |
| AI crawler access | Do not block GPTBot / ClaudeBot / PerplexityBot by default. Check CDN-level settings too, not just robots.txt | CDNs now ship "block AI bots" toggles that default on. For any business that wants AI visibility, that is a wall against being cited |
| Trailing-slash + www policy | Pick one form, 301 the other, everywhere, from day one | Every URL that resolves at 2+ addresses splits its own equity |
| Tracking hooks | Slots for Search Console verification, analytics ID, and Bing Webmaster, wired before any content ships | Data from day 1. You cannot recover the crawl and query data you never collected |
| Privacy policy | A privacy page linked in the footer of every instance | Google Ads and most form/consent regimes require it; its absence blocks ad accounts later |

**Repo:** `Sitemap`, `Schema slots`, `llms.txt`, and the AI-agent-facing pieces of `Redirects mechanism` (none needed today) are covered by `astro-seo-graph` per §0. `Custom 404` already exists (`site/src/pages/404.astro`). `Redirects mechanism`: this deploy is `output: 'server'` on Cloudflare Workers, not static Pages — verify whether a `_redirects` file is even honored before relying on it; middleware is the safer default here. `AI crawler access`: `robots.txt` is currently bare `Allow: /`, which already permits AI crawlers — the remaining check is Cloudflare's own dashboard "block AI bots" toggle (a CDN-level setting, invisible to `robots.txt`), not a code change.

---

## 2. Per-page anatomy (the on-page rules)

The rules we enforce on every money page:

- **URL:** lowercase, hyphens (never underscores), 2 directory levels deep maximum, keyword in the slug. `/services/roof-repair`, not `/our-services/what-we-do/roofRepair`.
- **Title:** primary keyword FRONT-LOADED, 30-65 characters (too short wastes the strongest slot; too long truncates), written for click-through not stuffing. Truncation is actually pixel-based, not character-based, so front-loading is the real rule: the keyword must survive any cutoff. Google also rewrites titles it dislikes using your H1 + schema + content, so keep all three agreeing. If the layout auto-appends a brand suffix, cap the editable part around 60. On any rebuild, restore the title that was already ranking before writing a "better" one. Refresh beats reinvent.
- **Meta description:** 70-160 characters, contains the keyword, written as the SERP ad it actually is.
- **Unique titles and descriptions across the site.** Two pages sharing a title is a cannibalisation signal. Fix systematic duplication at the template source, not page by page.
- **One H1 per page**, keyword in it. H2s carry the secondary/related terms. Heading hierarchy must be semantic (no skipping levels for styling reasons - style with CSS, structure with HTML).
- **Keyword in the first paragraph.** The opening 2-3 sentences should directly answer the page's query in plain language before any preamble. This one habit serves classic SEO and AI citation at once (section 6).
- **Content as designed blocks, never prose walls.** Any section over ~3 sentences of running prose becomes a block: stat band, checklist grid, comparison table, numbered steps, FAQ accordion. Blocks are easier for users to scan, easier for Google to feature, and easier for AI engines to lift as answers. Prose is connective tissue only.
- **Images:** descriptive filenames and alt text, one meaningful image per couple of content sections, real photos not gradients or obvious stock.
- **Headings with lived experience.** "The 3 leak points we find on most local roofs" beats "Common Roof Problems". First-person proof-of-work phrasing ("we see", "from actual jobs") is cheap E-E-A-T (experience, expertise, authoritativeness, trust) that generic templates cannot fake.
- **Word count is a tripwire, not a target.** The real target is section/entity coverage versus the pages that currently rank top 3 for the query. Measure the competition, then match or beat the coverage. Never pad: keyword density and forced length are now deranking factors, not ranking factors.
- **Keep pages monotopic.** One page, one topic, tightly themed. Padding a page with off-topic sections to hit a length target dilutes its relevance for the topic it should own.
- **Answer the "People Also Ask" questions for the page's query.** Google has already declared those questions topically related. Use them as H2s or FAQ items, each answer under ~60 words directly below the question heading - that is the featured-snippet shape and the AI-citation shape at once.

**Repo:** `Title`/`description` length is enforced at build time once `validateMetadataLength` is on (WP-0). `H1` validation likewise via `validateH1`. `Unique titles/descriptions` via `validateUniqueMetadata`.

---

## 3. Schema (structured data)

- **Per-page-type schema, not blanket schema.** Each page type declares its types: LocalBusiness/Organization (home + footer-level), Service, FAQPage, BreadcrumbList, Review/AggregateRating where legitimate. Blanket schema surfaces thin pages and can cannibalise your own rich results.
- **Use the most specific subtype, not generic LocalBusiness.** `MovingCompany`, `RoofingContractor`, `Dentist`, `Attorney`, `HomeAndConstructionBusiness`. Fall back to `LocalBusiness` only when nothing closer exists. For product/B2B-supplier instances, that means `Product` + `Offer` schema and spec tables, not a local-service shape.
- **Wire the entity graph with `@id`.** Every cross-reference (`provider`, `worksFor`, `publisher`, `itemReviewed`) must resolve to an `@id` defined on the site (`#organization`, `#website`, `#localbusiness`). One LocalBusiness and one BreadcrumbList per page. Embed AggregateRating inside the business entity, not as a floating block. This is what makes the site read as one entity instead of scattered fragments.
- **Disambiguate the entity with `sameAs`.** Organization links out to the real profiles (Google Business Profile, LinkedIn, Facebook, Yelp). Add `hasMap` pointing at the Google Business Profile map URL. For service areas, `Place` with `sameAs` to Wikipedia/Wikidata where a real page exists.
- **Authors are entities too.** If content carries a byline, the `Person` schema needs `sameAs` to real external identity surfaces (LinkedIn, license registries, industry profiles) plus an on-site author page. A byline with no external identity graph is decoration.
- **FAQPage discipline:** 3-5 questions per page maximum, phrased the way people actually ask ("How much does...", "How long does..."), answers factual not salesy.
- **Generate JSON-LD from data, render in the head.** Template slot, fed by structured fields. Never hand-edited per page.
- **Validate on every build or deploy.** Invalid JSON-LD fails silently: no error on the page, rich results just quietly disappear. A JSON parse + required-fields check in CI is cheap; spot-check page types with Google's Rich Results Test and validator.schema.org.
- **Never mark up claims that are not visibly true on the page.** False or inflated schema is a documented penalty vector. And keep the rating in schema identical to the rating shown on the page: a mismatch suppresses the review snippet.
- **NAP consistency is part of schema.** The exact same name, address, phone string everywhere: hero, footer, schema, contact page. We once found three different phone numbers across a site's header, footer, and schema. Drift erodes entity confidence for both Google and AI engines.

**Repo:** the JSON-LD `@graph` itself is emitted by `astro-seo-graph`'s `<Seo>` component (WP-1) — this template ships `Organization` + `WebSite` + per-page-type nodes as the baseline graph. `Organization`/`LocalBusiness` subtype, `sameAs` targets, and NAP strings are business-specific data that must flow through `seo-site.ts` from `workspace.toml`/`one.config.ts` (contract 1, §0), never hardcoded in a component, since every forked instance has different values.

---

## 4. Internal linking (the architecture, not an afterthought)

Links are part of the content blocks, never a bolted-on list at the bottom.

The graph for a service business:

```
Homepage (authority hub)
  ├── services grid  → service pages
  ├── areas chips    → location pages
Service ↔ Location    (bidirectional: "areas we serve" ↔ "services in <city>")
Location → nearby locations rail   (local cluster)
Blog / guides → link UP to the money pages they support
FAQ / About / Pricing → link INTO the silo (never dead-ends)
```

Hard rules:

| Rule | Why |
|---|---|
| Every money page reachable in 2 clicks or fewer from the homepage | Orphan pages neither rank nor get crawled promptly |
| Service to location links are bidirectional | Neither side of the matrix gets orphaned |
| New page ships with 3 contextual links out AND 3 links in from existing pages | A page nobody links to is invisible on day one |
| Anchors are descriptive, keyword-relevant, and varied | Mix exact, partial, and synonym anchors, never "click here", never the same exact-match string every time |
| Density: roughly 1 internal link per 400-500 words | Enough to navigate and pass equity without diluting the page |
| **Never nofollow internal links** | Link equity is still divided across ALL links on the page; the nofollowed share simply evaporates. You only hurt yourself |
| Sculpt by removing, not by nofollowing | Cut low-value link volume (author archives, tag pages, widget/footer link farms) so equity concentrates on money pages. Pruning link bloat on one large restructure measurably improved index times |
| Never anchor a page's own primary keyword back at itself | The keyword is already in its title, H1, and content; an exact-match internal anchor on top is an over-optimisation trigger |
| In-content links outweigh navigation links | Contextual in-body links carry more weight than nav, which outweighs footer. Do not rely on the footer to power the graph |

Template implication: make the linking blocks (areas chips, related-services rail, nearby-locations rail, per-FAQ-answer links) first-class components fed by data, so the graph exists automatically for every instance. Crawl depth should match URL depth: a page 2 directories deep in the URL but 5 clicks from the homepage confuses crawlers about its importance.

**Repo:** `validateInternalLinks` (WP-0) catches trailing-slash mismatches and true 404s at build time — that's link *health*, not link *architecture*; the bidirectional service↔location graph above is still a component-design responsibility per instance, not something the package generates for you.

---

## 5. Site architecture and programmatic pages

- **3-level hierarchy:** Home, then Service Category, then Service + City. Deep enough for long-tail intent, shallow enough to crawl.
- **One URL per location.** Every geo-modified query worth ranking for ("service + city") gets its own dedicated page inside the silo.
- **Match the SERP's dominant URL pattern for local pages.** Nested `/locations/<city>` is the clean default, but in some local niches the pages that rank are root-level `/<city>-<keyword>`. Check what the top 3 actually use before locking the pattern.
- **If a page already ranks, do not restructure its URL.** The overwhelming majority of URL changes land you back where you were at best, and a meaningful minority break weirdly. Structure is for new builds; ranking URLs are left alone (or 301'd only when unavoidable).
- **Programmatic service-city pages have a quality floor.** This is where templates get sites penalised. Our gates: strip the shared template chrome and require the remaining body to be substantially unique per page (we fail below ~60% unique); every location page carries at least 2 real per-city differentiators (named neighbourhoods, landmarks, routes, local stats) and ideally a local image; only generate a page where search volume proves the query exists. One templated sentence swapped per city is doorway-page penalty bait that can tank the whole domain.
- **Prefer smaller, denser sites over sprawling thin ones.** Do not seed long-tail pages with no real volume: it bloats the index and wastes crawl budget. If an instance accumulates thin indexed-but-no-traffic pages, consolidate 10-20 of them into one strong page.
- **Prune ruthlessly.** When removing dead content, 410 (Gone) beats 301-ing everything to a hub: faster de-index, crawl budget back to money pages, and pruning thin content is a positive quality signal.
- **On any URL change, even one character: 301 the old URL to a topically matching page.** Never to the homepage when a closer parent exists.

---

## 6. The AI-citation layer (AEO/GEO)

The newest section and the one most templates ignore. AI engines (ChatGPT, Perplexity, Google AI Overviews) extract and quote text that directly answers a query, is factually unambiguous, and is structurally easy to lift. Six patterns, each mapping to a template block:

| # | Pattern | Renders as |
|---|---|---|
| 1 | Direct answer first: the query answered in 2-3 self-contained sentences at the top of the section | intro block, FAQ answers |
| 2 | Entity clarity: name, locations, services, NAP stated as extractable facts, zero inference required | hero, footer NAP, schema |
| 3 | Structured facts: hours, areas, price ranges, inclusions as lists and tables, never buried in prose | pricing table, checklist grid |
| 4 | Question then answer: real customer questions answered concisely, each answer readable out of context | FAQ accordion + FAQPage schema |
| 5 | Local specificity: routes, neighbourhoods, landmarks that prove genuine presence | local-detail cards |
| 6 | Self-consistency: identical NAP and entity facts on every page, mirrored in schema | site-wide |

Authoring rules: lead with the answer, make each FAQ answer self-contained (engines quote chunks, not pages - every section must stand alone out of context), state facts without marketing fog. A useful template shape is two zones per money page: a concise answer block up top for snippet/AI capture, designed-block depth below for the classic rankings. Give each money page one quotable proof block: a unique, specific factual claim ("2,400 residential moves since 2015, 4.9 stars across 380+ reviews" style) that engines can lift verbatim. Frame outcomes honestly: this increases the likelihood of citation, nobody can guarantee an AI ranking.

**Repo:** `llms.txt`, markdown alternates, and the corpus-wide `createSchemaEndpoint` graph (WP-0, WP-8, WP-2 respectively) are the machine-readable half of this layer — the six patterns above are the content-authoring half, and no package generates those for you.

---

## 7. Performance (Core Web Vitals)

Thresholds we treat as launch-blocking, measured on mobile via PageSpeed Insights:

| Metric | Pass | Fail |
|---|---|---|
| LCP (Largest Contentful Paint) | under 2.5s | over 2.5s blocks |
| CLS (Cumulative Layout Shift) | under 0.1 | over 0.1 blocks |
| INP (Interaction to Next Paint) | under 200ms | over 200ms blocks |

What actually moves these on template sites, in order of impact:

1. **Image weight.** The number one offender every time. Convert to WebP/AVIF, resize to display dimensions, `loading="lazy"` below the fold, `fetchpriority="high"` on the LCP hero only. We took one homepage from 17.9 MB to 3.3 MB and the perf score from 67 to ~90 with images alone.
2. **Static-first rendering.** Ship HTML, hydrate only what needs it (Astro islands model). No render-blocking JS for content.
3. **Font discipline.** Two families max, `font-display: swap`, preload the one used above the fold, subset if possible.
4. **CLS is a template bug, not a content bug.** Reserve space: explicit width/height on images and embeds, no late-injected banners above content.
5. **Third-party embeds are the CWV tax.** Review widgets, booking iframes, chat: lazy-load them on interaction or below the fold.

**Repo:** this template already inlines stylesheets (`build.inlineStylesheets: 'always'` in `astro.config.mjs`) and uses the Astro islands model via `@astrojs/react` — the remaining CWV risk per instance is almost entirely image weight and any third-party embed a business adds (chat widget, booking iframe).

---

## 8. Multi-language (only if instances serve more than one locale)

If the builder supports multiple languages, bake these in; retrofitting hreflang is miserable:

- **hreflang in BOTH the page `<head>` and the sitemap.** Sitemap-only satisfies Google but not every crawler. The two must agree.
- **Reciprocity:** every `/en/x` alternate must point back from `/ja/x`. One-way hreflang is ignored.
- **`x-default`** points to the global-default (or highest-traffic) locale.
- **Locale parity:** every URL should exist in every declared locale. Orphan-locale pages (present in one language, missing in another) are a structural bug worth a build check.
- **Translate intent, not tokens.** Per-locale keywords and competitors differ; a literal keyword swap targets queries nobody types.
- **Performance per locale:** bundle weights differ by language (CJK font payloads especially). Test CWV on each locale, not just the default.

**Repo:** not in use today (no i18n routing in `site/`) — `astro-seo-graph`'s hreflang normalization (BCP 47 tags, auto `x-default`, duplicate drop) is ready if/when an instance needs it.

---

## 9. The silent killers (template-instance catalogue)

Every one of these bit us on a real build. They share one property: nothing errors, the site looks fine, and rankings die quietly.

| Killer | Symptom | Defence |
|---|---|---|
| **Staging noindex guards not all removed at launch** | Site "live" but invisible to Google for weeks | Staging noindex often exists in MULTIPLE independent layers: a layout meta flag, an `X-Robots-Tag` header in middleware, and `robots.txt`. All must flip together. Post-launch verify all three: `curl <prod>/robots.txt` has no `Disallow: /`, `curl -I <prod>` has no `x-robots-tag: noindex`, page source has no robots meta noindex |
| **Soft 404s** | Every broken URL returns the homepage with HTTP 200 | Ship a real 404 page. Verify: `curl -so /dev/null -w "%{http_code}" <site>/definitely-not-a-page-xyz` must return 404 |
| **The 200-but-empty sitemap** | `/sitemap.xml` returns 200 with an empty `<urlset>`; naive "does it 200?" checks pass while Google is handed nothing | Assert the sitemap contains more than zero URLs, as a build gate. We shipped this once and caught it 6 days late |
| **The 200-but-broken page** | HTML serves 200 but the stylesheet is dead, so visitors get an unstyled serif page | After deploy, fetch the primary CSS/JS asset and confirm 200 + correct content-type, not just the HTML. A status-code check alone cannot see this |
| **Stats rendered by JavaScript only** | Count-up animation shows "0 happy customers" to crawlers and slow devices | Render real numbers as static HTML; animate on top if you must |
| **Placeholder IDs shipping** | Analytics silent since launch, no JS error | `__GA4_ID__`-style placeholders no-op cleanly. Grep for placeholder patterns as a build gate |
| **Build-time env vars silently empty** | Anti-spam widget never renders, form fail-closes for every visitor | Public keys resolved at BUILD time ship empty if the env var is missing, with no runtime error. Assert non-empty values in the built output |
| **Dead forms behind a success message** | Form shows "Thanks!" unconditionally, backend never received anything | Gate the success state on a real 2xx response. Then prove the pipeline with a live test submission received in an inbox before launch. Notifications must come from an authenticated sender (SPF + DKIM passing), never PHP `mail()` |
| **CDN "block AI bots" defaults** | Site invisible to ChatGPT/Perplexity despite clean robots.txt | Check CDN security toggles, not just robots.txt. Test from outside: fetch the homepage as an AI crawler user-agent and expect 200, not 403 |
| **Edge-cached redirects** | Redirect rule changed, old target still served | CDNs cache 301s by path. Verify changes with a cache-buster query (`?cb=1`) |

**Repo:** `CDN "block AI bots" defaults` is the one to check first here specifically — this deploy is Cloudflare Workers, and Cloudflare ships exactly this toggle in its dashboard, separate from anything in `site/`. `The 200-but-empty sitemap` is designed out at the source — WP-2's endpoints return 500 rather than an empty 200 — and belt-and-braces checked from outside by WP-4's gate and WP-5's drift monitor.

---

## 10. The launch gate (copy-paste checklist)

Run before any instance goes live. Green means verified on the live/preview URL, not "the code is in the repo".

```
INDEXABILITY
[ ] robots.txt: no Disallow:/, sitemap line present
[ ] No x-robots-tag: noindex header (curl -I)
[ ] No <meta name="robots" content="noindex"> in page source
[ ] Custom 404 returns HTTP 404 (curl a garbage URL)
[ ] AI crawlers not blocked (robots.txt + CDN settings)

CANONICAL + META
[ ] Every page self-canonical, correct domain (spot-check 5)
[ ] Titles unique, 30-65 chars; descriptions 70-160
[ ] One H1 per page, keyword present
[ ] OG image + title on key pages

SITEMAP
[ ] /sitemap.xml serves 200 AND contains the expected URL count
[ ] Only canonical, 200-status, indexable URLs inside
[ ] Submitted in Search Console

SCHEMA
[ ] JSON-LD parses on every page type (validator, not eyeball)
[ ] Every @id reference resolves; rating in schema matches the page
[ ] NAP identical across pages + schema

LINKS + ARCHITECTURE
[ ] No internal 4xx (crawl the build output)
[ ] Every money page within 2 clicks of home, no orphans
[ ] Location pages pass the uniqueness floor (real per-city content)

PERFORMANCE
[ ] PSI mobile: LCP < 2.5s, CLS < 0.1, INP < 200ms on home + top template
[ ] Hero image optimised + fetchpriority=high; below-fold lazy

FORMS + TRACKING
[ ] Live test submission sent and RECEIVED (inbox proof)
[ ] Anti-spam active and its widget actually renders
[ ] Attribution params captured (gclid, utm_*)
[ ] Analytics firing with the real ID (no placeholders)
[ ] Search Console + Bing Webmaster verified, sitemap submitted

CONTENT + AI LAYER
[ ] llms.txt present
[ ] Direct-answer intros + FAQ blocks on money pages
[ ] Privacy policy linked in footer

POST-LAUNCH (first week)
[ ] Request indexing on the money pages in Search Console
    (throughput is limited to roughly 10 URLs/day per property - batch accordingly)
[ ] Confirm pages moving from Discovered to Indexed in coverage
```

---

## 11. After launch: monitor for drift

Sites degrade silently: content edits break templates, hosts change things, toggles flip. A monthly automated check, diffed against the previous run so regressions surface immediately:

1. Core Web Vitals (trend matters: a 20-point drop is an alert even if still passing)
2. Internal links all 200
3. Redirect chains (anything over 1 hop)
4. robots.txt diffed against last known state (any new Disallow is a fire alarm)
5. Canonicals still self-referencing
6. Mobile/desktop content parity (mobile serving under ~60% of desktop word count = regression)
7. JSON-LD still valid
8. No noindex appearing on money pages
9. Content regression: snapshot each money page's word count + section list, fail loud if a future edit thins it below the snapshot

The robots.txt diff is the single highest-value check on the list. Cheap to run, and it catches the exact failure class that once cost a site 36 hours of zero traffic before anyone noticed.

---

## Appendix: replatforming an existing RANKING site

Different discipline from launching a fresh instance. Only relevant when a template instance replaces a live site that already ranks — not applicable to this repo today (fresh template, no live site to migrate), but load-bearing the day this template is used to rebuild an existing client site. The short version of what we learned the hard way:

- **Redirect parity:** every previously-ranking URL gets a GET-verified 301 to a like-for-like topical match, never the homepage. Verify with `curl -so /dev/null -w "%{http_code}|%{redirect_url}" <url>`; never `curl -I -L`, which follows the redirect to a 200 and reads as "no redirect".
- **Build the old-URL inventory from the old sitemap UNION the Wayback Machine CDX export.** The current sitemap misses indexed and backlinked URLs that were dropped from it over the years.
- **Reconcile against Search Console's Pages export (actual clicks), not just the sitemap.** The sitemap cannot see pages Google still sends traffic to. On one migration this caught 7 trafficked URLs (447 clicks) that would have 404'd, including one the plan had labelled "junk to drop".
- **Page parity:** a rebuild that folds hundreds of long-tail pages into a dozen hubs sheds the long-tail even with perfect redirects. The new page count is an output of the ranking data, not a design preference.
- **Tier the map:** like-for-like 301s for ranking URLs; prefix-family rules for patterned URLs; hub 301s for long-tail with no replacement; 410 for junk. Re-derive the map after the final page set is locked (a city that gets a dedicated page must move its redirect off the hub).
- **Redirects drafted is not redirects deployed.** The single most expensive failure we have seen: the 301 map existed in the repo, was marked done, and never shipped. Three weeks of ranking bleed. Verify on the live domain.
- **Sitemap handover is 3 steps:** submit the new sitemap path, remove the old platform's sitemap row in Search Console, confirm the new row reads Success with a sane page count. Check which path actually serves 200 first.
- **Preserve form attribution:** audit what the old site's forms carried (`gclid`, `utm_*`, hidden CRM fields) before replacing them. Paid attribution dies silently at DNS flip otherwise.
- **Preserve mail:** the DNS swap must not change MX/SPF/DKIM records. Query the new nameservers directly and diff against the old zone before flipping.
- **Monitor weekly for 4 weeks post-flip.** Recovery lags 2-8 weeks; a still-falling snapshot right after the flip is usually the pre-flip damage clearing, not fresh decay.

---

## Don't

- Don't hardcode `one.ie` or `slug = "template"` into anything that ships in `site/` config as a literal — read from `workspace.toml` / `one.config.ts` so a rebrand (`one setup` with a new slug) doesn't leave stale SEO metadata pointing at the wrong entity.
- Don't turn on IndexNow before a rebrand is verified live — it's a one-way signal to search engines.
- Don't reimplement anything `astro-seo-graph` already does (canonical logic, OG/Twitter fallback, hreflang normalization, `x-default`) — extend its config, don't fork its behavior.
- Don't assume the static-site markdown-alternate recipe ports unchanged to `output: 'server'` — that's exactly what the WP-8a spike exists to settle before any code is written.
- Don't let an agent touch a file outside its package's ownership row (§0 contract 3) — a package that needs a foreign file has found a plan bug; it reports, it doesn't grab scope.
- Don't treat a "code is in the repo" state as done — every checklist item in §10 means verified on the live/preview URL.

---

*Compiled from the OO field manual: 10+ production Astro builds, multiple WP-to-Astro cutovers on ranking sites, and the recovery work when things went wrong — merged with the `astro-seo-graph` implementation plan for this repo. Questions to Donal (playbook) or Tony (this repo's implementation).*
