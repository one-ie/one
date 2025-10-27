# Backend Structure: 6-Dimension Ontology

**Status:** Production-Ready
**Architecture:** 6-Dimension Ontology (Version 1.0.0)
**Last Updated:** 2025-10-25

---

## Table of Contents

1. [Overview](#overview)
2. [6-Dimension Foundation](#6-dimension-foundation)
3. [Current File Structure](#current-file-structure)
4. [Perfect/Target Structure](#perfecttarget-structure)
5. [Schema Compliance](#schema-compliance)
6. [Development Patterns](#development-patterns)
7. [Multi-Tenant Isolation](#multi-tenant-isolation)
8. [Performance Guidelines](#performance-guidelines)
9. [Migration Path](#migration-path)

---

## Overview

The ONE Platform backend is organized around the **6-dimension ontology** that models reality through groups, people, things, connections, events, and knowledge.

Every file follows a consistent pattern:
- **Dimension** (1-6) - Which dimension of the ontology it handles
- **Operation Type** - mutation (write), query (read), action (async), or internal action (utility)
- **Purpose** - What problems it solves
- **Pattern** - How it's structured for clarity and maintainability

### Philosophy

**Simple enough for children. Powerful enough for enterprises.**

Groups partition the space (hierarchical containers from friend circles to governments), people authorize and govern (role-based access), things exist (entities with flexible properties), connections relate (relationships with metadata), events record (complete audit trail), and knowledge understands (embeddings and vectors). Everything else is just data. This ontology scales from friend circles (2 people) to global governments (billions) without schema changes.

---

## 6-Dimension Foundation

### Dimension 1: GROUPS
**Multi-tenant isolation boundary with hierarchical nesting**

- **Purpose:** Create isolated data spaces for organizations, communities, friend circles, DAOs, governments
- **Multi-tenancy:** All other dimensions scoped by groupId
- **Hierarchy:** Infinite nesting via parentGroupId (parent → child → grandchild...)
- **6 Types:** friend_circle, business, community, dao, government, organization
- **Settings:** visibility, joinPolicy, plan (starter, pro, enterprise), resource limits
- **Key Pattern:** Every mutation validates groupId; every query filters by groupId

### Dimension 2: PEOPLE
**Authorization & governance: who can do what**

- **Representation:** Things with type="creator" (not separate table)
- **4 Standard Roles:** platform_owner, org_owner, org_user, customer
- **Auth Link:** Linked to Better Auth via properties.userId
- **Group Membership:** Managed via connections (member_of relationship)
- **Key Pattern:** People operations in mutations/people.ts; people queries use entities queries with type filter

### Dimension 3: THINGS
**All nouns in the system: users, agents, content, tokens, courses, etc.**

- **Universal Table:** "entities" in database, referenced as "things" in code
- **Type Safety:** 66+ entity types validated against ontology composition
- **Flexibility:** Flexible `properties` field for type-specific data
- **Lifecycle:** draft → active → published → archived (soft delete with audit trail)
- **Multi-tenant:** Every thing has groupId for data isolation
- **Key Pattern:** All operations preserve functionality, never hard delete

### Dimension 4: CONNECTIONS
**All relationships between entities**

- **Bidirectional:** Relationships with temporal validity (validFrom/validTo)
- **Rich Types:** 25+ connection types (owns, authored, holds_tokens, enrolled_in, member_of, etc.)
- **Metadata:** Support for strength/weight, status, and context
- **Scoping:** Every connection scoped by groupId
- **Key Pattern:** Graph queries (from/to/between patterns)

### Dimension 5: EVENTS
**Complete audit trail of all actions and state changes**

- **Immutable:** Events created by mutations, never edited
- **WHO, WHAT, WHEN, TO:** Records actor, event type, timestamp, target
- **Automation:** All mutations automatically log events via internal actions
- **Use Cases:** Compliance, debugging, analytics, activity feeds, audit trails
- **Key Pattern:** Events are read-only; logged via internalActions/events.ts

### Dimension 6: KNOWLEDGE
**Labels, embeddings, and semantic search (RAG)**

- **Knowledge Types:** label, document, chunk, vector_only
- **Embeddings:** Ready for semantic search and vector similarity
- **Junction Table:** thingKnowledge links knowledge to things
- **Role Metadata:** label, summary, chunk_of, caption, keyword
- **Scoping:** Every knowledge item scoped by groupId
- **Key Pattern:** Enables RAG, taxonomy, and intelligent search

---

## Current File Structure

### Overview

```
backend/convex/
├── schema.ts                    # 6-dimension ontology schema
├── auth.ts                      # Better Auth configuration
├── http.ts                      # Hono HTTP layer (ontology-aligned)
│
├── queries/                     # READ operations (by dimension)
│   ├── groups.ts               # Dimension 1: Groups (multi-tenancy)
│   ├── entities.ts             # Dimension 3: Things (all entity types)
│   ├── connections.ts          # Dimension 4: Connections (relationships)
│   ├── events.ts               # Dimension 5: Events (audit trail)
│   ├── knowledge.ts            # Dimension 6: Knowledge (RAG, search)
│   │
│   ├── contact.ts              # Special: Contact forms (uses Things)
│   ├── onboarding.ts           # Special: Onboarding flows (uses Groups)
│   ├── ontology.ts             # Special: Ontology metadata
│   └── init.ts                 # Special: Initialization
│
├── mutations/                   # WRITE operations (by dimension)
│   ├── groups.ts               # Dimension 1: Groups CRUD
│   ├── people.ts               # Dimension 2: People management
│   ├── entities.ts             # Dimension 3: Things CRUD
│   ├── connections.ts          # Dimension 4: Connections CRUD
│   ├── knowledge.ts            # Dimension 6: Knowledge CRUD
│   │
│   ├── contact.ts              # Special: Contact forms (uses Things)
│   ├── onboarding.ts           # Special: Onboarding (uses Groups)
│   └── init.ts                 # Special: Initialization
│
├── lib/                         # Shared utilities
│   ├── validation.ts           # Input validation + error types
│   └── jwt.ts                  # JWT utilities
│
├── services/                    # Business logic services
│   ├── layers.ts               # Effect.ts service layer
│   ├── entityService.ts        # Entity business logic
│   ├── websiteAnalyzer.ts     # Onboarding: Website analysis
│   ├── ontologyMapper.ts      # Onboarding: Ontology mapping
│   ├── brandGuideGenerator.ts # Onboarding: Brand extraction
│   └── featureRecommender.ts  # Onboarding: Feature suggestions
│
└── types/                       # Type definitions
    └── ontology.ts             # Ontology types (66+ entity types)
```

### Ontology Mapping - Current State

| Dimension | Queries | Mutations | Purpose |
|-----------|---------|-----------|---------|
| **1. Groups** | `queries/groups.ts` | `mutations/groups.ts` | Multi-tenant isolation, hierarchy |
| **2. People** | (via entities) | `mutations/people.ts` | Authorization, roles, governance |
| **3. Things** | `queries/entities.ts` | `mutations/entities.ts` | All nouns, flexible properties |
| **4. Connections** | `queries/connections.ts` | `mutations/connections.ts` | Relationships, graph queries |
| **5. Events** | `queries/events.ts` | (auto-logged) | Audit trail, immutable log |
| **6. Knowledge** | `queries/knowledge.ts` | `mutations/knowledge.ts` | RAG, embeddings, search |

### Special Files (Ontology-Compliant)

| File | Purpose | Maps To |
|------|---------|---------|
| `contact.ts` | Contact form submission | Creates **Things** (type="contact_submission") + **Events** |
| `onboarding.ts` | Website analysis & setup | Works with **Groups**, creates **Things**, logs **Events** |
| `ontology.ts` | Ontology metadata queries | Reads ontology structure from schema |
| `init.ts` | Initialization & defaults | Creates default **Group**, initial **Things** |

### HTTP Endpoints (25+ total)

All endpoints map to the 6 dimensions:

```
Dimension 1: Groups
├── GET    /groups
├── GET    /groups/:id
├── POST   /groups
├── PATCH  /groups/:id
└── DELETE /groups/:id

Dimension 2: People
├── GET    /people
├── POST   /people
├── PATCH  /people/:id
├── PATCH  /people/:id/role
└── DELETE /people/:id

Dimension 3: Things
├── GET    /things
├── GET    /things/:id
├── POST   /things
├── PATCH  /things/:id
└── DELETE /things/:id

Dimension 4: Connections
├── GET    /connections
├── POST   /connections
└── DELETE /connections/:id

Dimension 5: Events
├── GET    /events
└── GET    /events/timeline

Dimension 6: Knowledge
├── GET    /knowledge
├── POST   /knowledge
├── POST   /knowledge/search
└── POST   /knowledge/bulk

Special (Ontology-Compliant)
├── GET    /contact          # Uses Things
├── POST   /contact          # Uses Things
└── GET    /health           # Utility
```

---

## Perfect/Target Structure

### Vision

The backend follows ONLY the 6 dimensions from the ontology. Every file, function, mutation, query, action, and internal action maps perfectly to ONE of these dimensions.

### Target File Organization

```
convex/
├── schema.ts                           ← CRITICAL: Schema defines all 6 dimensions
│   ├── groups table
│   ├── people (as things with type="creator")
│   ├── things (stored as "entities" table)
│   ├── connections table
│   ├── events table
│   └── knowledge table (+ junction)
│
├── mutations/                          ← Write operations by dimension (5 files)
│   ├── groups.ts                       → Dimension 1
│   ├── people.ts                       → Dimension 2
│   ├── things.ts                       → Dimension 3 (rename: entities.ts)
│   ├── connections.ts                  → Dimension 4
│   ├── knowledge.ts                    → Dimension 6
│   └── NO OTHER FILES
│
├── queries/                            ← Read operations by dimension (6 files)
│   ├── groups.ts                       → Dimension 1
│   ├── people.ts                       → Dimension 2 (add if missing)
│   ├── things.ts                       → Dimension 3 (rename: entities.ts)
│   ├── connections.ts                  → Dimension 4
│   ├── events.ts                       → Dimension 5 (read-only)
│   ├── knowledge.ts                    → Dimension 6
│   └── NO OTHER FILES (init, onboarding, contact consolidate to things or deleted)
│
├── actions/                            ← Async external integrations (4 files)
│   ├── groups.ts                       → Dimension 1 (email, webhooks, directories)
│   ├── things.ts                       → Dimension 3 (AI, files, publishing)
│   ├── connections.ts                  → Dimension 4 (payments, graph)
│   ├── knowledge.ts                    → Dimension 6 (embeddings, search)
│   └── NO OTHER FILES (Dimension 2 people typically use groups actions)
│
├── internalActions/                    ← Shared utilities, called only from above (3 files)
│   ├── events.ts                       → Dimension 5 (centralized event logging)
│   ├── search.ts                       → Cross-dimensional search
│   ├── validation.ts                   → Cross-dimensional validation
│   └── NO OTHER FILES
│
├── services/                           ← Business logic (Effect.ts, pure functions)
│   ├── entityService.ts                → Thing operations
│   ├── layers.ts                       → Error types and infrastructure
│   └── [FUTURE] dimension-specific services
│
├── lib/                                ← Utilities (validation helpers, jwt, etc.)
│   ├── validation.ts
│   └── jwt.ts
│
├── types/                              ← Generated types from ontology YAML
│   └── ontology.ts
│
└── [CONSOLIDATE/DELETE]
    ├── contact.ts              → Merge into things (contact_submission thing)
    ├── init.ts                 → Move to convex.config.ts or script
    ├── onboarding.ts           → Move to services/onboarding.ts
    └── eventLogger.ts          → Renamed to events.ts
```

### Perfect File Count

**Core Ontology (6 dimensions):**
```
Mutations:  5 files (groups, people, things, connections, knowledge)
Queries:    6 files (groups, people, things, connections, events, knowledge)
Actions:    4 files (groups, things, connections, knowledge)
Internal:   3 files (events, search, validation)
Total:      18 core files
```

**Infrastructure:**
```
HTTP:       1 file  (http.ts - Hono with ontology-aligned routes)
Schema:     1 file  (schema.ts - 6-dimension tables)
Auth:       1 file  (auth.ts)
Services:   2 files (layers.ts, entityService.ts)
Types:      1 file  (types/ontology.ts)
Utilities:  2 files (lib/validation.ts, lib/jwt.ts)
Total:      8 infrastructure files
```

**Grand Total: 26 files, 100% ontology-aligned**

### Perfect Function Count

| Dimension | Mutations | Queries | Actions | Internal | Total |
|-----------|-----------|---------|---------|----------|-------|
| 1: Groups | 4 | 10+ | 6 | - | 20+ |
| 2: People | 5 | 4 | - | - | 9 |
| 3: Things | 4 | 8 | 6 | - | 18 |
| 4: Connections | 3 | 4 | 6 | - | 13 |
| 5: Events | - | 7 | - | 10 | 17 |
| 6: Knowledge | 5 | 8 | 7 | - | 20 |
| **Shared** | - | - | - | 19 | 19 |
| **TOTAL** | **21** | **41** | **25** | **29** | **116** |

---

## Schema Compliance

### Database Schema (5 Tables)

The schema implements the 6-dimension ontology using 5 database tables (people represented as things with type="creator"):

```typescript
// groups table - Dimension 1
{
  _id: Id<"groups">,
  slug: string,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,  // Hierarchical nesting
  properties: { description?, plan?, settings?, ...type-specific },
  status: "draft" | "active" | "archived",
  createdAt: number,
  updatedAt: number
}

// entities table - Dimension 3 (all nouns including people as type="creator")
{
  _id: Id<"entities">,
  groupId: Id<"groups">,
  type: string,  // 66+ types including "creator" for people
  name: string,
  properties: { ...type-specific, userId? for people },
  status: "draft" | "active" | "published" | "archived",
  createdAt: number,
  updatedAt: number
}

// connections table - Dimension 4
{
  _id: Id<"connections">,
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: string,  // 25+ types
  strength?: number,
  metadata?: any,
  validFrom?: number,
  validTo?: number,
  status: "active" | "inactive",
  createdAt: number,
  updatedAt: number
}

// events table - Dimension 5
{
  _id: Id<"events">,
  groupId: Id<"groups">,
  type: string,  // 67+ event types
  actorId?: Id<"entities">,  // Person who acted (optional for system events)
  targetId?: Id<"entities">,  // Thing/group affected
  timestamp: number,
  metadata?: any,
  createdAt: number  // immutable
}

// knowledge table - Dimension 6
{
  _id: Id<"knowledge">,
  groupId: Id<"groups">,
  type: "label" | "document" | "chunk" | "vector_only",
  text: string,
  labels?: string[],
  embedding?: number[],  // For vector search
  source?: string,
  metadata?: any,
  createdAt: number,
  updatedAt: number
}

// thingKnowledge junction table
{
  _id: Id<"thingKnowledge">,
  thingId: Id<"entities">,
  knowledgeId: Id<"knowledge">,
  role: "label" | "summary" | "chunk_of" | "caption" | "keyword",
  metadata?: any,
  createdAt: number
}
```

### Entity Type Validation (66+ types)

All validated in `lib/validation.ts`:

```typescript
// Samples of valid THING_TYPES
validateThingType("user")                 // ✅
validateThingType("course")               // ✅
validateThingType("blog_post")            // ✅
validateThingType("contact_submission")   // ✅
validateThingType("token")                // ✅
validateThingType("creator")              // ✅ (people)
validateThingType("invalid_type")         // ❌ ValidationError
```

### Connection Type Validation (25+ types)

```typescript
validateConnectionType("owns")             // ✅
validateConnectionType("enrolled_in")      // ✅
validateConnectionType("member_of")        // ✅
validateConnectionType("authored")         // ✅
validateConnectionType("invalid")          // ❌ ValidationError
```

### Event Type Validation (67+ types)

```typescript
validateEventType("thing_created")         // ✅
validateEventType("group_updated")         // ✅
validateEventType("contact_submitted")     // ✅
validateEventType("connection_created")    // ✅
validateEventType("invalid")               // ❌ ValidationError
```

---

## Development Patterns

### Mutation Pattern (Universal - 6 Steps)

All mutations follow this pattern:

```typescript
export const create = mutation({
  args: { /* typed arguments */ },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE user via Better Auth
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    // 2. VALIDATE group exists and is active
    const group = await ctx.db.get(args.groupId);
    if (!group) throw new Error("Group not found");
    if (group.status !== "active") throw new Error("Group not active");

    // 3. VALIDATE inputs (type, constraints, etc.)
    if (!isValidType(args.type)) throw new Error("Invalid type");

    // 4. GET ACTOR (user entity) for event logging
    const actor = await ctx.db.query("entities")
      .withIndex("group_type", q => q.eq("groupId", args.groupId).eq("type", "creator"))
      .filter(q => q.eq(q.field("properties.userId"), identity.tokenIdentifier))
      .first();

    // 5. CREATE entity/connection/knowledge in database
    const id = await ctx.db.insert("entities", { /* ... */ });

    // 6. LOG EVENT (audit trail)
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "thing_created",
      actorId: actor._id,
      targetId: id,
      timestamp: Date.now(),
      metadata: { /* context */ }
    });

    return id;
  }
});
```

### Query Pattern (Efficient)

All queries follow this pattern:

```typescript
export const list = query({
  args: {
    groupId: v.id("groups"),
    // optional filters
  },
  handler: async (ctx, args) => {
    // 1. Use appropriate index (critical for performance)
    return await ctx.db.query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId)
         .eq("type", args.type)
      )
      .collect();
  }
});
```

### Key Indexes by Dimension

- **Dimension 1 (Groups)**: by_slug, by_type, by_parent, by_status
- **Dimension 3 (Things)**: group_type, group_status, by_created, by_updated
- **Dimension 4 (Connections)**: from_entity, to_entity, bidirectional, group_type
- **Dimension 5 (Events)**: group_timestamp, by_actor, by_target, by_type
- **Dimension 6 (Knowledge)**: group_type, by_source, by_created

---

## Multi-Tenant Isolation

### Critical Principle

**CRITICAL: Every mutation and query includes groupId filtering**

Pattern enforced everywhere:

```typescript
// Mutations MUST validate groupId
const group = await ctx.db.get(args.groupId);
if (!group) throw new Error("Group not found");

// Queries MUST filter by groupId
await ctx.db.query("entities")
  .withIndex("group_type", (q) => q.eq("groupId", groupId).eq("type", type))
  .collect()
```

### Benefits

- Data for Organization A never leaks to Organization B
- Each group has independent quotas, plans, settings
- Hierarchical groups can optionally share data (with configuration)
- No special "admin queries" that bypass isolation
- Enforced at database query level, not application logic

### File Organization Rules

1. **One file per dimension** - groups.ts, entities.ts, connections.ts, etc.
2. **Separate mutation/query files** - mutations/entities.ts vs queries/entities.ts
3. **Clear dimension header** - `/** DIMENSION X: NAME */` at top of file
4. **Consistent comments** - Explain pattern, indexes, use cases
5. **No cross-dimension mixing** - People operations in people.ts only
6. **groupId everywhere** - Every mutation/query includes it
7. **Consistent naming** - Use "things" not "entities" in code comments and function descriptions

---

## Performance Guidelines

### Critical Indexes to Use

1. **group_type** - Most common pattern (dimension + group)
2. **group_timestamp** - Events timeline queries
3. **by_actor** - Activity feeds
4. **by_target** - Entity audit trails
5. **from_entity / to_entity** - Graph queries

### Query Optimization

- ALWAYS use indexes (withIndex is non-negotiable)
- Filter by groupId first (multi-tenant isolation)
- Filter by type/status second (narrow the result set)
- Avoid full table scans (filter before collecting)
- Use `.first()` for single results (early exit)
- Use `.collect()` only for reasonable result sets

### Soft Delete Pattern

- Never hard delete (archives instead)
- Filter out archived items (status !== "archived")
- Keep deletedAt timestamp (for compliance)
- Maintain audit trail (events never deleted)

---

## Migration Path

### What We've Done

1. ✅ Analyzed 3 existing structure documentation files
2. ✅ Identified overlap and consolidation opportunities
3. ✅ Created unified source of truth

### Next Steps

1. 🔄 Rename mutations/entities.ts → mutations/things.ts
2. 🔄 Rename queries/entities.ts → queries/things.ts
3. 🔄 Update all API references (http.ts)
4. 🔄 Update all comments to say "things" not "entities"
5. 🔄 Create queries/people.ts if missing
6. 🔄 Create actions/ directory with dimension-specific files
7. 🔄 Create internalActions/ directory with shared utilities
8. 🔄 Remove/consolidate contact.ts, init.ts, onboarding.ts into things.ts or services/
9. 🔄 Verify complete ontology compliance
10. 🔄 Zero TypeScript errors
11. 🔄 Create API endpoint documentation

### Perfect File Organization Checklist

- [ ] mutations/ has ONLY 5 files (groups, people, things, connections, knowledge)
- [ ] queries/ has ONLY 6 files (groups, people, things, connections, events, knowledge)
- [ ] actions/ has ONLY 4 files (groups, things, connections, knowledge)
- [ ] internalActions/ has ONLY 3 files (events, search, validation)
- [ ] No init.ts, onboarding.ts, contact.ts files in mutations/ or queries/
- [ ] entities.ts renamed to things.ts everywhere
- [ ] eventLogger.ts renamed to events.ts
- [ ] All functions map to exactly ONE dimension
- [ ] All mutations validate groupId
- [ ] All mutations log events
- [ ] All queries use efficient indexes
- [ ] All actions are multi-tenant safe
- [ ] All internal actions are reusable
- [ ] Zero TypeScript errors
- [ ] Comments clearly indicate which dimension

---

## Key Rules for Perfect Compliance

### Rule 1: Only 6 Dimensions

Every file must map to exactly ONE of the 6 dimensions. No exceptions.

```
❌ WRONG: convex/mutations/contact.ts (doesn't fit)
❌ WRONG: convex/mutations/init.ts (system utility, not a dimension)
❌ WRONG: convex/mutations/onboarding.ts (not a dimension)

✅ RIGHT: convex/mutations/things.ts (contact_submission is a thing)
✅ RIGHT: System utilities in convex.config.ts or scripts/
```

### Rule 2: Consistent Naming

- Database table: "entities" (schema.ts) - but code calls it "things"
- File names: things.ts (not entities.ts)
- Comments: Refer to "Dimension 3: Things"
- Functions: Describe operating on "things" or "things of type X"

### Rule 3: Multi-tenant Isolation

Every mutation and query MUST validate groupId:

```typescript
// ✅ CORRECT
const group = await ctx.db.get(args.groupId);
if (!group || group.status !== "active") throw new Error("Invalid group");

// ❌ WRONG
// (no groupId validation)
```

### Rule 4: Event Logging

Every mutation MUST log its action:

```typescript
// ✅ CORRECT
await ctx.runAction(api.internalActions.events.logThingCreated, {
  groupId: args.groupId,
  thingId,
  thingType: args.type,
  actorId,
});

// ❌ WRONG
// (no logging)
```

### Rule 5: No Cross-Dimension Mixing

Each file has ONE responsibility:

```
❌ WRONG: mutations/things.ts also handles people creation
✅ RIGHT: mutations/things.ts handles things only
          mutations/people.ts handles people only
```

### Rule 6: Use Internal Actions for Shared Logic

Don't duplicate validation or logging:

```
❌ WRONG: Copy validation logic into each mutation
✅ RIGHT: Use internalActions/validation.ts for shared validation
```

---

## Why This Structure Is Solid

### 1. Clear Organization
- Files organized by ontology dimension
- Easy to find what you need
- Consistent naming patterns

### 2. 100% Ontology Compliance
- Every file maps to dimensions
- No special-case logic
- Universal patterns

### 3. Extensible
- Add new entity types → No new files needed
- Add new connection types → No new files needed
- Add new event types → Auto-logged

### 4. Maintainable
- Clear separation of concerns
- Validation in one place
- Services orchestrate dimensions

### 5. Type-Safe
- TypeScript throughout
- Validated against ontology
- Tagged error types

### 6. Auditable
- All data changes logged consistently
- Complete audit trail via events
- No silent modifications

### 7. Secure
- Multi-tenant isolation enforced everywhere
- Role-based access via people
- No data leaks between groups

---

## Development Workflow

### Adding a New Feature

1. **Map to dimensions**: What groups, people, things, connections, events, knowledge are involved?
2. **Update schema** (if needed): convex/schema.ts
3. **Add mutation** (if write): convex/mutations/[dimension].ts
4. **Add query** (if read): convex/queries/[dimension].ts
5. **Follow patterns**: Use 6-step mutation pattern, efficient indexes
6. **Test isolation**: Verify groupId filtering works
7. **Update documentation**: Keep ontology alignment verified

### Testing Checklist

Every mutation should test:
- ✅ Authentication (logged in user)
- ✅ Group exists and is active
- ✅ Input validation (type, constraints)
- ✅ Multi-tenant isolation (groupId filtering)
- ✅ Event logging (audit trail)

---

## Future Enhancements

- [ ] Role-based access control (RBAC) per group
- [ ] Quota enforcement (users, storage, apiCalls)
- [ ] Rate limiting (brute force protection)
- [ ] Cascade delete (deleting group deletes contents)
- [ ] Effect.ts service layer (business logic)
- [ ] Vector search (embeddings via Pinecone/Weaviate)
- [ ] GraphQL API (more expressive queries)
- [ ] Webhook events (external system integration)
- [ ] Distributed tracing (observability)
- [ ] A/B testing events

---

## References

For more information:
- **6-Dimension Specification:** `/one/knowledge/ontology.md` (Version 1.0.0)
- **Platform Architecture:** `/one/knowledge/architecture.md`
- **Development Workflow:** `/one/connections/workflow.md`
- **Code Patterns:** `/one/connections/patterns.md`
- **Quick Reference:** `web/AGENTS.md`
- **Golden Rules:** `/one/knowledge/rules.md`

---

**Built with clarity, simplicity, and infinite scale in mind.**

Every file follows the 6-dimension ontology. No exceptions. Clean foundation.
