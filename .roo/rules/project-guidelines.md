---
description: ONE Framework Project Guidelines
globs: src/**/*.{ts,tsx,js,jsx,astro,md,mdx}
---

# ONE Framework Project Guidelines

General guidelines for all code in the ONE framework project.

## Project Structure

### Directory Organization
- `src/components/`: UI components
  - `ui/`: Shadcn/UI components
  - `chat/`: Chat-related components
  - `magicui/`: Enhanced UI components
- `src/content/`: Content collections
  - `blog/`: Blog posts
  - `docs/`: Documentation
  - `prompts/`: AI prompts
- `src/hooks/`: React hooks
- `src/layouts/`: Page layouts
- `src/lib/`: Utility functions
- `src/pages/`: Routes and pages
  - `api/`: API endpoints
- `src/schema/`: Data schemas
- `src/stores/`: State management
- `src/styles/`: Global styles
- `src/types/`: TypeScript types

## Coding Standards

### General
- Use TypeScript for type safety.
- Follow consistent naming conventions.
- Write clear, concise comments.
- Keep functions small and focused.
- Use meaningful variable names.
- Avoid magic numbers and strings.

### TypeScript
- Use explicit types for function parameters and return values.
- Leverage TypeScript's type inference when appropriate.
- Define interfaces for complex objects.
- Use type guards for runtime type checking.
- Prefer interfaces over type aliases for object types.

### Imports
- Use absolute imports with `@/` prefix.
- Group imports by type:
  1. External libraries
  2. Internal components/utilities
  3. Types
  4. Styles
- Sort imports alphabetically within groups.

### Example
```typescript
// External libraries
import { useState, useEffect } from 'react';
import { z } from 'zod';

// Internal components/utilities
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
import type { User } from '@/types/user';

// Styles
import '@/styles/component.css';
```

## Zod Schema Usage

### Schema Definition
- Define schemas in dedicated files in `src/schema/`.
- Export both the schema and inferred type.
- Use descriptive names for schemas.

### Example
```typescript
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
```

### Validation
- Use schema parsing for runtime validation.
- Handle validation errors gracefully.
- Provide helpful error messages.

## Performance Considerations

### Astro Optimization
- Use static rendering when possible.
- Minimize client-side JavaScript.
- Use partial hydration with client directives.
- Leverage Astro's content collections for structured content.

### React Optimization
- Memoize expensive calculations.
- Use proper dependency arrays in hooks.
- Avoid unnecessary re-renders.
- Implement code splitting for large components.

### Image Optimization
- Use Astro's built-in image optimization.
- Specify width and height attributes.
- Use responsive images with srcset.
- Lazy load images below the fold.

## Documentation

### Code Documentation
- Use JSDoc comments for functions and components.
- Document parameters, return values, and side effects.
- Include examples for complex functions.
- Keep documentation up-to-date with code changes.

### Example
```typescript
/**
 * Formats a date in a localized format.
 * @param date - The date to format
 * @param locale - The locale to use (defaults to browser locale)
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'en-US', { dateStyle: 'full' })
 * // => "Wednesday, February 21, 2024"
 */
export function formatDate(
  date: Date,
  locale?: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}
```

## Best Practices

### Accessibility
- Use semantic HTML elements.
- Include proper ARIA attributes.
- Ensure keyboard navigation works.
- Maintain proper color contrast.
- Test with screen readers.

### Security
- Validate user input.
- Sanitize data before rendering.
- Implement proper authentication and authorization.
- Follow security best practices for API endpoints.
- Keep dependencies updated.

### Testing
- Write unit tests for critical functionality.
- Test components for accessibility.
- Implement end-to-end tests for critical user flows.
- Use test-driven development when appropriate.

### Version Control
- Write clear, descriptive commit messages.
- Use feature branches for new development.
- Keep pull requests focused and manageable.
- Review code before merging.
- Maintain a clean git history. 