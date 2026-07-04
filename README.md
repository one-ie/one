# ONE

> Astro 6 · React 19 · shadcn/ui · Cloudflare Workers

The source-available framework for building AI-powered applications. A design
system and a website, free forever, under one license.

Three folders — **knows**, **grows**, **shows.** `ai/` is what your
business knows. `data/` is what it grows. `site/` is what it shows. One
CLI (`npx oneie`) operates all three. No servers to run, no database to
manage, no substrate code to write.

Free plan. No credit card. One business, one workspace.

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
bun run setup    # no account needed — mints a key, writes site/.env.local
cd site && bun run dev
```

`bun run setup` provisions a workspace and writes `ONE_API_KEY` to `site/.env.local` in one step — no dashboard visit, no manual key copy. Skip it and the site still runs, standalone (local auth + D1), with no backend connection at all. Connect later, whenever you're ready.

Prefer a single scaffold instead of the whole repo? `npx oneie create <name>` downloads this exact shape.

---

## Knows, grows, shows

```
.claude/         ← Claude Code setup — hooks, rules, skills, commands
.mcp.json        ← MCP server — every ONE verb as a native tool
ai/              ← knows  → agents · skills · tools · workflows · context.md
data/            ← grows  → types · content · lifecycles
site/            ← shows  → Astro + shadcn + ONE plugins (one.config.ts)
workspace.toml   ← who you are
packages/        ← paid plugin stubs only — admin, course, dashboard,
                    premium, shop (thin loaders; see Plugins below)
```

**Knows.** Your agents, skills, tools, and workflows — plain Markdown and TOML. An agent reads `ai/context.md` on every turn, so it always knows your business.

**Grows.** Your data model and your lifecycles — the stages a contact, deal, or agent moves through. Declare a type once; it's typed everywhere.

**Shows.** The site people see. Astro 6, React 19, shadcn/ui, deployed to Cloudflare's edge. Static-first by default — most of the page ships zero JavaScript, which is the actual reason it's fast, not a marketing line.

`@oneie/frontend`, `@oneie/design`, and the 9 free plugins (`auth`, `backend`,
`blog`, `booking`, `chat`, `docs`, `mail`, `media`, `track`) install from npm
— `site/` depends on them via real semver, no local source required.

Every file compiles to one typed call on the ONE substrate. Every command calls a **receiver** — a named, typed action. That's the whole model. `CLAUDE.md` and `AGENTS.md` are the operating manual and the agent briefing.

---

## The commands

```bash
one setup                       # stand up your workspace (idempotent)
one onboard [--name N]          # walk register→bootstrap deterministically, then show where you are in the agent lifecycle and what's next
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

Free plugins install from npm (`bun add @oneie/plugin-chat`, etc.) — no monorepo checkout needed. Paid plugins (`admin`, `course`, `dashboard`, `premium`, `shop`) ship as thin stubs in `packages/` — never published — that load the real UI from `one.ie/x/<plugin>.js` after payment.

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

Free forever. [The ONE License v1.0](LICENSE) covers `site/` and every package here — full commercial rights, no usage limits, no royalty fees, one obligation: keep the "Powered by ONE" link in your deployed product. White-label removes it ([Enterprise License](LICENSE-ENTERPRISE.md)).

Source-available, not OSI open source — the difference is real and we say it plainly. Read the [full license](LICENSE) before you rely on it. The ONE backend itself is not distributed; this repo is the client.
