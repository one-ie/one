# Migration Plan: 4-Table Ontology → 6-Dimension Ontology

**Version:** 2.0.0
**Created:** 2025-10-10
**Updated:** 2025-10-24
**Status:** ✅ Complete
**Goal:** Transform ONE Platform from a 4-table ontology to a complete 6-dimension architecture that scales from children learning to build AI apps to enterprise platforms serving millions.

---

## Executive Summary

The ONE Platform has been successfully upgraded from a "4-table ontology" (Things, Connections, Events, Knowledge) to a **6-dimension ontology** that explicitly includes Groups and People as first-class dimensions, creating a complete reality-aware architecture.

**Why This Matters:**

- **For Children:** "I own a lemonade stand (Group), I'm the owner (Person), I sell lemonade (Things), customers buy it (Connections), sales happen (Events), and I learn what works (Knowledge)"
- **For Enterprises:** Multi-tenant SaaS platforms with clear ownership, governance, data isolation, and intelligence

**Key Changes:**

- `4 tables` → `6 dimensions` ✅
- Explicit Groups (multi-tenant isolation with hierarchical nesting) ✅
- Explicit People (authorization & governance) ✅
- Enhanced documentation throughout `/one/*` ✅

**Note:** We use "Groups" not "Organizations" to support hierarchical nesting from friend circles → businesses → DAOs → governments.

---

## The Transformation

### From: 4-Table Ontology

```
┌──────────────────────────────────────────────┐
│                   THINGS                      │
│  Every "thing" - entities, agents, content   │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                CONNECTIONS                    │
│  Every relationship - owns, follows, etc.    │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                  EVENTS                       │
│  Every action - purchased, created, etc.     │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                KNOWLEDGE                      │
│  Labels + vectors powering RAG & search      │
└──────────────────────────────────────────────┘
```

### To: 6-Dimension Ontology

```
┌──────────────────────────────────────────────┐
│                  1. GROUPS                    │
│  Multi-tenant isolation with hierarchical     │
│  nesting: friend circles → businesses →      │
│  DAOs → governments (all group types)        │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                 2. PEOPLE                     │
│  Who can do what (authorization)             │
│  Platform owner, group owners, users         │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                 3. THINGS                     │
│  What exists - entities, agents, content     │
│  Created within group context (via groupId)  │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│              4. CONNECTIONS                   │
│  How things relate - ownership, membership   │
│  Scoped to groups (via groupId)              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│                 5. EVENTS                     │
│  What happened - actions, state changes      │
│  Actor (person) + target (thing) + time      │
│  Scoped to groups (via groupId)              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│               6. KNOWLEDGE                    │
│  What it means - vectors, embeddings, RAG    │
│  Intelligence layer for all dimensions       │
│  Scoped to groups (via groupId)              │
└──────────────────────────────────────────────┘
```

---

## Phase 1: Documentation Search & Analysis

### Step 1.1: Search for All "4-Table" References

**Files to Update (152+ occurrences found):**

**High Priority - Core Documentation:**

- ✅ `one/knowledge/ontology.md` (19 occurrences) - **PRIMARY SOURCE**
- ✅ `one/knowledge/ontology-documentation.md` (already shows 6 dimensions!)
- ✅ `one/connections/documentation.md` (5 occurrences)
- ✅ `one/knowledge/architecture.md` (7 occurrences)
- ✅ `one/knowledge/rules.md` (4 occurrences)
- ✅ `one/things/frontend.md` (1 occurrence)
- ✅ `one/things/hono.md` (4 occurrences)

**Medium Priority - Feature Documentation:**

- `one/connections/workflow.md` (8 occurrences)
- `one/connections/api.md` (5 occurrences)
- `one/connections/api-docs.md` (2 occurrences)
- `one/connections/multitenant.md` (4 occurrences)
- `one/connections/mcp.md` (6 occurrences)
- `one/connections/middleware.md` (1 occurrence)
- `one/connections/membership.md` (2 occurrences)
- `one/connections/kyc.md` (2 occurrences)
- `one/connections/protocols.md` (2 occurrences)
- `one/connections/communications.md` (2 occurrences)
- `one/connections/agui.md` (1 occurrence)
- `one/connections/acp.md` (1 occurrence)
- `one/connections/ap2.md` (1 occurrence)
- `one/connections/a2a.md` (1 occurrence)
- `one/connections/cryptonetworks.md` (1 occurrence)

**Medium Priority - Things Documentation:**

- `one/things/implementation-examples.md` (12 occurrences)
- `one/things/sui.md` (4 occurrences)
- `one/things/agentsales.md` (2 occurrences)
- `one/things/todo.md` (6 occurrences)
- `one/things/revenue.md` (1 occurrence)
- `one/things/vision.md` (1 occurrence)
- `one/things/ai-platform.md` (1 occurrence)

**Medium Priority - Agents:**

- `one/things/agents/director.md` (13 occurrences)
- `one/things/agents/agent-clean.md` (4 occurrences)
- `one/things/agents/agent-clone.md` (4 occurrences)

**Medium Priority - Workflows:**

- `one/things/workflows/tasks.md` (3 occurrences)

**Low Priority (Generated):**

- `one/repomix-output.md` (129 occurrences) - **REGENERATE AFTER ALL UPDATES**

### Step 1.2: Search for Pattern References

**Pattern:** `(entities|things), connections, events, (tags|knowledge)`

**Files Using This Pattern:**

- All files above use variations of this pattern
- Focus on consistent replacement: "6 dimensions" or "six dimensions"
- Maintain backward compatibility in code (table names stay as `entities`, `connections`, `events`, `knowledge`)

---

## Phase 2: Core Documentation Updates

### Step 2.1: Update Primary Ontology Specification

**File:** `one/knowledge/ontology.md`

**Changes:**

1. **Title Section:**

   ```markdown
   # ONE Platform - Ontology Specification

   **Version:** 2.0.0 (6-Dimension Architecture)
   **Status:** Complete - Reality-Aware Architecture
   **Design Principle:** This ontology models reality in six dimensions. All protocols map TO this ontology via metadata.
   ```

2. **Structure Section (lines 6-16):**

   ```markdown
   ## Structure

   This ontology is organized into 6 dimension files:

   1. **[organisation.md](./organisation.md)** - Multi-tenant isolation & ownership
   2. **[people.md](./people.md)** - Authorization, governance, & user customization
   3. **[things.md](./things.md)** - 66 entity types (what exists)
   4. **[connections.md](./connections.md)** - 25 relationship types (how they relate)
   5. **[events.md](./events.md)** - 67 event types (what happened)
   6. **[knowledge.md](./knowledge.md)** - Vectors, embeddings, RAG (what it means)
   ```

3. **Replace "4-Table Universe" (lines 19-49) with "6-Dimension Reality Model":**

   ```markdown
   ## The 6-Dimension Reality Model

   Every single thing in ONE platform exists within one of these 6 dimensions:
   ```

   ┌──────────────────────────────────────────────────────────────┐
   │ 1. ORGANIZATIONS │
   │ Multi-tenant isolation boundary - who owns what at org level │
   └──────────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ 2. PEOPLE │
   │ Authorization & governance - platform owner, org owners │
   └──────────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ 3. THINGS │
   │ Every "thing" - users, agents, content, tokens, courses │
   └──────────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ 4. CONNECTIONS │
   │ Every relationship - owns, follows, taught_by, powers │
   └──────────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ 5. EVENTS │
   │ Every action - purchased, created, viewed, completed │
   └──────────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────────┐
   │ 6. KNOWLEDGE │
   │ Labels + chunks + vectors powering RAG & search │
   └──────────────────────────────────────────────────────────────┘

   ```

   **Golden Rule:** If you can't map your feature to these 6 dimensions, you're thinking about it wrong.

   **Simplicity:** ONE is six dimensions — organizations partition, people authorize, things exist, connections relate, events record, and knowledge understands. Everything composes from these building blocks.
   ```

4. **Update "Simplicity" statement (line 47):**

   ```markdown
   Simplicity: ONE is six dimensions — organizations partition, people authorize, things exist, connections relate, events record, and knowledge understands. Everything composes from these building blocks.
   ```

5. **Add Organizations & People Sections** (after line 49, before KNOWLEDGE section):

   ````markdown
   ---

   ## ORGANIZATIONS: The Isolation Boundary

   Purpose: Partition the system for multi-tenant scale. Every organization owns its own graph of things, connections, events, and knowledge.

   ### Organization Structure

   ```typescript
   {
     _id: Id<'organizations'>,
     name: string,
     slug: string,              // URL-friendly identifier
     domain?: string,           // Custom domain
     status: 'active' | 'suspended' | 'trial' | 'cancelled',
     plan: 'starter' | 'pro' | 'enterprise',

     limits: {
       users: number,
       storage: number,         // GB
       apiCalls: number,
       inference: number,       // Monthly LLM calls
     },

     usage: {
       users: number,
       storage: number,
       apiCalls: number,
       inference: number,
     },

     billing: {
       customerId?: string,     // Stripe customer
       subscriptionId?: string,
     },

     settings: {
       allowSignups: boolean,
       requireEmailVerification: boolean,
       enableTwoFactor: boolean,
     },

     createdAt: number,
     updatedAt: number,
     trialEndsAt?: number,
   }
   ```
   ````

   ### Why Organizations Matter

   1. **Multi-Tenant Isolation:** Each org's data is completely separate
   2. **Resource Quotas:** Control costs and usage per organization
   3. **Custom Branding:** Each org can have unique frontend/domain
   4. **Billing Flexibility:** Per-org subscriptions and revenue sharing

   ***

   ## PEOPLE: Authorization & Governance

   Purpose: Define who can do what. People direct organizations, customize AI agents, and govern access.

   ### Person Structure

   ```typescript
   {
     _id: Id<'people'>,
     email: string,
     username: string,
     displayName: string,

     // CRITICAL: Role determines access level
     role: 'platform_owner' | 'org_owner' | 'org_user' | 'customer',

     // Organization context
     organizationId?: Id<'organizations'>,  // Current/default org
     permissions?: string[],

     // Profile
     bio?: string,
     avatar?: string,

     // Multi-tenant tracking
     organizations: Id<'organizations'>[],  // All orgs this person belongs to

     createdAt: number,
     updatedAt: number,
   }
   ```

   ### Four Roles

   1. **Platform Owner** (Anthony)

      - Owns the ONE Platform
      - 100% revenue from platform-level services
      - Can access all organizations (support/debugging)
      - Creates new organizations

   2. **Org Owner**

      - Owns/manages one or more organizations
      - Controls users, permissions, billing within org
      - Customizes AI agents and frontend
      - Revenue sharing with platform

   3. **Org User**

      - Works within an organization
      - Limited permissions (defined by org owner)
      - Can create content, run agents (within quotas)

   4. **Customer**
      - External user consuming content
      - Purchases tokens, enrolls in courses
      - No admin access

   ### Why People Matter

   1. **Authorization:** Every action must have an actor (person)
   2. **Governance:** Org owners control who can do what
   3. **Audit Trail:** Events log who did what when
   4. **Customization:** People teach AI agents their preferences

   ***

   ```

   ```

6. **Update all remaining "4 tables" references throughout the file to "6 dimensions"**

7. **Update Philosophy Section (lines 2150-2193):**

   ```markdown
   ## The Philosophy

   **Simplicity is the ultimate sophistication.**

   This ontology proves that you don't need hundreds of tables or complex schemas to build a complete AI-native platform. You need:

   1. **6 dimensions** (organizations, people, things, connections, events, knowledge)
   2. **66 thing types** (every "thing")
   3. **25 connection types** (every relationship)
   4. **67 event types** (every action)
   5. **Metadata** (for protocol identity via metadata.protocol)

   That's it. Everything else is just data.

   ### Why This Works

   **Other systems:**

   - Create new tables for every feature
   - Add protocol-specific columns
   - Pollute schema with temporary concepts
   - End up with 50+ tables, 200+ columns
   - Become unmaintainable nightmares

   **ONE's approach:**

   - Map every feature to 6 dimensions
   - Organizations partition the space
   - People authorize and govern
   - Things, connections, events flow from there
   - Knowledge understands it all
   - Scale infinitely without schema changes
   - Stay simple, clean, beautiful

   ### The Result

   A database schema that:

   - Scales from lemonade stands to global enterprises
   - Children can understand: "I own (org), I'm the boss (person), I sell lemonade (things)"
   - Enterprises can rely on: Multi-tenant isolation, clear governance, infinite scale
   - AI agents can reason about completely
   - Never needs breaking changes
   - Grows more powerful as it grows larger

   **This is what happens when you design for clarity first.**
   ```

8. **Update Summary Statistics (lines 2091-2145):**

   ```markdown
   ## Summary Statistics

   **Dimensions:** 6 total (organizations, people, things, connections, events, knowledge)

   **Thing Types:** 66 total

   - Core: 4 (creator, ai_clone, audience_member, organization)
   - Business Agents: 10
   - Content: 7
   - Products: 4
   - Community: 3
   - Token: 2
   - Knowledge: 2
   - Platform: 6
   - Business: 7
   - Authentication & Session: 5
   - Marketing: 6
   - External: 3
   - Protocol: 2

   **Connection Types:** 25 total (Hybrid approach)

   - 18 specific semantic types
   - 7 consolidated types with metadata variants
   - Protocol-agnostic via metadata.protocol
   - Includes organization membership with role-based metadata

   **Event Types:** 67 total (Hybrid approach)

   - 4 Thing lifecycle
   - 5 User events
   - 6 Authentication events
   - 5 Organization events
   - 4 Dashboard & UI events
   - 4 AI/Clone events
   - 4 Agent events
   - 7 Token events
   - 5 Course events
   - 5 Analytics events
   - 7 Inference events
   - 5 Blockchain events
   - 11 consolidated types with metadata variants

   **Design Benefits:**

   - ✅ Six-dimension reality model
   - ✅ Multi-tenant by design
   - ✅ Clear ownership & governance
   - ✅ Protocol-agnostic core
   - ✅ Infinite protocol extensibility
   - ✅ Cross-protocol analytics
   - ✅ Type-safe
   - ✅ Future-proof
   - ✅ Scales from children to enterprise
   ```

### Step 2.2: Update Ontology Documentation Index

**File:** `one/knowledge/ontology-documentation.md`

**Changes:**

1. Line 3: Update version

   ```markdown
   **Version 1.0 - 6-Dimension Architecture**
   ```

2. Lines 115-122: Update from "Four Primitives" to "Six Dimensions"

   ```markdown
   ### 1. Six Dimensions

   Everything in ONE exists in one of 6 dimensions:

   - **organizations** - multi-tenant isolation (ownership partitioning)
   - **people** - authorization & governance (who can do what)
   - **things** - entities (66 types)
   - **connections** - relationships (25 types)
   - **events** - actions (67 types)
   - **knowledge** - vectors + labels (4 types)
   ```

3. Line 161: Update the loop description

   ```markdown
   ## The Loop
   ```

   ┌─────────────────────────────────────────────────┐
   │ 1. Organization Scope │
   │ Define the context for all operations │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 2. Person Authorization │
   │ Check permissions & role │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 3. User Request │
   │ "Create a fitness course" │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 4. Vector Search (Knowledge) │
   │ Find relevant chunks + labels │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 5. RAG Context Assembly │
   │ Crawls using vectors and ontology → Context │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 6. LLM Generation │
   │ Context + Prompt → Generated content │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 7. Create Thing + Connections + Events │
   │ Course entity + ownership + logs │
   └──────────────────┬──────────────────────────────┘
   ↓
   ┌─────────────────────────────────────────────────┐
   │ 8. Embed New Content (Knowledge) │
   │ Course → chunks → embeddings │
   └─────────────────────────────────────────────────┘

   ```

   Knowledge makes generation **context-aware**, organizations make it **multi-tenant**, and people make it **governed**.
   ```

4. Lines 198-207: Update design philosophy

   ```markdown
   ## Design Philosophy

   **Simplicity is the ultimate sophistication.**

   - **6 dimensions** (not 50+ tables)
   - **Organizations** partition the space
   - **People** authorize and govern
   - **66 thing types** (covers everything)
   - **25 connection types** (all relationships)
   - **67 event types** (complete tracking)
   - **Metadata for variance** (not enum explosion)
   - **Protocol-agnostic core** (infinite extensibility)

   This ontology proves you don't need complexity to build a complete AI-native platform that scales from children's lemonade stands to global enterprises.
   ```

### Step 2.3: Update Architecture Documentation

**File:** `one/knowledge/architecture.md`

**Changes:**

1. Lines 58-66: Update ontology reference in Layer 3

   ```markdown
   │ LAYER 3: BACKEND (Hono + Convex) │
   │ Documentation: docs/Hono.md │
   ├─────────────────────────────────────────────────────────────────────┤
   │ ✅ Hono: REST API routes (Cloudflare Workers) │
   │ ✅ Convex: Real-time database + typed functions │
   │ ✅ Better Auth: Authentication with Convex adapter │
   │ ✅ 6-Dimension Ontology: Reality-aware data model │
   │ │
   │ Hono API Routes Convex Functions 6-Dimension Ontology │
   │ ├─ /api/auth/_ ├─ Queries (reads) ├─ organizations │
   │ ├─ /api/tokens/_ ├─ Mutations (writes) ├─ people │
   │ ├─ /api/agents/_ ├─ Actions (external) ├─ things (entities) │
   │ └─ /api/content/_ └─ Real-time subs ├─ connections │
   │ ├─ events │
   │ └─ knowledge │
   └─────────────────────────────────────────────────────────────────────┘
   ```

2. Lines 519-583: Update Layer 5 section

   ````markdown
   ### Layer 5: Data Layer (6-Dimension Ontology - Plain Convex)

   All data maps to 6 dimensions using **plain Convex schema** (no Convex Ents):

   **Core Tables:**

   - **organizations** - Multi-tenant partitioning
   - **people** - Authorization & governance (maps to creator/owner/user things)
   - **things (entities)** - All entities (66 types)
   - **connections** - All relationships (25 types)
   - **events** - All actions (67 types)
   - **knowledge** - All labels + vectors

   **Schema Implementation:**

   ```typescript
   // Plain Convex schema - NO Convex Ents
   import { defineSchema, defineTable } from "convex/server";
   import { v } from "convex/values";

   export default defineSchema({
     organizations: defineTable({
       name: v.string(),
       slug: v.string(),
       status: v.string(),
       plan: v.string(),
       limits: v.any(),
       usage: v.any(),
       billing: v.any(),
       settings: v.any(),
       createdAt: v.number(),
       updatedAt: v.number(),
     })
       .index("by_slug", ["slug"])
       .index("by_status", ["status"]),

     // People are represented as 'creator' things with role metadata
     // See things table for implementation

     things: defineTable({
       // Formerly "entities"
       thingType: v.string(),
       name: v.string(),
       organizationId: v.id("organizations"), // NEW: Every thing belongs to an org
       description: v.optional(v.string()),
       properties: v.any(),
       status: v.string(),
       createdAt: v.number(),
       updatedAt: v.number(),
     })
       .index("by_type", ["thingType"])
       .index("by_org", ["organizationId"]) // NEW: Query things by org
       .index("by_org_type", ["organizationId", "thingType"])
       .searchIndex("search_things", {
         searchField: "name",
         filterFields: ["thingType", "organizationId"],
       }),

     connections: defineTable({
       fromThingId: v.id("things"),
       toThingId: v.id("things"),
       relationshipType: v.string(),
       organizationId: v.id("organizations"), // NEW: Connections scoped to org
       metadata: v.any(),
       createdAt: v.number(),
     })
       .index("by_from", ["fromThingId"])
       .index("by_to", ["toThingId"])
       .index("by_org", ["organizationId"]) // NEW: Query connections by org
       .index("by_relationship", ["relationshipType"]),

     events: defineTable({
       thingId: v.optional(v.id("things")),
       eventType: v.string(),
       actorId: v.id("things"), // REQUIRED: Actor is always a person (thing with role)
       organizationId: v.id("organizations"), // NEW: Events scoped to org
       metadata: v.any(),
       timestamp: v.number(),
     })
       .index("by_thing", ["thingId"])
       .index("by_actor", ["actorId"]) // NEW: Query by who did it
       .index("by_org", ["organizationId"]) // NEW: Query events by org
       .index("by_type", ["eventType"])
       .index("by_timestamp", ["timestamp"]),

     knowledge: defineTable({
       knowledgeType: v.string(),
       text: v.optional(v.string()),
       embedding: v.optional(v.array(v.number())),
       embeddingModel: v.optional(v.string()),
       embeddingDim: v.optional(v.number()),
       sourceThingId: v.optional(v.id("things")),
       sourceField: v.optional(v.string()),
       organizationId: v.id("organizations"), // NEW: Knowledge scoped to org
       chunk: v.optional(v.any()),
       labels: v.optional(v.array(v.string())),
       metadata: v.optional(v.any()),
       createdAt: v.number(),
       updatedAt: v.number(),
     })
       .index("by_type", ["knowledgeType"])
       .index("by_source", ["sourceThingId"])
       .index("by_org", ["organizationId"]) // NEW: Query knowledge by org
       .index("by_created", ["createdAt"]),
   });
   ```
   ````

   **Key Design Principles:**

   - Organizations partition ALL data (perfect multi-tenant isolation)
   - People are represented as things with `role` property (platform_owner, org_owner, org_user, customer)
   - Every thing, connection, event, and knowledge item is scoped to an organization
   - No ORM layer (Convex Ents) - direct database access
   - Flexible metadata fields for type-specific data
   - Comprehensive indexing for query performance (including org-scoped indexes)

   ```

   ```

3. Lines 1501-1563: Update "Key Architectural Decisions Summary"

   ```markdown
   ## Key Architectural Decisions Summary

   ### 1. Plain Convex Schema with 6-Dimension Ontology

   **Decision:** Use plain Convex `defineSchema` with 6 dimensions (organizations, people, things, connections, events, knowledge)
   **Rationale:**

   - Simpler mental model for AI agents
   - Organizations provide perfect multi-tenant isolation
   - People represented as things with role metadata (no duplicate tables)
   - No ORM abstraction layer to learn
   - Direct control over indexes and queries
   - Every dimension scoped to organization
   - Scales from children's apps to enterprise SaaS

   ### 2. Organizations as First-Class Dimension

   **Decision:** Every resource (thing, connection, event, knowledge) belongs to an organization
   **Rationale:**

   - Perfect data isolation for multi-tenancy
   - Clear ownership boundaries
   - Independent billing and quotas per org
   - Custom frontends per org
   - Platform-level services (shared infrastructure)

   ### 3. People as Authorization Layer

   **Decision:** People are things with role property (platform_owner, org_owner, org_user, customer)
   **Rationale:**

   - Every action has an actor (person)
   - Clear permission hierarchy
   - Roles define what actions are allowed
   - Org owners control their users
   - Platform owner can access everything (support/debugging)

   ### 4. Multi-Chain Blockchain Architecture

   **Decision:** Separate Effect.ts provider per blockchain (Sui, Base, Solana)
   **Rationale:**

   - Each chain has unique APIs and transaction models
   - Type safety per chain (unique error types)
   - Easy to add new chains without modifying existing code
   - Users can choose preferred blockchain per token/NFT
   - Chain-specific retry strategies and error handling

   ### 5. Stripe for FIAT Only

   **Decision:** Stripe handles USD/EUR/etc payments only, NOT crypto
   **Rationale:**

   - Clear separation of concerns (fiat vs crypto)
   - Blockchain providers handle all crypto transactions
   - Prevents confusion about payment routing
   - Simpler error handling (payment method determines provider)

   ### 6. Effect.ts 100% Coverage

   **Decision:** ALL business logic uses Effect.ts (no raw async/await)
   **Rationale:**

   - Consistent patterns across entire codebase
   - Typed errors everywhere (no try/catch)
   - Automatic dependency injection
   - Built-in retry, timeout, resource management
   - AI generates consistent code every time

   ### 7. 6-Dimension Ontology (Organizations + People + 4 Core Dimensions)

   **Decision:** Expand from 4 tables to 6 dimensions
   **Rationale:**

   - Organizations: Multi-tenant isolation boundary
   - People: Authorization and governance
   - Things: 66 entity types (what exists)
   - Connections: 25 relationship types (how they relate)
   - Events: 67 event types (what happened)
   - Knowledge: Vectors + labels (what it means)
   - Simple enough for children, powerful enough for enterprises
   - AI agents can reason about complete reality model
   ```

4. Line 1688: Update key reminders

   ```markdown
   **Key Reminders:**

   - **Frontend Layer:** Astro + React, content collections, Convex hooks + Hono API client
   - **Glue Layer:** Effect.ts services (100% coverage), typed errors, DI
   - **Backend Layer:** Hono API routes, Convex database (6-dimension ontology), Better Auth
   - **6 Dimensions:** Organizations partition, People authorize, Things exist, Connections relate, Events record, Knowledge understands
   - Stripe = fiat only (NOT crypto)
   - Cloudflare = livestreaming only (NOT web hosting)
   - Plain Convex schema (NO Convex Ents)
   - Multi-chain providers (separate services per blockchain)
   - 25 connection types + 67 event types (optimized, generic)
   ```

---

## Phase 3: Systematic Documentation Updates

### Step 3.1: Workflow & Process Documentation

**Files to Update:**

1. `one/connections/workflow.md`

   - Line 12: Update golden rule from "4 tables" to "6 dimensions"
   - Line 42: Update reference to "6-dimension universe"
   - Line 84: Map features to 6 dimensions
   - Line 190: Checklist item "fits in 6 dimensions"
   - Line 751: Understanding the 6-dimension model

2. `one/connections/api.md`

   - Line 1244: Section header "6-Dimension Ontology"
   - Line 1246: Description of 6 dimensions
   - Line 1270: Golden rule update
   - Line 1774: Feature mapping to 6 dimensions
   - Line 2049: Migration guide title

3. `one/connections/api-docs.md`
   - Line 39: Database description
   - Line 1889: Ontology specification reference

### Step 3.2: Integration Documentation

**Files to Update:**

1. `one/connections/mcp.md`

   - Title line 4: "6-dimension ontology"
   - Line 12: Description
   - Line 22: MCP server exposure
   - Line 31: Section "The 6-Dimension Universe"
   - Line 663: Description in JSON
   - Line 778: Access list

2. `one/connections/multitenant.md`

   - Line 5: Architecture leverages 6-dimension ontology
   - Line 49: Section header
   - Line 1341: Result description

3. `one/connections/middleware.md`

   - Line 32: Database comment

4. `one/connections/membership.md`

   - Line 132: Section header
   - Line 1149: Reference link

5. `one/connections/kyc.md`

   - Line 5: Purpose statement
   - Line 632: Reference link

6. `one/connections/protocols.md`

   - Line 37: "Our 6-dimension ontology"
   - Line 230: Implementation checklist

7. `one/connections/communications.md`
   - Line 338: Storage reference
   - Line 444: Ontology-driven design

### Step 3.3: Protocol Documentation

**Files to Update (all protocol docs):**

1. `one/connections/agui.md` - Line 432
2. `one/connections/acp.md` - Line 450
3. `one/connections/ap2.md` - Line 243
4. `one/connections/a2a.md` - Line 317
5. `one/connections/cryptonetworks.md` - Line 766

**Pattern:** Replace "4-table ontology" → "6-dimension ontology" in all mapping sections

### Step 3.4: Things Documentation

**Files to Update:**

1. `one/things/implementation-examples.md`

   - Lines 10, 18, 35, 62, 63, 86, 92, 116, 522, 1113: All "4 table" → "6 dimension"

2. `one/things/sui.md`

   - Line 5, 17, 958: SUI Move mapping to 6 dimensions

3. `one/things/agentsales.md`

   - Line 13, 967: Sales agents with 6-dimension ontology

4. `one/things/frontend.md`

   - Line 829: Integration section

5. `one/things/hono.md`

   - Lines 73, 97, 406, 1923, 2098: Hono + 6-dimension integration

6. `one/things/todo.md`

   - Lines 100, 174, 481, 898, 1031: Todo list updates

7. `one/things/revenue.md`

   - Line 520: Design composition

8. `one/knowledge/rules.md`

   - Lines 22, 380, 575: Platform rules

9. `one/things/vision.md`

   - Line 15: Vision statement

10. `one/things/ai-platform.md`
    - Line 3: AI modeling follows ontology

### Step 3.5: Agent Documentation

**Files to Update:**

1. `one/things/agents/director.md`

   - Lines 69, 82, 91, 105, 200, 379, 440, 648, 722, 1092, 1108: Director agent understanding

2. `one/things/agents/agent-clean.md`

   - Lines 14, 47, 65: Cleanup agent ontology checks

3. `one/things/agents/agent-clone.md`
   - Lines 16, 68, 840, 858: Clone agent migration

### Step 3.6: Workflow Documentation

**Files to Update:**

1. `one/things/workflows/tasks.md`
   - Lines 4, 12: Task management with 6-dimension ontology

---

## Phase 4: Implementation & Testing

### Step 4.1: Database Migration (CRITICAL - No Breaking Changes)

**IMPORTANT:** The database schema does NOT change. We only add organization scoping and people representation.

**Migration Steps:**

1. **Add `organizations` table:**

   ```typescript
   // Already exists in schema - just verify indexes
   organizations: defineTable({
     name: v.string(),
     slug: v.string(),
     status: v.string(),
     plan: v.string(),
     limits: v.any(),
     usage: v.any(),
     billing: v.any(),
     settings: v.any(),
     createdAt: v.number(),
     updatedAt: v.number(),
   })
     .index("by_slug", ["slug"])
     .index("by_status", ["status"]);
   ```

2. **Add `organizationId` to `things` table:**

   ```typescript
   // Migration: Add organizationId to all existing things
   // Default: Create a "default" organization for existing data

   const defaultOrg = await ctx.db.insert("organizations", {
     name: "Default Organization",
     slug: "default",
     status: "active",
     plan: "enterprise",
     limits: {
       users: 1000,
       storage: 1000,
       apiCalls: 1000000,
       inference: 1000000,
     },
     usage: { users: 0, storage: 0, apiCalls: 0, inference: 0 },
     billing: {},
     settings: {
       allowSignups: true,
       requireEmailVerification: false,
       enableTwoFactor: false,
     },
     createdAt: Date.now(),
     updatedAt: Date.now(),
   });

   // Update all existing things
   const allThings = await ctx.db.query("things").collect();
   for (const thing of allThings) {
     await ctx.db.patch(thing._id, {
       organizationId: defaultOrg,
     });
   }
   ```

3. **Add `organizationId` to `connections`, `events`, `knowledge` tables:**

   ```typescript
   // Same migration pattern as things
   // All existing data goes to "default" organization
   ```

4. **Verify indexes:**

   ```typescript
   // Add new indexes for org-scoped queries
   things:
     .index("by_org", ["organizationId"])
     .index("by_org_type", ["organizationId", "thingType"])

   connections:
     .index("by_org", ["organizationId"])

   events:
     .index("by_org", ["organizationId"])
     .index("by_actor", ["actorId"])

   knowledge:
     .index("by_org", ["organizationId"])
   ```

5. **People representation:**

   ```typescript
   // People are things with type 'creator' and role property
   // No separate table needed

   interface PersonThing {
     thingType: "creator";
     properties: {
       email: string;
       username: string;
       role: "platform_owner" | "org_owner" | "org_user" | "customer";
       organizationId?: Id<"organizations">;
       permissions?: string[];
       // ... other creator properties
     };
   }
   ```

### Step 4.2: Query Pattern Updates

**Old Pattern (4-table):**

```typescript
// Get all blog posts
const posts = await ctx.db
  .query("things")
  .withIndex("by_type", (q) => q.eq("thingType", "blog_post"))
  .collect();
```

**New Pattern (6-dimension):**

```typescript
// Get all blog posts in organization
const posts = await ctx.db
  .query("things")
  .withIndex("by_org_type", (q) =>
    q.eq("organizationId", orgId).eq("thingType", "blog_post")
  )
  .collect();
```

**Update All Queries:**

1. Search for `.query("things")` → Add org filter
2. Search for `.query("connections")` → Add org filter
3. Search for `.query("events")` → Add org filter
4. Search for `.query("knowledge")` → Add org filter

### Step 4.3: Authorization Middleware

**Add Organization & People Checks:**

```typescript
// src/middleware/auth.ts

export async function requireOrgAccess(
  ctx: ConvexContext,
  orgId: Id<"organizations">,
  requiredRole: "org_owner" | "org_user"
) {
  const userId = await getUserId(ctx);

  // Get user's thing (person)
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Check if platform owner (can access everything)
  if (user.properties.role === "platform_owner") {
    return true;
  }

  // Check if user belongs to organization
  const membership = await ctx.db
    .query("connections")
    .withIndex("from_type", (q) =>
      q
        .eq("fromThingId", userId)
        .eq("toThingId", orgId)
        .eq("relationshipType", "member_of")
    )
    .first();

  if (!membership) {
    throw new Error("User not member of organization");
  }

  // Check role
  const userRole = membership.metadata.role;
  if (requiredRole === "org_owner" && userRole !== "org_owner") {
    throw new Error("Org owner access required");
  }

  return true;
}

// Usage in mutations
export const createBlogPost = mutation({
  args: {
    orgId: v.id("organizations"),
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check authorization
    await requireOrgAccess(ctx, args.orgId, "org_user");

    // Create blog post scoped to org
    const postId = await ctx.db.insert("things", {
      thingType: "blog_post",
      name: args.title,
      organizationId: args.orgId,
      properties: { content: args.content },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    const userId = await getUserId(ctx);
    await ctx.db.insert("events", {
      eventType: "content_created",
      actorId: userId,
      thingId: postId,
      organizationId: args.orgId,
      metadata: { contentType: "blog_post" },
      timestamp: Date.now(),
    });

    return postId;
  },
});
```

### Step 4.4: Frontend Updates

**Update All Frontend Components:**

```typescript
// Old: Get posts (no org context)
const posts = useQuery(api.queries.posts.list);

// New: Get posts for user's organization
const user = useQuery(api.queries.users.current);
const orgId = user?.properties.organizationId;
const posts = useQuery(api.queries.posts.list, { orgId });
```

**Organization Selector Component:**

```tsx
// src/components/admin/OrganizationSelector.tsx
export function OrganizationSelector() {
  const user = useQuery(api.queries.users.current);
  const orgs = useQuery(api.queries.orgs.listForUser, {
    userId: user?._id,
  });
  const [currentOrg, setCurrentOrg] = useState(user?.properties.organizationId);

  return (
    <Select value={currentOrg} onValueChange={setCurrentOrg}>
      {orgs?.map((org) => (
        <SelectItem key={org._id} value={org._id}>
          {org.name} ({org.properties.plan})
        </SelectItem>
      ))}
    </Select>
  );
}
```

### Step 4.5: Testing

**Test Cases:**

1. **Multi-Tenant Isolation:**

   ```typescript
   // Test: User in Org A cannot see Org B's data
   test("organization data isolation", async () => {
     const orgA = await createOrg("Org A");
     const orgB = await createOrg("Org B");

     const userA = await createUser(orgA, "org_user");
     const postB = await createPost(orgB, "Secret Post");

     // Query from Org A context
     const posts = await queryPosts(orgA);

     expect(posts).not.toContainEqual(postB);
   });
   ```

2. **Authorization:**

   ```typescript
   // Test: Org user cannot create org owner resources
   test("role-based authorization", async () => {
     const org = await createOrg("Test Org");
     const user = await createUser(org, "org_user");

     await expect(
       createOrgSettings(org, user, { allowSignups: false })
     ).rejects.toThrow("Org owner access required");
   });
   ```

3. **Platform Owner Access:**

   ```typescript
   // Test: Platform owner can access all orgs
   test("platform owner can access all organizations", async () => {
     const orgA = await createOrg("Org A");
     const orgB = await createOrg("Org B");

     const platformOwner = await getPlatformOwner();

     const postsA = await queryPosts(orgA, platformOwner);
     const postsB = await queryPosts(orgB, platformOwner);

     expect(postsA).toBeDefined();
     expect(postsB).toBeDefined();
   });
   ```

---

## Phase 5: Communication & Education

### Step 5.1: Create Simple Examples

**For Children (Lemonade Stand):**

````markdown
# Building a Lemonade Stand with ONE Platform

## The 6 Dimensions (Easy Version)

1. **Organization** = Your Lemonade Stand Business

   - You own the stand
   - You decide the rules

2. **People** = You, the Boss!

   - You're the owner
   - You can hire friends to help (users)
   - Customers buy lemonade

3. **Things** = What You Have

   - Lemonade (product)
   - Cups (inventory)
   - Money (tokens)

4. **Connections** = How Things Work Together

   - Customers buy lemonade
   - You own the stand
   - Lemonade is in a cup

5. **Events** = What Happens

   - Customer buys lemonade
   - You make more lemonade
   - You count money at end of day

6. **Knowledge** = What You Learn
   - Sunny days = more sales
   - Sweet lemonade = happy customers
   - AI learns: "make more on sunny days!"

## Building Your First AI Lemonade Stand

```typescript
// 1. Create your organization (lemonade stand)
const myStand = await createOrganization({
  name: "Emma's Lemonade Stand",
  owner: "Emma",
});

// 2. You are a person (the owner!)
const me = await createPerson({
  name: "Emma",
  role: "org_owner",
  organizationId: myStand._id,
});

// 3. Create lemonade (a thing!)
const lemonade = await createThing({
  type: "product",
  name: "Fresh Lemonade",
  organizationId: myStand._id,
  properties: {
    price: 1.0, // $1 per cup
    inventory: 20, // 20 cups ready
  },
});

// 4. Customer buys lemonade (connection!)
const customer = await createPerson({
  name: "Alex",
  role: "customer",
});

await createConnection({
  from: customer._id,
  to: lemonade._id,
  type: "purchased",
  organizationId: myStand._id,
});

// 5. Log the sale (event!)
await createEvent({
  type: "tokens_purchased",
  actor: customer._id,
  target: lemonade._id,
  organizationId: myStand._id,
  metadata: {
    amount: 1.0,
    weather: "sunny",
  },
});

// 6. AI learns (knowledge!)
// The AI notices: sunny days = more sales
// Next sunny day, AI suggests: "Make more lemonade today!"
```
````

**What the AI Learned:**

- Sunny days → more customers
- Sweet lemonade → happier customers (higher ratings)
- After school time (3pm-5pm) → busiest time

**Your AI can now help:**

- "It's going to be sunny tomorrow - prepare 30 cups instead of 20!"
- "Customer reviews say lemonade is too sour - add more sugar"
- "You're running low on lemons - order more before the weekend rush"

This is how the 6 dimensions work together to make your lemonade stand smart! 🍋

````

**For Enterprises (SaaS Platform):**

```markdown
# Building Enterprise SaaS with the 6-Dimension Ontology

## The 6 Dimensions (Enterprise Version)

1. **Organizations** = Multi-Tenant Isolation
   - Each customer company is an organization
   - Perfect data isolation (no cross-org leaks)
   - Independent billing, quotas, customization

2. **People** = Authorization & Governance
   - Platform owner (you) manages infrastructure
   - Org owners manage their companies
   - Org users work within their company
   - Customers consume services

3. **Things** = Domain Entities
   - Users, agents, content, products
   - All scoped to organizations
   - 66 pre-defined types + extensibility

4. **Connections** = Relationships
   - Ownership, membership, permissions
   - Cross-entity relationships
   - Revenue sharing, referrals

5. **Events** = Audit Trail
   - Complete history of who did what when
   - Analytics, compliance, debugging
   - Real-time event streams

6. **Knowledge** = Intelligence Layer
   - RAG for context-aware AI
   - Vector search across all dimensions
   - Per-org knowledge graphs

## Example: Building a CRM SaaS

```typescript
// 1. Customer signs up (creates organization)
const acmeCorp = await createOrganization({
  name: "Acme Corporation",
  plan: "enterprise",
  limits: {
    users: 100,
    storage: 1000, // GB
    apiCalls: 1000000, // per month
    inference: 500000, // LLM calls per month
  },
});

// 2. Org owner gets admin access
const ceo = await createPerson({
  name: "Jane CEO",
  email: "jane@acme.com",
  role: "org_owner",
  organizationId: acmeCorp._id,
});

// 3. Create CRM entities (things)
const salesAgent = await createThing({
  type: "sales_agent",
  name: "Acme Sales AI",
  organizationId: acmeCorp._id,
  properties: {
    systemPrompt: "You are a friendly sales assistant...",
    temperature: 0.7,
  },
});

const lead = await createThing({
  type: "lead",
  name: "John Smith - Enterprise Lead",
  organizationId: acmeCorp._id,
  properties: {
    email: "john@enterprise.com",
    company: "Enterprise Inc",
    budget: 100000,
    status: "qualified",
  },
});

// 4. AI agent follows up with lead (connection)
await createConnection({
  from: salesAgent._id,
  to: lead._id,
  type: "communicated",
  organizationId: acmeCorp._id,
  metadata: {
    protocol: "email",
    subject: "Following up on our conversation",
  },
});

// 5. Log all interactions (events)
await createEvent({
  type: "communication_event",
  actor: salesAgent._id,
  target: lead._id,
  organizationId: acmeCorp._id,
  metadata: {
    protocol: "email",
    messageType: "follow_up",
    sentiment: "positive",
  },
  timestamp: Date.now(),
});

// 6. AI learns from all sales interactions (knowledge)
// RAG system:
// - Chunks all sales emails, call transcripts, notes
// - Creates embeddings for semantic search
// - AI agent queries: "What objections did similar leads have?"
// - Knowledge layer returns relevant context
// - AI crafts personalized response based on historical data

const relevantContext = await queryKnowledge({
  organizationId: acmeCorp._id,
  query: "enterprise software objections pricing",
  k: 10, // top 10 results
});

const aiResponse = await generateResponse({
  context: relevantContext,
  prompt: "Craft a response addressing pricing concerns",
});
````

## Multi-Tenancy Benefits

1. **Data Isolation:**

   - Acme Corp cannot see Enterprise Inc's data
   - All queries automatically scoped to organizationId
   - Zero chance of cross-org data leaks

2. **Independent Scaling:**

   - Each org has separate quotas and limits
   - Per-org billing and usage tracking
   - Can upgrade/downgrade plans independently

3. **Customization:**

   - Each org can customize their AI agents
   - Different branding, features, workflows
   - Frontend customization per org

4. **Platform Revenue:**
   - Org A pays $1000/month → $800 to org owner, $200 to platform
   - Inference costs shared: org pays token costs + platform markup
   - Clear revenue attribution via events

## Security & Compliance

- **GDPR:** Delete all org data with single `organizationId` filter
- **Audit:** Events table provides complete audit trail per org
- **Access Control:** Role-based permissions via people dimension
- **Encryption:** Org-scoped encryption keys for sensitive data

````

### Step 5.2: Update README Files

**Main README Updates:**

```markdown
# ONE Platform - The 6-Dimension Reality-Aware Architecture

Build AI-powered applications that scale from children's lemonade stands to enterprise SaaS platforms serving millions.

## What Makes ONE Different

**6 Dimensions = Complete Reality Model:**

1. **Organizations** - Multi-tenant isolation (who owns what at org level)
2. **People** - Authorization & governance (who can do what)
3. **Things** - Entities (what exists)
4. **Connections** - Relationships (how they relate)
5. **Events** - Actions (what happened)
6. **Knowledge** - Intelligence (what it means)

**Why 6 Dimensions?**

Other platforms create tables for features, pollute schemas with temporary concepts, and end up with hundreds of entities nobody understands.

ONE models reality in six dimensions, and maps everything to them.

Simple enough for children. Powerful enough for enterprises.

## For Children

```typescript
// Your lemonade stand = organization
// You = person (owner)
// Lemonade = thing
// Customer buys it = connection
// Sale happens = event
// AI learns = knowledge
````

## For Enterprises

```typescript
// Multi-tenant SaaS = organizations (perfect isolation)
// Users & roles = people (authorization & governance)
// Domain entities = things (customers, products, agents)
// Business relationships = connections (ownership, permissions)
// Audit trail = events (who did what when)
// AI intelligence = knowledge (RAG, vectors, learning)
```

## Documentation

**Start Here:**

- [6-Dimension Ontology](one/knowledge/ontology.md) - Complete specification
- [Architecture](one/knowledge/architecture.md) - How everything fits together
- [Frontend Guide](one/things/frontend.md) - Building user interfaces
- [Backend Guide](one/things/hono.md) - API and business logic

**Learn by Example:**

- [Children's Examples](one/examples/children/) - Lemonade stands, toy stores
- [Enterprise Examples](one/examples/enterprise/) - CRM, SaaS, marketplaces

**Deep Dives:**

- [Organizations](one/connections/organisation.md) - Multi-tenant architecture
- [People](one/people/people.md) - Authorization & roles
- [Things](one/things/things.md) - 66 entity types
- [Connections](one/connections/connections.md) - 25 relationship types
- [Events](one/events/events.md) - 67 event types
- [Knowledge](one/knowledge/knowledge.md) - RAG & intelligence

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/one-platform/one
cd one

# 2. Install dependencies
bun install

# 3. Set up environment
cp .env.example .env
# Add your Convex URL and other keys

# 4. Run development server
bun run dev

# 5. Build your first app!
# See examples in one/examples/
```

## The Philosophy

**Simplicity is the ultimate sophistication.**

- **6 dimensions** (not 50+ tables)
- Organizations partition the space
- People authorize and govern
- Things, connections, events flow from there
- Knowledge understands it all
- Infinite extensibility without schema changes

**This architecture proves you don't need complexity to build complete AI-native platforms that scale infinitely.**

````

### Step 5.3: Create Migration Guide

**File:** `one/connections/MIGRATION-GUIDE.md`

```markdown
# Migration Guide: 4-Table → 6-Dimension Ontology

## Overview

This guide helps you migrate from the old "4-table ontology" terminology to the new "6-dimension ontology" architecture.

**IMPORTANT:** The database schema has NOT changed. This is primarily a documentation and conceptual upgrade.

## What Changed

### Terminology

**Old:** "4-table ontology" (things, connections, events, tags/knowledge)
**New:** "6-dimension ontology" (organizations, people, things, connections, events, knowledge)

### Conceptual Model

**Old:**
````

Things → Connections → Events → Knowledge

```

**New:**
```

Organizations → People → Things → Connections → Events → Knowledge

````

### Database Schema

**Added:**
- `organizations` table (already existed, now explicit first-class dimension)
- `organizationId` field on all tables (for multi-tenant scoping)
- `actorId` required on events (always references a person/thing)

**People Representation:**
- People are `things` with `type: 'creator'` and `properties.role`
- No separate `people` table needed
- Roles: `platform_owner`, `org_owner`, `org_user`, `customer`

## Migration Checklist

### For Developers

- [ ] Read updated [ontology.md](./ontology.md)
- [ ] Update all queries to include `organizationId` filter
- [ ] Add authorization checks using `requireOrgAccess()`
- [ ] Update frontend components to use org context
- [ ] Test multi-tenant data isolation
- [ ] Update API routes with org scoping

### For AI Agents

- [ ] Update system prompts to reference "6 dimensions" instead of "4 tables"
- [ ] Include organizations and people in feature mapping
- [ ] Generate org-scoped queries by default
- [ ] Include authorization checks in mutations
- [ ] Log events with `actorId` (who did it)

### For Documentation

- [ ] Search and replace "4-table" → "6-dimension" in all docs
- [ ] Update diagrams to show all 6 dimensions
- [ ] Add examples showing org and people dimensions
- [ ] Update README with new architecture

## Code Changes

### Old Query Pattern

```typescript
// Get all blog posts
const posts = await ctx.db
  .query("things")
  .withIndex("by_type", (q) => q.eq("thingType", "blog_post"))
  .collect();
````

### New Query Pattern

```typescript
// Get all blog posts in organization
const posts = await ctx.db
  .query("things")
  .withIndex("by_org_type", (q) =>
    q.eq("organizationId", orgId).eq("thingType", "blog_post")
  )
  .collect();
```

### Authorization Pattern

```typescript
export const createBlogPost = mutation({
  args: {
    orgId: v.id("organizations"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // NEW: Check authorization
    await requireOrgAccess(ctx, args.orgId, "org_user");

    const userId = await getUserId(ctx);

    // NEW: Scope to organization
    const postId = await ctx.db.insert("things", {
      thingType: "blog_post",
      name: args.title,
      organizationId: args.orgId, // NEW
      properties: {},
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // NEW: Log event with actor
    await ctx.db.insert("events", {
      eventType: "content_created",
      actorId: userId, // NEW: Who did it
      thingId: postId,
      organizationId: args.orgId, // NEW
      timestamp: Date.now(),
      metadata: {},
    });

    return postId;
  },
});
```

## Testing

### Data Isolation Test

```typescript
test("organizations have isolated data", async () => {
  const orgA = await createOrg("Org A");
  const orgB = await createOrg("Org B");

  const postA = await createPost(orgA, "Post A");
  const postB = await createPost(orgB, "Post B");

  const postsInA = await queryPosts(orgA);

  expect(postsInA).toContain(postA);
  expect(postsInA).not.toContain(postB);
});
```

### Authorization Test

```typescript
test("org users cannot access other orgs", async () => {
  const orgA = await createOrg("Org A");
  const orgB = await createOrg("Org B");

  const userA = await createUser(orgA, "org_user");

  await expect(queryPosts(orgB, userA)).rejects.toThrow(
    "User not member of organization"
  );
});
```

## Rollback Plan

If issues arise:

1. **Schema:** No changes needed (already compatible)
2. **Queries:** Remove `organizationId` filters temporarily
3. **Authorization:** Disable `requireOrgAccess()` checks temporarily
4. **Revert:** All data intact, just remove org scoping

## Support

Questions? Issues?

- **Docs:** [one/knowledge/ontology.md](./ontology.md)
- **Examples:** [one/examples/](../examples/)
- **Architecture:** [one/knowledge/architecture.md](../knowledge/architecture.md)

````

---

## Phase 6: Validation & Quality Assurance

### Step 6.1: Automated Validation

**Create Validation Script:**

```typescript
// scripts/validate-6-dimension-migration.ts

import fs from 'fs';
import path from 'path';

interface ValidationResult {
  file: string;
  line: number;
  issue: string;
  suggestion: string;
}

const results: ValidationResult[] = [];

// Check for outdated "4-table" references
function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Check for "4-table" or "4 table"
    if (line.match(/4[-\s]table/i)) {
      results.push({
        file: filePath,
        line: index + 1,
        issue: 'Found "4-table" reference',
        suggestion: 'Replace with "6-dimension" or "6 dimension"',
      });
    }

    // Check for old pattern without org context
    if (line.match(/query\("things"\)/) && !line.includes('organizationId')) {
      results.push({
        file: filePath,
        line: index + 1,
        issue: 'Query without organization scope',
        suggestion: 'Add .withIndex("by_org_type", ...) for multi-tenant safety',
      });
    }

    // Check for events without actor
    if (line.match(/insert\("events"/) && !line.includes('actorId')) {
      results.push({
        file: filePath,
        line: index + 1,
        issue: 'Event without actorId',
        suggestion: 'Add actorId field (who performed this action)',
      });
    }
  });
}

// Scan all documentation
const docsPath = path.join(__dirname, '../one');
function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.')) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.md') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      checkFile(fullPath);
    }
  });
}

// Run validation
console.log('🔍 Validating 6-dimension migration...\n');
scanDirectory(docsPath);

// Report results
if (results.length === 0) {
  console.log('✅ No issues found! Migration complete.');
} else {
  console.log(`⚠️  Found ${results.length} issues:\n`);
  results.forEach(result => {
    console.log(`${result.file}:${result.line}`);
    console.log(`  Issue: ${result.issue}`);
    console.log(`  Suggestion: ${result.suggestion}\n`);
  });
}

// Exit with error if issues found
process.exit(results.length === 0 ? 0 : 1);
````

**Run validation:**

```bash
bun run scripts/validate-6-dimension-migration.ts
```

### Step 6.2: Manual Review Checklist

**Documentation Review:**

- [ ] All "4-table" references replaced with "6-dimension"
- [ ] Diagrams updated to show all 6 dimensions
- [ ] Examples include organizations and people
- [ ] README files updated with new terminology
- [ ] Migration guide created and reviewed

**Code Review:**

- [ ] All queries include organization scoping
- [ ] Authorization middleware in place
- [ ] Events include `actorId` field
- [ ] Frontend components use org context
- [ ] Tests cover multi-tenant scenarios

**Quality Checks:**

- [ ] No broken internal links
- [ ] All code examples compile
- [ ] Documentation is consistent across files
- [ ] Examples work for both children and enterprises

---

## Phase 7: Deployment & Rollout

### Step 7.1: Staged Rollout

**Week 1: Documentation**

- Update all documentation files
- Create migration guide
- Update README files
- Run validation script

**Week 2: Examples**

- Create children's examples (lemonade stand)
- Create enterprise examples (CRM SaaS)
- Test all examples
- Record demo videos

**Week 3: Code Migration**

- Add organization scoping to schema
- Update all queries with org context
- Implement authorization middleware
- Add migration script for existing data

**Week 4: Testing**

- Run full test suite
- Test multi-tenant isolation
- Test authorization rules
- Performance testing

**Week 5: Deployment**

- Deploy to staging
- Test with real data
- Deploy to production
- Monitor for issues

### Step 7.2: Communication Plan

**Internal Team:**

- Share migration plan
- Conduct training session
- Update development guidelines
- Create troubleshooting guide

**External Users:**

- Blog post announcing 6-dimension architecture
- Update getting started guides
- Create video tutorials
- Host Q&A session

**AI Agents:**

- Update system prompts
- Retrain on new documentation
- Test code generation quality
- Monitor for errors

---

## Success Metrics

### Quantitative Metrics

1. **Documentation Coverage:**

   - Target: 100% of files updated
   - Measure: Validation script reports 0 issues

2. **Code Quality:**

   - Target: All queries include org scoping
   - Measure: 100% of mutations have authorization checks
   - Measure: 100% of events include actorId

3. **Test Coverage:**

   - Target: Multi-tenant scenarios covered
   - Measure: Data isolation tests pass
   - Measure: Authorization tests pass

4. **Performance:**
   - Target: No performance regression
   - Measure: Query times similar or better
   - Measure: Multi-tenant queries optimized with indexes

### Qualitative Metrics

1. **Clarity:**

   - Developers understand 6 dimensions immediately
   - Children can explain the model
   - AI agents generate correct code

2. **Completeness:**

   - All features map to 6 dimensions
   - No "special cases" or workarounds needed
   - Documentation is comprehensive

3. **Maintainability:**
   - Consistent patterns across all code
   - Easy to add new features
   - AI-friendly architecture

---

## Rollback Plan

If critical issues arise:

### Stage 1: Documentation Rollback

- Revert documentation to "4-table" terminology
- Keep schema changes (they're backward compatible)
- Update: 1 hour

### Stage 2: Query Rollback

- Remove organizationId filters temporarily
- Disable authorization checks
- Add monitoring to detect cross-org queries
- Update: 4 hours

### Stage 3: Full Rollback

- Revert all code changes
- Keep organizations table (data intact)
- Remove org scoping indexes
- Update: 1 day

**Backup Strategy:**

- Full database backup before migration
- Documentation backup in git
- Rollback script tested in staging

---

## Timeline Summary

- **Phase 1:** Search & Analysis - 1 day
- **Phase 2:** Core Documentation Updates - 2 days
- **Phase 3:** Systematic Updates - 3 days
- **Phase 4:** Implementation & Testing - 1 week
- **Phase 5:** Communication & Education - 3 days
- **Phase 6:** Validation & QA - 2 days
- **Phase 7:** Deployment & Rollout - 1 week

**Total Estimated Time:** 3-4 weeks

---

## Next Steps

1. **Review this plan** with team
2. **Get approval** from stakeholders
3. **Create tracking board** with all tasks
4. **Start Phase 1** (search & analysis)
5. **Update this plan** based on findings

---

## Conclusion

This migration transforms ONE Platform from a "4-table ontology" to a complete "6-dimension reality-aware architecture" that:

✅ **Scales from children to enterprises**
✅ **Perfect multi-tenant isolation**
✅ **Clear ownership and governance**
✅ **AI-friendly and future-proof**
✅ **Simple, beautiful, complete**

The 6 dimensions—Organizations, People, Things, Connections, Events, Knowledge—create a complete model of reality that both humans and AI can understand, reason about, and build upon infinitely.

**Let's build the future of AI platforms together.** 🚀

---

**Plan Version:** 1.0.0
**Last Updated:** 2025-10-10
**Next Review:** After Phase 1 completion
**Owner:** Platform Architecture Team
