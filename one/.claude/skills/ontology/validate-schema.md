# Validate Schema Against 6-Dimension Ontology

**Category:** ontology
**Version:** 1.0.0
**Used By:** agent-backend, agent-quality, agent-director, agent-builder

## Purpose

Validates a Convex schema definition against the ONE Platform 6-dimension ontology to ensure all tables, fields, and relationships comply with the canonical data model.

## Inputs

- **schemaPath** (string): Path to Convex schema file (e.g., `backend/convex/schema.ts`)
- **strictMode** (boolean, optional): If true, fails on warnings. Default: false

## Outputs

- **isValid** (boolean): True if schema passes validation
- **errors** (array): Critical issues that must be fixed
- **warnings** (array): Non-critical issues to consider
- **recommendations** (array): Suggested improvements
- **dimensionCoverage** (object): Which dimensions are represented

## Prerequisites

- Schema file exists at specified path
- Schema follows Convex v1.0+ format
- ONE ontology documentation available at `one/knowledge/ontology.md`

## Steps

1. **Read Schema File**
   - Use Read tool to load schema from `schemaPath`
   - Parse TypeScript schema definition
   - Extract table definitions

2. **Check Required Tables**
   - Verify `groups` table exists
   - Verify `things` table exists (or legacy `entities`)
   - Verify `connections` table exists
   - Verify `events` table exists
   - Verify `knowledge` table exists
   - Add error for each missing required table

3. **Validate groups Table**
   - Check fields: `_id`, `name`, `type`, `parentGroupId`, `properties`, `status`, `createdAt`, `updatedAt`
   - Verify `type` field has enum: friend_circle, business, community, dao, government, organization
   - Verify `parentGroupId` is optional and references `groups._id`
   - Check indexes: by_type, by_parent

4. **Validate things/entities Table**
   - Check fields: `_id`, `groupId`, `type`, `name`, `properties`, `status`, `createdAt`, `updatedAt`
   - Verify `groupId` references `groups._id`
   - Verify `type` field exists (should be one of 66+ entity types)
   - Verify `status` field has enum: draft, active, published, archived
   - Check indexes: by_group, by_type, by_group_and_type
   - Verify `properties` field is flexible (v.any() or object)

5. **Validate connections Table**
   - Check fields: `_id`, `groupId`, `sourceId`, `targetId`, `type`, `metadata`, `validFrom`, `validTo`, `createdAt`, `updatedAt`
   - Verify `groupId` references `groups._id`
   - Verify `sourceId` and `targetId` reference things/entities
   - Verify `type` field exists (should be one of 25+ connection types)
   - Check indexes: by_group, by_source, by_target, by_type
   - Verify bidirectional capability

6. **Validate events Table**
   - Check fields: `_id`, `groupId`, `type`, `actorId`, `targetId`, `timestamp`, `metadata`, `createdAt`
   - Verify `groupId` references `groups._id`
   - Verify `actorId` references person (thing with type=creator)
   - Verify `type` field exists (should be one of 67+ event types)
   - Check indexes: by_group, by_type, by_actor, by_timestamp
   - Verify events are immutable (no `updatedAt` field)

7. **Validate knowledge Table**
   - Check fields: `_id`, `groupId`, `entityId`, `label`, `embedding`, `metadata`, `createdAt`, `updatedAt`
   - Verify `groupId` references `groups._id`
   - Verify `entityId` references things/entities
   - Verify `embedding` field for vector storage
   - Check indexes: by_group, by_entity, by_label

8. **Check Cross-Table Relationships**
   - Verify all `groupId` fields use same ID type
   - Verify foreign key references are consistent
   - Check that indexes support common queries

9. **Validate Against Ontology Rules**
   - Every table must have `groupId` (except groups itself)
   - All timestamps should be numbers (Date.now())
   - All IDs should use Convex Id type
   - Properties/metadata should be flexible objects

10. **Generate Report**
    - Compile all errors, warnings, recommendations
    - Calculate dimension coverage percentage
    - Return validation results

## Examples

### Example 1: Valid Schema

**Input:**
```typescript
schemaPath: "backend/convex/schema.ts"
strictMode: false
```

**Schema Content:**
```typescript
export default defineSchema({
  groups: defineTable({
    name: v.string(),
    type: v.union(v.literal("friend_circle"), v.literal("business"), ...),
    parentGroupId: v.optional(v.id("groups")),
    properties: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), ...),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_type", ["type"]),

  things: defineTable({
    groupId: v.id("groups"),
    type: v.string(),
    name: v.string(),
    properties: v.any(),
    status: v.union(v.literal("draft"), ...),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_group", ["groupId"]).index("by_type", ["type"]),

  // ... other tables
});
```

**Output:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "recommendations": [
    "Consider adding composite index on things: by_group_and_type"
  ],
  "dimensionCoverage": {
    "groups": true,
    "people": true,
    "things": true,
    "connections": true,
    "events": true,
    "knowledge": true,
    "percentage": 100
  }
}
```

### Example 2: Missing Required Table

**Input:**
```typescript
schemaPath: "backend/convex/schema.ts"
strictMode: true
```

**Output:**
```json
{
  "isValid": false,
  "errors": [
    "Missing required table: events",
    "Missing required table: knowledge"
  ],
  "warnings": [
    "connections table missing index: by_source"
  ],
  "recommendations": [
    "Add events table to track all actions",
    "Add knowledge table for semantic search"
  ],
  "dimensionCoverage": {
    "groups": true,
    "people": true,
    "things": true,
    "connections": true,
    "events": false,
    "knowledge": false,
    "percentage": 66.7
  }
}
```

## Error Handling

- **File Not Found:** Return error with clear message about schema path
- **Parse Error:** Return error with line number and syntax issue
- **Invalid Format:** Return error explaining expected Convex schema format
- **Missing Dimensions:** List all missing tables/fields with remediation steps

## Dependencies

- **Tools:** Read, Grep (for searching schema patterns)
- **Skills:** None (foundational skill)
- **Docs:** `one/knowledge/ontology.md` for canonical dimension definitions

## Tests

1. **Test Valid Schema:** Verify schema with all 6 dimensions passes
2. **Test Missing Table:** Verify error when required table missing
3. **Test Missing Field:** Verify error when required field missing
4. **Test Wrong Type:** Verify error when field has wrong type
5. **Test Missing Index:** Verify warning when recommended index missing
6. **Test Legacy Schema:** Verify compatibility with entities → things migration
7. **Test Strict Mode:** Verify strict mode fails on warnings

## Performance

- **Typical Runtime:** < 1 second for standard schema
- **Caching:** Cache schema AST after first parse
- **Optimization:** Skip validation if schema hash unchanged

## Lessons Learned

- **Keep it Fast:** Schema validation runs frequently, optimize for speed
- **Clear Messages:** Error messages must point to exact line/field
- **Flexible Format:** Support both old (entities) and new (things) table names during migration
- **Progressive Enhancement:** Allow warnings without blocking, but flag them clearly

## Version History

- **1.0.0** (2025-10-18): Initial implementation with 6-dimension support
