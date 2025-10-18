# Read and Parse Convex Schema

**Category:** convex
**Version:** 1.0.0
**Used By:** agent-backend, agent-builder, agent-quality, agent-director, agent-integrator

## Purpose

Reads and parses a Convex schema file to extract table definitions, field types, indexes, and relationships for use by other skills and agents.

## Inputs

- **schemaPath** (string): Path to schema file. Default: `backend/convex/schema.ts`
- **tableFilter** (array, optional): Only return specific tables. Default: all tables

## Outputs

- **tables** (object): Map of table name → table definition
- **tableCount** (number): Total number of tables
- **indexes** (object): Map of table → array of indexes
- **relationships** (array): Foreign key relationships detected
- **schemaVersion** (string): Convex schema version used
- **raw** (string): Raw schema file content (for advanced usage)

## Prerequisites

- Schema file exists at specified path
- Schema follows Convex `defineSchema` format
- TypeScript/JavaScript syntax is valid

## Steps

1. **Read Schema File**
   - Use Read tool to load file from schemaPath
   - Handle file not found gracefully
   - Verify file contains `defineSchema`

2. **Parse Schema Structure**
   - Extract `defineSchema({ ... })` block
   - Identify all table definitions (defineTable)
   - Parse each table's field definitions
   - Extract validator types (v.string(), v.number(), etc.)

3. **Extract Table Definitions**
   - For each table:
     - Table name
     - Field names and types
     - Required vs optional fields
     - Default values
     - Validator constraints

4. **Parse Indexes**
   - Find all `.index()` calls
   - Extract index name
   - Extract indexed fields
   - Determine index type (single field, compound, search)

5. **Detect Relationships**
   - Find all `v.id("tableName")` references
   - Map foreign key fields to target tables
   - Identify relationship type (one-to-one, one-to-many)
   - Note bidirectional relationships

6. **Determine Schema Version**
   - Check import statement for Convex version
   - Look for version-specific features
   - Default to latest known version

7. **Apply Table Filter** (if provided)
   - Filter tables object to only requested tables
   - Maintain relationships for filtered tables
   - Update tableCount

8. **Return Parsed Schema**
   - Structured data ready for other skills
   - Include raw content for advanced parsing
   - Provide metadata about schema

## Examples

### Example 1: Read Full Schema

**Input:**
```typescript
schemaPath: "backend/convex/schema.ts"
tableFilter: null
```

**Schema Content:**
```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  groups: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("friend_circle"),
      v.literal("business"),
      v.literal("community"),
      v.literal("dao"),
      v.literal("government"),
      v.literal("organization")
    ),
    parentGroupId: v.optional(v.id("groups")),
    properties: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_parent", ["parentGroupId"]),

  things: defineTable({
    groupId: v.id("groups"),
    type: v.string(),
    name: v.string(),
    properties: v.any(),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("published"), v.literal("archived")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_type", ["type"])
    .index("by_group_and_type", ["groupId", "type"]),

  connections: defineTable({
    groupId: v.id("groups"),
    sourceId: v.id("things"),
    targetId: v.id("things"),
    type: v.string(),
    metadata: v.any(),
    validFrom: v.optional(v.number()),
    validTo: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_source", ["sourceId"])
    .index("by_target", ["targetId"])
    .index("by_type", ["type"]),
});
```

**Output:**
```json
{
  "tables": {
    "groups": {
      "fields": {
        "_id": { "type": "Id<'groups'>", "required": true },
        "name": { "type": "string", "required": true },
        "type": { "type": "union", "values": ["friend_circle", "business", "community", "dao", "government", "organization"], "required": true },
        "parentGroupId": { "type": "Id<'groups'>", "required": false },
        "properties": { "type": "any", "required": true },
        "status": { "type": "union", "values": ["draft", "active", "archived"], "required": true },
        "createdAt": { "type": "number", "required": true },
        "updatedAt": { "type": "number", "required": true }
      },
      "indexes": ["by_type", "by_parent"]
    },
    "things": {
      "fields": {
        "_id": { "type": "Id<'things'>", "required": true },
        "groupId": { "type": "Id<'groups'>", "required": true },
        "type": { "type": "string", "required": true },
        "name": { "type": "string", "required": true },
        "properties": { "type": "any", "required": true },
        "status": { "type": "union", "values": ["draft", "active", "published", "archived"], "required": true },
        "createdAt": { "type": "number", "required": true },
        "updatedAt": { "type": "number", "required": true }
      },
      "indexes": ["by_group", "by_type", "by_group_and_type"]
    },
    "connections": {
      "fields": {
        "_id": { "type": "Id<'connections'>", "required": true },
        "groupId": { "type": "Id<'groups'>", "required": true },
        "sourceId": { "type": "Id<'things'>", "required": true },
        "targetId": { "type": "Id<'things'>", "required": true },
        "type": { "type": "string", "required": true },
        "metadata": { "type": "any", "required": true },
        "validFrom": { "type": "number", "required": false },
        "validTo": { "type": "number", "required": false },
        "createdAt": { "type": "number", "required": true },
        "updatedAt": { "type": "number", "required": true }
      },
      "indexes": ["by_group", "by_source", "by_target", "by_type"]
    }
  },
  "tableCount": 3,
  "indexes": {
    "groups": [
      { "name": "by_type", "fields": ["type"] },
      { "name": "by_parent", "fields": ["parentGroupId"] }
    ],
    "things": [
      { "name": "by_group", "fields": ["groupId"] },
      { "name": "by_type", "fields": ["type"] },
      { "name": "by_group_and_type", "fields": ["groupId", "type"] }
    ],
    "connections": [
      { "name": "by_group", "fields": ["groupId"] },
      { "name": "by_source", "fields": ["sourceId"] },
      { "name": "by_target", "fields": ["targetId"] },
      { "name": "by_type", "fields": ["type"] }
    ]
  },
  "relationships": [
    {
      "fromTable": "groups",
      "fromField": "parentGroupId",
      "toTable": "groups",
      "toField": "_id",
      "type": "self-reference",
      "optional": true
    },
    {
      "fromTable": "things",
      "fromField": "groupId",
      "toTable": "groups",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    },
    {
      "fromTable": "connections",
      "fromField": "groupId",
      "toTable": "groups",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    },
    {
      "fromTable": "connections",
      "fromField": "sourceId",
      "toTable": "things",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    },
    {
      "fromTable": "connections",
      "fromField": "targetId",
      "toTable": "things",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    }
  ],
  "schemaVersion": "1.0",
  "raw": "[full schema file content]"
}
```

### Example 2: Read Specific Tables

**Input:**
```typescript
schemaPath: "backend/convex/schema.ts"
tableFilter: ["things", "connections"]
```

**Output:**
```json
{
  "tables": {
    "things": { "fields": {...}, "indexes": [...] },
    "connections": { "fields": {...}, "indexes": [...] }
  },
  "tableCount": 2,
  "indexes": {
    "things": [...],
    "connections": [...]
  },
  "relationships": [
    {
      "fromTable": "things",
      "fromField": "groupId",
      "toTable": "groups",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    },
    {
      "fromTable": "connections",
      "fromField": "sourceId",
      "toTable": "things",
      "toField": "_id",
      "type": "many-to-one",
      "optional": false
    }
  ],
  "schemaVersion": "1.0",
  "raw": "[full schema file content]"
}
```

## Error Handling

- **File Not Found:** Return clear error with correct path
- **Parse Error:** Return line number and syntax error description
- **Invalid Schema:** Explain what's wrong with schema structure
- **No Tables Found:** Check if defineSchema is present

## Dependencies

- **Tools:** Read (to load schema file), Grep (optional, for pattern matching)
- **Skills:** None (foundational Convex skill)
- **Docs:**
  - `https://docs.convex.dev/database/schemas` - Convex schema documentation
  - `/one/knowledge/ontology.md` - ONE ontology for expected tables

## Tests

1. **Test Valid Schema:** Parse complete 6-dimension schema successfully
2. **Test Minimal Schema:** Parse schema with single table
3. **Test Complex Types:** Parse nested objects, arrays, unions
4. **Test Relationships:** Detect all foreign key references
5. **Test Indexes:** Extract all index definitions correctly
6. **Test Table Filter:** Return only requested tables
7. **Test Invalid Syntax:** Handle malformed schema gracefully

## Performance

- **Parse Time:** < 500ms for typical schema (5-10 tables)
- **Caching:** Cache parsed schema (invalidate on file change)
- **Optimization:** Parse incrementally for large schemas

## Usage Patterns

### In Other Skills

```markdown
## In create-mutation.md

1. USE SKILL: `skills/convex/read-schema.md`
   - Input: schemaPath
   - SAVE result as SCHEMA

2. Check if target table exists
   - IF SCHEMA.tables["targetTable"] is undefined
   - RETURN error: "Table not found in schema"

3. Get field types from schema
   - Use SCHEMA.tables["targetTable"].fields
   - Validate input types match schema
```

### In Agents

```markdown
## In agent-backend

Before creating mutation:

1. USE SKILL: `skills/convex/read-schema.md`
   - Understand current schema structure
   - Identify available tables and fields
   - Check relationships for validation logic
```

## Lessons Learned

- **Parse AST, Not Strings:** Use proper TypeScript parser for robust parsing
- **Cache Aggressively:** Schema doesn't change often, cache parsed result
- **Relationships Are Key:** Foreign keys drive query patterns and validation
- **Index Awareness:** Knowing indexes helps generate efficient queries
- **Version Matters:** Different Convex versions have different features

## Version History

- **1.0.0** (2025-10-18): Initial implementation with relationship detection
