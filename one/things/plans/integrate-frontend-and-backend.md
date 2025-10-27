# Integration Plan: Frontend & Backend Separation with Effect-TS

**Status:** In Progress
**Version:** 1.0.0
**Date Created:** 2025-10-25
**Owner:** Engineering Team

---

## Executive Summary

This document outlines the architecture for complete separation of frontend (Astro + React) and backend (Convex) using Effect-TS as the integration layer. The design allows:

1. **Backend independence:** Swap Convex for any other backend (Firebase, Supabase, custom HTTP API, etc.)
2. **Frontend-only mode:** Run standalone without backend (Stripe, Notion, markdown-based, etc.)
3. **Optional features:** Auth, groups, permissions only activate when backend is available
4. **Ontology compliance:** All APIs follow the 6-dimension ontology structure
5. **Multiple data sources:** Markdown, Notion, WordPress, Stripe, custom HTTP APIs

---

## Architecture Layers

### Layer 1: Data Providers (Backend Agnostic)

Each provider implements a unified interface:

```typescript
// web/src/lib/ontology/types.ts
export interface IOntologyProvider {
  // Groups
  groups: {
    list(filter?: Filter): Promise<Group[]>;
    get(id: string): Promise<Group>;
    create(data: CreateGroupInput): Promise<Group>;
    update(id: string, data: UpdateGroupInput): Promise<Group>;
  };

  // People
  people: {
    list(groupId?: string): Promise<Person[]>;
    get(id: string): Promise<Person>;
    create(data: CreatePersonInput): Promise<Person>;
    current(): Promise<Person | null>;
  };

  // Things (Entities)
  things: {
    list(filter?: ThingFilter): Promise<Thing[]>;
    get(id: string): Promise<Thing>;
    create(data: CreateThingInput): Promise<Thing>;
    update(id: string, data: UpdateThingInput): Promise<Thing>;
  };

  // Connections (Relationships)
  connections: {
    list(filter?: ConnectionFilter): Promise<Connection[]>;
    get(id: string): Promise<Connection>;
    create(data: CreateConnectionInput): Promise<Connection>;
  };

  // Events (Actions)
  events: {
    list(filter?: EventFilter): Promise<Event[]>;
    record(data: CreateEventInput): Promise<Event>;
  };

  // Knowledge (Vectors/Search)
  knowledge: {
    search(query: string, limit?: number): Promise<Knowledge[]>;
    embed(text: string): Promise<number[]>;
  };
}
```

### Layer 2: Provider Implementations

**Available Providers:**

1. **ConvexProvider** - Headless Convex backend (production)
2. **NotionProvider** - Notion database as backend
3. **WordPressProvider** - WordPress REST API
4. **MarkdownProvider** - Local markdown files
5. **StripeProvider** - Stripe checkout + products
6. **HTTPProvider** - Generic HTTP REST API
7. **CompositeProvider** - Combine multiple providers

### Layer 3: Effect-TS Integration

Use Effect-TS for:

- **Service composition:** Build features from ontology services
- **Error handling:** Typed errors per operation
- **Dependency injection:** Swap providers without code changes
- **Async operations:** Real-time subscriptions via Convex
- **Type safety:** Full TypeScript inference

```typescript
// web/src/lib/ontology/effects.ts
import * as Effect from 'effect';
import { IOntologyProvider } from './types';

export class OntologyService extends Effect.Service<OntologyService>()('OntologyService', {
  dependencies: () => [Effect.Tag<IOntologyProvider>()],
  accessors: {
    provider: (self) => self._tag,
  },
}) {
  // Service methods build on provider
}
```

### Layer 4: Astro Content Layer Integration

Astro can source data from multiple locations:

```astro
---
// src/pages/[group]/things/[slug].astro
import { getProvider } from '@/lib/ontology/factory';
import type { Thing } from '@/lib/ontology/types';

// Support multiple backends
const provider = await getProvider();
const thing = await provider.things.get(Astro.params.slug);

// Fall back to markdown if backend unavailable
if (!thing) {
  return Astro.redirect(`/blog/${Astro.params.slug}`);
}
---

<Layout title={thing.name}>
  <h1>{thing.name}</h1>
  <Content data={thing} />
</Layout>
```

---

## Implementation Strategy

### Phase 1: Foundation (Infer 1-10)

**Objective:** Create the Effect-TS ontology layer

1. **Define Core Interfaces**
   - `IOntologyProvider` - Unified provider interface
   - `CreateXXXInput`, `UpdateXXXInput` types for each dimension
   - Error types: `EntityNotFound`, `ValidationError`, `UnauthorizedError`

2. **Create Effect Services**
   - `OntologyService` - Main service class
   - Service for each dimension (Groups, People, Things, Connections, Events, Knowledge)
   - Error handler middleware

3. **Update Project Structure**
   ```
   web/src/lib/ontology/
   ├── types.ts              # Core interfaces
   ├── effects.ts            # Effect-TS service definitions
   ├── errors.ts             # Typed error definitions
   ├── factory.ts            # Provider factory
   └── adapters/             # Adapter layer
       ├── markdown.ts
       ├── notion.ts
       └── http.ts
   ```

### Phase 2: Provider Implementations (Infer 11-20)

**Objective:** Implement each provider following the unified interface

1. **ConvexProvider Enhancement**
   - Add type-safe Convex API wrapper
   - Implement real-time subscriptions via `useQuery()`
   - Add optimistic updates

2. **NotionProvider**
   - Notion API integration
   - Map Notion databases to ontology dimensions
   - Caching and rate limiting

3. **MarkdownProvider**
   - Parse frontmatter for metadata
   - Directory structure mapping to groups/things
   - Watch mode for development

4. **HTTPProvider**
   - Generic REST API adapter
   - Query string builder
   - Error translation

5. **CompositeProvider**
   - Chain multiple providers (fallback pattern)
   - Priority-based selection

### Phase 3: Astro Integration (Infer 21-30)

**Objective:** Connect Astro content layer to providers

1. **Content Collections**
   - Define schemas for blog, products, courses
   - Auto-generate from provider data
   - Handle missing/fallback data

2. **Dynamic Routes**
   - `/[group]/things/[slug]` - Entity pages
   - `/[group]/connections` - Relationship views
   - `/[group]/events` - Activity feeds
   - `/[group]/knowledge` - Search/discovery

3. **Static Generation**
   - Pre-build common pages
   - Incremental static regeneration (ISR)
   - Fallback for dynamic content

### Phase 4: Feature-Specific Integration (Infer 31-40)

**Objective:** Integrate 6 ontology dimensions with features

#### Groups Integration
```typescript
// web/src/lib/ontology/services/groups.ts
export const listGroups = Effect.fn(
  async (ctx: OntologyContext) => {
    const provider = ctx.provider;
    const groups = await provider.groups.list();
    return groups;
  },
  { concurrency: 5 }
);
```

#### People Integration
```typescript
// web/src/lib/ontology/services/people.ts
export const getCurrentUser = Effect.fn(
  async (ctx: OntologyContext) => {
    const provider = ctx.provider;
    const user = await provider.people.current();
    if (!user) throw new UnauthorizedError();
    return user;
  }
);
```

#### Things Integration
```typescript
// web/src/lib/ontology/services/things.ts
export const listThings = Effect.fn(
  async (filter: ThingFilter, ctx: OntologyContext) => {
    const things = await ctx.provider.things.list(filter);
    return Effect.all(things.map(t => validateThing(t)));
  }
);
```

#### Connections Integration
```typescript
// web/src/lib/ontology/services/connections.ts
export const getConnections = Effect.fn(
  async (thingId: string, ctx: OntologyContext) => {
    const connections = await ctx.provider.connections.list({
      sourceId: thingId
    });
    return connections;
  }
);
```

#### Events Integration
```typescript
// web/src/lib/ontology/services/events.ts
export const recordEvent = Effect.fn(
  async (event: CreateEventInput, ctx: OntologyContext) => {
    const recorded = await ctx.provider.events.record(event);
    return recorded;
  }
);
```

#### Knowledge Integration
```typescript
// web/src/lib/ontology/services/knowledge.ts
export const search = Effect.fn(
  async (query: string, ctx: OntologyContext) => {
    const results = await ctx.provider.knowledge.search(query, 10);
    return results;
  }
);
```

### Phase 5: Optional Features (Infer 41-50)

**Objective:** Make auth, groups, permissions optional

#### Feature Flags
```typescript
// web/src/lib/ontology/features.ts
export interface FeatureFlags {
  auth: boolean;           // Require authentication
  groups: boolean;         // Multi-tenant groups
  permissions: boolean;    // Role-based access
  realtime: boolean;       // WebSocket subscriptions
  search: boolean;         // Vector search
}

export const defaultFeatures: FeatureFlags = {
  auth: false,           // Disabled by default
  groups: false,
  permissions: false,
  realtime: false,       // Only if Convex
  search: false,
};
```

#### Conditional Routes
```astro
---
// src/pages/account/login.astro
import { features } from '@/lib/ontology/features';

// Hide if auth disabled
if (!features.auth) {
  return Astro.redirect('/');
}
---

<LoginForm />
```

### Phase 6: API Endpoints (Infer 51-60)

**Objective:** Create API routes following ontology structure

```
/api/groups/              # Group operations
/api/people/              # Person operations
/api/things/              # Entity operations
/api/connections/         # Relationship operations
/api/events/              # Event recording
/api/knowledge/search/    # Search operations
```

#### Example API Route
```typescript
// web/src/pages/api/things/[id].ts
import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/ontology/factory';

export const GET: APIRoute = async ({ params }) => {
  const provider = await getProvider();
  const thing = await provider.things.get(params.id);
  return new Response(JSON.stringify(thing), {
    headers: { 'Content-Type': 'application/json' }
  });
};
```

### Phase 7: Testing (Infer 61-70)

**Objective:** Verify all providers work correctly

1. **Provider Tests**
   - Each provider implements full interface
   - Mock data validation
   - Error handling

2. **Integration Tests**
   - Frontend → Provider flows
   - Fallback behavior
   - Feature flag combinations

3. **E2E Tests**
   - Astro page rendering
   - Dynamic routes
   - API endpoints

### Phase 8: Documentation (Infer 71-80)

**Objective:** Document architecture and usage

1. **Provider Guide**
   - How to implement custom provider
   - Configuration options
   - Examples

2. **Feature Toggles**
   - Which features require which backend
   - Trade-offs
   - Performance considerations

3. **Migration Guide**
   - Switching backends
   - Data mapping
   - Rollback procedures

---

## Key Design Decisions

### 1. Effect-TS Over Direct Calls

**Why:** Type-safe composition, error handling, dependency injection

```typescript
// ❌ Direct (tightly coupled)
const thing = await convex.query(api.things.get, { id: '123' });

// ✅ Effect-TS (loosely coupled)
const getThing = Effect.fn(
  async (id: string, ctx: OntologyContext) => {
    return ctx.provider.things.get(id);
  }
);
```

### 2. Unified Interface Over Adapter Pattern

**Why:** Simpler to understand, easier to add new providers

```typescript
// All providers implement same interface
interface IOntologyProvider {
  groups: GroupService;
  people: PeopleService;
  things: ThingService;
  // etc.
}
```

### 3. Feature Flags Over Branching

**Why:** Cleaner code, easier to test combinations

```typescript
// Instead of: if (isConvex) { ... }
// Use: if (features.auth) { ... }
```

### 4. Astro Content Layer as Primary Source

**Why:** Static generation, SEO, performance

- Markdown files for documentation
- Astro collections for structured data
- Provider queries for dynamic content
- Fallback to content layer if provider fails

---

## File Structure After Implementation

```
web/src/
├── lib/ontology/
│   ├── types.ts                    # Core interfaces
│   ├── errors.ts                   # Error definitions
│   ├── effects.ts                  # Effect-TS services
│   ├── factory.ts                  # Provider factory
│   ├── features.ts                 # Feature flags
│   ├── providers/
│   │   ├── index.ts
│   │   ├── convex.ts              # Convex provider
│   │   ├── notion.ts              # Notion provider
│   │   ├── markdown.ts            # Markdown provider
│   │   ├── http.ts                # Generic HTTP
│   │   ├── stripe.ts              # Stripe provider
│   │   └── composite.ts           # Provider chaining
│   ├── services/
│   │   ├── groups.ts              # Groups service
│   │   ├── people.ts              # People service
│   │   ├── things.ts              # Things service
│   │   ├── connections.ts         # Connections service
│   │   ├── events.ts              # Events service
│   │   └── knowledge.ts           # Knowledge service
│   └── adapters/
│       ├── notion-adapter.ts      # Map Notion → ontology
│       ├── markdown-adapter.ts    # Map markdown → ontology
│       └── stripe-adapter.ts      # Map Stripe → ontology
├── pages/api/
│   ├── groups/[id].ts
│   ├── people/[id].ts
│   ├── things/[id].ts
│   ├── connections/[id].ts
│   ├── events/[id].ts
│   └── knowledge/search/[q].ts
├── components/
│   ├── ontology/                  # Reusable components
│   │   ├── GroupList.tsx
│   │   ├── ThingCard.tsx
│   │   ├── ConnectionViewer.tsx
│   │   └── EventTimeline.tsx
│   └── features/                  # Feature-specific
├── hooks/
│   ├── useProvider.ts             # Access current provider
│   ├── useGroup.ts                # Group operations
│   ├── useThing.ts                # Thing operations
│   └── useSearch.ts               # Search operations
└── stores/
    └── ontology.ts                # State management
```

---

## Configuration Examples

### Standalone Frontend (No Backend)

```env
# .env.local
VITE_PROVIDER=markdown
VITE_FEATURES='{"auth":false,"groups":false,"permissions":false}'
```

### Stripe Checkout Only

```env
VITE_PROVIDER=stripe
STRIPE_PUBLIC_KEY=pk_live_...
```

### Full Backend (Convex + Auth)

```env
VITE_PROVIDER=convex
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
VITE_FEATURES='{"auth":true,"groups":true,"permissions":true}'
```

### Multi-Source (Notion + Markdown)

```env
VITE_PROVIDER=composite
VITE_COMPOSITE_PROVIDERS='["notion","markdown"]'
NOTION_API_KEY=ntn_...
```

---

## Success Criteria

- [ ] Effect-TS ontology layer fully typed
- [ ] All 7 providers implement unified interface
- [ ] Astro static generation works with all providers
- [ ] Feature flags allow opt-in for auth/groups/permissions
- [ ] API endpoints follow ontology naming structure
- [ ] All tests passing (unit, integration, e2e)
- [ ] Documentation complete with examples
- [ ] Zero breaking changes to existing frontend
- [ ] Can switch backends without code changes
- [ ] Frontend runs standalone without backend

---

## Fallback Strategy

When provider is unavailable:

```typescript
// 1. Try primary provider
// 2. Fall back to markdown/content layer
// 3. Show cached version
// 4. Show offline message
// 5. Queue for sync when online
```

---

## Next Steps

1. **Phase 1-2:** Parallel work on Effect-TS layer and provider implementations
2. **Phase 3:** Integrate with Astro content layer
3. **Phase 4:** Implement 6-dimension services
4. **Phase 5:** Add feature flags for optional auth
5. **Phase 6:** Create API endpoints
6. **Phase 7:** Comprehensive testing
7. **Phase 8:** Documentation and release
