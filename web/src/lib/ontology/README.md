# Ontology Provider System

Backend-agnostic provider system for the 6-dimension ontology. Supports multiple backend implementations with fallback patterns.

## Quick Start

### 1. Convex Only (Production)

```env
# .env.local
VITE_PROVIDER=convex
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

```typescript
// Usage in code
import { getProvider } from '@/lib/ontology/factory';

const provider = await getProvider();
const things = await provider.things.list({ groupId: 'group123' });
```

### 2. Markdown Only (Standalone)

```env
# .env.local
VITE_PROVIDER=markdown
VITE_CONTENT_DIR=src/content
```

Reads markdown files from `src/content/` directory with frontmatter metadata.

### 3. Custom HTTP API

```env
# .env.local
VITE_PROVIDER=http
VITE_HTTP_API_URL=https://api.example.com
VITE_HTTP_CACHE=true
VITE_HTTP_CACHE_TTL=300000
```

### 4. Composite (Multiple Providers)

```env
# .env.local
VITE_PROVIDER=composite
VITE_COMPOSITE_PROVIDERS='[
  {"name":"convex","type":"convex","convexUrl":"https://..."},
  {"name":"markdown","type":"markdown"}
]'
VITE_COMPOSITE_PROVIDER_ORDER=convex,markdown
```

## Provider Implementations

### ConvexProvider

**Status:** Production-ready
**Features:**
- Real-time subscriptions (with useQuery hooks)
- Multi-tenant organization scoping
- Typed Convex API wrapper
- Optimistic updates support

**Best for:** Full backend integration with authentication and real-time features

**Configuration:**
```typescript
const provider = await createConvexProvider(
  'https://your-deployment.convex.cloud',
  'current-user-id' // optional
);
```

### MarkdownProvider

**Status:** Read-only, development-friendly
**Features:**
- Parses frontmatter metadata
- Directory structure mapping to ontology
- Standalone mode (no backend needed)
- Fast development iteration

**Best for:** Standalone frontend, documentation sites, content-heavy applications

**Directory Structure:**
```
src/content/
├── groups/
│   └── [group-slug]/
│       ├── index.md (group metadata in frontmatter)
│       └── things/
│           └── [thing-slug].md (thing with frontmatter)
└── blog/
    └── [post-slug].md
```

**Frontmatter Example:**
```yaml
---
title: My Thing
type: blog_post
status: published
groupId: my-group
properties:
  author: John Doe
  tags:
    - tag1
    - tag2
---
Content here...
```

### HTTPProvider

**Status:** Production-ready
**Features:**
- Generic REST API adapter
- Query string builder
- Error translation
- Caching (optional)
- Rate limiting ready

**Best for:** Custom backends, WordPress APIs, external services

**Configuration:**
```typescript
const provider = await createHTTPProvider({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': 'Bearer token' },
  timeout: 30000,
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes
  },
});
```

**API Endpoint Structure:**
```
/api/groups/list?type=...&status=...
/api/groups/:id
/api/people/list?groupId=...
/api/people/:id
/api/people/current
/api/things/list?type=...&status=...
/api/things/:id
/api/connections/list?fromThingId=...
/api/connections/:id
/api/events/list?type=...&actorId=...
/api/knowledge/search?query=...&groupId=...
```

### CompositeProvider

**Status:** Production-ready
**Features:**
- Chain multiple providers with fallback
- Priority-ordered provider selection
- Per-dimension provider selection
- Error aggregation for debugging
- Write operations always use primary provider

**Best for:** Hybrid setups, migration scenarios, gradual rollouts

**Configuration:**
```typescript
const provider = await createCompositeProvider(
  buildProviderMap(
    { name: 'convex', provider: convexProvider },
    { name: 'markdown', provider: markdownProvider }
  ),
  ['convex', 'markdown'] // try convex first, fallback to markdown
);
```

## IOntologyProvider Interface

All providers implement this unified interface:

```typescript
interface IOntologyProvider {
  // Groups dimension
  groups: {
    list(filter?: GroupFilter): Promise<Group[]>;
    get(id: string): Promise<Group | null>;
    create(data: CreateGroupInput): Promise<Group>;
    update(id: string, data: UpdateGroupInput): Promise<Group>;
    delete(id: string): Promise<void>;
  };

  // People dimension
  people: {
    list(filter?: PersonFilter): Promise<Person[]>;
    get(id: string): Promise<Person | null>;
    create(data: CreatePersonInput): Promise<Person>;
    update(id: string, data: UpdatePersonInput): Promise<Person>;
    current(): Promise<Person | null>;
    delete(id: string): Promise<void>;
  };

  // Things dimension (entities)
  things: {
    list(filter?: ThingFilter): Promise<Thing[]>;
    get(id: string): Promise<Thing | null>;
    create(data: CreateThingInput): Promise<Thing>;
    update(id: string, data: UpdateThingInput): Promise<Thing>;
    delete(id: string): Promise<void>;
  };

  // Connections dimension (relationships)
  connections: {
    list(filter?: ConnectionFilter): Promise<Connection[]>;
    get(id: string): Promise<Connection | null>;
    create(data: CreateConnectionInput): Promise<Connection>;
    delete(id: string): Promise<void>;
  };

  // Events dimension (actions)
  events: {
    list(filter?: EventFilter): Promise<Event[]>;
    record(data: CreateEventInput): Promise<Event>;
  };

  // Knowledge dimension (vectors/search)
  knowledge: {
    list(filter?: KnowledgeFilter): Promise<Knowledge[]>;
    search(query: string, groupId: string, limit?: number): Promise<Knowledge[]>;
    embed(text: string): Promise<number[]>;
    create(data: CreateKnowledgeInput): Promise<Knowledge>;
  };
}
```

## Error Handling

All providers throw typed errors:

```typescript
import {
  OntologyError,
  EntityNotFoundError,
  ValidationError,
  UnauthorizedError,
  NotImplementedError,
} from '@/lib/ontology/providers';

try {
  const thing = await provider.things.get('thing123');
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    console.log('Thing not found');
  } else if (error instanceof ValidationError) {
    console.log('Validation failed:', error.details);
  } else if (error instanceof UnauthorizedError) {
    console.log('Not authorized');
  }
}
```

## Using Providers in Components

### In Astro Pages (SSR)

```astro
---
// src/pages/things/[id].astro
import { getProvider } from '@/lib/ontology/factory';

const provider = await getProvider();
const thing = await provider.things.get(Astro.params.id);

if (!thing) {
  return Astro.redirect('/404');
}
---

<Layout title={thing.name}>
  <h1>{thing.name}</h1>
  <p>{thing.properties.description}</p>
</Layout>
```

### In React Components

```typescript
// src/components/ThingList.tsx
import { useEffect, useState } from 'react';
import { getProvider } from '@/lib/ontology/factory';
import type { Thing } from '@/lib/ontology/providers';

export function ThingList({ type }: { type: string }) {
  const [things, setThings] = useState<Thing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getProvider().then(provider => {
      provider.things
        .list({ type })
        .then(setThings)
        .catch(setError)
        .finally(() => setLoading(false));
    });
  }, [type]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {things.map(thing => (
        <li key={thing._id}>{thing.name}</li>
      ))}
    </ul>
  );
}
```

## Creating Custom Providers

Implement the `IOntologyProvider` interface:

```typescript
// custom-provider.ts
import type { IOntologyProvider } from '@/lib/ontology/providers';

export class CustomProvider implements IOntologyProvider {
  groups = {
    list: async (filter) => { /* ... */ },
    get: async (id) => { /* ... */ },
    create: async (data) => { /* ... */ },
    update: async (id, data) => { /* ... */ },
    delete: async (id) => { /* ... */ },
  };

  // ... implement all other dimensions
}
```

Then use in factory:

```typescript
const provider = new CustomProvider();
const things = await provider.things.list();
```

## Migration Guide

### From Direct Convex to Provider

**Before:**
```typescript
import { useQuery } from 'convex/react';
import { api } from '@/lib/convex-api';

export function Things() {
  const things = useQuery(api.things.list, { groupId: 'g1' });
  // ...
}
```

**After:**
```typescript
import { getProvider } from '@/lib/ontology/factory';

export async function getThings() {
  const provider = await getProvider();
  return provider.things.list({ groupId: 'g1' });
}
```

Benefits:
- Works with any backend (not just Convex)
- Can switch backends by changing VITE_PROVIDER env var
- Fallback patterns with CompositeProvider
- Testable with mock providers

## Testing

Create a mock provider for tests:

```typescript
// tests/mocks/ontology-provider.ts
import type { IOntologyProvider } from '@/lib/ontology/providers';

export const mockProvider: IOntologyProvider = {
  groups: {
    list: async () => [],
    get: async () => null,
    create: async () => ({ _id: 'new', /* ... */ }),
    update: async () => ({ _id: 'updated', /* ... */ }),
    delete: async () => {},
  },
  // ... implement all dimensions with test data
};
```

## Performance Considerations

### Caching

HTTPProvider supports caching:

```env
VITE_HTTP_CACHE=true
VITE_HTTP_CACHE_TTL=300000
```

### Pagination

Use filter limits:

```typescript
const things = await provider.things.list({
  limit: 20,
  offset: 0,
});
```

### Composite Provider

- Tries providers in order
- Caches results at provider level
- Write operations always use primary provider
- Read operations fall back on error

## Troubleshooting

### Provider Not Initializing

**Problem:** `Error: Unknown provider type: undefined`

**Solution:** Check `VITE_PROVIDER` env var is set

```bash
# .env.local
VITE_PROVIDER=convex
```

### Convex Not Found

**Problem:** `Error: PUBLIC_CONVEX_URL is required`

**Solution:** Set Convex URL in env

```bash
# .env.local
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

### Composite Provider Fallback Not Working

**Problem:** All providers failing

**Solution:** Check error logs with `getErrorLogs()`

```typescript
const provider = await getProvider();
if (provider instanceof CompositeProvider) {
  console.log(provider.getErrorLogs());
}
```

## Architecture

The provider system implements these patterns:

1. **Dependency Inversion** - Code depends on IOntologyProvider interface, not concrete providers
2. **Factory Pattern** - Environment-based provider creation
3. **Fallback Pattern** - CompositeProvider tries multiple sources
4. **Decorator Pattern** - HTTPProvider wraps REST APIs
5. **Adapter Pattern** - MarkdownProvider adapts filesystem to ontology

## Next Steps

1. Choose a provider configuration for your use case
2. Set environment variables
3. Use `getProvider()` or `getGlobalProvider()` in your code
4. Implement custom providers if needed
5. Test with mock providers
