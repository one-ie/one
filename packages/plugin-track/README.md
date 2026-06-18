# @oneie/plugin-track

ONE tracking pixel — served from one.ie, zero bundle cost.

```ts
import { track } from '@oneie/plugin-track'

export default defineOne({
  plugins: [track({ ws: 'my-workspace' })],
})
```

Injects a `<script>` tag that loads the tracking pixel from one.ie at runtime. Pageviews, events, and conversions flow into your ONE workspace without any tracking code shipping to your repo.

## Options

```ts
track({
  ws: string,    // workspace slug
})
```
