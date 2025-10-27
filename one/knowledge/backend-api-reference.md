# Backend API Reference - Quick Guide

**Status:** Production-Ready
**Last Updated:** 2025-10-24
**Version:** 1.0.0

---

## Overview

Complete backend API for the 6-dimension ontology. All endpoints follow multi-tenant isolation (scoped to groupId).

---

## Groups API

### Queries

```typescript
// Get group by slug (URL routing)
api.queries.groups.getBySlug({ slug: "acme" })

// Get group by ID
api.queries.groups.getById({ groupId })

// List groups with filters
api.queries.groups.list({
  type?: "organization" | "business" | "community" | "dao" | "government" | "friend_circle",
  status?: "active" | "archived",
  limit?: number
})

// Get direct children
api.queries.groups.getSubgroups({ parentGroupId })

// Get entire hierarchy (recursive)
api.queries.groups.getHierarchy({
  rootGroupId,
  maxDepth?: number // Default: 10
})

// Get breadcrumb trail
api.queries.groups.getGroupPath({ groupId })

// Check if group is descendant
api.queries.groups.isDescendantOf({ groupId, ancestorGroupId })

// Get entities in hierarchy
api.queries.groups.getEntitiesInHierarchy({
  rootGroupId,
  entityType?: string,
  limit?: number
})

// Get statistics
api.queries.groups.getStats({
  groupId,
  includeSubgroups?: boolean
})

// Search groups
api.queries.groups.search({
  query: string,
  type?: string,
  visibility?: "public" | "private",
  limit?: number
})
```

### Mutations

```typescript
// Create group
api.mutations.groups.create({
  slug: string,
  name: string,
  type: "organization" | "business" | "community" | "dao" | "government" | "friend_circle",
  parentGroupId?: Id<"groups">,
  description?: string,
  metadata?: any,
  settings?: {
    visibility: "public" | "private",
    joinPolicy: "open" | "invite_only" | "approval_required",
    plan?: "starter" | "pro" | "enterprise",
    limits?: {
      users: number,
      storage: number,
      apiCalls: number
    }
  }
})

// Update group
api.mutations.groups.update({
  groupId: Id<"groups">,
  name?: string,
  description?: string,
  metadata?: any,
  settings?: { ... }
})

// Archive group (soft delete)
api.mutations.groups.archive({ groupId })

// Restore archived group
api.mutations.groups.restore({ groupId })
```

---

## Things (Entities) API

### Queries

```typescript
// List entities with filters
api.queries.entities.list({
  groupId: Id<"groups">,
  type?: string, // Any THING_TYPE from ontology
  status?: "draft" | "active" | "published" | "archived" | "inactive",
  limit?: number
})

// Get entity by ID
api.queries.entities.getById({
  entityId: Id<"entities">,
  groupId?: Id<"groups"> // Optional security validation
})

// Search entities by name
api.queries.entities.search({
  groupId: Id<"groups">,
  query: string,
  type?: string,
  limit?: number
})

// Get entity with connections
api.queries.entities.getWithConnections({
  entityId: Id<"entities">,
  groupId?: Id<"groups">
})
// Returns: { entity, connectionsFrom, connectionsTo }

// Get entity activity timeline
api.queries.entities.getActivity({
  entityId: Id<"entities">,
  limit?: number
})

// Count entities by type
api.queries.entities.countByType({ groupId })
// Returns: { [type: string]: number }

// Count entities by status
api.queries.entities.countByStatus({
  groupId: Id<"groups">,
  type?: string
})
// Returns: { [status: string]: number }

// Get recent entities
api.queries.entities.getRecent({
  groupId: Id<"groups">,
  type?: string,
  limit?: number
})

// Get recently updated
api.queries.entities.getRecentlyUpdated({
  groupId: Id<"groups">,
  type?: string,
  limit?: number
})
```

### Mutations

```typescript
// Create entity
api.mutations.entities.create({
  groupId: Id<"groups">,
  type: string, // Must be valid THING_TYPE
  name: string,
  properties?: any,
  status?: "draft" | "active" | "published" | "archived" | "inactive"
})

// Update entity
api.mutations.entities.update({
  entityId: Id<"entities">,
  name?: string,
  properties?: any,
  status?: "draft" | "active" | "published" | "archived" | "inactive"
})

// Archive entity (soft delete)
api.mutations.entities.archive({ entityId })

// Restore archived entity
api.mutations.entities.restore({ entityId })
```

---

## Connections API

### Queries

```typescript
// List connections FROM an entity
api.queries.connections.listFrom({
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  relationshipType?: string // 25 connection types
})

// List connections TO an entity
api.queries.connections.listTo({
  groupId: Id<"groups">,
  toEntityId: Id<"entities">,
  relationshipType?: string
})

// List connections between two entities
api.queries.connections.listBetween({
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType?: string
})

// List connections by type
api.queries.connections.listByType({
  groupId: Id<"groups">,
  relationshipType: string,
  limit?: number
})
```

### Mutations

```typescript
// Create connection
api.mutations.connections.create({
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: string, // 25 types: owns, created_by, clone_of, etc.
  metadata?: any,
  strength?: number,
  validFrom?: number,
  validTo?: number
})

// Upsert connection (create or update)
api.mutations.connections.upsert({
  groupId: Id<"groups">,
  fromEntityId: Id<"entities">,
  toEntityId: Id<"entities">,
  relationshipType: string,
  metadata?: any,
  strength?: number,
  validFrom?: number,
  validTo?: number
})

// Bulk create connections
api.mutations.connections.bulkCreate({
  groupId: Id<"groups">,
  connections: Array<{
    fromEntityId: Id<"entities">,
    toEntityId: Id<"entities">,
    relationshipType: string,
    metadata?: any
  }>
})
```

---

## Events API (Read-Only)

### Queries

```typescript
// List events (timeline view)
api.queries.events.list({
  groupId: Id<"groups">,
  eventType?: string, // 67 event types
  limit?: number,
  offset?: number
})

// Events by actor (person who performed action)
api.queries.events.byActor({
  groupId: Id<"groups">,
  actorId: Id<"entities">,
  eventType?: string,
  limit?: number
})

// Events by target (thing that was affected)
api.queries.events.byTarget({
  groupId: Id<"groups">,
  targetId: Id<"entities">,
  eventType?: string,
  limit?: number
})

// Events by time range
api.queries.events.byTimeRange({
  groupId: Id<"groups">,
  startTime: number,
  endTime: number,
  eventType?: string,
  limit?: number
})

// Event statistics
api.queries.events.stats({
  groupId: Id<"groups">,
  startTime?: number,
  endTime?: number
})
// Returns: { total, byType, byActor, topTypes, topActors, timeRange }

// Recent events
api.queries.events.recent({
  groupId: Id<"groups">,
  limit?: number // Default: 20
})

// Get event by ID
api.queries.events.getById({
  eventId: Id<"events">,
  groupId?: Id<"groups">
})
```

---

## Knowledge API (Read-Only)

### Queries

```typescript
// List knowledge items
api.queries.knowledge.list({
  groupId: Id<"groups">,
  knowledgeType?: "label" | "document" | "chunk" | "vector_only",
  limit?: number
})

// Search knowledge (basic text search)
api.queries.knowledge.search({
  groupId: Id<"groups">,
  query: string,
  knowledgeType?: "label" | "document" | "chunk" | "vector_only",
  limit?: number
})

// Knowledge by source thing
api.queries.knowledge.bySourceThing({
  groupId: Id<"groups">,
  sourceThingId: Id<"entities">,
  knowledgeType?: "label" | "document" | "chunk" | "vector_only"
})

// Knowledge linked to thing (via junction)
api.queries.knowledge.byThing({
  thingId: Id<"entities">,
  role?: "label" | "summary" | "chunk_of" | "caption" | "keyword"
})

// Knowledge by label
api.queries.knowledge.byLabel({
  groupId: Id<"groups">,
  label: string,
  limit?: number
})

// List all labels
api.queries.knowledge.listLabels({ groupId })
// Returns: Array<{ label: string, count: number }>

// Knowledge statistics
api.queries.knowledge.stats({ groupId })
// Returns: { total, byType, withEmbeddings, withLabels, uniqueLabels }

// Get knowledge by ID
api.queries.knowledge.getById({
  knowledgeId: Id<"knowledge">,
  groupId?: Id<"groups">
})
```

---

## Effect.ts Services

### AgentService

```typescript
import { AgentService, runWithServices } from "./services/layers";

const program = Effect.gen(function* () {
  const agent = yield* AgentService;

  // Create thread
  const { threadId } = yield* agent.createThread("user123", { topic: "support" });

  // Send message
  const { response, tokensUsed } = yield* agent.sendMessage(threadId, "Hello!");

  // Stream response
  const stream = yield* agent.streamResponse(threadId, "Tell me more");

  // List threads
  const threads = yield* agent.listThreads("user123");

  return { threadId, response, tokensUsed };
});

// Run with services
const result = await runWithServices(program);
```

### RAGService

```typescript
import { RAGService, runWithServices } from "./services/layers";

const program = Effect.gen(function* () {
  const rag = yield* RAGService;

  // Add document
  const { documentId } = yield* rag.addDocument(
    "group:acme",
    "This is searchable content",
    { title: "Blog Post", author: "John" }
  );

  // Search
  const results = yield* rag.search("group:acme", "searchable", 10, 0.6);

  // Delete document
  yield* rag.deleteDocument("group:acme", documentId);

  return results;
});

const results = await runWithServices(program);
```

### RateLimiterService

```typescript
import { RateLimiterService, runWithServices } from "./services/layers";

const program = Effect.gen(function* () {
  const limiter = yield* RateLimiterService;

  // Check limit (100 requests per minute)
  const { allowed, remaining } = yield* limiter.checkLimit(
    "user:123",
    100,
    60000
  );

  if (!allowed) {
    throw new Error("Rate limit exceeded");
  }

  // Get usage
  const usage = yield* limiter.getUsage("user:123");

  // Reset limit (admin operation)
  yield* limiter.resetLimit("user:123");

  return { allowed, remaining, usage };
});

const result = await runWithServices(program);
```

### WorkflowService

```typescript
import { WorkflowService, runWithServices } from "./services/layers";

const program = Effect.gen(function* () {
  const workflow = yield* WorkflowService;

  // Start workflow
  const { workflowId } = yield* workflow.startWorkflow("processOrder", {
    orderId: "order_123",
    items: [...]
  });

  // Check status
  const { status, result } = yield* workflow.getWorkflowStatus(workflowId);

  // Cancel if needed
  if (status === "running") {
    yield* workflow.cancelWorkflow(workflowId);
  }

  return { workflowId, status, result };
});

const result = await runWithServices(program);
```

---

## Common Patterns

### Authentication

```typescript
// In mutations
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Unauthenticated");
}

// Find user entity
const user = await ctx.db
  .query("entities")
  .withIndex("group_type", q => q.eq("groupId", groupId).eq("type", "user"))
  .filter(q => q.eq(q.field("properties.userId"), identity.tokenIdentifier))
  .first();
```

### Multi-Tenant Isolation

```typescript
// ALWAYS filter by groupId
const entities = await ctx.db
  .query("entities")
  .withIndex("by_group", q => q.eq("groupId", groupId))
  .collect();
```

### Event Logging

```typescript
// After any mutation
await ctx.db.insert("events", {
  groupId,
  type: "thing_created", // or thing_updated, thing_deleted
  actorId: user._id,
  targetId: entityId,
  timestamp: Date.now(),
  metadata: {
    entityType: "blog_post",
    entityName: "My First Post",
    action: "created"
  }
});
```

### Error Handling with Effect.ts

```typescript
import { Effect } from "effect";
import { ValidationError, DatabaseError } from "./services/layers";

const program = Effect.gen(function* () {
  // Validate input
  if (!name || name.trim().length < 2) {
    return yield* Effect.fail(new ValidationError({
      field: "name",
      message: "Name must be at least 2 characters"
    }));
  }

  // Wrap database operation
  const result = yield* Effect.tryPromise({
    try: () => ctx.db.insert("entities", { ... }),
    catch: (cause) => new DatabaseError({ cause, operation: "mutation", table: "entities" })
  });

  return result;
});

// Handle errors
const result = await Effect.match(program, {
  onFailure: (error) => {
    if (error._tag === "ValidationError") {
      console.error(`Validation failed: ${error.message}`);
    } else if (error._tag === "DatabaseError") {
      console.error(`Database error: ${error.operation}`);
    }
  },
  onSuccess: (value) => {
    console.log("Success:", value);
  }
});
```

---

## Connection Types (25 total)

```typescript
// Ownership (2)
"owns" | "created_by"

// AI Relationships (3)
"clone_of" | "trained_on" | "powers"

// Content Relationships (5)
"authored" | "generated_by" | "published_to" | "part_of" | "references"

// Community Relationships (4)
"member_of" | "following" | "moderates" | "participated_in"

// Business Relationships (3)
"manages" | "reports_to" | "collaborates_with"

// Token Relationships (3)
"holds_tokens" | "staked_in" | "earned_from"

// Product Relationships (4)
"purchased" | "enrolled_in" | "completed" | "teaching"

// Consolidated Types (7)
"transacted" | "notified" | "referred" | "communicated" | "delegated" | "approved" | "fulfilled"
```

---

## Event Types (67 total, subset shown)

```typescript
// Thing Lifecycle
"thing_created" | "thing_updated" | "thing_deleted"

// User Events
"user_registered" | "user_verified" | "user_login" | "profile_updated"

// Authentication Events
"password_reset_requested" | "email_verified" | "two_factor_enabled"

// Group Events
"user_invited_to_group" | "user_joined_group" | "user_removed_from_group"

// Agent Events
"agent_executed" | "agent_completed" | "agent_failed"

// Token Events
"token_minted" | "tokens_purchased" | "tokens_transferred"

// Course Events
"course_enrolled" | "lesson_completed" | "certificate_earned"

// Analytics Events
"metric_calculated" | "insight_generated" | "prediction_made"

// Consolidated Events
"content_event" | "payment_event" | "commerce_event" | "communication_event"
```

---

## Type Safety

All types are auto-generated from the schema. Use the generated types:

```typescript
import { Id, Doc } from "./_generated/dataModel";

// Type-safe IDs
const groupId: Id<"groups"> = "...";
const entityId: Id<"entities"> = "...";

// Type-safe documents
const group: Doc<"groups"> = await ctx.db.get(groupId);
const entity: Doc<"entities"> = await ctx.db.get(entityId);
```

---

## Performance Tips

1. **Use indexes:** Always use indexed fields for queries
2. **Paginate:** Use limit/offset for large result sets
3. **Filter efficiently:** Filter by indexed fields first
4. **Avoid full scans:** Use .withIndex() instead of .filter() when possible
5. **Batch operations:** Use bulkCreate for multiple connections

---

## Security Checklist

- ✅ Authenticate user (ctx.auth.getUserIdentity())
- ✅ Validate group access
- ✅ Filter by groupId (multi-tenant isolation)
- ✅ Check entity belongs to group
- ✅ Log all mutations (audit trail)
- ✅ Validate inputs
- ✅ Handle errors gracefully

---

**Status:** Production-Ready
**Last Updated:** 2025-10-24
**Version:** 1.0.0
