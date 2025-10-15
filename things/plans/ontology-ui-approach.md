# Ontology UI: Clean, Simple Approach

**The ontology UI spec is clean and implementation-agnostic. shadcn/ui is just how we build it.**

---

## The Strategy

### 1. Clean Specification (`ontology-ui.md`)

**What it defines:**

- UI metadata for each thing type
- Field rendering configs
- Actions, layouts, views
- Connection display rules

**What it does NOT define:**

- How components are built
- Which UI library to use
- Implementation details

**Example:**

```typescript
// Clean spec - says WHAT to render
{
  type: "course",
  ui: {
    fields: {
      price: {
        component: "Price",
        currency: "USD",
        badge: true
      }
    }
  }
}
```

### 2. Implementation Uses shadcn/ui

**Under the hood:**

- Card uses `<Card>` from shadcn/ui
- Field uses `<Badge>`, `<Avatar>`, etc. from shadcn/ui
- Actions uses `<Button>` from shadcn/ui
- All styled with Tailwind CSS

**Developers don't need to know this!** They just write:

```tsx
<Card thing={course} />
```

---

## Why This is Better

### Before (Over-complicated)

```
Spec says: "Use shadcn/ui Badge component with secondary variant"
Developer thinks: "I need to learn shadcn/ui API"
```

**Problem:** Too much coupling between spec and implementation.

### After (Clean)

```
Spec says: "Render as Badge with these properties"
Developer thinks: "I just use Card, it handles everything"
```

**Benefit:** Spec is clean, implementation details hidden.

---

## What Each Document Does

### `ontology-ui.md` - The Specification

**Purpose:** Define UI metadata for all thing types

**Contains:**

- UI metadata schema (fields, views, actions)
- Complete specs for top 5 types (course, lesson, product, post, person)
- Field component types (Heading, Text, Price, Badge, etc.)
- Usage examples

**Does NOT contain:**

- shadcn/ui component code
- Implementation details
- Tailwind classes

**Note at top:** "Built on shadcn/ui" (one line, that's it)

### `card.md` - The Implementation

**Purpose:** Show how to build Card component

**Contains:**

- Full Card component code (uses shadcn/ui Card)
- Field component code (uses shadcn/ui Badge, Avatar, etc.)
- Actions component code (uses shadcn/ui Button)
- Real-world examples

**Imports from shadcn/ui:**

```tsx
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
```

### No Separate "shadcn Integration" Doc Needed

**Old approach:**

- `ontology-ui.md` - Spec
- `ontology-ui-shadcn.md` - shadcn integration (redundant!)
- `thingcard-shadcn.md` - More shadcn stuff (redundant!)

**New approach:**

- `ontology-ui.md` - Spec (mentions shadcn/ui briefly)
- `card.md` - Implementation (uses shadcn/ui naturally)

**Result:** 50% less documentation, much clearer.

---

## Developer Experience

### Adding a New Thing Type

**Step 1:** Add UI metadata to ontology

```typescript
// one/knowledge/ontology-ui.md
{
  type: "webinar",
  ui: {
    fields: {
      title: { component: "Heading", size: "xl" },
      startTime: { component: "Date", format: "full" }
    },
    views: {
      card: { fields: ["thumbnail", "title", "startTime"] }
    },
    actions: {
      primary: { action: "register", label: "Register Now" }
    }
  }
}
```

**Step 2:** Use it

```tsx
<Card thing={webinar} />
```

**Done!** No shadcn/ui knowledge needed.

### Customizing a Component

**If you need custom styling:**

```tsx
<Card thing={course} className="border-primary shadow-lg" />
```

**If you need different behavior:**

```tsx
<Card
  thing={course}
  onClick={(thing) => {
    // Custom click handler
  }}
/>
```

**If you need to change implementation:**

```tsx
// Just edit Card.tsx
// It already uses shadcn/ui, modify as needed
```

---

## File Structure

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
│   │   │   ├── Card.tsx       # Uses shadcn/ui Card
│   │   │   ├── Field.tsx           # Uses shadcn/ui Badge, Avatar, etc.
│   │   │   ├── Actions.tsx         # Uses shadcn/ui Button
│   │   │   └── ConnectionBadges.tsx
│   │   └── fields/          # Custom field components
│   │       ├── Heading.tsx
│   │       ├── Text.tsx
│   │       ├── Price.tsx    # Wraps shadcn/ui Badge
│   │       └── ...
│   └── ontology/
│       ├── config/          # UI configs for all types
│       │   ├── course.ts
│       │   ├── product.ts
│       │   └── ...
│       └── hooks/
│           └── useThingConfig.ts
```

**Key insight:** shadcn/ui lives in `components/ui/`, but developers mostly use `components/generic/`.

---

## Implementation Philosophy

### Ontology Says "What"

```typescript
price: {
  component: "Price",
  currency: "USD",
  badge: true
}
```

**Translation:** "Show price as a badge in USD"

### Component Does "How"

```tsx
// Field component interprets "Price" + "badge: true"
case 'Price':
  return config.badge ? (
    <Badge>{formatPrice(value)}</Badge>  // shadcn/ui Badge
  ) : (
    <span>{formatPrice(value)}</span>
  )
```

**Developer never sees this!** They just use `<Card thing={course} />`.

---

## Benefits of This Approach

### 1. Clean Separation

- **Spec** = What to render (ontology-ui.md)
- **Implementation** = How to render (card.md)
- **UI Library** = shadcn/ui (implementation detail)

### 2. Easy to Change

Want to swap shadcn/ui for something else?

- Update `Card.tsx`, `Field.tsx`, etc.
- Ontology spec stays the same
- Developer usage stays the same

### 3. Simple to Learn

Developer learns:

1. Ontology UI spec (what metadata to define)
2. `<Card thing={x} />` (how to use it)

Developer does NOT need to learn:

- shadcn/ui API
- Tailwind classes (unless customizing)
- Radix UI primitives
- Component implementation details

### 4. Less Documentation

**Before:**

- 3 documents (ontology-ui, shadcn integration, thingcard-shadcn)
- ~15,000 lines total
- Lots of redundancy

**After:**

- 2 documents (ontology-ui, thingcard)
- ~8,000 lines total
- No redundancy

---

## Quick Start

### For Developers Using ONE

```bash
# 1. Install ONE frontend
npm install @oneie/frontend

# 2. Use it
import { Card } from '@oneie/components'
<Card thing={anything} />
```

**Done!** shadcn/ui is already built-in.

### For Developers Building ONE

```bash
# 1. Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button badge

# 2. Build Card using shadcn/ui
# (See card.md for implementation)

# 3. Use it
<Card thing={anything} />
```

---

## Summary

**Key Principle:** Ontology defines WHAT to render. Components use shadcn/ui to render it. Developers just use `<Card>`.

**Documents:**

1. `ontology-ui.md` - Clean spec (mentions shadcn/ui briefly)
2. `card.md` - Implementation (uses shadcn/ui naturally)

**Result:**

- Clean specification
- Simple developer experience
- shadcn/ui benefits (beautiful, accessible)
- Easy to customize or change

**You get beautiful UI without complexity.**
