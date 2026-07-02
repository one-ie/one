# @oneie/plugin-dashboard

Analytics dashboard with stats cards, revenue charts, activity feed, and entity table — served from one.ie via x402, gated by the `dashboard` entitlement. No dashboard source ships to your repo.

## Install

```sh
bun add @oneie/plugin-dashboard
```

## one.config.ts

Register the plugin so the ONE runtime knows the entitlement to check:

```ts
import { defineOne } from '@oneie/frontend'
import { dashboard } from '@oneie/plugin-dashboard'

export default defineOne({
  plugins: [
    dashboard({
      ws: 'your-workspace',
      sections: ['stats', 'revenue', 'activity', 'entities', 'traffic'],
      dateRange: '30d',
      theme: 'system',
    }),
  ],
})
```

## Usage

### Full dashboard page (`src/pages/dashboard/index.astro`)

Use `<OneDashboard>` for the full analytics surface — stats grid, revenue chart, activity feed, and entity table in one mount.

```astro
---
import Layout from '@/layouts/Layout.astro'
import OneDashboard from '@oneie/plugin-dashboard/OneDashboard.astro'
---

<Layout title="Dashboard">
  <OneDashboard
    ws="your-workspace"
    sections={['stats', 'revenue', 'activity', 'entities']}
    dateRange="30d"
    theme="system"
  />
</Layout>
```

### Stats cards embedded in an existing page (`OneStats`)

Use `<OneStats>` when you want lightweight metric cards without the full dashboard chrome — drop it into any page or sidebar.

```astro
---
import OneStats from '@oneie/plugin-dashboard/OneStats.astro'
---

<OneStats
  ws="your-workspace"
  metrics={['users', 'revenue', 'conversions']}
  dateRange="7d"
/>
```

### Single chart in a card (`OneChart`)

Use `<OneChart>` for a single focused chart — ideal for embedding in a summary card, a sidebar, or a custom dashboard layout.

```astro
---
import OneChart from '@oneie/plugin-dashboard/OneChart.astro'
---

<OneChart
  ws="your-workspace"
  chart="revenue"
  dateRange="30d"
  height={240}
/>
```

Available chart types: `'revenue' | 'traffic' | 'conversions' | 'activity'`

## What powers the charts

Charts and stats draw from ONE substrate signals flowing into your workspace. The more signals your app emits (via `@oneie/sdk` or the `/signal` API routes), the richer the dashboard data:

- **Stats** — entity counts, active users, conversion rate
- **Revenue** — cumulative and per-period revenue from checkout events
- **Activity** — recent signal feed (marks, warns, follows)
- **Entities** — searchable table of things in your workspace
- **Traffic** — page view counts via the tracking pixel (`plugin-track`)

Signals must be flowing for charts to populate. If you see empty charts, verify your workspace is emitting signals via `@oneie/sdk`.

## Subresource Integrity (SRI)

Pin a specific version and pass the matching hash to lock the served script:

```astro
<OneDashboard
  ws="your-workspace"
  integrity="sha384-abc123..."
/>
```

Get the hash from the ONE dashboard or the release notes for each version. Pass the same `integrity` prop to `<OneStats>` and `<OneChart>` when using a pinned URL.
