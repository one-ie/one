# Create Convex Query

**Category:** convex
**Version:** 1.0.0
**Used By:** agent-backend, agent-builder

## Purpose

Generates optimized Convex query functions with proper indexing, filtering, and pagination.

## Inputs

- **queryDescription** (string): What data to retrieve
- **targetTable** (string): Table to query
- **filters** (array, optional): Filter conditions
- **includePagination** (boolean, optional): Add pagination. Default: false

## Outputs

- **functionCode** (string): Complete query code
- **functionName** (string): Suggested name
- **optimizations** (array): Performance tips

## Example

```typescript
export const listBlogPosts = query({
  args: {
    groupId: v.id("groups"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("things")
      .withIndex("by_group_and_type", (q) => 
        q.eq("groupId", args.groupId).eq("type", "blog_post")
      );
    
    if (args.status) {
      q = q.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    const posts = await q.take(args.limit ?? 20);
    return posts;
  },
});
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
