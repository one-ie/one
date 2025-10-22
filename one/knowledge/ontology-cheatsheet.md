# Multi-Ontology Architecture Cheat Sheet

**Quick Reference Guide** | **Version:** 1.0.0

---

## Quick Commands

```bash
# Generate types from core only
bun run backend/scripts/generate-ontology-types.ts

# Generate types with specific features
PUBLIC_FEATURES="blog,shop" bun run backend/scripts/generate-ontology-types.ts

# Generate types with all features
PUBLIC_FEATURES="blog,shop,courses,newsletter" bun run backend/scripts/generate-ontology-types.ts

# Validate ontology YAML
bun run backend/scripts/validate-ontology.ts ontology-myfeature.yaml

# Run tests for a feature
cd backend
bun test tests/myfeature.test.ts
```

---

## YAML Template

### Minimal Feature Ontology

```yaml
feature: myfeature
extends: core
version: "1.0.0"
description: "Brief description of what this feature does"

thingTypes:
  - name: my_thing
    description: "What this thing represents"
    properties:
      field1: string
      field2: number
      field3: boolean

connectionTypes:
  - name: my_connection
    description: "How things relate"
    fromType: source_type
    toType: target_type
    metadata:
      extraField: string

eventTypes:
  - name: my_event
    description: "What action happened"
    thingType: my_thing
```

### Full Feature Ontology Template

```yaml
# Feature Name Ontology
# Detailed description of feature purpose and capabilities

feature: myfeature
extends: core
version: "1.0.0"
description: "What this feature provides"
author: "Your Name"
dependencies:
  - otherfeat

# ============================================================================
# Thing Types - Entities that exist
# ============================================================================

thingTypes:
  - name: my_entity
    description: "Primary entity description"
    properties:
      # Core fields
      name: string
      description: string
      slug: string

      # Status and metadata
      status: string              # active, inactive, draft
      createdBy: string          # User ID

      # Feature-specific fields
      customField1: string
      customField2: number
      customField3: boolean
      customList: string[]
      customObject: object

    example:
      type: my_entity
      name: "Example Entity"
      properties:
        name: "Example Entity"
        status: "active"
        customField1: "value"

  - name: my_child_entity
    description: "Related entity"
    properties:
      parentId: string
      childField: string

# ============================================================================
# Connection Types - Relationships
# ============================================================================

connectionTypes:
  - name: owns_entity
    description: "Creator owns entity"
    fromType: creator           # From core
    toType: my_entity
    metadata:
      role: string
      permissions: string[]

  - name: parent_child
    description: "Parent-child relationship"
    fromType: my_entity
    toType: my_child_entity
    metadata:
      order: number

  - name: related_to
    description: "Generic relationship"
    fromType: my_entity
    toType: my_entity           # Self-referential
    metadata:
      relationshipType: string

# ============================================================================
# Event Types - Actions that occur
# ============================================================================

eventTypes:
  # Lifecycle events
  - name: entity_created
    description: "Entity was created"
    thingType: my_entity

  - name: entity_updated
    description: "Entity was modified"
    thingType: my_entity

  - name: entity_deleted
    description: "Entity was deleted"
    thingType: my_entity

  # Action events
  - name: entity_activated
    description: "Entity became active"
    thingType: my_entity

  - name: entity_viewed
    description: "Someone viewed entity"
    thingType: my_entity

  # Interaction events
  - name: entity_shared
    description: "Entity was shared"
    thingType: my_entity
```

---

## Common Code Patterns

### 1. Create Entity with Ownership

```typescript
import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import type { ThingType, ConnectionType, EventType } from '../types/ontology';

export const create = mutation({
  args: {
    groupId: v.id('groups'),
    name: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Unauthorized');

    // 1. Create entity
    const entityId = await ctx.db.insert('entities', {
      groupId: args.groupId,
      type: 'my_entity' as ThingType,
      name: args.name,
      properties: {
        ...args.properties,
        createdBy: userId.tokenIdentifier,
      },
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Create ownership connection
    await ctx.db.insert('connections', {
      groupId: args.groupId,
      fromEntityId: userId.tokenIdentifier,
      toEntityId: entityId,
      relationshipType: 'owns' as ConnectionType,
      metadata: {
        role: 'owner',
        permissions: ['read', 'write', 'delete'],
      },
      createdAt: Date.now(),
    });

    // 3. Log creation event
    await ctx.db.insert('events', {
      groupId: args.groupId,
      type: 'entity_created' as EventType,
      actorId: userId.tokenIdentifier,
      targetId: entityId,
      timestamp: Date.now(),
      metadata: {},
    });

    return entityId;
  },
});
```

### 2. Query Entities with Connections

```typescript
import { query } from '../_generated/server';
import { v } from 'convex/values';

export const listWithOwners = query({
  args: {
    groupId: v.id('groups'),
  },
  handler: async (ctx, args) => {
    // Get entities
    const entities = await ctx.db
      .query('entities')
      .withIndex('group_type', (q) =>
        q.eq('groupId', args.groupId).eq('type', 'my_entity')
      )
      .collect();

    // Get owners for each entity
    const entitiesWithOwners = await Promise.all(
      entities.map(async (entity) => {
        const ownership = await ctx.db
          .query('connections')
          .withIndex('to_type', (q) =>
            q.eq('toEntityId', entity._id).eq('relationshipType', 'owns')
          )
          .first();

        const owner = ownership
          ? await ctx.db.get(ownership.fromEntityId)
          : null;

        return {
          ...entity,
          owner,
          ownerRole: ownership?.metadata?.role,
        };
      })
    );

    return entitiesWithOwners;
  },
});
```

### 3. Type Validation

```typescript
import { isThingType, isConnectionType, isEventType } from '../types/ontology';

// Validate thing type
export const validateEntity = mutation({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isThingType(args.type)) {
      throw new Error(`Invalid entity type: ${args.type}`);
    }

    // Now TypeScript knows args.type is valid
    const entity = await ctx.db.insert('entities', {
      type: args.type as ThingType,
      // ...
    });
  },
});
```

### 4. Feature Detection

```typescript
import { ONTOLOGY_METADATA } from '../types/ontology';

export const getFeatures = query({
  handler: async () => {
    return {
      enabled: ONTOLOGY_METADATA.features,
      hasBlog: ONTOLOGY_METADATA.features.includes('blog'),
      hasShop: ONTOLOGY_METADATA.features.includes('shop'),
      counts: {
        things: ONTOLOGY_METADATA.thingTypeCount,
        connections: ONTOLOGY_METADATA.connectionTypeCount,
        events: ONTOLOGY_METADATA.eventTypeCount,
      },
    };
  },
});

// Conditional logic
export const createContent = mutation({
  handler: async (ctx, args) => {
    const features = ONTOLOGY_METADATA.features;

    if (args.type === 'blog_post' && !features.includes('blog')) {
      throw new Error('Blog feature not enabled');
    }

    // Create entity...
  },
});
```

### 5. Batch Operations

```typescript
export const batchCreate = mutation({
  args: {
    groupId: v.id('groups'),
    entities: v.array(
      v.object({
        type: v.string(),
        name: v.string(),
        properties: v.any(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];

    for (const entity of args.entities) {
      if (!isThingType(entity.type)) {
        results.push({
          name: entity.name,
          success: false,
          error: 'Invalid type',
        });
        continue;
      }

      try {
        const id = await ctx.db.insert('entities', {
          groupId: args.groupId,
          type: entity.type as ThingType,
          name: entity.name,
          properties: entity.properties,
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });

        results.push({
          name: entity.name,
          success: true,
          id,
        });
      } catch (error) {
        results.push({
          name: entity.name,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    return results;
  },
});
```

### 6. Analytics from Events

```typescript
export const getAnalytics = query({
  args: {
    entityId: v.id('entities'),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const since = Date.now() - (args.days || 30) * 24 * 60 * 60 * 1000;

    const events = await ctx.db
      .query('events')
      .withIndex('target_time', (q) =>
        q.eq('targetId', args.entityId).gte('timestamp', since)
      )
      .collect();

    // Group by event type
    const byType = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      period: `${args.days || 30} days`,
      totalEvents: events.length,
      byType,
      timeline: events.map((e) => ({
        type: e.type,
        timestamp: e.timestamp,
        actor: e.actorId,
      })),
    };
  },
});
```

---

## Type Reference

### Generated Types

```typescript
// Auto-generated from ontologies
import type {
  ThingType,           // Union of all thing types
  ConnectionType,      // Union of all connection types
  EventType,          // Union of all event types
} from './types/ontology';

// Type arrays
import {
  THING_TYPES,         // string[] of all thing types
  CONNECTION_TYPES,    // string[] of all connection types
  EVENT_TYPES,        // string[] of all event types
} from './types/ontology';

// Type guards
import {
  isThingType,        // (value: string) => boolean
  isConnectionType,   // (value: string) => boolean
  isEventType,       // (value: string) => boolean
} from './types/ontology';

// Metadata
import {
  ONTOLOGY_METADATA   // { features, generatedAt, counts }
} from './types/ontology';
```

### Database Schema Types

```typescript
// Convex auto-generated types
import type { Doc, Id } from './_generated/dataModel';

// Entity document
type Entity = Doc<'entities'>;
type EntityId = Id<'entities'>;

// Connection document
type Connection = Doc<'connections'>;

// Event document
type Event = Doc<'events'>;

// Group document
type Group = Doc<'groups'>;
```

---

## Troubleshooting

### Issue: Types not generating

**Solution:**
```bash
# Check YAML syntax
bun run backend/scripts/validate-ontology.ts

# Regenerate types
PUBLIC_FEATURES="myfeature" bun run backend/scripts/generate-ontology-types.ts

# Check output file
cat backend/convex/types/ontology.ts
```

### Issue: Invalid type errors

**Solution:**
```typescript
// Always use type guards
if (!isThingType(args.type)) {
  throw new Error(`Invalid type: ${args.type}`);
}

// Or validate against array
if (!THING_TYPES.includes(args.type)) {
  throw new Error(`Invalid type: ${args.type}`);
}
```

### Issue: Circular dependencies

**Solution:**
```yaml
# Feature A
feature: featureA
extends: core

# Feature B
feature: featureB
extends: core

# Integration feature (extends both)
feature: featureAB
extends: featureA,featureB
```

### Issue: Missing core types

**Solution:**
```yaml
# Always extend core
extends: core

# Reference core types in connections
connectionTypes:
  - name: my_connection
    fromType: creator     # From core
    toType: my_thing      # From this feature
```

### Issue: Performance with many types

**Solution:**
```typescript
// Cache type sets for O(1) lookup
const THING_TYPE_SET = new Set(THING_TYPES);

export function isValidType(type: string): boolean {
  return THING_TYPE_SET.has(type);
}
```

---

## Best Practices

1. **Always extend core** - Every feature should `extends: core`
2. **Use descriptive names** - `blog_post` not `post`
3. **Add examples** - Include example objects in YAML
4. **Validate inputs** - Use type guards for runtime validation
5. **Log events** - Track all significant actions
6. **Test thoroughly** - Write tests for mutations and queries
7. **Version properly** - Use semantic versioning (1.0.0)
8. **Document metadata** - Explain what goes in metadata fields
9. **Keep features focused** - One feature, one purpose
10. **Compose features** - Create integration features for cross-feature logic

---

## Quick Links

- [Complete Tutorial](/one/knowledge/ontology-tutorial.md)
- [Ontology Specification](/one/knowledge/ontology.md)
- [Engineering Guide](/one/knowledge/ontology-engineering.md)
- [Example Code](/backend/examples/ontology-types-usage.ts)

---

**Last Updated:** 2025-01-20
