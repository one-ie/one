# Design System Rules

Apply to `web/**/*.tsx`, `web/**/*.astro`, `web/**/*.css`

The design system is **6 tokens**. Spec: [`design.md`](../../design.md). Showcase: `/design`.
The build itself enforces this — `--color-*: initial` in `Layout.astro` strips Tailwind's
default palette so wrong colors emit no CSS. Don't fight the enforcement.

---

## The 6 editable tokens (the only colors a user can pick)

| Token | Use for |
| --- | --- |
| `background` | Card surfaces, sidebars, page-level panels |
| `foreground` | Inner content rectangles inside cards |
| `font` | All body text |
| `primary` | Main CTAs, brand accents, focus rings |
| `secondary` | Supporting actions, secondary buttons |
| `tertiary` | Highlights, success checks, accents |

## Plus 5 invariants (never editable)

`white` · `black` · `transparent` · `destructive` (errors/deletes) · `success` (confirms).

## Plus 6 derived (auto-computed — don't set directly)

`on-primary` · `on-secondary` · `on-tertiary` (auto-contrast labels for brand fills) · `border` (= font @ 10%) · `muted` (= font @ 60%) · `ring` (= primary).

---

## Allowed utilities

```
bg-{background|foreground|primary|secondary|tertiary|destructive|success|white|black|transparent}
text-{font|primary|secondary|tertiary|on-primary|on-secondary|on-tertiary|destructive|success|white|black}
border-{font|primary|secondary|tertiary}
ring-{primary|secondary|tertiary}
```

**Use the auto-contrast `on-*` labels on brand fills** — they stay readable when the user picks any color:

```tsx
<button className="bg-primary text-on-primary">Primary</button>
<button className="bg-tertiary text-on-tertiary">Tertiary</button>
```

For muted text, borders, and focus rings, use alpha modifiers or `var()` — these are CSS-only helpers, not Tailwind utilities:

```tsx
text-font/60                                        // muted body text
text-font/40                                        // disabled / placeholder
border-font/10                                      // subtle borders
bg-primary/20                                       // tinted brand backgrounds
style={{ borderColor: 'var(--color-border)' }}      // when alpha modifier won't fit
```

The `--color-{border,muted,ring}` CSS vars exist (defined in `Layout.astro`) but are not Tailwind tokens — Tailwind v4 chokes on `var()` references inside `@theme`. Use them via `var()` only when needed.

---

## Banned

- ❌ Any Tailwind palette class: `bg-zinc-*`, `text-indigo-*`, `border-slate-*`, `text-emerald-*`, etc.
- ❌ Hex literals in JSX/CSS: `#fff`, `#0a0a0f`, `style={{ color: '#abc' }}`
- ❌ Raw `hsl(...)` / `rgb(...)` outside `Layout.astro` (token source) and `design.astro` (showcase)
- ❌ Adding a 7th token. Derive with alpha modifiers or `color-mix()`.

---

## Patterns

### Card

```tsx
<div className="bg-background border border-font/10 rounded-xl p-6">
  {/* card content */}
  <div className="bg-foreground rounded-lg p-4">
    {/* inner content area */}
  </div>
</div>
```

### Buttons (6 variants)

```tsx
<button className="bg-primary text-white rounded-lg px-4 py-2 hover:brightness-110">Primary</button>
<button className="bg-secondary text-white rounded-lg px-4 py-2 hover:brightness-110">Secondary</button>
<button className="bg-tertiary text-white rounded-lg px-4 py-2 hover:brightness-110">Tertiary</button>
<button className="border border-primary text-font rounded-lg px-4 py-2">Outline</button>
<button className="text-font rounded-lg px-4 py-2">Ghost</button>
<button className="bg-font text-foreground rounded-lg px-4 py-2 hover:brightness-95">Inverse</button>
```

### Muted text

```tsx
<p className="text-font/60">Secondary copy</p>
<p className="text-font/40">Disabled / hint</p>
```

---

## Enforcement

Three layers, all automatic:

1. **Build-time kill** — `Layout.astro` declares `--color-*: initial` in `@theme`,
   wiping Tailwind's default palette. `bg-zinc-950` produces no CSS.
2. **PostToolUse hook** — `.claude/hooks/design-check.sh` greps every Write/Edit
   to `web/**/*.{tsx,astro,css}` for banned patterns. Exit 2 on violation feeds
   the diff back to Claude as a tool error; the model self-corrects next turn.
3. **This rule** — auto-loaded on the same files via `.claude/settings.json`,
   so the constraints are in context before the first character is written.

The hook allowlists `Layout.astro` (token source) and `design.astro` (showcase).
There is no opt-out for other files.

---

## Don't

- Don't introduce a 7th token. Derive instead.
- Don't use `text-zinc-*` etc. — they emit no CSS, but stop the next reader from trusting the codebase.
- Don't write `style={{ color: '...' }}` — break the token enforcement.
- Don't use shadcn's `accent` name; it's `tertiary` here.
- Don't flip brand colors with mode — only surfaces flip.

---

*6 tokens. 6 button variants. 1 card shape. The build refuses to compile anything else.*
