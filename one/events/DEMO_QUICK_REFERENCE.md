# Demo Infrastructure Quick Reference

Fast lookup guide for developers using the demo infrastructure.

## Import Statements

```typescript
// Configuration
import { DEMO_NAVIGATION, DEMO_STATISTICS, DEMO_ENDPOINTS } from '@/config/demo';

// Types
import type {
  DemoGroup,
  DemoPerson,
  DemoThing,
  DemoConnection,
  DemoEvent,
  DemoKnowledge,
  DemoApiResponse,
  PaginatedResponse,
  DemoError,
  HealthCheckResult,
  LoadingState,
} from '@/types/demo';

// API Client
import { getDemoApiClient, getDimensionData, getDemoStatistics } from '@/lib/demo-api';

// Error Handling
import {
  DemoErrorHandler,
  parseHttpError,
  parseNetworkError,
  getRecoveryAction,
  isRetryable,
  isCritical,
  createErrorMessage,
  createRecoverySuggestions,
} from '@/lib/demo-errors';

// Layout
import DemoLayout from '@/layouts/DemoLayout.astro';

// State Management
import {
  $demoData,
  $demoLoading,
  $demoErrors,
  updateDemoData,
  setDemoLoading,
  setDemoError,
} from '@/stores/demo';
```

## Common Patterns

### Create a Demo Page

```astro
---
import DemoLayout from '@/layouts/DemoLayout.astro';
import { getDemoApiClient } from '@/lib/demo-api';
import { createErrorMessage } from '@/lib/demo-errors';

let data = [];
let error = null;

try {
  const client = getDemoApiClient();
  const response = await client.getPaginated('http/things', { limit: 10 });
  data = response.items;
} catch (e) {
  error = createErrorMessage(e);
}
---

<DemoLayout
  title="Things"
  description="All entities"
  dimension="things"
>
  {error ? <div>{error}</div> : <div>{data.map(d => <div>{d.name}</div>)}</div>}
</DemoLayout>
```

### Fetch Data

```typescript
// Get single dimension
const things = await getDimensionData('things');

// Get paginated data
const client = getDemoApiClient();
const response = await client.getPaginated('http/things', {
  limit: 20,
  offset: 0,
  sort: 'created',
});

// Get all statistics
const stats = await getDemoStatistics();

// Check backend health
const health = await client.checkHealth();
```

### Handle Errors

```typescript
try {
  const data = await client.get('/http/endpoint');
} catch (error) {
  // Get user-friendly message
  const message = createErrorMessage(error);

  // Get suggestions
  const suggestions = createRecoverySuggestions(error);

  // Check if retryable
  if (isRetryable(error)) {
    // Retry logic
  }

  // Check if critical
  if (isCritical(error)) {
    // Show support contact
  }
}
```

### Use Demo Stores

```typescript
import { $demoData, $demoLoading, updateDemoData, setDemoLoading } from '@/stores/demo';

// Get current data
const data = $demoData.get();

// Update data
updateDemoData('things', newThings);

// Set loading state
setDemoLoading('things', true);

// Subscribe to changes (in React)
import { useStore } from '@nanostores/react';

function MyComponent() {
  const data = useStore($demoData);
  return <div>{data.things?.length} things</div>;
}
```

## Configuration Constants

```typescript
// Backend & Endpoints
DEMO_BACKEND_URL              // 'https://shocking-falcon-870.convex.cloud'
DEMO_GROUP_ID                 // 'kh77jymsq3tmk1gmrwrpp94r7x7spkhw'
DEMO_ENDPOINTS                // { groups, people, things, connections, events, knowledge }

// Request Settings
DEMO_REQUEST_CONFIG           // { timeout: 5000, retries: 3, retryDelay: 1000 }
HEALTH_CHECK_CONFIG           // { interval: 30000, timeout: 3000 }

// Navigation
DEMO_NAVIGATION               // Array of { title, path, description, dimension }

// Statistics
DEMO_STATISTICS               // { linesOfCode, reactHooks, apiEndpoints, ... }

// Messages
DEMO_ERROR_MESSAGES           // User-friendly error messages
DEMO_SUCCESS_MESSAGES         // User-friendly success messages
```

## API Client Methods

```typescript
const client = getDemoApiClient();

// GET request
const data = await client.get<MyType>('/http/endpoint');

// GET with pagination
const response = await client.getPaginated<MyType>('/http/endpoint', {
  limit: 20,
  offset: 0,
  type: 'filter',
});

// Health check
const { status, latency } = await client.checkHealth();

// Request logs
const logs = client.getRequestLogs();
client.clearRequestLogs();

// Configuration
const config = client.getConfig();
client.updateConfig({ timeout: 10000 });

// Available endpoints
const endpoints = client.getAvailableEndpoints();
```

## Error Classes

```typescript
// Custom error
const error = new DemoErrorHandler(
  'NETWORK_ERROR',
  'Failed to connect',
  { severity: ErrorSeverity.HIGH }
);

// Parse HTTP error
const httpError = parseHttpError(500, 'Internal Server Error');

// Parse network error
const netError = parseNetworkError(new TypeError('fetch failed'));

// Get recovery action
const recovery = getRecoveryAction(error);
// { action, message, nextSteps }
```

## Component Props

```typescript
// DemoLayout props
interface Props {
  title: string;
  description?: string;
  dimension?: string;
  breadcrumbs?: Array<{
    label: string;
    path?: string;
    current?: boolean;
  }>;
}

// DemoBreadcrumbs props
interface Props {
  items: Array<{
    label: string;
    path?: string;
    current?: boolean;
  }>;
}

// DemoNav props
interface Props {
  currentPath?: string;
}
```

## File Locations

```
src/config/demo.ts                          # Configuration
src/types/demo.ts                           # Type definitions
src/lib/demo-api.ts                         # API client
src/lib/demo-errors.ts                      # Error handling
src/layouts/DemoLayout.astro                # Shared layout
src/components/demo/                        # Demo components
src/stores/demo.ts                          # Global state
src/pages/demo/                             # Demo pages
```

## Type Definitions Quick Lookup

```typescript
// Response Types
DemoApiResponse<T>          // { success, data, error, timestamp }
PaginatedResponse<T>        // { items, total, limit, offset, hasMore }

// Entity Types
DemoGroup                   // { _id, name, type, parentGroupId, ... }
DemoPerson                  // { _id, name, email, role, ... }
DemoThing                   // { _id, type, name, properties, ... }
DemoConnection              // { _id, fromThingId, toThingId, ... }
DemoEvent                   // { _id, type, actorId, targetId, ... }
DemoKnowledge               // { _id, knowledgeType, text, embedding, ... }

// Query Types
DemoListQuery               // { limit, offset, type, sort, order }
DemoSearchQuery             // { search, filters, ... + DemoListQuery }

// System Types
HealthCheckResult           // { status, backend, database, api }
DemoError                   // { code, message, details, timestamp, recoverable }
LoadingState<T>             // { isLoading, isError, error, data, dataUpdatedAt }
DemoLoadingState            // LoadingState for each dimension
```

## Common Tasks

### Task: Fetch all things
```typescript
const client = getDemoApiClient();
const things = await getDimensionData('things');
```

### Task: Get things with pagination
```typescript
const client = getDemoApiClient();
const response = await client.getPaginated('http/things', {
  limit: 50,
  offset: 0,
});
```

### Task: Get system statistics
```typescript
const stats = await getDemoStatistics();
console.log(`Groups: ${stats.groups.count}`);
console.log(`Things: ${stats.things.count}`);
```

### Task: Check if backend is available
```typescript
const client = getDemoApiClient();
const health = await client.checkHealth();
if (health.status === 'online') {
  console.log(`Latency: ${health.latency}ms`);
}
```

### Task: Handle API errors with recovery
```typescript
try {
  const data = await client.get('/http/things');
} catch (error) {
  const message = createErrorMessage(error);
  const suggestions = createRecoverySuggestions(error);
  console.log(message);
  console.log('Try:', suggestions);
}
```

### Task: Create a new dimension page
```astro
---
import DemoLayout from '@/layouts/DemoLayout.astro';
import { getDemoApiClient } from '@/lib/demo-api';

const client = getDemoApiClient();
const response = await client.getPaginated('http/my-dimension');
const items = response.items;
---

<DemoLayout title="My Dimension" dimension="custom">
  <!-- Content here -->
</DemoLayout>
```

### Task: Add error handling to a page
```astro
---
import { createErrorMessage, createRecoverySuggestions } from '@/lib/demo-errors';

let items = [];
let error = null;

try {
  const client = getDemoApiClient();
  const response = await client.getPaginated('http/things');
  items = response.items;
} catch (e) {
  error = createErrorMessage(e);
}
---

<div>
  {error ? (
    <div class="error">
      <p>{error}</p>
      <ul>
        {createRecoverySuggestions(error).map(s => <li>{s}</li>)}
      </ul>
    </div>
  ) : (
    <div>{items.map(i => <div>{i.name}</div>)}</div>
  )}
</div>
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend unavailable | This is expected in standalone mode. Use fallback UI. |
| Request timeout | Check backend URL in `DEMO_BACKEND_URL`. Verify network. |
| Type errors | Run `bunx astro check`. Check imports. |
| Navigation not working | Verify paths in `DEMO_NAVIGATION`. Check breadcrumb props. |
| Styles not applied | Check dark mode classes. Use semantic color names. |
| Request logging missing | Check `NODE_ENV === 'development'` in console. |

## Performance Tips

- Use singleton API client (automatically reused)
- Request logs auto-cleanup after 50 entries
- Health checks cached (30s interval)
- Minimize network requests with pagination
- Cache data in stores to avoid re-fetches
- Use error recovery for resilience

## Security Notes

- No sensitive data in frontend code
- API keys only in `.env.local`
- Error messages sanitized for users
- All validation server-side
- CORS headers configured on backend
- No PII in request logs

## Related Documentation

- [DEMO_SETUP.md](./DEMO_SETUP.md) - Complete setup guide
- [DEMO_INFRASTRUCTURE_SUMMARY.md](./DEMO_INFRASTRUCTURE_SUMMARY.md) - Implementation details
- [DEMO_INTEGRATION_CHECKLIST.md](./DEMO_INTEGRATION_CHECKLIST.md) - Verification checklist
- [AGENTS.md](./AGENTS.md) - Convex patterns
- [CLAUDE.md](./CLAUDE.md) - AI agent instructions

## Quick Stats

- **Configuration:** 161 lines
- **Types:** 298 lines
- **API Client:** 387 lines
- **Error Handler:** 422 lines
- **Layout:** 200 lines
- **Components:** 175 lines
- **Documentation:** 1,046 lines
- **Total:** 2,689 lines of code & docs

## Version

Infrastructure: v1.0.0
Last Updated: 2025-10-25
Status: Production Ready
