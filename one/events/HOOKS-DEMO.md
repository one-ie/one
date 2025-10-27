# React Hooks Demo Guide

## Overview

The ONE Platform includes a comprehensive demo showcasing all **43 production-ready React hooks** organized across **8 dimensions** of the 6-dimension ontology.

## What's Included

### 1. Demo Page (`/demo/hooks`)

An interactive, beautifully designed page showcasing all 43 hooks with:

- **Hero Section** - Eye-catching introduction with key metrics
- **Navigation** - Quick links to each dimension
- **Hook Cards** - Complete documentation for each hook including:
  - Function signature
  - Parameters explanation
  - Return type
  - Usage example
  - Real-world example code
- **Common Patterns** - Loading states, error handling, real-time data
- **Integration Guide** - Using hooks in Astro and React
- **Complete Working Example** - Full course enrollment component
- **Statistics** - Key metrics about the hooks
- **Next Steps** - Links to documentation

### 2. Interactive Component (`/src/components/demo/HooksDemo.tsx`)

A React component that provides live, runnable examples of:

- `useProvider()` - Check backend status
- `useGroups()` - List groups
- `useSearch()` - Search entities
- `useEvents()` - Get recent events
- `useLabels()` - Get available labels

Features:
- Real-time demo execution
- Mock data when backend unavailable
- Results display in JSON format
- Loading and error states
- Pro tips section

### 3. Comprehensive Guide (`/demo/hooks-guide`)

Complete documentation covering:

- Quick start guide
- All 8 hook dimensions in detail
- Parameter and return type explanations
- Code examples for every hook
- Common patterns and best practices
- Type definitions
- FAQ section

## Hook Dimensions

### 1. Provider (4 hooks)

Backend abstraction and configuration.

- `useProvider()` - Access DataProvider instance
- `useIsProviderAvailable()` - Check if backend is online
- `useProviderCapability()` - Check specific capabilities
- `useProviderName()` - Get provider name

### 2. Groups (4 hooks)

Multi-tenant isolation and hierarchical containers.

- `useGroup()` - CRUD operations on groups
- `useGroups()` - List groups with filtering
- `useCurrentGroup()` - Get active group
- `useChildGroups()` - Get child groups

### 3. People (5 hooks)

Authorization, roles, and user management.

- `usePerson()` - Get/update single person
- `useCurrentUser()` - Get authenticated user
- `useHasRole()` - Check user role
- `useCanAccess()` - Check resource access
- `useGroupMembers()` - Get group members

### 4. Things (7 hooks)

Entities, objects, and content management.

- `useThing()` - CRUD operations
- `useThings()` - List with filtering
- `useThingDetail()` - Get single thing
- `useThingsByType()` - Get things by type
- `useThingSearch()` - Search things
- `usePublishedThings()` - Get published
- `useMyThings()` - Get user's things

### 5. Connections (9 hooks)

Relationships between entities.

- `useConnection()` - Create/delete connections
- `useConnections()` - List connections
- `useRelatedEntities()` - Get related entities
- `useIsConnected()` - Check if connected
- `useOwnedEntities()` - Get owned entities
- `useFollowers()` - Get followers
- `useFollowing()` - Get following list
- `useEnrollments()` - Get course enrollments
- `useUserEnrollments()` - Get user's enrollments

### 6. Events (9 hooks)

Activity logging and audit trails.

- `useEvent()` - Record events
- `useEvents()` - List events
- `useActivityFeed()` - User activity feed
- `useAuditTrail()` - Entity audit trail
- `useUserHistory()` - User event history
- `useEventsByType()` - Get events by type
- `useEventCount()` - Count events
- `useTimeline()` - Chronological timeline
- `useEventStream()` - Real-time event stream

### 7. Search & Knowledge (9 hooks)

Semantic search, labels, and RAG.

- `useSearch()` - Search all entities
- `useSearchByType()` - Search by type
- `useLabels()` - Get all labels
- `useLabelsByCategory()` - Get labels by category
- `useEntityLabels()` - Get entity labels
- `useEntitiesByLabel()` - Get entities with label
- `useSimilarEntities()` - Get similar entities
- `useFacetedSearch()` - Faceted search
- `useTrendingEntities()` - Get trending items

### 8. Recommendations (1 hook)

AI-powered personalization.

- `useRecommendations()` - Get AI recommendations

## Using the Demo

### View the Interactive Page

Visit `/demo/hooks` to see the complete, interactive demo page.

Features:
- Responsive design (mobile, tablet, desktop)
- Syntax highlighting for code examples
- Dark/light mode support
- Copy-to-clipboard code blocks
- Smooth scrolling navigation
- SEO optimized

### Use the Interactive Component

Import and use the `HooksDemo` component in any page:

```tsx
import { HooksDemo } from '@/components/demo/HooksDemo';

export default function MyPage() {
  return (
    <div>
      <h1>Test the Hooks</h1>
      <HooksDemo client:load />
    </div>
  );
}
```

### Read the Guide

Visit `/demo/hooks-guide` for the complete written guide with:

- Detailed API documentation
- Parameter explanations
- Return type specifications
- Code examples for every scenario
- Best practices
- FAQ

## Key Features

### 100% Type Safe

All hooks are fully typed with TypeScript:

```typescript
const { things, loading, error } = useThings({
  type: 'course',
  status: 'published'
});

// types are inferred correctly:
// things: Thing[]
// loading: boolean
// error: unknown
```

### Backend Agnostic

Works with any backend provider:

```typescript
// Automatically uses configured provider
// Convex, WordPress, Notion, Stripe, etc.
const { groups } = useGroups();
```

### Fallback Support

Graceful degradation when backend unavailable:

```typescript
const isOnline = useIsProviderAvailable();

if (!isOnline) {
  return <OfflineMode />;
}

return <OnlineMode />;
```

### Real-time Capable

Subscribe to live updates:

```typescript
const { events, subscribe } = useEventStream();

useEffect(() => {
  subscribe();
}, [subscribe]);
```

### Error Handling

Built-in error states:

```typescript
const { things, error } = useThings();

if (error) {
  return <div>Error: {error.message}</div>;
}
```

## Integration Patterns

### In Astro Pages

```astro
---
// Fetch server-side data
import { getProvider } from '@/lib/ontology/factory';
const provider = await getProvider();
const groups = await provider.groups.list();
---

<Layout>
  <h1>Groups</h1>

  {/* Static content */}
  <div class="grid gap-4">
    {groups?.map(g => (
      <GroupCard group={g} />
    ))}
  </div>

  {/* Interactive island */}
  <GroupCreator client:load />
</Layout>
```

### In React Components

```tsx
import { useGroups } from '@/hooks/ontology';

export function GroupList() {
  const { groups, loading, error } = useGroups();

  if (loading) return <Skeleton />;
  if (error) return <Error />;

  return (
    <div>
      {groups?.map(g => (
        <GroupCard key={g._id} group={g} />
      ))}
    </div>
  );
}
```

## Performance Considerations

### Lazy Loading

The demo page uses Astro's islands architecture for optimal performance:

- Static HTML by default
- React components load only when needed
- Syntax highlighting runs at build time
- Minimal JavaScript bundle

### Caching

Hooks automatically cache results:

```typescript
// First call fetches
const { things: courses } = useThings();

// Subsequent calls use cache
const { things: courses2 } = useThings();
```

## Testing

The demo page is fully responsive and tested across:

- Desktop (1920x1080+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)
- Dark mode
- Light mode
- All browsers (Chrome, Firefox, Safari, Edge)

## Lighthouse Scores

Expected performance metrics:

- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Accessibility

The demo includes:

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Mobile touch targets

## Code Quality

All code follows:

- TypeScript strict mode
- ESLint rules
- Prettier formatting
- shadcn/ui best practices
- React 19 standards
- Astro conventions

## Next Steps

1. **View the Demo** - Visit `/demo/hooks`
2. **Read the Guide** - Check `/demo/hooks-guide`
3. **Explore Examples** - Click through the interactive demos
4. **Try it Out** - Copy examples to your components
5. **Learn More** - Read `/CLAUDE.md` for architecture details

## Files Included

```
web/src/
├── pages/
│   └── demo/
│       ├── hooks.astro           # Main demo page
│       └── hooks-guide.md        # Complete guide
├── components/
│   └── demo/
│       └── HooksDemo.tsx         # Interactive component
└── hooks/
    ├── ontology/
    │   ├── useProvider.ts        # 4 provider hooks
    │   ├── useGroup.ts           # 4 group hooks
    │   ├── usePerson.ts          # 5 people hooks
    │   ├── useThing.ts           # 7 thing hooks
    │   ├── useConnection.ts      # 9 connection hooks
    │   ├── useEvent.ts           # 9 event hooks
    │   ├── useSearch.ts          # 10 search/knowledge hooks
    │   └── index.ts              # Barrel export (all 43 hooks)
    └── index.ts                  # All hooks export
```

## FAQ

**Q: Where do I access the demo?**
A: Visit `/demo/hooks` in your browser.

**Q: Can I use these in production?**
A: Yes! These are production-ready, type-safe hooks.

**Q: What if my backend isn't available?**
A: Use `useIsProviderAvailable()` to check. The hooks degrade gracefully.

**Q: Do I need to install anything?**
A: No, all hooks are built-in.

**Q: Can I customize the demo?**
A: Yes, the demo files are in `/web/src/`. Feel free to modify.

**Q: How do I contribute improvements?**
A: Submit issues and PRs to the GitHub repository.

## Support

- GitHub Issues: Report bugs and feature requests
- Documentation: Read `/CLAUDE.md` and `/one/knowledge/`
- Community: Join the Discord server
- Email: support@one.ie

## License

All demo code is provided under the same license as the ONE Platform.

---

**Built with Astro 5, React 19, shadcn/ui, and the 6-dimension ontology.**

Last updated: October 25, 2024
