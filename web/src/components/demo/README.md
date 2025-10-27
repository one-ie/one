# Demo Components Library

Foundational shared components for all demo pages in the ONE Platform. These components showcase the 6-dimension ontology through interactive, beautifully designed UI.

## Overview

The demo components library provides a consistent, production-ready component system for creating dimension showcase pages (`/demo/groups`, `/demo/people`, `/demo/things`, etc.).

**Design Philosophy:**
- Static HTML by default
- Interactive only where needed
- Real backend integration
- Educational and engaging UX
- Fully accessible (WCAG 2.1 AA)
- Mobile-first responsive design

## Components

### 1. DemoContainer

Wrapper component providing context for demo pages with connection status monitoring.

```tsx
import { DemoContainer } from '@/components/demo';

export default function GroupsDemo() {
  return (
    <DemoContainer
      title="Groups Demo"
      description="Explore the Groups dimension"
      backendUrl="https://veracious-marlin-319.convex.cloud"
      showConnectionStatus={true}
    >
      {/* Page content */}
    </DemoContainer>
  );
}
```

**Features:**
- Sticky header with page title
- Backend connection status badge
- Latency indicator with color coding
- Real-time connection monitoring (30s interval)
- Refresh button for manual sync
- Error banner for disconnection
- Footer with demo context info
- Dark/light mode support

**Props:**
```typescript
interface DemoContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  backendUrl?: string;                    // Default: convex endpoint
  showConnectionStatus?: boolean;         // Default: true
  className?: string;
}
```

---

### 2. DemoHero

Hero section introducing a dimension with call-to-action.

```tsx
import { DemoHero } from '@/components/demo';
import { Users } from 'lucide-react';

<DemoHero
  title="Groups"
  description="Groups are hierarchical containers for collaboration. Organizations, teams, friend circles - all modeled as groups with infinite nesting."
  icon={Users}
  badges={[
    { label: 'Interactive', variant: 'success' },
    { label: 'Backend Connected', variant: 'success' },
    { label: 'Live Data', variant: 'success' },
  ]}
  ctaLabel="Explore Groups"
  onCtaClick={() => document.getElementById('playground').scrollIntoView()}
/>
```

**Features:**
- Large icon with gradient background
- Bold title and description
- Status badges with variants (success, warning, info, neutral)
- Call-to-action button
- Decorative background elements
- Responsive layout
- Fully accessible

**Props:**
```typescript
interface DemoHeroProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badges?: Array<{
    label: string;
    variant?: 'success' | 'warning' | 'info' | 'neutral';
  }>;
  ctaLabel?: string;                      // Default: "Try It Now"
  ctaHref?: string;                       // For <a> links
  onCtaClick?: () => void;                // For handlers
  className?: string;
}
```

---

### 3. DemoPlayground

Interactive playground for CRUD operations with dual view (form + data).

```tsx
import { DemoPlayground } from '@/components/demo';
import { useState } from 'react';

const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
const [isLoading, setIsLoading] = useState(false);
const [statusMessage, setStatusMessage] = useState(null);

<DemoPlayground
  title="Create & Manage Groups"
  formSection={<CreateGroupForm />}
  dataSection={<GroupsList />}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  isLoading={isLoading}
  isSyncing={false}
  statusMessage={statusMessage}
/>
```

**Features:**
- Two-column layout (form left, data right)
- Expandable form section with header toggle
- Data view with list/grid toggle buttons
- Real-time sync indicator
- Status message display (success, error, info)
- Loading state with skeleton placeholders
- Responsive breakpoint (stacks on mobile)
- Keyboard accessible

**Props:**
```typescript
interface DemoPlaygroundProps {
  title?: string;
  formSection: React.ReactNode;           // Create/edit form
  dataSection: React.ReactNode;           // List/grid display
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  isLoading?: boolean;
  isSyncing?: boolean;                    // Real-time sync indicator
  loadingSkeletonCount?: number;          // Default: 3
  statusMessage?: {
    type: 'success' | 'error' | 'info';
    text: string;
  } | null;
  className?: string;
}
```

---

### 4. DemoCodeBlock

Syntax-highlighted code examples with copy functionality.

```tsx
import { DemoCodeBlock } from '@/components/demo';

<DemoCodeBlock
  code={`const groups = useQuery(api.queries.groups.list, {
  orgId: currentOrg._id
});`}
  language="typescript"
  title="Fetch Groups in Real-Time"
  description="Subscribe to all groups in your organization"
  collapsible={true}
/>
```

**Features:**
- Syntax highlighting (TypeScript, JSON)
- Copy button with success feedback
- Line numbers
- Collapsible sections for long code
- Language indicator
- Code metadata (line count)
- Dark theme optimized
- Responsive with horizontal scroll

**Props:**
```typescript
interface DemoCodeBlockProps {
  code: string;
  language?: string;                      // Default: 'typescript'
  title?: string;
  description?: string;
  collapsible?: boolean;
  initiallyCollapsed?: boolean;           // Default: false
  className?: string;
}
```

**Supported Languages:**
- `typescript` / `ts` - TypeScript with keyword highlighting
- `json` - JSON with key/value coloring
- Plain text (no highlighting)

---

### 5. DemoStats

Live statistics with animated counters and trend indicators.

```tsx
import { DemoStats } from '@/components/demo';
import { Users, Activity, Link2 } from 'lucide-react';

const stats = [
  {
    id: 'groups',
    label: 'Total Groups',
    value: 42,
    previousValue: 38,
    icon: <Users className="w-4 h-4" />,
    variant: 'success',
  },
  {
    id: 'people',
    label: 'Active Users',
    value: 156,
    previousValue: 142,
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: 'connections',
    label: 'Relationships',
    value: 89,
    previousValue: 92,
    variant: 'warning',
  },
];

<DemoStats stats={stats} columns={4} animated={true} />
```

**Features:**
- Animated number counters (smooth easing)
- Trend indicators (up/down/neutral with percentage)
- Color variants (default, success, warning, danger)
- Loading skeleton states
- Responsive grid layout (1-4 columns)
- Optional icons per stat
- Decorative background elements
- Dark/light mode support
- Accessibility features

**Props:**
```typescript
interface StatItem {
  id: string;
  label: string;
  value: number;
  previousValue?: number;                 // For trend calculation
  unit?: string;                          // E.g., "%", "ms"
  icon?: React.ReactNode;
  isLoading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface DemoStatsProps {
  stats: StatItem[];
  columns?: number;                       // Grid columns (0 = auto)
  isLoading?: boolean;                    // Load all stats
  className?: string;
  animated?: boolean;                     // Default: true
}
```

---

## Common Patterns

### Pattern 1: Full Demo Page

```tsx
import {
  DemoContainer,
  DemoHero,
  DemoPlayground,
  DemoCodeBlock,
  DemoStats
} from '@/components/demo';
import { Users } from 'lucide-react';

export default function GroupsDemo() {
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(false);

  return (
    <DemoContainer
      title="Groups Dimension"
      description="Dimension 1 of the 6-dimension ontology"
    >
      <DemoHero
        title="Groups"
        description="Hierarchical containers for collaboration..."
        icon={Users}
        badges={[
          { label: 'Interactive', variant: 'success' },
          { label: 'Backend Connected', variant: 'success' },
        ]}
      />

      <DemoPlayground
        title="Create & Manage"
        formSection={<CreateGroupForm />}
        dataSection={<GroupsList groups={groups} />}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isLoading={loading}
      />

      <DemoCodeBlock
        code="const groups = useQuery(...)"
        language="typescript"
        title="Fetch Groups"
      />

      <DemoStats stats={stats} animated />
    </DemoContainer>
  );
}
```

### Pattern 2: Minimal Demo

```tsx
<DemoContainer title="Quick Demo">
  <DemoHero
    title="Feature"
    description="What this does"
    icon={Icon}
  />
  <DemoPlayground
    formSection={<Form />}
    dataSection={<DataDisplay />}
  />
</DemoContainer>
```

### Pattern 3: Code-Focused Demo

```tsx
<DemoContainer title="API Examples">
  <DemoHero title="API Reference" ... />
  <DemoCodeBlock code={example1} language="typescript" title="Query" />
  <DemoCodeBlock code={example2} language="json" title="Response" />
  <DemoCodeBlock code={example3} language="typescript" title="Mutation" />
</DemoContainer>
```

---

## Styling & Theming

### Dark Mode Support

All components automatically support dark mode via Tailwind's `dark:` utilities:

```tsx
// Components apply dark mode automatically
// No additional configuration needed
<DemoContainer>
  {/* All child components automatically support dark mode */}
</DemoContainer>
```

### Color Variables

Components use semantic color tokens:

```css
/* Defined in src/styles/global.css */
--color-background: 0 0% 100%;
--color-foreground: 222.2 84% 4.9%;
--color-primary: 222.2 47.4% 11.2%;
```

### Responsive Breakpoints

```
Mobile:    0px   (base)
sm:        640px
md:        768px
lg:        1024px
xl:        1280px
2xl:       1536px
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- Semantic HTML (`<button>`, `<form>`, etc.)
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader optimization
- Proper color contrast (4.5:1 for body text)
- Focus indicators on interactive elements
- Skip links where needed

### Keyboard Navigation

- `Tab` - Move through interactive elements
- `Shift+Tab` - Move backward
- `Enter` - Activate buttons/forms
- `Escape` - Close dialogs/collapsibles
- Arrow keys - Navigate lists/options

---

## Performance Optimization

### Code Splitting

Components are automatically code-split by the build system:

```tsx
// Each component imports only what it needs
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
```

### Lazy Loading

Large lists use virtualization:

```tsx
// Skeleton loading for initial state
<DemoPlayground isLoading={true} loadingSkeletonCount={3} />

// Real data renders after load
<DemoPlayground isLoading={false} dataSection={<RealData />} />
```

### Animation Performance

Animations use `requestAnimationFrame` for 60fps:

```tsx
// DemoStats AnimatedNumber uses RAF
<AnimatedNumber value={1000} duration={1000} animated={true} />
```

---

## Usage in Astro Pages

Demo components must use `client:load` when interactive:

```astro
---
// Astro SSR - static rendering
import { DemoContainer } from '@/components/demo';

// Fetch static data at build time
const initialData = await fetchGroupsData();
---

<DemoContainer title="Groups">
  {/* Static content - no JavaScript needed */}
  <h2>Static Content</h2>

  {/* Interactive components - need client:load */}
  <DemoPlayground
    client:load
    formSection={<CreateGroupForm />}
    dataSection={<GroupsList groups={initialData} />}
  />
</DemoContainer>
```

---

## Real-Time Data Integration

### Using Convex Hooks

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { DemoPlayground } from '@/components/demo';

export function GroupsPlayground() {
  const groups = useQuery(api.queries.groups.list);
  const createGroup = useMutation(api.mutations.groups.create);

  return (
    <DemoPlayground
      isLoading={groups === undefined}
      dataSection={<GroupsList groups={groups || []} />}
      formSection={<CreateGroupForm onCreate={createGroup} />}
    />
  );
}
```

### Connection Status

```tsx
import { DemoContainer } from '@/components/demo';

<DemoContainer
  backendUrl="https://your-backend.convex.cloud"
  showConnectionStatus={true}
>
  {/* Auto-monitors connection every 30 seconds */}
</DemoContainer>
```

---

## Testing

### Unit Testing with Vitest

```typescript
import { render, screen } from '@testing-library/react';
import { DemoHero } from '@/components/demo';
import { Users } from 'lucide-react';

describe('DemoHero', () => {
  it('renders title and description', () => {
    render(
      <DemoHero
        title="Groups"
        description="Hierarchical containers"
        icon={Users}
      />
    );

    expect(screen.getByText('Groups')).toBeInTheDocument();
    expect(screen.getByText('Hierarchical containers')).toBeInTheDocument();
  });

  it('displays badges', () => {
    render(
      <DemoHero
        title="Groups"
        description="Test"
        icon={Users}
        badges={[{ label: 'Interactive', variant: 'success' }]}
      />
    );

    expect(screen.getByText('Interactive')).toBeInTheDocument();
  });
});
```

---

## Migration Guide

### From Old Demo Components

Old demo pages used hardcoded HTML and local state. New components provide:

```tsx
// Before: Hardcoded lists
<div>
  {mockData.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</div>

// After: Composable components
<DemoPlayground
  formSection={<CreateForm />}
  dataSection={<ItemsList />}
/>
```

---

## Future Enhancements

Planned components for Phase 2:

- `DemoRelationshipGraph.tsx` - D3 force-directed graphs
- `DemoForm.tsx` - CRUD forms with validation
- `DemoList.tsx` - Virtualized list component
- `DemoDetail.tsx` - Detail view modal
- `DemoToast.tsx` - Toast notifications

---

## Contributing

When adding new demo components:

1. Follow the established pattern (props interface, JSDoc, examples)
2. Support both light and dark modes
3. Make responsive (mobile-first)
4. Add proper TypeScript types
5. Include JSDoc with `@example`
6. Test with keyboard navigation
7. Add to this README

---

## License

These components are part of the ONE Platform and are MIT licensed.
