# Demo Components Quick Start

## 30-Second Overview

Five foundational components for building demo pages:

| Component | Purpose | Use When |
|-----------|---------|----------|
| `DemoContainer` | Page wrapper | Starting any demo page |
| `DemoHero` | Hero section | Introducing a dimension |
| `DemoPlayground` | Interactive area | Showing CRUD operations |
| `DemoCodeBlock` | Code examples | Displaying API code |
| `DemoStats` | Statistics | Showing metrics/counts |

## Get Started in 5 Minutes

### 1. Import Components

```tsx
import {
  DemoContainer,
  DemoHero,
  DemoPlayground,
  DemoCodeBlock,
  DemoStats,
} from '@/components/demo';
```

### 2. Create Demo Page

```tsx
import { Groups } from 'lucide-react';

export default function GroupsDemo() {
  return (
    <DemoContainer title="Groups" description="Dimension 1">
      <DemoHero
        title="Groups"
        description="Hierarchical containers for collaboration"
        icon={Groups}
        badges={[{ label: 'Interactive', variant: 'success' }]}
      />

      <DemoPlayground
        formSection={<CreateGroupForm />}
        dataSection={<GroupsList />}
      />

      <DemoCodeBlock
        code="const groups = useQuery(api.queries.groups.list)"
        language="typescript"
        title="Fetch Groups"
      />

      <DemoStats stats={statistics} animated />
    </DemoContainer>
  );
}
```

### 3. Use in Astro Page

```astro
---
import GroupsDemo from '@/components/demo/GroupsDemo';
---

<GroupsDemo client:load />
```

## Common Tasks

### Show Loading State

```tsx
<DemoPlayground
  isLoading={true}
  loadingSkeletonCount={3}
  dataSection={<div />}
  formSection={<div />}
/>
```

### Display Status Message

```tsx
<DemoPlayground
  statusMessage={{
    type: 'success',
    text: 'Group created successfully!'
  }}
  dataSection={...}
  formSection={...}
/>
```

### Toggle View Mode

```tsx
const [view, setView] = useState('list');

<DemoPlayground
  viewMode={view}
  onViewModeChange={setView}
  dataSection={...}
  formSection={...}
/>
```

### Add Status Badges

```tsx
<DemoHero
  title="Groups"
  description="..."
  icon={Groups}
  badges={[
    { label: 'Interactive', variant: 'success' },
    { label: 'Connected', variant: 'success' },
    { label: 'Live Data', variant: 'info' },
  ]}
/>
```

### Create Animated Stats

```tsx
<DemoStats
  stats={[
    {
      id: 'count',
      label: 'Total Groups',
      value: 42,
      previousValue: 38,
      variant: 'success',
      icon: <Users className="w-4 h-4" />,
    },
  ]}
  animated={true}
/>
```

### Syntax Highlight Code

```tsx
<DemoCodeBlock
  code={`const result = await mutation({
  name: "New Group"
});`}
  language="typescript"
  title="Create a Group"
  description="Send mutation to backend"
  collapsible={true}
/>
```

## TypeScript Props Cheat Sheet

### DemoContainer
```typescript
{
  title: string;
  description?: string;
  backendUrl?: string;
  showConnectionStatus?: boolean;
  className?: string;
}
```

### DemoHero
```typescript
{
  title: string;
  description: string;
  icon: LucideIcon;
  badges?: { label: string; variant?: 'success' | 'warning' | 'info' | 'neutral' }[];
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
}
```

### DemoPlayground
```typescript
{
  title?: string;
  formSection: React.ReactNode;
  dataSection: React.ReactNode;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  isLoading?: boolean;
  isSyncing?: boolean;
  loadingSkeletonCount?: number;
  statusMessage?: { type: 'success' | 'error' | 'info'; text: string } | null;
  className?: string;
}
```

### DemoCodeBlock
```typescript
{
  code: string;
  language?: 'typescript' | 'json' | string;
  title?: string;
  description?: string;
  collapsible?: boolean;
  initiallyCollapsed?: boolean;
  className?: string;
}
```

### DemoStats
```typescript
{
  stats: {
    id: string;
    label: string;
    value: number;
    previousValue?: number;
    unit?: string;
    icon?: React.ReactNode;
    isLoading?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'danger';
  }[];
  columns?: number;
  isLoading?: boolean;
  className?: string;
  animated?: boolean;
}
```

## Icon Choices

Use `lucide-react` icons:

```tsx
import {
  Users,        // For people/groups
  Building2,    // For organizations
  Link2,        // For connections
  Activity,     // For events
  Search,       // For knowledge/search
  Package,      // For things/entities
  TrendingUp,   // For metrics
  Zap,          // For power/energy
  Lock,         // For security/roles
  Globe,        // For networks
} from 'lucide-react';
```

## Color Variants

### Badge Variants
- `success` - Green (✓ working, ✓ complete)
- `warning` - Yellow (! caution, ! alert)
- `info` - Blue (ℹ information)
- `neutral` - Gray (no special status)

### Stat Variants
- `success` - Green (good metric)
- `warning` - Yellow (declining)
- `danger` - Red (critical)
- `default` - Blue (neutral)

## Real-Time Integration

### With Convex

```tsx
import { useQuery, useMutation } from 'convex/react';
import { DemoPlayground } from '@/components/demo';

export function GroupsDemo() {
  const groups = useQuery(api.queries.groups.list);
  const createGroup = useMutation(api.mutations.groups.create);

  return (
    <DemoPlayground
      isLoading={groups === undefined}
      formSection={<Form onSubmit={createGroup} />}
      dataSection={<List items={groups || []} />}
    />
  );
}
```

## Testing Locally

```bash
# Type check
bunx astro check

# Run dev server
bun run dev

# Test components
bun test src/components/demo
```

## Troubleshooting

### Components not showing?
- Make sure to add `client:load` in Astro pages
- Check that props are valid TypeScript

### Styling issues?
- Components use Tailwind v4 CSS variables
- No manual color overrides needed
- Dark mode works automatically

### Connection status always "connecting"?
- Check `backendUrl` matches your Convex deployment
- Verify backend is responding to HEAD requests

### Stats not animating?
- Set `animated={true}` on `DemoStats`
- Check that `value` prop is a valid number

## Next Steps

1. Read full documentation: `/src/components/demo/README.md`
2. Check existing demos: `/src/pages/demo/*`
3. Copy patterns from reference implementation: `/src/components/demo/PeopleDemo.tsx`
4. Build your first dimension demo!

## Files Created

All new components in: `/src/components/demo/`

- ✅ `DemoContainer.tsx` - Page wrapper (438 lines)
- ✅ `DemoHero.tsx` - Hero section (148 lines)
- ✅ `DemoPlayground.tsx` - Interactive area (228 lines)
- ✅ `DemoCodeBlock.tsx` - Code examples (197 lines)
- ✅ `DemoStats.tsx` - Statistics (329 lines)
- ✅ `index.ts` - Barrel export
- ✅ `README.md` - Full documentation
- ✅ `QUICKSTART.md` - This guide

**Total: 1,340 lines of production-ready code**

---

## Questions?

- Check `README.md` for detailed documentation
- Look at `/src/components/demo/PeopleDemo.tsx` for reference
- Search codebase for similar patterns
- Ask in #development channel

Good luck building amazing demos!
