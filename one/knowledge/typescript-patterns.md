# TypeScript Patterns & Best Practices

## Common Type Issues & Fixes

### 1. Lucide React Icon Types

**Problem:** Icon type definitions using function signatures fail with React 19 + Lucide React.

**Error:**
```
error ts(2322): Type 'ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>'
is not assignable to type '(props: SVGProps<SVGSVGElement>) => Element'.
Type 'ReactNode' is not assignable to type 'Element'.
```

**Bad Pattern:**
```typescript
import { Sparkles, Code2 } from 'lucide-react';

type Tool = {
  id: string;
  label: string;
  // ❌ WRONG: Function signature
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
};

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    icon: Sparkles,  // Type error!
  }
];
```

**Good Pattern:**
```typescript
import { Sparkles, Code2 } from 'lucide-react';

type Tool = {
  id: string;
  label: string;
  // ✅ CORRECT: Component type
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const TOOLS: Tool[] = [
  {
    id: "claude",
    label: "Claude Code",
    icon: Sparkles,  // Works!
  }
];
```

**Why:** Lucide icons are `ForwardRefExoticComponent`, not regular functions. Use `ComponentType` for component references.

---

### 2. React 19 Component Props

**Problem:** Props types not compatible with React 19's stricter typing.

**Bad Pattern:**
```typescript
// ❌ Old React patterns
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
}

const Button = ({ children, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>;
};
```

**Good Pattern:**
```typescript
// ✅ React 19 recommended
import { type ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick: () => void;
}

export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}
```

**Why:** React 19 prefers named exports and direct ReactNode imports for cleaner types.

---

### 3. SVG Component Types

**Bad Pattern:**
```typescript
// ❌ Inconsistent with Lucide
type CustomIcon = (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
```

**Good Pattern:**
```typescript
// ✅ Matches Lucide pattern
type IconProps = React.SVGProps<SVGSVGElement>;
type CustomIcon = React.ComponentType<IconProps>;

// Usage
const MyIcon: CustomIcon = (props) => (
  <svg {...props}>
    <path d="..." />
  </svg>
);
```

**Why:** Consistency with library patterns makes code more maintainable.

---

### 4. Astro + React Integration

**Problem:** Type mismatches between Astro and React components.

**Bad Pattern:**
```astro
---
// ❌ No type safety
import Button from '@/components/Button';
const data = await fetch('...').then(r => r.json());
---

<Button onClick={() => console.log(data)} />
```

**Good Pattern:**
```astro
---
// ✅ Type-safe props
import Button from '@/components/ui/button';
import type { ApiResponse } from '@/types';

const data: ApiResponse = await fetch('...')
  .then(r => r.json());
---

<Button client:load onClick={() => console.log(data)}>
  Click me
</Button>
```

**Why:** Explicit types catch errors at build time, not runtime.

---

### 5. Generic Component Props

**Bad Pattern:**
```typescript
// ❌ Any destroys type safety
interface FormProps {
  onSubmit: (data: any) => void;
}
```

**Good Pattern:**
```typescript
// ✅ Generic for type safety
interface FormProps<T> {
  onSubmit: (data: T) => void;
  initialData?: T;
}

function Form<T>({ onSubmit, initialData }: FormProps<T>) {
  // Type-safe implementation
}

// Usage
interface LoginData {
  email: string;
  password: string;
}

<Form<LoginData>
  onSubmit={(data) => {
    // data is typed as LoginData!
    console.log(data.email);
  }}
/>
```

**Why:** Generics preserve type information through component boundaries.

---

## Diagnostic Commands

### Find Type Errors

```bash
# Full type check (Astro + TypeScript)
bunx astro check

# Filter errors only
bunx astro check 2>&1 | grep "error"

# Filter by file
bunx astro check 2>&1 | grep "SendToTools"

# Count errors
bunx astro check 2>&1 | grep -c "error"
```

### Regenerate Types

```bash
# Regenerate Astro content types
bunx astro sync

# Full rebuild
bunx astro build

# Type check without building
bunx astro check --minimumSeverity error
```

---

## React 19 + Astro Compatibility

### Key Changes in React 19

1. **Server Components** - Use `'use client'` directive when needed
2. **Stricter Types** - More precise type inference
3. **New Hooks** - `useFormStatus`, `useFormState`, `useOptimistic`
4. **Async Components** - Server components can be async

### Astro Integration Best Practices

```typescript
// ✅ GOOD: Client directive for interactivity
<Button client:load onClick={handler}>Click</Button>

// ❌ BAD: Missing client directive
<Button onClick={handler}>Click</Button>

// ✅ GOOD: Server-side data fetching
---
const data = await fetch('https://api.example.com/data')
  .then(r => r.json());
---
<DataDisplay data={data} />

// ✅ GOOD: Client component with hydration
<InteractiveChart client:load data={data} />
```

---

## Common Fixes Checklist

When encountering type errors:

- [ ] Check if using `React.ComponentType` for component references
- [ ] Verify `client:load` on interactive React components
- [ ] Run `bunx astro sync` to regenerate content types
- [ ] Check import statements (named vs default exports)
- [ ] Verify React 19 compatibility
- [ ] Look for `any` types - replace with proper types
- [ ] Check prop spreading (`{...props}`) types
- [ ] Verify generic constraints are met

---

## Testing Type Safety

```typescript
// Create a type test file
// types.test.ts

import { expectType } from 'tsd';
import type { Tool } from './Tool';

// Test icon type
expectType<React.ComponentType<React.SVGProps<SVGSVGElement>>>(
  tool.icon
);
```

---

## Documentation References

- **React 19 Types:** https://react.dev/blog/2024/04/25/react-19-upgrade-guide
- **Astro TypeScript:** https://docs.astro.build/en/guides/typescript/
- **Lucide React:** https://lucide.dev/guide/packages/lucide-react

---

**Last Updated:** v3.0.3 (Icon type fixes)
**Category:** Knowledge / TypeScript
**Ontology Dimension:** Knowledge (technical patterns)
