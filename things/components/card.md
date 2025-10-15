# Card Component

**Generic card component that renders ANY thing type from the ontology**

---

## Overview

`Card` is a universal component that:
- ✅ Works with all 66 thing types
- ✅ Reads rendering instructions from ontology UI spec
- ✅ Eliminates need for type-specific components
- ✅ Consistent UI across platform (built on shadcn/ui)
- ✅ Customizable per organization

**Before (66 components):**
```tsx
<CourseCard course={course} />
<ProductCard product={product} />
<PostCard post={post} />
// ... 63 more type-specific components 😱
```

**After (1 component):**
```tsx
<Card thing={course} />
<Card thing={product} />
<Card thing={post} />
// Works for ALL types! 🎉
```

---

## Architecture

```
┌─────────────────────────────────────────┐
│   Card (Generic Component)              │
│                                          │
│   1. Receives: thing (any type)         │
│   2. Reads: ontology UI config           │
│   3. Renders: fields + actions           │
│   4. Handles: user interactions          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Field (Generic Field Renderer)        │
│                                          │
│   - Heading, Text, Price, Image, etc.   │
│   - Reads field config from ontology    │
│   - Renders appropriate component        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Actions (Generic Action Handler)      │
│                                          │
│   - Reads actions from ontology          │
│   - Renders buttons/links                │
│   - Handles clicks → services            │
└─────────────────────────────────────────┘
```

---

## Implementation

### Core Component

```tsx
// frontend/src/components/generic/Card.tsx
import { type Thing } from '@oneie/core'
import { useThingConfig } from '@/ontology/hooks'
import { Card as ShadCard, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Field } from './Field'
import { Actions } from './Actions'
import { ConnectionBadges } from './ConnectionBadges'

interface CardProps {
  thing: Thing
  view?: 'card' | 'list' | 'detail'
  onClick?: (thing: Thing) => void
  showActions?: boolean
  showConnections?: boolean
  className?: string
}

export function Card({
  thing,
  view = 'card',
  onClick,
  showActions = true,
  showConnections = true,
  className
}: CardProps) {
  // Get UI config from ontology
  const config = useThingConfig(thing.type)

  // Get view configuration
  const viewConfig = config.ui.views[view]
  if (!viewConfig) {
    console.warn(`View "${view}" not defined for type "${thing.type}"`)
    return null
  }

  // Get fields to display
  const fields = viewConfig.fields === '*'
    ? Object.keys(config.properties)
    : viewConfig.fields

  // Handle click
  const handleClick = () => {
    if (onClick) {
      onClick(thing)
    } else if (config.ui.actions.primary) {
      // Execute primary action by default
      handleAction(config.ui.actions.primary.action, thing)
    }
  }

  return (
    <ShadCard
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        className
      )}
      onClick={handleClick}
    >
      {/* Header: Typically thumbnail + title */}
      <CardHeader>
        {fields.slice(0, 2).map(fieldName => {
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
      <CardContent className="space-y-3">
        {fields.slice(2).map(fieldName => {
          const fieldConfig = config.ui.fields[fieldName]
          if (fieldConfig?.hidden) return null
          if (fieldConfig?.showOnlyIf && !thing.properties[fieldName]) return null

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

      {/* Connection badges */}
      {showConnections && config.ui.connections && (
        <>
          <Separator />
          <CardContent className="pt-3">
            <ConnectionBadges
              thing={thing}
              config={config.ui.connections}
            />
          </CardContent>
        </>
      )}

      {/* Actions */}
      {showActions && (
        <>
          <Separator />
          <CardFooter className="pt-3">
            <Actions
              thing={thing}
              primary={config.ui.actions.primary}
              secondary={config.ui.actions.secondary}
            />
          </CardFooter>
        </>
      )}
    </ShadCard>
  )
}
```

---

### Field Component

```tsx
// frontend/src/components/generic/Field.tsx
import { type FieldUI } from '@/ontology/types'
import { type Thing } from '@oneie/core'

// shadcn/ui components
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

// Custom field components
import { Heading } from '@/components/fields/Heading'
import { Text } from '@/components/fields/Text'
import { Price } from '@/components/fields/Price'
import { Image } from '@/components/fields/Image'
import { TagList } from '@/components/fields/TagList'
import { DateField } from '@/components/fields/DateField'

interface FieldProps {
  name: string
  value: any
  config: FieldUI
  thing: Thing
}

export function Field({ name, value, config, thing }: FieldProps) {
  // Handle null/undefined values
  if (value === null || value === undefined) {
    return null
  }

  // Apply formatting function if provided
  const formattedValue = config.format
    ? config.format(value, thing)
    : value

  // Render appropriate component based on config.component
  switch (config.component) {
    case 'Heading':
      return (
        <Heading
          size={config.size}
          weight={config.weight}
          truncate={config.truncate}
        >
          {formattedValue}
        </Heading>
      )

    case 'Text':
      return (
        <Text
          size={config.size}
          color={config.color}
          lines={config.lines}
          icon={config.icon}
          italic={config.italic}
          weight={config.weight}
          expandable={config.expandable}
        >
          {formattedValue}
        </Text>
      )

    case 'Price':
      return (
        <Price
          value={formattedValue}
          currency={config.currency}
          format={config.format}
          badge={config.badge}
          size={config.size}
          strikethrough={config.strikethrough}
          free={config.free}
        />
      )

    case 'Image':
      return (
        <Image
          src={formattedValue}
          alt={thing.name}
          aspect={config.aspect}
          lazy={config.lazy}
          placeholder={config.placeholder}
          fallback={config.fallback}
          sizes={config.sizes}
        />
      )

    case 'Badge':
      const badgeLabel = config.labels?.[value] || config.label || value

      return (
        <Badge variant="secondary">
          {badgeLabel}
        </Badge>
      )

    case 'TagList':
      return (
        <TagList
          tags={formattedValue}
          max={config.max}
          color={config.color}
          moreLabel={config.moreLabel}
        />
      )

    case 'Date':
      return (
        <Date
          value={formattedValue}
          format={config.format}  // 'relative' | 'full' | 'short'
          icon={config.icon}
        />
      )

    case 'Markdown':
      return (
        <Markdown
          content={formattedValue}
          className={config.className}
          lines={config.lines}
          expandable={config.expandable}
        />
      )

    case 'Avatar':
      return (
        <Avatar>
          <AvatarImage src={formattedValue} alt={thing.name} />
          <AvatarFallback>
            {config.fallback === 'initials'
              ? thing.name.split(' ').map(n => n[0]).join('').toUpperCase()
              : config.fallback}
          </AvatarFallback>
        </Avatar>
      )

    case 'Link':
      return (
        <Link
          href={formattedValue}
          icon={config.icon}
          external={config.external}
          size={config.size}
        >
          {config.label || formattedValue}
        </Link>
      )

    case 'ImageGallery':
      return (
        <ImageGallery
          images={formattedValue}
          aspect={config.aspect}
          lazy={config.lazy}
          zoom={config.zoom}
          thumbnails={config.thumbnails}
        />
      )

    case 'Video':
      return (
        <Video
          src={formattedValue}
          controls={config.controls}
          autoplay={config.autoplay}
          muted={config.muted}
        />
      )

    case 'SocialLinks':
      return (
        <SocialLinks
          links={formattedValue}
          display={config.display}
          size={config.size}
          platforms={config.platforms}
        />
      )

    case 'Checkbox':
      return (
        <Checkbox
          checked={formattedValue}
          label={config.label}
          checkedIcon={config.checkedIcon}
          uncheckedIcon={config.uncheckedIcon}
          onChange={(checked) => {
            // Update thing property
            updateThing(thing._id, { [name]: checked })
          }}
        />
      )

    // Add more component types as needed
    default:
      console.warn(`Unknown field component: ${config.component}`)
      return <Text>{String(formattedValue)}</Text>
  }
}
```

---

### Actions Component

```tsx
// frontend/src/components/generic/Actions.tsx
import { type Thing } from '@oneie/core'
import { type ActionConfig } from '@/ontology/types'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'

interface ActionsProps {
  thing: Thing
  primary?: ActionConfig
  secondary?: ActionConfig[]
}

export function Actions({ thing, primary, secondary }: ActionsProps) {
  const { executeAction, loading } = useAction()

  const handleAction = async (action: string) => {
    await executeAction(action, thing)
  }

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Primary action */}
      {primary && (
        <Button
          variant={primary.variant === 'danger' ? 'destructive' : 'default'}
          onClick={() => handleAction(primary.action)}
          disabled={loading}
          className="flex-1"
        >
          {loading ? 'Loading...' : primary.label}
        </Button>
      )}

      {/* Secondary actions */}
      {secondary?.map(action => (
        <Button
          key={action.action}
          variant={action.variant === 'ghost' ? 'outline' : 'secondary'}
          onClick={() => handleAction(action.action)}
          disabled={loading}
        >
          {action.label}
        </Button>
      ))}
    </div>
  )
}
```

---

### Connection Badges Component

```tsx
// frontend/src/components/generic/ConnectionBadges.tsx
import { type Thing } from '@oneie/core'
import { type ConnectionUI } from '@/ontology/types'
import { useConnections } from '@/hooks/useConnections'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

interface ConnectionBadgesProps {
  thing: Thing
  config: Record<string, ConnectionUI>
}

export function ConnectionBadges({ thing, config }: ConnectionBadgesProps) {
  const connections = useConnections(thing._id)

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {Object.entries(config).map(([type, connectionConfig]) => {
        // Get connections of this type
        const items = connections.filter(c => c.relationshipType === type)

        if (items.length === 0) return null

        // Format label with count or name
        const label = connectionConfig.label
          .replace('{count}', items.length.toString())
          .replace('{name}', items[0]?.name || '')

        // Render based on display type
        switch (connectionConfig.display) {
          case 'badge':
            return (
              <Badge
                key={type}
                icon={connectionConfig.icon}
                link={connectionConfig.link ? `/connections/${type}` : undefined}
              >
                {label}
              </Badge>
            )

          case 'avatar':
            return (
              <div key={type} className="flex items-center gap-2">
                <Avatar
                  src={items[0]?.properties?.avatar}
                  name={items[0]?.name}
                  size="sm"
                />
                <span className="text-sm text-muted">
                  {label}
                </span>
              </div>
            )

          case 'inline':
            return (
              <span key={type} className="text-sm text-muted">
                {connectionConfig.icon && <Icon name={connectionConfig.icon} />}
                {label}
              </span>
            )

          case 'list':
            return (
              <div key={type} className="space-y-1">
                {items.slice(0, connectionConfig.max || 5).map(item => (
                  <Badge key={item._id}>
                    {item.name}
                  </Badge>
                ))}
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
```

---

## Hook: useThingConfig

```tsx
// frontend/src/ontology/hooks/useThingConfig.ts
import { type ThingType } from '@oneie/core'
import { ontologyUIConfig } from '@/ontology/config'

export function useThingConfig(type: ThingType) {
  const config = ontologyUIConfig[type]

  if (!config) {
    console.error(`No UI config found for thing type: ${type}`)
    // Return minimal fallback config
    return {
      type,
      properties: {},
      ui: {
        component: 'Card',
        layouts: { grid: { columns: 3, gap: 'md' } },
        fields: {},
        views: { card: { fields: ['name'] } },
        actions: {},
        connections: {},
        empty: {
          icon: 'box',
          title: 'No items',
          description: 'Get started by creating one'
        }
      }
    }
  }

  return config
}
```

---

## Hook: useAction

```tsx
// frontend/src/hooks/useAction.ts
import { useState } from 'react'
import { type Thing } from '@oneie/core'
import { Effect } from 'effect'
import { ThingService } from '@/services/ThingService'
import { useEffectRunner } from '@/hooks/useEffectRunner'

export function useAction() {
  const [loading, setLoading] = useState(false)
  const { run } = useEffectRunner()

  const executeAction = async (action: string, thing: Thing) => {
    setLoading(true)

    const program = Effect.gen(function* () {
      const service = yield* ThingService

      // Handle different action types
      switch (action) {
        case 'enroll':
          return yield* service.enroll(thing._id)

        case 'purchase':
          return yield* service.purchase(thing._id)

        case 'preview':
          // Navigate to preview page
          window.location.href = `/preview/${thing.type}/${thing._id}`
          break

        case 'share':
          // Open share dialog
          await navigator.share({
            title: thing.name,
            url: window.location.href
          })
          break

        case 'bookmark':
          return yield* service.bookmark(thing._id)

        case 'edit':
          window.location.href = `/edit/${thing.type}/${thing._id}`
          break

        case 'delete':
          if (confirm('Are you sure?')) {
            return yield* service.delete(thing._id)
          }
          break

        case 'addToCart':
          return yield* service.addToCart(thing._id)

        case 'wishlist':
          return yield* service.addToWishlist(thing._id)

        // Add more actions as needed
        default:
          console.warn(`Unknown action: ${action}`)
      }
    })

    await run(program, {
      onSuccess: () => {
        setLoading(false)
      },
      onError: (error) => {
        console.error('Action failed:', error)
        setLoading(false)
      }
    })
  }

  return { executeAction, loading }
}
```

---

## Usage Examples

### Basic Usage

```tsx
// frontend/src/pages/courses/index.astro
---
import { getCourses } from '@/services/ThingService'
import Card from '@/components/generic/Card'

const courses = await getCourses()
---

<div class="grid grid-cols-3 gap-6">
  {courses.map(course => (
    <Card
      thing={course}
      client:load
    />
  ))}
</div>
```

### Custom View

```tsx
// Use list view instead of card view
<Card
  thing={course}
  view="list"
  client:load
/>
```

### Custom Click Handler

```tsx
// Handle click manually
<Card
  thing={course}
  onClick={(thing) => {
    console.log('Clicked:', thing)
    router.push(`/courses/${thing._id}`)
  }}
  client:load
/>
```

### Hide Actions

```tsx
// Show card without actions
<Card
  thing={course}
  showActions={false}
  client:load
/>
```

### Hide Connections

```tsx
// Show card without connection badges
<Card
  thing={course}
  showConnections={false}
  client:load
/>
```

---

## Variants

### ThingList

```tsx
// frontend/src/components/generic/ThingList.tsx
export function ThingList({ things, view = 'list' }) {
  const config = useThingConfig(things[0]?.type)

  return (
    <div className="space-y-4">
      {things.map(thing => (
        <Card
          key={thing._id}
          thing={thing}
          view={view}
        />
      ))}
    </div>
  )
}
```

### ThingGrid

```tsx
// frontend/src/components/generic/ThingGrid.tsx
export function ThingGrid({ things }) {
  const config = useThingConfig(things[0]?.type)
  const gridLayout = config.ui.layouts.grid

  return (
    <div
      className="grid gap-6"
      style={{
        gridTemplateColumns: `repeat(${gridLayout.columns}, 1fr)`
      }}
    >
      {things.map(thing => (
        <Card
          key={thing._id}
          thing={thing}
          view="card"
        />
      ))}
    </div>
  )
}
```

### ThingDetail

```tsx
// frontend/src/components/generic/ThingDetail.tsx
export function ThingDetail({ thing }) {
  const config = useThingConfig(thing.type)

  return (
    <div className="max-w-prose mx-auto">
      <Card
        thing={thing}
        view="detail"
        showActions={true}
        showConnections={true}
      />
    </div>
  )
}
```

### ThingTable

```tsx
// frontend/src/components/generic/ThingTable.tsx
export function ThingTable({ things }) {
  const config = useThingConfig(things[0]?.type)
  const tableView = config.ui.views.table

  return (
    <table className="w-full">
      <thead>
        <tr>
          {tableView.fields.map(fieldName => (
            <th key={fieldName}>
              {config.ui.fields[fieldName]?.label || fieldName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {things.map(thing => (
          <tr key={thing._id}>
            {tableView.fields.map(fieldName => (
              <td key={fieldName}>
                <Field
                  name={fieldName}
                  value={thing.properties[fieldName]}
                  config={config.ui.fields[fieldName]}
                  thing={thing}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

---

## Empty State

```tsx
// frontend/src/components/generic/EmptyState.tsx
import { type EmptyStateConfig } from '@/ontology/types'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

interface EmptyStateProps {
  config: EmptyStateConfig
  onAction?: () => void
}

export function EmptyState({ config, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon
        name={config.icon}
        size="3xl"
        className="text-muted mb-4"
      />
      <h3 className="text-xl font-semibold mb-2">
        {config.title}
      </h3>
      <p className="text-muted mb-6">
        {config.description}
      </p>
      {config.action && (
        <Button
          icon={config.action.icon}
          variant={config.action.variant}
          onClick={onAction}
        >
          {config.action.label}
        </Button>
      )}
    </div>
  )
}
```

**Usage:**

```tsx
// Show empty state when no things
{things.length === 0 ? (
  <EmptyState
    config={config.ui.empty}
    onAction={() => router.push('/courses/new')}
  />
) : (
  <ThingGrid things={things} />
)}
```

---

## Testing

### Unit Tests

```tsx
// frontend/src/components/generic/__tests__/Card.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders course card', () => {
    const course = {
      _id: '123',
      type: 'course',
      name: 'Test Course',
      properties: {
        title: 'Test Course',
        description: 'A test course',
        price: 99,
        level: 'beginner'
      }
    }

    render(<Card thing={course} />)

    expect(screen.getByText('Test Course')).toBeInTheDocument()
    expect(screen.getByText('A test course')).toBeInTheDocument()
    expect(screen.getByText('$99')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
  })

  it('renders product card', () => {
    const product = {
      _id: '456',
      type: 'product',
      name: 'Test Product',
      properties: {
        name: 'Test Product',
        price: 49,
        inventory: 10
      }
    }

    render(<Card thing={product} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$49')).toBeInTheDocument()
    expect(screen.getByText('10 in stock')).toBeInTheDocument()
  })

  it('handles click', () => {
    const onClick = vi.fn()
    const course = { /* ... */ }

    render(<Card thing={course} onClick={onClick} />)

    fireEvent.click(screen.getByRole('article'))
    expect(onClick).toHaveBeenCalledWith(course)
  })
})
```

---

## Performance Optimization

### Memoization

```tsx
// Memoize config lookup
import { useMemo } from 'react'

export function Card({ thing, ...props }) {
  const config = useMemo(
    () => getThingConfig(thing.type),
    [thing.type]
  )

  // ... rest of component
}
```

### Lazy Loading

```tsx
// Lazy load images
<Image
  src={thing.properties.thumbnail}
  lazy={true}
  loading="lazy"
/>
```

### Virtual Scrolling

```tsx
// Use virtual scrolling for long lists
import { VirtualList } from '@/components/ui/VirtualList'

<VirtualList
  items={things}
  renderItem={(thing) => <Card thing={thing} />}
  itemHeight={200}
/>
```

---

## Next Steps

### Week 1
- [ ] Implement Card core component
- [ ] Implement Field component with 10 field types
- [ ] Implement Actions component
- [ ] Test with 3 thing types

### Week 2
- [ ] Add all field component types (20+)
- [ ] Implement ConnectionBadges
- [ ] Implement EmptyState
- [ ] Add responsive layouts

### Week 3
- [ ] Build ThingList variant
- [ ] Build ThingGrid variant
- [ ] Build ThingDetail variant
- [ ] Build ThingTable variant

### Week 4
- [ ] Add customization API
- [ ] Add theme support
- [ ] Add accessibility features
- [ ] Performance optimization

---

**With Card, you build ONE component and support 66 thing types automatically.**
