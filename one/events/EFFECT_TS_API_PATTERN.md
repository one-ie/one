# Effect.ts DataProvider Pattern Guide

## Quick Reference

The DataProvider interface returns **Effect.ts wrapped values**. Always extract them with `Effect.runPromise()` before using.

## Pattern Checklist

- [ ] Import Effect at top: `const { Effect } = await import('effect');`
- [ ] Wrap all DataProvider calls: `await Effect.runPromise(provider.*.*())`
- [ ] Use correct property names from DataProvider interface
- [ ] Handle create() methods (return ID string)
- [ ] Handle list() methods (return arrays)
- [ ] Handle get() methods (return single entity or throw error)
- [ ] Handle update() methods (return void)

---

## Common Patterns

### Pattern 1: List with Pagination

```typescript
// WRONG - connections is an Effect, not an array
let connections = await provider.connections.list(filter);
const paginated = connections.slice(offset, offset + limit);  // ERROR!

// CORRECT - extract with Effect.runPromise()
const { Effect } = await import('effect');
let connections = await Effect.runPromise(provider.connections.list(filter));
const paginated = connections.slice(offset, offset + limit);  // Works!
```

### Pattern 2: Get Single Entity

```typescript
// WRONG
const thing = await provider.things.get(id);
if (!thing) { /* ... */ }  // thing is Effect, not Thing

// CORRECT
const { Effect } = await import('effect');
const thing = await Effect.runPromise(provider.things.get(id));
if (!thing) { /* ... */ }  // thing is now Thing or throws error
```

### Pattern 3: Create Entity

```typescript
// WRONG
const thing = await provider.things.create(input);
return JSON.stringify(successResponse(thing));  // thing is string (ID), not object!

// CORRECT
const { Effect } = await import('effect');
const thingId = await Effect.runPromise(provider.things.create(input));
return JSON.stringify(successResponse({ _id: thingId }));  // Correct object
```

### Pattern 4: Update Entity

```typescript
// WRONG
const updated = await provider.things.update(id, input);
return JSON.stringify(successResponse(updated));  // updated is void!

// CORRECT
const { Effect } = await import('effect');
await Effect.runPromise(provider.things.update(id, input));
return JSON.stringify(successResponse({ _id: id, ...input }));  // Return reconstructed object
```

### Pattern 5: Filter and Sort

```typescript
// WRONG
let events = await provider.events.list(filter);
events.sort((a, b) => a.timestamp - b.timestamp);  // ERROR: sort on Effect
const paginated = events.slice(offset, offset + limit);  // ERROR: slice on Effect

// CORRECT
const { Effect } = await import('effect');
let events = await Effect.runPromise(provider.events.list(filter));
events.sort((a, b) => a.timestamp - b.timestamp);  // Works: array method
const paginated = events.slice(offset, offset + limit);  // Works: array method
```

---

## DataProvider Interface Mapping

### things

```typescript
// List things with filters
const things = await Effect.runPromise(
  provider.things.list({
    type?: string;
    status?: ThingStatus;
    groupId?: string;
    limit?: number;
    offset?: number;
  })
);  // Returns: Thing[]

// Get single thing
const thing = await Effect.runPromise(
  provider.things.get(id)
);  // Returns: Thing | throws ThingNotFoundError

// Create thing
const thingId = await Effect.runPromise(
  provider.things.create({
    type: string;
    name: string;
    groupId: string;
    properties?: Record<string, any>;
    status?: ThingStatus;
  })
);  // Returns: string (the _id)

// Update thing
await Effect.runPromise(
  provider.things.update(id, {
    name?: string;
    properties?: Record<string, any>;
    status?: ThingStatus;
  })
);  // Returns: void
```

### connections

```typescript
// List connections
const connections = await Effect.runPromise(
  provider.connections.list({
    fromEntityId?: string;      // NOT fromThingId
    toEntityId?: string;        // NOT toThingId
    relationshipType?: ConnectionType;
    limit?: number;
    offset?: number;
  })
);  // Returns: Connection[]

// Create connection
const connectionId = await Effect.runPromise(
  provider.connections.create({
    fromEntityId: string;       // NOT fromThingId
    toEntityId: string;         // NOT toThingId
    relationshipType: ConnectionType;
    groupId: string;
    metadata?: Record<string, any>;
  })
);  // Returns: string (the _id)
```

### events

```typescript
// List events
const events = await Effect.runPromise(
  provider.events.list({
    type?: string;
    actorId?: string;
    targetId?: string;
    since?: number;             // NOT startTime
    until?: number;             // NOT endTime
    limit?: number;
    offset?: number;
  })
);  // Returns: Event[]

// Create event
const eventId = await Effect.runPromise(
  provider.events.create({      // NOT .record()
    type: string;
    actorId: string;
    targetId?: string;
    groupId: string;
    metadata?: Record<string, any>;
  })
);  // Returns: string (the _id)
```

### knowledge

```typescript
// List knowledge
const knowledge = await Effect.runPromise(
  provider.knowledge.list({
    query?: string;
    knowledgeType?: KnowledgeType;
    limit?: number;
  })
);  // Returns: Knowledge[]

// Search with embedding
const results = await Effect.runPromise(
  provider.knowledge.search(
    embedding,  // number[] (from OpenAI, etc.)
    {
      sourceThingId?: string;
      knowledgeType?: KnowledgeType;
      limit?: number;
    }
  )
);  // Returns: Knowledge[]
```

### auth

```typescript
// Get current user
const user = await Effect.runPromise(
  provider.auth.getCurrentUser()
);  // Returns: User | null

// Login
const result = await Effect.runPromise(
  provider.auth.login({
    email: string;
    password: string;
  })
);  // Returns: AuthResult

// Signup
const result = await Effect.runPromise(
  provider.auth.signup({
    email: string;
    password: string;
    name?: string;
  })
);  // Returns: AuthResult

// Magic link
const result = await Effect.runPromise(
  provider.auth.magicLinkAuth({
    token: string;
  })
);  // Returns: AuthResult
```

---

## Common Mistakes to Avoid

### Mistake 1: Forgetting Effect.runPromise()

```typescript
// WRONG
const connections = await provider.connections.list(filter);
connections.slice(0, 10);  // Error: Effect has no slice method
```

**Fix**: Use Effect.runPromise()

```typescript
const connections = await Effect.runPromise(provider.connections.list(filter));
connections.slice(0, 10);  // Works!
```

---

### Mistake 2: Wrong Property Names

```typescript
// WRONG - DataProvider uses entityId, not thingId
const connections = await provider.connections.list({
  fromThingId: id,  // Error: property doesn't exist
  toThingId: id,    // Error: property doesn't exist
});

// CORRECT
const connections = await Effect.runPromise(
  provider.connections.list({
    fromEntityId: id,
    toEntityId: id,
  })
);
```

---

### Mistake 3: Using .record() Instead of .create()

```typescript
// WRONG - events don't have .record()
const eventId = await Effect.runPromise(
  provider.events.record({ ... })  // Error: method doesn't exist
);

// CORRECT
const eventId = await Effect.runPromise(
  provider.events.create({ ... })
);
```

---

### Mistake 4: Using provider.people Instead of provider.things or provider.auth

```typescript
// WRONG - DataProvider doesn't have .people property
const person = await provider.people.get(id);
const user = await provider.people.current();

// CORRECT - People are Things with type: 'creator'
const person = await Effect.runPromise(provider.things.get(id));

// CORRECT - Current user is from auth
const user = await Effect.runPromise(provider.auth.getCurrentUser());
```

---

### Mistake 5: Returning Wrong Type from create()

```typescript
// WRONG - create() returns string (ID), not the entity
const thing = await Effect.runPromise(provider.things.create(input));
return JSON.stringify(successResponse(thing));  // thing is "123", not an object

// CORRECT
const thingId = await Effect.runPromise(provider.things.create(input));
return JSON.stringify(successResponse({ _id: thingId }));
```

---

### Mistake 6: Trying to Use Array Methods on Effect

```typescript
// WRONG
let things = await provider.things.list();
things.sort((a, b) => a.name.localeCompare(b.name));  // Error: Effect has no sort
things.filter(t => t.type === 'course');  // Error: Effect has no filter

// CORRECT
let things = await Effect.runPromise(provider.things.list());
things.sort((a, b) => a.name.localeCompare(b.name));  // Works
things.filter(t => t.type === 'course');  // Works
```

---

## Debugging Tips

### If you see: "Property does not exist on Effect"

You forgot `Effect.runPromise()`

```typescript
// Add this:
const { Effect } = await import('effect');
const result = await Effect.runPromise(provider.things.list());
```

### If you see: "Method not found on DataProvider"

Check the exact method name in the DataProvider interface:

```typescript
// provider.events.record is WRONG
provider.events.create  // CORRECT

// provider.people.get is WRONG
provider.things.get     // CORRECT for getting a person (type: 'creator')
provider.auth.getCurrentUser()  // CORRECT for current user
```

### If you see: "Type is string but expected Thing"

The create methods return IDs, not entities:

```typescript
// WRONG - thingId is string, not Thing
const thing = await Effect.runPromise(provider.things.create(input));
const type: Thing = thing;  // Error!

// CORRECT
const thingId = await Effect.runPromise(provider.things.create(input));
const id: string = thingId;  // Correct!
```

---

## Performance Considerations

### Avoid N+1 Queries

```typescript
// BAD - makes multiple Effect.runPromise calls
for (const thingId of thingIds) {
  const thing = await Effect.runPromise(provider.things.get(thingId));
  // process thing
}

// BETTER - batch if possible, or accept sequential calls
const things = await Effect.runPromise(
  provider.things.list({ type: 'course' })
);
```

### Pagination is Built-In

```typescript
// Use limit/offset in the query to avoid fetching all
const things = await Effect.runPromise(
  provider.things.list({
    type: 'course',
    limit: 50,
    offset: 0,
  })
);
```

---

## Complete Example: API Route

```typescript
import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

export const GET: APIRoute = async ({ url }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Parse query parameters
    const type = url.searchParams.get('type');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build filter (use correct property names)
    const filter: Record<string, any> = {};
    if (type) filter.type = type;

    // Extract Effect value
    let things = await Effect.runPromise(provider.things.list(filter));

    // Now use array methods
    things = things.sort((a, b) => a.name.localeCompare(b.name));
    const paginated = things.slice(offset, offset + limit);

    return new Response(
      JSON.stringify(
        successResponse({
          things: paginated,
          total: things.length,
          limit,
          offset,
        })
      ),
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify(errorResponse('INTERNAL_ERROR', message)), {
      status: 500,
    });
  }
};
```

---

## Summary

1. **Always import Effect**: `const { Effect } = await import('effect');`
2. **Always extract values**: `await Effect.runPromise(provider.*.*())`
3. **Use correct names**: fromEntityId, toEntityId, since, until, create (not record)
4. **Know return types**: create() → string, list() → array, get() → entity or error, update() → void
5. **Test with curl**: Verify endpoints work before shipping

All 7 API route files have been updated with these patterns. TypeScript check passes.
