# Test Suite Installation Guide

Quick guide to install dependencies and run the comprehensive groups test suite.

## Prerequisites

- Node.js 18+ installed
- Bun package manager installed (for frontend)
- Backend and frontend directories in place

## Backend Installation

### 1. Navigate to Backend
```bash
cd /Users/toc/Server/ONE/backend
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- `vitest@^2.2.6` - Test framework
- `@vitest/coverage-v8@^2.2.6` - Coverage reporter
- `@types/node@^22.10.5` - TypeScript types

### 3. Verify Installation
```bash
npm test
```

**Expected Output:**
```
✓ backend/convex/tests/groups-mutations.test.ts (15 tests)
✓ backend/convex/tests/groups-queries.test.ts (28 tests)
✓ backend/convex/tests/groups-integration.test.ts (12 tests)

Test Files  3 passed (3)
     Tests  55 passed (55)
```

### Backend Test Commands
```bash
# Run tests once
npm test

# Watch mode (re-run on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Frontend Installation

### 1. Navigate to Frontend
```bash
cd /Users/toc/Server/ONE/frontend
```

### 2. Install Test Dependencies
```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

This will install:
- `vitest` - Test framework
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `@vitejs/plugin-react` - React plugin for Vite
- `jsdom` - Browser environment simulation

### 3. Verify Installation
```bash
bun test test/groups
```

**Expected Output:**
```
✓ frontend/test/groups/components.test.tsx (29 tests)
✓ frontend/test/groups/workflows.test.tsx (16 tests)
✓ frontend/test/groups/pages.test.tsx (17 tests)

Test Files  3 passed (3)
     Tests  62 passed (62)
```

### Frontend Test Commands
```bash
# Run groups tests once
bun test test/groups

# Watch mode (re-run on changes)
bun test test/groups --watch

# Generate coverage report
bun test test/groups --coverage
```

## Quick Start (All Tests)

Run both backend and frontend tests in one go:

```bash
# From project root
cd /Users/toc/Server/ONE

# Backend tests
(cd backend && npm test)

# Frontend tests
(cd frontend && bun test test/groups)
```

## Expected Results

### Backend (55 tests)
- ✅ Mutations: 15 tests
- ✅ Queries: 28 tests
- ✅ Integration: 12 tests

### Frontend (62 tests)
- ✅ Components: 29 tests
- ✅ Workflows: 16 tests
- ✅ Pages: 17 tests

### Total: 117 tests

## Troubleshooting

### Backend Issues

**Problem:** `Cannot find module 'vitest'`
```bash
cd backend
npm install
```

**Problem:** Tests timeout
- Increase timeout in `vitest.config.ts`:
  ```typescript
  test: {
    testTimeout: 10000, // 10 seconds
  }
  ```

### Frontend Issues

**Problem:** `Cannot find module '@testing-library/react'`
```bash
cd frontend
bun add -D @testing-library/react @testing-library/jest-dom jsdom
```

**Problem:** `jsdom not found`
```bash
cd frontend
bun add -D jsdom
```

**Problem:** React import errors
- Ensure React 19 is installed:
  ```bash
  bun add react@^19.1.1 react-dom@^19.1.1
  ```

## Directory Structure

After installation, your test structure should look like:

```
ONE/
├── backend/
│   ├── convex/
│   │   ├── tests/
│   │   │   ├── vitest.config.ts
│   │   │   ├── setup.ts
│   │   │   ├── groups-mutations.test.ts
│   │   │   ├── groups-queries.test.ts
│   │   │   ├── groups-integration.test.ts
│   │   │   └── README.md
│   │   ├── mutations/
│   │   │   └── groups.ts
│   │   └── queries/
│   │       └── groups.ts
│   ├── package.json (with vitest scripts)
│   └── node_modules/
│
└── frontend/
    ├── test/
    │   └── groups/
    │       ├── vitest.config.ts
    │       ├── setup.ts
    │       ├── components.test.tsx
    │       ├── workflows.test.tsx
    │       ├── pages.test.tsx
    │       └── README.md
    ├── package.json
    └── node_modules/
```

## Coverage Reports

### Backend Coverage
```bash
cd backend
npm run test:coverage
```

Report generated at: `backend/coverage/index.html`

### Frontend Coverage
```bash
cd frontend
bun test test/groups --coverage
```

Report generated at: `frontend/coverage/index.html`

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install
      - run: cd backend && npm test

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: cd frontend && bun install
      - run: cd frontend && bun test test/groups
```

## Next Steps

1. ✅ Install dependencies (above)
2. ✅ Run tests to verify
3. ✅ Review test coverage reports
4. ✅ Add tests to CI/CD pipeline
5. ✅ Write additional tests as needed

## Test Files Created

### Backend
- `/Users/toc/Server/ONE/backend/convex/tests/vitest.config.ts`
- `/Users/toc/Server/ONE/backend/convex/tests/setup.ts`
- `/Users/toc/Server/ONE/backend/convex/tests/groups-mutations.test.ts`
- `/Users/toc/Server/ONE/backend/convex/tests/groups-queries.test.ts`
- `/Users/toc/Server/ONE/backend/convex/tests/groups-integration.test.ts`
- `/Users/toc/Server/ONE/backend/convex/tests/README.md`
- `/Users/toc/Server/ONE/backend/package.json` (updated)

### Frontend
- `/Users/toc/Server/ONE/frontend/test/groups/vitest.config.ts`
- `/Users/toc/Server/ONE/frontend/test/groups/setup.ts`
- `/Users/toc/Server/ONE/frontend/test/groups/components.test.tsx`
- `/Users/toc/Server/ONE/frontend/test/groups/workflows.test.tsx`
- `/Users/toc/Server/ONE/frontend/test/groups/pages.test.tsx`
- `/Users/toc/Server/ONE/frontend/test/groups/README.md`

### Documentation
- `/Users/toc/Server/ONE/TEST-SUMMARY.md`
- `/Users/toc/Server/ONE/INSTALL-TESTS.md` (this file)

## Support

For issues or questions:
1. Check the README files in each test directory
2. Review the TEST-SUMMARY.md for overview
3. Check vitest documentation: https://vitest.dev
4. Check Testing Library docs: https://testing-library.com

---

**Installation Status: Ready to Install**

Run the commands above to install dependencies and start testing!
