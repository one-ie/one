# ONE Design System

A comprehensive design system that combines Tailwind CSS with custom ONE styling for a cohesive, elegant UI experience.

## Overview

The ONE design system provides a set of carefully crafted design tokens, components, and utilities that work together to create a consistent and beautiful user interface. It's built on top of Tailwind CSS and extends its capabilities with custom components and utilities.

## Core Features

- **Dark Mode by Default**: Sleek, elegant dark theme with extremely subtle borders
- **Symmetrical Design**: Matching sidebar and right panel create a balanced frame
- **Theme Variants**: Support for light, dark, and slate-based high-contrast themes
- **Responsive Layout**: Flexible grid system with adaptive components
- **Glass Effects**: Beautiful backdrop-filter effects for depth
- **Animation System**: Smooth, elegant animations and transitions
- **Accessibility**: High-contrast slate mode and reduced motion support

## Design Tokens

### Colors

The color system is based on HSL values for maximum flexibility:

```css
--one-black: hsl(0 0% 0%);        /* Pure black */
--one-dark: hsl(0 0% 10%);        /* #1A1A1A - Slightly lighter sidebar */
--one-background: hsl(0 0% 11%);  /* #1C1C1C - Slightly darker background */
--one-white: hsl(0 0% 100%);      /* Pure white */
```

### Semantic Colors

Colors are mapped to semantic roles:

```css
--one-background-main: var(--one-background);  /* Main content */
--one-background-nav: var(--one-dark);         /* Sidebar/header */
--one-background-logo: var(--one-black);       /* Logo area */
--one-background-card: hsl(0 0% 14%);          /* Cards - slightly lighter than background */
```

### Border System

Extremely subtle borders for an elegant look:

```css
--one-border: hsla(0, 0%, 100%, 0.03);      /* 3% opacity white border */
--one-border-nav: hsla(0, 0%, 100%, 0.02);  /* 2% opacity for nav */
```

### High Contrast Slate Theme

The high contrast slate theme provides better accessibility while maintaining a sophisticated look:

```css
/* Core colors */
--one-black: hsl(215 28% 17%);      /* #1e293b - Slate 800 */
--one-dark: hsl(217 33% 17%);       /* #1e2a3b - Slate 900 */
--one-background: hsl(222 47% 11%); /* #0f172a - Slate 950 */
--one-white: hsl(0 0% 100%);        /* #ffffff - Pure white */

/* Primary & Accent colors */
--one-primary: hsl(217 91% 60%);    /* #3b82f6 - Blue 500 */
--one-accent: hsl(199 89% 48%);     /* #0ea5e9 - Sky 500 */
```

### Animation Timings

Consistent animation durations:

```css
--one-duration-fast: 150ms;
--one-duration-normal: 250ms;
--one-duration-slow: 400ms;
```

## Component Classes

### Glass Effects

```css
.one-glass {
  backdrop-filter: blur(10px);
  background: hsla(var(--one-background-main) / 0.7);
  border: 1px solid hsl(var(--border));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.01);
}
```

### Cards

```css
.one-card {
  background-color: hsla(var(--card) / 0.98);
  color: hsl(var(--card-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius) - 2px);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.005);
  transition: all 0.2s ease;
}
```

### Buttons

```css
.one-button-primary {
  background-color: hsla(var(--one-primary) / 0.9);
  color: hsl(var(--one-primary-foreground));
  box-shadow: 0 2px 10px hsla(var(--one-primary) / 0.03);
  border: 1px solid hsla(var(--one-primary) / 0.2);
}
```

### Navigation

```css
.one-nav-item {
  position: relative;
  transition: background-color var(--one-duration-normal) ease-in-out;
  overflow: hidden;
}
```

### Chat UI

```css
.chat-message-bubble {
  position: relative;
  border-radius: var(--radius);
  padding: 0.75rem 1rem;
  transition: all 0.2s ease;
  border: 1px solid hsl(var(--border));
  backdrop-filter: blur(4px);
}
```

## Animation Utilities

```css
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

.animate-typing {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid currentColor;
  animation: typing 3s steps(40) infinite, blink 1s step-end infinite;
}
```

## Layout System

The layout system uses a flexible grid with support for different panel modes:

```css
.main-grid[data-panel-mode="Quarter"] {
  grid-template-columns: minmax(0, calc(100% - 350px));
}

.main-grid[data-panel-mode="Half"] {
  grid-template-columns: minmax(0, 50%);
}

.main-grid[data-panel-mode="Full"] {
  grid-template-columns: 0;
}
```

## Accessibility

The design system includes support for reduced motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  :root {
    --one-duration-fast: 0s;
    --one-duration-normal: 0s;
    --one-duration-slow: 0s;
  }
}
```

## Usage with Tailwind

The ONE design system is fully compatible with Tailwind CSS. It extends Tailwind's capabilities with custom components and utilities while maintaining compatibility with Tailwind's utility classes.

## Theme Switching

The design system supports theme switching via data attributes:

```html
<html lang="en" class="dark" data-theme="dark">
```

Available themes:
- `dark` (default)
- `light`
- `high-contrast` 