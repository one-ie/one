# Ontology Discovery - Quick Start

## 30-Second Overview

Runtime ontology discovery lets your frontend automatically adapt to enabled features without hardcoded flags.

## Quick Examples

### Check if Feature is Enabled

```tsx
import { useHasFeature } from '@/hooks';

function MyComponent() {
  const hasBlog = useHasFeature('blog');

  if (!hasBlog) return null;

  return <BlogSection />;
}
```

### Get All Thing Types

```tsx
import { useThingTypes } from '@/hooks';

function TypeSelector() {
  const types = useThingTypes();

  return (
    <select>
      {types.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
  );
}
```

### Complete Ontology Info

```tsx
import { useOntology } from '@/hooks';

function Dashboard() {
  const { features, thingTypes, connectionTypes, eventTypes, isLoading } = useOntology();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Features: {features.join(', ')}</h1>
      <p>Thing Types: {thingTypes.length}</p>
      <p>Connection Types: {connectionTypes.length}</p>
      <p>Event Types: {eventTypes.length}</p>
    </div>
  );
}
```

### Feature-Based Navigation

```tsx
import { useHasFeature } from '@/hooks';

function Nav() {
  return (
    <nav>
      <a href="/">Home</a>
      {useHasFeature('blog') && <a href="/blog">Blog</a>}
      {useHasFeature('shop') && <a href="/shop">Shop</a>}
      {useHasFeature('portfolio') && <a href="/portfolio">Portfolio</a>}
    </nav>
  );
}
```

### Server-Side (Astro)

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const ontology = await convex.query(api.queries.ontology.getOntology);
---

<h1>Features: {ontology.features.join(', ')}</h1>
```

## Available Hooks

```tsx
// Single feature check (most efficient)
useHasFeature('blog') // boolean

// Get specific type arrays
useThingTypes() // ThingType[]
useConnectionTypes() // ConnectionType[]
useEventTypes() // EventType[]
useEnabledFeatures() // string[]

// Get metadata
useOntologyMetadata() // { features, counts, generatedAt }

// Get feature breakdown (what each feature provides)
useFeatureBreakdown() // { core: {...}, blog: {...}, etc }

// Get everything
useOntology() // { ontology, features, thingTypes, ..., hasFeature(), isLoading }
```

## Backend Queries

```typescript
// From CLI or server
import { api } from './convex/_generated/api';

await convex.query(api.queries.ontology.getOntology);
await convex.query(api.queries.ontology.getMetadata);
await convex.query(api.queries.ontology.hasFeature, { feature: 'blog' });
await convex.query(api.queries.ontology.getThingTypes);
await convex.query(api.queries.ontology.getConnectionTypes);
await convex.query(api.queries.ontology.getEventTypes);
await convex.query(api.queries.ontology.getEnabledFeatures);
await convex.query(api.queries.ontology.getFeatureBreakdown);
```

## Demo Component

```tsx
import { OntologyExplorer } from '@/components/features/OntologyExplorer';

// Shows complete ontology breakdown
<OntologyExplorer client:load />
```

## Current Composition

**Features:** core, blog, portfolio, shop

**15 Thing Types:**
page, user, file, link, note, blog_post, blog_category, project, case_study, product, product_variant, shopping_cart, order, discount_code, payment

**11 Connection Types:**
created_by, updated_by, viewed_by, favorited_by, posted_in, belongs_to_portfolio, purchased, in_cart, variant_of, ordered, paid_for

**18 Event Types:**
thing_created, thing_updated, thing_deleted, thing_viewed, blog_post_published, blog_post_viewed, project_viewed, product_added_to_cart, cart_updated, cart_abandoned, order_placed, order_fulfilled, order_shipped, order_delivered, payment_processed, payment_failed, product_viewed, discount_applied

## Files

**Backend:**
- `/backend/convex/queries/ontology.ts` - Query endpoint
- `/backend/convex/types/ontology.ts` - Generated types

**Frontend:**
- `/web/src/hooks/useOntology.ts` - React hooks
- `/web/src/components/features/OntologyExplorer.tsx` - Demo component

**Docs:**
- `/backend/ONTOLOGY_QUERIES_EXAMPLE.md` - 30+ examples
- `/ONTOLOGY_DISCOVERY_IMPLEMENTATION.md` - Complete guide

## Best Practices

1. Use `useHasFeature('blog')` for single checks
2. Use `useOntology()` when you need multiple properties
3. Always handle `isLoading` state
4. Memoize feature checks in complex components
5. Use type safety: `ThingType`, `ConnectionType`, `EventType`

## Common Patterns

**Conditional Rendering:**
```tsx
{hasFeature('blog') && <BlogSection />}
```

**Dynamic Forms:**
```tsx
const types = useThingTypes();
<select>{types.map(t => <option>{t}</option>)}</select>
```

**Feature Gates:**
```tsx
if (!hasFeature('shop')) return <UpgradePrompt />;
```

**Multi-Feature Checks:**
```tsx
const hasContent = useMemo(
  () => features.some(f => ['blog', 'portfolio'].includes(f)),
  [features]
);
```

---

**That's it! Your UI now discovers features at runtime. No hardcoded flags needed.**
