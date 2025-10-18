# Ontology Skills

**Category:** Foundational Skills
**Version:** 1.0.0
**Created:** 2025-10-18

## Overview

Ontology skills validate, generate, and verify features against the ONE Platform 6-dimension ontology. These are foundational skills used by all agents to ensure ontological compliance.

## The 6 Dimensions

1. **Groups** - Organizational scope and multi-tenancy
2. **People** - Authorization and governance
3. **Things** - All entities (users, content, products, etc.)
4. **Connections** - Relationships between entities
5. **Events** - Immutable action log and audit trail
6. **Knowledge** - Labels, embeddings, and semantic search

## Skills in This Category

### 1. validate-schema.md
**Validates Convex schema against 6-dimension ontology**

Used when:
- Creating or modifying database schema
- Adding new tables or fields
- Ensuring ontology compliance

Used by: `agent-backend`, `agent-quality`, `agent-director`, `agent-builder`

### 2. check-dimension.md
**Analyzes feature to determine dimension coverage**

Used when:
- Planning new features
- Validating requirements
- Identifying gaps in ontological coverage

Used by: `agent-director`, `agent-quality`, `agent-problem-solver`

### 3. generate-entity-type.md
**Generates TypeScript type and schema for new entities**

Used when:
- Adding new entity types to schema
- Creating type definitions
- Ensuring type safety

Used by: `agent-backend`, `agent-builder`, `agent-director`

### 4. verify-relationships.md
**Validates connection types and relationships**

Used when:
- Creating connections between entities
- Verifying relationship semantics
- Preventing invalid connections

Used by: `agent-backend`, `agent-quality`, `agent-integrator`

## Usage Patterns

### In Agent Prompts

**Before (embedded logic):**
```markdown
1. Read the schema file
2. Check if it has all required tables
3. Validate field types
4. Ensure indexes exist
```

**After (using skills):**
```markdown
1. USE SKILL: `skills/ontology/validate-schema.md`
   - Input: schemaPath = "backend/convex/schema.ts"
   - Ensure isValid = true before proceeding
```

### Skill Composition

Skills can invoke other skills:

```markdown
## In generate-entity-type.md

7. Validate Generated Schema
   - USE SKILL: `skills/ontology/validate-schema.md`
   - Input: generated schema entry
   - Ensure validation passes
```

### Error Handling

All ontology skills return structured errors:

```json
{
  "isValid": false,
  "errors": ["Critical issues that must be fixed"],
  "warnings": ["Non-critical issues to consider"],
  "recommendations": ["Suggested improvements"]
}
```

## Dependencies

### Documentation
- `/one/knowledge/ontology.md` - Canonical ontology specification
- `https://docs.claude.com/en/docs/claude-code` - Claude Code documentation

### Tools Used
- **Read** - Load schema and documentation files
- **Grep** - Search for patterns in code
- **Write** - Generate new type definitions

### No Skill Dependencies
These are foundational skills - they don't depend on other skills.

## Examples

### Complete Feature Validation Flow

```markdown
## Agent Workflow: Add Blog Feature

1. USE SKILL: `check-dimension.md`
   - Input: "Add blog with posts, authors, and tags"
   - OUTPUT: Dimensions involved (all 6), complexity=complex

2. USE SKILL: `generate-entity-type.md`
   - Input: entityName="blog_post", description="..."
   - OUTPUT: TypeScript type + schema entry

3. USE SKILL: `verify-relationships.md`
   - Input: connectionType="authored", source="creator", target="blog_post"
   - OUTPUT: isValid=true

4. USE SKILL: `validate-schema.md`
   - Input: Updated schema with blog_post table
   - OUTPUT: isValid=true, dimensionCoverage=100%
```

## Testing

Each skill includes:
- Unit tests for common cases
- Error handling tests
- Integration tests with real schema
- Performance benchmarks

Run tests:
```bash
# Test all ontology skills
bun test .claude/skills/ontology

# Test specific skill
bun test .claude/skills/ontology/validate-schema.test.ts
```

## Performance

| Skill | Typical Runtime | Caching |
|-------|----------------|---------|
| validate-schema | < 1s | Schema AST cached |
| check-dimension | < 500ms | None needed |
| generate-entity-type | < 100ms | None needed |
| verify-relationships | < 200ms | Connection types cached |

## Best Practices

### 1. Always Validate First
Before implementing, use `check-dimension` to ensure feature maps to ontology.

### 2. Use Standard Types
Prefer standard entity and connection types over custom ones.

### 3. Keep Metadata Flat
Complex nested metadata should be separate entities.

### 4. Index for Performance
Use recommended indexes from `generate-entity-type`.

### 5. Document Custom Types
If creating custom entity or connection types, document in ontology.

## Common Patterns

### New Entity Type
1. `check-dimension` - Verify which dimensions involved
2. `generate-entity-type` - Create type definition
3. `verify-relationships` - Validate connections
4. `validate-schema` - Ensure schema compliant

### Schema Migration
1. `validate-schema` - Check current schema
2. Make changes
3. `validate-schema` - Verify new schema
4. Deploy

### Relationship Design
1. `verify-relationships` - Check if connection valid
2. Review recommendations
3. Use suggested alternative if needed
4. Document custom connection type

## Troubleshooting

### Error: "Missing required table: events"
**Solution:** Add events table to schema following 6-dimension model

### Warning: "Custom connection type not in standard list"
**Solution:** Either use standard type or document custom type in ontology

### Error: "Circular dependency detected"
**Solution:** Refactor to remove cycle or make dependency explicit with metadata

### Error: "Semantic mismatch in relationship"
**Solution:** Reverse relationship direction or use different connection type

## Roadmap

### v1.1.0 (Planned)
- Auto-fix common schema issues
- Generate migration scripts
- Visual ontology diagram

### v1.2.0 (Planned)
- ML-based entity type suggestions
- Relationship inference from descriptions
- Schema optimization recommendations

## Contributing

To add or improve ontology skills:

1. Follow skill template in `/one/things/plans/skills.md`
2. Include all sections: Purpose, Inputs, Outputs, Steps, Examples, Tests
3. Add comprehensive error handling
4. Write tests for all cases
5. Update this README

## Support

For questions or issues with ontology skills:
- Check `/one/knowledge/ontology.md` for specification
- Review examples in this README
- See `/one/things/plans/skills.md` for implementation plan
- Consult `https://docs.claude.com/en/docs/claude-code` for Claude Code help

---

**Status:** Production Ready (Phase 1 Complete)
**Next:** Implement Convex skills (Phase 1, Infer 6-10)
