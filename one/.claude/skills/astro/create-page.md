# Create Astro Page

**Category:** astro
**Version:** 1.0.0
**Used By:** agent-frontend, agent-builder

## Purpose

Generates Astro page with SSR, components, and proper routing.

## Example

```astro
---
import Layout from '@/layouts/Layout.astro';
import { Hero } from '@/components/Hero';
import { PricingTable } from '@/components/PricingTable';

const posts = await convex.query(api.queries.posts.list);
---

<Layout title="Landing Page">
  <Hero client:load />
  <PricingTable tiers={3} />
</Layout>
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
