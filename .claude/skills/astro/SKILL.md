---
name: astro
description: Build Astro 6 pages with React 19 islands + Cloudflare Workers runtime. Covers adapter v13, SSR vs prerender, cloudflare:workers env, bundle-size rules.
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Astro 6 on Cloudflare Workers

Server-rendered pages with strategic React islands, running on `@astrojs/cloudflare@13` + Workers with Static Assets (Pages-era is retired — see `docs/TODO-cf-workers-migration.md`).

## Stack

| Package | Version (2026-04-18) | Role |
|---|---|---|
| `astro` | `^6.1.7` | Framework |
| `@astrojs/cloudflare` | `^13.1.10` | Workers adapter (no longer supports Pages) |
| `@astrojs/react` | `^5.0.3` | React 19 islands |
| `@astrojs/node` | `^10.0.5` | **Dev-only** (standalone mode, avoids miniflare dev issues) |
| `wrangler` | `^4.83.0` | Workers CLI |

## Works With

| Skill      | Load when                                                                             |
|------------|---------------------------------------------------------------------------------------|
| `/react19` | React components inside islands — pick `client:load` / `client:visible` / `client:only`. |
| `/cloudflare` | `wrangler.toml`, `[assets]` binding, secrets, `wrangler tail`, Workers+Assets semantics. |
| `/deploy`  | 8-step `bun run deploy` pipeline — Astro build is step 3; bundle-size rules live here. |
| `/signal`  | `src/pages/api/*.ts` — every API route is the substrate's HTTP surface.                |
| `/shadcn`  | shadcn components live inside islands; dark-theme tokens + hydration strategy.         |
| `/sui`     | SSR pages reading on-chain data — use `client:only="react"` to keep worker under 10 MiB. |
| `/typedb`  | SSR data fetching — Astro pages call `readParsed()` from `src/lib/typedb.ts`.          |

Auto-loads on `*.astro`: `.claude/rules/astro.md`.

## Dual-Adapter Config (the ONE pattern)

`astro.config.mjs` swaps adapters at NODE_ENV time. Node standalone for dev (fast reload, no miniflare flakes), Cloudflare Workers for prod.

```js
// astro.config.mjs — the working shape
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const isDev = process.env.NODE_ENV !== "production";
const adapter = isDev
  ? node({ mode: "standalone" })
  : cloudflare({ platformProxy: { enabled: true } });

export default defineConfig({
  site: "https://one.ie",
  integrations: [react()],
  output: "server",        // all routes SSR unless prerender=true per-page
  adapter,
  markdown: {
    syntaxHighlight: false,  // LOCKED — saves ~5.8 MiB of Shiki from worker
  },
  vite: {
    ssr: {
      noExternal: ["recharts", "lucide-react"],
      external: [
        "node:async_hooks",
        "@mysten/sui", "@mysten/bcs",
        "shiki", "@shikijs/core", "@shikijs/types",
      ],
    },
    // ...tailwind, aliases, chunks
  },
});
```

**Why `platformProxy: { enabled: true }`**: proxies CF bindings (KV, D1, R2, secrets) into dev via `wrangler.toml`, so SSR code can read them with the same `env` shape as production. Leave it on.

## Adapter v13 — What Changed from Astro 5/v12

| Change | v12 (old) | v13 (current) | Action |
|---|---|---|---|
| Pages support | ✓ | **removed** | Deploy target is Workers + Static Assets only |
| `output: "hybrid"` | ✓ | **removed** | Use `"server"` + `prerender = true` per-page, or `"static"` + `prerender = false` |
| `Astro.locals.runtime` | populated | **removed** | `import { env } from "cloudflare:workers"` |
| `prerenderEnvironment` | n/a | `workerd` default | Set to `"node"` only if prerender breaks under workerd |
| `imageService` default | `"compile"` | `"cloudflare-binding"` | Needs `imagesBindingName` (default `"IMAGES"`) |
| `sessionKVBindingName` | n/a | default `"SESSION"` | Astro session driver reads this binding |
| `workerEntryPoint` | option | **removed** | Adapter emits `dist/_worker.js/index.js` |
| `cloudflareModules` | option | **removed** | Use Vite's built-in WASM/text imports |

**Migration memory (save in `.claude/memory/`):** check adapter + deploy-target compatibility BEFORE bumping Astro major. Astro 6's `@astrojs/cloudflare@13` dropped Pages in a single minor jump; ~8-commit cascade to fix.

## Output Modes (Astro 6)

```astro
// Per-page opt-in / opt-out (works under any output mode)
export const prerender = true   // force static — skips worker
export const prerender = false  // force SSR  — runs in worker
```

| `output` | Default per page | Use when |
|---|---|---|
| `"static"` | prerendered | Mostly-static sites with few dynamic pages |
| `"server"` | SSR | ONE's choice — most routes are dynamic; static pages opt in |
| `"hybrid"` | — | **removed** in Astro 6; use `"server"` + per-page `prerender = true` |

**ONE's rule:** `output: "server"`. Static shell pages export `prerender = true` AND load heavy islands with `client:only="react"`. That collapses the page handler to a ~63-byte stub — the worker doesn't ship React for pre-rendered pages.

## cloudflare:workers — The Canonical Env Import

```ts
// src/pages/api/whatever.ts (SSR API route)
import { env } from "cloudflare:workers";

export const GET: APIRoute = async ({ request }) => {
  const paths = await env.KV.get("paths.json", "json");
  const { results } = await env.DB.prepare("SELECT * FROM signals LIMIT 10").all();
  return Response.json({ paths, signals: results });
};
```

**Typing (wrangler 4):**
```bash
bun wrangler types   # emits worker-configuration.d.ts from wrangler.toml bindings
```

Pipe it into dev/build scripts so `env.KV`, `env.DB` etc. are typed against actual bindings:

```jsonc
// package.json scripts
{
  "dev":   "wrangler types && astro dev",
  "build": "wrangler types && astro build"
}
```

### Legacy `Astro.locals.runtime.env` (compat shim)

ONE still has code reading `locals?.runtime?.env?.DB` from the Astro 5 era. The Cycle 1 shim (`src/env.d.ts`) keeps this working until we migrate callers. **New code uses `import { env } from "cloudflare:workers"` directly** — it's typed, guaranteed populated on Workers, and survives the shim's removal.

## Hydration Directives (unchanged in Astro 6)

```astro
client:load       → Hydrate immediately (above-fold, critical)
client:idle       → Hydrate on requestIdleCallback (non-critical widgets)
client:visible    → Hydrate when scrolled into view (below-fold)
client:only="react" → Client-only, skip SSR entirely (heavy deps, keeps worker bundle small)
client:media="(min-width: 768px)" → Hydrate on media query match
```

**Bundle rule (LOCKED, CLAUDE.md):** heavy components (shiki, @mysten/sui, recharts if not chunked) MUST be `client:only="react"` OR listed in `vite.ssr.external`. Otherwise the SSR worker crosses 10 MiB and deploy fails.

## Page Patterns

### Pure-shell pre-rendered page

```astro
---
// src/pages/about.astro — stays out of the worker entirely
import Layout from "@/layouts/Layout.astro";
import HeavyChart from "@/components/HeavyChart";
export const prerender = true;
---
<Layout title="About">
  <HeavyChart client:only="react" />
</Layout>
```

### SSR page reading CF bindings

```astro
---
// src/pages/dashboard.astro
import Layout from "@/layouts/Layout.astro";
import Dashboard from "@/components/Dashboard";
import { env } from "cloudflare:workers";

const paths = await env.KV.get("paths.json", "json") ?? [];
---
<Layout title="Dashboard">
  <Dashboard client:load paths={paths} />
</Layout>
```

### API route (signal receiver)

```ts
// src/pages/api/signal.ts
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const POST: APIRoute = async ({ request }) => {
  const signal = await request.json();
  await env.KV.put(`signal:${Date.now()}`, JSON.stringify(signal));
  return Response.json({ received: true });
};
```

## Bundle-Size Rules (LOCKED — do not revert)

Three rules keep the SSR worker under the free-tier 10 MiB uncompressed limit. See `docs/deploy.md § Bundle Size` for full diagnosis.

| Rule | Where | Saves |
|---|---|---|
| `markdown: { syntaxHighlight: false }` | `astro.config.mjs` | ~5.8 MiB (Shiki grammars/WASM) |
| `ssr.external: ["shiki", "@mysten/sui", "@mysten/bcs", "node:async_hooks"]` | `astro.config.mjs` | Bare imports — safe only if package never runs server-side (shiki callers are all `client:only`) |
| `prerender = true` + `client:only="react"` on shell pages | per-page | Handler collapses to 63-byte stub |

Verified 2026-04-15: 21 MiB → 9.5 MiB. Pages deploy FAILED → ✓.

## Dev Commands

```bash
bun run dev          # localhost:4321, Node standalone (fast HMR, no miniflare)
bun run build        # astro build → dist/ + dist/_worker.js/index.js
bun run preview      # wrangler dev against dist/ (production-shape check)

# Per-env wrangler dev (hits real CF bindings)
bun wrangler dev --remote    # against production KV/D1 — use with care
bun wrangler dev --local     # local miniflare + local KV (default)

# Types
bun wrangler types           # regenerate worker-configuration.d.ts
astro check                  # tsc on .astro files + tsconfig
```

## Dynamic Routes

```
src/pages/
  agents/[id].astro          → /agents/donal, /agents/amara
  envelopes/[...path].astro  → catch-all
  api/memory/[uid].ts        → /api/memory/tony-tiger
```

```astro
---
// src/pages/agents/[id].astro
const { id } = Astro.params;
if (!id) return new Response(null, { status: 404 });
---
<Layout title={`Agent: ${id}`}>
  <AgentCard client:load agentId={id} />
</Layout>
```

## File Locations

| Type | Location |
|------|----------|
| Pages | `src/pages/*.astro` |
| API routes | `src/pages/api/**/*.ts` |
| Layouts | `src/layouts/*.astro` |
| React islands | `src/components/**/*.tsx` |
| Styles | `src/styles/global.css` |
| Astro config | `astro.config.mjs` |
| Worker config | `wrangler.toml` |
| Locals types | `src/env.d.ts` |

## Performance Budgets (from `docs/speed.md`)

| Metric | Budget |
|---|---|
| Routing (in-memory) | <0.005ms |
| Gateway health | <10ms |
| API route TTFB | <200ms |
| Full page TTFB | <500ms |

Static pages served from `[assets]` binding don't count against request quota — pre-render anything that doesn't need SSR.

## Common Tasks

### Add a new page

1. Create `src/pages/<name>.astro` with Layout import
2. If mostly static → `export const prerender = true`
3. If needs CF bindings → `import { env } from "cloudflare:workers"` in frontmatter
4. React islands: default to `client:visible`; use `client:load` only for above-fold critical UI

### Add an API route

1. Create `src/pages/api/<name>.ts`
2. Export `GET` / `POST` / `PUT` / `DELETE` as `APIRoute`
3. Read bindings via `import { env } from "cloudflare:workers"`
4. Return `Response.json(...)` or `new Response(...)`

### Convert static component to interactive

1. Create `.tsx` in `src/components/`
2. Import into `.astro` page
3. Pick directive: above-fold → `client:load`, below-fold → `client:visible`, heavy → `client:only="react"`

### Type a new binding

1. Add binding to `wrangler.toml` (`[[kv_namespaces]]`, `[[d1_databases]]`, etc.)
2. Run `bun wrangler types` → updates `worker-configuration.d.ts`
3. `env.NEW_BINDING` is now typed everywhere

## Gotchas

- **Dev uses Node, prod uses workerd.** Behavior can diverge. Always `bun run preview` before deploy for production-shape smoke.
- **`import.meta.env.*`** is build-time only. For runtime secrets/bindings use `env` from `cloudflare:workers`.
- **Shiki will crash your deploy** if imported from SSR. All callers must be `client:only="react"`.
- **`output: "hybrid"`** throws in Astro 6. If you see it in old docs or snippets, replace with `"server"` + `prerender = true` per page.
- **`Astro.locals.runtime.env`** is a v12 pattern. ONE has a compat shim but new code must use `cloudflare:workers`.
- **`wrangler types`** must run before `astro build` or bindings are untyped. Script it in `package.json`.

## References

- [Astro Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/) — authoritative for v13
- [CF Workers framework guide — Astro](https://developers.cloudflare.com/workers/frameworks/framework-guides/astro/)
- `docs/TODO-cf-workers-migration.md` — C1+C2+C3 shipped; `dev.one.ie` live on Workers
- `docs/deploy.md` — bundle-size diagnosis + LOCKED rules
- `.claude/rules/astro.md` — auto-loaded on `*.astro` edits

---

**Version**: 2.0.0 — Astro 6 + CF Workers+Assets (2026-04-18)
**Previous**: 1.0.0 (Astro 5 + CF Pages)
