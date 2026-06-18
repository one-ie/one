# @oneie/plugin-backend

`@oneie/sdk` client and React 19 hooks wired through the plugin contract.

```ts
import { backend } from '@oneie/plugin-backend'

export default defineOne({
  plugins: [backend()],
})
```

Makes the ONE substrate available in API routes and React components without importing the SDK directly. Uses the `ONE_API_KEY` binding configured in `one.config.ts`.

## Hooks

```tsx
import { useSignals, useThing } from '@oneie/plugin-backend'

function MyComponent() {
  const signals = useSignals({ type: 'message' })
  const thing = useThing(id)
}
```

## What ships

- `backend()` — plugin factory
- `useSignals(filter)`, `useThing(id)`, `useActor(id)` — React 19 hooks
- `getSubstrate()` — server-side SDK client (API routes)
