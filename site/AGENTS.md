# ONE Frontend — Agent Context

This is an Astro 7 + React 19 + Tailwind 4 site wired to the ONE backend.

## Architecture

```
site/
├── one.config.ts     — the single control surface (defineOne, plugins)
├── src/
│   ├── layouts/      — Layout.astro (3-slot: head/default/footer)
│   ├── pages/        — Astro pages + API routes
│   ├── components/
│   │   ├── ui/       — 33 shadcn primitives (never add ONE imports)
│   │   └── motion/   — Reveal, Stagger, Parallax, ScrollScene, FeatureTabs
│   └── lib/          — utilities, billing, auth helpers
├── .claude/          — rules and skills for this project (GIVE bucket)
└── AGENTS.md         — this file
```

## Design system

**6 tokens only.** Configure via `one.config.ts brand.tokens`. Never use:
- Tailwind palette utilities (`bg-zinc-*`, `bg-indigo-*`, `text-emerald-*`)
- Raw hex literals or `hsl()` in component files
- Off-scale arbitrary values (`p-[13px]`, `rounded-[7px]`)

Safe utilities: `bg-{background|foreground|primary|secondary|tertiary|...}`, `text-{font|primary|...}`, `border-{font|primary|...}`

See `.claude/rules/design.md` for the full rule set.

## Adding features

1. **Plugin** — install a `@oneie/plugin-*` package and add to `one.config.ts`
2. **Page** — create `src/pages/my-page.astro` using `<Layout title="...">`
3. **Component** — use shadcn primitives from `src/components/ui/`
4. **API route** — create `src/pages/api/my-route.ts` returning `Response`

## ONE connection

Chat, tracking, auth, and data all go through `one.config.ts`. The moat (chat/tracking source) is served from one.ie — never copy it into this repo.

## The front desk

`src/lib/chat-config.ts` is the one switch: `ws` (the workspace chat bills to
and leads land in), `agent`, `page` (the ONE page `lead:capture` files the form
under) and `enabled`. `npx oneie create site --ws <slug>` writes all four for a
client. `src/lib/front-desk.ts` holds the logic, with no imports:

- `Layout.astro` renders the `chat.js` tag from `embedAttrs(chatConfig)`.
- `/contact` posts to `/api/lead`, which calls `lead:capture` server-side with
  `ONE_API_KEY` for this site's workspace — never one the form names, never a
  browser POST to one.ie. It answers 200 only when the lead was filed.
- `/catalogue` and `/llms.txt` read `products:list`, the same read the front
  desk quotes from.

Proof: the client-site test upstream, which runs every piece against the real receivers.

**Payments run on mainnet** since 2026-11-12: crypto settles on real networks, so test with small amounts. Card checkout runs on your own Stripe keys (use a test-mode key while you build). Read the network live: `curl -s https://pay.one.ie/status` → `"network"`. A seller's card money goes to the seller's own Stripe; ONE never holds it.

## Hard rules (the design-check hook enforces #2)

1. **Never import `@oneie/sdk` directly in an API route** — use `oneClient()` from `@oneie/plugin-backend` (lazy-imports the SDK; the bare barrel crashes CF Workers at init).
2. **Never use hex / raw `hsl()` / Tailwind palette utilities in components** — only the 6 `--color-*` tokens. `.claude/hooks/design-check.sh` blocks violations.
3. **Never add a 7th color token** — compose from the 6 + invariants (white/black/transparent/destructive/success).
4. **Never copy chat/track/auth engine source** — use the `@oneie/plugin-*` components; the engines are served from one.ie.

## Skills loaded automatically

- `design` — 6-token rules (enforced by `PostToolUse: design-check.sh`)
- `sdk` — `oneClient()` + lazy-import guard
- `astro` — `one.config.ts` wiring, OneChat/OneTrack placement, CF SSR
- `react19` — islands + `@oneie/react` hooks
- `shadcn` — 6-token primitives, add via `bunx shadcn add`

## See also

- [ONE docs](https://one.ie/docs)
- [Agent front door](https://one.ie/llms.txt) — keys, test money, x402 credits, error names
- `.claude/skills/` — domain skills for astro, react19, shadcn, sdk
- `.claude/commands/` — `/deploy`, `/create`
