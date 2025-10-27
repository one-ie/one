# Queries Reference - 6-Dimension Ontology API

## Executive Summary

Complete reference documentation for all backend queries (`convex/queries/`) aligned with the ONE Platform's 6-dimension ontology. This consolidated guide covers overview, complete specifications, and practical examples.

**Status**: Complete and Production-Ready
**Total Queries**: 44 across 6 dimensions
**Documentation Levels**: Overview → Complete Reference → Practical Examples

---

## Table of Contents

1. [Overview](#overview)
2. [The 6-Dimension Reality Model](#the-6-dimension-reality-model)
3. [Query Organization by Dimension](#query-organization-by-dimension)
4. [Complete Query Reference](#complete-query-reference)
5. [Query Naming Conventions](#query-naming-conventions)
6. [Multi-Tenancy Pattern](#multi-tenancy-pattern)
7. [Performance Optimization](#performance-optimization)
8. [Practical Examples](#practical-examples)
9. [Ontology Runtime Discovery](#ontology-runtime-discovery)
10. [Adding New Queries](#adding-new-queries)

---

## Overview

### The 6-Dimension Reality Model

```
GROUPS (1)
    ↓ owns/contains
PEOPLE (2)
    ↓ authorize
THINGS (3)
    ↓ are related via
CONNECTIONS (4)
    ↓ trigger
EVENTS (5)
    ↓ create
KNOWLEDGE (6)
```

### Query Organization

All backend queries are organized by dimension into 6 files:

```
convex/queries/
├── groups.ts         → DIMENSION 1 (Multi-tenant isolation)      [12 queries]
├── people.ts         → DIMENSION 2 (Authorization & governance)   [4 queries]
├── entities.ts       → DIMENSION 3 (66+ entity types)            [9 queries]
├── connections.ts    → DIMENSION 4 (25+ relationship types)      [4 queries]
├── events.ts         → DIMENSION 5 (67+ event types - audit)     [7 queries]
├── knowledge.ts      → DIMENSION 6 (Vectors, embeddings, RAG)    [8 queries]
└── ontology.ts       → Runtime feature discovery                 [special]

TOTAL: 44 production queries
```

---

## The 6-Dimension Reality Model

```
GROUPS (1)
├─ Multi-tenant isolation boundary
├─ Hierarchical nesting (groups in groups)
└─ Plans: starter, pro, enterprise

    PEOPLE (2)
    ├─ Authorization & governance
    ├─ 4 roles: platform_owner, org_owner, org_user, customer
    └─ Every action has an actor

        THINGS (3)
        ├─ 66+ entity types
        ├─ Users, agents, content, products, courses, tokens, etc.
        └─ Status: draft → active → published → archived

            CONNECTIONS (4)
            ├─ 25+ relationship types
            ├─ Owns, follows, teaches, manages, etc.
            └─ Bidirectional with metadata

                EVENTS (5)
                ├─ 67+ event types (audit trail)
                ├─ Recorded: who did what, when
                └─ Complete history for compliance

                    KNOWLEDGE (6)
                    ├─ Embeddings & vectors
                    ├─ Semantic search & RAG
                    └─ AI understanding of relationships
```

---

## Query Organization by Dimension

### Dimension 1: GROUPS (`convex/queries/groups.ts`)

**Purpose**: Multi-tenant isolation with hierarchical nesting

**Key Queries**:
- `getBySlug(slug)` - URL-based routing
- `getById(groupId)` - Direct lookup
- `getSubgroups(parentGroupId)` - Direct children
- `getHierarchy(rootGroupId)` - All descendants (recursive)
- `getGroupPath(groupId)` - Breadcrumb trail to root
- `isDescendantOf(groupId, ancestorGroupId)` - Permission checks
- `getEntitiesInHierarchy()` - All things in group tree
- `getConnectionsInHierarchy()` - All relationships in group tree
- `getEventsInHierarchy()` - All actions in group tree
- `getStats(groupId)` - Aggregate statistics
- `search(groupId, query)` - Group search
- `list(groupId)` - List all groups

**Cross-Dimension Integration**:
- Returns aggregate stats: entity count, connection count, event count, knowledge count
- Supports hierarchical queries across organization structure

### Dimension 2: PEOPLE (`convex/queries/people.ts`)

**Purpose**: Authorization and governance

**Key Queries**:
- `list(groupId)` - List members
- `getById(personId)` - Get person details
- `getRole(personId)` - Get authorization level
- `listByRole(groupId, role)` - Filter by permission level

**Cross-Dimension Integration**:
- People are stored as entities with `type: "creator"`
- Roles determine what operations they can perform
- Referenced in events via `actorId` (who did what)

### Dimension 3: THINGS (`convex/queries/entities.ts`)

**Purpose**: 66+ entity types (users, agents, content, tokens, courses, etc.)

**Key Queries**:
- `list(groupId, type?, status?, limit?)` - Flexible filtering
- `getById(entityId)` - Direct lookup
- `listByType(groupId, type)` - Filter by category
- `listByStatus(groupId, status)` - Filter by workflow state
- `search(groupId, query)` - Full-text search
- `listRecent(groupId, limit)` - Timeline view
- `getRelated(entityId)` - Connected entities
- `getStats(groupId)` - Count statistics
- `getProperties(entityId)` - Get entity properties

**Cross-Dimension Integration**:
- Things are the core nouns: every action affects a thing
- Connected to people via relationships (owns, member_of, etc.)
- Referenced in events via `targetId`
- Linked to knowledge via `sourceThingId`

### Dimension 4: CONNECTIONS (`convex/queries/connections.ts`)

**Purpose**: 25+ relationship types between entities

**Key Queries**:
- `listFrom(groupId, fromEntityId)` - Outgoing edges
- `listTo(groupId, toEntityId)` - Incoming edges
- `listBetween(groupId, fromEntityId, toEntityId)` - Bidirectional
- `listByType(groupId, relationshipType)` - Filter by relationship

**Supported Relationship Types**:
- Ownership: `owns`, `member_of`, `part_of`
- Authorship: `created_by`, `authored`, `generated_by`, `published_to`
- Derivation: `clone_of`, `trained_on`, `references`
- Social: `following`, `collaborates_with`
- Financial: `holds_tokens`, `staked_in`, `earned_from`, `purchased`, `transacted`
- Educational: `enrolled_in`, `teaching`, `completed`
- Organizational: `manages`, `reports_to`, `moderates`
- Communication: `communicated`, `notified`, `referred`
- Governance: `delegated`, `approved`, `fulfilled`

**Cross-Dimension Integration**:
- Connect entities (things) to each other
- Include metadata: timestamp, actor (person), strength, validity window
- Used to compute: followers, collaborators, resource ownership, permissions

### Dimension 5: EVENTS (`convex/queries/events.ts`)

**Purpose**: Complete audit trail (67+ event types)

**Key Queries**:
- `list(groupId, limit?)` - All events in group
- `byActor(groupId, actorId)` - Events by person
- `byTarget(groupId, targetId)` - Events affecting thing
- `byTimeRange(groupId, startTime, endTime)` - Temporal filtering
- `recent(groupId, limit)` - Most recent first
- `stats(groupId)` - Count by event type
- `getById(eventId)` - Get single event

**Event Structure**:
- `type`: Event category (entity_created, connection_established, purchase_completed, etc.)
- `actorId`: Person who caused the event
- `targetId`: Entity affected by the event
- `timestamp`: When it happened
- `metadata`: Event-specific data (amount, status transition, etc.)

**Cross-Dimension Integration**:
- Records when things change
- Links people (who) to things (what) to time (when)
- Powers activity feeds, notifications, analytics, compliance

### Dimension 6: KNOWLEDGE (`convex/queries/knowledge.ts`)

**Purpose**: Vectors, embeddings, RAG, and semantic search

**Key Queries**:
- `list(groupId, limit?)` - All knowledge in group
- `search(groupId, query, limit?)` - Semantic search by embedding
- `bySourceThing(groupId, sourceThingId)` - Knowledge extracted from entity
- `byThing(groupId, thingId)` - Knowledge linked to entity
- `byLabel(groupId, label)` - Filter by tag/category
- `listLabels(groupId)` - Available tags
- `stats(groupId)` - Knowledge counts
- `getById(knowledgeId)` - Get single knowledge item

**Knowledge Structure**:
- `content`: Text that's been vectorized
- `embedding`: Numeric vector for similarity search
- `labels`: Tags for categorization
- `sourceThingId`: Where the knowledge came from
- `metadata`: Custom fields (confidence score, model used, etc.)

**Cross-Dimension Integration**:
- Created from entities (content extraction)
- Enables AI understanding of what exists and how it relates
- Powers semantic search, recommendations, and RAG

---

## Complete Query Reference

### Summary Table: All 44 Queries

| Dimension | Name | File | Count |
|-----------|------|------|-------|
| 1 | GROUPS | groups.ts | 12 |
| 2 | PEOPLE | people.ts | 4 |
| 3 | THINGS | entities.ts | 9 |
| 4 | CONNECTIONS | connections.ts | 4 |
| 5 | EVENTS | events.ts | 7 |
| 6 | KNOWLEDGE | knowledge.ts | 8 |
| - | ONTOLOGY | ontology.ts | - |

### DIMENSION 1: GROUPS (12)

`getBySlug` | `getById` | `list` | `getSubgroups` | `getHierarchy` | `getGroupPath` | `isDescendantOf` | `getEntitiesInHierarchy` | `getConnectionsInHierarchy` | `getEventsInHierarchy` | `getStats` | `search`

### DIMENSION 2: PEOPLE (4)

`list` | `getById` | `getRole` | `listByRole`

### DIMENSION 3: ENTITIES/THINGS (9)

`list` | `getById` | `listByType` | `listByStatus` | `search` | `listRecent` | `getStats` | `getRelated` | `getProperties`

### DIMENSION 4: CONNECTIONS (4)

`listFrom` | `listTo` | `listBetween` | `listByType`

### DIMENSION 5: EVENTS (7)

`list` | `byActor` | `byTarget` | `byTimeRange` | `stats` | `recent` | `getById`

### DIMENSION 6: KNOWLEDGE (8)

`list` | `search` | `bySourceThing` | `byThing` | `byLabel` | `listLabels` | `stats` | `getById`

---

## Query Naming Conventions

All queries follow this consistent pattern:

```
get<Singular>     - Single entity by ID
getBy<Field>      - Single entity by specific field
list              - Multiple entities with filters
list<Plural>      - Multiple entities of specific type
by<Dimension>     - Filter by dimension (byActor, byTarget, byType)
<Verb>            - Action queries (search, stats, isDescendantOf)
```

### Examples

- `getById()` - Get one entity by ID
- `getBySlug()` - Get one entity by slug field
- `list()` - Get multiple entities with optional filters
- `listByType()` - Get entities filtered by type
- `byActor()` - Get events filtered by actor
- `search()` - Full-text or semantic search
- `stats()` - Count aggregations

---

## Multi-Tenancy Pattern

**CRITICAL**: Every query filters by `groupId` for data isolation.

### Standard Query Pattern

```typescript
// All queries follow this pattern:
export const list = query({
  args: {
    groupId: v.id("groups"),  // ← REQUIRED for isolation
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", args.groupId)  // ← Filter first
      )
      .collect();
    return results;
  }
});
```

### Why This Matters

- **Data Isolation**: Perfect separation between groups (organizations)
- **Security**: No data leaks if pattern is followed
- **Performance**: Indexes make queries fast even with millions of records
- **Multi-Tenancy**: Same schema, different data per group

---

## Performance Optimization

### Indexes Used

1. **group_type**: Filter by group + type (entities, connections, events, knowledge)
2. **group_status**: Filter by group + status (entities, connections)
3. **from_entity**: Outgoing relationships (connections)
4. **to_entity**: Incoming relationships (connections)
5. **by_created**: Activity timelines (entities, events)
6. **by_updated**: Recent changes (entities, connections)
7. **by_actor**: Activity by person (events)
8. **by_target**: Activity affecting entity (events)

### Query Tips

1. **Always filter by groupId first** - Massive performance improvement
2. **Use indexes** - See `withIndex()` in queries for available indexes
3. **Limit large result sets** - Use `limit` parameter for pagination
4. **Recurse carefully** - Use `maxDepth`/`maxIterations` to prevent infinite loops
5. **Denormalize stats** - Pre-compute counts in mutations if possible

### Performance Checklist

Before shipping a query:

- [ ] Filters by `groupId` first
- [ ] Uses an index (documented in comments)
- [ ] Has reasonable result limits
- [ ] Has JSDoc documentation
- [ ] Tested with different group IDs
- [ ] Performance acceptable (< 1s for most queries)

---

## Practical Examples

### Example 1: Show All Followers

```typescript
// Query DIMENSION 4 (CONNECTIONS)
const followers = await ctx.runQuery(api.queries.connections.listTo, {
  groupId: groupId,        // ← CRITICAL: Filter by group
  toEntityId: creatorId,   // Who we're finding followers of
  relationshipType: "following"
});

// Returns: All entities that have "following" relationship TO this creator
```

### Example 2: Get Recent Activity in a Group

```typescript
// Query DIMENSION 5 (EVENTS)
const recent = await ctx.runQuery(api.queries.events.recent, {
  groupId: groupId,        // ← CRITICAL: Filter by group
  limit: 20
});

// Returns: Last 20 events ordered by timestamp DESC
```

### Example 3: Find Similar Articles

```typescript
// Query DIMENSION 6 (KNOWLEDGE)
const similar = await ctx.runQuery(api.queries.knowledge.search, {
  groupId: groupId,        // ← CRITICAL: Filter by group
  query: articleEmbedding,
  limit: 10
});

// Returns: 10 most similar articles by semantic similarity
```

### Example 4: Show All Collaborators of a Creator

```
1. Get creator (THINGS) → entities query
2. Find all CONNECTIONS where relationshipType = "collaborates_with"
3. For each connection, get the other person (PEOPLE)
4. Return list of people
```

### Example 5: Show Activity Feed for This User

```
1. Get user (PEOPLE)
2. Query EVENTS where actorId = user._id
3. For each event, join THINGS (targetId) for context
4. Return timeline of what this user did
```

### Example 6: Find Similar Articles via Knowledge

```
1. Get article (THINGS)
2. Get article's knowledge/embeddings (KNOWLEDGE)
3. Search for similar embeddings (semantic search)
4. Return THINGS that match similar knowledge
```

### React Component with Convex Hooks

```typescript
// frontend/src/components/features/EntityList.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function EntityList({ groupId, type }: { groupId: string; type: string }) {
  const entities = useQuery(api.queries.entities.list, { groupId, type });

  if (entities === undefined) return <div>Loading...</div>;

  return (
    <div>
      {entities.map((entity) => (
        <div key={entity._id}>{entity.name}</div>
      ))}
    </div>
  );
}
```

### Astro Page with SSR

```astro
---
// frontend/src/pages/groups/[groupId]/entities/[type].astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import EntityList from "@/components/features/EntityList";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const entities = await convex.query(api.queries.entities.list, {
  groupId: Astro.params.groupId,
  type: Astro.params.type
});
---

<Layout>
  <h1>{Astro.params.type} Entities</h1>
  <EntityList
    client:load
    groupId={Astro.params.groupId}
    type={Astro.params.type}
  />
</Layout>
```

---

## Ontology Runtime Discovery

### Available Queries

The `ontology.ts` file provides runtime feature discovery for dynamic UI composition:

```typescript
// Get complete ontology information
api.queries.ontology.getOntology()

// Get ontology metadata (counts, generation time)
api.queries.ontology.getMetadata()

// Get specific dimension types
api.queries.ontology.getThingTypes()
api.queries.ontology.getConnectionTypes()
api.queries.ontology.getEventTypes()

// Get enabled features
api.queries.ontology.getEnabledFeatures()

// Check if specific feature is enabled
api.queries.ontology.hasFeature({ feature: "blog" })

// Get detailed feature breakdown
api.queries.ontology.getFeatureBreakdown()
```

### Example Backend Usage

```typescript
// In a Convex function
import { query } from "./_generated/server";
import { api } from "./_generated/api";

export const listAvailableContent = query({
  args: {},
  handler: async (ctx) => {
    // Check if blog feature is enabled
    const hasBlog = await ctx.runQuery(api.queries.ontology.hasFeature, {
      feature: "blog"
    });

    // Get all thing types
    const thingTypes = await ctx.runQuery(api.queries.ontology.getThingTypes);

    return {
      hasBlog,
      availableContentTypes: thingTypes.filter(type =>
        ["blog_post", "page", "project", "product"].includes(type)
      )
    };
  }
});
```

### Frontend Feature Detection

```tsx
import { useOntology, useHasFeature } from "@/hooks/useOntology";

function NavigationMenu() {
  const { hasFeature, isLoading } = useOntology();

  if (isLoading) return <div>Loading...</div>;

  return (
    <nav>
      <a href="/">Home</a>
      {hasFeature('blog') && <a href="/blog">Blog</a>}
      {hasFeature('portfolio') && <a href="/portfolio">Portfolio</a>}
      {hasFeature('shop') && <a href="/shop">Shop</a>}
    </nav>
  );
}
```

### Dynamic Type Selectors

```tsx
import { useThingTypes } from "@/hooks/useOntology";

function CreateThingForm() {
  const thingTypes = useThingTypes();
  const [selectedType, setSelectedType] = useState("");

  return (
    <form>
      <label>Thing Type</label>
      <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
        <option value="">Select type...</option>
        {thingTypes.map(type => (
          <option key={type} value={type}>
            {type.replace('_', ' ').toUpperCase()}
          </option>
        ))}
      </select>
    </form>
  );
}
```

### Astro Server-Side Usage

```astro
---
// src/pages/admin/ontology.astro
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const ontology = await convex.query(api.queries.ontology.getOntology);
const breakdown = await convex.query(api.queries.ontology.getFeatureBreakdown);
---

<Layout title="Ontology Configuration">
  <h1>Ontology Composition</h1>

  <section>
    <h2>Enabled Features</h2>
    <ul>
      {ontology.features.map(feature => (
        <li>{feature}</li>
      ))}
    </ul>
  </section>

  <section>
    <h2>Available Types</h2>
    <div>
      <h3>Things ({ontology.thingTypes.length})</h3>
      <p>{ontology.thingTypes.join(', ')}</p>
    </div>
    <div>
      <h3>Connections ({ontology.connectionTypes.length})</h3>
      <p>{ontology.connectionTypes.join(', ')}</p>
    </div>
    <div>
      <h3>Events ({ontology.eventTypes.length})</h3>
      <p>{ontology.eventTypes.join(', ')}</p>
    </div>
  </section>
</Layout>
```

### Advanced: Feature Breakdown

```tsx
import { useFeatureBreakdown } from "@/hooks/useOntology";

function FeatureExplorer() {
  const breakdown = useFeatureBreakdown();

  if (!breakdown) return <div>Loading...</div>;

  return (
    <div className="feature-explorer">
      {Object.entries(breakdown).map(([featureName, feature]) => {
        if (!feature) return null;

        return (
          <div key={featureName} className="feature-card">
            <h3>{featureName}</h3>
            <p>{feature.description}</p>

            <div className="feature-details">
              <div>
                <h4>Thing Types ({feature.thingTypes.length})</h4>
                <ul>
                  {feature.thingTypes.map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>Connection Types ({feature.connectionTypes.length})</h4>
                <ul>
                  {feature.connectionTypes.map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4>Event Types ({feature.eventTypes.length})</h4>
                <ul>
                  {feature.eventTypes.map(type => (
                    <li key={type}>{type}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

---

## Adding New Queries

### Step 1: Identify the Dimension

Which of the 6 dimensions does this query serve?

- Groups → `queries/groups.ts`
- People → `queries/people.ts`
- Things → `queries/entities.ts`
- Relationships → `queries/connections.ts`
- Audit/Timeline → `queries/events.ts`
- AI/Search → `queries/knowledge.ts`

### Step 2: Follow the Pattern

```typescript
/**
 * Description of what this query does
 *
 * Use case: when/why you'd use this
 * Performance: which index is used
 */
export const myQuery = query({
  args: {
    groupId: v.id("groups"),  // ← ALWAYS include
    myParam: v.string(),
  },
  handler: async (ctx, args) => {
    // Filter by groupId first (performance + security)
    const results = await ctx.db
      .query("myTable")
      .withIndex("by_group", q => q.eq("groupId", args.groupId))
      .collect();

    return results;
  }
});
```

### Step 3: Document It

1. Add JSDoc comment (see step 2 above)
2. Add to `queries/README.md`
3. Add to `convex/INDEX.md`

### Step 4: Test It

1. Verify groupId filtering works
2. Test index performance
3. Ensure isolation

### Step 5: Update This Reference

Add your query to the appropriate dimension section in this document.

---

## Key Principles

### 🔒 Multi-Tenancy (CRITICAL)
- Every query filters by `groupId` first
- Perfect data isolation between groups
- No data leaks possible if pattern is followed

### 🎯 Consistency
- All queries follow same naming convention
- All use same multi-tenancy pattern
- All have JSDoc documentation

### 📊 Completeness
- All 6 dimensions have full query coverage
- Cross-dimension queries available
- Aggregate queries for stats and search

### 🚀 Performance
- Indexes documented in each query
- Fast path identified for common queries
- Tips for optimizing recursive queries

### 📚 Discoverability
- Comprehensive documentation at multiple levels
- Code examples for each pattern
- Clear naming conventions

---

## File Locations

- **Backend Queries**: `/Users/toc/Server/ONE/backend/convex/queries/`
- **Groups**: `/Users/toc/Server/ONE/backend/convex/queries/groups.ts`
- **People**: `/Users/toc/Server/ONE/backend/convex/queries/people.ts`
- **Entities**: `/Users/toc/Server/ONE/backend/convex/queries/entities.ts`
- **Connections**: `/Users/toc/Server/ONE/backend/convex/queries/connections.ts`
- **Events**: `/Users/toc/Server/ONE/backend/convex/queries/events.ts`
- **Knowledge**: `/Users/toc/Server/ONE/backend/convex/queries/knowledge.ts`
- **Ontology Discovery**: `/Users/toc/Server/ONE/backend/convex/queries/ontology.ts`
- **Frontend Hook**: `/Users/toc/Server/ONE/web/src/hooks/useOntology.ts`
- **Ontology Types**: `/Users/toc/Server/ONE/backend/convex/types/ontology.ts`
- **Schema**: `/Users/toc/Server/ONE/backend/convex/schema.ts`

---

## Quick Reference: Documentation Structure

### For New Developers

**"I want to understand the system"**
→ Start with: `convex/INDEX.md` (master reference)
→ Then read: `ONTOLOGY_VISUAL_GUIDE.md` (visual flow)

**"I want to add a new query"**
→ Read: This document → "Adding New Queries" section
→ Copy pattern from existing query in the same dimension
→ Update `queries/README.md` with new query

**"I want to understand one dimension"**
→ Open the dimension file: `queries/groups.ts` (etc.)
→ Read the header documentation
→ Check `convex/INDEX.md` for the complete reference table

### For Code Review

**"Is this query following the pattern?"**
- ✅ Does it filter by `groupId`?
- ✅ Does it use an index?
- ✅ Is the name following conventions?
- ✅ Does it have JSDoc?
- ✅ Is it in the right dimension file?

---

## Remember

**Groups partition → People authorize → Things exist → Connections relate → Events record → Knowledge understands.**

Every query should cleanly fit into one of these 6 dimensions. If it doesn't, reconsider the approach.

---

**See Also**:
- `/one/knowledge/ontology.md` - Complete 6-dimension specification
- `convex/mutations/` - Write operations following same structure
- `convex/schema.ts` - Database schema matching this ontology
- `convex/queries/README.md` - Quick reference lookup table
- `convex/INDEX.md` - Master backend reference

---

**Built with the 6-dimension ontology. Runtime feature discovery enables dynamic, composition-aware UIs.**
