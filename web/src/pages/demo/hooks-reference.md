---
layout: /src/layouts/Layout.astro
title: React Hooks - Quick Reference
description: Quick reference card for all 43 React hooks
---

# React Hooks - Quick Reference Card

## All 43 Hooks at a Glance

### Provider Hooks (4)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useProvider()` | `IDataProvider \| null` | Access current backend provider |
| `useIsProviderAvailable()` | `boolean` | Check if backend is online |
| `useProviderCapability(cap)` | `boolean` | Check provider capabilities |
| `useProviderName()` | `string \| null` | Get provider name |

### Groups Hooks (4)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useGroup()` | `{get, create, update, loading, error}` | CRUD on individual groups |
| `useGroups(filter?)` | `{groups, loading, error}` | List groups with filtering |
| `useCurrentGroup(id?)` | `{group, loading, error}` | Get currently active group |
| `useChildGroups(parentId)` | `{groups, loading, error}` | Get child groups (hierarchical) |

### People Hooks (5)

| Hook | Returns | Purpose |
|------|---------|---------|
| `usePerson()` | `{get, update, loading, error}` | Get/update single person |
| `useCurrentUser()` | `{user, loading, error}` | Get authenticated user |
| `useHasRole(role)` | `boolean` | Check if user has role |
| `useCanAccess(resource, action)` | `boolean` | Check resource access |
| `useGroupMembers(id)` | `{members, loading, error}` | Get group members |

### Things Hooks (7)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useThing()` | `{get, create, update, delete, ...}` | CRUD on entities |
| `useThings(filter?)` | `{things, loading, error}` | List entities with filter |
| `useThingDetail(id)` | `{thing, loading, error}` | Get single entity |
| `useThingsByType(type)` | `{things, loading, error}` | Get all of specific type |
| `useThingSearch(query)` | `{things, loading, error}` | Search entities |
| `usePublishedThings(type?, limit?)` | `{things, loading, error}` | Get published entities |
| `useMyThings(type?, status?)` | `{things, loading, error}` | Get current user's entities |

### Connections Hooks (9)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useConnection()` | `{create, delete, loading, error}` | Create/delete relationships |
| `useConnections(filter?)` | `{connections, loading, error}` | List relationships |
| `useRelatedEntities(id, type?)` | `{entities, loading, error}` | Get related entities |
| `useIsConnected(from, to, type?)` | `boolean` | Check if connected |
| `useOwnedEntities(id, type?)` | `{entities, loading, error}` | Get owned entities |
| `useFollowers(id)` | `{followers, loading, error}` | Get user followers |
| `useFollowing(id)` | `{following, loading, error}` | Get following list |
| `useEnrollments(courseId)` | `{enrollments, loading, error}` | Get course enrollments |
| `useUserEnrollments(id)` | `{enrollments, loading, error}` | Get user's enrollments |

### Events Hooks (9)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useEvent()` | `{record, loading, error}` | Record or retrieve events |
| `useEvents(filter?)` | `{events, loading, error}` | List events with filter |
| `useActivityFeed(limit?)` | `{activities, loading, error}` | Get user activity feed |
| `useAuditTrail(id)` | `{events, loading, error}` | Get entity audit trail |
| `useUserHistory(id)` | `{events, loading, error}` | Get user event history |
| `useEventsByType(type, filter?)` | `{events, loading, error}` | Get events by type |
| `useEventCount(filter?)` | `number` | Count matching events |
| `useTimeline(id, dateRange?)` | `{events, loading, error}` | Get chronological timeline |
| `useEventStream(filter?)` | `{events, subscribe, unsubscribe}` | Real-time event stream |

### Search & Knowledge Hooks (9)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useSearch(query, options?)` | `{results, loading, error}` | Search all entities |
| `useSearchByType(q, type, opts?)` | `{results, loading, error}` | Search by entity type |
| `useLabels(category?)` | `{labels, loading, error}` | Get all labels |
| `useLabelsByCategory(cat)` | `{labels, loading, error}` | Get labels by category |
| `useEntityLabels(id)` | `{labels, loading, error}` | Get entity labels |
| `useEntitiesByLabel(label, type?)` | `{entities, loading, error}` | Get labeled entities |
| `useSimilarEntities(id, limit?)` | `{entities, loading, error}` | Vector similarity search |
| `useFacetedSearch(q, facets?)` | `{results, facets, ...}` | Faceted search |
| `useTrendingEntities(type?, tf?)` | `{entities, loading, error}` | Get trending entities |

### Recommendations Hook (1)

| Hook | Returns | Purpose |
|------|---------|---------|
| `useRecommendations(limit?, type?)` | `{recommendations, loading, error}` | AI recommendations |

---

## Common Patterns

### Check Provider Availability

```typescript
const isOnline = useIsProviderAvailable();

if (!isOnline) {
  return <OfflineMode />;
}
```

### Handle Loading & Error States

```typescript
const { things, loading, error } = useThings();

if (loading) return <Skeleton />;
if (error) return <Error msg={error} />;
return <List items={things} />;
```

### Create with Error Handling

```typescript
const { create, error } = useThing();

const handle = async (data) => {
  await create(data);
  if (error) {
    toast.error(error);
  } else {
    toast.success('Created!');
  }
};
```

### Conditional Permission Check

```typescript
const canEdit = useCanAccess('course', 'edit');

if (!canEdit) {
  return <ReadOnlyView />;
}
```

### Combine Multiple Hooks

```typescript
const { user } = useCurrentUser();
const { thing: course } = useThingDetail(courseId);
const isEnrolled = useIsConnected(user?._id, courseId);
const { create } = useConnection();

const enroll = async () => {
  await create({
    from: user._id,
    to: courseId,
    type: 'enrolled_in'
  });
};
```

### Real-time Updates

```typescript
const { events, subscribe } = useEventStream();

useEffect(() => {
  subscribe();
}, [subscribe]);

return <EventFeed events={events} />;
```

---

## Type Definitions

### Common Return Types

```typescript
// Standard hook return
{
  loading: boolean;      // Is data loading?
  error: unknown;        // Error if failed
  data: T;              // The actual data
}

// Mutation hooks return
{
  create: (input) => Promise<T>;
  update: (id, input) => Promise<T>;
  delete: (id) => Promise<void>;
  loading: boolean;
  error: unknown;
}

// Check hooks return
boolean  // Simple true/false
```

### Entity Types

```typescript
// Group
{
  _id: Id<'groups'>;
  name: string;
  type: GroupType;
  parentGroupId?: Id<'groups'>;
  properties: Record<string, any>;
  status: 'draft' | 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// Person
{
  _id: Id<'things'>;
  name: string;
  type: 'creator';
  properties: { role: UserRole; ... };
  status: 'draft' | 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// Thing (Entity)
{
  _id: Id<'things'>;
  type: string;
  name: string;
  properties: Record<string, any>;
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// Connection
{
  _id: Id<'connections'>;
  from: Id<'things'>;
  to: Id<'things'>;
  type: ConnectionType;
  metadata?: Record<string, any>;
  createdAt: number;
}

// Event
{
  _id: Id<'events'>;
  type: EventType;
  entityId: Id<'things'>;
  actorId?: Id<'things'>;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Label
{
  _id: Id<'knowledge'>;
  name: string;
  category: LabelCategory;
  count?: number;
}
```

---

## Import Statements

### All hooks at once

```typescript
import {
  // Provider (4)
  useProvider,
  useIsProviderAvailable,
  useProviderCapability,
  useProviderName,
  // Groups (4)
  useGroup,
  useGroups,
  useCurrentGroup,
  useChildGroups,
  // People (5)
  usePerson,
  useCurrentUser,
  useHasRole,
  useCanAccess,
  useGroupMembers,
  // Things (7)
  useThing,
  useThings,
  useThingDetail,
  useThingsByType,
  useThingSearch,
  usePublishedThings,
  useMyThings,
  // Connections (9)
  useConnection,
  useConnections,
  useRelatedEntities,
  useIsConnected,
  useOwnedEntities,
  useFollowers,
  useFollowing,
  useEnrollments,
  useUserEnrollments,
  // Events (9)
  useEvent,
  useEvents,
  useActivityFeed,
  useAuditTrail,
  useUserHistory,
  useEventsByType,
  useEventCount,
  useTimeline,
  useEventStream,
  // Search (9)
  useSearch,
  useSearchByType,
  useLabels,
  useLabelsByCategory,
  useEntityLabels,
  useEntitiesByLabel,
  useSimilarEntities,
  useFacetedSearch,
  useTrendingEntities,
  // Recommendations (1)
  useRecommendations,
} from '@/hooks/ontology';
```

### By dimension

```typescript
// Provider only
import {
  useProvider,
  useIsProviderAvailable,
  useProviderCapability,
  useProviderName,
} from '@/hooks/ontology';

// Groups only
import {
  useGroup,
  useGroups,
  useCurrentGroup,
  useChildGroups,
} from '@/hooks/ontology';

// People only
import {
  usePerson,
  useCurrentUser,
  useHasRole,
  useCanAccess,
  useGroupMembers,
} from '@/hooks/ontology';

// Things only
import {
  useThing,
  useThings,
  useThingDetail,
  useThingsByType,
  useThingSearch,
  usePublishedThings,
  useMyThings,
} from '@/hooks/ontology';

// Connections only
import {
  useConnection,
  useConnections,
  useRelatedEntities,
  useIsConnected,
  useOwnedEntities,
  useFollowers,
  useFollowing,
  useEnrollments,
  useUserEnrollments,
} from '@/hooks/ontology';

// Events only
import {
  useEvent,
  useEvents,
  useActivityFeed,
  useAuditTrail,
  useUserHistory,
  useEventsByType,
  useEventCount,
  useTimeline,
  useEventStream,
} from '@/hooks/ontology';

// Search only
import {
  useSearch,
  useSearchByType,
  useLabels,
  useLabelsByCategory,
  useEntityLabels,
  useEntitiesByLabel,
  useSimilarEntities,
  useFacetedSearch,
  useTrendingEntities,
} from '@/hooks/ontology';

// Recommendations
import { useRecommendations } from '@/hooks/ontology';
```

---

## Quick Examples

### List Courses

```tsx
const { things: courses } = useThings({
  type: 'course',
  status: 'published'
});
```

### Get Current User

```tsx
const { user } = useCurrentUser();
```

### Search

```tsx
const { results } = useSearch('machine learning');
```

### Get Enrolled Courses

```tsx
const { enrollments } = useUserEnrollments(userId);
```

### Record Event

```tsx
const { record } = useEvent();
await record({
  type: 'course_viewed',
  entityId: courseId
});
```

### Get User Activity

```tsx
const { activities } = useActivityFeed(20);
```

### Check Access

```tsx
const canDelete = useCanAccess('course', 'delete');
```

### Get Trending

```tsx
const { entities } = useTrendingEntities('course', 'week');
```

---

## Performance Tips

1. **Use memoization** for computed values
2. **Check loading/error states** before rendering
3. **Cache results** when possible
4. **Combine hooks** instead of making multiple calls
5. **Use filters** to limit data fetched
6. **Subscribe to streams** for real-time data
7. **Handle errors gracefully** with fallback UI

---

## Debugging Tips

```typescript
// Log hook values
const { things, loading, error } = useThings();
useEffect(() => {
  console.log({ things, loading, error });
}, [things, loading, error]);

// Check provider
const provider = useProvider();
console.log('Provider:', provider?.name);

// Verify availability
const isOnline = useIsProviderAvailable();
console.log('Online:', isOnline);
```

---

## Resources

- Full Documentation: `/demo/hooks-guide`
- Interactive Demo: `/demo/hooks`
- Source Code: `src/hooks/ontology/`
- TypeScript Types: `src/types/convex.ts`

---

**Last Updated: October 25, 2024**

Print this card for quick reference while developing!
