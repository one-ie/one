# Create Convex Mutation

**Category:** convex
**Version:** 1.0.0
**Used By:** agent-backend, agent-builder

## Purpose

Generates a complete, production-ready Convex mutation function from a Plain English description, including validation, error handling, ontology compliance, and event logging.

## Inputs

- **operationDescription** (string): What the mutation should do in Plain English
- **targetTable** (string): Primary table being modified (e.g., "things", "connections")
- **operationType** (string): create, update, delete, or custom
- **includeAuth** (boolean, optional): Add authentication checks. Default: true
- **includeEvents** (boolean, optional): Log events dimension. Default: true
- **includeValidation** (boolean, optional): Add input validation. Default: true

## Outputs

- **functionCode** (string): Complete TypeScript mutation code
- **functionName** (string): Suggested function name (e.g., "createBlogPost")
- **argsSchema** (object): Input argument schema
- **testCases** (array): Suggested test cases
- **dependencies** (array): Required imports and utilities

## Prerequisites

- Schema exists and has been validated
- Target table is defined in schema
- Operation type is valid
- Authentication setup exists (if includeAuth=true)

## Steps

1. **Load Schema**
   - USE SKILL: `skills/convex/read-schema.md`
   - Get target table definition
   - Verify table exists
   - Extract field types and constraints

2. **Parse Operation Description**
   - Identify entities involved
   - Extract input requirements
   - Determine success criteria
   - Identify error conditions

3. **Generate Function Name**
   - Follow convention: operationType + EntityName
   - Examples: createBlogPost, updateProduct, deleteUser
   - Ensure name is descriptive and follows camelCase

4. **Define Arguments Schema**
   - Extract required fields from operation description
   - Map to Convex validators (v.string(), v.number(), etc.)
   - Add groupId for multi-tenancy (unless global entity)
   - Include optional fields as v.optional()

5. **Generate Validation Logic** (if includeValidation=true)
   - Check required fields are present
   - Validate field types and constraints
   - Verify foreign key references exist
   - Return descriptive error messages

6. **Add Authentication** (if includeAuth=true)
   - Get user identity from ctx.auth
   - Verify user has permission
   - Check role-based access control
   - Return unauthorized error if needed

7. **Generate Core Logic**
   - For CREATE: Insert new document with ctx.db.insert()
   - For UPDATE: Get existing doc, validate, update with ctx.db.patch()
   - For DELETE: Get existing doc, verify, delete with ctx.db.delete()
   - For CUSTOM: Implement specific business logic

8. **Add Event Logging** (if includeEvents=true)
   - Determine event type (entity_created, entity_updated, etc.)
   - Insert event record with actorId, targetId, timestamp
   - Include relevant metadata
   - Link to events table

9. **Generate Error Handling**
   - Wrap in try/catch if needed
   - Return typed errors with clear messages
   - Handle common failure cases
   - Provide actionable error information

10. **Add Timestamps**
    - Set createdAt on creation
    - Update updatedAt on modification
    - Use Date.now() for consistency

11. **Return Complete Function**
    - Export mutation with proper typing
    - Include JSDoc comments
    - Format code consistently
    - Add inline comments for complex logic

## Examples

### Example 1: Create Blog Post

**Input:**
```typescript
operationDescription: "Create a new blog post with title, content, and author"
targetTable: "things"
operationType: "create"
includeAuth: true
includeEvents: true
includeValidation: true
```

**Output:**

**functionCode:**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new blog post
 * @param groupId - Organization the post belongs to
 * @param title - Post title
 * @param content - Post content (markdown)
 * @param authorId - ID of the creator entity (author)
 * @returns ID of created blog post
 */
export const createBlogPost = mutation({
  args: {
    groupId: v.id("groups"),
    title: v.string(),
    content: v.string(),
    authorId: v.id("things"),
    tags: v.optional(v.array(v.string())),
    excerpt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Validation: Check author exists and is a creator
    const author = await ctx.db.get(args.authorId);
    if (!author) {
      throw new Error(`Author with ID ${args.authorId} not found`);
    }
    if (author.type !== "creator") {
      throw new Error("Author must be a creator entity");
    }

    // Validation: Check group exists
    const group = await ctx.db.get(args.groupId);
    if (!group) {
      throw new Error(`Group with ID ${args.groupId} not found`);
    }

    // Generate URL-friendly slug
    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Create blog post entity
    const now = Date.now();
    const blogPostId = await ctx.db.insert("things", {
      groupId: args.groupId,
      type: "blog_post",
      name: args.title,
      status: "draft",
      properties: {
        content: args.content,
        excerpt: args.excerpt,
        tags: args.tags || [],
        slug,
        authorId: args.authorId,
        publishDate: null,
        seoTitle: args.title,
        seoDescription: args.excerpt || args.content.substring(0, 160),
      },
      createdAt: now,
      updatedAt: now,
    });

    // Create authored connection
    await ctx.db.insert("connections", {
      groupId: args.groupId,
      sourceId: args.authorId,
      targetId: blogPostId,
      type: "authored",
      metadata: {
        role: "primary_author",
        contributionDate: now,
      },
      createdAt: now,
      updatedAt: now,
    });

    // Log entity_created event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "entity_created",
      actorId: identity.tokenIdentifier,
      targetId: blogPostId,
      timestamp: now,
      metadata: {
        entityType: "blog_post",
        title: args.title,
      },
      createdAt: now,
    });

    return blogPostId;
  },
});
```

**functionName:** `createBlogPost`

**argsSchema:**
```json
{
  "groupId": "Id<'groups'>",
  "title": "string",
  "content": "string",
  "authorId": "Id<'things'>",
  "tags": "string[] (optional)",
  "excerpt": "string (optional)"
}
```

**testCases:**
```json
[
  {
    "name": "Create blog post successfully",
    "args": {
      "groupId": "test_group",
      "title": "My First Post",
      "content": "This is the content",
      "authorId": "test_author"
    },
    "expectedResult": "Returns blog post ID"
  },
  {
    "name": "Fail with invalid author",
    "args": {
      "groupId": "test_group",
      "title": "Test",
      "content": "Content",
      "authorId": "invalid_id"
    },
    "expectedError": "Author with ID invalid_id not found"
  },
  {
    "name": "Fail without authentication",
    "args": { "...": "..." },
    "expectedError": "Authentication required"
  }
]
```

**dependencies:**
```json
[
  "import { mutation } from './_generated/server'",
  "import { v } from 'convex/values'"
]
```

### Example 2: Update Product Inventory

**Input:**
```typescript
operationDescription: "Update product inventory count"
targetTable: "things"
operationType: "update"
includeAuth: true
includeEvents: true
includeValidation: true
```

**Output:**

**functionCode:**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Update product inventory count
 * @param productId - ID of the product to update
 * @param newInventory - New inventory count
 * @returns Updated product
 */
export const updateProductInventory = mutation({
  args: {
    productId: v.id("things"),
    newInventory: v.number(),
  },
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Validation: Check product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error(`Product with ID ${args.productId} not found`);
    }

    // Validation: Verify it's a product entity
    if (product.type !== "product") {
      throw new Error("Entity is not a product");
    }

    // Validation: Inventory must be non-negative
    if (args.newInventory < 0) {
      throw new Error("Inventory cannot be negative");
    }

    // Store old inventory for event logging
    const oldInventory = product.properties.inventory;

    // Update product inventory
    await ctx.db.patch(args.productId, {
      properties: {
        ...product.properties,
        inventory: args.newInventory,
      },
      updatedAt: Date.now(),
    });

    // Log inventory_updated event
    const now = Date.now();
    await ctx.db.insert("events", {
      groupId: product.groupId,
      type: "inventory_updated",
      actorId: identity.tokenIdentifier,
      targetId: args.productId,
      timestamp: now,
      metadata: {
        oldInventory,
        newInventory: args.newInventory,
        change: args.newInventory - oldInventory,
      },
      createdAt: now,
    });

    // Return updated product
    return await ctx.db.get(args.productId);
  },
});
```

## Error Handling

- **Table Not Found:** Check schema, provide list of valid tables
- **Invalid Operation:** Suggest valid operation types (create, update, delete)
- **Missing Required Fields:** List required fields from schema
- **Type Mismatch:** Show expected vs actual types

## Dependencies

- **Tools:** Write (to generate files)
- **Skills:**
  - `skills/convex/read-schema.md` - Load target table schema
  - `skills/ontology/check-dimension.md` - Verify ontology compliance
- **Docs:**
  - `https://docs.convex.dev/functions/mutation-functions` - Convex mutations
  - `/one/knowledge/ontology.md` - Event types and patterns

## Tests

1. **Test Create Mutation:** Generate complete create function
2. **Test Update Mutation:** Generate update with validation
3. **Test Delete Mutation:** Generate soft delete (status change)
4. **Test With Auth:** Verify authentication checks included
5. **Test With Events:** Verify event logging included
6. **Test Without Validation:** Generate minimal mutation
7. **Test Error Cases:** Generate proper error handling

## Performance

- **Generation Time:** < 2 seconds for typical mutation
- **No External Calls:** Pure code generation
- **Template-Based:** Use templates for common patterns

## Lessons Learned

- **Always Validate Inputs:** Even "trusted" inputs should be validated
- **Log Everything:** Events dimension provides invaluable audit trail
- **Check Auth Early:** Fail fast if user not authenticated
- **Use Descriptive Errors:** Error messages should guide user to fix
- **Timestamps Matter:** createdAt and updatedAt are essential
- **Foreign Keys First:** Check referenced entities exist before proceeding

## Version History

- **1.0.0** (2025-10-18): Initial implementation with full ontology support
