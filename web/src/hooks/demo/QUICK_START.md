# Demo Hooks Quick Start

5-minute guide to get started with demo infrastructure hooks.

## Installation

Already installed. Just import:

```tsx
import {
  useBackendConnection,
  useDemoData,
  useDemoCreateMutation,
  useDemoFilters,
} from '@/hooks/demo';
```

## 5 Common Tasks

### 1. Show Connection Status

```tsx
function ConnectionBadge() {
  const { status, latency, isConnected } = useBackendConnection();

  return (
    <div className={isConnected ? 'bg-green-100' : 'bg-red-100'}>
      {status} ({latency}ms)
    </div>
  );
}
```

### 2. List Things with Filters

```tsx
function ThingsList() {
  const { filters, search, setSearch, debouncedSearch } = useDemoFilters();
  const { data: things, loading } = useDemoData('things', {
    search: debouncedSearch,
    limit: 20,
  });

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      {loading ? <Skeleton /> : (
        <ul>
          {things?.map(t => <li key={t._id}>{t.name}</li>)}
        </ul>
      )}
    </div>
  );
}
```

### 3. Create New Entity

```tsx
function CreateThingButton() {
  const { mutate: create, loading } = useDemoCreateMutation('things');

  return (
    <button
      onClick={() => create({
        type: 'course',
        name: 'New Course',
        properties: { description: '...' }
      })}
      disabled={loading}
    >
      {loading ? 'Creating...' : 'Create'}
    </button>
  );
}
```

### 4. Edit Entity

```tsx
function EditThing({ thingId }) {
  const { mutate: update, loading } = useDemoUpdateMutation('things');

  return (
    <button
      onClick={() => update({
        _id: thingId,
        name: 'Updated Name'
      })}
      disabled={loading}
    >
      {loading ? 'Saving...' : 'Save'}
    </button>
  );
}
```

### 5. Delete Entity

```tsx
function DeleteButton({ thingId }) {
  const { mutate: delete_, loading } = useDemoDeleteMutation('things');

  return (
    <button
      onClick={() => delete_(thingId)}
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Cheat Sheet

| Hook | Purpose | Import |
|------|---------|--------|
| `useBackendConnection` | Monitor connection status | `@/hooks/demo` |
| `useDemoData` | Fetch data from API | `@/hooks/demo` |
| `useDemoCreateMutation` | Create entity (POST) | `@/hooks/demo` |
| `useDemoUpdateMutation` | Update entity (PATCH) | `@/hooks/demo` |
| `useDemoDeleteMutation` | Delete entity (DELETE) | `@/hooks/demo` |
| `useDemoFilters` | Manage filters + URL sync | `@/hooks/demo` |
| `useDebounce` | Debounce value | `@/hooks/demo` |

## Key Concepts

### Connection Status

```tsx
const { status } = useBackendConnection();
// 'connecting' | 'connected' | 'disconnected' | 'error'

const { isConnected } = useBackendConnection();
// true | false (convenience)
```

### Data Fetching

```tsx
// Always use debouncedSearch for auto-refetch behavior
const { debouncedSearch } = useDemoFilters();
const { data } = useDemoData('things', { search: debouncedSearch });

// Manual refetch
const { refetch } = useDemoData('things');
await refetch();

// Prefetch
import { prefetchDemoData } from '@/hooks/demo';
const queryClient = useQueryClient();
await prefetchDemoData(queryClient, 'things');
```

### Mutations

```tsx
// All mutations show toast notifications automatically
const { mutate, loading, error } = useDemoCreateMutation('things');

// With callbacks
const { mutate } = useDemoCreateMutation('things', {
  onSuccess: (data) => console.log('Created:', data._id),
  onError: (error) => console.error('Failed:', error),
});
```

### Filters & Pagination

```tsx
const {
  filters,           // Current filter values
  search,            // Raw search input
  debouncedSearch,   // Debounced for API calls
  view,              // list | grid | graph | table
  setType,           // Set entity type filter
  setStatus,         // Set status filter
  setSearch,         // Update search
  nextPage,          // Go to next page
  previousPage,      // Go to previous page
  currentPage,       // Current page number
  shareableUrl,      // URL with current filters
} = useDemoFilters();
```

## Common Patterns

### Loading State

```tsx
if (loading) return <Skeleton />;
```

### Error Handling

```tsx
if (error) return <Alert variant="destructive">{error.message}</Alert>;
```

### Empty State

```tsx
if (!data?.length) return <EmptyState />;
```

### Complete List

```tsx
function ThingsList() {
  const { data, loading, error } = useDemoData('things');

  if (loading) return <Skeleton />;
  if (error) return <Alert>{error.message}</Alert>;
  if (!data?.length) return <EmptyState />;

  return (
    <ul>
      {data.map(t => (
        <li key={t._id}>{t.name}</li>
      ))}
    </ul>
  );
}
```

## Tips

1. **Use `debouncedSearch` not `search`** - Prevents excessive API calls
2. **Mutations show toasts automatically** - Don't create your own
3. **Filters sync to URL automatically** - Share links freely
4. **Backend reconnects automatically** - Don't manually reconnect
5. **Pagination works automatically** - Just call `nextPage()`

## Troubleshooting

**Data not loading?**
- Check connection status
- Check browser console for network errors
- Verify API endpoint returns data

**Mutations not working?**
- Check error toast message
- Verify request payload is correct
- Check network tab for failing requests

**Filters not syncing?**
- Ensure `useDemoFilters` is in route component
- Check URL query parameters
- Refresh page to verify persistence

## Full Examples

See `/web/src/hooks/demo/README.md` for complete examples.

## Next: Full Documentation

Read `/web/DEMO_INFRASTRUCTURE.md` for:
- Complete hook reference
- Store documentation
- Integration patterns
- Performance optimization
- Troubleshooting guide
