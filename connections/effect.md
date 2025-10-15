# Effect.ts Full-Stack Pipeline

**100% Effect.ts coverage throughout the entire stack**

---

## Overview

Effect.ts provides type-safe, composable, testable code across the entire ONE platform:

```
Frontend (React + Effect.ts)
    ↓ HTTP/WebSocket
Hono API (Effect.ts handlers)
    ↓ Service calls
Business Logic (Effect.ts services)
    ↓ Database/Provider calls
Convex + Providers (Effect.ts wrappers)
```

## Documentation Structure

This guide is organized into focused sections:

### 1. [Frontend Integration](../things/docs/effect/frontend.mdx)
- React components with Effect.ts
- Client-side services
- Custom hooks
- Error handling in UI

### 2. [Hono API Integration](../things/docs/effect/hono-api.mdx)
- Effect.ts route handlers
- Middleware composition
- Error → HTTP response mapping
- Request context management

### 3. [Business Logic](../things/docs/effect/business-logic.mdx)
- Effect.Service patterns
- Service composition
- Typed errors
- Dependency injection

### 4. [Convex Integration](../things/docs/effect/convex-integration.mdx)
- ConvexDatabase Effect wrapper
- Query/mutation wrapping
- Real-time subscriptions
- Error handling

### 5. [External Providers](../things/docs/effect/providers.mdx)
- Stripe provider
- OpenAI provider
- Email provider
- Generic provider patterns

### 6. [Testing](../things/docs/effect/testing.mdx)
- Unit tests with mock layers
- Integration tests
- Test utilities
- No-mock testing

### 7. [Advanced Patterns](../things/docs/effect/patterns.mdx)
- Parallel execution
- Retry with backoff
- Resource management
- Logging & tracing
- Circuit breakers

## Core Principles

### 1. Consistent Error Handling
```typescript
// ✅ Typed errors everywhere
Effect.fail(new UnauthorizedError())
Effect.catchTag('UnauthorizedError', ...)
```

### 2. Composability
```typescript
// ✅ Small functions compose
const program = Effect.gen(function* () {
  const userService = yield* UserService
  const tokenService = yield* TokenService

  const user = yield* userService.get(userId)
  const balance = yield* tokenService.getBalance(userId)

  return { user, balance }
})
```

### 3. Dependency Injection
```typescript
// ✅ No globals, explicit dependencies
const ServerLayer = Layer.mergeAll(
  ConvexDatabase.Live,
  StripeProvider.Live,
  AuthService.Default
)

Effect.runPromise(program.pipe(Effect.provide(ServerLayer)))
```

### 4. Testability
```typescript
// ✅ No mocking, use test layers
const TestLayer = Layer.succeed(ConvexDatabase, {
  query: () => Effect.succeed(mockData)
})

Effect.runPromise(program.pipe(Effect.provide(TestLayer)))
```

## Quick Start

### Install Dependencies

```bash
npm install effect @effect/schema
```

### Basic Example

```typescript
import { Effect, Context, Layer } from 'effect'

// 1. Define error types
export class UserNotFoundError {
  readonly _tag = 'UserNotFoundError'
  constructor(readonly userId: string) {}
}

// 2. Define service
export class UserService extends Effect.Service<UserService>()(
  'UserService',
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase

      return {
        get: (userId: string) =>
          Effect.gen(function* () {
            const user = yield* db.query(api.queries.users.get, { id: userId })

            if (!user) {
              return yield* Effect.fail(new UserNotFoundError(userId))
            }

            return user
          })
      }
    }),
    dependencies: [ConvexDatabase]
  }
) {}

// 3. Use service
const program = Effect.gen(function* () {
  const userService = yield* UserService
  const user = yield* userService.get('user_123')
  return user
})

// 4. Run with dependencies
const result = await Effect.runPromise(
  program.pipe(
    Effect.provide(Layer.mergeAll(
      ConvexDatabase.Live,
      UserService.Default
    ))
  )
)
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│              FRONTEND (React + Effect)              │
│                                                     │
│  React Component                                    │
│    ↓                                                │
│  useEffect(() => {                                  │
│    Effect.runPromise(                               │
│      UserClientService.get({ userId })              │
│        .pipe(Effect.provide(ClientLayer))           │
│    )                                                │
│  })                                                 │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP Request
                       ↓
┌─────────────────────────────────────────────────────┐
│             HONO API (Effect Handlers)              │
│                                                     │
│  app.get('/user/:id', async (c) => {                │
│    const program = Effect.gen(function* () {        │
│      const auth = yield* AuthService                │
│      const userService = yield* UserService         │
│                                                     │
│      const session = yield* auth.verify()           │
│      const user = yield* userService.get(id)        │
│      return user                                    │
│    })                                               │
│                                                     │
│    return runEffectHandler(c, program.pipe(         │
│      Effect.provide(ServerLayer)                    │
│    ))                                               │
│  })                                                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│          BUSINESS LOGIC (Effect Services)           │
│                                                     │
│  export class UserService extends Effect.Service {  │
│    get: (id) =>                                     │
│      Effect.gen(function* () {                      │
│        const db = yield* ConvexDatabase             │
│        const user = yield* db.query(...)            │
│        return user                                  │
│      })                                             │
│  }                                                  │
└──────────────────────┬──────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────┐
│      CONVEX + PROVIDERS (Effect Wrappers)           │
│                                                     │
│  ConvexDatabase.Live                                │
│  StripeProvider.Live                                │
│  OpenAIProvider.Live                                │
└─────────────────────────────────────────────────────┘
```

## Benefits

### Type Safety
- ✅ Compiler enforces error handling
- ✅ All dependencies tracked in types
- ✅ IDE auto-complete for everything

### Composability
- ✅ Small functions combine into complex flows
- ✅ Reusable services across routes
- ✅ Easy to reason about

### Testability
- ✅ No mocking required
- ✅ Pure functions = deterministic tests
- ✅ Test layers replace real dependencies

### Observability
- ✅ Built-in logging (`Effect.logInfo`)
- ✅ Distributed tracing (`Effect.withSpan`)
- ✅ Runtime metrics

### Resilience
- ✅ Automatic retry with backoff
- ✅ Timeouts prevent hanging
- ✅ Circuit breakers for fault tolerance

## Next Steps

1. **Read the guides** - Start with [Frontend Integration](../things/docs/effect/frontend.mdx)
2. **Try examples** - Copy/paste and modify
3. **Build a service** - Create your first Effect service
4. **Write tests** - Use test layers instead of mocks
5. **Integrate** - Connect frontend → API → business logic

## Resources

- [Effect.ts Official Docs](https://effect.website)
- [Effect.ts Discord](https://discord.gg/effect-ts)
- [Effect.ts GitHub](https://github.com/Effect-TS/effect)

---

**Effect.ts provides the foundation for type-safe, composable, testable code across the entire ONE platform.**

Choose a guide to dive deeper.
