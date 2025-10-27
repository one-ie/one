# Demo Infrastructure Implementation Guide

Complete reference for demo page hooks, stores, and utilities supporting Infer 1-20.

## Overview

The demo infrastructure provides a complete set of TypeScript hooks and utilities for demo pages to:

1. **Monitor Backend Connection** - Real-time health checks with automatic reconnection
2. **Fetch Data Efficiently** - React Query integration with caching and refetching
3. **Manage Mutations** - Create, update, delete operations with optimistic updates
4. **Synchronize Filters** - URL-based filter state with debounced search
5. **Centralize State** - Nanostores for shared global state

## Files Created (Infer 1-20)

### Hook Files

```
/web/src/hooks/demo/
├── useBackendConnection.ts     (303 lines)  - Connection monitoring
├── useDemoData.ts              (289 lines)  - HTTP data fetching
├── useDemoMutation.ts          (310 lines)  - Create/update/delete operations
├── useDemoFilters.ts           (380 lines)  - Filter state management
├── useDebounce.ts              (113 lines)  - Utility for debouncing
├── index.ts                    (69 lines)   - Central exports
└── README.md                   (800+ lines) - Complete documentation
```

### Store Files

```
/web/src/stores/
└── demo.ts                     (420 lines)  - Global demo state
```

### Hook Index Update

```
/web/src/hooks/index.ts         (+50 lines)  - Added demo exports
```

**Total: 1,834 lines of fully typed, documented code**

## Architecture

### Hook Layers

```
┌─────────────────────────────────────────────┐
│      React Components (Demo Pages)          │
├─────────────────────────────────────────────┤
│                                             │
│  useBackendConnection()                     │
│  useDemoData()                              │
│  useDemoMutation()                          │
│  useDemoFilters()                           │
│  useDebounce()                              │
│                                             │
├─────────────────────────────────────────────┤
│     React Query + Nanostores (State)        │
├─────────────────────────────────────────────┤
│     HTTP API Calls (/http/*)                │
├─────────────────────────────────────────────┤
│   Backend (Convex or other providers)       │
└─────────────────────────────────────────────┘
```

### Data Flow

```
Component
  ↓
useDemo* Hook (React Query)
  ↓
Query/Mutation Function
  ↓
HTTP API Call (/http/...)
  ↓
Backend Processing
  ↓
Response
  ↓
Cache Update (Nanostores)
  ↓
Component Re-render
```

## Hook Guide

### 1. useBackendConnection

**Purpose:** Monitor connection status and manage reconnection

**Key Features:**
- Real-time connection status: 'connecting' | 'connected' | 'disconnected' | 'error'
- Automatic latency measurement
- Exponential backoff reconnection
- 30-second health check interval
- Max 5 reconnection attempts

**Usage:**

```tsx
import { useBackendConnection } from '@/hooks/demo';

function StatusBar() {
  const { status, latency, isConnected, reconnect } = useBackendConnection();

  return (
    <div className={isConnected ? 'text-green-500' : 'text-red-500'}>
      {status} ({latency}ms)
      {!isConnected && <button onClick={reconnect}>Reconnect</button>}
    </div>
  );
}
```

**API:**
- `status: ConnectionStatus` - Current connection state
- `latency: number` - Round-trip time in ms
- `isConnected: boolean` - Convenience boolean
- `isDisconnected: boolean` - Convenience boolean
- `isError: boolean` - Error state
- `reconnect(): Promise<void>` - Manual reconnection
- `reset(): void` - Reset connection state
- `lastChecked: number` - Last check timestamp
- `reconnectAttempts: number` - Current attempt count

**Tech Stack:**
- Plain fetch API with 5-second timeout
- Performance API for latency measurement
- exponential backoff: delay = 1000 * 2^attemptNumber

**Configuration Constants:**
- `BACKEND_URL` = 'https://veracious-marlin-319.convex.cloud'
- `HEALTH_CHECK_INTERVAL` = 30 seconds
- `MAX_RECONNECT_ATTEMPTS` = 5
- `INITIAL_RECONNECT_DELAY` = 1 second

### 2. useDemoData

**Purpose:** Fetch and cache data from HTTP API endpoints

**Key Features:**
- React Query integration for efficient caching
- Stale-while-revalidate pattern
- Automatic refetching on interval
- Pagination support
- Retry logic (2 attempts with exponential backoff)
- 5-minute default cache duration
- Batch fetching support

**Usage:**

```tsx
import { useDemoData } from '@/hooks/demo';

function ThingsList() {
  const { data: things, loading, error, refetch } = useDemoData('things', {
    type: 'course',
    status: 'published',
    limit: 20,
    offset: 0,
  });

  if (loading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div>
      {things?.map(thing => (
        <ThingCard key={thing._id} thing={thing} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

**API:**
- `data: T[] | null` - Fetched items
- `loading: boolean` - Is loading
- `error: Error | null` - Error object
- `refetch(): Promise<void>` - Force refresh
- `isRefetching: boolean` - Background refetch in progress
- `hasNextPage: boolean` - More results exist
- `hasPreviousPage: boolean` - Previous page exists

**Query Parameters:**
- `groupId?: string` - Filter by group
- `type?: string` - Entity type
- `status?: string` - Status filter
- `search?: string` - Full-text search
- `limit?: number` - Results per page (default: 20)
- `offset?: number` - Pagination offset
- `enabled?: boolean` - Enable/disable query
- `refetchInterval?: number` - Auto-refetch interval (ms)
- `staleTime?: number` - Cache validity (ms, default: 5min)

**Caching:**
- 5-minute default TTL
- Query key based on resource + all options
- Automatic invalidation on mutation
- Manual clear with `clearDemoCache()` or `clearDemoCacheForResource()`

**Batch Fetch:**

```tsx
import { fetchDemoBatch } from '@/hooks/demo';

const data = await fetchDemoBatch([
  { resource: 'things', options: { type: 'course' } },
  { resource: 'connections' },
  { resource: 'events' },
]);
```

### 3. useDemoMutation

**Purpose:** Create, update, delete entities with automatic cache management

**Key Features:**
- Automatic cache invalidation
- Optimistic updates with rollback
- Toast notifications (success/error)
- Configurable messages
- Loading states
- Error recovery

**Create Mutation:**

```tsx
import { useDemoCreateMutation } from '@/hooks/demo';

function CreateThingForm() {
  const { mutate: createThing, loading, error } = useDemoCreateMutation('things', {
    onSuccess: (data) => {
      console.log('Created:', data._id);
    },
    successMessage: 'Thing created successfully!',
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      createThing({
        type: 'course',
        name: 'My Course',
        properties: { description: '...' }
      });
    }}>
      <input name="name" />
      <button disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      {error && <div>{error.message}</div>}
    </form>
  );
}
```

**Update Mutation:**

```tsx
import { useDemoUpdateMutation } from '@/hooks/demo';

const { mutate: updateThing } = useDemoUpdateMutation('things', {
  onSuccess: () => toast.success('Updated!'),
});

await updateThing({ _id: thingId, name: 'New Name', status: 'published' });
```

**Delete Mutation:**

```tsx
import { useDemoDeleteMutation } from '@/hooks/demo';

const { mutate: deleteThing } = useDemoDeleteMutation('things');

await deleteThing(thingId);
```

**API:**
- `mutate(data): Promise<T>` - Execute mutation
- `loading: boolean` - Is loading
- `error: Error | null` - Error object
- `data: T | null` - Result
- `reset(): void` - Reset state

**Options:**
- `onSuccess?: (data: T) => Promise<void> | void`
- `onError?: (error: Error) => Promise<void> | void`
- `onMutate?: (data: any) => Promise<void> | void`
- `onSettled?: () => Promise<void> | void`
- `showSuccessToast?: boolean` (default: true)
- `showErrorToast?: boolean` (default: true)
- `successMessage?: string`
- `errorMessage?: string`

**HTTP Methods:**
- `POST /http/{resource}` - Create
- `PATCH /http/{resource}/{id}` - Update
- `DELETE /http/{resource}/{id}` - Delete

### 4. useDemoFilters

**Purpose:** Manage filter state with URL synchronization

**Key Features:**
- URL query parameter sync
- Shareable filter URLs
- Debounced search (300ms)
- Pagination support
- Multi-filter support
- Type-safe filter updates

**Usage:**

```tsx
import { useDemoFilters, useDemoData } from '@/hooks/demo';

function ThingsWithFilters() {
  const {
    filters,
    search,
    setSearch,
    setType,
    setStatus,
    view,
    setView,
    debouncedSearch,
    nextPage,
    previousPage,
    currentPage,
    hasActiveFilters,
    shareableUrl,
  } = useDemoFilters();

  const { data: things } = useDemoData('things', {
    type: filters.type,
    status: filters.status,
    search: debouncedSearch,
    limit: filters.limit,
    offset: filters.offset,
  });

  return (
    <div>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select value={filters.type || ''} onChange={(e) => setType(e.target.value || undefined)}>
        <option value="">All Types</option>
        <option value="course">Courses</option>
      </select>

      <select value={view} onChange={(e) => setView(e.target.value as any)}>
        <option value="list">List</option>
        <option value="grid">Grid</option>
        <option value="graph">Graph</option>
      </select>

      {/* Render based on view */}
      {view === 'list' && (
        <ul>{things?.map(thing => <li key={thing._id}>{thing.name}</li>)}</ul>
      )}

      {/* Pagination */}
      <button onClick={previousPage} disabled={currentPage === 1}>Previous</button>
      <span>Page {currentPage}</span>
      <button onClick={nextPage}>Next</button>

      {/* Share */}
      <a href={shareableUrl}>Share this view</a>
    </div>
  );
}
```

**API:**
- `filters: DemoFilters` - Current filters
- `search: string` - Raw search input
- `debouncedSearch: string` - 300ms debounced
- `view: ViewMode` - Current view mode
- `setFilters(updates): void`
- `setType(type): void`
- `setStatus(status): void`
- `setSearch(text): void`
- `setView(mode): void`
- `setPagination(limit, offset): void`
- `nextPage(): void`
- `previousPage(): void`
- `resetFilters(): void`
- `clearSearch(): void`
- `currentPage: number`
- `pageSize: number`
- `offset: number`
- `hasActiveFilters: boolean`
- `shareableUrl: string`

**URL Sync:**

Filters automatically sync to URL query parameters:

```
/demo/things?type=course&status=published&search=python&view=grid&limit=20&offset=0
```

### 5. useDebounce

**Purpose:** Debounce values for search, filters, etc.

**Usage:**

```tsx
import { useDebounce } from '@/hooks/demo';

function SearchThings() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useDemoData('things', { search: debouncedSearch });

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search (debounced)..."
    />
  );
}
```

**API:**
- `useDebounce<T>(value: T, delay?: number): T`
- `debounce<T>(func: T, delay: number): (...args: Parameters<T>) => void`
- `createDebounce<T>(func: T, delay: number, options?): (...args: Parameters<T>) => void`

**Options for createDebounce:**
- `leading?: boolean` - Call on leading edge
- `trailing?: boolean` - Call on trailing edge (default: true)
- `maxWait?: number` - Maximum wait time

## Store Guide

### Global State Stores

Import from `@/stores/demo`:

```tsx
import {
  $demoConnection,
  $demoGroup,
  $demoView,
  $demoData,
  $demoLoading,
  $demoErrors,
  $demoUI,
  $demoStats,
  $demoSelection,
  selectThing,
  updateDemoUI,
  toggleSidebar,
} from '@/stores/demo';
```

### Available Stores

| Store | Purpose |
|-------|---------|
| `$demoConnection` | Backend connection state (status, latency, errors) |
| `$demoGroup` | Currently selected group (id, name, type) |
| `$demoView` | Current view mode (list\|grid\|graph\|table) |
| `$demoData` | Cached API data for all resources |
| `$demoLoading` | Loading states per resource |
| `$demoErrors` | Error states per resource |
| `$demoUI` | UI state (sidebar, selections, expanded panels) |
| `$demoStats` | Statistics (totals, breakdowns) |
| `$demoSelection` | Multi-select state (Sets of selected IDs) |

### Store Actions

```tsx
// Selection
import { selectThing, selectConnection, selectEvent } from '@/stores/demo';
selectThing('thing-123');

// UI
import { toggleSidebar, updateDemoUI } from '@/stores/demo';
toggleSidebar();

updateDemoUI({
  sidebarOpen: false,
  selectedThingId: 'thing-123',
  showFilters: true,
});

// Data
import { updateDemoData, clearDemoData } from '@/stores/demo';
updateDemoData('things', [/* ... */]);

// Statistics
import { updateDemoStats } from '@/stores/demo';
updateDemoStats({
  totalThings: 42,
  thingsByType: { course: 10, blog_post: 32 },
});

// Selection (bulk operations)
import { toggleThingSelection, clearAllSelections } from '@/stores/demo';
toggleThingSelection('thing-123');
clearAllSelections();

// Reset all
import { resetAllDemoState } from '@/stores/demo';
resetAllDemoState();
```

### Subscribe to Store Changes

```tsx
import { $demoConnection } from '@/stores/demo';
import { useAtom } from '@nanostores/react';

function Component() {
  const [connection] = useAtom($demoConnection);

  return <div>{connection.status}</div>;
}
```

## Integration Patterns

### Pattern 1: List with Filters

```tsx
import { useDemoFilters, useDemoData } from '@/hooks/demo';
import { Card } from '@/components/ui/card';

function ThingsList() {
  const {
    filters,
    search,
    setSearch,
    setType,
    debouncedSearch,
    nextPage,
    previousPage,
    currentPage,
  } = useDemoFilters();

  const { data: things, loading, error } = useDemoData('things', {
    type: filters.type,
    search: debouncedSearch,
    limit: filters.limit,
    offset: filters.offset,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <select value={filters.type || ''} onChange={(e) => setType(e.target.value || undefined)}>
          <option value="">All Types</option>
          <option value="course">Courses</option>
        </select>
      </div>

      {loading ? (
        <Skeleton count={3} />
      ) : error ? (
        <Alert variant="destructive">{error.message}</Alert>
      ) : (
        <div className="grid gap-4">
          {things?.map(thing => (
            <Card key={thing._id}>
              <h3>{thing.name}</h3>
              <p>{thing.properties?.description}</p>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-between">
        <button onClick={previousPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button onClick={nextPage}>Next</button>
      </div>
    </div>
  );
}
```

### Pattern 2: Create Form

```tsx
import { useDemoCreateMutation, useDemoData } from '@/hooks/demo';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function CreateThingForm() {
  const { register, handleSubmit, reset } = useForm();
  const { refetch: refetchThings } = useDemoData('things');

  const { mutate: createThing, loading, error } = useDemoCreateMutation('things', {
    onSuccess: async () => {
      reset();
      await refetchThings();
    },
  });

  return (
    <form onSubmit={handleSubmit(async (data) => {
      await createThing({
        type: data.type,
        name: data.name,
        properties: { description: data.description }
      });
    })}>
      <Input {...register('name')} placeholder="Name" />
      <Input {...register('description')} placeholder="Description" />
      <select {...register('type')}>
        <option value="course">Course</option>
        <option value="blog_post">Blog Post</option>
      </select>
      <Button disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
      {error && <Alert variant="destructive">{error.message}</Alert>}
    </form>
  );
}
```

### Pattern 3: Detail Page with Relations

```tsx
import { useDemoData } from '@/hooks/demo';
import { useParams } from 'react-router-dom';

function ThingDetail() {
  const { id } = useParams();
  const { data: things } = useDemoData('things', { /* filter to get single */ });
  const thing = things?.[0];

  const { data: connections } = useDemoData('connections', {
    enabled: !!thing?._id,
    // Filter to connections involving this thing
  });

  const { data: events } = useDemoData('events', {
    enabled: !!thing?._id,
    // Filter to events involving this thing
  });

  if (!thing) return <div>Loading...</div>;

  return (
    <div>
      <h1>{thing.name}</h1>
      <p>{thing.properties?.description}</p>

      <section>
        <h2>Related ({connections?.length || 0})</h2>
        {connections?.map(conn => (
          <div key={conn._id}>{conn.relationshipType}</div>
        ))}
      </section>

      <section>
        <h2>Events ({events?.length || 0})</h2>
        {events?.map(event => (
          <div key={event._id}>{event.type}</div>
        ))}
      </section>
    </div>
  );
}
```

## HTTP API Endpoints

Demo hooks call these endpoints:

```
GET  /http/groups
GET  /http/people
GET  /http/things
GET  /http/connections
GET  /http/events
GET  /http/knowledge

POST   /http/{resource}
PATCH  /http/{resource}/{id}
DELETE /http/{resource}/{id}
```

**Query Parameters:**
- `groupId` - Filter by group
- `type` - Filter by entity type
- `status` - Filter by status
- `search` - Full-text search
- `limit` - Results per page
- `offset` - Pagination offset

**Request Body (POST/PATCH):**
```json
{
  "type": "course",
  "name": "My Course",
  "properties": {
    "description": "...",
    "duration": 42
  }
}
```

**Response Format:**
```json
{
  "_id": "thing_123",
  "type": "course",
  "name": "My Course",
  "properties": {...},
  "status": "draft",
  "createdAt": 1234567890,
  "updatedAt": 1234567890
}
```

## Performance Optimization

### Lazy Loading

```tsx
const { data } = useDemoData('things', {
  enabled: !!groupId, // Only fetch when groupId is set
});
```

### Prefetching

```tsx
import { prefetchDemoData } from '@/hooks/demo';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// In effect or event handler
await prefetchDemoData(queryClient, 'things', { type: 'course' });
```

### Invalidation

```tsx
import { invalidateDemoCache } from '@/hooks/demo';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// After critical changes
invalidateDemoCache(queryClient, 'things');
```

## TypeScript Types

All hooks are fully typed:

```tsx
import type {
  ConnectionStatus,
  ResourceType,
  ThingType,
  ThingStatus,
  ViewMode,
  DemoDataOptions,
  DemoMutationOptions,
  DemoDataResult,
  DemoMutationResult,
  DemoFilters,
  FilterState,
} from '@/hooks/demo';

// Usage
const resource: ResourceType = 'things';
const status: ConnectionStatus = 'connected';
const view: ViewMode = 'grid';
```

## Error Handling

All hooks include comprehensive error handling:

```tsx
const { data, error } = useDemoData('things');

if (error) {
  console.error('Load error:', error.message);
  if (error.message.includes('HTTP 401')) {
    // Handle auth error
  } else if (error.message.includes('HTTP 404')) {
    // Handle not found
  }
}
```

Mutations show toasts automatically:

```tsx
const { mutate } = useDemoCreateMutation('things');
// Success → green toast with message
// Error → red toast with error message
```

## Troubleshooting

### Data not updating after mutation

**Problem:** Mutation succeeds but UI doesn't update

**Solution:** Mutation hooks automatically invalidate related queries. If data still doesn't update:

```tsx
const { mutate, data } = useDemoCreateMutation('things');

const { refetch } = useDemoData('things'); // Get refetch function

await mutate(data);
await refetch(); // Manual refetch if needed
```

### Filters not syncing to URL

**Problem:** URL doesn't update when filters change

**Solution:** Ensure you're using `useDemoFilters` in a routed component:

```tsx
// Correct - in route component
function ThingsPage() {
  const filters = useDemoFilters(); // Gets URL from window.location
  // ...
}

// Wrong - in nested component without context
function ThingsList() {
  const filters = useDemoFilters(); // No URL access in fragment
}
```

### Connection keeps failing

**Problem:** Backend connection shows 'disconnected' or 'error'

**Solution:**
1. Check backend URL: `https://veracious-marlin-319.convex.cloud`
2. Verify network connectivity
3. Check CORS headers
4. Monitor console for failed health checks

```tsx
import { checkBackendHealth } from '@/hooks/demo';

const latency = await checkBackendHealth();
console.log('Latency:', latency);
```

### Search not working

**Problem:** Search filters don't apply

**Solution:** Use `debouncedSearch`, not `search`:

```tsx
// Correct
const { data } = useDemoData('things', { search: debouncedSearch });

// Wrong - triggers on every keystroke
const { data } = useDemoData('things', { search });
```

## Next Steps

1. **Integrate into demo pages** - Use hooks in `/web/src/pages/demo/*.astro`
2. **Add connection status UI** - Show backend health in header
3. **Implement filters** - Add search, type, status filtering to all lists
4. **Create forms** - Use mutation hooks for create/update/delete
5. **Add pagination** - Implement next/previous pagination
6. **Share filters** - Share filter URLs with stakeholders

## Related Documentation

- `/web/src/hooks/demo/README.md` - Complete hook documentation
- `/web/src/stores/demo.ts` - Store definitions and actions
- `/web/CLAUDE.md` - Development patterns and guidelines
- `/one/knowledge/ontology.md` - 6-dimension data model
