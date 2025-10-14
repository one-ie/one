# Card Component (shadcn/ui)

> **⚠️ DEPRECATED:** This document has been superseded by a cleaner approach. Please use:
> - `one/things/components/card.md` - Card implementation (uses shadcn/ui naturally)
> - `one/things/features/ontology-ui.md` - Clean UI metadata specification
> - `one/things/plans/ontology-ui-approach.md` - Philosophy explanation
>
> **Why the change?** The new approach integrates shadcn/ui naturally into card.md without separate documentation, resulting in cleaner, simpler docs with no redundancy.

**Generic card component using shadcn/ui that renders ANY thing type from the ontology**

---

## Quick Start

```bash
# Install shadcn/ui components
npx shadcn-ui@latest add card button badge avatar separator
```

```tsx
import { ThingCard } from '@/components/generic/ThingCard'

// Works for ALL 66 types!
<ThingCard thing={course} />
<ThingCard thing={product} />
<ThingCard thing={post} />
```

---

## Full Implementation

### ThingCard Component

```tsx
// frontend/src/components/generic/ThingCard.tsx
import { type Thing } from '@one-platform/core'
import { useThingConfig } from '@/ontology/hooks/useThingConfig'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field } from './Field'
import { Actions } from './Actions'
import { ConnectionBadges } from './ConnectionBadges'
import { cn } from '@/lib/utils'

interface ThingCardProps {
  thing: Thing
  view?: 'card' | 'list' | 'detail'
  onClick?: (thing: Thing) => void
  showActions?: boolean
  showConnections?: boolean
  className?: string
}

export function ThingCard({
  thing,
  view = 'card',
  onClick,
  showActions = true,
  showConnections = true,
  className
}: ThingCardProps) {
  // Get UI config from ontology
  const config = useThingConfig(thing.type)
  const viewConfig = config.ui.views[view]

  if (!viewConfig) {
    console.warn(`View "${view}" not defined for type "${thing.type}"`)
    return null
  }

  // Get fields to display
  const fields = viewConfig.fields === '*'
    ? Object.keys(config.properties)
    : viewConfig.fields

  // Separate header fields (first 2) from body fields
  const headerFields = fields.slice(0, 2)
  const bodyFields = fields.slice(2)

  // Check if card should be clickable
  const isClickable = onClick || config.ui.actions.primary

  return (
    <Card
      className={cn(
        isClickable && 'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={() => {
        if (onClick) {
          onClick(thing)
        } else if (config.ui.actions.primary && !showActions) {
          // Execute primary action if actions are hidden
          handlePrimaryAction(thing, config.ui.actions.primary.action)
        }
      }}
    >
      {/* Header: Typically thumbnail + title */}
      <CardHeader className="space-y-0 pb-3">
        {headerFields.map(fieldName => {
          const fieldConfig = config.ui.fields[fieldName]
          if (fieldConfig?.hidden) return null

          return (
            <Field
              key={fieldName}
              name={fieldName}
              value={thing.properties[fieldName]}
              config={fieldConfig}
              thing={thing}
            />
          )
        })}
      </CardHeader>

      {/* Body: Description, price, badges, etc. */}
      {bodyFields.length > 0 && (
        <CardContent className="space-y-2 pb-3">
          {bodyFields.map(fieldName => {
            const fieldConfig = config.ui.fields[fieldName]

            // Skip hidden fields
            if (fieldConfig?.hidden) return null

            // Skip showOnlyIf fields that are false
            if (fieldConfig?.showOnlyIf && !thing.properties[fieldName]) {
              return null
            }

            return (
              <Field
                key={fieldName}
                name={fieldName}
                value={thing.properties[fieldName]}
                config={fieldConfig}
                thing={thing}
              />
            )
          })}
        </CardContent>
      )}

      {/* Connection badges */}
      {showConnections && config.ui.connections && (
        <>
          <Separator className="mb-3" />
          <CardContent className="pt-0 pb-3">
            <ConnectionBadges
              thing={thing}
              config={config.ui.connections}
            />
          </CardContent>
        </>
      )}

      {/* Actions footer */}
      {showActions && (config.ui.actions.primary || config.ui.actions.secondary) && (
        <>
          <Separator />
          <CardFooter className="pt-3">
            <Actions
              thing={thing}
              primary={config.ui.actions.primary}
              secondary={config.ui.actions.secondary}
              context={config.ui.actions.context}
            />
          </CardFooter>
        </>
      )}
    </Card>
  )
}

// Helper function to handle primary action
function handlePrimaryAction(thing: Thing, action: string) {
  // Route to appropriate handler
  switch (action) {
    case 'enroll':
    case 'purchase':
    case 'addToCart':
      // Navigate to action page
      window.location.href = `/${action}/${thing._id}`
      break
    case 'preview':
    case 'read':
    case 'viewProfile':
      // Navigate to detail page
      window.location.href = `/${thing.type}/${thing._id}`
      break
    default:
      console.warn(`Unhandled action: ${action}`)
  }
}
```

---

## Variants

### Compact Card

```tsx
// frontend/src/components/generic/ThingCard.Compact.tsx
export function ThingCardCompact({ thing }: { thing: Thing }) {
  const config = useThingConfig(thing.type)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        {/* Thumbnail */}
        <Field
          name="thumbnail"
          value={thing.properties.thumbnail}
          config={config.ui.fields.thumbnail}
          thing={thing}
        />

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base truncate">
            {thing.name}
          </CardTitle>
          <CardDescription className="text-sm truncate">
            {thing.properties.description}
          </CardDescription>
        </div>

        {/* Price */}
        {thing.properties.price !== undefined && (
          <Field
            name="price"
            value={thing.properties.price}
            config={config.ui.fields.price}
            thing={thing}
          />
        )}
      </CardContent>
    </Card>
  )
}
```

### Horizontal Card

```tsx
// frontend/src/components/generic/ThingCard.Horizontal.tsx
export function ThingCardHorizontal({ thing }: { thing: Thing }) {
  const config = useThingConfig(thing.type)
  const listView = config.ui.views.list

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex">
        {/* Left: Image */}
        <div className="w-48 flex-shrink-0">
          <Field
            name={listView.fields[0]}
            value={thing.properties[listView.fields[0]]}
            config={config.ui.fields[listView.fields[0]]}
            thing={thing}
          />
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-6">
          <div className="space-y-3">
            {listView.fields.slice(1).map(fieldName => (
              <Field
                key={fieldName}
                name={fieldName}
                value={thing.properties[fieldName]}
                config={config.ui.fields[fieldName]}
                thing={thing}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4">
            <Actions
              thing={thing}
              primary={config.ui.actions.primary}
              secondary={config.ui.actions.secondary}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
```

### Featured Card

```tsx
// frontend/src/components/generic/ThingCard.Featured.tsx
export function ThingCardFeatured({ thing }: { thing: Thing }) {
  const config = useThingConfig(thing.type)

  return (
    <Card className="border-primary shadow-lg">
      <CardHeader className="relative">
        {/* Featured badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="default" className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Featured
          </Badge>
        </div>

        {/* Large thumbnail */}
        <Field
          name="thumbnail"
          value={thing.properties.thumbnail}
          config={{
            ...config.ui.fields.thumbnail,
            aspect: 'wide'
          }}
          thing={thing}
        />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Title */}
        <CardTitle className="text-2xl">{thing.name}</CardTitle>

        {/* Description */}
        <CardDescription className="text-base">
          {thing.properties.description}
        </CardDescription>

        {/* Additional fields */}
        <div className="flex items-center gap-4">
          <Field
            name="price"
            value={thing.properties.price}
            config={config.ui.fields.price}
            thing={thing}
          />
          <Field
            name="level"
            value={thing.properties.level}
            config={config.ui.fields.level}
            thing={thing}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Actions
          thing={thing}
          primary={config.ui.actions.primary}
          secondary={config.ui.actions.secondary}
        />
      </CardFooter>
    </Card>
  )
}
```

---

## Grid Layouts

### Basic Grid

```tsx
// frontend/src/components/generic/ThingGrid.tsx
import { ThingCard } from './ThingCard'

interface ThingGridProps {
  things: Thing[]
  columns?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

export function ThingGrid({
  things,
  columns = 3,
  gap = 'md'
}: ThingGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8'
  }

  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap])}>
      {things.map(thing => (
        <ThingCard key={thing._id} thing={thing} />
      ))}
    </div>
  )
}
```

### Masonry Grid

```tsx
// frontend/src/components/generic/ThingMasonry.tsx
import { ThingCard } from './ThingCard'

export function ThingMasonry({ things }: { things: Thing[] }) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
      {things.map(thing => (
        <div key={thing._id} className="break-inside-avoid mb-6">
          <ThingCard thing={thing} />
        </div>
      ))}
    </div>
  )
}
```

---

## List Layouts

### Simple List

```tsx
// frontend/src/components/generic/ThingList.tsx
import { ThingCard } from './ThingCard'
import { Separator } from '@/components/ui/separator'

export function ThingList({ things }: { things: Thing[] }) {
  return (
    <div className="space-y-4">
      {things.map((thing, index) => (
        <div key={thing._id}>
          <ThingCard thing={thing} view="list" />
          {index < things.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
```

### Grouped List

```tsx
// frontend/src/components/generic/ThingListGrouped.tsx
import { ThingCard } from './ThingCard'
import { Separator } from '@/components/ui/separator'

interface ThingListGroupedProps {
  things: Thing[]
  groupBy: string  // e.g., 'category', 'level'
}

export function ThingListGrouped({ things, groupBy }: ThingListGroupedProps) {
  // Group things
  const grouped = things.reduce((acc, thing) => {
    const key = thing.properties[groupBy] || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(thing)
    return acc
  }, {} as Record<string, Thing[]>)

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group}>
          <h3 className="text-xl font-semibold mb-4">{group}</h3>
          <div className="space-y-4">
            {items.map((thing, index) => (
              <div key={thing._id}>
                <ThingCard thing={thing} view="list" />
                {index < items.length - 1 && <Separator className="my-4" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## Interactive Features

### With Selection

```tsx
// frontend/src/components/generic/ThingCardSelectable.tsx
import { Checkbox } from '@/components/ui/checkbox'

interface ThingCardSelectableProps {
  thing: Thing
  selected: boolean
  onSelectedChange: (selected: boolean) => void
}

export function ThingCardSelectable({
  thing,
  selected,
  onSelectedChange
}: ThingCardSelectableProps) {
  return (
    <Card className={cn(selected && 'ring-2 ring-primary')}>
      <div className="absolute top-4 right-4 z-10">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelectedChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <ThingCard thing={thing} showActions={false} />
    </Card>
  )
}
```

### With Drag & Drop

```tsx
// frontend/src/components/generic/ThingCardDraggable.tsx
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

export function ThingCardDraggable({ thing }: { thing: Thing }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: thing._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card>
        <div className="flex items-start gap-2 p-4">
          {/* Drag handle */}
          <button
            className="cursor-grab active:cursor-grabbing mt-2"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Card content */}
          <div className="flex-1">
            <ThingCard thing={thing} showActions={false} />
          </div>
        </div>
      </Card>
    </div>
  )
}
```

---

## Loading States

### Skeleton Card

```tsx
// frontend/src/components/generic/ThingCard.Skeleton.tsx
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ThingCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 pb-3">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
```

### Usage with Loading

```tsx
export function ThingsPage() {
  const { things, loading } = useThings()

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ThingCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <ThingGrid things={things} />
  )
}
```

---

## Error States

```tsx
// frontend/src/components/generic/ThingCard.Error.tsx
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ThingCardErrorProps {
  error: Error
  onRetry?: () => void
}

export function ThingCardError({ error, onRetry }: ThingCardErrorProps) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-sm text-muted-foreground text-center mb-4">
          {error.message}
        </p>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## Real-World Examples

### E-commerce Product Grid

```tsx
// frontend/src/pages/products.tsx
import { ThingGrid } from '@/components/generic/ThingGrid'
import { ThingCardSkeleton } from '@/components/generic/ThingCard.Skeleton'
import { EmptyState } from '@/components/generic/EmptyState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'

export function ProductsPage() {
  const { products, loading, error } = useProducts()
  const config = useThingConfig('product')

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ThingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <ThingCardError error={error} />
  }

  if (products.length === 0) {
    return <EmptyState config={config.ui.empty} />
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search products..."
            className="w-64"
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <ThingGrid things={products} columns={4} />
    </div>
  )
}
```

### Course Catalog with Filters

```tsx
// frontend/src/pages/courses.tsx
import { ThingGrid } from '@/components/generic/ThingGrid'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function CoursesPage() {
  const { courses } = useCourses()
  const [level, setLevel] = useState('all')

  const filtered = level === 'all'
    ? courses
    : courses.filter(c => c.properties.level === level)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-muted-foreground mb-8">
        Browse our collection of courses
      </p>

      {/* Level filter */}
      <Tabs value={level} onValueChange={setLevel} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Levels</TabsTrigger>
          <TabsTrigger value="beginner">Beginner</TabsTrigger>
          <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Course grid */}
      <ThingGrid things={filtered} columns={3} />
    </div>
  )
}
```

### Blog with Featured Posts

```tsx
// frontend/src/pages/blog.tsx
import { ThingCard } from '@/components/generic/ThingCard'
import { ThingCardFeatured } from '@/components/generic/ThingCard.Featured'
import { ThingList } from '@/components/generic/ThingList'

export function BlogPage() {
  const { posts } = usePosts()

  const featured = posts.filter(p => p.properties.featured)
  const regular = posts.filter(p => !p.properties.featured)

  return (
    <div className="container mx-auto py-8">
      {/* Featured posts */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured</h2>
          <div className="grid grid-cols-2 gap-8">
            {featured.map(post => (
              <ThingCardFeatured key={post._id} thing={post} />
            ))}
          </div>
        </section>
      )}

      {/* Recent posts */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Posts</h2>
        <ThingList things={regular} />
      </section>
    </div>
  )
}
```

---

## Performance Tips

### Virtualized Grid

```tsx
// For large lists, use virtualization
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualizedThingGrid({ things }: { things: Thing[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(things.length / 3),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
    overscan: 5
  })

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * 3
          const rowThings = things.slice(startIndex, startIndex + 3)

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className="grid grid-cols-3 gap-6 p-6">
                {rowThings.map(thing => (
                  <ThingCard key={thing._id} thing={thing} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

### Memoization

```tsx
import { memo } from 'react'

export const ThingCard = memo(function ThingCard({ thing }: ThingCardProps) {
  // ... implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.thing._id === nextProps.thing._id &&
         prevProps.thing.updatedAt === nextProps.thing.updatedAt
})
```

---

## Testing

```tsx
// frontend/src/components/generic/__tests__/ThingCard.test.tsx
import { render, screen } from '@testing-library/react'
import { ThingCard } from '../ThingCard'

describe('ThingCard', () => {
  it('renders course card correctly', () => {
    const course = {
      _id: '1',
      type: 'course',
      name: 'Test Course',
      properties: {
        title: 'Test Course',
        description: 'A test course',
        price: 99,
        level: 'beginner'
      }
    }

    render(<ThingCard thing={course} />)

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('A test course')).toBeInTheDocument()
    expect(screen.getByText('$99')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    const thing = { /* ... */ }

    render(<ThingCard thing={thing} onClick={onClick} />)

    fireEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledWith(thing)
  })
})
```

---

**With shadcn/ui, ThingCard provides beautiful, accessible UI for all 66 thing types automatically.**
