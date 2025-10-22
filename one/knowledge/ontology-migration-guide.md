# Multi-Ontology Architecture: Migration Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-20
**Status:** Complete

## Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Strategy](#migration-strategy)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Data Migration](#data-migration)
6. [Rollback Procedures](#rollback-procedures)
7. [Common Pitfalls](#common-pitfalls)
8. [Case Studies](#case-studies)

---

## Overview

### What This Guide Covers

This guide helps you migrate from **hardcoded entity types** to the **multi-ontology architecture**.

**Before (Hardcoded):**

```typescript
// backend/convex/schema.ts
export const schema = defineSchema({
  entities: defineTable({
    type: v.union(
      v.literal('page'),
      v.literal('user'),
      v.literal('blog_post'),
      v.literal('product'),
      v.literal('course'),
      // ... 50 more types hardcoded here
    ),
    // ...
  }),
});
```

**After (Multi-Ontology):**

```yaml
# /one/knowledge/ontology-core.yaml
feature: core
thingTypes:
  - name: page
  - name: user

# /one/knowledge/ontology-blog.yaml
feature: blog
extends: core
thingTypes:
  - name: blog_post

# /one/knowledge/ontology-shop.yaml
feature: shop
extends: core
thingTypes:
  - name: product
```

```typescript
// backend/convex/schema.ts (generated)
import { THING_TYPES } from './types/ontology';

export const schema = defineSchema({
  entities: defineTable({
    type: v.union(...THING_TYPES.map(t => v.literal(t))),
    // ...
  }),
});
```

---

## Pre-Migration Checklist

Before starting migration, ensure you have:

- [ ] **Full database backup** (critical!)
- [ ] **List of all current entity types** in use
- [ ] **Feature grouping plan** (which types belong to which features)
- [ ] **Environment variables documented** (especially `PUBLIC_FEATURES`)
- [ ] **Testing environment ready** (staging/development database)
- [ ] **Rollback plan prepared** (see [Rollback Procedures](#rollback-procedures))
- [ ] **Team communication** (notify all developers of migration)

---

## Migration Strategy

### Option 1: Big Bang Migration (Small Projects)

**Best for:**
- Small projects (< 10 entity types)
- Single developer
- Development/staging only (no production yet)

**Steps:**
1. Create all ontology YAML files
2. Generate types
3. Update schema
4. Deploy

**Downtime:** Yes (1-2 hours)

---

### Option 2: Gradual Migration (Recommended)

**Best for:**
- Medium/large projects (10+ entity types)
- Multiple developers
- Production systems

**Steps:**
1. Create ontology YAMLs (no deployment yet)
2. Run both systems in parallel
3. Migrate features one by one
4. Validate each migration
5. Switch over when all features migrated

**Downtime:** No (zero-downtime migration)

---

### Option 3: Dual-Write Migration (Large Projects)

**Best for:**
- Large projects (50+ entity types)
- High-traffic production systems
- Risk-averse organizations

**Steps:**
1. Add ontology system alongside hardcoded types
2. Write to both systems simultaneously
3. Validate data consistency
4. Gradually shift reads to ontology system
5. Remove hardcoded types when confident

**Downtime:** No (weeks of parallel operation)

---

## Step-by-Step Migration

### Step 1: Inventory Your Entity Types

Create a spreadsheet of all entity types currently in use:

| Type          | Feature     | Usage Count | Dependencies        |
|---------------|-------------|-------------|---------------------|
| page          | core        | 1,245       | None                |
| user          | core        | 8,932       | None                |
| blog_post     | blog        | 3,421       | user (author)       |
| blog_category | blog        | 42          | None                |
| product       | shop        | 1,892       | user (seller)       |
| order         | shop        | 5,234       | product, user       |
| course        | courses     | 234         | user (instructor)   |
| lesson        | courses     | 1,456       | course              |

**Tools to help:**

```typescript
// Count entity types in database
const typeCounts = await ctx.db
  .query('entities')
  .collect()
  .then(entities => {
    const counts = {};
    entities.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  });

console.log(typeCounts);
// { page: 1245, user: 8932, blog_post: 3421, ... }
```

---

### Step 2: Group Types into Features

Organize your types into logical features:

**Core (always enabled):**
- `page`, `user`, `file`, `link`, `note`

**Blog:**
- `blog_post`, `blog_category`, `blog_tag`

**Shop:**
- `product`, `product_variant`, `order`, `shopping_cart`, `payment`

**Courses:**
- `course`, `lesson`, `enrollment`, `certificate`

---

### Step 3: Create Ontology YAML Files

Create one YAML file per feature:

**`/one/knowledge/ontology-core.yaml`:**

```yaml
feature: core
extends: null
description: Core entities always present

thingTypes:
  - name: page
    properties:
      title: string
      slug: string
      content: string

  - name: user
    properties:
      email: string
      displayName: string
      avatar: string

connectionTypes:
  - name: created_by
    fromType: '*'
    toType: user

eventTypes:
  - name: thing_created
    thingType: '*'
```

**`/one/knowledge/ontology-blog.yaml`:**

```yaml
feature: blog
extends: core
description: Blog and content publishing

thingTypes:
  - name: blog_post
    properties:
      title: string
      slug: string
      content: string
      excerpt: string
      publishedAt: number

  - name: blog_category
    properties:
      name: string
      slug: string

connectionTypes:
  - name: posted_in
    fromType: blog_post
    toType: blog_category

  - name: authored
    fromType: blog_post
    toType: user

eventTypes:
  - name: blog_post_published
    thingType: blog_post

  - name: blog_post_viewed
    thingType: blog_post
```

Repeat for each feature (`shop`, `courses`, etc.).

---

### Step 4: Generate Types (Test First!)

Generate types in a **test environment first**:

```bash
# Test environment
cd backend
PUBLIC_FEATURES="core,blog,shop,courses" bun run scripts/generate-ontology-types.ts
```

**Verify output:**

```
✅ Loaded ontology: core (2 thing types, 1 connection type, 1 event type)
✅ Loaded ontology: blog (2 thing types, 2 connection types, 2 event types)
✅ Loaded ontology: shop (5 thing types, 3 connection types, 4 event types)
✅ Loaded ontology: courses (4 thing types, 2 connection types, 3 event types)
📦 Generated types: 13 thing types, 8 connection types, 10 event types
```

---

### Step 5: Update Schema

**Before:**

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  entities: defineTable({
    type: v.union(
      v.literal('page'),
      v.literal('user'),
      v.literal('blog_post'),
      v.literal('product'),
      // ... hardcoded types
    ),
    name: v.string(),
    properties: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
```

**After:**

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { THING_TYPES } from './types/ontology';

// Generate union from ontology types
const thingTypeUnion = v.union(
  ...THING_TYPES.map(type => v.literal(type))
);

export default defineSchema({
  entities: defineTable({
    type: thingTypeUnion,  // ✅ Generated from ontology
    name: v.string(),
    properties: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
```

---

### Step 6: Update Mutations

**Before:**

```typescript
export const createBlogPost = mutation({
  handler: async (ctx, args) => {
    await ctx.db.insert('entities', {
      type: 'blog_post',  // ❌ Hardcoded
      // ...
    });
  },
});
```

**After:**

```typescript
import { isThingType } from './types/ontology';

export const createBlogPost = mutation({
  handler: async (ctx, args) => {
    const type = 'blog_post';

    // ✅ Runtime validation
    if (!isThingType(type)) {
      throw new Error(`Invalid thing type: ${type}`);
    }

    await ctx.db.insert('entities', {
      type,  // ✅ Type-safe
      // ...
    });
  },
});
```

---

### Step 7: Deploy to Staging

Deploy to staging environment first:

```bash
# Set features in staging .env.local
PUBLIC_FEATURES="core,blog,shop,courses"

# Deploy
cd backend
npx convex deploy --prod staging
```

**Test thoroughly:**
- [ ] All existing features work
- [ ] Can create new entities
- [ ] Can query entities by type
- [ ] Events are logged correctly
- [ ] Connections work

---

### Step 8: Deploy to Production

Once staging tests pass:

```bash
# Set features in production .env.local
PUBLIC_FEATURES="core,blog,shop,courses"

# Deploy
cd backend
npx convex deploy --prod production
```

**Monitor:**
- Error rates
- Query performance
- Type validation errors

---

## Data Migration

### No Data Changes Required!

**Good news:** The multi-ontology architecture doesn't change your **data structure**, only your **type definitions**.

Existing data remains valid:

```typescript
// Before migration
{
  _id: "abc123",
  type: "blog_post",  // ✅ Still valid
  name: "My Post",
  properties: { title: "Hello" },
  // ...
}

// After migration
{
  _id: "abc123",
  type: "blog_post",  // ✅ Still valid (now ontology-validated)
  name: "My Post",
  properties: { title: "Hello" },
  // ...
}
```

### If You Need to Rename Types

If you want to rename a type during migration:

**Option 1: Database Update Script**

```typescript
// scripts/migrate-types.ts
import { ConvexClient } from 'convex/browser';

const client = new ConvexClient(process.env.CONVEX_URL);

// Rename 'post' → 'blog_post'
const posts = await client.query('entities:list', { type: 'post' });

for (const post of posts) {
  await client.mutation('entities:update', {
    id: post._id,
    type: 'blog_post',  // ✅ New type name
  });
}
```

**Option 2: Type Alias**

Keep old type as alias:

```yaml
# ontology-blog.yaml
thingTypes:
  - name: blog_post
    aliases: ['post']  # Support old name temporarily
```

---

## Rollback Procedures

### Emergency Rollback (Production Issues)

If you encounter critical issues after deployment:

**Step 1: Revert Code**

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

**Step 2: Redeploy**

```bash
cd backend
npx convex deploy --prod production
```

**Step 3: Verify**

Check that system is functioning normally.

---

### Planned Rollback (Testing Failed)

If staging tests fail:

**Step 1: Document Issues**

Create detailed issue report:
- What broke?
- Which types/features affected?
- Error messages?
- Steps to reproduce?

**Step 2: Fix Ontology YAMLs**

Correct issues in YAML files.

**Step 3: Regenerate Types**

```bash
bun run scripts/generate-ontology-types.ts
```

**Step 4: Retest**

Repeat testing until all issues resolved.

---

## Common Pitfalls

### Pitfall 1: Missing Feature in Environment Variable

**Problem:**

```bash
# .env.local
PUBLIC_FEATURES="core,blog"  # ❌ Forgot 'shop'!
```

**Result:** Shop types not loaded, mutations fail.

**Solution:**

```bash
# .env.local
PUBLIC_FEATURES="core,blog,shop"  # ✅ All features
```

---

### Pitfall 2: Circular Dependencies

**Problem:**

```yaml
# ontology-blog.yaml
feature: blog
extends: portfolio  # ❌ Circular!

# ontology-portfolio.yaml
feature: portfolio
extends: blog  # ❌ Circular!
```

**Solution:**

```yaml
# ontology-blog.yaml
feature: blog
extends: core  # ✅ Both extend core

# ontology-portfolio.yaml
feature: portfolio
extends: core  # ✅ Both extend core
```

---

### Pitfall 3: Type Mismatch in Properties

**Problem:**

```yaml
# ontology-blog.yaml
thingTypes:
  - name: blog_post
    properties:
      publishedAt: string  # ❌ Should be number!
```

**Mutation:**

```typescript
await ctx.db.insert('entities', {
  type: 'blog_post',
  properties: {
    publishedAt: Date.now(),  // ❌ number, not string!
  },
});
```

**Solution:**

```yaml
# ontology-blog.yaml
thingTypes:
  - name: blog_post
    properties:
      publishedAt: number  # ✅ Correct type
```

---

### Pitfall 4: Not Regenerating Types After Changes

**Problem:**

1. Update `ontology-blog.yaml`
2. Deploy without regenerating types
3. TypeScript still uses old types

**Solution:**

```bash
# Always regenerate after YAML changes
bun run scripts/generate-ontology-types.ts
```

**Better: Add to package.json**

```json
{
  "scripts": {
    "dev": "bun run scripts/generate-ontology-types.ts && npx convex dev",
    "deploy": "bun run scripts/generate-ontology-types.ts && npx convex deploy"
  }
}
```

---

### Pitfall 5: Forgetting to Update Queries

**Problem:**

```typescript
// Old query (hardcoded type list)
const blogPosts = await ctx.db
  .query('entities')
  .filter(q => q.or(
    q.eq(q.field('type'), 'blog_post'),
    q.eq(q.field('type'), 'article'),  // ❌ Old type name
  ))
  .collect();
```

**Solution:**

```typescript
import { isThingType } from './types/ontology';

const blogPosts = await ctx.db
  .query('entities')
  .filter(q => q.eq(q.field('type'), 'blog_post'))  // ✅ Use ontology types
  .collect();
```

---

## Case Studies

### Case Study 1: Small Blog Platform

**Before:**
- 5 entity types (hardcoded)
- Single developer
- No production traffic

**Migration Approach:** Big Bang

**Steps:**
1. Created 2 YAML files (`core`, `blog`)
2. Generated types
3. Updated schema
4. Deployed to staging
5. Deployed to production

**Timeline:** 2 hours

**Issues:** None

**Outcome:** ✅ Successful

---

### Case Study 2: Multi-Feature SaaS Platform

**Before:**
- 35 entity types (hardcoded)
- 5 developers
- 10,000 daily active users

**Migration Approach:** Gradual

**Steps:**
1. Week 1: Created all YAML files
2. Week 2: Generated types, tested in staging
3. Week 3: Migrated `core` feature
4. Week 4: Migrated `blog` feature
5. Week 5: Migrated `shop` feature
6. Week 6: Migrated remaining features
7. Week 7: Removed hardcoded types

**Timeline:** 7 weeks

**Issues:**
- Week 3: Discovered circular dependency (`blog` ↔ `portfolio`)
- Week 5: Type mismatch in `product` properties

**Outcome:** ✅ Successful

---

### Case Study 3: Enterprise E-Commerce Platform

**Before:**
- 80+ entity types (hardcoded)
- 20 developers
- 500,000 daily active users

**Migration Approach:** Dual-Write

**Steps:**
1. Month 1: Created all YAML files
2. Month 2: Dual-write system (both hardcoded + ontology)
3. Month 3: Data consistency validation
4. Month 4: Shifted 25% of reads to ontology
5. Month 5: Shifted 50% of reads to ontology
6. Month 6: Shifted 100% of reads to ontology
7. Month 7: Removed hardcoded types

**Timeline:** 7 months

**Issues:**
- Month 2: Performance degradation (fixed with caching)
- Month 4: Data inconsistency (1 type had wrong properties)

**Outcome:** ✅ Successful

---

## Summary

**Migration Checklist:**

- [ ] Inventory all entity types
- [ ] Group types into features
- [ ] Create ontology YAML files
- [ ] Generate types in test environment
- [ ] Update schema
- [ ] Update mutations/queries
- [ ] Deploy to staging
- [ ] Test thoroughly
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Document lessons learned

**Key Takeaways:**

1. **Backup everything** before migration
2. **Test in staging first** (always!)
3. **Use gradual migration** for production systems
4. **Monitor closely** after deployment
5. **Have a rollback plan** ready
6. **Regenerate types** after every YAML change
7. **Update all code** (schema, mutations, queries)

**Next Steps:**

- Read the [Quick Start Guide](./ontology-quickstart.md)
- Explore the [Developer Guide](./ontology-developer-guide.md)
- Study example ontologies in `/one/knowledge/ontology-*.yaml`
