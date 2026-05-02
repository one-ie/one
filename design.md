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

## Mapping to shadcn

shadcn ships ~20 tokens. We expose 6. The rest are derived:

```
primary-light, primary-dark      ← lighten/darken primary by fixed L delta
secondary-light, secondary-dark  ← same, from secondary
tertiary-light, tertiary-dark    ← same, from tertiary
ring                             = primary-dark
border                           = background ± 8% L
muted                            = background ± 4% L
destructive                      = fixed red (not extractable)
```

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

```css
:root {
  --background: 0 0% 93%;
  --foreground: 0 0% 100%;
  --font:       0 0% 13%;
  --primary:    216 55% 25%;
  --secondary:  219 14% 28%;
  --tertiary:   105 22% 25%;
}

.dark {
  --background: 0 0% 10%;
  --foreground: 0 0% 13%;
  --font:       0 0% 100%;
  /* brand tokens unchanged */
}
```

---

## Don't

- Don't introduce a 7th extractable token — derive it.
- Don't use shadcn's `accent` name; it's `tertiary` here.
- Don't flip brand colors with mode — only surfaces flip.
- Don't fork a component to recolor — change the token.

---

*6 tokens. 6 button variants. 1 card shape. One palette per workspace.*
