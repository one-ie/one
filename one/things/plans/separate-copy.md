# Frontend-Backend Separation Plan

## Executive Summary

**Goal:** Transform the current tightly-coupled architecture into a fully headless, API-first architecture where:
- Frontend: Pure Astro/React UI (no Convex dependency)
- Backend: Hono API + Convex (standalone service)
- Connection: REST API with API key authentication

**Current State:** Frontend directly imports Convex hooks (`useQuery`, `useMutation`) and calls Convex functions.

**Target State:** Frontend only knows about REST API endpoints, authenticates with API keys, and has zero knowledge of Convex.

---

## Table of Contents

1. [Architecture Comparison](#architecture-comparison)
2. [Benefits of Separation](#benefits-of-separation)
3. [Migration Strategy](#migration-strategy)
4. [API Key Authentication](#api-key-authentication)
5. [File Structure Changes](#file-structure-changes)
6. [Implementation Steps](#implementation-steps)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Changes](#deployment-changes)

---

## Architecture Comparison

### Current Architecture (Coupled)

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Astro + React)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages & Components                              │  │
│  │  ├─ import { useQuery } from 'convex/react'      │  │
│  │  ├─ import { api } from 'convex/_generated/api'  │  │
│  │  └─ const data = useQuery(api.entities.get)     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  frontend/convex/* (schema, mutations, queries)        │
│  ↓ Direct WebSocket Connection                         │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   CONVEX BACKEND      │
        │  (Real-time DB)       │
        └───────────────────────┘
```

**Problems:**
- ❌ Frontend tightly coupled to Convex
- ❌ Can't swap backend without rewriting frontend
- ❌ Hard to version API (breaking changes impact frontend immediately)
- ❌ No clear API boundary
- ❌ Can't reuse backend for mobile/desktop apps without Convex SDK
- ❌ Multi-tenancy requires each frontend to have own Convex deployment

---

### Target Architecture (Separated)

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Headless)                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Pages & Components                              │  │
│  │  ├─ import { apiClient } from '@/lib/api'        │  │
│  │  ├─ const data = await api.tokens.get(id)       │  │
│  │  └─ No Convex imports!                           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  HTTP Requests with API Key                            │
│  Authorization: Bearer sk_live_xxx                     │
└─────────────────────────────────────────────────────────┘
                    │
                    ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (Hono + Convex)                │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Routes (Hono on Cloudflare Workers)         │  │
│  │  /api/auth/*   - Authentication                  │  │
│  │  /api/tokens/* - Token operations                │  │
│  │  /api/agents/* - Agent management                │  │
│  │  /api/content/*- Content CRUD                    │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Middleware                                      │  │
│  │  ├─ API Key Validation                           │  │
│  │  ├─ Rate Limiting                                │  │
│  │  ├─ CORS                                         │  │
│  │  └─ Request Logging                              │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Business Logic (Effect.ts Services)             │  │
│  │  - TokenService, AgentService, etc.              │  │
│  │  - Pure functional logic                         │  │
│  │  - Type-safe error handling                      │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│  ┌────────────────┴─────────────────────────────────┐  │
│  │  Data Layer (ConvexHttpClient)                   │  │
│  │  - Queries/mutations via HTTP                    │  │
│  │  - 6-dimension ontology access                    │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │   CONVEX BACKEND      │
        │  - entities           │
        │  - connections        │
        │  - events             │
        │  - knowledge          │
        │  - API keys (stored)  │
        └───────────────────────┘
```

**Benefits:**
- ✅ Frontend can be swapped/rebuilt independently
- ✅ Backend API can serve web, mobile, desktop, CLI
- ✅ Clear API versioning (/api/v1, /api/v2)
- ✅ API keys enable multi-tenancy (one backend, many frontends)
- ✅ Standard REST patterns (easy for any dev to understand)
- ✅ Can rate limit, monitor, version API independently

---

## Benefits of Separation

### 1. Multi-Tenancy Support

**Before:**
```
Org A → Frontend A → Convex Deployment A
Org B → Frontend B → Convex Deployment B
Org C → Frontend C → Convex Deployment C

❌ 3 orgs = 3 Convex deployments (expensive, hard to manage)
```

**After:**
```
Org A → Frontend A ──┐
                     ├→ Single Backend API → Single Convex Deployment
Org B → Frontend B ──┤   (with API key isolation)
                     │
Org C → Frontend C ──┘

✅ 3 orgs = 1 Convex deployment (cheap, centralized)
```

### 2. Platform Independence

**Before:**
- Web: Must use Convex React hooks
- Mobile: Must use Convex React Native SDK
- Desktop: Must use Convex Electron SDK
- CLI: Must use Convex Node SDK

❌ Each platform needs Convex SDK

**After:**
- Web: HTTP fetch() or axios
- Mobile: HTTP client (works with any framework)
- Desktop: HTTP client (works with any framework)
- CLI: curl or HTTP client

✅ Any platform that speaks HTTP works

### 3. Team Organization

**Before:**
```
Full-stack developer needs to know:
- Astro
- React
- Convex schema
- Convex queries/mutations
- Convex actions
- Effect.ts
- Business logic
```

**After:**
```
Frontend developer needs to know:
- Astro
- React
- API endpoints (documented)

Backend developer needs to know:
- Hono routes
- Effect.ts
- Convex schema
- Business logic
```

✅ Clear separation of concerns

### 4. API Evolution

**Before:**
```
Change Convex schema → Frontend breaks immediately
❌ No versioning, no backwards compatibility
```

**After:**
```
/api/v1/tokens → Stable, never breaks
/api/v2/tokens → New version with improvements

Frontend chooses which version to use
✅ Graceful deprecation, backwards compatible
```

---

## Migration Strategy

### Phase 1: Backend API Creation (No Frontend Changes)

**Goal:** Build standalone Hono API that mirrors current Convex functions

**Tasks:**
1. Create `/backend/api/` directory
2. Implement Hono routes for all Convex queries/mutations
3. Add API key authentication middleware
4. Deploy to Cloudflare Workers
5. Test all endpoints with Postman/curl

**Timeline:** 1-2 weeks

**Risk:** Low (frontend still works with Convex)

---

### Phase 2: Frontend API Client Library

**Goal:** Create abstraction layer in frontend that can switch between Convex and HTTP

**Tasks:**
1. Create `/frontend/src/lib/api/client.ts`
2. Implement API client with same interface as Convex hooks
3. Add environment variable toggle: `USE_API_BACKEND=true/false`
4. Test dual mode (frontend works with both)

**Timeline:** 1 week

**Risk:** Low (can toggle back to Convex if issues)

---

### Phase 3: Gradual Migration

**Goal:** Migrate frontend page by page from Convex hooks to API client

**Tasks:**
1. Migrate `/blog` pages first (low risk)
2. Migrate `/tokens` pages
3. Migrate `/agents` pages
4. Migrate authentication pages last (highest risk)

**Timeline:** 2-3 weeks

**Risk:** Medium (careful testing needed per page)

---

### Phase 4: Remove Convex from Frontend

**Goal:** Delete `frontend/convex/*` and all Convex dependencies

**Tasks:**
1. Verify all pages use API client
2. Remove Convex imports from `package.json`
3. Delete `frontend/convex/` directory
4. Update build process

**Timeline:** 1 week

**Risk:** Low (if Phase 3 done correctly)

---

## API Key Authentication

### Key Types

**1. Secret Keys (Backend-to-Backend)**
```
sk_live_1234567890abcdef
sk_test_1234567890abcdef
```

**2. Publishable Keys (Frontend-Safe)**
```
pk_live_1234567890abcdef
pk_test_1234567890abcdef
```

### Database Schema

**New Entity Type: `api_key`**

```typescript
{
  type: "api_key",
  name: "Production API Key for Org A",
  properties: {
    keyPrefix: "sk_live",      // or "sk_test", "pk_live", "pk_test"
    keyHash: "sha256(...)",     // Hashed key (never store plaintext!)
    keyHint: "...def",          // Last 3 chars for display
    orgId: "org_123",           // Which org owns this key
    scopes: [                   // What can this key do?
      "tokens:read",
      "tokens:write",
      "agents:read",
      "agents:write"
    ],
    rateLimit: {
      requests: 1000,           // Max requests per minute
      period: 60                // Period in seconds
    },
    expiresAt: 1735689600000,  // Optional expiration
    lastUsedAt: null,
    createdBy: "user_123",
    environment: "production"   // or "development"
  },
  status: "active",             // or "revoked"
  createdAt: 1704067200000,
  updatedAt: 1704067200000
}
```

### Middleware Implementation

**Backend: API Key Validation Middleware**

```typescript
// backend/api/middleware/auth.ts
import { Context, Next } from "hono";
import { createHash } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

export async function validateApiKey(c: Context, next: Next) {
  // Extract API key from header
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing API key" }, 401);
  }

  const apiKey = authHeader.replace("Bearer ", "");

  // Validate key format
  if (!apiKey.match(/^(sk|pk)_(live|test)_[a-zA-Z0-9]{24}$/)) {
    return c.json({ error: "Invalid API key format" }, 401);
  }

  // Hash the key
  const keyHash = createHash("sha256").update(apiKey).digest("hex");

  // Query Convex for matching key
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
  const keyEntity = await convex.query(api.queries.apiKeys.validate, {
    keyHash
  });

  if (!keyEntity) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  if (keyEntity.status !== "active") {
    return c.json({ error: "API key revoked" }, 401);
  }

  // Check expiration
  if (keyEntity.properties.expiresAt && Date.now() > keyEntity.properties.expiresAt) {
    return c.json({ error: "API key expired" }, 401);
  }

  // Check scopes (if route requires specific scope)
  const requiredScope = c.req.param("scope");
  if (requiredScope && !keyEntity.properties.scopes.includes(requiredScope)) {
    return c.json({ error: "Insufficient permissions" }, 403);
  }

  // Rate limiting check
  const rateLimitKey = `rate_limit:${keyEntity._id}`;
  const currentCount = await getRateLimitCount(rateLimitKey);

  if (currentCount >= keyEntity.properties.rateLimit.requests) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  // Increment rate limit counter
  await incrementRateLimit(rateLimitKey, keyEntity.properties.rateLimit.period);

  // Update last used timestamp (async, don't wait)
  convex.mutation(api.mutations.apiKeys.updateLastUsed, {
    keyId: keyEntity._id
  }).catch(console.error);

  // Attach org context to request
  c.set("orgId", keyEntity.properties.orgId);
  c.set("keyScopes", keyEntity.properties.scopes);
  c.set("apiKeyId", keyEntity._id);

  await next();
}
```

**Frontend: API Client with Key**

```typescript
// frontend/src/lib/api/client.ts
export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || import.meta.env.PUBLIC_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error, response.status);
    }

    return response.json();
  }

  // Tokens API
  tokens = {
    get: (id: string) =>
      this.request<Token>(`/api/v1/tokens/${id}`),

    list: (params?: { orgId?: string; limit?: number }) =>
      this.request<Token[]>(`/api/v1/tokens?${new URLSearchParams(params)}`),

    create: (data: CreateTokenInput) =>
      this.request<Token>("/api/v1/tokens", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    purchase: (id: string, amount: number) =>
      this.request<PurchaseResult>(`/api/v1/tokens/${id}/purchase`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
  };

  // Agents API
  agents = {
    get: (id: string) =>
      this.request<Agent>(`/api/v1/agents/${id}`),

    list: () =>
      this.request<Agent[]>("/api/v1/agents"),

    create: (data: CreateAgentInput) =>
      this.request<Agent>("/api/v1/agents", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Add more resource methods...
}

// Export singleton with environment API key
export const api = new ApiClient(
  import.meta.env.PUBLIC_API_KEY || ""
);
```

**Usage in Frontend:**

```astro
---
// frontend/src/pages/tokens/[id].astro
import { api } from "@/lib/api/client";
import Layout from "@/layouts/Layout.astro";

const { id } = Astro.params;
const token = await api.tokens.get(id);
---

<Layout title={token.name}>
  <h1>{token.name}</h1>
  <p>Balance: {token.properties.balance}</p>
</Layout>
```

---

## File Structure Changes

### Before (Coupled)

```
frontend/
├── convex/                    # ❌ Remove entire directory
│   ├── _generated/
│   ├── mutations/
│   ├── queries/
│   ├── schema.ts
│   └── http.ts
├── src/
│   ├── components/
│   │   └── TokenCard.tsx      # Uses useQuery(api.tokens.get)
│   └── pages/
│       └── tokens/[id].astro  # Uses ConvexHttpClient
└── package.json               # Includes "convex": "^1.x.x"

backend/
└── convex/                    # Only Convex deployment
```

### After (Separated)

```
frontend/
├── src/
│   ├── lib/
│   │   └── api/
│   │       ├── client.ts      # ✅ API client (no Convex)
│   │       ├── types.ts       # ✅ Type definitions
│   │       └── errors.ts      # ✅ Error handling
│   ├── components/
│   │   └── TokenCard.tsx      # ✅ Uses api.tokens.get()
│   └── pages/
│       └── tokens/[id].astro  # ✅ Uses api.tokens.get()
├── .env                       # PUBLIC_API_KEY=pk_live_xxx
└── package.json               # ❌ No Convex dependency

backend/
├── api/                       # ✅ New Hono API
│   ├── routes/
│   │   ├── tokens.ts          # /api/v1/tokens/*
│   │   ├── agents.ts          # /api/v1/agents/*
│   │   ├── auth.ts            # /api/v1/auth/*
│   │   └── index.ts           # Route aggregation
│   ├── middleware/
│   │   ├── auth.ts            # API key validation
│   │   ├── cors.ts            # CORS handling
│   │   ├── rateLimit.ts       # Rate limiting
│   │   └── logging.ts         # Request logging
│   ├── services/              # Effect.ts business logic
│   │   ├── tokens/
│   │   ├── agents/
│   │   └── auth/
│   └── index.ts               # Hono app entry point
├── convex/                    # Existing Convex backend
│   ├── queries/
│   │   └── apiKeys.ts         # ✅ New: API key queries
│   ├── mutations/
│   │   └── apiKeys.ts         # ✅ New: API key mutations
│   └── schema.ts              # ✅ Add api_key entity type
└── wrangler.toml              # Cloudflare Workers config
```

---

## Implementation Steps

### Step 1: Create API Key Entity Type

**File: `backend/convex/schema.ts`**

Add to existing schema:

```typescript
export default defineSchema({
  // ... existing entities table

  entities: defineTable({
    type: v.string(),  // Add "api_key" as new type
    name: v.string(),
    properties: v.any(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived"),
      v.literal("revoked"),  // ✅ Add for API keys
    )),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_key_hash", ["properties.keyHash"]),  // ✅ Add for fast lookup

  // ... rest of schema
});
```

### Step 2: Create API Key Queries

**File: `backend/convex/queries/apiKeys.ts`**

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

export const validate = query({
  args: { keyHash: v.string() },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("entities")
      .withIndex("by_key_hash", (q) =>
        q.eq("properties.keyHash", args.keyHash)
      )
      .filter((q) => q.eq(q.field("type"), "api_key"))
      .first();

    return apiKey;
  },
});

export const listByOrg = query({
  args: { orgId: v.string() },
  handler: async (ctx, args) => {
    const keys = await ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", "api_key"))
      .filter((q) => q.eq(q.field("properties.orgId"), args.orgId))
      .collect();

    // Don't return keyHash (security)
    return keys.map(key => ({
      ...key,
      properties: {
        ...key.properties,
        keyHash: undefined,  // Remove sensitive data
      }
    }));
  },
});
```

### Step 3: Create API Key Mutations

**File: `backend/convex/mutations/apiKeys.ts`**

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { createHash, randomBytes } from "crypto";

export const create = mutation({
  args: {
    orgId: v.string(),
    name: v.string(),
    scopes: v.array(v.string()),
    environment: v.union(v.literal("production"), v.literal("development")),
  },
  handler: async (ctx, args) => {
    // Generate random API key
    const prefix = args.environment === "production" ? "sk_live" : "sk_test";
    const random = randomBytes(18).toString("base64url");
    const apiKey = `${prefix}_${random}`;

    // Hash the key for storage
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const keyHint = apiKey.slice(-3);

    // Create entity
    const keyId = await ctx.db.insert("entities", {
      type: "api_key",
      name: args.name,
      properties: {
        keyPrefix: prefix,
        keyHash,
        keyHint,
        orgId: args.orgId,
        scopes: args.scopes,
        rateLimit: {
          requests: 1000,
          period: 60,
        },
        environment: args.environment,
        lastUsedAt: null,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Return plaintext key ONLY this once
    return {
      id: keyId,
      apiKey,  // ⚠️ Show user - never shown again!
      keyHint,
    };
  },
});

export const revoke = mutation({
  args: { keyId: v.id("entities") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.keyId, {
      status: "revoked",
      updatedAt: Date.now(),
    });
  },
});

export const updateLastUsed = mutation({
  args: { keyId: v.id("entities") },
  handler: async (ctx, args) => {
    const key = await ctx.db.get(args.keyId);
    if (!key) return;

    await ctx.db.patch(args.keyId, {
      properties: {
        ...key.properties,
        lastUsedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});
```

### Step 4: Create Hono API Backend

**File: `backend/api/index.ts`**

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { validateApiKey } from "./middleware/auth";
import tokensRoutes from "./routes/tokens";
import agentsRoutes from "./routes/agents";
import authRoutes from "./routes/auth";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("/api/*", cors({
  origin: [
    "http://localhost:4321",
    "https://*.pages.dev",
    process.env.FRONTEND_URL || "",
  ].filter(Boolean),
  credentials: true,
}));

// Health check (no auth required)
app.get("/health", (c) => c.json({ status: "ok" }));

// API routes (auth required)
app.use("/api/*", validateApiKey);
app.route("/api/v1/tokens", tokensRoutes);
app.route("/api/v1/agents", agentsRoutes);
app.route("/api/v1/auth", authRoutes);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
```

**File: `backend/api/routes/tokens.ts`**

```typescript
import { Hono } from "hono";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

const app = new Hono();
const convex = new ConvexHttpClient(process.env.CONVEX_URL!);

// GET /api/v1/tokens/:id
app.get("/:id", async (c) => {
  const tokenId = c.req.param("id");
  const orgId = c.get("orgId");  // From API key middleware

  const token = await convex.query(api.queries.entities.get, { id: tokenId });

  if (!token || token.type !== "token") {
    return c.json({ error: "Token not found" }, 404);
  }

  // Check ownership
  if (token.properties.orgId !== orgId) {
    return c.json({ error: "Unauthorized" }, 403);
  }

  return c.json(token);
});

// POST /api/v1/tokens/:id/purchase
app.post("/:id/purchase", async (c) => {
  const tokenId = c.req.param("id");
  const { amount } = await c.req.json();
  const orgId = c.get("orgId");

  // Call Convex mutation
  const result = await convex.mutation(api.mutations.tokens.purchase, {
    tokenId,
    amount,
    orgId,
  });

  return c.json(result);
});

// Add more routes...

export default app;
```

### Step 5: Create Frontend API Client

**File: `frontend/src/lib/api/client.ts`**

```typescript
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || import.meta.env.PUBLIC_API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.error, response.status);
    }

    return response.json();
  }

  tokens = {
    get: (id: string) =>
      this.request<Token>(`/api/v1/tokens/${id}`),

    purchase: (id: string, amount: number) =>
      this.request<PurchaseResult>(`/api/v1/tokens/${id}/purchase`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
  };

  agents = {
    get: (id: string) =>
      this.request<Agent>(`/api/v1/agents/${id}`),

    list: () =>
      this.request<Agent[]>("/api/v1/agents"),
  };
}

// Singleton instance
export const api = new ApiClient(
  import.meta.env.PUBLIC_API_KEY || ""
);
```

### Step 6: Update Frontend Pages

**Before:**

```astro
---
// frontend/src/pages/tokens/[id].astro
import { ConvexHttpClient } from "convex/browser";
import { api as convexApi } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const token = await convex.query(convexApi.entities.get, { id: Astro.params.id });
---
```

**After:**

```astro
---
// frontend/src/pages/tokens/[id].astro
import { api } from "@/lib/api/client";

const token = await api.tokens.get(Astro.params.id);
---
```

### Step 7: Remove Convex from Frontend

**Delete:**
```bash
rm -rf frontend/convex/
rm frontend/convex.config.ts
```

**Update `package.json`:**
```diff
{
  "dependencies": {
-   "convex": "^1.x.x",
-   "@convex-dev/resend": "^x.x.x",
    "astro": "^5.14.0"
  }
}
```

---

## Testing Strategy

### 1. Backend API Tests

```typescript
// backend/api/__tests__/tokens.test.ts
import { describe, it, expect } from "vitest";
import app from "../index";

describe("Tokens API", () => {
  it("should require API key", async () => {
    const res = await app.request("/api/v1/tokens/123");
    expect(res.status).toBe(401);
  });

  it("should fetch token with valid key", async () => {
    const res = await app.request("/api/v1/tokens/123", {
      headers: {
        Authorization: `Bearer ${process.env.TEST_API_KEY}`,
      },
    });
    expect(res.status).toBe(200);
  });

  it("should enforce org isolation", async () => {
    const res = await app.request("/api/v1/tokens/org-b-token", {
      headers: {
        Authorization: `Bearer ${process.env.ORG_A_API_KEY}`,
      },
    });
    expect(res.status).toBe(403);
  });
});
```

### 2. Frontend Integration Tests

```typescript
// frontend/src/lib/api/__tests__/client.test.ts
import { describe, it, expect, vi } from "vitest";
import { ApiClient } from "../client";

describe("ApiClient", () => {
  it("should add Authorization header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "123" }),
    });
    global.fetch = fetchMock;

    const client = new ApiClient("sk_test_123");
    await client.tokens.get("123");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer sk_test_123",
        }),
      })
    );
  });

  it("should throw ApiError on failure", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    });

    const client = new ApiClient("sk_test_123");
    await expect(client.tokens.get("999")).rejects.toThrow("Not found");
  });
});
```

---

## Deployment Changes

### Before (Coupled)

```
1. Deploy frontend to Cloudflare Pages
   - Includes Convex SDK
   - WebSocket connection to Convex

2. Deploy Convex backend
   - convex deploy
```

### After (Separated)

```
1. Deploy backend API to Cloudflare Workers
   - cd backend/api
   - wrangler deploy
   - Output: https://api.yourdomain.com

2. Deploy Convex backend
   - cd backend/convex
   - convex deploy
   - Output: https://your-deployment.convex.cloud

3. Deploy frontend to Cloudflare Pages
   - cd frontend
   - Set env: PUBLIC_API_URL=https://api.yourdomain.com
   - Set env: PUBLIC_API_KEY=pk_live_xxx
   - Build and deploy
```

### Environment Variables

**Backend (`backend/api/.env`):**
```bash
CONVEX_URL=https://your-deployment.convex.cloud
FRONTEND_URL=https://yourdomain.com
```

**Frontend (`frontend/.env`):**
```bash
PUBLIC_API_URL=https://api.yourdomain.com
PUBLIC_API_KEY=pk_live_1234567890abcdef
```

---

## Security Considerations

### 1. API Key Storage

**❌ Never:**
- Store API keys in git
- Use secret keys (`sk_*`) in frontend
- Log API keys in console
- Return key hash in API responses

**✅ Always:**
- Use publishable keys (`pk_*`) in frontend
- Use secret keys (`sk_*`) only in backend
- Hash keys before storing (SHA-256)
- Show plaintext key only once at creation
- Rotate keys regularly

### 2. Rate Limiting

**Implementation:**
```typescript
// backend/api/middleware/rateLimit.ts
import { Context, Next } from "hono";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(c: Context, next: Next) {
  const keyId = c.get("apiKeyId");
  const limit = c.get("keyRateLimit");

  const now = Date.now();
  const key = `rate_limit:${keyId}`;
  const current = rateLimitMap.get(key);

  if (current && now < current.resetAt) {
    if (current.count >= limit.requests) {
      return c.json(
        {
          error: "Rate limit exceeded",
          resetAt: new Date(current.resetAt).toISOString(),
        },
        429
      );
    }
    current.count++;
  } else {
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + limit.period * 1000,
    });
  }

  await next();
}
```

### 3. CORS Configuration

**Backend:**
```typescript
app.use("/api/*", cors({
  origin: (origin) => {
    // Allow specific domains
    const allowed = [
      "http://localhost:4321",
      "https://yourdomain.com",
      "https://*.pages.dev",
    ];

    return allowed.some(pattern =>
      new RegExp(pattern.replace("*", ".*")).test(origin)
    ) ? origin : null;
  },
  credentials: true,
}));
```

---

## Migration Checklist

### Backend Setup
- [ ] Add `api_key` entity type to schema
- [ ] Create API key queries in `backend/convex/queries/apiKeys.ts`
- [ ] Create API key mutations in `backend/convex/mutations/apiKeys.ts`
- [ ] Deploy schema changes to Convex
- [ ] Create test API key via mutation
- [ ] Create `backend/api/` directory structure
- [ ] Implement Hono routes for all resources
- [ ] Add API key validation middleware
- [ ] Add rate limiting middleware
- [ ] Add CORS middleware
- [ ] Deploy API to Cloudflare Workers
- [ ] Test all endpoints with Postman/curl
- [ ] Set up monitoring and logging

### Frontend Setup
- [ ] Create `frontend/src/lib/api/client.ts`
- [ ] Create `frontend/src/lib/api/types.ts`
- [ ] Create `frontend/src/lib/api/errors.ts`
- [ ] Add `PUBLIC_API_URL` to `.env`
- [ ] Add `PUBLIC_API_KEY` to `.env`
- [ ] Update 1 page to test API client
- [ ] Verify API client works in development
- [ ] Migrate all pages to use API client
- [ ] Remove all Convex imports from components
- [ ] Delete `frontend/convex/` directory
- [ ] Remove Convex from `package.json`
- [ ] Update build process
- [ ] Test full frontend in production

### Documentation
- [ ] Update `CLAUDE.md` with new architecture
- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Create API key management guide
- [ ] Update deployment instructions
- [ ] Create troubleshooting guide

---

## Rollback Plan

If separation fails, rollback is easy:

1. Keep `frontend/convex/` in git (don't delete until verified)
2. Use environment variable to toggle:
   ```typescript
   const USE_API_BACKEND = import.meta.env.PUBLIC_USE_API_BACKEND === "true";

   const data = USE_API_BACKEND
     ? await api.tokens.get(id)
     : await convex.query(api.entities.get, { id });
   ```
3. If issues arise, set `PUBLIC_USE_API_BACKEND=false`

---

## Success Metrics

**Technical:**
- [ ] Frontend has zero Convex dependencies
- [ ] All API endpoints return < 200ms
- [ ] Rate limiting enforces limits correctly
- [ ] API key validation works for all scopes
- [ ] CORS configured correctly
- [ ] 100% test coverage on API routes

**Business:**
- [ ] Multiple frontends can use same backend
- [ ] API versioning supports breaking changes gracefully
- [ ] Multi-tenancy works (org isolation)
- [ ] Mobile/desktop can use same API
- [ ] API documentation is complete

---

## Timeline

**Total Duration:** 6-8 weeks

**Week 1-2:** Backend API creation
**Week 3:** Frontend API client library
**Week 4-5:** Gradual frontend migration
**Week 6:** Remove Convex from frontend
**Week 7:** Testing and bug fixes
**Week 8:** Documentation and deployment

---

## Next Steps

1. **Review this plan** with team
2. **Create GitHub project** with tasks
3. **Set up test environment** for API backend
4. **Begin Phase 1:** Backend API creation

---

## Questions to Resolve

1. **API Versioning:** Start with `/api/v1` or wait until v2 needed?
2. **Real-time Updates:** How to handle without Convex subscriptions? (WebSocket, SSE, polling?)
3. **Batch Operations:** Should API support batching multiple operations?
4. **GraphQL:** Consider GraphQL instead of REST?
5. **API Gateway:** Use Cloudflare API Gateway for additional features?

---

## Conclusion

This separation transforms ONE from a tightly-coupled monolith into a flexible, API-first platform that can:

- ✅ Serve multiple frontends from one backend
- ✅ Support web, mobile, desktop, CLI
- ✅ Enable multi-tenancy with API key isolation
- ✅ Version API independently
- ✅ Scale frontend and backend separately

The key is **gradual migration** with the ability to rollback at any point. By following this plan step-by-step, we minimize risk while achieving maximum architectural flexibility.
