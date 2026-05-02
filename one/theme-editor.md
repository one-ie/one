# Theme Editor

Click a swatch on `/design`. Pick a color. The whole site updates. Reload keeps it.

**Edits:** [`design.md`](design.md) tokens · **Surface:** [`web/src/pages/design.astro`](web/src/pages/design.astro) · **Boot:** [`web/src/layouts/Layout.astro`](web/src/layouts/Layout.astro)

---

## Why it's simple

Every component on the site already reads `var(--color-*)`. Overwrite the var on `:root` once → every page, every island, every island's children update. No framework, no library, no build step.

```
swatch click → <input type="color"> → setProperty('--color-X', hsl)
                                        │
                                        └→ localStorage['one:theme']
                                              │
                                              └→ Layout.astro inline boot re-applies (no FOUC)
```

---

## Tasks

**1. `web/src/pages/design.astro`** — wrap each `.swatch` in a `<label>` with a hidden `<input type="color">`. On `input`: hex→hsl, write `:root` style, save to localStorage. Two-swatch tokens (background/foreground/font) edit each mode independently; brand tokens (primary/secondary/tertiary) write the same value to both modes (per `design.md`: brand doesn't flip with mode). One `Reset` ghost button next to the mode toggle.

**2. `web/src/layouts/Layout.astro`** — add a 12-line inline `<script is:inline>` in `<head>` before stylesheets. Reads `localStorage['one:theme']`, calls `setProperty` for each token. Sync, pre-paint, no FOUC. Inline (not imported) because that's the only way it runs before first paint.

**3. Hex↔HSL** — two small functions, inline in the design.astro `<script>`. ~15 LOC, no library.

That's it. No new files.

---

## Done when

- Click `primary` swatch on `/design`, pick orange → CTAs across `/`, `/chat`, etc. are orange.
- Reload any page → still orange.
- Click `Reset` → defaults restore everywhere.
- `bun run verify` passes.
- No new color literals introduced (the editor only writes the 6 documented vars; `.claude/hooks/design-check.sh` stays green).

---

## Not in scope

- Image/URL extraction → later, separate cycle.
- Server persistence, sharing, export → later.
- Animations, undo history, preview-before-apply → the live-write IS the preview; Reset is the undo.
- A 7th token → forbidden by `design.md`.

---

*The showcase becomes the editor. 6 pickers. One reload-survives-everything.*
