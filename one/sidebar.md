# sidebar.md — Left rail navigation

The sidebar is a left rail of the page shell — the same way `layout.md` owns
the chat axis on the right, this owns the **nav axis on the left**. It is
adapted from [`salimi-my/shadcn-ui-sidebar`](https://github.com/salimi-my/shadcn-ui-sidebar)
(MIT) but stripped down to fit our stack: 6 tokens, lucide-only icons,
React 19 islands inside Astro 6, every onClick is a signal.

```
┌─ sidebar=full ───────┬────────────────────────┬─ chat=split ─┐
│ ▶ ONE                │                        │              │
│   logo               │                        │              │
│ ────                 │                        │              │
│ ▤ Dashboard          │       <slot />         │   <Chat/>    │
│ ▤ Chat               │      (content)         │              │
│ ▣ Wallet      ▾      │                        │              │
│   ├ Balance          │                        │              │
│   └ Activity         │                        │              │
│ ▤ Settings           │                        │              │
│ ────                 │                        │              │
│ ◐ user · sign out    │                        │              │
└──────────────────────┴────────────────────────┴──────────────┘
   sidebar              content                    chat rail
```

Three independent axes: **left = nav**, **center = content**, **right = chat**.
Each is set by one prop on `Layout.astro`. Pages don't import any of them.

---

## The four sidebar modes

| Mode | Geometry | When to use |
| --- | --- | --- |
| `none` | No sidebar mounted | Marketing pages (`/`, `/legal`) where nav is the top bar |
| `mini` *(default for app)* | 72px rail, icons only, hover/click reveals labels in a popover | Dense tools, `/wallet`, `/buy`, `/sell` |
| `full` | 240px rail, icons + labels, collapsible groups | App home, `/chat`, dashboards |
| `sheet` | Hidden; opens as a drawer over content (mobile only) | Below `md` (768px); a hamburger replaces the rail |

The desktop user toggles `mini ↔ full` from a chevron handle. The phone gets
`sheet` automatically. `none` is a page-level decision.

---

## The contract

`Layout.astro` learns one prop, mirroring `chat`:

```astro
---
interface Props {
  title: string
  description?: string
  chat?: 'none' | 'icon' | 'split'      // existing — see layout.md
  sidebar?: 'none' | 'mini' | 'full'    // new — defaults to 'none'
}
const { title, chat = 'icon', sidebar = 'none' } = Astro.props
---

<body data-chat={chat} data-sidebar={sidebar}>
  {sidebar !== 'none' && <Sidebar client:load initial={sidebar} />}
  <div class="page-grid">
    <main class="page-grid__content"><slot /></main>
    {chat === 'split' && <aside class="page-grid__rail">
      <Chat client:load mode="rail" />
    </aside>}
  </div>
  {chat === 'icon' && <ChatWidget client:load />}
</body>
```

Sidebar opens *outside* `.page-grid` so it's always full-height and never
interferes with chat-split's right rail. CSS Grid on `body`:

```css
body[data-sidebar='mini'] { grid-template-columns: 72px 1fr; }
body[data-sidebar='full'] { grid-template-columns: 240px 1fr; }
body[data-sidebar='none'] { grid-template-columns: 1fr; }

@media (max-width: 768px) {
  body[data-sidebar='mini'],
  body[data-sidebar='full'] { grid-template-columns: 1fr; }
  /* sidebar component swaps to sheet mode internally */
}
```

Pages opt in:

```astro
<Layout title="Dashboard" sidebar="full">
<Layout title="Wallet" sidebar="mini" chat="split">
<Layout title="Home"> <!-- both default; no rail -->
```

---

## File layout

Mirrors the upstream repo, dropped into our paths:

```
web/src/
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.tsx          ← root island; reads `initial` prop
│   │   ├── Menu.tsx             ← scrollable group list
│   │   ├── MenuItem.tsx         ← one row (icon + label + chevron)
│   │   ├── CollapseGroup.tsx    ← submenu accordion
│   │   ├── SidebarToggle.tsx    ← chevron handle on the outer edge
│   │   └── SheetMenu.tsx        ← mobile drawer (uses ui/Sheet)
│   └── ui/
│       └── Sheet.tsx            ← shadcn primitive (new — add via /shadcn)
├── hooks/
│   ├── use-sidebar.ts           ← localStorage-backed open/closed state
│   └── use-store.ts             ← SSR-safe selector (zustand pattern, no zustand dep)
└── lib/
    └── menu.ts                  ← getMenu() — typed groups + items
```

We do **not** install zustand. The upstream `useSidebarToggle` is ~10 lines
of `useState + localStorage`; we reproduce it directly. Astro's island
boundary already isolates state — there's no second consumer that needs a
shared store.

---

## The menu data structure

Single source of truth, typed, lives in `web/src/lib/menu.ts`:

```ts
import { LayoutDashboard, MessageSquare, Wallet, Settings, type LucideIcon } from 'lucide-react'

export interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  active?: (pathname: string) => boolean
  submenus?: Array<{ href: string; label: string }>
}

export interface MenuGroup {
  label: string | null   // null = no header (top group)
  items: MenuItem[]
}

export function getMenu(pathname: string): MenuGroup[] {
  return [
    {
      label: null,
      items: [
        { href: '/', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/chat', label: 'Chat', icon: MessageSquare },
      ],
    },
    {
      label: 'Money',
      items: [
        {
          href: '/wallet', label: 'Wallet', icon: Wallet,
          submenus: [
            { href: '/wallet', label: 'Balance' },
            { href: '/wallet/activity', label: 'Activity' },
          ],
        },
      ],
    },
    {
      label: 'Account',
      items: [{ href: '/settings', label: 'Settings', icon: Settings }],
    },
  ]
}
```

Adding a route = one entry. Reordering = move a line. No registration.

---

## State (no zustand)

```ts
// web/src/hooks/use-sidebar.ts
import { useEffect, useState } from 'react'

const KEY = 'sidebarOpen'

export function useSidebar(initial: 'mini' | 'full') {
  const [open, setOpen] = useState(initial === 'full')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved !== null) setOpen(saved === 'true')
  }, [])

  const toggle = () => {
    setOpen((v) => {
      const next = !v
      localStorage.setItem(KEY, String(next))
      emitClick('ui:sidebar:toggle', { open: next })
      return next
    })
  }

  return { open, toggle }
}
```

SSR-safe: `useState(initial)` matches what Astro renders; the `useEffect`
hydrates the user's saved choice on the client. No flash because the rail
width is set on `<body>` from `data-sidebar`, which the layout reads from
the `sidebar` prop, not from React state.

---

## Styling — design tokens only

The upstream repo uses shadcn's `accent`, `muted`, `popover`, etc. We map
to **our 6 tokens** (per `.claude/rules/design.md`):

| Upstream class | Our class | Why |
| --- | --- | --- |
| `bg-background` | `bg-background` | L1 surface — sidebar is a card |
| `bg-accent` | `bg-foreground` | L2 — active row sinks into the rail |
| `text-muted-foreground` | `text-font/60` | Inactive labels |
| `text-accent-foreground` | `text-font` | Active labels |
| `border` | `border` w/ `var(--color-border)` | Section dividers |
| `ring-ring` | `ring-primary` | Focus |

```tsx
// MenuItem.tsx — a row
<a
  href={item.href}
  onClick={() => emitClick('ui:sidebar:nav', { href: item.href })}
  className={cn(
    'flex items-center gap-3 rounded-lg px-3 py-2 text-font/60 transition',
    'hover:bg-foreground hover:text-font',
    isActive && 'bg-foreground text-font',
  )}
  style={{ transitionDuration: 'var(--ease)' }}
>
  <Icon icon={item.icon} size="md" />
  {open && <span className="text-sm">{item.label}</span>}
</a>
```

Active state uses our existing `bg-foreground` (L2) — the row sinks back
into the rail, exactly the same trick `design.md`'s form fields use to
make inputs read as interactive. No new tokens needed.

---

## Icons — lucide only

The upstream repo already uses lucide-react. We keep it, but route every
icon through our `<Icon>` wrapper (locked stroke 1.5, sized scale). The
sidebar never inlines SVG, never reaches for another icon set. The
existing `Icon` and `IconBadge` in `web/src/components/ui/` cover every
case the sidebar needs.

---

## Click signals (every row)

Per `.claude/rules/ui.md`, every onClick emits before the local handler:

```
ui:sidebar:toggle    { open: boolean }     ← chevron handle
ui:sidebar:nav       { href }              ← any menu link
ui:sidebar:expand    { group }             ← collapse-group open
ui:sidebar:collapse  { group }             ← collapse-group close
ui:sidebar:sheet     { open: boolean }     ← mobile drawer
```

Receiver naming: `ui:sidebar:<action>`, sensitivity public, lifecycle
active. No TypeDB entry needed — ADL gate passes through.

---

## Astro integration — the island boundary

The whole sidebar is **one** React island (`<Sidebar client:load />`).
Sub-components don't need their own islands; they all live inside the
single hydration boundary. This matters because:

- One island = one state tree = open/closed propagates without prop drilling
- `client:load` (not `client:visible`) because the user expects the rail to
  be interactive immediately on first paint — same priority as `Chat`
- The rail's *width* is owned by `Layout.astro` via `data-sidebar`, not by
  React. Astro renders the right grid on the server; React just paints
  the contents. No layout shift.

Page authors never touch `<Sidebar />` directly. They flip `sidebar="full"`.

---

## Why not just clone the repo?

Three concrete reasons we **port the shape, not the code**:

1. **Tokens.** Upstream uses ~12 shadcn color names; we have 6 tokens plus
   derived helpers. A direct copy would emit zero CSS for half its classes
   thanks to our `--color-*: initial` build-time kill. Porting the palette
   row-by-row is cheaper than maintaining a token-translation layer.
2. **Astro vs Next.** `usePathname()` from `next/navigation` doesn't exist
   here. We read `Astro.url.pathname` and pass it as a prop to the island,
   or use `window.location.pathname` inside `useEffect`. Trivial change but
   pervasive — every active-state check needs it.
3. **No zustand.** The store is a single boolean. A 1KB dependency for one
   `useState` is the kind of bloat the design system rules guard against.

What we keep verbatim: the *menu data shape* (groups → items → submenus),
the *collapse animation* (CSS-only with `grid-template-rows: 0fr/1fr`),
the *sheet drawer* pattern, and the `getMenu(pathname)` factory.

---

## Implementation order (lean cycle)

Per `template-plan.md` §0 classifier — spec locked, variance known, exit
binary, files known → **lean**.

1. Add `web/src/components/ui/Sheet.tsx` (shadcn primitive — `npx shadcn@latest add sheet` won't run cleanly under bun; copy the file)
2. Add `web/src/lib/menu.ts` with the 5 starter routes above
3. Add `web/src/hooks/use-sidebar.ts` (10 lines — localStorage + emitClick)
4. Add `web/src/components/sidebar/{Sidebar,Menu,MenuItem,CollapseGroup,SidebarToggle,SheetMenu}.tsx`
5. Add `sidebar` prop + grid CSS to `Layout.astro` (next to existing `chat` prop)
6. Flip `chat.astro` to `sidebar="full"`, leave `index.astro` at default `none`
7. Verify: ① mini→full toggle persists across reload, ② `<768px` shows sheet, ③ `bun run typecheck` clean, ④ `.claude/hooks/design-check.sh` passes (no banned palette classes), ⑤ active row uses `bg-foreground`

Exit: rail renders on `/chat` at full and mini, mobile shows sheet, no
console errors, no design-check violations.

---

## Pages × sidebar (initial assignment)

| Route | sidebar | chat | Reason |
| --- | --- | --- | --- |
| `/` | `none` | `icon` | Marketing — top nav only |
| `/chat` | `full` | `split` | App-mode: nav left, chat right, content in the middle |
| `/wallet`, `/buy`, `/sell` | `mini` | `split` | Dense workspaces — icons free up width |
| `/settings` | `full` | `icon` | Form-heavy, full labels help orientation |
| `/design`, `/legal` | `none` | varies | Showcase / docs — no app chrome |

A page can flip both axes independently. The grid math always works:
sidebar takes from the left, chat-split takes from the right, content
gets what's left with `min-width: 0` so it never blows out.

---

## Don't

- Don't pull in zustand. The state is one boolean per device.
- Don't import shadcn classes (`bg-accent`, `text-muted-foreground`). Map
  to our 6 tokens; the build will eat anything else silently.
- Don't make sidebar a 5th mode of `Layout`'s `chat` prop. Nav and chat
  are orthogonal axes — keep them as two props.
- Don't add a 5th sidebar mode (`overlay`, `floating`, etc.). If the
  current 4 don't fit, justify it in this doc first.
- Don't render the active route via `useEffect` + `setState` — it causes
  a flash of the wrong row on first paint. Pass `pathname` as a prop from
  Astro and let React rehydrate with the same value.
- Don't put the sidebar inside `.page-grid`. It needs to span full body
  height and sit *outside* the chat-split column track.
- Don't put scrollable content directly in the rail without a flex-1
  inner div — the sticky-on-body pattern means the rail itself is the
  full viewport; only its menu list scrolls.
- Don't emit click signals from `<a href>` rows that already trigger an
  Astro page transition — the route change is the signal (per
  `.claude/rules/ui.md` exemption). Keep `emitClick` on the toggle,
  collapse-group, and sheet handles only.

---

## See also

- [`layout.md`](layout.md) — the chat axis; sidebar mirrors its shape
- [`design.md`](design.md) — the 6 tokens; this doc consumes them
- `.claude/rules/design.md` — the build-time kill that enforces tokens
- `.claude/rules/ui.md` — `emitClick` contract
- [salimi-my/shadcn-ui-sidebar](https://github.com/salimi-my/shadcn-ui-sidebar) — upstream shape reference (MIT)

---

*One layout. Two rails. Three columns. Six tokens. Zero new dependencies.*
