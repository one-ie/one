# @oneie/plugin-newsletter

Wires a newsletter subscribe form to the ONE backend's audience/CRM — `audience:subscribe` writes a `consent:email:pending` tag and starts double opt-in. Free tier, no entitlement, no build-time integration.

## one.config.ts

```ts
import { defineOne } from '@oneie/frontend'
import { newsletter } from '@oneie/plugin-newsletter'

export default defineOne({
  plugins: [newsletter({ workspace: 'your-workspace' })],
})
```

## Server — API route

```ts
// src/pages/api/newsletter/subscribe.ts
import type { APIRoute } from 'astro'
import { subscribeToAudience } from '@oneie/plugin-newsletter'
import { one } from '../../../lib/one' // your keyed SubstrateClient helper

export const POST: APIRoute = async ({ request }) => {
  const { email } = await request.json()
  const client = await one()
  if (!client) return Response.json({ error: 'backend_not_connected' }, { status: 503 })

  await subscribeToAudience(client, { workspace: 'your-workspace', address: email, list: 'newsletter' })
  return Response.json({ ok: true })
}
```

## Client — form markup

Add four data attributes to any form; no specific classes or layout required:

```html
<form data-newsletter-form>
  <input type="email" required data-newsletter-input />
  <button type="submit" data-newsletter-submit>Subscribe</button>
</form>
<p data-newsletter-error hidden></p>
```

```html
<script>
  import { bindNewsletterForms } from '@oneie/plugin-newsletter'
  bindNewsletterForms()
</script>
```

`bindNewsletterForms(selector?, { endpoint? })` binds every matching form once, POSTs `{ email }` to the endpoint (default `/api/newsletter/subscribe`), and swaps the button label / shows the error element in place. Safe to call on pages with zero matching forms.
