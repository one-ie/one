# ONE Ontology: Frontend Implementation Guide

**Building /frontend/* - The Rendering Layer**

---

## Executive Summary

The frontend is **purely a rendering and interaction layer**. It has ZERO business logic, ZERO database access, ZERO data validation. It only:

1. **Renders UI** from data
2. **Calls backend APIs** to get/modify data
3. **Manages local UI state** (loading, errors, forms)
4. **Displays real-time updates** via subscriptions

**Clear Separation:**
```
┌──────────────────────────────────────┐
│         FRONTEND (Astro + React)     │
│  ✅ Renders HTML/React components    │
│  ✅ Calls backend APIs               │
│  ✅ Manages UI state only            │
│  ✅ Displays data from backend       │
│  ❌ NO database access               │
│  ❌ NO business logic                │
│  ❌ NO data validation               │
│  ❌ NO event logging                 │
└──────────────┬───────────────────────┘
               │ HTTP/WebSocket
               │ ConvexHttpClient
               ↓
┌──────────────────────────────────────┐
│    BACKEND (Convex - Separate Repo)  │
│  ✅ Database (things/connections)    │
│  ✅ Business logic                   │
│  ✅ Data validation                  │
│  ✅ Event logging                    │
│  ✅ Queries & Mutations              │
│  ✅ Real-time subscriptions          │
└──────────────────────────────────────┘
```

**What Frontend Builds:**
- 66 thing types → 198 UI components (card, list, detail per type)
- 25 connection types → 75 relationship UIs
- Organizations → Multi-tenant websites at `{slug}.one.ie`

**Tech Stack:**
- **Astro** - SSR/SSG (pages, layouts)
- **React 19** - Interactive components
- **Tailwind + shadcn/ui** - Styling
- **TypeScript** - Type safety
- **Convex Client** - Backend connection (NOT Convex backend itself)

---

## Table of Contents

1. [What Frontend IS and IS NOT](#what-frontend-is-and-is-not)
2. [Frontend File Structure](#frontend-file-structure)
3. [Ontology Config (Display Only)](#ontology-config-display-only)
4. [Connecting to Backend](#connecting-to-backend)
5. [Component Patterns](#component-patterns)
6. [Page Patterns (SSR)](#page-patterns-ssr)
7. [Real-Time Components](#real-time-components)
8. [Forms (Calls Backend)](#forms-calls-backend)
9. [Multi-Tenant Routing](#multi-tenant-routing)
10. [Deployment](#deployment)

---

## What Frontend IS and IS NOT

### ✅ Frontend IS Responsible For:

**1. Rendering**
```tsx
// Display data from backend
<h1>{course.name}</h1>
<p>{course.properties.description}</p>
```

**2. Calling Backend APIs**
```tsx
// Get data from backend
const courses = useQuery(api.queries.things.list, { type: 'course' })

// Send data to backend
const create = useMutation(api.mutations.things.create)
await create({ type: 'course', name: 'Fitness 101', properties: {...} })
```

**3. Managing UI State**
```tsx
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

**4. User Interactions**
```tsx
<button onClick={handleClick}>Create Course</button>
<input onChange={handleChange} />
```

**5. Client-Side Routing**
```tsx
// Navigate between pages
<Link href="/courses">View Courses</Link>
```

### ❌ Frontend IS NOT Responsible For:

**1. Database Operations**
```tsx
// ❌ NEVER do this in frontend
const courses = await db.query('things').filter(...).collect()
```

**2. Business Logic**
```tsx
// ❌ NEVER do this in frontend
if (user.tokens < course.price) {
  // Calculate discount, check quotas, etc.
}
```

**3. Data Validation**
```tsx
// ❌ NEVER trust frontend validation alone
if (formData.email.includes('@')) {
  // Backend MUST validate, frontend only for UX
}
```

**4. Event Logging**
```tsx
// ❌ NEVER log events in frontend
await db.insert('events', { type: 'course_created', ... })
```

**5. Authorization**
```tsx
// ❌ NEVER check permissions in frontend alone
if (user.role === 'admin') {
  // Backend MUST authorize, frontend only for UI hints
}
```

---

## Frontend File Structure

```
frontend/                               # Frontend repo (separate from backend)
├── src/
│   ├── pages/                         # Astro pages (SSR/SSG)
│   │   ├── index.astro                # Homepage
│   │   ├── courses/
│   │   │   ├── index.astro            # Course list (SSR)
│   │   │   └── [id].astro             # Course detail (SSR)
│   │   └── [thingType]/               # Dynamic routes
│   │       ├── index.astro            # Generic list page
│   │       └── [id].astro             # Generic detail page
│   ├── components/                    # React components
│   │   ├── cards/
│   │   │   └── ThingCard.tsx          # Generic card (adapts to any type)
│   │   ├── lists/
│   │   │   └── ThingList.tsx          # Generic list
│   │   ├── forms/
│   │   │   └── ThingForm.tsx          # Generic form (calls backend)
│   │   └── ui/                        # shadcn/ui components
│   ├── layouts/
│   │   └── Layout.astro               # Main layout
│   ├── ontology/                      # Display config ONLY
│   │   ├── types.ts                   # Type definitions (synced from backend)
│   │   └── config.ts                  # UI display config (colors, icons, labels)
│   ├── lib/
│   │   └── convex.ts                  # Backend client setup
│   └── middleware.ts                  # Multi-tenant routing
├── .env
│   PUBLIC_CONVEX_URL=https://backend.convex.cloud  # Backend URL
└── package.json
```

**Key Point:** Frontend has NO `convex/` directory. That's in the backend repo.

---

## Ontology Config (Display Only)

Frontend needs **display configuration** for UI rendering. NOT business logic.

```typescript
// frontend/src/ontology/config.ts
// THIS IS NOT BUSINESS LOGIC - JUST UI CONFIGURATION

export const thingConfigs = {
  course: {
    // Display names
    displayName: 'Course',
    displayNamePlural: 'Courses',

    // UI presentation
    icon: 'BookOpen',           // Lucide icon name
    color: 'green',             // Tailwind color

    // Which fields to show in UI
    primaryField: 'title',      // Main display field
    secondaryField: 'description',
    imageField: 'thumbnail',

    // Form fields (for UI only, backend validates)
    fields: {
      title: {
        label: 'Course Title',
        type: 'text',
        required: true,
        placeholder: 'e.g., Fitness 101'
      },
      description: {
        label: 'Description',
        type: 'textarea',
        required: true
      },
      price: {
        label: 'Price (USD)',
        type: 'number',
        required: true
      }
    }
  },

  creator: {
    displayName: 'Creator',
    displayNamePlural: 'Creators',
    icon: 'User',
    color: 'blue',
    primaryField: 'name',
    secondaryField: 'bio',
    imageField: 'avatar',
    fields: {
      name: { label: 'Name', type: 'text', required: true },
      email: { label: 'Email', type: 'text', required: true },
      bio: { label: 'Bio', type: 'textarea', required: false }
    }
  }

  // ... all 66 types (UI config only)
}

// Helper function
export function getThingConfig(type: ThingType) {
  return thingConfigs[type]
}
```

**What This Is:**
- ✅ UI labels and placeholders
- ✅ Icon and color choices
- ✅ Which fields to display
- ✅ Form field types

**What This Is NOT:**
- ❌ Business logic
- ❌ Validation rules (backend validates)
- ❌ Authorization rules (backend authorizes)
- ❌ Database schema (that's in backend)

---

## Connecting to Backend

### Setup Convex Client

```typescript
// frontend/src/lib/convex.ts
import { ConvexHttpClient } from 'convex/browser'

// Get backend URL from environment
const BACKEND_URL = import.meta.env.PUBLIC_CONVEX_URL

if (!BACKEND_URL) {
  throw new Error('PUBLIC_CONVEX_URL not set')
}

// Create HTTP client for SSR
export function getConvexClient() {
  return new ConvexHttpClient(BACKEND_URL)
}
```

### Setup React Provider

```astro
---
// frontend/src/layouts/Layout.astro
import { ConvexProvider, ConvexReactClient } from 'convex/react'

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL)
---

<html>
  <head>
    <title>{title}</title>
  </head>
  <body>
    <ConvexProvider client={convex}>
      <slot />
    </ConvexProvider>
  </body>
</html>
```

### Environment Variables

```bash
# frontend/.env
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud

# This points to BACKEND deployment
# Frontend has NO access to backend code, only HTTP/WebSocket API
```

---

## Component Patterns

### Pattern 1: Generic Card (Pure Presentation)

```tsx
// frontend/src/components/cards/ThingCard.tsx
import { Card } from '@/components/ui/card'
import { getThingConfig } from '@/ontology/config'
import * as Icons from 'lucide-react'

interface ThingCardProps {
  thing: {
    _id: string
    type: string
    name: string
    properties: Record<string, any>
  }
}

export function ThingCard({ thing }: ThingCardProps) {
  // Get UI config
  const config = getThingConfig(thing.type as any)
  const Icon = Icons[config.icon as keyof typeof Icons]

  // Extract display values
  const title = thing.properties[config.primaryField] || thing.name
  const subtitle = config.secondaryField
    ? thing.properties[config.secondaryField]
    : null
  const image = config.imageField
    ? thing.properties[config.imageField]
    : null

  // Pure presentation - NO logic
  return (
    <Card>
      {image && <img src={image} alt={title} />}

      <div className="p-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          <span>{config.displayName}</span>
        </div>

        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-gray-600">{subtitle}</p>}

        <a href={`/${thing.type}s/${thing._id}`}>
          <button>View Details</button>
        </a>
      </div>
    </Card>
  )
}
```

**Key Points:**
- ✅ Receives data as props
- ✅ Uses UI config for display
- ✅ Pure presentation logic
- ❌ NO database calls
- ❌ NO business logic
- ❌ NO validation

---

## Page Patterns (SSR)

### Pattern: Fetch from Backend, Render HTML

```astro
---
// frontend/src/pages/courses/[id].astro
import { getConvexClient } from '@/lib/convex'
import { api } from '@/lib/api'
import Layout from '@/layouts/Layout.astro'

// SSR: Fetch data from backend via HTTP
const convex = getConvexClient()

const course = await convex.query(api.queries.things.get, {
  id: Astro.params.id
})

if (!course) {
  return Astro.redirect('/404')
}

// Get related lessons from backend
const lessons = await convex.query(api.queries.things.getRelated, {
  thingId: course._id,
  relationshipType: 'part_of',
  direction: 'to'
})
---

<Layout title={course.name}>
  <!-- Static HTML rendered on server -->
  <header>
    <h1>{course.name}</h1>
    <p>{course.properties.description}</p>
    <span className="text-2xl">${course.properties.price}</span>
  </header>

  <!-- Lessons list (static) -->
  <section>
    <h2>Lessons</h2>
    {lessons.map(lesson => (
      <div>
        <h3>{lesson.name}</h3>
        <p>{lesson.properties.content}</p>
      </div>
    ))}
  </section>

  <!-- Interactive enrollment button (React Island) -->
  <EnrollButton client:load courseId={course._id} />
</Layout>
```

**Key Points:**
- ✅ Calls backend API to get data
- ✅ Renders static HTML
- ✅ Fast initial load (SSR)
- ❌ NO database access
- ❌ NO business logic in page

---

## Real-Time Components

### Pattern: Subscribe to Backend Changes

```tsx
// frontend/src/components/LiveEnrollmentCount.tsx
import { useQuery } from 'convex/react'
import { api } from '@/lib/api'

export function LiveEnrollmentCount({ courseId }: Props) {
  // Real-time subscription to backend
  // When ANYONE enrolls, this updates EVERYWHERE instantly
  const count = useQuery(api.queries.connections.getCount, {
    toThingId: courseId,
    relationshipType: 'enrolled_in'
  })

  if (count === undefined) return <div>Loading...</div>

  return (
    <div>
      <span className="text-3xl font-bold">{count}</span>
      <span className="text-sm text-gray-600"> students enrolled</span>
    </div>
  )
}
```

**How It Works:**
1. Component subscribes to backend query via WebSocket
2. Backend watches database for changes
3. When connection created → backend pushes update to frontend
4. Component auto-re-renders
5. **Frontend does NOTHING except display the number**

---

## Forms (Calls Backend)

### Pattern: Collect Input, Send to Backend

```tsx
// frontend/src/components/forms/ThingForm.tsx
import { useMutation } from 'convex/react'
import { api } from '@/lib/api'
import { getThingConfig } from '@/ontology/config'
import { useState } from 'react'

interface ThingFormProps {
  type: ThingType
  onSuccess?: (id: string) => void
}

export function ThingForm({ type, onSuccess }: ThingFormProps) {
  const config = getThingConfig(type)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState<string | null>(null)

  // Backend mutation (frontend just calls it)
  const createThing = useMutation(api.mutations.things.create)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      // Send to backend - backend validates, creates, logs events
      const id = await createThing({
        type,
        name: formData[config.primaryField],
        properties: formData
      })

      onSuccess?.(id)
    } catch (err) {
      // Display backend error
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields from UI config */}
      {Object.entries(config.fields).map(([field, fieldConfig]) => (
        <div key={field}>
          <label>{fieldConfig.label}</label>
          <input
            type={fieldConfig.type}
            value={formData[field] || ''}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            placeholder={fieldConfig.placeholder}
            required={fieldConfig.required}
          />
        </div>
      ))}

      {error && <div className="text-red-600">{error}</div>}

      <button type="submit">Create</button>
    </form>
  )
}
```

**Key Points:**
- ✅ Collects user input
- ✅ Sends to backend mutation
- ✅ Displays backend errors
- ⚠️ Frontend validation is optional (UX only)
- ❌ Backend MUST validate (security)
- ❌ Frontend does NOT create database records

---

## Multi-Tenant Routing

### Middleware: Extract Org from Subdomain

```typescript
// frontend/src/middleware.ts
import { defineMiddleware } from 'astro:middleware'
import { getConvexClient } from './lib/convex'
import { api } from './lib/api'

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url)

  // Extract org slug from subdomain
  // fitnesspro.one.ie → "fitnesspro"
  const hostname = url.hostname
  const orgSlug = hostname.split('.')[0]

  // Skip for main domains
  if (['api', 'www', 'localhost'].includes(orgSlug)) {
    return next()
  }

  // Fetch org from backend
  const convex = getConvexClient()
  const org = await convex.query(api.queries.orgs.getBySlug, {
    slug: orgSlug
  })

  if (org) {
    // Inject org context for pages to use
    context.locals.org = org
    context.locals.orgId = org._id
  }

  return next()
})
```

### Use Org Context in Pages

```astro
---
// frontend/src/pages/courses/index.astro
import { getConvexClient } from '@/lib/convex'
import { api } from '@/lib/api'

// Get org from middleware
const org = Astro.locals.org

if (!org) {
  return Astro.redirect('/404')
}

// Fetch org's courses from backend
const convex = getConvexClient()
const courses = await convex.query(api.queries.things.list, {
  type: 'course',
  organizationId: org._id  // Backend filters by org
})
---

<Layout title={`${org.name} - Courses`}>
  <h1>{org.name} Courses</h1>

  <!-- Display org's courses -->
  {courses.map(course => (
    <CourseCard thing={course} />
  ))}
</Layout>
```

**Result:**
- `fitnesspro.one.ie/courses` → FitnessPro courses only
- `techcorp.one.ie/courses` → TechCorp courses only
- **Backend enforces data isolation, frontend just passes orgId**

---

## Deployment

### Frontend Deployment (Separate from Backend)

```bash
# Frontend (Astro)
cd frontend
npm run build
# Deploy to Cloudflare Pages / Vercel / Netlify

# Backend (Convex - separate deployment)
cd backend
npx convex deploy
# Deployed to shocking-falcon-870.convex.cloud
```

### Environment Setup

```bash
# Frontend .env
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud

# Frontend connects to this URL
# Frontend NEVER deploys to Convex
# Frontend is static site on Cloudflare Pages
```

---

## Summary

### Frontend Responsibilities (ONLY These)

| What | How | Example |
|------|-----|---------|
| **Render UI** | Astro pages + React components | `<h1>{course.name}</h1>` |
| **Call Backend** | `useQuery`, `useMutation` | `useQuery(api.queries.things.list)` |
| **Manage UI State** | `useState`, `useReducer` | `const [loading, setLoading] = useState(false)` |
| **Route Users** | Astro routing, middleware | `/courses/[id].astro` |
| **Display Errors** | Show backend error messages | `{error && <Alert>{error.message}</Alert>}` |

### Backend Responsibilities (See ontology-backend.md)

| What | Where | Example |
|------|-------|---------|
| **Database Operations** | Backend only | `ctx.db.query('things')...` |
| **Business Logic** | Backend only | Calculate prices, check quotas |
| **Data Validation** | Backend only | Validate email, check permissions |
| **Event Logging** | Backend only | `ctx.db.insert('events', ...)` |
| **Authorization** | Backend only | Check if user can access resource |

### The Contract

```typescript
// Frontend → Backend (only way to interact)

// ✅ Frontend calls backend query
const courses = useQuery(api.queries.things.list, { type: 'course' })

// ✅ Frontend calls backend mutation
const create = useMutation(api.mutations.things.create)
await create({ type: 'course', name: 'Fitness 101', properties: {...} })

// ✅ Backend implements logic
export const create = mutation({
  handler: async (ctx, args) => {
    // Validate
    // Create in database
    // Log event
    // Return result
  }
})

// ❌ Frontend NEVER accesses database directly
const courses = await ctx.db.query('things') // IMPOSSIBLE in frontend
```

### Key Principles

1. **Separation:** Frontend renders, backend manages data
2. **Type-Safe:** Backend generates types → Frontend uses them
3. **Real-Time:** WebSocket subscriptions auto-update UI
4. **Multi-Tenant:** Middleware extracts org → pages filter by org
5. **Stateless:** Frontend has no state beyond UI, backend is source of truth

### Next Steps

1. **Setup Backend First** (see ontology-backend.md)
2. **Get Backend URL** from Convex deployment
3. **Create Frontend** with `npm create astro@latest`
4. **Add Convex Client** and set `PUBLIC_CONVEX_URL`
5. **Sync Types** from backend to frontend
6. **Build UI Config** for all 66 thing types
7. **Create Generic Components** (ThingCard, ThingList, ThingForm)
8. **Add Pages** that call backend APIs
9. **Deploy Frontend** to Cloudflare Pages

---

**Frontend is pure rendering. Backend is everything else.**

Separate deployments. Type-safe connection. Real-time updates.

---

**END OF FRONTEND GUIDE**
