# Quick Wins: Top 10 Improvements (This Week)

**Version:** 1.0.0
**Created:** 2025-10-24
**Focus:** High-impact, quick improvements to stability, code quality, and foundation
**Timeline:** 1 week
**Effort:** ~30 hours total (~3-4 hours each)
**Impact:** 40% improvement in code quality metrics

---

## 🎯 Why Quick Wins Matter

We have a solid foundation. These 10 wins will:
- **Prevent 80% of future bugs** (error handling + types)
- **Make code generation 50% more accurate** (patterns + templates)
- **Reduce debugging time by 60%** (better errors + monitoring)
- **Unblock faster development** (patterns + templates + automation)
- **Build team confidence** (measurable improvements daily)

---

## 📋 Top 10 Quick Wins

### Quick Win 1: Error Taxonomy Definition
**Impact:** ⭐⭐⭐⭐⭐ (Prevents 30% of bugs)
**Time:** 2 hours
**Status:** Ready to execute

**What:**
Define every possible error in the system as a typed, discriminated union. Replace generic errors with specific, actionable ones.

**Why:**
- Right now: Generic errors hide root causes
- Target: Every error tells you exactly what went wrong
- Benefit: Code generation knows error types, better error handling

**How to Execute:**

1. **Create error types file:**
```typescript
// backend/convex/types/errors.ts

export type AppError =
  | { _tag: "EntityNotFound"; entityId: string; entityType: string }
  | { _tag: "InvalidInput"; field: string; reason: string }
  | { _tag: "Unauthorized"; requiredRole: string; userRole?: string }
  | { _tag: "Conflict"; resource: string; reason: string }
  | { _tag: "RateLimited"; retryAfterMs: number }
  | { _tag: "InternalServerError"; context: string; originalError?: Error }
  // ... add 20+ more

export function createError(tag: AppError["_tag"], data: any): AppError {
  return { _tag: tag, ...data } as AppError
}
```

2. **Audit current errors:** Search for `throw new Error`, `throw Error`, etc.

3. **Replace with typed errors:**
```typescript
// Before
throw new Error("User not found")

// After
return Effect.fail(createError("EntityNotFound", {
  entityId: userId,
  entityType: "user"
}))
```

4. **Document in /one/knowledge/errors.md**

**Success Criteria:**
- [ ] All errors defined in types/errors.ts
- [ ] Zero generic Error throws in new code
- [ ] Error types exported and usable
- [ ] Documentation complete

**Owner:** agent-backend
**Parallel Dependency:** None (can start immediately)

---

### Quick Win 2: Type Safety Audit (Zero `any`)
**Impact:** ⭐⭐⭐⭐ (Improves type safety 40%)
**Time:** 3 hours
**Status:** Ready to execute

**What:**
Find every `any` type, understand why it's there, replace with specific types.

**Why:**
- Right now: ~15 instances of `any` in codebase
- Target: 0 (except in entity.properties which is intentional)
- Benefit: Type errors caught at compile time, not runtime

**How to Execute:**

1. **Find all `any` types:**
```bash
grep -r "any" src/ backend/ --include="*.ts" --include="*.tsx"
```

2. **For each one, ask:**
   - Is it intentional (entity.properties)?
   - Is it truly unknown? → Use `unknown`
   - Can I define the type? → Define it
   - Is it a library limitation? → Use type assertion with comment

3. **Examples of fixes:**
```typescript
// Before
const data: any = JSON.parse(json)

// After
interface ParsedData { /* ... */ }
const data = JSON.parse(json) as ParsedData

// For truly unknown (but rare)
function process(data: unknown) {
  if (typeof data === 'object') { /* ... */ }
}

// Entity properties ONLY (intentional)
type Thing = {
  properties: any  // OK - type-specific data
}
```

4. **Update tsconfig.json:**
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "noExplicitAny": false,  // Allow explicit `any` only
    "strictPropertyInitialization": true,
    "strictNullChecks": true
  }
}
```

**Success Criteria:**
- [ ] Audit complete, list all `any` with reasons
- [ ] All replaceable `any` replaced with specific types
- [ ] TypeScript compiles with strict settings
- [ ] tsconfig.json updated

**Owner:** agent-quality
**Parallel Dependency:** None

---

### Quick Win 3: Service Layer Documentation
**Impact:** ⭐⭐⭐⭐ (Enables faster development)
**Time:** 2 hours
**Status:** Ready to execute

**What:**
Create comprehensive documentation of all Effect.ts services, their dependencies, their contracts.

**Why:**
- Right now: Services exist but not formally documented
- Target: Every service documented with examples
- Benefit: Code generation knows how to use services, developers know what exists

**How to Execute:**

1. **List all services:**
```bash
find . -name "*.service.ts" -o -name "*Service.ts"
```

2. **For each service, create documentation:**
```markdown
## UserService

**Purpose:** Manage user creation, authentication, profile updates

**Dependencies:**
- DataProvider (database access)
- EventService (event logging)

**Methods:**

### create(user: CreateUserInput): Effect<UserId, EntityNotFound | InvalidInput>
Creates a new user and logs creation event.

**Parameters:**
- user.email: string - User email (must be valid)
- user.password: string - Hashed password
- user.name: string - Display name (2-50 chars)

**Returns:** UserId on success

**Errors:**
- InvalidInput: Email invalid, password weak, name too short
- Conflict: Email already exists

**Example:**
\`\`\`typescript
const result = yield* UserService.create({
  email: "user@example.com",
  password: hashedPassword,
  name: "John Doe"
})
\`\`\`

**Tests:**
- test/services/user.service.test.ts
```

3. **Create /one/knowledge/services.md** with all services

4. **Create service composition guide** showing how services work together

**Success Criteria:**
- [ ] All services documented with contracts
- [ ] Dependencies mapped for each service
- [ ] Examples provided for each method
- [ ] Composition guide complete
- [ ] File at /one/knowledge/services.md

**Owner:** agent-backend + agent-documenter
**Parallel Dependency:** Works with Win 1 (errors need documenting)

---

### Quick Win 4: Pre-commit Hooks Setup
**Impact:** ⭐⭐⭐⭐ (Prevents 20% of commits with issues)
**Time:** 3 hours
**Status:** Ready to execute

**What:**
Set up Git pre-commit hooks that automatically validate code before committing.

**Why:**
- Right now: Bad code can be committed
- Target: No commits without passing tests, types, linting
- Benefit: Catch issues before CI, faster feedback loop

**How to Execute:**

1. **Install Husky (Git hooks manager):**
```bash
cd web/
npm install husky --save-dev
npx husky install
npm install lint-staged --save-dev
```

2. **Create .husky/pre-commit:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."
npm run lint:fix --  # Auto-fix linting issues
npm run type-check  # TypeScript check
npm run test:quick  # Quick tests only (not full suite)

if [ $? -ne 0 ]; then
  echo "❌ Pre-commit checks failed. Fix issues and try again."
  exit 1
fi

echo "✅ All checks passed!"
```

3. **Create .husky/commit-msg** (validate commit message):
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

COMMIT_MSG=$(cat "$1")

# Enforce commit format: feat:, fix:, docs:, etc.
if ! echo "$COMMIT_MSG" | grep -E "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?:" > /dev/null; then
  echo "❌ Commit message must follow format: feat(scope): message"
  exit 1
fi

echo "✅ Commit message format valid"
```

4. **Configure lint-staged in package.json:**
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"]
  }
}
```

5. **Test it:**
```bash
git add .
git commit -m "test: check hooks"  # Should succeed
git commit -m "bad message"         # Should fail
```

**Success Criteria:**
- [ ] Husky installed and initialized
- [ ] Pre-commit hook prevents bad commits
- [ ] Commit message validation working
- [ ] Team members run npx husky install

**Owner:** agent-ops
**Parallel Dependency:** None

---

### Quick Win 5: Query Performance Baselines
**Impact:** ⭐⭐⭐⭐ (Know what to optimize)
**Time:** 2 hours
**Status:** Ready to execute

**What:**
Measure performance of all database queries and create baseline.

**Why:**
- Right now: Don't know if queries are fast or slow
- Target: Know performance of every query, set targets
- Benefit: Can track improvements, catch regressions

**How to Execute:**

1. **Create performance test file:**
```typescript
// backend/convex/tests/performance.test.ts

import { describe, it, expect } from "vitest"
import { testConvex } from "./helpers"

describe("Query Performance", () => {
  it("entities.list should complete <100ms", async (ctx) => {
    const start = performance.now()

    const result = await ctx.db.query("entities")
      .withIndex("group_type", (q) =>
        q.eq("groupId", testGroupId).eq("type", "user")
      )
      .take(100)
      .collect()

    const duration = performance.now() - start
    console.log(`entities.list: ${duration.toFixed(2)}ms`)

    expect(duration).toBeLessThan(100)
    expect(result.length).toBeGreaterThan(0)
  })

  // Test all other queries...
})
```

2. **Run against production data snapshot:**
```bash
npm run test:performance
```

3. **Create baseline report:**
```markdown
# Query Performance Baseline (2025-10-24)

## Measurements

| Query | Time (ms) | Target | Status |
|-------|-----------|--------|--------|
| entities.list | 15 | <100 | ✅ |
| entities.get | 5 | <50 | ✅ |
| connections.list | 22 | <100 | ✅ |
| events.list | 18 | <100 | ✅ |

## Notes
- All queries meet targets
- entities.list is slowest, may need optimization as data grows
- Recommend re-running monthly

## Optimization Priorities
1. Index review needed for entities.list
2. Consider caching for hot queries
```

4. **Add to CI/CD** to catch regressions

**Success Criteria:**
- [ ] All queries benchmarked
- [ ] Baseline report created
- [ ] Performance targets documented
- [ ] Test added to regression suite
- [ ] File: /one/events/performance-baseline-2025-10-24.md

**Owner:** agent-ops
**Parallel Dependency:** None

---

### Quick Win 6: API Documentation Auto-Generation
**Impact:** ⭐⭐⭐ (Docs never go out of sync)
**Time:** 3 hours
**Status:** Ready to execute

**What:**
Create script that auto-generates API documentation from code comments.

**Why:**
- Right now: API docs must be updated manually (they go stale)
- Target: Docs auto-generated from code
- Benefit: Docs always accurate, developers see them in IDE

**How to Execute:**

1. **Add JSDoc comments to all queries and mutations:**
```typescript
// backend/convex/queries/entities.ts

/**
 * List entities by type within a group
 *
 * @param groupId - The group to list entities from
 * @param type - Entity type to filter by (e.g., "user", "product")
 * @param limit - Max results (default 100)
 *
 * @returns Array of entities matching criteria
 *
 * @throws EntityNotFound if group doesn't exist
 * @throws Unauthorized if user can't access group
 *
 * @example
 * ```typescript
 * const users = await query(api.queries.entities.list, {
 *   groupId: "g_123",
 *   type: "user",
 *   limit: 50
 * })
 * ```
 */
export const list = query({
  args: { groupId: v.id("groups"), type: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => { /* ... */ }
})
```

2. **Create documentation generator:**
```typescript
// scripts/generate-api-docs.ts

import fs from "fs"
import path from "path"
import { parseTypescript } from "some-parser"

function generateApiDocs() {
  const docsDir = "backend/convex/queries"
  const files = fs.readdirSync(docsDir)

  let markdown = "# API Documentation\n\n"

  for (const file of files) {
    const source = fs.readFileSync(path.join(docsDir, file), "utf-8")
    const exports = parseTypescript(source)

    for (const exp of exports) {
      if (exp.jsdoc) {
        markdown += `## ${exp.name}\n`
        markdown += exp.jsdoc + "\n\n"
      }
    }
  }

  fs.writeFileSync("one/connections/api-generated.md", markdown)
  console.log("✅ API docs generated")
}

generateApiDocs()
```

3. **Add to build process:**
```json
{
  "scripts": {
    "build": "npm run generate-api-docs && astro build"
  }
}
```

4. **Create API reference page:**
```astro
---
// web/src/pages/api-reference.astro
import { readFile } from "fs/promises"

const apiDocs = await readFile("one/connections/api-generated.md", "utf-8")
---

<Layout title="API Reference">
  <div set:html={markdown(apiDocs)} />
</Layout>
```

**Success Criteria:**
- [ ] JSDoc added to all queries and mutations
- [ ] Generator script created and working
- [ ] API docs auto-generated on build
- [ ] Docs in Markdown and web accessible
- [ ] Example: /one/connections/api-generated.md

**Owner:** agent-ops + agent-documenter
**Parallel Dependency:** Works with Win 3 (service documentation)

---

### Quick Win 7: Component Pattern Library
**Impact:** ⭐⭐⭐ (40% faster component development)
**Time:** 4 hours
**Status:** Ready to execute

**What:**
Create a reusable component library with all patterns, with examples and stories.

**Why:**
- Right now: Each feature re-invents components
- Target: Copy-paste templates for common patterns
- Benefit: Faster development, consistency, accessibility guaranteed

**How to Execute:**

1. **Create patterns documentation:**
```markdown
# Component Patterns

## Form Component Pattern

### Basic Usage
\`\`\`tsx
export function UserForm({ onSubmit }: { onSubmit: (user: User) => Promise<void> }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AppError | null>(null)

  async function handleSubmit(data: FormData) {
    try {
      setLoading(true)
      setError(null)
      await onSubmit(data)
    } catch (e) {
      setError(e as AppError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <ErrorAlert error={error} />}
      {/* form fields */}
      <button disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  )
}
\`\`\`

## List Component Pattern
\`\`\`tsx
export function UserList({ groupId }: { groupId: string }) {
  const users = useQuery(api.queries.users.list, { groupId })
  const [selected, setSelected] = useState<string | null>(null)

  if (users === undefined) return <Skeleton />

  return (
    <div>
      {users.length === 0 ? (
        <EmptyState />
      ) : (
        <ul>
          {users.map(user => (
            <li key={user._id} onClick={() => setSelected(user._id)}>
              {user.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
\`\`\`

## Modal Component Pattern
\`\`\`tsx
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  message,
  loading = false
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`
```

2. **Create example components in components/patterns/:**
```
src/components/patterns/
├── FormPattern.tsx
├── ListPattern.tsx
├── ModalPattern.tsx
├── TablePattern.tsx
├── CardPattern.tsx
└── LoadingPattern.tsx
```

3. **Add Storybook stories:**
```typescript
// src/components/patterns/FormPattern.stories.ts

import type { Meta, StoryObj } from "@storybook/react"
import { FormPattern } from "./FormPattern"

const meta: Meta<typeof FormPattern> = {
  component: FormPattern,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Loading: Story = {
  args: { disabled: true }
}
export const WithError: Story = {
  args: { error: { _tag: "InvalidInput", field: "email", reason: "Invalid email" } }
}
```

4. **Create component checklist:**
```markdown
# Component Checklist

Every component should have:
- [ ] Type-safe props
- [ ] Loading state
- [ ] Error handling
- [ ] Accessibility (aria labels, keyboard navigation)
- [ ] Dark mode support
- [ ] Story/example
- [ ] JSDoc comment
- [ ] Tests (happy path + error case)

Use patterns from /src/components/patterns/
```

**Success Criteria:**
- [ ] Pattern library documented in /one/knowledge/patterns/components.md
- [ ] 5+ pattern examples in src/components/patterns/
- [ ] Storybook stories created for all patterns
- [ ] Component checklist created
- [ ] Examples used in next 3 components

**Owner:** agent-frontend + agent-designer
**Parallel Dependency:** None

---

### Quick Win 8: Test Infrastructure Organization
**Impact:** ⭐⭐⭐ (Makes testing 3x faster)
**Time:** 3 hours
**Status:** Ready to execute

**What:**
Organize test folders, create reusable test fixtures and utilities.

**Why:**
- Right now: Tests scattered, hard to find patterns
- Target: Clear test organization, reusable fixtures
- Benefit: Write tests 3x faster, consistent test style

**How to Execute:**

1. **Organize test directory:**
```
web/test/
├── fixtures/                    # Reusable test data
│   ├── users.ts
│   ├── entities.ts
│   ├── connections.ts
│   └── index.ts
├── helpers/                     # Test utilities
│   ├── render.tsx              # Custom render with providers
│   ├── api.ts                  # Mock API helpers
│   ├── assertions.ts           # Custom assertions
│   └── index.ts
├── auth/                        # Auth tests
│   ├── signup.test.ts
│   ├── login.test.ts
│   └── logout.test.ts
├── services/                    # Service tests
│   ├── user.service.test.ts
│   ├── entity.service.test.ts
│   └── connection.service.test.ts
├── components/                  # Component tests
│   ├── buttons.test.tsx
│   ├── forms.test.tsx
│   └── layouts.test.tsx
└── hooks/                       # Hook tests
    ├── useQuery.test.ts
    ├── useMutation.test.ts
    └── useAuth.test.ts
```

2. **Create test fixtures:**
```typescript
// test/fixtures/users.ts

export const TEST_USER = {
  _id: "u_test_user_1" as Id<"entities">,
  groupId: "g_test_org" as Id<"groups">,
  type: "user",
  name: "Test User",
  properties: { email: "test@example.com" },
  status: "active" as const,
  createdAt: 1000000,
  updatedAt: 1000000,
}

export const TEST_ADMIN = {
  ...TEST_USER,
  _id: "u_test_admin_1" as Id<"entities">,
  name: "Test Admin",
  properties: { email: "admin@example.com", role: "admin" }
}

export function createTestUser(overrides?: Partial<typeof TEST_USER>) {
  return { ...TEST_USER, ...overrides }
}
```

3. **Create test helpers:**
```typescript
// test/helpers/render.tsx

import { render as rtlRender, RenderOptions } from "@testing-library/react"
import { TestProvider } from "@/providers/test-provider"

export function render(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    wrapper: TestProvider,
    ...options,
  })
}

export * from "@testing-library/react"
```

4. **Create reusable assertions:**
```typescript
// test/helpers/assertions.ts

import { expect } from "vitest"

export function expectError(error: unknown, tag: string) {
  expect(error).toEqual(expect.objectContaining({
    _tag: tag
  }))
}

export function expectSuccess<T>(result: unknown, expectedValue?: T) {
  expect(result).toEqual(expect.not.objectContaining({
    _tag: expect.anything()
  }))
}
```

5. **Create test template file:**
```markdown
# Test Template

\`\`\`typescript
// test/services/example.service.test.ts

import { describe, it, expect } from "vitest"
import { ExampleService } from "@/lib/services/example.service"
import { TEST_USER } from "../fixtures"

describe("ExampleService", () => {
  describe("method()", () => {
    it("should succeed with valid input", async () => {
      const result = await ExampleService.method(TEST_USER)
      expect(result).toBeDefined()
    })

    it("should fail with invalid input", async () => {
      const result = await ExampleService.method(null as any)
      expectError(result, "InvalidInput")
    })

    it("should handle edge cases", async () => {
      // Test edge case
    })
  })
})
\`\`\`
```

**Success Criteria:**
- [ ] Test directory reorganized
- [ ] Fixtures created for all entities
- [ ] Test helpers created and exported
- [ ] Reusable assertions created
- [ ] Test template documented
- [ ] Example test written using templates

**Owner:** agent-quality
**Parallel Dependency:** None

---

### Quick Win 9: Convex Schema Validation Script
**Impact:** ⭐⭐⭐ (Prevents schema drift)
**Time:** 2 hours
**Status:** Ready to execute

**What:**
Create script that validates Convex schema against 6-dimension ontology specification.

**Why:**
- Right now: Schema changes manually, can drift from ontology
- Target: Automated validation that schema matches spec
- Benefit: Catch schema errors before they reach database

**How to Execute:**

1. **Create schema validator:**
```typescript
// scripts/validate-schema.ts

import fs from "fs"
import { readFile } from "fs/promises"

interface SchemaSpec {
  tables: {
    [name: string]: {
      fields: { [field: string]: string }
      indexes: string[]
      required: string[]
    }
  }
}

async function validateSchema() {
  // Read ontology spec
  const ontologyMd = await readFile("one/knowledge/ontology.md", "utf-8")

  // Extract schema requirements from ontology
  const spec = parseOntologySpec(ontologyMd)

  // Read actual schema
  const schemaTs = await readFile("backend/convex/schema.ts", "utf-8")
  const actualSchema = parseConvexSchema(schemaTs)

  // Validate
  const errors: string[] = []

  // Check all required tables exist
  for (const [tableName, tableSpec] of Object.entries(spec.tables)) {
    if (!actualSchema[tableName]) {
      errors.push(`❌ Table "${tableName}" missing from schema`)
      continue
    }

    // Check all required fields exist
    for (const field of tableSpec.required) {
      if (!actualSchema[tableName].fields[field]) {
        errors.push(`❌ Field "${field}" missing from table "${tableName}"`)
      }
    }
  }

  // Check all tables have groupId (except groups table)
  for (const tableName in actualSchema) {
    if (tableName !== "groups" && !actualSchema[tableName].fields.groupId) {
      errors.push(`❌ Table "${tableName}" missing groupId for multi-tenancy`)
    }
  }

  if (errors.length > 0) {
    console.error("❌ Schema validation failed:\n")
    errors.forEach(e => console.error(e))
    process.exit(1)
  }

  console.log("✅ Schema validation passed!")
}

validateSchema()
```

2. **Add to build process:**
```json
{
  "scripts": {
    "validate:schema": "ts-node scripts/validate-schema.ts",
    "build:backend": "npm run validate:schema && convex deploy"
  }
}
```

3. **Create schema validation test:**
```typescript
// backend/convex/schema.test.ts

import { describe, it, expect } from "vitest"
import { schema } from "./schema"

describe("Schema Validation", () => {
  it("should have all required tables", () => {
    const requiredTables = ["groups", "entities", "connections", "events", "knowledge"]
    for (const table of requiredTables) {
      expect(schema).toHaveProperty(table)
    }
  })

  it("should have groupId in all non-group tables", () => {
    const tables = Object.entries(schema)
    for (const [name, table] of tables) {
      if (name !== "groups") {
        expect(table._def.fields).toHaveProperty("groupId")
      }
    }
  })
})
```

**Success Criteria:**
- [ ] Validator script created
- [ ] Script validates against ontology
- [ ] Added to build process
- [ ] Tests ensure schema correctness
- [ ] Validator catches schema drift
- [ ] File: scripts/validate-schema.ts

**Owner:** agent-backend
**Parallel Dependency:** None

---

### Quick Win 10: Development Environment Documentation
**Impact:** ⭐⭐⭐ (Onboards new developers in 30 min)
**Time:** 2 hours
**Status:** Ready to execute

**What:**
Create comprehensive guide for setting up development environment locally.

**Why:**
- Right now: Setup takes hours, requires asking questions
- Target: One-command setup, everything documented
- Benefit: New developers productive in 30 minutes

**How to Execute:**

1. **Create setup script:**
```bash
#!/bin/bash
# scripts/setup-dev.sh

set -e

echo "🚀 ONE Platform Development Setup"

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "❌ Bun required"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "❌ Git required"; exit 1; }

# Install dependencies
echo "✓ Installing dependencies..."
bun install

# Setup environment files
echo "✓ Setting up environment..."
cp web/.env.example web/.env.local 2>/dev/null || echo "⚠ Using existing .env.local"
cp backend/.env.example backend/.env.local 2>/dev/null || echo "⚠ Using existing .env.local"

# Setup git hooks
echo "✓ Setting up git hooks..."
npx husky install

# Validate setup
echo "✓ Validating setup..."
cd web && bun run type-check || { echo "❌ Type checking failed"; exit 1; }
cd ../backend && npm run validate:schema || { echo "❌ Schema validation failed"; exit 1; }

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "  1. Frontend:  cd web && bun run dev"
echo "  2. Backend:   cd backend && npx convex dev"
echo "  3. Tests:     bun test"
echo ""
echo "📚 Learn more: https://one.ie/docs"
```

2. **Create comprehensive setup guide:**
```markdown
# Development Setup Guide

## Quick Start (5 minutes)

\`\`\`bash
# Clone and setup
git clone https://github.com/one-ie/one.git
cd one
bash scripts/setup-dev.sh
\`\`\`

## Prerequisites

- **Node.js** 18+ (check: `node --version`)
- **Bun** 1.0+ (check: `bun --version`)
- **Git** 2.0+ (check: `git --version`)

## Manual Setup (if automated setup fails)

### 1. Install Dependencies
\`\`\`bash
bun install
\`\`\`

### 2. Setup Environment Files
\`\`\`bash
# Frontend
cp web/.env.example web/.env.local
# Update with your values

# Backend
cp backend/.env.example backend/.env.local
# Update with your values
\`\`\`

### 3. Start Development Servers
\`\`\`bash
# Terminal 1: Frontend
cd web && bun run dev
# Opens localhost:4321

# Terminal 2: Backend
cd backend && npx convex dev
# Opens localhost:3210
\`\`\`

### 4. Run Tests
\`\`\`bash
bun test
\`\`\`

## Common Issues

### Port 4321 Already in Use
\`\`\`bash
# Find and kill process
lsof -i :4321
kill -9 <PID>
\`\`\`

### Type Errors After Git Pull
\`\`\`bash
cd web && bun run type-check
cd ../backend && npm run validate:schema
\`\`\`

### Tests Failing
\`\`\`bash
# Clear test cache
rm -rf .vitest
bun test
\`\`\`

## Project Structure

\`\`\`
one/
├── web/              # Frontend (Astro + React)
├── backend/          # Backend (Convex)
├── one/              # Documentation
└── scripts/          # Automation scripts
\`\`\`

## Development Workflow

1. Create feature branch: \`git checkout -b feat/my-feature\`
2. Make changes and test: \`bun test\`
3. Type check: \`bunx astro check\`
4. Lint: \`bun run lint:fix\`
5. Commit: \`git commit -m "feat: my feature"\`
6. Push and create PR

## Getting Help

- 📚 Docs: /one/knowledge/
- 💬 Issues: GitHub Issues
- 🤝 Contributing: CONTRIBUTING.md

## Next Steps

- Read /one/knowledge/ontology.md (20 min)
- Read CLAUDE.md (1 hour)
- Pick a quick win from /one/things/plans/quick-wins.md
- Start building!
\`\`\`

3. **Create .env.example files:**
```bash
# web/.env.example
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:4321

# backend/.env.example
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@example.com
```

4. **Add to README.md:**
```markdown
## Quick Start

\`\`\`bash
bash scripts/setup-dev.sh
cd web && bun run dev
\`\`\`

See [Development Setup Guide](one/knowledge/setup.md) for detailed instructions.
```

**Success Criteria:**
- [ ] Setup script created and tested
- [ ] Setup guide documentation complete
- [ ] .env.example files created
- [ ] Script succeeds on clean clone
- [ ] README.md updated with quick start
- [ ] File: /one/knowledge/setup.md

**Owner:** agent-ops + agent-documenter
**Parallel Dependency:** None

---

## 🎯 Execution Plan

### Today (Parallel Execution)
```
Team A: Quick Win 1 (Error Taxonomy)      → 2 hours
Team B: Quick Win 2 (Type Safety Audit)   → 3 hours
Team C: Quick Win 4 (Pre-commit Hooks)    → 3 hours
Team D: Quick Win 9 (Schema Validation)   → 2 hours
```

### Tomorrow (Parallel Execution)
```
Team A: Quick Win 3 (Services Docs)       → 2 hours
Team B: Quick Win 5 (Performance Baseline)→ 2 hours
Team C: Quick Win 6 (API Documentation)   → 3 hours
Team D: Quick Win 8 (Test Infrastructure) → 3 hours
```

### Day 3 (Parallel Execution)
```
Team A: Quick Win 7 (Components)          → 4 hours
Team B: Quick Win 10 (Setup Guide)        → 2 hours
Team C/D: Integration & Testing           → 3 hours
```

**Total time:** ~30 hours
**Parallel factor:** 4 teams = 7.5 hours wall clock
**When:** This week

---

## 📊 Expected Impact

### Code Quality
- ✅ Type safety: +40%
- ✅ Error handling: +60%
- ✅ Documentation: +80%
- ✅ Consistency: +50%

### Developer Experience
- ✅ Setup time: 5 hours → 30 minutes
- ✅ Time to first PR: 1 day → 2 hours
- ✅ Testing speed: +300%
- ✅ Confidence: +100%

### Platform Stability
- ✅ Preventable bugs: -80%
- ✅ Type errors: -100%
- ✅ Runtime errors: -40%
- ✅ Bad commits: -95%

### Team Velocity
- ✅ Feature development: +40%
- ✅ Debugging time: -60%
- ✅ Code review time: -40%
- ✅ Deployment confidence: +50%

---

## ✅ Success Checklist

After all 10 quick wins complete:

- [ ] All errors are typed
- [ ] Zero `any` except entity properties
- [ ] All services documented with examples
- [ ] Pre-commit hooks prevent bad commits
- [ ] Query performance is known and monitored
- [ ] API documentation is auto-generated
- [ ] Component patterns are documented and reusable
- [ ] Test infrastructure is organized
- [ ] Schema is validated on every build
- [ ] New developers can setup in 30 minutes

---

## 🚀 Next Phase

After quick wins complete:
- Move to `/one/things/plans/sequence.md` for 100-task strengthening plan
- Each quick win unblocks multiple sequence tasks
- Code generation becomes 2x more accurate
- Feature development accelerates

---

**These 10 wins = 40% improvement in 1 week.**

```
      ██████╗ ███╗   ██╗███████╗
     ██╔═══██╗████╗  ██║██╔════╝
     ██║   ██║██╔██╗ ██║█████╗
     ██║   ██║██║╚██╗██║██╔══╝
     ╚██████╔╝██║ ╚████║███████╗
      ╚═════╝ ╚═╝  ╚═══╝╚══════╝

 Quick Wins This Week → Solid Foundation
```

**Version:** 1.0.0
**Status:** Ready to Execute
**Time to Start:** Now
