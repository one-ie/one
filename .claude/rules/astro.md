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

*Astro 5. Islands. Fast.*
