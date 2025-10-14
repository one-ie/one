# ONE Platform - System Architecture

**Version:** 2.0.0
**Purpose:** Explain the beautiful three-layer separation with Effect.ts as the glue layer

---

## 🎯 The Beautiful Separation

This architecture achieves **perfect separation of concerns** with three distinct layers:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  LAYER 1: ASTRO FRONTEND                            │
│  Documentation: docs/Frontend.md                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ User-customizable "vibe code"                                   │
│  ✅ Islands architecture (static + selective hydration)             │
│  ✅ Content collections (type-safe blog, docs, marketing)           │
│  ✅ shadcn/ui components + Tailwind v4                             │
│  ✅ Deployed to Cloudflare Pages (global edge SSR)                 │
│                                                                     │
│  Pages (.astro)     React Islands         Content Collections      │
│  ├─ SEO-optimized   ├─ Interactive UI    ├─ Type-safe schemas     │
│  ├─ Fast load       ├─ Real-time data    ├─ References            │
│  └─ Static gen      └─ Convex hooks      └─ Search/filter         │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ Convex hooks (useQuery, useMutation)
                   │ Hono API client (REST for mutations)
                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│           LAYER 2: EFFECT.TS GLUE LAYER (100% Coverage)            │
│  Documentation: docs/Hono.md + docs/Architecture.md                │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ ALL business logic (pure functional programming)                │
│  ✅ Service providers for external APIs                             │
│  ✅ Typed errors throughout (no try/catch)                         │
│  ✅ Automatic dependency injection                                  │
│  ✅ Built-in retry, timeout, resource management                   │
│                                                                     │
│  Services            Providers           Layers                    │
│  ├─ TokenService    ├─ StripeProvider   ├─ MainLayer              │
│  ├─ AgentService    ├─ SuiProvider      ├─ TestLayer              │
│  ├─ ContentService  ├─ OpenAIProvider   ├─ DevLayer               │
│  └─ 100% Effect.ts  └─ ResendProvider   └─ DI automatic           │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   │ Confect bridge (Effect.ts ↔ Convex)
                   │ Hono routes (Effect.ts ↔ HTTP)
                   ↓
┌─────────────────────────────────────────────────────────────────────┐
│              LAYER 3: BACKEND (Hono + Convex)                      │
│  Documentation: docs/Hono.md                                       │
├─────────────────────────────────────────────────────────────────────┤
│  ✅ Hono: REST API routes (Cloudflare Workers)                     │
│  ✅ Convex: Real-time database + typed functions                   │
│  ✅ Better Auth: Authentication with Convex adapter                │
│  ✅ 6-Dimension Ontology: Reality-aware data model                 │
│                                                                     │
│  Hono API Routes       Convex Functions      6-Dimension Ontology  │
│  ├─ /api/auth/*       ├─ Queries (reads)    ├─ organizations      │
│  ├─ /api/tokens/*     ├─ Mutations (writes) ├─ people             │
│  ├─ /api/agents/*     ├─ Actions (external) ├─ things (entities)  │
│  └─ /api/content/*    └─ Real-time subs     ├─ connections        │
│                                              ├─ events             │
│                                              └─ knowledge          │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔑 Key Architectural Decisions

### 1. Effect.ts as the Glue Layer (100% Coverage)

**Decision:** ALL business logic uses Effect.ts (no raw async/await)

**Why:**
- **Consistency:** Same patterns across entire codebase
- **Type Safety:** Errors are explicit in type signatures
- **Composability:** Services combine cleanly without callback hell
- **Testability:** Easy to mock dependencies via layers
- **Observability:** Built-in tracing, logging, metrics

**Example:**
```typescript
// ❌ WRONG: Raw async/await in business logic
export const purchaseTokens = mutation({
  handler: async (ctx, args) => {
    try {
      const payment = await stripe.charge(args.amount);
      const tokens = await blockchain.mint(args.tokenId);
      await ctx.db.insert("events", { /* ... */ });
      return { success: true };
    } catch (error) {
      throw new Error("Purchase failed");
    }
  }
});

// ✅ CORRECT: 100% Effect.ts
export const purchaseTokens = confect.mutation({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.purchase(args);
    }).pipe(Effect.provide(MainLayer))
});

// Business logic in pure Effect service
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const stripe = yield* StripeProvider;
      const blockchain = yield* BlockchainProvider;

      return {
        purchase: (args) =>
          Effect.gen(function* () {
            const payment = yield* stripe.charge(args.amount);
            const tokens = yield* blockchain.mint(args.tokenId);
            return { success: true, payment, tokens };
          }).pipe(
            Effect.retry({ times: 3 }),
            Effect.timeout("30 seconds"),
            Effect.onError((e) => /* automatic rollback */)
          )
      };
    }),
    dependencies: [StripeProvider.Default, BlockchainProvider.Default]
  }
) {}
```

### 2. Hono for API Backend Separation

**Decision:** Separate Hono API backend from Astro frontend

**Why:**
- **Multi-Tenancy:** Different orgs can customize frontend while sharing backend
- **API Portability:** Backend logic reusable across web, mobile, desktop
- **Clear Contracts:** REST API endpoints define clear boundaries
- **Independent Deployment:** Deploy frontend and backend separately
- **Team Specialization:** Frontend devs work on UI, backend devs work on logic

**Workflow:**
```
User clicks "Buy Tokens"
    ↓
React component calls Hono API (POST /api/tokens/purchase)
    ↓
Hono route validates session (Better Auth)
    ↓
Effect.ts service processes business logic
    ↓
Service calls Convex mutation via ConvexHttpClient
    ↓
Convex updates entities/events tables
    ↓
Convex real-time subscription pushes update to UI
    ↓
Component re-renders with new balance ✅
```

### 3. Dual Integration Pattern (Frontend)

**Decision:** Convex hooks for queries, Hono API for mutations

**Why:**
- **Real-Time Data:** Convex hooks provide live subscriptions
- **Business Logic:** Hono API handles complex validation, payments, external APIs
- **Best of Both:** Real-time updates + robust backend processing

**Example:**
```typescript
// src/components/TokenPurchase.tsx
export function TokenPurchase({ tokenId }) {
  // Real-time data via Convex hook
  const token = useQuery(api.queries.tokens.get, { id: tokenId });

  // Purchase via Hono API (handles validation, payment, etc.)
  const handlePurchase = async () => {
    const result = await honoApi.purchaseTokens(tokenId, 100);
    // Convex subscription automatically updates balance!
  };

  return (
    <div>
      <p>Balance: {token?.properties.balance || 0}</p>
      <Button onClick={handlePurchase}>Buy 100 Tokens</Button>
    </div>
  );
}
```

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                              │
├─────────────────────────────────────────────────────────────────────┤
│  Astro Pages (SSR)           React Components (Islands)             │
│  ├─ SEO-optimized            ├─ Interactive UI                      │
│  ├─ Fast initial load        ├─ Real-time updates                   │
│  └─ Static generation        └─ Client hydration                    │
└──────────────────┬──────────────────────────┬────────────────────────┘
                   │                          │
                   ↓                          ↓
           ┌───────────────┐          ┌──────────────┐
           │  Convex Hooks │          │  Hono API    │
           │  useQuery     │          │  Client      │
           │  useMutation  │          │  REST calls  │
           └───────┬───────┘          └──────┬───────┘
                   │                         │
                   ↓                         ↓
           ┌───────────────────────────────────────┐
           │      EFFECT.TS GLUE LAYER             │
           │  - Services (business logic)          │
           │  - Providers (external APIs)          │
           │  - Layers (dependency injection)      │
           └───────┬───────────────────────────────┘
                   │
                   ├──────────────────┬──────────────┐
                   ↓                  ↓              ↓
           ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
           │ HONO API     │   │ CONVEX       │   │ EXTERNAL     │
           │ /api/auth/*  │   │ Real-time DB │   │ PROVIDERS    │
           │ /api/tokens/*│   │ Functions    │   │ Stripe, etc. │
           └──────────────┘   └──────────────┘   └──────────────┘
                                      │
                                      ↓
                              ┌───────────────┐
                              │   Confect     │  ← Bridge Layer (Convex ↔ Effect)
                              │  (E→C Bridge) │
                              └───────┬───────┘
                                      │
                                      ↓
┌─────────────────────────────────────────────────────────────────────┐
│              EFFECT.TS SERVICE LAYER (100% Coverage)                │
├─────────────────────────────────────────────────────────────────────┤
│  ALL Business Logic (Pure Functional Programming)                   │
│  ├─ AICloneService      ├─ TokenService      ├─ CourseService      │
│  ├─ AgentOrchestrator   ├─ CommunityService  ├─ AnalyticsService   │
│  ├─ PaymentService      ├─ LivestreamService ├─ ReferralService    │
│  ├─ NotificationService ├─ MetricsService    ├─ WebsiteService     │
│  └─ All services compose, errors typed, DI automatic, retry/timeout │
└──────────────────┬──────────────────────────────────────────────────┘
                   │
                   ├─────────────────────────┬────────────────────────┐
                   │                         │                        │
                   ↓                         ↓                        ↓
         ┌──────────────────┐      ┌──────────────────┐    ┌──────────────────┐
         │ External Providers│      │  Blockchain (3x) │    │    Payments      │
         │ ├─ OpenAI        │      │ ├─ SuiProvider   │    │ ├─ Stripe (FIAT) │
         │ ├─ ElevenLabs    │      │ ├─ BaseProvider  │    │ └─ Crypto via    │
         │ ├─ D-ID          │      │ ├─ SolanaProvider│    │    blockchain    │
         │ ├─ HeyGen        │      │ └─ Alchemy (RPC) │    └──────────────────┘
         │ ├─ Resend        │      └──────────────────┘
         │ ├─ SendGrid      │      ┌──────────────────┐
         │ ├─ Twilio        │      │  Infrastructure  │
         │ ├─ AWS           │      │ ├─ Cloudflare    │
         │ └─ Cloudflare    │      │ │  (Livestream)  │
         │    (Livestream)  │      │ └─ AWS (Storage) │
         └──────────────────┘      └──────────────────┘
                   │
                   ↓
           ┌───────────────────────────┐
           │  6-Dimension Ontology     │
           │  (Plain Convex Schema)    │
           │  ├─ organizations         │
           │  ├─ people (via things)   │
           │  ├─ things (66 types)     │
           │  ├─ connections (25 types)│
           │  ├─ events (67 types)     │
           │  └─ knowledge             │
           │                           │
           │  NO Convex Ents           │
           │  Direct DB access         │
           └───────────────────────────┘
```

---

## Layer Responsibilities

### Layer 1: Frontend (Astro + React)

**Astro's Role:**
- Server-side render pages for SEO and performance
- Generate static HTML where possible
- Route requests to correct pages
- Provide data to React islands via props

**React's Role:**
- Interactive components only (not the whole page)
- Real-time UI updates via Convex subscriptions
- Form handling and user interactions
- Client-side state management

**Why This Split:**
```typescript
// ✅ CORRECT: Astro SSR with React island
---
// Astro (server-side)
const creator = await convex.query(api.creators.get, { id });
---

<Layout>
  <h1>{creator.name}</h1>                      <!-- Astro renders -->
  <CreatorChat client:load creatorId={id} />   <!-- React hydrates -->
</Layout>

// ❌ WRONG: All React (loses SSR benefits)
export default function Page() {
  const creator = useQuery(api.creators.get, { id });
  // Everything client-side, slow initial load, bad SEO
}
```

**Key Principle:** Astro for content, React for interactivity.

### Layer 2: Convex Backend

**Three Function Types:**

**Queries (Read):**
```typescript
export const get = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  }
});
```
- Read-only
- Automatically cached
- Real-time subscriptions
- Can run in parallel

**Mutations (Write):**
```typescript
export const update = mutation({
  args: { id: v.id("entities"), name: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { name: args.name });
  }
});
```
- Write operations
- Transactional (all-or-nothing)
- Optimistic UI updates
- Validated with Convex validators

**Actions (External APIs):**
```typescript
export const cloneVoice = action({
  args: { samples: v.array(v.string()) },
  handler: async (ctx, args) => {
    const result = await elevenLabs.cloneVoice(args.samples);
    return result.voiceId;
  }
});
```
- Call external services (OpenAI, Stripe, etc.)
- Can call mutations/queries
- Not transactional
- Can be long-running

**Why Convex:**
- Real-time by default (no websockets to manage)
- Automatic caching and optimization
- Edge deployment (fast globally)
- Built-in auth and file storage
- TypeScript-first

### Layer 3: Effect.ts Service Layer (100% Coverage)

**This is where ALL business logic lives.**

**CRITICAL: Effect.ts is used for 100% of business logic** - not just complex flows:
- Every service is an Effect.ts service
- Every business operation is an Effect pipeline
- Every external API call goes through Effect providers
- NO raw async/await in business logic
- NO try/catch blocks (errors are typed)
- NO imperative state management

Effect.ts is a functional programming library that makes code:
1. **Predictable** - Same input always produces same output
2. **Composable** - Small functions combine into larger ones
3. **Typed** - Errors are explicit in the type system
4. **Testable** - Dependencies can be mocked easily
5. **Observable** - Built-in tracing and logging

**100% Effect.ts Coverage Means:**
```typescript
// ❌ WRONG: Direct async/await in business logic
export const createToken = mutation({
  handler: async (ctx, args) => {
    try {
      const result = await fetch("https://api.blockchain.com/mint");
      const token = await ctx.db.insert("entities", { ...result });
      return token;
    } catch (error) {
      throw new Error("Failed to create token");
    }
  }
});

// ✅ CORRECT: Everything through Effect.ts
export const createToken = confect.mutation({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.create(args);
    }).pipe(Effect.provide(MainLayer))
});

// Business logic in pure Effect service
export class TokenService extends Effect.Service<TokenService>()("TokenService", {
  effect: Effect.gen(function* () {
    const db = yield* ConvexDatabase;
    const blockchain = yield* BlockchainProvider;

    return {
      create: (args) =>
        Effect.gen(function* () {
          const result = yield* blockchain.mint(args);
          const token = yield* db.insert("entities", {
            entityType: "token",
            metadata: result,
          });
          return token;
        }).pipe(
          Effect.retry({ times: 3, schedule: Schedule.exponential("100 millis") }),
          Effect.timeout("30 seconds"),
          Effect.catchTags({
            BlockchainError: (e) => Effect.fail(new TokenCreationError(e)),
            DatabaseError: (e) => Effect.fail(new TokenCreationError(e)),
          })
        )
    };
  }),
}) {}
```

**Why 100% Effect.ts:**
- AI generates consistent patterns across entire codebase
- No mixing of error handling styles (typed vs try/catch)
- All dependencies visible in type signatures
- Automatic retry, timeout, resource management everywhere
- Testing is uniform (always mock Effect services)
- Observability built-in (traces, logs, metrics)

**Example Service:**
```typescript
export class AICloneService extends Effect.Service<AICloneService>()(
  "AICloneService",
  {
    effect: Effect.gen(function* () {
      // Dependencies injected automatically
      const db = yield* ConvexDatabase;
      const elevenlabs = yield* ElevenLabsProvider;
      const openai = yield* OpenAIProvider;
      
      return {
        createClone: (creatorId: Id<"entities">) =>
          Effect.gen(function* () {
            // Business logic here
            // Every step is explicit
            // Every error is typed
            const content = yield* db.getCreatorContent(creatorId);
            const voiceId = yield* elevenlabs.cloneVoice(content.samples);
            const personality = yield* openai.extractPersonality(content.text);
            
            return { voiceId, personality };
          }).pipe(
            // Composition: add retry, timeout, error handling
            Effect.retry({ times: 3 }),
            Effect.timeout("5 minutes"),
            Effect.catchTag("VoiceCloneError", handleError)
          )
      };
    }),
    dependencies: [ConvexDatabase.Default, ElevenLabsProvider.Default, OpenAIProvider.Default]
  }
) {}
```

**Why Effect.ts:**
- Business logic separated from Convex infrastructure
- Services compose cleanly (no callback hell)
- Errors are in the type signature (no silent failures)
- Easy to test (mock dependencies)
- Built-in retry, timeout, resource management

### Layer 4: Confect Bridge

Connects Effect.ts ↔ Convex:

```typescript
// Regular Convex mutation
export const purchaseTokens = mutation({
  handler: async (ctx, args) => {
    // Lots of try/catch, manual error handling
  }
});

// Confect mutation (Effect.ts wrapper)
export const purchaseTokens = confect.mutation({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const tokenService = yield* TokenService;
      return yield* tokenService.purchase(args);
    }).pipe(Effect.provide(MainLayer))
});
```

**Confect provides:**
- Automatic conversion of Convex context to Effect services
- Error handling (Convex errors → Effect errors)
- Type safety across the boundary

### Layer 4.5: DataProvider Interface (Backend-Agnostic)

**The Universal Ontology API**

The frontend communicates with ANY backend through the DataProvider interface. This makes the platform truly backend-agnostic—swap Convex for WordPress, Supabase, or Notion by changing ONE line.

```typescript
// frontend/src/providers/DataProvider.ts
import { Effect } from 'effect'

// DataProvider interface (every backend must implement this)
export interface DataProvider {
  // Dimension 1: Organizations operations
  organizations: {
    get: (id: string) => Effect.Effect<Organization, OrganizationNotFoundError>
    list: (params: {
      status?: 'active' | 'suspended' | 'trial' | 'cancelled'
      limit?: number
    }) => Effect.Effect<Organization[], Error>
    update: (id: string, updates: Partial<Organization>) => Effect.Effect<void, Error>
  }

  // Dimension 2: People operations
  people: {
    get: (id: string) => Effect.Effect<Person, PersonNotFoundError | UnauthorizedError>
    list: (params: {
      organizationId?: string
      role?: 'platform_owner' | 'org_owner' | 'org_user' | 'customer'
      filters?: Record<string, any>
      limit?: number
    }) => Effect.Effect<Person[], Error>
    create: (input: {
      email: string
      displayName: string
      role: string
      organizationId: string
      password?: string
    }) => Effect.Effect<string, PersonCreateError>
    update: (id: string, updates: Partial<Person>) => Effect.Effect<void, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Dimension 3: Things operations
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError | UnauthorizedError>
    list: (params: {
      type: ThingType
      organizationId?: string
      filters?: Record<string, any>
      limit?: number
    }) => Effect.Effect<Thing[], Error>
    create: (input: {
      type: ThingType
      name: string
      organizationId: string
      properties: Record<string, any>
    }) => Effect.Effect<string, Error>
    update: (id: string, updates: Partial<Thing>) => Effect.Effect<void, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Dimension 4: Connections operations
  connections: {
    create: (input: {
      fromThingId: string
      toThingId: string
      relationshipType: ConnectionType
      metadata?: Record<string, any>
    }) => Effect.Effect<string, ConnectionCreateError>
    getRelated: (params: {
      thingId: string
      relationshipType: ConnectionType
      direction: 'from' | 'to' | 'both'
    }) => Effect.Effect<Thing[], Error>
    getCount: (thingId: string, relationshipType: ConnectionType) => Effect.Effect<number, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Dimension 5: Events operations
  events: {
    log: (event: {
      type: EventType
      actorId: string              // Person ID (who did it)
      targetId?: string            // Thing/Person/Connection ID
      organizationId: string       // Org scope
      metadata?: Record<string, any>
    }) => Effect.Effect<void, Error>
    query: (params: {
      type?: EventType
      actorId?: string
      targetId?: string
      organizationId?: string
      from?: Date
      to?: Date
    }) => Effect.Effect<Event[], Error>
  }

  // Dimension 6: Knowledge operations
  knowledge: {
    embed: (params: {
      text: string
      sourceThingId?: string
      sourcePersonId?: string
      organizationId: string
      labels?: string[]
    }) => Effect.Effect<string, Error>
    search: (params: {
      query: string
      organizationId?: string
      limit?: number
    }) => Effect.Effect<KnowledgeMatch[], Error>
  }
}
```

**Provider Implementations:**

```typescript
// frontend/src/providers/convex/ConvexProvider.ts
export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  organizations = {
    get: (id) =>
      Effect.tryPromise({
        try: () => this.client.query(api.organizations.get, { id }),
        catch: (error) => new OrganizationNotFoundError(id)
      })
    // ... other operations
  }

  people = {
    get: (id) =>
      Effect.tryPromise({
        try: () => this.client.query(api.people.get, { id }),
        catch: (error) => new PersonNotFoundError(id)
      }),
    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.people.list, params),
        catch: (error) => new Error(String(error))
      })
    // ... other operations
  }

  things = {
    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.things.list, params),
        catch: (error) => new Error(String(error))
      }),
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.things.create, input),
        catch: (error) => new Error(String(error))
      })
    // ... other operations
  }

  // ... connections, events, knowledge
}

// frontend/astro.config.ts - Change backend with ONE line
export default defineConfig({
  integrations: [
    one({
      // ✅ Using Convex
      provider: convexProvider({
        url: import.meta.env.PUBLIC_BACKEND_URL
      })

      // Or use WordPress:
      // provider: wordpressProvider({
      //   url: 'https://yoursite.com',
      //   apiKey: import.meta.env.WORDPRESS_API_KEY
      // })

      // Or use Supabase:
      // provider: supabaseProvider({
      //   url: import.meta.env.PUBLIC_SUPABASE_URL,
      //   key: import.meta.env.PUBLIC_SUPABASE_KEY
      // })
    })
  ]
})
```

**Key Benefits:**
- ✅ Frontend code never changes when swapping backends
- ✅ Organizations can bring their own infrastructure
- ✅ Effect.ts provides type-safety across all providers
- ✅ Same interface for Convex, WordPress, Supabase, Notion
- ✅ All 6 dimensions supported universally

### Layer 5: Data Layer (6-Dimension Ontology - Plain Convex)

All data maps to 6 dimensions using **plain Convex schema** (no Convex Ents):

**Core Tables:**
- **organizations** - Multi-tenant partitioning (Dimension 1)
- **people** - Users & authorization (Dimension 2, separate from things!)
- **things** - Domain entities (Dimension 3) - All 66 entity types (courses, products, lessons, etc.)
- **connections** - Relationships (Dimension 4) - All 25 relationship types
- **events** - Actions (Dimension 5) - All 67 event types with actorId
- **knowledge** - AI intelligence (Dimension 6) - Vectors, embeddings, labels

**Schema Implementation:**
```typescript
// Plain Convex schema - NO Convex Ents
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Dimension 1: Organizations
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

  // Dimension 2: People (separate table, NOT things!)
  people: defineTable({
    email: v.string(),
    username: v.string(),
    displayName: v.string(),
    emailVerified: v.boolean(),
    role: v.string(),  // platform_owner, org_owner, org_user, customer
    organizationId: v.id("organizations"),
    organizations: v.array(v.id("organizations")),  // Multi-org membership
    permissions: v.optional(v.array(v.string())),
    image: v.optional(v.string()),
    bio: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_org", ["organizationId"])
    .index("by_role", ["role"]),

  // Dimension 3: Things
  things: defineTable({
    thingType: v.string(),
    name: v.string(),
    organizationId: v.id("organizations"),  // NEW: Every thing belongs to an org
    description: v.optional(v.string()),
    properties: v.any(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["thingType"])
    .index("by_org", ["organizationId"])  // NEW: Query things by org
    .index("by_org_type", ["organizationId", "thingType"])
    .searchIndex("search_things", {
      searchField: "name",
      filterFields: ["thingType", "organizationId"],
    }),

  // Dimension 4: Connections
  connections: defineTable({
    fromThingId: v.id("things"),          // Can connect things
    toThingId: v.id("things"),
    fromPersonId: v.optional(v.id("people")),  // OR connect people → things
    toPersonId: v.optional(v.id("people")),
    relationshipType: v.string(),
    organizationId: v.id("organizations"),  // Connections scoped to org
    metadata: v.any(),
    createdAt: v.number(),
  })
    .index("by_from", ["fromThingId"])
    .index("by_to", ["toThingId"])
    .index("by_org", ["organizationId"])
    .index("by_relationship", ["relationshipType"])
    .index("by_from_person", ["fromPersonId"])  // Query connections by person
    .index("by_to_person", ["toPersonId"]),

  // Dimension 5: Events
  events: defineTable({
    eventType: v.string(),
    actorId: v.id("people"),              // REQUIRED: Actor is always a person
    targetId: v.optional(v.union(
      v.id("things"),
      v.id("people"),
      v.id("connections")
    )),
    organizationId: v.id("organizations"),  // Events scoped to org
    metadata: v.any(),
    timestamp: v.number(),
  })
    .index("by_actor", ["actorId"])         // Query by who did it
    .index("by_target", ["targetId"])       // Query by what was acted upon
    .index("by_org", ["organizationId"])    // Query events by org
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_org_actor", ["organizationId", "actorId"]),

  // Dimension 6: Knowledge
  knowledge: defineTable({
    knowledgeType: v.string(),
    text: v.optional(v.string()),
    embedding: v.optional(v.array(v.number())),
    embeddingModel: v.optional(v.string()),
    embeddingDim: v.optional(v.number()),
    sourceThingId: v.optional(v.id("things")),
    sourcePersonId: v.optional(v.id("people")),  // Knowledge can come from people
    sourceField: v.optional(v.string()),
    organizationId: v.id("organizations"),  // Knowledge scoped to org
    chunk: v.optional(v.any()),
    labels: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["knowledgeType"])
    .index("by_source_thing", ["sourceThingId"])
    .index("by_source_person", ["sourcePersonId"])  // Query knowledge by person
    .index("by_org", ["organizationId"])
    .index("by_created", ["createdAt"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["knowledgeType", "organizationId"]
    }),
});
```

**Key Design Principles:**
- Organizations partition ALL data (perfect multi-tenant isolation)
- People are represented as things with `role` property (platform_owner, org_owner, org_user, customer)
- Every thing, connection, event, and knowledge item is scoped to an organization
- No ORM layer (Convex Ents) - direct database access
- Flexible metadata fields for type-specific data
- Comprehensive indexing for query performance (including org-scoped indexes)

**New Entity Types** (Strategy.md support):
- **Platform**: website, landing_page, template, livestream, recording, media_asset
- **Business**: payment, subscription, invoice, metric, insight, prediction, report
- **Marketing**: notification, email_campaign, announcement, referral, campaign, lead

**Optimized Connection Types (24 total):**
- User relationships: follows, subscribes_to, owns, purchased
- Content relationships: created, belongs_to, tagged_with, appears_in
- Token relationships: holds_tokens, staked_in, earned_from, spent_on
- Platform relationships: hosted_on, deployed_to, integrated_with
- Business relationships: paid_for, invoiced_by, tracked_by, referred_by

**Optimized Event Types (38 total):**
- User events: user_registered, profile_updated, preferences_changed
- Content events: content_created, published, viewed, liked, shared
- Token events: tokens_purchased, transferred, staked, unstaked
- Platform events: website_created, livestream_started, recording_created
- Business events: payment_processed, subscription_started, invoice_generated

See `docs/Ontology.md` for complete details.

#### Type System Optimization: 24 Connections + 38 Events

**Previous Approach:** 33 connection types + 54 event types = 87 total types
**Optimized Approach:** 25 connection types + 35 event types = 62 total types (-29% reduction)

**Why Fewer Types is Better:**
- Less cognitive load for AI agents
- Fewer type discriminations in code
- Easier to maintain type consistency
- More generic types handle more use cases
- Reduced documentation burden

**Connection Type Consolidation Strategy:**
```typescript
// ❌ BEFORE: Too specific (33 types)
"follows_creator"
"follows_community"
"follows_course"
// Each follow type was separate

// ✅ AFTER: Generic (24 types)
"follows"
// Single type, entity metadata determines what's being followed
// Connection from User → Creator/Community/Course all use "follows"

// Metadata example:
{
  fromEntityId: "user-123",
  toEntityId: "creator-456",
  relationshipType: "follows",
  metadata: {
    followedEntityType: "creator",  // Stored in metadata
    notificationsEnabled: true
  }
}
```

**24 Core Connection Types:**
1. **User Relationships** (6 types):
   - `follows` - User follows any entity (creator, community, course)
   - `subscribes_to` - Paid subscription to any entity
   - `owns` - Ownership of any entity
   - `purchased` - Purchase of any entity
   - `created` - Creation of any entity
   - `manages` - Management/admin rights

2. **Content Relationships** (6 types):
   - `belongs_to` - Entity belongs to parent entity
   - `tagged_with` - Entity tagged with category
   - `appears_in` - Entity appears in another entity
   - `references` - Entity references another entity
   - `derived_from` - Entity derived from source entity
   - `version_of` - Entity is version of another entity

3. **Token & Financial** (5 types):
   - `holds_tokens` - Token balance
   - `staked_in` - Staked token position
   - `earned_from` - Token earnings source
   - `spent_on` - Token expenditure
   - `paid_for` - Fiat payment for entity

4. **Platform & Infrastructure** (4 types):
   - `hosted_on` - Platform hosting
   - `deployed_to` - Deployment location
   - `integrated_with` - Integration connection
   - `streamed_on` - Livestream platform

5. **Business & Analytics** (3 types):
   - `tracked_by` - Metric tracking
   - `invoiced_by` - Invoice relationship
   - `referred_by` - Referral source

**38 Core Event Types:**
1. **User Events** (8 types):
   - `user_registered`, `user_updated`, `user_deleted`
   - `profile_updated`, `preferences_changed`
   - `login`, `logout`, `password_reset`

2. **Content Events** (10 types):
   - `content_created`, `content_updated`, `content_deleted`
   - `published`, `unpublished`, `archived`
   - `viewed`, `liked`, `shared`, `commented`

3. **Token Events** (8 types):
   - `tokens_purchased`, `tokens_transferred`, `tokens_burned`
   - `tokens_staked`, `tokens_unstaked`
   - `tokens_earned`, `tokens_spent`, `tokens_claimed`

4. **Platform Events** (5 types):
   - `website_created`, `website_deployed`, `website_updated`
   - `livestream_started`, `livestream_ended`

5. **Business Events** (7 types):
   - `payment_processed`, `payment_failed`, `payment_refunded`
   - `subscription_started`, `subscription_cancelled`
   - `invoice_generated`, `invoice_paid`

**Benefits of Consolidation:**
- **AI Generation**: Fewer types = more consistent patterns
- **Type Safety**: Still strongly typed via metadata
- **Flexibility**: Generic types handle edge cases
- **Maintainability**: Less code duplication
- **Query Performance**: Fewer index types to maintain

**Metadata Pattern for Type Specificity:**
```typescript
// Generic type + rich metadata = type-safe flexibility
interface Connection {
  fromEntityId: Id<"entities">;
  toEntityId: Id<"entities">;
  relationshipType: "follows" | "owns" | "subscribes_to" | /* ... 21 more */;
  metadata: {
    // Type-specific metadata stored here
    entityType?: string;
    amount?: number;
    status?: string;
    permissions?: string[];
    // Any additional context
  };
}

// Query example: Get all follows (regardless of what's being followed)
await ctx.db
  .query("connections")
  .withIndex("by_relationship", (q) =>
    q.eq("relationshipType", "follows")
  )
  .filter((q) => q.eq(q.field("fromEntityId"), userId))
  .collect();

// Query example: Get all creator follows specifically
await ctx.db
  .query("connections")
  .withIndex("by_relationship", (q) =>
    q.eq("relationshipType", "follows")
  )
  .filter((q) =>
    q.and(
      q.eq(q.field("fromEntityId"), userId),
      q.eq(q.field("metadata.entityType"), "creator")
    )
  )
  .collect();
```

See `docs/Ontology.md` for complete details.

### Layer 6: External Service Providers

14 external service providers integrated via Effect.ts with **multi-chain architecture**:

**Core AI & Content**:
- **OpenAI** - LLM, embeddings, content generation
- **ElevenLabs** - Voice cloning and synthesis
- **D-ID** - AI appearance/avatar cloning
- **HeyGen** - Premium AI video avatars

**Multi-Chain Blockchain Providers** (separate services per chain):
- **SuiProvider** - Sui blockchain integration (Move language, high throughput)
- **BaseProvider** - Base (Coinbase L2) integration (EVM-compatible, low fees)
- **SolanaProvider** - Solana blockchain integration (high-speed, low-cost)
- **Alchemy** - Multi-chain RPC infrastructure (supports all chains)

**CRITICAL: Stripe is for FIAT ONLY** (not blockchain):
- **StripeProvider** - Fiat payment processing, subscriptions, traditional invoicing
- Used ONLY for USD/EUR/etc payments
- Does NOT handle crypto or blockchain transactions
- Separate from all blockchain providers

**CRITICAL: Cloudflare is for LIVESTREAMING ONLY**:
- **CloudflareProvider** - Live streaming and video hosting ONLY
- Stream API for live broadcasts
- Video storage and playback
- NOT used for web hosting (that's Cloudflare Pages, different service)

**Communications**:
- **Resend** - Primary email service
- **SendGrid** - Advanced email with tracking
- **Twilio** - SMS and voice communications

**Infrastructure**:
- **AWS** - Media storage (S3), CDN (CloudFront)

**Multi-Chain Architecture Pattern:**
```typescript
// Each blockchain is a separate Effect.ts provider
export class SuiProvider extends Effect.Service<SuiProvider>()("SuiProvider", {
  effect: Effect.gen(function* () {
    return {
      transfer: (args) => Effect.gen(function* () { /* Sui-specific */ }),
      mintNFT: (args) => Effect.gen(function* () { /* Sui Move contract */ }),
      getBalance: (address) => Effect.gen(function* () { /* Sui RPC */ }),
    };
  }),
}) {}

export class BaseProvider extends Effect.Service<BaseProvider>()("BaseProvider", {
  effect: Effect.gen(function* () {
    return {
      transfer: (args) => Effect.gen(function* () { /* Base L2 */ }),
      mintNFT: (args) => Effect.gen(function* () { /* ERC-721 on Base */ }),
      getBalance: (address) => Effect.gen(function* () { /* Base RPC */ }),
    };
  }),
}) {}

export class SolanaProvider extends Effect.Service<SolanaProvider>()("SolanaProvider", {
  effect: Effect.gen(function* () {
    return {
      transfer: (args) => Effect.gen(function* () { /* Solana web3.js */ }),
      mintNFT: (args) => Effect.gen(function* () { /* Metaplex */ }),
      getBalance: (address) => Effect.gen(function* () { /* Solana RPC */ }),
    };
  }),
}) {}

// Services choose which chain based on user preference or entity metadata
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const sui = yield* SuiProvider;
      const base = yield* BaseProvider;
      const solana = yield* SolanaProvider;

      return {
        transfer: (args) =>
          Effect.gen(function* () {
            // Route to correct chain based on tokenId metadata
            const token = yield* db.get(args.tokenId);

            switch (token.metadata.blockchain) {
              case "sui": return yield* sui.transfer(args);
              case "base": return yield* base.transfer(args);
              case "solana": return yield* solana.transfer(args);
            }
          })
      };
    }),
    dependencies: [SuiProvider.Default, BaseProvider.Default, SolanaProvider.Default]
  }
) {}
```

**Why Separate Providers Per Chain:**
- Different APIs (Sui uses Move, Base uses EVM, Solana uses web3.js)
- Different transaction models and gas fee structures
- Type safety per chain (each has unique error types)
- Easy to add new chains without modifying existing code
- Users can choose preferred blockchain per token/NFT

All providers follow Effect.ts patterns:
- Typed errors in signature
- Automatic dependency injection
- Composable operations
- Built-in retry logic

See `docs/Service Providers.md` and `docs/Service Providers - New.md` for details.

---

## Why Functional Programming Enables Better AI Generation

### Problem: Imperative Code Is Unpredictable

**Imperative style (typical code):**
```typescript
async function purchaseTokens(userId, tokenId, amount) {
  // State mutation everywhere
  let payment = null;
  let tokens = null;
  let error = null;
  
  try {
    payment = await stripe.charge(amount);
    tokens = await blockchain.mint(amount);
    await db.updateBalance(userId, tokens);
  } catch (e) {
    error = e;
    // Try to rollback? Maybe? Depends on where we failed
    if (payment) {
      await stripe.refund(payment.id);
    }
    if (tokens) {
      // Can we even rollback blockchain?
    }
  }
  
  // What state are we in? Unclear.
}
```

**Problems for AI:**
1. **Implicit state** - AI can't track where mutations happen
2. **Error handling unclear** - Try/catch doesn't say what errors can occur
3. **Partial failures complex** - Rollback logic is manual and error-prone
4. **Hard to compose** - Can't easily combine with other functions
5. **Testing difficult** - Need to mock global state

**AI generates buggy code because:**
- Can't predict all state changes
- Doesn't know what errors to handle
- Misses edge cases in rollback logic
- Creates tight coupling

### Solution: Functional Programming Is Predictable

**Functional style (Effect.ts):**
```typescript
const purchaseTokens = (
  userId: Id<"entities">,
  tokenId: Id<"entities">,
  amount: number
): Effect.Effect<
  { paymentId: string; tokens: number },           // Success type
  StripeError | BlockchainError | DatabaseError,  // Error types (explicit!)
  TokenService                                     // Dependencies (explicit!)
> =>
  Effect.gen(function* () {
    const service = yield* TokenService;
    
    // All operations must succeed together
    const [payment, tokens] = yield* Effect.all([
      service.charge(userId, amount),
      service.mint(tokenId, amount),
    ]);
    
    // Automatically rolls back on any failure
    yield* service.recordPurchase(userId, payment, tokens);
    
    return { paymentId: payment.id, tokens };
  }).pipe(
    // Declarative error handling
    Effect.onError(() => 
      Effect.all([
        service.refund(payment.id),
        service.burn(tokens)
      ])
    )
  );
```

**Benefits for AI:**
1. **Pure functions** - Same input → same output (predictable)
2. **Typed errors** - AI knows exactly what can fail
3. **Explicit dependencies** - AI sees what's needed
4. **Automatic rollback** - Declarative, not manual
5. **Composable** - AI can combine functions safely

**AI generates better code because:**
- All inputs/outputs are in the type signature
- Error cases are exhaustive in types
- Dependencies are explicit
- Rollback is automatic
- Functions compose predictably

---

## Functional Programming Principles That Help AI

### 1. Pure Functions

**Pure function:**
```typescript
// ✅ Pure: Same input → same output, no side effects
function calculateTokenPrice(
  supply: number,
  demand: number
): number {
  return demand / supply;
}
```

**Impure function:**
```typescript
// ❌ Impure: Depends on external state, has side effects
let globalSupply = 1000000;

function calculateTokenPrice(demand: number): number {
  globalSupply -= 100;  // Side effect!
  return demand / globalSupply;  // Depends on mutable state!
}
```

**Why AI prefers pure functions:**
- AI can reason about behavior from signature alone
- No hidden dependencies to track
- No order-of-execution bugs
- Can be moved/refactored safely
- Easy to test (no setup needed)

### 2. Immutability

**Immutable:**
```typescript
// ✅ Immutable: Create new, don't modify
const addToken = (
  balance: TokenBalance,
  amount: number
): TokenBalance => ({
  ...balance,
  amount: balance.amount + amount,
  updatedAt: Date.now()
});
```

**Mutable:**
```typescript
// ❌ Mutable: Modify in place
const addToken = (
  balance: TokenBalance,
  amount: number
): void => {
  balance.amount += amount;  // Mutation!
  balance.updatedAt = Date.now();
};
```

**Why AI prefers immutability:**
- AI doesn't have to track where mutations occur
- No aliasing bugs (two references to same object)
- Can reason about state at any point in time
- Easier to parallelize operations
- Prevents accidental data corruption

### 3. Composition Over Inheritance

**Composition:**
```typescript
// ✅ Compose small functions
const createClone = (creatorId: Id<"entities">) =>
  Effect.gen(function* () {
    const content = yield* fetchContent(creatorId);
    const voice = yield* cloneVoice(content);
    const personality = yield* extractPersonality(content);
    
    return { voice, personality };
  });

// Each piece is independent, reusable
```

**Inheritance:**
```typescript
// ❌ Inheritance hierarchy (rigid, complex)
class BaseClone {
  constructor(protected creator: Creator) {}
}

class VoiceClone extends BaseClone {
  async clone() { /* ... */ }
}

class PersonalityClone extends VoiceClone {
  async extract() { /* ... */ }
}

// AI has to understand entire hierarchy
```

**Why AI prefers composition:**
- Smaller, independent pieces
- No need to understand inheritance chains
- Can mix and match functionality
- Easier to modify without breaking other parts
- Clear data flow (input → process → output)

### 4. Typed Errors (Effect.ts)

**Typed errors:**
```typescript
// ✅ Errors in type signature
const cloneVoice = (
  samples: string[]
): Effect.Effect<
  VoiceId,
  InsufficientSamplesError | VoiceCloneFailedError,  // Explicit!
  ElevenLabsProvider
> => { /* ... */ }

// AI knows exactly what to catch
Effect.catchTags({
  InsufficientSamplesError: (e) => askForMoreSamples(),
  VoiceCloneFailedError: (e) => useDefaultVoice()
})
```

**Generic errors:**
```typescript
// ❌ Generic error (AI doesn't know what can fail)
async function cloneVoice(samples: string[]): Promise<VoiceId> {
  try {
    // What can go wrong? Who knows!
    return await elevenLabs.clone(samples);
  } catch (e) {
    // Lost all type information
    throw e;
  }
}
```

**Why AI prefers typed errors:**
- Compiler enforces handling all error cases
- AI can't forget to handle errors
- Clear what errors are possible
- Exhaustive pattern matching
- No silent failures

### 5. Dependency Injection

**Dependency injection:**
```typescript
// ✅ Dependencies explicit
class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const stripe = yield* StripeProvider;
      const blockchain = yield* BlockchainProvider;
      
      return { /* methods */ };
    }),
    dependencies: [StripeProvider.Default, BlockchainProvider.Default]
  }
) {}

// AI knows what's needed
// AI can mock for tests
```

**Global dependencies:**
```typescript
// ❌ Global imports (implicit dependencies)
import { stripe } from '@/lib/stripe';
import { blockchain } from '@/lib/blockchain';

async function purchaseTokens() {
  // AI doesn't know these are needed until runtime
  await stripe.charge();
  await blockchain.mint();
}
```

**Why AI prefers DI:**
- All dependencies visible in type signature
- Easy to mock for testing
- Clear boundaries between modules
- Can swap implementations easily
- No hidden global state

---

## How This Scales With AI Code Generation

### At 100 Files

**Imperative codebase:**
- AI generates code with implicit dependencies
- Global state makes changes risky
- Hard to predict what breaks
- Tests are integration tests (slow, flaky)
- Refactoring is dangerous

**Functional codebase (ONE):**
- AI generates code with explicit dependencies
- No global state to corrupt
- Types catch breaking changes
- Tests are unit tests (fast, reliable)
- Refactoring is safe (types + tests)

### At 1,000 Files

**Imperative codebase:**
- AI generates increasingly coupled code
- Side effects everywhere
- Debugging requires tracing through many files
- Fear of changing anything
- **Code quality degrades**

**Functional codebase (ONE):**
- AI generates composable services
- Pure functions with clear boundaries
- Each function testable in isolation
- Can change implementation without breaking interface
- **Code quality improves** (later code uses earlier patterns)

### At 10,000 Files (Large Application)

**Imperative codebase:**
- AI generates duplicate logic (doesn't recognize patterns)
- State management is spaghetti
- Technical debt compounds
- **AI becomes a liability**

**Functional codebase (ONE):**
- AI recognizes and reuses services
- Services compose into higher-level services
- Patterns are clear and consistent
- **AI becomes more valuable** (understands architecture deeply)

---

## Concrete Example: Token Purchase Flow

### Step 1: User Clicks "Buy Tokens" (Frontend)

```tsx
// src/components/features/tokens/TokenPurchase.tsx
export function TokenPurchase({ tokenId }: { tokenId: Id<"entities"> }) {
  const purchase = useMutation(api.tokens.purchase);
  
  return (
    <Button onClick={() => purchase({ tokenId, amount: 100 })}>
      Buy 100 Tokens
    </Button>
  );
}
```

### Step 2: Convex Mutation Receives Request

```typescript
// convex/mutations/tokens.ts
export const purchase = confect.mutation({
  args: { tokenId: v.id("entities"), amount: v.number() },
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const userId = yield* getUserId(ctx);
      const tokenService = yield* TokenService;
      
      return yield* tokenService.purchase({
        userId,
        tokenId: args.tokenId,
        amount: args.amount
      });
    }).pipe(Effect.provide(MainLayer))
});
```

### Step 3: Effect.ts Service Orchestrates

```typescript
// convex/services/tokens/purchase.ts
export class TokenService extends Effect.Service<TokenService>()(
  "TokenService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;
      const stripe = yield* StripeProvider;        // FIAT payments only
      const sui = yield* SuiProvider;              // Sui blockchain
      const base = yield* BaseProvider;            // Base L2
      const solana = yield* SolanaProvider;        // Solana

      return {
        purchase: ({ userId, tokenId, amount, paymentMethod }) =>
          Effect.gen(function* () {
            // Get token metadata to determine blockchain
            const token = yield* db.get(tokenId);
            const blockchain = token.metadata.blockchain; // "sui" | "base" | "solana"

            // Step 1: Process payment (FIAT via Stripe OR crypto direct)
            const payment = paymentMethod === "fiat"
              ? yield* stripe.charge({
                  amount: amount * 0.10,  // $0.10 per token (fiat)
                  currency: "usd"
                })
              : { method: "crypto", txHash: null }; // Crypto payment handled on-chain

            // Step 2: Mint tokens on the correct blockchain
            const mintResult = yield* (
              blockchain === "sui" ? sui.mintToken({ amount, toAddress: userId }) :
              blockchain === "base" ? base.mintToken({ amount, toAddress: userId }) :
              blockchain === "solana" ? solana.mintToken({ amount, toAddress: userId }) :
              Effect.fail(new UnsupportedBlockchainError(blockchain))
            );

            // Step 3: Record in database
            yield* db.insert("events", {
              entityId: tokenId,
              eventType: "tokens_purchased",
              timestamp: Date.now(),
              actorType: "user",
              actorId: userId,
              metadata: {
                amount,
                blockchain,
                paymentMethod,
                paymentId: payment.method === "crypto" ? null : payment.id,
                txHash: mintResult.txHash
              }
            });

            // Step 4: Update balance connection
            yield* db.upsert("connections", {
              fromEntityId: userId,
              toEntityId: tokenId,
              relationshipType: "holds_tokens",
              metadata: {
                balance: amount,
                blockchain,
                lastUpdated: Date.now()
              }
            });

            return { success: true, amount, blockchain, txHash: mintResult.txHash };
          }).pipe(
            // Automatic rollback on any failure
            Effect.onError((error) =>
              Effect.gen(function* () {
                // Refund fiat payment if it was processed
                if (payment.method !== "crypto") {
                  yield* stripe.refund(payment.id);
                }

                // Burn tokens on the correct blockchain
                if (mintResult) {
                  yield* (
                    blockchain === "sui" ? sui.burnToken({ amount, txHash: mintResult.txHash }) :
                    blockchain === "base" ? base.burnToken({ amount, txHash: mintResult.txHash }) :
                    blockchain === "solana" ? solana.burnToken({ amount, txHash: mintResult.txHash }) :
                    Effect.succeed(null)
                  );
                }
              })
            )
          )
      };
    }),
    dependencies: [
      ConvexDatabase.Default,
      StripeProvider.Default,      // Fiat only
      SuiProvider.Default,          // Multi-chain
      BaseProvider.Default,
      SolanaProvider.Default
    ]
  }
) {}
```

### Why This Is AI-Friendly

**AI can see:**
1. **Inputs:** `userId`, `tokenId`, `amount`, `paymentMethod` (explicit)
2. **Outputs:** `{ success: boolean, amount: number, blockchain: string, txHash: string }` (explicit)
3. **Errors:** `StripeError | SuiError | BaseError | SolanaError | UnsupportedBlockchainError | DatabaseError` (explicit)
4. **Dependencies:** `ConvexDatabase`, `StripeProvider`, `SuiProvider`, `BaseProvider`, `SolanaProvider` (explicit)
5. **Side effects:** Fiat payment OR crypto payment, minting on specific blockchain, database writes (explicit)
6. **Rollback:** Automatic if any step fails, chain-specific rollback (declarative)
7. **Multi-chain routing:** Token metadata determines which blockchain to use (explicit)

**AI can generate:**
- Tests with mocked services for each blockchain
- Similar flows for other multi-chain operations
- Error handling for each blockchain's unique errors
- Chain-specific logging and monitoring
- Rate limiting per blockchain
- Retry logic with chain-specific strategies
- New blockchain integrations following the same pattern

**AI cannot break:**
- Type system prevents invalid states
- Compiler catches missing error handling per chain
- Dependencies are wired automatically
- Rollback is automatic and chain-aware
- Unsupported blockchains fail explicitly (not silently)
- Fiat vs crypto payment paths are type-safe

**Multi-chain pattern benefits:**
1. **Consistency:** Same interface for all blockchains
2. **Type Safety:** Each chain has unique error types
3. **Extensibility:** Add new chains without modifying existing code
4. **Testing:** Mock individual chains independently
5. **Observability:** Chain-specific tracing and metrics

---

## Testing With Functional Programming

### Unit Test (Service)

```typescript
// tests/unit/services/token.test.ts
import { Effect, Layer } from "effect";
import { TokenService } from "@/convex/services/tokens/purchase";

describe("TokenService.purchase", () => {
  it("should purchase tokens successfully", async () => {
    // Mock dependencies
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: () => Effect.succeed({ id: "pay_123" })
    });
    
    const MockBlockchain = Layer.succeed(BlockchainProvider, {
      mint: () => Effect.succeed({ txHash: "0x456" })
    });
    
    const MockDB = Layer.succeed(ConvexDatabase, {
      insert: () => Effect.succeed("evt_789"),
      upsert: () => Effect.succeed("conn_012")
    });
    
    const TestLayer = Layer.mergeAll(MockStripe, MockBlockchain, MockDB);
    
    // Run test
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* TokenService;
        return yield* service.purchase({
          userId: "user-123",
          tokenId: "token-456",
          amount: 100
        });
      }).pipe(Effect.provide(TestLayer))
    );
    
    expect(result.success).toBe(true);
    expect(result.amount).toBe(100);
  });
  
  it("should rollback on payment failure", async () => {
    const MockStripe = Layer.succeed(StripeProvider, {
      charge: () => Effect.fail(new StripeError("Card declined"))
    });
    
    // Test that blockchain.mint is NOT called
    const mintSpy = vi.fn();
    const MockBlockchain = Layer.succeed(BlockchainProvider, {
      mint: () => Effect.sync(mintSpy)
    });
    
    const TestLayer = Layer.mergeAll(MockStripe, MockBlockchain);
    
    await expect(
      Effect.runPromise(
        /* ... */.pipe(Effect.provide(TestLayer))
      )
    ).rejects.toThrow("Card declined");
    
    expect(mintSpy).not.toHaveBeenCalled();
  });
});
```

**AI can generate these tests because:**
- Clear service interface
- Easy to mock dependencies
- Behavior is predictable
- Error cases are explicit

---

## Summary: Why This Architecture Works for AI

### Traditional Approach (Fails at Scale)
```
Imperative code
  → Hidden state
  → Implicit errors
  → Tight coupling
  → AI generates bugs
  → Code quality degrades
  → AI becomes liability
```

### ONE Approach (Improves at Scale)
```
Functional programming
  → Pure functions
  → Typed errors
  → Explicit dependencies
  → AI generates correct code
  → Code quality improves
  → AI becomes more valuable
```

**The key insight:** AI is pattern matching. Functional programming creates consistent, explicit patterns that AI can recognize and replicate.

**The result:** Your 10,000-file codebase is EASIER to work with than your 100-file codebase because:
1. AI learns patterns from existing code
2. Types catch breaking changes automatically
3. Services compose rather than duplicate
4. Tests verify behavior mechanically
5. Refactoring is safe and automated

**This is why larger codebases get BETTER with functional programming + AI, not worse.**

---

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

---

## 🎯 Benefits of the Three-Layer Architecture

### For Developers

**Frontend Developers:**
- Work independently with Astro + React
- Use Convex hooks for real-time data (no backend changes needed)
- Call Hono API for complex operations (clear contracts)
- Rapid prototyping with "vibe code"
- Full TypeScript support with generated types

**Backend Developers:**
- Focus on business logic in Effect.ts services
- Clear separation between API layer (Hono) and data layer (Convex)
- Easy to test (mock dependencies via Effect layers)
- Composable services (combine small functions into larger ones)
- Automatic retry, timeout, error handling

**Full-Stack Developers:**
- Clear boundaries between layers
- Easy to understand data flow (Frontend → Effect.ts → Backend)
- Consistent patterns across entire stack
- Type safety end-to-end (TypeScript + Effect.ts)

### For AI Code Generation

**Why This Architecture Works for AI:**

1. **Predictable Patterns:** Same structure for every feature (map to ontology → Effect.ts service → Hono route → React component)
2. **Explicit Types:** AI knows exactly what inputs, outputs, errors, and dependencies are needed
3. **Composable:** AI can combine existing services to create new features
4. **Testable:** AI can generate tests by mocking Effect layers
5. **Self-Improving:** Each new feature makes the next feature easier (AI learns patterns)

**Example: AI generates a new feature in minutes:**
```
1. Read docs/Ontology.md (understand 6-dimension model: organizations, people, things, connections, events, knowledge)
2. Read docs/Frontend.md (understand Astro + React patterns)
3. Read docs/Hono.md (understand Effect.ts service patterns)
4. Generate Effect.ts service (pure business logic)
5. Generate Hono route (thin wrapper)
6. Generate Convex wrapper (confect bridge)
7. Generate React component (uses Convex hooks + Hono API)
8. Generate tests (mock Effect layers)
9. Done! Feature is complete, type-safe, tested
```

### For Multi-Tenancy

**Different orgs can customize their frontend:**
- Each org has their own Astro deployment (unique branding, features)
- All orgs share the same Hono API + Convex backend
- Backend remains stable while frontends evolve independently
- API contracts ensure compatibility

**Example:**
```
Org A: Marketing site with blog (Astro + shadcn/ui dark theme)
Org B: E-commerce store (Astro + shadcn/ui + custom components)
Org C: Dashboard app (Astro + custom charting library)

All three: Share same Hono API + Convex backend (auth, tokens, content)
```

### For Performance

**Deployment Strategy:**
```
Frontend: Cloudflare Pages (global edge network)
    ↓
Hono API: Cloudflare Workers (edge compute, sub-100ms)
    ↓
Convex: Real-time database (global replication)
```

**Result:**
- Sub-100ms response times globally
- Real-time data subscriptions via Convex
- Static pages cached at the edge (Cloudflare Pages)
- API routes execute at the edge (Cloudflare Workers)
- Database queries optimized with indexes

## The Complete 6-Dimension Picture

**Example: User purchases a course**

Here's how all 6 dimensions work together in a real scenario:

```
1. Organization → "fitnesspro" (Id<'organizations'>)
   └─ Multi-tenant boundary
   └─ Settings: allow purchases, payment methods

2. Person → "john@fitnesspro.com" (Id<'people'>)
   └─ Separate people table (NOT a thing!)
   └─ role: "customer"
   └─ organizationId: fitnesspro_id

3. Thing → "Fitness Fundamentals Course" (Id<'things'>)
   └─ type: "course"
   └─ organizationId: fitnesspro_id
   └─ properties: { price: 99, instructor: "Jane" }

4. Connection → Purchase (Id<'connections'>)
   └─ fromPersonId: john_person_id (NOT thingId!)
   └─ toThingId: course_thing_id
   └─ type: "purchased"
   └─ metadata: { amount: 99, method: "stripe" }

5. Event → "purchase_completed" (Id<'events'>)
   └─ actorId: john_person_id (Person ID - who did it)
   └─ targetId: connection_id (what happened)
   └─ organizationId: fitnesspro_id
   └─ metadata: { amount: 99, stripe_id: "ch_123" }

6. Knowledge → Purchase pattern (Id<'knowledge'>)
   └─ sourcePersonId: john_person_id
   └─ AI learns: John prefers fitness courses, buys on weekends
   └─ Can recommend similar courses
```

**When the same person purchases from a different org:**

```
1. Organization → "yoga-academy" (different org!)
2. Person → Same John, but organizationId: yoga_academy_id
3. Thing → "Beginner Yoga" (yoga-academy course)
4. Connection → New purchase connection (yoga_academy scoped)
5. Event → Logged to yoga-academy (perfect isolation)
6. Knowledge → Separate yoga-academy knowledge (no cross-org leakage)
```

**Key Benefits:**
- ✅ **Organizations** isolate data (fitnesspro can't see yoga-academy)
- ✅ **People** act across orgs (John can belong to multiple orgs)
- ✅ **Things** are org-scoped (courses belong to specific orgs)
- ✅ **Connections** link people → things (purchases, enrollments)
- ✅ **Events** track all actions with actorId (complete audit trail)
- ✅ **Knowledge** learns patterns (AI recommends based on behavior)

**DataProvider Makes It Backend-Agnostic:**

```typescript
// Frontend code - works with ANY backend
const program = Effect.gen(function* () {
  const provider = yield* DataProvider

  // Purchase flow
  const person = yield* provider.people.get(userId)
  const course = yield* provider.things.get(courseId)

  // Create purchase connection
  const purchaseId = yield* provider.connections.create({
    fromPersonId: person._id,
    toThingId: course._id,
    relationshipType: "purchased",
    organizationId: person.organizationId,
    metadata: { amount: 99, method: "stripe" }
  })

  // Log event
  yield* provider.events.log({
    type: "purchase_completed",
    actorId: person._id,
    targetId: purchaseId,
    organizationId: person.organizationId,
    metadata: { amount: 99 }
  })

  return { success: true, purchaseId }
})

// Same code works with:
// - ConvexProvider (real-time database)
// - WordPressProvider (WooCommerce backend)
// - SupabaseProvider (PostgreSQL database)
// - NotionProvider (Notion databases)
```

**This is why the architecture is beautiful:**
- Frontend doesn't know which backend it's talking to
- People are separate from things (clear authorization)
- Everything is org-scoped (perfect multi-tenancy)
- Events log who did what (complete audit trail)
- Knowledge learns from behavior (AI gets smarter)
- Effect.ts makes it all type-safe

---

## Next Steps for AI Agents

When implementing a new feature:

1. **Read the documentation:**
   - **docs/Frontend.md** - If building UI components or pages
   - **docs/Hono.md** - If building API routes or Effect.ts services
   - **docs/Architecture.md** - To understand how everything fits together
   - **docs/Ontology.md** - Map feature to 6 dimensions (organizations, people, things, connections, events, knowledge)

2. **Design the layers:**
   - **Frontend:** Astro page + React component (uses Convex hooks + Hono API)
   - **Glue:** Effect.ts service (pure business logic)
   - **Backend:** Hono route (thin wrapper) + Convex wrapper (confect bridge)

3. **Implement with patterns:**
   - 100% Effect.ts for business logic (NO async/await)
   - Typed errors with `_tag` pattern
   - Dependency injection via Effect layers
   - Automatic retry, timeout, rollback

4. **Test thoroughly:**
   - Unit tests for Effect.ts services (mock layers)
   - Integration tests for Hono routes
   - E2E tests for React components

5. **Document patterns:**
   - Add to `docs/Patterns.md` for future AI
   - Update `docs/Files.md` with new file locations

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

**The Result:** Each feature makes the next feature easier because AI has more patterns to learn from, and the architecture ensures consistency across all layers.