# Pattern: Effect.ts Service Template

**Category:** Backend
**Context:** When creating business logic services with Effect.ts for type-safe, composable operations
**Problem:** Need consistent service structure that handles errors, dependencies, and effects properly

## Solution

Use Effect.ts services for all business logic. Keep Convex functions thin (just call services). Services are pure, testable, and composable.

## Template

```typescript
// convex/services/{EntityName}Service.ts
import { Effect, Context } from "effect";
import { Doc, Id } from "../_generated/dataModel";

// Service interface
export class {EntityName}Service extends Context.Tag("{EntityName}Service")<
  {EntityName}Service,
  {
    create: (data: Create{EntityName}Input) => Effect.Effect<Id<"{entities}">, {EntityName}Error>;
    getById: (id: Id<"{entities}">) => Effect.Effect<Doc<"{entities}">, {EntityName}Error>;
    update: (id: Id<"{entities}">, data: Update{EntityName}Input) => Effect.Effect<void, {EntityName}Error>;
    delete: (id: Id<"{entities}">) => Effect.Effect<void, {EntityName}Error>;
  }
>() {}

// Error types (tagged union)
export type {EntityName}Error =
  | { _tag: "{EntityName}NotFound"; id: string }
  | { _tag: "{EntityName}AlreadyExists"; name: string }
  | { _tag: "{EntityName}ValidationError"; message: string }
  | { _tag: "DatabaseError"; message: string };

// Input types
export interface Create{EntityName}Input {
  name: string;
  properties: Record<string, any>;
  organizationId: Id<"organizations">;
}

export interface Update{EntityName}Input {
  name?: string;
  properties?: Record<string, any>;
  status?: "draft" | "active" | "archived";
}

// Implementation
export const {EntityName}ServiceLive = {EntityName}Service.of({
  create: (data) =>
    Effect.gen(function* (_) {
      // Validate input
      if (!data.name) {
        return yield* _(Effect.fail<{EntityName}Error>({
          _tag: "{EntityName}ValidationError",
          message: "Name is required"
        }));
      }

      // Create entity
      const entityId = yield* _(
        Effect.tryPromise({
          try: () => db.insert("{entities}", {
            type: "{entityType}",
            name: data.name,
            properties: data.properties,
            organizationId: data.organizationId,
            status: "draft",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: String(error)
          })
        })
      );

      // Log event (optional)
      yield* _(logEvent({
        type: "{entity}_created",
        actorId: "current-user-id",
        targetId: entityId,
        timestamp: Date.now(),
      }));

      return entityId;
    }),

  getById: (id) =>
    Effect.gen(function* (_) {
      const entity = yield* _(
        Effect.tryPromise({
          try: () => db.get(id),
          catch: () => ({
            _tag: "{EntityName}NotFound" as const,
            id: id
          })
        })
      );

      if (!entity) {
        return yield* _(Effect.fail<{EntityName}Error>({
          _tag: "{EntityName}NotFound",
          id: id
        }));
      }

      return entity;
    }),

  update: (id, data) =>
    Effect.gen(function* (_) {
      // Get existing entity
      const existing = yield* _({EntityName}Service.getById(id));

      // Update
      yield* _(
        Effect.tryPromise({
          try: () => db.patch(id, {
            ...data,
            updatedAt: Date.now(),
          }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: String(error)
          })
        })
      );

      // Log event (optional)
      yield* _(logEvent({
        type: "{entity}_updated",
        actorId: "current-user-id",
        targetId: id,
        timestamp: Date.now(),
      }));
    }),

  delete: (id) =>
    Effect.gen(function* (_) {
      // Verify exists
      yield* _({EntityName}Service.getById(id));

      // Soft delete (set status)
      yield* _(
        Effect.tryPromise({
          try: () => db.patch(id, {
            status: "archived",
            updatedAt: Date.now(),
          }),
          catch: (error) => ({
            _tag: "DatabaseError" as const,
            message: String(error)
          })
        })
      );

      // Log event (optional)
      yield* _(logEvent({
        type: "{entity}_deleted",
        actorId: "current-user-id",
        targetId: id,
        timestamp: Date.now(),
      }));
    }),
});
```

## Variables

- `{EntityName}` - PascalCase entity name (e.g., `Course`, `Lesson`, `Enrollment`)
- `{entities}` - Table name (always "entities" in our ontology)
- `{entityType}` - Entity type value (e.g., "course", "lesson", "enrollment")
- `{entity}` - Lowercase entity name for events (e.g., "course", "lesson")

## Usage

1. Copy template to `convex/services/{EntityName}Service.ts`
2. Replace all `{EntityName}` with your entity name
3. Add entity-specific validation logic
4. Add custom methods as needed
5. Use in Convex mutations/queries (thin wrappers)

## Example (Course Service)

```typescript
// convex/services/CourseService.ts
export class CourseService extends Context.Tag("CourseService")<
  CourseService,
  {
    create: (data: CreateCourseInput) => Effect.Effect<Id<"entities">, CourseError>;
    getById: (id: Id<"entities">) => Effect.Effect<Doc<"entities">, CourseError>;
    publish: (id: Id<"entities">) => Effect.Effect<void, CourseError>;
  }
>() {}

// Used in Convex mutation
export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const program = CourseService.create({
      name: args.name,
      properties: { description: args.description },
      organizationId: ctx.auth.orgId,
    });

    return await Effect.runPromise(
      program.pipe(
        Effect.provideService(CourseService, CourseServiceLive),
        Effect.provideService(DatabaseService, DatabaseServiceLive(ctx.db))
      )
    );
  },
});
```

## Common Mistakes

- **Mistake:** Putting business logic in Convex functions
  - **Fix:** Keep Convex functions thin, move logic to services
- **Mistake:** Using `any` types in service methods
  - **Fix:** Define explicit input/output types
- **Mistake:** Not handling errors with tagged unions
  - **Fix:** Use `{ _tag: "ErrorType" }` pattern
- **Mistake:** Direct database calls without Effect
  - **Fix:** Wrap db calls in `Effect.tryPromise`

## Related Patterns

- **mutation-template.md** - How to call services from Convex mutations
- **query-template.md** - How to call services from Convex queries
- **event-logging.md** - How to log events from services
