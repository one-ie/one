# Multi-Ontology Architecture: Feature-Specific Ontologies

**Status:** 🎯 Active Plan
**Created:** 2025-10-19
**Ontology:** Things (Infrastructure Planning)

---

## Vision

Each feature extends the **core 6-dimension ontology** with its own specialized types, allowing features to be self-contained modules with their own data models.

### Core Insight

```
Core Ontology (Universal)
  ├─ groups, people, things, connections, events, knowledge
  │
  └─ Feature Ontologies (Specialized Extensions)
     ├─ Blog Ontology → adds blog_post, blog_category things
     ├─ Shop Ontology → adds product, order, cart things
     ├─ Courses Ontology → adds course, lesson, quiz things
     ├─ Community Ontology → adds forum_topic, message things
     └─ Tokens Ontology → adds token, holder things
```

**Key Principle:** Features don't break the ontology - they **extend** it with new thing types, connection types, and event types.

---

## The Core 6-Dimension Ontology (Universal)

### Always Present (Every Site Has This)

```yaml
dimensions:
  1. groups:      # Who owns what (multi-tenant isolation)
  2. people:      # Who can do what (authorization)
  3. things:      # What exists (base types)
  4. connections: # How they relate (base relationships)
  5. events:      # What happened (base actions)
  6. knowledge:   # What it means (vectors, RAG)
```

### Core Thing Types (Minimal)

```typescript
// Always available
type CoreThingType =
  | 'page'           // Static pages
  | 'user'           // User profiles
  | 'file'           // Uploaded files
  | 'link'           // External links
  | 'note';          // Simple notes
```

### Core Connection Types (Minimal)

```typescript
// Always available
type CoreConnectionType =
  | 'created_by'
  | 'updated_by'
  | 'viewed_by'
  | 'favorited_by';
```

### Core Event Types (Minimal)

```typescript
// Always available
type CoreEventType =
  | 'thing_created'
  | 'thing_updated'
  | 'thing_deleted'
  | 'thing_viewed';
```

---

## Feature Ontologies (Extensions)

Each feature adds its own specialized types to the core ontology.

### 1. Blog Ontology

**File:** `one/knowledge/ontology-blog.md`

```yaml
feature: blog
extends: core-ontology

thing_types:
  - blog_post:
      properties:
        title: string
        slug: string
        content: string
        excerpt: string
        featuredImage: string
        publishedAt: number
        tags: string[]
        category: string

  - blog_category:
      properties:
        name: string
        slug: string
        description: string

connection_types:
  - posted_in:         # blog_post → blog_category
      fromType: blog_post
      toType: blog_category

event_types:
  - blog_post_published:
      thingType: blog_post
      metadata:
        title: string
        category: string

  - blog_post_viewed:
      thingType: blog_post
      metadata:
        viewDuration: number
```

**Routes Enabled:**
- `/blog`
- `/blog/[slug]`
- `/blog/category/[category]`

---

### 2. Portfolio Ontology

**File:** `one/knowledge/ontology-portfolio.md`

```yaml
feature: portfolio
extends: core-ontology

thing_types:
  - project:
      properties:
        title: string
        slug: string
        description: string
        images: string[]
        client: string
        completedAt: number
        technologies: string[]
        url: string

  - case_study:
      properties:
        title: string
        problem: string
        solution: string
        results: string
        metrics: Record<string, number>

connection_types:
  - belongs_to_portfolio:  # project → user
      fromType: project
      toType: user

event_types:
  - project_viewed:
      thingType: project
      metadata:
        viewDuration: number
```

**Routes Enabled:**
- `/portfolio`
- `/portfolio/[slug]`

---

### 3. Shop Ontology (Ecommerce)

**File:** `one/knowledge/ontology-shop.md` (already exists as `ontology-ecommerce.md`)

```yaml
feature: shop
extends: core-ontology

thing_types:
  - product:
      properties:
        name: string
        slug: string
        description: string
        price: number
        compareAtPrice: number
        images: string[]
        inventory: number
        sku: string
        variants: ProductVariant[]

  - product_variant:
      properties:
        name: string
        sku: string
        price: number
        inventory: number
        options: Record<string, string>

  - shopping_cart:
      properties:
        items: CartItem[]
        subtotal: number
        tax: number
        shipping: number
        total: number

  - order:
      properties:
        orderNumber: string
        items: OrderItem[]
        subtotal: number
        tax: number
        shipping: number
        total: number
        status: OrderStatus
        shippingAddress: Address
        billingAddress: Address
        paymentId: string

connection_types:
  - purchased:            # user → product
      fromType: user
      toType: product
      metadata:
        orderId: string
        quantity: number
        price: number

  - in_cart:             # user → product
      fromType: user
      toType: product
      metadata:
        quantity: number

event_types:
  - product_added_to_cart:
  - order_placed:
  - order_fulfilled:
  - payment_processed:
```

**Routes Enabled:**
- `/shop`
- `/shop/[slug]`
- `/cart`
- `/checkout`
- `/orders`

---

### 4. Courses Ontology (E-learning)

**File:** `one/knowledge/ontology-courses.md`

```yaml
feature: courses
extends: core-ontology

thing_types:
  - course:
      properties:
        title: string
        slug: string
        description: string
        price: number
        duration: string
        level: 'beginner' | 'intermediate' | 'advanced'
        thumbnail: string
        status: 'draft' | 'published' | 'archived'

  - lesson:
      properties:
        title: string
        slug: string
        content: string
        videoUrl: string
        duration: number
        order: number
        courseId: string

  - quiz:
      properties:
        title: string
        questions: Question[]
        passingScore: number

  - certificate:
      properties:
        studentId: string
        courseId: string
        issuedAt: number
        certificateUrl: string

connection_types:
  - enrolled_in:         # user → course
      fromType: user
      toType: course
      metadata:
        enrolledAt: number
        progress: number
        completedAt: number?

  - part_of:            # lesson → course
      fromType: lesson
      toType: course
      metadata:
        order: number

event_types:
  - enrolled_in_course:
      metadata:
        courseId: string
        price: number

  - lesson_completed:
      metadata:
        lessonId: string
        courseId: string
        timeSpent: number

  - quiz_submitted:
      metadata:
        quizId: string
        score: number
        passed: boolean

  - certificate_earned:
      metadata:
        courseId: string
        certificateId: string
```

**Routes Enabled:**
- `/courses`
- `/courses/[slug]`
- `/courses/[slug]/lessons/[lesson]`
- `/dashboard` (student progress)

---

### 5. Community Ontology

**File:** `one/knowledge/ontology-community.md`

```yaml
feature: community
extends: core-ontology

thing_types:
  - forum_topic:
      properties:
        title: string
        slug: string
        content: string
        isPinned: boolean
        isLocked: boolean
        viewCount: number
        replyCount: number

  - forum_reply:
      properties:
        content: string
        topicId: string
        replyToId: string?

  - direct_message:
      properties:
        content: string
        recipientId: string
        readAt: number?

connection_types:
  - follows:             # user → user
      fromType: user
      toType: user

  - member_of:          # user → community
      fromType: user
      toType: group
      metadata:
        role: 'admin' | 'moderator' | 'member'
        joinedAt: number

event_types:
  - topic_created:
  - topic_replied:
  - message_sent:
  - user_followed:
```

**Routes Enabled:**
- `/community`
- `/community/topics/[topic]`
- `/community/members`
- `/community/messages`

---

### 6. Tokens Ontology (Creator Economy)

**File:** `one/knowledge/ontology-tokens.md`

```yaml
feature: tokens
extends: core-ontology

thing_types:
  - token:
      properties:
        name: string
        symbol: string
        totalSupply: number
        circulatingSupply: number
        priceUSD: number
        contractAddress: string
        chain: 'ethereum' | 'polygon' | 'solana'

  - token_holder:
      properties:
        walletAddress: string
        balance: number
        lockedBalance: number

connection_types:
  - holds_tokens:        # user → token
      fromType: user
      toType: token
      metadata:
        balance: number
        acquiredAt: number
        avgPrice: number

event_types:
  - tokens_purchased:
      metadata:
        tokenId: string
        amount: number
        priceUSD: number
        paymentId: string

  - tokens_sold:
      metadata:
        tokenId: string
        amount: number
        priceUSD: number

  - tokens_transferred:
      metadata:
        fromUserId: string
        toUserId: string
        amount: number
```

**Routes Enabled:**
- `/tokens`
- `/tokens/buy`
- `/tokens/holders`

---

## Ontology Composition

### How Features Extend the Core

```typescript
// Core ontology (always present)
const coreOntology = {
  thingTypes: ['page', 'user', 'file', 'link', 'note'],
  connectionTypes: ['created_by', 'updated_by', 'viewed_by', 'favorited_by'],
  eventTypes: ['thing_created', 'thing_updated', 'thing_deleted', 'thing_viewed'],
};

// Feature ontologies (conditionally added)
const blogOntology = {
  thingTypes: ['blog_post', 'blog_category'],
  connectionTypes: ['posted_in'],
  eventTypes: ['blog_post_published', 'blog_post_viewed'],
};

const shopOntology = {
  thingTypes: ['product', 'product_variant', 'shopping_cart', 'order'],
  connectionTypes: ['purchased', 'in_cart'],
  eventTypes: ['product_added_to_cart', 'order_placed', 'order_fulfilled'],
};

// Compose based on enabled features
const compositeOntology = composeOntologies(
  coreOntology,
  hasFeature('blog') ? blogOntology : null,
  hasFeature('shop') ? shopOntology : null,
  hasFeature('courses') ? coursesOntology : null
);

// Result: TypeScript types are generated for enabled features only
type ThingType = CoreThingType | BlogThingType | ShopThingType | CoursesThingType;
```

---

## Backend Schema Generation

### Dynamic Schema Based on Enabled Features

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { loadOntologies } from './ontology-loader';

// Load ontologies based on PUBLIC_FEATURES env var
const ontologies = loadOntologies(process.env.PUBLIC_FEATURES);

export default defineSchema({
  // Core tables (always present)
  groups: defineTable({ /* ... */ }),
  people: defineTable({ /* ... */ }),

  // Things table with dynamic type validation
  things: defineTable({
    groupId: v.id('groups'),
    type: v.union(...ontologies.thingTypes.map(t => v.literal(t))),
    name: v.string(),
    properties: v.any(),
    status: v.union(v.literal('draft'), v.literal('active'), v.literal('archived')),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_group_and_type', ['groupId', 'type']),

  // Connections table with dynamic type validation
  connections: defineTable({
    groupId: v.id('groups'),
    fromThingId: v.id('things'),
    toThingId: v.id('things'),
    relationshipType: v.union(...ontologies.connectionTypes.map(t => v.literal(t))),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index('by_group_and_type', ['groupId', 'relationshipType']),

  // Events table with dynamic type validation
  events: defineTable({
    groupId: v.id('groups'),
    eventType: v.union(...ontologies.eventTypes.map(t => v.literal(t))),
    actorId: v.id('people'),
    targetId: v.optional(v.id('things')),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  }).index('by_group_and_type', ['groupId', 'eventType']),

  // Knowledge table (always present)
  knowledge: defineTable({ /* ... */ }),
});
```

---

## Type Safety with Feature-Specific Types

### Generated Types Based on Enabled Features

```typescript
// Generated by ontology composition
type ThingType =
  | CoreThingType
  | (hasFeature('blog') ? BlogThingType : never)
  | (hasFeature('shop') ? ShopThingType : never)
  | (hasFeature('courses') ? CoursesThingType : never);

type ConnectionType =
  | CoreConnectionType
  | (hasFeature('blog') ? BlogConnectionType : never)
  | (hasFeature('shop') ? ShopConnectionType : never)
  | (hasFeature('courses') ? CoursesConnectionType : never);

type EventType =
  | CoreEventType
  | (hasFeature('blog') ? BlogEventType : never)
  | (hasFeature('shop') ? ShopEventType : never)
  | (hasFeature('courses') ? CoursesEventType : never);

// Usage
const createBlogPost = (title: string, content: string) => {
  // TypeScript knows 'blog_post' is valid only if blog feature is enabled
  return db.insert('things', {
    type: 'blog_post' as ThingType,  // Type-safe!
    properties: { title, content },
  });
};
```

---

## Ontology Validation

### Compile-Time Validation

```typescript
// tools/validate-ontology.ts
import { FEATURES } from '../src/config/features';
import { loadOntologies } from '../backend/convex/ontology-loader';

const validateOntology = () => {
  const ontologies = loadOntologies(FEATURES.join(','));

  // Check for type conflicts
  const thingTypes = new Set();
  for (const type of ontologies.thingTypes) {
    if (thingTypes.has(type)) {
      throw new Error(`Duplicate thing type: ${type}`);
    }
    thingTypes.add(type);
  }

  // Check for connection type conflicts
  const connectionTypes = new Set();
  for (const type of ontologies.connectionTypes) {
    if (connectionTypes.has(type)) {
      throw new Error(`Duplicate connection type: ${type}`);
    }
    connectionTypes.add(type);
  }

  console.log('✓ Ontology validated successfully');
  console.log(`  Thing types: ${ontologies.thingTypes.length}`);
  console.log(`  Connection types: ${ontologies.connectionTypes.length}`);
  console.log(`  Event types: ${ontologies.eventTypes.length}`);
};

validateOntology();
```

---

## NPX OneIE Integration

### Ontology Initialization

```bash
npx oneie init

✓ What's your name? Jane Doe
✓ Select features: blog, portfolio, courses, shop, tokens

# Creates ontology configuration
📝 Composing ontology from selected features...

Core Ontology:
  ├─ 5 thing types
  ├─ 4 connection types
  └─ 4 event types

Blog Ontology:
  ├─ +2 thing types (blog_post, blog_category)
  ├─ +1 connection type (posted_in)
  └─ +2 event types (blog_post_published, blog_post_viewed)

Shop Ontology:
  ├─ +4 thing types (product, product_variant, shopping_cart, order)
  ├─ +2 connection types (purchased, in_cart)
  └─ +4 event types (product_added_to_cart, order_placed, ...)

Courses Ontology:
  ├─ +4 thing types (course, lesson, quiz, certificate)
  ├─ +2 connection types (enrolled_in, part_of)
  └─ +4 event types (enrolled_in_course, lesson_completed, ...)

Tokens Ontology:
  ├─ +2 thing types (token, token_holder)
  ├─ +1 connection type (holds_tokens)
  └─ +3 event types (tokens_purchased, tokens_sold, ...)

Total Ontology:
  ├─ 17 thing types
  ├─ 10 connection types
  └─ 17 event types

✅ Ontology composition complete!
```

---

## Benefits

### 1. Feature Isolation

Each feature's ontology is self-contained:

```
blog/
  ├─ ontology.md        # Blog-specific types
  ├─ pages/             # Blog pages
  ├─ components/        # Blog components
  └─ services/          # Blog services
```

### 2. Type Safety

TypeScript knows which types are available:

```typescript
// ✅ Valid if blog feature enabled
const post = await db.insert('things', {
  type: 'blog_post',
  properties: { title, content }
});

// ❌ Error if shop feature NOT enabled
const product = await db.insert('things', {
  type: 'product',  // TypeScript error: Type 'product' not in ThingType union
  properties: { name, price }
});
```

### 3. Efficient Schema

Database only validates types that exist:

```typescript
// If only blog feature enabled
type ThingType = 'page' | 'user' | 'file' | 'blog_post' | 'blog_category';

// Not: 'product' | 'course' | 'token' | etc.
```

### 4. Clear Dependencies

Features declare their ontology dependencies:

```yaml
# ontology-community.md
dependencies:
  - core-ontology
  - user (thing type from core)
```

### 5. Composability

Mix any features - ontologies compose cleanly:

```bash
# Creator + educator + merchant
PUBLIC_FEATURES=blog,portfolio,courses,shop,community,tokens

# Ontology = Core + Blog + Portfolio + Courses + Shop + Community + Tokens
```

---

## Implementation Plan

### Week 1: Core Infrastructure
1. Create ontology loader system
2. Update schema generator
3. Test core + blog ontology

### Week 2: Feature Ontologies
1. Extract blog ontology spec
2. Extract shop ontology spec (already exists!)
3. Create courses ontology spec
4. Create community ontology spec

### Week 3: Type Generation
1. Generate TypeScript types from ontology
2. Validate ontology composition
3. Test type safety

### Week 4: CLI Integration
1. Update `npx oneie` to compose ontologies
2. Add ontology validation
3. Generate schema.ts automatically

---

## File Structure

```
/one/knowledge/
  ├─ ontology.md                   # Core ontology (always loaded)
  ├─ ontology.yaml                 # Core ontology (YAML)
  ├─ ontology-blog.md              # Blog feature ontology
  ├─ ontology-portfolio.md         # Portfolio feature ontology
  ├─ ontology-shop.md              # Shop feature ontology (exists!)
  ├─ ontology-courses.md           # Courses feature ontology
  ├─ ontology-community.md         # Community feature ontology
  ├─ ontology-tokens.md            # Tokens feature ontology
  ├─ ontology-events.md            # Events feature ontology
  ├─ ontology-booking.md           # Booking feature ontology
  ├─ ontology-membership.md        # Membership feature ontology
  └─ ontology-analytics.md         # Analytics feature ontology

/backend/convex/
  ├─ schema.ts                     # Generated from composed ontology
  ├─ ontology-loader.ts            # Loads & composes ontologies
  └─ ontology-validator.ts         # Validates composition
```

---

## Success Metrics

- [ ] Core ontology defined (5 thing types, 4 connection types, 4 event types)
- [ ] Blog ontology extends core cleanly
- [ ] Shop ontology extracted from existing ecommerce ontology
- [ ] Ontology composition generates correct TypeScript types
- [ ] Schema.ts validates only enabled feature types
- [ ] No type conflicts when features combine
- [ ] `npx oneie` shows ontology composition summary
- [ ] Type safety enforced at compile time

---

## Next Steps

1. **Extract core ontology** (minimal thing/connection/event types)
2. **Create blog ontology** (blog_post, blog_category types)
3. **Refactor shop ontology** (already exists - just reorganize)
4. **Build ontology loader** (composes based on features)
5. **Generate schema.ts** (dynamic based on composition)
6. **Test type safety** (ensure TypeScript catches invalid types)

---

**This makes features truly modular!** 🚀

Each feature brings its own data model (ontology extension), and the system composes them into a unified schema. No rigid templates - just composable ontology modules that extend the universal 6-dimension core.
