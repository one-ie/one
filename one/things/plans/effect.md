# Effect.ts Integration Plan: Backend-Agnostic Architecture

**Status:** ✅ Phase 1-2 Complete (DataProvider + Services) | 🚧 Phases 3-7 In Progress
**Version:** 2.0.0 - Backend-Agnostic Edition
**Last Updated:** 2025-10-24

## Executive Summary

**Effect.ts powers the backend-agnostic architecture of ONE Platform** by providing type-safe, composable services that work with ANY backend (Convex, WordPress, Supabase, Notion, etc.). This document describes how Effect.ts integrates with the DataProvider pattern to enable:

1. **Backend Independence**: Frontend works with any backend that implements the 6-dimension ontology
2. **Type Safety**: Complete type inference from database to UI with zero runtime overhead
3. **Composability**: Services compose via Layer.mergeAll for dependency injection
4. **Error Handling**: Tagged errors replace try/catch throughout the stack
5. **Testing**: Mock providers enable isolated service testing

**Key Principle:** Build the architecture right. Build features once. Never refactor for flexibility.

Based on production patterns from 14.ai (AI customer support) and the unified implementation plan (11 weeks to complete platform).

---

## Architecture Overview: The Three Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Astro + React)                      │
│  - Backend-agnostic UI and pages                                │
│  - Uses services, never calls backend directly                  │
│  - Works with ANY backend via DataProvider                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│              EFFECT.TS SERVICES (Backend-Agnostic)              │
│  - ThingService (all 66 types)                                  │
│  - ConnectionService (all 25 types)                             │
│  - EventService (all 67 events)                                 │
│  - KnowledgeService (RAG + vectors)                             │
│  - GroupService, PeopleService                                  │
│                                                                  │
│  ✅ Type-safe with tagged errors                                │
│  ✅ Composable via Layer.mergeAll                               │
│  ✅ Testable with mock providers                                │
│  ✅ Backend-agnostic via DataProvider                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│         DATAPROVIDER INTERFACE (Universal Backend API)          │
│  groups:      { get, list, update }                            │
│  people:      { get, list, create, update }                    │
│  things:      { get, list, create, update, delete }           │
│  connections: { create, getRelated, getCount }                 │
│  events:      { log, query }                                   │
│  knowledge:   { embed, search }                                │
│                                                                  │
│  ✅ Implementation-agnostic interface                           │
│  ✅ 6-dimension ontology as contract                            │
│  ✅ Swap backends by changing ONE line                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│        BACKEND PROVIDERS (Choose One - ONE Line Config!)        │
│                                                                  │
│  ConvexProvider     ✅ Complete                                 │
│  WordPressProvider  🚧 Planned (Phase 7)                        │
│  SupabaseProvider   🚧 Planned (Phase 7)                        │
│  NotionProvider     🚧 Planned (Future)                         │
│  CustomProvider     🚧 Roll your own                            │
│                                                                  │
│  All implement the same DataProvider interface                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**1. Backend-Agnostic by Default**
- Services use `DataProvider`, not direct backend calls
- Frontend can work with Convex, WordPress, Supabase, etc.
- Change backend = edit ONE line in `astro.config.ts`

**2. 6-Dimension Ontology as Source of Truth**
- Every feature maps to: groups, people, things, connections, events, knowledge
- DataProvider interface enforces this structure
- Backends implement the ontology their own way (see `one/knowledge/ontology.md`)

**3. Effect.ts for Services, Not Everywhere**
- Backend: Effect.ts services with typed errors
- Frontend: Standard React hooks (useEffectRunner for complex flows)
- Keep it simple: Effect where it adds value, standard TypeScript elsewhere

**4. Separation Enables Installation**
- When users run `npx oneie`, they get frontend only
- Backend is OFF by default (users can connect their own)
- Organizations can use existing infrastructure (WordPress, Notion, etc.)

---

## Current Status (from unified-implementation-plan.md)

### ✅ COMPLETED (Phases 1-2: 4 weeks)

**Phase 1: DataProvider Foundation** ✅
- DataProvider interface complete: `/web/src/providers/DataProvider.ts`
- ConvexProvider implementation complete
- Typed errors (ThingNotFoundError, etc.)
- Backend swapping works (change ONE line)

**Phase 2: Effect.ts Service Layer** ✅
- All 6 dimension services complete:
  - `/web/src/services/ThingService.ts` (66 types)
  - `/web/src/services/ConnectionService.ts` (25 types)
  - `/web/src/services/EventService.ts` (67 events)
  - `/web/src/services/KnowledgeService.ts` (RAG)
  - `/web/src/services/GroupService.ts`
  - `/web/src/services/PeopleService.ts`
- React hooks: `useEffectRunner` in `/web/src/hooks/`
- Dependency injection via Layer.mergeAll
- Tagged errors throughout (no try/catch)

### 🚧 REMAINING (Phases 3-7: 7 weeks)

**Phase 3: Backend Implementation** (NOT STARTED)
- Implement CRUD mutations for all 66 thing types
- Add event logging to all mutations
- Enforce group scoping
- Add rate limiting

**Phase 4: Frontend Integration** (NOT STARTED)
- Multi-tenant dashboard
- Entity management UI (all 66 types)
- Connection visualization
- Real-time event timeline

**Phase 5: RAG & Knowledge** (NOT STARTED)
- Chunking service (800 tokens, 200 overlap)
- Embedding service (OpenAI integration)
- RAG ingestion pipeline
- Vector search

**Phase 6: Testing** (PARTIAL - auth tests exist)
- Backend service coverage (90%)
- Frontend coverage (70%)
- Multi-backend tests
- CI/CD pipeline

**Phase 7: Multi-Backend** (OPTIONAL)
- WordPressProvider
- SupabaseProvider
- CompositeProvider (multi-backend routing)

---

## Integration approaches

### Understanding confect's role (Optional - For Convex Backend Only)

Confect isn't just a thin wrapper—it's a comprehensive framework that **deeply integrates Effect.ts with Convex**. Created by RJ Dellecese, confect replaces Convex's native validator system with Effect's schema library and transforms all Convex APIs to return `Effect` types instead of `Promise`. Where Convex returns `A | null`, confect returns `Option<A>`, and errors become explicit in the Effect type signature. This provides end-to-end type safety from database operations through business logic to HTTP APIs with automatic OpenAPI documentation.

### Project structure with backend-agnostic Effect.ts

ONE Platform uses a clean separation between frontend (Effect.ts services) and backend (any provider):

```
ONE/
├── web/                         # Frontend (Backend-Agnostic)
│   ├── src/
│   │   ├── pages/              # Astro pages (SSR)
│   │   ├── components/         # React components + shadcn/ui
│   │   ├── services/           # ✅ Effect.ts services (backend-agnostic)
│   │   │   ├── ThingService.ts
│   │   │   ├── ConnectionService.ts
│   │   │   ├── EventService.ts
│   │   │   ├── KnowledgeService.ts
│   │   │   ├── GroupService.ts
│   │   │   └── PeopleService.ts
│   │   ├── providers/          # ✅ DataProvider interface & implementations
│   │   │   ├── DataProvider.ts          # Universal interface
│   │   │   ├── convex/
│   │   │   │   └── ConvexProvider.ts    # Convex implementation
│   │   │   ├── wordpress/
│   │   │   │   └── WordPressProvider.ts # WordPress implementation (planned)
│   │   │   └── supabase/
│   │   │       └── SupabaseProvider.ts  # Supabase implementation (planned)
│   │   ├── hooks/              # React hooks
│   │   │   ├── useEffectRunner.ts       # Run Effect programs in React
│   │   │   └── useProvider.ts           # Access current DataProvider
│   │   └── lib/
│   │       └── errors.ts       # Tagged error types
│   └── astro.config.ts         # ✅ Configure provider here (ONE LINE!)
│
├── backend/                     # Backend (Convex - OPTIONAL)
│   └── convex/
│       ├── schema.ts           # 6-dimension ontology (groups, entities, connections, events, knowledge)
│       ├── auth.ts             # Better Auth configuration
│       ├── queries/            # Read operations
│       ├── mutations/          # Write operations
│       └── _generated/         # Auto-generated types
│
├── one/                         # Platform documentation (41 files)
│   ├── knowledge/
│   │   ├── ontology.md         # ✅ 6-dimension data model (source of truth)
│   │   └── todo.md             # 100-inference execution template
│   └── things/plans/
│       ├── effect.md           # This file
│       ├── separate.md         # Backend separation plan
│       └── unified-implementation-plan.md  # Complete 11-week plan
│
└── apps/                        # Distribution targets
    ├── oneie/                  # Main site (one.ie) - backend ON
    └── one/                    # Demo site (demo.one.ie) - backend OFF
```

**Key Differences from Standard Convex:**
1. Services live in `/web/src/services/` (not backend)
2. Services use `DataProvider` (not direct Convex calls)
3. Backend is optional (users can bring their own)
4. Frontend works standalone with mock providers for testing

---

## The Backend-Agnostic Pattern (Current Implementation)

### DataProvider Interface (Universal Contract)

```typescript
// web/src/providers/DataProvider.ts
import { Effect, Context } from "effect";

// Universal interface ALL backends implement
export interface DataProvider {
  // Dimension 1: Groups
  groups: {
    get: (id: string) => Effect.Effect<Group, GroupNotFoundError>;
    list: (params?: { status?: string }) => Effect.Effect<Group[], Error>;
    update: (id: string, updates: Partial<Group>) => Effect.Effect<void, Error>;
  };

  // Dimension 2: People
  people: {
    get: (id: string) => Effect.Effect<Person, PersonNotFoundError>;
    list: (params: { groupId?: string; role?: string }) => Effect.Effect<Person[], Error>;
    create: (input: CreatePersonInput) => Effect.Effect<string, Error>;
  };

  // Dimension 3: Things
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>;
    list: (params: { type: ThingType; groupId?: string }) => Effect.Effect<Thing[], Error>;
    create: (input: CreateThingInput) => Effect.Effect<string, Error>;
    update: (id: string, updates: Partial<Thing>) => Effect.Effect<void, Error>;
    delete: (id: string) => Effect.Effect<void, Error>;
  };

  // Dimension 4: Connections
  connections: {
    create: (input: CreateConnectionInput) => Effect.Effect<string, Error>;
    getRelated: (thingId: string) => Effect.Effect<Connection[], Error>;
    getCount: (thingId: string) => Effect.Effect<number, Error>;
  };

  // Dimension 5: Events
  events: {
    log: (event: LogEventInput) => Effect.Effect<void, Error>;
    query: (params: QueryEventsInput) => Effect.Effect<Event[], Error>;
  };

  // Dimension 6: Knowledge
  knowledge: {
    embed: (text: string) => Effect.Effect<number[], Error>;
    search: (params: SearchKnowledgeInput) => Effect.Effect<KnowledgeChunk[], Error>;
  };
}

export const DataProvider = Context.GenericTag<DataProvider>("DataProvider");
```

### Backend-Agnostic Service Example

```typescript
// web/src/services/ThingService.ts
import { Effect } from "effect";
import { DataProvider } from "@/providers/DataProvider";

export class ThingService extends Effect.Service<ThingService>()(
  "ThingService",
  {
    effect: Effect.gen(function* () {
      const provider = yield* DataProvider;  // Backend-agnostic!

      return {
        // Create any of the 66 thing types
        create: (type: ThingType, input: CreateThingInput) =>
          Effect.gen(function* () {
            // 1. Validate input (same for all backends)
            yield* validateThingInput(type, input);

            // 2. Create via provider (backend-specific implementation)
            const thingId = yield* provider.things.create({
              type,
              name: input.name,
              groupId: input.groupId,
              properties: input.properties,
            });

            // 3. Log event automatically (via provider)
            yield* provider.events.log({
              type: "entity_created",
              actorId: input.actorId,
              targetId: thingId,
              groupId: input.groupId,
              metadata: { thingType: type },
            });

            return thingId;
          }),

        // Get thing by ID
        get: (id: string) => provider.things.get(id),

        // List things by type
        list: (type: ThingType, groupId: string) =>
          provider.things.list({ type, groupId }),

        // Update thing
        update: (id: string, updates: Partial<Thing>) =>
          Effect.gen(function* () {
            yield* provider.things.update(id, updates);

            // Log event
            yield* provider.events.log({
              type: "entity_updated",
              actorId: updates.actorId,
              targetId: id,
              groupId: updates.groupId,
              metadata: { updates },
            });
          }),
      };
    }),
    dependencies: [DataProvider],  // Inject provider
  }
) {}
```

### ConvexProvider Implementation

```typescript
// web/src/providers/convex/ConvexProvider.ts
import { Effect, Layer } from "effect";
import { ConvexHttpClient } from "convex/browser";
import { DataProvider } from "../DataProvider";
import { api } from "@/convex/_generated/api";

export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  things = {
    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.mutations.things.create, input),
        catch: (error) => new Error(String(error)),
      }),

    get: (id) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.get, { id }),
        catch: (error) => new ThingNotFoundError(id),
      }),

    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.list, params),
        catch: (error) => new Error(String(error)),
      }),

    update: (id, updates) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.mutations.things.update, { id, ...updates }),
        catch: (error) => new Error(String(error)),
      }),

    delete: (id) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.mutations.things.delete, { id }),
        catch: (error) => new Error(String(error)),
      }),
  };

  // ... implement other dimensions (people, groups, connections, events, knowledge)
}

export const convexProvider = (config: { url: string }) =>
  Layer.succeed(
    DataProvider,
    new ConvexProvider(new ConvexHttpClient(config.url))
  );
```

### Configure Provider (ONE LINE!)

```typescript
// web/astro.config.ts
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import { convexProvider } from "./src/providers/convex";
// import { wordpressProvider } from "./src/providers/wordpress";  // Alternative
// import { supabaseProvider } from "./src/providers/supabase";     // Alternative

export default defineConfig({
  integrations: [
    react(),
    one({
      // ✅ Change this ONE line to swap backends!
      provider: convexProvider({ url: import.meta.env.PUBLIC_CONVEX_URL }),

      // OR use WordPress:
      // provider: wordpressProvider({ url: "https://blog.com", apiKey: env.WP_KEY }),

      // OR use Supabase:
      // provider: supabaseProvider({ url: env.SUPABASE_URL, key: env.SUPABASE_KEY }),
    }),
  ],
});
```

### Frontend Usage (Completely Backend-Agnostic)

```tsx
// web/src/components/CreateCourse.tsx
import { useEffectRunner } from "@/hooks/useEffectRunner";
import { ThingService } from "@/services/ThingService";
import { Effect } from "effect";

export function CreateCourseForm() {
  const { run, loading } = useEffectRunner();

  const handleSubmit = async (formData: CourseFormData) => {
    // Define Effect program
    const program = Effect.gen(function* () {
      const thingService = yield* ThingService;

      // This works with ANY backend (Convex, WordPress, Supabase, etc.)!
      const courseId = yield* thingService.create("course", {
        name: formData.name,
        groupId: currentGroup.id,
        properties: {
          description: formData.description,
          price: formData.price,
          duration: formData.duration,
        },
        actorId: currentUser.id,
      });

      return courseId;
    });

    // Run program (uses configured provider automatically)
    const courseId = await run(program);

    // Redirect to course page
    navigate(`/courses/${courseId}`);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Benefits of This Architecture

**1. True Backend Independence**
- Frontend code never imports backend-specific modules
- Services use DataProvider interface only
- Swap backends without changing a single service or component

**2. Testing Without Backend**
```typescript
// web/src/services/__tests__/ThingService.test.ts
import { Effect, Layer } from "effect";
import { ThingService } from "../ThingService";

const MockProvider = Layer.succeed(
  DataProvider,
  {
    things: {
      create: (input) => Effect.succeed("mock-id-123"),
      get: (id) => Effect.succeed({ _id: id, type: "course", name: "Test" }),
      // ... other methods
    },
    // ... other dimensions
  }
);

test("should create course", async () => {
  const program = Effect.gen(function* () {
    const service = yield* ThingService;
    return yield* service.create("course", { ... });
  });

  const result = await Effect.runPromise(
    program.pipe(Effect.provide(MockProvider))
  );

  expect(result).toBe("mock-id-123");
});
```

**3. Organizations Use Existing Infrastructure**
```typescript
// Organization A: Uses Convex (real-time)
provider: convexProvider({ url: "..." })

// Organization B: Uses WordPress (existing CMS)
provider: wordpressProvider({ url: "https://blog.org", apiKey: "..." })

// Organization C: Uses Supabase (PostgreSQL)
provider: supabaseProvider({ url: "...", key: "..." })

// Same frontend code works for all three!
```

**4. Deployment Flexibility**
```bash
# Development: Full stack
ONE_BACKEND=on

# Production (one.ie): Backend enabled
ONE_BACKEND=on

# Demo (demo.one.ie): Backend disabled
ONE_BACKEND=off

# User installation (npx oneie): Backend OFF by default
ONE_BACKEND=off
```

---

## Optional: Convex-Specific Integration with confect

**Note:** This section is only relevant if you're using Convex as your backend AND want deeper Effect.ts integration in the backend layer. For most use cases, the DataProvider pattern above is sufficient.

### Schema definition with confect

Replace Convex validators with Effect schemas for stronger type guarantees:

```typescript
// convex/schema.ts
import { Id, defineSchema, defineTable } from "@rjdellecese/confect/server";
import { Schema } from "effect";

export const confectSchema = defineSchema({
  agents: defineTable(
    Schema.Struct({
      userId: Id.Id("users"),
      name: Schema.String,
      instructions: Schema.String,
      model: Schema.Literal("gpt-4o", "claude-3-5-sonnet", "gemini-flash"),
      status: Schema.Literal("active", "paused", "archived"),
      metadata: Schema.optional(
        Schema.Struct({
          tags: Schema.Array(Schema.String),
          lastActive: Schema.Number,
        })
      ),
    })
  )
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  
  threads: defineTable(
    Schema.Struct({
      agentId: Id.Id("agents"),
      userId: Id.Id("users"),
      title: Schema.optional(Schema.String),
    })
  )
    .index("by_agent", ["agentId"])
    .index("by_user", ["userId"]),
  
  messages: defineTable(
    Schema.Struct({
      threadId: Id.Id("threads"),
      role: Schema.Literal("user", "assistant", "system", "tool"),
      content: Schema.String,
      toolCalls: Schema.optional(Schema.Array(
        Schema.Struct({
          name: Schema.String,
          args: Schema.Record(Schema.String, Schema.Unknown),
          result: Schema.optional(Schema.Unknown),
        })
      )),
      embedding: Schema.optional(Schema.Array(Schema.Number)),
    })
  )
    .index("by_thread", ["threadId"])
    .vectorIndex("embedding", {
      vectorField: "embedding",
      filterFields: ["threadId", "role"],
      dimensions: 1536,
    }),
});

export default confectSchema.convexSchemaDefinition;
```

### Function constructors with confect

Generate type-safe Effect-based function constructors:

```typescript
// convex/confect.ts
import {
  ConfectActionCtx as ConfectActionCtxService,
  type ConfectActionCtx as ConfectActionCtxType,
  type ConfectDataModelFromConfectSchemaDefinition,
  type ConfectDoc as ConfectDocType,
  ConfectMutationCtx as ConfectMutationCtxService,
  type ConfectMutationCtx as ConfectMutationCtxType,
  ConfectQueryCtx as ConfectQueryCtxService,
  type ConfectQueryCtx as ConfectQueryCtxType,
  type TableNamesInConfectDataModel,
  makeFunctions,
} from "@rjdellecese/confect/server";
import { confectSchema } from "./schema";

export const {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} = makeFunctions(confectSchema);

type ConfectDataModel = ConfectDataModelFromConfectSchemaDefinition<typeof confectSchema>;

export type ConfectDoc<
  TableName extends TableNamesInConfectDataModel<ConfectDataModel>,
> = ConfectDocType<ConfectDataModel, TableName>;

export const ConfectQueryCtx = ConfectQueryCtxService<ConfectDataModel>();
export type ConfectQueryCtx = ConfectQueryCtxType<ConfectDataModel>;

export const ConfectMutationCtx = ConfectMutationCtxService<ConfectDataModel>();
export type ConfectMutationCtx = ConfectMutationCtxType<ConfectDataModel>;

export const ConfectActionCtx = ConfectActionCtxService<ConfectDataModel>();
export type ConfectActionCtx = ConfectActionCtxType<ConfectDataModel>;
```

### Writing Effect-based Convex functions

Queries, mutations, and actions now use Effect patterns:

```typescript
// convex/functions.ts
import { Effect } from "effect";
import { ConfectMutationCtx, ConfectQueryCtx, mutation, query } from "./confect";
import { Schema } from "effect";

// Query: Read agent threads (reactive)
export const listThreads = query({
  args: Schema.Struct({ userId: Schema.String }),
  returns: Schema.Array(Schema.Unknown),
  handler: ({ userId }) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectQueryCtx;
      return yield* db
        .query("threads")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .order("desc")
        .collect();
    }),
});

// Mutation: Create thread (transactional)
export const createThread = mutation({
  args: Schema.Struct({ 
    agentId: Schema.String, 
    userId: Schema.String,
    initialMessage: Schema.String 
  }),
  returns: Schema.String,
  handler: ({ agentId, userId, initialMessage }) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectMutationCtx;
      
      // Create thread
      const threadId = yield* db.insert("threads", {
        agentId,
        userId,
      });
      
      // Add first message
      yield* db.insert("messages", {
        threadId,
        role: "user",
        content: initialMessage,
      });
      
      return threadId;
    }),
});
```

### Frontend integration with Astro and React

Keep frontend code simple with standard Convex hooks—Effect lives primarily in the backend:

```typescript
// src/lib/convex.tsx
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";

const CONVEX_URL = import.meta.env.PUBLIC_CONVEX_URL;
const client = new ConvexReactClient(CONVEX_URL);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
```

```typescript
// src/components/AgentChat.tsx (React component)
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function AgentChat({ userId }: { userId: string }) {
  const threads = useQuery(api.functions.listThreads, { userId });
  const createThread = useMutation(api.functions.createThread);
  
  // Reactive updates happen automatically
  return (
    <div>
      {threads?.map(thread => (
        <ThreadItem key={thread._id} thread={thread} />
      ))}
      <button onClick={() => createThread({ 
        agentId: "agent123", 
        userId,
        initialMessage: "Hello!"
      })}>
        New Chat
      </button>
    </div>
  );
}
```

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
import { AgentChat } from '../components/AgentChat';
import { ConvexClientProvider } from '../lib/convex';
---

<Layout>
  <ConvexClientProvider client:load>
    <AgentChat userId="user123" client:load />
  </ConvexClientProvider>
</Layout>
```

### Build configuration requirements

Critical TypeScript settings for confect compatibility:

```json
// tsconfig.json (root)
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "exactOptionalPropertyTypes": false,  // REQUIRED for Confect!
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

// convex/tsconfig.json
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": false,  // REQUIRED for Confect!
    "moduleResolution": "Bundler",
    "strict": true
  }
}
```

```json
// convex.json
{
  "functions": "convex/",
  "node": {
    "externalPackages": ["effect", "@effect/platform", "@effect/schema"],
    "nodeVersion": "22"
  }
}
```

## Benefits analysis

### Effect.ts advantages for AI agent systems

**Typed error handling eliminates silent failures.** Effect makes errors first-class citizens with explicit error channels in type signatures (`Effect<Success, Error, Requirements>`). For AI agents calling unreliable LLM APIs, this prevents cascading failures. The 14.ai production system (AI customer support platform) uses tagged errors like `RateLimitError`, `InvalidInputError`, and `NetworkError` to implement sophisticated fallback chains—when OpenAI rate limits, automatically switch to Gemini. You compose error recovery strategies declaratively rather than nested try-catch blocks.

**Structured concurrency simplifies multi-step agent workflows.** Effect's fiber-based concurrency model provides lightweight virtual threads that compose naturally. Execute multiple tool calls concurrently with bounded concurrency (`Effect.all(toolCalls, { concurrency: 5 })`), race providers for fastest response (`Effect.race(openai, anthropic, gemini)`), or implement complex retry policies with exponential backoff. Interruption propagates automatically through fiber trees—when a user cancels an agent request, all child operations (LLM calls, database queries, tool executions) clean up properly without manual cancellation logic.

**Dependency injection enables seamless testing and provider swapping.** Effect's Context and Layer system provides compile-time type-safe dependency injection. Define an `LLMProvider` service interface, implement `OpenAILive` and `AnthropicLive` layers, swap at runtime based on configuration. For testing, replace with `LLMProviderMock` that returns canned responses. The 14.ai team reports this drastically improved test coverage—they mock LLM providers completely, eliminating flaky integration tests and reducing test costs.

**Resource management prevents leaks in long-running agents.** Effect's Scope system automatically releases resources (database connections, WebSocket streams, file handles) regardless of success, failure, or interruption. For streaming LLM responses, wrap in `Effect.scoped` with `addFinalizer` to abort streams on user cancellation. For RAG agents processing documents, ensure file handles close even when errors occur mid-processing. Effect handles cleanup correctly across concurrent operations—critical for production systems running 24/7.

**Schema validation provides type-safe data transformation.** Effect's Schema library validates and transforms data with full type inference. For AI agents, validate LLM function call outputs match expected schemas, parse structured responses, and enforce business rules. Schemas compose—define a base tool schema and extend it for specific tools. Transformations convert between API shapes and domain models. Combined with confect, your entire stack has end-to-end type safety from database to frontend.

### confect-specific benefits for Convex

**Effect schemas replace Convex validators with stronger guarantees.** Confect uses Effect's Schema library instead of Convex's built-in validators (`v.string()`, `v.object()`). Effect schemas provide more expressive validation—regex patterns, numeric ranges, conditional logic, recursive types, and custom refinements. Schemas also enable transformations (converting ISO date strings to Date objects automatically) and better error messages. The schema serves as single source of truth for types, validation, and documentation.

**Option types eliminate null-checking boilerplate.** Where standard Convex returns `User | null` from queries, confect returns `Option<User>`. Effect's Option type forces explicit handling with pattern matching, map operations, or `getOrElse` fallbacks. This prevents null reference errors—you can't accidentally forget to check if a query returned null. Combined with Effect's type system, your entire agent workflow has explicit handling for missing data.

**Automatic database operation encoding/decoding.** Confect automatically encodes and decodes data according to your Effect schemas when reading from and writing to Convex. Define a schema with transformations (like converting timestamps to Date objects), and confect handles the conversions transparently. This keeps business logic clean—work with proper domain types throughout your code, not raw database representations.

**Built-in HTTP API with OpenAPI documentation.** Confect includes Effect's HTTP API modules for defining REST endpoints with automatic OpenAPI documentation generation via Scalar. Define your agent API endpoints with Effect schemas for request/response validation, and confect generates interactive API documentation. Perfect for exposing agent functionality to external integrations or building admin dashboards.

### Synergy between Effect.ts and confect

These libraries work together seamlessly because confect is built on Effect.ts. When you write a confect function, you're writing Effect code—accessing the ConfectQueryCtx or ConfectMutationCtx returns an Effect that you compose with other Effects. Your agent service layers provide Effect-based operations, confect functions consume these services, and the entire stack maintains type safety with explicit error channels. The combination enables sophisticated patterns: query reactive agent state from Convex with ConfectQueryCtx, call external LLM APIs with Effect's retry/fallback logic, and save results transactionally with ConfectMutationCtx—all in a single composable workflow.

### Specific advantages for building AI agents

**Multi-provider fallback chains.** Production AI systems need resilience against provider outages and rate limits. Effect's error handling makes this trivial: `generateText(prompt).pipe(Effect.catchTag("RateLimitError", () => fallbackProvider))`. Chain multiple fallbacks with different retry policies. The 14.ai system implements execution plans that track which providers failed, avoiding repeated attempts against known-down services.

**Parallel tool execution with graceful degradation.** AI agents often execute multiple tools concurrently. Effect's `Effect.all()` with `{ concurrency: N, mode: "either" }` runs tools in parallel, continues on individual failures, and collects successes. Your agent can still respond even if some tools fail—critical for production reliability.

**Streaming response management.** LLM streaming requires careful resource management to prevent leaks when users cancel requests. Effect's Stream module with Scope-based cleanup handles this correctly. The 14.ai pattern duplicates streams—one sends tokens to the user, another stores for analytics—with automatic cleanup on interruption.

**State management for conversational agents.** Effect's Ref provides atomic concurrent state updates. Combined with Convex's reactive database for persistence, you get both in-memory performance and durable storage. Use Ref for short-term conversational state (current tool executions, working memory) and Convex for long-term persistence (conversation history, learned preferences).

**Type-safe agent workflows.** Define agent workflows as Effect programs with explicit dependencies. Your workflow requires `LLMProvider`, `VectorStore`, and `ToolRegistry` services—Effect verifies at compile time that you provide these dependencies. Impossible to accidentally run an agent without required services configured.

## Architecture patterns

### Where to use Effect vs plain TypeScript

**Use Effect in Convex functions** (queries, mutations, actions). This is where Effect provides maximum value—handling external API calls, complex error scenarios, and resource management. All your agent orchestration logic, LLM interactions, and database operations benefit from Effect's guarantees.

**Use Effect for agent service layers.** Implement your AI capabilities (vector search, LLM generation, tool registry, memory management) as Effect services with explicit error types. These services compose naturally in agent workflows.

**Keep frontend code simple.** React components should use standard Convex hooks (`useQuery`, `useMutation`). Optionally use Effect for complex client-side validation or local state management, but this isn't necessary. The reactive updates from Convex work automatically—no need to integrate Effect with React state management.

**Use plain TypeScript for utilities and helpers** that don't involve async operations, error handling, or external integrations. Simple data transformations, formatters, and pure functions don't benefit from Effect.

### Organizing Convex functions with Effect and confect

**Separate concerns into distinct function files:**

```
convex/
├── queries/              # Read-only operations
│   ├── threads.ts        # Thread listing, filtering
│   ├── messages.ts       # Message queries
│   └── agents.ts         # Agent metadata
├── mutations/            # Write operations
│   ├── threads.ts        # Create/update threads
│   ├── messages.ts       # Save messages
│   └── agents.ts         # Agent configuration
└── actions/              # External integrations
    ├── generate.ts       # LLM generation
    ├── embedding.ts      # Vector embedding
    └── tools.ts          # Tool execution
```

**Query pattern** (reactive, read-only):

```typescript
// convex/queries/threads.ts
import { Effect } from "effect";
import { ConfectQueryCtx, query } from "../confect";
import { Schema } from "effect";

export const get = query({
  args: Schema.Struct({ threadId: Schema.String }),
  returns: Schema.Unknown,
  handler: ({ threadId }) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectQueryCtx;
      return yield* db.get(threadId);
    }),
});

export const list = query({
  args: Schema.Struct({ agentId: Schema.String }),
  returns: Schema.Array(Schema.Unknown),
  handler: ({ agentId }) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectQueryCtx;
      return yield* db
        .query("threads")
        .withIndex("by_agent", (q) => q.eq("agentId", agentId))
        .order("desc")
        .take(50)
        .collect();
    }),
});
```

**Mutation pattern** (transactional, write):

```typescript
// convex/mutations/messages.ts
import { Effect } from "effect";
import { ConfectMutationCtx, mutation } from "../confect";
import { Schema } from "effect";

export const save = mutation({
  args: Schema.Struct({
    threadId: Schema.String,
    role: Schema.Literal("user", "assistant"),
    content: Schema.String,
    toolCalls: Schema.optional(Schema.Array(Schema.Unknown)),
  }),
  returns: Schema.String,
  handler: (args) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectMutationCtx;
      
      // Validate thread exists
      const thread = yield* db.get(args.threadId);
      if (!thread) {
        return yield* Effect.fail(new Error("Thread not found"));
      }
      
      // Insert message
      const messageId = yield* db.insert("messages", {
        threadId: args.threadId,
        role: args.role,
        content: args.content,
        toolCalls: args.toolCalls,
      });
      
      return messageId;
    }),
});
```

**Action pattern** (external calls, uses Effect heavily):

```typescript
// convex/actions/generate.ts
import { Effect, Schedule } from "effect";
import { ConfectActionCtx, action } from "../confect";
import { LLMProvider, VectorStore } from "../lib/services";
import { Schema } from "effect";

export const generateResponse = action({
  args: Schema.Struct({ 
    threadId: Schema.String,
    prompt: Schema.String 
  }),
  returns: Schema.String,
  handler: (args) =>
    Effect.gen(function* () {
      const ctx = yield* ConfectActionCtx;
      const llm = yield* LLMProvider;
      const vectorStore = yield* VectorStore;
      
      // 1. Retrieve conversation history (via query)
      const messages = yield* Effect.promise(() =>
        ctx.runQuery(api.queries.messages.list, { threadId: args.threadId })
      );
      
      // 2. Search for relevant context
      const context = yield* vectorStore.search(args.prompt).pipe(
        Effect.timeout("5 seconds"),
        Effect.catchAll(() => Effect.succeed([]))  // Graceful degradation
      );
      
      // 3. Generate response with retry logic
      const response = yield* llm.generate({
        messages: [...messages, { role: "user", content: args.prompt }],
        context,
      }).pipe(
        Effect.retry({
          times: 3,
          schedule: Schedule.exponential("1 second"),
        }),
        Effect.catchTags({
          RateLimitError: () => llm.generateWithFallback(args.prompt),
          NetworkError: (error) => 
            Effect.succeed("I'm having trouble connecting. Please try again."),
        })
      );
      
      // 4. Save response (via mutation)
      yield* Effect.promise(() =>
        ctx.runMutation(api.mutations.messages.save, {
          threadId: args.threadId,
          role: "assistant",
          content: response,
        })
      );
      
      return response;
    }).pipe(
      Effect.provide(AppLayer)  // Provide service implementations
    ),
});
```

### Agent-specific patterns

**Three-layer agent architecture** (from 14.ai production system):

**Layer 1: Actions** (atomic operations)

```typescript
// convex/agents/actions/search.ts
import { Effect } from "effect";
import { VectorStore } from "../../lib/services";

export const searchKnowledgeBase = (query: string) =>
  Effect.gen(function* () {
    const vectorStore = yield* VectorStore;
    const results = yield* vectorStore.search(query, { limit: 5 });
    return results.map(r => r.content).join("\n\n");
  });
```

**Layer 2: Workflows** (multi-step processes)

```typescript
// convex/agents/workflows/support.ts
import { Effect, Schedule } from "effect";
import { searchKnowledgeBase } from "../actions/search";
import { generateResponse } from "../actions/generate";

export const handleSupportQuery = (query: string) =>
  Effect.gen(function* () {
    // Step 1: Search knowledge base
    const context = yield* searchKnowledgeBase(query).pipe(
      Effect.timeout("5 seconds"),
      Effect.retry({ times: 2 })
    );
    
    // Step 2: Generate response with context
    const response = yield* generateResponse({
      query,
      context,
      tone: "helpful and professional",
    });
    
    // Step 3: If response is uncertain, escalate
    if (response.confidence < 0.7) {
      yield* escalateToHuman(query, response);
    }
    
    return response;
  });
```

**Layer 3: Sub-agents** (domain-specific modules)

```typescript
// convex/agents/sub-agents/billing.ts
import { Effect } from "effect";
import { handleSupportQuery } from "../workflows/support";

export class BillingAgent {
  static handle = (query: string) =>
    Effect.gen(function* () {
      // Billing-specific preprocessing
      const normalized = normalizeBillingQuery(query);
      
      // Delegate to support workflow
      const response = yield* handleSupportQuery(normalized);
      
      // Billing-specific postprocessing
      return formatBillingResponse(response);
    });
}
```

**Service-oriented agent architecture:**

```typescript
// convex/lib/services/AgentService.ts
import { Context, Effect } from "effect";

export class AgentService extends Context.Tag("AgentService")<
  AgentService,
  {
    readonly executeWorkflow: (
      workflowId: string,
      input: unknown
    ) => Effect.Effect<string, AgentError>;
    
    readonly registerTool: (
      tool: AgentTool
    ) => Effect.Effect<void, never>;
  }
>() {}

// convex/lib/layers/AgentLive.ts
import { Layer, Effect } from "effect";
import { AgentService } from "../services/AgentService";
import { LLMProvider, ToolRegistry } from "../services";

export const AgentLive = Layer.effect(
  AgentService,
  Effect.gen(function* () {
    const llm = yield* LLMProvider;
    const tools = yield* ToolRegistry;
    
    return {
      executeWorkflow: (workflowId, input) =>
        Effect.gen(function* () {
          const workflow = yield* loadWorkflow(workflowId);
          const result = yield* workflow.run(input, { llm, tools });
          return result;
        }),
      
      registerTool: (tool) =>
        tools.register(tool),
    };
  })
);
```

**Tool registry pattern:**

```typescript
// convex/lib/services/ToolRegistry.ts
import { Context, Effect } from "effect";

export interface AgentTool {
  name: string;
  description: string;
  parameters: Schema.Schema<any>;
  execute: (args: any) => Effect.Effect<any, ToolError>;
}

export class ToolRegistry extends Context.Tag("ToolRegistry")<
  ToolRegistry,
  {
    readonly register: (tool: AgentTool) => Effect.Effect<void, never>;
    readonly execute: (name: string, args: unknown) => Effect.Effect<any, ToolError>;
    readonly list: () => Effect.Effect<AgentTool[], never>;
  }
>() {}

// convex/agents/tools/search.ts
import { Schema } from "effect";
import { AgentTool } from "../../lib/services/ToolRegistry";

export const searchTool: AgentTool = {
  name: "search",
  description: "Search the knowledge base",
  parameters: Schema.Struct({
    query: Schema.String,
    limit: Schema.optional(Schema.Number),
  }),
  execute: ({ query, limit = 5 }) =>
    Effect.gen(function* () {
      const vectorStore = yield* VectorStore;
      return yield* vectorStore.search(query, { limit });
    }),
};
```

### Composing service layers

**Layer composition pattern:**

```typescript
// convex/lib/layers/index.ts
import { Layer } from "effect";
import { DatabaseLive } from "./DatabaseLive";
import { LLMProviderLive } from "./LLMProviderLive";
import { VectorStoreLive } from "./VectorStoreLive";
import { ToolRegistryLive } from "./ToolRegistryLive";
import { AgentLive } from "./AgentLive";

// Compose layers with dependencies
export const AppLayer = Layer.mergeAll(
  DatabaseLive,
  LLMProviderLive,
  VectorStoreLive
).pipe(
  Layer.provideMerge(ToolRegistryLive),  // ToolRegistry depends on above
  Layer.provideMerge(AgentLive)           // AgentService depends on all
);

// Usage in actions
export const myAction = action({
  handler: (args) =>
    Effect.gen(function* () {
      const agent = yield* AgentService;
      const result = yield* agent.executeWorkflow("support", args);
      return result;
    }).pipe(
      Effect.provide(AppLayer)  // Provide all services
    ),
});
```

## Practical considerations

### Learning curve and team adoption

**Effect.ts requires 2-4 weeks for proficiency.** The functional programming paradigm differs from standard TypeScript async/await. Developers need to understand Effect types, generator syntax (`Effect.gen`), error channels, and the pipe operator. Community feedback indicates initial frustration followed by productivity gains. Key insight from production teams: focus on learning 2-3 core modules (Effect, Schema, Layer) to achieve 80% productivity, then expand knowledge gradually.

**Mitigation strategy: incremental adoption.** Don't rewrite everything in Effect immediately. Start with error-prone areas like LLM API calls where Effect's retry/fallback logic provides immediate value. Use `Effect.runPromise()` at boundaries to integrate with existing code. Wrap external APIs as Effect services with mock implementations for testing. Gradually expand Effect usage as team confidence grows.

**Generator syntax bridges the gap.** Effect.gen looks similar to async/await, making it approachable for TypeScript developers:

```typescript
// Familiar async/await
async function fetchUser(id: string) {
  const user = await db.query("users").get(id);
  const posts = await db.query("posts").filter(p => p.userId === user._id);
  return { user, posts };
}

// Similar Effect.gen
const fetchUser = (id: string) =>
  Effect.gen(function* () {
    const { db } = yield* ConfectQueryCtx;
    const user = yield* db.query("users").get(id);
    const posts = yield* db.query("posts").filter(p => p.userId === user._id);
    return { user, posts };
  });
```

**Confect adds minimal learning overhead.** If you understand Effect, confect is straightforward—it's Effect patterns applied to Convex. The main new concepts are the Confect contexts (`ConfectQueryCtx`, `ConfectMutationCtx`, `ConfectActionCtx`) which replace standard Convex's `ctx` parameter.

**Convex itself has gentle learning curve.** Convex's reactive database model is intuitive—queries automatically update, mutations are transactional, actions call external APIs. Most developers become productive with Convex in days. The AI agent component (from `@convex-dev/agents`) provides high-level abstractions that work well out of the box.

### Performance implications

**Effect.ts performance is excellent.** Contrary to common misconceptions, Effect's core runtime adds minimal overhead (~15kb compressed). The generator-based syntax performs identically to async/await. Effect's structured concurrency actually improves performance by enabling fine-grained control over concurrent operations—you can easily limit concurrency to avoid overwhelming downstream services.

**Bundle size scales with usage.** Effect has aggressive tree-shaking. Only the functions you use get bundled. A typical agent application using Effect for error handling, concurrency, and schemas adds approximately 25-40kb to bundle size—negligible for modern applications.

**Convex performance characteristics.** Convex automatically caches query results and uses WebSocket-based subscriptions for efficient real-time updates. Database operations are fast (single-digit millisecond reads from cache). The main performance consideration: **use indexes for all queries**. Index-based queries scale to millions of documents; full table scans don't.

**Agent-specific performance patterns:**

1. **Cache embeddings aggressively.** Vector embedding generation is expensive. Store embeddings in Convex with the `vectorIndex` and reuse them.
    
2. **Limit concurrent LLM calls.** Use `Effect.all(calls, { concurrency: 3 })` to avoid rate limits and manage costs.
    
3. **Stream responses when possible.** For chat interfaces, stream LLM tokens as they arrive rather than waiting for complete responses. Effect's Stream module handles this efficiently.
    
4. **Denormalize for read performance.** Convex doesn't support joins. Denormalize frequently-accessed data rather than making multiple queries.
    

### Debugging and tooling

**Effect DevTools provides runtime inspection.** Install the VS Code extension for Effect DevTools. It connects to your running application via WebSocket and shows real-time Effect execution, fiber traces, and structured logs. Critical for understanding complex agent workflows with multiple concurrent operations.

**Convex dashboard is comprehensive.** The Convex dashboard shows all database tables in real-time, function execution logs with timing, and a built-in Agent Playground for testing agent configurations. The Agent Playground lets you iterate on prompts, inspect tool calls, and tune context retrieval settings without writing code.

**Structured logging with Effect:**

```typescript
import { Effect } from "effect";

const agentWorkflow = Effect.gen(function* () {
  yield* Effect.log("Starting agent workflow", { userId, threadId });
  
  const result = yield* generateResponse(prompt).pipe(
    Effect.tap((response) => 
      Effect.log("Generated response", { 
        length: response.length,
        model: "gpt-4o" 
      })
    )
  );
  
  yield* Effect.log("Workflow complete", { result });
  return result;
});
```

Logs appear in Convex dashboard with structured metadata for filtering and analysis.

**OpenTelemetry integration** for production observability:

```typescript
import { Tracer } from "effect";

const tracedGeneration = generateText(prompt).pipe(
  Effect.withSpan("llm-generation", {
    attributes: { model: "gpt-4o", promptLength: prompt.length }
  })
);
```

Traces export to your observability platform (Datadog, Honeycomb, etc.) for production monitoring.

### Migration strategies

**For greenfield projects, start with Effect and confect from day one.** Structure your Convex backend with Effect patterns from the beginning. Use confect's schema-first approach for database definitions. Build agent services as Effect layers with dependency injection. This approach provides maximum benefit with minimal migration pain.

**For existing Convex projects, adopt incrementally:**

1. **Phase 1: Add confect and Effect to new features only.** Don't rewrite existing code. Implement new agent functionality using Effect patterns. This demonstrates value without disrupting working code.
    
2. **Phase 2: Wrap high-value existing code.** Identify error-prone areas—typically external API calls and complex multi-step workflows. Wrap these in Effect with proper error handling and retries.
    
3. **Phase 3: Migrate critical paths.** Once team is comfortable, migrate high-traffic or business-critical paths to Effect for improved reliability.
    

**Interoperability pattern** for gradual migration:

```typescript
// Existing Convex function (standard)
export const legacyFunction = query({
  handler: async (ctx, args) => {
    return await ctx.db.query("users").collect();
  },
});

// New Effect-based function calling legacy code
export const modernFunction = query({
  handler: (args) =>
    Effect.gen(function* () {
      const { runQuery } = yield* ConfectQueryCtx;
      
      // Call legacy function via runQuery
      const users = yield* Effect.promise(() =>
        runQuery(api.legacyFunction)
      );
      
      // Apply Effect-based processing
      const processed = yield* processUsers(users);
      return processed;
    }),
});
```

### Potential gotchas and limitations

**Confect requires `exactOptionalPropertyTypes: false`.** This is a Convex limitation, not confect's. Convex treats optional properties differently than TypeScript's strict mode expects. Set this in your tsconfig.json or confect won't compile.

**Effect error handling can create false confidence.** The 14.ai team warns: clean Effect code can create false sense of robustness. You must still rigorously test failure scenarios. Effect makes error handling explicit but doesn't automatically make your code correct.

**Convex actions don't retry automatically.** Unlike queries and mutations which Convex retries on transient failures, actions require manual retry logic. Use Effect's retry operators for actions that call external APIs.

**Schema restrictions for Convex.** Not every Effect Schema is valid for Convex database storage. Convex supports specific types (strings, numbers, booleans, arrays, objects, null). Complex Effect transformations work for validation but can't be persisted directly.

**Effect dependency injection can be hard to trace at scale.** As your application grows, tracking where services are provided becomes challenging. Document your layer composition clearly and use consistent patterns across your codebase.

**Learning both technologies simultaneously is demanding.** If your team is new to both Effect and Convex, the learning curve multiplies. Consider mastering Convex first with standard patterns, then introducing Effect incrementally.

### Production-ready patterns

**Service layer composition for agents:**

```typescript
// convex/lib/layers/index.ts
import { Layer, Config, Effect } from "effect";

// Environment-aware configuration
const ConfigLive = Layer.effect(
  ConfigService,
  Effect.gen(function* () {
    const openaiKey = yield* Config.string("OPENAI_API_KEY");
    const anthropicKey = yield* Config.string("ANTHROPIC_API_KEY");
    return { openaiKey, anthropicKey };
  })
);

// LLM provider with fallback
const LLMProviderLive = Layer.effect(
  LLMProvider,
  Effect.gen(function* () {
    const config = yield* ConfigService;
    
    return {
      generate: (prompt) =>
        generateWithOpenAI(prompt, config.openaiKey).pipe(
          Effect.catchTags({
            RateLimitError: () => generateWithAnthropic(prompt, config.anthropicKey),
            InvalidKeyError: (error) => Effect.fail(new ConfigurationError({ cause: error })),
          }),
          Effect.retry({ times: 3, schedule: Schedule.exponential("1 second") }),
          Effect.timeout("30 seconds")
        ),
    };
  })
);

// Complete application layer
export const AppLayer = Layer.mergeAll(
  ConfigLive,
  DatabaseLive,
  VectorStoreLive
).pipe(
  Layer.provideMerge(LLMProviderLive),
  Layer.provideMerge(ToolRegistryLive),
  Layer.provideMerge(AgentLive)
);

// In production actions
export const production = action({
  handler: (args) =>
    myAgentWorkflow(args).pipe(
      Effect.provide(AppLayer),
      Effect.catchAll((error) =>
        Effect.gen(function* () {
          yield* Effect.log("Agent workflow failed", { error });
          yield* notifyOperations(error);  // Alert on-call
          return fallbackResponse;
        })
      )
    ),
});
```

**Error recovery strategy for agent workflows:**

```typescript
const robustAgentGeneration = (prompt: string) =>
  Effect.gen(function* () {
    // Try primary approach with full context
    const fullResult = yield* generateWithContext(prompt, { 
      contextLimit: 10000 
    }).pipe(
      Effect.timeout("30 seconds"),
      Effect.catchTag("TimeoutError", () => Effect.fail({ _tag: "SlowGeneration" }))
    );
    
    return fullResult;
  }).pipe(
    // Fallback 1: Reduce context size
    Effect.catchTag("SlowGeneration", () =>
      generateWithContext(prompt, { contextLimit: 5000 })
    ),
    // Fallback 2: Switch to faster model
    Effect.catchTag("RateLimitError", () =>
      generateWithModel(prompt, "gpt-4o-mini")
    ),
    // Fallback 3: Cached response if available
    Effect.catchAll(() =>
      getCachedResponse(prompt).pipe(
        Effect.catchAll(() => 
          Effect.succeed("I'm experiencing technical difficulties. Please try again.")
        )
      )
    )
  );
```

This integration of Effect.ts and confect into your Astro-shadcn-Convex stack provides industrial-strength reliability for production AI agents. The combination delivers type safety, robust error handling, and reactive data synchronization—critical capabilities for systems that users depend on. Start with confect for schema-first database design, introduce Effect for LLM integration with retry logic, and structure your agent logic as composable services. The learning investment pays dividends in reduced bugs, improved testability, and cleaner codebase architecture.

---

## Summary: How Everything Connects

### The Complete Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                   ONE Platform Architecture                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 1. SOURCE OF TRUTH: 6-Dimension Ontology (one/knowledge/)      │
│    - Groups (multi-tenant isolation, hierarchical nesting)      │
│    - People (authorization & governance)                         │
│    - Things (66 types: creators, courses, tokens, agents...)   │
│    - Connections (25 types: owns, follows, enrolled_in...)     │
│    - Events (67 types: created, purchased, completed...)        │
│    - Knowledge (RAG: labels, chunks, vectors)                   │
│                                                                  │
│    ✅ Universal data model for ALL features                     │
│    ✅ Scales from children to enterprises                       │
│    ✅ Never needs breaking changes                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. BACKEND-AGNOSTIC SERVICES: Effect.ts (web/src/services/)    │
│    - ThingService (create, get, list, update, delete)          │
│    - ConnectionService (create, getRelated, getCount)          │
│    - EventService (log, query)                                  │
│    - KnowledgeService (embed, search)                           │
│    - GroupService, PeopleService                                │
│                                                                  │
│    ✅ Use DataProvider interface (not backend-specific)         │
│    ✅ Tagged errors (no try/catch)                              │
│    ✅ Composable via Layer.mergeAll                             │
│    ✅ Testable with mock providers                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. DATAPROVIDER INTERFACE (web/src/providers/)                 │
│    - Universal contract ALL backends implement                  │
│    - Enforces 6-dimension ontology structure                    │
│    - Swap backends by changing ONE line                         │
│                                                                  │
│    Current: ConvexProvider ✅                                   │
│    Planned: WordPressProvider, SupabaseProvider 🚧             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. FRONTEND (web/src/)                                          │
│    - Astro 5 pages (SSR)                                        │
│    - React 19 components (islands)                              │
│    - shadcn/ui (50+ components)                                 │
│    - Tailwind v4 (CSS config)                                   │
│                                                                  │
│    ✅ Uses services, never calls backend directly               │
│    ✅ Works with ANY backend via DataProvider                   │
│    ✅ Can run without backend (demo mode)                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. DEPLOYMENT (Release Strategy)                                │
│                                                                  │
│    Development (/web) → git push                                │
│         ↓                                                        │
│    one-ie/web (website source)                                  │
│         ↓                                                        │
│    ┌────────────────┬──────────────────┐                       │
│    ↓                ↓                   ↓                        │
│  one.ie      demo.one.ie         npx oneie                      │
│  (full)        (demo)            (install)                      │
│  Backend ON    Backend OFF       Backend OFF                    │
│                                                                  │
│  ✅ Single codebase                                             │
│  ✅ Multiple deployments                                        │
│  ✅ Environment-based features                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles Realized

**1. ONE Ontology = Universal Data Model**
- Every feature maps to 6 dimensions
- DataProvider interface enforces this structure
- Backends implement the ontology their way (Convex uses 5 tables, WordPress uses posts/meta, Supabase uses PostgreSQL schema)
- Frontend doesn't care HOW data is stored, only THAT it follows the ontology

**2. Backend-Agnostic = Maximum Flexibility**
- Services use `DataProvider` (not Convex directly)
- Organizations can use existing infrastructure (WordPress, Notion, etc.)
- Frontend can run standalone (demo mode, testing, development)
- Change backend = edit ONE line in `astro.config.ts`

**3. Effect.ts = Type-Safe Services**
- Tagged errors replace try/catch throughout services
- Dependency injection via Layer.mergeAll
- Testable with mock providers (no backend required)
- Optional: Deep Convex integration with confect for advanced use cases

**4. Separation Enables Distribution**
```bash
# When users run:
npx oneie

# They get:
- Frontend (web/) ✅
- Documentation (one/) ✅
- Claude config (.claude/) ✅
- Backend OFF by default ✅

# Organizations can:
- Use existing WordPress/Notion ✅
- Connect their own Convex ✅
- Build custom DataProvider ✅
```

### Release Strategy (architecture-summary.md)

**Single Source → Multiple Targets**

```
/web (development - full features)
  ↓
git push → one-ie/web (website source)
  ↓
./scripts/release.sh patch main
  → apps/oneie/ → git push → one-ie/oneie → one.ie (backend ON)

./scripts/release.sh patch demo
  → apps/one/ → git push → one-ie/one → demo.one.ie (backend OFF)
```

**Environment Configuration:**

```bash
# Development (.env.local)
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=true

# Production one.ie (.env.main)
ONE_BACKEND=on
ENABLE_ADMIN_FEATURES=false

# Demo demo.one.ie (.env.demo)
ONE_BACKEND=off
ENABLE_ADMIN_FEATURES=false

# User installation (npx oneie)
ONE_BACKEND=off  # Default
```

### Implementation Status (unified-implementation-plan.md)

**✅ COMPLETE (Phases 1-2: 4 weeks)**
- DataProvider interface and ConvexProvider
- All 6 Effect.ts services (Thing, Connection, Event, Knowledge, Group, People)
- React hooks (useEffectRunner, useProvider)
- Tagged errors throughout
- Backend-agnostic architecture validated

**🚧 IN PROGRESS (Phases 3-7: 7 weeks remaining)**
- Phase 3: Backend implementation (66 thing types, event logging, group scoping)
- Phase 4: Frontend integration (multi-tenant dashboard, entity management UI)
- Phase 5: RAG & Knowledge (chunking, embedding, vector search)
- Phase 6: Testing (90% backend coverage, 70% frontend coverage)
- Phase 7: Multi-Backend (WordPress, Supabase, Composite providers) - OPTIONAL

### How to Use This Document

**For AI Agents:**
1. Read `one/knowledge/ontology.md` first (6-dimension model)
2. Implement features using Effect.ts services (backend-agnostic)
3. Services use DataProvider (never call backend directly)
4. Follow the 100-inference sequence in `one/knowledge/todo.md`

**For Developers:**
1. Frontend development: Use Effect.ts services via hooks
2. Backend development: Implement DataProvider for your backend
3. Testing: Use mock providers (no backend required)
4. Deployment: Configure provider in `astro.config.ts` (ONE LINE!)

**For Organizations:**
1. Install: `npx oneie` (gets frontend only, backend OFF)
2. Choose backend: Convex, WordPress, Supabase, or custom
3. Implement DataProvider for your chosen backend
4. Configure: Edit ONE line in `astro.config.ts`

### The Payoff

**Before Backend-Agnostic Architecture:**
- Frontend tightly coupled to Convex
- Organizations must use Convex (no choice)
- Can't test without backend
- Can't use existing infrastructure
- Hard to demo without signup

**After Backend-Agnostic Architecture:**
- Frontend works with ANY backend
- Organizations use their existing systems
- Test with mock providers (instant)
- Leverage existing infrastructure investments
- Demo works without backend

**Build Once. Deploy Anywhere. Connect Anything.**

---

## Next Steps

### For Immediate Implementation

**1. Complete Phase 3: Backend Implementation**
```bash
# Backend mutations for all 66 thing types
cd backend/convex/mutations/things.ts
# Implement create/update/delete for each type
# Add event logging to all mutations
# Enforce group scoping
```

**2. Complete Phase 4: Frontend Integration**
```bash
# Multi-tenant dashboard
cd web/src/pages/admin/
# Build dashboard using ThingService
# Add entity management UI
# Visualize connections
```

**3. Complete Phase 5: RAG & Knowledge**
```bash
# Implement KnowledgeService features
cd web/src/services/KnowledgeService.ts
# Add chunking (800 tokens, 200 overlap)
# Add embedding (OpenAI integration)
# Add vector search
```

### For Future Exploration

**1. Multi-Backend Support (Phase 7)**
- WordPressProvider (REST API + WP metadata)
- SupabaseProvider (PostgreSQL queries)
- CompositeProvider (route by feature)

**2. Advanced Effect.ts Features**
- Stream for real-time LLM responses
- Fiber for advanced concurrency
- STM for transactional memory

**3. Optional Convex Enhancements**
- confect integration (schema-first)
- Effect.ts in Convex backend
- Deep type safety end-to-end

---

## Related Documentation

- **`one/knowledge/ontology.md`** - 6-dimension data model (SOURCE OF TRUTH)
- **`one/knowledge/todo.md`** - 100-inference execution template
- **`one/things/plans/separate.md`** - Backend separation strategy
- **`one/things/plans/unified-implementation-plan.md`** - Complete 11-week plan
- **`one/things/plans/improve-codebase.md`** - Alternative 14-week plan (backend-first)
- **`one/things/plans/architecture-summary.md`** - Deployment architecture
- **`CLAUDE.md`** - Development workflow and patterns
- **`web/AGENTS.md`** - Quick reference for Convex patterns

---

**The architecture is sound. The foundation is complete. Phases 1-2 prove the concept works. Now we finish the implementation and ship the complete platform.**

**Build features once. Work with any backend. Scale infinitely.**