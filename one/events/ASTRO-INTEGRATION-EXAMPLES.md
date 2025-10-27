# Astro Integration Examples

This document provides practical examples of integrating the 6-dimension ontology with Astro pages and React components.

## Directory Structure

```
web/src/
├── hooks/ontology/              # React hooks for all 6 dimensions
│   ├── useProvider.ts           # Backend provider access
│   ├── useGroup.ts              # Groups (organizations)
│   ├── usePerson.ts             # People (users, roles)
│   ├── useThing.ts              # Things (entities)
│   ├── useConnection.ts         # Connections (relationships)
│   ├── useEvent.ts              # Events (audit trail)
│   ├── useSearch.ts             # Knowledge (search, embeddings)
│   └── index.ts                 # Barrel export
│
├── lib/ontology/
│   ├── features.ts              # Feature flags
│   ├── astro-helpers.ts         # Astro SSR helpers
│   └── ...other ontology libs
│
└── pages/
    ├── [group]/
    │   ├── index.astro          # Group overview
    │   ├── things/
    │   │   ├── index.astro      # List things
    │   │   └── [id].astro       # Thing detail page
    │   ├── connections.astro    # Relationship viewer
    │   ├── events.astro         # Activity feed
    │   └── members.astro        # Group members (if auth enabled)
    │
    └── knowledge/
        ├── search/
        │   └── [query].astro    # Search results page
        └── labels/
            └── [label].astro    # Things by label
```

## Example 1: Entity Listing Page

**File:** `src/pages/things/index.astro`

```astro
---
// Server-side fetching with fallback
import { getThings } from '@/lib/ontology/astro-helpers';
import { isFeatureEnabled } from '@/lib/ontology/features';
import Layout from '@/layouts/Layout.astro';
import ThingCard from '@/components/ontology/ThingCard.tsx';

// Get query parameters
const type = Astro.url.searchParams.get('type');
const status = Astro.url.searchParams.get('status') || 'published';

// Fetch things (tries provider, falls back to empty)
const things = await getThings({
  type: type || undefined,
  status,
  limit: 50
});

// Check if search is available
const hasSearch = isFeatureEnabled('search');
---

<Layout title="Things">
  <div class="container">
    <h1>All Things</h1>

    {/* Search box if available */}
    {hasSearch && (
      <SearchBox client:load type={type} />
    )}

    {/* Thing listing */}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {things.map(thing => (
        <ThingCard
          key={thing._id}
          thing={thing}
          client:load
        />
      ))}
    </div>

    {things.length === 0 && (
      <div class="text-center py-12">
        <p class="text-muted-foreground">No things found</p>
      </div>
    )}
  </div>
</Layout>
```

## Example 2: Entity Detail Page with Dynamic Routing

**File:** `src/pages/things/[id].astro`

```astro
---
// Server-side data fetching
import { getThingWithFallback, getRelatedThings } from '@/lib/ontology/astro-helpers';
import { getEntry } from 'astro:content';
import Layout from '@/layouts/Layout.astro';
import RelatedThings from '@/components/ontology/RelatedThings.tsx';

const { id } = Astro.params;

if (!id) {
  return Astro.redirect('/things');
}

// Try to get thing from provider, fall back to markdown
const thing = await getThingWithFallback(id);

if (!thing) {
  // Try content collection as fallback
  const post = await getEntry('blog', id);
  if (!post) {
    return Astro.redirect('/404');
  }

  // Use post data instead
  const { Content } = await post.render();
  const { title, description } = post.data;

  return (
    <Layout title={title}>
      <article>
        <h1>{title}</h1>
        <p class="text-muted-foreground">{description}</p>
        <Content />
      </article>
    </Layout>
  );
}

// Validate thing status (only show published publicly)
if (thing.status !== 'published' && !isAdmin) {
  return Astro.redirect('/404');
}

// Get related things
const related = await getRelatedThings(thing._id, 'references');
---

<Layout title={thing.name}>
  <article>
    <header>
      <h1>{thing.name}</h1>
      <p class="text-muted-foreground">
        {thing.properties.description}
      </p>
    </header>

    <main>
      {/* Render type-specific content */}
      {thing.type === 'course' && (
        <CourseContent course={thing} client:load />
      )}

      {thing.type === 'blog_post' && (
        <div set:html={thing.properties.content} />
      )}

      {/* Generic fallback */}
      {thing.type !== 'course' && thing.type !== 'blog_post' && (
        <div>
          <h2>Details</h2>
          <pre>{JSON.stringify(thing.properties, null, 2)}</pre>
        </div>
      )}
    </main>

    {/* Related things */}
    {related.length > 0 && (
      <RelatedThings
        items={related}
        client:load
      />
    )}
  </article>
</Layout>
```

## Example 3: Search Page with Results

**File:** `src/pages/search/[query].astro`

```astro
---
// Search results page
import { searchThings } from '@/lib/ontology/astro-helpers';
import { isFeatureEnabled } from '@/lib/ontology/features';
import Layout from '@/layouts/Layout.astro';
import SearchBox from '@/components/ontology/SearchBox.tsx';
import SearchResult from '@/components/ontology/SearchResult.tsx';

const { query } = Astro.params;
const type = Astro.url.searchParams.get('type');

if (!isFeatureEnabled('search')) {
  return Astro.redirect('/');
}

const results = await searchThings(query, type || undefined);
---

<Layout title={`Search Results for "${query}"`}>
  <div class="container">
    <h1>Search Results</h1>

    {/* Search box (stick to top) */}
    <div class="mb-8">
      <SearchBox client:load defaultQuery={query} />
    </div>

    {/* Results */}
    <div class="space-y-4">
      {results.map(result => (
        <SearchResult
          key={result._id}
          result={result}
        />
      ))}
    </div>

    {/* No results */}
    {results.length === 0 && (
      <div class="text-center py-12">
        <p class="text-muted-foreground text-lg">
          No results found for "{query}"
        </p>
        <p class="text-sm">Try a different search term</p>
      </div>
    )}
  </div>
</Layout>
```

## Example 4: Group Overview with Multi-Tenant Support

**File:** `src/pages/groups/[id].astro`

```astro
---
// Group detail page with member management
import { getGroup, getThings } from '@/lib/ontology/astro-helpers';
import { isFeatureEnabled } from '@/lib/ontology/features';
import Layout from '@/layouts/Layout.astro';
import GroupHeader from '@/components/ontology/GroupHeader.tsx';
import GroupMembers from '@/components/ontology/GroupMembers.tsx';
import GroupThings from '@/components/ontology/GroupThings.tsx';

const { id: groupId } = Astro.params;

if (!isFeatureEnabled('groups')) {
  return Astro.redirect('/');
}

const group = await getGroup(groupId);

if (!group) {
  return Astro.redirect('/404');
}

// Get things in this group
const things = await getThings({
  limit: 20
});
---

<Layout title={group.name}>
  <div>
    {/* Group header */}
    <GroupHeader group={group} client:load />

    <div class="container grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content */}
      <div class="lg:col-span-2">
        <h2>Things in {group.name}</h2>
        <GroupThings
          things={things}
          groupId={groupId}
          client:load
        />
      </div>

      {/* Sidebar */}
      <div>
        {/* Members (if auth enabled) */}
        {isFeatureEnabled('permissions') && (
          <GroupMembers
            groupId={groupId}
            client:load
          />
        )}

        {/* Group details */}
        <div class="bg-card p-6 rounded-lg">
          <h3>Group Details</h3>
          <dl class="space-y-2">
            <div>
              <dt class="font-semibold">Type</dt>
              <dd>{group.type}</dd>
            </div>
            {group.properties.plan && (
              <div>
                <dt class="font-semibold">Plan</dt>
                <dd>{group.properties.plan}</dd>
              </div>
            )}
            {group.properties.description && (
              <div>
                <dt class="font-semibold">Description</dt>
                <dd>{group.properties.description}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  </div>
</Layout>
```

## Example 5: Activity Feed / Events Page

**File:** `src/pages/activity.astro`

```astro
---
// Activity/events feed
import { getRecentEvents } from '@/lib/ontology/astro-helpers';
import { isFeatureEnabled } from '@/lib/ontology/features';
import Layout from '@/layouts/Layout.astro';
import EventCard from '@/components/ontology/EventCard.tsx';

if (!isFeatureEnabled('events')) {
  return Astro.redirect('/');
}

// Fetch recent events
const events = await getRecentEvents(50);
---

<Layout title="Activity Feed">
  <div class="container max-w-2xl">
    <h1>Recent Activity</h1>

    {/* Real-time updates via React island */}
    <div class="space-y-4">
      <ActivityFeed
        initialEvents={events}
        client:load
      />
    </div>
  </div>
</Layout>

{/* Import client component for real-time updates */}
import ActivityFeed from '@/components/ontology/ActivityFeed.tsx';
```

## Example 6: React Component with Hooks

**File:** `src/components/ontology/ThingCard.tsx`

```typescript
import { useThing } from '@/hooks/ontology';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ThingCardProps {
  thing: {
    _id: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  };
}

export default function ThingCard({ thing }: ThingCardProps) {
  const { update, remove, loading, error } = useThing();

  const handleUpdate = async () => {
    await update(thing._id as any, {
      properties: {
        ...thing.properties,
        updatedAt: Date.now()
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{thing.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p class="text-sm text-muted-foreground">
          {thing.type}
        </p>

        <div class="mt-4 flex gap-2">
          <Button
            size="sm"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => remove(thing._id as any)}
            disabled={loading}
          >
            Delete
          </Button>
        </div>

        {error && (
          <div class="text-sm text-red-600 mt-2">
            Error: {String(error)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## Example 7: Protected Route with Authentication

**File:** `src/pages/dashboard.astro`

```astro
---
// Protected dashboard page
import { getCurrentUser } from '@/lib/ontology/astro-helpers';
import { isFeatureEnabled, assertFeatureEnabled } from '@/lib/ontology/features';
import Layout from '@/layouts/Layout.astro';

// Assert auth is enabled
try {
  assertFeatureEnabled('auth');
} catch (error) {
  return Astro.redirect('/');
}

// Get current user
const user = await getCurrentUser(Astro.request);

// Redirect to login if not authenticated
if (!user) {
  return Astro.redirect('/account/signin');
}
---

<Layout title="Dashboard">
  <div class="container">
    <h1>Welcome, {user.name}!</h1>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* User stats */}
      <DashboardCard
        title="Courses"
        value={user.properties.courseCount || 0}
        client:load
      />
      <DashboardCard
        title="Tokens"
        value={user.properties.tokenBalance || 0}
        client:load
      />
      <DashboardCard
        title="Following"
        value={user.properties.followingCount || 0}
        client:load
      />
    </div>

    {/* User content */}
    <section class="mt-8">
      <h2>My Courses</h2>
      <UserCourses
        userId={user._id}
        client:load
      />
    </section>
  </div>
</Layout>

import DashboardCard from '@/components/ontology/DashboardCard.tsx';
import UserCourses from '@/components/ontology/UserCourses.tsx';
```

## Example 8: Conditional Rendering Based on Features

**File:** `src/components/Navigation.astro`

```astro
---
// Navigation with conditional feature-based rendering
import { isFeatureEnabled } from '@/lib/ontology/features';
import NavLink from '@/components/NavLink.astro';
---

<nav class="border-b">
  <div class="container flex items-center gap-6">
    <NavLink href="/">Home</NavLink>

    {/* Blog (always visible) */}
    <NavLink href="/blog">Blog</NavLink>

    {/* Search (only if search enabled) */}
    {isFeatureEnabled('search') && (
      <NavLink href="/search">Search</NavLink>
    )}

    {/* Groups (only if multi-tenant enabled) */}
    {isFeatureEnabled('groups') && (
      <NavLink href="/groups">Organizations</NavLink>
    )}

    {/* Auth links (only if auth enabled) */}
    {isFeatureEnabled('auth') && (
      <>
        <NavLink href="/account/signin" class="ml-auto">
          Sign In
        </NavLink>
        <NavLink href="/account/signup">
          Sign Up
        </NavLink>
      </>
    )}
  </div>
</nav>
```

## Feature Flag Configuration

### Environment Variables

```bash
# Frontend-only mode (no backend)
VITE_FEATURE_AUTH=false
VITE_FEATURE_GROUPS=false

# Enable specific features
VITE_FEATURE_SEARCH=true
VITE_FEATURE_EVENTS=true

# Or use JSON config
VITE_FEATURES='{"auth":true,"groups":true,"realtime":true}'
```

### Accessing Features in Components

```typescript
import { features, isFeatureEnabled, getFeatureMode } from '@/lib/ontology/features';

// Direct check
if (features.auth) {
  // Show auth UI
}

// Function check
if (isFeatureEnabled('groups')) {
  // Show multi-tenant UI
}

// Get operating mode
const mode = getFeatureMode();
if (mode === 'full') {
  // Use all features
}
```

## Error Handling & Fallbacks

### Provider Fallback Pattern

```astro
---
// Graceful degradation when provider unavailable
import { getThingWithFallback } from '@/lib/ontology/astro-helpers';
import { getEntry } from 'astro:content';

const thing = await getThingWithFallback(id);

if (!thing) {
  // Fall back to markdown
  const post = await getEntry('blog', id);
  if (!post) return Astro.redirect('/404');
  // Use post data...
}
---
```

### Feature Check Pattern

```astro
---
import { isFeatureEnabled, assertFeatureEnabled } from '@/lib/ontology/features';

// Soft check - continue with degradation
if (!isFeatureEnabled('search')) {
  // Show limited UI without search
}

// Hard check - block if feature required
assertFeatureEnabled('auth'); // Throws if not enabled
---
```

## Best Practices

1. **Server-side Fetching**: Use Astro page frontmatter for data fetching
2. **Fallback Content**: Always have markdown/content collection fallback
3. **Feature Checks**: Use feature flags for conditional rendering
4. **Client Components**: Use `client:load` only for interactive elements
5. **Error Handling**: Gracefully degrade when provider unavailable
6. **Caching**: Use appropriate cache headers for static/dynamic content
7. **Type Safety**: Leverage TypeScript for type-safe queries

## Performance Optimization

- Static generation: Generate common pages at build time
- Incremental Static Regeneration (ISR): Revalidate periodically
- Code splitting: Lazy load heavy components with `client:idle`
- Image optimization: Use Astro `<Image>` component
- Caching: Set appropriate cache headers per page type
