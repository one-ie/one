# @oneie/plugin-admin

Admin Console — first paid plugin. Served from one.ie, gated by the `admin` entitlement.

```ts
import { adminPanel } from '@oneie/plugin-admin'

export default defineOne({
  plugins: [adminPanel()],
})
```

The source in this repo is a stub — the real Admin Console UI is served from `one.ie/x/admin.js` after the `admin` entitlement is verified. Nothing ships to your bundle.

> **This is a paid plugin.** Source is not included. The widget loads at runtime via x402.

## What you get

- Full workspace admin UI: agents, workflows, signals, settings
- Served as a script — zero bundle impact
- Access controlled by the `admin` entitlement on your ONE workspace
