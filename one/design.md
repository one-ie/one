# ONE Design System

6 colors. Extract from any site. Apply everywhere. Built on shadcn/ui.

**Principle:** collapse shadcn's ~20-token surface to **6 extractable tokens**. Any website's brand maps to these six. Everything else is derived.

---

## The 6 tokens

| Token | Role | Light (HSL) | Dark (HSL) |
| --- | --- | --- | --- |
| `background` | Card surface · sidebar | `0 0% 93%` | `0 0% 10%` |
| `foreground` | Content area inside card | `0 0% 100%` | `0 0% 13%` |
| `font` | Body text · readable in both modes | `0 0% 13%` | `0 0% 100%` |
| `primary` | Main CTA · buttons | `216 55% 25%` | `216 55% 25%` |
| `secondary` | Supporting actions | `219 14% 28%` | `219 14% 28%` |
| `tertiary` | Accent (was shadcn `accent`) | `105 22% 25%` | `105 22% 25%` |

Surface tokens (`background`, `foreground`, `font`) flip with light/dark. Brand tokens (`primary`, `secondary`, `tertiary`) don't — brand is mode-agnostic.

Naming: `background` is the outer card/panel; `foreground` is the inner content rectangle. Light mode: outer gray, inner white. Dark mode flips.

---

## What's editable, what's derived, what's invariant

**6 editable** (the picker on `/design` writes these):

```
background  foreground  font  primary  secondary  tertiary
```

**5 invariants** (never editable, no picker, no flip with mode):

```
white         #fff               (text on brand fills, fallback)
black         #000               (text on light brand fills)
transparent   transparent
destructive   hsl(0 70% 50%)     (errors, deletes)
success       hsl(140 60% 40%)   (confirms, completes)
```

**6 derived** (auto-computed from the editable 6 — never set directly):

```
on-primary    auto              white if L(primary)   < 60%, else black
on-secondary  auto              white if L(secondary) < 60%, else black
on-tertiary   auto              white if L(tertiary)  < 60%, else black
border        font @ 10% alpha  every card/divider/chip border
muted         font @ 60% alpha  secondary text, hints
ring          = primary         focus-visible outline (global)
```

The `on-*` tokens make brand fills safe to edit: pick a yellow primary and the button label flips to black automatically. Buttons use `color: var(--color-on-primary)`, never `text-white`.

Renames from stock shadcn:
- `accent` → `tertiary` — ordinal naming alongside primary/secondary
- `card` / `popover` → fold into `background` (same surface)
- `card-foreground` / `popover-foreground` → fold into `font`

---

## Extraction

Any website's brand maps to these 6:

1. **background** — dominant card / panel surface
2. **foreground** — innermost content rectangle
3. **font** — body text color (must contrast `foreground`)
4. **primary** — the most-used CTA color
5. **secondary** — second-most-used button / chip color
6. **tertiary** — accent / highlight (links, badges, success)

Anything beyond these six is derived or noise.

---

## Depth — three levels, no new tokens

Polish lives in clear depth. The system has exactly three:

| Level | Surface | Lives in | What sits here |
| --- | --- | --- | --- |
| **L0 page** | `--color-page` (= `background` mixed with 4% `font`) | The page shell | `<body>`, full-bleed layout |
| **L1 card** | `--color-background` | Cards, sidebar, popovers, dropdowns, sheets | The container the user reads inside |
| **L2 content** | `--color-foreground` | Card body, code blocks, tables, raised content | The rectangle the data sits on |

Three surfaces, total. **The sidebar is L1** (a card pinned to the edge). **The page is L0** (one shade off the card so the card edge is visible). **The card body is L2** — the brightest surface, where content reads cleanly. **Inputs are L1** sunken back inside the body — they stand out as interactive surfaces because they don't match the body. No "muted background", no "subtle background", no fourth tier — and never `bg-zinc-50/100/200`.

`--color-page` is auto-derived in `Layout.astro` so every route gets the same depth without per-page hacks.

---

## Card anatomy

One shape, three slots. Header and footer share the card's surface — adding a tint to either creates a 4th depth and breaks the rule.

```
┌─ card  (L1: background, 16px radius, 1px border, shadow-card)  ┐
│                                                                │
│  header   title · meta · badge / action                        │
│                                                                │
│  ┌─ body  (L2: foreground, 10px radius)  ─────────────┐        │
│  │  data, inputs, charts, code, lists                  │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                │
│  ─── divider (border) ─────────────────────────────────        │
│                                                                │
│  footer   primary action · secondary action · meta             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Slot | Surface | Padding | Notes |
| --- | --- | --- | --- |
| Card | `background` | `24px` outer, `gap: 16px` between slots | `border: 1px solid border`, `radius: 16px`, `shadow-card` |
| Header | transparent (= card) | top of card | Title 18/700, meta in `muted`, badge top-right |
| Body | `foreground` | `16-20px` | Sits inside card padding, `radius: 10px` |
| Footer | transparent (= card) | bottom of card | `border-top: 1px solid border`, action row right-aligned |

A card without a body rectangle is allowed — small chips, stat cards, profile cards. But never two body rectangles stacked: combine, or split into two cards.

---

## Forms

Inputs use **`background`**, not `foreground`. The card body is `foreground` (the brighter surface); inputs sink back to `background` so they stand out as recessed, interactive surfaces — distinct from the body in both light and dark modes.

```
card outer  background   ← chrome
card body   foreground   ← raised content surface
inputs      background   ← sunken interactive surface (cut back into the body)
```

Same shape, same radius, same focus treatment. The depth difference is what makes them legible.

```css
input, textarea, select {
  background: var(--color-background);    /* sunken — stands out against foreground body */
  color: var(--color-font);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);        /* 10px */
  padding: 10px 14px;
  font: inherit;
  transition: border-color var(--ease), box-shadow var(--ease);
}

input:hover                  { border-color: var(--color-border-strong); }
input:focus-visible          { outline: none; border-color: var(--color-ring);
                                box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-ring) 25%, transparent); }
input::placeholder           { color: var(--color-muted); }
input:disabled               { opacity: 0.5; cursor: not-allowed; }
input[aria-invalid='true']   { border-color: var(--color-destructive); }
```

Field group composition (label + control + helper):

```
label    14px / 500 weight / color: font / margin-bottom: 6px
control  40px tall (10+20+10) / radius-md / 14px text
helper   12px / color: muted / margin-top: 6px
error    12px / color: destructive / margin-top: 6px
```

Variants (no new tokens):

| Control | Off | On / Active |
| --- | --- | --- |
| Checkbox / radio | 16px box, `background` bg, `border-strong` outline | `primary` bg, `on-primary` check |
| Switch | track `font @ 20%`, knob `foreground` | track `primary`, knob `on-primary` |
| Select | same as input + chevron in `muted` | open: same focus ring |
| Textarea | same as input, min-height: 96px | resize: vertical only |

---

## Icons

One source: **`lucide-react`**. 1.5px stroke · round caps · 24×24 viewBox · monochrome via `currentColor`. No mixing icon sets.

Two components, in `web/src/components/ui/`:

```tsx
// Inline icon — inherits color from parent
<Icon icon={Send} size="md" />          // sm 14 · md 16 · lg 20 · xl 24

// Colored badge — used in feature grids, list rows
<IconBadge icon={Zap} tone="primary" size="md" />  // sm 36 · md 44 · lg 56
```

`IconBadge` derives its surface entirely from tokens — no hardcoded colors:

```
background  = color-mix(tone 14%, foreground)   // brighter than card outer, tinted
border      = color-mix(tone 28%, border)        // strong enough to define edge
icon color  = var(--color-tone)                  // pure tone, max legibility
```

`tone` is `primary` · `secondary` · `tertiary` · `neutral`. Neutral uses `foreground` bg and `font` color (no tint) — for utility icons, not feature highlights.

In Astro pages (no React), use inline SVG with the same shape: `viewBox="0 0 24 24"`, `stroke="currentColor"`, `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`. The `/design` mode toggle does this for sun/moon/chevron — copy from there. Never use unicode glyphs (☀ ☾ ▾) — they render differently across OSes.

### Don't

- Don't import individual SVGs from other icon sets (heroicons, fontawesome, phosphor) — visual style drifts immediately.
- Don't hardcode pixel sizes — use the `size` prop.
- Don't override `strokeWidth` per-icon — the system stroke is 1.5; brand consistency lives in that one number.
- Don't use icons larger than `xl` (24px) inline — switch to `IconBadge` if you need presence.

---

## Polish constants

These are baked into components, not exposed to the picker. They are derived from the 6 tokens:

```
radius     --radius-sm: 6px      chips, dots, tiny pills
           --radius-md: 10px     buttons, inputs, body rectangle
           --radius-lg: 16px     cards, sheets, dialogs

shadow     --shadow-card: 0 1px 2px font@6%        cards, popovers — flat-but-grounded
           --shadow-pop:  0 4px 16px font@10%      menus, modals only

focus      outline: 2px solid ring + offset: 2px   global, on every focusable
form-focus border = ring + box-shadow: 0 0 0 3px ring@25%   inputs (more visible)

motion     --ease: 120ms ease                      color, border, filter, transform
                                                    (no animation longer than 200ms)

space      4 · 8 · 12 · 16 · 20 · 24 · 32          all paddings/gaps land on this scale
type       12 · 14 · 16 · 18 · 22 · 32 · 56        line-height: 1.5 body, 1.2 headings
```

If you find yourself wanting a 7px radius or a 19px gap, snap to the nearest scale value. Polish is the absence of off-scale values.

---

## Cards + buttons

The only two compositions that matter.

```
Card
├─ header     transparent (= background)
├─ body       foreground rectangle, 10px radius
└─ footer     transparent, border-top divider
   └─ Buttons
      ├─ primary    (filled, main CTA)
      ├─ secondary  (filled, supporting)
      ├─ tertiary   (filled, accent)
      ├─ outline    (border = primary, transparent fill)
      ├─ ghost      (no border, no fill, font color)
      └─ inverse    (bg = font, text = foreground — flips the surface)
```

Six button variants. `outline`, `ghost`, `inverse` are all derived — no new tokens. `inverse` reads as white-on-dark in dark mode and dark-on-light in light mode (it's the font color used as a fill).

---

## CSS variables

Source of truth: `web/src/layouts/Layout.astro` (`@theme` block).

```css
@theme {
  --color-*: initial;  /* wipes Tailwind defaults — wrong colors emit no CSS */

  /* Invariants */
  --color-white: #fff;
  --color-black: #000;
  --color-transparent: transparent;
  --color-destructive: hsl(0 70% 50%);
  --color-success:     hsl(140 60% 40%);

  /* The 6 editable tokens */
  --color-background: hsl(0 0% 93%);
  --color-foreground: hsl(0 0% 100%);
  --color-font:       hsl(0 0% 13%);
  --color-primary:    hsl(216 55% 25%);
  --color-secondary:  hsl(219 14% 28%);
  --color-tertiary:   hsl(105 22% 25%);

  /* Derived — overwritten by the editor at runtime */
  --color-on-primary:   #fff;
  --color-on-secondary: #fff;
  --color-on-tertiary:  #fff;
}

/* Plain CSS vars — Tailwind v4 can't resolve var() inside @theme, so derived
   helpers that reference other tokens live here. Use via var() in CSS, not
   as Tailwind utilities. */
:root {
  --color-border:        color-mix(in oklab, var(--color-font) 10%, transparent);
  --color-border-strong: color-mix(in oklab, var(--color-font) 20%, transparent);
  --color-muted:         color-mix(in oklab, var(--color-font) 60%, transparent);
  --color-faint:         color-mix(in oklab, var(--color-font) 40%, transparent);
  --color-ring:          var(--color-primary);

  /* Depth: page sits one shade off the card surface */
  --color-page:    color-mix(in oklab, var(--color-background) 96%, var(--color-font));

  /* Polish constants */
  --radius-sm:    6px;
  --radius-md:    10px;
  --radius-lg:    16px;
  --shadow-card:  0 1px 2px color-mix(in oklab, var(--color-font) 6%, transparent);
  --shadow-pop:   0 4px 16px color-mix(in oklab, var(--color-font) 10%, transparent);
  --ease:         120ms ease;
}

html.dark {
  --color-background: hsl(0 0% 10%);
  --color-foreground: hsl(0 0% 13%);
  --color-font:       hsl(0 0% 100%);
  /* brand tokens unchanged — brand is mode-agnostic */
}

:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}
```

## Live editor

Visit `/design`. Click any of the 6 swatches. Picker → live update → `localStorage['one:theme']` persists across pages and reloads. Mode preference persists too. Reset button restores defaults. The `on-*` contrast labels are recomputed on every pick — pick yellow, button text goes black, automatically.

---

## Don't

- Don't introduce a 7th extractable token — derive it.
- Don't use shadcn's `accent` name; it's `tertiary` here.
- Don't flip brand colors with mode — only surfaces flip.
- Don't fork a component to recolor — change the token.
- Don't hardcode `text-white` or `color: #fff` on brand fills — use `var(--color-on-{primary|secondary|tertiary})` so contrast stays correct under user picks.
- Don't reach for a custom border or muted-text color — `var(--color-border)`, `var(--color-border-strong)`, `var(--color-muted)`, `var(--color-faint)` cover every case.
- Don't add a 4th depth level. Page (L0) → card (L1) → content (L2). A card header is not a 4th surface — it shares the card.
- Don't tint a card header or footer with its own background — they share the card surface. If you feel the urge, the answer is more padding or a divider.
- Don't pick off-scale radii or spacing. Snap to 6/10/16 (radius) and 4/8/12/16/20/24/32 (space). Polish is the absence of off-scale values.
- Don't animate longer than 200ms. Use `var(--ease)` (120ms) for color/border/filter; UI motion is feedback, not choreography.

---

*6 editable. 5 invariants. 6 derived. 3 depths. 1 card shape. 6 button variants. 1 input shape. One palette per workspace.*
