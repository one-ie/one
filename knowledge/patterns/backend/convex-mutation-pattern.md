# Convex Mutation Pattern

**Category:** Backend
**Type:** Data Modification
**Used for:** Creating, updating, or deleting entities in the ontology

---

## Pattern Overview

Every mutation in Convex should:
1. Validate inputs against ontology types
2. Perform the operation on the appropriate table
3. Create event record for audit trail
4. Return the result

## Code Template

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    type: v.string(),
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Get authenticated user (if required)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // 2. Validate against ontology
    // Check that type exists in ontology
    // Validate required fields based on type

    // 3. Insert into entities table
    const entityId = await ctx.db.insert("entities", {
      type: args.type,
      name: args.name,
      properties: args.properties,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: identity.tokenIdentifier,
    });

    // 4. Log creation event
    await ctx.db.insert("events", {
      type: "entity_created",
      actorId: identity.tokenIdentifier,
      targetId: entityId,
      timestamp: Date.now(),
      metadata: {
        entityType: args.type,
        entityName: args.name,
      },
    });

    // 5. Return result
    return entityId;
  },
});
```

## When to Use

- Creating new entities (things)
- Creating connections between entities
- Recording events
- Updating entity state or properties
- Deleting entities (soft delete via status)

## Best Practices

1. **Always log events** - Every mutation should create an event record
2. **Use soft deletes** - Change status to "archived" instead of deleting
3. **Validate early** - Check inputs before making any changes
4. **Return minimal data** - Return IDs or success indicators, not full objects
5. **Use transactions** - Convex handles transactions automatically within a mutation

## Common Mistakes

❌ **Don't:** Skip event logging
✅ **Do:** Always create an event record

❌ **Don't:** Hard delete records
✅ **Do:** Use status field for soft deletes

❌ **Don't:** Return full objects with sensitive data
✅ **Do:** Return IDs and let queries fetch data

## Related Patterns

- [Convex Query Pattern](./convex-query-pattern.md)
- [Event Logging Pattern](./event-logging-pattern.md)
- [Ontology Validation Pattern](./ontology-validation-pattern.md)
