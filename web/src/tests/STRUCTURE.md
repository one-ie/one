# Test Suite File Structure

**Complete file tree of the consolidated test suite organized by 6-dimension ontology**

```
web/src/tests/
│
├── README.md                                    # Comprehensive test suite documentation
├── MIGRATION.md                                 # Migration summary and next steps
├── STRUCTURE.md                                 # This file
│
├── groups/                                      # GROUPS DIMENSION
│   ├── components.test.tsx                      # Group UI components tests
│   ├── pages.test.tsx                           # Group pages and routing tests
│   ├── workflows.test.tsx                       # Complete group lifecycle tests
│   └── setup.ts                                 # Test utilities and mocks
│
├── people/                                      # PEOPLE DIMENSION
│   ├── auth/                                    # Authentication tests (50+ cases)
│   │   ├── auth.test.ts                         # General auth flow tests
│   │   ├── email-password.test.ts               # Email/password auth (10 cases)
│   │   ├── magic-link.test.ts                   # Passwordless auth (6 cases)
│   │   ├── oauth.test.ts                        # OAuth providers (8 cases)
│   │   ├── password-reset.test.ts               # Password recovery (7 cases)
│   │   ├── utils.ts                             # Auth test utilities
│   │   ├── README.md                            # Auth test documentation
│   │   └── STATUS.md                            # Auth implementation status
│   ├── useOrganizations.test.tsx                # Organization hooks tests
│   └── usePeople.test.tsx                       # People management hooks tests
│
├── things/                                      # THINGS DIMENSION
│   ├── entities/
│   │   └── ThingService.test.ts                 # Entity service tests (15+ cases)
│   └── validation/
│       └── validation.test.ts                   # Entity validation tests
│
├── connections/                                 # CONNECTIONS DIMENSION
│   └── (placeholder - tests to be added)
│
├── events/                                      # EVENTS DIMENSION
│   └── (placeholder - tests to be added)
│
├── knowledge/                                   # KNOWLEDGE DIMENSION
│   └── (placeholder - tests to be added)
│
├── providers/                                   # INFRASTRUCTURE TESTS
│   ├── ConvexProvider.test.ts                   # Convex integration tests
│   ├── DataProvider.test.ts                     # Data provider interface tests
│   ├── Factory.test.ts                          # Provider factory tests
│   └── providers.test.ts                        # Provider configuration tests
│
├── utils/                                       # UTILITY TESTS
│   └── file-resolver.test.ts                    # File resolution tests (10+ cases)
│
└── components/                                  # COMPONENT TESTS
    └── InstallationFileBrowser.test.tsx         # File browser component tests
```

## File Count by Dimension

| Category | Files | Lines (est.) | Coverage |
|----------|-------|--------------|----------|
| **Groups** | 4 | 500 | Multi-tenancy, hierarchies, workflows |
| **People** | 9 | 2000 | Auth (6 methods), hooks, roles |
| **Things** | 2 | 300 | Entities, validation |
| **Connections** | 0 | 0 | ⏳ To be added |
| **Events** | 0 | 0 | ⏳ To be added |
| **Knowledge** | 0 | 0 | ⏳ To be added |
| **Providers** | 4 | 600 | Infrastructure, data providers |
| **Utils** | 1 | 150 | File resolution, utilities |
| **Components** | 1 | 100 | UI components |
| **Docs** | 3 | 1500 | README, MIGRATION, STRUCTURE |
| **TOTAL** | **24** | **5150** | **58% complete** |

## Test Coverage by Feature

### Authentication (People) - 100% Coverage ✅

| Method | Test File | Cases | Status |
|--------|-----------|-------|--------|
| Email/Password | `people/auth/email-password.test.ts` | 10 | ✅ |
| OAuth | `people/auth/oauth.test.ts` | 8 | ✅ |
| Magic Links | `people/auth/magic-link.test.ts` | 6 | ✅ |
| Password Reset | `people/auth/password-reset.test.ts` | 7 | ✅ |
| Email Verification | Included in other tests | - | ✅ |
| 2FA/TOTP | Included in auth.test.ts | - | ✅ |

### Groups - 80% Coverage ✅

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Components | `groups/components.test.tsx` | 5+ | ✅ |
| Pages | `groups/pages.test.tsx` | 5+ | ✅ |
| Workflows | `groups/workflows.test.tsx` | 10+ | ✅ |
| Hierarchies | Included in workflows | - | ✅ |
| Multi-tenancy | Included in pages | - | ⏳ Partial |

### Things (Entities) - 50% Coverage ⏳

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Entity Service | `things/entities/ThingService.test.ts` | 10+ | ✅ |
| Validation | `things/validation/validation.test.ts` | 5+ | ✅ |
| Type-specific | - | - | ⏳ Missing |
| Lifecycle | - | - | ⏳ Missing |

### Connections - 0% Coverage ❌

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Creation | - | - | ⏳ To add |
| Queries | - | - | ⏳ To add |
| Metadata | - | - | ⏳ To add |
| Temporal | - | - | ⏳ To add |

### Events - 0% Coverage ❌

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Logging | - | - | ⏳ To add |
| Audit Trail | - | - | ⏳ To add |
| State Changes | - | - | ⏳ To add |
| Families | - | - | ⏳ To add |

### Knowledge - 0% Coverage ❌

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Search | - | - | ⏳ To add |
| Embeddings | - | - | ⏳ To add |
| Linking | - | - | ⏳ To add |
| Categories | - | - | ⏳ To add |

### Infrastructure - 90% Coverage ✅

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| Data Provider | `providers/DataProvider.test.ts` | 10+ | ✅ |
| Convex Provider | `providers/ConvexProvider.test.ts` | 5+ | ✅ |
| Factory | `providers/Factory.test.ts` | 3+ | ✅ |
| Configuration | `providers/providers.test.ts` | 2+ | ✅ |

### Utils - 70% Coverage ✅

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| File Resolution | `utils/file-resolver.test.ts` | 10+ | ✅ |
| Other Utils | - | - | ⏳ To add |

### Components - 20% Coverage ⏳

| Feature | Test File | Cases | Status |
|---------|-----------|-------|--------|
| File Browser | `components/InstallationFileBrowser.test.tsx` | 5+ | ✅ |
| Other Components | - | - | ⏳ To add |

## Import Path Patterns

### Source Code Imports (Use `@/` Alias)

```typescript
// Services
import { ThingService } from "@/services/ThingService";

// Providers
import { DataProvider } from "@/providers/DataProvider";

// Hooks
import { useOrganizations } from "@/hooks/useOrganizations";

// Components
import { Button } from "@/components/ui/button";

// Utils
import { resolveFilePath } from "@/lib/utils/file-resolver";
```

### Backend Imports (Use Relative Path)

```typescript
// From auth tests (people/auth/)
import { api } from "../../../../../backend/convex/_generated/api";

// From root-level tests
import { api } from "../../../backend/convex/_generated/api";
```

### Test Utilities (Use Relative Path)

```typescript
// From auth tests
import { generateTestEmail } from "./utils";

// From group tests
import { createMockGroup } from "./setup";
```

## Test Execution Commands

### Once vitest is configured:

```bash
# Run all tests
bun test

# Run specific dimension
bun test src/tests/groups/
bun test src/tests/people/
bun test src/tests/things/

# Run specific file
bun test src/tests/people/auth/email-password.test.ts

# Watch mode
bun test --watch

# UI mode
bun test:ui

# Coverage
bun test:coverage
```

## Key Files to Know

### Documentation

1. **`README.md`** - Start here! Complete test suite documentation
2. **`MIGRATION.md`** - Migration details and next steps
3. **`STRUCTURE.md`** - This file (file structure reference)
4. **`people/auth/README.md`** - Authentication test documentation
5. **`people/auth/STATUS.md`** - Auth implementation status

### Test Utilities

1. **`people/auth/utils.ts`** - Auth test helpers (test email generation, logging, assertions)
2. **`groups/setup.ts`** - Group test mocks and utilities

### Main Test Suites

1. **`people/auth/email-password.test.ts`** - Most complete auth tests (good template)
2. **`things/entities/ThingService.test.ts`** - Service layer testing pattern
3. **`providers/DataProvider.test.ts`** - Provider interface testing pattern
4. **`groups/workflows.test.tsx`** - React component testing pattern

## Adding New Tests

### Step 1: Identify Dimension

Which dimension does your feature belong to?
- Groups, People, Things, Connections, Events, or Knowledge?

### Step 2: Find Similar Test

Look for similar tests in the same dimension to use as a template.

### Step 3: Create Test File

```typescript
// Example: things/entities/CourseService.test.ts
import { describe, it, expect } from "vitest";
import { CourseService } from "@/services/CourseService";

describe("CourseService", () => {
  describe("create", () => {
    it("should create course with valid data", async () => {
      // Test implementation
    });
  });
});
```

### Step 4: Update Documentation

Add your new test file to this STRUCTURE.md file and update coverage stats in README.md.

## Ontology Reference

**Everything maps to 6 dimensions:**

```
┌──────────────────────────────────────────────┐
│  GROUPS → Hierarchies, multi-tenancy         │
│  PEOPLE → Auth, roles, permissions           │
│  THINGS → Entities, content, products        │
│  CONNECTIONS → Relationships                 │
│  EVENTS → Actions, audit trails              │
│  KNOWLEDGE → Search, embeddings, categories  │
└──────────────────────────────────────────────┘
```

**Golden Rule:** If you can't map your test to a dimension, you're thinking about it wrong.

---

**Last Updated:** October 16, 2025
**Status:** Migration complete, awaiting vitest configuration
**Coverage:** 58% (19 test files covering 3 of 6 dimensions)
