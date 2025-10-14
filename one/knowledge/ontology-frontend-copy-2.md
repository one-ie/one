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
- **Effect.ts** - Type-safe, composable API calls (2 generic services handle all 66 types)
- **Tailwind + shadcn/ui** - Styling
- **TypeScript** - Type safety
- **Convex Client** - Backend connection (NOT Convex backend itself)

**Effect.ts Philosophy:**
- **2 generic services** (ThingClientService + ConnectionClientService) handle ALL 66 thing types
- **Specialized services are optional** - add only when you repeat patterns 3+ times
- Course is just a thing with `type: 'course'` - no special service needed

---

## Table of Contents

1. [What Frontend IS and IS NOT](#what-frontend-is-and-is-not)
2. [Frontend File Structure](#frontend-file-structure)
3. [Ontology Config (Display Only)](#ontology-config-display-only)
4. [Connecting to Backend](#connecting-to-backend)
5. [Effect.ts Frontend Architecture](#effectts-frontend-architecture)
6. [Client-Side Services (Effect.ts)](#client-side-services-effectts)
7. [React Integration (useEffectRunner)](#react-integration-useeffectrunner)
8. [Component Patterns](#component-patterns)
9. [Page Patterns (SSR)](#page-patterns-ssr)
10. [Real-Time Components](#real-time-components)
11. [Forms (Calls Backend)](#forms-calls-backend)
12. [Multi-Tenant Routing](#multi-tenant-routing)
13. [Deployment](#deployment)

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
│   ├── services/                      # Effect.ts client services
│   │   ├── ConvexHttpClient.ts        # Convex client wrapper (required)
│   │   ├── ThingClientService.ts      # Thing operations (required)
│   │   ├── ConnectionClientService.ts # Connection operations (required)
│   │   ├── ClientLayer.ts             # Dependency injection layer (required)
│   │   └── CourseClientService.ts     # OPTIONAL: Course-specific convenience
│   ├── hooks/                         # React hooks
│   │   └── useEffectRunner.ts         # Run Effect programs in React
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

## Effect.ts Frontend Architecture

**Effect.ts provides type-safe, composable patterns for frontend API calls.**

### Why Effect.ts in Frontend?

```typescript
// ❌ Traditional approach - untyped errors, hard to compose
async function getCourse(id: string) {
  try {
    const response = await fetch(`/api/courses/${id}`)
    const course = await response.json()
    return course
  } catch (error) {
    // What type of error? Network? 404? 500?
    console.error(error)
    throw error
  }
}

// ✅ Effect.ts approach - typed errors, composable
import { Effect } from 'effect'

class CourseNotFoundError {
  readonly _tag = 'CourseNotFoundError'
  constructor(readonly courseId: string) {}
}

class NetworkError {
  readonly _tag = 'NetworkError'
  constructor(readonly message: string) {}
}

function getCourse(id: string) {
  return Effect.gen(function* () {
    const client = yield* ConvexHttpClient

    const course = yield* client.query(api.queries.things.get, { id })
      .pipe(
        Effect.catchTag('NetworkError', err =>
          Effect.fail(new NetworkError(err.message))
        )
      )

    if (!course) {
      return yield* Effect.fail(new CourseNotFoundError(id))
    }

    return course
  })
}
```

### Frontend Effect.ts Stack

```
┌────────────────────────────────────────────┐
│        React Components                     │
│  - useEffectRunner hook                     │
│  - Render UI from Effect results            │
│  - Handle typed errors                      │
└────────────────┬───────────────────────────┘
                 │ Effect.runPromise
                 ↓
┌────────────────────────────────────────────┐
│     Client Services (Effect.ts)             │
│  - CourseClientService                      │
│  - UserClientService                        │
│  - TokenClientService                       │
│  - Composable, testable                     │
└────────────────┬───────────────────────────┘
                 │ ConvexHttpClient
                 ↓
┌────────────────────────────────────────────┐
│        Backend API (Convex)                 │
│  - Queries & Mutations                      │
│  - Business logic                           │
│  - Database operations                      │
└────────────────────────────────────────────┘
```

### Key Benefits

1. **Type-Safe Errors**
   - Compiler enforces error handling
   - No more `catch(error: any)`
   - Know exactly what can fail

2. **Composability**
   - Small functions combine into complex flows
   - Reusable across components
   - Easy to reason about

3. **Testability**
   - No mocking required
   - Test layers replace real dependencies
   - Pure functions = deterministic tests

4. **Observability**
   - Built-in logging
   - Tracing support
   - Runtime metrics

---

## Client-Side Services (Effect.ts)

**Client services wrap backend API calls in Effect.ts patterns.**

### Core Principle: Generic Services Handle Everything

The ontology has **66 thing types**, but you only need **2 generic services**:

1. **ThingClientService** - All CRUD for all 66 types
2. **ConnectionClientService** - All relationships

```typescript
// ✅ This handles courses, lessons, products, everything
const thingService = yield* ThingClientService

// Get any thing
const course = yield* thingService.get(courseId)
const lesson = yield* thingService.get(lessonId)

// List any type
const courses = yield* thingService.list('course', orgId)
const products = yield* thingService.list('product', orgId)

// Create any type
const courseId = yield* thingService.create({
  type: 'course',
  name: 'Fitness 101',
  properties: { price: 99, description: '...' }
})
```

**Specialized services are OPTIONAL** - only add them if you repeat the same multi-step operations frequently.

---

### Pattern: Generic Thing Service (Required)

```typescript
// frontend/src/services/ThingClientService.ts
import { Effect, Context, Layer } from 'effect'
import { ConvexHttpClient } from './ConvexHttpClient'
import { api } from '@/lib/api'

// Define errors
export class ThingNotFoundError {
  readonly _tag = 'ThingNotFoundError'
  constructor(readonly thingId: string) {}
}

export class ThingCreateError {
  readonly _tag = 'ThingCreateError'
  constructor(readonly reason: string) {}
}

// Define service interface
export class ThingClientService extends Effect.Service<ThingClientService>()(
  'ThingClientService',
  {
    effect: Effect.gen(function* () {
      // Depend on HTTP client
      const client = yield* ConvexHttpClient

      return {
        // Get single thing
        get: (id: string) =>
          Effect.gen(function* () {
            const thing = yield* client.query(api.queries.things.get, { id })

            if (!thing) {
              return yield* Effect.fail(new ThingNotFoundError(id))
            }

            return thing
          }),

        // List things
        list: (type: string, orgId?: string) =>
          Effect.gen(function* () {
            return yield* client.query(api.queries.things.list, {
              type,
              organizationId: orgId
            })
          }),

        // Create thing
        create: (input: { type: string; name: string; properties: any }) =>
          Effect.gen(function* () {
            const id = yield* client.mutation(api.mutations.things.create, input)
              .pipe(
                Effect.catchAll(err =>
                  Effect.fail(new ThingCreateError(err.message))
                )
              )

            return id
          }),

        // Update thing
        update: (id: string, updates: any) =>
          Effect.gen(function* () {
            return yield* client.mutation(api.mutations.things.update, {
              id,
              updates
            })
          }),

        // Delete thing
        delete: (id: string) =>
          Effect.gen(function* () {
            return yield* client.mutation(api.mutations.things.delete, { id })
          })
      }
    }),
    dependencies: [ConvexHttpClient.Default]
  }
) {}
```

### Pattern: Specialized Service (Optional - Course Example)

**You don't need this!** A course is just a thing. But if you repeat operations, add convenience methods:

```typescript
// frontend/src/services/CourseClientService.ts (OPTIONAL)
import { Effect } from 'effect'
import { ThingClientService } from './ThingClientService'
import { ConnectionClientService } from './ConnectionClientService'

export class CourseClientService extends Effect.Service<CourseClientService>()(
  'CourseClientService',
  {
    effect: Effect.gen(function* () {
      const thingService = yield* ThingClientService
      const connectionService = yield* ConnectionClientService

      return {
        // Convenience: Get course with lessons
        // Without this, you'd do:
        //   const course = yield* thingService.get(courseId)
        //   const lessons = yield* connectionService.getRelated(courseId, 'part_of', 'to')
        getCourseWithLessons: (courseId: string) =>
          Effect.gen(function* () {
            const [course, lessons] = yield* Effect.all([
              thingService.get(courseId),
              connectionService.getRelated(courseId, 'part_of', 'to')
            ])

            return { course, lessons }
          }),

        // Convenience: Clearer domain vocabulary
        // Without this, you'd do:
        //   yield* connectionService.create({
        //     fromThingId: userId,
        //     toThingId: courseId,
        //     relationshipType: 'enrolled_in'
        //   })
        enrollUser: (userId: string, courseId: string) =>
          Effect.gen(function* () {
            return yield* connectionService.create({
              fromThingId: userId,
              toThingId: courseId,
              relationshipType: 'enrolled_in'
            })
          }),

        // Convenience: Specific count query
        getEnrollmentCount: (courseId: string) =>
          Effect.gen(function* () {
            return yield* connectionService.getCount(courseId, 'enrolled_in')
          })
      }
    }),
    dependencies: [ThingClientService.Default, ConnectionClientService.Default]
  }
) {}
```

**When to add specialized services:**
- ✅ Repeat the same multi-step operation 3+ times
- ✅ Want domain vocabulary (`enrollUser` vs `create connection`)
- ✅ Need to encapsulate complex business workflows
- ❌ Don't add them upfront for all 66 types
- ❌ Don't add them for simple CRUD (use ThingClientService)

### ConvexHttpClient Wrapper

```typescript
// frontend/src/services/ConvexHttpClient.ts
import { Effect, Context, Layer } from 'effect'
import { ConvexHttpClient as ConvexClient } from 'convex/browser'

// Define client interface
export class ConvexHttpClient extends Context.Tag('ConvexHttpClient')<
  ConvexHttpClient,
  {
    query: <T>(endpoint: any, args: any) => Effect.Effect<T, Error>
    mutation: <T>(endpoint: any, args: any) => Effect.Effect<T, Error>
  }
>() {}

// Live implementation
export const ConvexHttpClientLive = Layer.succeed(
  ConvexHttpClient,
  {
    query: (endpoint, args) =>
      Effect.tryPromise({
        try: () => {
          const client = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL)
          return client.query(endpoint, args)
        },
        catch: (error) => new Error(String(error))
      }),

    mutation: (endpoint, args) =>
      Effect.tryPromise({
        try: () => {
          const client = new ConvexClient(import.meta.env.PUBLIC_CONVEX_URL)
          return client.mutation(endpoint, args)
        },
        catch: (error) => new Error(String(error))
      })
  }
)
```

### Client Layer (Dependency Injection)

```typescript
// frontend/src/services/ClientLayer.ts
import { Layer } from 'effect'
import { ConvexHttpClientLive } from './ConvexHttpClient'
import { ThingClientService } from './ThingClientService'
import { ConnectionClientService } from './ConnectionClientService'
// import { CourseClientService } from './CourseClientService' // OPTIONAL

// ✅ Minimal layer - handles all 66 thing types
export const ClientLayer = Layer.mergeAll(
  ConvexHttpClientLive,
  ThingClientService.Default,
  ConnectionClientService.Default
  // CourseClientService.Default // Add ONLY if you created it
)
```

**Most apps only need the 2 generic services.** Add specialized services as you discover repeated patterns.

---

## React Integration (useEffectRunner)

**Custom hook for running Effect programs in React components.**

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
import { ConnectionClientService } from '@/services/ConnectionClientService'
import { Effect } from 'effect'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'

interface Props {
  courseId: string
  userId: string
}

export function CourseEnrollButton({ courseId, userId }: Props) {
  const { run, loading, error } = useEffectRunner()

  const handleEnroll = () => {
    // Define Effect program using GENERIC service
    const program = Effect.gen(function* () {
      const connectionService = yield* ConnectionClientService

      // Enroll = create connection (course is just a thing)
      const enrollmentId = yield* connectionService.create({
        fromThingId: userId,
        toThingId: courseId,
        relationshipType: 'enrolled_in'
      })

      // Log success (client-side only for UX)
      yield* Effect.logInfo(`Enrolled in course ${courseId}`)

      return enrollmentId
    })

    // Run Effect program
    run(program, {
      onSuccess: (enrollmentId) => {
        console.log('Enrolled successfully:', enrollmentId)
        window.location.href = `/courses/${courseId}/learn`
      },
      onError: (err) => {
        console.error('Enrollment failed:', err)
      }
    })
  }

  return (
    <div>
      <Button onClick={handleEnroll} disabled={loading}>
        {loading ? 'Enrolling...' : 'Enroll Now'}
      </Button>

      {error && (
        <Alert variant="destructive">{error}</Alert>
      )}
    </div>
  )
}
```

**Alternative with specialized service (if you created CourseClientService):**
```tsx
// OPTIONAL: If you have CourseClientService
const program = Effect.gen(function* () {
  const courseService = yield* CourseClientService
  return yield* courseService.enrollUser(userId, courseId)
})
```

### Pattern: Composable Operations

```tsx
// frontend/src/components/CourseCreator.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ThingClientService } from '@/services/ThingClientService'
import { ConnectionClientService } from '@/services/ConnectionClientService'
import { Effect } from 'effect'
import { useState } from 'react'

export function CourseCreator() {
  const { run, loading, error } = useEffectRunner()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Define COMPLEX Effect program with ONLY generic services
    const program = Effect.gen(function* () {
      const thingService = yield* ThingClientService
      const connectionService = yield* ConnectionClientService

      // 1. Create course (just a thing with type='course')
      const courseId = yield* thingService.create({
        type: 'course',
        name: formData.title,
        properties: {
          title: formData.title,
          description: formData.description,
          price: formData.price
        }
      })

      // 2. Create default lesson (just a thing with type='lesson')
      const lessonId = yield* thingService.create({
        type: 'lesson',
        name: 'Introduction',
        properties: {
          content: 'Welcome to the course!'
        }
      })

      // 3. Connect lesson to course (generic connection)
      yield* connectionService.create({
        fromThingId: lessonId,
        toThingId: courseId,
        relationshipType: 'part_of'
      })

      // 4. Return course ID
      return courseId
    }).pipe(
      // Add retry logic
      Effect.retry({ times: 3 }),
      // Add timeout
      Effect.timeout('5 seconds'),
      // Handle specific errors
      Effect.catchTag('ThingCreateError', err =>
        Effect.fail(new Error(`Failed to create course: ${err.reason}`))
      )
    )

    // Run the program
    const courseId = await run(program, {
      onSuccess: (id) => {
        window.location.href = `/courses/${id}`
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Course Title"
      />

      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
      />

      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
        placeholder="Price"
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Course'}
      </button>

      {error && <Alert variant="destructive">{error}</Alert>}
    </form>
  )
}
```

**Key Point:** This handles courses, products, lessons, EVERYTHING with just 2 generic services. No specialized services needed.

### Pattern: Parallel Data Fetching

```tsx
// frontend/src/components/CourseDashboard.tsx
import { useEffect, useState } from 'react'
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ThingClientService } from '@/services/ThingClientService'
import { ConnectionClientService } from '@/services/ConnectionClientService'
import { Effect } from 'effect'

interface Props {
  courseId: string
}

export function CourseDashboard({ courseId }: Props) {
  const { run, loading } = useEffectRunner()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    // Fetch all data in parallel using GENERIC services
    const program = Effect.gen(function* () {
      const thingService = yield* ThingClientService
      const connectionService = yield* ConnectionClientService

      // Parallel fetch (all run at once)
      // Course is just a thing, lessons are connected things
      const [course, lessons, enrollmentCount] = yield* Effect.all([
        thingService.get(courseId),
        connectionService.getRelated(courseId, 'part_of', 'to'),
        connectionService.getCount(courseId, 'enrolled_in')
      ], { concurrency: 'unbounded' })

      return { course, lessons, enrollmentCount }
    })

    run(program, {
      onSuccess: setData
    })
  }, [courseId])

  if (loading) return <div>Loading...</div>
  if (!data) return <div>No data</div>

  return (
    <div>
      <h1>{data.course.name}</h1>
      <p>{data.enrollmentCount} students enrolled</p>

      <h2>Lessons</h2>
      {data.lessons.map((lesson: any) => (
        <div key={lesson._id}>{lesson.name}</div>
      ))}
    </div>
  )
}
```

**This is where a specialized service provides value** - compare:

```tsx
// ❌ Without specialized service (3 separate operations)
const [course, lessons, enrollmentCount] = yield* Effect.all([
  thingService.get(courseId),
  connectionService.getRelated(courseId, 'part_of', 'to'),
  connectionService.getCount(courseId, 'enrolled_in')
])

// ✅ With specialized service (cleaner, if you repeat this pattern)
const data = yield* courseService.getCourseWithLessons(courseId)
const count = yield* courseService.getEnrollmentCount(courseId)
```

But you only add `CourseClientService` **after** you repeat this pattern 3+ times.

---

### Summary: Generic vs Specialized Services

```
┌─────────────────────────────────────────────────────────┐
│              66 Thing Types                             │
│  course, lesson, product, video, post, comment, etc.    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│         2 GENERIC SERVICES (handle everything)          │
│                                                         │
│  ThingClientService:                                    │
│    - get(id)                                            │
│    - list(type, orgId)                                  │
│    - create({ type, name, properties })                 │
│    - update(id, updates)                                │
│    - delete(id)                                         │
│                                                         │
│  ConnectionClientService:                               │
│    - create({ fromThingId, toThingId, relationshipType })│
│    - getRelated(thingId, relationshipType, direction)   │
│    - getCount(thingId, relationshipType)                │
│    - delete(connectionId)                               │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────┐
│   SPECIALIZED SERVICES (optional, add as needed)        │
│                                                         │
│  CourseClientService (if you repeat patterns):         │
│    - getCourseWithLessons() → wraps 2 calls            │
│    - enrollUser() → clearer vocabulary                 │
│    - getEnrollmentCount() → specific query             │
│                                                         │
│  Add specialized services ONLY when:                    │
│  ✅ You repeat the same 2-3 step operation 3+ times    │
│  ✅ You want clearer domain vocabulary                 │
│  ❌ Don't add upfront for all 66 types                 │
└─────────────────────────────────────────────────────────┘
```

**Start with generic services. Add specialized services as patterns emerge.**

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
| **Call Backend** | Effect.ts services or Convex hooks | `yield* courseService.get(id)` or `useQuery(api.queries.things.list)` |
| **Manage UI State** | `useState`, `useReducer`, `useEffectRunner` | `const { run, loading, error } = useEffectRunner()` |
| **Route Users** | Astro routing, middleware | `/courses/[id].astro` |
| **Display Errors** | Show typed backend errors | `Effect.catchTag('NotFoundError', ...)` |

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
2. **Type-Safe:** Effect.ts enforces error handling, backend generates types
3. **Composability:** Effect.ts services combine into complex flows
4. **Real-Time:** WebSocket subscriptions auto-update UI
5. **Multi-Tenant:** Middleware extracts org → pages filter by org
6. **Testability:** Effect.ts test layers replace mocks
7. **Stateless:** Frontend has no state beyond UI, backend is source of truth

### Next Steps

1. **Setup Backend First** (see ontology-backend.md)
2. **Get Backend URL** from Convex deployment
3. **Create Frontend** with `npm create astro@latest`
4. **Install Effect.ts** - `npm install effect @effect/schema`
5. **Add Convex Client** and set `PUBLIC_CONVEX_URL`
6. **Create Client Services** (ThingClientService, CourseClientService, etc.)
7. **Build ClientLayer** with all service dependencies
8. **Create useEffectRunner Hook** for React integration
9. **Sync Types** from backend to frontend
10. **Build UI Config** for all 66 thing types
11. **Create Generic Components** (ThingCard, ThingList, ThingForm)
12. **Add Pages** that call backend via Effect.ts services
13. **Deploy Frontend** to Cloudflare Pages

---

**Frontend is pure rendering. Backend is everything else.**

Effect.ts for type-safe composability. Separate deployments. Real-time updates.

---

## Additional Resources

### Effect.ts Documentation
- [Frontend Integration](../things/docs/effect/frontend.mdx) - React + Effect.ts patterns
- [Testing](../things/docs/effect/testing.mdx) - Test layers and no-mock testing
- [Effect.ts Official Docs](https://effect.website) - Complete Effect.ts guide

### Related Guides
- **ontology-backend.md** - Backend implementation (Convex + Effect.ts)
- **ontology-documentation.md** - Complete ontology overview
- **Ontology.md** - Full technical specification

---

**END OF FRONTEND GUIDE**
