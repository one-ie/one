# @oneie/plugin-shop

Ecommerce storefront served from one.ie — product grid, cart drawer, checkout, and collections. Zero bundle cost, no source in your repo.

```ts
import { shop } from '@oneie/plugin-shop'

export default defineOne({
  plugins: [
    shop({ ws: 'your-workspace', provider: 'stripe' }),
  ],
})
```

## Pages

Add the mount components to your Astro pages:

```astro
---
// src/pages/shop/index.astro
import { OneShop } from '@oneie/plugin-shop/OneShop.astro'
---
<OneShop ws="your-workspace" currency="EUR" cart="drawer" />
```

```astro
---
// src/pages/shop/cart.astro
import { OneCart } from '@oneie/plugin-shop/OneCart.astro'
---
<OneCart ws="your-workspace" />
```

```astro
---
// src/pages/shop/checkout.astro
import { OneCheckout } from '@oneie/plugin-shop/OneCheckout.astro'
---
<OneCheckout ws="your-workspace" provider="stripe" />
```

## Options

```ts
shop({
  ws: string,                       // workspace slug (required)
  currency?: string,                // ISO 4217 code, default 'USD'
  provider?: 'stripe' | 'x402' | 'both',  // payment provider, default 'stripe'
  cart?: 'drawer' | 'page',        // cart UX mode, default 'drawer'
  primary?: string,                 // accent colour override (hsl/hex)
  endpoint?: string,                // WS hub URL override
})
```

## Subresource Integrity

The served bundle updates with one.ie releases. To lock a version and add SRI:

1. Pin the version in the `serves` URL: `https://one.ie/x/shop@1.2.3.js`
2. Retrieve the sha384 hash from `https://one.ie/x/shop@1.2.3.js.integrity`
3. Pass `integrity="sha384-..."` to any mount component

```astro
<OneShop
  ws="your-workspace"
  integrity="sha384-abc123..."
/>
```

`crossorigin="anonymous"` is set on all script tags so browsers enforce the hash.

## What ships

The served bundle (`one.ie/x/shop.js`) includes:

- **Storefront** — product grid, collection nav, filters, search, sort
- **Product page** — gallery, variant selector, quantity picker, add-to-cart
- **Cart drawer** — live line-item updates, free-shipping progress, coupon
- **Checkout** — Stripe Elements or x402 crypto payment form, order summary
- **Post-purchase** — confirmation, order number, receipt email trigger

Product catalog and inventory are pulled from your ONE workspace at runtime — no data ships to your repo.
