# Test-Driven Development Pattern

**Category:** Testing
**Type:** Development Process
**Used for:** Writing tests first, then implementing features

---

## Pattern Overview

Test-driven development (TDD) flow:
1. Quality agent defines user flows
2. Quality agent writes acceptance criteria
3. Quality agent creates technical tests
4. Developer implements to pass tests
5. Problem solver fixes failures

## Test Structure

```typescript
// test/features/course-crud.test.ts
import { describe, it, expect } from "bun:test";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

describe("Feature 2-1: Course CRUD Operations", () => {
  const convex = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL!);

  describe("User Flow: Create Course", () => {
    it("should create a new course with valid data", async () => {
      // Arrange
      const courseData = {
        type: "course",
        name: "Introduction to TypeScript",
        properties: {
          description: "Learn TypeScript basics",
          duration: 120,
          level: "beginner",
        },
      };

      // Act
      const courseId = await convex.mutation(
        api.mutations.entities.create,
        courseData
      );

      // Assert
      expect(courseId).toBeDefined();
      const course = await convex.query(api.queries.entities.getById, {
        id: courseId,
      });
      expect(course?.name).toBe(courseData.name);
      expect(course?.status).toBe("draft");
    });

    it("should reject course without required name", async () => {
      // Arrange
      const invalidData = {
        type: "course",
        properties: {},
      };

      // Act & Assert
      await expect(async () => {
        await convex.mutation(api.mutations.entities.create, invalidData);
      }).toThrow();
    });
  });

  describe("Acceptance Criteria", () => {
    it("AC1: Created course appears in course list", async () => {
      // Test that new course shows up in queries
    });

    it("AC2: Course has correct initial status", async () => {
      // Test that status is "draft"
    });

    it("AC3: Creation event is logged", async () => {
      // Test that entity_created event exists
    });
  });
});
```

## Test Categories

### 1. User Flow Tests
Test from the user's perspective:
- What they want to accomplish
- Step-by-step interactions
- Expected outcomes

### 2. Acceptance Criteria Tests
Specific, measurable requirements:
- "Given X, when Y, then Z"
- Business logic validation
- Edge cases and boundaries

### 3. Technical Tests
Implementation details:
- Unit tests for functions
- Integration tests for flows
- E2E tests for full journeys

## When to Use

- **Always** - Every feature should start with tests
- Before writing any implementation code
- When fixing bugs (write test first, then fix)
- When refactoring (tests prove it still works)

## Best Practices

1. **Write tests first** - Don't write implementation before tests
2. **Test user flows** - Focus on what users want to accomplish
3. **Make tests readable** - Tests are documentation
4. **Test one thing** - Each test should verify one behavior
5. **Use descriptive names** - Test names explain what they verify

## Common Mistakes

❌ **Don't:** Write implementation first, tests later
✅ **Do:** Write tests first, implement to pass them

❌ **Don't:** Test implementation details
✅ **Do:** Test user-facing behavior

❌ **Don't:** Skip edge cases
✅ **Do:** Test error conditions and boundaries

❌ **Don't:** Write huge tests
✅ **Do:** Keep tests focused and isolated

## Related Patterns

- [Quality Agent Pattern](../../things/agents/agent-quality.md)
- [Problem Solver Pattern](../../things/agents/agent-problem-solver.md)
- [Integration Test Pattern](./integration-test-pattern.md)
