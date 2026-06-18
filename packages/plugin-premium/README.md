# @oneie/plugin-premium

Served-widget loader and entitlement gate — the base for all x402-gated paid plugins.

```ts
import { premium } from '@oneie/plugin-premium'

// Used internally by paid plugins:
const base = premium({ plugin: 'admin' })
// → { serves: 'https://one.ie/x/admin.js', entitlement: 'admin', tier: 'paid' }
```

`premium()` constructs a plugin that loads a JS widget from `one.ie/x/<plugin>.js` at runtime, gated by an entitlement claim. The actual UI code is served after payment — nothing ships to the user's repo.

## How paid plugins work

1. User installs a paid plugin (e.g. `plugin-admin`)
2. The plugin calls `premium({ plugin: 'admin' })`
3. At runtime, the browser requests `one.ie/x/admin.js`
4. ONE checks the `admin` entitlement claim before serving
5. The widget mounts — no source in the user's repo

## Exports

- `premium(config)` — plugin factory
- `<OnePanel>` — Astro component for the widget mount point
- `./bridge` — client-side bridge for widget ↔ host communication
