# Runtime Ontology Discovery - Implementation Summary

## Overview

Successfully implemented a runtime ontology query endpoint and frontend hooks that enable the UI to discover what features are enabled in the current ontology composition. This allows for dynamic, feature-conditional rendering without hardcoding feature flags.

## What Was Created

### 1. Backend Query Endpoint

**File:** `/Users/toc/Server/ONE/backend/convex/queries/ontology.ts`

Provides 7 query functions for ontology discovery:

```typescript
// Get complete ontology information
api.queries.ontology.getOntology()

// Get metadata (counts, generation time)
api.queries.ontology.getMetadata()

// Get specific dimension types
api.queries.ontology.getThingTypes()
api.queries.ontology.getConnectionTypes()
api.queries.ontology.getEventTypes()

// Feature detection
api.queries.ontology.getEnabledFeatures()
api.queries.ontology.hasFeature({ feature: "blog" })

// Detailed feature breakdown
api.queries.ontology.getFeatureBreakdown()
```

**Key Features:**

- Type-safe queries using Convex validators
- Auto-generated types from ontology composition
- Zero runtime overhead (queries are cached by Convex)
- Works with any ontology composition (core, blog, portfolio, shop, etc.)

### 2. Frontend React Hooks

**File:** `/Users/toc/Server/ONE/web/src/hooks/useOntology.ts`

Provides 8 hooks for runtime feature discovery:

```typescript
// Complete ontology with helpers
const { ontology, hasFeature, isLoading } = useOntology();

// Single feature check (efficient)
const hasBlog = useHasFeature('blog');

// Metadata only
const metadata = useOntologyMetadata();

// Specific type arrays
const thingTypes = useThingTypes();
const connectionTypes = useConnectionTypes();
const eventTypes = useEventTypes();
const features = useEnabledFeatures();

// Detailed breakdown
const breakdown = useFeatureBreakdown();
```

**Key Features:**

- Type-safe with TypeScript
- Handles loading states
- Reactive (updates when ontology changes)
- Memoized for performance
- Backend-agnostic (uses Convex hooks but could work with any provider)

### 3. Demo Component

**File:** `/Users/toc/Server/ONE/web/src/components/features/OntologyExplorer.tsx`

Comprehensive UI component showing:

- Ontology metadata (counts, generation time)
- Enabled features
- Feature breakdown (what each feature provides)
- All thing types
- All connection types
- All event types

**Usage:**

```astro
---
import { OntologyExplorer } from '@/components/features/OntologyExplorer';
---

<Layout>
  <OntologyExplorer client:load />
</Layout>
```

### 4. Documentation

**File:** `/Users/toc/Server/ONE/backend/ONTOLOGY_QUERIES_EXAMPLE.md`

Comprehensive usage guide with:

- 30+ code examples
- 7 common patterns
- Backend and frontend usage
- Astro SSR examples
- CLI/admin script examples
- Best practices
- Testing patterns

### 5. Hook Exports

**Updated:** `/Users/toc/Server/ONE/web/src/hooks/index.ts`

All ontology hooks now exported from the main hooks index:

```typescript
import {
  useOntology,
  useHasFeature,
  useThingTypes,
  // ... etc
} from '@/hooks';
```

## Current Ontology Composition

Based on the generated types, the system currently has:

**Features:** core, blog, portfolio, shop

**Thing Types (15):**

- Core: page, user, file, link, note
- Blog: blog_post, blog_category
- Portfolio: project, case_study
- Shop: product, product_variant, shopping_cart, order, discount_code, payment

**Connection Types (11):**

- Core: created_by, updated_by, viewed_by, favorited_by
- Blog: posted_in
- Portfolio: belongs_to_portfolio
- Shop: purchased, in_cart, variant_of, ordered, paid_for

**Event Types (18):**

- Core: thing_created, thing_updated, thing_deleted, thing_viewed
- Blog: blog_post_published, blog_post_viewed
- Portfolio: project_viewed
- Shop: product_added_to_cart, cart_updated, cart_abandoned, order_placed, order_fulfilled, order_shipped, order_delivered, payment_processed, payment_failed, product_viewed, discount_applied

## Usage Examples

### 1. Conditional Navigation

```tsx
import { useHasFeature } from '@/hooks';

function Navigation() {
  const hasBlog = useHasFeature('blog');
  const hasShop = useHasFeature('shop');
  const hasPortfolio = useHasFeature('portfolio');

  return (
    <nav>
      <a href="/">Home</a>
      {hasBlog && <a href="/blog">Blog</a>}
      {hasPortfolio && <a href="/portfolio">Portfolio</a>}
      {hasShop && <a href="/shop">Shop</a>}
    </nav>
  );
}
```

### 2. Dynamic Type Selector

```tsx
import { useThingTypes } from '@/hooks';

function CreateThingForm() {
  const thingTypes = useThingTypes();
  const [type, setType] = useState('');

  return (
    <select value={type} onChange={(e) => setType(e.target.value)}>
      <option value="">Select type...</option>
      {thingTypes.map(type => (
        <option key={type} value={type}>
          {type.replace('_', ' ').toUpperCase()}
        </option>
      ))}
    </select>
  );
}
```

### 3. Feature-Based Dashboard

```tsx
import { useOntology } from '@/hooks';

function Dashboard() {
  const { features, metadata, isLoading } = useOntology();

  if (isLoading) return <Skeleton />;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Ontology: {features.join(', ')}</p>
      <p>Thing Types: {metadata.thingTypeCount}</p>

      {features.includes('blog') && <BlogManagement />}
      {features.includes('shop') && <OrderManagement />}
      {features.includes('portfolio') && <ProjectShowcase />}
    </div>
  );
}
```

### 4. Astro SSR with Ontology

```astro
---
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const ontology = await convex.query(api.queries.ontology.getOntology);
---

<Layout>
  <h1>Ontology Configuration</h1>

  <section>
    <h2>Enabled Features</h2>
    <ul>
      {ontology.features.map(feature => (
        <li>{feature}</li>
      ))}
    </ul>
  </section>

  <section>
    <h2>Thing Types ({ontology.thingTypes.length})</h2>
    <p>{ontology.thingTypes.join(', ')}</p>
  </section>
</Layout>
```

### 5. CLI Admin Script

```typescript
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../backend/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

async function checkOntology() {
  const metadata = await convex.query(api.queries.ontology.getMetadata);

  console.log('Ontology Composition:');
  console.log(`  Features: ${metadata.features.join(', ')}`);
  console.log(`  Thing Types: ${metadata.thingTypeCount}`);
  console.log(`  Connection Types: ${metadata.connectionTypeCount}`);
  console.log(`  Event Types: ${metadata.eventTypeCount}`);
  console.log(`  Generated: ${metadata.generatedAt}`);
}

checkOntology();
```

## Integration with Existing System

### How It Works with Ontology Composition

The system uses auto-generated types from YAML ontologies:

1. **YAML Ontologies** define features (core, blog, portfolio, shop)
2. **Script** generates TypeScript types from YAML (`scripts/generate-ontology-types.ts`)
3. **Schema** uses generated types to create Convex validators
4. **Queries** expose ontology metadata at runtime
5. **Frontend** discovers features dynamically via hooks

### Updating Ontology

When you add a new feature:

```bash
# 1. Add feature YAML
echo "feature: new_feature" > backend/convex/ontologies/new_feature.yaml

# 2. Enable feature
export PUBLIC_FEATURES="core,blog,portfolio,shop,new_feature"

# 3. Regenerate types
bun run scripts/generate-ontology-types.ts

# 4. Schema automatically picks up new types
# 5. Frontend discovers new feature via useHasFeature('new_feature')
```

## Benefits

### 1. Dynamic Feature Detection

Frontend automatically adapts to enabled features without code changes:

```tsx
// No hardcoded feature flags needed
const hasBlog = useHasFeature('blog'); // Dynamically checks
```

### 2. Type Safety

TypeScript ensures correct usage:

```tsx
const types = useThingTypes(); // ThingType[]
const selected: ThingType = types[0]; // Type-safe
```

### 3. Zero Configuration

Features are discovered at runtime - no frontend config needed:

```tsx
// Automatically shows/hides based on ontology
{hasFeature('shop') && <ShopSection />}
```

### 4. Admin/Debug Tools

Easily build tools to inspect ontology:

```tsx
<OntologyExplorer /> // Shows complete composition
```

### 5. Multi-Tenant Support

Different tenants can have different ontologies - frontend adapts automatically.

## Best Practices

### 1. Use Specific Hooks When Possible

```tsx
// Good: Efficient single check
const hasBlog = useHasFeature('blog');

// Less efficient: Loading all ontology data
const { hasFeature } = useOntology();
const hasBlog = hasFeature('blog');
```

### 2. Handle Loading States

```tsx
const { ontology, isLoading } = useOntology();

if (isLoading) return <Skeleton />;
// Safe to use ontology here
```

### 3. Memoize Feature Checks

```tsx
const hasContentFeatures = useMemo(
  () => features.some(f => ['blog', 'portfolio'].includes(f)),
  [features]
);
```

### 4. Type Safety

```tsx
import type { ThingType } from '@/convex/types/ontology';

const [selected, setSelected] = useState<ThingType | ''>('');
```

## Common Patterns

### Conditional Navigation

```tsx
const navItems = [
  { label: 'Home', href: '/', show: true },
  { label: 'Blog', href: '/blog', show: hasFeature('blog') },
  { label: 'Shop', href: '/shop', show: hasFeature('shop') },
].filter(item => item.show);
```

### Feature-Gated Components

```tsx
function withFeature(feature: string, Component: React.ComponentType) {
  return function FeatureGatedComponent(props: any) {
    const hasFeature = useHasFeature(feature);
    if (!hasFeature) return null;
    return <Component {...props} />;
  };
}

const BlogEditor = withFeature('blog', BlogEditorComponent);
```

### Dynamic Form Fields

```tsx
const thingTypes = useThingTypes();
const connectionTypes = useConnectionTypes();

// Build form based on available types
```

## Testing

Mock ontology in tests:

```typescript
vi.mock('@/hooks/useOntology', () => ({
  useOntology: () => ({
    features: ['core', 'blog'],
    thingTypes: ['page', 'user', 'blog_post'],
    hasFeature: (f: string) => ['core', 'blog'].includes(f),
    isLoading: false,
  }),
}));
```

## Next Steps

### Potential Enhancements

1. **Auto-generate feature breakdown** from YAML (currently manual)
2. **Add feature dependencies** (e.g., "shop requires core")
3. **Version tracking** (ontology version numbers)
4. **Migration helpers** (upgrade from v1 to v2)
5. **Feature flags per tenant** (enable/disable features per organization)

### Usage in Real Features

1. **Admin Dashboard** - Show available features to users
2. **Navigation** - Conditional menu items
3. **Forms** - Dynamic type selectors
4. **Settings** - Enable/disable features per organization
5. **Onboarding** - Guide users based on enabled features

## Files Created

1. `/Users/toc/Server/ONE/backend/convex/queries/ontology.ts` - Backend queries
2. `/Users/toc/Server/ONE/web/src/hooks/useOntology.ts` - Frontend hooks
3. `/Users/toc/Server/ONE/web/src/components/features/OntologyExplorer.tsx` - Demo component
4. `/Users/toc/Server/ONE/backend/ONTOLOGY_QUERIES_EXAMPLE.md` - Usage documentation
5. `/Users/toc/Server/ONE/ONTOLOGY_DISCOVERY_IMPLEMENTATION.md` - This file

## Dependencies

Relies on existing infrastructure:

- **Ontology Types:** `/Users/toc/Server/ONE/backend/convex/types/ontology.ts` (auto-generated)
- **Schema:** `/Users/toc/Server/ONE/backend/convex/schema.ts` (uses ontology types)
- **Convex Hooks:** `convex/react` (useQuery)
- **Generation Script:** `scripts/generate-ontology-types.ts`

## Summary

Successfully implemented a complete runtime ontology discovery system:

- **Backend:** 7 query functions for ontology metadata
- **Frontend:** 8 React hooks for feature detection
- **Demo:** Full-featured OntologyExplorer component
- **Docs:** 30+ usage examples and best practices

**Result:** Frontend can now dynamically discover and adapt to the current ontology composition without hardcoded feature flags or configuration files.

---

**Built with the 6-dimension ontology. Runtime discovery enables composition-aware UIs.**
