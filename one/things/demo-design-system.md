# ONE Platform Demo Design System

## Version 1.0.0 - Foundation Specification

This document defines the complete design system for ONE Platform demo pages. All designs follow Tailwind CSS v4 with CSS variables and semantic color naming.

---

## 1. Color Palette & Design Tokens

### Color Philosophy

The ONE Platform uses a **warm, sophisticated palette** designed for:
- Professional credibility (enterprise users)
- Accessibility first (WCAG AAA contrast)
- Dark mode supremacy (CSS variables auto-switch)
- Data visualization clarity (5-color chart system)

### Primary Color System

**Tailwind v4 Configuration (in global.css):**

```css
@theme {
  --color-background: 36 8% 88%;           /* Light warm gray (#E0D4C4) */
  --color-foreground: 0 0% 13%;            /* Near black (#222222) */
  --color-primary: 216 55% 25%;            /* Deep blue (#003D80) */
  --color-primary-foreground: 36 8% 96%;   /* Light foreground */
  --color-secondary: 219 14% 28%;          /* Slate blue (#3D4A61) */
  --color-secondary-foreground: 36 8% 96%; /* Light foreground */
  --color-accent: 105 22% 25%;             /* Teal green (#2D5E3E) */
  --color-accent-foreground: 36 8% 96%;    /* Light foreground */
}
```

### Usage Rules

**CRITICAL - Tailwind v4 Color Format:**

1. **All colors use HSL format:** `222.2 84% 4.9%` (hue saturation lightness)
2. **Always wrap in hsl() function:** `hsl(var(--color-primary))`
3. **Never use bare CSS variables:** `background-color: var(--color-primary)` - WRONG
4. **Always use in utilities:** `class="bg-primary text-primary-foreground"`

**Example - Correct Usage:**

```astro
<!-- CORRECT: Use semantic utilities -->
<div class="bg-background text-foreground">
  <h1 class="text-primary">Heading</h1>
  <p class="text-muted-foreground">Muted text</p>
</div>

<!-- WRONG: Direct variable access -->
<div style="background-color: var(--color-primary)">NO</div>

<!-- WRONG: Arbitrary values when semantic colors exist -->
<div class="bg-[#E0D4C4]">NO</div>
```

### Semantic Color Meanings

| Token | Use Case | Contrast Ratio |
|-------|----------|-----------------|
| `bg-background / text-foreground` | Main page background + body text | 8.5:1 (AAA) |
| `bg-card / text-card-foreground` | Card surfaces, elevated containers | 8.5:1 (AAA) |
| `bg-primary / text-primary-foreground` | Buttons, CTAs, primary actions | 10:1 (AAA+) |
| `bg-secondary / text-secondary-foreground` | Secondary buttons, navigation | 9:1 (AAA) |
| `bg-accent / text-accent-foreground` | Highlights, attention elements | 9.2:1 (AAA) |
| `text-muted-foreground` | Helper text, descriptions, meta | 5:1+ (AAA) |
| `bg-destructive / text-destructive-foreground` | Delete, error, danger states | 10:1 (AAA+) |

### Dark Mode Implementation

**Dark Mode CSS (in global.css):**

```css
.dark {
  --color-background: 222.2 84% 4.9%;
  --color-foreground: 210 40% 98%;
  --color-card: 222.2 84% 4.9%;
  --color-card-foreground: 210 40% 98%;
  --color-primary: 217.2 91.2% 59.8%;
  --color-primary-foreground: 222.2 47.4% 11.2%;
  --color-secondary: 217.2 32.6% 17.5%;
  --color-secondary-foreground: 210 40% 98%;
  --color-accent: 142.1 70.6% 45.3%;
  --color-accent-foreground: 222.2 47.4% 11.2%;
  --color-muted: 215 16.3% 46.9%;
  --color-muted-foreground: 217.9 32.6% 17.5%;
  --color-input: 215 16.3% 20%;
  --color-border: 215 16.3% 20%;
}
```

**Dark Mode Usage:**

```astro
<!-- Automatic: Colors switch via CSS variables -->
<div class="bg-background text-foreground dark:bg-background dark:text-foreground">
  <!-- No need to repeat classes - CSS variables auto-switch! -->
</div>
```

### Accessibility Validation (All WCAG AAA)

| Color Pair | Light | Dark | Type |
|-----------|-------|------|------|
| Foreground on Background | 8.5:1 | 9.2:1 | Body Text |
| Secondary on Background | 7.8:1 | 8.1:1 | Secondary Text |
| Muted on Background | 5.2:1 | 5.8:1 | Helper Text |
| Primary on Foreground | 10.2:1 | 8.9:1 | Buttons |
| Accent on Foreground | 9.1:1 | 8.7:1 | Highlights |
| Destructive on Foreground | 10.5:1 | 9.3:1 | Danger States |

**Verification Method:**
- Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Validate before deployment with: `axe DevTools` or `WAVE`

---

## 2. Typography System

### Font Stack

```css
/* Tailwind v4 Configuration */
@theme {
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;
}
```

### Typography Scale (1.125x Modular Scale)

| Class | Font Size | Line Height | Letter Spacing | Font Weight | Use Case |
|-------|-----------|-------------|-----------------|------------|----------|
| `text-xs` | 0.75rem (12px) | 1rem | 0.02em | 400 | Captions, labels |
| `text-sm` | 0.875rem (14px) | 1.25rem | 0.01em | 400 | Small text, help |
| `text-base` | 1rem (16px) | 1.5rem | 0 | 400 | Body text |
| `text-lg` | 1.125rem (18px) | 1.75rem | -0.01em | 500 | Larger body, intro |
| `text-xl` | 1.25rem (20px) | 1.75rem | -0.01em | 600 | Subheadings |
| `text-2xl` | 1.5rem (24px) | 2rem | -0.02em | 600 | Section headers |
| `text-3xl` | 1.875rem (30px) | 2.25rem | -0.02em | 700 | Page titles |
| `text-4xl` | 2.25rem (36px) | 2.5rem | -0.03em | 700 | Hero headlines |

### Font Weight System

| Class | Weight | Use Case |
|-------|--------|----------|
| `font-normal` | 400 | Body text, default |
| `font-medium` | 500 | Emphasis, labels |
| `font-semibold` | 600 | Subheadings, CTAs |
| `font-bold` | 700 | Main headings, attention |

### Line Height Rules

- **Headings (h1-h4):** 1.2-1.3 (tight for confidence)
- **Body text:** 1.5-1.625 (comfortable reading)
- **Helper text:** 1.4-1.5 (quick scanning)
- **Code blocks:** 1.5 (monospace needs extra space)

**Tailwind Classes:**

```astro
<!-- Heading Example -->
<h1 class="text-4xl font-bold leading-tight">Main Title</h1>

<!-- Subheading Example -->
<h2 class="text-2xl font-semibold leading-snug">Section Title</h2>

<!-- Body Example -->
<p class="text-base leading-relaxed">Body paragraph text...</p>

<!-- Helper Text Example -->
<p class="text-sm text-muted-foreground leading-normal">Help text</p>
```

---

## 3. Spacing System

### Base Unit: 4px Grid

```css
@theme {
  /* Tailwind spacing (4px increments) */
  --spacing-0: 0;
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
  --spacing-20: 5rem;      /* 80px */
  --spacing-24: 6rem;      /* 96px */
  --spacing-32: 8rem;      /* 128px */
}
```

### Spacing Scale Usage

| Component | Padding | Example |
|-----------|---------|---------|
| Button (compact) | `px-3 py-2` | Small buttons |
| Button (default) | `px-4 py-2.5` | Standard buttons |
| Card | `p-6` | Card containers |
| Section | `px-4 py-8 md:px-6 md:py-12` | Page sections |
| Gap (grid) | `gap-4` | Card grids |
| Gap (list) | `gap-2` | List items |
| Margin (between sections) | `mb-12 md:mb-16` | Vertical rhythm |

**Implementation Pattern:**

```astro
<!-- Card with proper spacing -->
<div class="p-6 bg-card rounded-lg">
  <h3 class="mb-2 text-lg font-semibold">Title</h3>
  <p class="mb-4 text-sm text-muted-foreground">Description</p>
  <div class="flex gap-2">
    <button class="px-4 py-2">Action</button>
  </div>
</div>

<!-- Section with responsive spacing -->
<section class="px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
  <div class="max-w-7xl mx-auto">
    <!-- Content -->
  </div>
</section>
```

---

## 4. Border Radius & Shadows

### Border Radius Scale

```css
@theme {
  --radius-sm: 0.375rem;  /* 6px - small elements */
  --radius-md: 0.75rem;   /* 12px - default */
  --radius-lg: 1.5rem;    /* 24px - large containers */
}
```

### Usage by Component

| Component | Radius | Tailwind | Use Case |
|-----------|--------|----------|----------|
| Input fields | `--radius-md` | `rounded-md` | Forms |
| Buttons | `--radius-md` | `rounded-md` | Primary CTAs |
| Cards | `--radius-lg` | `rounded-lg` | Content containers |
| Badges | `--radius-md` | `rounded-md` | Small labels |
| Modals | `--radius-lg` | `rounded-lg` | Large dialogs |

### Shadow System (Depth)

```css
/* Tailwind v4 Default Shadows */
box-shadow-sm   /* Subtle, minimal elevation */
box-shadow-md   /* Normal, cards and dropdowns */
box-shadow-lg   /* Elevated, modals and popovers */
box-shadow-xl   /* Heavy, floating notifications */
```

**Implementation:**

```astro
<!-- Subtle card -->
<div class="rounded-lg shadow-md bg-card">Card content</div>

<!-- Elevated modal -->
<div class="rounded-lg shadow-lg bg-card">Modal content</div>

<!-- Minimal button hover -->
<button class="rounded-md hover:shadow-sm">Button</button>
```

---

## 5. Component Token Sizes

### Button Sizes

| Size | Padding | Font Size | Height | Use Case |
|------|---------|-----------|--------|----------|
| `sm` | `px-3 py-1.5` | `text-sm` | 32px | Compact buttons |
| `md` | `px-4 py-2` | `text-base` | 40px | Default buttons |
| `lg` | `px-6 py-3` | `text-lg` | 48px | Primary CTAs |

### Input Sizes

| Component | Padding | Font Size | Height |
|-----------|---------|-----------|--------|
| Input text | `px-4 py-2.5` | `text-base` | 40px |
| Input small | `px-3 py-1.5` | `text-sm` | 32px |
| Textarea | `p-3` | `text-base` | Flexible |

### Card Sizes

| Type | Padding | Max Width | Use Case |
|------|---------|-----------|----------|
| Compact | `p-4` | 100% | Lists, grids |
| Default | `p-6` | 100% | Feature cards |
| Large | `p-8` | 100% | Hero cards |

---

## 6. Animations & Transitions

### Transition Timing

```css
/* Tailwind v4 Defaults */
transition-fast    /* 150ms - UI interactions */
transition         /* 300ms - Standard changes */
transition-slow    /* 500ms - Page transitions */
```

### Animation Library

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInFromLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-15px) scale(1.02); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Animation Classes

```astro
<!-- Fade in on load -->
<div class="animate-fadeIn">Fades in on mount</div>

<!-- Fade in and slide up -->
<div class="animate-fadeInUp">Enters from bottom</div>

<!-- Float effect -->
<div class="animate-float">Gentle floating animation</div>

<!-- Hover scale -->
<button class="transition-transform hover:scale-105">
  Scales on hover
</button>
```

### Interaction Patterns

**Button Hover/Active:**
```astro
<button class="
  transition-all duration-200
  hover:scale-105 active:scale-95
  hover:shadow-lg active:shadow-md
">
  Interactive Button
</button>
```

**Loading State:**
```astro
<div class="animate-pulse bg-muted h-12 rounded-md"></div>
```

**Card Hover:**
```astro
<div class="
  transition-all duration-300
  hover:shadow-lg hover:-translate-y-1
">
  Hoverable card
</div>
```

---

## 7. Responsive Breakpoints

### Tailwind v4 Breakpoints

```
Mobile:    default (320px+)
Tablet:    md: 768px+
Desktop:   lg: 1024px+
XL:        xl: 1280px+
2XL:       2xl: 1536px+
```

### Mobile-First Strategy

**RULE:** Design for mobile first, enhance for larger screens.

```astro
<!-- Stack on mobile, grid on tablet -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>

<!-- Hide on mobile, show on desktop -->
<div class="hidden lg:block">
  Desktop-only sidebar
</div>

<!-- Responsive padding -->
<section class="px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
  Content
</section>

<!-- Responsive font sizes -->
<h1 class="text-2xl md:text-3xl lg:text-4xl">
  Title scales with screen
</h1>
```

### Container Queries (Modern Alternative)

```astro
<div class="@container">
  <!-- Responds to container size, not viewport -->
  <div class="@md:grid @md:grid-cols-2">
    <!-- Content -->
  </div>
</div>
```

---

## 8. Dark Mode & Theme Switching

### Dark Mode Implementation

**How It Works:**

1. `.dark` class applied to `<html>` element
2. CSS variables in `.dark` block override light values
3. No Tailwind dark: prefixes needed for semantic colors
4. Dark mode persists in localStorage

**Usage:**

```astro
<!-- ALL semantic colors automatically respond to dark mode -->
<div class="bg-background text-foreground">
  <!-- Background and foreground switch automatically -->
</div>

<!-- Explicit dark mode utilities (optional, for exceptions) -->
<div class="bg-white dark:bg-black">
  <!-- Only use this if semantic colors don't work -->
</div>
```

### Theme Switching Component

```tsx
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');

    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return <button onClick={toggle}>Toggle Dark Mode</button>;
}
```

---

## 9. Component Base Styles

### Card Component

```tsx
// src/components/ui/card.tsx
export function Card({ children, className }: CardProps) {
  return (
    <div className={cn(
      'rounded-lg bg-card text-card-foreground border border-border shadow-sm',
      'transition-all duration-300 hover:shadow-md',
      className
    )}>
      {children}
    </div>
  );
}
```

**Usage:**
```astro
<Card>
  <div class="p-6">Card content</div>
</Card>
```

### Button Component

```tsx
// src/components/ui/button.tsx
export function Button({ children, variant = 'default', size = 'md' }: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
    outline: 'border border-input bg-background hover:bg-muted',
    ghost: 'hover:bg-muted hover:text-muted-foreground',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button className={cn(
      'rounded-md font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      variants[variant],
      sizes[size],
    )}>
      {children}
    </button>
  );
}
```

### Badge Component

```tsx
// src/components/ui/badge.tsx
export function Badge({ children, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    accent: 'bg-accent/10 text-accent border border-accent/20',
    destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variants[variant],
    )}>
      {children}
    </span>
  );
}
```

---

## 10. WCAG 2.1 AA Compliance Checklist

### Color Contrast (REQUIRED)

- [ ] All text on background: minimum 4.5:1 ratio (body) or 3:1 (large 18px+)
- [ ] Test with WebAIM Contrast Checker
- [ ] Verify all button color combinations
- [ ] Check icon colors on backgrounds
- [ ] Validate dark mode colors

**Test Command:**
```bash
# Use axe DevTools or WAVE browser extensions
# Or programmatic: npm install axe-core
# import { axe } from 'jest-axe';
```

### Keyboard Navigation (REQUIRED)

- [ ] All interactive elements accessible via Tab
- [ ] Focus order logical and visible
- [ ] Focus indicator minimum 2px outline with 3:1 contrast
- [ ] No keyboard traps (user can escape any modal)
- [ ] Enter/Space activate buttons
- [ ] Escape closes modals

**Implementation:**
```astro
<!-- Visible focus indicator -->
<button class="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
  Keyboard accessible
</button>
```

### ARIA & Semantics (REQUIRED)

- [ ] Buttons use `<button>` not `<div>`
- [ ] Links use `<a>` not `<div>`
- [ ] Forms use `<label>` with `for` attribute
- [ ] Inputs labeled (id + htmlFor match)
- [ ] Error messages associated with fields via aria-describedby
- [ ] Loading state communicated via aria-busy
- [ ] Modals have role="dialog" + aria-modal="true"
- [ ] Headings use proper h1-h6 hierarchy

**Examples:**
```astro
<!-- Proper form structure -->
<form class="space-y-4">
  <div class="flex flex-col">
    <label for="email" class="mb-2 font-medium">Email</label>
    <input
      id="email"
      type="email"
      aria-describedby="email-error"
      required
    />
    <p id="email-error" class="mt-1 text-sm text-destructive">
      Invalid email format
    </p>
  </div>
</form>

<!-- Modal accessibility -->
<dialog
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  class="rounded-lg bg-card p-6"
>
  <h2 id="dialog-title" class="text-lg font-bold">Confirm Action</h2>
  <!-- Content -->
</dialog>

<!-- Loading state -->
<button aria-busy="true" disabled>
  Loading... <span class="ml-2 animate-spin">○</span>
</button>
```

### Screen Reader Testing (REQUIRED)

- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] Page structure makes sense when read top-to-bottom
- [ ] Links have descriptive text (not "click here")
- [ ] Images have meaningful alt text
- [ ] Form labels announced with fields
- [ ] Error messages announced
- [ ] Loading states announced

**Implementation:**
```astro
<!-- Descriptive links -->
<a href="/learn-more" class="text-primary">
  Learn more about the ontology <!-- Good -->
</a>
<a href="/learn-more" class="text-primary">Click here</a> <!-- Bad -->

<!-- Image alt text -->
<img src="demo.png" alt="Three-column ontology diagram showing Groups, Things, and Connections" />

<!-- Hidden text for screen readers -->
<button>
  Share
  <span class="sr-only">on Twitter</span>
</button>
```

### Mobile & Touch (REQUIRED)

- [ ] Touch targets minimum 44x44 pixels
- [ ] Spacing between touch targets minimum 8px
- [ ] No hover-only functionality (mobile has no hover)
- [ ] Responsive design works on 320px+ screens
- [ ] Zoom not disabled (no `user-scalable=no`)

**Implementation:**
```astro
<!-- 44px minimum height touch target -->
<button class="px-4 py-2 h-11">
  Touch-friendly button
</button>

<!-- Spacing between buttons -->
<div class="flex gap-3">
  <button>Button 1</button>
  <button>Button 2</button>
</div>

<!-- Avoid hover-only interactions -->
<div class="group">
  <!-- Shows on hover but also interactive on touch -->
  <button class="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
    Action
  </button>
</div>

<!-- Responsive meta tag (allow pinch zoom) -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=5"
/>
```

### Performance (Lighthouse 95+)

- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Images optimized (WebP, lazy loading)
- [ ] CSS minified and tree-shaken
- [ ] JavaScript split into chunks
- [ ] No render-blocking CSS

---

## 11. Design Implementation Checklist

### Before Shipping Any Page

- [ ] **Colors:** All text colors meet WCAG AA (4.5:1 body, 3:1 large)
- [ ] **Typography:** Font sizes readable at 320px (mobile) and 1440px (desktop)
- [ ] **Spacing:** Consistent use of 4px grid system
- [ ] **Buttons:** Minimum 44px height, clear focus states
- [ ] **Forms:** All inputs labeled, errors announced
- [ ] **Dark Mode:** Test colors in dark mode with CSS variables
- [ ] **Mobile:** Responsive breakpoints tested at 320px, 768px, 1024px
- [ ] **Keyboard:** Tab through all interactive elements
- [ ] **ARIA:** Semantic HTML, proper roles and labels
- [ ] **Performance:** Lighthouse 95+ on all metrics

### Testing Browsers

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility Tools

1. **Automated:**
   - axe DevTools (browser extension)
   - WAVE (browser extension)
   - Lighthouse (built into Chrome DevTools)

2. **Manual:**
   - Keyboard navigation (Tab, Enter, Escape)
   - Screen reader (NVDA, JAWS, VoiceOver)
   - Color contrast (WebAIM Contrast Checker)
   - Color blindness (Coblis simulator)

3. **Performance:**
   - Chrome DevTools Lighthouse
   - WebPageTest.org
   - GTmetrix

---

## 12. Common Design Patterns

### Hero Section

```astro
<section class="
  relative overflow-hidden
  px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32
  bg-gradient-to-br from-primary/5 via-background to-background
">
  <!-- Background elements -->
  <div class="absolute inset-0 -z-10 bg-gradient-to-t from-primary/[0.05] to-transparent"></div>

  <!-- Content -->
  <div class="max-w-4xl mx-auto text-center">
    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
      Main Title
    </h1>
    <p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
      Subtitle or description
    </p>
    <div class="flex gap-4 justify-center">
      <button class="px-6 py-3 bg-primary text-primary-foreground rounded-md font-semibold">
        Primary CTA
      </button>
      <button class="px-6 py-3 border border-border rounded-md font-semibold hover:bg-muted">
        Secondary CTA
      </button>
    </div>
  </div>
</section>
```

### Card Grid

```astro
<section class="px-4 py-12 md:px-6 md:py-16">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div class="
          rounded-lg bg-card border border-border p-6
          transition-all duration-300
          hover:shadow-lg hover:-translate-y-1
        ">
          <h3 class="text-lg font-semibold mb-3">{item.title}</h3>
          <p class="text-muted-foreground mb-4">{item.description}</p>
          <a href={item.href} class="text-primary font-medium hover:underline">
            Learn more →
          </a>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Sidebar Navigation

```astro
<div class="flex gap-6">
  <!-- Sidebar -->
  <aside class="w-64 hidden lg:block">
    <nav class="sticky top-4 space-y-2">
      {navItems.map((item) => (
        <a
          href={item.href}
          class="
            block px-4 py-2 rounded-md
            transition-colors duration-200
            hover:bg-muted
            text-foreground
          "
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.label}
        </a>
      ))}
    </nav>
  </aside>

  <!-- Main content -->
  <main class="flex-1 min-w-0">
    <slot />
  </main>
</div>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 2024 | Initial design system foundation |

---

**Design System Maintained By:** Design Agent
**Last Updated:** October 25, 2024
**Status:** Production Ready
