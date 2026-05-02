# layout.md — Chat-aware page shell

`Layout.astro` is the only page shell in `web/`. It owns three things: the
HTML head, the theme bootstrap script, and **how chat appears on the page**.

Chat is not a separate route. It's a layer the layout chooses to mount in
one of four modes. The **page** picks the default mode for that route; the
**user** can override it and the override sticks across navigation. The
layout handles geometry, slots, persistence, and z-order.

---

## The four modes

| Mode | Geometry | Default for |
| --- | --- | --- |
| `wide` | Right rail at **45%** viewport width (min 480px, max 720px) | Pages where chat is the work — `/chat`, `/buy`, `/sell` |
| `rail` | Right rail at **25%** viewport width (min 320px, max 420px) | Pages with chat as a sidekick — `/wallet`, dashboards |
| `icon` *(global default)* | Floating bubble bottom-right; expands to 380×560 popover | Marketing, showcase, most pages |
| `none` | No chat mounted | Pages where chat would distract — `/legal`, `/privacy` |

```
┌─ wide (45%) ──────────┬───────┐  ┌─ rail (25%) ──────────────┬───┐
│                       │       │  │                           │   │
│      <slot />         │ chat  │  │         <slot />          │chat│
│      (55%)            │ (45%) │  │         (75%)             │(25%)│
└───────────────────────┴───────┘  └───────────────────────────┴───┘

┌─ icon ────────────────────┐  ┌─ none ────────────────────┐
│                           │  │                           │
│       <slot />            │  │       <slot />            │
│                  ┌──┐     │  │                           │
│                  │💬│     │  │                           │
└──────────────────┴──┘─────┘  └───────────────────────────┘
```

All four modes render the **same** `<Chat />` component. Mode swaps
geometry and chrome, never identity or state.

---

## Two layers of control

**Page sets the default.** Each page declares the mode it expects via a
prop on `<Layout>`. This is the design intent for the route.

**User overrides and it sticks.** A mode switcher (lives inside the chat
component header) writes the user's choice to `localStorage`. On next
page load, the layout reads stored preference *if present*, otherwise
falls back to the page default.

```
                  ┌─────────────────────────┐
  page default ──▶│ resolveMode(default)    │──▶ active mode
                  │                         │
  localStorage ──▶│   user pref wins        │
                  └─────────────────────────┘
```

Storage key: `one:chat-mode`. Values: `wide` | `rail` | `icon` | `none`.
A page can opt out of user override by passing `chat-lock` (e.g., `/legal`
forces `none` regardless of preference). Default is unlocked.

---

## The contract

```astro
---
// web/src/layouts/Layout.astro
type ChatMode = 'wide' | 'rail' | 'icon' | 'none'

interface Props {
  title: string
  description?: string
  chat?: ChatMode          // page default; default: 'icon'
  chatLock?: boolean       // ignore user preference; default: false
}
const { title, description, chat = 'icon', chatLock = false } = Astro.props
---

<!doctype html>
<html lang="en" class="dark">
  <head>...</head>
  <body class="min-h-screen antialiased" data-chat-default={chat} data-chat-lock={chatLock || undefined}>
    <div id="chat-root" data-mode={chat}>
      <main id="chat-content"><slot /></main>
      <ChatHost client:load defaultMode={chat} lock={chatLock} />
    </div>
  </body>
</html>
```

**Mode is resolved before paint** by an inline boot script in `<head>`
(see CLS section below). It writes `data-chat-mode` on `<html>`, which
drives the CSS Grid via attribute selectors — no JS measurement, no
post-paint shift.

`<ChatHost />` (the React island) hydrates `client:idle` and:
1. Reads `document.documentElement.dataset.chatMode` as initial state (already correct from boot script)
2. Renders the matching chrome around `<Chat />` — geometry is already in place
3. Exposes the mode switcher inside chat chrome
4. Writes to `localStorage` when the user switches; updates `data-chat-mode` synchronously so the next paint matches

Pages opt in by setting one prop:

```astro
<Layout title="Chat" chat="wide">      <!-- 45% rail by default -->
<Layout title="Wallet" chat="rail">    <!-- 25% rail by default -->
<Layout title="Home">                  <!-- icon (default) -->
<Layout title="Legal" chat="none" chatLock>  <!-- forced, no override -->
```

No page imports `<Chat />` directly. The layout decides, the user adjusts.

---

## Geometry — rail modes (`wide` and `rail`)

CSS Grid in `Layout.astro`'s global stylesheet, driven by `data-mode` on
`#chat-root`. The rail is L1 (`--color-background`) with a left border;
content stays on `--color-page` (L0) so the rail edge reads as a card.

```css
#chat-root {
  display: grid;
  grid-template-columns: 1fr 0;        /* icon/none — chat overlays or absent */
  min-height: 100vh;
}

#chat-root[data-mode="wide"] {
  grid-template-columns: minmax(0, 55fr) clamp(480px, 45vw, 720px);
}

#chat-root[data-mode="rail"] {
  grid-template-columns: minmax(0, 75fr) clamp(320px, 25vw, 420px);
}

#chat-content { min-width: 0; overflow-x: hidden; }

#chat-root[data-mode="wide"] .chat-rail,
#chat-root[data-mode="rail"] .chat-rail {
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--color-background);
  border-left: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}

/* Mobile: rail collapses to icon. Always. */
@media (max-width: 768px) {
  #chat-root[data-mode="wide"],
  #chat-root[data-mode="rail"] {
    grid-template-columns: 1fr;
  }
  #chat-root[data-mode="wide"] .chat-rail,
  #chat-root[data-mode="rail"] .chat-rail { display: none; }
  /* ChatHost mounts the icon-mode bubble as fallback */
}
```

**Width rules:**

- `wide` = `clamp(480px, 45vw, 720px)` — 45% of a 1280px viewport is 576px; clamps so chat is always usable but never gluttonous.
- `rail` = `clamp(320px, 25vw, 420px)` — 25% of 1280px is 320px (the floor); on wide screens caps at 420px so content keeps the room.
- Both rails are `position: sticky; height: 100vh` so they stay put while content scrolls. The rail owns its internal scroll (message list).
- Content gets `min-width: 0` so long code blocks can't push the rail off-screen.
- Below `md` (768px) all rails collapse and an `icon`-mode bubble takes over. The page never has both at once.

---

## Geometry — icon mode

`ChatWidget` already implements this (`web/src/components/ChatWidget.tsx`).
The widget is `position: fixed; bottom-6 right-6`. Open state is a 380×560
popover. Z-index `50`. Closed state is a 56px circular button.

In the new shape, `ChatHost` mounts `ChatWidget` when active mode is
`icon` (or when a rail mode collapses on mobile).

---

## The `<Chat />` mode prop

`Chat.tsx` learns one new prop and a switcher slot:

```tsx
interface Props {
  mode: 'popover' | 'rail-25' | 'rail-45'
  onClose?: () => void          // popover only
  onModeChange: (m: ChatMode) => void   // for the switcher
  currentMode: ChatMode         // what to highlight in switcher
  canSwitch: boolean            // false when chatLock is set
}
```

| `mode` value | Chrome |
| --- | --- |
| `popover` | Fixed 380×560, close button, rounded-2xl outer border |
| `rail-25` | Fills container, no outer border, denser typography (avatars 24px, smaller padding) |
| `rail-45` | Fills container, no outer border, comfortable typography (avatars 32px, room for tool calls and embeds) |

Everything else — message list, input, streaming, tool calls — is
identical across modes. The mode switcher renders in the chat header
when `canSwitch`:

```
┌──────────────────────────────────────────┐
│  Chat            [▢ wide][▭ rail][○][×] │   ← icon row, current mode highlighted
├──────────────────────────────────────────┤
│  messages...                              │
└──────────────────────────────────────────┘
```

Four icons: `wide` (split panel wide), `rail` (split panel narrow), `icon`
(message circle), `none` (eye-off, dismisses chat for the session). Click
writes `one:chat-mode` and re-renders.

---

## Why this shape

**Page declares intent, user has the final say.** Surfaces like `/chat`
make sense at 45%; `/wallet` makes sense at 25%; user might prefer icon
everywhere. Both are true. The layout reconciles them.

**One `<ChatHost />` owns the resolution.** All the page → user → mobile
fallback logic lives in one component. No prop drilling, no per-page
toggles.

**Same `<Chat />` everywhere.** Three chrome variants, one tree. Streaming
state, scroll position, and memory are unaffected by mode switches.
Switching from rail to icon mid-conversation is a chrome flip, not a
remount.

**Mobile is non-negotiable.** Below 768px every rail collapses to icon.
A 25% rail on a 375px phone is 94px — unusable. The user's preference
for `wide` doesn't override physics.

**Lock is rare.** Only pages where chat would actively harm the user
(checkout-style flows, legal text) should set `chatLock`. Default is
trust the user.

---

## Pages × modes (initial assignment)

| Route | Page default | Lock? | Reason |
| --- | --- | --- | --- |
| `/` | `icon` | no | Marketing — chat as CTA |
| `/chat` | `wide` | no | Chat *is* the page |
| `/buy` | `wide` | no | Agent chat drives the buy flow |
| `/sell` | `wide` | no | Same — agent assists listing |
| `/wallet` | `rail` | no | Chat helps but balance is the focus |
| `/design` | `icon` | no | Showcase |
| `/legal`, `/privacy` | `none` | **yes** | Hard read; chat would distract |

Pages override on a per-route basis. Global default is `icon`.

---

## Persistence rules

- Storage key: `one:chat-mode`. JSON-encoded: `"wide" | "rail" | "icon" | "none"`.
- Resolved by an **inline boot script** (see CLS section) before first paint.
- `ChatHost` reads the same value on mount and trusts the DOM is already correct.
- Written when user clicks a mode switcher icon — boot script picks it up next navigation.
- Cleared by the user via `localStorage.removeItem('one:chat-mode')` in the design editor's "reset" button (same place that resets theme).

---

## Performance budget — 100% Lighthouse, zero CLS

**Principle: performance through simplicity.** Every byte on the critical path should
earn its place. Fewer hops, smaller payloads, no JS where CSS or HTML does the job.

This shell is on the critical path for every page. Targets:

| Metric | Target | Current (2026-05-02) | How |
| --- | --- | --- | --- |
| **Performance** | **100** | 99 | Three open gaps below |
| **CLS** | **0** | 0 ✅ | Mode resolved before paint via inline script; CSS clamps, no JS measurement |
| **LCP** | < 1.2s | 2.0s | `<Sidebar client:load>` is on the critical JS chain — fix: `client:idle` |
| **FCP** | < 0.9s | 1.1s | `Layout.css` (5.9 KiB) blocks render for 160ms — fix: inline critical tokens |
| **TBT** | < 50ms | 0ms ✅ | — |
| **SI** | < 2.0s | 2.4s | Cascades from LCP/FCP fixes |
| **Bundle** | < 30KB JS gzip on icon/none pages | ~96 KiB (49% unused in `client.js`) | deduplicate React, lazy-import Chat internals |

### Open gaps (ranked by impact)

**Gap 1 — `<Sidebar client:idle>` (est. −300ms LCP)**

`Layout.astro` currently uses `client:load` for the Sidebar. This puts the entire
Sidebar → jsx-runtime → ui-signal chain (3 sequential hops, 1,025ms critical path)
in the blocking window. The Sidebar SSR-renders correctly without JS — the collapse
toggle is the only interactive piece.

```astro
<!-- Layout.astro — was client:load -->
<Sidebar client:idle initial={sidebar} />
```

Sidebar JS hydrates after LCP. The user sees a working sidebar on first paint; the
toggle becomes interactive ~500ms later. Acceptable trade-off; collapse isn't above-fold intent.

**Gap 2 — inline critical CSS (est. −160ms FCP)**

`Layout.css` (5.9 KiB) is render-blocking. The critical subset — design tokens
(`@theme` block, `:root` helpers, `html.dark`, `body`, `.page-shell`) — is ~1 KiB.

```astro
<!-- Layout.astro: inline the token block into <head> -->
<style is:inline>
  /* @theme, :root, html.dark, body, .page-shell only */
</style>
<!-- defer full Tailwind utilities -->
<link rel="stylesheet" href={cssHref} media="print" onload="this.media='all'" />
```

Astro's `is:inline` prevents extraction to an external file. The remaining component
utilities load non-blocking after paint.

**Gap 3 — collapse JS micro-chunks (est. −1 round-trip)**

`jsx-runtime.js` (0.92 KiB) and `ui-signal.js` (1.62 KiB) are fetched as separate
hops at the tail of the chain. At 2.5 KiB combined, RTT cost > transfer cost.

```js
// astro.config.mjs
vite: {
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('jsx-runtime') || id.includes('ui-signal')) return 'sidebar'
        }
      }
    }
  }
}
```

Co-locating them with `Sidebar.js` collapses a 3-hop chain to 1.

### CLS prevention — the inline boot script

`ChatHost` is `client:idle`, so React hydration fires *after* LCP. If
hydration is what sets `data-mode`, the page paints with the page default,
then shifts when stored preference is read. That's CLS.

The fix is the same pattern as the existing theme bootstrap (lines 18-41
of `Layout.astro`): an inline `<script is:inline>` in the `<head>` that
reads `localStorage` and sets `data-mode` on `#chat-root` before paint.

```astro
<!-- in <head>, before the body renders -->
<script is:inline define:vars={{ pageDefault: chat, lock: chatLock }}>
  try {
    let mode = pageDefault
    if (!lock) {
      const stored = localStorage.getItem('one:chat-mode')
      if (stored && ['wide','rail','icon','none'].includes(JSON.parse(stored))) {
        mode = JSON.parse(stored)
      }
    }
    // Mobile collapse — match the CSS @media breakpoint exactly
    if ((mode === 'wide' || mode === 'rail') && window.matchMedia('(max-width: 768px)').matches) {
      mode = 'icon'
    }
    document.documentElement.dataset.chatMode = mode
  } catch {
    document.documentElement.dataset.chatMode = pageDefault
  }
</script>
```

The CSS keys off `html[data-chat-mode]` instead of `#chat-root[data-mode]`:

```css
html[data-chat-mode="wide"] #chat-root {
  grid-template-columns: minmax(0, 55fr) clamp(480px, 45vw, 720px);
}
html[data-chat-mode="rail"] #chat-root {
  grid-template-columns: minmax(0, 75fr) clamp(320px, 25vw, 420px);
}
html[data-chat-mode="icon"] #chat-root,
html[data-chat-mode="none"] #chat-root {
  grid-template-columns: 1fr 0;
}
```

When `ChatHost` hydrates, it reads `document.documentElement.dataset.chatMode`
as its initial state — DOM is already source of truth, no swap, no CLS.

### Reserve space, never measure

- **Rail width is `clamp(...)`** — no JS measurement, no `useLayoutEffect` sizing. The CSS computes it before paint.
- **Icon button is fixed-position with explicit `width: 56px; height: 56px`** — never relies on content sizing.
- **Popover is fixed-position with explicit dimensions** (`width: 380px; height: 560px`) — opens over content without reflowing it.
- **Mode switch never resizes content** — switching between wide/rail keeps the grid template, only the column ratio changes; the content column has `min-width: 0` so it absorbs the change without reflowing children that have intrinsic widths.
- **Skeleton states reserve final dimensions** — message list has `min-height` matching expected content; input has fixed height; avatars are explicit 24/32px.
- **Fonts use `font-display: optional`** — no FOUT, no FOIT-induced shift. If the brand font misses its window, system stack stays.
- **Images in chat (`<img>`) require `width` + `height` attributes** — enforced via Biome rule.

### Hydration strategy

```
client:load   →  nothing in this layout uses it
client:idle   →  ChatHost (mode resolution + switcher only — small)
client:visible→  ChatRail content when mode is wide/rail (defers Chat.tsx + ai-sdk)
client:idle   →  ChatWidget when mode is icon (popover code only on demand)
```

Result: icon-mode pages ship the bubble button as static HTML + a tiny
hydration shim. Real `<Chat />` code (~25KB) only enters the bundle when
the user opens the popover or the page mode is a rail.

### `contain` + `content-visibility`

```css
#chat-root .chat-rail { contain: layout style; }
.chat-message-list   { content-visibility: auto; contain-intrinsic-size: 1px 800px; }
```

Off-screen messages don't paint or hit-test. Internal chat updates
(streaming tokens) can't escape and ripple into the page grid.

### Verification

- `bun run build` then Lighthouse-CI on `/` (icon), `/chat` (wide), `/wallet` (rail), `/legal` (none) — gate at 100/100/100/100.
- Manual: open DevTools Performance, record a navigation, check the Layout Shift track is empty.
- Manual: throttle to Slow 4G + 4× CPU, reload `/chat` with stored pref `none` — no flash of rail then collapse.

---

## Don't

- Don't import `<Chat />` directly in a page. Set `chat="..."` instead.
- Don't add a 5th mode. If a new geometry is needed, justify it here first.
- Don't make rail widths user-configurable beyond the four presets. The numbers are design constraints, not settings.
- Don't render two modes at once. The host picks one.
- Don't tint the rail differently from a card. It's L1 (`--color-background`) with a left border. Same surface as any sidebar.
- Don't put scrollable content directly in `body` when using rail modes — the rail's `position: sticky` only works if the body is the scroll container.
- Don't persist mode in a cookie. It's UI state, not session state. `localStorage` is correct.

---

## Implementation order

1. Add `chat` + `chatLock` props to `Layout.astro`; emit grid markup keyed off `html[data-chat-mode]`
2. Add inline `<script is:inline>` boot script that resolves mode from `localStorage` + page default + mobile breakpoint, writes `data-chat-mode` to `<html>` before paint
3. Build `ChatHost.tsx` (`client:idle`) — reads DOM dataset for initial state, owns switcher writes, persists to `localStorage`
4. Add `mode: 'popover' | 'rail-25' | 'rail-45'` to `Chat.tsx`; chrome conditionals + switcher row; dynamic-import the heavy parts so icon/none pages don't pay
5. Update routes per the assignment table; lock `/legal` and `/privacy` to `none`
6. Run Lighthouse-CI gate (100/100/100/100 on `/`, `/chat`, `/wallet`, `/legal`); record DevTools perf trace, confirm Layout Shift track is empty

Each step is a `lean` deliverable per `template-plan.md` §0 — spec is
locked, files are known, exit is binary (renders correctly at 768px,
1280px, and 1920px; preference round-trips through reload).

---

*One layout. Four modes. Same `<Chat />`. Page proposes, user disposes, mobile decides.*
