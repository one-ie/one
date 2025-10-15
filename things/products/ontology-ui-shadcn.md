# Ontology UI with shadcn/ui Integration

> **⚠️ DEPRECATED:** This document has been superseded by a cleaner approach. Please use:
> - `one/things/features/ontology-ui.md` - Clean UI metadata specification
> - `one/things/components/card.md` - Implementation using shadcn/ui naturally
> - `one/things/plans/ontology-ui-approach.md` - Philosophy explanation
>
> **Why the change?** The new approach keeps ontology-ui.md as a clean specification and uses shadcn/ui as an implementation detail in card.md, resulting in 50% less documentation with no redundancy.

**Ontology-driven UI using shadcn/ui components for consistent, accessible design**

---

## Overview

The ONE ontology UI specification is fully integrated with [shadcn/ui](https://ui.shadcn.com/) - a collection of beautifully designed, accessible components built with Radix UI and Tailwind CSS.

**Why shadcn/ui:**
- ✅ **Accessible** - Built on Radix UI primitives (WAI-ARIA compliant)
- ✅ **Customizable** - Full control via Tailwind CSS
- ✅ **Copy-paste** - Not an npm dependency, you own the code
- ✅ **TypeScript** - Fully typed components
- ✅ **Consistent** - Professional design system out of the box
- ✅ **Well-documented** - Comprehensive docs and examples

**Integration Benefits:**
- ✅ Every field component maps to shadcn/ui component
- ✅ Consistent design across all 66 thing types
- ✅ Accessible by default (screen readers, keyboard nav)
- ✅ Theme support (light/dark mode)
- ✅ Responsive and mobile-friendly

---

## Setup

### 1. Install shadcn/ui

```bash
cd frontend

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Choose:
# Style: Default
# Base color: Slate
# CSS variables: Yes
```

### 2. Install Required Components

```bash
# Core components
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add separator

# Form components
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add select

# Display components
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add popover

# Data components
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add calendar
```

### 3. Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (auto-generated)
│   │   │   ├── card.tsx
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   ├── generic/         # Ontology-driven components
│   │   │   ├── ThingCard.tsx
│   │   │   ├── Field.tsx
│   │   │   └── Actions.tsx
│   │   └── fields/          # Field-specific components
│   │       ├── Heading.tsx
│   │       ├── Text.tsx
│   │       ├── Price.tsx
│   │       └── ...
│   ├── ontology/
│   │   ├── config/          # UI configs for all types
│   │   │   ├── course.ts
│   │   │   ├── product.ts
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useThingConfig.ts
│   └── lib/
│       └── utils.ts         # shadcn/ui utilities
```

---

## Field Component Mapping

Every ontology field component maps to a shadcn/ui component:

| Field Component | shadcn/ui Component | Usage |
|----------------|---------------------|-------|
| `Heading` | Custom (Typography) | Headings with size variants |
| `Text` | Custom (Typography) | Body text with truncation |
| `Price` | `Badge` + Custom formatting | Formatted prices |
| `Image` | Custom `<img>` + `Skeleton` | Lazy-loaded images |
| `Badge` | `Badge` | Status badges |
| `TagList` | Multiple `Badge` | Tag collections |
| `Date` | Custom formatting | Formatted dates |
| `Avatar` | `Avatar` | User avatars |
| `Button` | `Button` | Action buttons |
| `Link` | Custom `<a>` | Hyperlinks |
| `Checkbox` | `Checkbox` | Checkboxes |
| `Switch` | `Switch` | Toggle switches |
| `Select` | `Select` | Dropdowns |
| `Input` | `Input` | Text inputs |
| `Textarea` | `Textarea` | Multi-line text |
| `Rating` | Custom stars | Star ratings |
| `Progress` | `Progress` | Progress bars |
| `Table` | `Table` | Data tables |
| `Dialog` | `Dialog` | Modal dialogs |
| `Tooltip` | `Tooltip` | Hover tooltips |

---

## ThingCard with shadcn/ui

### Implementation

```tsx
// frontend/src/components/generic/ThingCard.tsx
import { type Thing } from '@one-platform/core'
import { useThingConfig } from '@/ontology/hooks/useThingConfig'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
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
  const config = useThingConfig(thing.type)
  const viewConfig = config.ui.views[view]

  if (!viewConfig) return null

  const fields = viewConfig.fields === '*'
    ? Object.keys(config.properties)
    : viewConfig.fields

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="space-y-0 pb-3">
        {/* Render header fields (typically thumbnail + title) */}
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

      <CardContent className="space-y-2">
        {/* Render body fields */}
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
      {showActions && (config.ui.actions.primary || config.ui.actions.secondary) && (
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
    </Card>
  )
}
```

---

## Field Component with shadcn/ui

```tsx
// frontend/src/components/generic/Field.tsx
import { type FieldUI } from '@/ontology/types'
import { type Thing } from '@one-platform/core'

// shadcn/ui components
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Custom field components
import { Heading } from '@/components/fields/Heading'
import { Text } from '@/components/fields/Text'
import { Price } from '@/components/fields/Price'
import { Image } from '@/components/fields/Image'
import { TagList } from '@/components/fields/TagList'
import { DateField } from '@/components/fields/DateField'
import { Link } from '@/components/fields/Link'

interface FieldProps {
  name: string
  value: any
  config: FieldUI
  thing: Thing
}

export function Field({ name, value, config, thing }: FieldProps) {
  if (value === null || value === undefined) return null

  const formattedValue = config.format
    ? config.format(value, thing)
    : value

  switch (config.component) {
    case 'Heading':
      return <Heading {...config}>{formattedValue}</Heading>

    case 'Text':
      return <Text {...config}>{formattedValue}</Text>

    case 'Price':
      return <Price {...config} value={formattedValue} />

    case 'Image':
      return <Image {...config} src={formattedValue} alt={thing.name} />

    case 'Badge':
      const badgeColor = config.colors?.[value] || config.color
      const badgeLabel = config.labels?.[value] || config.label || value

      return (
        <Badge variant={badgeColor as any} className="inline-flex items-center gap-1">
          {config.icon && <span className="h-3 w-3">{/* icon */}</span>}
          {badgeLabel}
        </Badge>
      )

    case 'TagList':
      return <TagList {...config} tags={formattedValue} />

    case 'Date':
      return <DateField {...config} value={formattedValue} />

    case 'Avatar':
      return (
        <Avatar className={config.size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'}>
          <AvatarImage src={formattedValue} alt={thing.name} />
          <AvatarFallback>
            {config.fallback === 'initials'
              ? thing.name.split(' ').map(n => n[0]).join('').toUpperCase()
              : config.fallback}
          </AvatarFallback>
        </Avatar>
      )

    case 'Link':
      return <Link {...config} href={formattedValue} />

    case 'Checkbox':
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formattedValue}
            onCheckedChange={(checked) => {
              // Update thing
            }}
          />
          {config.label && (
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {config.label}
            </label>
          )}
        </div>
      )

    case 'Switch':
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={formattedValue}
            onCheckedChange={(checked) => {
              // Update thing
            }}
          />
          {config.label && (
            <label className="text-sm font-medium">{config.label}</label>
          )}
        </div>
      )

    case 'Progress':
      return (
        <div className="space-y-2">
          {config.label && (
            <div className="flex justify-between text-sm">
              <span>{config.label}</span>
              <span>{formattedValue}%</span>
            </div>
          )}
          <Progress value={formattedValue} />
        </div>
      )

    case 'Separator':
      return <Separator />

    case 'Skeleton':
      return <Skeleton className={config.className} />

    default:
      return <Text size="sm">{String(formattedValue)}</Text>
  }
}
```

---

## Actions Component with shadcn/ui

```tsx
// frontend/src/components/generic/Actions.tsx
import { type Thing } from '@one-platform/core'
import { type ActionConfig } from '@/ontology/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAction } from '@/hooks/useAction'
import { MoreVertical } from 'lucide-react'
import { useState } from 'react'

interface ActionsProps {
  thing: Thing
  primary?: ActionConfig
  secondary?: ActionConfig[]
  context?: ActionConfig[]
}

export function Actions({ thing, primary, secondary, context }: ActionsProps) {
  const { executeAction, loading } = useAction()
  const [confirmAction, setConfirmAction] = useState<ActionConfig | null>(null)

  const handleAction = async (action: ActionConfig) => {
    // Show confirmation dialog if required
    if (action.confirm) {
      setConfirmAction(action)
      return
    }

    await executeAction(action.action, thing)
  }

  return (
    <>
      <div className="flex items-center gap-2 w-full">
        {/* Primary action */}
        {primary && (
          <Button
            variant={primary.variant === 'danger' ? 'destructive' : 'default'}
            className="flex-1"
            disabled={loading}
            onClick={() => handleAction(primary)}
          >
            {loading ? 'Loading...' : primary.label}
          </Button>
        )}

        {/* Secondary actions */}
        {secondary && secondary.length > 0 && (
          <div className="flex gap-2">
            {secondary.map(action => (
              <Button
                key={action.action}
                variant={action.variant === 'ghost' ? 'outline' : 'default'}
                size="icon"
                disabled={loading}
                onClick={() => handleAction(action)}
              >
                {/* Icon from lucide-react */}
                <span className="h-4 w-4" />
              </Button>
            ))}
          </div>
        )}

        {/* Context menu (more actions) */}
        {context && context.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {context.map((action, index) => (
                <div key={action.action}>
                  {index > 0 && action.variant === 'danger' && (
                    <DropdownMenuSeparator />
                  )}
                  <DropdownMenuItem
                    onClick={() => handleAction(action)}
                    className={
                      action.variant === 'danger' ? 'text-destructive' : ''
                    }
                  >
                    {action.label}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Confirmation dialog */}
      {confirmAction && (
        <AlertDialog
          open={!!confirmAction}
          onOpenChange={() => setConfirmAction(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {confirmAction.confirm}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  await executeAction(confirmAction.action, thing)
                  setConfirmAction(null)
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
```

---

## Connection Badges with shadcn/ui

```tsx
// frontend/src/components/generic/ConnectionBadges.tsx
import { type Thing } from '@one-platform/core'
import { type ConnectionUI } from '@/ontology/types'
import { useConnections } from '@/hooks/useConnections'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface ConnectionBadgesProps {
  thing: Thing
  config: Record<string, ConnectionUI>
}

export function ConnectionBadges({ thing, config }: ConnectionBadgesProps) {
  const connections = useConnections(thing._id)

  const badges = Object.entries(config).map(([type, connectionConfig]) => {
    const items = connections.filter(c => c.relationshipType === type)
    if (items.length === 0) return null

    const label = connectionConfig.label
      .replace('{count}', items.length.toString())
      .replace('{name}', items[0]?.name || '')

    switch (connectionConfig.display) {
      case 'badge':
        return (
          <Badge key={type} variant="secondary" className="text-xs">
            {label}
          </Badge>
        )

      case 'avatar':
        return (
          <div key={type} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={items[0]?.properties?.avatar} />
              <AvatarFallback>
                {items[0]?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {label}
            </span>
          </div>
        )

      case 'inline':
        return (
          <span key={type} className="text-sm text-muted-foreground">
            {label}
          </span>
        )

      case 'list':
        return (
          <div key={type} className="flex flex-wrap gap-1">
            {items.slice(0, connectionConfig.max || 5).map(item => (
              <Badge key={item._id} variant="outline" className="text-xs">
                {item.name}
              </Badge>
            ))}
          </div>
        )

      default:
        return null
    }
  })

  const validBadges = badges.filter(Boolean)
  if (validBadges.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {validBadges}
    </div>
  )
}
```

---

## Field Components with shadcn/ui

### Price Component

```tsx
// frontend/src/components/fields/Price.tsx
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PriceProps {
  value: number
  currency?: string
  format?: 'full' | 'compact'
  badge?: boolean
  size?: 'sm' | 'md' | 'lg'
  strikethrough?: boolean
  free?: { label: string; badge: boolean }
  className?: string
}

export function Price({
  value,
  currency = 'USD',
  format = 'compact',
  badge = false,
  size = 'md',
  strikethrough = false,
  free,
  className
}: PriceProps) {
  // Show "Free" if value is 0 and free config provided
  if (value === 0 && free) {
    return free.badge ? (
      <Badge variant="secondary">{free.label}</Badge>
    ) : (
      <span className="text-sm font-medium text-muted-foreground">
        {free.label}
      </span>
    )
  }

  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: format === 'compact' ? 0 : 2,
    maximumFractionDigits: format === 'compact' ? 0 : 2
  }).format(value)

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const content = (
    <span
      className={cn(
        'font-semibold',
        sizeClasses[size],
        strikethrough && 'line-through text-muted-foreground',
        className
      )}
    >
      {formatted}
    </span>
  )

  return badge ? (
    <Badge variant="default" className="font-semibold">
      {formatted}
    </Badge>
  ) : (
    content
  )
}
```

### Image Component

```tsx
// frontend/src/components/fields/Image.tsx
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ImageProps {
  src: string
  alt: string
  aspect?: 'square' | 'video' | 'wide' | 'portrait'
  lazy?: boolean
  placeholder?: string
  fallback?: string
  sizes?: string
  className?: string
}

export function Image({
  src,
  alt,
  aspect = 'video',
  lazy = true,
  placeholder,
  fallback,
  sizes,
  className
}: ImageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]'
  }

  return (
    <div className={cn('relative overflow-hidden rounded-md', aspectClasses[aspect])}>
      {loading && (
        <Skeleton className="absolute inset-0" />
      )}
      <img
        src={error && fallback ? fallback : src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        sizes={sizes}
        className={cn(
          'h-full w-full object-cover transition-opacity',
          loading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true)
          setLoading(false)
        }}
      />
    </div>
  )
}
```

### TagList Component

```tsx
// frontend/src/components/fields/TagList.tsx
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface TagListProps {
  tags: string[]
  max?: number
  color?: string
  moreLabel?: string
}

export function TagList({
  tags,
  max = 3,
  color = 'default',
  moreLabel = '+{count} more'
}: TagListProps) {
  if (!tags || tags.length === 0) return null

  const visibleTags = tags.slice(0, max)
  const hiddenTags = tags.slice(max)

  return (
    <div className="flex flex-wrap gap-1">
      {visibleTags.map(tag => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ))}

      {hiddenTags.length > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs cursor-help">
                {moreLabel.replace('{count}', hiddenTags.length.toString())}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex flex-wrap gap-1 max-w-xs">
                {hiddenTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}
```

---

## Empty State with shadcn/ui

```tsx
// frontend/src/components/generic/EmptyState.tsx
import { type EmptyStateConfig } from '@/ontology/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  config: EmptyStateConfig
  onAction?: () => void
}

export function EmptyState({ config, onAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          {/* Icon from lucide-react */}
          <span className="h-10 w-10 text-muted-foreground" />
        </div>

        <h3 className="text-xl font-semibold mb-2">
          {config.title}
        </h3>

        <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
          {config.description}
        </p>

        {config.action && (
          <Button onClick={onAction}>
            {config.action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
```

---

## ThingTable with shadcn/ui

```tsx
// frontend/src/components/generic/ThingTable.tsx
import { type Thing } from '@one-platform/core'
import { useThingConfig } from '@/ontology/hooks/useThingConfig'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Field } from './Field'
import { ArrowUpDown } from 'lucide-react'

interface ThingTableProps {
  things: Thing[]
  onRowClick?: (thing: Thing) => void
}

export function ThingTable({ things, onRowClick }: ThingTableProps) {
  if (things.length === 0) return null

  const config = useThingConfig(things[0].type)
  const tableView = config.ui.views.table

  if (!tableView) return null

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {tableView.fields.map(fieldName => {
              const fieldConfig = config.ui.fields[fieldName]
              return (
                <TableHead key={fieldName}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8"
                    onClick={() => {
                      // Handle sort
                    }}
                  >
                    {fieldConfig?.label || fieldName}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {things.map(thing => (
            <TableRow
              key={thing._id}
              className="cursor-pointer"
              onClick={() => onRowClick?.(thing)}
            >
              {tableView.fields.map(fieldName => (
                <TableCell key={fieldName}>
                  <Field
                    name={fieldName}
                    value={thing.properties[fieldName]}
                    config={config.ui.fields[fieldName]}
                    thing={thing}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

## Theme Support

### Dark Mode

shadcn/ui includes built-in dark mode support:

```tsx
// frontend/src/components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

const ThemeProviderContext = createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: 'system',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeProviderContext)
```

### Theme Toggle

```tsx
// frontend/src/components/ThemeToggle.tsx
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

---

## Responsive Design

shadcn/ui components are responsive by default. Use Tailwind's responsive utilities:

```tsx
<Card className="w-full sm:w-1/2 lg:w-1/3">
  {/* Responsive card width */}
</Card>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## Accessibility

shadcn/ui components are built on Radix UI, which provides:

- ✅ **Keyboard navigation** - Full keyboard support
- ✅ **Screen reader support** - ARIA labels and descriptions
- ✅ **Focus management** - Proper focus handling
- ✅ **Color contrast** - WCAG AA compliant
- ✅ **RTL support** - Right-to-left languages

### Example: Accessible Form

```tsx
<form className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="title">Course Title</Label>
    <Input
      id="title"
      placeholder="Enter title"
      aria-describedby="title-description"
    />
    <p id="title-description" className="text-sm text-muted-foreground">
      This will be the main title displayed to students
    </p>
  </div>
</form>
```

---

## Usage Examples

### Course Card

```tsx
import { ThingCard } from '@/components/generic/ThingCard'

export function CoursesPage() {
  const courses = await getCourses()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Courses</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <ThingCard
            key={course._id}
            thing={course}
            onClick={(thing) => {
              router.push(`/courses/${thing._id}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}
```

### Product Grid with Filters

```tsx
import { ThingCard } from '@/components/generic/ThingCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function ProductsPage() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('all')

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search products..."
          className="max-w-sm"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="books">Books</SelectItem>
            <SelectItem value="courses">Courses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ThingCard key={product._id} thing={product} />
        ))}
      </div>
    </div>
  )
}
```

---

## Customization

### Custom Theme Colors

```css
/* frontend/src/styles/globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* ... other colors */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* ... other colors */
  }
}
```

### Organization-Specific Overrides

```tsx
// Custom badge colors per organization
const config = {
  ...defaultCourseConfig,
  ui: {
    ...defaultCourseConfig.ui,
    fields: {
      ...defaultCourseConfig.ui.fields,
      level: {
        ...defaultCourseConfig.ui.fields.level,
        colors: {
          beginner: 'blue',  // Override to blue
          intermediate: 'purple',
          advanced: 'orange'
        }
      }
    }
  }
}
```

---

## Next Steps

### Week 1: Setup
- [ ] Install shadcn/ui
- [ ] Add all required components
- [ ] Setup theme provider
- [ ] Configure Tailwind

### Week 2: Core Components
- [ ] Build ThingCard with shadcn/ui
- [ ] Build Field component
- [ ] Build Actions component
- [ ] Test with 3 thing types

### Week 3: Field Components
- [ ] Build all field components
- [ ] Add Price, Image, TagList
- [ ] Add DateField, Avatar, Link
- [ ] Test responsive design

### Week 4: Advanced
- [ ] Build ThingTable
- [ ] Add dark mode support
- [ ] Add accessibility features
- [ ] Performance optimization

---

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Radix UI Docs**: https://www.radix-ui.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

---

**With shadcn/ui, every thing type gets beautiful, accessible UI automatically.**
