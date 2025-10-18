# Test Convex Function

**Category:** convex
**Version:** 1.0.0
**Used By:** agent-quality, agent-backend

## Purpose

Tests Convex mutations and queries with mocked context and data.

## Inputs

- **functionPath** (string): Path to function file
- **functionName** (string): Function to test
- **testCases** (array): Test scenarios

## Outputs

- **testCode** (string): Complete test file
- **passed** (number): Tests that passed
- **failed** (number): Tests that failed
- **coverage** (number): Code coverage percentage

## Example

```typescript
import { test, expect } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api";

test("create blog post", async () => {
  const t = convexTest();
  
  const postId = await t.mutation(api.mutations.entities.createBlogPost, {
    groupId: t.toId("groups"),
    title: "Test Post",
    content: "Test content",
    authorId: t.toId("things"),
  });
  
  expect(postId).toBeDefined();
  
  const post = await t.query(api.queries.entities.get, { id: postId });
  expect(post.name).toBe("Test Post");
});
```

## Version History

- **1.0.0** (2025-10-18): Initial implementation
