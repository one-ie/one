# Pattern: Convex Query Template

**Category:** Backend
**Context:** When creating Convex queries for reading data (list, get by ID, search)
**Problem:** Need consistent query structure that respects multi-tenancy, uses indexes efficiently, and handles auth

## Solution

Keep queries simple and fast. Use indexes, filter by organization, return only necessary fields. No business logic in queries.

## Template

```typescript
// backend/convex/queries/{entities}.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Build query with indexes
    let query = ctx.db
      .query("{entities}")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", identity.orgId)
      );

    // 3. Apply filters
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    // 4. Execute with limit
    const entities = await query
      .order("desc")
      .take(args.limit ?? 100);

    return entities;
  },
});

export const getById = query({
  args: {
    id: v.id("{entities}"),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // 2. Get entity
    const entity = await ctx.db.get(args.id);

    // 3. Check ownership (multi-tenancy)
    if (!entity || entity.organizationId !== identity.orgId) {
      return null;
    }

    return entity;
  },
});

export const getByType = query({
  args: {
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Query with compound index
    const entities = await ctx.db
      .query("{entities}")
      .withIndex("by_organization_and_type", (q) =>
        q.eq("organizationId", identity.orgId).eq("type", args.type)
      )
      .order("desc")
      .take(args.limit ?? 100);

    return entities;
  },
});

export const search = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // 2. Search by organization first (use index)
    let results = ctx.db
      .query("{entities}")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", identity.orgId)
      );

    // 3. Filter by type if provided
    if (args.type) {
      results = results.filter((q) => q.eq(q.field("type"), args.type));
    }

    // 4. Search in name and properties (text search)
    const searchTerm = args.query.toLowerCase();
    const entities = await results.collect();

    const filtered = entities.filter((entity) => {
      const nameMatch = entity.name?.toLowerCase().includes(searchTerm);
      const propsMatch = JSON.stringify(entity.properties)
        .toLowerCase()
        .includes(searchTerm);
      return nameMatch || propsMatch;
    });

    // 5. Return with limit
    return filtered.slice(0, args.limit ?? 50);
  },
});

export const count = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    // 2. Build query
    let query = ctx.db
      .query("{entities}")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", identity.orgId)
      );

    // 3. Apply filters
    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    // 4. Count
    const entities = await query.collect();
    return entities.length;
  },
});
```

## Variables

- `{entities}` - Table name (always "entities" in our ontology)

## Usage

1. Copy template to `backend/convex/queries/{entities}.ts`
2. Add entity-specific query methods as needed
3. Ensure indexes exist in schema (`by_organization`, `by_organization_and_type`)
4. Export from `backend/convex/_generated/api.ts`

## Example (Course Queries)

```typescript
// backend/convex/queries/entities.ts

export const listCourses = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("entities")
      .withIndex("by_organization_and_type", (q) =>
        q.eq("organizationId", identity.orgId).eq("type", "course")
      )
      .filter((q) =>
        args.status ? q.eq(q.field("status"), args.status) : true
      )
      .collect();
  },
});

export const getCourseWithLessons = query({
  args: {
    courseId: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Get course
    const course = await ctx.db.get(args.courseId);
    if (!course || course.organizationId !== identity.orgId) {
      return null;
    }

    // Get lessons (via connections)
    const lessonConnections = await ctx.db
      .query("connections")
      .withIndex("by_source", (q) => q.eq("sourceId", args.courseId))
      .filter((q) => q.eq(q.field("type"), "contains"))
      .collect();

    const lessons = await Promise.all(
      lessonConnections.map((conn) => ctx.db.get(conn.targetId))
    );

    return {
      course,
      lessons: lessons.filter(Boolean),
    };
  },
});
```

## Common Mistakes

- **Mistake:** Not checking authentication
  - **Fix:** Always verify `ctx.auth.getUserIdentity()` first
- **Mistake:** Not filtering by organization (multi-tenancy leak)
  - **Fix:** Always use `by_organization` index first
- **Mistake:** Not using indexes (slow queries)
  - **Fix:** Use `withIndex()` for frequently queried fields
- **Mistake:** Returning too many results
  - **Fix:** Always apply `.take(limit)` or slice results
- **Mistake:** Doing heavy computation in queries
  - **Fix:** Keep queries simple, pre-compute in mutations if needed

## Related Patterns

- **service-template.md** - Business logic that queries might need
- **mutation-template.md** - Write operations
- **Schema indexes** - Define indexes in `schema.ts` for efficient queries
