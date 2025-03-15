---
title: "Astro 5 For Cursor Rules"
description: "Prompt for Astro 5"
tags: ["astro"]
date: 2025-03-16
---
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