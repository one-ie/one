---
name: react19
description: React 19 conventions in ONE sites — client islands, @oneie/react hooks, no useEffect for ONE data. Invoke when editing .tsx components.
---

# React 19 in ONE sites

## Islands, not pages

React components are **islands**. A `.tsx` only runs in the browser when an `.astro` mounts it with a directive:

```astro
<Counter client:load />     <!-- hydrate immediately -->
<Chart client:visible />    <!-- hydrate when scrolled into view -->
```

A `.tsx` with no `client:*` directive renders to static HTML — no interactivity.

## Use @oneie/react hooks for ONE data

```tsx
import { useSignal, useMark } from '@oneie/react'

function Likes({ pathId }: { pathId: string }) {
  const strength = useSignal(pathId, 'strength')
  const mark = useMark(pathId)
  return <button onClick={() => mark()}>{strength} ♥</button>
}
```

Do **not** `useEffect(() => fetch(...))` for ONE data — the hooks own subscription + the closed loop (`mark`/`warn`).

## React 19 specifics

- Use Actions / `use()` / transitions for async UI; avoid manual loading-state `useState` ladders.
- Props named `children` are reserved slot content — never use `children` as a data prop on a `client:only` island (it silently renders nothing).

## Don't

- Don't fetch ONE data in `useEffect` — use `@oneie/react` hooks.
- Don't ship a `.tsx` expecting interactivity without a `client:*` directive.
