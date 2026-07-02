# ONE

> Astro 6 · React 19 · shadcn/ui · Cloudflare Workers

Your business, on ONE. This repo is one node — three folders that declare everything your business knows, grows, and shows. One CLI (`npx oneie`) operates it. No servers to run, no database to manage, no substrate code to write.

Free plan. No credit card. One business, one workspace.

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
bun run setup    # no account needed — mints a key, writes site/.env.local
cd site && bun run dev
```

`bun run setup` provisions a workspace and writes `ONE_API_KEY` to `site/.env.local` in one step — no dashboard visit, no manual key copy. Skip it and the site runs in standalone mode (local auth + D1) with no backend connection.

Prefer a single scaffold instead of the whole repo? `npx oneie create <name>` downloads this exact shape.

---

## Structure

```
.claude/         ← Claude Code setup — hooks, rules, skills, commands
.mcp.json        ← MCP server — every ONE verb as a native tool
ai/              ← knows  → agents · skills · tools · workflows · context.md
data/            ← grows  → types · content · lifecycles
site/            ← shows  → Astro + shadcn + ONE plugins (one.config.ts)
workspace.toml   ← who you are
packages/
  frontend/      ← defineOne() + OnePlugin contract
  design/        ← 6-token Tailwind 4 preset
  plugin-auth/   ← better-auth client
  plugin-backend/← @oneie/sdk + React 19 hooks
  plugin-chat/   ← served chat widget
  plugin-track/  ← served tracking pixel
  plugin-premium/← entitlement gate for paid plugins
  plugin-admin/  ← Admin Console (paid, served)
  plugin-*/      ← blog, docs, booking, course, dashboard, mail, media, shop
```

Every file compiles to one typed call on the ONE substrate. Every command calls a **receiver** — a named, typed action. That's the whole model. `CLAUDE.md` and `AGENTS.md` are the operating manual and the agent briefing.

---

## The commands

```bash
one setup                       # stand up your workspace (idempotent)
one push [path] [--dry-run]     # upsert agents + skills, then close the loop
one status                      # your usage — credits, meters, plan
one deploy                      # wrangler pages deploy site/
one market [query]              # browse the capability market
one hire <skillId> --budget 50  # hire a peer agent for a skill
one earn                        # accept payment for work you do
```

`--dry-run` injects `simulate: true` — projects the outcome, commits nothing. Dry-run-first on every irreversible verb.

---

## Config

Everything wires through `site/one.config.ts`:

```ts
import { defineOne } from '@oneie/frontend'
import { auth } from '@oneie/plugin-auth'
import { track } from '@oneie/plugin-track'
import { chat } from '@oneie/plugin-chat'

export default defineOne({
  backend: {
    baseUrl: 'https://one.ie',
    // apiKey loaded from CF binding at runtime
  },
  brand: {
    tokens: {
      primary:    'hsl(216 55% 25%)',
      secondary:  'hsl(219 14% 28%)',
      tertiary:   'hsl(105 22% 25%)',
      background: 'hsl(0 0% 93%)',
      foreground: 'hsl(0 0% 100%)',
      font:       'hsl(0 0% 13%)',
    },
  },
  plugins: [
    auth(),
    track({ ws: 'your-workspace' }),
    chat({ agent: 'your-agent' }),
  ],
})
```

Six tokens brand the entire site — swap all six and everything rebrands.

---

## Plugins

| Package | Tier | What |
|---|---|---|
| `@oneie/plugin-auth` | free | better-auth client — auth server stays on ONE |
| `@oneie/plugin-backend` | free | `@oneie/sdk` client + React 19 hooks |
| `@oneie/plugin-chat` | free | Served chat widget — zero bundle |
| `@oneie/plugin-track` | free | Served tracking pixel — zero bundle |
| `@oneie/plugin-premium` | free | Entitlement gate (base for paid plugins) |
| `@oneie/plugin-admin` | **paid** | Admin Console — served via x402, gated by `admin` entitlement |

Paid plugins ship as stubs in this repo. Source is private and served from `one.ie/x/<plugin>.js` after payment.

---

## Development

```bash
bun install     # install all workspaces
bun run setup   # once — mints ONE_API_KEY into site/.env.local
cd site && bun run dev   # dev server
bun run typecheck   # astro check (root)
```

---

## AI-ready

Open the repo root in Claude Code and it's fully wired — `.claude/` and `.mcp.json` live at the root. `.claude/` teaches your AI assistant to build on ONE correctly: file conventions, plugin patterns, design rules, hard constraints. Works with Claude Code, Cursor, and any editor that reads `CLAUDE.md`.

`.mcp.json` exposes the whole ONE receiver surface (signal, ask, mark, catalog, and every domain verb) as native tools in Claude Code, no `one ask` wrapper needed. It reads `ONE_API_KEY` from your shell environment. Claude Code's MCP launcher doesn't read `.env.local` directly, so export it once per session:

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' site/.env.local | cut -d= -f2)
```

`npx oneie create <name>` downloads this same shape, `.claude/` and `.mcp.json` included — a freshly scaffolded node is connected from its first `git init`, not just the full repo clone.

---

## License

[ONE License v1.0](LICENSE) — `site/` and all packages. Free, maximum freedom, one string: keep the "Powered by ONE" link in the deployed product. White-label removes it ([Enterprise License](LICENSE-ENTERPRISE.md)). Source-available, not OSI open source. The ONE backend is not distributed.
