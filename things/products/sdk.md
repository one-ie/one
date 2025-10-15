# ONE Platform SDK

**Simple, type-safe access to the ONE platform from any JavaScript/TypeScript application**

---

## Quick Start

```bash
npm install @oneie/sdk effect
```

```typescript
// Configure once
import { OneBackendProvider } from '@oneie/sdk'

const app = OneBackendProvider({
  apiUrl: 'https://api.one.ie',
  apiKey: process.env.ONE_API_KEY,
  organizationId: process.env.ONE_ORG_ID
})

// Use anywhere
const user = await app.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
})
```

That's it. Auth, database, real-time, and AI—all included.

---

## Installation

```bash
npm install @oneie/sdk effect
```

**Peer dependencies:**
- `effect` - For type-safe operations

---

## Configuration

### Environment Variables

```env
# .env
ONE_API_KEY=ok_live_abc123def456
ONE_ORG_ID=org_789xyz
ONE_API_URL=https://api.one.ie  # Optional, defaults to production
```

### Initialize SDK

```typescript
// src/lib/one.ts
import { OneBackendProvider } from '@oneie/sdk'

export const one = OneBackendProvider({
  apiUrl: process.env.ONE_API_URL || 'https://api.one.ie',
  apiKey: process.env.ONE_API_KEY!,
  organizationId: process.env.ONE_ORG_ID!
})
```

---

## Authentication

### Sign Up

```typescript
import { Effect } from 'effect'
import { one } from './lib/one'

const signUp = Effect.gen(function* () {
  const auth = yield* one.auth

  return yield* auth.signUp({
    email: 'user@example.com',
    password: 'secure-password',
    name: 'John Doe'
  })
})

const user = await Effect.runPromise(signUp)
```

### Sign In

```typescript
const signIn = Effect.gen(function* () {
  const auth = yield* one.auth

  return yield* auth.signIn({
    email: 'user@example.com',
    password: 'secure-password'
  })
})

const user = await Effect.runPromise(signIn)
```

### OAuth (Google, GitHub, Apple)

```typescript
// Redirect to OAuth provider
const oauthUrl = one.auth.getOAuthUrl('google', {
  redirectUrl: 'https://yourapp.com/auth/callback'
})

// Handle callback
const handleCallback = Effect.gen(function* () {
  const auth = yield* one.auth
  const code = new URLSearchParams(window.location.search).get('code')

  return yield* auth.handleOAuthCallback('google', code)
})
```

---

## Database Operations

### Things (Entities)

```typescript
// Create
const createProduct = Effect.gen(function* () {
  const things = yield* one.things

  return yield* things.create({
    type: 'product',
    name: 'Widget',
    properties: {
      price: 29.99,
      stock: 100
    }
  })
})

// List
const listProducts = Effect.gen(function* () {
  const things = yield* one.things

  return yield* things.list({
    type: 'product',
    filters: {
      'properties.price': { $lte: 50 }
    }
  })
})

// Get
const getProduct = (id: string) =>
  Effect.gen(function* () {
    const things = yield* one.things
    return yield* things.get(id)
  })

// Update
const updateProduct = (id: string, updates: any) =>
  Effect.gen(function* () {
    const things = yield* one.things
    return yield* things.update(id, updates)
  })

// Delete
const deleteProduct = (id: string) =>
  Effect.gen(function* () {
    const things = yield* one.things
    return yield* things.delete(id)
  })
```

### Connections (Relationships)

```typescript
// Create connection
const purchaseProduct = (userId: string, productId: string) =>
  Effect.gen(function* () {
    const connections = yield* one.connections

    return yield* connections.create({
      fromPersonId: userId,
      toThingId: productId,
      relationshipType: 'purchased',
      metadata: {
        price: 29.99,
        date: Date.now()
      }
    })
  })

// List connections
const getUserPurchases = (userId: string) =>
  Effect.gen(function* () {
    const connections = yield* one.connections

    return yield* connections.list({
      fromPersonId: userId,
      relationshipType: 'purchased'
    })
  })
```

### Events (Audit Trail)

```typescript
// Log event
const logEvent = Effect.gen(function* () {
  const events = yield* one.events

  return yield* events.log({
    type: 'page_view',
    actorId: 'person_123',
    metadata: {
      page: '/products',
      duration: 5000
    }
  })
})
```

### Knowledge (AI/Vector Search)

```typescript
// Index content
const indexContent = Effect.gen(function* () {
  const knowledge = yield* one.knowledge

  return yield* knowledge.create({
    text: 'Product documentation for Widget...',
    labels: ['docs', 'product']
  })
})

// Search
const searchDocs = (query: string) =>
  Effect.gen(function* () {
    const knowledge = yield* one.knowledge

    return yield* knowledge.query({
      query,
      k: 5  // Top 5 results
    })
  })
```

---

## Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = one.things.subscribe(
  { type: 'product' },
  (products) => {
    console.log('Products updated:', products)
  }
)

// Unsubscribe
subscription.unsubscribe()
```

---

## Error Handling

```typescript
import { Effect } from 'effect'

const program = Effect.gen(function* () {
  const things = yield* one.things
  return yield* things.get('product_123')
}).pipe(
  // Retry on failure
  Effect.retry({ times: 3 }),

  // Fallback value
  Effect.catchAll(() => Effect.succeed(null)),

  // Timeout
  Effect.timeout('5 seconds')
)

const result = await Effect.runPromise(program)
```

---

## React Integration

```typescript
// src/hooks/useOne.ts
import { useEffect, useState } from 'react'
import { Effect } from 'effect'
import { one } from '../lib/one'

export function useThings<T>(type: string) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const program = Effect.gen(function* () {
      const things = yield* one.things
      return yield* things.list({ type })
    })

    Effect.runPromise(program)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [type])

  return { data, loading, error }
}
```

```typescript
// Usage in component
function ProductList() {
  const { data: products, loading } = useThings('product')

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {products.map(p => (
        <li key={p._id}>{p.name}</li>
      ))}
    </ul>
  )
}
```

---

## API Reference

### `OneBackendProvider(config)`

```typescript
interface Config {
  apiUrl: string          // API endpoint
  apiKey: string          // Your API key
  organizationId: string  // Your organization ID
}
```

### `one.auth`

- `signUp(params)` - Create new user
- `signIn(params)` - Sign in user
- `signOut()` - Sign out
- `getSession()` - Get current session
- `resetPassword(email)` - Send reset email

### `one.things`

- `create(input)` - Create thing
- `get(id)` - Get thing by ID
- `list(params)` - List things
- `update(id, updates)` - Update thing
- `delete(id)` - Delete thing
- `subscribe(params, callback)` - Real-time subscription

### `one.connections`

- `create(input)` - Create connection
- `list(params)` - List connections
- `delete(id)` - Delete connection

### `one.events`

- `log(event)` - Log event

### `one.knowledge`

- `create(input)` - Index content
- `query(params)` - Vector search

---

## TypeScript Support

Full TypeScript support with inferred types:

```typescript
import type { Thing, Connection, Event } from '@oneie/sdk'

const product: Thing = {
  _id: 'product_123',
  type: 'product',
  name: 'Widget',
  properties: {
    price: 29.99
  }
}
```

---

## Local vs Backend Mode

Switch between local backend and ONE's managed backend:

```typescript
import { OneBackendProvider, LocalBackendProvider } from '@oneie/sdk'

const isLocal = process.env.USE_LOCAL_BACKEND === 'true'

export const one = isLocal
  ? LocalBackendProvider({
      convexUrl: process.env.CONVEX_URL
    })
  : OneBackendProvider({
      apiUrl: process.env.ONE_API_URL,
      apiKey: process.env.ONE_API_KEY,
      organizationId: process.env.ONE_ORG_ID
    })
```

Same API, different backend. No code changes required.

---

## Rate Limits

SDK automatically handles rate limiting:

- Retry with exponential backoff
- Respects `X-RateLimit-*` headers
- Queues requests when burst limit reached

```typescript
// Automatic retry on rate limit
const program = Effect.gen(function* () {
  const things = yield* one.things
  return yield* things.create({ type: 'product', name: 'Widget' })
}).pipe(
  Effect.retry({
    times: 3,
    schedule: Schedule.exponential('1 second')
  })
)
```

---

## Examples

### Complete Auth Flow

```typescript
// 1. Sign up
const user = await Effect.runPromise(
  Effect.gen(function* () {
    const auth = yield* one.auth
    return yield* auth.signUp({
      email: 'user@example.com',
      password: 'secure123'
    })
  })
)

// 2. Verify email (send verification)
await Effect.runPromise(
  Effect.gen(function* () {
    const auth = yield* one.auth
    return yield* auth.sendVerificationEmail(user.email)
  })
)

// 3. Sign in
const session = await Effect.runPromise(
  Effect.gen(function* () {
    const auth = yield* one.auth
    return yield* auth.signIn({
      email: 'user@example.com',
      password: 'secure123'
    })
  })
)
```

### E-commerce Example

```typescript
// Create product
const productId = await Effect.runPromise(
  Effect.gen(function* () {
    const things = yield* one.things
    return yield* things.create({
      type: 'product',
      name: 'Widget',
      properties: {
        price: 29.99,
        stock: 100,
        description: 'Amazing widget'
      }
    })
  })
)

// User purchases product
const connectionId = await Effect.runPromise(
  Effect.gen(function* () {
    const connections = yield* one.connections
    return yield* connections.create({
      fromPersonId: userId,
      toThingId: productId,
      relationshipType: 'purchased',
      metadata: {
        price: 29.99,
        date: Date.now(),
        paymentMethod: 'stripe'
      }
    })
  })
)

// Log purchase event
await Effect.runPromise(
  Effect.gen(function* () {
    const events = yield* one.events
    return yield* events.log({
      type: 'purchase',
      actorId: userId,
      metadata: {
        productId,
        price: 29.99
      }
    })
  })
)
```

---

## Support

- **Docs**: https://docs.one.ie
- **API Reference**: https://api.one.ie/docs
- **GitHub**: https://github.com/one-platform/sdk
- **Discord**: https://discord.gg/one-platform

---

**Simple. Type-safe. Powerful.**

Install once. Build anything.
