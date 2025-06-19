---
description: React Component Guidelines for ONE Framework
globs: src/components/**/*.{tsx,jsx}
---

# React Component Guidelines

Rules for writing consistent React components within the ONE framework.

## Structure
- Use functional components with arrow functions.
- Avoid class components unless absolutely necessary.
- Keep components small and focused on a single responsibility.
- Use TypeScript for type safety.

## Props
- Define prop types with TypeScript interfaces.
- Use descriptive prop names.
- Provide default values for optional props using destructuring.
- Use the `children` prop for component composition.

## Example
Here's a compliant React component:

```tsx
interface ButtonProps {
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button = ({
  variant = 'default',
  size = 'md',
  children,
  onClick,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-md font-medium transition-colors",
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'bg-secondary text-secondary-foreground': variant === 'secondary',
          'border border-input bg-background': variant === 'outline',
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 roo-not-allowed': disabled
        }
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## Styling
- Use Tailwind CSS for styling.
- Use the `cn()` utility for conditional class names.
- Follow the Shadcn/UI component patterns.
- Use CSS variables for theming when appropriate.
- Always use `className` (not `class`) for React components.

## Hooks
- Follow the Rules of Hooks.
- Create custom hooks for reusable logic.
- Keep hooks small and focused.
- Name hooks with the `use` prefix.

## State Management
- Use React's built-in state management (useState, useReducer) for component-level state.
- Consider context for shared state between components.
- Avoid prop drilling by using composition or context.

## Performance
- Memoize expensive calculations with useMemo.
- Optimize event handlers with useCallback.
- Use React.memo for pure components that render often.
- Implement proper dependency arrays in useEffect.

## Client Directives
- Use appropriate Astro client directives:
  - `client:load`: Component loads immediately.
  - `client:idle`: Component loads when the browser is idle.
  - `client:visible`: Component loads when it enters the viewport.
  - `client:only`: Component only renders on the client.

## Accessibility
- Use semantic HTML elements.
- Include proper ARIA attributes.
- Ensure keyboard navigation works.
- Maintain proper focus management.
- Test with screen readers.

## File Organization
- Place components in `src/components/`.
- Use subdirectories for related components.
- Follow naming conventions: PascalCase for component files.
- Export components as named exports from index files for better imports. 