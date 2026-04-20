# /deploy

**Skills:** `/cloudflare` (Workers auth) · `/signal` (deploy:success / deploy:degraded)

Ship all four services to Cloudflare. Deterministic sandwich — W0 baseline, build, smoke, approval, parallel deploy, health.

> **Post-migration (2026-04-18):** Astro site runs on **CF Workers with Static Assets** (not Pages). Deploy command is `wrangler deploy`.
>
> **Environment model:**
> - **Dev (live):** `https://dev.one.ie` — deployed on every `main` push
> - **Production (planned):** `https://one.ie` — custom-domain cutover pending
> - **Gateway (live, stable):** `https://api.one.ie` — same URL in both envs
> - **Legacy idle:** `https://one-substrate.pages.dev` — paused Pages project, rollback only, **do not deploy**
>
> See `docs/TODO-cf-workers-migration.md` and `scripts/cf-cutover.ts` for cutover history.

## Modes

| Invocation | What |
|-----------|------|
| `/deploy` | Full pipeline — W0 + build + 4 services + health |
| `/deploy --skip-tests` | Skip W0 baseline (risky — use only when already verified) |
| `/deploy --dry-run` | Build + smoke only, no deploy |
| `/deploy --preview-only` | Build + preview Worker deploy (no CI-gated services) |
| `/deploy astro` | Astro Worker only (re-bundle after UI changes) |
| `/deploy workers` | Gateway + Sync + NanoClaw only (no Astro rebuild) |
| `/deploy gateway` | Gateway worker only |
| `/deploy sync` | Sync worker only |
| `/deploy nanoclaw` | NanoClaw edge agents only |

## The 8-Step Pipeline

```bash
bun run deploy          # full pipeline
bun run deploy -- --dry-run
bun run deploy -- --skip-tests
DEPLOY_CONFIRM=yes bun run deploy   # CI / non-interactive
```

**Step 1 — W0 Baseline**
```bash
bun run verify   # biome + tsc --noEmit + vitest run + audit:design
```
Record tests passed/total. Fix before proceeding — never deploy on red.

**Step 2 — Changes**
`git diff` summary. Flag large changesets.

**Step 3 — Build**
```bash
NODE_ENV=production astro build
```
Target: ~23s. Emits `dist/_worker.js/index.js` + static assets via `@astrojs/cloudflare@13`. Watch for bundle size warnings.

**Step 4 — Credentials**
`CLOUDFLARE_API_TOKEN` must be unset. Deploy uses `CLOUDFLARE_GLOBAL_API_KEY` only.
Scoped tokens lack permissions for workers + custom domains.

**Step 5 — Smoke**
Verify `dist/_worker.js/`, `gateway/wrangler.toml`, `workers/sync/wrangler.toml`, `nanoclaw/wrangler.toml`, root `wrangler.toml`.

**Step 6 — Approval**
`main` branch: prompts "yes". Other branches: auto-approved.
CI: `DEPLOY_CONFIRM=yes bun run deploy` (already set in `.github/workflows/deploy.yml`).

**Step 7 — Deploy (parallel workers + astro)**
Gateway + Sync + NanoClaw deploy in parallel (~16s). Astro Worker deploys after (~16s).

**Step 8 — Health**
```bash
curl https://api.one.ie/health                   # Gateway
curl https://dev.one.ie/api/health               # Astro Worker (primary)
curl https://one-sync.oneie.workers.dev/         # Sync
curl https://nanoclaw.oneie.workers.dev/health   # NanoClaw
```
3 retries with backoff. All 4 must return 200. Astro `/api/health` must report `units: 140` (or current count) — empty `units: 0` means the build didn't bake `PUBLIC_GATEWAY_URL` correctly.

---

## Bundle Size Rules (CF Workers Free Tier — ~10 MiB uncompressed)

The Astro Worker bundle must stay under the CF free-tier ceiling to deploy.
These rules are **LOCKED** — do not revert them. Apply identically to any
developer template we ship (`oneie init` Workers scaffold mirrors this shape).

### Rule 1 — `syntaxHighlight: false` in `astro.config.mjs`

```js
markdown: { syntaxHighlight: false }
```

Disables Shiki from Astro's markdown pipeline. Without this, Shiki pulls ~5.8 MiB of
language grammar files into the SSR worker on every build. **Do not re-enable.**

### Rule 2 — `ssr.external` for heavy packages

```js
ssr: {
  external: ["node:async_hooks", "@mysten/sui", "@mysten/bcs", "shiki", "@shikijs/core", "@shikijs/types"]
}
```

The CF adapter bundles everything by default. `ssr.external` creates a bare
`import { x } from 'pkg'` reference without inlining the package.

**Critical nuance:** `ssr.external` only works safely when the externalized package is
never executed on the server path. For `shiki`: `codeToHtml` is imported by `code-block.tsx`,
but all components that use `code-block.tsx` are `client:only` — so `codeToHtml` is never
called in the worker. The import statement exists in the bundle but is dead code.

If you add a new heavy dependency used only client-side, add it here.

### Rule 3 — Pure-shell pages use `client:only` + `prerender = true`

```astro
---
export const prerender = true
import { MyComponent } from "@/components/MyComponent"
---
<Layout title="...">
  <MyComponent client:only="react" />
</Layout>
```

`client:only="react"` — Astro renders an empty div on the server; the component never
runs in the worker. The React component tree (+ all its imports) stays out of the SSR bundle.

`export const prerender = true` — the page becomes a static asset generated once
at build time. The page's SSR handler collapses to a small stub. Zero worker cost
at runtime.

**Use this pattern for:** any page that has no server-side data dependencies
(no `Astro.locals`, no `Astro.request`, no DB queries in frontmatter).

Currently prerendered (verify with `grep -l "export const prerender = true" src/pages/*.astro`):
`404.astro`, `board.astro`, `build.astro`, `ceo.astro`, `chat.astro`, `chat-agents.astro`,
`chat-fast.astro`, `chat-routing.astro`, `in.astro`, `speed.astro`.

Pages that CANNOT be prerendered (need runtime session/auth):
`world.astro` (reads `Astro.locals.session`), `market.astro` (fetches capabilities).

### Rule 4 — `react-dom/server.edge` alias (production only)

```js
resolve: {
  alias: {
    ...(isDev ? {} : { "react-dom/server": "react-dom/server.edge" })
  }
}
```

Already in `astro.config.mjs`. Required for CF Edge runtime compatibility.
Do not remove for production builds.

---

## Verified Bundle Numbers

| Before migration | After migration | What changed |
|------------------|-----------------|-------------|
| 21 MiB Pages bundle | 9.5 MiB Worker bundle | All four rules applied |
| Shiki grammars in worker | External references only | `ssr.external` + `syntaxHighlight: false` |
| `build/ceo/chat` in SSR handler | Static asset stubs | `prerender = true` |
| Pages deploy: FAILED | Worker deploy: ✓ ~16s | Under CF free-tier threshold |

---

## Service Map (post-migration)

| Service | URL | Config | Deploy command |
|---------|-----|--------|---------------|
| Astro Worker (dev) | `dev.one.ie` → `one-substrate` | `wrangler.toml` (root) | `wrangler deploy` |
| Astro Worker (prod, planned) | `one.ie` → `one-substrate` (or `[env.production]` variant) | `wrangler.toml` (root, future `[env.production]` section) | `wrangler deploy --env production` (when provisioned) |
| Gateway | `api.one.ie` → `one-gateway` | `gateway/wrangler.toml` | `cd gateway && wrangler deploy` |
| Sync | `one-sync.oneie.workers.dev` | `workers/sync/wrangler.toml` | `cd workers/sync && wrangler deploy` |
| NanoClaw | `nanoclaw.oneie.workers.dev` | `nanoclaw/wrangler.toml` | `cd nanoclaw && wrangler deploy` |
| Pages (legacy idle) | `one-substrate.pages.dev` | — | **do not deploy** — kept as rollback window |

---

## Auth (CRITICAL — never change)

Always: `CLOUDFLARE_GLOBAL_API_KEY` + `CLOUDFLARE_EMAIL`.
Never: `CLOUDFLARE_API_TOKEN` (scoped token lacks workers + custom domain permissions).

The deploy script auto-unsets `CLOUDFLARE_API_TOKEN` from the spawned env to prevent
accidental use of a scoped token that was exported in the shell.

CI secrets required in `.github/workflows/deploy.yml` env block:
- `CLOUDFLARE_API_KEY` (mapped from `secrets.CLOUDFLARE_GLOBAL_API_KEY`)
- `CLOUDFLARE_EMAIL`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN: ''` (explicit blank)
- `DEPLOY_CONFIRM: 'yes'`
- `PUBLIC_GATEWAY_URL: https://api.one.ie` (build-time-inlined by Astro — **required**; without this the Worker bundle falls back to `one-gateway.oneie.workers.dev` and `/api/health` returns `units: 0`)

---

## Steps

### `/deploy` (full pipeline)

1. `bun run verify` — W0 gate. Fail here means don't deploy.
2. `git diff` summary — surface scope to user.
3. `NODE_ENV=production bun run build` — Astro production build.
4. Verify credentials: assert `CLOUDFLARE_GLOBAL_API_KEY` present, unset `CLOUDFLARE_API_TOKEN`.
5. Smoke check: assert `dist/_worker.js/` exists, all 4 wrangler configs present.
6. Approval gate: prompt on `main`, auto on other branches.
7. Parallel deploy: Gateway + Sync + NanoClaw concurrently, then Astro Worker.
8. Health checks: all 4 endpoints × 3 retries with backoff.
9. Report:
   ```
   Branch:   main
   Tests:    320/320 pass
   Build:    23.2s
   Workers:  parallel 16.7s (vs ~42s sequential)
   Astro:    16.1s
   Health:   4/4 (Gateway 308ms, Astro 666ms, Sync 287ms, NanoClaw 287ms)
   Preview:  https://<hash>.one-substrate.<account>.workers.dev
   Total:    ~65s
   ```

### `/deploy astro`

1. `NODE_ENV=production bun run build`
2. Check bundle size: `du -sh dist/_worker.js/`
3. If > 12 MiB: check which chunk grew (`ls -lhS dist/_worker.js/chunks/ | head -15`)
4. `wrangler deploy` (from repo root)
5. Health: `curl -sL https://dev.one.ie/api/health | jq '.world.units'` (expect 140+)

### `/deploy workers`

```bash
cd gateway && bun wrangler deploy && cd ../workers/sync && bun wrangler deploy && cd ../../nanoclaw && bun wrangler deploy && cd ..
```

Report: version hash per worker, health latency per service.

### Cutover tool (`scripts/cf-cutover.ts`)

For Pages→Workers custom-domain flips on other services (script is parameterized):

```bash
bun run cf-cutover                # dry-run, safe
bun run cf-cutover --execute      # real cutover: Workers route + Pages detach + health verify + substrate signal
```

Defaults: domain=`dev.one.ie`, worker=`one-substrate`, pages=`one-substrate`. Override via `CF_CUTOVER_DOMAIN`, `CF_CUTOVER_WORKER`, `CF_CUTOVER_PAGES_PROJECT` env vars.

---

## Bundle Size Diagnosis

If build fails with "exceeds size limit":

```bash
# Check total worker size
du -sh dist/_worker.js/

# Find top offenders
ls -lhS dist/_worker.js/chunks/ | head -20

# Check if a new import pulled in Shiki
grep -r "from 'shiki'" dist/_worker.js/chunks/ | wc -l
# If > 0: a component that imports shiki was SSR'd
# Fix: make its page client:only="react" + prerender=true

# Check if React crept back into worker via client:load
grep -l "react-vendor" dist/_worker.js/chunks/
# If multiple chunks: some page SSR-renders React via client:load
# Fix: audit src/pages/*.astro for client:load on pure-shell pages
```

---

## Rollback

```bash
# Workers — rollback to previous version
bun wrangler rollback --name one-substrate

# Legacy Pages fallback (still live at one-substrate.pages.dev for rollback window):
bun wrangler pages deployment list --project-name=one-substrate
bun wrangler pages deployments rollback --project-name=one-substrate

# Revert a Worker via git
cd gateway && git stash && bun wrangler deploy
```

---

## Known-Flaky Test Allowlist

Located in `scripts/deploy.ts`:

```typescript
const KNOWN_FLAKY = [
  'Act 15: Speed Benchmarks',  // hardware-dependent
  'STAN distribution',          // stochastic
  'explorer mode',              // stochastic
]
```

These failures don't block deploy. Real failures (type errors, broken logic)
always block. Use `--strict` to require full green.

---

## First-Time Setup

Only needed once — see `docs/deploy.md` for full walkthrough:

```bash
# Create CF resources
bun wrangler d1 create one
bun wrangler kv namespace create KV
# → Paste IDs into wrangler.toml + workers/sync/wrangler.toml

# Run D1 migration
bun wrangler d1 execute one --remote --file=migrations/0001_init.sql

# Gateway secrets (TypeDB credentials)
cd gateway
printf 'admin' | bun wrangler secret put TYPEDB_USERNAME
printf 'YOUR-PASSWORD' | bun wrangler secret put TYPEDB_PASSWORD
cd ..

# First deploy — Worker auto-provisions on first `wrangler deploy`
bun run deploy
```

---

## Logs

- `.deploy.log` — all deployment output, each worker appends here
- `.deploy-build.log` — W0 baseline diagnostics (biome + tsc + vitest separate)

Live logs:

```bash
bun wrangler tail --name one-substrate       # Astro Worker
cd gateway && bun wrangler tail && cd ..     # Gateway
bun wrangler deployments list --name one-substrate | head -10
```

---

## Gotchas

- TypeDB Cloud port is **1729** (not 80 or 443)
- TypeDB HTTP API prefix is `/v1/` (signin, query, databases)
- Always `CLOUDFLARE_GLOBAL_API_KEY` — scoped tokens lack permissions for workers + custom domains
- `import.meta.env` is build-time — `PUBLIC_GATEWAY_URL` is baked into the worker bundle at build. Missing → `/api/health` returns `units: 0`
- Custom domains: `[[routes]]` double bracket, no wildcards, add `workers_dev = true`
- Worker bundle limit: ~10 MiB uncompressed (free tier). Astro worker is at 9.5 MiB — follow the 4 Bundle Size Rules above

---

*Deploy is the closed loop. W0 baseline in, health check out. If health fails, mark() is blocked. Determinism: every step reports numbers, every number gets marked.*
