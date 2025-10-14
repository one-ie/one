# Provider Creation Guide

**Version:** 1.0.0
**Status:** Production
**Audience:** Backend Engineers, Integration Specialists
**Prerequisites:** TypeScript, Effect.ts, REST APIs

---

## Overview

This guide teaches you how to create a custom DataProvider implementation for the ONE Platform, enabling integration with any backend system (databases, SaaS platforms, APIs, etc.).

**You will learn:**
- DataProvider interface structure
- 6-dimension ontology mapping
- ID conversion patterns
- Status/type mapping strategies
- Error handling with Effect.ts
- Hybrid storage approaches
- Testing strategies

---

## Prerequisites

### Required Knowledge

1. **TypeScript:** Strong typing, generics, advanced types
2. **Effect.ts:** Effects, Layers, Error handling
3. **REST APIs:** HTTP methods, authentication, pagination
4. **ONE Ontology:** 6 dimensions (Organizations, People, Things, Connections, Events, Knowledge)

### Required Tools

- Node.js 18+
- TypeScript 5.9+
- Effect.ts 3.0+
- Your target backend's SDK (if available)

### Required Files

Read these before starting:
1. `/frontend/src/providers/DataProvider.ts` - Interface definition
2. `/frontend/src/providers/convex/ConvexProvider.ts` - Reference implementation
3. `/one/knowledge/ontology.md` - 6-dimension ontology specification

---

## Step 1: Understand the DataProvider Interface

The DataProvider interface defines operations for all 6 dimensions:

```typescript
export interface DataProvider {
  // ===== THINGS (Dimension 3) =====
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>;
    list: (options?: ListThingsOptions) => Effect.Effect<Thing[], QueryError>;
    create: (input: CreateThingInput) => Effect.Effect<string, ThingCreateError>;
    update: (id: string, input: UpdateThingInput) => Effect.Effect<void, ThingUpdateError>;
    delete: (id: string) => Effect.Effect<void, ThingNotFoundError>;
  };

  // ===== CONNECTIONS (Dimension 4) =====
  connections: {
    get: (id: string) => Effect.Effect<Connection, ConnectionNotFoundError>;
    list: (options?: ListConnectionsOptions) => Effect.Effect<Connection[], QueryError>;
    create: (input: CreateConnectionInput) => Effect.Effect<string, ConnectionCreateError>;
    delete: (id: string) => Effect.Effect<void, ConnectionNotFoundError>;
  };

  // ===== EVENTS (Dimension 5) =====
  events: {
    get: (id: string) => Effect.Effect<Event, DataProviderError>;
    list: (options?: ListEventsOptions) => Effect.Effect<Event[], QueryError>;
    create: (input: CreateEventInput) => Effect.Effect<string, EventCreateError>;
  };

  // ===== KNOWLEDGE (Dimension 6) =====
  knowledge: {
    get: (id: string) => Effect.Effect<Knowledge, KnowledgeNotFoundError>;
    list: (options?: SearchKnowledgeOptions) => Effect.Effect<Knowledge[], QueryError>;
    create: (input: CreateKnowledgeInput) => Effect.Effect<string, DataProviderError>;
    link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) => Effect.Effect<string, DataProviderError>;
    search: (embedding: number[], options?: SearchKnowledgeOptions) => Effect.Effect<Knowledge[], QueryError>;
  };
}
```

**Key Insights:**

1. All operations return `Effect.Effect<Result, Error>`
2. All errors are typed (no generic `Error` throwing)
3. IDs are strings (you control format)
4. All operations are pure (no side effects outside Effect)

---

## Step 2: Plan Your Backend Mapping

Before writing code, plan how your backend maps to the 6 dimensions:

### Mapping Template

Fill out this template for your backend:

```typescript
// EXAMPLE: Airtable Provider Planning

// 1. ORGANIZATIONS (Dimension 1)
// How: Each Airtable Base = 1 organization
// Configuration: Store base ID in organization properties
// Isolation: Queries scoped to base ID

// 2. PEOPLE (Dimension 2)
// How: Airtable doesn't have native users - use separate Users table
// Roles: Map collaborator permissions → ONE roles
// Auth: Use API key per organization

// 3. THINGS (Dimension 3)
// How: Each Airtable Table = 1 thing type
// Properties: Map Airtable fields → properties JSON
// Status: Use Status field (Single Select)
// ID Format: airtable_<table-name>_<record-id>

// 4. CONNECTIONS (Dimension 4)
// How: Airtable Linked Records = connections
// Storage: Native (Airtable supports linked records)
// Metadata: Store in separate JSON field

// 5. EVENTS (Dimension 5)
// How: Airtable doesn't support events - use hybrid with Convex
// Storage: Delegate to Convex
// Pattern: Log events to Convex, store reference in Airtable

// 6. KNOWLEDGE (Dimension 6)
// How: Airtable doesn't support vectors - use hybrid with Convex
// Storage: Delegate to Convex
// Pattern: Store labels in Airtable, vectors in Convex
```

### Decision Matrix

For each dimension, decide:

| Dimension | Native Support? | Storage Strategy | Notes |
|-----------|-----------------|------------------|-------|
| Organizations | No | Config-based | Each config = 1 org |
| People | Partial | Custom table | Map roles |
| Things | Yes | Native storage | Full CRUD |
| Connections | Partial | Hybrid/Custom | Depends on backend |
| Events | No | Hybrid (Convex) | Most backends lack this |
| Knowledge | No | Hybrid (Convex) | Most backends lack vectors |

**Hybrid Pattern:** If your backend doesn't support a dimension natively, delegate to Convex:

```typescript
events: {
  create: (input) => Effect.fail(
    new EventCreateError("Use Convex for event storage - this provider doesn't support events")
  ),
  list: () => Effect.succeed([]),
  get: (id) => Effect.fail(new QueryError("Events not supported")),
}
```

---

## Step 3: Design Your ID Format

ONE uses string IDs. Design a format that:
1. Prevents collisions with other providers
2. Allows round-trip conversion (ONE ID ↔ Backend ID)
3. Includes type information (helpful for debugging)

### ID Format Examples

```typescript
// Pattern: <provider>_<type>_<backend-id>

// Notion
"notion_abc123def456789012345678" // UUID without hyphens + prefix

// WordPress
"wp_course_123" // post type + post ID

// Airtable
"airtable_courses_recABC123" // table name + record ID

// Supabase
"supabase_uuid_550e8400-e29b-41d4-a716-446655440000" // standard UUID

// Firebase
"firebase_users_kYGxgYvdl5cDMNuvLKN0" // collection + document ID
```

### ID Converter Functions

Always implement bidirectional conversion:

```typescript
// ONE ID → Backend ID
const oneIdToBackendId = (oneId: string): string => {
  const match = oneId.match(/^mybackend_([^_]+)_(.+)$/);
  if (!match) throw new Error(`Invalid ONE ID: ${oneId}`);
  const [_, type, backendId] = match;
  return backendId;
};

// Backend ID → ONE ID
const backendIdToOneId = (type: string, backendId: string): string => {
  return `mybackend_${type}_${backendId}`;
};

// Parse ONE ID (extract type and backend ID)
const parseOneId = (oneId: string): { type: string; backendId: string } => {
  const match = oneId.match(/^mybackend_([^_]+)_(.+)$/);
  if (!match) throw new Error(`Invalid ONE ID: ${oneId}`);
  return { type: match[1], backendId: match[2] };
};
```

---

## Step 4: Implement Status Mapping

ONE uses standard status values. Map them to your backend's status system:

```typescript
// ONE Status Values
type ThingStatus = "draft" | "active" | "published" | "archived" | "inactive";

// Your Backend Mapping
const mapONEStatusToBackend = (status: ThingStatus): string => {
  const mapping: Record<ThingStatus, string> = {
    draft: "Draft",           // Your backend's draft status
    active: "Active",         // Your backend's active status
    published: "Published",   // Your backend's published status
    archived: "Archived",     // Your backend's archived status
    inactive: "Inactive",     // Your backend's inactive status
  };
  return mapping[status];
};

const mapBackendStatusToONE = (backendStatus: string): ThingStatus => {
  const mapping: Record<string, ThingStatus> = {
    "Draft": "draft",
    "In Progress": "active",   // Map backend statuses to ONE statuses
    "Published": "published",
    "Deleted": "archived",
    "Paused": "inactive",
  };
  return mapping[backendStatus] || "draft"; // Default to draft
};
```

---

## Step 5: Implement Type Mapping

ONE has 66+ thing types. Map them to your backend's entity types:

```typescript
// ONE Thing Types (subset)
type ThingType = "course" | "lesson" | "creator" | "blog_post" | "token" | ...;

// Your Backend Mapping
const mapONETypeToBackend = (type: ThingType): string => {
  const mapping: Record<ThingType, string> = {
    course: "courses",        // Your backend's course entity
    lesson: "lessons",
    creator: "users",
    blog_post: "articles",
    token: "products",
    // ... map all 66 types
  };
  return mapping[type] || "generic"; // Default fallback
};

const mapBackendTypeToONE = (backendType: string): ThingType => {
  const mapping: Record<string, ThingType> = {
    courses: "course",
    lessons: "lesson",
    users: "creator",
    articles: "blog_post",
    products: "token",
  };
  return mapping[backendType] || "unknown";
};
```

---

## Step 6: Create Your Provider Class

```typescript
// File: /frontend/src/providers/mybackend/MyBackendProvider.ts

import { Effect, Layer } from "effect";
import {
  DataProvider,
  DataProviderService,
  ThingNotFoundError,
  ThingCreateError,
  // ... import all error types
  type Thing,
  type Connection,
  // ... import all types
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface MyBackendProviderConfig {
  apiUrl: string;
  apiKey: string;
  organizationId: string;
  // Add your backend-specific config
}

// ============================================================================
// PROVIDER IMPLEMENTATION
// ============================================================================

export const makeMyBackendProvider = (config: MyBackendProviderConfig): DataProvider => {
  // Initialize your backend client
  const client = new MyBackendClient(config.apiUrl, config.apiKey);

  return {
    // ===== THINGS =====
    things: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const { type, backendId } = parseOneId(id);
            const backendEntity = await client.getEntity(type, backendId);
            return mapBackendEntityToThing(backendEntity, type);
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),

      list: (options?: ListThingsOptions) =>
        Effect.tryPromise({
          try: async () => {
            if (!options?.type) {
              throw new QueryError("Type required for listing");
            }
            const backendType = mapONETypeToBackend(options.type);
            const entities = await client.listEntities(backendType, {
              limit: options.limit,
              offset: options.offset,
            });
            return entities.map(e => mapBackendEntityToThing(e, options.type!));
          },
          catch: (error) => new QueryError("Failed to list things", error),
        }),

      create: (input: CreateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const backendType = mapONETypeToBackend(input.type);
            const backendEntity = transformThingToBackendEntity(input);
            const created = await client.createEntity(backendType, backendEntity);
            return backendIdToOneId(input.type, created.id);
          },
          catch: (error) => new ThingCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const { type, backendId } = parseOneId(id);
            const backendType = mapONETypeToBackend(type);
            const updates = transformUpdatesToBackendFormat(input);
            await client.updateEntity(backendType, backendId, updates);
          },
          catch: (error) => new ThingUpdateError(id, String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const { type, backendId } = parseOneId(id);
            const backendType = mapONETypeToBackend(type);
            await client.deleteEntity(backendType, backendId);
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      // Implement connection operations
      // Use native backend relationships if available
      // Otherwise use custom storage table
    },

    // ===== EVENTS =====
    events: {
      // Implement if backend supports event logging
      // Otherwise delegate to Convex (hybrid approach)
    },

    // ===== KNOWLEDGE =====
    knowledge: {
      // Implement if backend supports vectors
      // Otherwise delegate to Convex (hybrid approach)
    },
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const MyBackendProviderLive = (config: MyBackendProviderConfig) =>
  Layer.succeed(DataProviderService, makeMyBackendProvider(config));

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const myBackendProvider = (
  apiUrl: string,
  apiKey: string,
  organizationId: string
) => makeMyBackendProvider({ apiUrl, apiKey, organizationId });
```

---

## Step 7: Implement Mappers

### Backend Entity → ONE Thing

```typescript
const mapBackendEntityToThing = (entity: BackendEntity, type: string): Thing => {
  return {
    _id: backendIdToOneId(type, entity.id),
    type: type,
    name: entity.name || entity.title || "Untitled",
    organizationId: config.organizationId,
    status: mapBackendStatusToONE(entity.status),
    properties: {
      // Store backend-specific fields
      ...entity.customFields,
      // Store original backend ID for reference
      backendId: entity.id,
      backendUrl: entity.url,
      // Parse and merge any JSON properties
      ...(entity.metadata ? JSON.parse(entity.metadata) : {}),
    },
    createdAt: new Date(entity.created_at).getTime(),
    updatedAt: new Date(entity.updated_at).getTime(),
  };
};
```

### ONE Thing → Backend Entity

```typescript
const transformThingToBackendEntity = (input: CreateThingInput): BackendEntity => {
  return {
    name: input.name,
    status: mapONEStatusToBackend(input.status || "draft"),
    // Map common properties to backend fields
    description: input.properties.content || input.properties.description,
    price: input.properties.price,
    duration: input.properties.duration,
    // Store full properties as JSON for maximum flexibility
    metadata: JSON.stringify(input.properties),
    // Add organization tracking
    organization_id: config.organizationId,
  };
};
```

---

## Step 8: Handle Properties Mapping

**Strategy 1: Full JSON Storage** (Recommended)

Store entire `properties` object as JSON in a single backend field:

```typescript
// Backend entity structure
{
  id: "123",
  name: "Course Title",
  status: "Published",
  metadata: "{\"content\":\"...\",\"price\":99,\"duration\":3600}" // Full properties
}

// Advantages:
// - Maximum flexibility (no schema changes needed)
// - All properties preserved
// - Easy to implement

// Disadvantages:
// - Can't query/filter by individual properties
// - Large JSON blobs
```

**Strategy 2: Mapped Fields** (Better UX)

Map common properties to native backend fields:

```typescript
// Backend entity structure
{
  id: "123",
  name: "Course Title",
  status: "Published",
  description: "...",  // Mapped from properties.content
  price: 99,           // Mapped from properties.price
  duration: 3600,      // Mapped from properties.duration
  metadata: "{...}"    // Remaining properties as JSON
}

// Advantages:
// - Can query/filter by common fields
// - Better backend UX
// - Smaller JSON blobs

// Disadvantages:
// - Requires field mapping logic
// - Backend schema must support common fields
```

**Best Practice:** Use Strategy 2 (mapped fields) + full JSON fallback:

```typescript
const transformPropertiesToBackend = (properties: Record<string, any>) => {
  return {
    // Map common fields
    description: properties.content || properties.description,
    price: properties.price,
    duration: properties.duration,
    difficulty: properties.difficulty,
    // Store full properties as JSON
    metadata: JSON.stringify(properties),
  };
};

const extractPropertiesFromBackend = (entity: BackendEntity): Record<string, any> => {
  // Start with JSON properties
  const properties = entity.metadata ? JSON.parse(entity.metadata) : {};

  // Override with mapped fields (these are source of truth)
  if (entity.description) properties.content = entity.description;
  if (entity.price !== undefined) properties.price = entity.price;
  if (entity.duration !== undefined) properties.duration = entity.duration;
  if (entity.difficulty) properties.difficulty = entity.difficulty;

  return properties;
};
```

---

## Step 9: Implement Error Handling

Use Effect.ts typed errors for all failure cases:

```typescript
// Example: Get thing with detailed error handling

things: {
  get: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        // Validate ID format
        if (!id.startsWith("mybackend_")) {
          throw new ThingNotFoundError(id, "Invalid ID format");
        }

        const { type, backendId } = parseOneId(id);

        // Fetch from backend
        let entity;
        try {
          entity = await client.getEntity(type, backendId);
        } catch (error: any) {
          if (error.status === 404) {
            throw new ThingNotFoundError(id, "Entity not found in backend");
          }
          if (error.status === 401) {
            throw new ThingNotFoundError(id, "Authentication failed");
          }
          throw error; // Re-throw other errors
        }

        // Validate entity
        if (!entity) {
          throw new ThingNotFoundError(id, "Entity is null");
        }

        // Transform to Thing
        return mapBackendEntityToThing(entity, type);
      },
      catch: (error) => {
        // Convert all errors to ThingNotFoundError
        if (error instanceof ThingNotFoundError) return error;
        return new ThingNotFoundError(id, String(error));
      },
    }),
}
```

**Error Types to Use:**

- `ThingNotFoundError` - Entity doesn't exist
- `ThingCreateError` - Failed to create entity
- `ThingUpdateError` - Failed to update entity
- `ConnectionNotFoundError` - Relationship doesn't exist
- `ConnectionCreateError` - Failed to create relationship
- `EventCreateError` - Failed to log event
- `KnowledgeNotFoundError` - Knowledge doesn't exist
- `QueryError` - Generic query failure

---

## Step 10: Handle Hybrid Storage

If your backend doesn't support Events or Knowledge, use Convex:

```typescript
// Hybrid Events Pattern

events: {
  create: (input: CreateEventInput) =>
    Effect.tryPromise({
      try: async () => {
        // Store event in Convex (not in your backend)
        const convexUrl = config.convexUrl;
        if (!convexUrl) {
          throw new EventCreateError("Convex URL required for event storage");
        }

        const response = await fetch(`${convexUrl}/api/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...input,
            metadata: {
              ...input.metadata,
              provider: "mybackend",
              originalId: input.targetId, // Link back to backend entity
            },
          }),
        });

        const result = await response.json();
        return result.id;
      },
      catch: (error) => new EventCreateError(String(error), error),
    }),

  list: (options?: ListEventsOptions) =>
    Effect.tryPromise({
      try: async () => {
        // Query events from Convex
        const convexUrl = config.convexUrl;
        if (!convexUrl) return [];

        const params = new URLSearchParams({
          provider: "mybackend",
          targetId: options?.targetId || "",
        });

        const response = await fetch(`${convexUrl}/api/events?${params}`);
        return response.json();
      },
      catch: (error) => new QueryError("Failed to list events", error),
    }),

  get: (id: string) =>
    Effect.fail(
      new QueryError("Use Convex for event retrieval")
    ),
}
```

---

## Step 11: Write Tests

### Unit Tests

Test each operation in isolation:

```typescript
// File: /frontend/src/providers/__tests__/MyBackendProvider.test.ts

import { describe, it, expect, beforeEach } from "vitest";
import { Effect } from "effect";
import { makeMyBackendProvider } from "../mybackend/MyBackendProvider";

describe("MyBackendProvider", () => {
  let provider: DataProvider;

  beforeEach(() => {
    provider = makeMyBackendProvider({
      apiUrl: "https://test.example.com",
      apiKey: "test-key",
      organizationId: "org_123",
    });
  });

  describe("things.get", () => {
    it("should get thing by ID", async () => {
      const result = await Effect.runPromise(
        provider.things.get("mybackend_course_123")
      );

      expect(result._id).toBe("mybackend_course_123");
      expect(result.type).toBe("course");
      expect(result.name).toBeTruthy();
    });

    it("should fail with ThingNotFoundError for invalid ID", async () => {
      const result = Effect.runPromise(
        provider.things.get("invalid_id")
      );

      await expect(result).rejects.toThrow("Invalid ID");
    });
  });

  describe("things.list", () => {
    it("should list things by type", async () => {
      const result = await Effect.runPromise(
        provider.things.list({ type: "course", limit: 10 })
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
      result.forEach(thing => {
        expect(thing.type).toBe("course");
      });
    });
  });

  // ... more tests
});
```

### Integration Tests

Test with real backend (using test account):

```typescript
// File: /frontend/tests/integration/mybackend-provider.test.ts

import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { makeMyBackendProvider } from "@/providers/mybackend/MyBackendProvider";

describe("MyBackendProvider Integration", () => {
  const provider = makeMyBackendProvider({
    apiUrl: process.env.TEST_BACKEND_URL!,
    apiKey: process.env.TEST_BACKEND_API_KEY!,
    organizationId: "test_org",
  });

  it("should create, get, update, and delete a thing", async () => {
    // Create
    const id = await Effect.runPromise(
      provider.things.create({
        type: "course",
        name: "Test Course",
        properties: { content: "Test content" },
        status: "draft",
      })
    );

    expect(id).toBeTruthy();

    // Get
    const thing = await Effect.runPromise(provider.things.get(id));
    expect(thing.name).toBe("Test Course");

    // Update
    await Effect.runPromise(
      provider.things.update(id, { name: "Updated Course" })
    );

    const updated = await Effect.runPromise(provider.things.get(id));
    expect(updated.name).toBe("Updated Course");

    // Delete
    await Effect.runPromise(provider.things.delete(id));

    // Verify deleted
    const result = Effect.runPromise(provider.things.get(id));
    await expect(result).rejects.toThrow();
  });
});
```

---

## Step 12: Document Your Provider

Create a setup guide for your provider:

```markdown
# MyBackend Provider Setup Guide

## Prerequisites

1. MyBackend account with API access
2. API key generated from MyBackend dashboard
3. ONE Platform organization created

## Installation

\`\`\`bash
npm install @mybackend/sdk
\`\`\`

## Configuration

\`\`\`typescript
import { myBackendProvider } from "@/providers/mybackend/MyBackendProvider";

const provider = myBackendProvider(
  "https://api.mybackend.com",
  "your-api-key",
  "your-org-id"
);
\`\`\`

## Backend Setup

1. Create required custom fields in MyBackend:
   - `organization_id` (text field)
   - `metadata` (JSON field)
   - `status` (select field with values: Draft, Active, Published, Archived)

2. Enable API access in MyBackend settings

3. Configure webhooks (optional, for real-time updates)

## Limitations

- Events: Stored in Convex (hybrid approach)
- Knowledge: Stored in Convex (no vector support)
- Rate Limits: 100 requests/minute

## Testing

Run integration tests:
\`\`\`bash
TEST_BACKEND_URL=https://api.mybackend.com \
TEST_BACKEND_API_KEY=your-test-key \
npm test integration/mybackend-provider.test.ts
\`\`\`
```

---

## Common Patterns

### Pattern 1: Pagination

```typescript
list: (options?: ListThingsOptions) =>
  Effect.tryPromise({
    try: async () => {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;

      // Convert to backend pagination format
      const page = Math.floor(offset / limit) + 1;

      const response = await client.list({
        page,
        per_page: limit,
        status: options?.status,
      });

      return response.items.map(item => mapToThing(item));
    },
    catch: (error) => new QueryError("Failed to list", error),
  }),
```

### Pattern 2: Batching

```typescript
const batchGet = (ids: string[]) =>
  Effect.tryPromise({
    try: async () => {
      // Backend supports batch fetch
      const backendIds = ids.map(id => parseOneId(id).backendId);
      const entities = await client.batchGet(backendIds);
      return entities.map((e, i) => mapToThing(e, parseOneId(ids[i]).type));
    },
    catch: (error) => new QueryError("Batch get failed", error),
  });
```

### Pattern 3: Caching

```typescript
const cache = new Map<string, { thing: Thing; expiry: number }>();

things: {
  get: (id: string) =>
    Effect.tryPromise({
      try: async () => {
        // Check cache
        const cached = cache.get(id);
        if (cached && cached.expiry > Date.now()) {
          return cached.thing;
        }

        // Fetch from backend
        const thing = await fetchFromBackend(id);

        // Store in cache (5 minute TTL)
        cache.set(id, {
          thing,
          expiry: Date.now() + 5 * 60 * 1000,
        });

        return thing;
      },
      catch: (error) => new ThingNotFoundError(id, String(error)),
    }),
}
```

### Pattern 4: Rate Limiting

```typescript
import { RateLimiter } from "limiter";

const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
});

const withRateLimit = async <T>(fn: () => Promise<T>): Promise<T> => {
  await limiter.removeTokens(1);
  return fn();
};

things: {
  get: (id: string) =>
    Effect.tryPromise({
      try: () => withRateLimit(() => client.getEntity(id)),
      catch: (error) => new ThingNotFoundError(id, String(error)),
    }),
}
```

---

## Troubleshooting

### Issue: TypeScript errors in Effect types

**Solution:** Ensure Effect.ts version matches:

```json
{
  "dependencies": {
    "effect": "^3.0.0"
  }
}
```

### Issue: ID conversion fails

**Solution:** Add validation to ID converters:

```typescript
const parseOneId = (oneId: string): { type: string; backendId: string } => {
  const match = oneId.match(/^mybackend_([^_]+)_(.+)$/);
  if (!match) {
    console.error(`Invalid ONE ID format: ${oneId}`);
    throw new Error(`Invalid ONE ID: ${oneId}`);
  }
  return { type: match[1], backendId: match[2] };
};
```

### Issue: Properties not mapping correctly

**Solution:** Log before/after mapping:

```typescript
const mapToThing = (entity: BackendEntity): Thing => {
  console.log("Backend entity:", entity);
  const thing = {
    _id: backendIdToOneId(entity.type, entity.id),
    // ... mapping logic
  };
  console.log("Mapped thing:", thing);
  return thing;
};
```

### Issue: Backend API rate limits exceeded

**Solution:** Implement request batching or caching:

```typescript
// Batch multiple gets into single request
const batchCache: Map<string, Promise<Thing>> = new Map();

things: {
  get: (id: string) => {
    if (!batchCache.has(id)) {
      batchCache.set(id, fetchThing(id));
      setTimeout(() => batchCache.delete(id), 100); // Clear after 100ms
    }
    return batchCache.get(id)!;
  }
}
```

---

## Checklist

Before releasing your provider, verify:

- [ ] All 4 dimensions implemented (or hybrid approach documented)
- [ ] ID conversion works both ways (ONE ↔ Backend)
- [ ] Status mapping covers all ONE statuses
- [ ] Type mapping covers common thing types
- [ ] Error handling uses typed Effect errors
- [ ] Properties mapping preserves all data
- [ ] Organization isolation enforced
- [ ] Unit tests cover all operations (80%+ coverage)
- [ ] Integration tests pass with real backend
- [ ] Setup guide documented
- [ ] Limitations clearly stated
- [ ] Performance benchmarked
- [ ] Rate limiting implemented (if needed)

---

## Next Steps

1. **Share your provider:** Submit to ONE Platform provider registry
2. **Get feedback:** Test with real users
3. **Iterate:** Add features based on feedback
4. **Maintain:** Keep up with backend API changes

---

**Need Help?**
- Read existing providers: `/frontend/src/providers/convex/`, `/notion/`, `/wordpress/`
- Review ontology: `/one/knowledge/ontology.md`
- Ask questions: GitHub Discussions or Discord

**Happy Provider Building!** 🚀
