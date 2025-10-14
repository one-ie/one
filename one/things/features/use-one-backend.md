# Use ONE Backend - Backend as a Service

**Enable any developer to use ONE's 6-dimension backend without building their own**

---

## Executive Summary

The "Use ONE Backend" feature transforms the ONE platform from a standalone product into a **Backend as a Service (BaaS)** that any developer can opt into. With a single toggle, developers get instant access to:

- ✅ **Auth System**: 6 authentication methods via Better Auth + ONE ontology
- ✅ **6-Dimension Database**: Organizations, People, Things, Connections, Events, Knowledge
- ✅ **Real-time Sync**: Convex-powered subscriptions
- ✅ **Multi-tenancy**: Automatic organization isolation
- ✅ **Effect.ts SDK**: Type-safe, composable operations
- ✅ **API Keys**: Secure programmatic access
- ✅ **Free Tier**: Start with zero cost

**Architecture:**

```
┌─────────────────────────────────────────────────────────┐
│         Developer's Frontend (React/Astro/Vue)          │
│  - Install: npm install @oneie/sdk              │
│  - Configure: USE_ONE_BACKEND=true                     │
│  - Deploy: Anywhere (Vercel, Netlify, Cloudflare)     │
└────────────────┬────────────────────────────────────────┘
                 │ DataProvider + API Key
                 ↓
┌─────────────────────────────────────────────────────────┐
│              ONE Backend (BaaS)                         │
│  - URL: https://api.one.ie                             │
│  - Auth: Better Auth (6 methods)                       │
│  - Database: 6-dimension ontology                      │
│  - Real-time: Convex subscriptions                     │
│  - Rate Limiting: Per API key                          │
│  - Multi-tenant: Automatic isolation                   │
└─────────────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│         ONE Platform (Convex Backend)                   │
│  Production: https://shocking-falcon-870.convex.cloud   │
│                                                         │
│  Tables:                                                │
│  - organizations: Multi-tenant isolation                │
│  - people: Users with roles                             │
│  - things: Domain entities (66+ types)                  │
│  - connections: Relationships (25+ types)               │
│  - events: Complete audit trail (67+ types)             │
│  - knowledge: Vector embeddings for AI                  │
└─────────────────────────────────────────────────────────┘
```

**What This Enables:**

1. **Instant Auth**: Sign up users via Google/GitHub/Email without building auth
2. **Instant Database**: Store people, products, posts, etc. in the ontology
3. **Instant Real-time**: Subscribe to changes without WebSocket setup
4. **Instant Multi-tenancy**: Organizations automatically isolate data
5. **Instant AI**: Vector search on knowledge without embedding infrastructure

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Developer Onboarding Flow](#developer-onboarding-flow)
3. [Configuration & Environment Variables](#configuration--environment-variables)
4. [API Key Management](#api-key-management)
5. [Authentication Integration](#authentication-integration)
6. [Database Operations](#database-operations)
7. [SDK & DataProvider](#sdk--dataprovider)
8. [Rate Limiting & Quotas](#rate-limiting--quotas)
9. [Pricing Tiers](#pricing-tiers)
10. [Migration Path](#migration-path)
11. [Security & Isolation](#security--isolation)
12. [Example Use Cases](#example-use-cases)

---

## How It Works

### Toggle-Based Opt-In

Developers opt in via environment variable:

```env
# .env
USE_ONE_BACKEND=true
PUBLIC_ONE_API_KEY=ok_live_abc123def456
PUBLIC_ONE_ORG_ID=org_789xyz
```

**When `USE_ONE_BACKEND=true`:**

1. ✅ Auth requests route to `api.one.ie` instead of local backend
2. ✅ Database operations use ONE's Convex deployment
3. ✅ Organization & people created automatically via API
4. ✅ API key injected into all requests
5. ✅ Multi-tenancy enforced by ONE backend

**When `USE_ONE_BACKEND=false` (default):**

- Everything runs locally (self-hosted)
- Developer owns the backend
- Full control, full responsibility

---

## Developer Onboarding Flow

### Step 1: Sign Up on ONE Platform

Developer visits **https://one.ie/signup**:

```
1. Create account (john@example.com)
2. Verify email
3. Choose plan: Starter (free) → Pro → Enterprise
4. Organization created: "john-example" (org_abc123)
```

### Step 2: Enable "Use ONE Backend"

Dashboard toggle:

```
┌────────────────────────────────────────────────┐
│ Backend Settings                               │
├────────────────────────────────────────────────┤
│                                                │
│ ☑ Use ONE Backend (BaaS)                      │
│                                                │
│ Your applications can connect to our          │
│ managed backend instead of self-hosting.       │
│                                                │
│ ✅ Auth (6 methods)                            │
│ ✅ Database (6 dimensions)                     │
│ ✅ Real-time sync                              │
│ ✅ Free tier: 10K API calls/month             │
│                                                │
│ [Enable Backend Access] ← Click               │
└────────────────────────────────────────────────┘
```

**What Happens:**

1. **Organization Thing Created** (if not exists):
   ```typescript
   {
     _id: "org_abc123",
     type: "organization",
     name: "john-example",
     slug: "john-example",
     status: "active",
     plan: "starter",
     limits: {
       users: 100,
       apiCalls: 10000,
       storage: 1000000,  // 1 GB
       inference: 100      // AI queries
     },
     settings: {
       allowSignups: true,
       requireEmailVerification: true,
       enableTwoFactor: false
     }
   }
   ```

2. **Person Thing Created** (developer):
   ```typescript
   {
     _id: "person_john_123",
     type: "creator",
     email: "john@example.com",
     role: "org_owner",
     organizationId: "org_abc123",
     organizations: ["org_abc123"]
   }
   ```

3. **API Key Generated**:
   ```typescript
   {
     key: "ok_live_abc123def456",
     organizationId: "org_abc123",
     createdBy: "person_john_123",
     permissions: ["read", "write", "auth"],
     rateLimit: {
       calls: 10000,      // per month
       window: "monthly"
     },
     status: "active",
     expiresAt: null      // never expires (unless revoked)
   }
   ```

### Step 3: Install SDK

Developer installs SDK in their project:

```bash
npm install @oneie/sdk
```

### Step 4: Configure Environment

Add credentials to `.env`:

```env
# .env

# Toggle ONE Backend usage
USE_ONE_BACKEND=true

# ONE Platform credentials
PUBLIC_ONE_API_URL=https://api.one.ie
PUBLIC_ONE_API_KEY=ok_live_abc123def456
PUBLIC_ONE_ORG_ID=org_abc123

# Backend URL (when USE_ONE_BACKEND=true)
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
```

### Step 5: Initialize SDK

Configure SDK in app:

```typescript
// src/services/ClientLayer.ts
import { OneBackendProvider } from '@oneie/sdk'
import { Layer } from 'effect'

const useOneBackend = import.meta.env.USE_ONE_BACKEND === 'true'

export const ClientLayer = useOneBackend
  ? OneBackendProvider({
      apiUrl: import.meta.env.PUBLIC_ONE_API_URL,
      apiKey: import.meta.env.PUBLIC_ONE_API_KEY,
      organizationId: import.meta.env.PUBLIC_ONE_ORG_ID
    })
  : LocalBackendProvider({
      convexUrl: import.meta.env.PUBLIC_CONVEX_URL
    })
```

### Step 6: Use Auth & Database

Developer uses same API, different backend:

```typescript
// src/pages/signup.astro
import { AuthService } from '@oneie/sdk'
import { Effect } from 'effect'

const program = Effect.gen(function* () {
  const auth = yield* AuthService

  // Routes to ONE backend if USE_ONE_BACKEND=true
  return yield* auth.signUp({
    email: 'user@example.com',
    password: 'password123',
    name: 'New User'
  })
})

const user = await Effect.runPromise(
  program.pipe(Effect.provide(ClientLayer))
)

// User created in ONE backend → organizationId: org_abc123
```

**Result:**

- ✅ User stored in ONE's Convex deployment
- ✅ Scoped to developer's organization (`org_abc123`)
- ✅ Auth works via ONE's Better Auth integration
- ✅ Developer didn't build any backend

---

## Configuration & Environment Variables

### Complete `.env` Setup

```env
# ============================================
# ONE Backend Configuration
# ============================================

# Toggle: Use ONE's managed backend
USE_ONE_BACKEND=true

# ONE Platform API
PUBLIC_ONE_API_URL=https://api.one.ie
PUBLIC_ONE_API_KEY=ok_live_abc123def456  # From dashboard
PUBLIC_ONE_ORG_ID=org_abc123              # From dashboard

# Backend URL (ONE's Convex deployment)
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870

# ============================================
# Auth Configuration (Better Auth)
# ============================================

# Better Auth secret (for session tokens)
BETTER_AUTH_SECRET=your-secret-key-here

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Email (for verification, password reset)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password

# ============================================
# Optional: Local Backend (USE_ONE_BACKEND=false)
# ============================================

# LOCAL_CONVEX_URL=http://localhost:3000
# LOCAL_CONVEX_DEPLOYMENT=dev:local
```

### Auto-Injection via SDK

The `@oneie/sdk` automatically injects API key into requests:

```typescript
// SDK handles this internally
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'X-Organization-ID': organizationId,
  'Content-Type': 'application/json'
}
```

---

## API Key Management

### API Key Structure

```
ok_live_abc123def456
│  │    │
│  │    └─ Random string (secret)
│  └────── Environment (live, test)
└───────── Prefix (identifies as ONE key)
```

### Key Types

1. **Live Keys** (`ok_live_*`): Production use, real data
2. **Test Keys** (`ok_test_*`): Development, sandbox data

### Dashboard Management

Developers manage keys in dashboard:

```
┌─────────────────────────────────────────────────────────┐
│ API Keys                                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 📝 Live Keys (Production)                              │
│                                                         │
│ ok_live_abc123def456                                   │
│ Created: Oct 11, 2025                                  │
│ Last used: 2 minutes ago                               │
│ Calls this month: 1,234 / 10,000                       │
│ [Revoke] [Regenerate]                                  │
│                                                         │
│ ────────────────────────────────────────────────────── │
│                                                         │
│ 🧪 Test Keys (Development)                             │
│                                                         │
│ ok_test_xyz789ghi012                                   │
│ Created: Oct 10, 2025                                  │
│ Last used: Never                                       │
│ Calls this month: 0 / Unlimited                        │
│ [Revoke] [Regenerate]                                  │
│                                                         │
│ [+ Create New Key]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Key Permissions

Fine-grained control:

```typescript
{
  key: "ok_live_abc123",
  organizationId: "org_abc123",
  permissions: [
    "auth:signup",           // Allow user signups
    "auth:signin",           // Allow user signins
    "things:read",           // Read things
    "things:write",          // Create/update things
    "connections:read",      // Read connections
    "connections:write",     // Create connections
    "events:write",          // Log events
    "knowledge:query"        // Query vector embeddings
  ],
  rateLimit: {
    calls: 10000,
    window: "monthly",
    burstLimit: 100          // Max 100 req/second
  },
  ipWhitelist: [             // Optional IP restrictions
    "203.0.113.0/24"
  ]
}
```

### Revocation

Instant key revocation:

1. Click "Revoke" in dashboard
2. Key status → `revoked`
3. All requests with this key → 401 Unauthorized
4. Effect: Immediate (< 1 second globally)

---

## Authentication Integration

Developers get full Better Auth integration without setup.

### Reference: Better Auth + ONE Ontology

See: [`one/things/plans/better-auth-any-backend.md`](../plans/better-auth-any-backend.md)

**Key Points:**

- ✅ Users stored as **people** (dimension 2) with roles
- ✅ Sessions stored as **connections** (type: session)
- ✅ All auth actions logged as **events**
- ✅ 6 auth methods: Email, Google, GitHub, Apple, Magic Link, Passkey

### Usage in Developer's App

```typescript
// src/components/auth/SignUpForm.tsx
import { AuthService } from '@oneie/sdk'
import { Effect } from 'effect'
import { useEffectRunner } from '@oneie/sdk/react'

export function SignUpForm() {
  const { run, loading, error } = useEffectRunner()

  const handleSignUp = async (email: string, password: string) => {
    const program = Effect.gen(function* () {
      const auth = yield* AuthService

      // Routes to ONE backend → creates person in org_abc123
      const user = yield* auth.signUp({
        email,
        password,
        name: 'New User'
        // organizationId auto-injected from env
      })

      return user
    })

    await run(program)
  }

  return (
    <form onSubmit={handleSignUp}>
      {/* ... */}
    </form>
  )
}
```

**What Happens:**

1. Request sent to `https://api.one.ie/auth/signup`
2. API key validated → `org_abc123` verified
3. Person created in ONE's Convex:
   ```typescript
   {
     _id: "person_user_456",
     type: "creator",
     email: "user@example.com",
     organizationId: "org_abc123",  // Developer's org
     role: "org_user"
   }
   ```
4. Event logged:
   ```typescript
   {
     eventType: "sign_up",
     actorId: "person_user_456",
     organizationId: "org_abc123",
     metadata: { method: "email", success: true }
   }
   ```

---

## Database Operations

Developers use the same **DataProvider** interface, but operations route to ONE backend.

### Create Things

```typescript
// src/services/ProductService.ts
import { ThingService } from '@oneie/sdk'
import { Effect } from 'effect'

const createProduct = (name: string, price: number) =>
  Effect.gen(function* () {
    const things = yield* ThingService

    // Routes to ONE backend if USE_ONE_BACKEND=true
    const productId = yield* things.create({
      type: 'product',
      name,
      properties: {
        price,
        currency: 'USD',
        stock: 100
      }
      // organizationId auto-injected → org_abc123
    })

    return productId
  })
```

**Result:**

- ✅ Product stored in ONE's Convex deployment
- ✅ Scoped to `org_abc123` (automatic isolation)
- ✅ Real-time subscriptions work (Convex)
- ✅ Event logged: `product_created`

### Query Things

```typescript
// Get all products for this organization
const listProducts = Effect.gen(function* () {
  const things = yield* ThingService

  // Routes to ONE backend → filtered by org_abc123
  const products = yield* things.list({
    type: 'product',
    filters: {
      'properties.price': { $gte: 10, $lte: 100 }
    }
  })

  return products
})
```

**Result:**

- ✅ Only returns products from `org_abc123`
- ✅ Other orgs' data invisible (multi-tenancy)
- ✅ Real-time updates via Convex subscriptions

### Create Connections

```typescript
// Connect user to product (e.g., purchase)
const purchaseProduct = (userId: string, productId: string) =>
  Effect.gen(function* () {
    const connections = yield* ConnectionService

    const connectionId = yield* connections.create({
      fromPersonId: userId,      // User (person)
      toThingId: productId,      // Product (thing)
      relationshipType: 'purchased',
      metadata: {
        purchaseDate: Date.now(),
        price: 49.99,
        paymentMethod: 'stripe'
      }
    })

    return connectionId
  })
```

**Result:**

- ✅ Connection stored in ONE backend
- ✅ Scoped to `org_abc123`
- ✅ Event logged: `purchase_created`

### Vector Search (Knowledge)

```typescript
// Query knowledge base with AI
const searchDocs = (query: string) =>
  Effect.gen(function* () {
    const knowledge = yield* KnowledgeService

    // Routes to ONE backend → uses Convex vector search
    const results = yield* knowledge.query({
      query,
      k: 5,  // Top 5 results
      filters: {
        labels: ['docs', 'tutorial']
      }
    })

    return results
  })
```

**Result:**

- ✅ Vector search on ONE's knowledge table
- ✅ Scoped to `org_abc123`
- ✅ Uses OpenAI embeddings (automatic)

---

## SDK & DataProvider

### Installation

```bash
npm install @oneie/sdk effect
```

### Configuration

```typescript
// src/services/ClientLayer.ts
import { OneBackendProvider, LocalBackendProvider } from '@oneie/sdk'
import { Layer } from 'effect'

const useOneBackend = import.meta.env.USE_ONE_BACKEND === 'true'

export const ClientLayer = useOneBackend
  ? OneBackendProvider({
      apiUrl: import.meta.env.PUBLIC_ONE_API_URL,
      apiKey: import.meta.env.PUBLIC_ONE_API_KEY,
      organizationId: import.meta.env.PUBLIC_ONE_ORG_ID
    })
  : LocalBackendProvider({
      convexUrl: import.meta.env.PUBLIC_CONVEX_URL
    })
```

### DataProvider Interface

```typescript
// Same interface for both ONE backend and local backend
export interface DataProvider {
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>
    list: (params: { type: ThingType; filters?: any }) => Effect.Effect<Thing[], Error>
    create: (input: { type: ThingType; name: string; properties: any }) => Effect.Effect<string, Error>
    update: (id: string, updates: Partial<Thing>) => Effect.Effect<void, Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  connections: {
    create: (input: { fromPersonId: string; toThingId: string; relationshipType: string }) => Effect.Effect<string, Error>
    list: (params: { relationshipType: string; filters?: any }) => Effect.Effect<Connection[], Error>
    delete: (id: string) => Effect.Effect<void, Error>
  }

  events: {
    log: (event: { type: string; actorId: string; metadata?: any }) => Effect.Effect<void, Error>
  }

  knowledge: {
    query: (params: { query: string; k: number; filters?: any }) => Effect.Effect<KnowledgeChunk[], Error>
    create: (input: { text: string; sourcePersonId?: string }) => Effect.Effect<string, Error>
  }
}
```

### OneBackendProvider Implementation

```typescript
// @oneie/sdk/src/providers/OneBackendProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider } from './DataProvider'

export class OneBackendProvider implements DataProvider {
  constructor(
    private config: {
      apiUrl: string
      apiKey: string
      organizationId: string
    }
  ) {}

  things = {
    create: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(`${this.config.apiUrl}/things`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'X-Organization-ID': this.config.organizationId,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...input,
              organizationId: this.config.organizationId  // Auto-inject
            })
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }

          const data = await response.json()
          return data.thingId
        },
        catch: (error) => new Error(String(error))
      }),

    list: (params) =>
      Effect.tryPromise({
        try: async () => {
          const url = new URL(`${this.config.apiUrl}/things`)
          url.searchParams.set('type', params.type)
          url.searchParams.set('organizationId', this.config.organizationId)

          if (params.filters) {
            url.searchParams.set('filters', JSON.stringify(params.filters))
          }

          const response = await fetch(url.toString(), {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`
            }
          })

          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }

          return response.json()
        },
        catch: (error) => new Error(String(error))
      }),

    // ... other methods
  }

  // ... connections, events, knowledge
}

// Factory function
export const OneBackendProvider = (config: {
  apiUrl: string
  apiKey: string
  organizationId: string
}) =>
  Layer.succeed(
    DataProvider,
    new OneBackendProvider(config)
  )
```

**Key Points:**

- ✅ Same `DataProvider` interface as local backend
- ✅ Auto-injects `organizationId` into requests
- ✅ Auto-injects `Authorization` header with API key
- ✅ Routes to ONE's API (`https://api.one.ie`)
- ✅ Returns typed Effect errors

---

## Rate Limiting & Quotas

### Per-Organization Limits

```typescript
{
  organizationId: "org_abc123",
  plan: "starter",
  limits: {
    // API calls
    apiCalls: {
      monthly: 10000,
      burst: 100           // Max 100 req/sec
    },

    // Database
    things: 1000,          // Max 1K things
    connections: 5000,     // Max 5K connections
    storage: 1000000,      // 1 GB (bytes)

    // Auth
    users: 100,            // Max 100 people

    // AI
    inferenceTokens: 100000,  // 100K tokens/month
    embeddingTokens: 500000   // 500K tokens/month
  }
}
```

### Rate Limit Headers

ONE API returns rate limit info:

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9876
X-RateLimit-Reset: 1696118400
X-RateLimit-Burst: 100
```

### Quota Exceeded

When quota exceeded:

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1696118400

{
  "error": "quota_exceeded",
  "message": "Monthly API call limit reached (10,000). Upgrade to Pro for higher limits.",
  "upgradeUrl": "https://one.ie/pricing"
}
```

**SDK Handling:**

```typescript
// SDK automatically retries with exponential backoff
const program = Effect.gen(function* () {
  const things = yield* ThingService

  return yield* things.create({
    type: 'product',
    name: 'Widget'
  })
}).pipe(
  // Retry on rate limit (429)
  Effect.retry({
    times: 3,
    schedule: Schedule.exponential(1000)  // 1s, 2s, 4s
  })
)
```

---

## Pricing Tiers

### Starter (Free)

```
$0/month

✅ 10K API calls/month
✅ 100 users
✅ 1K things
✅ 1 GB storage
✅ 100K AI tokens
✅ Email support
```

### Pro ($29/month)

```
$29/month

✅ 100K API calls/month
✅ 1K users
✅ 10K things
✅ 10 GB storage
✅ 1M AI tokens
✅ Priority support
✅ Custom domain
```

### Enterprise (Custom)

```
Custom pricing

✅ Unlimited API calls
✅ Unlimited users
✅ Unlimited things
✅ Unlimited storage
✅ Unlimited AI tokens
✅ Dedicated support
✅ SLA guarantees
✅ Custom deployment
```

---

## Migration Path

### From Local Backend → ONE Backend

**Step 1:** Backup local data

```bash
bun scripts/backup-local-data.ts
```

**Step 2:** Enable ONE backend

```env
USE_ONE_BACKEND=true
PUBLIC_ONE_API_KEY=ok_live_abc123
PUBLIC_ONE_ORG_ID=org_abc123
```

**Step 3:** Migrate data

```typescript
// scripts/migrate-to-one-backend.ts
import { Effect } from 'effect'
import { ThingService } from '@oneie/sdk'
import { ClientLayer } from './services/ClientLayer'

const migrateData = Effect.gen(function* () {
  const things = yield* ThingService

  // Read local backup
  const localThings = readBackup('./backup-data.json')

  // Upload to ONE backend
  for (const thing of localThings) {
    yield* things.create({
      type: thing.type,
      name: thing.name,
      properties: thing.properties
    })
  }
})

await Effect.runPromise(
  migrateData.pipe(Effect.provide(ClientLayer))
)
```

### From ONE Backend → Local Backend

Reverse migration:

1. Export data via API
2. Set `USE_ONE_BACKEND=false`
3. Import data to local Convex

---

## Security & Isolation

### Multi-Tenant Isolation

**Automatic:**

- ✅ All queries filtered by `organizationId`
- ✅ API key scoped to single organization
- ✅ No cross-org data leakage

**Enforcement:**

```typescript
// Backend enforces org isolation
export const listThings = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    // Extract org from API key (validated middleware)
    const organizationId = ctx.auth.organizationId

    // ALWAYS filter by organizationId
    return await ctx.db
      .query('things')
      .withIndex('by_type', q => q.eq('type', args.type))
      .filter(q => q.eq(q.field('organizationId'), organizationId))
      .collect()
  }
})
```

### Row-Level Security

Data isolation at database level:

```typescript
// Convex schema with auth rules
export default defineSchema({
  things: defineTable({
    // ... fields
  })
    .index('by_organization', ['organizationId'])
    .searchIndex('by_name', {
      searchField: 'name',
      filterFields: ['organizationId']  // Filter by org in search
    })
})
```

### API Key Security

- ✅ Keys hashed at rest (bcrypt)
- ✅ HTTPS-only (TLS 1.3)
- ✅ Rotation supported
- ✅ IP whitelist optional
- ✅ Permissions granular

---

## Example Use Cases

### 1. SaaS Product Builder

**Scenario:** Developer building a CRM

```typescript
// Create customer
const createCustomer = (email: string, name: string) =>
  Effect.gen(function* () {
    const things = yield* ThingService

    // Routes to ONE backend
    const customerId = yield* things.create({
      type: 'customer',
      name,
      properties: {
        email,
        status: 'active',
        createdAt: Date.now()
      }
    })

    return customerId
  })
```

**Benefits:**

- ✅ No backend to build
- ✅ Multi-tenancy automatic (each CRM user = separate org)
- ✅ Real-time updates (Convex)
- ✅ Auth included (Better Auth)

### 2. Mobile App Backend

**Scenario:** React Native app needs backend

```typescript
// Mobile SDK usage
import { OneBackendProvider } from '@oneie/sdk/native'

const app = OneBackendProvider({
  apiUrl: 'https://api.one.ie',
  apiKey: 'ok_live_abc123',
  organizationId: 'org_abc123'
})

// Sign in
const user = await app.auth.signIn({
  email: 'user@example.com',
  password: 'password123'
})

// Store data
const postId = await app.things.create({
  type: 'post',
  name: 'My First Post',
  properties: {
    content: 'Hello world!',
    likes: 0
  }
})
```

**Benefits:**

- ✅ No server needed
- ✅ Works on iOS/Android
- ✅ Real-time sync
- ✅ Offline-first (Convex)

### 3. AI-Powered Knowledge Base

**Scenario:** Documentation site with AI search

```typescript
// Index documentation
const indexDocs = (markdown: string) =>
  Effect.gen(function* () {
    const knowledge = yield* KnowledgeService

    // Routes to ONE backend → embeds with OpenAI
    yield* knowledge.create({
      text: markdown,
      labels: ['docs', 'tutorial']
    })
  })

// Search with AI
const searchDocs = (query: string) =>
  Effect.gen(function* () {
    const knowledge = yield* KnowledgeService

    // Vector search on ONE backend
    const results = yield* knowledge.query({
      query,
      k: 5
    })

    return results
  })
```

**Benefits:**

- ✅ No vector DB setup (Convex built-in)
- ✅ No embedding API (OpenAI automatic)
- ✅ No infrastructure cost (Starter plan free)

---

## Summary

### What "Use ONE Backend" Provides

✅ **Instant Auth**: 6 methods (Email, Google, GitHub, Apple, Magic Link, Passkey)
✅ **Instant Database**: 6-dimension ontology (organizations, people, things, connections, events, knowledge)
✅ **Instant Real-time**: Convex-powered subscriptions
✅ **Instant Multi-tenancy**: Organizations automatically isolate data
✅ **Instant AI**: Vector search without infrastructure
✅ **Instant API**: RESTful + Effect.ts SDK
✅ **Free Tier**: Start with zero cost

### Developer Experience

1. **Sign up** at https://one.ie/signup
2. **Enable** "Use ONE Backend" toggle
3. **Copy** API key from dashboard
4. **Install** `@oneie/sdk`
5. **Configure** `.env` with credentials
6. **Build** app using same DataProvider interface
7. **Deploy** anywhere (Vercel, Netlify, Cloudflare)

### No Lock-In

- ✅ Same API for local backend and ONE backend
- ✅ Switch with single env variable: `USE_ONE_BACKEND=true/false`
- ✅ Export data anytime
- ✅ Migrate to self-hosted when ready

---

**Use ONE Backend = Firebase + Supabase + Better Auth, but with the 6-dimension ontology**

Toggle on. Build instantly. Scale effortlessly.
