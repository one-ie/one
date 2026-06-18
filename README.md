# ONE Frontend

Open-source Astro starter wired to the ONE backend — chat, tracking, auth, and data from line one.

## Quick start

```bash
npm create one-app@latest my-app
cd my-app
echo "ONE_API_KEY=your_key_here" >> .env
bun run dev
```

## What you get

- **Astro 6** + **React 19** + **Tailwind 4** + **shadcn/ui** — fast by default
- **Chat + tracking** served from one.ie — no source in your repo, zero bundle cost
- **Auth** (better-auth) pointed at ONE's backend — server never ships
- **Data** via `@oneie/sdk` — the same client your agents use
- **6-token design system** — branding is config, not code edits
- **Agent-ready** — `.claude/` teaches your AI to build on ONE correctly

## How it works

```ts
// apps/web/one.config.ts
export default defineOne({
  backend: { baseUrl: process.env.ONE_BASE_URL, apiKey: process.env.ONE_API_KEY },
  brand: { tokens: { primary: 'hsl(216 55% 25%)', secondary: 'hsl(219 14% 28%)' } },
  plugins: [auth(), track({ ws: 'my-workspace' }), chat({ agent: 'my-bot' })],
})
```

The moat is served, never shipped. `grep apps/web/src` returns 0 chat/CRM/substrate lines.

## Packages

| Package | Purpose |
|---|---|
| `@oneie/frontend` | `defineOne()` + `OnePlugin` contract |
| `@oneie/design` | 6-token Tailwind preset |
| `plugin-chat` | `<OneChat>` — emits the served chat tag |
| `plugin-track` | `<OneTrack>` — emits the served tracking tag |
| `plugin-auth` | better-auth client, server stays on ONE |
| `plugin-backend` | `@oneie/sdk` client + `@oneie/react` hooks |
| `plugin-premium` | Served-widget loader + entitlement gate |
| `plugin-admin` | Admin Console — first paid plugin (served, gated by `admin` entitlement) |

## License

MIT — `apps/web` and all packages. The ONE backend itself is not open-source.
