---
description: Guidelines for using Astro client directives and interactive components
glob_patterns:
  - "src/**/*.astro"
  - "src/components/**/*.tsx"
  - "src/components/**/*.jsx"
---

# Astro 5.5

## Client Directives

When using interactive components in Astro, always use the appropriate client directive:

- `client:load` - Component loads and hydrates immediately on page load
- `client:idle` - Component loads after the page is done with its initial load and the browser's "idle callback" runs
- `client:visible` - Component loads when it enters the viewport using Intersection Observer
- `client:media` - Component loads when a CSS media query is met
- `client:only` - Component skips server-rendering and only renders on the client

## Best Practices

### 1. Choose the Right Directive

```astro
<!-- For critical UI elements that need immediate interactivity -->
<InteractiveComponent client:load />

<!-- For components that can wait until the page is idle -->
<AccordionComponent client:idle />

<!-- For components that only need to be interactive when visible -->
<LazyLoadedComponent client:visible />

<!-- For components that should only appear on certain screen sizes -->
<MobileNavigation client:media="(max-width: 768px)" />
```

### 2. Working with Shadcn/UI Components

Shadcn/UI components that require interactivity must use client directives:

```astro
---
import { Accordion } from "@/components/ui/accordion-wrapper";
import { Tabs } from "@/components/ui/tabs-wrapper";
---

<!-- Use client:idle for components that don't need immediate interactivity -->
<Accordion data={accordionData} client:idle />

<!-- Use client:load for critical interactive components -->
<Tabs items={tabItems} client:load />
```

### 3. Wrapper Components for Complex UI

For complex Shadcn/UI components that use React context, create wrapper components:

```tsx
// src/components/ui/accordion-wrapper.tsx
import {
  Accordion as BaseAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionData {
  title: string;
  content: string;
  value: string;
}

export function Accordion({ data }: { data: AccordionData[] }) {
  return (
    <BaseAccordion type="single" collapsible className="w-full">
      {data.map((item) => (
        <AccordionItem value={item.value} key={item.value}>
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </BaseAccordion>
  );
}
```

### 4. Hydration Errors Prevention

To prevent hydration errors:

- Ensure server and client render the same content
- Use mounting checks for components with different server/client output
- Avoid conditional rendering based on client-only APIs

```tsx
import { useEffect, useState } from "react";

export function ClientComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div>Loading...</div>; // Server-side placeholder
  }
  
  return <div>Client-side content</div>;
}
```

### 5. Performance Optimization

- Use `client:visible` for below-the-fold components
- Lazy load non-critical components
- Split large components into smaller chunks
- Minimize the number of hydrated components

```astro
<!-- Only hydrate when scrolled into view -->
<HeavyComponent client:visible />

<!-- Only hydrate on larger screens -->
<ComplexDashboard client:media="(min-width: 1024px)" />
```

### 6. Common Pitfalls to Avoid

- **DON'T** use client directives on non-interactive components
- **DON'T** use `client:load` for everything (performance impact)
- **DON'T** forget to wrap Shadcn/UI components that use React context
- **DON'T** mix `className` (React) and `class` (Astro) attributes
- **DON'T** use browser-only APIs without checking for their existence

### 7. Specific Component Guidelines

#### Accordion

```astro
---
import { Accordion } from "@/components/ui/accordion-wrapper";

const accordionData = [
  {
    title: "Is it accessible?",
    content: "Yes. It adheres to the WAI-ARIA design pattern.",
    value: "item-1"
  },
  // More items...
];
---

<Accordion data={accordionData} client:idle />
```

#### Tabs

```astro
---
import { Tabs } from "@/components/ui/tabs-wrapper";

const tabItems = [
  {
    value: "tab1",
    label: "Tab 1",
    content: "Content for Tab 1"
  },
  // More tabs...
];
---

<Tabs items={tabItems} client:idle />
```

#### Dialog/Modal

```astro
---
import { Dialog } from "@/components/ui/dialog-wrapper";
---

<Dialog
  title="Important Information"
  description="This is important information that needs your attention."
  client:load
>
  <button>Open Dialog</button>
</Dialog>
```

## Testing Interactive Components

Always test interactive components in multiple scenarios:

1. Initial page load
2. After navigation
3. After browser resize
4. With slow network conditions
5. With JavaScript temporarily disabled (for graceful degradation) 

To align your coding standards and rules with Astro 5.5, consider the following updates:

# Content Collections

- **Schema Definitions**: Continue using `src/content/config.ts` with `zod` for type-safe content validation.
- **Content Queries**: Utilize `getCollection()` for type-safe content retrieval.
- **Frontmatter Schemas**: Define schemas using `defineCollection`.
- **Single Entry Retrieval**: Employ `getEntryBySlug` for fetching individual entries.
- **Content Relationships**: Leverage collection references to establish relationships between content items.

# View Transitions

- **Implementation**: Use `transition:name` and `transition:animate` directives to define view transitions.
- **State Persistence**: Apply `transition:persist` to maintain component state during page transitions.
- **Animation Configuration**: Set animations with `transition:animate="slide|fade|none"`.
- **Event Handling**: Manage transition events using `document.addEventListener('astro:page-load')`.
- **Prop Preservation**: Use `transition:persist-props` to retain specific props during transitions.

# Islands Architecture

- **Immediate Interactivity**: Apply `client:load` for components requiring immediate interactivity.
- **Deferred Hydration**: Use `client:visible` for components that can delay hydration until visible.
- **Client-Only Components**: Implement `client:only` when server-side rendering is unnecessary.
- **Responsive Hydration**: Utilize `client:media` for components that hydrate based on media queries.
- **Idle Hydration**: Leverage `client:idle` for non-critical interactive components.

# Server-Side Features

- **Cookies Management**: Use `Astro.cookies` to handle server-side cookies.
- **Middleware**: Implement middleware with `defineMiddleware()` in `src/middleware`.
- **Request Access**: Access request details via `Astro.request` in server endpoints.
- **Dynamic Routes**: Handle dynamic routes using the `[...spread].astro` pattern.
- **API Endpoints**: Create API endpoints in `src/pages/api` using `Response` objects.

# Image Optimization

- **Image Component**: Use the `Image` component with `src`, `alt`, and `width/height` props.
- **Picture Component**: Implement the `Picture` component for art direction.
- **Service Configuration**: Configure the image service in `astro.config.mjs`.
- **Modern Formats**: Use `format="avif,webp"` for modern image formats.
- **Responsive Images**: Apply the `densities` prop for responsive images.

# Integration System

- **Framework Integrations**: Configure integrations in `astro.config.mjs`.
- **Deployment Adapters**: Use adapters like `adapter-vercel`, `adapter-netlify`, or `adapter-node` for deployment.
- **Vite Plugins**: Implement Vite plugins through Astro integrations.
- **UI Frameworks**: Configure renderers for UI frameworks as needed.
- **Environment Variables**: Handle integration-specific environment variables appropriately.

# Routing and Pages

- **File-Based Routing**: Place pages in `src/pages` for automatic routing.
- **Dynamic Parameters**: Use `[param].astro` for dynamic route parameters.
- **Rest Parameters**: Implement `[...spread].astro` for rest parameters in routes.
- **Redirects**: Handle redirects using `Astro.redirect`.
- **Nested Layouts**: Implement nested layouts using slot patterns.

# Dos

- **Static Path Generation**: Use `getStaticPaths` for generating static paths.
- **Hydration Strategies**: Implement appropriate island hydration strategies.
- **Type-Safe Content**: Utilize content collections for type-safe content management.
- **View Transitions**: Configure view transitions appropriately.
- **SSR Capabilities**: Leverage server-side rendering capabilities effectively.

# Don'ts

- **Overusing `client:load`**: Avoid using `client:load` when `client:visible` suffices.
- **Mixing SSR and `client:only`**: Never mix server-side rendering and `client:only` in the same component.
- **Redundant Queries**: Avoid unnecessary content collection queries.
- **Skipping Animations**: Don't skip view transition animations without reason.
- **Bypassing Image Optimization**: Never bypass Astro's image optimization features.

By incorporating these practices, you can effectively leverage the features introduced in Astro 5.5 to enhance your project's performance and maintainability. 