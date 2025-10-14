# ONE Frontend Architecture

**Building the Rendering Layer - Backend-Agnostic, Type-Safe, Composable**

---

## Executive Summary

The ONE frontend is **purely a rendering and interaction layer** with zero business logic. It:

1. **Renders UI** from data provided by backends
2. **Calls backend APIs** via abstract DataProvider interface
3. **Manages UI state** (loading, errors, forms)
4. **Displays real-time updates** via subscriptions

```
┌────────────────────────────────────────────────────────┐
│              FRONTEND (Astro + React)                  │
│  ✅ Renders HTML/React components                      │
│  ✅ Calls DataProvider interface                       │
│  ✅ Manages UI state only                              │
│  ✅ Backend-agnostic by design                         │
│  ❌ NO database access                                 │
│  ❌ NO business logic                                  │
│  ❌ NO data validation                                 │
└──────────────────────┬─────────────────────────────────┘
                       │ DataProvider Interface
                       │ (Universal 6-Dimension API)
                       ↓
┌────────────────────────────────────────────────────────┐
│         BACKEND PROVIDERS (Pluggable)                  │
│                                                        │
│  ConvexProvider      → Convex real-time backend       │
│  WordPressProvider   → WordPress CMS                  │
│  NotionProvider      → Notion databases               │
│  SupabaseProvider    → Supabase PostgreSQL            │
│  CustomProvider      → Your own API                   │
│                                                        │
│  Change backend with ONE line in config               │
└────────────────────────────────────────────────────────┘
```

**Tech Stack:**
- **Astro** - SSR/SSG (pages, layouts)
- **React 19** - Interactive components (islands)
- **Effect.ts** - Type-safe, composable operations
- **DataProvider Pattern** - Backend-agnostic interface
- **Tailwind + shadcn/ui** - Styling
- **TypeScript** - End-to-end type safety

---

## Table of Contents

1. [What Frontend IS and IS NOT](#what-frontend-is-and-is-not)
2. [Backend-Agnostic Architecture](#backend-agnostic-architecture)
3. [DataProvider Interface](#dataprovider-interface)
4. [Provider Implementations](#provider-implementations)
5. [Configuration](#configuration)
6. [Effect.ts Service Layer](#effectts-service-layer)
7. [React Integration](#react-integration)
8. [Component Patterns](#component-patterns)
9. [Page Patterns (SSR)](#page-patterns-ssr)
10. [Multi-Tenant Routing](#multi-tenant-routing)
11. [File Structure](#file-structure)
12. [Deployment](#deployment)

---

## What Frontend IS and IS NOT

### ✅ Frontend IS Responsible For:

**1. Rendering UI**
```tsx
<h1>{course.name}</h1>
<p>{course.properties.description}</p>
```

**2. Calling Backend APIs**
```tsx
const program = Effect.gen(function* () {
  const provider = yield* DataProvider
  return yield* provider.things.list({ type: 'course' })
})
```

**3. Managing UI State**
```tsx
const { run, loading, error } = useEffectRunner()
```

**4. User Interactions**
```tsx
<button onClick={handleClick}>Create Course</button>
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
  // Backend handles pricing, quotas, calculations
}
```

**3. Data Validation**
```tsx
// ❌ Frontend validation is UX-only
// Backend MUST validate for security
```

**4. Authorization**
```tsx
// ❌ Frontend can hide UI elements
// Backend MUST authorize all operations
```

---

## Backend-Agnostic Architecture

**Inspired by Astro's Content Layer Pattern**

Frontend components never know which backend they're talking to. Change backends by editing ONE line:

```typescript
// astro.config.ts
import { defineConfig } from 'astro/config'
import { one } from '@one/astro-integration'

// Import providers
import { convexProvider } from './src/providers/convex'
import { wordpressProvider } from './src/providers/wordpress'

export default defineConfig({
  integrations: [
    react(),
    one({
      // ✅ Change this ONE line to swap backends
      provider: convexProvider({
        url: import.meta.env.PUBLIC_CONVEX_URL
      })

      // Or use WordPress:
      // provider: wordpressProvider({
      //   url: 'https://yoursite.com',
      //   apiKey: import.meta.env.WORDPRESS_API_KEY
      // })
    })
  ]
})
```

**Key Principle:** Frontend code stays the same. Only data source changes.

---

## DataProvider Interface

**The universal 6-dimension ontology API.**

Every backend provider must implement this interface:

```typescript
// frontend/src/providers/DataProvider.ts
import { Effect, Context } from 'effect'

// Error types (universal across all providers)
export class ThingNotFoundError {
  readonly _tag = 'ThingNotFoundError'
  constructor(readonly thingId: string) {}
}

export class ConnectionCreateError {
  readonly _tag = 'ConnectionCreateError'
  constructor(readonly reason: string) {}
}

// DataProvider interface - all backends implement this
export interface DataProvider {
  // Dimension 1: Organizations
  organizations: {
    get: (id: string) => Effect.Effect<Organization, OrganizationNotFoundError>
    list: (params?: { status?: string }) => Effect.Effect<Organization[], Error>
    update: (id: string, updates: Partial<Organization>) => Effect.Effect<void, Error>
  }

  // Dimension 2: People
  people: {
    get: (id: string) => Effect.Effect<Person, PersonNotFoundError>
    list: (params: {
      organizationId?: string
      role?: string
    }) => Effect.Effect<Person[], Error>
    create: (input: {
      email: string
      displayName: string
      role: string
      organizationId: string
    }) => Effect.Effect<string, Error>
  }

  // Dimension 3: Things
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>
    list: (params: {
      type: ThingType
      organizationId?: string
      filters?: Record<string, any>
    }) => Effect.Effect<Thing[], Error>
    create: (input: {
      type: ThingType
      name: string
      organizationId: string
      properties: Record<string, any>
    }) => Effect.Effect<string, Error>
    update: (id: string, updates: Partial<Thing>) => Effect.Effect<void, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Dimension 4: Connections
  connections: {
    create: (input: {
      fromThingId: string
      toThingId: string
      relationshipType: ConnectionType
      metadata?: Record<string, any>
    }) => Effect.Effect<string, ConnectionCreateError>
    getRelated: (params: {
      thingId: string
      relationshipType: ConnectionType
      direction: 'from' | 'to' | 'both'
    }) => Effect.Effect<Thing[], Error>
    getCount: (thingId: string, relationshipType: ConnectionType) => Effect.Effect<number, Error>
  }

  // Dimension 5: Events
  events: {
    log: (event: {
      type: EventType
      actorId: string
      targetId?: string
      organizationId: string
      metadata?: Record<string, any>
    }) => Effect.Effect<void, Error>
  }

  // Dimension 6: Knowledge
  knowledge: {
    search: (params: {
      query: string
      organizationId?: string
      limit?: number
    }) => Effect.Effect<KnowledgeMatch[], Error>
  }
}

export const DataProvider = Context.GenericTag<DataProvider>('DataProvider')
```

**Key Insight:** This interface IS the ONE ontology. Any backend that implements it can power ONE.

---

## Provider Implementations

### Convex Provider

```typescript
// frontend/src/providers/convex/ConvexProvider.ts
import { Effect, Layer } from 'effect'
import { ConvexHttpClient } from 'convex/browser'
import { DataProvider } from '../DataProvider'

export class ConvexProvider implements DataProvider {
  constructor(private client: ConvexHttpClient) {}

  things = {
    get: (id: string) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.get, { id }),
        catch: (error) => new ThingNotFoundError(id)
      }),

    list: (params) =>
      Effect.tryPromise({
        try: () => this.client.query(api.queries.things.list, params),
        catch: (error) => new Error(String(error))
      }),

    create: (input) =>
      Effect.tryPromise({
        try: () => this.client.mutation(api.mutations.things.create, input),
        catch: (error) => new ConnectionCreateError(String(error))
      })
  }

  // ... connections, events, knowledge
}

export function convexProvider(config: { url: string }) {
  return Layer.succeed(
    DataProvider,
    new ConvexProvider(new ConvexHttpClient(config.url))
  )
}
```

### WordPress Provider

```typescript
// frontend/src/providers/wordpress/WordPressProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class WordPressProvider implements DataProvider {
  constructor(private baseUrl: string, private apiKey: string) {}

  things = {
    get: (id: string) =>
      Effect.gen(function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
              headers: { Authorization: `Bearer ${this.apiKey}` }
            }),
          catch: (error) => new Error(String(error))
        })

        const post = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform WordPress post → ONE thing
        return {
          _id: post.id.toString(),
          type: 'post' as ThingType,
          name: post.title.rendered,
          properties: {
            content: post.content.rendered,
            excerpt: post.excerpt.rendered
          },
          status: post.status,
          createdAt: new Date(post.date).getTime()
        }
      })
  }

  // ... other dimensions
}

export function wordpressProvider(config: { url: string; apiKey: string }) {
  return Layer.succeed(
    DataProvider,
    new WordPressProvider(config.url, config.apiKey)
  )
}
```

---

## Configuration

**Swap backends by changing ONE line:**

```typescript
// astro.config.ts
export default defineConfig({
  integrations: [
    react(),
    one({
      // Option 1: Convex (real-time, serverless)
      provider: convexProvider({
        url: import.meta.env.PUBLIC_CONVEX_URL
      })

      // Option 2: WordPress (existing CMS)
      // provider: wordpressProvider({
      //   url: 'https://yoursite.com',
      //   apiKey: import.meta.env.WORDPRESS_API_KEY
      // })

      // Option 3: Supabase (PostgreSQL + real-time)
      // provider: supabaseProvider({
      //   url: import.meta.env.PUBLIC_SUPABASE_URL,
      //   apiKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY
      // })

      // Option 4: Custom backend
      // provider: customProvider({ ... })
    })
  ]
})
```

---

## Effect.ts Service Layer

**Services wrap DataProvider in type-safe, composable operations.**

### Generic Thing Service

```typescript
// frontend/src/services/ThingService.ts
import { Effect } from 'effect'
import { DataProvider } from '@/providers/DataProvider'

export class ThingService extends Effect.Service<ThingService>()(
  'ThingService',
  {
    effect: Effect.gen(function* () {
      const provider = yield* DataProvider

      return {
        get: (id: string) => provider.things.get(id),

        list: (type: ThingType, orgId?: string) =>
          provider.things.list({
            type,
            organizationId: orgId
          }),

        create: (input: {
          type: ThingType
          name: string
          properties: any
        }) => provider.things.create(input),

        update: (id: string, updates: any) =>
          provider.things.update(id, updates),

        delete: (id: string) =>
          provider.things.delete(id)
      }
    }),
    dependencies: [DataProvider]
  }
) {}
```

### Generic Connection Service

```typescript
// frontend/src/services/ConnectionService.ts
import { Effect } from 'effect'
import { DataProvider } from '@/providers/DataProvider'

export class ConnectionService extends Effect.Service<ConnectionService>()(
  'ConnectionService',
  {
    effect: Effect.gen(function* () {
      const provider = yield* DataProvider

      return {
        create: (input: {
          fromThingId: string
          toThingId: string
          relationshipType: ConnectionType
        }) => provider.connections.create(input),

        getRelated: (thingId: string, relationshipType: ConnectionType) =>
          provider.connections.getRelated({
            thingId,
            relationshipType,
            direction: 'both'
          }),

        getCount: (thingId: string, relationshipType: ConnectionType) =>
          provider.connections.getCount(thingId, relationshipType)
      }
    }),
    dependencies: [DataProvider]
  }
) {}
```

**Key Point:** These 2 generic services handle ALL 66 thing types. No specialized services needed upfront.

---

## React Integration

### useEffectRunner Hook

```typescript
// frontend/src/hooks/useEffectRunner.ts
import { useCallback, useState } from 'react'
import { Effect } from 'effect'
import { ClientLayer } from '@/services/ClientLayer'

export function useEffectRunner() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async <A, E>(
    effect: Effect.Effect<A, E>,
    options?: {
      onSuccess?: (result: A) => void
      onError?: (error: E) => void
    }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(
        effect.pipe(Effect.provide(ClientLayer))
      )

      options?.onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      options?.onError?.(err as E)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { run, loading, error }
}
```

### Using in Components

```tsx
// frontend/src/components/CourseEnrollButton.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ConnectionService } from '@/services/ConnectionService'
import { Effect } from 'effect'

export function CourseEnrollButton({ courseId, userId }) {
  const { run, loading, error } = useEffectRunner()

  const handleEnroll = () => {
    const program = Effect.gen(function* () {
      const connections = yield* ConnectionService

      // Enroll = create connection
      return yield* connections.create({
        fromThingId: userId,
        toThingId: courseId,
        relationshipType: 'enrolled_in'
      })
    })

    run(program, {
      onSuccess: (id) => {
        console.log('Enrolled successfully')
        window.location.href = `/courses/${courseId}/learn`
      }
    })
  }

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading}>
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </button>
      {error && <Alert variant="destructive">{error}</Alert>}
    </div>
  )
}
```

---

## Component Patterns

### Generic Card Component

```tsx
// frontend/src/components/cards/Card.tsx
import { Card } from '@/components/ui/card'
import { getThingConfig } from '@/ontology/config'
import * as Icons from 'lucide-react'

interface CardProps {
  thing: {
    _id: string
    type: string
    name: string
    properties: Record<string, any>
  }
}

export function Card({ thing }: CardProps) {
  const config = getThingConfig(thing.type)
  const Icon = Icons[config.icon]

  const title = thing.properties[config.primaryField] || thing.name
  const subtitle = thing.properties[config.secondaryField]
  const image = thing.properties[config.imageField]

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

### Composable Operations

```tsx
// frontend/src/components/CourseCreator.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ThingService } from '@/services/ThingService'
import { ConnectionService } from '@/services/ConnectionService'
import { Effect } from 'effect'

export function CourseCreator() {
  const { run, loading, error } = useEffectRunner()
  const [formData, setFormData] = useState({ ... })

  const handleSubmit = async (e) => {
    e.preventDefault()

    const program = Effect.gen(function* () {
      const things = yield* ThingService
      const connections = yield* ConnectionService

      // 1. Create course
      const courseId = yield* things.create({
        type: 'course',
        name: formData.title,
        properties: formData
      })

      // 2. Create default lesson
      const lessonId = yield* things.create({
        type: 'lesson',
        name: 'Introduction',
        properties: { content: 'Welcome!' }
      })

      // 3. Connect lesson to course
      yield* connections.create({
        fromThingId: lessonId,
        toThingId: courseId,
        relationshipType: 'part_of'
      })

      return courseId
    })

    await run(program, {
      onSuccess: (id) => window.location.href = `/courses/${id}`
    })
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## Page Patterns (SSR)

### Fetch Data, Render HTML

```astro
---
// frontend/src/pages/courses/[id].astro
import { getConvexClient } from '@/lib/convex'
import { api } from '@/lib/api'
import Layout from '@/layouts/Layout.astro'

// SSR: Fetch from backend
const convex = getConvexClient()

const course = await convex.query(api.queries.things.get, {
  id: Astro.params.id
})

if (!course) {
  return Astro.redirect('/404')
}

const lessons = await convex.query(api.queries.connections.getRelated, {
  thingId: course._id,
  relationshipType: 'part_of',
  direction: 'to'
})
---

<Layout title={course.name}>
  <header>
    <h1>{course.name}</h1>
    <p>{course.properties.description}</p>
    <span>${course.properties.price}</span>
  </header>

  <section>
    <h2>Lessons</h2>
    {lessons.map(lesson => (
      <div>
        <h3>{lesson.name}</h3>
        <p>{lesson.properties.content}</p>
      </div>
    ))}
  </section>

  <!-- Interactive component (React Island) -->
  <EnrollButton client:load courseId={course._id} />
</Layout>
```

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

  if (['api', 'www', 'localhost'].includes(orgSlug)) {
    return next()
  }

  // Fetch org from backend
  const convex = getConvexClient()
  const org = await convex.query(api.queries.orgs.getBySlug, {
    slug: orgSlug
  })

  if (org) {
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
const org = Astro.locals.org

if (!org) {
  return Astro.redirect('/404')
}

const convex = getConvexClient()
const courses = await convex.query(api.queries.things.list, {
  type: 'course',
  organizationId: org._id
})
---

<Layout title={`${org.name} - Courses`}>
  <h1>{org.name} Courses</h1>
  {courses.map(course => (
    <Card thing={course} />
  ))}
</Layout>
```

---

## File Structure

```
frontend/
├── src/
│   ├── pages/                    # Astro pages (SSR/SSG)
│   │   ├── index.astro
│   │   ├── courses/
│   │   │   ├── index.astro
│   │   │   └── [id].astro
│   │   └── [thingType]/
│   │       └── [id].astro
│   ├── components/               # React components
│   │   ├── cards/
│   │   │   └── Card.tsx
│   │   ├── lists/
│   │   │   └── ThingList.tsx
│   │   └── forms/
│   │       └── ThingForm.tsx
│   ├── providers/                # Backend providers
│   │   ├── DataProvider.ts       # Interface
│   │   ├── convex/
│   │   │   └── ConvexProvider.ts
│   │   └── wordpress/
│   │       └── WordPressProvider.ts
│   ├── services/                 # Effect.ts services
│   │   ├── ThingService.ts
│   │   ├── ConnectionService.ts
│   │   └── ClientLayer.ts
│   ├── hooks/
│   │   └── useEffectRunner.ts
│   ├── ontology/
│   │   ├── types.ts              # Type definitions
│   │   └── config.ts             # UI config
│   └── middleware.ts
├── astro.config.ts               # Backend provider config
└── package.json
```

---

## Deployment

### Environment Setup

```bash
# Frontend .env
PUBLIC_CONVEX_URL=https://backend.convex.cloud

# Or WordPress
WORDPRESS_URL=https://yoursite.com
WORDPRESS_API_KEY=your-key

# Or Supabase
PUBLIC_SUPABASE_URL=https://project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Deploy Frontend

```bash
cd frontend
npm run build

# Deploy to:
# - Cloudflare Pages (recommended)
# - Vercel
# - Netlify
```

### Deploy Backend (Separate)

```bash
cd backend
npx convex deploy
# Deployed to: https://backend.convex.cloud
```

**Frontend and backend are completely separate deployments.**

---

## Summary

### Frontend Responsibilities

| What | How |
|------|-----|
| **Render UI** | Astro pages + React components |
| **Call Backend** | Effect.ts services via DataProvider |
| **Manage UI State** | useState, useEffectRunner |
| **Route Users** | Astro routing, middleware |

### Backend Responsibilities

| What | Where |
|------|-------|
| **Database Operations** | Backend only |
| **Business Logic** | Backend only |
| **Data Validation** | Backend only |
| **Authorization** | Backend only |

### Key Principles

1. **Backend-Agnostic** - Change backends with ONE line
2. **Type-Safe** - Effect.ts enforces error handling
3. **Composable** - Services combine into complex flows
4. **Multi-Tenant** - Subdomain-based org isolation
5. **Stateless** - Frontend has no state, backend is source of truth

### Three Backend Options

**Option 1: Self-Hosted (Convex, Supabase, WordPress, etc.)**
- Full control over infrastructure
- Use existing systems
- Implement DataProvider for your backend

**Option 2: ONE Backend (BaaS)**
- Zero backend work
- Managed service at api.one.ie
- Free tier: 10K API calls/month

**Option 3: Hybrid**
- Mix multiple backends
- Auth in Convex, blog in WordPress, products in Shopify
- CompositeProvider routes by thing type

---

**Frontend is pure rendering. Backend is everything else.**

Effect.ts for type-safety. DataProvider for flexibility. Separate deployments.
