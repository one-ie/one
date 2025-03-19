---
title: Testing with Vitest
description: A comprehensive guide to setting up and running tests with Vitest in an Astro project
date: 2024-02-18
section: Development
order: 6
---

# Testing with Vitest in Astro

This guide will walk you through setting up and running tests with Vitest in your Astro project.

## Step 1: Install Dependencies

First, install Vitest and related testing libraries:

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom happy-dom @types/node @vitejs/plugin-react
```

These packages provide:
- `vitest`: The testing framework
- `@testing-library/react`: Utilities for testing React components
- `@testing-library/jest-dom`: Custom jest matchers for DOM testing
- `happy-dom`: A lightweight browser environment for testing
- `@vitejs/plugin-react`: React support for Vite/Vitest

## Step 2: Create Vitest Configuration

Create a `vitest.config.ts` file in your project root:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache']
  }
});
```

## Step 3: Create Test Setup File

Create a test setup file at `src/test/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

## Step 4: Update Package.json Scripts

Add test scripts to your package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage"
  }
}
```

## Step 5: Writing Your First Test

Create a test file for a component. For example, `src/components/ModeToggle.test.tsx`:

```typescript
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModeToggle } from './ModeToggle';
import userEvent from '@testing-library/user-event';

describe('ModeToggle', () => {
  it('renders the toggle button', () => {
    render(<ModeToggle />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('changes theme when clicked', async () => {
    render(<ModeToggle />);
    const button = screen.getByRole('button');
    
    await userEvent.click(button);
    expect(document.documentElement.classList).toContain('dark');
  });
});
```

## Step 6: Running Tests

You can run tests using several commands:

1. Run tests in watch mode (development):
```bash
pnpm test
```

2. Run tests once (CI/CD):
```bash
pnpm test:run
```

3. Run tests with UI interface:
```bash
pnpm test:ui
```

4. Generate coverage report:
```bash
pnpm coverage
```

## Test Structure Best Practices

1. **File Organization**:
   - Place test files next to the components they test
   - Use `.test.tsx` or `.spec.tsx` suffix
   - Group related tests in describe blocks

2. **Naming Conventions**:
   - Use descriptive test names
   - Follow the pattern: "it should [expected behavior]"
   - Group related tests in meaningful describe blocks

3. **Testing Patterns**:
```typescript
describe('Component', () => {
  // Setup/teardown hooks if needed
  beforeEach(() => {
    // Setup code
  });

  afterEach(() => {
    // Cleanup code
  });

  // Test cases
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', async () => {
    // Test implementation
  });
});
```

## Common Testing Utilities

1. **Rendering Components**:
```typescript
import { render, screen } from '@testing-library/react';

render(<YourComponent />);
```

2. **Finding Elements**:
```typescript
// By role
const button = screen.getByRole('button');

// By text
const element = screen.getByText('Hello');

// By test ID
const custom = screen.getByTestId('custom-element');
```

3. **User Interactions**:
```typescript
import userEvent from '@testing-library/user-event';

await userEvent.click(button);
await userEvent.type(input, 'Hello');
```

4. **Assertions**:
```typescript
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('Hello');
expect(element).toBeVisible();
```

## Debugging Tests

1. Use the UI interface for better debugging:
```bash
pnpm test:ui
```

2. Use console.log in tests:
```typescript
it('should work', () => {
  console.log('Debug info:', someValue);
  expect(true).toBe(true);
});
```

3. Use the debug utility:
```typescript
import { screen } from '@testing-library/react';

screen.debug();
```

Remember to write tests that focus on behavior rather than implementation details, and aim for high test coverage of critical application logic.