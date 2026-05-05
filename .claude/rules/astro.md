# Astro Rules

Apply to `*.astro`

---

## Structure

```
src/pages/       # Routes
src/layouts/     # Layouts
src/components/  # Components
```

---

## Frontmatter

```astro
---
interface Props {
  title: string
}
const { title } = Astro.props
---
```

Always TypeScript. Always typed.

---

## Hydration

```
┌────────────────────┬─────────────────────────────────────┐
│ client:load        │ Critical, above-fold, interactive   │
├────────────────────┼─────────────────────────────────────┤
│ client:visible     │ Below-fold, lazy                    │
├────────────────────┼─────────────────────────────────────┤
│ client:idle        │ Non-critical widgets                │
├────────────────────┼─────────────────────────────────────┤
│ client:only="react"│ Client-only, skip SSR               │
└────────────────────┴─────────────────────────────────────┘
```

---

## Islands

```astro
<!-- Static — no JS shipped -->
<AgentCard agent={agent} />

<!-- Interactive — hydrates -->
<AgentCard client:load agent={agent} onClick={handle} />

<!-- Lazy — hydrates when visible -->
<ColonyGraph client:visible highways={highways} />
```

Only add `client:*` when interactivity is needed.

---

## Imports

```astro
---
// Good — path aliases
import Layout from "@/layouts/Layout.astro"
import { ColonyEditor } from "@/components/graph/ColonyEditor"

// Bad — relative paths
import Layout from "../../../layouts/Layout.astro"
---
```

---

## Styles

```astro
<!-- Scoped -->
<style>
  .container { ... }
</style>

<!-- Global (sparingly) -->
<style is:global>
  .colony-graph { ... }
</style>

<!-- Tailwind (preferred) -->
<div class="bg-[#0a0a0f] p-4 rounded-lg">
```

---

## With Substrate

```astro
---
import Layout from "@/layouts/Layout.astro"
import { ColonyEditor } from "@/components/graph/ColonyEditor"
---

<Layout title="Colony">
  <ColonyEditor client:load />
</Layout>
```

- `client:load` — interactive graph needs JS
- Colony state lives in React component
- Astro handles routing, layout, SSR shell

---

---

## Performance — lazy imports inside islands

**Every `client:*` island ships its entire static import graph on first load.**
Any component not needed for the initial render that is statically imported will
block FCP/LCP.

**Rule:** Any heavy component inside a hydrated island that is NOT required for
first render MUST use `lazy()` + `Suspense`.

**Known heavy modules to always lazy-import inside islands:**

| Module | Why |
|--------|-----|
| `@/components/ai-elements/attachments` | ~281 KB — file-picker, previews |
| `@/components/ai-elements/speech-input` | mic/audio APIs |
| `@/components/ai-elements/voice-menu` | voice controls |
| `@/components/pay/PayPanel` | payment UI |
| `@/components/chat/MessageList` | scroll list |

```tsx
// ✅ Correct — deferred until user action
const AttachmentsPreview = lazy(() =>
  import('@/components/chat/AttachmentsPreview')
    .then(m => ({ default: m.AttachmentsPreview })))

// Inside JSX:
<Suspense fallback={null}>
  <AttachmentsPreview />
</Suspense>

// ❌ Wrong — pulls 281 KB into the initial island bundle
import { Attachments } from '@/components/ai-elements/attachments'
```

**Testing:** run `npx lighthouse <url> --chrome-flags="--headless --no-sandbox" --output=json`
then check `audits['unused-javascript'].details.items` — items > 50 KB are candidates
for lazy conversion.

---

## Dark mode — WCAG AA contrast invariant

**Default:** `<html class="dark">` — Lighthouse always runs in dark mode
(no `localStorage`). All contrast checks happen against dark tokens.

**Dark mode brand token rule:**  
Brand fills lighten to L≥65% in dark mode (so they're visible on dark
backgrounds). At L≥65%, `#fff` text fails WCAG AA. `on-*` labels MUST flip
to `#000` in `html.dark`.

In `Layout.astro` `html.dark` block, always include:

```css
html.dark {
  --color-primary: hsl(216 55% 65%);     /* L=65 — needs dark label */
  --color-secondary: hsl(219 14% 65%);   /* L=65 — needs dark label */
  --color-tertiary: hsl(105 22% 65%);    /* L=65 — needs dark label */
  --color-on-primary: #000;              /* ← REQUIRED for WCAG AA */
  --color-on-secondary: #000;            /* ← REQUIRED for WCAG AA */
  --color-on-tertiary: #000;             /* ← REQUIRED for WCAG AA */
}
```

**The JS `onLabel()` function in Layout.astro handles theme overrides** (stored
themes from the editor). The CSS defaults above handle the no-localStorage case
(Lighthouse, first visit, SSR).

Threshold: `L < 60 → #fff`, `L ≥ 60 → #000`. Default dark brand L=65, so always `#000`.

---

*Astro 6. Islands. Fast. 100% Lighthouse.*
