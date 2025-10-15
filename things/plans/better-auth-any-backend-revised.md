# Better Auth + Any Backend: Universal Authentication (REVISED)

**Based on Better Auth's actual adapter system**

---

## Executive Summary

Better Auth is framework-agnostic and supports ANY database through its adapter system. This revised plan shows how to integrate Better Auth with ONE's backend providers using Better Auth's native adapter pattern.

**Better Auth's Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│         Better Auth Core                                │
│  - Authentication logic                                 │
│  - Session management                                   │
│  - OAuth providers                                      │
│  - 2FA, passkeys, etc.                                  │
└────────────────┬────────────────────────────────────────┘
                 │ Adapter Interface
                 │ (create, update, findOne, etc.)
                 ↓
┌─────────────────────────────────────────────────────────┐
│         Database Adapters                               │
│  - drizzleAdapter (SQLite, PostgreSQL, MySQL)           │
│  - prismaAdapter (all Prisma DBs)                       │
│  - mongodbAdapter (MongoDB)                             │
│  - kyselyAdapter (any SQL via Kysely)                   │
│  - customAdapter (your own)                             │
└────────────────┬────────────────────────────────────────┘
                 │
     ┌───────────┼───────────┬───────────┬───────────┐
     ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Convex  │ │Supabase │ │WordPress │ │  Neon    │ │ MongoDB  │
│         │ │Postgres │ │  MySQL   │ │PostgreSQL│ │          │
└─────────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Key Insight:** Better Auth has built-in adapters for Drizzle, Prisma, and MongoDB. For other backends (Convex, WordPress, custom APIs), we create custom adapters using Better Auth's `createAdapter` helper.

---

## Table of Contents

1. [Better Auth Architecture](#better-auth-architecture)
2. [Built-in Adapters](#built-in-adapters)
3. [Custom Adapter Pattern](#custom-adapter-pattern)
4. [Convex Adapter](#convex-adapter)
5. [Supabase Integration](#supabase-integration)
6. [WordPress Adapter](#wordpress-adapter)
7. [Configuration](#configuration)
8. [Schema Management](#schema-management)
9. [Testing](#testing)
10. [Migration Strategy](#migration-strategy)

---

## Better Auth Architecture

### Core Schema

Better Auth requires 4 tables:

1. **user** - User profiles
2. **session** - Active sessions
3. **account** - OAuth accounts
4. **verification** - Email verification, password reset tokens

### Adapter Interface

Better Auth adapters implement these methods:

```typescript
interface DatabaseAdapter {
  // Create
  create: (params: {
    model: string
    data: Record<string, any>
    select?: string[]
  }) => Promise<Record<string, any>>

  // Read
  findOne: (params: {
    model: string
    where: Array<{ field: string; value: any }>
    select?: string[]
  }) => Promise<Record<string, any> | null>

  findMany: (params: {
    model: string
    where?: Array<{ field: string; value: any }>
    limit?: number
    offset?: number
    sortBy?: { field: string; direction: 'asc' | 'desc' }
  }) => Promise<Record<string, any>[]>

  // Update
  update: (params: {
    model: string
    where: Array<{ field: string; value: any }>
    update: Record<string, any>
  }) => Promise<Record<string, any>>

  updateMany: (params: {
    model: string
    where: Array<{ field: string; value: any }>
    update: Record<string, any>
  }) => Promise<number>

  // Delete
  delete: (params: {
    model: string
    where: Array<{ field: string; value: any }>
  }) => Promise<void>

  deleteMany: (params: {
    model: string
    where: Array<{ field: string; value: any }>
  }) => Promise<number>

  // Count
  count: (params: {
    model: string
    where?: Array<{ field: string; value: any }>
  }) => Promise<number>
}
```

**Key Point:** Better Auth abstracts database operations into model-based CRUD operations.

---

## Built-in Adapters

### 1. Drizzle Adapter

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // "sqlite" | "pg" | "mysql"
  }),

  emailAndPassword: { enabled: true },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  }
})
```

**Schema Generation:**
```bash
# Generate Drizzle schema
npx @better-auth/cli generate

# Create migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

**Supported with:** Supabase, Neon, PlanetScale, PostgreSQL, MySQL, SQLite

### 2. Prisma Adapter

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  })
})
```

**Schema Generation:**
```bash
# Generate Prisma schema
npx @better-auth/cli generate

# Apply to database
npx prisma db push
# or
npx prisma migrate dev
```

**Supported with:** PostgreSQL, MySQL, SQLite, MongoDB, SQL Server, CockroachDB

### 3. MongoDB Adapter

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient("mongodb://localhost:27017/database")
const db = client.db()

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client // Optional: enables transactions
  })
})
```

**No schema migration needed!** MongoDB collections are created automatically.

### 4. Kysely Adapter (Direct SQL)

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { Pool } from "pg"

export const auth = betterAuth({
  // ✅ Pass Pool directly - Better Auth uses Kysely internally
  database: new Pool({
    connectionString: process.env.DATABASE_URL
  })
})
```

**Schema Generation:**
```bash
# Generate SQL schema
npx @better-auth/cli generate

# Apply schema manually
psql $DATABASE_URL < schema.sql
```

**Supported with:** PostgreSQL, MySQL, SQLite, MS SQL, and any Kysely-supported database

---

## Custom Adapter Pattern

### Creating a Custom Adapter

```typescript
// frontend/src/auth/adapters/custom.ts
import { createAdapter } from "better-auth/adapters"

export interface CustomAdapterConfig {
  client: any // Your database client
  debugLogs?: boolean
}

export const customAdapter = (config: CustomAdapterConfig) =>
  createAdapter({
    // Adapter metadata
    config: {
      adapterId: "custom-adapter",
      adapterName: "Custom Adapter",
      supportsNumericIds: false, // UUIDs
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true
    },

    // Adapter implementation
    adapter: ({ options, schema, debugLog }) => {
      const { client } = config

      return {
        // Create
        create: async ({ model, data, select }) => {
          debugLog("Creating", model, data)

          // Your database create logic
          const result = await client.create(model, data)

          // Return created record
          return result
        },

        // Find one
        findOne: async ({ model, where, select }) => {
          debugLog("Finding one", model, where)

          // Your database query logic
          const result = await client.findOne(model, where)

          return result || null
        },

        // Find many
        findMany: async ({ model, where, limit, offset, sortBy }) => {
          debugLog("Finding many", model, where)

          // Your database query logic
          const results = await client.findMany(model, {
            where,
            limit,
            offset,
            orderBy: sortBy
          })

          return results
        },

        // Update
        update: async ({ model, where, update }) => {
          debugLog("Updating", model, where, update)

          // Your database update logic
          const result = await client.update(model, where, update)

          return result
        },

        // Update many
        updateMany: async ({ model, where, update }) => {
          debugLog("Updating many", model, where, update)

          // Your database update logic
          const count = await client.updateMany(model, where, update)

          return count
        },

        // Delete
        delete: async ({ model, where }) => {
          debugLog("Deleting", model, where)

          // Your database delete logic
          await client.delete(model, where)
        },

        // Delete many
        deleteMany: async ({ model, where }) => {
          debugLog("Deleting many", model, where)

          // Your database delete logic
          const count = await client.deleteMany(model, where)

          return count
        },

        // Count
        count: async ({ model, where }) => {
          debugLog("Counting", model, where)

          // Your database count logic
          const count = await client.count(model, where)

          return count
        }
      }
    }
  })
```

### Testing Your Adapter

```typescript
// frontend/src/auth/adapters/__tests__/custom.test.ts
import { runAdapterTest } from "better-auth/adapters/test"
import { customAdapter } from "../custom"

describe("Custom Adapter", () => {
  it("passes adapter test suite", async () => {
    const adapter = customAdapter({
      client: myTestClient
    })

    await runAdapterTest({
      getAdapter: async () => adapter
    })
  })
})
```

---

## Convex Adapter

### Implementation

```typescript
// frontend/src/auth/adapters/convex.ts
import { createAdapter } from "better-auth/adapters"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/lib/api"

export interface ConvexAdapterConfig {
  url: string
  debugLogs?: boolean
}

export const convexAdapter = (config: ConvexAdapterConfig) =>
  createAdapter({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      supportsNumericIds: false,
      supportsJSON: true,
      supportsDates: true,
      supportsBooleans: true
    },

    adapter: ({ options, schema, debugLog }) => {
      const client = new ConvexHttpClient(config.url)

      return {
        create: async ({ model, data }) => {
          const result = await client.mutation(api.auth.create, {
            model,
            data
          })
          return result
        },

        findOne: async ({ model, where }) => {
          const result = await client.query(api.auth.findOne, {
            model,
            where
          })
          return result
        },

        findMany: async ({ model, where, limit, offset }) => {
          const results = await client.query(api.auth.findMany, {
            model,
            where,
            limit,
            offset
          })
          return results
        },

        update: async ({ model, where, update }) => {
          const result = await client.mutation(api.auth.update, {
            model,
            where,
            update
          })
          return result
        },

        updateMany: async ({ model, where, update }) => {
          const count = await client.mutation(api.auth.updateMany, {
            model,
            where,
            update
          })
          return count
        },

        delete: async ({ model, where }) => {
          await client.mutation(api.auth.delete, {
            model,
            where
          })
        },

        deleteMany: async ({ model, where }) => {
          const count = await client.mutation(api.auth.deleteMany, {
            model,
            where
          })
          return count
        },

        count: async ({ model, where }) => {
          const count = await client.query(api.auth.count, {
            model,
            where
          })
          return count
        }
      }
    }
  })
```

### Convex Backend Functions

```typescript
// backend/convex/auth.ts
import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

// Create
export const create = mutation({
  args: {
    model: v.string(),
    data: v.any()
  },
  handler: async (ctx, { model, data }) => {
    const id = await ctx.db.insert(model as any, data)
    const doc = await ctx.db.get(id)
    return doc
  }
})

// Find one
export const findOne = query({
  args: {
    model: v.string(),
    where: v.array(v.object({ field: v.string(), value: v.any() }))
  },
  handler: async (ctx, { model, where }) => {
    let query = ctx.db.query(model as any)

    for (const condition of where) {
      query = query.filter(q => q.eq(q.field(condition.field), condition.value))
    }

    return await query.first()
  }
})

// Find many
export const findMany = query({
  args: {
    model: v.string(),
    where: v.optional(v.array(v.object({ field: v.string(), value: v.any() }))),
    limit: v.optional(v.number()),
    offset: v.optional(v.number())
  },
  handler: async (ctx, { model, where, limit, offset }) => {
    let query = ctx.db.query(model as any)

    if (where) {
      for (const condition of where) {
        query = query.filter(q => q.eq(q.field(condition.field), condition.value))
      }
    }

    const results = await query.collect()

    // Apply offset and limit
    const start = offset || 0
    const end = limit ? start + limit : undefined
    return results.slice(start, end)
  }
})

// Update
export const update = mutation({
  args: {
    model: v.string(),
    where: v.array(v.object({ field: v.string(), value: v.any() })),
    update: v.any()
  },
  handler: async (ctx, { model, where, update }) => {
    // Find record
    let query = ctx.db.query(model as any)
    for (const condition of where) {
      query = query.filter(q => q.eq(q.field(condition.field), condition.value))
    }
    const doc = await query.first()

    if (!doc) {
      throw new Error(`Record not found in ${model}`)
    }

    // Update
    await ctx.db.patch(doc._id, update)

    // Return updated
    return await ctx.db.get(doc._id)
  }
})

// Delete
export const _delete = mutation({
  args: {
    model: v.string(),
    where: v.array(v.object({ field: v.string(), value: v.any() }))
  },
  handler: async (ctx, { model, where }) => {
    // Find record
    let query = ctx.db.query(model as any)
    for (const condition of where) {
      query = query.filter(q => q.eq(q.field(condition.field), condition.value))
    }
    const doc = await query.first()

    if (!doc) {
      throw new Error(`Record not found in ${model}`)
    }

    // Delete
    await ctx.db.delete(doc._id)
  }
})

// Count
export const count = query({
  args: {
    model: v.string(),
    where: v.optional(v.array(v.object({ field: v.string(), value: v.any() })))
  },
  handler: async (ctx, { model, where }) => {
    let query = ctx.db.query(model as any)

    if (where) {
      for (const condition of where) {
        query = query.filter(q => q.eq(q.field(condition.field), condition.value))
      }
    }

    const results = await query.collect()
    return results.length
  }
})
```

### Convex Schema

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_email", ["email"]),

  session: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.string()
  }).index("by_token", ["token"]),

  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.string(),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index("by_user", ["userId"]),

  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number())
  }).index("by_identifier", ["identifier"])
})
```

---

## Supabase Integration

**Use Drizzle or Prisma adapter with Supabase PostgreSQL:**

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  })
})
```

**Generate schema:**
```bash
npx @better-auth/cli generate
npx drizzle-kit generate
npx drizzle-kit push
```

---

## WordPress Adapter

```typescript
// frontend/src/auth/adapters/wordpress.ts
import { createAdapter } from "better-auth/adapters"

export const wordpressAdapter = (config: {
  url: string
  username: string
  password: string
}) =>
  createAdapter({
    config: {
      adapterId: "wordpress",
      adapterName: "WordPress Adapter"
    },

    adapter: () => {
      const authHeader = `Basic ${btoa(`${config.username}:${config.password}`)}`

      return {
        create: async ({ model, data }) => {
          // Map to WordPress tables
          const endpoint = model === "user" ? "users" : `one_${model}s`

          const response = await fetch(
            `${config.url}/wp-json/one-auth/v1/${endpoint}`,
            {
              method: "POST",
              headers: {
                Authorization: authHeader,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(data)
            }
          )

          return await response.json()
        },

        findOne: async ({ model, where }) => {
          const endpoint = model === "user" ? "users" : `one_${model}s`
          const query = new URLSearchParams(
            where.reduce((acc, { field, value }) => {
              acc[field] = String(value)
              return acc
            }, {} as Record<string, string>)
          )

          const response = await fetch(
            `${config.url}/wp-json/one-auth/v1/${endpoint}?${query}`,
            {
              headers: { Authorization: authHeader }
            }
          )

          const results = await response.json()
          return results[0] || null
        },

        // Implement other methods...
      }
    }
  })
```

---

## Configuration

### Basic Setup

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { convexAdapter } from "./adapters/convex"

export const auth = betterAuth({
  // ✅ Database adapter
  database: convexAdapter({
    url: import.meta.env.PUBLIC_CONVEX_URL
  }),

  // Base URL
  baseURL: import.meta.env.PUBLIC_APP_URL,

  // Email & Password
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET
    },
    github: {
      clientId: import.meta.env.GITHUB_CLIENT_ID,
      clientSecret: import.meta.env.GITHUB_CLIENT_SECRET
    }
  },

  // Session
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },

  // Advanced
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".one.ie"
    }
  }
})
```

### Multi-Backend Setup

```typescript
// Use different adapters per environment
const getAuthAdapter = () => {
  const provider = import.meta.env.PUBLIC_AUTH_BACKEND

  switch (provider) {
    case "convex":
      return convexAdapter({ url: import.meta.env.PUBLIC_CONVEX_URL })

    case "supabase":
      return drizzleAdapter(supabaseDb, { provider: "pg" })

    case "wordpress":
      return wordpressAdapter({
        url: import.meta.env.WORDPRESS_URL,
        username: import.meta.env.WORDPRESS_USERNAME,
        password: import.meta.env.WORDPRESS_APP_PASSWORD
      })

    default:
      throw new Error(`Unknown auth backend: ${provider}`)
  }
}

export const auth = betterAuth({
  database: getAuthAdapter()
})
```

---

## Schema Management

### Generate Schema

```bash
# Generate schema for your adapter
npx @better-auth/cli generate

# For Drizzle
npx drizzle-kit generate
npx drizzle-kit push

# For Prisma
npx prisma db push

# For Kysely (raw SQL)
psql $DATABASE_URL < schema.sql
```

### Custom Schema Names

```typescript
// frontend/src/auth/config.ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "./schema"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    // ✅ Map to custom table names
    schema: {
      user: schema.users,
      session: schema.user_sessions,
      account: schema.oauth_accounts,
      verification: schema.email_verifications
    }
  })
})
```

---

## Testing

### Adapter Test Suite

```typescript
// frontend/src/auth/adapters/__tests__/convex.test.ts
import { runAdapterTest } from "better-auth/adapters/test"
import { convexAdapter } from "../convex"

describe("Convex Adapter", () => {
  it("passes Better Auth adapter tests", async () => {
    const adapter = convexAdapter({
      url: "http://localhost:3210"
    })

    await runAdapterTest({
      getAdapter: async () => adapter
    })
  })
})
```

### Integration Tests

```typescript
// frontend/src/auth/__tests__/auth.test.ts
import { describe, it, expect } from "vitest"
import { auth } from "../config"

describe("Auth Integration", () => {
  it("signs up a user", async () => {
    const result = await auth.api.signUp.email({
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    })

    expect(result.user.email).toBe("test@example.com")
  })

  it("signs in a user", async () => {
    const result = await auth.api.signIn.email({
      email: "test@example.com",
      password: "password123"
    })

    expect(result.user).toBeDefined()
    expect(result.session).toBeDefined()
  })
})
```

---

## Migration Strategy

### Step 1: Choose Adapter

```typescript
// Built-in adapters (recommended)
✅ Drizzle - for Supabase, Neon, PlanetScale, PostgreSQL, MySQL
✅ Prisma - for any Prisma-supported database
✅ MongoDB - for MongoDB

// Custom adapters (for special backends)
✅ Convex - custom adapter
✅ WordPress - custom adapter
✅ Your API - custom adapter
```

### Step 2: Install Dependencies

```bash
# For Drizzle
npm install drizzle-orm @better-auth/cli

# For Prisma
npm install prisma @prisma/client @better-auth/cli

# For MongoDB
npm install mongodb @better-auth/cli

# For Convex
npm install convex @better-auth/cli
```

### Step 3: Generate Schema

```bash
npx @better-auth/cli generate
```

### Step 4: Configure Better Auth

```typescript
import { betterAuth } from "better-auth"
import { yourAdapter } from "./adapters/your-adapter"

export const auth = betterAuth({
  database: yourAdapter({ /* config */ })
})
```

### Step 5: Test

```bash
npm test
```

---

## Summary

### Better Auth + ONE

✅ **Built-in Adapters**: Drizzle, Prisma, MongoDB
✅ **Custom Adapters**: Convex, WordPress, custom APIs
✅ **Type-Safe**: Full TypeScript support
✅ **Testing**: Built-in adapter test suite
✅ **Flexible**: Works with ANY database
✅ **No Lock-in**: Switch adapters easily

### Implementation Checklist

- [ ] Choose adapter (built-in or custom)
- [ ] Install dependencies
- [ ] Generate schema
- [ ] Configure Better Auth
- [ ] Test adapter
- [ ] Deploy

### Recommended Adapters by Backend

| Backend | Adapter | Complexity |
|---------|---------|------------|
| **Supabase** | Drizzle | ⭐ Easy |
| **Neon** | Drizzle | ⭐ Easy |
| **PlanetScale** | Drizzle | ⭐ Easy |
| **MongoDB** | MongoDB | ⭐ Easy |
| **PostgreSQL** | Prisma/Drizzle | ⭐ Easy |
| **MySQL** | Prisma/Drizzle | ⭐ Easy |
| **Convex** | Custom | ⭐⭐ Medium |
| **WordPress** | Custom | ⭐⭐ Medium |
| **Custom API** | Custom | ⭐⭐⭐ Advanced |

### Next Steps

1. Review Better Auth docs: https://www.better-auth.com/docs
2. Choose your backend
3. Select appropriate adapter
4. Generate schema
5. Test and deploy

---

**Better Auth + ANY Backend = Universal Authentication**

One auth system. Any database. Zero lock-in.
