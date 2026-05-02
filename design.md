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

## Cards + buttons

The only two compositions that matter.

```
Card
├─ background      outer surface
└─ foreground      inner content rectangle
   └─ font         text inside
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
  --color-border: color-mix(in oklab, var(--color-font) 10%, transparent);
  --color-muted:  color-mix(in oklab, var(--color-font) 60%, transparent);
  --color-ring:   var(--color-primary);
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
- Don't reach for a custom border or muted-text color — `var(--color-border)` and `var(--color-muted)` (or `text-font/60`) cover every case.

---

*6 editable. 5 invariants. 6 derived. 6 button variants. 1 card. One palette per workspace.*
