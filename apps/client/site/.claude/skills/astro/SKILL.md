---
name: astro
description: Astro 6 conventions for ONE sites — plugin wiring via one.config.ts, OneChat/OneTrack placement, Cloudflare SSR. Invoke when editing .astro files or astro.config.mjs.
---

# Astro in ONE sites

## Config is the control surface

All ONE wiring lives in `one.config.ts` via `defineOne({ backend, brand, plugins })`. `astro.config.mjs` imports it as an integration:

```js
import oneIntegration from './one.config.ts'
export default defineConfig({ integrations: [react(), oneIntegration] })
```

Add a capability by adding a plugin factory to `plugins: []`, not by writing bespoke code.

## OneChat / OneTrack placement

The served chat/track scripts mount once, in the layout:

```astro
---
import { OneChat } from '@oneie/plugin-chat'
import { OneTrack } from '@oneie/plugin-track'
---
<Layout title="Home">
  <OneTrack ws="your-workspace" slot="head" />
  <slot />
  <OneChat agent="your-agent" slot="footer" />
</Layout>
```

These emit `<script async src="https://one.ie/...">` tags — the engine is served, never bundled.

## SSR on Cloudflare

`output: 'server'` + the `@astrojs/cloudflare` adapter. API routes (`src/pages/api/*.ts`) return a `Response`. Read ONE data via `oneClient()` (see the `sdk` skill).

## Don't

- Don't add ONE imports to `src/components/ui/` (shadcn primitives stay pure).
- Don't bundle chat/track engine source — use the plugin components.
