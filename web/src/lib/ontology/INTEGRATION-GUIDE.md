# Provider Integration Guide

Complete guide for integrating the IOntologyProvider system into the ONE Platform frontend and backend separation.

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│     FRONTEND (Astro + React)                 │
│  - Pages & Components                        │
│  - No direct backend imports                 │
└─────────────┬──────────────────────────────┘
              │
              ↓ (HTTP via provider)
┌──────────────────────────────────────────────┐
│     ONTOLOGY PROVIDER LAYER                  │
│  - IOntologyProvider Interface               │
│  - Types & Error Handling                    │
│  - Factory Pattern for Instantiation         │
└─────────────┬──────────────────────────────┘
              │
              ↓ (Choose implementation)
┌─────────────────────────────────────────────┐
│     PROVIDER IMPLEMENTATIONS                 │
│  - ConvexProvider (Convex backend)           │
│  - HTTPProvider (Custom API)                 │
│  - MarkdownProvider (Static content)         │
│  - CompositeProvider (Multiple providers)    │
└──────────────────────────────────────────────┘
```

## Phase 1: Setup Provider Infrastructure

### 1.1 Configure Environment

**Development (Convex):**
```bash
# .env.local
VITE_PROVIDER=convex
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

**Staging (Composite - Convex + Markdown fallback):**
```bash
VITE_PROVIDER=composite
VITE_COMPOSITE_PROVIDERS='[
  {
    "name": "convex",
    "type": "convex",
    "convexUrl": "https://staging.convex.cloud"
  },
  {
    "name": "markdown",
    "type": "markdown"
  }
]'
VITE_COMPOSITE_PROVIDER_ORDER=convex,markdown
```

**Production (Convex + caching):**
```bash
VITE_PROVIDER=convex
PUBLIC_CONVEX_URL=https://prod.convex.cloud
```

### 1.2 Create Provider Types

Already in place at `/web/src/lib/ontology/types.ts`:

```typescript
// Core ontology types
export interface Group { /* ... */ }
export interface Person { /* ... */ }
export interface Thing { /* ... */ }
export interface Connection { /* ... */ }
export interface Event { /* ... */ }
export interface Knowledge { /* ... */ }

// Unified provider interface
export interface IOntologyProvider {
  groups: { /* ... */ };
  people: { /* ... */ };
  things: { /* ... */ };
  connections: { /* ... */ };
  events: { /* ... */ };
  knowledge: { /* ... */ };
}
```

## Phase 2: Implement Providers

### 2.1 ConvexProvider (Already Implemented)

**Location:** `/web/src/lib/ontology/providers/convex.ts`

**Features:**
- Wraps existing Convex backend
- Type-safe HTTP client wrapper
- Supports both SSR and client-side rendering
- Error handling and mapping

**Usage:**
```typescript
import { createConvexProvider } from '@/lib/ontology/providers';

const provider = await createConvexProvider(
  'https://your-deployment.convex.cloud'
);

const things = await provider.things.list({ groupId: 'g1' });
```

### 2.2 HTTPProvider (Already Implemented)

**Location:** `/web/src/lib/ontology/providers/http.ts`

**Features:**
- Generic REST API adapter
- Query string builder
- Optional caching
- Error translation

**Usage:**
```typescript
import { createHTTPProvider } from '@/lib/ontology/providers';

const provider = await createHTTPProvider({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' },
  cache: { enabled: true, ttl: 5 * 60 * 1000 },
});

const groups = await provider.groups.list();
```

**Expected API Format:**
```
GET /api/groups/list?limit=50&offset=0
GET /api/groups/:id
POST /api/groups { name, type, ... }
PATCH /api/groups/:id { updates }
DELETE /api/groups/:id

GET /api/things/list?type=blog_post&status=published
GET /api/things/:id
POST /api/things { groupId, type, name, properties }
// ... etc for all dimensions
```

### 2.3 MarkdownProvider (Already Implemented)

**Location:** `/web/src/lib/ontology/providers/markdown.ts`

**Features:**
- Read-only file-based provider
- Parses frontmatter metadata
- Directory structure mapping
- Development-friendly

**Directory Structure:**
```
src/content/
├── groups/
│   └── [group-slug]/
│       ├── index.md (group metadata)
│       └── things/
│           └── [thing-slug].md
├── blog/
│   └── [post-slug].md (thing with type: blog_post)
└── docs/
    └── [doc-slug].md (thing with type: documentation)
```

**Frontmatter Format:**
```yaml
---
title: "My Thing"
description: "Short description"
type: "blog_post"
status: "published"
groupId: "main"
properties:
  author: "John Doe"
  tags:
    - tutorial
    - beginner
  readingTime: 5
---

# Content in markdown
```

### 2.4 CompositeProvider (Already Implemented)

**Location:** `/web/src/lib/ontology/providers/composite.ts`

**Features:**
- Chain multiple providers with fallback
- Priority-ordered selection
- Error aggregation
- Write operations to primary source only

**Usage:**
```typescript
import {
  createCompositeProvider,
  buildProviderMap
} from '@/lib/ontology/providers';

const providers = buildProviderMap(
  { name: 'convex', provider: convexProvider },
  { name: 'markdown', provider: markdownProvider }
);

const composite = await createCompositeProvider(
  providers,
  ['convex', 'markdown'] // try convex first
);

// Reads try convex, fallback to markdown on error
const things = await composite.things.list();

// Writes always go to convex (first provider)
await composite.things.create({ /* ... */ });
```

## Phase 3: Integrate with Frontend

### 3.1 Use in Astro Pages (SSR)

**Pattern:**
```astro
---
// src/pages/things/[slug].astro
import { getProvider } from '@/lib/ontology/factory';
import ThingCard from '@/components/ThingCard';

const provider = await getProvider();
const thing = await provider.things.get(Astro.params.slug);

if (!thing) {
  return Astro.redirect('/404');
}

// Pre-render related data
const connections = await provider.connections.list({
  fromThingId: thing._id,
});
---

<Layout title={thing.name}>
  <h1>{thing.name}</h1>
  <ThingCard thing={thing} client:load />
  <RelatedThings connections={connections} />
</Layout>
```

**Benefits:**
- Data fetched server-side (faster first paint)
- No client-side hydration delay
- SEO-friendly
- Works with any provider implementation

### 3.2 Use in React Components

**Pattern for data fetching:**
```typescript
// src/components/ThingList.tsx
import { useEffect, useState } from 'react';
import { getProvider } from '@/lib/ontology/factory';
import type { Thing } from '@/lib/ontology/providers';

export function ThingList({ groupId }: { groupId: string }) {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThings = async () => {
      try {
        const provider = await getProvider();
        const data = await provider.things.list({ groupId });
        setThings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchThings();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {things.map(thing => (
        <div key={thing._id}>{thing.name}</div>
      ))}
    </div>
  );
}
```

**Pattern for mutations:**
```typescript
// src/components/CreateThingForm.tsx
import { useState } from 'react';
import { getProvider } from '@/lib/ontology/factory';
import type { CreateThingInput } from '@/lib/ontology/providers';

export function CreateThingForm({ groupId }: { groupId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const provider = await getProvider();
      const formData = new FormData(e.currentTarget);

      const newThing: CreateThingInput = {
        groupId,
        type: formData.get('type') as string,
        name: formData.get('name') as string,
        properties: {
          description: formData.get('description'),
        },
        status: 'draft',
      };

      const created = await provider.things.create(newThing);
      console.log('Created:', created);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required />
      <input name="type" required />
      <textarea name="description" />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
```

### 3.3 Use in API Routes

**Pattern:**
```typescript
// src/pages/api/things/[id].ts
import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/ontology/factory';

export const GET: APIRoute = async ({ params }) => {
  try {
    const provider = await getProvider();
    const thing = await provider.things.get(params.id!);

    if (!thing) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(thing), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST: APIRoute = async ({ request, params }) => {
  try {
    const provider = await getProvider();
    const data = await request.json();

    const updated = await provider.things.update(params.id!, data);

    return new Response(JSON.stringify(updated), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
```

## Phase 4: Integrate with Backend

### 4.1 Update Convex API Endpoints

The Convex provider expects these mutation/query endpoints:

**Queries:**
```typescript
// backend/convex/queries/groups.ts
export const list = query({ /* ... */ });
export const get = query({ args: { id: v.id('groups') }, /* ... */ });

// Similar for people.ts, things.ts, connections.ts, events.ts, knowledge.ts
```

**Mutations:**
```typescript
// backend/convex/mutations/groups.ts
export const create = mutation({ /* ... */ });
export const update = mutation({ /* ... */ });
export const delete = mutation({ /* ... */ });

// Similar for people.ts, things.ts, connections.ts, events.ts, knowledge.ts
```

### 4.2 Add HTTP API Endpoints (Optional)

For custom HTTP backends or external integrations:

```typescript
// src/pages/api/things/list.ts
import type { APIRoute } from 'astro';
import { getProvider } from '@/lib/ontology/factory';

export const GET: APIRoute = async ({ url }) => {
  const provider = await getProvider();
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const type = url.searchParams.get('type');
  const status = url.searchParams.get('status');

  const things = await provider.things.list({
    limit,
    offset,
    type: type || undefined,
    status: status as any,
  });

  return new Response(JSON.stringify(things), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

## Phase 5: Error Handling

### 5.1 Use Typed Errors

All providers throw typed errors from `/web/src/lib/ontology/types.ts`:

```typescript
import {
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
  OntologyError,
} from '@/lib/ontology/providers';

try {
  const thing = await provider.things.get('thing123');
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    // Handle "not found" case
    console.error(`Thing not found: ${error.details?.id}`);
  } else if (error instanceof ValidationError) {
    // Handle validation error
    console.error(`Validation failed: ${error.details?.field}`);
  } else if (error instanceof UnauthorizedError) {
    // Handle auth error
    console.error('Not authorized');
  } else if (error instanceof OntologyError) {
    // Handle other ontology errors
    console.error(`Error (${error.code}): ${error.message}`);
  }
}
```

### 5.2 Error Recovery Patterns

**Fallback to cached data:**
```typescript
const cached = getCachedThings(); // Your cache logic
try {
  return await provider.things.get(id);
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    return cached[id] || null;
  }
  throw error;
}
```

**Retry logic:**
```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1))); // exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const thing = await withRetry(() => provider.things.get(id));
```

## Phase 6: Testing

### 6.1 Create Mock Provider

```typescript
// tests/mocks/ontology-provider.ts
import type { IOntologyProvider } from '@/lib/ontology/providers';

export const createMockProvider = (overrides?: Partial<IOntologyProvider>): IOntologyProvider => ({
  groups: {
    list: async () => [
      { _id: 'g1', name: 'Main', type: 'organization', slug: 'main', status: 'active', createdAt: 0, updatedAt: 0 },
    ],
    get: async (id) => id === 'g1' ? { _id: 'g1', /* ... */ } : null,
    create: async (data) => ({ _id: 'new', ...data, createdAt: Date.now(), updatedAt: Date.now() }),
    update: async (id, data) => ({ _id: id, /* current */ ...data }),
    delete: async () => {},
  },
  // ... implement all dimensions with test data
  ...overrides,
});
```

### 6.2 Test Provider Selection

```typescript
// tests/provider-selection.test.ts
import { setGlobalProvider } from '@/lib/ontology/factory';
import { createMockProvider } from './mocks/ontology-provider';

describe('Provider Selection', () => {
  it('should use mock provider in tests', async () => {
    const mockProvider = createMockProvider();
    setGlobalProvider(mockProvider);

    const things = await mockProvider.things.list();
    expect(things).toBeDefined();
  });
});
```

## Phase 7: Performance Optimization

### 7.1 Caching Strategy

```typescript
// src/lib/ontology/cache.ts
import type { Thing } from '@/lib/ontology/providers';

class ThingCache {
  private cache = new Map<string, { data: Thing; expiry: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(id: string, thing: Thing) {
    this.cache.set(id, { data: thing, expiry: Date.now() + this.ttl });
  }

  get(id: string): Thing | null {
    const entry = this.cache.get(id);
    if (!entry) return null;
    if (entry.expiry < Date.now()) {
      this.cache.delete(id);
      return null;
    }
    return entry.data;
  }

  invalidate(id: string) {
    this.cache.delete(id);
  }

  clear() {
    this.cache.clear();
  }
}

export const thingCache = new ThingCache();
```

### 7.2 Pagination

```typescript
// Always use pagination for list operations
const things = await provider.things.list({
  limit: 20,
  offset: 0,
  type: 'blog_post',
});

// Load next page
const nextPage = await provider.things.list({
  limit: 20,
  offset: 20,
  type: 'blog_post',
});
```

## Common Integration Patterns

### 1. List with Filters

```typescript
const things = await provider.things.list({
  groupId: 'g1',
  type: 'blog_post',
  status: 'published',
  search: 'tutorial',
  limit: 20,
  offset: 0,
});
```

### 2. Create with Relationships

```typescript
// Create thing
const thing = await provider.things.create({
  groupId: 'g1',
  type: 'blog_post',
  name: 'My Post',
  properties: { content: '...' },
  status: 'draft',
});

// Create relationship
const connection = await provider.connections.create({
  groupId: 'g1',
  fromThingId: 'user1',
  toThingId: thing._id,
  relationshipType: 'authored',
});

// Log event
await provider.events.record({
  groupId: 'g1',
  type: 'entity_created',
  actorId: 'user1',
  targetId: thing._id,
  metadata: { entityType: 'blog_post' },
});
```

### 3. Search with Embeddings

```typescript
// Get embeddings for text
const embedding = await provider.knowledge.embed('machine learning');

// Search similar items
const results = await provider.knowledge.search(
  'machine learning',
  'g1', // groupId
  10 // limit
);
```

## Troubleshooting

### Issue: Provider Not Initializing

```bash
# Check environment variable
echo $VITE_PROVIDER

# Should output: convex, markdown, http, or composite
```

### Issue: Convex Endpoint Not Found

```typescript
// Make sure backend has endpoints like:
// queries: api:groups:list, api:groups:get, etc.
// mutations: api:groups:create, api:groups:update, etc.

// Check Convex logs
npx convex logs --project=your-project
```

### Issue: HTTP Provider 404s

```typescript
// Check HTTPProvider logs
const provider = await getProvider();
if (provider instanceof HTTPProvider) {
  console.log('Cache:', provider.getCache());
}
```

## Next Steps

1. **Choose Provider Configuration** - Select Convex, HTTP, or Composite based on your needs
2. **Implement Backend Endpoints** - If using Convex or HTTP, implement required endpoints
3. **Update Frontend Pages** - Use `getProvider()` in Astro pages and React components
4. **Handle Errors** - Use typed error handling throughout
5. **Add Tests** - Create mock providers for testing
6. **Monitor Performance** - Use caching and pagination for large datasets

## Resources

- **Types:** `/web/src/lib/ontology/types.ts`
- **Factory:** `/web/src/lib/ontology/factory.ts`
- **Providers:** `/web/src/lib/ontology/providers/`
- **Documentation:** `/web/src/lib/ontology/README.md`
