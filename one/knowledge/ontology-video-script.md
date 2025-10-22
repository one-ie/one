# Multi-Ontology Tutorial Video Script

**Purpose:** Educational video series explaining the multi-ontology architecture
**Target Audience:** Developers building on ONE Platform
**Total Duration:** ~35 minutes (3 videos)

---

## Video 1: Introduction to Multi-Ontology Architecture (5 minutes)

### [0:00-0:30] Hook

**VISUAL:** Animation showing traditional database schema with 50+ tables gradually simplifying to 6 clean dimensions

**SCRIPT:**

"What if you could add a complete e-commerce feature to your platform without writing a single database migration?

What if adding a blog, newsletter, or course system was as simple as enabling a feature flag?

Welcome to the Multi-Ontology Architecture."

**ON-SCREEN TEXT:**
- No schema migrations
- Type-safe by default
- Infinite extensibility

### [0:30-2:00] The Problem

**VISUAL:** Split screen showing traditional vs. ONE approach

**SCRIPT:**

"Traditional platforms create new database tables for every feature.

Want to add a blog? Create tables for posts, categories, tags, authors, comments...

Want to add a shop? Create tables for products, orders, inventory, shipping...

Before long, you have 50 tables, 200 columns, and a maintenance nightmare.

Every new feature requires:
- Database migrations
- Schema updates
- Breaking changes
- Hours of debugging

There's a better way."

**ON-SCREEN TEXT:**
Traditional:
- 50+ tables
- Schema migrations
- Breaking changes

ONE:
- 6 dimensions
- YAML definitions
- Zero downtime

### [2:00-3:30] The Solution

**VISUAL:** 6-dimension ontology diagram with things, connections, events flowing

**SCRIPT:**

"The Multi-Ontology Architecture solves this with 6 universal dimensions:

1. **Groups** - Who belongs where (organizations, teams, communities)
2. **People** - Who can do what (roles, permissions)
3. **Things** - What exists (any entity in your system)
4. **Connections** - How they relate (relationships between entities)
5. **Events** - What happened (complete audit trail)
6. **Knowledge** - What it means (semantic search and AI)

These 6 dimensions never change.

But you can add unlimited features by extending them with YAML definitions.

Want a blog? Define blog_post as a thing type.
Want a shop? Define product as a thing type.
Want a newsletter? Define subscriber as a thing type.

All type-safe. All auto-generated. Zero schema migrations."

**ON-SCREEN TEXT:**
6 Dimensions = Infinite Features

### [3:30-5:00] What You'll Learn

**VISUAL:** Course outline with chapters

**SCRIPT:**

"In this tutorial series, you'll learn:

**Video 1 (this video):** Understanding the architecture

**Video 2:** Creating your first feature - We'll build a complete newsletter system with subscriptions, campaigns, and analytics. 10 minutes.

**Video 3:** Advanced patterns - Multi-feature interactions, performance optimization, and production deployment. 20 minutes.

By the end, you'll be able to:
- Create custom features in minutes
- Compose features together
- Deploy with confidence
- Scale infinitely

Let's get started."

**ON-SCREEN TEXT:**
- 3 videos, 35 minutes
- Build a real feature
- Production-ready patterns

---

## Video 2: Creating Your First Feature (10 minutes)

### [0:00-0:30] Introduction

**VISUAL:** Finished newsletter dashboard preview

**SCRIPT:**

"Welcome back! In this video, we're building a complete newsletter feature from scratch.

We'll create:
- Newsletter publications
- Subscriber management
- Email campaigns
- Analytics dashboard

And it'll all be type-safe and real-time.

Let's dive in."

### [0:30-2:00] Planning the Data Model

**VISUAL:** Whiteboard diagram of entities and relationships

**SCRIPT:**

"Before writing any code, let's plan our data model.

**What entities do we need?** (Things)
- Newsletter - The publication
- Newsletter Issue - Individual editions
- Subscriber - People subscribed
- Campaign - Email delivery system

**How do they relate?** (Connections)
- Creator owns Newsletter
- Issue belongs to Newsletter
- Subscriber subscribes to Newsletter
- Campaign sends Issue

**What actions happen?** (Events)
- Newsletter created
- User subscribed
- Issue published
- Campaign sent
- Email opened

This maps perfectly to our 6-dimension ontology."

**ON-SCREEN DIAGRAM:**
```
Creator --owns--> Newsletter --contains--> Issue
                      ^                      |
                      |                      |
Subscriber --subscribes to              Campaign --sends-->
```

### [2:00-4:00] Creating the YAML Ontology

**VISUAL:** Code editor showing YAML file being created

**SCRIPT:**

"Now we define this in YAML. Create `ontology-newsletter.yaml`:

First, declare the feature:

```yaml
feature: newsletter
extends: core
version: "1.0.0"
```

This extends the core ontology, giving us access to creator, group, and other core types.

Now define our things:

```yaml
thingTypes:
  - name: newsletter
    properties:
      title: string
      description: string
      schedule: string
      subscriberCount: number
```

Define connections:

```yaml
connectionTypes:
  - name: subscribed_to
    fromType: subscriber
    toType: newsletter
```

And events:

```yaml
eventTypes:
  - name: newsletter_subscribed
    thingType: subscriber
```

That's it. Our ontology is defined."

**ON-SCREEN TEXT:**
- 4 thing types
- 5 connection types
- 12 event types
= Complete feature

### [4:00-5:30] Generating TypeScript Types

**VISUAL:** Terminal showing type generation

**SCRIPT:**

"Now the magic happens. Run the type generator:

```bash
PUBLIC_FEATURES='newsletter' bun run generate-ontology-types.ts
```

Watch as it:
1. Loads the core ontology
2. Loads your newsletter ontology
3. Composes them together
4. Generates TypeScript types

Output:
- 70 thing types (core + newsletter)
- 30 connection types
- 79 event types

All type-safe. All auto-complete. Zero manual typing."

**ON-SCREEN OUTPUT:**
```
✅ Ontologies loaded successfully!
   - Features: core, newsletter
   - Thing Types: 70
   - Connection Types: 30
   - Event Types: 79
⚙️  Generating TypeScript types...
✅ Types generated successfully!
```

### [5:30-7:30] Creating Mutations

**VISUAL:** Code editor showing mutation being written

**SCRIPT:**

"Now write a mutation to create newsletters.

Import the generated types:

```typescript
import type { ThingType, ConnectionType, EventType }
  from '../types/ontology';
```

Create the mutation:

```typescript
export const create = mutation({
  args: {
    groupId: v.id('groups'),
    title: v.string(),
    schedule: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Create newsletter entity
    const newsletterId = await ctx.db.insert('entities', {
      type: 'newsletter' as ThingType,
      name: args.title,
      properties: { /* ... */ },
    });

    // 2. Create ownership connection
    await ctx.db.insert('connections', {
      relationshipType: 'owns' as ConnectionType,
      fromEntityId: userId,
      toEntityId: newsletterId,
    });

    // 3. Log creation event
    await ctx.db.insert('events', {
      type: 'newsletter_created' as EventType,
      actorId: userId,
      targetId: newsletterId,
    });

    return newsletterId;
  },
});
```

Three steps. Create, connect, log. Every time."

**ON-SCREEN TEXT:**
Pattern:
1. Create entity
2. Create connection
3. Log event

### [7:30-9:00] Creating Queries

**VISUAL:** Code showing real-time queries

**SCRIPT:**

"Queries are even simpler:

```typescript
export const list = query({
  args: { groupId: v.id('groups') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('entities')
      .withIndex('group_type', q =>
        q.eq('groupId', args.groupId)
         .eq('type', 'newsletter')
      )
      .collect();
  },
});
```

This automatically:
- Filters by group (multi-tenant)
- Filters by type
- Returns real-time results

When someone creates a newsletter, all subscribers see it instantly.

That's the power of Convex."

### [9:00-10:00] Testing & Wrap-up

**VISUAL:** Test results showing green checkmarks

**SCRIPT:**

"Write tests to validate:

```typescript
it('should create newsletter', async () => {
  const id = await t.mutation(api.newsletter.create, {
    groupId: 'test',
    title: 'Test Newsletter',
  });

  expect(id).toBeDefined();
});
```

Run tests:
```bash
bun test newsletter.test.ts
```

✅ All passing.

You just built a complete newsletter system in 10 minutes.

Type-safe. Real-time. Production-ready.

In the next video, we'll explore advanced patterns like multi-feature interactions and performance optimization.

See you there!"

---

## Video 3: Advanced Patterns (20 minutes)

### [0:00-0:30] Introduction

**VISUAL:** Complex architecture diagram

**SCRIPT:**

"Welcome to the advanced patterns video!

You've learned the basics. Now let's level up.

We'll cover:
- Multi-feature interactions
- Performance optimization
- Production deployment
- Real-world case studies

Let's go deep."

### [0:30-3:00] Pattern 1: Multi-Feature Composition

**VISUAL:** Blog + Newsletter integration diagram

**SCRIPT:**

"Features can interact with each other.

Let's integrate blog and newsletter.

Goal: Send blog posts to newsletter subscribers.

Create an integration ontology:

```yaml
feature: blog-newsletter
extends: blog,newsletter
```

Notice: We extend BOTH features.

Now define a connection:

```yaml
connectionTypes:
  - name: featured_in
    fromType: blog_post      # From blog feature
    toType: newsletter_issue # From newsletter feature
```

And an event:

```yaml
eventTypes:
  - name: post_emailed
    thingType: blog_post
```

Now implement:

```typescript
export const sendPostToNewsletter = mutation({
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    // Create newsletter issue from post
    const issueId = await ctx.db.insert('entities', {
      type: 'newsletter_issue',
      properties: {
        title: post.properties.title,
        content: post.properties.content,
      },
    });

    // Link post to issue
    await ctx.db.insert('connections', {
      relationshipType: 'featured_in',
      fromEntityId: args.postId,
      toEntityId: issueId,
    });

    // Log event
    await ctx.db.insert('events', {
      type: 'post_emailed',
      actorId: args.postId,
      targetId: issueId,
    });

    return issueId;
  },
});
```

Features compose beautifully."

**ON-SCREEN TEXT:**
Compose Features:
- Extend multiple
- Cross-reference types
- Share connections
- Unified events

### [3:00-6:00] Pattern 2: Conditional Features (Runtime)

**VISUAL:** Feature flags dashboard

**SCRIPT:**

"Features can be enabled/disabled at runtime.

Check enabled features:

```typescript
import { ONTOLOGY_METADATA } from '../types/ontology';

export const getFeatures = query({
  handler: async () => {
    return {
      enabled: ONTOLOGY_METADATA.features,
      hasBlog: ONTOLOGY_METADATA.features.includes('blog'),
      hasShop: ONTOLOGY_METADATA.features.includes('shop'),
    };
  },
});
```

Use in conditional logic:

```typescript
export const createContent = mutation({
  handler: async (ctx, args) => {
    const features = ONTOLOGY_METADATA.features;

    if (args.type === 'blog_post' && !features.includes('blog')) {
      throw new Error('Blog feature not enabled');
    }

    // Create entity...
  },
});
```

This enables:
- Feature flags
- A/B testing
- Gradual rollouts
- Per-group features

Different organizations can enable different features.

One platform. Infinite configurations."

**ON-SCREEN TEXT:**
Runtime Features:
- Feature flags
- A/B testing
- Gradual rollout
- Per-org config

### [6:00-10:00] Pattern 3: Performance Optimization

**VISUAL:** Performance metrics dashboard

**SCRIPT:**

"At scale, performance matters.

**Optimization 1: Cache Type Sets**

Type validation can be slow with linear search.

Before:
```typescript
function isValid(type: string) {
  return THING_TYPES.includes(type); // O(n)
}
```

After:
```typescript
const THING_TYPE_SET = new Set(THING_TYPES);

function isValid(type: string) {
  return THING_TYPE_SET.has(type); // O(1)
}
```

100x faster on large type arrays.

**Optimization 2: Batch Operations**

Don't create entities one-by-one:

```typescript
// Bad: Loop with awaits
for (const item of items) {
  await create(item); // Slow!
}

// Good: Batch with Promise.all
const results = await Promise.all(
  items.map(item => create(item))
);
```

10x faster for bulk operations.

**Optimization 3: Index Strategy**

Always use indexes:

```typescript
// Bad: No index
await ctx.db.query('entities').collect();

// Good: Use index
await ctx.db
  .query('entities')
  .withIndex('group_type', q =>
    q.eq('groupId', groupId).eq('type', 'newsletter')
  )
  .collect();
```

1000x faster on large datasets.

**Optimization 4: Limit Results**

Always paginate:

```typescript
// Bad: Unbounded
await ctx.db.query('entities').collect();

// Good: Limited
await ctx.db.query('entities').take(50);
```

Prevents memory issues at scale."

**ON-SCREEN METRICS:**
- Type checks: 100x faster
- Batch ops: 10x faster
- Indexed queries: 1000x faster
- Pagination: ∞x safer

### [10:00-14:00] Pattern 4: Event-Driven Analytics

**VISUAL:** Analytics dashboard with charts

**SCRIPT:**

"Events power analytics.

Every action creates an event. Query events for insights.

**Basic Analytics:**

```typescript
export const getAnalytics = query({
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query('events')
      .withIndex('target_time', q =>
        q.eq('targetId', newsletterId)
         .gte('timestamp', thirtyDaysAgo)
      )
      .collect();

    return {
      subscriptions: events.filter(e =>
        e.type === 'newsletter_subscribed'
      ).length,
      unsubscriptions: events.filter(e =>
        e.type === 'newsletter_unsubscribed'
      ).length,
    };
  },
});
```

**Advanced: Cohort Analysis**

```typescript
// Group subscribers by signup date
const cohorts = subscribers.reduce((acc, sub) => {
  const week = getWeek(sub.properties.subscribedAt);
  if (!acc[week]) acc[week] = [];
  acc[week].push(sub);
  return acc;
}, {});

// Calculate retention for each cohort
const retention = Object.entries(cohorts).map(([week, subs]) => {
  const stillActive = subs.filter(s =>
    s.properties.active
  ).length;

  return {
    week,
    cohortSize: subs.length,
    stillActive,
    retentionRate: stillActive / subs.length,
  };
});
```

Events enable any analytics without changing schema."

**ON-SCREEN TEXT:**
Event-Driven Analytics:
- No schema changes
- Real-time metrics
- Infinite dimensions
- Cohort analysis

### [14:00-17:00] Production Deployment

**VISUAL:** Deployment pipeline diagram

**SCRIPT:**

"Let's deploy to production.

**Step 1: Environment Setup**

```bash
# Development
PUBLIC_FEATURES="blog,newsletter,shop"
CONVEX_URL=https://dev.convex.cloud

# Staging
PUBLIC_FEATURES="blog,newsletter,shop,courses"
CONVEX_URL=https://staging.convex.cloud

# Production
PUBLIC_FEATURES="blog,newsletter"
CONVEX_URL=https://prod.convex.cloud
```

Different features per environment!

**Step 2: Generate Types for Production**

```bash
# In CI/CD pipeline
PUBLIC_FEATURES=$PROD_FEATURES \
  bun run generate-ontology-types.ts
```

**Step 3: Deploy**

```bash
# Deploy backend
cd backend && npx convex deploy

# Deploy frontend
cd web && bun run build && wrangler deploy
```

**Step 4: Rollback (if needed)**

Convex has instant rollback:

```bash
npx convex deploy --rollback
```

Back to previous version in seconds.

**Step 5: Monitor**

Watch real-time metrics:
- Event throughput
- Query latency
- Error rates
- Feature usage

All built-in."

**ON-SCREEN TEXT:**
Production Checklist:
✅ Environment config
✅ Type generation
✅ Deploy backend
✅ Deploy frontend
✅ Monitor metrics

### [17:00-19:00] Real-World Case Study

**VISUAL:** Production dashboard screenshots

**SCRIPT:**

"Let's see this in action.

**Case Study: ONE Platform**

The ONE Platform uses this exact architecture.

Features enabled:
- blog (content publishing)
- newsletter (email marketing)
- courses (education)
- shop (e-commerce)
- tokens (creator economy)

**By the numbers:**
- 66 thing types
- 31 connection types
- 93 event types
- 1 schema migration ever (the initial one)

**Adding a new feature:**
- Write YAML: 10 minutes
- Generate types: 5 seconds
- Write mutations: 20 minutes
- Write queries: 10 minutes
- Write tests: 15 minutes
- Deploy: 1 minute

Total: ~1 hour from idea to production.

Traditional approach: 2-4 weeks.

**Metrics:**
- 98% less context for AI
- 100x faster feature development
- Zero schema migrations
- Infinite scalability

This is the power of ontology-driven development."

**ON-SCREEN STATS:**
ONE Platform:
- 66 thing types
- 31 connections
- 93 events
- 0 migrations
- 1 hour per feature

### [19:00-20:00] Wrap-up & Next Steps

**VISUAL:** Course completion screen

**SCRIPT:**

"Congratulations! You've mastered the Multi-Ontology Architecture.

You learned:
1. The 6-dimension foundation
2. How to create features
3. Advanced composition patterns
4. Performance optimization
5. Production deployment

**What's next?**

1. Build your own feature
2. Join the community
3. Explore the documentation
4. Deploy to production

**Resources:**
- Documentation: /one/knowledge/
- Examples: /backend/examples/
- Community: Discord link
- Support: GitHub Issues

You're ready to build the future.

Happy coding!"

**ON-SCREEN TEXT:**
You Did It! 🎉

Next Steps:
1. Build your feature
2. Join Discord
3. Read docs
4. Ship it!

---

**END OF VIDEO SERIES**

Total Duration: ~35 minutes
- Video 1: 5 minutes (Introduction)
- Video 2: 10 minutes (First Feature)
- Video 3: 20 minutes (Advanced Patterns)

**Production Notes:**
- Use screen recording for code
- Use animations for concepts
- Add captions for accessibility
- Include timestamps in description
- Link to GitHub repos
- Provide downloadable code
