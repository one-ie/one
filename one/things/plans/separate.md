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
- Backend is pluggable - groups can use Convex, their existing WordPress site, Notion databases, or any other backend
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
- Allow groups to use existing infrastructure
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
2. [Backend Options](#backend-options)
3. [Benefits of Separation](#benefits-of-separation)
4. [Migration Strategy](#migration-strategy)
5. [Backend Implementations](#backend-implementations)
6. [Testing Strategy](#testing-strategy)
7. [Deployment](#deployment)

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
- ⚠️ Groups must use Convex (can't use existing WordPress/Notion)
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
│  │  groups: { get, list, update }              │ │
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
│    6 tables → groups, people, things,             │
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
│  1. GROUPS → Who owns this space?             │
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

**Groups (Dimension 1):**

```typescript
groupId: "fitnesspro_123"; // All operations scoped here
```

**People (Dimension 2):**

```typescript
// Separate people table (NOT things!)
{
  _id: Id<'people'>,
  email: "sarah@fitnesspro.com",
  role: "org_owner",              // Authorization level
  groupId: "fitnesspro_123"
}
```

**Things (Dimension 3):**

```typescript
// Course is a thing
{
  _id: Id<'things'>,
  thingType: "course",
  name: "Fitness Fundamentals",
  groupId: "fitnesspro_123",
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
  groupId: "fitnesspro_123"
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
  groupId: "fitnesspro_123",
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
  groupId: "fitnesspro_123",
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
          groupId: string;
          properties: any;
        }) =>
          Effect.gen(function* () {
            // 3. Create thing (course)
            const courseId = yield* provider.things.create({
              type: "course",
              name: params.name,
              groupId: params.organizationId,
              properties: params.properties,
            });

            // 4. Create connection (person owns course)
            yield* provider.connections.create({
              fromPersonId: params.creatorId, // Person ID!
              toThingId: courseId,
              relationshipType: "owns",
              groupId: params.organizationId,
            });

            // 5. Log event (course created)
            yield* provider.events.log({
              type: "course_created",
              actorId: params.creatorId, // Person who did it
              targetId: courseId,
              groupId: params.organizationId,
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
        groupId: currentGroup.id,
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

## Backend Options

Once your frontend is backend-agnostic (using the DataProvider interface), you have **two paths**:

### Option 1: Self-Hosted Backend

**You own and operate the backend.**

```
Your Frontend → DataProvider → Your Backend Choice
                                 ├─ Convex (current)
                                 ├─ Supabase
                                 ├─ WordPress
                                 ├─ Notion
                                 ├─ Custom API
                                 └─ Any backend
```

**When to choose:**

- ✅ Full control over data
- ✅ Custom backend logic
- ✅ Existing infrastructure (WordPress, Supabase, etc.)
- ✅ Enterprise security requirements
- ✅ No external dependencies

**What you maintain:**

- Backend infrastructure
- Database management
- Auth system setup
- API deployment
- Monitoring & scaling

### Option 2: Use ONE Backend (BaaS)

**ONE hosts and operates the backend for you.**

```
Your Frontend → DataProvider → ONE Backend (BaaS)
                                └─ https://api.one.ie
                                   ├─ Auth (6 methods)
                                   ├─ Database (6 dimensions)
                                   ├─ Real-time sync
                                   ├─ Multi-tenancy
                                   └─ Free tier
```

**When to choose:**

- ✅ **Zero backend work** - focus on frontend only
- ✅ **Instant auth** - 6 methods (email, Google, GitHub, etc.)
- ✅ **Instant database** - 6-dimension ontology ready
- ✅ **Free tier** - Start with 10K API calls/month
- ✅ **Real-time included** - Convex-powered subscriptions
- ✅ **Fast MVP** - Ship in hours, not weeks

**Setup (3 steps):**

```bash
# 1. Sign up at one.ie → Get API key
# 2. Install SDK
npm install @oneie/sdk

# 3. Configure
USE_ONE_BACKEND=true
PUBLIC_ONE_API_KEY=ok_live_abc123
PUBLIC_ONE_ORG_ID=org_abc123
```

**Pricing:**

- **Starter:** Free (10K API calls/month, 100 users, 1K things)
- **Pro:** $29/month (100K calls, 1K users, 10K things)
- **Enterprise:** Custom (unlimited everything)

**No lock-in:** Switch between self-hosted and ONE Backend by changing ONE environment variable.

### Comparison

| Feature            | Self-Hosted    | ONE Backend (BaaS)      |
| ------------------ | -------------- | ----------------------- |
| **Setup time**     | Days-Weeks     | Minutes                 |
| **Auth**           | You build      | Included (6 methods)    |
| **Database**       | You design     | Included (6 dimensions) |
| **Real-time**      | You configure  | Included (Convex)       |
| **Multi-tenancy**  | You implement  | Included                |
| **Cost**           | Infrastructure | Free tier / $29/mo      |
| **Control**        | Full           | Managed service         |
| **Data ownership** | You own        | You own                 |
| **Migration**      | N/A            | Export anytime          |

### Hybrid Approach

**Use both!** Self-host some backends, use ONE Backend for others:

```typescript
// astro.config.ts
provider: compositeProvider({
  default: oneBackendProvider({
    apiKey: env.PUBLIC_ONE_API_KEY, // ONE Backend for core data
  }),
  routes: {
    // Blog from your WordPress
    blog_post: wordpressProvider({ url: env.WP_URL }),

    // Products from Shopify
    product: shopifyProvider({ store: env.SHOPIFY_STORE }),
  },
});
```

**Best of both worlds:**

- ✅ ONE Backend for auth, users, core features (managed)
- ✅ Self-hosted backends for specific data sources (control)
- ✅ Mix and match based on needs

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

## Backend Implementations

Once you have the DataProvider interface, implementing it for ANY backend follows similar patterns.

### Implementation Patterns

**Pattern 1: REST API**

- Fetch-based requests
- Transform responses to ONE types
- Handle auth headers

**Pattern 2: GraphQL**

- Query/mutation-based
- Parse GraphQL responses
- Map to ONE ontology

**Pattern 3: Direct Database**

- SQL/NoSQL queries
- Row/document mapping
- Connection pooling

**Pattern 4: CMS API**

- Platform-specific SDKs
- Content type mapping
- Read-only or full CRUD

### Supported Backends

**Databases:**

- ✅ Convex (current - real-time, serverless)
- ✅ Supabase (PostgreSQL + real-time)
- ✅ Neon (serverless Postgres)
- ✅ PlanetScale (MySQL)
- ✅ MongoDB
- ✅ PostgreSQL
- ✅ MySQL

**CMS Platforms:**

- ✅ WordPress + WooCommerce
- ✅ Strapi
- ✅ Contentful
- ✅ Sanity
- ✅ Ghost
- ✅ Prismic

**SaaS/Headless:**

- ✅ Notion (databases as backend)
- ✅ Airtable
- ✅ Google Sheets
- ✅ Salesforce
- ✅ HubSpot
- ✅ Shopify

**Custom:**

- ✅ Your own REST/GraphQL API
- ✅ Legacy systems
- ✅ Enterprise backends

### Quick Example: Supabase Provider

```typescript
// frontend/src/providers/supabase/SupabaseProvider.ts
import { createClient } from "@supabase/supabase-js";
import { Effect } from "effect";
import { DataProvider } from "../DataProvider";

export class SupabaseProvider implements DataProvider {
  private supabase;

  constructor(url: string, anonKey: string) {
    this.supabase = createClient(url, anonKey);
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const { data, error } = yield* Effect.tryPromise({
          try: () =>
            this.supabase.from("things").select("*").eq("id", id).single(),
          catch: (err) => new Error(String(err)),
        });

        if (error) {
          return yield* Effect.fail(new ThingNotFoundError(id));
        }

        // Transform Supabase row → ONE Thing
        return {
          _id: data.id,
          type: data.type,
          name: data.name,
          properties: data.properties,
          status: data.status,
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
          organizationId: data.organization_id,
        };
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        let query = this.supabase
          .from("things")
          .select("*")
          .eq("type", params.type);

        if (params.organizationId) {
          query = query.eq("organization_id", params.organizationId);
        }

        const { data, error } = yield* Effect.tryPromise({
          try: () => query.limit(params.limit || 10),
          catch: (err) => new Error(String(err)),
        });

        if (error) {
          return yield* Effect.fail(new Error(error.message));
        }

        return data.map((row) => ({
          _id: row.id,
          type: row.type,
          name: row.name,
          properties: row.properties,
          status: row.status,
          createdAt: new Date(row.created_at).getTime(),
          updatedAt: new Date(row.updated_at).getTime(),
          organizationId: row.organization_id,
        }));
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const { data, error } = yield* Effect.tryPromise({
          try: () =>
            this.supabase
              .from("things")
              .insert({
                type: input.type,
                name: input.name,
                properties: input.properties,
                organization_id: input.organizationId,
                status: "active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .select()
              .single(),
          catch: (err) => new Error(String(err)),
        });

        if (error) {
          return yield* Effect.fail(new Error(error.message));
        }

        return data.id;
      }),

    update: (id, updates) => {
      /* ... */
    },
    delete: (id) => {
      /* ... */
    },
  };

  connections = {
    /* ... */
  };
  events = {
    /* ... */
  };
  knowledge = {
    /* ... */
  };

  // ✅ Supabase supports real-time!
  subscriptions = {
    watchThing: (id: string) =>
      Effect.gen(this, function* () {
        const channel = this.supabase.channel(`thing:${id}`).on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "things",
            filter: `id=eq.${id}`,
          },
          (payload) => {
            // Emit updates via Observable
          }
        );

        yield* Effect.tryPromise({
          try: () => channel.subscribe(),
          catch: (err) => new Error(String(err)),
        });

        // Return observable
      }),
  };
}

export function supabaseProvider(config: { url: string; anonKey: string }) {
  return Layer.succeed(
    DataProvider,
    new SupabaseProvider(config.url, config.anonKey)
  );
}
```

**Key Points:**

1. Implement `DataProvider` interface
2. Transform backend data → ONE types (Thing, Connection, Event, Knowledge)
3. Handle errors with Effect.ts
4. Map backend fields → ONE ontology fields
5. Done! Frontend works unchanged.

### Complete Implementation Guide

For detailed implementation examples of all supported backends:

- **Databases**: See `one/connections/any-backend.md` (sections: Supabase, Neon, PlanetScale, MongoDB)
- **CMS**: See `one/connections/any-backend.md` (sections: WordPress, Strapi, Contentful)
- **SaaS**: See `one/connections/any-backend.md` (sections: Notion, Airtable, Shopify)
- **Custom**: See `one/connections/any-backend.md` (section: Custom Backends)

### Authentication by Backend

**Each backend handles auth differently:**

| Backend                | Auth Method                              |
| ---------------------- | ---------------------------------------- |
| **Convex**             | Better Auth sessions + JWT validation    |
| **Supabase**           | Row Level Security (RLS) + Supabase Auth |
| **WordPress**          | Application Passwords or OAuth           |
| **Notion**             | Integration tokens (server-side only)    |
| **ONE Backend (BaaS)** | API keys + Better Auth (6 methods)       |
| **Custom API**         | Your auth system                         |

**Frontend:** Uses provider's auth configuration, not backend-specific code.

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

### Mock Provider for Testing

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

## Deployment

### Option 1: Self-Hosted Backend

**Example: Deploy with Convex Provider**

```bash
# 1. Deploy backend (Convex)
cd backend
convex deploy
# Output: https://your-deployment.convex.cloud

# 2. Deploy frontend
cd frontend
# Set environment variables:
# PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
npm run build
# Deploy to Vercel/Netlify/Cloudflare Pages
```

**Example: Deploy with Supabase Provider**

```bash
# 1. Setup Supabase (already deployed)
# Get URL and anon key from Supabase dashboard

# 2. Deploy frontend
cd frontend
# Set environment variables:
# PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# PUBLIC_SUPABASE_ANON_KEY=your-anon-key
npm run build
# Deploy to Vercel/Netlify/Cloudflare Pages
```

### Option 2: Use ONE Backend (BaaS)

```bash
# 1. Sign up at one.ie → Get API key

# 2. Deploy frontend
cd frontend
# Set environment variables:
# USE_ONE_BACKEND=true
# PUBLIC_ONE_API_KEY=ok_live_abc123
# PUBLIC_ONE_ORG_ID=org_abc123
npm run build
# Deploy to Vercel/Netlify/Cloudflare Pages
```

**Done!** Backend is managed by ONE, you only deploy frontend.

### Environment Variables by Provider

**Convex Provider:**

```env
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment
```

**Supabase Provider:**

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**WordPress Provider:**

```env
WORDPRESS_URL=https://yoursite.com
WORDPRESS_API_KEY=your-app-password
```

**ONE Backend (BaaS):**

```env
USE_ONE_BACKEND=true
PUBLIC_ONE_API_KEY=ok_live_abc123
PUBLIC_ONE_ORG_ID=org_abc123
```

---

## Summary

### What This Migration Achieves

**Before:**

- ❌ Frontend tightly coupled to Convex
- ❌ Can't swap backends without rewriting code
- ❌ Organizations must use Convex (no alternatives)
- ❌ No multi-backend support

**After:**

- ✅ Frontend backend-agnostic (uses DataProvider)
- ✅ Swap backends by changing ONE line
- ✅ Support ANY backend (Convex, WordPress, Supabase, Notion, etc.)
- ✅ Use multiple backends simultaneously
- ✅ Option to use ONE Backend (BaaS) - zero backend work
- ✅ All existing auth tests pass
- ✅ Zero downtime migration
- ✅ Can rollback at any phase

### Three Paths Forward

**Path 1: Keep Current Convex (No Migration)**

- Current system works
- No changes needed
- Wait for business justification

**Path 2: Migrate to Backend-Agnostic (Self-Hosted)**

- 4-6 weeks migration
- Wrap Convex in DataProvider
- Enable future backend swaps
- Keep full control

**Path 3: Use ONE Backend (BaaS)**

- 1 hour setup
- No backend to maintain
- Free tier available
- Focus on frontend only

### References

**Detailed Implementation Guides:**

- **Any Backend**: See `one/connections/any-backend.md`
  - Databases: Convex, Supabase, Neon, PlanetScale, MongoDB, PostgreSQL
  - CMS: WordPress, Strapi, Contentful, Sanity, Ghost
  - SaaS: Notion, Airtable, Shopify, Salesforce
  - Custom: Your own REST/GraphQL API

- **ONE Backend (BaaS)**: See `one/features/use-one-backend.md`
  - Setup & onboarding
  - API key management
  - Pricing tiers
  - Migration guide

- **6-Dimension Ontology**: See `one/knowledge/ontology.md`
  - Complete data model
  - All 66 thing types
  - All 25 connection types
  - All 67 event types

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

**Universal data interface** that works with ANY backend:

```
Your Frontend → DataProvider → Your Choice:
                                 ├─ Self-Hosted (Convex, Supabase, WordPress, etc.)
                                 ├─ ONE Backend (BaaS - managed service)
                                 └─ Hybrid (mix multiple backends)

✅ Change backends with ONE line
✅ No rewrite needed
✅ Organizations choose their infrastructure
```

### Three Options

**Option 1: Keep Current Setup (Convex)**

- Works today
- No changes needed
- Revisit when business needs backend flexibility

**Option 2: Backend-Agnostic (Self-Hosted)**

- 4-6 weeks migration
- Support ANY backend (Convex, WordPress, Supabase, Notion, etc.)
- Full control, full flexibility

**Option 3: ONE Backend (BaaS)**

- 1 hour setup
- Zero backend maintenance
- Free tier available
- Focus on frontend only

### Implementation Strategy

The key is **gradual migration** with **zero risk**:

1. **Week 1-2:** Create abstraction layer (DataProvider + ConvexProvider)
2. **Week 3-4:** Migrate frontend page by page to use services
3. **Week 5:** Remove direct backend imports
4. **Week 6+:** Add alternative providers to prove flexibility

At every step, frontend still works. At every step, we can rollback. At every step, we add value.

### Resources

**Within This Document:**

- [Backend Options](#backend-options) - Self-hosted vs ONE Backend (BaaS) vs Hybrid
- [Backend Implementations](#backend-implementations) - How to implement providers for ANY backend
- [Migration Strategy](#migration-strategy) - 7-phase gradual migration plan
- [Testing Strategy](#testing-strategy) - Preserve auth tests throughout migration

**External References:**

- **Any Backend Guide:** `one/connections/any-backend.md`
  - Complete implementation examples for 20+ backends
  - REST, GraphQL, SQL, CMS, SaaS patterns
- **ONE Backend (BaaS):** `one/features/use-one-backend.md`
  - Managed backend service details
  - API key management, pricing, setup
- **6-Dimension Ontology:** `one/knowledge/ontology.md`
  - Complete data model (66 thing types, 25 connection types, 67 event types)
- **Frontend Architecture:** `one/knowledge/ontology-frontend.md`
  - DataProvider interface specification
  - Effect.ts patterns and examples

---

**ONE platform: Backend-agnostic by design. Your infrastructure, your choice.**
