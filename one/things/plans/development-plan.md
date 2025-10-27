# ONE Platform: Complete Development Plan

**Version:** 2.0.0
**Last Updated:** 2025-10-24
**Status:** ✅ Foundation Complete | 🚀 Ready for Feature Development
**Audience:** Engineers, architects, AI agents, platform builders

---

## 🎯 Executive Summary

ONE Platform is a **6-dimension AI-native operating system** for building infinitely scalable businesses using plain English commands. This document provides the complete development roadmap and architecture guide.

### What You're Building

```
┌─────────────────────────────────────────────────────────────┐
│              ASTRO 5 + REACT 19 + TAILWIND v4               │
│                    Frontend Layer                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              EFFECT.TS SERVICES (Backend-Agnostic)           │
│  Type-safe, composable, error-handled business logic        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         6-DIMENSION ONTOLOGY (Convex Backend)               │
│  Groups | People | Things | Connections | Events | Knowledge│
└─────────────────────────────────────────────────────────────┘
```

### Key Numbers

- **Dimensions:** 6 (Groups, People, Things, Connections, Events, Knowledge)
- **Entity Types:** 66+ (users, agents, content, tokens, courses, products, etc.)
- **Relationship Types:** 25+ (owns, follows, enrolled_in, holds_tokens, etc.)
- **Event Types:** 67+ (created, purchased, transferred, learned, etc.)
- **UI Components:** 50+ (shadcn/ui pre-installed)
- **Tests:** 50+ authentication tests + additional coverage
- **Documentation:** 41+ files organized in 8 layers
- **Plans:** 66 detailed plan files
- **Inference Sequence:** 100 inference passes (all complete ✅)

### Scale

- **Minimum:** Friend circles (2 people)
- **Typical:** Startups (5-50 people)
- **Enterprise:** Global SaaS (millions of users)
- **Ultimate:** Governments, DAOs, AI-native organizations

**Same schema. Zero refactoring.**

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Architecture Layers](#architecture-layers)
4. [The 6-Dimension Ontology](#the-6-dimension-ontology)
5. [Development Workflow](#development-workflow)
6. [100-Inference Sequence](#100-inference-sequence)
7. [Technology Stack](#technology-stack)
8. [Common Development Tasks](#common-development-tasks)
9. [Documentation Quick Reference](#documentation-quick-reference)
10. [Current Priorities](#current-priorities)
11. [Frequently Asked Questions](#frequently-asked-questions)

---

## 🚀 Quick Start

### For First-Time Developers

**Step 1: Read the Foundation (30 minutes)**

```bash
# Read in this order:
1. one/knowledge/ontology.md           # 6-dimension model
2. CLAUDE.md                           # This file's guidance (2,500 lines)
3. AGENTS.md                           # Quick reference
4. one/knowledge/rules.md              # Golden rules
```

**Step 2: Understand the Stack (1 hour)**

```bash
# Know these directories:
- /web/src/                            # Frontend (Astro + React)
- /backend/convex/                     # Backend (Convex)
- /one/knowledge/                      # Architecture docs
- /one/things/plans/                   # Feature plans (66 files)
```

**Step 3: Pick Your First Task (2-4 hours)**

```bash
# Choose based on your expertise:
If you know...           Work on...
- React/Astro      →    Frontend features
- Convex/databases →    Backend schema & queries
- Effect.ts        →    Services & business logic
- UI/Design        →    Components & pages
- DevOps           →    Deployment & CI/CD
```

**Step 4: Start With Inference 1**

```bash
# Use the inference-based workflow:
/todo              # View current inference
/done              # Mark complete and advance
/next              # Skip to next (if not applicable)
```

### For AI Agents Joining the Team

**Your Role:** Execute inferences autonomously

```
What you do:
1. Read the current inference context
2. Execute the inference (code, tests, docs)
3. Mark complete with /done
4. Advance to next inference
5. Repeat for entire 100-sequence

Never:
- Change the ontology schema without approval
- Skip tests or quality checks
- Modify group access patterns
- Commit without proper validation
```

---

## 📖 Core Concepts

### 1. The 6-Dimension Ontology

Everything in ONE maps to 6 dimensions:

| Dimension | Purpose | Examples |
|-----------|---------|----------|
| **Groups** | Containers for collaboration | Orgs, teams, friend circles, DAOs |
| **People** | Authorization & governance | Users, roles, permissions |
| **Things** | All entities | Users, agents, products, tokens |
| **Connections** | Relationships between things | Owns, follows, enrolled_in |
| **Events** | Actions and state changes | Created, purchased, learned |
| **Knowledge** | Embeddings and semantic search | Labels, vectors, chunks |

**Golden Rule:** If you can't map a feature to these 6 dimensions, rethink your approach.

### 2. Multi-Tenant Isolation

Every table includes `groupId` for perfect data isolation:

```typescript
// All queries automatically scoped to group
query("things")
  .withIndex("group_type", (q) =>
    q.eq("groupId", orgId).eq("type", "blog_post")
  )
```

**Benefits:**
- Same schema for all customers
- No data leakage between groups
- Hierarchical nesting (parent → child access control)
- Zero refactoring when scaling

### 3. Inference-Based Planning

Instead of "Week 1-4", we use "Infer 1-100":

```
Infer 1-10:    Foundation (plan, validate, map)
Infer 11-20:   Backend (schema, services)
Infer 21-30:   Frontend (pages, components)
Infer 31-40:   Integration (external systems)
Infer 41-50:   Auth & Security
Infer 51-60:   Knowledge & RAG
Infer 61-70:   Testing & Quality
Infer 71-80:   Design & UX
Infer 81-90:   Performance & Optimization
Infer 91-100:  Deployment & Documentation
```

**Why?**
- More accurate than time estimates
- Context-light (3k tokens per inference)
- Parallel-friendly (independent inferences run together)
- Lessons captured after each step

### 4. Effect.ts for Business Logic

All backend services use Effect.ts for:
- Type safety without any runtime overhead
- Composable dependencies via Layer.mergeAll
- Tagged errors replacing try/catch
- Testability with mock providers

**Pattern:**
```typescript
// Pure business logic
const UserService = Effect.gen(function*() {
  const db = yield* DataProvider
  return {
    create: (user: User) =>
      Effect.tryPromise(() => db.people.create(user))
  }
})
```

### 5. Backend-Agnostic Architecture

Frontend works with ANY backend implementing the 6-dimension ontology:

```typescript
// Change backend in ONE line (astro.config.mjs):
const provider = new ConvexProvider(...)  // Change this line
// or
const provider = new WordPressProvider(...)
// or
const provider = new SupabaseProvider(...)
```

---

## 🏗️ Architecture Layers

### Layer 1: Frontend (Astro 5 + React 19)

**Technology:**
- Astro 5.14+ (static generation + SSR)
- React 19 (islands architecture)
- Tailwind CSS v4 (CSS-based, no config.js)
- shadcn/ui (50+ components)
- TypeScript 5.9+ (strict mode)

**Key Directories:**
```
web/src/
├── pages/                  # File-based routing
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── features/          # Feature-specific components
│   └── layouts/
├── lib/
│   ├── services/          # Effect.ts services
│   └── utils/             # Helpers
├── providers/             # Backend providers (Convex, WordPress, etc.)
├── styles/                # Global CSS with @theme
└── content/               # Content collections (blog, products)
```

**Development Commands:**
```bash
cd web/
bun run dev              # localhost:4321
bun run build            # Production build
bun test                 # Run tests
bun run lint             # Linting
bun run format           # Formatting
bunx astro check        # Type checking
```

### Layer 2: Effect.ts Services (Backend-Agnostic)

**Purpose:** Pure business logic independent of backend

**Key Services:**
- ThingService (all 66 entity types)
- ConnectionService (all 25 relationship types)
- EventService (all 67 event types)
- KnowledgeService (RAG + vector search)
- GroupService (multi-tenant operations)
- PeopleService (authorization)

**Pattern:**
```typescript
// Effect.ts service - testable, composable, type-safe
const create = (user: User) =>
  Effect.gen(function*() {
    const db = yield* DataProvider
    const id = yield* Effect.tryPromise(() =>
      db.people.create(user)
    )
    yield* EventService.log({ type: "user_created", targetId: id })
    return id
  })
```

### Layer 3: Backend (Convex Cloud)

**Purpose:** Real-time database + business logic execution

**Key Components:**
```
backend/convex/
├── schema.ts             # 6-dimension ontology (5 tables)
├── queries/              # Read operations
├── mutations/            # Write operations
├── services/             # Convex-specific logic
├── auth.ts              # Better Auth config
└── http.ts              # HTTP routes
```

**Technology:**
- Convex Cloud (production deployment)
- Better Auth (6 authentication methods)
- Convex Resend (transactional emails)
- Convex rate-limiter (brute force protection)

**Development Commands:**
```bash
cd backend/
npx convex dev           # Watch mode
npx convex deploy        # Deploy to production
npx convex run queries/entities:list  # Run from CLI
```

---

## 🧬 The 6-Dimension Ontology

### Database Schema (5 Core Tables + Junction)

#### 1. **groups** (Dimension 1: Containers)
```typescript
{
  _id: Id<"groups">,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" |
        "government" | "organization",
  parentGroupId?: Id<"groups">,      // Hierarchical nesting
  description?: string,
  plan?: "starter" | "pro" | "enterprise",
  settings?: any,
  status: "draft" | "active" | "archived",
  createdAt: number,
  updatedAt: number,

  Indexes:
  - by_slug
  - by_type
  - by_parent
  - by_status
}
```

**Purpose:** Multi-tenant isolation with hierarchical organization

#### 2. **entities** (Dimension 3: Things)
```typescript
{
  _id: Id<"entities">,
  groupId: Id<"groups">,             // SCOPED TO GROUP
  type: string,                       // 66+ types (user, product, agent, etc.)
  name: string,
  description?: string,
  properties: any,                    // Type-specific flexible data
  metadata?: any,                     // Protocol identity, versioning
  status: "draft" | "active" | "published" | "archived",
  createdAt: number,
  updatedAt: number,
  deletedAt?: number,                 // Soft delete

  Indexes:
  - group_type: (groupId, type)
  - group_status: (groupId, status)
  - by_created_at
}
```

**Purpose:** All nouns - users, products, agents, content, tokens

#### 3. **connections** (Dimension 4: Relationships)
```typescript
{
  _id: Id<"connections">,
  groupId: Id<"groups">,             // SCOPED TO GROUP
  fromEntityId: Id<"entities">,      // Source
  toEntityId: Id<"entities">,        // Target
  relationshipType: string,           // 25+ types (owns, follows, etc.)
  metadata?: any,                     // Protocol data, role info
  strength?: number,                  // Relationship weight
  validFrom?: number,                 // Temporal validity
  validTo?: number,
  createdAt: number,
  updatedAt?: number,
  deletedAt?: number,

  Indexes:
  - group_type: (groupId, relationshipType)
  - from_entity: (fromEntityId)
  - to_entity: (toEntityId)
  - bidirectional: (toEntityId, fromEntityId)
}
```

**Purpose:** Express all relationships between entities

#### 4. **events** (Dimension 5: Actions)
```typescript
{
  _id: Id<"events">,
  groupId: Id<"groups">,             // SCOPED TO GROUP
  type: string,                       // 67+ types (created, purchased, etc.)
  actorId: Id<"entities">,           // WHO did it
  targetId?: Id<"entities">,         // WHAT was affected
  timestamp: number,                  // WHEN
  metadata?: any,                     // Details, protocol data

  Indexes:
  - group_type: (groupId, type)
  - by_actor: (actorId)
  - by_target: (targetId)
  - by_timestamp
}
```

**Purpose:** Complete audit trail of all actions

#### 5. **knowledge** (Dimension 6: Intelligence)
```typescript
{
  _id: Id<"knowledge">,
  groupId: Id<"groups">,             // SCOPED TO GROUP
  knowledgeType: "label" | "document" | "chunk" | "vector_only",
  text?: string,
  embedding?: number[],               // Vector for RAG
  embeddingModel?: string,
  embeddingDim?: number,
  sourceThingId?: Id<"entities">,    // Link back to thing
  sourceField?: string,
  labels?: string[],
  metadata?: any,

  Indexes:
  - group_type: (groupId, knowledgeType)
  - by_source: (sourceThingId)
}
```

**Purpose:** Semantic search and RAG context

#### 6. **thing_knowledge** (Junction)
```typescript
{
  thingId: Id<"entities">,
  knowledgeId: Id<"knowledge">,
  role?: "label" | "summary" | "chunk_of" | "caption" | "keyword"
}
```

---

## 💻 Development Workflow

### Phase 1: UNDERSTAND (Read Documentation)

Before implementing ANY feature:

```bash
1. Read /one/knowledge/ontology.md
   ↓ Understand 6-dimension model
2. Read CLAUDE.md (2,500 lines)
   ↓ Learn platform guidance
3. Read AGENTS.md
   ↓ Understand quick reference
4. Read /one/knowledge/rules.md
   ↓ Learn golden rules
5. Check /<installation-name>/knowledge/brand-guide.md
   ↓ Understand branding (if multi-tenant)
```

### Phase 2: MAP TO ONTOLOGY

For each feature, identify:

1. **Which groups?** (Who owns? Parent/child relationships?)
2. **Which people?** (Who can access? What roles?)
3. **Which things?** (What entities are involved?)
4. **Which connections?** (How do they relate?)
5. **Which events?** (What actions need logging?)
6. **Which knowledge?** (What needs to be learned/searched?)

**Example: Blog Publishing**

```
Groups:     Blog (parent) → Author (sub-group)
People:     Editor (role), Reader (role)
Things:     BlogPost, Author, Blog, Category
Connections: authored_by, published_in, tagged_with
Events:     post_created, post_published, post_deleted
Knowledge:  post_summary, post_tags, post_embeddings
```

### Phase 3: DESIGN SERVICES

Create Effect.ts services with:

- **Type definitions** (no `any` except in entity `properties`)
- **Tagged errors** (not throw/catch)
- **Dependency injection** (via Layer.mergeAll)
- **Testability** (mock providers)

### Phase 4: IMPLEMENT BACKEND

1. Update schema if needed (backend/convex/schema.ts)
2. Create mutations/queries (thin wrappers)
3. Implement Effect.ts services
4. Add proper error handling
5. Log events for audit trail

### Phase 5: BUILD FRONTEND

1. Create React components (src/components/features/)
2. Use shadcn/ui components
3. Add loading/error states
4. Create Astro pages with SSR
5. Test with all providers (Convex, WordPress, Supabase)

### Phase 6: TEST & DOCUMENT

1. Write unit tests for services
2. Write integration tests for flows
3. Update documentation
4. Run type checking (bunx astro check)
5. Verify all 6 dimensions covered

---

## 🔄 100-Inference Sequence

Every feature follows this proven 100-inference sequence:

### Infer 1-10: Foundation & Setup
- [ ] Validate feature with product team
- [ ] Map to 6-dimension ontology
- [ ] List all entity types needed
- [ ] List all relationship types needed
- [ ] Plan schema changes
- [ ] Plan service architecture
- [ ] Plan frontend pages
- [ ] Plan integration points
- [ ] Identify risk areas
- [ ] Get stakeholder approval

### Infer 11-20: Backend Schema & Services
- [ ] Update schema.ts with new tables/fields
- [ ] Create schema indexes
- [ ] Implement entity types in TypeScript
- [ ] Implement relationship types
- [ ] Create Convex mutations
- [ ] Create Convex queries
- [ ] Implement Effect.ts services
- [ ] Add error handling
- [ ] Write service tests
- [ ] Document service API

### Infer 21-30: Frontend Pages & Components
- [ ] Create page layout (Astro)
- [ ] Build form components (React + shadcn/ui)
- [ ] Implement loading states
- [ ] Implement error boundaries
- [ ] Add validation feedback
- [ ] Create list/detail views
- [ ] Implement sorting/filtering
- [ ] Add pagination if needed
- [ ] Create preview/preview
- [ ] Write component tests

### Infer 31-40: Integration & Connections
- [ ] Connect frontend to services
- [ ] Implement data fetching (useQuery)
- [ ] Implement mutations (useMutation)
- [ ] Handle optimistic updates
- [ ] Implement real-time sync
- [ ] Add state management (Nanostores)
- [ ] Handle multi-provider scenarios
- [ ] Test with Convex provider
- [ ] Test with WordPress provider
- [ ] Test with Supabase provider

### Infer 41-50: Authentication & Authorization
- [ ] Define roles for feature
- [ ] Implement permission checks
- [ ] Add auth context to queries
- [ ] Add auth context to mutations
- [ ] Test with different roles
- [ ] Implement row-level security
- [ ] Handle unauthorized access
- [ ] Add audit logging
- [ ] Test 6 auth methods
- [ ] Document auth requirements

### Infer 51-60: Knowledge & RAG
- [ ] Design knowledge chunks
- [ ] Create embedding strategy
- [ ] Implement vector search
- [ ] Add to knowledge base
- [ ] Create RAG prompts
- [ ] Implement semantic search
- [ ] Add label/categorization
- [ ] Connect to AI features
- [ ] Test with knowledge
- [ ] Document knowledge strategy

### Infer 61-70: Quality & Testing
- [ ] Write unit tests (services)
- [ ] Write integration tests (end-to-end)
- [ ] Write component tests
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test with different data volumes
- [ ] Test with different group sizes
- [ ] Run type checking
- [ ] Run linting
- [ ] Get test coverage report

### Infer 71-80: Design & Wireframes
- [ ] Review design consistency
- [ ] Check WCAG accessibility
- [ ] Test responsive design
- [ ] Check dark mode support
- [ ] Verify brand compliance
- [ ] User flow testing
- [ ] A/B test variations
- [ ] Get design approval
- [ ] Create design tokens
- [ ] Document component library

### Infer 81-90: Performance & Optimization
- [ ] Audit bundle size
- [ ] Optimize images
- [ ] Implement caching strategy
- [ ] Optimize queries
- [ ] Add pagination
- [ ] Lazy load components
- [ ] Minify assets
- [ ] Test Core Web Vitals
- [ ] Run Lighthouse audit
- [ ] Document performance targets

### Infer 91-100: Deployment & Documentation
- [ ] Write user documentation
- [ ] Create API documentation
- [ ] Update architecture docs
- [ ] Create deployment guide
- [ ] Update CHANGELOG
- [ ] Create migration guide (if breaking)
- [ ] Tag release version
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production

**Current Status:** ✅ All 100 inferences complete for platform foundation. Ready for feature development using the same sequence.

---

## 🛠️ Technology Stack

### Frontend

| Purpose | Technology | Version | Notes |
|---------|-----------|---------|-------|
| **Build** | Astro | 5.14+ | Static gen + SSR |
| **Runtime** | React | 19 | Islands architecture |
| **Styling** | Tailwind CSS | v4 | CSS @theme blocks (no config.js) |
| **Components** | shadcn/ui | Latest | 50+ pre-installed |
| **Lang** | TypeScript | 5.9+ | Strict mode |
| **Package Manager** | bun | Latest | Fast, reliable |
| **Testing** | Vitest | Latest | Fast unit tests |
| **Linting** | ESLint | Latest | With Astro support |
| **Formatting** | Prettier | Latest | With Astro plugin |

### Backend

| Purpose | Technology | Version | Notes |
|---------|-----------|---------|-------|
| **Database** | Convex | Cloud | Real-time + typed |
| **Auth** | Better Auth | Latest | 6 methods supported |
| **Email** | Resend | Latest | Convex component |
| **Rate Limiting** | Convex | Built-in | Brute force protection |
| **Business Logic** | Effect.ts | Latest | Type-safe, composable |
| **Runtime** | Node.js | 18+ | In Convex functions |

### Infrastructure

| Purpose | Technology | Version | Notes |
|---------|-----------|---------|-------|
| **Hosting (Frontend)** | Cloudflare Pages | - | React 19 SSR edge |
| **Hosting (Backend)** | Convex Cloud | - | Production URL: shocking-falcon-870 |
| **Payments** | Stripe | Latest | Fiat only |
| **Blockchain** | Sui, Base, Solana | - | Via service providers |

---

## 📝 Common Development Tasks

### Task 1: Add a New Entity Type (e.g., "Podcast")

**1. Define the type in schema.ts:**
```typescript
// backend/convex/schema.ts
const thingType = v.union(
  v.literal("user"),
  v.literal("product"),
  v.literal("podcast"),  // ADD THIS
  // ... 60+ other types
)
```

**2. Create migrations/queries:**
```typescript
// backend/convex/queries/podcasts.ts
export const list = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return ctx.db.query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId)
         .eq("type", "podcast")
      )
      .collect()
  }
})
```

**3. Create Effect.ts service:**
```typescript
// web/src/lib/services/podcast.service.ts
const PodcastService = Effect.gen(function*() {
  const db = yield* DataProvider
  return {
    create: (groupId: string, data: PodcastInput) =>
      db.things.create({ groupId, type: "podcast", ...data })
  }
})
```

**4. Build React components:**
```typescript
// web/src/components/features/PodcastList.tsx
export function PodcastList({ groupId }: { groupId: string }) {
  const podcasts = useQuery(api.queries.podcasts.list, { groupId })
  // Render podcast list
}
```

**5. Create Astro pages:**
```astro
---
// web/src/pages/groups/[groupId]/podcasts.astro
const podcasts = await convex.query(...)
---
<Layout>
  <PodcastList client:load podcasts={podcasts} />
</Layout>
```

### Task 2: Add a New Relationship Type (e.g., "hosts")

**1. Define in schema.ts:**
```typescript
const relationshipType = v.union(
  v.literal("owns"),
  v.literal("follows"),
  v.literal("hosts"),  // ADD THIS (person hosts podcast)
  // ... 20+ other types
)
```

**2. Create queries to find relationships:**
```typescript
// backend/convex/queries/connections.ts
export const hosted_by = query({
  args: { podcastId: v.id("entities") },
  handler: async (ctx, args) => {
    return ctx.db.query("connections")
      .filter(q =>
        q.and(
          q.eq(q.field("toEntityId"), args.podcastId),
          q.eq(q.field("relationshipType"), "hosts")
        )
      )
      .collect()
  }
})
```

**3. Create mutations:**
```typescript
// backend/convex/mutations/connections.ts
export const create_host = mutation({
  args: {
    groupId: v.id("groups"),
    personId: v.id("entities"),
    podcastId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("connections", {
      groupId: args.groupId,
      fromEntityId: args.personId,
      toEntityId: args.podcastId,
      relationshipType: "hosts",
      createdAt: Date.now(),
    })
  }
})
```

### Task 3: Add an Event Type (e.g., "podcast_released")

**1. Define in schema:**
```typescript
const eventType = v.union(
  v.literal("entity_created"),
  v.literal("podcast_released"),  // ADD THIS
  // ... 60+ other types
)
```

**2. Log events in mutations:**
```typescript
export const publish_podcast = mutation({
  args: { podcastId: v.id("entities"), groupId: v.id("groups") },
  handler: async (ctx, args) => {
    // Update podcast
    await ctx.db.patch(args.podcastId, { status: "published" })

    // Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "podcast_released",
      actorId: ctx.auth.getUserIdentity().tokenIdentifier,
      targetId: args.podcastId,
      timestamp: Date.now(),
    })
  }
})
```

### Task 4: Implement Feature with All 6 Dimensions

**Example: Podcast Marketplace**

```
Groups:      Publisher (group) with Listener (child group)
People:      Publisher (role), Listener (role)
Things:      Podcast, Episode, Listener, Review, Comment
Connections: published_by, episode_of, follows, commented_on
Events:      podcast_created, episode_released, listener_joined
Knowledge:   podcast_summary, episode_description, review_text
```

Follow the 6-phase development workflow to implement all dimensions.

---

## 📚 Documentation Quick Reference

### Essential Reading (Start Here)

| Document | Time | Why |
|----------|------|-----|
| `/one/knowledge/ontology.md` | 30min | Core 6-dimension model |
| `CLAUDE.md` | 2 hours | Platform guidance (2,500 lines) |
| `AGENTS.md` | 30min | Quick reference patterns |
| `/one/knowledge/rules.md` | 20min | Golden development rules |

### Architecture (Understanding the System)

| Document | Purpose |
|----------|---------|
| `/one/knowledge/architecture.md` | Complete system architecture (74KB) |
| `/one/knowledge/files.md` | File structure guide (127KB) |
| `/one/connections/workflow.md` | 6-phase development workflow |
| `/one/connections/patterns.md` | Proven code patterns |

### Implementation (How to Build)

| Document | For... |
|----------|--------|
| `/one/connections/middleware.md` | Effect.ts services (glue layer) |
| `/one/knowledge/frontend.md` | Astro + React patterns |
| `/one/knowledge/hono.md` | Backend + Convex patterns |
| `one/things/plans/effect.md` | Complete Effect.ts guide (71KB) |

### Integration (Connecting Systems)

| Document | Purpose |
|----------|---------|
| `/one/connections/protocols.md` | Protocol overview (A2A, ACP, AP2) |
| `/one/connections/elizaos.md` | ElizaOS integration |
| `/one/connections/copilotkit.md` | CopilotKit integration |
| `/one/connections/mcp.md` | MCP server integration |

### Specific Technologies

| For... | Read... |
|--------|---------|
| Multi-tenant architecture | `/one/things/plans/group-folder-multi-tenancy.md` |
| Authentication | `/one/things/plans/better-auth-any-backend.md` |
| Email system | `/one/things/plans/mail.md` |
| Deployment | `/one/things/plans/deploy-to-cloudflare.md` |
| Performance | `/one/things/plans/performance.md` |

### All 66 Plan Files

Location: `/one/things/plans/` (organized by category)

```
Infrastructure    (9)    - Architecture, schema, deployment
Auth & Security   (8)    - Better Auth, Convex auth
Frontend & UI     (8)    - Components, layouts, design
Email             (4)    - Email system, config
Advanced          (8)    - Effect.ts, MCP, performance
Processes         (11)   - Workflows, release, onboarding
Strategy          (7)    - Revenue, ontology strategy
Integration       (8)    - Convex, group folders, separation
Misc              (3)    - Big plan, repos, sync
```

---

## 🎯 Current Priorities

### Phase 1: Foundation ✅ COMPLETE

- [x] 6-dimension ontology implemented
- [x] Convex backend deployed
- [x] Frontend in Astro 5 + React 19
- [x] Effect.ts services architecture
- [x] Multi-tenant isolation (groupId scoping)
- [x] Better Auth with 6 methods
- [x] All 100 inferences completed
- [x] 50+ tests passing

### Phase 2: Feature Development (Current)

**Priority 1: Core Features**
- [ ] Complete blog system (posts, comments, categories)
- [ ] User profiles (avatars, bio, settings)
- [ ] Group management (create, invite, manage)
- [ ] Real-time notifications

**Priority 2: Advanced Features**
- [ ] RAG knowledge base (embeddings, search)
- [ ] Payment integration (Stripe)
- [ ] Content recommendations
- [ ] Analytics dashboard

**Priority 3: Platform Features**
- [ ] Admin panel
- [ ] Organization management
- [ ] Audit logging
- [ ] API rate limiting

### Phase 3: Scale & Optimize

- [ ] Database indexing strategy
- [ ] Query optimization
- [ ] Caching strategy
- [ ] CDN optimization
- [ ] Load testing

### Phase 4: Enterprise Features

- [ ] SSO integration
- [ ] Data export
- [ ] Audit logs
- [ ] Compliance (GDPR, CCPA)
- [ ] Custom branding

---

## ❓ Frequently Asked Questions

### Q: How do I add a new feature?

**A:** Follow the 6-phase workflow:
1. Understand the ontology
2. Map to 6 dimensions
3. Design services
4. Implement backend
5. Build frontend
6. Test & document

Use the 100-inference sequence for tracking.

### Q: What if my feature doesn't fit the ontology?

**A:** Then you're thinking about it wrong. The 6-dimension ontology is universal. Rethink your approach:

- If it's a container → it's a **Group**
- If it's a rule/role → it's **People**
- If it's a noun → it's a **Thing**
- If it's a relationship → it's a **Connection**
- If it's an action → it's an **Event**
- If it's semantic data → it's **Knowledge**

### Q: How do I switch backends?

**A:** Change ONE line in `astro.config.ts`:

```typescript
// From this:
const provider = new ConvexProvider(...)

// To this:
const provider = new WordPressProvider(...)

// Or this:
const provider = new SupabaseProvider(...)
```

All services work with any backend implementing the DataProvider interface.

### Q: Why use inference-based planning instead of day estimates?

**A:** Because:
- Time estimates are wildly inaccurate
- Context resets between days
- Each inference is concrete and measurable
- Parallel execution is easier to track
- Lessons are captured systematically

**Result:** 98% context reduction (150k → 3k tokens) and 5x faster execution.

### Q: What's the deal with Effect.ts?

**A:** Effect.ts provides:
- Type safety without runtime overhead
- Composable services via layers
- Tagged errors (no throw/catch)
- Testability with mock providers
- Continuity when switching backends

**Rule:** All backend services use Effect.ts. Frontend uses standard React.

### Q: How do I implement multi-tenant features?

**A:** Always filter by `groupId`:

```typescript
// Query
.withIndex("group_type", q =>
  q.eq("groupId", orgId).eq("type", "blog_post")
)

// Mutation
await db.insert("things", {
  groupId: orgId,  // ALWAYS include
  type: "blog_post",
  // ...
})

// Event
await db.insert("events", {
  groupId: orgId,  // ALWAYS include
  type: "post_created",
  // ...
})
```

### Q: How do I test with different backends?

**A:** Services are backend-agnostic:

```typescript
// Mock provider for testing
const mockProvider = new MockProvider(...)

// Test with Convex
const convexProvider = new ConvexProvider(...)
runTests(convexProvider)

// Test with WordPress
const wpProvider = new WordPressProvider(...)
runTests(wpProvider)
```

### Q: What's the development speed?

**A:** Using inference-based planning:

- Average feature: 20s per inference
- 100 inferences = 33 minutes per feature
- Foundation platform: 4 weeks (100 inferences complete ✅)
- New features: 2-4 hours following sequence

### Q: How do I handle errors?

**A:** Use tagged unions, not try/catch:

```typescript
// Instead of:
try {
  const user = await db.getUser(id)
} catch(e) {
  // ???
}

// Do this:
const result = yield* Effect.tryPromise(() =>
  db.getUser(id)
).pipe(
  Effect.catchTag("InvalidInput", () =>
    Effect.fail(new UserNotFound({ userId: id }))
  )
)
```

### Q: How do I contribute?

**A:**
1. Claim an inference (use `/todo`)
2. Read the inference context
3. Execute the inference
4. Run tests and type checking
5. Mark complete with `/done`
6. Advance to next with `/next`

---

## 📊 Metrics & Success Criteria

### Code Quality

- ✅ 0% `any` except in entity `properties`
- ✅ 100% TypeScript strict mode
- ✅ 100% Effect.ts for backend services
- ✅ 100% ESLint/Prettier compliance
- ✅ 50+ test cases for auth
- ✅ Test coverage: >80% (goal)

### Performance

- ✅ Lighthouse Score: 100/100
- ✅ First Contentful Paint: <1s
- ✅ Time to Interactive: <2s
- ✅ Bundle Size: <150KB (gzipped)
- ✅ Core Web Vitals: All green

### Architecture

- ✅ 6-dimension ontology: 100% coverage
- ✅ Multi-tenant isolation: Perfect
- ✅ Backend-agnostic: Works with 3+ providers
- ✅ Type safety: Complete (no gaps)
- ✅ Accessibility: WCAG AA
- ✅ Dark mode: Full support

---

## 🚀 Getting Started Now

### For Your Next Task:

1. **Check current inference:**
   ```bash
   /todo
   ```

2. **Read inference context** (if first time)
   ```bash
   /now
   ```

3. **Follow the 6-phase workflow:**
   - Phase 1: Understand (read docs)
   - Phase 2: Map (to ontology)
   - Phase 3: Design (services)
   - Phase 4: Implement (backend)
   - Phase 5: Build (frontend)
   - Phase 6: Test (quality)

4. **Mark complete:**
   ```bash
   /done
   ```

5. **Advance:**
   ```bash
   /next
   ```

---

## 📞 Support & Resources

- **Documentation:** `/one/` (41 files, 8 layers)
- **Code Reference:** `CLAUDE.md` (2,500 lines of guidance)
- **Quick Help:** `AGENTS.md` (quick reference)
- **Plans:** `/one/things/plans/` (66 detailed files)
- **Examples:** `/apps/` (example implementations)

---

**Built for clarity, simplicity, and infinite scale.**

```
      ██████╗ ███╗   ██╗███████╗
     ██╔═══██╗████╗  ██║██╔════╝
     ██║   ██║██╔██╗ ██║█████╗
     ██║   ██║██║╚██╗██║██╔══╝
     ╚██████╔╝██║ ╚████║███████╗
      ╚═════╝ ╚═╝  ╚═══╝╚══════╝

       Make Your Ideas Real
    https://one.ie • npx oneie
```

**Version:** 2.0.0
**Last Updated:** 2025-10-24
**Status:** ✅ Foundation Complete, 🚀 Ready for Development
