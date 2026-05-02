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
| Chat | Streaming AI chat (`Chat.tsx`) + floating widget (`ChatWidget.tsx`); token-by-token SSE; inline tool-approval UI | `src/components/Chat.tsx` |
| Sidebar | Mini/full/sheet rail — collapsible groups, persisted state, mobile drawer | `src/components/sidebar/` · `sidebar.md` |
| Chat backend | `/api/chat` streams AI SDK UIMessage SSE from `claw`; webhook handlers unified via `runAgent()` | `src/pages/api/` |
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

Both use AI SDK v6 `useChat` with `DefaultChatTransport` — token-by-token
streaming, automatic reconnect, and an inline Approve/Deny button row for
any tool call that requires user consent before it writes to the substrate.

Backend is `claw/` — a `ToolLoopAgent` worker on CF Workers (AI SDK v6).
Model routing: OpenRouter by default (any model string), Groq if `GROQ_API_KEY`
set + `groq/` prefix, AI SDK Gateway as final fallback. Swap models by
editing one line in `claw/src/personas.ts`.

`substrateMiddleware` wires pheromone learning to every LLM call automatically —
no manual mark/warn calls needed from the chat path.

Five access modes once you wire the SDK: web · API · `@oneie/sdk` ·
`@oneie/mcp` · `npx oneie` CLI. Same substrate, five ways in.

Spec: `chat.md` · `aisdk.md` · `ai-elements.md`.

---

## Layout

One layout, slot-driven, fully typed. Two orthogonal axes — **left = nav**,
**right = chat** — each opted in per page with one prop.

```astro
<Layout title="Dashboard" sidebar="full">          <!-- left rail, labels visible -->
<Layout title="Wallet" sidebar="mini" chat="split"> <!-- icon rail + chat right -->
<Layout title="Home">                              <!-- no rails (default) -->
```

Built-in: dark mode (with no-flash inline script), Tailwind 4 globals,
focus-visible ring on every interactive element using `--color-ring`,
`min-h-screen antialiased` body. Pages never import the sidebar or chat
components — flip a prop, the layout decides.

Specs: `layout.md` (chat axis) · `sidebar.md` (nav axis).

---

## Sidebar

A left rail navigation island, four modes, zero new dependencies.

```astro
<Layout title="Chat" sidebar="full">    <!-- 240px, icons + labels -->
<Layout title="Wallet" sidebar="mini">  <!-- 72px, icons only -->
<Layout title="Home">                   <!-- sidebar="none" (default) -->
```

| Mode | Width | When |
| --- | --- | --- |
| `none` | 0 | Marketing, legal, docs — top nav only |
| `mini` | 72px | Dense workspaces; click a row to navigate |
| `full` | 240px | App home; group labels + collapsible submenus |
| `sheet` | drawer | Auto on mobile (`<768px`) — hamburger + backdrop + ESC |

What you get:

- **Persisted state.** Mini ↔ full toggle saved to `localStorage` per device
- **Collapsible groups.** CSS-only accordion (`grid-rows: 0fr ↔ 1fr`); no animation library
- **Mini → full smart-expand.** Clicking a collapsible group while mini auto-expands the rail and opens the group — one fluid gesture instead of a separate dropdown
- **Active highlighting.** Active row sinks into `bg-foreground` with a left accent bar in `--color-primary` — same depth trick the form fields use
- **Mobile drawer.** Below 768px the rail becomes a sheet with backdrop, body scroll-lock, and ESC-to-close
- **Every click is a signal.** `ui:sidebar:{toggle,expand,collapse,sheet,nav}` dispatched as `CustomEvent` on `window` — telemetry / substrate bridge / devtools subscribe without coupling
- **Six tokens, no exceptions.** Active = `bg-foreground`, labels = `text-font/60`, group headers = `text-font/40`, brand mark = `bg-primary text-on-primary`. The build kills wrong colors at compile time.

Adding a route is one entry in `web/src/lib/menu.ts`:

```ts
{
  label: 'Money',
  items: [
    { href: '/wallet', label: 'Wallet', icon: Wallet, submenus: [
      { href: '/wallet', label: 'Balance' },
      { href: '/wallet/activity', label: 'Activity' },
    ]},
    { href: '/buy', label: 'Buy', icon: ShoppingCart },
  ],
}
```

What it does **not** ship: zustand, radix, shadcn primitives. The upstream
([salimi-my/shadcn-ui-sidebar](https://github.com/salimi-my/shadcn-ui-sidebar))
wanted four radix packages plus zustand plus immer for one boolean — we
ported the *shape* using native HTML, Tailwind 4, and a 30-line hook.

Spec: `sidebar.md` · code: `web/src/components/sidebar/`.

---

## Stack

| Layer | Tech | Why |
| --- | --- | --- |
| Framework | Astro 6 | Islands, SSR-by-default, ships zero JS by default |
| UI | React 19 | Actions, `use()`, transitions, `ref` as prop |
| Styling | Tailwind 4 + shadcn/ui | Token-locked palette, copy-paste components |
| Runtime | Cloudflare Workers | Edge SSR, static assets, D1, KV |
| AI | AI SDK v6 (`ToolLoopAgent`, streaming, tool approval) · OpenRouter default | One key, every model; multi-step loops; approval gates |
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
