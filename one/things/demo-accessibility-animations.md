# ONE Platform Demo - Accessibility & Animations

## Version 1.0.0 - Accessibility and Motion Specifications

This document defines accessibility requirements and animation patterns for all ONE Platform demo pages.

---

## Part 1: Accessibility (WCAG 2.1 AA Compliance)

### 1.1 Semantic HTML Foundation

**REQUIREMENT:** Use semantic HTML elements, never repurpose `<div>` for interactive content.

#### Required HTML Elements

| Element | Purpose | Example |
|---------|---------|---------|
| `<button>` | Interactive actions | CTAs, form submission |
| `<a>` | Navigation links | Documentation links |
| `<form>` | Form containers | Data input |
| `<input>`, `<select>`, `<textarea>` | Form inputs | Playground forms |
| `<label>` | Form field labels | Associated with inputs |
| `<h1>` - `<h6>` | Headings | Page structure |
| `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` | Page regions | Document outline |
| `<article>` | Self-contained content | Blog posts, cards |

**EXAMPLE - CORRECT:**

```astro
<!-- CORRECT: Semantic HTML -->
<form class="space-y-4">
  <div class="flex flex-col">
    <label for="email">Email Address</label>
    <input
      id="email"
      type="email"
      required
      aria-describedby="email-error"
    />
    <p id="email-error" class="text-sm text-destructive">
      Must be a valid email
    </p>
  </div>

  <button type="submit">Submit</button>
</form>

<!-- WRONG: Repurposed divs -->
<div class="form">
  <div class="form-field">
    <div class="label">Email</div>
    <div class="input" contenteditable></div>
    <div class="error">Invalid</div>
  </div>
  <div class="button" onclick="submit()">Submit</div>
</div>
```

### 1.2 Color Contrast (WCAG AAA)

**REQUIREMENT:** All text must meet WCAG AAA contrast ratios (4.5:1 body, 3:1 large).

#### Validation Checklist

- [ ] Body text on background: ≥ 4.5:1
- [ ] Large text (18px+, bold 14px+) on background: ≥ 3:1
- [ ] Button text on button background: ≥ 4.5:1
- [ ] Links on background: ≥ 4.5:1
- [ ] Placeholder text: ≥ 3:1 (relaxed)
- [ ] Border/dividers: ≥ 3:1
- [ ] Icons (single color): ≥ 3:1 if conveying meaning
- [ ] Dark mode colors meet same ratios

**Testing:**

```
Tool: WebAIM Contrast Checker
URL: https://webaim.org/resources/contrastchecker/

For each color pair:
1. Enter foreground color (text)
2. Enter background color
3. Verify WCAG AAA pass
4. Test in both light and dark modes
```

**Automated Testing:**

```bash
# Install axe DevTools for automated checking
# Browser: Chrome, Firefox
# Manual: Right-click → Inspect → axe DevTools → Scan

# Or use npm package
npm install --save-dev axe-core jest-axe
```

### 1.3 Keyboard Navigation

**REQUIREMENT:** All interactive elements accessible via keyboard only.

#### Tab Order

```html
<!-- Logical tab order (follow reading order) -->
<nav>
  <a href="/">Home</a>           <!-- Tab 1 -->
  <a href="/docs">Docs</a>       <!-- Tab 2 -->
</nav>

<main>
  <input type="text" />          <!-- Tab 3 -->
  <button>Submit</button>        <!-- Tab 4 -->
  <a href="/learn">Learn more</a> <!-- Tab 5 -->
</main>

<!-- Use tabindex sparingly for complex layouts -->
<button tabindex="0">Normal flow</button>
<button tabindex="-1">Not in tab order (but focusable)</button>

<!-- AVOID -->
<button tabindex="5">Arbitrary order</button>
<button tabindex="10">Breaks accessibility</button>
```

#### Focus Management

```astro
<!-- Visible focus indicators -->
<button class="
  focus-visible:outline-2
  focus-visible:outline-offset-2
  focus-visible:outline-ring
">
  Keyboard accessible
</button>

<!-- Modal focus trap -->
<dialog
  role="dialog"
  aria-modal="true"
  id="modal"
  on:keydown={(e) => {
    if (e.key === 'Escape') {
      modal.close();
    }
  }}
>
  <button autofocus>First button in modal</button>
  <!-- Focus automatically returns to trigger on close -->
</dialog>
```

#### Keyboard Shortcuts

| Key | Action | Element |
|-----|--------|---------|
| Tab | Move focus forward | All interactive |
| Shift+Tab | Move focus backward | All interactive |
| Enter | Activate button | `<button>`, `<a>` |
| Space | Activate button, toggle checkbox | `<button>`, `<checkbox>` |
| Escape | Close modal/dropdown | `<dialog>`, `<menu>` |
| Arrow Keys | Navigate menu items | `<nav>`, `<select>` |

### 1.4 ARIA Labels & Descriptions

**REQUIREMENT:** All interactive elements have appropriate ARIA labels.

#### ARIA Attributes

```html
<!-- Button with icon - needs label -->
<button aria-label="Close dialog">
  <svg><!-- X icon --></svg>
</button>

<!-- Form with error -->
<input
  id="email"
  type="email"
  aria-describedby="email-error"
  aria-invalid="true"
/>
<p id="email-error" role="alert">
  Invalid email format
</p>

<!-- List of items -->
<ul role="list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Loading state -->
<button aria-busy="true" disabled>
  Loading <span class="animate-spin">○</span>
</button>

<!-- Current page in navigation -->
<nav>
  <a href="/current" aria-current="page">Current</a>
  <a href="/other">Other</a>
</nav>

<!-- Live region (status messages) -->
<div role="status" aria-live="polite" aria-atomic="true">
  Item added successfully
</div>

<!-- Expandable section -->
<button
  aria-expanded="false"
  aria-controls="details"
>
  Show details
</button>
<div id="details" hidden>
  <!-- Details content -->
</div>
```

### 1.5 Form Accessibility

**REQUIREMENT:** All form fields properly labeled and validated.

```astro
<!-- Proper form structure -->
<form>
  <!-- Text input -->
  <div class="flex flex-col mb-4">
    <label for="name" class="mb-2 font-medium">
      Full Name
      <span aria-label="required">*</span>
    </label>
    <input
      id="name"
      type="text"
      name="name"
      required
      aria-required="true"
      placeholder="John Doe"
    />
  </div>

  <!-- Email with validation -->
  <div class="flex flex-col mb-4">
    <label for="email" class="mb-2 font-medium">
      Email Address
    </label>
    <input
      id="email"
      type="email"
      name="email"
      required
      aria-required="true"
      aria-describedby="email-hint email-error"
    />
    <p id="email-hint" class="text-xs text-muted-foreground mt-1">
      We'll never share your email
    </p>
    <p id="email-error" class="text-xs text-destructive mt-1" hidden>
      Invalid email format
    </p>
  </div>

  <!-- Select dropdown -->
  <div class="flex flex-col mb-4">
    <label for="type" class="mb-2 font-medium">
      Entity Type
    </label>
    <select
      id="type"
      name="type"
      required
      aria-label="Select entity type"
    >
      <option value="">Select...</option>
      <option value="thing">Thing</option>
      <option value="connection">Connection</option>
    </select>
  </div>

  <!-- Checkbox -->
  <div class="flex items-center mb-4">
    <input
      id="agree"
      type="checkbox"
      name="agree"
      required
      aria-required="true"
    />
    <label for="agree" class="ml-2">
      I agree to the terms
    </label>
  </div>

  <!-- Submit button -->
  <button
    type="submit"
    class="px-6 py-3 bg-primary text-primary-foreground rounded-md"
    disabled={isLoading}
  >
    {isLoading ? 'Submitting...' : 'Submit Form'}
  </button>
</form>
```

### 1.6 Screen Reader Testing

**REQUIREMENT:** Test with actual screen readers, not just plugins.

#### Test Checklist

- [ ] **Page title** - Describes page purpose
- [ ] **Page landmarks** - `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] **Heading hierarchy** - h1 → h2 → h3 (no skipping)
- [ ] **Link text** - Descriptive (not "click here")
- [ ] **Image alt text** - Meaningful and concise
- [ ] **Form labels** - Associated with inputs
- [ ] **Button purposes** - Clear from text/label
- [ ] **Error messages** - Announced and associated with inputs
- [ ] **Loading states** - Announced as aria-busy
- [ ] **Modal announcements** - Focused and trapped

#### Screen Reader Tools

**Windows:**
- NVDA (free) - https://www.nvaccess.org/
- JAWS (paid) - https://www.freedomscientific.com/

**Mac:**
- VoiceOver (built-in) - Cmd+F5 to enable
- JAWS (paid)

**Testing Process:**

```
1. Enable screen reader
2. Start from page top
3. Press Tab to navigate (interactive elements)
4. Press H to navigate (headings)
5. Verify all content is announced
6. Verify nothing unexpected is announced
7. Test forms with keyboard only
8. Test modal interactions
```

### 1.7 Mobile & Touch Accessibility

**REQUIREMENT:** Touch-friendly interface for mobile users.

#### Touch Target Sizes

```html
<!-- Minimum 44x44 pixels (11.2mm) -->
<button class="px-4 py-2 h-11">  <!-- 44px height -->
  Touch-friendly button
</button>

<a href="#" class="px-4 py-2.5 h-12">  <!-- 48px height -->
  Touch-friendly link
</a>

<!-- Spacing between targets: minimum 8px -->
<div class="flex gap-3">  <!-- 12px gap is safe -->
  <button class="h-11">Button 1</button>
  <button class="h-11">Button 2</button>
</div>
```

#### Mobile Viewport

```html
<!-- Allows pinch zoom (accessibility requirement) -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
/>

<!-- NOT this (disables zoom) -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, user-scalable=no"
/>
```

### 1.8 Accessibility Audit Checklist

Before shipping any page:

- [ ] **Semantic HTML:** All interactive elements use proper tags
- [ ] **Color Contrast:** WCAG AAA (4.5:1 body, 3:1 large)
- [ ] **Keyboard Navigation:** Tab, Enter, Escape all work
- [ ] **Focus States:** Visible outline on all interactive elements
- [ ] **ARIA Labels:** Buttons, links, forms all labeled
- [ ] **Form Validation:** Errors associated with fields
- [ ] **Images:** All have meaningful alt text
- [ ] **Screen Reader:** Page makes sense read top-to-bottom
- [ ] **Touch Targets:** Minimum 44x44px with 8px spacing
- [ ] **Language:** `lang="en"` on `<html>` element
- [ ] **Links:** No "click here", descriptive text
- [ ] **Color:** Not sole means of conveying information

**Automated Tools:**

```bash
# axe DevTools
1. Open browser DevTools
2. Find axe DevTools tab
3. Click "Scan ALL of my page"
4. Fix issues marked as violations

# Lighthouse
1. Open DevTools → Lighthouse
2. Check "Accessibility"
3. Run audit
4. Fix critical issues

# WAVE
1. Install WAVE extension
2. Click icon to scan page
3. Review errors and alerts
4. Fix accessibility issues
```

---

## Part 2: Animations & Transitions

### 2.1 Animation Philosophy

**PRINCIPLE:** Animations should enhance, not distract. All animations:
- Are less than 300ms (except intentional long animations)
- Use `prefers-reduced-motion` for accessibility
- Don't autoplay audio or video
- Are reversible (hover effects undo on unhover)

### 2.2 Core Animations

```css
/* Global CSS */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.02);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* Utility classes */
.animate-fadeIn {
  animation: fadeIn 300ms ease-out forwards;
}

.animate-fadeInUp {
  animation: fadeInUp 300ms ease-out forwards;
}

.animate-slideInLeft {
  animation: slideInFromLeft 300ms ease-out forwards;
}

.animate-slideInRight {
  animation: slideInFromRight 300ms ease-out forwards;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.3 Transition Patterns

#### Page Transitions

```astro
<!-- Fade in on load -->
<div class="opacity-0 animate-fadeIn">
  Page content fades in
</div>

<!-- Staggered animations for lists -->
<ul class="space-y-4">
  {items.map((item, i) => (
    <li
      class="opacity-0 animate-fadeInUp"
      style={{ animationDelay: `${i * 100}ms` }}
    >
      {item}
    </li>
  ))}
</ul>
```

#### Button Interactions

```astro
<!-- Hover scale -->
<button class="
  transition-all duration-200
  hover:scale-105 active:scale-95
  hover:shadow-lg active:shadow-md
">
  Click me
</button>

<!-- Hover color -->
<button class="
  bg-primary text-primary-foreground
  transition-colors duration-200
  hover:bg-primary/90
">
  Hover effect
</button>

<!-- Hover lift -->
<button class="
  transition-all duration-300
  hover:-translate-y-1 hover:shadow-lg
">
  Lift on hover
</button>
```

#### Card Interactions

```astro
<!-- Card hover effect -->
<div class="
  rounded-lg bg-card border border-border p-6
  transition-all duration-300
  hover:shadow-lg hover:-translate-y-1 hover:border-primary/50
">
  Card content
</div>

<!-- Gradient animation -->
<div class="
  bg-gradient-to-r from-primary via-primary/50 to-primary
  bg-[length:200%_auto]
  animate-gradient
">
  Animated gradient background
</div>
```

#### Form Interactions

```astro
<!-- Input focus -->
<input class="
  px-4 py-2.5 rounded-md border border-border
  transition-colors duration-200
  focus:border-primary focus:ring-2 focus:ring-primary/20
"/>

<!-- Smooth label movement (floating label pattern) -->
<div class="relative">
  <input
    id="name"
    type="text"
    class="peer px-4 py-3 border border-border rounded-md"
    placeholder=" "
  />
  <label
    for="name"
    class="
      absolute top-3 left-4
      transition-all duration-200
      peer-placeholder-shown:top-3 peer-placeholder-shown:text-muted-foreground
      peer-focus:top-1 peer-focus:text-sm peer-focus:text-primary
    "
  >
    Full Name
  </label>
</div>
```

#### Loading States

```astro
<!-- Skeleton loader -->
<div class="space-y-4">
  <div class="h-12 bg-muted rounded-md animate-pulse"></div>
  <div class="h-8 bg-muted rounded-md animate-pulse"></div>
  <div class="h-8 bg-muted rounded-md animate-pulse w-2/3"></div>
</div>

<!-- Spinner -->
<div class="flex items-center gap-3">
  <div class="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  <span>Loading...</span>
</div>

<!-- Progress bar -->
<div class="h-1 bg-muted rounded-full overflow-hidden">
  <div class="h-full bg-primary rounded-full animate-pulse"
    style="width: 65%; animation: pulse 1.5s ease-in-out infinite;"></div>
</div>
```

#### Success/Error Animations

```astro
<!-- Success toast -->
<div class="
  p-4 rounded-lg bg-green-500/10 border border-green-500/20
  animate-fadeInUp
  flex items-start gap-3
">
  <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">
    <!-- Check icon -->
  </svg>
  <p class="text-green-700">Success message</p>
</div>

<!-- Error shake animation -->
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

<div class="animate-shake" style="animation: shake 0.3s ease-in-out;">
  Error message
</div>
```

### 2.4 Animation Timing

| Duration | Use Case |
|----------|----------|
| 150ms | UI micro-interactions (hover, focus) |
| 200ms | Button clicks, form interactions |
| 300ms | Standard transitions, page sections |
| 500ms | Modals, significant layout changes |
| 800ms+ | Long-form animations, intentional delays |

```astro
<!-- Micro-interaction: 150ms -->
<button class="transition-all duration-150 hover:bg-primary/90">
  Quick feedback
</button>

<!-- Standard transition: 300ms -->
<div class="transition-all duration-300 hover:shadow-lg">
  Card animation
</div>

<!-- Modal: 500ms -->
<dialog class="
  opacity-0 scale-95
  data-[open]:opacity-100 data-[open]:scale-100
  transition-all duration-500
">
  Modal
</dialog>
```

### 2.5 Motion Preferences

**REQUIREMENT:** Respect `prefers-reduced-motion` system setting.

```css
/* Disable all animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.6 Hero Section Animation

```astro
<section class="relative overflow-hidden px-4 py-32">
  <!-- Background blurs -->
  <div class="absolute inset-0 -z-10 overflow-hidden">
    <!-- Left blur - float in from left -->
    <div class="
      absolute left-1/4 top-0 h-96 w-96
      rounded-full bg-primary/10 blur-[120px]
      opacity-0 animate-fadeIn
    "></div>

    <!-- Right blur - float in from right -->
    <div class="
      absolute right-1/3 bottom-0 h-80 w-80
      rounded-full bg-accent/10 blur-[120px]
      opacity-0 animate-fadeIn
      animation-delay-200ms
    "></div>
  </div>

  <!-- Content -->
  <div class="max-w-4xl mx-auto text-center">
    <!-- Badge slides in -->
    <div class="
      inline-block mb-6
      opacity-0 animate-fadeInUp
      animation-delay-100ms
    ">
      <span class="text-sm font-medium">New Feature</span>
    </div>

    <!-- Title slides in -->
    <h1 class="
      text-5xl font-bold mb-6
      opacity-0 animate-fadeInUp
      animation-delay-200ms
    ">
      Main Title
    </h1>

    <!-- Subtitle slides in -->
    <p class="
      text-xl text-muted-foreground mb-12
      opacity-0 animate-fadeInUp
      animation-delay-300ms
    ">
      Subtitle
    </p>

    <!-- Buttons slide in -->
    <div class="
      flex gap-4 justify-center
      opacity-0 animate-fadeInUp
      animation-delay-400ms
    ">
      <button>Primary CTA</button>
      <button>Secondary CTA</button>
    </div>
  </div>

  <!-- Scroll indicator bounces -->
  <div class="flex justify-center mt-12">
    <svg class="w-6 h-6 animate-bounce">
      <!-- Chevron down icon -->
    </svg>
  </div>
</section>
```

### 2.7 Playground Animation

```astro
<!-- Form appears on load -->
<form class="opacity-0 animate-fadeInUp animation-delay-200ms space-y-4">
  <!-- Form fields -->
</form>

<!-- Data updates with fade -->
<div class="
  relative transition-opacity duration-300
  opacity-0 data-[loaded]:opacity-100
">
  <pre>{JSON.stringify(liveData)}</pre>
</div>

<!-- Stats cards stagger in -->
{stats.map((stat, i) => (
  <div
    class="
      opacity-0 animate-fadeInUp
      rounded-lg p-6 border border-border text-center
    "
    style={{
      animationDelay: `${i * 100}ms`
    }}
  >
    <p class="text-2xl font-bold">{stat.value}</p>
    <p class="text-sm text-muted-foreground">{stat.label}</p>
  </div>
))}
```

### 2.8 Relationship Graph Animation

```astro
<!-- Graph canvas with fade in -->
<div class="
  rounded-lg border border-border overflow-hidden
  opacity-0 animate-fadeIn animation-delay-300ms
">
  <canvas class="w-full h-[500px]"></canvas>
</div>

<!-- Selected entity info slides in from right -->
<div class="
  rounded-lg bg-background p-6
  opacity-0 animate-slideInRight
  animation-delay-400ms
">
  <!-- Entity properties -->
</div>

<!-- Connected items with stagger -->
{connections.map((conn, i) => (
  <div
    class="
      flex items-center gap-2 p-2
      opacity-0 animate-fadeInUp
      rounded-md hover:bg-muted
      transition-colors duration-200
    "
    style={{
      animationDelay: `${500 + i * 50}ms`
    }}
  >
    {/* Connection item */}
  </div>
))}
```

### 2.9 CTA Section Animation

```astro
<section class="
  relative overflow-hidden px-4 py-28
  bg-gradient-to-br from-primary to-primary/80
  text-primary-foreground
">
  <!-- Content stagger -->
  <div class="max-w-4xl mx-auto text-center">
    <!-- Icon floats -->
    <div class="
      mb-6 flex justify-center
      opacity-0 animate-fadeIn
    ">
      <div class="animate-float">
        <!-- Icon -->
      </div>
    </div>

    <!-- Headline slides in -->
    <h2 class="
      text-5xl font-bold mb-6
      opacity-0 animate-fadeInUp
      animation-delay-100ms
    ">
      Ready to build?
    </h2>

    <!-- Description slides in -->
    <p class="
      text-xl opacity-0 animate-fadeInUp
      animation-delay-200ms
    ">
      Get started with the ontology
    </p>

    <!-- Buttons slide in -->
    <div class="
      flex gap-4 justify-center mt-8
      opacity-0 animate-fadeInUp
      animation-delay-300ms
    ">
      <button>Get Started</button>
      <button>Learn More</button>
    </div>

    <!-- Stats appear with stagger -->
    {stats.map((stat, i) => (
      <div
        class="
          opacity-0 animate-fadeIn
          animation-delay-[${400 + i * 100}ms]
        "
      >
        {stat}
      </div>
    ))}
  </div>
</section>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 2024 | Initial accessibility and animation specifications |

---

**Specifications Maintained By:** Design Agent
**Last Updated:** October 25, 2024
**Status:** Production Ready

---

## Quick Reference

### Accessibility Checklist
- [ ] Semantic HTML
- [ ] WCAG AAA contrast (4.5:1 body, 3:1 large)
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Forms properly labeled
- [ ] Touch targets 44x44px
- [ ] Mobile zoom not disabled

### Animation Checklist
- [ ] All animations < 500ms (except intentional)
- [ ] `prefers-reduced-motion` respected
- [ ] No autoplay audio/video
- [ ] Animations enhance, don't distract
- [ ] Smooth easing (ease-in-out, ease-out)
- [ ] Staggered animations for lists
- [ ] Loading states animated
- [ ] Focus states visible
