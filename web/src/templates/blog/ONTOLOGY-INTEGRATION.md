# Blog Template - Ontology Integration

This document explains how the blog template integrates with the ONE Platform's multi-ontology architecture.

## Ontology Composition

This template uses the **blog ontology** with the following types:

### Things (7)

- `page`
- `user`
- `file`
- `link`
- `note`
- `blog_post`
- `blog_category`

### Connections (5)

- `created_by` - * → user
- `updated_by` - * → user
- `viewed_by` - * → user
- `favorited_by` - * → user
- `posted_in` - blog_post → blog_category

### Events (6)

- `thing_created`
- `thing_updated`
- `thing_deleted`
- `thing_viewed`
- `blog_post_published`
- `blog_post_viewed`

## Usage Examples

### Convert to Ontology

```typescript
import { pageToThing } from './lib/ontology-adapter';

const thingInput = pageToThing(entity, groupId);
await convex.mutation(api.mutations.entities.create, thingInput);
```

### Convert from Ontology

```typescript
import { thingToPage } from './lib/ontology-adapter';

const thing = await convex.query(api.queries.entities.get, { id });
const entity = thingToPage(thing);
```

### Log Events

```typescript
import { createThingCreatedEvent } from './lib/ontology-adapter';

const eventInput = createThingCreatedEvent(
  targetId,
  actorId,
  groupId,
  metadata
);

await convex.mutation(api.mutations.events.create, eventInput);
```

## Benefits

- ✅ **Type Safety** - Full TypeScript from template to database
- ✅ **Multi-Tenant** - Automatic isolation via groupId
- ✅ **Event Tracking** - Complete audit trail
- ✅ **Backend-Agnostic** - Works with any backend

---

**Generated from ontology-blog.yaml**
