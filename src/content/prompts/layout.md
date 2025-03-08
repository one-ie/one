---
title: "Layout Generator"
description: "A sophisticated mobile-first layout system for Astro pages with responsive sidebars and dynamic panels"
tags: ["layout", "astro", "react", "shadcn-ui", "responsive", "performance"]
date: 2024-02-03
---

# Advanced Layout System

## Panel Modes

### Icon Mode
- Main Content: 100%
- Right Panel: Fixed 48px icon at bottom right
- Use Case: Maximum content space with quick chat access

### Floating Mode
- Main Content: 100%
- Right Panel: Floating window (320px × 480px)
- Use Case: Quick chat interactions while viewing content

### Quarter Mode
- Main Content: 75%
- Right Panel: 25% (minimum 320px)
- Use Case: Content-focused with persistent chat

### Half Mode
- Main Content: 50%
- Right Panel: 50%
- Use Case: Equal focus on content and chat

### Full Mode
- Main Content: 0%
- Right Panel: 100%
- Use Case: Dedicated chat experience

## Responsive Behavior

### Desktop (>1024px)
- Supports all modes
- Panel transitions are smooth slides
- Main content reflows with panel changes

### Tablet (768px - 1024px)
- Quarter has minimum width of 320px 
- Half and Full not available
- Icon and Floating remain unchanged

### Mobile (<768px)
- Icon triggers full screen mode

## Additional Considerations

### Z-Index Stacking
- Icon Mode: 100
- Floating Mode: 1000
- Overlay Modes: 2000
- Modal Dialogs: 3000

### Transition Timings
- Panel Expand/Collapse: 200ms
- Mode Transitions: 300ms
- Overlay Animations: 250ms

### Safe Areas
- Respects device safe areas on mobile
- Adjusts for notches and home indicators
- Bottom spacing accounts for keyboard

### Accessibility
- Maintains minimum touch target size (44px)
- Preserves readable line lengths when resizing
- Ensures sufficient contrast in collapsed states

### Performance
- Lazy loads panel content when collapsed
- Throttles resize calculations
- Uses CSS containment for layout isolation


## Architectural Principles

1. **Zero Layout Shifts**: Uses CSS grid + fixed positioning for stable render
2. **Device-Specific Optimization**: 
   - Mobile: Full-width single column
   - Tablet and Desktop: Three-column layout
3. **Performance First**:
   - Astro Islands architecture
   - React components hydrated only when visible
   - CSS containment for isolated rendering
4. **Synchronized Components**:
   - Shared state management via nanostores
   - Coordinated breakpoint handling
   - Unified animation timing

## Enhanced Component Sync

### Header-Sidebar Coordination
```typescript
// Header.tsx
<header className="...">
  {showLeft && <SidebarTrigger />} // Only renders when needed
  <img src="/logo.svg" className="mx-auto" /> // Perfectly centered
</header>

// Left.tsx
<SidebarProvider 
  defaultOpen={false}
  onOpenChange={updateNavState} // Syncs with global store
>
```

### Right Panel Adaptive Sizing
```typescript
// Right.tsx
const Right = () => {
  const currentSize = useStore(rightSize); // Shared across components
  // Maintains chat history during resizing

}
```

## Performance Optimization Guide

### Astro Directives Usage
```astro
// Layout.astro
<Header client:load /> // Hydrate on load
<Footer client:visible /> // Hydrate when scrolled into view
```

### Lighthouse 100% Strategy

1. **Critical CSS Inlining**:
   ```astro
   <style>
     /* Grid system + font faces */
   </style>
   ```

2. **Resource Prioritization**:
   ```html
   <link rel="preload" href="/logo.svg" as="image">
   ```

3. **Image Optimization**:
   ```astro
   <Image 
     src="/hero.jpg"
     alt="Hero"
     widths={[400, 800, 1200]}
     formats={['avif', 'webp']}
     loading="eager"
   />
   ```

## Responsive Whitespace System

| Breakpoint   | Padding | Gap     | Max Width |
|--------------|---------|---------|-----------|
| <768px (Mobile) | 1rem    | 1rem    | 100%      |
| 768-1024px (Tablet) | 1.5rem | 1.5rem  | 90%       |
| >1024px (Desktop) | 2rem   | 2rem    | 80ch      |

```css
.main-content {
  padding: var(--space);
  gap: var(--gap);
  max-width: var(--max-width);
}
```

## Component Sync Diagram

```
[Left Sidebar] ↔ [Layout Grid] ↔ [Right Panel]
      ↑                   ↑                ↑
   [Header]          [Main Content]     [Footer]
```

Key synchronization points:
1. Mobile menu state shared between Header/Left
2. Right panel size syncs with viewport breakpoints
3. Shared theme context across all components
4. Coordinated loading states

This layout system provides a highly configurable, mobile-first design for Astro pages that adapts beautifully across mobile, tablet, and desktop views.

## Core Structure

The layout consists of three main sections:
- Left Sidebar (Navigation)
- Center Content
- Right Panel (AI Assistant)

### Center Content Structure
The center section is organized into three rows:
1. Header - Contains navigation controls and breadcrumbs
2. Main Content - Your page content
3. Footer - Optional footer content

## Key Components

### Layout.astro
The main layout component that orchestrates all parts. Configurable through props:

```typescript
interface LayoutProps {
  title: string;
  description?: string;
  children: any;
  chat?: any;
  header?: boolean;     // Show/hide header
  footer?: boolean;     // Show/hide footer
  left?: boolean;       // Show/hide left sidebar
  leftSize?: "expanded" | "collapsed";
  right?: boolean;      // Show/hide right panel
  rightSize?: "full" | "half" | "quarter" | "icon";
}
```

### Header Component
Features:
- Left sidebar toggle (hidden if sidebar is disabled)
- Logo (centered in the exact center of the page )
- Right panel toggle (hidden if panel is disabled)
- Responsive breadcrumb navigation
- Sticky positioning with backdrop blur

### Left Sidebar (Navigation)
Built with shadcn-ui sidebar:
- Collapsible navigation menu
- Floating variant on desktop
- Icon-only collapsed state
- Full-width on mobile
- Mouse hover expansion
- Click outside to close on mobile

### Right Panel (AI Assistant)
Features:
- Four size modes:
  - Full (100% width)
  - Half (50% width)
  - Quarter (25% width, min 320px)
  - Icon (48px floating button)
- Mobile optimizations:
  - Slides in from right
  - Full-width when open
  - Floating icon when collapsed
- Smooth transitions
- Backdrop blur effects
- Size controls in header

## Responsive Behavior

### Mobile (<768px)
- Left sidebar: Full-width overlay when open
- Right panel: Full-width overlay or floating icon
- Single column layout
- Hamburger menu for navigation
- Touch-friendly interactions

### Tablet (768px - 1024px)
- Left sidebar: Icon mode or expanded
- Right panel: Adjustable width
- Fluid transitions
- Optional collapsing of panels

### Desktop (>1024px)
- Full three-column layout capability
- Hover interactions for sidebars
- Maximum content width constraints
- Optimal reading experience

## Usage Example

```astro
---
import Layout from "../layouts/Layout.astro";

const chatConfig = {
  // Your AI chat configuration
};
---

<Layout 
  title="My Page"
  description="Page description"
  header={true}
  footer={true}
  left={true}
  leftSize="expanded"
  right={true}
  rightSize="quarter"
  chatConfig={chatConfig}
>
  <main>
    Your content here
  </main>
</Layout>
```

## CSS Variables

The layout system uses CSS variables for consistent sizing:

```css
:root {
  --right-panel-width: var(--right-width-full);
  --right-width-full: 100vw;
  --right-width-half: 50%;
  --right-width-quarter: 25%;
  --right-width-icon: 48px;
  --left-sidebar-width: 240px;
  --header-height: 60px;
}
```

## Accessibility Features

- Proper ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader friendly structure
- High contrast mode support
- Reduced motion preferences respected

## Performance Considerations

- Lazy-loaded components where appropriate
- Smooth transitions and animations
- Efficient re-renders
- Optimized mobile performance
- Minimal layout shifts

## Chat Configuration

The layout includes an AI chat system that can be customized through the `chatConfig` prop. Here's the configuration structure:

```typescript
interface Chat {
  systemPrompt: {
    type: "text";
    text: string;
  }[];
  welcome: {
    message: string;
    avatar: string;
    suggestions: {
      label: string;
      prompt: string;
    }[];
  };
}
```

### Example Configuration

```typescript
const chatConfig = {
  systemPrompt: [{
    type: "text",
    text: "I am Agent ONE, an AI assistant focused on helping developers and businesses maximize value from free software. I provide clear, actionable guidance while maintaining a friendly and professional tone."
  }],
  welcome: {
    message: "👋 I'm Agent ONE, your guide to maximizing business value with free software. What would you like to explore today?",
    avatar: "/icon.svg",
    suggestions: [
      {
        label: "💡 How can I use ONE commercially?",
        prompt: "I'm interested in using ONE for my business. Can you explain the commercial rights and possibilities under the ONE License?"
      },
      {
        label: "🚀 Quick Start Guide",
        prompt: "What are the first 3 steps to get started with ONE for my project?"
      },
      {
        label: "💼 White-Label Options",
        prompt: "Tell me about the white-label possibilities with ONE. How can I brand it as my own solution?"
      }
    ]
  }
};
```

### Configuration Options

#### System Prompt
- Defines the AI assistant's personality and behavior
- Can include multiple prompt segments
- Type is currently limited to "text"

#### Welcome Message
- `message`: Initial greeting shown to users
- `avatar`: Path to the avatar image
- `suggestions`: Array of quick-start prompts
  - `label`: Button text shown to user
  - `prompt`: Actual message sent when clicked

### Integration with Right Panel

The chat interface appears in the Right Panel component and adapts to all panel sizes:
- Full width: Complete chat experience
- Half/Quarter: Compact but fully functional
- Icon mode: Click to expand

The chat maintains state and history across size changes and remains functional in all responsive breakpoints.

## Component Loading Strategy

### Dynamic Imports
For optimal performance, components are loaded based on their priority:

```astro
---
// Critical path components - load immediately
import Header from "../components/Header";
import Footer from "../components/Footer";

// Async components - load when needed
const Chart = await import("../components/Chart").then(mod => mod.Chart);
---

<Layout>
  <Header client:load /> <!-- Critical UI -->
  <Chart client:visible /> <!-- Load when visible -->
  <Footer client:idle /> <!-- Load during idle time -->
</Layout>
```

### Hydration Directives

| Directive | Usage | Example |
|-----------|--------|---------|
| client:load | Critical UI components | Header, Navigation |
| client:visible | Below-fold content | Charts, Data tables |
| client:idle | Non-critical features | Footer, Social links |
| client:media | Device-specific | Mobile menu |
| client:only | Framework-specific | React components |

### Error Handling

Always implement fallbacks for dynamic imports:

```typescript
const Chart = async () => {
  try {
    const mod = await import("../components/Chart");
    return mod.Chart;
  } catch (error) {
    console.error("Chart failed to load:", error);
    return () => <div>Chart unavailable</div>;
  }
};
```

## Performance Optimization

### 1. Component Loading
- Use `client:visible` for below-fold content
- Implement loading states
- Provide fallback UI
- Handle failed imports gracefully

### 2. Asset Loading
```astro
---
import { Image } from "astro:assets";
---

<Image 
  src={import("../assets/hero.jpg")} 
  alt="Hero"
  loading="eager" 
  width={800} 
  height={600} 
/>
```

### 3. State Management
```typescript
// stores/layout-store.ts
import { atom } from 'nanostores';

// Atomic updates prevent unnecessary re-renders
export const layoutState = atom({
  sidebarOpen: false,
  rightPanelSize: 'quarter',
  theme: 'light'
});
```

### 4. CSS Strategy
```css
/* Critical CSS inlined in head */
:root {
  --layout-timing: 200ms ease-in-out;
  --layout-z-index: {
    base: 1,
    sidebar: 10,
    header: 20,
    modal: 30
  };
}

/* Component-specific CSS loaded on demand */
@layer components {
  .sidebar-transition {
    transition: transform var(--layout-timing);
  }
}
```

## Component Architecture

### Layout Grid System
```astro
<div class="layout-grid">
  <aside class="left-sidebar" data-state={sidebarOpen ? 'open' : 'closed'}>
    <slot name="sidebar" />
  </aside>
  
  <main class="main-content">
    <slot />
  </main>
  
  <aside class="right-panel" data-size={rightPanelSize}>
    <slot name="panel" />
  </aside>
</div>

<style>
  .layout-grid {
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--layout-gap);
    min-height: 100vh;
  }
</style>
```

### Error Boundaries
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function fallbackComponent({ error }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
    </div>
  );
}

<ErrorBoundary FallbackComponent={fallbackComponent}>
  <DynamicComponent />
</ErrorBoundary>
```

## Best Practices

1. **Loading States**
   - Always show loading indicators
   - Maintain layout stability
   - Prevent content jumps

2. **Error States**
   - Graceful fallbacks
   - User-friendly error messages
   - Recovery options

3. **Performance Monitoring**
   - Track Core Web Vitals
   - Monitor hydration errors
   - Implement error tracking

4. **Accessibility**
   - Proper ARIA attributes
   - Keyboard navigation
   - Screen reader support

## Debugging Tips

1. Check React DevTools for component hierarchy
2. Monitor Network tab for loading issues
3. Use Performance tab to track bottlenecks
4. Implement error logging
5. Test on multiple devices and connections

## Common Issues

1. **Hydration Mismatch**
   - Ensure server and client markup match
   - Use proper client directives
   - Check for undefined window/document usage

2. **Layout Shifts**
   - Set explicit dimensions
   - Use CSS containment
   - Implement proper loading states

3. **Performance Issues**
   - Lazy load non-critical components
   - Optimize images and assets
   - Minimize JavaScript bundles
