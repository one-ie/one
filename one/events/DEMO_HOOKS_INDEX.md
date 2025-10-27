# Demo Hooks Index

Quick navigation guide to all demo infrastructure documentation and code.

## Start Here

1. **First time?** → Read `/web/src/hooks/demo/QUICK_START.md` (5 minutes)
2. **Need details?** → Read `/web/src/hooks/demo/README.md` (30 minutes)
3. **Integrating?** → Read `/web/DEMO_INFRASTRUCTURE.md` (45 minutes)
4. **Summary?** → Read `/DEMO_INFRASTRUCTURE_SUMMARY.md` (10 minutes)

## Files

### Hook Code

All hooks in `/web/src/hooks/demo/`:

| File | Size | Purpose |
|------|------|---------|
| `useBackendConnection.ts` | 283 lines | Monitor connection status |
| `useDemoData.ts` | 327 lines | Fetch data with caching |
| `useDemoMutation.ts` | 336 lines | Create/update/delete operations |
| `useDemoFilters.ts` | 325 lines | Filter management + URL sync |
| `useDebounce.ts` | 121 lines | Debounce utility |
| `index.ts` | 63 lines | Central exports |

### Hook Documentation

| Document | Size | Purpose |
|----------|------|---------|
| `README.md` | 800+ lines | Complete hook reference with examples |
| `QUICK_START.md` | 150+ lines | 5-minute getting started |

### Stores

| File | Size | Purpose |
|------|------|---------|
| `/web/src/stores/demo.ts` | 388 lines | Global state with Nanostores |

### Implementation Guides

| Document | Size | Purpose |
|----------|------|---------|
| `/web/DEMO_INFRASTRUCTURE.md` | 500+ lines | Complete implementation guide |
| `/DEMO_INFRASTRUCTURE_SUMMARY.md` | 500+ lines | High-level overview |

## Quick Reference

### Import All Hooks

```tsx
import {
  // Connection
  useBackendConnection,
  getConnectionState,
  checkBackendHealth,
  initializeBackendConnection,
  cleanupBackendConnection,

  // Data
  useDemoData,
  fetchDemoBatch,
  prefetchDemoData,
  invalidateDemoCache,
  clearDemoCache,
  clearDemoCacheForResource,

  // Mutations
  useDemoCreateMutation,
  useDemoUpdateMutation,
  useDemoDeleteMutation,
  useDemoCustomMutation,

  // Filters
  useDemoFilters,
  getDemoFilters,
  initializeDemoFilters,

  // Utilities
  useDebounce,
  debounce,
  createDebounce,
} from '@/hooks/demo';
```

### Import Stores

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

  // Actions
  selectThing,
  updateDemoUI,
  toggleSidebar,
  updateDemoData,
  updateDemoStats,
  resetAllDemoState,
} from '@/stores/demo';
```

## Common Tasks

### Show Connection Status
```tsx
function StatusBar() {
  const { status, latency, isConnected } = useBackendConnection();
  return <div>{status} ({latency}ms)</div>;
}
```

See: `/web/src/hooks/demo/QUICK_START.md` - Task 1

### List Things with Filters
```tsx
function ThingsList() {
  const { filters, search, setSearch, debouncedSearch } = useDemoFilters();
  const { data: things } = useDemoData('things', { search: debouncedSearch });
  // ...
}
```

See: `/web/src/hooks/demo/QUICK_START.md` - Task 2

### Create New Entity
```tsx
function CreateButton() {
  const { mutate: create, loading } = useDemoCreateMutation('things');
  // ...
}
```

See: `/web/src/hooks/demo/QUICK_START.md` - Task 3

### Edit Entity
```tsx
function EditButton() {
  const { mutate: update } = useDemoUpdateMutation('things');
  // ...
}
```

See: `/web/src/hooks/demo/QUICK_START.md` - Task 4

### Delete Entity
```tsx
function DeleteButton() {
  const { mutate: delete_ } = useDemoDeleteMutation('things');
  // ...
}
```

See: `/web/src/hooks/demo/QUICK_START.md` - Task 5

## Hook Reference

| Hook | Purpose | Returns | Location |
|------|---------|---------|----------|
| `useBackendConnection` | Monitor connection | status, latency, reconnect() | useBackendConnection.ts |
| `useDemoData` | Fetch data | data, loading, error, refetch() | useDemoData.ts |
| `useDemoCreateMutation` | Create entity | mutate, loading, error | useDemoMutation.ts |
| `useDemoUpdateMutation` | Update entity | mutate, loading, error | useDemoMutation.ts |
| `useDemoDeleteMutation` | Delete entity | mutate, loading, error | useDemoMutation.ts |
| `useDemoFilters` | Manage filters | filters, setFilters(), shareableUrl | useDemoFilters.ts |
| `useDebounce` | Debounce value | debounced value | useDebounce.ts |

## Documentation Map

```
Quick Start (5 min)
  ↓
README.md (30 min)
  ↓
DEMO_INFRASTRUCTURE.md (45 min)
  ↓
Hook Implementation (study code)
  ↓
Store Implementation (study code)
  ↓
DEMO_INFRASTRUCTURE_SUMMARY.md (review)
```

## API Endpoints

Hooks communicate with:

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

## Cheat Sheet

### Connection States
```
'connecting'   - Initial/reconnecting
'connected'    - Healthy
'disconnected' - Failed, will retry
'error'        - Max retries exceeded
```

### View Modes
```
'list'   - Linear list view
'grid'   - Grid card view
'graph'  - Network graph view
'table'  - Tabular data view
```

### Thing Status
```
'draft'      - Not yet published
'active'     - Currently active
'published'  - Published/live
'archived'   - Archived/inactive
'inactive'   - Disabled
```

### Entity Types (66 types)
```
Creator/People:
  - creator, audience_member

Content:
  - course, lesson, blog_post, video, podcast, book

Tokens:
  - token, token_contract

AI:
  - ai_clone, external_agent

Products:
  - product, payment, subscription

... and 50+ more
```

## Performance Tips

1. Use `debouncedSearch` not `search` for auto-refetch
2. Mutations show toasts automatically - don't create your own
3. Filters sync to URL automatically - share links freely
4. Backend reconnects automatically - no manual intervention
5. Pagination works automatically - just call `nextPage()`

## Type Safety

100% TypeScript with complete type definitions:

```tsx
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
type ResourceType = 'groups' | 'people' | 'things' | 'connections' | 'events' | 'knowledge'
type ViewMode = 'list' | 'grid' | 'graph' | 'table'
type ThingStatus = 'draft' | 'active' | 'published' | 'archived' | 'inactive'

interface DemoDataOptions {
  groupId?: string
  type?: string
  status?: string
  search?: string
  limit?: number
  offset?: number
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
}

// Complete types for all hooks and stores
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not loading | Check connection, browser console, API endpoint |
| Mutations not working | Check error toast, request payload, network tab |
| Filters not syncing | Ensure useDemoFilters in route component, check URL |
| Search not working | Use debouncedSearch, check debounce delay |
| Connection keeps failing | Check backend URL, network connectivity, CORS |

See `/web/src/hooks/demo/README.md` Troubleshooting section for details.

## Integration Checklist

- [ ] Read QUICK_START.md (5 min)
- [ ] Understand connection monitoring pattern
- [ ] Understand data fetching pattern
- [ ] Understand mutation pattern
- [ ] Understand filter pattern
- [ ] Add useBackendConnection to root layout
- [ ] Add filters to demo pages
- [ ] Add data fetching to demo pages
- [ ] Add create/edit/delete forms
- [ ] Test with demo data
- [ ] Deploy to staging
- [ ] Get stakeholder feedback
- [ ] Deploy to production

## Next Steps

1. **Start with QUICK_START.md** for immediate understanding
2. **Read README.md** for complete reference
3. **Study hook implementations** for deep understanding
4. **Integrate into demo pages** following patterns
5. **Deploy and test** with real backend data

## Questions?

1. Check hook comments in source code
2. Check README.md examples
3. Check DEMO_INFRASTRUCTURE.md deep dives
4. Review hook implementations
5. Check TypeScript types

---

**Everything you need is here. Start with QUICK_START.md and follow the learning path.**
