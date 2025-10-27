# Visual Guide: 6-Dimension Ontology Implementation

## The Reality Flow

```
     What exists?                How are they related?
            │                              │
            ↓                              ↓
    ┌───────────────┐        ┌──────────────────────┐
    │    THINGS     │◄──────►│   CONNECTIONS       │
    │  (Entities)   │        │  (Relationships)    │
    │               │        │                     │
    │ • Users       │        │ • owns              │
    │ • Content     │        │ • member_of         │
    │ • Products    │        │ • follows           │
    │ • Courses     │        │ • collaborates_with │
    │ • Agents      │        │ • transacted        │
    └───────────────┘        └──────────────────────┘
            ▲                          ▲
            │                          │
            │   Who authorized it?     │
            │   (with what roles)      │
            │                          │
         ┌──┴──────────────────────────┘
         │
    ┌────▼────┐
    │  PEOPLE │  • platform_owner
    │ (Roles) │  • org_owner
    │         │  • org_user
    └────┬────┘  • customer
         │
         │ organized in
         │
    ┌────▼─────────────────────────┐
    │     GROUPS                    │
    │ (Multi-tenant isolation)      │
    │                               │
    │ friend_circle                 │
    │ business                      │
    │ community                     │
    │ dao ←─ hierarchical nesting   │
    │ government   (groups in       │
    │ organization  groups)         │
    └────────────────────────────────┘
         │
         │ Everything scoped to groupId
         ├─► THINGS scoped to group
         ├─► CONNECTIONS scoped to group
         ├─► EVENTS scoped to group
         └─► KNOWLEDGE scoped to group

    What happened?                 What does it mean?
            │                              │
            ↓                              ↓
    ┌──────────────────┐        ┌──────────────────┐
    │     EVENTS       │        │    KNOWLEDGE    │
    │ (Audit Trail)    │        │ (Vectors/RAG)   │
    │                  │        │                 │
    │ • created        │        │ • embeddings    │
    │ • purchased      │        │ • labels        │
    │ • viewed         │        │ • semantic      │
    │ • completed      │        │   search        │
    │ • voted          │        │ • RAG context   │
    └──────────────────┘        └──────────────────┘
         │                            │
         │ actor (PEOPLE)             │ source_thing_id (THINGS)
         │ target (THINGS)            │ linked (THINGS)
         │ timestamp (WHEN)           │ labels (categorization)
         └────────────────────────────┘
```

## Query Layer Organization

```
QUERIES (Read Operations)

┌─────────────────────────────────────────────────────────────┐
│  convex/queries/                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DIMENSION 1: GROUPS.TS  (12 queries)                      │
│  ├─ getBySlug(slug)              URL routing              │
│  ├─ getById(id)                  Direct lookup            │
│  ├─ list()                       All groups               │
│  ├─ getSubgroups()               Direct children          │
│  ├─ getHierarchy()               All descendants          │
│  ├─ getGroupPath()               Breadcrumb trail         │
│  ├─ isDescendantOf()             Permission check         │
│  ├─ getEntitiesInHierarchy()    [GROUP] → [THINGS]        │
│  ├─ getConnectionsInHierarchy() [GROUP] → [CONNECTIONS]   │
│  ├─ getEventsInHierarchy()      [GROUP] → [EVENTS]        │
│  ├─ getStats()                   Aggregated counts        │
│  └─ search()                     Full-text search         │
│                                                             │
│  DIMENSION 2: PEOPLE.TS  (4 queries)                       │
│  ├─ list(groupId)                All members              │
│  ├─ getById(id)                  Get person               │
│  ├─ getRole(id)                  Get authorization        │
│  └─ listByRole()                 Filter by role           │
│                                                             │
│  DIMENSION 3: ENTITIES.TS  (9 queries)                     │
│  ├─ list()                       All entities             │
│  ├─ getById()                    Direct lookup            │
│  ├─ listByType()                 Filter by type           │
│  ├─ listByStatus()               Filter by status         │
│  ├─ search()                     Full-text search         │
│  ├─ listRecent()                 Timeline view            │
│  ├─ getStats()                   Counts by type           │
│  ├─ getRelated()                 Connected entities       │
│  └─ getProperties()              Get properties object    │
│                                                             │
│  DIMENSION 4: CONNECTIONS.TS  (4 queries)                  │
│  ├─ listFrom()                   Outgoing edges           │
│  ├─ listTo()                     Incoming edges           │
│  ├─ listBetween()                Bidirectional            │
│  └─ listByType()                 Filter by type           │
│                                                             │
│  DIMENSION 5: EVENTS.TS  (7 queries)                       │
│  ├─ list()                       All events               │
│  ├─ byActor()                    [PEOPLE] → [EVENTS]      │
│  ├─ byTarget()                   [THINGS] → [EVENTS]      │
│  ├─ byTimeRange()                Time-based filter        │
│  ├─ stats()                      Counts by type           │
│  ├─ recent()                     Most recent first        │
│  └─ getById()                    Direct lookup            │
│                                                             │
│  DIMENSION 6: KNOWLEDGE.TS  (8 queries)                    │
│  ├─ list()                       All knowledge            │
│  ├─ search()                     Semantic search          │
│  ├─ bySourceThing()              [THINGS] → [KNOWLEDGE]   │
│  ├─ byThing()                    Knowledge linked to      │
│  ├─ byLabel()                    Filter by tag            │
│  ├─ listLabels()                 Available tags           │
│  ├─ stats()                      Counts by type           │
│  └─ getById()                    Direct lookup            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

TOTAL: 44 queries across all 6 dimensions
```

## Mutation Layer Organization

```
MUTATIONS (Write Operations)

┌─────────────────────────────────────────────────────────────┐
│  convex/mutations/                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  DIMENSION 1: GROUPS.TS                                    │
│  ├─ create()      Create new group                         │
│  ├─ update()      Modify group                             │
│  ├─ archive()     Soft delete                              │
│  └─ restore()     Unarchive                                │
│                                                             │
│  DIMENSION 2: PEOPLE.TS                                    │
│  ├─ create()      Add person to group                      │
│  ├─ updateRole()  Change authorization                     │
│  ├─ updateProfile() Modify person                          │
│  └─ removeFromGroup()  Soft delete                         │
│                                                             │
│  DIMENSION 3: ENTITIES.TS                                  │
│  ├─ create()      Create entity                            │
│  ├─ update()      Modify entity                            │
│  ├─ archive()     Soft delete                              │
│  ├─ restore()     Unarchive                                │
│  └─ bulkCreate()  Batch create                             │
│                                                             │
│  DIMENSION 4: CONNECTIONS.TS                               │
│  ├─ create()      Create relationship                      │
│  ├─ upsert()      Create or update                         │
│  └─ bulkCreate()  Batch create                             │
│                                                             │
│  DIMENSION 5: EVENTS.TS                                    │
│  └─ (Auto-logged by other mutations)                       │
│                                                             │
│  DIMENSION 6: KNOWLEDGE.TS                                 │
│  ├─ create()      Create knowledge                         │
│  ├─ update()      Modify knowledge                         │
│  ├─ delete()      Delete knowledge                         │
│  ├─ bulkCreate()  Batch create                             │
│  └─ linkToThing() Link to entity                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example: "User follows Creator"

```
┌──────────────────────────────────────────────────────────────┐
│  ACTION: User clicks "Follow" button for creator             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ↓
            ┌───────────────────────────────┐
            │  MUTATION: Create Connection  │
            │  ├─ fromEntityId: userId      │
            │  ├─ toEntityId: creatorId     │
            │  └─ type: "following"         │
            └───────────────┬───────────────┘
                            │
                            ↓
        ┌───────────────────────────────────────┐
        │  AUTO: Log Event                      │
        │  ├─ type: "connection_created"        │
        │  ├─ actorId: userId (who)            │
        │  ├─ targetId: creatorId (what)       │
        │  ├─ timestamp: now()                 │
        │  └─ metadata: { type: "following" }  │
        └───────────────┬───────────────────────┘
                        │
        ┌───────────────┴────────────────────┐
        │                                    │
        ↓                                    ↓
    USER CAN NOW:                      SYSTEM CAN:
    ├─ Query: listFrom()              ├─ Show activity feed
    │  "What do I follow?"            ├─ Send notifications
    ├─ Query: listByType()            ├─ Compute influence score
    │  "All following rel's"          ├─ Find similar users
    └─ Query: listRecent()            └─ Train recommendation ML
        "Recent follows"

        ↓ Later: User reads article from creator

    ┌─────────────────────────────────────┐
    │  ACTION: View article               │
    └─────────────────────────────────────┘
                    │
                    ↓
        ┌───────────────────────────┐
        │  AUTO: Log Event          │
        │  ├─ type: "viewed"        │
        │  ├─ actorId: userId       │
        │  ├─ targetId: articleId   │
        │  └─ timestamp: now()      │
        └───────────────┬───────────┘
                        │
        QUERY: byTarget(articleId)
        "Who viewed this article?"
        → Shows userId (already following)
        → System learns user engagement
```

## Multi-Tenancy Pattern

```
GROUP 1 (Acme Corp)
├─── PEOPLE (Acme employees)
├─── THINGS (Acme products, docs)
├─── CONNECTIONS (Acme relationships)
├─── EVENTS (Acme activity)
└─── KNOWLEDGE (Acme embeddings)

GROUP 2 (Smith Family)
├─── PEOPLE (Family members)
├─── THINGS (Family projects)
├─── CONNECTIONS (Family relationships)
├─── EVENTS (Family activity)
└─── KNOWLEDGE (Family embeddings)

GROUP 3 (Public DAO)
├─── PEOPLE (DAO members)
├─── THINGS (DAO proposals)
├─── CONNECTIONS (DAO governance)
├─── EVENTS (DAO activity)
└─── KNOWLEDGE (DAO embeddings)

┌──────────────────────────────────────────┐
│  CRITICAL: Every query filters by groupId│
│                                          │
│  ❌ WRONG:  await query.collect()        │
│  ✅ RIGHT:  .withIndex("by_group",       │
│             q => q.eq("groupId", gid))   │
└──────────────────────────────────────────┘

Result: Perfect isolation between groups
- User from Group 1 can NEVER see Group 2 data
- No data leaks through queries
- Each group's AI training stays isolated
```

## Query Performance Strategy

```
FAST (< 100ms)
├─ getById()           Direct ID lookup (O(1))
├─ getBySlug()         Indexed field lookup
└─ listByType()        Indexed field filter

MEDIUM (100-500ms)
├─ list()              Multiple results with filter
├─ search()            Full-text search
└─ getHierarchy()      Recursive with bounded depth

SLOW (> 500ms)
├─ getEntitiesInHierarchy()    Recursive traversal
├─ getConnectionsInHierarchy() Complex traversal
└─ stats() with subgroups      Multiple aggregations

✅ OPTIMIZATION RULES:
1. Filter by groupId FIRST (always)
2. Use available indexes
3. Limit result set size
4. Cache computed results
5. Denormalize frequently accessed aggregates
```

## Adding Features: Step-by-Step

```
Step 1: Identify the dimension
┌─────────────────────┐
│ Which dimension?    │
├─────────────────────┤
│ Groups?             │ → groups.ts
│ People/Auth?        │ → people.ts
│ Entities/Things?    │ → entities.ts
│ Relationships?      │ → connections.ts
│ Audit/Timeline?     │ → events.ts
│ AI/Search?          │ → knowledge.ts
└─────────────────────┘

Step 2: Add Query or Mutation
┌──────────────────────────────────────────┐
│ export const myQuery = query({           │
│   args: {                                │
│     groupId: v.id("groups"),  ← REQUIRED│
│     myArg: v.string()                    │
│   },                                     │
│   handler: async (ctx, args) => {        │
│     // Filter by groupId first           │
│     // Use indexes                       │
│     // Return results                    │
│   }                                      │
│ })                                       │
└──────────────────────────────────────────┘

Step 3: Log Event (if write operation)
┌──────────────────────────────────────────┐
│ await ctx.db.insert("events", {          │
│   groupId: args.groupId,                 │
│   type: "entity_created",                │
│   actorId: userId,                       │
│   targetId: entityId,                    │
│   timestamp: Date.now(),                 │
│   metadata: { ... }                      │
│ });                                      │
└──────────────────────────────────────────┘

Step 4: Document
- Add JSDoc comment
- Update queries/README.md
- Add to INDEX.md
```

---

**Key Insight**: The entire backend is organized around reality modeling through 6 dimensions. This provides natural organization, perfect isolation, and scalability from friend circles to global DAOs.

