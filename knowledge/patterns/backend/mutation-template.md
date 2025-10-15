# Pattern: Convex Mutation Template

**Category:** Backend
**Context:** When creating Convex mutations that modify data (create, update, delete)
**Problem:** Need consistent mutation structure that uses services, handles auth, and logs events

## Solution

Keep mutations thin - just validate auth, call service, handle errors. All business logic lives in services.

## Template

```typescript
// backend/convex/mutations/{entities}.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { {EntityName}Service, {EntityName}ServiceLive } from "./services/{EntityName}Service";
import { Effect } from "effect";

export const create = mutation({
  args: {
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 2. Get organization ID (multi-tenant)
    const organizationId = identity.orgId;
    if (!organizationId) {
      throw new Error("No organization");
    }

    // 3. Call service
    const program = {EntityName}Service.create({
      name: args.name,
      properties: args.properties,
      organizationId: organizationId,
    });

    // 4. Run Effect program
    const result = await Effect.runPromise(
      program.pipe(
        Effect.provideService({EntityName}Service, {EntityName}ServiceLive),
        Effect.catchAll((error) => {
          // Map service errors to user-friendly messages
          switch (error._tag) {
            case "{EntityName}ValidationError":
              return Effect.fail(new Error(error.message));
            case "{EntityName}AlreadyExists":
              return Effect.fail(new Error(`{EntityName} "${error.name}" already exists`));
            case "DatabaseError":
              return Effect.fail(new Error("Database error: " + error.message));
            default:
              return Effect.fail(new Error("Unknown error"));
          }
        })
      )
    );

    return result;
  },
});

export const update = mutation({
  args: {
    id: v.id("{entities}"),
    name: v.optional(v.string()),
    properties: v.optional(v.any()),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("archived"))),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 2. Check ownership (entity belongs to user's org)
    const entity = await ctx.db.get(args.id);
    if (!entity || entity.organizationId !== identity.orgId) {
      throw new Error("Not found or unauthorized");
    }

    // 3. Call service
    const { id, ...updates } = args;
    const program = {EntityName}Service.update(id, updates);

    // 4. Run Effect program
    await Effect.runPromise(
      program.pipe(
        Effect.provideService({EntityName}Service, {EntityName}ServiceLive),
        Effect.catchAll((error) => {
          switch (error._tag) {
            case "{EntityName}NotFound":
              return Effect.fail(new Error("{EntityName} not found"));
            case "DatabaseError":
              return Effect.fail(new Error("Database error: " + error.message));
            default:
              return Effect.fail(new Error("Unknown error"));
          }
        })
      )
    );

    return { success: true };
  },
});

export const remove = mutation({
  args: {
    id: v.id("{entities}"),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 2. Check ownership
    const entity = await ctx.db.get(args.id);
    if (!entity || entity.organizationId !== identity.orgId) {
      throw new Error("Not found or unauthorized");
    }

    // 3. Call service (soft delete)
    const program = {EntityName}Service.delete(args.id);

    // 4. Run Effect program
    await Effect.runPromise(
      program.pipe(
        Effect.provideService({EntityName}Service, {EntityName}ServiceLive),
        Effect.catchAll((error) => {
          return Effect.fail(new Error("Failed to delete: " + error._tag));
        })
      )
    );

    return { success: true };
  },
});
```

## Variables

- `{EntityName}` - PascalCase entity name (e.g., `Course`, `Lesson`)
- `{entities}` - Table name (always "entities" in our ontology)

## Usage

1. Copy template to `backend/convex/mutations/{entities}.ts`
2. Replace all `{EntityName}` with your entity name
3. Import corresponding service
4. Add additional mutations as needed
5. Export from `backend/convex/_generated/api.ts`

## Example (Course Mutations)

```typescript
// backend/convex/mutations/entities.ts
import { CourseService, CourseServiceLive } from "./services/CourseService";

export const createCourse = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const program = CourseService.create({
      name: args.name,
      properties: {
        description: args.description,
        price: args.price,
      },
      organizationId: identity.orgId,
    });

    return await Effect.runPromise(
      program.pipe(
        Effect.provideService(CourseService, CourseServiceLive),
      )
    );
  },
});

export const publishCourse = mutation({
  args: {
    id: v.id("entities"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const program = CourseService.publish(args.id);

    return await Effect.runPromise(
      program.pipe(
        Effect.provideService(CourseService, CourseServiceLive),
      )
    );
  },
});
```

## Common Mistakes

- **Mistake:** Business logic in mutation handler
  - **Fix:** Move logic to service, keep mutation thin
- **Mistake:** Not checking authentication
  - **Fix:** Always verify `ctx.auth.getUserIdentity()` first
- **Mistake:** Not checking organization ownership
  - **Fix:** Verify entity belongs to user's org (multi-tenancy)
- **Mistake:** Throwing raw service errors
  - **Fix:** Map service errors to user-friendly messages
- **Mistake:** Not using Effect.catchAll
  - **Fix:** Always handle errors explicitly

## Related Patterns

- **service-template.md** - Service implementation that mutations call
- **query-template.md** - Read-only operations
- **event-logging.md** - How to log events from mutations
