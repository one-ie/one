---
name: sdk
description: Use the ONE backend (@oneie/sdk) from this frontend via the plugin-backend wrapper. Invoke when reading/writing ONE data in API routes or SSR.
---

# ONE SDK in the frontend

The ONE backend is reached through **`oneClient()`** from `@oneie/plugin-backend` — never the bare `@oneie/sdk` barrel.

## The one rule: lazy-import the client

```ts
// src/pages/api/things.ts
import { oneClient } from '@oneie/plugin-backend'

export async function GET() {
  const client = await oneClient()        // lazy — reads ONE_API_KEY at call time
  const things = await client.list('thing')
  return Response.json(things)
}
```

`oneClient()` lazy-imports `@oneie/sdk` inside the factory. **Never** `import '@oneie/sdk'` at module top-level in a route — the SDK runs telemetry at import and that crashes the Cloudflare Worker on init.

## Reading signals

The substrate is signal-based. Read via the client; do not poll. Writes return a closed loop (`mark`/`warn`) — never a silent value.

## Don't

- Don't `import { SubstrateClient } from '@oneie/sdk'` directly — use `oneClient()`.
- Don't hardcode `ONE_API_KEY` — it is read from env (CF binding) at runtime.
- Don't copy SDK source into this repo — it is a dependency.
