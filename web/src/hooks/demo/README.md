# Demo Infrastructure Hooks

Complete set of TypeScript hooks and utilities for demo pages to connect to the backend and manage data operations.

## Overview

The demo infrastructure provides:

- **Backend Connection Monitoring** - Real-time connection status tracking with automatic reconnection
- **HTTP Data Fetching** - React Query integration for efficient data loading and caching
- **Mutations** - Create, update, and delete operations with optimistic updates
- **Filter Management** - URL-synced filter state with debounced search
- **Global State** - Nanostores-based state management for shared demo data

## Installation

All hooks are already installed. Import from:

```tsx
import {
  useBackendConnection,
  useDemoData,
  useDemoCreateMutation,
  useDemoFilters,
  useDebounce,
} from '@/hooks/demo';
```

## Hooks

### useBackendConnection

Monitor and manage backend connectivity with automatic health checks.

**Features:**
- Real-time connection status tracking
- Latency measurement
- Automatic reconnection with exponential backoff
- Error handling with retry logic

**Returns:**
- `status` - Connection status: 'connecting' | 'connected' | 'disconnected' | 'error'
- `latency` - Round-trip latency in milliseconds
- `isConnected` - Boolean convenience property
- `reconnect()` - Manually trigger reconnection
- `reset()` - Reset connection state

**Example:**

```tsx
import { useBackendConnection } from '@/hooks/demo';

function ConnectionStatus() {
  const { status, latency, isConnected, reconnect } = useBackendConnection();

  return (
    <div>
      <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
        {status} ({latency}ms)
      </span>
      {!isConnected && (
        <button onClick={reconnect}>Reconnect</button>
      )}
    </div>
  );
}
```

### useDemoData

Fetch data from HTTP API endpoints with caching and refetching.

**Features:**
- React Query integration for efficient caching
- Automatic refetching on interval
- Pagination support (hasNextPage, hasPreviousPage)
- Stale-while-revalidate patterns
- Batch fetching capability
- Retry logic with exponential backoff

**Parameters:**
- `resource` - ResourceType: 'groups' | 'people' | 'things' | 'connections' | 'events' | 'knowledge'
- `options` - DemoDataOptions (optional):
  - `groupId` - Filter by group
  - `type` - Filter by entity type
  - `status` - Filter by status
  - `search` - Full-text search
  - `limit` - Results per page (default: 20)
  - `offset` - Pagination offset
  - `enabled` - Disable query temporarily
  - `refetchInterval` - Auto-refetch interval in ms
  - `staleTime` - Cache validity duration in ms

**Returns:**
- `data` - Array of results or null
- `loading` - Is data being fetched
- `error` - Error object or null
- `refetch()` - Manually trigger fetch
- `isRefetching` - Is background refetch in progress
- `hasNextPage` - More results available
- `hasPreviousPage` - Previous page exists

**Example:**

```tsx
import { useDemoData } from '@/hooks/demo';

function ThingsList() {
  const { data: things, loading, error, refetch } = useDemoData('things', {
    type: 'course',
    status: 'published',
    limit: 20,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {things?.map(thing => (
        <div key={thing._id}>{thing.name}</div>
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useDemoCreateMutation

Create new entities via POST request.

**Features:**
- Automatic cache invalidation
- Success/error toast notifications
- Optimistic updates (optional)
- Error recovery
- Loading state management

**Parameters:**
- `resource` - ResourceType to create
- `options` - DemoMutationOptions (optional):
  - `onSuccess` - Success callback
  - `onError` - Error callback
  - `onMutate` - Pre-mutation callback
  - `onSettled` - Settled callback
  - `showSuccessToast` - Show success notification (default: true)
  - `showErrorToast` - Show error notification (default: true)
  - `successMessage` - Custom success message
  - `errorMessage` - Custom error message

**Returns:**
- `mutate(data)` - Trigger mutation
- `loading` - Is mutation in progress
- `error` - Error or null
- `data` - Mutation result
- `reset()` - Reset mutation state

**Example:**

```tsx
import { useDemoCreateMutation } from '@/hooks/demo';

function CreateThingForm() {
  const { mutate: createThing, loading, error } = useDemoCreateMutation('things', {
    onSuccess: (data) => {
      console.log('Created:', data._id);
    },
    successMessage: 'Thing created successfully!',
  });

  async function handleSubmit(formData) {
    await createThing({
      type: 'course',
      name: formData.name,
      properties: { description: formData.description }
    });
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }}>
      <input name="name" placeholder="Name" />
      <textarea name="description" placeholder="Description" />
      <button disabled={loading}>
        {loading ? 'Creating...' : 'Create'}
      </button>
      {error && <div className="error">{error.message}</div>}
    </form>
  );
}
```

### useDemoUpdateMutation

Update existing entities via PATCH request.

**Features:**
- Same as create mutation
- Optimistic updates with rollback
- Supports partial updates

**Example:**

```tsx
import { useDemoUpdateMutation } from '@/hooks/demo';

function EditThingForm({ thingId }) {
  const { mutate: updateThing, loading } = useDemoUpdateMutation('things');

  async function handleUpdate(updates) {
    await updateThing({
      _id: thingId,
      ...updates
    });
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleUpdate({ name: e.target.name.value });
    }}>
      <input name="name" placeholder="Name" />
      <button disabled={loading}>Update</button>
    </form>
  );
}
```

### useDemoDeleteMutation

Delete entities via DELETE request.

**Features:**
- Same as create/update mutations
- Optimistic deletion
- Automatic cache cleanup

**Example:**

```tsx
import { useDemoDeleteMutation } from '@/hooks/demo';

function DeleteButton({ thingId }) {
  const { mutate: deleteThing, loading } = useDemoDeleteMutation('things', {
    successMessage: 'Deleted successfully',
  });

  return (
    <button
      onClick={() => deleteThing(thingId)}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

### useDemoFilters

Manage filter state with URL synchronization.

**Features:**
- URL query parameter sync
- Debounced search (300ms default)
- Shareable filter URLs
- Pagination support
- Type-safe filter updates

**Returns:**
- `filters` - Current filter state
- `search` - Search text (unfiltered)
- `debouncedSearch` - Debounced search text
- `view` - Current view mode (list/grid/graph/table)
- `setFilters(updates)` - Update filters
- `setType(type)` - Set entity type
- `setStatus(status)` - Set status filter
- `setSearch(text)` - Update search
- `setView(mode)` - Change view mode
- `setPagination(limit, offset)` - Set pagination
- `nextPage()` - Go to next page
- `previousPage()` - Go to previous page
- `resetFilters()` - Clear all filters
- `hasActiveFilters` - Any filters applied
- `shareableUrl` - Current URL with filters

**Example:**

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
        <option value="blog_post">Blog Posts</option>
      </select>

      <select value={view} onChange={(e) => setView(e.target.value as any)}>
        <option value="list">List</option>
        <option value="grid">Grid</option>
      </select>

      {/* Render things based on view mode */}
      {view === 'list' && (
        <ul>
          {things?.map(thing => (
            <li key={thing._id}>{thing.name}</li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <button onClick={previousPage} disabled={currentPage === 1}>
        Previous
      </button>
      <span>Page {currentPage}</span>
      <button onClick={nextPage}>Next</button>

      {/* Share link */}
      <a href={demoFilters.shareableUrl}>Share this view</a>
    </div>
  );
}
```

### useDebounce

Debounce a value with configurable delay.

**Parameters:**
- `value` - Value to debounce
- `delay` - Delay in milliseconds (default: 500)

**Returns:**
- Debounced value

**Example:**

```tsx
import { useDebounce } from '@/hooks/demo';

function SearchThings() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useDemoData('things', { search: debouncedSearch });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search (debounced)..."
      />
      {/* Only refetches after 300ms of inactivity */}
    </div>
  );
}
```

## Stores

Global state management using Nanostores. Import from `@/stores/demo`:

```tsx
import {
  $demoConnection,
  $demoGroup,
  $demoView,
  $demoData,
  $demoLoading,
  $demoErrors,
  $demoUI,
  selectThing,
  updateDemoStats,
  toggleSidebar,
} from '@/stores/demo';
```

### $demoConnection
Current backend connection state (status, latency, errors)

### $demoGroup
Currently selected group (for filtering/scoping)

### $demoView
Current view mode (list/grid/graph/table)

### $demoData
Cached API data for all resources

### $demoLoading
Loading states for each resource

### $demoErrors
Error states for each resource

### $demoUI
UI-specific state (sidebar, selections, expanded panels)

### Store Actions

```tsx
// Selection
import { selectThing, selectConnection, selectEvent } from '@/stores/demo';
selectThing('thing-id');

// UI
import { toggleSidebar, updateDemoUI } from '@/stores/demo';
toggleSidebar();

// Data
import { updateDemoData, clearDemoData } from '@/stores/demo';
updateDemoData('things', [...]);

// Statistics
import { updateDemoStats } from '@/stores/demo';
updateDemoStats({ totalThings: 42 });

// Reset
import { resetAllDemoState } from '@/stores/demo';
resetAllDemoState();
```

## API Endpoints

Hooks communicate with HTTP API:

```
GET  /http/groups?...
GET  /http/people?...
GET  /http/things?...
GET  /http/connections?...
GET  /http/events?...
GET  /http/knowledge?...

POST   /http/{resource}
PATCH  /http/{resource}/{id}
DELETE /http/{resource}/{id}
```

Query parameters:
- `groupId` - Filter by group
- `type` - Filter by entity type
- `status` - Filter by status (draft/active/published/archived)
- `search` - Full-text search
- `limit` - Results per page
- `offset` - Pagination offset

## Error Handling

All hooks include comprehensive error handling:

```tsx
const { data, error } = useDemoData('things');

if (error) {
  console.error('Failed to load:', error.message);
  // Handle error in UI
}
```

Mutations show toast notifications automatically:

```tsx
// Success toast shown automatically
// Error toast shown with error message
const { mutate } = useDemoCreateMutation('things');
```

## Caching Strategy

- **Default cache duration**: 5 minutes
- **Stale-while-revalidate**: Background refetch while returning stale data
- **Automatic invalidation**: On mutations
- **Manual clear**: `clearDemoCache()` or `clearDemoCacheForResource(resource)`

## Performance Optimization

### Lazy Loading

```tsx
const { data } = useDemoData('things', {
  enabled: !!groupId, // Don't fetch until groupId is set
});
```

### Prefetching

```tsx
import { prefetchDemoData } from '@/hooks/demo';
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
await prefetchDemoData(queryClient, 'things', { type: 'course' });
```

### Batch Operations

```tsx
import { fetchDemoBatch } from '@/hooks/demo';

const data = await fetchDemoBatch([
  { resource: 'things', options: { type: 'course' } },
  { resource: 'connections', options: { type: 'enrolled_in' } },
  { resource: 'events', options: { type: 'course_completed' } },
]);
```

## Backend Connection

Connection monitoring starts automatically in root layout:

```tsx
import { useBackendConnection } from '@/hooks/demo';

export function RootLayout() {
  const { status } = useBackendConnection();

  return (
    <div>
      {status !== 'connected' && <ConnectionBanner />}
      {/* rest of app */}
    </div>
  );
}
```

## Type Safety

All hooks are fully typed with TypeScript:

```tsx
import type {
  ConnectionStatus,
  ResourceType,
  ThingType,
  ThingStatus,
  ViewMode,
  DemoDataOptions,
  DemoMutationOptions,
} from '@/hooks/demo';

const status: ConnectionStatus = 'connected';
const resource: ResourceType = 'things';
const view: ViewMode = 'grid';
```

## Common Patterns

### Loading with Skeleton

```tsx
function ThingsList() {
  const { data, loading } = useDemoData('things');

  if (loading) {
    return <Skeleton count={5} />;
  }

  return (
    <ul>
      {data?.map(thing => (
        <li key={thing._id}>{thing.name}</li>
      ))}
    </ul>
  );
}
```

### Error Boundary

```tsx
function ThingsList() {
  const { data, error } = useDemoData('things');

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading things</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <ul>{data?.map(thing => ...)}</ul>;
}
```

### Create and Navigate

```tsx
const router = useRouter();
const { mutate: create } = useDemoCreateMutation('things', {
  onSuccess: (data) => {
    router.push(`/things/${data._id}`);
  },
});
```

### Optimistic Updates

```tsx
const { mutate: update } = useDemoUpdateMutation('things', {
  onMutate: (data) => {
    // Optimistic update happens automatically in React Query
    console.log('Updating locally before confirmation...');
  },
});
```

## Troubleshooting

### Data not updating after mutation
- Check that mutation success handler invalidates correct query key
- Use `refetch()` manually if needed
- Verify API response contains updated data

### Filters not syncing to URL
- Ensure `useDemoFilters` is used in route component
- Check that URL parameters match filter option names
- Browser DevTools to verify query string

### Connection keeps disconnecting
- Check network tab for failed requests
- Verify backend URL is correct
- Check CORS headers on backend
- Look for failed health checks in console

### Search not working
- Verify `debouncedSearch` is used (not raw `search`)
- Check debounce delay (default 300ms)
- Ensure backend search endpoint supports the query parameter

## API Reference

See individual hook documentation above for complete API reference.

## License

MIT
