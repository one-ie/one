# Check if Feature Maps to Ontology Dimensions

**Category:** ontology
**Version:** 1.0.0
**Used By:** agent-director, agent-quality, agent-problem-solver

## Purpose

Analyzes a feature description or requirement to determine which of the 6 dimensions of the ONE Ontology it touches, ensuring complete ontological coverage before implementation begins.

## Inputs

- **featureDescription** (string): Plain English description of the feature
- **contextType** (string, optional): Type hint (website, api, integration, agent). Default: auto-detect

## Outputs

- **dimensionMapping** (object): Which dimensions are involved and how
- **missingDimensions** (array): Dimensions not covered (potential gaps)
- **recommendations** (array): Suggestions for complete coverage
- **complexity** (string): Feature complexity (simple, moderate, complex, very_complex)
- **requiredSkills** (array): List of skills needed to implement

## Prerequisites

- Feature description is clear and specific
- ONE ontology documentation available
- Understanding of 6 dimensions: groups, people, things, connections, events, knowledge

## Steps

1. **Parse Feature Description**
   - Extract key verbs (CREATE, UPDATE, DELETE, CONNECT, etc.)
   - Extract key nouns (entities, relationships, actions)
   - Identify actors (who does this?)
   - Identify targets (what is affected?)

2. **Check Groups Dimension**
   - Ask: Does this feature need organizational scope?
   - Ask: Can it work across nested groups?
   - Ask: Does it need multi-tenancy?
   - If yes to any: Mark groups dimension as involved
   - Document: How groups are used (scope, ownership, hierarchy)

3. **Check People Dimension**
   - Ask: Who authorizes this action?
   - Ask: What roles are involved?
   - Ask: Are there permission checks?
   - If yes to any: Mark people dimension as involved
   - Document: Actor roles, permissions, authorization flow

4. **Check Things Dimension**
   - Ask: What entities are created/modified/deleted?
   - Ask: What entity types are involved?
   - Ask: Are new entity types needed?
   - If yes to any: Mark things dimension as involved
   - Document: Entity types, properties, status lifecycle

5. **Check Connections Dimension**
   - Ask: Are entities related to each other?
   - Ask: What relationship types are created?
   - Ask: Is relationship metadata needed?
   - If yes to any: Mark connections dimension as involved
   - Document: Connection types, directionality, metadata

6. **Check Events Dimension**
   - Ask: What actions need to be logged?
   - Ask: Is audit trail required?
   - Ask: Are there event triggers?
   - If yes to any: Mark events dimension as involved
   - Document: Event types, actors, targets, timestamps

7. **Check Knowledge Dimension**
   - Ask: Is content indexed for search?
   - Ask: Are embeddings needed for AI?
   - Ask: Are labels/tags used?
   - If yes to any: Mark knowledge dimension as involved
   - Document: Labels, embeddings, search requirements

8. **Identify Missing Dimensions**
   - List dimensions not touched
   - Evaluate if they should be involved
   - Suggest additions if gaps found

9. **Calculate Complexity**
   - Simple: 1-2 dimensions, single table, no external calls
   - Moderate: 3-4 dimensions, multiple tables, basic logic
   - Complex: 5+ dimensions, external APIs, complex workflows
   - Very Complex: All 6 dimensions, multi-step orchestration, AI/blockchain

10. **Recommend Required Skills**
    - Map dimensions to skills needed
    - Suggest skill execution order
    - Identify skill dependencies

## Examples

### Example 1: Build Landing Page

**Input:**
```
featureDescription: "Create a landing page with hero section, pricing table, and CTA buttons"
contextType: "website"
```

**Output:**
```json
{
  "dimensionMapping": {
    "groups": {
      "involved": true,
      "usage": "Page belongs to a group/organization",
      "details": "groupId scopes ownership of page"
    },
    "people": {
      "involved": true,
      "usage": "Owner creates and publishes page",
      "details": "actorId tracks who built the page"
    },
    "things": {
      "involved": true,
      "usage": "Page, components, and sections are entities",
      "details": "astro_page, react_component entity types"
    },
    "connections": {
      "involved": true,
      "usage": "Page contains components relationship",
      "details": "contains connection type with position metadata"
    },
    "events": {
      "involved": true,
      "usage": "Track page_created, page_published events",
      "details": "Audit trail for page lifecycle"
    },
    "knowledge": {
      "involved": false,
      "usage": "Not required for static pages",
      "details": "Could add for SEO metadata"
    }
  },
  "missingDimensions": ["knowledge"],
  "recommendations": [
    "Consider adding knowledge labels for SEO (meta tags, keywords)",
    "Add page_viewed events for analytics"
  ],
  "complexity": "moderate",
  "requiredSkills": [
    "skills/astro/create-page.md",
    "skills/astro/create-component.md",
    "skills/convex/create-mutation.md",
    "skills/deployment/deploy-cloudflare.md"
  ]
}
```

### Example 2: Add Blog with Search

**Input:**
```
featureDescription: "Add a blog to the website with full-text search, tags, and author pages"
contextType: "website"
```

**Output:**
```json
{
  "dimensionMapping": {
    "groups": {
      "involved": true,
      "usage": "Blog content scoped to group",
      "details": "Multi-tenant blog support"
    },
    "people": {
      "involved": true,
      "usage": "Authors create posts, readers view",
      "details": "author_id, reader roles"
    },
    "things": {
      "involved": true,
      "usage": "Blog posts, authors, tags as entities",
      "details": "blog_post, creator, tag entity types"
    },
    "connections": {
      "involved": true,
      "usage": "Post authored_by author, post tagged_with tag",
      "details": "authored, tagged connection types"
    },
    "events": {
      "involved": true,
      "usage": "Track post_created, post_viewed, post_shared",
      "details": "Analytics and engagement tracking"
    },
    "knowledge": {
      "involved": true,
      "usage": "Full-text search, tag taxonomy, embeddings",
      "details": "Embeddings for semantic search, labels for categorization"
    }
  },
  "missingDimensions": [],
  "recommendations": [
    "All 6 dimensions covered - complete ontological representation",
    "Consider adding related_posts connection for recommendations"
  ],
  "complexity": "complex",
  "requiredSkills": [
    "skills/astro/add-content-collection.md",
    "skills/astro/create-page.md",
    "skills/convex/create-query.md",
    "skills/testing/generate-tests.md",
    "skills/deployment/deploy-cloudflare.md"
  ]
}
```

### Example 3: Simple Static Page

**Input:**
```
featureDescription: "Add an about page with company history"
contextType: "website"
```

**Output:**
```json
{
  "dimensionMapping": {
    "groups": {
      "involved": true,
      "usage": "Page belongs to organization group",
      "details": "groupId for ownership"
    },
    "people": {
      "involved": true,
      "usage": "Owner creates page",
      "details": "actorId for page creator"
    },
    "things": {
      "involved": true,
      "usage": "About page is an entity",
      "details": "astro_page entity type"
    },
    "connections": {
      "involved": false,
      "usage": "No relationships needed for static page",
      "details": "Simple standalone page"
    },
    "events": {
      "involved": true,
      "usage": "Track page_created event",
      "details": "Basic audit trail"
    },
    "knowledge": {
      "involved": false,
      "usage": "Not needed for static content",
      "details": "Could add for SEO"
    }
  },
  "missingDimensions": ["connections", "knowledge"],
  "recommendations": [
    "This is a simple feature - connections and knowledge are optional",
    "Consider linking page to site entity (contains connection)"
  ],
  "complexity": "simple",
  "requiredSkills": [
    "skills/astro/create-page.md",
    "skills/deployment/deploy-cloudflare.md"
  ]
}
```

## Error Handling

- **Ambiguous Description:** Ask for clarification on specific aspects
- **Unknown Context:** Default to auto-detect mode
- **No Dimensions Match:** Flag as potential issue - all features should touch at least one dimension

## Dependencies

- **Tools:** None (pure analysis)
- **Skills:** None (foundational skill)
- **Docs:** `one/knowledge/ontology.md` for dimension definitions

## Tests

1. **Test Simple Feature:** Verify 1-2 dimensions identified correctly
2. **Test Complex Feature:** Verify all 6 dimensions identified when appropriate
3. **Test Website Feature:** Verify website-specific patterns recognized
4. **Test API Feature:** Verify API patterns recognized
5. **Test Missing Dimensions:** Verify gaps are identified and flagged
6. **Test Skill Recommendations:** Verify correct skills suggested for each dimension

## Performance

- **Typical Runtime:** < 500ms for analysis
- **No External Calls:** Pure text analysis and pattern matching
- **Caching:** Not needed (stateless analysis)

## Lessons Learned

- **Be Generous:** If in doubt, include a dimension - better to over-specify than under-specify
- **Context Matters:** Website features differ from API features in dimension usage
- **Always Suggest Events:** Even simple features benefit from audit trails
- **Knowledge is Optional:** Not all features need search/AI, but many benefit from it

## Version History

- **1.0.0** (2025-10-18): Initial implementation with 6-dimension analysis
