# @oneie/plugin-booking

ONE booking widget — appointment scheduling served from one.ie. Google Calendar sync and email confirmations handled server-side. Zero booking source code ships to your repo.

## Install

```bash
npm install @oneie/plugin-booking
```

## one.config.ts

```ts
import { defineOne } from '@oneie/frontend'
import { booking } from '@oneie/plugin-booking'

export default defineOne({
  plugins: [
    booking({
      ws: 'my-workspace',
      agent: 'my-booking-agent',
      duration: 30,
      calendar: 'google',
      confirmEmail: true,
    }),
  ],
})
```

## Usage

### Full booking flow — `OneBooking`

Drop the full booking widget onto any page. Handles slot selection, form capture, calendar write, and confirmation email in one flow.

```astro
---
import { OneBooking } from '@oneie/plugin-booking/OneBooking.astro'
---

<OneBooking
  ws="my-workspace"
  agent="my-booking-agent"
  duration={30}
  calendar="google"
  confirmEmail={true}
/>
```

### Inline availability checker — `OneAvailability`

Lighter widget showing open slots for a specific date. Useful for embedding a day-view picker inline before redirecting to the full booking flow.

```astro
---
import OneAvailability from '@oneie/plugin-booking/OneAvailability.astro'
---

<OneAvailability
  ws="my-workspace"
  date="2026-07-01"
  duration={30}
/>
```

`date` defaults to today when omitted.

## Example booking page

```astro
---
// src/pages/book.astro
import Layout from '@/layouts/Layout.astro'
import OneBooking from '@oneie/plugin-booking/OneBooking.astro'
---

<Layout title="Book a call">
  <main class="max-w-xl mx-auto py-16 px-4">
    <h1 class="text-2xl font-semibold mb-8">Book a call</h1>
    <OneBooking
      ws="acme"
      agent="sales"
      duration={30}
      calendar="google"
      confirmEmail={true}
    />
  </main>
</Layout>
```

## ONE workspace setup

Before the widget will show real availability, connect Google Calendar in your workspace settings:

1. Go to **one.ie → your workspace → Settings → Integrations**.
2. Connect **Google Calendar** and grant read/write access.
3. Optionally connect an email provider for confirmation emails.
4. Set your availability hours and buffer time in **Settings → Booking**.

The widget reads availability and writes confirmed appointments entirely server-side — your Google credentials never touch the browser.

## Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ws` | `string` | — | Workspace slug (required) |
| `agent` | `string` | — | Agent slug to handle the booking flow |
| `duration` | `number` | `30` | Appointment duration in minutes |
| `calendar` | `'google' \| 'ical' \| 'both'` | `'google'` | Calendar integration |
| `timezone` | `string` | browser timezone | IANA timezone string |
| `confirmEmail` | `boolean` | `true` | Send confirmation email to the booker |
| `endpoint` | `string` | — | Override the default API endpoint |
| `integrity` | `string` | — | SRI hash for version pinning |

## Subresource Integrity (SRI)

Pin a specific widget version and verify its integrity:

```astro
<OneBooking
  ws="my-workspace"
  integrity="sha384-<hash>"
/>
```

Generate the hash after downloading the pinned script:

```bash
curl -s https://one.ie/b/booking@1.2.3.js | openssl dgst -sha384 -binary | openssl base64 -A
```
