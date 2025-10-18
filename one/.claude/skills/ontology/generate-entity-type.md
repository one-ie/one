# Generate Entity Type from Description

**Category:** ontology
**Version:** 1.0.0
**Used By:** agent-backend, agent-builder, agent-director

## Purpose

Generates a complete TypeScript type definition and Convex schema entry for a new entity type based on a Plain English description, ensuring compliance with the ONE Ontology.

## Inputs

- **entityDescription** (string): Plain English description of the entity
- **entityName** (string): Singular name for the entity type (e.g., "blog_post", "product", "landing_page")
- **groupId** (boolean, optional): Whether this entity is scoped to groups. Default: true
- **additionalFields** (object, optional): Extra fields beyond standard ones

## Outputs

- **typeDefinition** (string): TypeScript type for the entity
- **schemaEntry** (string): Convex schema table definition
- **exampleData** (object): Sample entity instance
- **relatedTypes** (array): Suggested connection types for this entity
- **suggestedIndexes** (array): Recommended database indexes

## Prerequisites

- Entity name follows naming convention (lowercase, underscores)
- Entity doesn't conflict with existing types
- ONE ontology schema structure understood

## Steps

1. **Analyze Entity Description**
   - Extract key properties from description
   - Identify property types (string, number, boolean, object, array)
   - Determine if properties are required or optional
   - Identify relationships to other entities

2. **Generate Standard Fields**
   - Add `_id: Id<"things">` - Convex document ID
   - Add `groupId: Id<"groups">` - Multi-tenant scope (if groupId=true)
   - Add `type: string` - Entity type discriminator (value = entityName)
   - Add `name: string` - Human-readable name
   - Add `status: enum` - Lifecycle status (draft, active, published, archived)
   - Add `createdAt: number` - Creation timestamp
   - Add `updatedAt: number` - Last update timestamp

3. **Generate Custom Properties**
   - Create `properties` object for entity-specific fields
   - Make properties flexible (v.any() or specific object schema)
   - Document each property with JSDoc comments
   - Set sensible defaults where applicable

4. **Create TypeScript Type**
   - Generate interface extending base Thing type
   - Include all standard and custom fields
   - Add type guards for discriminated union
   - Export type for use in queries/mutations

5. **Create Convex Schema Entry**
   - Generate defineTable with all fields
   - Use Convex validators (v.string(), v.number(), etc.)
   - Add required indexes (by_group, by_type, by_group_and_type)
   - Add custom indexes based on common query patterns

6. **Generate Example Data**
   - Create realistic sample instance
   - Show all fields populated
   - Include nested properties
   - Demonstrate valid status values

7. **Suggest Related Connection Types**
   - Analyze relationships mentioned in description
   - Suggest connection types (owns, authored, contains, etc.)
   - Provide directionality (source → target)
   - Include metadata suggestions

8. **Recommend Indexes**
   - by_group - Filter by group
   - by_type - Filter by entity type
   - by_group_and_type - Compound index for scoped queries
   - by_status - Filter by lifecycle status
   - Custom indexes based on query patterns

## Examples

### Example 1: Blog Post Entity

**Input:**
```
entityDescription: "A blog post written by an author, with title, content, publish date, tags, and featured image"
entityName: "blog_post"
groupId: true
additionalFields: {}
```

**Output:**

**typeDefinition:**
```typescript
/**
 * Blog Post Entity
 * A blog post written by an author with rich content and metadata
 */
export interface BlogPost extends Thing {
  _id: Id<"things">;
  groupId: Id<"groups">;
  type: "blog_post";
  name: string; // Post title
  status: "draft" | "active" | "published" | "archived";
  properties: {
    content: string; // Markdown or HTML content
    excerpt?: string; // Short summary
    publishDate?: number; // Timestamp when published
    tags: string[]; // Categorization tags
    featuredImage?: string; // URL to hero image
    authorId: Id<"things">; // Reference to creator entity
    slug: string; // URL-friendly identifier
    seoTitle?: string; // SEO-optimized title
    seoDescription?: string; // Meta description
    readTime?: number; // Estimated read time in minutes
  };
  createdAt: number;
  updatedAt: number;
}
```

**schemaEntry:**
```typescript
blog_posts: defineTable({
  groupId: v.id("groups"),
  type: v.literal("blog_post"),
  name: v.string(), // Post title
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("published"),
    v.literal("archived")
  ),
  properties: v.object({
    content: v.string(),
    excerpt: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    tags: v.array(v.string()),
    featuredImage: v.optional(v.string()),
    authorId: v.id("things"),
    slug: v.string(),
    seoTitle: v.optional(v.string()),
    seoDescription: v.optional(v.string()),
    readTime: v.optional(v.number()),
  }),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_group", ["groupId"])
  .index("by_type", ["type"])
  .index("by_group_and_type", ["groupId", "type"])
  .index("by_status", ["status"])
  .index("by_slug", ["groupId", "properties.slug"])
  .index("by_publish_date", ["groupId", "properties.publishDate"]),
```

**exampleData:**
```json
{
  "_id": "jd7xk9m2n5p8q1r4",
  "groupId": "kg3xl8n1m4o7p0q3",
  "type": "blog_post",
  "name": "Getting Started with ONE Platform",
  "status": "published",
  "properties": {
    "content": "# Welcome to ONE\n\nThis is your first blog post...",
    "excerpt": "Learn how to build websites with Plain English",
    "publishDate": 1697673600000,
    "tags": ["tutorial", "getting-started", "astro"],
    "featuredImage": "https://cdn.example.com/images/hero.jpg",
    "authorId": "lh4ym9n2o5p8q1r4",
    "slug": "getting-started-with-one-platform",
    "seoTitle": "Getting Started with ONE Platform | Complete Guide",
    "seoDescription": "A comprehensive guide to building your first website with ONE Platform",
    "readTime": 5
  },
  "createdAt": 1697659200000,
  "updatedAt": 1697673600000
}
```

**relatedTypes:**
```json
[
  {
    "connectionType": "authored",
    "source": "creator (author)",
    "target": "blog_post",
    "metadata": { "role": "author" }
  },
  {
    "connectionType": "tagged_with",
    "source": "blog_post",
    "target": "tag",
    "metadata": { "category": "string" }
  },
  {
    "connectionType": "part_of",
    "source": "blog_post",
    "target": "blog_collection",
    "metadata": { "order": "number" }
  }
]
```

**suggestedIndexes:**
```json
[
  "by_group - Filter posts by organization",
  "by_type - Filter all blog posts",
  "by_group_and_type - Scoped blog post queries",
  "by_status - Filter by draft/published status",
  "by_slug - Fast lookup by URL slug",
  "by_publish_date - Sort posts chronologically"
]
```

### Example 2: Product Entity

**Input:**
```
entityDescription: "An e-commerce product with name, price, description, images, inventory count, and SKU"
entityName: "product"
groupId: true
```

**Output:**

**typeDefinition:**
```typescript
/**
 * Product Entity
 * E-commerce product with pricing and inventory
 */
export interface Product extends Thing {
  _id: Id<"things">;
  groupId: Id<"groups">;
  type: "product";
  name: string; // Product name
  status: "draft" | "active" | "published" | "archived";
  properties: {
    description: string;
    price: number; // Price in cents
    currency: string; // ISO currency code (USD, EUR, etc.)
    images: string[]; // Array of image URLs
    inventory: number; // Stock count
    sku: string; // Stock Keeping Unit
    category?: string;
    weight?: number; // Weight in grams
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    featured: boolean;
  };
  createdAt: number;
  updatedAt: number;
}
```

**exampleData:**
```json
{
  "_id": "pr4duct123xyz",
  "groupId": "st0re456abc",
  "type": "product",
  "name": "Premium Wireless Headphones",
  "status": "published",
  "properties": {
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 29999,
    "currency": "USD",
    "images": [
      "https://cdn.example.com/products/headphones-1.jpg",
      "https://cdn.example.com/products/headphones-2.jpg"
    ],
    "inventory": 47,
    "sku": "WH-PREM-001",
    "category": "Electronics",
    "weight": 250,
    "dimensions": {
      "length": 20,
      "width": 18,
      "height": 8
    },
    "featured": true
  },
  "createdAt": 1697659200000,
  "updatedAt": 1697745600000
}
```

## Error Handling

- **Invalid Entity Name:** Must be lowercase with underscores only
- **Conflicting Type:** Check if entity type already exists in schema
- **Invalid Property Types:** Validate property type specifications
- **Missing Required Fields:** Ensure all standard fields included

## Dependencies

- **Tools:** Write (to generate files)
- **Skills:** `validate-schema.md` (to verify generated schema)
- **Docs:** `one/knowledge/ontology.md` for entity type conventions

## Tests

1. **Test Basic Entity:** Generate simple entity with minimal properties
2. **Test Complex Entity:** Generate entity with nested objects and arrays
3. **Test Without GroupId:** Generate global entity (groupId=false)
4. **Test Validation:** Ensure generated schema passes validation
5. **Test Type Safety:** Verify TypeScript types compile correctly
6. **Test Index Generation:** Verify recommended indexes are optimal

## Performance

- **Generation Time:** < 100ms for typical entity
- **No External Calls:** Pure code generation
- **Caching:** Not applicable (always fresh generation)

## Lessons Learned

- **Properties Flexibility:** Use `v.any()` for properties unless schema is fully known
- **Always Index by Group:** Multi-tenancy requires group-based filtering
- **Compound Indexes:** by_group_and_type is essential for performance
- **Slug Fields:** Most content entities benefit from URL-friendly slugs
- **Timestamps:** Always use Unix timestamps (number) for consistency

## Version History

- **1.0.0** (2025-10-18): Initial implementation with full type generation
