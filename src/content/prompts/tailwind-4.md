---
title: "Tailwind CSS v4 Guidelines"
description: "Guidelines for using Tailwind CSS v4 in ONE framework"
tags: ["tailwind", "css", "v4", "guidelines", "system-design"]
date: 2024-02-03
---

# Tailwind CSS v4 Guidelines

## Key Changes from v3

### 1. Import Syntax
```css
/* ❌ Don't use v3 directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ✅ Use v4 import */
@import "tailwindcss";
```

### 2. Updated Utility Names
- `shadow-sm` → `shadow-xs`
- `shadow` → `shadow-sm`
- `rounded-sm` → `rounded-xs`
- `rounded` → `rounded-sm`
- `outline-none` → `outline-hidden`
- `ring` → `ring-3`

### 3. Default Changes
- Border colors now use `currentColor` by default (add explicit colors)
- Ring width is now 1px (use `ring-3` for v3 equivalent)
- Placeholder text uses current text color at 50% opacity

## Best Practices

### 1. Border Usage
```tsx
/* ❌ Don't rely on default border color */
<div class="border">

/* ✅ Explicitly specify border color */
<div class="border border-gray-200">
```

### 2. Ring Usage
```tsx
/* ❌ Don't use v3 ring style */
<button class="focus:ring">

/* ✅ Use explicit width and color */
<button class="focus:ring-3 ring-blue-500">
```

### 3. Gradient Variants
```tsx
/* ✅ Use via-none to reset middle color */
<div class="bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400 dark:via-none dark:from-blue-500 dark:to-teal-400">
```

### 4. Variable Usage
```tsx
/* ❌ Don't use v3 variable syntax */
<div class="bg-[--brand-color]">

/* ✅ Use v4 variable syntax */
<div class="bg-(--brand-color)">
```

## Component Development

### 1. Custom Utilities
```css
/* ✅ Use @utility for custom utilities */
@utility custom-class {
  property: value;
}
```

### 2. Container Customization
```css
/* ✅ Use @utility for container customization */
@utility container {
  margin-inline: auto;
  padding-inline: 2rem;
}
```

### 3. Variant Stacking
```tsx
/* ❌ Don't use v3 variant order */
<ul class="py-4 first:*:pt-0 last:*:pb-0">

/* ✅ Use v4 left-to-right variant order */
<ul class="py-4 *:first:pt-0 *:last:pb-0">
```

## Performance Considerations

### 1. Hover on Mobile
- Hover styles only apply on devices that support hover
- Don't rely on hover for critical functionality
- Use `@custom-variant hover` if needed for legacy behavior

### 2. Transitions
```tsx
/* ✅ Set outline colors explicitly when transitioning */
<button class="outline-cyan-500 transition hover:outline-2">
```

## Theme Configuration

### 1. CSS Variables
```css
/* ✅ Use CSS variables for theme values */
.my-class {
  background-color: var(--color-red-500);
}
```

### 2. Media Queries
```css
/* ✅ Use variable names in theme() function */
@media (width >= theme(--breakpoint-xl)) {
  /* styles */
}
```

## Migration Tips

1. Use explicit color values for borders and rings
2. Update utility class names to v4 equivalents
3. Review and update gradient implementations
4. Check hover interactions on mobile devices
5. Update variable syntax in arbitrary values
6. Review and update variant stacking order

Remember: Tailwind CSS v4 focuses on improved performance, better defaults, and more consistent behavior. Always use explicit values and modern syntax for best results.
