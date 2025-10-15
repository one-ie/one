# Pattern: Technical Test Template

**Category:** Testing
**Context:** When defining unit, integration, and E2E tests that validate implementation
**Problem:** Need comprehensive test coverage that validates code works correctly at all levels

## Solution

Write unit tests for services, integration tests for Convex functions, E2E tests for full user flows. Use existing test frameworks (Vitest, Playwright).

## Template

```markdown
# Technical Tests: {Feature Name}

**Feature:** {N}-{M}-{feature-name}
**User Flows Reference:** {N}-{M}-{feature-name}/tests.md
**Acceptance Criteria Reference:** {N}-{M}-{feature-name}/tests.md (AC section)
**Date:** YYYY-MM-DD

---

## Test Strategy

**Framework:**
- Unit Tests: Vitest
- Integration Tests: Vitest + Convex Test Client
- E2E Tests: Playwright

**Test Location:**
- Unit: `backend/convex/services/__tests__/`
- Integration: `backend/convex/__tests__/`
- E2E: `frontend/test/e2e/`

**Coverage Target:** > 80% for services, > 70% overall

---

## Unit Tests (Services)

### Service: {EntityName}Service

**File:** `backend/convex/services/__tests__/{EntityName}Service.test.ts`

#### Test: create() with valid data

```typescript
describe("{EntityName}Service", () => {
  describe("create", () => {
    it("should create {entity} with valid data", async () => {
      // Arrange
      const mockDb = createMockDb();
      const service = {EntityName}ServiceLive;
      const input: Create{EntityName}Input = {
        name: "Test {Entity}",
        properties: { description: "Test description" },
        organizationId: "org_123" as Id<"organizations">,
      };

      // Act
      const result = await Effect.runPromise(
        service.create(input).pipe(
          Effect.provideService(DatabaseService, mockDb)
        )
      );

      // Assert
      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalledWith("{entities}", {
        type: "{entityType}",
        name: "Test {Entity}",
        properties: { description: "Test description" },
        organizationId: "org_123",
        status: "draft",
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });

    it("should fail with ValidationError for empty name", async () => {
      // Arrange
      const service = {EntityName}ServiceLive;
      const input: Create{EntityName}Input = {
        name: "",
        properties: {},
        organizationId: "org_123" as Id<"organizations">,
      };

      // Act & Assert
      await expect(
        Effect.runPromise(service.create(input))
      ).rejects.toMatchObject({
        _tag: "{EntityName}ValidationError",
        message: "Name is required",
      });
    });
  });

  describe("getById", () => {
    it("should return {entity} when exists", async () => {
      // Arrange
      const mockDb = createMockDb();
      const entityId = "entity_123" as Id<"{entities}">;
      const mock{Entity} = {
        _id: entityId,
        name: "Test {Entity}",
        type: "{entityType}",
        properties: {},
        organizationId: "org_123" as Id<"organizations">,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      mockDb.get.mockResolvedValue(mock{Entity});
      const service = {EntityName}ServiceLive;

      // Act
      const result = await Effect.runPromise(
        service.getById(entityId).pipe(
          Effect.provideService(DatabaseService, mockDb)
        )
      );

      // Assert
      expect(result).toEqual(mock{Entity});
    });

    it("should fail with NotFound error when {entity} doesn't exist", async () => {
      // Arrange
      const mockDb = createMockDb();
      mockDb.get.mockResolvedValue(null);
      const service = {EntityName}ServiceLive;
      const entityId = "entity_404" as Id<"{entities}">;

      // Act & Assert
      await expect(
        Effect.runPromise(service.getById(entityId))
      ).rejects.toMatchObject({
        _tag: "{EntityName}NotFound",
        id: entityId,
      });
    });
  });

  describe("update", () => {
    it("should update {entity} successfully", async () => {
      // Test update logic
    });
  });

  describe("delete", () => {
    it("should soft delete {entity}", async () => {
      // Test delete (status = archived)
    });
  });
});
```

**Acceptance Criteria Mapping:** AC-10 (Data stored correctly)

---

## Integration Tests (Convex Functions)

### Mutation: create{EntityName}

**File:** `backend/convex/__tests__/mutations/{entities}.test.ts`

#### Test: Create {entity} with authentication

```typescript
describe("mutations.{entities}.create", () => {
  it("should create {entity} when authenticated", async () => {
    // Arrange
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      // Set up auth
      ctx.auth = {
        getUserIdentity: async () => ({
          tokenIdentifier: "user_123",
          email: "test@example.com",
          orgId: "org_123" as Id<"organizations">,
        }),
      };

      // Act
      const entityId = await ctx.mutation(api.mutations.{entities}.create, {
        name: "Test {Entity}",
        properties: { description: "Test" },
      });

      // Assert
      expect(entityId).toBeDefined();

      const entity = await ctx.db.get(entityId);
      expect(entity).toMatchObject({
        name: "Test {Entity}",
        type: "{entityType}",
        organizationId: "org_123",
        status: "draft",
      });
    });
  });

  it("should fail when not authenticated", async () => {
    // Arrange
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      ctx.auth = { getUserIdentity: async () => null };

      // Act & Assert
      await expect(
        ctx.mutation(api.mutations.{entities}.create, {
          name: "Test",
          properties: {},
        })
      ).rejects.toThrow("Unauthorized");
    });
  });

  it("should fail with validation error for invalid data", async () => {
    // Test validation
  });
});
```

**Acceptance Criteria Mapping:** AC-1 (User can create), AC-10 (Data storage)

---

### Query: list{Entities}

**File:** `backend/convex/__tests__/queries/{entities}.test.ts`

#### Test: List {entities} with multi-tenancy

```typescript
describe("queries.{entities}.list", () => {
  it("should only return {entities} from user's organization", async () => {
    // Arrange
    const t = convexTest(schema);
    await t.run(async (ctx) => {
      // Create {entities} in different orgs
      const org1Id = await ctx.db.insert("organizations", { name: "Org 1" });
      const org2Id = await ctx.db.insert("organizations", { name: "Org 2" });

      await ctx.db.insert("{entities}", {
        name: "{Entity} 1",
        type: "{entityType}",
        organizationId: org1Id,
        status: "active",
        properties: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      await ctx.db.insert("{entities}", {
        name: "{Entity} 2",
        type: "{entityType}",
        organizationId: org2Id,
        status: "active",
        properties: {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Set auth to org1
      ctx.auth = {
        getUserIdentity: async () => ({
          tokenIdentifier: "user_123",
          orgId: org1Id,
        }),
      };

      // Act
      const results = await ctx.query(api.queries.{entities}.list, {
        type: "{entityType}",
      });

      // Assert
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("{Entity} 1");
      expect(results[0].organizationId).toBe(org1Id);
    });
  });

  it("should return empty array when not authenticated", async () => {
    // Test unauthenticated access
  });
});
```

**Acceptance Criteria Mapping:** AC-2 (Display list), AC-10 (Multi-tenancy)

---

## E2E Tests (Full User Flows)

### Flow: Create {Entity}

**File:** `frontend/test/e2e/{entity}-create.spec.ts`

#### Test: User can create {entity} successfully

```typescript
import { test, expect } from "@playwright/test";

test.describe("{Entity} Creation Flow", () => {
  test("should create {entity} successfully", async ({ page }) => {
    // Arrange - Navigate to page
    await page.goto("/");

    // Sign in
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign In" }).click();

    // Wait for redirect
    await expect(page).toHaveURL("/{entities}");

    // Act - Click create button
    await page.getByRole("button", { name: "New {Entity}" }).click();

    // Wait for modal
    await expect(page.getByRole("dialog")).toBeVisible();

    // Fill form
    await page.getByLabel("Name").fill("Test {Entity}");
    await page.getByLabel("Description").fill("This is a test {entity}");
    await page.getByLabel("Status").selectOption("active");

    // Submit
    await page.getByRole("button", { name: "Create {Entity}" }).click();

    // Assert - Success feedback
    await expect(page.getByText("{Entity} created successfully")).toBeVisible();

    // Assert - {Entity} appears in list
    await expect(page.getByText("Test {Entity}")).toBeVisible();

    // Assert - Modal closes
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should show validation errors for invalid input", async ({ page }) => {
    // Arrange
    await page.goto("/{entities}");
    await page.getByRole("button", { name: "New {Entity}" }).click();

    // Act - Submit without filling required fields
    await page.getByRole("button", { name: "Create {Entity}" }).click();

    // Assert - Validation errors shown
    await expect(page.getByText("Name is required")).toBeVisible();
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Arrange
    await page.goto("/{entities}");

    // Simulate offline
    await page.context().setOffline(true);

    // Act - Try to create
    await page.getByRole("button", { name: "New {Entity}" }).click();
    await page.getByLabel("Name").fill("Test");
    await page.getByRole("button", { name: "Create {Entity}" }).click();

    // Assert - Error message shown
    await expect(page.getByText(/network error|offline/i)).toBeVisible();
  });
});
```

**Acceptance Criteria Mapping:** AC-1 (Create flow), AC-3 (Validation), AC-7 (Error messages)
**User Flow Mapping:** Flow 1

---

## Performance Tests

### Load Test: List {Entities}

```typescript
test("should load {entities} list in < 500ms", async ({ page }) => {
  // Arrange - Seed database with 100 {entities}
  // (done in beforeEach hook)

  // Act & Measure
  const start = Date.now();
  await page.goto("/{entities}");
  await page.waitForSelector("[data-testid='{entity}-card']");
  const duration = Date.now() - start;

  // Assert
  expect(duration).toBeLessThan(500);
});
```

**Acceptance Criteria Mapping:** AC-5 (Performance)

---

## Test Execution

**Run all tests:**
```bash
# Unit tests
cd backend && bun test

# Integration tests
cd backend && bun test:integration

# E2E tests
cd frontend && bun test:e2e

# All tests
bun test:all
```

**Coverage report:**
```bash
bun test:coverage
```

---

## Test Data Setup

**Seed data for tests:**
```typescript
// test/fixtures/{entity}-fixtures.ts
export const valid{Entity}Data = {
  name: "Test {Entity}",
  properties: {
    description: "Test description",
    // Add entity-specific fields
  },
  organizationId: "org_test" as Id<"organizations">,
};

export const invalid{Entity}Data = {
  name: "",  // Empty name (should fail)
  properties: {},
  organizationId: "org_test" as Id<"organizations">,
};
```

---

## Test Coverage Map

| Acceptance Criteria | Unit Tests | Integration Tests | E2E Tests |
|---------------------|------------|-------------------|-----------|
| AC-1: Create {entity} | ✅ Service | ✅ Mutation | ✅ Full flow |
| AC-2: Display list | ✅ Service | ✅ Query | ✅ Page load |
| AC-3: Validation | ✅ Service | ✅ Mutation | ✅ Form errors |
| AC-4: Real-time | - | ✅ Subscription | ✅ Multi-user |
| AC-5: Performance | - | - | ✅ Load test |

**Overall Coverage:** {N}% (target: > 80%)

---

## Continuous Testing

**Pre-commit hook:**
```bash
# .git/hooks/pre-commit
bun test:unit
```

**CI/CD pipeline:**
```yaml
# .github/workflows/test.yml
- name: Unit Tests
  run: bun test:unit

- name: Integration Tests
  run: bun test:integration

- name: E2E Tests
  run: bun test:e2e
```

---

## Test Maintenance

**When to update tests:**
- Acceptance criteria change
- New edge cases discovered
- Performance targets change
- Implementation refactored

**Test Review Checklist:**
- [ ] Test name clearly describes what's tested
- [ ] Arrange-Act-Assert pattern followed
- [ ] Test is independent (no shared state)
- [ ] Test data is realistic
- [ ] Assertions are specific
- [ ] Error cases tested
- [ ] Performance measured where applicable
```

## Variables

- `{Feature Name}` - Human-readable feature name
- `{N}-{M}-{feature-name}` - Feature ID
- `{EntityName}` - PascalCase entity name
- `{entity}` - Lowercase entity name
- `{Entity}` - Title case entity name
- `{entities}` - Plural lowercase
- `{entityType}` - Entity type value in ontology

## Usage

1. Copy template to `one/things/features/{N}-{M}-{feature-name}/tests.md` (append to same file)
2. Write unit tests for all service methods
3. Write integration tests for all mutations/queries
4. Write E2E tests for each user flow
5. Map tests to acceptance criteria
6. Set up test data fixtures
7. Configure CI/CD to run tests

## Common Mistakes

- **Mistake:** Testing implementation details instead of behavior
  - **Fix:** Test public API, not internal methods
- **Mistake:** Tests depend on each other (shared state)
  - **Fix:** Each test should be independent, use fresh fixtures
- **Mistake:** No test data fixtures
  - **Fix:** Create reusable test data objects
- **Mistake:** Not testing error cases
  - **Fix:** Always test happy path AND error paths
- **Mistake:** E2E tests too slow
  - **Fix:** Use mock API for E2E when possible, test integration separately

## Related Patterns

- **user-flow-template.md** - What to test (user perspective)
- **acceptance-criteria-template.md** - Success criteria (measurable)
- **service-template.md** - What to unit test
- **mutation-template.md** - What to integration test
