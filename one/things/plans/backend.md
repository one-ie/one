# ONE Backend API: Complete Ontology-Driven Backend

**Version:** 1.0.0
**Status:** Planning → Implementation Ready
**Created:** 2025-10-24
**Tech Stack:** Convex + Hono + AI SDK + Better Auth + Effect.ts (optional confect)

---

## Executive Summary

Build a complete, production-ready backend API for ONE Platform that:

1. **Implements the full 6-dimension ontology** (Groups, People, Things, Connections, Events, Knowledge)
2. **Provides REST/HTTP API via Hono** for external access with API key auth
3. **Integrates AI SDK** for intelligent agents and RAG
4. **Uses Better Auth** for 6 authentication methods
5. **Enables multi-tenancy** via Groups with perfect data isolation
6. **Supports any frontend** (web, mobile, desktop, CLI) with universal API

**Key Architecture Decision:** Backend is **headless and universal** - ANY client can connect with an API key.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack Integration](#tech-stack-integration)
3. [API Structure](#api-structure)
4. [Authentication & Authorization](#authentication--authorization)
5. [Multi-Tenancy via Groups](#multi-tenancy-via-groups)
6. [AI SDK Integration](#ai-sdk-integration)
7. [Implementation Plan](#implementation-plan)
8. [API Examples](#api-examples)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     EXTERNAL CLIENTS                          │
│  Web App | Mobile App | Desktop App | CLI | Third-Party      │
│                  (API Key Required)                           │
└─────────────────────────┬────────────────────────────────────┘
                          │ HTTPS/REST
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                    HONO HTTP LAYER                            │
│  - REST API endpoints                                         │
│  - API key authentication                                     │
│  - Rate limiting per group                                    │
│  - Request/response validation                                │
│  - OpenAPI documentation                                      │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                 BETTER AUTH (6 Methods)                       │
│  1. Email/Password    4. Password Reset                       │
│  2. OAuth (Google+)   5. Email Verification                   │
│  3. Magic Links       6. 2FA                                  │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│              CONVEX FUNCTIONS (Business Logic)                │
│  Queries  │ Mutations │ Actions                               │
│  (read)   │ (write)   │ (external APIs, AI)                   │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│                 AI SDK INTEGRATION                            │
│  - generateText (OpenAI, Anthropic, etc.)                     │
│  - generateObject (structured outputs)                        │
│  - streamText (real-time responses)                           │
│  - embedMany (RAG vectors)                                    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ↓
┌──────────────────────────────────────────────────────────────┐
│           CONVEX DATABASE (6-Dimension Ontology)              │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 1. GROUPS     Multi-tenant isolation with nesting       ││
│  │    - friend_circle, business, community, dao, gov, org  ││
│  │    - Hierarchical: parent → child → grandchild...       ││
│  │    - Every group = isolated data namespace              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 2. PEOPLE     Authorization & governance                ││
│  │    - platform_owner, group_owner, group_user, customer  ││
│  │    - Role-based access control (RBAC)                   ││
│  │    - Multi-group membership supported                   ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 3. THINGS     66+ entity types (dynamic from YAML)      ││
│  │    - Generic type field (auto-generated from ontology)  ││
│  │    - Flexible properties (any JSON)                     ││
│  │    - All scoped to groupId                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 4. CONNECTIONS  25+ relationship types                  ││
│  │    - Bidirectional with metadata                        ││
│  │    - Protocol-agnostic (via metadata)                   ││
│  │    - All scoped to groupId                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 5. EVENTS     67+ event types (complete audit trail)    ││
│  │    - Actor (person) + target (thing) + timestamp        ││
│  │    - All actions logged automatically                   ││
│  │    - All scoped to groupId                              ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 6. KNOWLEDGE  Labels + chunks + vectors (RAG)           ││
│  │    - Vector embeddings for semantic search              ││
│  │    - Label taxonomy for categorization                  ││
│  │    - All scoped to groupId                              ││
│  └─────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Key Principle:** Everything flows through the 6-dimension ontology. External clients use Hono HTTP API, internal clients can use Convex directly.

---

## Tech Stack Integration

### 1. Convex (Real-time Backend)

**What:** Serverless backend with real-time database
**Why:** Type-safe, reactive queries, automatic scaling, WebSocket subscriptions
**Where:** `/backend/convex/`

**Current Status:**
- ✅ Schema defined with 6-dimension ontology
- ✅ Dynamic type generation from YAML ontologies
- ✅ Groups, entities, connections, events, knowledge tables
- ⚠️ Partial mutations/queries (needs completion)

**Integration:**
```typescript
// backend/convex/schema.ts
export default defineSchema({
  groups: defineTable({ ... }),      // Dimension 1
  entities: defineTable({ ... }),    // Dimension 3 (Things)
  connections: defineTable({ ... }), // Dimension 4
  events: defineTable({ ... }),      // Dimension 5
  knowledge: defineTable({ ... }),   // Dimension 6
});
```

### 2. Hono (HTTP Layer)

**What:** Fast, lightweight web framework for Cloudflare Workers/Edge
**Why:** Perfect for Convex HTTP endpoints, OpenAPI support, middleware-based
**Where:** `/backend/convex/http.ts`

**Reference:** https://stack.convex.dev/hono-with-convex

**Integration Pattern:**
```typescript
// backend/convex/http.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { handle } from "hono/vercel";
import { httpRouter } from "convex/server";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", async (c, next) => {
  // API key authentication
  const apiKey = c.req.header("X-API-Key");
  if (!apiKey) {
    throw new HTTPException(401, { message: "API key required" });
  }
  // Verify API key and get groupId
  const group = await verifyApiKey(apiKey);
  c.set("groupId", group._id);
  await next();
});

// Routes (see API Structure section)
app.get("/api/groups", ...)
app.post("/api/things", ...)
app.get("/api/connections/:id", ...)

// Convex integration
export default httpRouter({
  "/": handle(app),
});
```

### 3. AI SDK (Vercel AI SDK)

**What:** Universal AI toolkit for TypeScript
**Why:** Provider-agnostic (OpenAI, Anthropic, etc.), streaming, structured outputs
**Where:** `/backend/convex/actions/ai.ts`

**Key Features:**
- `generateText()` - Generate responses
- `generateObject()` - Structured JSON outputs
- `streamText()` - Real-time streaming
- `embedMany()` - Vector embeddings for RAG

**Integration:**
```typescript
// backend/convex/actions/ai.ts
import { generateText, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateResponse = action({
  args: {
    groupId: v.id("groups"),
    prompt: v.string(),
    context: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Search knowledge base for context
    const relevantChunks = await ctx.runQuery(
      internal.queries.knowledge.search,
      { groupId: args.groupId, query: args.prompt, limit: 5 }
    );

    // 2. Generate response with context
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: args.prompt,
      system: `Context: ${relevantChunks.map(c => c.text).join("\n\n")}`,
    });

    // 3. Log event
    await ctx.runMutation(internal.mutations.events.log, {
      groupId: args.groupId,
      type: "ai_response_generated",
      metadata: { prompt: args.prompt, responseLength: text.length },
    });

    return { text };
  },
});

export const embedText = action({
  args: {
    groupId: v.id("groups"),
    texts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: args.texts,
    });

    // Store embeddings in knowledge table
    for (let i = 0; i < embeddings.length; i++) {
      await ctx.runMutation(internal.mutations.knowledge.create, {
        groupId: args.groupId,
        type: "chunk",
        text: args.texts[i],
        embedding: embeddings[i],
      });
    }

    return { count: embeddings.length };
  },
});
```

### 4. Better Auth

**What:** Universal authentication for TypeScript
**Why:** 6 auth methods, backend-agnostic, multi-tenant ready
**Where:** `/backend/convex/auth.ts`

**Current Status:**
- ✅ Basic email/password auth implemented
- ⚠️ Needs full 6-method integration
- ⚠️ Needs group-scoped sessions

**Integration:**
```typescript
// backend/convex/auth.ts
import { betterAuth } from "better-auth";
import { convexAdapter } from "better-auth/adapters/convex";

export const auth = betterAuth({
  database: convexAdapter(ctx.db),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

// Group-scoped authentication
export const signUpWithGroup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    groupId: v.id("groups"),
  },
  handler: async (ctx, args) => {
    // 1. Create user with Better Auth
    const user = await auth.createUser({
      email: args.email,
      password: args.password,
    });

    // 2. Create person in ontology (Dimension 2)
    const personId = await ctx.db.insert("entities", {
      groupId: args.groupId,
      type: "creator",
      name: args.email,
      properties: {
        email: args.email,
        userId: user.id,
        role: "group_user",
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Create connection (user → group membership)
    await ctx.db.insert("connections", {
      groupId: args.groupId,
      type: "member_of",
      fromId: personId,
      toId: args.groupId,
      metadata: { role: "group_user" },
      createdAt: Date.now(),
    });

    // 4. Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "person_created",
      actorId: personId,
      targetId: personId,
      timestamp: Date.now(),
      metadata: { method: "email_password" },
    });

    return { userId: user.id, personId };
  },
});
```

### 5. Effect.ts + confect (Optional)

**What:** Functional programming library for type-safe error handling
**Why:** Composable services, typed errors, dependency injection
**Where:** Optional - can wrap Convex functions

**Reference:** https://github.com/rjdellecese/confect

**Integration (Optional):**
```typescript
// backend/convex/confect.ts (if using)
import { makeConfect } from "@rjdellecese/confect";
import { Effect } from "effect";

export const { query, mutation, action } = makeConfect({
  /* confect config */
});

// Usage
export const getEntity = query({
  args: { id: v.string() },
  returns: Schema.Struct({
    _id: Schema.String,
    type: Schema.String,
    name: Schema.String,
  }),
  handler: (args) =>
    Effect.gen(function* () {
      const { db } = yield* ConfectQueryCtx;
      const entity = yield* db.get(args.id);
      if (!entity) {
        return yield* Effect.fail(new EntityNotFoundError(args.id));
      }
      return entity;
    }),
});
```

**Recommendation:** Start WITHOUT confect for simplicity. Add later if needed for advanced error handling.

---

## API Structure

### REST API Endpoints (via Hono)

All endpoints require `X-API-Key` header and are scoped to the group associated with that API key.

#### Groups (Dimension 1)

```
GET    /api/groups                    # List all groups (platform owner only)
GET    /api/groups/:id                # Get group details
POST   /api/groups                    # Create new group
PATCH  /api/groups/:id                # Update group
DELETE /api/groups/:id                # Archive group
GET    /api/groups/:id/children       # List child groups (hierarchical)
```

#### People (Dimension 2)

```
GET    /api/people                    # List people in group
GET    /api/people/:id                # Get person details
POST   /api/people                    # Create person (invite user)
PATCH  /api/people/:id                # Update person (role, permissions)
DELETE /api/people/:id                # Remove person from group
GET    /api/people/:id/groups         # List groups person belongs to
```

#### Things (Dimension 3)

```
GET    /api/things                    # List things (filterable by type)
GET    /api/things/:id                # Get thing details
POST   /api/things                    # Create thing
PATCH  /api/things/:id                # Update thing
DELETE /api/things/:id                # Archive thing
GET    /api/things/:id/connections    # Get related things
GET    /api/things/:id/events         # Get thing history
```

#### Connections (Dimension 4)

```
GET    /api/connections               # List connections
GET    /api/connections/:id           # Get connection details
POST   /api/connections               # Create connection
DELETE /api/connections/:id           # Delete connection
GET    /api/connections/from/:id      # Get connections from thing
GET    /api/connections/to/:id        # Get connections to thing
```

#### Events (Dimension 5)

```
GET    /api/events                    # List events (filterable)
GET    /api/events/:id                # Get event details
POST   /api/events                    # Log custom event
GET    /api/events/actor/:id          # Events by actor (person)
GET    /api/events/target/:id         # Events by target (thing)
GET    /api/events/timeline           # Timeline view (paginated)
```

#### Knowledge (Dimension 6)

```
GET    /api/knowledge                 # List knowledge items
GET    /api/knowledge/:id             # Get knowledge details
POST   /api/knowledge                 # Create knowledge
DELETE /api/knowledge/:id             # Delete knowledge
POST   /api/knowledge/embed           # Embed text (AI SDK)
POST   /api/knowledge/search          # Semantic search
```

#### AI Endpoints

```
POST   /api/ai/generate               # Generate text response
POST   /api/ai/stream                 # Stream text response
POST   /api/ai/embed                  # Generate embeddings
POST   /api/ai/chat                   # Chat conversation
```

#### Auth Endpoints

```
POST   /api/auth/signup               # Sign up (email/password)
POST   /api/auth/signin               # Sign in
POST   /api/auth/signout              # Sign out
POST   /api/auth/refresh              # Refresh token
GET    /api/auth/session              # Get current session
POST   /api/auth/magic-link           # Send magic link
POST   /api/auth/verify-email         # Verify email
POST   /api/auth/reset-password       # Reset password
POST   /api/auth/2fa/enable           # Enable 2FA
POST   /api/auth/2fa/verify           # Verify 2FA
```

---

## Authentication & Authorization

### API Key Authentication

**Every request requires:**
```
X-API-Key: gsk_abc123...
```

**API Key Structure:**
```typescript
{
  _id: Id<"apiKeys">,
  key: string,           // Hashed
  groupId: Id<"groups">, // Which group this key accesses
  name: string,          // Human-readable name
  permissions: string[], // Optional: limit to specific endpoints
  rateLimit: {
    requests: number,    // Per minute
    burst: number,
  },
  expiresAt: number,
  createdAt: number,
  lastUsedAt: number,
  status: "active" | "revoked",
}
```

**API Key Generation:**
```typescript
// backend/convex/mutations/apiKeys.ts
export const createApiKey = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Verify caller is group_owner
    const caller = await getAuthenticatedPerson(ctx);
    if (caller.role !== "group_owner") {
      throw new Error("Only group owners can create API keys");
    }

    // 2. Generate key
    const key = `gsk_${generateSecureToken()}`;
    const hashedKey = await hashApiKey(key);

    // 3. Store API key
    const apiKeyId = await ctx.db.insert("apiKeys", {
      key: hashedKey,
      groupId: args.groupId,
      name: args.name,
      permissions: args.permissions || [],
      rateLimit: { requests: 1000, burst: 100 },
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      createdAt: Date.now(),
      lastUsedAt: 0,
      status: "active",
    });

    // 4. Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "api_key_created",
      actorId: caller._id,
      targetId: apiKeyId,
      timestamp: Date.now(),
      metadata: { name: args.name },
    });

    // Return unencrypted key ONCE (never shown again)
    return { key, apiKeyId };
  },
});
```

### Role-Based Access Control (RBAC)

**Access Matrix:**

| Role | Groups | People | Things | Connections | Events | Knowledge | API Keys |
|------|--------|--------|--------|-------------|--------|-----------|----------|
| **platform_owner** | All | All | All | All | All | All | All |
| **group_owner** | Own | Own Group | Own Group | Own Group | Own Group | Own Group | Create |
| **group_user** | Read | Read | Create/Edit Own | Create | Create | Create | None |
| **customer** | None | Read Self | Read | Read | None | None | None |

**Middleware:**
```typescript
// backend/convex/lib/auth.ts
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: PersonRole
) {
  const person = await getAuthenticatedPerson(ctx);
  const roleHierarchy = {
    platform_owner: 4,
    group_owner: 3,
    group_user: 2,
    customer: 1,
  };

  if (roleHierarchy[person.role] < roleHierarchy[requiredRole]) {
    throw new Error(`Requires ${requiredRole} role or higher`);
  }

  return person;
}
```

---

## Multi-Tenancy via Groups

### Perfect Data Isolation

**Every table has `groupId`:**
```typescript
entities: {
  groupId: Id<"groups">,  // REQUIRED
  type: string,
  name: string,
  properties: any,
}
```

**All queries filtered by groupId:**
```typescript
// backend/convex/queries/entities.ts
export const list = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    // Get groupId from API key (via Hono middleware)
    const groupId = ctx.auth.getUserIdentity()?.groupId;
    if (!groupId) throw new Error("Group ID required");

    return await ctx.db
      .query("entities")
      .withIndex("by_group_and_type", (q) =>
        q.eq("groupId", groupId).eq("type", args.type)
      )
      .collect();
  },
});
```

### Hierarchical Groups

**Parent groups can access child group data (configurable):**

```typescript
export const listWithChildren = query({
  args: { includeChildren: v.boolean() },
  handler: async (ctx, args) => {
    const groupId = getGroupId(ctx);

    if (!args.includeChildren) {
      return getEntitiesForGroup(ctx, groupId);
    }

    // Get all child groups recursively
    const childGroupIds = await getChildGroups(ctx, groupId);
    const allGroupIds = [groupId, ...childGroupIds];

    // Query across all groups
    const entities = [];
    for (const gid of allGroupIds) {
      const groupEntities = await getEntitiesForGroup(ctx, gid);
      entities.push(...groupEntities);
    }

    return entities;
  },
});
```

### Resource Quotas

**Enforce limits per group:**
```typescript
export const create = mutation({
  args: { type: v.string(), name: v.string(), properties: v.any() },
  handler: async (ctx, args) => {
    const groupId = getGroupId(ctx);
    const group = await ctx.db.get(groupId);

    // Check quota
    const currentCount = await ctx.db
      .query("entities")
      .withIndex("by_group", (q) => q.eq("groupId", groupId))
      .collect()
      .length;

    const limit = group.settings.limits?.entities || 1000;
    if (currentCount >= limit) {
      throw new Error(`Entity limit reached (${limit})`);
    }

    // Create entity
    return await ctx.db.insert("entities", {
      groupId,
      type: args.type,
      name: args.name,
      properties: args.properties,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
```

---

## AI SDK Integration

### RAG (Retrieval-Augmented Generation)

**Complete RAG Pipeline:**

```typescript
// backend/convex/actions/rag.ts
import { generateText, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

export const ingestDocument = action({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Create document wrapper
    const docId = await ctx.runMutation(internal.mutations.knowledge.create, {
      groupId: args.groupId,
      type: "document",
      text: args.title,
      metadata: { title: args.title },
    });

    // 2. Chunk text (800 tokens, 200 overlap)
    const chunks = chunkText(args.text, 800, 200);

    // 3. Generate embeddings for all chunks
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks,
    });

    // 4. Store chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
      await ctx.runMutation(internal.mutations.knowledge.create, {
        groupId: args.groupId,
        type: "chunk",
        text: chunks[i],
        embedding: embeddings[i],
        metadata: {
          documentId: docId,
          chunkIndex: i,
        },
      });
    }

    return { documentId: docId, chunks: chunks.length };
  },
});

export const answerQuestion = action({
  args: {
    groupId: v.id("groups"),
    question: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Embed question
    const { embeddings: [questionEmbedding] } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: [args.question],
    });

    // 2. Search for relevant chunks (vector similarity)
    const relevantChunks = await ctx.runQuery(
      internal.queries.knowledge.searchByVector,
      {
        groupId: args.groupId,
        embedding: questionEmbedding,
        limit: 5,
      }
    );

    // 3. Generate answer with context
    const context = relevantChunks.map((c) => c.text).join("\n\n");
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: args.question,
      system: `Answer based on this context:\n\n${context}`,
    });

    // 4. Log event
    await ctx.runMutation(internal.mutations.events.log, {
      groupId: args.groupId,
      type: "question_answered",
      metadata: {
        question: args.question,
        chunksUsed: relevantChunks.length,
      },
    });

    return { answer: text, sources: relevantChunks };
  },
});

// Helper: Chunk text with overlap
function chunkText(text: string, maxTokens: number, overlap: number): string[] {
  const words = text.split(" ");
  const chunks: string[] = [];
  const wordsPerToken = 0.75; // Approximate

  const maxWords = Math.floor(maxTokens * wordsPerToken);
  const overlapWords = Math.floor(overlap * wordsPerToken);

  for (let i = 0; i < words.length; i += maxWords - overlapWords) {
    const chunk = words.slice(i, i + maxWords).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}
```

### Streaming Responses

```typescript
// backend/convex/actions/ai.ts
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const streamResponse = action({
  args: {
    groupId: v.id("groups"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const { textStream } = await streamText({
      model: openai("gpt-4o"),
      prompt: args.prompt,
    });

    // Return stream (Hono will handle SSE)
    return textStream;
  },
});
```

### Structured Outputs

```typescript
import { generateObject } from "ai";
import { z } from "zod";

export const extractEntities = action({
  args: {
    groupId: v.id("groups"),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: z.object({
        entities: z.array(
          z.object({
            name: z.string(),
            type: z.enum(["person", "organization", "location", "event"]),
            description: z.string(),
          })
        ),
      }),
      prompt: `Extract entities from this text: ${args.text}`,
    });

    // Store entities in ontology
    for (const entity of object.entities) {
      await ctx.runMutation(internal.mutations.entities.create, {
        groupId: args.groupId,
        type: entity.type,
        name: entity.name,
        properties: { description: entity.description },
      });
    }

    return object.entities;
  },
});
```

---

## Implementation Plan

### Phase 1: Hono HTTP Layer (Week 1)

**Goal:** Set up Hono with API key authentication

**Tasks:**
1. Install Hono: `npm install hono`
2. Create `/backend/convex/http.ts` with Hono setup
3. Implement API key middleware
4. Add rate limiting per group
5. Set up CORS and error handling
6. Test with curl/Postman

**Deliverable:** `/api/health` endpoint returns `{ status: "ok", groupId: "..." }`

### Phase 2: Complete CRUD Operations (Week 2-3)

**Goal:** Implement all CRUD endpoints for 6 dimensions

**Tasks:**
1. Groups endpoints (7 routes)
2. People endpoints (6 routes)
3. Things endpoints (6 routes)
4. Connections endpoints (6 routes)
5. Events endpoints (6 routes)
6. Knowledge endpoints (6 routes)

**Deliverable:** All 37 REST endpoints operational

### Phase 3: AI SDK Integration (Week 4)

**Goal:** Integrate AI SDK for RAG and generation

**Tasks:**
1. Install AI SDK: `npm install ai @ai-sdk/openai`
2. Implement RAG pipeline (ingest, chunk, embed, search)
3. Add generateText action
4. Add streaming support
5. Add structured output (extractEntities)

**Deliverable:** `/api/ai/generate` and `/api/ai/search` working

### Phase 4: Better Auth Integration (Week 5)

**Goal:** Full 6-method authentication

**Tasks:**
1. Complete email/password auth
2. Add OAuth providers (Google, GitHub)
3. Add magic links
4. Add password reset flow
5. Add email verification
6. Add 2FA support
7. Integrate with ontology (create person entities)

**Deliverable:** All 6 auth methods working with group scoping

### Phase 5: Testing & Documentation (Week 6)

**Goal:** Production-ready with complete docs

**Tasks:**
1. Write integration tests (90% coverage)
2. Generate OpenAPI spec
3. Create API documentation site
4. Add example requests/responses
5. Performance testing
6. Security audit

**Deliverable:** Published API docs at `https://api.one.ie/docs`

### Phase 6: Deployment (Week 7)

**Goal:** Deploy to production

**Tasks:**
1. Configure environment variables
2. Set up monitoring (Sentry, LogTail)
3. Configure rate limits per plan tier
4. Deploy to Convex production
5. Set up custom domain (`api.one.ie`)

**Deliverable:** Production API live at `https://api.one.ie`

---

## API Examples

### Example 1: Create Thing

```bash
curl -X POST https://api.one.ie/api/things \
  -H "X-API-Key: gsk_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "name": "Introduction to AI",
    "properties": {
      "description": "Learn AI fundamentals",
      "duration": "8 weeks",
      "price": 299
    }
  }'
```

**Response:**
```json
{
  "_id": "jd7x8y9z...",
  "groupId": "kg1h2i3j...",
  "type": "course",
  "name": "Introduction to AI",
  "properties": {
    "description": "Learn AI fundamentals",
    "duration": "8 weeks",
    "price": 299
  },
  "status": "active",
  "createdAt": 1730000000000,
  "updatedAt": 1730000000000
}
```

### Example 2: Search Knowledge (RAG)

```bash
curl -X POST https://api.one.ie/api/knowledge/search \
  -H "X-API-Key: gsk_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do I implement authentication?",
    "limit": 5
  }'
```

**Response:**
```json
{
  "results": [
    {
      "_id": "kl4m5n6o...",
      "text": "Authentication in ONE Platform uses Better Auth...",
      "score": 0.92,
      "metadata": {
        "documentId": "pm7q8r9s...",
        "chunkIndex": 3
      }
    },
    ...
  ],
  "count": 5
}
```

### Example 3: Generate AI Response

```bash
curl -X POST https://api.one.ie/api/ai/generate \
  -H "X-API-Key: gsk_abc123..." \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain the 6-dimension ontology",
    "context": true
  }'
```

**Response:**
```json
{
  "text": "The 6-dimension ontology consists of Groups, People, Things, Connections, Events, and Knowledge...",
  "model": "gpt-4o",
  "tokens": 245,
  "sources": [
    { "title": "Ontology Overview", "score": 0.89 }
  ]
}
```

### Example 4: List Things with Filters

```bash
curl "https://api.one.ie/api/things?type=course&status=published&limit=10" \
  -H "X-API-Key: gsk_abc123..."
```

**Response:**
```json
{
  "results": [
    {
      "_id": "th1i2j3k...",
      "type": "course",
      "name": "Advanced TypeScript",
      "properties": { ... },
      "status": "published"
    },
    ...
  ],
  "count": 10,
  "hasMore": true,
  "cursor": "ey4Jh5..."
}
```

---

## Related Documentation

- **`one/knowledge/ontology.md`** - Complete 6-dimension specification
- **`one/knowledge/todo.md`** - 100-inference execution template
- **`one/things/plans/effect.md`** - Backend-agnostic Effect.ts integration
- **`one/things/plans/separate.md`** - Frontend-backend separation
- **`CLAUDE.md`** - Development workflow

---

## External Resources

- **Hono + Convex:** https://stack.convex.dev/hono-with-convex
- **confect (Effect + Convex):** https://github.com/rjdellecese/confect
- **AI SDK:** https://sdk.vercel.ai/docs
- **Better Auth:** https://better-auth.com/docs
- **Convex Docs:** https://docs.convex.dev

---

**Build once. Deploy anywhere. Connect anything. The backend-agnostic 6-dimension ontology powers it all.**
