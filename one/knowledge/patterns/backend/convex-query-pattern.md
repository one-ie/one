# Convex Query Pattern

**Category:** Backend
**Type:** Data Retrieval
**Used for:** Reading entities, connections, events from the ontology

---

## Pattern Overview

Every query in Convex should:
1. Accept filtering parameters
2. Use indexes for performance
3. Return only necessary fields
4. Support pagination for large datasets

## Code Template

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    type: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Build query with index
    let q = ctx.db
      .query("entities")
      .withIndex("by_type", (q) => q.eq("type", args.type));

    // 2. Apply filters
    if (args.status) {
      q = q.filter((entity) => entity.status === args.status);
    }

    // 3. Limit results
    const limit = args.limit || 100;
    const entities = await q.take(limit);

    // 4. Return results
    return entities;
  },
});

export const getById = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
```

## When to Use

- Listing entities of a specific type
- Fetching single entities by ID
- Searching for entities with filters
- Building relationship graphs (connections)
- Retrieving event history

## Best Practices

1. **Use indexes** - Always use indexed fields for queries
2. **Limit results** - Default to 100 items max, use pagination
3. **Filter server-side** - Don't fetch all data and filter client-side
4. **Project fields** - Only return fields you need (coming in future Convex versions)
5. **Cache-friendly** - Queries are automatically cached by Convex

## Common Mistakes

❌ **Don't:** Query without indexes
✅ **Do:** Use `.withIndex()` for primary filters

❌ **Don't:** Return unlimited results
✅ **Do:** Always use `.take(limit)`

❌ **Don't:** Fetch then filter client-side
✅ **Do:** Filter in the query

## Related Patterns

- [Convex Mutation Pattern](./convex-mutation-pattern.md)
- [Pagination Pattern](./pagination-pattern.md)
- [Index Strategy Pattern](./index-strategy-pattern.md)
