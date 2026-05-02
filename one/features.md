# features.md — ONE template

**A website starter kit. Ship a real site this afternoon.**

Astro 6 + React 19 + Tailwind 4 on Cloudflare Workers. Designed so the
boring parts (SEO, layout, theming, chat, payments) are already wired —
you write content, change colors, ship.

```
clone  →  bun install  →  bun dev  →  edit content  →  bun run deploy
                                                              ↓
                                                       live on CF Workers
```

---

## What you get out of the box

| Pillar | What's in `web/` | Edit here |
| --- | --- | --- |
| Landing page | `Hero.tsx` · `Features.tsx` · `Pricing.tsx` | `src/components/` |
| Layout + SEO | `Layout.astro` (title/description props, OG-ready, dark mode) | `src/layouts/Layout.astro` |
| Design system | 6 editable tokens + auto-contrast labels + 3 depth levels | `design.md` · `/design` |
| Theme editor | Live color picker; persists to `localStorage`; per-mode | `theme-editor.md` · `/design` |
| Chat | Streaming AI chat (`Chat.tsx`) + floating widget (`ChatWidget.tsx`) | `src/components/Chat.tsx` |
| Chat backend | `/api/chat` SSE endpoint, `/api/health`, webhook handlers | `src/pages/api/` |
| Auth-ready | Better Auth wired (Google plugin), passkey path documented | `passkeys.md` |
| Payments | x402 receive side prod-ready; SDK send side in `apps/one-core` | `x402.md` |
| Agents / brain | `claw` worker (Telegram/Discord/HTTP → LLM, D1+KV memory) | `claw/` |
| SDK + MCP + CLI | `@oneie/sdk`, `@oneie/mcp`, `npx oneie` | `sdk/` · `mcp/` |
| Deploy | `wrangler deploy` — CF Workers Static Assets, edge SSR | `wrangler.toml` |

Pages already shipped: `/` (landing) · `/chat` · `/design` (tokens + live editor).

---

## SEO

`Layout.astro` accepts `title` and `description` per page. Add per-route:

```astro
---
import Layout from '@/layouts/Layout.astro'
---
<Layout title="Pricing — ACME" description="Simple plans that scale.">
  <Pricing client:visible />
</Layout>
```

What's pre-wired:

- `<title>` + `<meta description>` from props
- `<meta charset>` + viewport
- Favicon slot (`/favicon.svg`)
- Dark-mode flash prevention (theme inlined before paint)
- Astro 6 SSR — every page renders HTML on the edge, indexable day one

What's a one-liner away (extend `Layout.astro`): canonical URL, OG/Twitter
cards, JSON-LD, sitemap (Astro integration), robots.txt.

---

## Landing pages

Three composable React islands you mix and match:

```astro
<Layout title="Home">
  <Hero client:load />
  <Features client:visible />
  <Pricing client:visible />
</Layout>
```

- `client:load` for above-the-fold interactivity
- `client:visible` for everything below — zero JS until scrolled
- Static-by-default — Astro ships HTML; React only hydrates what needs to

Need a new section? Drop a `.tsx` in `src/components/`, import into a page.

---

## Design system (6 tokens, 3 depths)

The whole visual language is **6 colors a user can edit**:
`background` · `foreground` · `font` · `primary` · `secondary` · `tertiary`.
Plus 5 invariants (`white` · `black` · `transparent` · `destructive` · `success`)
and auto-derived helpers (`border`, `muted`, `ring`, `on-primary`, `on-secondary`,
`on-tertiary`).

The build itself enforces it: `Layout.astro` declares `--color-*: initial` in
`@theme`, which wipes Tailwind's default palette. Write `bg-zinc-500` and it
emits **no CSS at all** — a wrong color is invisible. A PostToolUse hook
catches any leftover hex literals or palette classes during edits.

Three depth levels: `page` (L0 body) → `background` (L1 cards) → `foreground`
(L2 inputs/content). No fourth surface. Spec: `design.md`. Rules: `.claude/rules/design.md`.

---

## Theme editor (`/design`)

Live color picker that updates the running site. Pick brand colors per
light/dark mode, watch every component restyle in place, copy the JSON to
seed a new project. Persists to `localStorage` under `one:theme` and is
read by an inline script in `Layout.astro` before first paint — no flash.

Spec: `theme-editor.md`.

---

## Chat

Two surfaces, same backend:

- `<Chat />` — full-page conversation (`/chat` route)
- `<ChatWidget />` — floating bubble for any landing page

Backend is `/api/chat` (Server-Sent Events streaming). Swap providers by
editing one file — `claw/` ships an OpenRouter-backed worker (default:
Haiku 4.5 for speed, Sonnet 4.6 for decisions). Memory + learning live in
TypeDB / D1 / KV; the chat surface stays a thin client.

Five access modes once you wire the SDK: web · API · `@oneie/sdk` ·
`@oneie/mcp` · `npx oneie` CLI. Same substrate, five ways in.

Spec: `chat.md` · `aisdk.md` · `ai-elements.md`.

---

## Layout

One layout, slot-driven, fully typed.

```astro
<Layout title="..." description="...">
  <slot />
</Layout>
```

Built-in: dark mode (with no-flash inline script), Tailwind 4 globals,
focus-visible ring on every interactive element using `--color-ring`,
`min-h-screen antialiased` body. Add a header/nav/footer by composing more
components — there's no framework lock-in to a particular layout shape.

---

## Stack

| Layer | Tech | Why |
| --- | --- | --- |
| Framework | Astro 6 | Islands, SSR-by-default, ships zero JS by default |
| UI | React 19 | Actions, `use()`, transitions, `ref` as prop |
| Styling | Tailwind 4 + shadcn/ui | Token-locked palette, copy-paste components |
| Runtime | Cloudflare Workers | Edge SSR, static assets, D1, KV |
| AI | OpenRouter (Haiku / Sonnet) | One key, every model |
| Brain | TypeDB 3.0 | Path-based memory, agent learning |
| Lang | TypeScript | Always typed; no `any` |

---

## Deploy

```bash
cd web
bun install
bun dev          # local on :4321
bun run build    # Astro → CF Workers bundle
bun run deploy   # wrangler deploy
```

Three commands to production. `wrangler.toml` is pre-configured for CF
Workers Static Assets — your HTML lands at the edge, your React islands
hydrate on the client, your `/api/*` routes run as Workers.

---

## What's intentionally NOT a feature

- No CMS — keep content in markdown / JSX where AI-assisted edits are easy
- No SSR-only data layer — fetch where you need it, cache via KV / TypeDB
- No theming "system" beyond the 6 tokens — every extra knob is a tax
- No analytics SDK — bring your own (Plausible, PostHog, Cloudflare Analytics)
- No i18n bundled — Astro 6 has built-in routing if you need it

Every "missing" thing is a deliberate door, not a wall. Add what your site
actually needs.

---

## Shape of a new site

```
1. Fork → rename in package.json + wrangler.toml
2. Open /design — pick your 6 colors, copy the JSON into Layout.astro defaults
3. Edit Hero/Features/Pricing copy and images in src/components/
4. Add routes as src/pages/<name>.astro using <Layout>
5. Wire /api/chat to your provider (or keep claw + OpenRouter)
6. bun run deploy
```

Afternoon-one milestone: live URL, SEO clean, theme dialed, chat working.

---

*One template. Six tokens. Three commands to ship. The boring parts are done.*
