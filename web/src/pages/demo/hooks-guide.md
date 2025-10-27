---
layout: /src/layouts/Layout.astro
title: React Hooks Complete Guide
description: Production-ready React hooks for the ONE Platform ontology
---

# React Hooks Complete Guide

## Overview

The ONE Platform provides **43 production-ready React hooks** organized across **8 dimensions** of the ontology. These hooks provide type-safe access to all backend services with zero vendor lock-in.

## Quick Start

### Installation

All hooks are built-in to the platform. No installation needed.

```typescript
import { useThings, useGroups, useSearch } from '@/hooks/ontology';
```

### Basic Usage

```tsx
import { useThings } from '@/hooks/ontology';

function MyCourses() {
  const { things: courses, loading, error } = useThings({
    type: 'course',
    status: 'published'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {courses?.map(course => (
        <li key={course._id}>{course.name}</li>
      ))}
    </ul>
  );
}
```

## Hook Dimensions

### 1. Provider Hooks (4 hooks)

Backend abstraction and configuration.

#### useProvider()

Get access to the current DataProvider instance.

**Returns:** `IDataProvider | null`

```typescript
const provider = useProvider();

if (!provider) {
  return <div>Backend unavailable - using local data</div>;
}

console.log(`Connected to ${provider.name} backend`);
```

**Capabilities:**
- `name`: Provider name (Convex, WordPress, Notion, etc.)
- `isAvailable`: Whether provider is connected
- `supportsGroups`: Multi-tenant support
- `supportsPeople`: Authorization support
- `supportsRealtime`: WebSocket/streaming support

#### useIsProviderAvailable()

Check if backend is available.

**Returns:** `boolean`

```typescript
const isOnline = useIsProviderAvailable();

return isOnline ? <OnlineUI /> : <OfflineUI />;
```

#### useProviderCapability(capability)

Check if provider supports a specific capability.

**Parameters:**
- `capability`: `'groups' | 'people' | 'realtime'`

**Returns:** `boolean`

```typescript
const supportsRealtime = useProviderCapability('realtime');

if (supportsRealtime) {
  // Use real-time subscriptions
  const { subscribe } = useEventStream();
} else {
  // Fall back to polling
  const { events } = useEvents();
}
```

#### useProviderName()

Get the name of the current provider.

**Returns:** `string | null`

```typescript
const name = useProviderName();
console.log(`Using ${name} backend`);
```

### 2. Groups Hooks (4 hooks)

Multi-tenant isolation and hierarchical containers.

#### useGroup()

Perform CRUD operations on individual groups.

**Returns:**
```typescript
{
  get: (id, options?) => Promise<Group | null>,
  create: (input, options?) => Promise<Group | null>,
  update: (id, input, options?) => Promise<Group | null>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { get, create, update, loading, error } = useGroup();

// Create new group
const newGroup = await create({
  name: 'Acme Corporation',
  type: 'organization',
  plan: 'pro',
  description: 'Enterprise customer'
});

// Update group
await update(groupId, {
  name: 'Acme Corp Updated'
});
```

#### useGroups(filter?)

List all groups with optional filtering.

**Parameters:**
```typescript
interface GroupFilter {
  type?: GroupType;           // 'organization', 'business', etc.
  parentGroupId?: Id<'groups'>;
  status?: 'draft' | 'active' | 'archived';
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  groups: Group[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { groups, loading } = useGroups({
  type: 'organization',
  status: 'active'
});

return (
  <ul>
    {groups?.map(g => (
      <li key={g._id}>
        <h3>{g.name}</h3>
        <p>{g.properties.description}</p>
      </li>
    ))}
  </ul>
);
```

#### useCurrentGroup(groupId?)

Get the currently active group.

**Parameters:**
- `groupId`: Optional group ID to load

**Returns:**
```typescript
{
  group: Group | null,
  loading: boolean,
  error: unknown
}
```

```typescript
const groupId = useParams().groupId;
const { group, loading } = useCurrentGroup(groupId);

if (!group) return <div>Group not found</div>;
return <h1>{group.name}</h1>;
```

#### useChildGroups(parentGroupId)

Get child groups of a parent (hierarchical).

**Parameters:**
- `parentGroupId`: Parent group ID

**Returns:**
```typescript
{
  groups: Group[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { groups: departments } = useChildGroups(organizationId);

// All departments under organization
```

### 3. People Hooks (5 hooks)

Authorization, roles, and user management.

#### usePerson()

Get or update a single person.

**Returns:**
```typescript
{
  get: (id, options?) => Promise<Person | null>,
  update: (id, input, options?) => Promise<Person | null>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { get, update } = usePerson();

const person = await get(userId);
await update(userId, { role: 'org_owner' });
```

#### useCurrentUser()

Get the authenticated current user.

**Returns:**
```typescript
{
  user: Person | null,
  loading: boolean,
  error: unknown
}
```

```typescript
const { user } = useCurrentUser();

if (!user) return <div>Please sign in</div>;
return <div>Welcome {user.name}</div>;
```

#### useHasRole(role)

Check if current user has a specific role.

**Parameters:**
- `role`: `'platform_owner' | 'org_owner' | 'org_user' | 'customer'`

**Returns:** `boolean`

```typescript
const isAdmin = useHasRole('platform_owner');
const isOrgOwner = useHasRole('org_owner');

if (isAdmin) {
  return <AdminPanel />;
}

if (isOrgOwner) {
  return <OrgSettings />;
}
```

#### useCanAccess(resource, action)

Check if user can access a resource.

**Parameters:**
- `resource`: Resource type (e.g., 'course', 'group')
- `action`: Action type (e.g., 'read', 'edit', 'delete')

**Returns:** `boolean`

```typescript
const canEdit = useCanAccess('course', 'edit');
const canDelete = useCanAccess('course', 'delete');

if (!canEdit) {
  return <ReadOnlyView />;
}
```

#### useGroupMembers(groupId)

Get all members in a group.

**Parameters:**
- `groupId`: Group ID

**Returns:**
```typescript
{
  members: Person[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { members } = useGroupMembers(groupId);

return (
  <div>
    {members?.map(m => (
      <MemberCard key={m._id} user={m} />
    ))}
  </div>
);
```

### 4. Things Hooks (7 hooks)

Entities, objects, and content management.

#### useThing()

Perform CRUD operations on things.

**Returns:**
```typescript
{
  get: (id, options?) => Promise<Thing | null>,
  create: (input, options?) => Promise<Thing | null>,
  update: (id, input, options?) => Promise<Thing | null>,
  delete: (id, options?) => Promise<void>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { create, update } = useThing();

const course = await create({
  type: 'course',
  name: 'React 101',
  properties: {
    description: 'Learn React basics',
    instructor: 'John Doe'
  }
});

await update(course._id, {
  name: 'Advanced React'
});
```

#### useThings(filter?)

List all things with filtering.

**Parameters:**
```typescript
interface ThingFilter {
  type?: string;
  groupId?: Id<'groups'>;
  status?: 'draft' | 'active' | 'published' | 'archived';
  creatorId?: Id<'things'>;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  things: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { things } = useThings({
  type: 'course',
  status: 'published',
  limit: 20
});

return (
  <div className="grid gap-4">
    {things?.map(t => (
      <CourseCard key={t._id} course={t} />
    ))}
  </div>
);
```

#### useThingDetail(id)

Get a single thing with all details.

**Parameters:**
- `id`: Thing ID

**Returns:**
```typescript
{
  thing: Thing | null,
  loading: boolean,
  error: unknown
}
```

```typescript
const { thing: course } = useThingDetail(courseId);

return (
  <div>
    <h1>{course?.name}</h1>
    <p>{course?.properties.description}</p>
  </div>
);
```

#### useThingsByType(type, filter?)

Get all things of a specific type.

**Parameters:**
- `type`: Thing type (e.g., 'course', 'blog_post', 'ai_clone')
- `filter`: Optional additional filters

**Returns:**
```typescript
{
  things: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { things: courses } = useThingsByType('course');
const { things: agents } = useThingsByType('ai_clone');
```

#### useThingSearch(query, options?)

Search things by keyword.

**Parameters:**
- `query`: Search query string
- `options`: Optional search options

**Returns:**
```typescript
{
  things: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { things } = useThingSearch('machine learning');

return (
  <div>
    {things?.map(t => (
      <SearchResult key={t._id} result={t} />
    ))}
  </div>
);
```

#### usePublishedThings(type?, limit?)

Get all published things.

**Parameters:**
- `type`: Optional thing type
- `limit`: Maximum number to return

**Returns:**
```typescript
{
  things: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { things } = usePublishedThings('course', 10);
// Top 10 published courses
```

#### useMyThings(type?, status?)

Get all things created by current user.

**Parameters:**
- `type`: Optional thing type
- `status`: Optional status filter

**Returns:**
```typescript
{
  things: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { things: myCourses } = useMyThings('course');
// My draft and published courses
```

### 5. Connections Hooks (9 hooks)

Relationships between entities.

#### useConnection()

Create or delete connections between things.

**Returns:**
```typescript
{
  create: (input, options?) => Promise<Connection | null>,
  delete: (id, options?) => Promise<void>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { create, delete: deleteConnection } = useConnection();

// Enroll user in course
await create({
  from: userId,
  to: courseId,
  type: 'enrolled_in'
});

// Remove enrollment
await deleteConnection(connectionId);
```

#### useConnections(filter?)

List all connections with filtering.

**Parameters:**
```typescript
interface ConnectionFilter {
  type?: ConnectionType;
  from?: Id<'things'>;
  to?: Id<'things'>;
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  connections: Connection[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { connections } = useConnections({
  type: 'owns'
});

return (
  <div>
    {connections?.map(c => (
      <ConnectionCard key={c._id} connection={c} />
    ))}
  </div>
);
```

#### useRelatedEntities(thingId, relationshipType?)

Get entities related to a thing.

**Parameters:**
- `thingId`: Thing ID
- `relationshipType`: Optional specific relationship type

**Returns:**
```typescript
{
  entities: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { entities: students } = useRelatedEntities(
  courseId,
  'enrolled_in'
);
// All students enrolled in course
```

#### useIsConnected(from, to, type?)

Check if two entities are connected.

**Parameters:**
- `from`: From thing ID
- `to`: To thing ID
- `type`: Optional relationship type

**Returns:** `boolean`

```typescript
const isEnrolled = useIsConnected(userId, courseId, 'enrolled_in');

if (isEnrolled) {
  return <ViewCourseButton />;
} else {
  return <EnrollButton />;
}
```

#### useOwnedEntities(ownerId, type?)

Get all entities owned by a user.

**Parameters:**
- `ownerId`: Owner ID
- `type`: Optional thing type

**Returns:**
```typescript
{
  entities: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { entities: courses } = useOwnedEntities(userId, 'course');
// All courses owned by user
```

#### useFollowers(userId)

Get all followers of a user.

**Parameters:**
- `userId`: User ID

**Returns:**
```typescript
{
  followers: Person[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { followers } = useFollowers(userId);

return (
  <div>
    {followers?.map(f => (
      <FollowerCard key={f._id} user={f} />
    ))}
  </div>
);
```

#### useFollowing(userId)

Get all users that a user follows.

**Parameters:**
- `userId`: User ID

**Returns:**
```typescript
{
  following: Person[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { following } = useFollowing(userId);

return (
  <div>
    {following?.map(u => (
      <FollowingCard key={u._id} user={u} />
    ))}
  </div>
);
```

#### useEnrollments(courseId)

Get enrollments for a course.

**Parameters:**
- `courseId`: Course ID

**Returns:**
```typescript
{
  enrollments: Connection[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { enrollments } = useEnrollments(courseId);

return (
  <div>
    <p>{enrollments?.length} students enrolled</p>
  </div>
);
```

#### useUserEnrollments(userId)

Get courses a user is enrolled in.

**Parameters:**
- `userId`: User ID

**Returns:**
```typescript
{
  enrollments: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { enrollments } = useUserEnrollments(userId);
// All courses the user is enrolled in
```

### 6. Events Hooks (9 hooks)

Activity logging and audit trails.

#### useEvent()

Record or retrieve events.

**Returns:**
```typescript
{
  record: (input, options?) => Promise<Event | null>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { record } = useEvent();

await record({
  type: 'course_viewed',
  entityId: courseId,
  timestamp: Date.now(),
  metadata: { duration: 1200 }
});
```

#### useEvents(filter?)

List events with filtering.

**Parameters:**
```typescript
interface EventFilter {
  type?: EventType;
  entityId?: Id<'things'>;
  actorId?: Id<'things'>;
  timestamp?: { from: number, to: number };
  limit?: number;
  offset?: number;
}
```

**Returns:**
```typescript
{
  events: Event[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { events } = useEvents({
  type: 'purchase',
  limit: 50
});
```

#### useActivityFeed(limit?)

Get activity feed for current user.

**Parameters:**
- `limit`: Maximum events to return

**Returns:**
```typescript
{
  activities: Event[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { activities } = useActivityFeed(20);

return (
  <div>
    {activities?.map(a => (
      <ActivityCard key={a._id} activity={a} />
    ))}
  </div>
);
```

#### useAuditTrail(entityId)

Get audit trail for an entity.

**Parameters:**
- `entityId`: Entity ID

**Returns:**
```typescript
{
  events: Event[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { events } = useAuditTrail(courseId);
// All changes to course
```

#### useUserHistory(userId)

Get all events created by a user.

**Parameters:**
- `userId`: User ID

**Returns:**
```typescript
{
  events: Event[],
  loading: boolean,
  error: unknown
}
```

#### useEventsByType(type, filter?)

Get events of a specific type.

**Parameters:**
- `type`: Event type
- `filter`: Optional filters

**Returns:**
```typescript
{
  events: Event[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { events } = useEventsByType('purchase');
// All purchase events in system
```

#### useEventCount(filter?)

Get count of events matching criteria.

**Parameters:**
- `filter`: Event filter

**Returns:** `number`

```typescript
const count = useEventCount({ type: 'purchase' });

return <Badge>{count} purchases</Badge>;
```

#### useTimeline(entityId, dateRange?)

Get chronological timeline of events.

**Parameters:**
- `entityId`: Entity ID
- `dateRange`: Optional date range filter

**Returns:**
```typescript
{
  events: Event[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { events } = useTimeline(courseId);
// Chronological timeline of all changes
```

#### useEventStream(filter?)

Real-time stream of events (if supported).

**Parameters:**
- `filter`: Event filter

**Returns:**
```typescript
{
  events: Event[],
  subscribe: () => void,
  unsubscribe: () => void
}
```

```typescript
const { events, subscribe } = useEventStream({
  type: 'purchase'
});

useEffect(() => {
  subscribe();
}, [subscribe]);

return (
  <div>
    {events?.map(e => (
      <EventCard key={e._id} event={e} />
    ))}
  </div>
);
```

### 7. Search & Knowledge Hooks (9 hooks)

Semantic search, labels, and RAG.

#### useSearch(query, options?)

Search across all entities.

**Parameters:**
- `query`: Search query string
- `options`: Optional search options

**Returns:**
```typescript
{
  results: SearchResult[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { results } = useSearch('machine learning');

return (
  <div>
    {results?.map(r => (
      <SearchResult key={r._id} result={r} />
    ))}
  </div>
);
```

#### useSearchByType(query, type, options?)

Search within a specific entity type.

**Parameters:**
- `query`: Search query
- `type`: Entity type
- `options`: Optional search options

**Returns:**
```typescript
{
  results: SearchResult[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { results } = useSearchByType('React hooks', 'blog_post');
// All blog posts about React hooks
```

#### useLabels(category?)

Get all available labels.

**Parameters:**
- `category`: Optional label category

**Returns:**
```typescript
{
  labels: Label[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { labels } = useLabels('skill');

return (
  <div>
    {labels?.map(l => (
      <LabelTag key={l} label={l} />
    ))}
  </div>
);
```

#### useLabelsByCategory(category)

Get labels in a specific category.

**Parameters:**
- `category`: Label category

**Returns:**
```typescript
{
  labels: Label[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { labels } = useLabelsByCategory('industry');
// All industry labels (fitness, healthcare, etc.)
```

#### useEntityLabels(entityId)

Get labels for a specific entity.

**Parameters:**
- `entityId`: Entity ID

**Returns:**
```typescript
{
  labels: Label[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { labels } = useEntityLabels(courseId);
```

#### useEntitiesByLabel(label, type?)

Get all entities with a label.

**Parameters:**
- `label`: Label text
- `type`: Optional entity type

**Returns:**
```typescript
{
  entities: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { entities } = useEntitiesByLabel('beginner');
// All beginner-friendly courses
```

#### useSimilarEntities(entityId, limit?)

Get entities similar to a given one.

**Parameters:**
- `entityId`: Entity ID
- `limit`: Maximum results

**Returns:**
```typescript
{
  entities: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { entities } = useSimilarEntities(courseId, 5);
// 5 similar courses (via vector similarity)
```

#### useFacetedSearch(query, facets?)

Search with faceted filtering.

**Parameters:**
- `query`: Search query
- `facets`: Facet filters

**Returns:**
```typescript
{
  results: SearchResult[],
  facets: Record<string, any>,
  loading: boolean,
  error: unknown
}
```

```typescript
const { results } = useFacetedSearch('React', {
  skill: ['beginner'],
  format: ['video']
});
// React courses for beginners in video format
```

#### useTrendingEntities(type?, timeframe?)

Get trending entities.

**Parameters:**
- `type`: Optional entity type
- `timeframe`: `'day' | 'week' | 'month'`

**Returns:**
```typescript
{
  entities: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { entities } = useTrendingEntities('course', 'week');
// Top courses trending this week
```

### 8. Recommendations Hooks (1 hook)

AI-powered personalization and suggestions.

#### useRecommendations(limit?, type?)

Get AI-powered recommendations for current user.

**Parameters:**
- `limit`: Maximum recommendations
- `type`: Optional entity type

**Returns:**
```typescript
{
  recommendations: Thing[],
  loading: boolean,
  error: unknown
}
```

```typescript
const { recommendations } = useRecommendations(10, 'course');

return (
  <div>
    {recommendations?.map(r => (
      <RecommendationCard key={r._id} item={r} />
    ))}
  </div>
);
```

## Common Patterns

### Loading States

```typescript
const { things, loading, error } = useThings();

if (loading) return <Skeleton />;
if (error) return <div>Error: {error}</div>;
return <ThingsList things={things} />;
```

### Error Handling

```typescript
const { create, error } = useThing();

const handleCreate = async (data) => {
  await create(data);
  if (error) {
    toast.error(`Failed: ${error.message}`);
  } else {
    toast.success('Created successfully');
  }
};
```

### Conditional Rendering

```typescript
const isAvailable = useIsProviderAvailable();
const supportsRealtime = useProviderCapability('realtime');

if (!isAvailable) {
  return <OfflineMode />;
}

if (supportsRealtime) {
  return <RealtimeUI />;
} else {
  return <PollingUI />;
}
```

### Combining Hooks

```typescript
function CourseEnrollment({ courseId }: { courseId: string }) {
  const { thing: course } = useThingDetail(courseId);
  const { user } = useCurrentUser();
  const { isConnected } = useIsConnected(user?._id, courseId);
  const { create } = useConnection();

  const handleEnroll = async () => {
    await create({
      from: user._id,
      to: courseId,
      type: 'enrolled_in'
    });
  };

  if (isConnected) {
    return <Button disabled>Already Enrolled</Button>;
  }

  return <Button onClick={handleEnroll}>Enroll Now</Button>;
}
```

## Best Practices

1. **Always check provider availability** before using hooks
2. **Handle loading and error states** explicitly
3. **Use TypeScript** for full type safety
4. **Combine related hooks** for rich functionality
5. **Cache results** when appropriate to avoid redundant calls
6. **Use effect dependencies** correctly to avoid infinite loops
7. **Test error scenarios** thoroughly
8. **Document your custom hooks** that combine multiple ontology hooks

## Types

### Common Types

```typescript
// Group
interface Group {
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
interface Person {
  _id: Id<'things'>;
  name: string;
  type: 'creator';
  properties: {
    role: UserRole;
    email: string;
    // ... other properties
  };
  status: 'draft' | 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// Thing
interface Thing {
  _id: Id<'things'>;
  type: string;
  name: string;
  properties: Record<string, any>;
  status: 'draft' | 'active' | 'published' | 'archived';
  createdAt: number;
  updatedAt: number;
}

// Connection
interface Connection {
  _id: Id<'connections'>;
  from: Id<'things'>;
  to: Id<'things'>;
  type: ConnectionType;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

// Event
interface Event {
  _id: Id<'events'>;
  type: EventType;
  entityId: Id<'things'>;
  actorId?: Id<'things'>;
  timestamp: number;
  metadata?: Record<string, any>;
}

// Label
interface Label {
  _id: Id<'knowledge'>;
  name: string;
  category: LabelCategory;
  count?: number;
}
```

## FAQ

**Q: Do I need to install any dependencies?**
A: No, all hooks are built-in to the platform.

**Q: Can I use these hooks with any backend?**
A: Yes, they're backend-agnostic. Works with Convex, WordPress, Notion, Stripe, etc.

**Q: What if the provider is unavailable?**
A: Use `useIsProviderAvailable()` to check. You can provide fallback UI or local-only functionality.

**Q: Are these hooks type-safe?**
A: Yes, 100% type-safe with full TypeScript support.

**Q: Can I combine multiple hooks?**
A: Absolutely! Combine as many as needed to build complex features.

**Q: How do I handle real-time updates?**
A: Use `useEventStream()` if the provider supports it, otherwise use polling with `useEvents()`.

## Next Steps

- Explore the [Demo](/demo/hooks) page for interactive examples
- Check the [Source Code](/github) on GitHub
- Read the [Ontology Documentation](/docs/ontology)
- Join the [Community Forum](/community)

---

**Built with Astro, React 19, and the 6-dimension ontology.**
