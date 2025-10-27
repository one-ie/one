# Quick Start: Ontology Hooks & Features

Get started with the 6-dimension ontology integration in 5 minutes.

## 1. Install Dependencies

```bash
cd web/
bun add effect
```

## 2. Set Feature Flags

Create `.env.local` (choose based on your needs):

```bash
# Frontend-only (markdown blog, no backend)
# (no env vars needed)

# OR Static site with search
VITE_FEATURE_SEARCH=true

# OR SaaS app with auth
VITE_FEATURE_AUTH=true
VITE_FEATURE_GROUPS=true
VITE_FEATURE_PERMISSIONS=true
VITE_FEATURE_REALTIME=true
VITE_FEATURE_SEARCH=true
VITE_FEATURE_CONNECTIONS=true
VITE_FEATURE_EVENTS=true

# OR Full platform
VITE_FEATURES='{"auth":true,"groups":true,"permissions":true,"realtime":true,"search":true,"knowledge":true,"connections":true,"events":true,"inference":true,"payments":true,"marketplace":true,"community":true}'
```

## 3. Wrap App with Provider

```tsx
// src/components/App.tsx
import { DataProviderProvider } from '@/hooks/ontology';

// TODO: Import actual provider (Convex, Notion, etc.)
const provider = null; // For now: frontend-only

export default function App() {
  return (
    <DataProviderProvider provider={provider}>
      <YourAppContent />
    </DataProviderProvider>
  );
}
```

## 4. Use Hooks in Components

```tsx
// src/components/CourseList.tsx
import { useThings, useCurrentUser, isFeatureEnabled } from '@/hooks/ontology';

export default function CourseList() {
  // Get current user (if auth enabled)
  const { user, isAuthenticated } = useCurrentUser();

  // Get courses
  const { things: courses, loading } = useThings({
    type: 'course',
    status: 'published'
  });

  // Check if search is available
  const hasSearch = isFeatureEnabled('search');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated && <p>Welcome, {user.name}!</p>}

      {hasSearch && <SearchBox />}

      <div className="grid">
        {courses?.map(course => (
          <CourseCard key={course._id} course={course} />
        ))}
      </div>
    </div>
  );
}
```

## 5. Use in Astro Pages

```astro
---
// src/pages/courses/index.astro
import { getThings } from '@/lib/ontology/astro-helpers';
import CourseList from '@/components/CourseList.tsx';

// Server-side data fetching
const courses = await getThings({
  type: 'course',
  status: 'published'
});
---

<Layout title="Courses">
  <h1>Popular Courses</h1>
  <CourseList courses={courses} client:load />
</Layout>
```

## Common Patterns

### Conditional Rendering by Feature

```tsx
import { isFeatureEnabled } from '@/lib/ontology/features';

export function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/blog">Blog</a>

      {isFeatureEnabled('search') && (
        <a href="/search">Search</a>
      )}

      {isFeatureEnabled('auth') && (
        <a href="/account">Account</a>
      )}

      {isFeatureEnabled('groups') && (
        <a href="/organizations">Organizations</a>
      )}
    </nav>
  );
}
```

### Loading & Error States

```tsx
import { useThings } from '@/hooks/ontology';

export function ThingsList() {
  const { things, loading, error } = useThings();

  if (loading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!things?.length) return <EmptyState />;

  return (
    <ul>
      {things.map(thing => (
        <li key={thing._id}>{thing.name}</li>
      ))}
    </ul>
  );
}
```

### Protected Routes

```tsx
import { useCurrentUser, useCanAccess } from '@/hooks/ontology';
import { Navigate } from 'react-router-dom';

export function AdminPanel() {
  const { user, isAuthenticated } = useCurrentUser();
  const canAccess = useCanAccess('org_manage');

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!canAccess) return <AccessDenied />;

  return <AdminUI />;
}
```

### Search with Debouncing

```tsx
import { useSearch } from '@/hooks/ontology';
import { useState } from 'react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query); // Built-in 300ms debounce

  return (
    <div>
      <input
        type="search"
        placeholder="Search courses..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && <div>Searching...</div>}

      <ul>
        {results.map(result => (
          <li key={result._id}>{result.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Recording Events

```tsx
import { useEvent } from '@/hooks/ontology';

export function CourseEnrollButton({ courseId, userId }) {
  const { record, loading } = useEvent();

  const handleEnroll = async () => {
    await record({
      type: 'course_enrolled',
      targetId: courseId,
      actorId: userId,
      metadata: { enrolledAt: Date.now() }
    });
  };

  return (
    <button onClick={handleEnroll} disabled={loading}>
      {loading ? 'Enrolling...' : 'Enroll Now'}
    </button>
  );
}
```

### Creating Relationships

```tsx
import { useConnection } from '@/hooks/ontology';

export function FollowButton({ userId, authorId }) {
  const { create, loading } = useConnection();

  const handleFollow = async () => {
    await create({
      fromEntityId: userId,
      toEntityId: authorId,
      relationshipType: 'following'
    });
  };

  return (
    <button onClick={handleFollow} disabled={loading}>
      {loading ? 'Following...' : 'Follow'}
    </button>
  );
}
```

## Feature Modes at a Glance

```
Frontend-Only (Blog)
├─ No backend required
├─ Use markdown for content
├─ Static HTML generation
└─ Perfect for portfolios

Static + Search
├─ Markdown content
├─ Client-side search
└─ Great for documentation

Authenticated
├─ User accounts
├─ Protected pages
├─ Personal data
└─ Good for SaaS

Multi-Tenant (SaaS)
├─ Organizations/groups
├─ Team collaboration
├─ Real-time updates
└─ Complete platform

Full Featured
├─ Everything enabled
├─ AI/inference
├─ Payments/marketplace
├─ Blockchain support
└─ Enterprise platform
```

## Hook Cheat Sheet

### Getting Data

```tsx
// Things (entities)
const { things } = useThings({ type: 'course' });
const { thing } = useThingDetail(id);

// People (users)
const { user } = useCurrentUser();
const { members } = useGroupMembers(groupId);

// Connections (relationships)
const { entities } = useFollowing(userId);
const { entities } = useEnrollments(courseId);

// Events (activity)
const { events } = useActivityFeed(20);
const { events } = useAuditTrail(entityId);

// Search (knowledge)
const { results } = useSearch('query');
const { labels } = useLabels('category');
```

### Creating Data

```tsx
// Things
const { create } = useThing();
await create({ type: 'course', name: 'React 101', properties: {} });

// Connections
const { create } = useConnection();
await create({
  fromEntityId: userId,
  toEntityId: courseId,
  relationshipType: 'enrolled_in'
});

// Events
const { record } = useEvent();
await record({ type: 'course_completed', targetId: courseId });

// Groups
const { create } = useGroup();
await create({ name: 'Acme Corp', type: 'organization' });
```

### Checking Status

```tsx
import { isFeatureEnabled, getFeatureMode } from '@/lib/ontology/features';

isFeatureEnabled('auth')           // ✅/❌
isFeatureEnabled('groups')         // ✅/❌
isFeatureEnabled('realtime')       // ✅/❌

getFeatureMode()                   // 'frontend-only' | 'authenticated' | 'full'
```

## File Locations

- **Hooks**: `/web/src/hooks/ontology/`
- **Features**: `/web/src/lib/ontology/features.ts`
- **Astro Helpers**: `/web/src/lib/ontology/astro-helpers.ts`
- **Documentation**: `/web/ONTOLOGY-HOOKS-README.md`
- **Examples**: `/web/ASTRO-INTEGRATION-EXAMPLES.md`

## Next Steps

1. Read [ONTOLOGY-HOOKS-README.md](/web/ONTOLOGY-HOOKS-README.md) for complete API reference
2. Check [ASTRO-INTEGRATION-EXAMPLES.md](/web/ASTRO-INTEGRATION-EXAMPLES.md) for advanced patterns
3. Review [integration-phase2-summary.md](/INTEGRATION-SUMMARY.md) for architecture overview

## Troubleshooting

### Provider Not Available

```tsx
const provider = useProvider();
if (!provider) {
  // Fall back to content collections
  return <MarkdownUI />;
}
```

### Feature Not Enabled

```tsx
import { assertFeatureEnabled } from '@/lib/ontology/features';

try {
  assertFeatureEnabled('auth');
} catch (error) {
  // Feature disabled - hide UI or redirect
}
```

### Type Errors

```tsx
import type { Thing, Connection, Event } from '@/hooks/ontology';

// All imports available from '@/hooks/ontology'
```

## Questions?

- See [ONTOLOGY-HOOKS-README.md](/web/ONTOLOGY-HOOKS-README.md) for detailed API
- Check [ASTRO-INTEGRATION-EXAMPLES.md](/web/ASTRO-INTEGRATION-EXAMPLES.md) for patterns
- Review [INTEGRATION-SUMMARY.md](/INTEGRATION-SUMMARY.md) for architecture

Happy coding!
