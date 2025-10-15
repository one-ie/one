# Frontend-Backend Separation Plan

## Executive Summary

**Goal:** Transform the current tightly-coupled architecture into a fully headless, **backend-agnostic** architecture where:

- **Frontend:** Pure Astro/React UI with DataProvider interface (no backend dependency)
- **Backend:** ANY backend that implements the 6-dimension ontology (Convex, WordPress, Notion, Supabase, etc.)
- **Connection:** DataProvider interface - swap backends by changing ONE line

**Current State:**

- ✅ Frontend is **working** and connected to Convex backend
- ✅ Auth is functional with tests in `frontend/tests/auth/*`
- ✅ Direct Convex integration (using `useQuery`, `useMutation`, Convex hooks)
- ⚠️ Tightly coupled to Convex - can't swap to WordPress/Notion/Supabase

**Target State:**

- Frontend uses DataProvider interface
- Backend is pluggable - organizations can use Convex, their existing WordPress site, Notion databases, or any other backend
- Existing auth tests continue to pass
- All current functionality preserved while adding flexibility

---

## Important Context

**This is NOT a bug fix - this is a strategic enhancement.**

✅ **Current System Works:**

- Frontend successfully talks to Convex backend
- Auth is functional with passing tests
- All features operational
- No critical issues requiring immediate changes

⚠️ **Why Separate Now:**

- Add backend flexibility (support WordPress, Notion, Shopify, etc.)
- Enable multi-backend federation (auth in Convex, blog in WordPress, products in Shopify)
- Allow organizations to use existing infrastructure
- Remove Convex lock-in

**Migration Approach:**

- Zero downtime - wrap existing working functionality
- Preserve all existing tests (especially auth tests)
- Gradual page-by-page migration
- Can rollback at any phase
- No data migration required

**Priority:** Medium (strategic, not urgent)

---

## Table of Contents

1. [Architecture Comparison](#architecture-comparison)
2. [Benefits of Separation](#benefits-of-separation)
3. [Migration Strategy](#migration-strategy)
4. [API Key Authentication](#api-key-authentication)
5. [File Structure Changes](#file-structure-changes)
6. [Implementation Steps](#implementation-steps)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Changes](#deployment-changes)

---

## Architecture Comparison

### Current Architecture (Working, but Coupled)

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Astro + React)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages & Components                              │  │
│  │  ├─ import { useQuery } from 'convex/react'      │  │
│  │  ├─ import { api } from 'convex/_generated/api'  │  │
│  │  └─ const data = useQuery(api.things.get)       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  frontend/convex/* (schema, mutations, queries)        │
│  ↓ Direct WebSocket Connection (WORKING)               │
│                                                         │
│  frontend/tests/auth/* (Auth tests passing)            │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   CONVEX BACKEND      │
        │  (Real-time DB)       │
        │  6-Dimension Ontology │
        └───────────────────────┘
```

**Status:** ✅ Working - Auth functional, tests passing

**Limitations (Not Bugs):**

- ⚠️ Frontend tightly coupled to Convex (works, but inflexible)
- ⚠️ Can't swap backend without rewriting frontend
- ⚠️ Organizations must use Convex (can't use existing WordPress/Notion)
- ⚠️ Hard to add mobile/desktop apps without Convex SDK
- ⚠️ No multi-backend support (can't federate data from Shopify/WordPress)

---

### Target Architecture (Backend-Agnostic with 6-Dimension Ontology)

```
┌──────────────────────────────────────────────────────────┐
│                 FRONTEND (Backend-Agnostic)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Astro Pages + React Components                    │ │
│  │  - Renders UI from data                            │ │
│  │  - Calls DataProvider methods                      │ │
│  │  - NO backend-specific code                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Effect.ts Services (Backend-Agnostic)             │ │
│  │  - ThingService                                    │ │
│  │  - ConnectionService                               │ │
│  │  - Uses DataProvider interface                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  DataProvider Interface (Universal API)            │ │
│  │  organizations: { get, list, update }              │ │
│  │  people: { get, list, create, update }             │ │
│  │  things: { get, list, create, update, delete }     │ │
│  │  connections: { create, getRelated, getCount }     │ │
│  │  events: { log, query }                            │ │
│  │  knowledge: { embed, search }                      │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                            │
                            ↓ Provider Implementation
┌──────────────────────────────────────────────────────────┐
│        BACKEND PROVIDERS (Choose One - ONE Line!)        │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Option 1: ConvexProvider                   │       │
│  │  → Convex backend (real-time, serverless)   │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Option 2: WordPressProvider                │       │
│  │  → WordPress + WooCommerce (existing CMS)    │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Option 3: NotionProvider                   │       │
│  │  → Notion databases as backend              │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Option 4: SupabaseProvider                 │       │
│  │  → PostgreSQL + real-time (pgvector)        │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │  Option 5: CustomProvider                   │       │
│  │  → Your own API/database                    │       │
│  └─────────────────────────────────────────────┘       │
│                                                          │
│  All implement the same DataProvider interface          │
└──────────────────────────────────────────────────────────┘
                            │
                            ↓ Backend-Specific Implementation
┌──────────────────────────────────────────────────────────┐
│        ACTUAL BACKENDS (Examples)                        │
│                                                          │
│  Convex:                                                 │
│    6 tables → organizations, people, things,             │
│               connections, events, knowledge             │
│                                                          │
│  WordPress:                                              │
│    wp_posts, wp_users, wp_postmeta, wp_terms, etc.      │
│                                                          │
│  Notion:                                                 │
│    Databases, Pages, Relations                           │
│                                                          │
│  Supabase:                                               │
│    PostgreSQL tables with pgvector for knowledge         │
│                                                          │
│  Custom:                                                 │
│    Your own database schema                              │
└──────────────────────────────────────────────────────────┘
```

**Benefits:**

- ✅ **Backend-Agnostic:** Change backend by editing ONE line in config
- ✅ **Multi-Backend Support:** Organizations can use existing infrastructure (WordPress, Notion, etc.)
- ✅ **No Lock-In:** Not tied to Convex, any backend works
- ✅ **Progressive Migration:** Keep existing WordPress site, add ONE frontend gradually
- ✅ **Frontend Independence:** Rebuild UI without touching backend
- ✅ **6-Dimension Ontology:** Universal data model works with any backend
- ✅ **Effect.ts Services:** Type-safe, composable, testable operations
- ✅ **Multi-Platform:** Same backend serves web, mobile, desktop, CLI
- ✅ **Developer Choice:** Use the best backend for your organization's needs

---

## Understanding the 6-Dimension Ontology

**The ONE ontology models reality in six core dimensions:**

```
┌──────────────────────────────────────────────────────┐
│  1. ORGANIZATIONS → Who owns this space?             │
│     Multi-tenant isolation, perfect data boundaries  │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  2. PEOPLE → Who can do what?                        │
│     Authorization, governance, human intent          │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  3. THINGS → What exists?                            │
│     Domain entities (66 types)                       │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  4. CONNECTIONS → How do things relate?              │
│     Relationships (25 types)                         │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  5. EVENTS → What happened?                          │
│     Audit trail, complete history (67 types)         │
└──────────────────────────────────────────────────────┘
                        ↓
┌──────────────────────────────────────────────────────┐
│  6. KNOWLEDGE → What does it mean?                   │
│     AI intelligence, embeddings, RAG                 │
└──────────────────────────────────────────────────────┘
```

**Key Principle:** Every feature maps to these 6 dimensions. If you can't map it, you're thinking about it wrong.

### Example: User Creates a Course

**Organizations (Dimension 1):**

```typescript
organizationId: "fitnesspro_123"; // All operations scoped here
```

**People (Dimension 2):**

```typescript
// Separate people table (NOT things!)
{
  _id: Id<'people'>,
  email: "sarah@fitnesspro.com",
  role: "org_owner",              // Authorization level
  organizationId: "fitnesspro_123"
}
```

**Things (Dimension 3):**

```typescript
// Course is a thing
{
  _id: Id<'things'>,
  thingType: "course",
  name: "Fitness Fundamentals",
  organizationId: "fitnesspro_123",
  properties: {
    description: "...",
    price: 99,
    duration: "8 weeks"
  }
}
```

**Connections (Dimension 4):**

```typescript
// Sarah owns the course
{
  _id: Id<'connections'>,
  fromPersonId: sarah_person_id,  // Person ID (Dimension 2)!
  toThingId: course_thing_id,     // Thing ID (Dimension 3)
  relationshipType: "owns",
  organizationId: "fitnesspro_123"
}
```

**Events (Dimension 5):**

```typescript
// Log the creation
{
  _id: Id<'events'>,
  eventType: "course_created",
  actorId: sarah_person_id,       // Person who did it (REQUIRED)
  targetId: course_thing_id,      // What was created
  organizationId: "fitnesspro_123",
  timestamp: Date.now()
}
```

**Knowledge (Dimension 6):**

```typescript
// Embed course content for AI
{
  _id: Id<'knowledge'>,
  knowledgeType: "document",
  text: "Fitness Fundamentals...",
  embedding: [...],               // 768-dim vector
  sourceThingId: course_thing_id,
  organizationId: "fitnesspro_123",
  labels: ["course", "fitness", "beginner"]
}
```

**Result:** One operation touches all 6 dimensions → complete context for AI agents.

---

## Effect.ts + DataProvider Pattern

**The separation uses Effect.ts for type-safety and DataProvider for backend-agnosticism.**

### DataProvider Interface (Backend-Agnostic)

```typescript
// frontend/src/providers/DataProvider.ts
import { Effect, Context } from "effect";

// Universal interface ALL backends implement
export interface DataProvider {
  // Dimension 1: Organizations
  organizations: {
    get: (id: string) => Effect.Effect<Organization, OrganizationNotFoundError>;
    list: (params?: {
      status?: string;
    }) => Effect.Effect<Organization[], Error>;
  };

  // Dimension 2: People (separate from things!)
  people: {
    get: (id: string) => Effect.Effect<Person, PersonNotFoundError>;
    list: (params: {
      organizationId?: string;
      role?: string;
    }) => Effect.Effect<Person[], Error>;
    create: (input: {
      email: string;
      displayName: string;
      role: string;
      organizationId: string;
    }) => Effect.Effect<string, Error>;
  };

  // Dimension 3: Things
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>;
    list: (params: {
      type: ThingType;
      organizationId?: string;
    }) => Effect.Effect<Thing[], Error>;
    create: (input: {
      type: ThingType;
      name: string;
      organizationId: string;
      properties: any;
    }) => Effect.Effect<string, Error>;
  };

  // Dimension 4: Connections
  connections: {
    create: (input: {
      fromPersonId?: string; // Can connect people
      fromThingId?: string; // OR things
      toThingId: string;
      relationshipType: ConnectionType;
      organizationId: string;
      metadata?: any;
    }) => Effect.Effect<string, Error>;
  };

  // Dimension 5: Events
  events: {
    log: (event: {
      type: EventType;
      actorId: string; // Always a Person ID!
      targetId?: string;
      organizationId: string;
      metadata?: any;
    }) => Effect.Effect<void, Error>;
  };

  // Dimension 6: Knowledge
  knowledge: {
    search: (params: {
      query: string;
      organizationId: string;
      k?: number;
    }) => Effect.Effect<KnowledgeChunk[], Error>;
  };
}

export const DataProvider = Context.GenericTag<DataProvider>("DataProvider");
```

### Effect.ts Service Example

```typescript
// backend/services/CourseService.ts
import { Effect } from "effect";
import { DataProvider } from "@/providers/DataProvider";

export class CourseService extends Effect.Service<CourseService>()(
  "CourseService",
  {
    effect: Effect.gen(function* () {
      const provider = yield* DataProvider;

      return {
        // Create course → touches all 6 dimensions
        create: (params: {
          name: string;
          creatorId: string;
          organizationId: string;
          properties: any;
        }) =>
          Effect.gen(function* () {
            // 3. Create thing (course)
            const courseId = yield* provider.things.create({
              type: "course",
              name: params.name,
              organizationId: params.organizationId,
              properties: params.properties,
            });

            // 4. Create connection (person owns course)
            yield* provider.connections.create({
              fromPersonId: params.creatorId, // Person ID!
              toThingId: courseId,
              relationshipType: "owns",
              organizationId: params.organizationId,
            });

            // 5. Log event (course created)
            yield* provider.events.log({
              type: "course_created",
              actorId: params.creatorId, // Person who did it
              targetId: courseId,
              organizationId: params.organizationId,
              metadata: {
                courseName: params.name,
                creatorEmail: "sarah@fitnesspro.com",
              },
            });

            // 6. Embed for knowledge (AI can find it)
            // (handled by background job)

            return courseId;
          }),
      };
    }),
    dependencies: [DataProvider],
  }
) {}
```

### Frontend Usage (Backend-Agnostic)

```tsx
// frontend/src/components/CreateCourse.tsx
import { useEffectRunner } from "@/hooks/useEffectRunner";
import { CourseService } from "@/services/CourseService";
import { Effect } from "effect";

export function CreateCourseForm() {
  const { run, loading } = useEffectRunner();

  const handleSubmit = async (formData: CourseFormData) => {
    // Define Effect program using CourseService
    const program = Effect.gen(function* () {
      const courseService = yield* CourseService;

      // Create course → touches all 6 dimensions automatically
      const courseId = yield* courseService.create({
        name: formData.name,
        creatorId: currentUser.id,
        organizationId: currentOrg.id,
        properties: {
          description: formData.description,
          price: formData.price,
        },
      });

      return courseId;
    });

    // Run program (frontend uses DataProvider)
    const courseId = await run(program);

    // Redirect to course page
    navigate(`/courses/${courseId}`);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Backend Provider Implementations

**Convex Provider:**

```typescript
// frontend/src/providers/convex/ConvexProvider.ts
import { Effect, Layer } from "effect";
import { ConvexHttpClient } from "convex/browser";
import { DataProvider } from "../DataProvider";

export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  things = {
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.things.create, input),
        catch: (error) => new Error(String(error)),
      }),
  };

  people = {
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.people.create, input),
        catch: (error) => new Error(String(error)),
      }),
  };

  // ... other dimensions
}

export const convexProvider = (config: { url: string }) =>
  Layer.succeed(
    DataProvider,
    new ConvexProvider(new ConvexHttpClient(config.url))
  );
```

**Composite Provider (Multi-Backend):**

```typescript
// frontend/src/providers/composite/CompositeProvider.ts
import { Effect, Layer } from "effect";
import { DataProvider } from "../DataProvider";

export class CompositeProvider implements DataProvider {
  constructor(
    private defaultProvider: DataProvider,
    private routes: Map<ThingType, DataProvider>
  ) {}

  // Route to appropriate provider based on thing type
  private getProvider(type?: ThingType): DataProvider {
    if (type && this.routes.has(type)) {
      return this.routes.get(type)!;
    }
    return this.defaultProvider;
  }

  things = {
    get: (id: string) =>
      Effect.gen(function* () {
        // Fetch thing to determine type
        const thing = yield* this.defaultProvider.things.get(id);

        // Route to appropriate provider
        const provider = this.getProvider(thing.type);
        if (provider !== this.defaultProvider) {
          return yield* provider.things.get(id);
        }
        return thing;
      }),

    list: (params: { type: ThingType; organizationId?: string }) =>
      Effect.gen(function* () {
        // Route based on thing type
        const provider = this.getProvider(params.type);
        return yield* provider.things.list(params);
      }),

    create: (input: {
      type: ThingType;
      name: string;
      organizationId: string;
      properties: any;
    }) =>
      Effect.gen(function* () {
        // Route based on thing type
        const provider = this.getProvider(input.type);
        return yield* provider.things.create(input);
      }),
  };

  // Organizations, People, Events, Knowledge → always use default provider
  organizations = this.defaultProvider.organizations;
  people = this.defaultProvider.people;
  connections = this.defaultProvider.connections;
  events = this.defaultProvider.events;
  knowledge = this.defaultProvider.knowledge;
}

export function compositeProvider(config: {
  default: Layer<DataProvider>;
  routes: Record<string, Layer<DataProvider> | "default">;
}) {
  return Effect.gen(function* () {
    // Resolve default provider
    const defaultProvider = yield* Effect.provide(DataProvider, config.default);

    // Resolve route providers
    const routes = new Map<ThingType, DataProvider>();
    for (const [type, providerConfig] of Object.entries(config.routes)) {
      if (providerConfig === "default") {
        routes.set(type as ThingType, defaultProvider);
      } else {
        const provider = yield* Effect.provide(DataProvider, providerConfig);
        routes.set(type as ThingType, provider);
      }
    }

    return new CompositeProvider(defaultProvider, routes);
  }).pipe(Effect.map((provider) => Layer.succeed(DataProvider, provider)));
}
```

**Real-World Example:**

```typescript
// Auth & courses in Convex, blog in WordPress, products in Shopify
export default defineConfig({
  integrations: [
    one({
      provider: compositeProvider({
        default: convexProvider({ url: env.PUBLIC_CONVEX_URL }),
        routes: {
          blog_post: wordpressProvider({
            url: "https://blog.yoursite.com",
            apiKey: env.WP_API_KEY,
          }),
          product: shopifyProvider({
            store: "yourstore.myshopify.com",
            accessToken: env.SHOPIFY_ACCESS_TOKEN,
          }),
        },
      }),
    }),
  ],
});
```

**Benefits:**

- ✅ **Type-safe**: Compiler enforces all dimensions
- ✅ **Composable**: Services build on each other
- ✅ **Testable**: Mock layers, not databases
- ✅ **Backend-agnostic**: Change provider, not code
- ✅ **Multi-backend**: Use best backend for each data type
- ✅ **6-dimension aware**: Every operation properly scoped

---

## Benefits of Separation

### 1. Multi-Tenancy Support

**Before:**

```
Org A → Frontend A → Convex Deployment A
Org B → Frontend B → Convex Deployment B
Org C → Frontend C → Convex Deployment C

❌ 3 orgs = 3 Convex deployments (expensive, hard to manage)
```

**After:**

```
Org A → Frontend A ──┐
                     ├→ Single Backend API → Single Convex Deployment
Org B → Frontend B ──┤   (with API key isolation)
                     │
Org C → Frontend C ──┘

✅ 3 orgs = 1 Convex deployment (cheap, centralized)
```

### 2. Backend Independence

**Before:**

- Frontend tightly coupled to Convex
- Can't switch to WordPress, Notion, Supabase, etc.
- Organizations must use Convex even if they have existing systems
- Must learn Convex SDK for every platform

❌ Locked into Convex

**After (Backend-Agnostic):**

- Frontend uses DataProvider interface
- Organizations can use:
  - **Convex** (real-time, serverless)
  - **WordPress** (existing CMS)
  - **Notion** (databases as backend)
  - **Supabase** (PostgreSQL + real-time)
  - **Custom backend** (your own API)
- Change backend by editing ONE line in `astro.config.ts`

```typescript
// Swap backends - frontend code unchanged!
provider: convexProvider({ url: "..." });
// OR
provider: wordpressProvider({ url: "...", apiKey: "..." });
// OR
provider: notionProvider({ apiKey: "...", databaseId: "..." });
```

✅ Organizations use their existing infrastructure

### 3. Team Organization

**Before:**

```
Full-stack developer needs to know:
- Astro + React
- Convex-specific hooks and patterns
- Convex schema + queries/mutations/actions
- Effect.ts
- Business logic
```

**After (Backend-Agnostic):**

```
Frontend developer needs to know:
- Astro + React
- DataProvider interface (universal)
- Effect.ts services

Backend developer needs to know:
- Their chosen backend (WordPress, Convex, Notion, etc.)
- How to implement DataProvider for that backend
- 6-dimension ontology mapping
```

✅ Frontend devs don't learn backend-specific details
✅ Organizations can hire developers with their existing tech stack
✅ Clear separation of concerns

### 4. Progressive Migration & Flexibility

**Before:**

```
Organization has WordPress site with 10,000 posts
Want to use ONE frontend
Must migrate ALL data to Convex first

❌ Big-bang migration required
❌ Can't test gradually
❌ Risk losing SEO, existing integrations
```

**After (Backend-Agnostic):**

```
Organization keeps WordPress backend
Implements WordPressProvider (maps WP → 6-dimension ontology)
Deploys ONE frontend
Frontend talks to WordPress via DataProvider

✅ Zero data migration needed
✅ Keep existing WordPress admin, plugins, integrations
✅ Progressive: Start with one page, migrate gradually
✅ Test ONE frontend without touching backend
```

**Real-World Example:**

```typescript
// Week 1: Deploy ONE frontend with WordPress backend
provider: wordpressProvider({
  url: "https://existing-site.com",
  apiKey: env.WP_API_KEY,
});

// Week 50: Migrate to Convex when ready (ONE line change)
provider: convexProvider({
  url: env.CONVEX_URL,
});

// Frontend code? UNCHANGED. No rewrite needed.
```

✅ Organizations control their migration timeline
✅ No forced backend choice
✅ Test frontend without backend risk

---

## Migration Strategy

### Phase 1: Create DataProvider Interface (Universal API)

**Goal:** Define the backend-agnostic interface that ALL providers must implement

**Tasks:**

1. Create `/frontend/src/providers/DataProvider.ts`
2. Define interfaces for 6 dimensions:
   - `organizations: { get, list, update }`
   - `people: { get, list, create, update, delete }`
   - `things: { get, list, create, update, delete }`
   - `connections: { create, getRelated, getCount, delete }`
   - `events: { log, query }`
   - `knowledge: { embed, search }`
3. Define error types (ThingNotFoundError, ConnectionCreateError, etc.)
4. Document interface with TypeScript types

**Timeline:** 2-3 days

**Risk:** None (just interface definition)

**Reference:** See `one/knowledge/ontology-frontend.md` for complete DataProvider interface

---

### Phase 2: Implement ConvexProvider (Wrap Existing Working Backend)

**Goal:** Wrap existing **working** Convex backend with DataProvider interface (NO functionality changes)

**Tasks:**

1. Create `/frontend/src/providers/convex/ConvexProvider.ts`
2. Implement DataProvider interface using Convex client:
   ```typescript
   things.get(id) => client.query(api.queries.things.get, { id })
   things.create(input) => client.mutation(api.mutations.things.create, input)
   // etc. for all methods
   ```
3. Wrap Convex calls in Effect.ts for error handling
4. Create factory function: `convexProvider(config)`
5. Test provider in isolation
6. **Critical:** Run `frontend/tests/auth/*` - all tests must pass

**Timeline:** 3-5 days

**Risk:** Very Low (just wraps existing working Convex calls, no logic changes)

**Success Criteria:**

- ✅ ConvexProvider implements DataProvider interface fully
- ✅ All existing auth tests pass
- ✅ No functionality changes - just adds abstraction layer

---

### Phase 3: Create Effect.ts Service Layer

**Goal:** Build generic services that use DataProvider (backend-agnostic)

**Tasks:**

1. Create `/frontend/src/services/ThingService.ts` (generic, handles all 66 types)
2. Create `/frontend/src/services/ConnectionService.ts`
3. Create `/frontend/src/services/ClientLayer.ts` (dependency injection)
4. Services delegate to DataProvider:
   ```typescript
   export class ThingService extends Effect.Service<ThingService>()({
     effect: Effect.gen(function* () {
       const provider = yield* DataProvider  // Backend-agnostic!
       return {
         get: (id: string) => provider.things.get(id),
         list: (type, orgId) => provider.things.list({ type, organizationId: orgId })
       }
     })
   })
   ```
5. Create `useEffectRunner` hook for React integration

**Timeline:** 3-5 days

**Risk:** Low (services just delegate to provider)

---

### Phase 4: Configure Provider in astro.config.ts

**Goal:** Wire up ConvexProvider as the active backend

**Tasks:**

1. Update `astro.config.ts`:

   ```typescript
   import { convexProvider } from "./src/providers/convex";

   export default defineConfig({
     integrations: [
       react(),
       one({
         provider: convexProvider({
           url: import.meta.env.PUBLIC_CONVEX_URL,
         }),
       }),
     ],
   });
   ```

2. Test that services can access provider via Effect.ts layers

**Timeline:** 1 day

**Risk:** Low (configuration only)

---

### Phase 5: Migrate Frontend Components Gradually

**Goal:** Replace Convex hooks with Effect.ts services (page by page)

**Before:**

```tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const courses = useQuery(api.queries.things.list, { type: "course" });
```

**After:**

```tsx
import { useEffectRunner } from "@/hooks/useEffectRunner";
import { ThingService } from "@/services/ThingService";

const { run, loading } = useEffectRunner();
const [courses, setCourses] = useState([]);

useEffect(() => {
  const program = Effect.gen(function* () {
    const thingService = yield* ThingService;
    return yield* thingService.list("course", orgId);
  });
  run(program, { onSuccess: setCourses });
}, []);
```

**Migration Order:**

1. Low-traffic pages first (`/about`, `/blog`)
2. Medium-traffic pages (`/courses`, `/products`)
3. High-traffic pages (`/`, `/dashboard`)
4. Authentication pages last (highest risk)

**Critical - Auth Test Validation:**

```bash
# After migrating ANY page that touches auth
npm test frontend/tests/auth/

# If tests fail:
# 1. STOP migration
# 2. Debug the issue
# 3. Fix before continuing
# 4. Re-run tests until all pass
```

**Timeline:** 2-4 weeks (gradual, page by page)

**Risk:** Medium (test each page thoroughly before deploying)

**Safety Net:** Existing auth tests catch regressions immediately

---

### Phase 6: Remove Convex Dependencies from Frontend

**Goal:** Clean up frontend - no more direct Convex imports

**Tasks:**

1. Verify all pages use Effect.ts services (no direct Convex hooks)
2. Remove `convex` from `frontend/package.json`
3. Delete `frontend/convex/` directory (no longer needed)
4. Update build process (no Convex codegen)
5. Frontend is now backend-agnostic!

**Timeline:** 1-2 days

**Risk:** Low (if Phase 5 complete)

---

### Phase 7 (Optional): Add Alternative Backend Providers

**Goal:** Demonstrate backend flexibility - add WordPress, Notion, Supabase providers

**Example - WordPress Provider:**

```typescript
// /frontend/src/providers/wordpress/WordPressProvider.ts
export class WordPressProvider implements DataProvider {
  things = {
    get: (id) =>
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () => fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`),
          catch: (error) => new Error(String(error)),
        });
        const post = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error)),
        });
        // Transform WordPress post → ONE thing
        return {
          _id: post.id.toString(),
          type: "post",
          name: post.title.rendered,
          properties: {
            content: post.content.rendered,
            publishedAt: post.date,
          },
          status: post.status,
          createdAt: new Date(post.date).getTime(),
          updatedAt: new Date(post.modified).getTime(),
        };
      }),
  };
  // ... implement other methods
}
```

**Swap backends in config:**

```typescript
// Change from Convex to WordPress - ONE line!
export default defineConfig({
  integrations: [
    one({
      // provider: convexProvider({ url: "..." })  // OLD
      provider: wordpressProvider({
        // NEW
        url: "https://existing-site.com",
        apiKey: env.WP_API_KEY,
      }),
    }),
  ],
});
```

**Timeline:** 1-2 weeks per provider

**Risk:** Low (doesn't affect existing Convex setup)

**Value:** Demonstrates TRUE backend-agnosticism

---

## Authentication (Provider-Specific)

**Key Concept:** Authentication is handled by each backend provider, not by the frontend.

### Authentication by Provider

**1. Convex Provider**

```typescript
// Frontend reads from environment
provider: convexProvider({
  url: import.meta.env.PUBLIC_CONVEX_URL,
});

// Backend: Better Auth handles sessions
// Convex mutations check ctx.auth for user identity
// No API keys needed (sessions + WebSocket auth)
```

**2. WordPress Provider**

```typescript
// Frontend configured with WordPress API key
provider: wordpressProvider({
  url: "https://yoursite.com",
  apiKey: import.meta.env.WP_API_KEY, // WordPress Application Password
});

// Backend: WordPress REST API validates the key
// Provider adds Authorization header to all requests
```

**3. Notion Provider**

```typescript
// Frontend configured with Notion integration token
provider: notionProvider({
  apiKey: import.meta.env.NOTION_API_KEY, // Notion integration token
  databaseId: import.meta.env.NOTION_DB_ID,
});

// Backend: Notion API validates the integration token
```

**4. Supabase Provider**

```typescript
// Frontend uses Supabase anon key + RLS
provider: supabaseProvider({
  url: import.meta.env.PUBLIC_SUPABASE_URL,
  apiKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
});

// Backend: Supabase Row Level Security (RLS) enforces access control
// User sessions managed by Supabase Auth
```

### Security Model

**Frontend:**

- Frontend stores provider config (URLs, public/anon keys)
- NO secret keys in frontend
- Authentication state managed by provider (sessions, tokens, etc.)

**Backend (Provider-Specific):**

- **Convex:** Better Auth sessions + JWT validation
- **WordPress:** Application Passwords or OAuth
- **Notion:** Integration tokens (server-side only)
- **Supabase:** Row Level Security (RLS) + Auth

### Multi-Tenancy & Authorization

Each provider implements organization isolation differently:

**Convex:**

```typescript
// Convex mutations enforce org scoping
const courses = await ctx.db
  .query("things")
  .withIndex("by_type", (q) => q.eq("type", "course"))
  .filter((q) => q.eq(q.field("organizationId"), userOrgId))
  .collect();
```

**WordPress:**

```typescript
// WordPress categories/taxonomies for org isolation
// Or use multi-site for complete separation
```

**Notion:**

```typescript
// Separate Notion databases per organization
// Or use Notion's built-in sharing/permissions
```

**Supabase:**

```typescript
// Row Level Security (RLS) policies
CREATE POLICY "Users can only see their org's data"
  ON things FOR SELECT
  USING (organizationId = auth.uid());
```

**Key Point:** Authorization logic lives in the BACKEND (provider implementation), not the frontend

---

## File Structure Changes

### Before (Coupled)

```
frontend/
├── convex/                         # ❌ Tightly coupled to Convex
│   ├── _generated/
│   ├── mutations/
│   ├── queries/
│   ├── schema.ts
│   └── http.ts
├── src/
│   ├── components/
│   │   └── CourseCard.tsx          # Uses useQuery(api.things.list)
│   └── pages/
│       └── courses/[id].astro      # Uses ConvexHttpClient
└── package.json                    # Includes "convex": "^1.x.x"

❌ Can't swap to WordPress, Notion, Supabase, etc.
```

### After (Backend-Agnostic)

```
frontend/
├── src/
│   ├── providers/                  # ✅ Backend provider implementations
│   │   ├── DataProvider.ts         #    Universal interface (6 dimensions)
│   │   ├── convex/
│   │   │   ├── ConvexProvider.ts   #    Convex implementation
│   │   │   └── index.ts
│   │   ├── wordpress/              #    Optional: WordPress implementation
│   │   │   ├── WordPressProvider.ts
│   │   │   └── index.ts
│   │   ├── notion/                 #    Optional: Notion implementation
│   │   │   ├── NotionProvider.ts
│   │   │   └── index.ts
│   │   └── supabase/               #    Optional: Supabase implementation
│   │       ├── SupabaseProvider.ts
│   │       └── index.ts
│   ├── services/                   # ✅ Backend-agnostic services
│   │   ├── ThingService.ts         #    Generic (handles all 66 types)
│   │   ├── ConnectionService.ts    #    Generic connections
│   │   └── ClientLayer.ts          #    Dependency injection
│   ├── hooks/
│   │   └── useEffectRunner.ts      # ✅ Run Effect.ts in React
│   ├── components/
│   │   └── CourseCard.tsx          # ✅ Uses ThingService (backend-agnostic)
│   └── pages/
│       └── courses/[id].astro      # ✅ Uses ThingService (backend-agnostic)
├── astro.config.ts                 # ✅ Configure provider (ONE line to swap!)
├── .env                            # PUBLIC_CONVEX_URL or WP_API_KEY, etc.
└── package.json                    # ✅ No Convex dependency (if using other backend)

✅ Swap backends by changing ONE line in astro.config.ts!
✅ Organizations can use their existing infrastructure
```

### Configuration Example (Single Provider)

```typescript
// frontend/astro.config.ts

// Option 1: Use Convex for everything
import { convexProvider } from "./src/providers/convex";
export default defineConfig({
  integrations: [
    one({
      provider: convexProvider({ url: env.PUBLIC_CONVEX_URL }),
    }),
  ],
});

// Option 2: Use WordPress for everything (change ONE line!)
import { wordpressProvider } from "./src/providers/wordpress";
export default defineConfig({
  integrations: [
    one({
      provider: wordpressProvider({
        url: "https://yoursite.com",
        apiKey: env.WP_API_KEY,
      }),
    }),
  ],
});

// Option 3: Use Notion for everything (change ONE line!)
import { notionProvider } from "./src/providers/notion";
export default defineConfig({
  integrations: [
    one({
      provider: notionProvider({
        apiKey: env.NOTION_API_KEY,
        databaseId: env.NOTION_DB_ID,
      }),
    }),
  ],
});
```

### Configuration Example (Multi-Provider - Federated Data)

**Use case:** Auth from Convex, blog posts from WordPress, products from Shopify

```typescript
// frontend/astro.config.ts
import { compositeProvider } from "./src/providers/composite";
import { convexProvider } from "./src/providers/convex";
import { wordpressProvider } from "./src/providers/wordpress";
import { shopifyProvider } from "./src/providers/shopify";

export default defineConfig({
  integrations: [
    one({
      provider: compositeProvider({
        // Default provider (fallback)
        default: convexProvider({
          url: env.PUBLIC_CONVEX_URL,
        }),

        // Route specific thing types to specific providers
        routes: {
          // Auth & core data → Convex
          organizations: "default",
          people: "default",
          sessions: "default",

          // Blog content → WordPress
          blog_post: wordpressProvider({
            url: "https://blog.yoursite.com",
            apiKey: env.WP_API_KEY,
          }),

          // Products → Shopify
          product: shopifyProvider({
            store: "yourstore.myshopify.com",
            accessToken: env.SHOPIFY_ACCESS_TOKEN,
          }),
          digital_product: "product", // Use same as product

          // Courses → Convex (default)
          course: "default",
          lesson: "default",
        },
      }),
    }),
  ],
});
```

**How it works:**

```typescript
// Frontend calls generic service
const thingService = yield * ThingService;

// Service calls DataProvider
const blogPost = yield * thingService.get(postId); // → WordPress
const product = yield * thingService.get(productId); // → Shopify
const course = yield * thingService.get(courseId); // → Convex

// CompositeProvider routes based on thing type
// Frontend code doesn't change!
```

**Benefits:**

- ✅ Use best backend for each data type
- ✅ Keep existing WordPress blog - no migration
- ✅ Pull products from Shopify in real-time
- ✅ Auth/sessions in Convex (fast, real-time)
- ✅ Frontend code unchanged - just reads things
- ✅ Add/remove providers without touching components

### Advanced: Data Sync Strategies

**Strategy 1: Real-Time (Live Queries)**

```typescript
// Products pulled live from Shopify on every request
product: shopifyProvider({
  store: "yourstore.myshopify.com",
  accessToken: env.SHOPIFY_ACCESS_TOKEN,
  // No caching - always fresh
});
```

**Strategy 2: Import & Cache (Better Performance)**

```typescript
// Import WordPress posts to Convex, sync periodically
import { syncedProvider } from "./src/providers/synced";

provider: compositeProvider({
  default: convexProvider({ url: env.PUBLIC_CONVEX_URL }),
  routes: {
    // Blog posts synced from WordPress → stored in Convex
    blog_post: syncedProvider({
      source: wordpressProvider({
        url: "https://blog.yoursite.com",
        apiKey: env.WP_API_KEY,
      }),
      destination: "default", // Store in Convex
      syncInterval: "1 hour", // Sync every hour
      strategy: "incremental", // Only sync new/changed posts
    }),
  },
});
```

**Strategy 3: Federation (Query Multiple Backends)**

```typescript
// Search across blog posts (WordPress) AND courses (Convex)
const searchResults =
  yield *
  Effect.all(
    [
      thingService.list("blog_post", { filters: { query: "fitness" } }),
      thingService.list("course", { filters: { query: "fitness" } }),
    ],
    { concurrency: "unbounded" }
  );

// CompositeProvider queries both backends in parallel
// Frontend merges results
```

**Strategy 4: Hybrid (Auth + Import)**

```typescript
// Common pattern: Auth in Convex, content from external sources
provider: compositeProvider({
  default: convexProvider({ url: env.PUBLIC_CONVEX_URL }),
  routes: {
    // WordPress posts imported to Convex (fast reads)
    blog_post: syncedProvider({
      source: wordpressProvider({ url: "...", apiKey: "..." }),
      destination: "default",
      syncInterval: "15 minutes",
    }),

    // Shopify products live (always current pricing)
    product: shopifyProvider({
      store: "yourstore.myshopify.com",
      accessToken: env.SHOPIFY_ACCESS_TOKEN,
    }),

    // Everything else (auth, courses, etc.) in Convex
    // Uses 'default' provider
  },
});
```

**Real-World Example: E-commerce Platform**

```typescript
export default defineConfig({
  integrations: [
    one({
      provider: compositeProvider({
        // Core platform data in Convex
        default: convexProvider({ url: env.PUBLIC_CONVEX_URL }),

        routes: {
          // Auth & users → Convex (real-time, fast)
          organizations: "default",
          people: "default",

          // Products → Shopify (live pricing, inventory)
          product: shopifyProvider({
            store: env.SHOPIFY_STORE,
            accessToken: env.SHOPIFY_ACCESS_TOKEN,
          }),

          // Blog → WordPress (existing content, no migration)
          blog_post: syncedProvider({
            source: wordpressProvider({
              url: env.WP_URL,
              apiKey: env.WP_API_KEY,
            }),
            destination: "default",
            syncInterval: "30 minutes",
          }),

          // Courses → Convex (real-time progress tracking)
          course: "default",
          lesson: "default",

          // Customer reviews → Import from Trustpilot/Google
          review: syncedProvider({
            source: trustpilotProvider({ businessId: env.TRUSTPILOT_ID }),
            destination: "default",
            syncInterval: "24 hours",
          }),
        },
      }),
    }),
  ],
});
```

**Frontend Code (Unchanged!):**

```tsx
// Component doesn't know or care about backend routing
export function HomePage() {
  const { run } = useEffectRunner();
  const [data, setData] = useState(null);

  useEffect(() => {
    const program = Effect.gen(function* () {
      const thingService = yield* ThingService;

      // Fetches from multiple backends automatically
      const [products, posts, courses] = yield* Effect.all(
        [
          thingService.list("product", orgId), // → Shopify (live)
          thingService.list("blog_post", orgId), // → WordPress (cached)
          thingService.list("course", orgId), // → Convex (default)
        ],
        { concurrency: "unbounded" }
      );

      return { products, posts, courses };
    });

    run(program, { onSuccess: setData });
  }, []);

  // Render federated data
  return (
    <div>
      <ProductGrid products={data?.products} />
      <BlogFeed posts={data?.posts} />
      <CourseList courses={data?.courses} />
    </div>
  );
}
```

**Key Insights:**

- ✅ Frontend components don't change when adding/removing backends
- ✅ Mix real-time and cached data based on needs
- ✅ Organizations keep existing content management systems
- ✅ Import external data (reviews, social proof) without manual copying
- ✅ Route based on performance/cost tradeoffs (Shopify API calls vs Convex reads)

### Backend Stays Separate (No Changes Needed)

```
backend/
└── convex/                         # Backend unchanged!
    ├── queries/
    ├── mutations/
    ├── schema.ts                   # 6-dimension ontology
    └── http.ts

# OR use WordPress, Notion, Supabase - frontend doesn't care!
```

---

## Implementation Steps

### Step 1: Create API Key Entity Type

**File: `backend/convex/schema.ts`**

Add to existing schema:

```typescript
export default defineSchema({
  // ... existing entities table

  entities: defineTable({
    type: v.string(), // Add "api_key" as new type
    name: v.string(),
    properties: v.any(),
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("inactive"),
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived"),
        v.literal("revoked") // ✅ Add for API keys
      )
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_key_hash", ["properties.keyHash"]), // ✅ Add for fast lookup

  // ... rest of schema
});
```

### Step 2: Create API Key Queries

**File: `backend/convex/queries/apiKeys.ts`**

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

export const validate = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("entities")
      .withIndex("by_key_hash", (q) => q.eq("properties.keyHash", args.keyHash))
      .filter((q) => q.eq(q.field("type"), "api_key"))
      .first();

    return apiKey;
  },
});

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const keys = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "api_key"))
      .filter((q) => q.eq(q.field("properties.orgId"), args.orgId))
      .collect();

    // Don't return keyHash (security)
    return keys.map((key) => ({
      ...key,
      properties: {
        ...key.properties,
        keyHash: undefined, // Remove sensitive data
      },
    }));
  },
});
```

### Step 3: Create API Key Mutations

**File: `backend/convex/mutations/apiKeys.ts`**

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createHash, randomBytes } from "crypto";

export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    scopes: v.array(v.string()),
    environment: v.union(v.literal("production"), v.literal("development")),
  },
  handler: async (ctx, args) => {
    // Generate random API key
    const prefix = args.environment === "production" ? "sk_live" : "sk_test";
    const random = randomBytes(18).toString("base64url");
    const apiKey = `${prefix}_${random}`;

    // Hash the key for storage
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const keyHint = apiKey.slice(-3);

    // Create entity
    const keyId = await ctx.db.insert("entities", {
      type: "api_key",
      name: args.name,
      properties: {
        keyPrefix: prefix,
        keyHash,
        keyHint,
        orgId: args.orgId,
        scopes: args.scopes,
        rateLimit: {
          requests: 1000,
          period: 60,
        },
        environment: args.environment,
        lastUsedAt: null,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return plaintext key ONLY this once
    return {
      id: keyId,
      apiKey, // ⚠️ Show user - never shown again!
      keyHint,
    };
  },
});

export const revoke = mutation({
  args: { keyId: v.id("entities") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keyId, {
      status: "revoked",
      updatedAt: Date.now(),
    });
  },
});

export const updateLastUsed = mutation({
  args: { keyId: v.id("entities") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);
    if (!key) return;

    await ctx.db.patch(args.keyId, {
      properties: {
        ...key.properties,
        lastUsedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});
```

### Step 4: Create Hono API Backend

**File: `backend/api/index.ts`**

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validateApiKey } from "./middleware/auth";
import tokensRoutes from "./routes/tokens";
import agentsRoutes from "./routes/agents";
import authRoutes from "./routes/auth";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: [
      "http://localhost:4321",
      "https://*.pages.dev",
      process.env.FRONTEND_URL || "",
    ].filter(Boolean),
    credentials: true,
  })
);

// Health check (no auth required)
app.get("/health", (c) => c.json({ status: "ok" }));

// API routes (auth required)
app.use("/api/*", validateApiKey);
app.route("/api/v1/tokens", tokensRoutes);
app.route("/api/v1/agents", agentsRoutes);
app.route("/api/v1/auth", authRoutes);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
```

**File: `backend/api/routes/tokens.ts`**

```typescript
import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const app = new Hono();
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

// GET /api/v1/tokens/:id
app.get("/:id", async (c) => {
  const tokenId = c.req.param("id");
  const orgId = c.get("orgId"); // From API key middleware

  const token = await convex.query(api.queries.entities.get, { id: tokenId });

  if (!token || token.type !== "token") {
    return c.json({ error: "Token not found" }, 404);
  }

  // Check ownership
  if (token.properties.orgId !== orgId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  return c.json(token);
});

// POST /api/v1/tokens/:id/purchase
app.post("/:id/purchase", async (c) => {
  const tokenId = c.req.param("id");
  const { amount } = await c.req.json();
  const orgId = c.get("orgId");

  // Call Convex mutation
  const result = await convex.mutation(api.mutations.tokens.purchase, {
    tokenId,
    amount,
    orgId,
  });

  return c.json(result);
});

// Add more routes...

export default app;
```

### Step 5: Create Frontend API Client

**File: `frontend/src/lib/api/client.ts`**

```typescript
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || import.meta.env.PUBLIC_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error, response.status);
    }

    return response.json();
  }

  tokens = {
    get: (id: string) => this.request<Token>(`/api/v1/tokens/${id}`),

    purchase: (id: string, amount: number) =>
      this.request<PurchaseResult>(`/api/v1/tokens/${id}/purchase`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
  };

  agents = {
    get: (id: string) => this.request<Agent>(`/api/v1/agents/${id}`),

    list: () => this.request<Agent[]>("/api/v1/agents"),
  };
}

// Singleton instance
export const api = new ApiClient(import.meta.env.PUBLIC_API_KEY || "");
```

### Step 6: Update Frontend Pages

**Before:**

```astro
---
// frontend/src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api as convexApi } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(convexApi.entities.get, { id: Astro.params.id });
---
```

**After:**

```astro
---
// frontend/src/pages/tokens/[id].astro
import { api } from "@/lib/api/client";

const token = await api.tokens.get(Astro.params.id);
---
```

### Step 7: Remove Convex from Frontend

**Delete:**

```bash
rm -rf frontend/convex/
rm frontend/convex.config.ts
```

**Update `package.json`:**

```diff
{
  "dependencies": {
-   "convex": "^1.x.x",
-   "@convex-dev/resend": "^x.x.x",
    "astro": "^5.14.0"
  }
}
```

---

## Testing Strategy

### 0. Preserve Existing Auth Tests (Critical)

**REQUIREMENT:** All tests in `frontend/tests/auth/*` must continue to pass throughout migration.

**Strategy:**

```typescript
// Run existing auth tests after each phase
npm test frontend/tests/auth/

// Tests must pass:
// ✅ Signup flow
// ✅ Signin flow
// ✅ Session management
// ✅ Password reset
// ✅ Email verification
// ✅ Role-based authorization
```

**Migration Safety:**

1. **Phase 2 (ConvexProvider):** Run auth tests - should pass unchanged
2. **Phase 3 (Service Layer):** Run auth tests - should pass with new services
3. **Phase 5 (Component Migration):** Run auth tests after each page migration
4. **Phase 6 (Remove Convex):** Run auth tests - final verification

**If auth tests fail at any phase:** STOP, investigate, fix before continuing.

---

### 1. Backend API Tests

```typescript
// backend/api/__tests__/tokens.test.ts
import { describe, it, expect } from "vitest";
import app from "../index";

describe("Tokens API", () => {
  it("should require API key", async () => {
    const res = await app.request("/api/v1/tokens/123");
    expect(res.status).toBe(401);
  });

  it("should fetch token with valid key", async () => {
    const res = await app.request("/api/v1/tokens/123", {
      headers: {
        Authorization: `Bearer ${process.env.TEST_API_KEY}`,
      },
    });
    expect(res.status).toBe(200);
  });

  it("should enforce org isolation", async () => {
    const res = await app.request("/api/v1/tokens/org-b-token", {
      headers: {
        Authorization: `Bearer ${process.env.ORG_A_API_KEY}`,
      },
    });
    expect(res.status).toBe(403);
  });
});
```

### 2. Frontend Integration Tests

```typescript
// frontend/src/lib/api/__tests__/client.test.ts
import { describe, it, expect, vi } from "vitest";
import { ApiClient } from "../client";

describe("ApiClient", () => {
  it("should add Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "123" }),
    });
    global.fetch = fetchMock;

    const client = new ApiClient("sk_test_123");
    await client.tokens.get("123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_123",
        }),
      })
    );
  });

  it("should throw ApiError on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    });

    const client = new ApiClient("sk_test_123");
    await expect(client.tokens.get("999")).rejects.toThrow("Not found");
  });
});
```

---

## Deployment Changes

### Before (Coupled)

```
1. Deploy frontend to Cloudflare Pages
   - Includes Convex SDK
   - WebSocket connection to Convex

2. Deploy Convex backend
   - convex deploy
```

### After (Separated)

```
1. Deploy backend API to Cloudflare Workers
   - cd backend/api
   - wrangler deploy
   - Output: https://api.yourdomain.com

2. Deploy Convex backend
   - cd backend/convex
   - convex deploy
   - Output: https://your-deployment.convex.cloud

3. Deploy frontend to Cloudflare Pages
   - cd frontend
   - Set env: PUBLIC_API_URL=https://api.yourdomain.com
   - Set env: PUBLIC_API_KEY=pk_live_xxx
   - Build and deploy
```

### Environment Variables

**Backend (`backend/api/.env`):**

```bash
CONVEX_URL=https://your-deployment.convex.cloud
FRONTEND_URL=https://yourdomain.com
```

**Frontend (`frontend/.env`):**

```bash
PUBLIC_API_URL=https://api.yourdomain.com
PUBLIC_API_KEY=pk_live_1234567890abcdef
```

---

## Security Considerations

### 1. API Key Storage

**❌ Never:**

- Store API keys in git
- Use secret keys (`sk_*`) in frontend
- Log API keys in console
- Return key hash in API responses

**✅ Always:**

- Use publishable keys (`pk_*`) in frontend
- Use secret keys (`sk_*`) only in backend
- Hash keys before storing (SHA-256)
- Show plaintext key only once at creation
- Rotate keys regularly

### 2. Rate Limiting

**Implementation:**

```typescript
// backend/api/middleware/rateLimit.ts
import { Context, Next } from "hono";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(c: Context, next: Next) {
  const keyId = c.get("apiKeyId");
  const limit = c.get("keyRateLimit");

  const now = Date.now();
  const key = `rate_limit:${keyId}`;
  const current = rateLimitMap.get(key);

  if (current && now < current.resetAt) {
    if (current.count >= limit.requests) {
      return c.json(
        {
          error: "Rate limit exceeded",
          resetAt: new Date(current.resetAt).toISOString(),
        },
        429
      );
    }
    current.count++;
  } else {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + limit.period * 1000,
    });
  }

  await next();
}
```

### 3. CORS Configuration

**Backend:**

```typescript
app.use(
  "/api/*",
  cors({
    origin: (origin) => {
      // Allow specific domains
      const allowed = [
        "http://localhost:4321",
        "https://yourdomain.com",
        "https://*.pages.dev",
      ];

      return allowed.some((pattern) =>
        new RegExp(pattern.replace("*", ".*")).test(origin)
      )
        ? origin
        : null;
    },
    credentials: true,
  })
);
```

---

## Migration Checklist

### Backend Setup

- [ ] Add `api_key` entity type to schema
- [ ] Create API key queries in `backend/convex/queries/apiKeys.ts`
- [ ] Create API key mutations in `backend/convex/mutations/apiKeys.ts`
- [ ] Deploy schema changes to Convex
- [ ] Create test API key via mutation
- [ ] Create `backend/api/` directory structure
- [ ] Implement Hono routes for all resources
- [ ] Add API key validation middleware
- [ ] Add rate limiting middleware
- [ ] Add CORS middleware
- [ ] Deploy API to Cloudflare Workers
- [ ] Test all endpoints with Postman/curl
- [ ] Set up monitoring and logging

### Frontend Setup

- [ ] Create `frontend/src/lib/api/client.ts`
- [ ] Create `frontend/src/lib/api/types.ts`
- [ ] Create `frontend/src/lib/api/errors.ts`
- [ ] Add `PUBLIC_API_URL` to `.env`
- [ ] Add `PUBLIC_API_KEY` to `.env`
- [ ] Update 1 page to test API client
- [ ] Verify API client works in development
- [ ] Migrate all pages to use API client
- [ ] Remove all Convex imports from components
- [ ] Delete `frontend/convex/` directory
- [ ] Remove Convex from `package.json`
- [ ] Update build process
- [ ] Test full frontend in production

### Documentation

- [ ] Update `CLAUDE.md` with new architecture
- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Create API key management guide
- [ ] Update deployment instructions
- [ ] Create troubleshooting guide

---

## Rollback Plan

**Key Safety:** We're wrapping a working system, so rollback just means removing the wrapper.

If migration encounters issues, rollback is straightforward:

**Option 1: Gradual Rollback (Keep Both)**

```typescript
// Keep both Convex hooks and Effect.ts services temporarily
// Migrate page by page, test thoroughly

// Old page (still works)
const courses = useQuery(api.queries.things.list, { type: "course" });

// New page (backend-agnostic)
const program = Effect.gen(function* () {
  const thingService = yield* ThingService;
  return yield* thingService.list("course", orgId);
});
```

**Option 2: Quick Rollback (Revert Provider)**

```typescript
// Change provider back to direct Convex hooks if needed
// In astro.config.ts:
provider: convexProvider({ url: env.PUBLIC_CONVEX_URL }); // Keep this working

// Frontend components still work with ConvexProvider
// Just wraps the same Convex queries/mutations
```

**Key Safety:**

- ConvexProvider just wraps existing Convex backend
- No data migration needed
- No backend changes required
- Worst case: remove DataProvider layer, use Convex directly again

---

## Success Metrics

**Critical Requirements (Must Pass):**

- [ ] All existing auth tests in `frontend/tests/auth/*` pass
- [ ] Auth functionality unchanged (signup, signin, sessions, password reset, etc.)
- [ ] No regressions in user-facing features
- [ ] Zero downtime during migration

**Technical Goals:**

- [ ] Frontend uses DataProvider interface (backend-agnostic)
- [ ] Can swap from Convex → WordPress by changing ONE line
- [ ] Can swap from WordPress → Notion by changing ONE line
- [ ] Effect.ts services handle all 66 thing types generically
- [ ] No direct backend imports in frontend components
- [ ] Full type safety maintained with Effect.ts

**Backend Flexibility:**

- [ ] ConvexProvider fully implements DataProvider interface
- [ ] Organizations can choose their preferred backend
- [ ] At least 2 provider implementations working (e.g., Convex + WordPress)
- [ ] Multi-tenancy works across all providers
- [ ] Authorization enforced by backend (not frontend)

**Developer Experience:**

- [ ] Frontend developers don't need backend-specific knowledge
- [ ] Adding new provider takes 1-2 weeks (not months)
- [ ] Frontend components work unchanged when backend swaps
- [ ] Clear documentation for implementing new providers
- [ ] Effect.ts patterns are consistent and learnable

---

## Timeline

**Total Duration:** 4-6 weeks (Backend-Agnostic Approach)

**Week 1:** Define DataProvider interface + Implement ConvexProvider wrapper
**Week 2:** Create Effect.ts service layer + useEffectRunner hook
**Week 3-4:** Migrate frontend components to use services (page by page)
**Week 5:** Remove direct Convex imports + Test thoroughly
**Week 6 (Optional):** Add alternative provider (WordPress, Notion, etc.) to prove flexibility

**Comparison to Old Plan:**

- ✅ Faster (4-6 weeks vs 6-8 weeks)
- ✅ Less risky (no REST API to build)
- ✅ More value (true backend flexibility, not just REST)
- ✅ Organizations can use existing infrastructure immediately

---

## Next Steps

1. **Review this plan** with team - focus on DataProvider pattern benefits
2. **Study references:**
   - Read `one/knowledge/ontology-frontend.md` (DataProvider architecture)
   - Review Astro's content layer pattern (inspiration for DataProvider)
   - Understand Effect.ts basics (type-safe composable services)
3. **Begin Phase 1:** Create DataProvider interface
   - Define the 6-dimension interface
   - Document expected behavior for each method
   - Define error types (ThingNotFoundError, etc.)
4. **Begin Phase 2:** Implement ConvexProvider
   - Wrap existing Convex queries/mutations
   - Test provider in isolation
   - Verify no functionality lost

---

## When to Implement This Plan

**DO migrate when:**

- ✅ You need to support organizations with existing WordPress/Notion/Supabase infrastructure
- ✅ You want to enable multi-backend federation (e.g., auth in Convex + blog in WordPress)
- ✅ You're building mobile/desktop apps and want backend flexibility
- ✅ You want to reduce Convex lock-in for customer acquisition
- ✅ You have 4-6 weeks for strategic enhancement work

**DON'T migrate yet if:**

- ❌ You need to ship urgent features (migration is strategic, not urgent)
- ❌ Current Convex integration is causing actual problems (it's not - it works)
- ❌ You have less than 4 weeks available (rushed migration = bugs)
- ❌ Auth tests aren't stable yet (fix tests first, then migrate)

**Current Recommendation:** Keep existing Convex integration until you have:

1. A concrete customer requesting WordPress/Notion/Supabase support
2. 4-6 weeks of uninterrupted development time
3. All existing auth tests passing reliably
4. Clear business value from backend flexibility

**The current system works. Don't fix what isn't broken unless the strategic value justifies the effort.**

---

## Questions to Resolve

1. **Real-Time Support:** Should DataProvider interface include `subscriptions` methods? (Optional - not all backends support it)
2. **Provider Discovery:** Should providers register themselves, or explicit imports?
3. **Error Handling:** Standardize error types across all providers, or allow provider-specific errors?
4. **Provider Versioning:** How to handle breaking changes in provider implementations?
5. **Performance:** Should DataProvider support caching/batching at interface level?

---

## Conclusion

### Starting Point: Working System

**What we have today:**

- ✅ Frontend connected to Convex backend (working)
- ✅ Auth fully functional with passing tests
- ✅ Real-time updates via Convex WebSockets
- ✅ 6-dimension ontology implemented
- ✅ All features operational

**This is a solid foundation.** We're not fixing broken code - we're adding strategic capabilities.

### The Transformation

This **backend-agnostic separation** transforms ONE from a tightly-coupled (but working) monolith into a truly flexible platform where:

### Key Wins

**🎯 For Organizations:**

- ✅ Use your existing infrastructure (WordPress, Notion, Supabase, etc.)
- ✅ No forced migration to Convex
- ✅ Keep your existing admin tools, plugins, workflows
- ✅ Test ONE frontend without backend risk
- ✅ Migrate backend later if/when you want

**🎯 For Developers:**

- ✅ Frontend devs learn DataProvider interface once, work with any backend
- ✅ Backend devs can use their preferred stack
- ✅ No vendor lock-in
- ✅ Effect.ts provides type-safe, composable operations
- ✅ Clear separation: frontend renders, backend manages data

**🎯 For ONE Platform:**

- ✅ Serve organizations with diverse infrastructure needs
- ✅ Prove the 6-dimension ontology is universal (works with ANY backend)
- ✅ Attract organizations who would never adopt Convex
- ✅ Position as frontend layer, not full-stack lock-in

### The Breakthrough

Instead of building a **REST API** (still Convex-specific), we built a **universal data interface**:

```
OLD PLAN: Convex → Hono REST API → Frontend
          ❌ Still coupled to Convex backend
          ❌ REST API is just another layer to maintain

NEW PLAN: ANY Backend → DataProvider → Frontend
          ✅ True backend flexibility
          ✅ Organizations use existing infrastructure
          ✅ Swap backends with ONE line change
```

### Implementation Strategy

The key is **gradual migration** with **zero risk**:

1. **Week 1-2:** Create abstraction layer (DataProvider + ConvexProvider)
2. **Week 3-4:** Migrate frontend page by page to use services
3. **Week 5:** Remove direct backend imports
4. **Week 6+:** Add alternative providers to prove flexibility

At every step, frontend still works. At every step, we can rollback. At every step, we add value.

### Read More

- **Full Architecture:** See `one/knowledge/ontology-frontend.md`
- **6-Dimension Ontology:** See `one/knowledge/ontology.md`
- **Effect.ts Integration:** Frontend guide shows complete patterns

---

**This is how you build a platform that serves everyone, not just one tech stack.**
