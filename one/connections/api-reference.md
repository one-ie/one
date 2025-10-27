# ONE Platform API Reference

**Version:** 1.0.0
**Created:** 2025-01-25
**Purpose:** Complete API documentation for all Convex queries and mutations

---

## Authentication

All API operations require authentication via Better Auth. Include session token in headers:

```typescript
Authorization: Bearer <session-token>
```

**Authentication Methods:**
- Email/Password
- OAuth (GitHub, Google)
- Magic Links
- 2FA (TOTP + Backup codes)

---

## Response Format

### Success Response
```typescript
{
  data: <result>,
  _id: Id<"table">,
  _creationTime: number
}
```

### Error Response
```typescript
{
  error: {
    message: string,
    code: string,
    details?: any
  }
}
```

---

## Groups API (Dimension 1: Multi-Tenant Isolation)

Groups are the foundation of multi-tenancy in ONE Platform. Every entity, connection, event, and knowledge item belongs to a group.

### Queries

#### `getBySlug`
Get a group by its URL slug.

**Arguments:**
```typescript
{
  slug: string  // URL-friendly identifier
}
```

**Returns:** `Group | null`

**Example:**
```typescript
const group = await convex.query(api.queries.groups.getBySlug, {
  slug: "emmas-lemonade"
});
```

---

#### `getById`
Get a group by ID.

**Arguments:**
```typescript
{
  groupId: Id<"groups">
}
```

**Returns:** `Group | null`

**Example:**
```typescript
const group = await convex.query(api.queries.groups.getById, {
  groupId: "j1x7k2m3n4p5q6r7s8t9"
});
```

---

#### `list`
List groups with optional filters.

**Arguments:**
```typescript
{
  type?: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  status?: "active" | "archived",
  limit?: number
}
```

**Returns:** `Group[]`

**Example:**
```typescript
const businesses = await convex.query(api.queries.groups.list, {
  type: "business",
  status: "active",
  limit: 10
});
```

---

#### `getSubgroups`
Get direct children (non-recursive) of a parent group.

**Arguments:**
```typescript
{
  parentGroupId: Id<"groups">
}
```

**Returns:** `Group[]`

**Example:**
```typescript
const departments = await convex.query(api.queries.groups.getSubgroups, {
  parentGroupId: acmeCorpId
});
```

---

#### `getHierarchy`
Get entire group hierarchy recursively (all descendants).

**Arguments:**
```typescript
{
  rootGroupId: Id<"groups">,
  maxDepth?: number  // Default: 10, prevents infinite recursion
}
```

**Returns:** `Array<Group & { depth: number, parentId: string }>`

**Example:**
```typescript
const hierarchy = await convex.query(api.queries.groups.getHierarchy, {
  rootGroupId: acmeCorpId,
  maxDepth: 5
});
```

---

#### `getGroupPath`
Get breadcrumb trail from root to specific group.

**Arguments:**
```typescript
{
  groupId: Id<"groups">
}
```

**Returns:** `Group[]` (ordered: [root, parent, grandparent, ..., targetGroup])

**Example:**
```typescript
const path = await convex.query(api.queries.groups.getGroupPath, {
  groupId: backendTeamId
});
// Returns: [AcmeCorp, Engineering, BackendTeam]
```

---

#### `isDescendantOf`
Check if a group is a descendant of another group (useful for permissions).

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  ancestorGroupId: Id<"groups">
}
```

**Returns:** `boolean`

**Example:**
```typescript
const hasAccess = await convex.query(api.queries.groups.isDescendantOf, {
  groupId: backendTeamId,
  ancestorGroupId: acmeCorpId
});
// Returns: true (BackendTeam → Engineering → AcmeCorp)
```

---

#### `getEntitiesInHierarchy`
Get all entities in group + all subgroups (recursive).

**Arguments:**
```typescript
{
  rootGroupId: Id<"groups">,
  entityType?: string,  // Filter by entity type
  limit?: number
}
```

**Returns:** `Entity[]`

**Example:**
```typescript
const allProjects = await convex.query(api.queries.groups.getEntitiesInHierarchy, {
  rootGroupId: acmeCorpId,
  entityType: "project",
  limit: 50
});
```

---

#### `getStats`
Get statistics for a group (optionally including subgroups).

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  includeSubgroups?: boolean
}
```

**Returns:**
```typescript
{
  group: Group,
  stats: {
    members: number,
    entities: number,
    connections: number,
    events: number,
    knowledge: number,
    subgroups: number
  }
}
```

**Example:**
```typescript
const stats = await convex.query(api.queries.groups.getStats, {
  groupId: acmeCorpId,
  includeSubgroups: true
});
```

---

#### `search`
Search groups by name or slug.

**Arguments:**
```typescript
{
  query: string,
  type?: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  visibility?: "public" | "private",
  limit?: number
}
```

**Returns:** `Group[]`

**Example:**
```typescript
const results = await convex.query(api.queries.groups.search, {
  query: "acme",
  type: "business",
  visibility: "private",
  limit: 5
});
```

---

### Mutations

#### `create`
Create a new group.

**Arguments:**
```typescript
{
  slug: string,                     // URL-friendly identifier (must be unique)
  name: string,                     // Display name
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,     // For hierarchical nesting
  description?: string,
  metadata?: any,
  settings?: {
    visibility: "public" | "private",
    joinPolicy: "open" | "invite_only" | "approval_required",
    plan?: "starter" | "pro" | "enterprise",
    limits?: {
      users: number,
      storage: number,      // GB
      apiCalls: number
    }
  }
}
```

**Returns:** `Id<"groups">`

**Example:**
```typescript
const groupId = await convex.mutation(api.mutations.groups.create, {
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "organization",
  description: "Enterprise SaaS company",
  settings: {
    visibility: "private",
    joinPolicy: "invite_only",
    plan: "enterprise",
    limits: {
      users: 100,
      storage: 1000,
      apiCalls: 1000000
    }
  }
});
```

**Default Settings by Type:**
- `friend_circle`: private, invite_only, starter
- `business`: private, invite_only, pro
- `community`: public, approval_required, pro
- `dao`: public, open, pro
- `government`: public, approval_required, enterprise
- `organization`: private, invite_only, starter

---

#### `update`
Update an existing group.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  name?: string,
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
}
```

**Returns:** `Id<"groups">`

**Example:**
```typescript
await convex.mutation(api.mutations.groups.update, {
  groupId: acmeCorpId,
  settings: {
    plan: "enterprise",
    limits: {
      users: 200,
      storage: 2000,
      apiCalls: 2000000
    }
  }
});
```

---

#### `archive`
Archive a group (soft delete - maintains audit trail).

**Arguments:**
```typescript
{
  groupId: Id<"groups">
}
```

**Returns:** `Id<"groups">`

**Example:**
```typescript
await convex.mutation(api.mutations.groups.archive, {
  groupId: oldProjectId
});
```

---

#### `restore`
Restore an archived group.

**Arguments:**
```typescript
{
  groupId: Id<"groups">
}
```

**Returns:** `Id<"groups">`

**Example:**
```typescript
await convex.mutation(api.mutations.groups.restore, {
  groupId: oldProjectId
});
```

---

## Entities API (Dimension 3: Things)

Entities represent all "things" in the system - users, content, products, courses, etc.

### Queries

#### `list`
List entities in a group with optional filters.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  type?: string,        // Entity type from ontology
  status?: string,      // draft, active, published, archived, inactive
  limit?: number
}
```

**Returns:** `Entity[]`

**Example:**
```typescript
const courses = await convex.query(api.queries.entities.list, {
  groupId: acmeCorpId,
  type: "course",
  status: "published",
  limit: 20
});
```

**Performance:** Uses `group_type` index for efficient filtering.

---

#### `getById`
Get a single entity by ID with optional group validation.

**Arguments:**
```typescript
{
  entityId: Id<"entities">,
  groupId?: Id<"groups">  // Optional security validation
}
```

**Returns:** `Entity | null`

**Example:**
```typescript
const course = await convex.query(api.queries.entities.getById, {
  entityId: courseId,
  groupId: acmeCorpId  // Ensures entity belongs to expected group
});
```

---

#### `search`
Search entities by name (case-insensitive).

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  query: string,
  type?: string,
  limit?: number
}
```

**Returns:** `Entity[]`

**Example:**
```typescript
const results = await convex.query(api.queries.entities.search, {
  groupId: acmeCorpId,
  query: "typescript",
  type: "course",
  limit: 10
});
```

---

#### `getWithConnections`
Get entity with all its connections (both FROM and TO).

**Arguments:**
```typescript
{
  entityId: Id<"entities">,
  groupId?: Id<"groups">
}
```

**Returns:**
```typescript
{
  entity: Entity,
  connectionsFrom: Connection[],
  connectionsTo: Connection[]
} | null
```

**Example:**
```typescript
const graph = await convex.query(api.queries.entities.getWithConnections, {
  entityId: userId
});
// Returns: { entity, connectionsFrom: [owns, created], connectionsTo: [enrolled_in] }
```

**Use Case:** Relationship visualization, graph queries

---

#### `getActivity`
Get entity activity timeline (all events where entity is target).

**Arguments:**
```typescript
{
  entityId: Id<"entities">,
  limit?: number
}
```

**Returns:** `Event[]` (sorted by timestamp, most recent first)

**Example:**
```typescript
const activity = await convex.query(api.queries.entities.getActivity, {
  entityId: courseId,
  limit: 20
});
```

---

#### `countByType`
Count entities by type in a group.

**Arguments:**
```typescript
{
  groupId: Id<"groups">
}
```

**Returns:** `Record<string, number>`

**Example:**
```typescript
const counts = await convex.query(api.queries.entities.countByType, {
  groupId: acmeCorpId
});
// Returns: { user: 50, course: 12, lesson: 150, project: 8 }
```

**Use Case:** Dashboard statistics

---

#### `countByStatus`
Count entities by status in a group.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  type?: string
}
```

**Returns:** `Record<string, number>`

**Example:**
```typescript
const statuses = await convex.query(api.queries.entities.countByStatus, {
  groupId: acmeCorpId,
  type: "course"
});
// Returns: { draft: 3, published: 8, archived: 1 }
```

**Use Case:** Workflow dashboards

---

#### `getRecent`
Get recently created entities.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  type?: string,
  limit?: number
}
```

**Returns:** `Entity[]` (sorted by createdAt, most recent first)

**Example:**
```typescript
const recent = await convex.query(api.queries.entities.getRecent, {
  groupId: acmeCorpId,
  type: "project",
  limit: 5
});
```

---

#### `getRecentlyUpdated`
Get recently updated entities.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  type?: string,
  limit?: number
}
```

**Returns:** `Entity[]` (sorted by updatedAt, most recent first)

**Example:**
```typescript
const updated = await convex.query(api.queries.entities.getRecentlyUpdated, {
  groupId: acmeCorpId,
  limit: 10
});
```

---

### Mutations

#### `create`
Create a new entity.

**Arguments:**
```typescript
{
  groupId: Id<"groups">,
  type: string,           // Must be valid ThingType from ontology
  name: string,
  properties?: any,       // Type-specific metadata
  status?: "draft" | "active" | "published" | "archived" | "inactive"
}
```

**Returns:** `Id<"entities">`

**Example:**
```typescript
const courseId = await convex.mutation(api.mutations.entities.create, {
  groupId: acmeCorpId,
  type: "course",
  name: "TypeScript Fundamentals",
  properties: {
    description: "Learn TypeScript from scratch",
    duration: 40,
    instructor: "Jane Doe",
    price: 99
  },
  status: "draft"
});
```

**Validation:**
- Authenticates user
- Validates group exists and is active
- Validates type against THING_TYPES from ontology composition
- Logs `thing_created` event

---

#### `update`
Update an existing entity.

**Arguments:**
```typescript
{
  entityId: Id<"entities">,
  name?: string,
  properties?: any,
  status?: "draft" | "active" | "published" | "archived" | "inactive"
}
```

**Returns:** `Id<"entities">`

**Example:**
```typescript
await convex.mutation(api.mutations.entities.update, {
  entityId: courseId,
  status: "published",
  properties: {
    publishedAt: Date.now()
  }
});
```

**Audit Trail:** Logs changes in `thing_updated` event metadata

---

#### `archive`
Archive an entity (soft delete).

**Arguments:**
```typescript
{
  entityId: Id<"entities">
}
```

**Returns:** `Id<"entities">`

**Example:**
```typescript
await convex.mutation(api.mutations.entities.archive, {
  entityId: oldCourseId
});
```

**Behavior:**
- Sets status to "archived"
- Sets deletedAt timestamp
- Maintains audit trail
- Does NOT delete data

---

#### `restore`
Restore an archived entity.

**Arguments:**
```typescript
{
  entityId: Id<"entities">
}
```

**Returns:** `Id<"entities">`

**Example:**
```typescript
await convex.mutation(api.mutations.entities.restore, {
  entityId: oldCourseId
});
```

**Behavior:**
- Sets status to "active"
- Clears deletedAt timestamp
- Logs `thing_created` event with action: "restored"

---

## Entity Types (Ontology Composition)

**Available via:** `THING_TYPES` constant from ontology composition

**Dynamic Generation:** Types auto-generated from YAML ontologies based on enabled features.

**Current Features:** blog, portfolio, courses, tokens, agents, etc.

**Example Types:**
- `user` - Platform user
- `course` - Educational course
- `lesson` - Course lesson
- `project` - Portfolio project
- `blog_post` - Blog article
- `token` - Digital token/asset
- `agent` - AI agent
- `skill` - User skill
- `award` - Achievement

**Validation:** All entity creation validates type against current THING_TYPES.

---

## Error Handling

### Common Errors

#### Authentication Errors
```typescript
{
  error: {
    code: "UNAUTHENTICATED",
    message: "Must be logged in to create entities"
  }
}
```

#### Validation Errors
```typescript
{
  error: {
    code: "INVALID_TYPE",
    message: "Invalid entity type \"foo\". Must be one of: user, course, ..."
  }
}
```

#### Permission Errors
```typescript
{
  error: {
    code: "GROUP_ACCESS_DENIED",
    message: "Entity not found in specified group"
  }
}
```

#### Not Found Errors
```typescript
{
  error: {
    code: "NOT_FOUND",
    message: "Group not found"
  }
}
```

---

## Rate Limiting

**Per-User Limits:**
- Queries: 1000/minute
- Mutations: 100/minute

**Per-Organization Limits (by plan):**
- Starter: 10,000 API calls/month
- Pro: 100,000 API calls/month
- Enterprise: 1,000,000 API calls/month

**Response Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1622547600
```

---

## Pagination

**Cursor-Based Pagination:**
```typescript
const results = await convex.query(api.queries.entities.list, {
  groupId,
  limit: 20,
  cursor: "last_entity_id"
});
```

**Response:**
```typescript
{
  items: Entity[],
  nextCursor: string | null,
  hasMore: boolean
}
```

---

## Connections API (Dimension 4)

See `/one/connections/connections.md` for complete Connections API documentation.

---

## Events API (Dimension 5)

See `/one/connections/events.md` for complete Events API documentation.

---

## Knowledge API (Dimension 6)

See `/one/connections/knowledge.md` for complete Knowledge API documentation including RAG and semantic search.

---

## Best Practices

### 1. Always Scope to Group
```typescript
// ✅ CORRECT
const entities = await convex.query(api.queries.entities.list, {
  groupId: acmeCorpId,
  type: "course"
});

// ❌ WRONG - Missing groupId (breaks multi-tenancy)
const entities = await convex.query(api.queries.entities.listAll);
```

### 2. Validate Group Access
```typescript
// ✅ CORRECT - Validate entity belongs to expected group
const entity = await convex.query(api.queries.entities.getById, {
  entityId,
  groupId: currentUserGroupId
});
```

### 3. Use Indexes for Performance
```typescript
// ✅ CORRECT - Uses group_type index
const courses = await convex.query(api.queries.entities.list, {
  groupId,
  type: "course"
});

// ❌ SLOW - No index, filters in memory
const courses = (await convex.query(api.queries.entities.list, { groupId }))
  .filter(e => e.type === "course");
```

### 4. Log All Mutations
```typescript
// ✅ Automatically logged by mutations
await convex.mutation(api.mutations.entities.create, { /* ... */ });
// Creates thing_created event

// Event includes:
// - actorId (who did it)
// - targetId (what was created)
// - timestamp (when)
// - metadata (details)
```

### 5. Handle Errors Gracefully
```typescript
try {
  const entity = await convex.query(api.queries.entities.getById, { entityId });
} catch (error) {
  if (error.code === "NOT_FOUND") {
    // Handle missing entity
  } else if (error.code === "UNAUTHENTICATED") {
    // Redirect to login
  } else {
    // Log unexpected error
  }
}
```

---

## Related Documentation

- [Architecture Overview](/one/knowledge/architecture.md)
- [Ontology Specification](/one/knowledge/ontology.md)
- [Integration Guide](/one/connections/integration-guide.md)
- [Multi-Tenant Best Practices](/one/connections/multi-tenant.md)

---

**Built with clarity and infinite scale in mind.**
