# ONE Starter

> Astro 6 · React 19 · shadcn/ui · Cloudflare Workers

Build an AI-connected site in minutes. Chat, tracking, auth, and data are served from [one.ie](https://one.ie) — zero bundle cost, no source in your repo.

```bash
npm create one-app@latest my-app
cd my-app && bun run dev
```

Set `ONE_API_KEY` in `.env` to connect to the ONE backend. Without it the site runs in standalone mode (local auth + D1).

---

## Structure

```
apps/web/           ← your Astro site (start here)
packages/
  frontend/         ← defineOne() + OnePlugin contract
  design/           ← 6-token Tailwind 4 preset
  plugin-auth/      ← better-auth client
  plugin-backend/   ← @oneie/sdk + React 19 hooks
  plugin-chat/      ← served chat widget
  plugin-track/     ← served tracking pixel
  plugin-premium/   ← entitlement gate for paid plugins
  plugin-admin/     ← Admin Console (paid, served)
create/             ← npm create one-app scaffolder
```

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
bun install                    # install all workspaces
cd apps/web && bun run dev     # dev server
bun test                       # vitest suite
bun run typecheck              # astro check
```

---

## AI-ready

`.claude/` teaches your AI assistant to build on ONE correctly — file conventions, plugin patterns, design rules, hard constraints. Works with Claude Code, Cursor, and any editor that reads `CLAUDE.md`.

---

## License

[ONE License v1.0](LICENSE) — `apps/web` and all packages. Free, maximum freedom, one string: keep the "Powered by ONE" link in the deployed product. White-label removes it ([Enterprise License](LICENSE-ENTERPRISE.md)). Source-available, not OSI open source. The ONE backend is not distributed.
