# Multi-Ontology Architecture: Quick Start Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-20
**Status:** Complete

## What is the Multi-Ontology Architecture?

The Multi-Ontology Architecture lets you extend the ONE Platform's core 6-dimension ontology with **feature-specific types**. Instead of hardcoding all possible entity types, features bring their own data models that compose cleanly.

### Core Concept

```
┌─────────────────────────────────────────────────┐
│  ONE Platform (6-Dimension Ontology)            │
│  Groups → People → Things → Connections         │
│  → Events → Knowledge                           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Feature Ontologies (Composable Extensions)     │
├─────────────────────────────────────────────────┤
│  core     → page, user, file, link              │
│  blog     → blog_post, blog_category            │
│  shop     → product, order, shopping_cart       │
│  courses  → course, lesson, enrollment          │
│  custom   → YOUR feature-specific types         │
└─────────────────────────────────────────────────┘
```

**Key Benefits:**

- **No Schema Bloat:** Only load types you actually use
- **Type Safety:** Full TypeScript validation for all types
- **Feature Isolation:** Features don't interfere with each other
- **Easy Extension:** Add new features without touching core
- **Multi-Backend:** Run different backends with different feature sets

---

## 5-Minute Setup

### Step 1: Enable Features

Edit your environment configuration:

```bash
# .env.local
PUBLIC_FEATURES="blog,portfolio"
```

This tells the platform to load the `blog` and `portfolio` ontology extensions.

### Step 2: Generate Types

From the backend directory:

```bash
cd backend
bun run scripts/generate-ontology-types.ts
```

This script:
1. Reads all enabled feature ontologies from `/one/knowledge/ontology-*.yaml`
2. Generates TypeScript types in `convex/types/ontology.ts`
3. Creates validation functions and type guards
4. Outputs a summary of loaded types

**Expected output:**

```
✅ Loaded ontology: core (5 thing types, 4 connection types, 4 event types)
✅ Loaded ontology: blog (2 thing types, 1 connection type, 2 event types)
✅ Loaded ontology: portfolio (3 thing types, 2 connection types, 3 event types)
📦 Generated types: 10 thing types, 7 connection types, 9 event types
```

### Step 3: Deploy Schema

Start Convex development server:

```bash
npx convex dev
```

Convex will automatically:
- Read the generated types
- Update schema validation
- Hot-reload with new types

**Done!** Your schema now validates blog and portfolio types.

---

## Adding a New Feature

Let's add a custom "products" feature with inventory tracking.

### Step 1: Create Ontology YAML

Create `/one/knowledge/ontology-products.yaml`:

```yaml
feature: products
extends: core
description: Product catalog and inventory management

thingTypes:
  - name: product
    properties:
      name: string
      sku: string
      price: number
      inventory: number
      description: string
      images: string[]

  - name: inventory_log
    properties:
      productId: string
      quantity: number
      action: string
      timestamp: number

connectionTypes:
  - name: in_stock
    fromType: product
    toType: warehouse

  - name: supplied_by
    fromType: product
    toType: supplier

eventTypes:
  - name: product_created
    thingType: product

  - name: inventory_updated
    thingType: product

  - name: product_sold
    thingType: product
```

### Step 2: Enable Feature

Update your environment:

```bash
# .env.local
PUBLIC_FEATURES="blog,portfolio,products"
```

### Step 3: Regenerate Types

```bash
cd backend
bun run scripts/generate-ontology-types.ts
```

**Output:**

```
✅ Loaded ontology: core (5 thing types, 4 connection types, 4 event types)
✅ Loaded ontology: blog (2 thing types, 1 connection type, 2 event types)
✅ Loaded ontology: portfolio (3 thing types, 2 connection types, 3 event types)
✅ Loaded ontology: products (2 thing types, 2 connection types, 3 event types)
📦 Generated types: 12 thing types, 9 connection types, 12 event types
```

### Step 4: Use in Code

Now use your new types in Convex mutations:

```typescript
// backend/convex/mutations/products.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { isThingType } from './types/ontology';

export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    price: v.number(),
    inventory: v.number(),
  },
  handler: async (ctx, args) => {
    // Type validation happens automatically!
    const productId = await ctx.db.insert('things', {
      type: 'product', // ✅ Validated against ontology
      name: args.name,
      properties: {
        sku: args.sku,
        price: args.price,
        inventory: args.inventory,
        description: '',
        images: [],
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert('events', {
      type: 'product_created', // ✅ Validated against ontology
      actorId: ctx.auth.getUserIdentity()?.tokenIdentifier,
      targetId: productId,
      timestamp: Date.now(),
      metadata: {
        sku: args.sku,
        price: args.price,
      },
    });

    return productId;
  },
});
```

---

## Common Tasks

### Check Available Types

```typescript
import { THING_TYPES, CONNECTION_TYPES, EVENT_TYPES } from './types/ontology';

console.log('Available thing types:', THING_TYPES);
// Output: ['page', 'user', 'file', 'blog_post', 'product', ...]

console.log('Available connection types:', CONNECTION_TYPES);
// Output: ['created_by', 'posted_in', 'in_stock', ...]

console.log('Available event types:', EVENT_TYPES);
// Output: ['thing_created', 'blog_post_published', 'product_created', ...]
```

### Validate User Input

```typescript
import { isThingType, isConnectionType, isEventType } from './types/ontology';

// Validate thing type
if (!isThingType(userInput)) {
  throw new Error(`Invalid thing type: ${userInput}`);
}

// Validate connection type
if (!isConnectionType(relationshipType)) {
  throw new Error(`Invalid connection type: ${relationshipType}`);
}

// Validate event type
if (!isEventType(eventType)) {
  throw new Error(`Invalid event type: ${eventType}`);
}
```

### Feature-Conditional Logic

```typescript
import { hasFeature, ENABLED_FEATURES } from './types/ontology';

// Check if feature is enabled
if (hasFeature('blog')) {
  // Blog-specific logic
  console.log('Blog feature is enabled');
}

if (hasFeature('products')) {
  // Products-specific logic
  console.log('Products feature is enabled');
}

// List all enabled features
console.log('Enabled features:', ENABLED_FEATURES);
// Output: ['core', 'blog', 'products']
```

### Get Thing Type Schema

```typescript
import { getThingTypeSchema } from './types/ontology';

const productSchema = getThingTypeSchema('product');
console.log(productSchema);
// Output:
// {
//   name: 'product',
//   properties: {
//     name: 'string',
//     sku: 'string',
//     price: 'number',
//     inventory: 'number',
//     description: 'string',
//     images: 'string[]'
//   },
//   feature: 'products'
// }
```

---

## Troubleshooting

### Problem: Type not found after adding feature

**Symptom:**
```
Error: Invalid thing type: "product"
```

**Solution:**
1. Verify feature is in `PUBLIC_FEATURES` environment variable
2. Run `bun run scripts/generate-ontology-types.ts`
3. Restart Convex dev server (`npx convex dev`)

---

### Problem: Schema validation fails

**Symptom:**
```
Error: Validation failed for thing type "product"
Property "price" expected number, got string
```

**Solution:**
Check your ontology YAML file for correct property types:

```yaml
# ❌ Wrong
properties:
  price: string  # Should be number!

# ✅ Correct
properties:
  price: number
```

Supported property types: `string`, `number`, `boolean`, `object`, `string[]`, `number[]`

---

### Problem: Circular dependency error

**Symptom:**
```
Error: Circular dependency detected: blog → portfolio → blog
```

**Solution:**
Check your `extends` fields - avoid circular references:

```yaml
# ❌ Wrong
# ontology-blog.yaml
extends: portfolio

# ontology-portfolio.yaml
extends: blog

# ✅ Correct
# ontology-blog.yaml
extends: core

# ontology-portfolio.yaml
extends: core
```

---

### Problem: Feature not loading

**Symptom:**
```
⚠️  Feature "products" not found, skipping
```

**Solution:**
1. Verify file exists: `/one/knowledge/ontology-products.yaml`
2. Check file naming convention: `ontology-{feature}.yaml`
3. Ensure YAML is valid (no syntax errors)
4. Feature name in YAML must match filename:

```yaml
# File: ontology-products.yaml
feature: products  # ✅ Must match filename
```

---

## Example: Full CRUD Implementation

Here's a complete example showing how to implement CRUD operations with the multi-ontology architecture:

```typescript
// backend/convex/mutations/products.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';
import { isThingType } from './types/ontology';

// CREATE
export const createProduct = mutation({
  args: {
    name: v.string(),
    sku: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const productId = await ctx.db.insert('things', {
      type: 'product',
      name: args.name,
      properties: {
        sku: args.sku,
        price: args.price,
        inventory: 0,
        description: '',
        images: [],
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.db.insert('events', {
      type: 'product_created',
      actorId: ctx.auth.getUserIdentity()?.tokenIdentifier,
      targetId: productId,
      timestamp: Date.now(),
      metadata: args,
    });

    return productId;
  },
});

// READ
export const getProduct = query({
  args: { id: v.id('things') },
  handler: async (ctx, { id }) => {
    const product = await ctx.db.get(id);
    if (!product || product.type !== 'product') {
      throw new Error('Product not found');
    }
    return product;
  },
});

// UPDATE
export const updateProduct = mutation({
  args: {
    id: v.id('things'),
    price: v.optional(v.number()),
    inventory: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product || product.type !== 'product') {
      throw new Error('Product not found');
    }

    await ctx.db.patch(args.id, {
      properties: {
        ...product.properties,
        price: args.price ?? product.properties.price,
        inventory: args.inventory ?? product.properties.inventory,
      },
      updatedAt: Date.now(),
    });

    await ctx.db.insert('events', {
      type: 'product_updated',
      actorId: ctx.auth.getUserIdentity()?.tokenIdentifier,
      targetId: args.id,
      timestamp: Date.now(),
      metadata: {
        changes: {
          price: args.price,
          inventory: args.inventory,
        },
      },
    });
  },
});

// DELETE
export const deleteProduct = mutation({
  args: { id: v.id('things') },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status: 'deleted',
      updatedAt: Date.now(),
    });

    await ctx.db.insert('events', {
      type: 'product_deleted',
      actorId: ctx.auth.getUserIdentity()?.tokenIdentifier,
      targetId: id,
      timestamp: Date.now(),
      metadata: {},
    });
  },
});
```

---

## Next Steps

- **Read the Developer Guide** (`ontology-developer-guide.md`) for advanced patterns and architecture details
- **Explore example ontologies** in `/one/knowledge/ontology-*.yaml` to see real-world implementations
- **Join the community** for support and to share your custom ontologies
- **Contribute features** by submitting your ontology YAML files

---

## Quick Reference

### File Locations

- **Ontology Definitions:** `/one/knowledge/ontology-{feature}.yaml`
- **Generated Types:** `/backend/convex/types/ontology.ts`
- **Type Generator Script:** `/backend/scripts/generate-ontology-types.ts`
- **Environment Config:** `.env.local` (add `PUBLIC_FEATURES`)

### Commands

```bash
# Generate types
bun run scripts/generate-ontology-types.ts

# Start Convex dev server
npx convex dev

# Deploy to production
npx convex deploy
```

### YAML Structure

```yaml
feature: {feature-name}
extends: core | null
description: {human-readable description}

thingTypes:
  - name: {type-name}
    properties:
      {field}: {type}

connectionTypes:
  - name: {type-name}
    fromType: {thing-type} | '*'
    toType: {thing-type} | '*'

eventTypes:
  - name: {event-name}
    thingType: {thing-type} | '*'
```

### Property Types

- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `object` - JSON objects
- `string[]` - Array of strings
- `number[]` - Array of numbers

---

**You're now ready to build with the Multi-Ontology Architecture!** 🚀
