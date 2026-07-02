# ONE Starter

> Astro 6 · React 19 · shadcn/ui · Cloudflare Workers

Build an AI-connected site in minutes. Chat, tracking, auth, and data are served from [one.ie](https://one.ie) — zero bundle cost, no source in your repo.

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
cd apps/web && bun run setup    # no account needed — mints a key, writes .env.local
bun run dev
```

`bun run setup` provisions a workspace and writes `ONE_API_KEY` to `.env.local` in one step — no dashboard visit, no manual key copy. Skip it and the site runs in standalone mode (local auth + D1) with no backend connection.

Prefer a single scaffold instead of the whole repo? `npx oneie create` (free plan, default) or `npx oneie create agency` (paid, reselling) — see `apps/client/` and `apps/agency/`.

---

## Structure

```
.claude/         ← Claude Code setup — hooks, rules, skills, commands
.mcp.json        ← MCP server — every ONE verb as a native tool
apps/
  web/           ← your Astro site (start here)
  agency/        ← agency node — resell, manage clients (paid plan)
  client/        ← single-business node — free plan default
  _shared/       ← generic example content composed into agency + client
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
create/          ← npm create one-app scaffolder
```

`oneie create` scaffolds each node with its own `.claude/` + `.mcp.json` at its root too — a scaffold is a standalone repo, not a subdirectory of this one.

---

## Config

Everything wires through `apps/web/one.config.ts`:

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

## Design system

Six tokens in `one.config.ts` brand the entire site: `primary`, `secondary`, `tertiary`, `background`, `foreground`, `font`. No CSS edits needed — swap all six and everything rebrands.

---

## Development

```bash
bun install     # install all workspaces
bun run setup   # once — mints ONE_API_KEY into apps/web/.env.local
cd apps/web && bun run dev   # dev server
bun run test        # vitest suite (root)
bun run typecheck   # astro check (root)
```

---

## AI-ready

Open the repo root in Claude Code and it's fully wired — `.claude/` and `.mcp.json` live at the root, not per app. `.claude/` teaches your AI assistant to build on ONE correctly: file conventions, plugin patterns, design rules, hard constraints. Works with Claude Code, Cursor, and any editor that reads `CLAUDE.md`.

`.mcp.json` exposes the whole ONE receiver surface (signal, ask, mark, catalog, and every domain verb) as native tools in Claude Code, no `one ask` wrapper needed. It reads `ONE_API_KEY` from your shell environment. Claude Code's MCP launcher doesn't read `.env.local` directly, so export it once per session:

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' apps/web/.env.local | cut -d= -f2)
```

`oneie create agency` / `client-repo` / `site` compose the same root `.claude/` + `.mcp.json` into every scaffold — a freshly scaffolded node is connected from its first `git init`, not just the full monorepo clone.

---

## License

[ONE License v1.0](LICENSE) — `apps/web` and all packages. Free, maximum freedom, one string: keep the "Powered by ONE" link in the deployed product. White-label removes it ([Enterprise License](LICENSE-ENTERPRISE.md)). Source-available, not OSI open source. The ONE backend is not distributed.
