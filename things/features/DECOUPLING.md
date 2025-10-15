# Frontend/Backend Decoupling Pattern

**Status:** ✅ Fully Implemented

This document explains the proper architecture for a fully decoupled frontend that can connect to ANY backend (not just our Convex deployment).

## Architecture Layers

```
┌──────────────────────────────────────────────────┐
│  Components (React/Astro)                        │
│  Use domain hooks                                │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  src/hooks/* (Domain Hooks)                      │
│  useGroups, useThings, useConnections            │
│  TanStack Query + Effect.ts                      │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  src/providers/DataProvider (Interface)          │
│  Backend-agnostic contract                       │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  src/providers/convex/ConvexProvider (Impl)      │
│  Convex-specific implementation                  │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  ANY Backend via PUBLIC_CONVEX_URL               │
│  - Our backend (shocking-falcon-870.convex.cloud)│
│  - api.one.ie (shared platform backend)         │
│  - Customer's own Convex deployment             │
└──────────────────────────────────────────────────┘
```

## ❌ Don't Do This (Coupled)

```typescript
// ❌ BAD: Direct Convex imports
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';

function MyComponent() {
  const data = useQuery(api.queries.things.list);
  // Tightly coupled to Convex
}
```

## ✅ Do This (Decoupled)

```typescript
// ✅ GOOD: Domain hooks
import { useThings } from '@/hooks/useThings';

function MyComponent() {
  const { data, loading, error } = useThings({ type: 'course' });
  // Works with ANY backend
}
```

## Available Domain Hooks

### Core Ontology Hooks

- `useThings(filter?, options?)` - List/query things (entities)
- `useThing(id, options?)` - Get single thing by ID
- `useConnections(filter?, options?)` - List relationships
- `useConnection(id, options?)` - Get single connection
- `useEvents(filter?, options?)` - List events (actions/logs)
- `useKnowledge(filter?, options?)` - RAG/vector search

### Specialized Hooks

- `useGroups(filter?, options?)` - Hierarchical groups
- `useGroup(id, options?)` - Single group
- `useGroupBySlug(slug, options?)` - Group by slug
- `useGroupStats(groupId, options?)` - Group statistics
- `useOrganizations(filter?, options?)` - Multi-tenant orgs
- `usePeople(filter?, options?)` - Users/creators/customers

### Mutations

- `useCreateGroup(options?)` - Create new group
- `useUpdateGroup(groupId, options?)` - Update group
- `useDeleteGroup(groupId, options?)` - Delete group

## Example: GroupCard Component

**Before (Coupled):**

```typescript
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export function GroupCard({ groupId }: { groupId: string }) {
  const group = useQuery(api.queries.groups.getById, { groupId });
  const stats = useQuery(api.queries.groups.getStats, { groupId });

  if (group === undefined) return <Skeleton />;

  return <Card>{group.name}</Card>;
}
```

**After (Decoupled):**

```typescript
import { useGroup, useGroupStats } from "@/hooks/useGroups";

export function GroupCard({ groupId }: { groupId: string }) {
  const { data: group, loading } = useGroup(groupId);
  const { data: stats } = useGroupStats(groupId);

  if (loading) return <Skeleton />;

  return <Card>{group?.name}</Card>;
}
```

## Hook Usage Patterns

### Query Hook

```typescript
const { data, loading, error, refetch, refetching } = useGroups(
  {
    type: 'community',
    status: 'active',
    visibility: 'public',
    limit: 50,
  },
  {
    enabled: true, // Conditional fetching
    staleTime: 5000, // Cache freshness
    refetchInterval: 10000, // Polling
  }
);
```

### Mutation Hook

```typescript
const createGroup = useCreateGroup({
  onSuccess: () => {
    toast.success('Group created!');
  },
  onError: (error) => {
    toast.error(error.message);
  },
});

const handleCreate = async () => {
  const { data, error } = await createGroup.mutate({
    name: 'My Group',
    slug: 'my-group',
    type: 'community',
    settings: {
      visibility: 'public',
      joinPolicy: 'open',
    },
  });

  if (error) {
    console.error('Failed:', error);
  } else {
    console.log('Created:', data);
  }
};
```

## Benefits of This Architecture

### 1. Backend Flexibility

- Switch from Convex to REST API without changing components
- Connect to different backend deployments via env var
- Support multiple backends simultaneously

### 2. Type Safety

- TypeScript interfaces throughout
- Effect.ts for typed errors
- TanStack Query for predictable state

### 3. Testability

- Mock DataProvider for unit tests
- Test hooks independently
- No Convex-specific test setup needed

### 4. Performance

- TanStack Query caching
- Automatic request deduplication
- Background refetching

### 5. Developer Experience

- Domain-focused APIs (`useGroups` not `useQuery`)
- Consistent error handling
- Loading states built-in

## Environment Configuration

```bash
# .env.local
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud

# Or connect to shared platform
PUBLIC_CONVEX_URL=https://api.one.ie

# Or customer's own deployment
PUBLIC_CONVEX_URL=https://customer.convex.cloud
```

## Creating New Hooks

Follow the established pattern in `src/hooks/useGroups.tsx`:

1. Define TypeScript types
2. Create query hooks using `useDataProvider()`
3. Create mutation hooks with cache invalidation
4. Export everything for easy importing

```typescript
// src/hooks/useCourses.tsx
export function useCourses(filter?, options?) {
  const provider = useDataProvider();

  const queryFn = async () => {
    const effect = provider.things.list({
      type: 'course',
      ...filter,
    });
    return await Effect.runPromise(effect);
  };

  return useQuery({
    queryKey: ['courses', filter],
    queryFn,
    ...options,
  });
}
```

## Migration Guide

To migrate from Convex hooks to domain hooks:

1. Find: `import { useQuery } from "convex/react"`
2. Replace with appropriate domain hook
3. Update data access patterns (no `undefined` checks needed)
4. Test with different backend URLs

## Summary

**Never import from `convex/react` or `convex/_generated/api` in components.**

Always use:

- `@/hooks/*` for data fetching
- `@/providers/*` for backend abstraction
- `@/types/*` for shared types

This keeps the frontend **100% decoupled** from the backend implementation.
