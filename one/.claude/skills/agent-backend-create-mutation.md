---
name: agent-backend:create-mutation
description: Generate Convex mutations with 6-dimension ontology validation, event logging, and organization scoping
---

# Agent-Backend: Create Mutation

## Purpose

Generate production-ready Convex mutations that:
- Validate authentication and organization context
- Implement 6-dimension ontology operations (things, connections, events)
- Log events for audit trails
- Enforce organization quotas
- Handle errors with meaningful messages

## When to Use This Skill

- Implementing new mutation handlers
- Creating CRUD operations for entities
- Building state-change operations
- Enforcing multi-tenant isolation
- Adding event logging

## Instructions

### 1. Map to 6 Dimensions

Identify what dimensions the mutation affects:

```typescript
// Example: Creating a course (mutation affects multiple dimensions)
// 3. THINGS: Create course entity
// 4. CONNECTIONS: Create owns relationship
// 5. EVENTS: Log course_created event
```

### 2. Use Standard Mutation Pattern

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. AUTHENTICATE
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 2. GET ACTOR (person/creator)
    const person = await ctx.db.query("things")
      .withIndex("by_type_and_email", q =>
        q.eq("type", "user")
         .eq("properties.email", identity.email)
      )
      .first();
    if (!person) throw new Error("User not found");

    // 3. VALIDATE ORGANIZATION
    const org = await ctx.db.get(person.groupId);
    if (!org || org.status !== "active") {
      throw new Error("Organization invalid or inactive");
    }

    // 4. CHECK QUOTAS
    if (org.properties.usage.things >= org.properties.limits.things) {
      throw new Error("Entity limit reached for this plan");
    }

    // 5. CREATE ENTITY (Dimension 3: Things)
    const entityId = await ctx.db.insert("entities", {
      groupId: person.groupId,
      type: args.type, // e.g., "course", "product"
      name: args.name,
      properties: args.properties,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. CREATE OWNERSHIP CONNECTION (Dimension 4: Connections)
    await ctx.db.insert("connections", {
      groupId: person.groupId,
      fromEntityId: person._id,
      toEntityId: entityId,
      relationshipType: "owns",
      metadata: { createdVia: "api" },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 7. LOG EVENT (Dimension 5: Events)
    await ctx.db.insert("events", {
      groupId: person.groupId,
      type: `thing_created`,
      actorId: person._id,
      targetId: entityId,
      timestamp: Date.now(),
      metadata: {
        thingType: args.type,
        source: "api",
      },
    });

    // 8. UPDATE ORGANIZATION USAGE
    await ctx.db.patch(org._id, {
      properties: {
        ...org.properties,
        usage: {
          ...org.properties.usage,
          things: (org.properties.usage?.things || 0) + 1,
        },
      },
      updatedAt: Date.now(),
    });

    return entityId;
  },
});
```

### 3. Validation Patterns

```typescript
// Type validation
export function validateEntityType(type: string): string {
  const validTypes = THING_TYPES; // From ontology
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid type. Must be one of: ${validTypes.join(", ")}`);
  }
  return type;
}

// Permission validation
export function validatePermission(person, org, requiredRole) {
  const role = person.properties.role;
  const allowedRoles = ROLE_HIERARCHY[requiredRole] || [];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Permission denied. Required role: ${requiredRole}`);
  }
}

// Organization scoping
function validateOrgContext(person, org) {
  if (!person.groupId || person.groupId !== org._id) {
    throw new Error("Organization mismatch");
  }
  if (org.status === "suspended") {
    throw new Error("Organization suspended");
  }
}
```

### 4. Event Logging Pattern

Every state change must log an event:

```typescript
// ALWAYS log after mutations
await ctx.db.insert("events", {
  groupId: person.groupId,
  type: "thing_created",  // Use specific event types
  actorId: person._id,    // Who did it
  targetId: entityId,     // What was affected
  timestamp: Date.now(),
  metadata: {
    // Include context for audit trail
    entityType: args.type,
    properties: args.properties,
    source: "api",
    userAgent: ctx.request?.headers.get("user-agent"),
  },
});
```

### 5. Error Handling

```typescript
try {
  // Mutation logic
  const entityId = await ctx.db.insert("entities", { /* ... */ });
  return entityId;
} catch (error) {
  // Log errors for debugging
  console.error("Mutation failed:", {
    handler: "create",
    actor: person._id,
    organization: org._id,
    error: error.message,
  });

  // Return meaningful error
  if (error.message.includes("Limit reached")) {
    throw new Error("You've reached your plan limit. Upgrade to create more.");
  }

  throw error;
}
```

## Critical Rules

1. **ALWAYS authenticate** - Every mutation starts with `ctx.auth.getUserIdentity()`
2. **ALWAYS validate organization** - Check organization status and existence
3. **ALWAYS check quotas** - Enforce plan limits before operations
4. **ALWAYS log events** - Every state change creates an event
5. **ALWAYS scope by groupId** - Multi-tenant isolation is mandatory
6. **ALWAYS use indexes** - Query with `withIndex()` for performance

## Example: Creating a Course

```typescript
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    modules: v.optional(v.array(v.object({
      title: v.string(),
      duration: v.number(),
    }))),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // 2. Get creator (person)
    const creator = await ctx.db.query("things")
      .withIndex("by_type_and_email", q =>
        q.eq("type", "user")
         .eq("properties.email", identity.email)
      )
      .first();
    if (!creator) throw new Error("Creator not found");

    // 3. Validate organization
    const org = await ctx.db.get(creator.groupId);
    if (!org || org.status !== "active") {
      throw new Error("Organization invalid");
    }

    // 4. Check quota
    if (org.properties.usage.courses >= org.properties.limits.courses) {
      throw new Error("Course limit reached");
    }

    // 5. Create course entity
    const courseId = await ctx.db.insert("entities", {
      groupId: creator.groupId,
      type: "course",
      name: args.name,
      properties: {
        description: args.description,
        modules: args.modules || [],
        authorId: creator._id,
        createdByAPI: true,
      },
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 6. Create ownership connection
    await ctx.db.insert("connections", {
      groupId: creator.groupId,
      fromEntityId: creator._id,
      toEntityId: courseId,
      relationshipType: "owns",
      metadata: { role: "author" },
      validFrom: Date.now(),
      createdAt: Date.now(),
    });

    // 7. Log event
    await ctx.db.insert("events", {
      groupId: creator.groupId,
      type: "course_created",
      actorId: creator._id,
      targetId: courseId,
      timestamp: Date.now(),
      metadata: {
        courseName: args.name,
        moduleCount: args.modules?.length || 0,
      },
    });

    // 8. Update usage
    await ctx.db.patch(org._id, {
      properties: {
        ...org.properties,
        usage: {
          ...org.properties.usage,
          courses: (org.properties.usage?.courses || 0) + 1,
        },
      },
      updatedAt: Date.now(),
    });

    return courseId;
  },
});
```

## Related Skills

- `agent-backend:create-query` - Complementary skill for reading data
- `agent-backend:design-schema` - Schema design for entities
- `agent-backend:validate-types` - TypeScript type generation

## Related Documentation

- [6-Dimension Ontology](../../../one/knowledge/ontology.md)
- [Backend Agent](../agents/agent-backend.md)
- [Convex Mutation Patterns](https://docs.convex.dev/functions/mutations)

## Version History

- **1.0.0** (2025-10-27): Initial implementation with 6-dimension mapping
