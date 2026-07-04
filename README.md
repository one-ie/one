# ONE

> Astro 6 · React 19 · shadcn/ui · Cloudflare Workers

Build Astro sites. Deploy on Cloudflare. Completely free, with real performance to show for it: **100 on Lighthouse — Accessibility, Best Practices, SEO — LCP 137ms, CLS 0.00.** Verified against a production build, not asserted. See [Performance](#performance) for how to check it yourself.

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
cd site && bun run dev
```

That's it. No account, no API key, no backend connection required — the site runs standalone from your first `bun run dev`, Better Auth and D1 handling sessions locally.

Prefer a single scaffold instead of the whole repo? `npx oneie create <name>` downloads this exact shape.

---

## This is our free product

A design system. A production Astro site. A growing set of free plugins — auth, chat, tracking, blog, booking, docs, mail, media. Clone it, brand it, ship it.

Source-available, not a walled garden. Read exactly what you're building on. See [License](#license) for the one string attached.

```bash
bun run setup    # optional — provisions a workspace + agent that knows your business, writes ONE_API_KEY
```

Skip `bun run setup` and nothing changes about the site. It's up to you.

---

## Knows, grows, shows

```
.claude/         ← Claude Code setup — hooks, rules, skills, commands
.mcp.json        ← MCP server — every ONE verb as a native tool
ai/              ← knows  → agents · skills · tools · workflows · context.md
data/            ← grows  → types · content · lifecycles
site/            ← shows  → Astro + shadcn + ONE plugins (one.config.ts)
workspace.toml   ← who you are
packages/        ← paid plugin stubs only — see Paid plugins below
```

**Knows.** Your agents, skills, tools, and workflows — plain Markdown and TOML. An agent reads `ai/context.md` on every turn, so it always knows your business.

**Grows.** Your data model and your lifecycles — the stages a contact, deal, or agent moves through. Declare a type once; it's typed everywhere.

**Shows.** The site people see. Astro 6, React 19, shadcn/ui, deployed to Cloudflare's edge. Static-first by default — most of the page ships zero JavaScript, which is the actual reason it's fast.

Every file compiles to one typed call on the ONE substrate. Every command calls a **receiver** — a named, typed action. That's the whole model. `CLAUDE.md` and `AGENTS.md` are the operating manual and the agent briefing.

---

## Free plugins

| Package | What |
|---|---|
| `@oneie/plugin-auth` | better-auth client — auth server stays on ONE |
| `@oneie/plugin-backend` | `@oneie/sdk` client + React 19 hooks |
| `@oneie/plugin-chat` | Served chat widget — zero bundle |
| `@oneie/plugin-track` | Served tracking pixel — zero bundle |
| `@oneie/plugin-blog` | Markdown blog, zero config |
| `@oneie/plugin-booking` | Booking/scheduling widget |
| `@oneie/plugin-docs` | Docs site, same content pipeline as this repo |
| `@oneie/plugin-mail` | Transactional email |
| `@oneie/plugin-media` | Media upload + serve |

Install from npm — `bun add @oneie/plugin-chat`, etc. — no monorepo checkout needed. `@oneie/frontend` and `@oneie/design` are free too; `site/` depends on all of it via real semver.

---

## This is yours

100% free, forever — not a trial, not a tier. Clone it, brand it, sell what you build with it. [One license, one string attached](#license).

Free hosting on Cloudflare's global edge. Free design system — six tokens rebrand the entire site. 100 on Lighthouse, measured, not claimed.

You can build a whole business on this without ever connecting to ONE's backend.

---

## Switch on the backend — if you want it

Want AI chat, analytics, a CRM, or the full ONE backend behind your site? Switch it on in `site/one.config.ts`.

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

If you don't want the backend, don't add the plugins. Nothing here requires it. It's up to you.

---

## Paid plugins

Everything above is free. This is the one section that isn't.

| Package | What |
|---|---|
| `@oneie/plugin-admin` | Admin Console — served via x402, gated by an `admin` entitlement |

Paid plugins (`admin`, `course`, `dashboard`, `shop`) ship as thin stubs in `packages/` — never published — built on `@oneie/plugin-premium`'s entitlement gate. They load the real UI from `one.ie/x/<plugin>.js` after payment. `one plugin buy <name>` unlocks one; nothing ships to your repo before you do.

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

## Development

```bash
bun install     # install all workspaces
bun run setup   # once — mints ONE_API_KEY into site/.env.local
cd site && bun run dev   # dev server
bun run typecheck   # astro check (root)
```

---

## Performance

Measured against a production build (`astro build` + `astro preview`), not dev mode, with Chrome's Lighthouse and performance-trace tooling:

| Metric | Result |
|---|---|
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP (Largest Contentful Paint) | 137ms |
| CLS (Cumulative Layout Shift) | 0.00 |

Static-first Astro, zero JavaScript by default, deployed to Cloudflare's edge — that's the actual mechanism, not a marketing line. Check it yourself: `cd site && bun run build && bun run preview`, then run Lighthouse against `localhost:4322`.

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
