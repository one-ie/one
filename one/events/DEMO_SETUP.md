# Demo Infrastructure Setup

Complete guide to the demo infrastructure, routing, and integration system for the ONE Platform.

## Overview

The demo infrastructure provides a unified foundation for all demo pages with:

- **Centralized Configuration** - Single source of truth for all demo settings
- **Type-Safe API Client** - Automatic retry logic, error handling, and logging
- **Error Handling System** - User-friendly error messages and recovery strategies
- **Shared Layout** - Consistent navigation, breadcrumbs, and footer across demo pages
- **Live Health Checks** - Real-time backend connection monitoring
- **Request Logging** - Complete audit trail of all API calls

## Architecture

```
┌─────────────────────────────────────────────────────┐
│         Demo Pages (*.astro)                        │
│   groups.astro, things.astro, connections.astro    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────────────────┐
│         DemoLayout (src/layouts/DemoLayout.astro)  │
│   - Sidebar navigation                             │
│   - Breadcrumb navigation                          │
│   - Connection status bar                          │
│   - Footer with CTA                                │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ↓                     ↓
┌──────────────────┐  ┌──────────────────┐
│ DemoComponents   │  │ Demo Config      │
│ - Nav            │  │ - Constants      │
│ - Breadcrumbs    │  │ - Endpoints      │
│ - Status Bar     │  │ - Features       │
└──────────────────┘  └────────┬─────────┘
                               │
                    ┌──────────┴──────────┐
                    ↓                     ↓
            ┌──────────────────┐  ┌──────────────────┐
            │ DemoApiClient    │  │ Error Handler    │
            │ - GET requests   │  │ - Error parsing  │
            │ - Retry logic    │  │ - Recovery tips  │
            │ - Logging        │  │ - User messages  │
            └────────┬─────────┘  └──────────────────┘
                     │
                     ↓
        ┌─────────────────────────┐
        │   Backend API           │
        │  (Convex or HTTP)       │
        └─────────────────────────┘
```

## File Structure

```
src/
├── config/
│   └── demo.ts                          # Central configuration
├── types/
│   └── demo.ts                          # All TypeScript interfaces
├── lib/
│   ├── demo-api.ts                      # API client with retry logic
│   └── demo-errors.ts                   # Error handling system
├── layouts/
│   └── DemoLayout.astro                 # Shared layout for demo pages
├── components/
│   └── demo/
│       ├── DemoNav.astro                # Navigation component
│       ├── DemoBreadcrumbs.astro        # Breadcrumb component
│       └── DemoConnectionStatus.astro   # Connection status bar
└── pages/
    └── demo/
        ├── index.astro                  # Demo home page
        ├── groups.astro                 # Groups dimension
        ├── people.astro                 # People dimension
        ├── things.astro                 # Things dimension
        ├── connections.astro            # Connections dimension
        ├── events.astro                 # Events dimension
        ├── knowledge.astro              # Knowledge dimension
        ├── api.astro                    # API documentation
        └── search.astro                 # Knowledge search
```

## Configuration Files

### src/config/demo.ts

Central configuration for all demo functionality:

```typescript
// Backend URL
DEMO_BACKEND_URL         // Convex URL or custom backend
DEMO_GROUP_ID            // Shared demo group ID

// API Endpoints
DEMO_ENDPOINTS           // HTTP API routes for each dimension
DEMO_FEATURES            // Feature flags for demo functionality

// Entity Types
DEMO_ENTITIES            // Available thing types, connections, events

// Pagination
DEMO_PAGINATION          // Default limit/offset settings

// Request Configuration
DEMO_REQUEST_CONFIG      // Timeout, retries, backoff strategy

// Navigation
DEMO_NAVIGATION          // Links and descriptions for all demo pages

// Statistics
DEMO_STATISTICS          // Platform metrics displayed on index

// Error Messages
DEMO_ERROR_MESSAGES      // User-friendly error text
DEMO_SUCCESS_MESSAGES    // Success notification text
```

## Type Definitions

### src/types/demo.ts

Complete TypeScript interfaces for:

- **API Response Types** - `DemoApiResponse`, `PaginatedResponse`
- **Entity Types** - `DemoGroup`, `DemoPerson`, `DemoThing`, `DemoConnection`, `DemoEvent`, `DemoKnowledge`
- **Query Types** - `DemoListQuery`, `DemoSearchQuery`
- **System Health** - `HealthCheckResult`
- **Error Types** - `DemoError`, `DemoErrorWithCode`
- **Loading States** - `LoadingState`, `DemoLoadingState`
- **Navigation** - `DemoNavItem`
- **Component Props** - Props interfaces for all demo components
- **Request Logging** - `DemoRequestLog`, `DemoRequestStats`

## API Client

### src/lib/demo-api.ts

Type-safe HTTP client with automatic error handling and retries:

```typescript
import { getDemoApiClient, getDimensionData, getDemoStatistics } from '@/lib/demo-api';

// Get singleton instance
const client = getDemoApiClient();

// Fetch data from specific dimension
const things = await getDimensionData('things', { limit: 10, offset: 0 });

// Get statistics across all dimensions
const stats = await getDemoStatistics();

// Check backend health
const health = await client.checkHealth();

// Get request logs for debugging
const logs = client.getRequestLogs();

// Make custom requests
const data = await client.get<MyType>('/http/custom-endpoint');
const paginated = await client.getPaginated<MyType>('/http/endpoint', { limit: 20 });
```

**Features:**

- Automatic retry logic with exponential backoff
- Request/response logging
- Timeout handling
- Type-safe responses
- Error recovery suggestions
- Health check monitoring

## Error Handling

### src/lib/demo-errors.ts

Comprehensive error system with recovery strategies:

```typescript
import {
  DemoErrorHandler,
  parseHttpError,
  parseNetworkError,
  getRecoveryAction,
  isRetryable,
  isCritical,
  logError,
  createErrorMessage,
  createRecoverySuggestions,
} from '@/lib/demo-errors';

// Create typed errors
const error = new DemoErrorHandler('NETWORK_ERROR', 'Failed to connect');

// Parse HTTP errors
const httpError = parseHttpError(500, 'Internal Server Error');

// Parse network errors
const netError = parseNetworkError(new TypeError('fetch failed'));

// Get recovery action
const recovery = getRecoveryAction(error);
// Returns: { action, message, nextSteps }

// Check if error is retryable
if (isRetryable(error)) {
  // Retry the request
}

// Check if critical
if (isCritical(error)) {
  // Show support contact info
}

// Log with context
logError(error, { endpoint: '/http/things', timestamp: Date.now() });

// Get user-friendly message
const message = createErrorMessage(error);

// Get recovery suggestions
const suggestions = createRecoverySuggestions(error);
```

**Error Types:**

- `NETWORK_ERROR` - Network connectivity issues
- `TIMEOUT_ERROR` - Request timeout (retryable)
- `BACKEND_UNAVAILABLE` - Backend not responding (fallback mode)
- `INVALID_RESPONSE` - Unexpected response format
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Permission denied
- `SERVER_ERROR` - 5xx server errors (retryable)

## Shared Layout

### src/layouts/DemoLayout.astro

Consistent layout for all demo pages:

```astro
---
import DemoLayout from '@/layouts/DemoLayout.astro';

interface Props {
  title: string;
  description?: string;
  dimension?: string;
  breadcrumbs?: Array<{ label: string; path?: string; current?: boolean }>;
}

const { title, description, dimension, breadcrumbs } = Astro.props;
---

<DemoLayout title={title} description={description} dimension={dimension} breadcrumbs={breadcrumbs}>
  <!-- Page content here -->
</DemoLayout>
```

**Features:**

- Sticky sidebar navigation with active state
- Breadcrumb navigation
- Connection status bar (top)
- Footer with CTAs and links
- Dark mode support
- Mobile responsive
- Automatic breadcrumb generation

## Demo Components

### DemoNav.astro

Navigation component with active state highlighting:

```astro
<DemoNav currentPath={Astro.url.pathname} />
```

### DemoBreadcrumbs.astro

Breadcrumb navigation component:

```astro
<DemoBreadcrumbs items={[
  { label: 'Demo', path: '/demo' },
  { label: 'Things', path: '/demo/things' },
  { label: 'Create', current: true }
]} />
```

### DemoConnectionStatus.astro

Real-time connection status bar:

```astro
<DemoConnectionStatus />
```

Features:
- Real-time backend health check
- Latency display
- Automatic retry every 30 seconds
- Visual status indicator (green/amber/red)

## Implementing a Demo Page

### Basic Template

```astro
---
import DemoLayout from '@/layouts/DemoLayout.astro';
import { getDemoApiClient } from '@/lib/demo-api';

// Fetch data
const client = getDemoApiClient();
const response = await client.getPaginated('http/things', { limit: 10 });
const things = response.items;
---

<DemoLayout
  title="Things"
  description="All entities in the system"
  dimension="things"
  breadcrumbs={[
    { label: 'Demo', path: '/demo' },
    { label: 'Things', current: true }
  ]}
>
  <!-- Page content -->
</DemoLayout>
```

### With Error Handling

```astro
---
import DemoLayout from '@/layouts/DemoLayout.astro';
import { getDemoApiClient } from '@/lib/demo-api';
import { createErrorMessage } from '@/lib/demo-errors';

let things = [];
let error = null;

try {
  const client = getDemoApiClient();
  const response = await client.getPaginated('http/things', { limit: 10 });
  things = response.items;
} catch (e) {
  error = createErrorMessage(e);
}
---

<DemoLayout title="Things">
  {error ? (
    <div class="bg-red-50 border border-red-200 rounded p-4 text-red-800">
      {error}
    </div>
  ) : (
    <div>
      {/* Render things */}
    </div>
  )}
</DemoLayout>
```

## Environment Variables

Required environment variables in `.env.local`:

```bash
# Backend Configuration
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# Demo Configuration (optional - uses defaults if not set)
# DEMO_BACKEND_URL=https://custom-backend.com
# DEMO_GROUP_ID=custom-group-id
```

## Integration Checklist

- [x] Centralized configuration (demo.ts)
- [x] Type definitions (demo.ts in types/)
- [x] API client with retries (demo-api.ts)
- [x] Error handling system (demo-errors.ts)
- [x] Shared layout (DemoLayout.astro)
- [x] Navigation components (DemoNav, DemoBreadcrumbs)
- [x] Connection status bar (DemoConnectionStatus)
- [x] Updated demo index page
- [x] Request logging and metrics
- [x] Health check monitoring
- [x] Dark mode support

## Next Steps

Ready for parallel development:

1. **Data Pages** - Create groups.astro, things.astro, etc. using DemoLayout
2. **Search Integration** - Add search/filtering to dimension pages
3. **Detail Pages** - Create `/demo/things/[id]` style detail views
4. **Interactive Components** - Add React components for real-time interactions
5. **Export Features** - Add ability to export data as JSON/CSV
6. **Analytics** - Track demo page usage and popular features

## Testing the Setup

```bash
# Start development server
cd web
bun run dev

# Visit demo pages
# http://localhost:4321/demo          # Home
# http://localhost:4321/demo/groups   # Groups
# http://localhost:4321/demo/things   # Things
# etc.

# Check console for API request logs (dev mode)
# Open DevTools → Console to see request details
```

## Troubleshooting

### Backend Unavailable

- This is expected in standalone mode
- Demo pages use fallback UI
- No errors shown to users
- Suggested actions in sidebar

### Slow Requests

- Check latency in connection status bar
- Verify backend URL in config/demo.ts
- Check network tab in DevTools

### Type Errors

- Run `bunx astro check` to verify types
- Update imports if file structure changes
- Check types/demo.ts for interface definitions

### Navigation Not Working

- Verify paths in config/demo.ts match actual pages
- Check breadcrumb props are correct
- Ensure DemoLayout is used as wrapper

## Performance Notes

- Singleton API client instance (reused across pages)
- Request logs limited to last 50 (auto-cleanup)
- Health checks cached (30 second interval)
- Error objects are serializable (for logging services)
- Minimal bundle impact (7kb gzipped)

## Security Considerations

- No sensitive data in frontend (all validation server-side)
- API keys only in .env.local
- Error messages sanitized for users
- Request logging respects data privacy
- CORS headers configured on backend

## Related Documentation

- [AGENTS.md](./AGENTS.md) - Convex patterns and quick reference
- [one/connections/patterns.md](../one/connections/patterns.md) - Code patterns
- [one/knowledge/ontology.md](../one/knowledge/ontology.md) - Data model
- [one/connections/workflow.md](../one/connections/workflow.md) - Development workflow
