---
description: Shadcn/UI and Tailwind CSS Guidelines
globs: src/components/ui/**/*.{tsx,jsx}
---

# Shadcn/UI and Tailwind CSS Guidelines

Rules for consistent usage of Shadcn/UI components and Tailwind CSS in the ONE framework.

## Shadcn/UI Components

### Installation
- Use pnpm to add Shadcn/UI components:
  ```bash
  pnpm shadcn-ui@latest add [component-name]
  ```
- Components should be installed in `src/components/ui/`.

### Usage
- Import components from `@/components/ui/`.
- Follow the component documentation for proper usage.
- Use the component's props API as documented.
- Avoid modifying the core component files directly.

### Customization
- Customize components through the `components.json` configuration.
- Use the `cn()` utility for conditional class names.
- Extend components by composition rather than modification.

## Tailwind CSS

### Class Organization
- Use consistent class ordering:
  1. Layout (display, position)
  2. Box model (width, height, margin, padding)
  3. Typography (font, text)
  4. Visual (colors, backgrounds, borders)
  5. Other (animations, transitions)

### Example
```tsx
<div className="
  flex items-center justify-between
  w-full h-16 px-4
  text-sm font-medium
  bg-background border-b
  transition-all
">
  {/* Content */}
</div>
```

### Responsive Design
- Use Tailwind's responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Design for mobile-first, then add responsive classes.
- Use consistent breakpoints across the application.

### Dark Mode
- Use the `dark:` variant for dark mode styles.
- Ensure proper contrast in both light and dark modes.
- Test all components in both modes.

### Custom Utilities
- Define custom utilities in `tailwind.config.mjs`.
- Use CSS variables for theming in `src/styles/global.css`.
- Follow the naming convention of existing variables.

## Component Examples

### Button Component
```tsx
import { Button } from "@/components/ui/button";

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="outline" size="sm">Small Outline</Button>

// With icon
<Button>
  <PlusIcon className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

### Dialog Component
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    {/* Dialog content */}
  </DialogContent>
</Dialog>
```

## Best Practices
- Use semantic HTML elements within components.
- Maintain consistent spacing using Tailwind's spacing scale.
- Use Tailwind's color palette for consistency.
- Leverage Shadcn/UI's composition pattern for complex components.
- Test components for accessibility and responsiveness. 