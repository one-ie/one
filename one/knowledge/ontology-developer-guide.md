# Multi-Ontology Architecture: Developer Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-20
**Status:** Complete

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [YAML Format Specification](#yaml-format-specification)
3. [Type Generation Internals](#type-generation-internals)
4. [Best Practices](#best-practices)
5. [Advanced Patterns](#advanced-patterns)
6. [Performance Optimization](#performance-optimization)
7. [Testing Strategies](#testing-strategies)

---

## Architecture Overview

### The Problem: Schema Bloat

Traditional platforms hardcode ALL possible entity types into a single massive schema:

```typescript
// ❌ Traditional approach
type EntityType =
  | 'user'
  | 'page'
  | 'blog_post'
  | 'product'
  | 'course'
  | 'portfolio_item'
  | 'video'
  | 'podcast'
  | 'nft'
  | 'token'
  | ...  // 100+ more types
```

**Problems:**

- **Schema bloat**: Every installation loads types they'll never use
- **Tight coupling**: Adding a new feature requires changing core
- **Slow queries**: Indexes become massive and unwieldy
- **Poor DX**: Autocomplete suggests 100+ irrelevant types
- **Multi-backend impossible**: Can't run different backends with different features

### The Solution: Composable Ontologies

The multi-ontology architecture uses **feature-specific YAML files** that compose at runtime:

```
┌─────────────────────────────────────┐
│  ontology-core.yaml (always loaded) │
│  - page, user, file, link, note     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ontology-blog.yaml (if enabled)    │
│  - blog_post, blog_category         │
│  extends: core                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ontology-shop.yaml (if enabled)    │
│  - product, order, cart, payment    │
│  extends: core                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Generated TypeScript Types         │
│  - Only includes enabled features   │
│  - Full type safety                 │
│  - Validation functions             │
└─────────────────────────────────────┘
```

**Benefits:**

- **Load only what you need**: Core + enabled features
- **Type safety**: Full TypeScript validation
- **Loose coupling**: Features are independent
- **Multi-backend support**: Different backends, different features
- **Better DX**: Autocomplete shows only relevant types

---

## YAML Format Specification

### File Structure

```yaml
feature: {feature-name}          # REQUIRED: Feature identifier (lowercase, no spaces)
extends: {base-feature} | null   # OPTIONAL: Base feature to inherit from
description: {description}       # REQUIRED: Human-readable description

thingTypes:                      # OPTIONAL: Entity types this feature adds
  - name: {type-name}            # REQUIRED: Type name (lowercase_underscore)
    properties:                  # REQUIRED: Property definitions
      {field}: {type}            # field: string | number | boolean | object | string[] | number[]

connectionTypes:                 # OPTIONAL: Relationship types this feature adds
  - name: {type-name}            # REQUIRED: Connection name (lowercase_underscore)
    fromType: {thing-type} | '*' # REQUIRED: Source thing type (* = any)
    toType: {thing-type} | '*'   # REQUIRED: Target thing type (* = any)

eventTypes:                      # OPTIONAL: Event types this feature adds
  - name: {event-name}           # REQUIRED: Event name (past tense, lowercase_underscore)
    thingType: {thing-type} | '*' # REQUIRED: Thing type this event applies to (* = any)
```

### Naming Conventions

**Feature Names:**
- Lowercase, no spaces
- Use hyphens for multi-word features
- Examples: `core`, `blog`, `shop`, `social-media`

**Thing Type Names:**
- Lowercase with underscores
- Singular nouns
- Examples: `blog_post`, `product`, `user`, `shopping_cart`

**Connection Type Names:**
- Lowercase with underscores
- Action verbs (present tense)
- Examples: `created_by`, `posted_in`, `purchased`, `in_stock`

**Event Type Names:**
- Lowercase with underscores
- Past tense verbs
- Examples: `blog_post_published`, `product_created`, `order_placed`

### Property Types

**Primitive Types:**

```yaml
properties:
  name: string           # Text
  age: number            # Integer or float
  active: boolean        # true/false
  metadata: object       # JSON object (any structure)
```

**Array Types:**

```yaml
properties:
  tags: string[]         # Array of strings
  scores: number[]       # Array of numbers
  items: object[]        # Array of objects (not validated)
```

**Complex Types:**

For complex nested structures, use `object`:

```yaml
properties:
  address: object        # { street, city, zip, country }
  settings: object       # { theme, language, notifications }
```

> **Note:** Object properties are not validated by the type system. Validation happens at runtime in mutation handlers.

### Inheritance with `extends`

Features can inherit types from a base feature:

```yaml
# ontology-blog.yaml
feature: blog
extends: core           # Inherits: page, user, file, link, note
description: Blog and content publishing

thingTypes:
  - name: blog_post     # ✅ Can use inherited types
    properties:
      authorId: string  # ✅ References 'user' from core
```

**Inheritance Rules:**

1. **Transitive:** If `portfolio` extends `blog` and `blog` extends `core`, portfolio gets all types from both
2. **No circular dependencies:** `blog → portfolio → blog` will error
3. **No override:** You can't redefine types from base features

---

## Type Generation Internals

### Generation Script: `scripts/generate-ontology-types.ts`

The type generator:

1. **Load enabled features** from `PUBLIC_FEATURES` environment variable
2. **Read YAML files** from `/one/knowledge/ontology-{feature}.yaml`
3. **Resolve dependencies** (handle `extends` relationships)
4. **Merge types** from all enabled features
5. **Generate TypeScript** code with validation functions
6. **Write output** to `convex/types/ontology.ts`

### Generated Code Structure

The generator produces:

```typescript
// convex/types/ontology.ts

// 1. Type unions
export type ThingType = 'page' | 'user' | 'blog_post' | 'product' | ...;
export type ConnectionType = 'created_by' | 'posted_in' | ...;
export type EventType = 'thing_created' | 'blog_post_published' | ...;

// 2. Constant arrays
export const THING_TYPES: readonly ThingType[] = ['page', 'user', ...];
export const CONNECTION_TYPES: readonly ConnectionType[] = ['created_by', ...];
export const EVENT_TYPES: readonly EventType[] = ['thing_created', ...];

// 3. Type guards
export function isThingType(type: string): type is ThingType {
  return THING_TYPES.includes(type as ThingType);
}

export function isConnectionType(type: string): type is ConnectionType {
  return CONNECTION_TYPES.includes(type as ConnectionType);
}

export function isEventType(type: string): type is EventType {
  return EVENT_TYPES.includes(type as EventType);
}

// 4. Feature helpers
export const ENABLED_FEATURES = ['core', 'blog', 'shop'];

export function hasFeature(feature: string): boolean {
  return ENABLED_FEATURES.includes(feature);
}

// 5. Schema metadata
export const ONTOLOGY_SCHEMA = {
  features: {
    core: { thingTypes: ['page', 'user'], connectionTypes: [...], eventTypes: [...] },
    blog: { thingTypes: ['blog_post'], connectionTypes: [...], eventTypes: [...] },
    // ...
  }
};

export function getThingTypeSchema(type: ThingType): ThingTypeSchema | undefined {
  // Returns full schema for a thing type
}
```

### Dependency Resolution Algorithm

```typescript
function resolveFeatureDependencies(features: string[]): string[] {
  const resolved = new Set<string>();
  const visited = new Set<string>();

  function visit(feature: string, path: string[] = []) {
    // Detect circular dependencies
    if (path.includes(feature)) {
      throw new Error(`Circular dependency: ${path.join(' → ')} → ${feature}`);
    }

    // Skip if already resolved
    if (resolved.has(feature)) return;

    // Mark as visited
    visited.add(feature);

    // Load feature YAML
    const ontology = loadOntologyYAML(feature);

    // Resolve parent first (depth-first)
    if (ontology.extends) {
      visit(ontology.extends, [...path, feature]);
    }

    // Add this feature
    resolved.add(feature);
  }

  // Visit all enabled features
  for (const feature of features) {
    visit(feature);
  }

  return Array.from(resolved);
}
```

**Example:**

```
Enabled features: ['blog', 'shop', 'portfolio']

Dependency tree:
  blog → core
  shop → core
  portfolio → blog → core

Resolved order: ['core', 'blog', 'shop', 'portfolio']
```

---

## Best Practices

### 1. Keep Features Focused

**✅ Good:**

```yaml
# ontology-blog.yaml
feature: blog
thingTypes:
  - name: blog_post
  - name: blog_category
  - name: blog_tag
```

**❌ Bad:**

```yaml
# ontology-blog.yaml (bloated!)
feature: blog
thingTypes:
  - name: blog_post
  - name: blog_category
  - name: product        # ❌ Wrong feature!
  - name: shopping_cart  # ❌ Wrong feature!
```

**Guideline:** If a type doesn't make sense without the feature, it belongs in that feature.

---

### 2. Use Inheritance Wisely

**✅ Good:**

```yaml
# ontology-advanced-blog.yaml
feature: advanced-blog
extends: blog          # ✅ Builds on top of blog
thingTypes:
  - name: blog_series
  - name: blog_newsletter
```

**❌ Bad:**

```yaml
# ontology-products.yaml
feature: products
extends: blog          # ❌ Products have nothing to do with blog!
```

**Guideline:** Only extend features that are semantically related.

---

### 3. Define Properties Exhaustively

**✅ Good:**

```yaml
thingTypes:
  - name: product
    properties:
      name: string
      sku: string
      price: number
      inventory: number
      description: string
      images: string[]
      status: string
      createdAt: number
      updatedAt: number
```

**❌ Bad:**

```yaml
thingTypes:
  - name: product
    properties:
      data: object       # ❌ Too vague!
```

**Guideline:** Be explicit about properties. Use `object` only for truly dynamic data.

---

### 4. Use Semantic Connection Names

**✅ Good:**

```yaml
connectionTypes:
  - name: purchased      # ✅ Clear action
    fromType: user
    toType: product

  - name: in_cart        # ✅ Clear state
    fromType: user
    toType: product
```

**❌ Bad:**

```yaml
connectionTypes:
  - name: user_product   # ❌ Too vague!
    fromType: user
    toType: product
```

**Guideline:** Connection names should describe the relationship clearly.

---

### 5. Use Past Tense for Events

**✅ Good:**

```yaml
eventTypes:
  - name: product_created
  - name: order_placed
  - name: payment_processed
```

**❌ Bad:**

```yaml
eventTypes:
  - name: create_product    # ❌ Present tense!
  - name: place_order       # ❌ Imperative!
```

**Guideline:** Events describe what **happened** (past tense).

---

## Advanced Patterns

### Pattern 1: Multi-Backend Support

Run different backends with different feature sets:

```bash
# Backend A (blog-focused)
PUBLIC_FEATURES="core,blog,portfolio"

# Backend B (e-commerce focused)
PUBLIC_FEATURES="core,shop,payments,inventory"

# Backend C (minimal)
PUBLIC_FEATURES="core"
```

Each backend generates types for only its enabled features!

---

### Pattern 2: Feature Flags with Runtime Checks

```typescript
import { hasFeature } from './types/ontology';

export const createBlogPost = mutation({
  handler: async (ctx, args) => {
    // Runtime check
    if (!hasFeature('blog')) {
      throw new Error('Blog feature not enabled');
    }

    // Type-safe (TypeScript knows 'blog_post' exists)
    await ctx.db.insert('things', {
      type: 'blog_post',
      // ...
    });
  },
});
```

---

### Pattern 3: Versioned Ontologies

Support multiple versions of the same feature:

```yaml
# ontology-blog-v1.yaml
feature: blog-v1
extends: core
thingTypes:
  - name: blog_post_v1

# ontology-blog-v2.yaml
feature: blog-v2
extends: core
thingTypes:
  - name: blog_post_v2
    properties:
      # New fields
```

Enable one or both:

```bash
PUBLIC_FEATURES="core,blog-v1,blog-v2"
```

---

### Pattern 4: Conditional Type Loading

```typescript
// Load types dynamically based on environment
const features = process.env.PUBLIC_FEATURES?.split(',') || ['core'];

if (features.includes('blog')) {
  // Blog-specific initialization
}
```

---

### Pattern 5: Type Composition

Combine multiple features to build complex applications:

```yaml
# ontology-marketplace.yaml
feature: marketplace
extends: shop
description: Multi-vendor marketplace (combines shop + vendors)

thingTypes:
  - name: vendor
  - name: vendor_product  # Product with vendor info

connectionTypes:
  - name: sold_by
    fromType: vendor_product
    toType: vendor
```

---

## Performance Optimization

### 1. Minimize Enabled Features

Only enable features you actually use:

```bash
# ❌ Loading everything (slow)
PUBLIC_FEATURES="core,blog,shop,courses,portfolio,social,videos,podcasts,nft,tokens"

# ✅ Load only what you need (fast)
PUBLIC_FEATURES="core,blog"
```

**Impact:**
- Smaller TypeScript bundle
- Faster type checking
- Fewer database indexes

---

### 2. Use Wildcard Types Sparingly

```yaml
# ❌ Wildcard creates many indexes
connectionTypes:
  - name: viewed_by
    fromType: '*'        # Creates index for EVERY thing type
    toType: user

# ✅ Be specific
connectionTypes:
  - name: viewed_by
    fromType: blog_post  # Only blog_post → user
    toType: user
```

---

### 3. Cache Generated Types

The generated `ontology.ts` file is deterministic. Cache it:

```typescript
// Check if types are up-to-date
const hash = hashFile('/one/knowledge/ontology-*.yaml');
if (cachedHash === hash) {
  console.log('Types are up-to-date');
  return;
}

// Regenerate only if changed
generateOntologyTypes();
```

---

### 4. Lazy Load Feature Validators

Don't load validators for disabled features:

```typescript
// ❌ Load all validators upfront
import { validateBlogPost } from './validators/blog';
import { validateProduct } from './validators/shop';

// ✅ Lazy load only when needed
const validators = {
  get blog_post() {
    if (!hasFeature('blog')) throw new Error('Blog not enabled');
    return require('./validators/blog').validateBlogPost;
  },
  get product() {
    if (!hasFeature('shop')) throw new Error('Shop not enabled');
    return require('./validators/shop').validateProduct;
  },
};
```

---

## Testing Strategies

### 1. Test Ontology Loading

```typescript
import { describe, it, expect } from 'bun:test';
import { loadOntology } from './scripts/generate-ontology-types';

describe('Ontology Loading', () => {
  it('should load core ontology', () => {
    const core = loadOntology('core');
    expect(core.thingTypes).toContain('page');
    expect(core.thingTypes).toContain('user');
  });

  it('should resolve dependencies', () => {
    const features = ['blog', 'shop'];
    const resolved = resolveFeatureDependencies(features);
    expect(resolved).toEqual(['core', 'blog', 'shop']);
  });

  it('should detect circular dependencies', () => {
    expect(() => {
      resolveFeatureDependencies(['circular-a', 'circular-b']);
    }).toThrow('Circular dependency');
  });
});
```

---

### 2. Test Type Guards

```typescript
describe('Type Guards', () => {
  it('should validate thing types', () => {
    expect(isThingType('blog_post')).toBe(true);
    expect(isThingType('invalid')).toBe(false);
  });

  it('should validate connection types', () => {
    expect(isConnectionType('created_by')).toBe(true);
    expect(isConnectionType('invalid')).toBe(false);
  });

  it('should validate event types', () => {
    expect(isEventType('thing_created')).toBe(true);
    expect(isEventType('invalid')).toBe(false);
  });
});
```

---

### 3. Test Feature Flags

```typescript
describe('Feature Flags', () => {
  it('should detect enabled features', () => {
    process.env.PUBLIC_FEATURES = 'core,blog';
    expect(hasFeature('blog')).toBe(true);
    expect(hasFeature('shop')).toBe(false);
  });

  it('should list all enabled features', () => {
    process.env.PUBLIC_FEATURES = 'core,blog,shop';
    expect(ENABLED_FEATURES).toEqual(['core', 'blog', 'shop']);
  });
});
```

---

### 4. Integration Tests

Test mutations with different feature sets:

```typescript
describe('Blog Mutations (blog enabled)', () => {
  beforeAll(() => {
    process.env.PUBLIC_FEATURES = 'core,blog';
    regenerateTypes();
  });

  it('should create blog post', async () => {
    const id = await createBlogPost({
      title: 'Test Post',
      content: 'Content',
    });
    expect(id).toBeDefined();
  });
});

describe('Blog Mutations (blog disabled)', () => {
  beforeAll(() => {
    process.env.PUBLIC_FEATURES = 'core';
    regenerateTypes();
  });

  it('should reject blog post creation', async () => {
    await expect(createBlogPost({
      title: 'Test Post',
      content: 'Content',
    })).rejects.toThrow('Blog feature not enabled');
  });
});
```

---

## Debugging

### Enable Verbose Logging

```bash
ONTOLOGY_DEBUG=true bun run scripts/generate-ontology-types.ts
```

**Output:**

```
[DEBUG] Loading feature: core
[DEBUG]   Thing types: page, user, file, link, note
[DEBUG]   Connection types: created_by, updated_by, viewed_by, favorited_by
[DEBUG]   Event types: thing_created, thing_updated, thing_deleted, thing_viewed
[DEBUG] Loading feature: blog (extends core)
[DEBUG]   Inherited types: page, user, file, link, note
[DEBUG]   New thing types: blog_post, blog_category
[DEBUG]   New connection types: posted_in
[DEBUG]   New event types: blog_post_published, blog_post_viewed
[DEBUG] Dependency resolution: core → blog
[DEBUG] Generated types written to: convex/types/ontology.ts
```

---

## Summary

The multi-ontology architecture provides:

✅ **Composability** - Features are independent and composable
✅ **Type Safety** - Full TypeScript validation
✅ **Flexibility** - Easy to add/remove features
✅ **Performance** - Load only what you need
✅ **Multi-Backend** - Different backends, different features
✅ **Developer Experience** - Clear, focused autocomplete

**Next Steps:**

- Read the [Quick Start Guide](./ontology-quickstart.md)
- Explore [Migration Guide](./ontology-migration-guide.md)
- Study example ontologies in `/one/knowledge/ontology-*.yaml`
