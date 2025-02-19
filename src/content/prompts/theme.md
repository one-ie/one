---
title: Theme System Documentation
description: A comprehensive guide to ONE's theme system, animations, and styling
date: 2024-02-20
section: Design System
order: 1
---

# Theme System Documentation

The ONE theme system provides three themes:
- ONE (base/default theme)
- Light (light variation)
- Dark (dark variation)

## Theme Configuration

### Base Theme (ONE)
Themes are defined using CSS custom properties with HSL color values. The ONE theme serves as the base, with light and dark variations building on top of it.

## Animation System

The theme system includes a rich set of animations that can be used across the application:

### Base Animations
- `accordion-down/up`: Smooth accordion transitions
- `orbit`: Circular orbital motion
- `pulse`: Gentle pulsing effect
- `border-beam`: Animated border effect
- `spin`: Rotation animation
- `thinking-dot`: Loading indicator animation
- `ping`: Expanding ripple effect
- `fade-in`: Smooth fade in transition

### Usage Examples

```jsx
// Accordion animation
<div className="animate-accordion-down">
  {/* Accordion content */}
}

// Orbital effect
<div className="animate-orbit" style={{"--duration": "10", "--start-angle": "0", "--radius": "50"}}>
  {/* Orbiting element */}
}

// Loading indicator
<div className="animate-thinking-dot">
  {/* Loading dot */}
}

// Smooth entrance
<div className="animate-fade-in">
  {/* Content that fades in */}
}
```

## Theme Integration

### Base Theme (ONE)
```css
:root {
  /* Base ONE theme variables */
  --one-background: 0 0% 100%;
  --one-foreground: 240 10% 10%;
  --one-primary: 240 5.9% 10%;
  --one-primary-foreground: 0 0% 98%;
}
```

### Theme Variations
```css
/* Light theme variation */
.light {
  --background: 0 0% 100%;
  --foreground: 240 10% 10%;
}

/* Dark theme variation */
.dark {
  --background: 0 0% 7%;
  --foreground: 0 0% 98%;
}
```

## Best Practices

1. Use semantic color tokens from the ONE theme
2. Leverage the animation system for interactive elements
3. Maintain consistent timing with animation variables
4. Consider reduced motion preferences
5. Test animations across themes
6. Use responsive design utilities
7. Follow accessibility guidelines

## Examples

### Animated Card with Theme Support
```jsx
<div className="bg-card text-card-foreground animate-fade-in">
  <div className="p-4">
    <h3 className="text-lg font-semibold">Card Title</h3>
    <p className="text-muted-foreground">
      Card content with theme-aware colors
    </p>
  </div>
</div>
```

### Interactive Button
```jsx
<button className="bg-primary text-primary-foreground hover:animate-pulse">
  Click Me
</button>
```

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Themes](https://ui.shadcn.com/themes)
- [Framer Motion](https://www.framer.com/motion/) - For more complex animations
- [WCAG Animation Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions)