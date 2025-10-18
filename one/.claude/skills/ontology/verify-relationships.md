# Verify Relationships Against Ontology

**Category:** ontology
**Version:** 1.0.0
**Used By:** agent-backend, agent-quality, agent-integrator

## Purpose

Validates proposed connection types and relationship structures against the ONE Ontology to ensure they follow established patterns, prevent invalid relationships, and maintain data integrity.

## Inputs

- **connectionType** (string): The type of connection (e.g., "authored", "owns", "contains")
- **sourceEntityType** (string): Type of source entity
- **targetEntityType** (string): Type of target entity
- **metadata** (object, optional): Additional relationship metadata
- **bidirectional** (boolean, optional): Whether relationship should work both ways. Default: false

## Outputs

- **isValid** (boolean): True if relationship is valid
- **errors** (array): Issues that prevent this relationship
- **warnings** (array): Potential problems or anti-patterns
- **recommendations** (array): Suggested improvements
- **alternativeConnections** (array): Other valid connection types for these entities

## Prerequisites

- Connection type follows naming convention (lowercase, underscores, verb-based)
- Source and target entity types exist in schema
- ONE ontology connection types documented in `/one/knowledge/ontology.md`

## Steps

1. **Load Known Connection Types**
   - Read `/one/knowledge/ontology.md` for canonical connection types
   - Load 25+ standard connection types:
     - owns, authored, holds_tokens, enrolled_in, member_of
     - follows, subscribed_to, attended, purchased
     - contains, part_of, depends_on, related_to
     - communicated, transacted, delegated, etc.

2. **Validate Connection Type Name**
   - Check if connection type is known/standard
   - If custom: Verify it's verb-based and descriptive
   - Check for naming conflicts
   - Warn if very similar to existing type

3. **Check Entity Type Compatibility**
   - Verify source entity type exists
   - Verify target entity type exists
   - Check if relationship makes semantic sense
   - Example: creator can "author" blog_post (valid)
   - Example: blog_post cannot "author" creator (invalid - wrong direction)

4. **Validate Metadata Structure**
   - Check metadata fields are appropriate for connection type
   - Verify metadata types (string, number, boolean, object)
   - Warn if metadata is too complex (should be flat when possible)
   - Suggest moving complex data to separate entities

5. **Check for Anti-Patterns**
   - **Circular Dependencies:** A → B → C → A
   - **Self-References:** Entity connecting to itself (sometimes valid)
   - **Many-to-Many without Junction:** Should use explicit join entities
   - **Missing Timestamps:** validFrom/validTo for temporal relationships
   - **Overly Generic:** "related_to" instead of specific relationship

6. **Verify Bidirectionality**
   - If bidirectional=true, check if reverse makes sense
   - Example: "follows" could be bidirectional (mutual follow)
   - Example: "authored" should NOT be bidirectional (post can't author person)
   - Suggest inverse relationship type if needed

7. **Check Index Requirements**
   - Verify indexes exist for common queries
   - by_source - Find all connections from entity
   - by_target - Find all connections to entity
   - by_type - Find all connections of specific type
   - Compound indexes for scoped queries

8. **Suggest Alternative Connections**
   - If current connection is invalid, suggest valid alternatives
   - Example: Instead of "created" use "authored" for content
   - Example: Instead of "has" use "owns" for ownership

9. **Generate Validation Report**
   - Compile errors, warnings, recommendations
   - Provide examples of correct usage
   - Link to relevant documentation

## Examples

### Example 1: Valid Author Relationship

**Input:**
```json
{
  "connectionType": "authored",
  "sourceEntityType": "creator",
  "targetEntityType": "blog_post",
  "metadata": {
    "role": "primary_author",
    "contributionDate": 1697659200000
  },
  "bidirectional": false
}
```

**Output:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "recommendations": [
    "Consider adding validFrom/validTo for temporal tracking",
    "Metadata looks good - role and date are appropriate"
  ],
  "alternativeConnections": [
    "created - Generic creation relationship",
    "contributed_to - For co-authors"
  ]
}
```

### Example 2: Invalid Reverse Relationship

**Input:**
```json
{
  "connectionType": "authored",
  "sourceEntityType": "blog_post",
  "targetEntityType": "creator",
  "metadata": {},
  "bidirectional": false
}
```

**Output:**
```json
{
  "isValid": false,
  "errors": [
    "Semantic mismatch: blog_post cannot 'author' a creator",
    "Relationship direction is reversed - should be creator -> blog_post"
  ],
  "warnings": [],
  "recommendations": [
    "Reverse the direction: creator 'authored' blog_post",
    "Or use different connection type if blog_post references creator"
  ],
  "alternativeConnections": [
    "authored_by - Inverse relationship (passive voice)",
    "created_by - Generic inverse"
  ]
}
```

### Example 3: Circular Dependency Warning

**Input:**
```json
{
  "connectionType": "depends_on",
  "sourceEntityType": "service_a",
  "targetEntityType": "service_b",
  "metadata": {
    "note": "service_b also depends on service_a creating a cycle"
  },
  "bidirectional": false
}
```

**Output:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Potential circular dependency detected in metadata note",
    "Circular dependencies can cause infinite loops - verify this is intentional"
  ],
  "recommendations": [
    "If mutual dependency is required, use explicit bidirectional flag",
    "Consider refactoring to remove circular dependency",
    "Add dependency_type metadata to distinguish hard vs soft dependencies"
  ],
  "alternativeConnections": [
    "communicates_with - For peer-to-peer relationships",
    "integrated_with - For bidirectional integrations"
  ]
}
```

### Example 4: Custom Connection Type

**Input:**
```json
{
  "connectionType": "peer_reviewed",
  "sourceEntityType": "reviewer",
  "targetEntityType": "research_paper",
  "metadata": {
    "reviewDate": 1697659200000,
    "score": 8.5,
    "comments": "Excellent methodology"
  },
  "bidirectional": false
}
```

**Output:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [
    "Custom connection type 'peer_reviewed' is not in standard list",
    "Consider using standard 'reviewed' connection type instead"
  ],
  "recommendations": [
    "Document this custom connection type in ontology",
    "Metadata structure is good - score and comments are appropriate",
    "Consider whether 'reviewed' standard type would work"
  ],
  "alternativeConnections": [
    "reviewed - Standard review relationship",
    "evaluated - Generic assessment relationship",
    "approved - If binary pass/fail"
  ]
}
```

### Example 5: Container Relationship

**Input:**
```json
{
  "connectionType": "contains",
  "sourceEntityType": "astro_page",
  "targetEntityType": "react_component",
  "metadata": {
    "position": "center",
    "order": 2
  },
  "bidirectional": false
}
```

**Output:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": [],
  "recommendations": [
    "Perfect use of 'contains' for composition relationship",
    "Metadata with position/order is good practice for layout",
    "Consider adding inverse index for 'part_of' queries"
  ],
  "alternativeConnections": [
    "part_of - Inverse relationship (component part_of page)",
    "includes - Similar to contains but less hierarchical"
  ]
}
```

## Error Handling

- **Unknown Entity Types:** Return error with list of valid entity types
- **Invalid Connection Type:** Suggest nearest valid connection type
- **Missing Required Metadata:** Specify what metadata is expected
- **Schema Mismatch:** Point to schema definition that conflicts

## Dependencies

- **Tools:** Read (for loading ontology docs), Grep (for searching connection types)
- **Skills:** `validate-schema.md` (to check if entities exist)
- **Docs:**
  - `/one/knowledge/ontology.md` - Connection type catalog
  - `https://docs.claude.com/en/docs/claude-code` - Claude Code docs (if needed)

## Tests

1. **Test Valid Standard Connection:** Verify known connection types pass
2. **Test Invalid Direction:** Verify reversed relationships are caught
3. **Test Custom Connection:** Verify custom types get warnings but pass
4. **Test Circular Dependency:** Verify cycles are detected
5. **Test Bidirectional Logic:** Verify bidirectional validation works
6. **Test Metadata Validation:** Verify complex metadata gets warnings
7. **Test Entity Type Checking:** Verify non-existent entities are caught

## Performance

- **Validation Time:** < 200ms per relationship
- **Caching:** Cache loaded connection types from ontology docs
- **Optimization:** Pre-load standard connection types at startup

## Lessons Learned

- **Verb-Based Names:** Connection types should be action verbs (authored, owns, contains)
- **Direction Matters:** Creator → Content (active voice) is clearer than Content → Creator
- **Metadata Should Be Flat:** Complex nested metadata belongs in separate entities
- **Temporal Relationships:** Most connections benefit from validFrom/validTo timestamps
- **Standard Over Custom:** Use standard connection types when possible for consistency

## Version History

- **1.0.0** (2025-10-18): Initial implementation with 25+ standard connection types
