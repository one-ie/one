# @oneie/frontend

The single config surface for ONE-connected Astro sites.

```ts
import { defineOne } from '@oneie/frontend'

export default defineOne({
  backend: { baseUrl: 'https://one.ie' },
  brand: { tokens: { primary: 'hsl(216 55% 25%)' } },
  plugins: [auth(), chat({ agent: 'my-bot' })],
})
```

`defineOne()` composes each plugin into a single Astro integration and applies the brand tokens globally. All wiring — script injection, Cloudflare bindings, layout wrapping — happens here.

## Exports

- `defineOne(config)` — build the Astro integration
- `OnePlugin` — plugin type contract
- `OnePluginFactory<T>` — factory type for authoring plugins
