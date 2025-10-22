# ONE Platform Test Suite

**Ontology-Based Test Organization**

This test suite follows the **6-dimension ontology** that powers the ONE Platform. Every test is organized by which dimension of reality it tests.

## Directory Structure

```
src/tests/
├── groups/              # Groups dimension tests
│   ├── components.test.tsx
│   ├── pages.test.tsx
│   ├── workflows.test.tsx
│   └── setup.ts
│
├── people/              # People dimension tests (auth, roles, permissions)
│   ├── auth/
│   │   ├── email-password.test.ts
│   │   ├── oauth.test.ts
│   │   ├── magic-link.test.ts
│   │   ├── password-reset.test.ts
│   │   ├── auth.test.ts
│   │   ├── utils.ts
│   │   ├── README.md
│   │   └── STATUS.md
│   ├── useOrganizations.test.tsx
│   └── usePeople.test.tsx
│
├── things/              # Things dimension tests (entities)
│   ├── entities/
│   │   └── ThingService.test.ts
│   └── validation/
│       └── validation.test.ts
│
├── connections/         # Connections dimension tests (placeholder)
│   └── (relationships tests go here)
│
├── events/              # Events dimension tests (placeholder)
│   └── (audit trail, state changes tests go here)
│
├── knowledge/           # Knowledge dimension tests (placeholder)
│   └── (embeddings, search tests go here)
│
├── providers/           # Infrastructure tests
│   ├── ConvexProvider.test.ts
│   ├── DataProvider.test.ts
│   ├── Factory.test.ts
│   └── providers.test.ts
│
├── utils/               # Utility tests
│   └── file-resolver.test.ts
│
└── components/          # Component tests
    └── InstallationFileBrowser.test.tsx
```

## The 6-Dimension Ontology

**Every feature in ONE maps to these 6 dimensions:**

### 1. Groups
Hierarchical containers for collaboration - who belongs where and at what level.

**Test Coverage:**
- Group creation and hierarchies
- Multi-tenancy and data scoping
- Group settings and permissions
- Workflows (create → configure → publish)

**Files:**
- `groups/components.test.tsx` - Group UI components
- `groups/pages.test.tsx` - Group pages and routing
- `groups/workflows.test.tsx` - Complete group lifecycles
- `groups/setup.ts` - Test utilities and mocks

### 2. People
Authorization & governance - who can do what.

**4 Roles:** `platform_owner`, `org_owner`, `org_user`, `customer`

**Test Coverage:**
- Authentication (6 methods: email/password, OAuth, magic links, password reset, email verification, 2FA)
- Role-based access control
- User permissions
- Organization membership

**Files:**
- `people/auth/*.test.ts` - 50+ authentication tests
- `people/useOrganizations.test.tsx` - Organization hooks
- `people/usePeople.test.tsx` - People management hooks

### 3. Things
All nouns in the system - users, agents, content, tokens, courses.

**66+ Entity Types** defined in schema.

**Test Coverage:**
- Entity creation and validation
- Type-specific properties
- Status lifecycle (draft → active → published → archived)
- Entity services (ThingService)

**Files:**
- `things/entities/ThingService.test.ts` - Entity service tests
- `things/validation/validation.test.ts` - Validation logic tests

### 4. Connections
All relationships between entities.

**25+ Connection Types:** owns, authored, holds_tokens, enrolled_in, etc.

**Test Coverage:**
- Relationship creation and queries
- Bidirectional relationships
- Temporal validity (validFrom/validTo)
- Connection metadata

**Status:** Placeholder directory (tests to be added)

### 5. Events
All actions and state changes over time.

**67+ Event Types** including inference and blockchain events.

**Test Coverage:**
- Event logging and retrieval
- Audit trails
- State change tracking
- Event families with protocol metadata

**Status:** Placeholder directory (tests to be added)

### 6. Knowledge
Labels, embeddings, and semantic search.

**Test Coverage:**
- Vector storage for RAG
- Semantic search
- Knowledge linking to things
- Categorization and taxonomy

**Status:** Placeholder directory (tests to be added)

## Infrastructure Tests

### Providers
Tests for data provider abstractions and external service integrations.

**Files:**
- `providers/ConvexProvider.test.ts` - Convex integration tests
- `providers/DataProvider.test.ts` - Data provider interface tests
- `providers/Factory.test.ts` - Provider factory pattern tests
- `providers/providers.test.ts` - Configuration tests

### Utils
Tests for utility functions and helper modules.

**Files:**
- `utils/file-resolver.test.ts` - Installation folder file resolution

### Components
Tests for React UI components.

**Files:**
- `components/InstallationFileBrowser.test.tsx` - File browser component

## Running Tests

**Note:** This project currently does not have vitest configured. To enable testing:

### 1. Install Test Dependencies

```bash
bun add -d vitest @vitest/ui jsdom
```

### 2. Create Vitest Config

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 3. Add Test Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 4. Run Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/tests/people/auth/email-password.test.ts

# Run tests in watch mode
bun test --watch

# Run with UI
bun test:ui

# Run tests for a specific dimension
bun test src/tests/groups/
bun test src/tests/people/
bun test src/tests/things/
```

## Test Coverage Statistics

### Current Coverage

- **Groups:** 3 test files (components, pages, workflows)
- **People:** 7 test files (5 auth + 2 hooks) - **50+ test cases**
- **Things:** 2 test files (entities, validation)
- **Connections:** 0 test files (placeholder)
- **Events:** 0 test files (placeholder)
- **Knowledge:** 0 test files (placeholder)
- **Providers:** 4 test files
- **Utils:** 1 test file
- **Components:** 1 test file

**Total:** 19 test files organized by ontology

### Authentication Test Coverage (People)

**6 Authentication Methods Tested:**

1. ✅ Email & Password (10 test cases)
2. ✅ OAuth (8 test cases - GitHub & Google)
3. ✅ Magic Links (6 test cases - passwordless)
4. ✅ Password Reset (7 test cases - secure recovery)
5. ✅ Email Verification (token expiry)
6. ✅ 2FA/TOTP (setup, enable/disable, backup codes)

**Coverage Areas:**
- Signup flows
- Signin flows
- Token management
- Session handling
- Error handling
- Security (rate limiting, token expiry)
- Edge cases (special characters, case sensitivity)

See `people/auth/README.md` and `people/auth/STATUS.md` for detailed authentication test documentation.

## Test Patterns

### Pattern 1: Service Tests (Effect.ts)

```typescript
// things/entities/ThingService.test.ts
describe("ThingService", () => {
  const MockDataProvider = Layer.succeed(DataProviderService, {
    things: {
      create: (input) => Effect.succeed("thing_123"),
      // ... mock methods
    },
  });

  it("should create thing successfully", async () => {
    const program = ThingService.create(input);
    const result = await Effect.runPromise(
      program.pipe(Effect.provide(MockDataProvider))
    );
    expect(result).toBe("thing_123");
  });
});
```

### Pattern 2: Integration Tests (Full Flow)

```typescript
// people/auth/email-password.test.ts
describe("Sign Up Flow", () => {
  it("should create user with minimum fields", async () => {
    const result = await convex.mutation(api.auth.signUp, {
      email: testEmail,
      password: testPassword,
    });

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("userId");
  });
});
```

### Pattern 3: Component Tests

```typescript
// groups/workflows.test.tsx
describe("Create Group Workflow", () => {
  it("should complete full group creation flow", async () => {
    render(<CreateGroupForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByTestId('input-slug'), {
      target: { value: 'my-group' },
    });
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(onSubmit).toHaveBeenCalledWith({
      slug: 'my-group',
      name: 'My Group',
      type: 'business',
    });
  });
});
```

## Test Utilities

### Authentication Test Utils

Located in `people/auth/utils.ts`:

- `convex` - ConvexHttpClient instance
- `generateTestEmail()` - Create unique test emails
- `generateTestPassword()` - Generate strong passwords
- `TestLogger` - Beautiful test output logging
- `assert()` - Custom assertions
- `assertErrorMessage()` - Error message validation
- `isValidEmail()` - Email format validation
- `isStrongPassword()` - Password strength checking

### Groups Test Utils

Located in `groups/setup.ts`:

- `mockUseQuery()` - Mock Convex query hook
- `mockUseMutation()` - Mock Convex mutation hook
- `createMockGroup()` - Generate mock group data
- `createMockGroupHierarchy()` - Generate hierarchical groups
- `createMockStats()` - Generate mock statistics

## Writing New Tests

### Step 1: Identify Dimension

Ask: Which dimension does this feature belong to?

- **Groups:** Hierarchies, multi-tenancy, data scoping
- **People:** Auth, roles, permissions, governance
- **Things:** Entities, content, products, tokens
- **Connections:** Relationships between entities
- **Events:** Actions, state changes, audit trails
- **Knowledge:** Search, embeddings, categorization

### Step 2: Choose Test Type

- **Unit Test:** Test a single service/function in isolation
- **Integration Test:** Test full flow across multiple layers
- **Component Test:** Test React component behavior

### Step 3: Create Test File

Place test file in appropriate ontology directory:

```
src/tests/{dimension}/{subdomain}/{feature}.test.ts
```

### Step 4: Follow Patterns

Replicate existing test patterns from similar tests in the same dimension.

### Step 5: Update This README

Add new test files to the directory structure and coverage statistics.

## Migration from Old Structure

**Old Structure (Scattered):**
- `web/tests/` - Auth, providers, services, config, groups, utils, and components tests
- `web/src/providers/__tests__/` - DataProvider test

**New Structure (Ontology-Based):**
- `web/src/tests/` - All tests consolidated here
- Organized by 6 dimensions
- Clear separation of concerns
- Easy to find and maintain

**Migration Steps:**
1. ✅ Created ontology-based directory structure
2. ✅ Moved all test files to appropriate dimensions
3. ✅ Fixed import paths
4. ✅ Updated documentation
5. ⏳ Delete old test directories (after verification)
6. ⏳ Add vitest configuration
7. ⏳ Verify all tests pass

## Philosophy

**Why Ontology-Based Organization?**

1. **Clarity:** It's immediately obvious which dimension a test covers
2. **Scalability:** As the codebase grows, tests scale with the ontology
3. **Discoverability:** Finding tests is intuitive (follow the ontology)
4. **Consistency:** Every feature maps to dimensions, so do tests
5. **AI-Friendly:** AI agents understand the ontology structure

**Traditional approach (fails at scale):**
```
tests/
├── unit/
├── integration/
└── e2e/
```

**Ontology-driven approach (scales forever):**
```
tests/
├── groups/
├── people/
├── things/
├── connections/
├── events/
└── knowledge/
```

**Result:** Test organization mirrors the platform architecture. Finding tests is as easy as understanding the feature.

## Backend Connection

**Backend Location:** `/Users/toc/Server/ONE/backend/`

**Convex Deployment:** `https://shocking-falcon-870.convex.cloud`

**Import Pattern:**
```typescript
import { api } from "../../../../../backend/convex/_generated/api";
```

**Auth Tests:** Connect to real backend for integration testing

**Service Tests:** Use mocked DataProvider for unit testing

## Next Steps

### Immediate (Required for Testing)
1. Add vitest to `package.json`
2. Create `vitest.config.ts`
3. Create `src/tests/setup.ts` (global test setup)
4. Run tests to verify all pass
5. Delete old test directories

### Short-term (Expand Coverage)
1. Add connection tests (relationships)
2. Add event tests (audit trails)
3. Add knowledge tests (search, embeddings)
4. Increase component test coverage
5. Add E2E tests with Playwright

### Long-term (Test Infrastructure)
1. Set up CI/CD test automation
2. Add test coverage reporting
3. Add visual regression testing
4. Add performance benchmarks
5. Add mutation testing

## Contributing

When adding new tests:

1. **Follow the ontology** - Place tests in correct dimension
2. **Follow patterns** - Replicate existing test structures
3. **Update this README** - Add new files to directory structure
4. **Write clear descriptions** - Explain what each test verifies
5. **Keep tests focused** - One concept per test
6. **Mock external dependencies** - Use Effect.ts layers for mocking

## Resources

- **Ontology Guide:** `/one/knowledge/ontology.md`
- **Architecture:** `/one/knowledge/architecture.md`
- **Workflow:** `/one/connections/workflow.md`
- **Patterns:** `/one/connections/patterns.md`
- **Files Guide:** `/one/things/files.md`

---

**Remember:** The 6-dimension ontology isn't just for code—it's for tests too. When everything maps to the ontology, everything makes sense.
