# Frontend Development Workflow

**Version:** 2.0.0
**Status:** Active
**Stack:** Astro 5 + React 19 + shadcn/ui + Tailwind v4

## Overview

This document categorizes all tasks for building Astro websites cloned from `/frontend`, mapping them to the 6-dimension ontology and defining clear workflows for pages, components, styling, and deployment.

---

## The 6-Dimension Frontend Mapping

Every frontend feature maps to the ontology:

```
┌────────────────────────────────────────────────────────────┐
│ 1. ORGANIZATIONS → Multi-tenant UI                         │
│    Pages: /app/[orgId]/, /settings/organizations/          │
│    Components: OrgSwitcher, OrgSettings                    │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 2. PEOPLE → Auth & Authorization                           │
│    Pages: /account/*, /signin, /signup                     │
│    Components: AuthForm, RoleGuard, PermissionsTable       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 3. THINGS → Entity Management                              │
│    Pages: /courses/*, /agents/*, /tokens/*                 │
│    Components: CourseCard, AgentList, TokenDashboard       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 4. CONNECTIONS → Relationships                             │
│    Components: FollowersList, ConnectionsGraph, RelatedItems│
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 5. EVENTS → Activity Feeds                                 │
│    Components: ActivityTimeline, EventLog, Analytics       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ 6. KNOWLEDGE → Search & Discovery                          │
│    Components: SearchBar, RAGInterface, RecommendationFeed │
└────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
src/
├── pages/              # File-based routing (SSR)
│   ├── index.astro     # Landing pages
│   ├── blog/           # Content collection pages
│   ├── app/            # Authenticated app pages
│   ├── account/        # Auth pages
│   └── api/            # API endpoints
├── layouts/            # Page layouts
│   ├── Layout.astro    # Main layout
│   ├── Blog.astro      # Blog post layout
│   └── AppLayout.astro # App layout
├── components/         # React components
│   ├── ui/             # shadcn/ui components (50+)
│   ├── features/       # Feature-specific components
│   ├── auth/           # Auth components
│   └── app/            # App components
├── content/            # Content collections
│   ├── blog/           # Blog posts (markdown)
│   └── config.ts       # Content schemas
├── lib/                # Utilities
├── hooks/              # React hooks
├── stores/             # Nanostores
└── styles/             # Global CSS + Tailwind config
```

### The Three Frontend Layers

```
┌────────────────────────────────────────────────────────┐
│ LAYER 1: PAGES (.astro files)                          │
│ • File-based routing (src/pages/)                      │
│ • SSR data fetching in frontmatter                     │
│ • Static HTML generation                               │
│ • Pass props to components                             │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│ LAYER 2: COMPONENTS (.tsx files)                       │
│ • React 19 islands architecture                        │
│ • Selective hydration (client:load)                    │
│ • Interactive UI elements                              │
│ • shadcn/ui + Tailwind styling                         │
└────────────────────────────────────────────────────────┘
                        ↓
┌────────────────────────────────────────────────────────┐
│ LAYER 3: LAYOUTS (.astro files)                        │
│ • Shared page structure                                │
│ • SEO meta tags                                        │
│ • Global navigation                                    │
│ • Theme initialization                                 │
└────────────────────────────────────────────────────────┘
```

**Key Frontend Features:**

- ✅ Static site generation with dynamic islands
- ✅ Optimal performance (minimal JavaScript)
- ✅ SEO-friendly server-rendered HTML
- ✅ Progressive enhancement
- ✅ Type-safe with TypeScript

---

## Page Type Taxonomy

### 1. Landing Pages

**Purpose:** Marketing, education, conversion
**Examples:** `index.astro`, `ontology.astro`, `creators.astro`, `software.astro`

**Structure:**

```astro
---
import Layout from '@/layouts/Layout.astro';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
---

<Layout title="Page Title">
  <!-- Hero Section -->
  <section class="min-h-screen">
    <h1>Headline</h1>
    <p>Subheadline</p>
    <Button>CTA</Button>
  </section>

  <!-- Features Section -->
  <section class="grid grid-cols-3 gap-8">
    <Card>Feature 1</Card>
    <Card>Feature 2</Card>
    <Card>Feature 3</Card>
  </section>
</Layout>
```

**Key Patterns:**

- Static generation (`export const prerender = true`)
- USAL animations (`data-usal="fade-up duration-600"`)
- Semantic colors (`bg-background`, `text-foreground`)
- Responsive grids (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)

---

### 2. Blog Pages

**Purpose:** Content collections with search & discovery
**Examples:** `blog/index.astro`, `blog/[...slug].astro`

**Index Pattern:**

```astro
---
import { getCollection } from 'astro:content';
import { BlogSearch } from '@/components/BlogSearch';

const posts = await getCollection('blog');
const viewMode = Astro.url.searchParams.get('view') || 'list';
---

<Layout title="Blog">
  <BlogSearch client:load posts={posts} viewMode={viewMode} />
</Layout>
```

**Dynamic Page Pattern:**

```astro
---
import { getCollection } from 'astro:content';
import BlogPost from '@/layouts/Blog.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content, headings } = await entry.render();
---

<BlogPost entry={entry} headings={headings}>
  <Content />
</BlogPost>
```

**Key Patterns:**

- Content collections with Zod schemas
- Static generation with `getStaticPaths()`
- `client:load` for interactive search
- View modes (list/grid) via URL params

---

### 3. App Pages (Authenticated)

**Purpose:** Real-time authenticated dashboards
**Examples:** `app/index.astro`, `app/courses/[id].astro`

**Pattern:**

```astro
---
import AppLayout from '@/layouts/AppLayout.astro';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { CourseView } from '@/components/features/courses/CourseView';

// SSR: Fetch initial data
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const course = await convex.query(api.courses.get, { id: Astro.params.id });

// Check auth (middleware handles redirects)
const session = Astro.locals.session;
---

<AppLayout title={course.name}>
  <CourseView
    client:load
    courseId={course._id}
    initialData={course}
  />
</AppLayout>
```

**Key Patterns:**

- `AppLayout.astro` for authenticated shell
- SSR with `ConvexHttpClient` for initial data
- Real-time updates via `useQuery()` in components
- Middleware handles auth checks

---

### 4. Account Pages (Auth)

**Purpose:** Sign in, sign up, password reset, settings
**Examples:** `account/signin.astro`, `account/signup.astro`, `account/settings.astro`

**Pattern:**

```astro
---
import Layout from '@/layouts/Layout.astro';
import { SignInForm } from '@/components/auth/SignInForm';
---

<Layout title="Sign In">
  <div class="max-w-md mx-auto">
    <SignInForm client:load />
  </div>
</Layout>
```

**Key Patterns:**

- Better Auth integration
- Form validation with React Hook Form
- OAuth providers (GitHub, Google)
- Email verification flow
- 2FA support

---

### 5. API Routes

**Purpose:** Server-side endpoints
**Examples:** `api/hello.ts`, `rss.xml.ts`

**Pattern:**

```typescript
// src/pages/api/thing.ts
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  return new Response(JSON.stringify({ data: "value" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
```

---

## Component Type Taxonomy

### 1. UI Components (shadcn/ui)

**Location:** `src/components/ui/`
**Examples:** `button.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`

**Pattern:**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "rounded-md bg-primary text-primary-foreground px-4 py-2",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
```

**Key Patterns:**

- Radix UI primitives
- `cn()` utility for class merging
- `forwardRef` for ref passing
- Semantic color tokens

---

### 2. Feature Components

**Location:** `src/components/features/[domain]/`
**Examples:** `CourseCard.tsx`, `TokenPurchase.tsx`, `AgentChat.tsx`

**Pattern:**

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CourseCardProps {
  courseId: string;
  title: string;
  description: string;
  price: number;
  onEnroll: (courseId: string) => Promise<void>;
}

export function CourseCard({
  courseId,
  title,
  description,
  price,
  onEnroll,
}: CourseCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    try {
      await onEnroll(courseId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${price}</span>
          <Button onClick={handleEnroll} disabled={loading}>
            {loading ? "Enrolling..." : "Enroll Now"}
          </Button>
        </div>
        {error && <p className="text-destructive text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
```

**Key Patterns:**

- ✅ Props-based interface (data passed from parent)
- ✅ Callback handlers for actions
- ✅ Local state for UI (loading, error)
- ✅ shadcn/ui components for consistent styling
- ✅ Type-safe with TypeScript interfaces

---

### 3. Layout Components

**Location:** `src/layouts/`
**Examples:** `Layout.astro`, `Blog.astro`, `AppLayout.astro`

**Main Layout Pattern:**

```astro
---
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from '@/components/ui/sonner';
import ThemeInit from '@/components/ThemeInit.astro';
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <ThemeInit />
  </head>
  <body class="min-h-screen bg-background">
    <Sidebar client:only="react">
      <slot />
    </Sidebar>
    <Toaster client:only="react" />
  </body>
</html>
```

---

## Task Categories

### Task 1: Create New Landing Page

**Steps:**

1. **Map to Ontology**

   - Which dimension(s)? (e.g., "Tokens" = THINGS dimension)
   - What entities? (e.g., token, creator, transaction)
   - What relationships? (e.g., creator → owns → token)

2. **Create Page File**

   ```bash
   touch src/pages/tokens.astro
   ```

3. **Define Structure**

   ```astro
   ---
   import Layout from '@/layouts/Layout.astro';
   import { Card } from '@/components/ui/card';
   ---

   <Layout title="Tokens">
     <section class="hero"><!-- Hero --></section>
     <section class="features"><!-- Features --></section>
     <section class="cta"><!-- CTA --></section>
   </Layout>
   ```

4. **Add Content**

   - Copy patterns from similar pages (e.g., `software.astro`)
   - Use semantic colors
   - Add USAL animations
   - Ensure responsive

5. **Test**
   ```bash
   bun run dev
   # Visit http://localhost:4321/tokens
   ```

---

### Task 2: Create New Blog Post

**Steps:**

1. **Create Markdown File**

   ```bash
   touch src/content/blog/my-post.md
   ```

2. **Add Frontmatter**

   ```markdown
   ---
   title: "My Post Title"
   description: "Brief description"
   date: 2025-10-11
   author: "ONE"
   tags: ["tutorial", "agents"]
   category: "tutorial"
   featured: false
   ---

   # Content here
   ```

3. **Sync Content Types**

   ```bash
   npx astro sync
   ```

4. **Preview**
   - Visit `/blog` to see in list
   - Click to view full post

---

### Task 3: Create New Feature Component

**Steps:**

1. **Map to Ontology**

   - What dimension? (e.g., "Token Purchase" = THINGS + EVENTS)
   - What data? (e.g., token entity, purchase event)
   - What mutations? (e.g., `api.tokens.purchase`)

2. **Create Component Directory**

   ```bash
   mkdir -p src/components/features/tokens
   ```

3. **Create Component**

   ```bash
   touch src/components/features/tokens/TokenPurchase.tsx
   ```

4. **Implement Pattern**

   ```tsx
   import { useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";
   import { Button } from "@/components/ui/button";

   export function TokenPurchase({ tokenId }) {
     const purchase = useMutation(api.tokens.purchase);

     return (
       <Button onClick={() => purchase({ tokenId, amount: 100 })}>
         Purchase
       </Button>
     );
   }
   ```

5. **Use in Page**

   ```astro
   ---
   import { TokenPurchase } from '@/components/features/tokens/TokenPurchase';
   ---

   <TokenPurchase client:load tokenId={token._id} />
   ```

---

### Task 4: Create New App Page (Authenticated)

**Steps:**

1. **Create Page**

   ```bash
   touch src/pages/app/courses/[id].astro
   ```

2. **SSR Data Fetch**

   ```astro
   ---
   import { ConvexHttpClient } from 'convex/browser';
   import { api } from '@/convex/_generated/api';

   const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
   const course = await convex.query(api.courses.get, {
     id: Astro.params.id
   });
   ---
   ```

3. **Add Interactive Component**

   ```astro
   <AppLayout title={course.name}>
     <CourseView client:load courseId={course._id} />
   </AppLayout>
   ```

4. **Component with Real-time**
   ```tsx
   export function CourseView({ courseId, initialData }) {
     const course = useQuery(api.courses.get, { id: courseId });
     return <div>{course?.name || initialData.name}</div>;
   }
   ```

---

### Task 5: Update Existing Page

**Steps:**

1. **Identify File**

   ```bash
   # Example: Update homepage
   open src/pages/index.astro
   ```

2. **Read Existing Code**

   - Understand current structure
   - Identify sections to modify

3. **Make Changes**

   - Use same patterns as existing code
   - Maintain color scheme
   - Keep animations consistent

4. **Test Changes**

   ```bash
   bun run dev
   ```

5. **Build & Deploy**
   ```bash
   bun run build
   npx astro check
   ```

---

## Common Patterns

### Pattern 1: SSR + Hydration

```astro
---
// SSR: Fetch data server-side
const data = await fetch('...').then(r => r.json());
---

<!-- Static HTML rendered server-side -->
<div>{data.title}</div>

<!-- Interactive component hydrated client-side -->
<InteractiveComponent client:load initialData={data} />
```

---

### Pattern 2: Form Handling

```tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm({
  onSubmit,
}: {
  onSubmit: (data: FormData) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    };

    try {
      await onSubmit(data);
      setSuccess(true);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <div className="text-green-600">Message sent successfully!</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Input id="message" name="message" required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
```

---

### Pattern 3: Search & Filter

```tsx
export function SearchableList({ items }) {
  const [query, setQuery] = useState("");

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {filtered.map((item) => (
        <Card key={item.id}>{item.name}</Card>
      ))}
    </>
  );
}
```

---

### Pattern 4: View Mode Toggle

```astro
---
const view = Astro.url.searchParams.get('view') || 'list';
---

<div class="flex gap-2">
  <a href="?view=list" class={view === 'list' ? 'active' : ''}>
    List
  </a>
  <a href="?view=grid" class={view === 'grid' ? 'active' : ''}>
    Grid
  </a>
</div>

<div class={view === 'grid' ? 'grid grid-cols-3' : 'flex flex-col'}>
  {/* Items */}
</div>
```

---

## Styling Guidelines

### Semantic Colors

```astro
<!-- CORRECT: Use semantic tokens -->
<div class="bg-background text-foreground border border-border">
  <div class="bg-card text-card-foreground">
    <button class="bg-primary text-primary-foreground">
      Click Me
    </button>
  </div>
</div>

<!-- AVOID: Hard-coded colors -->
<div class="bg-white text-black border border-gray-200">
  ...
</div>
```

### Dark Mode

```astro
<!-- Colors automatically switch via CSS variables -->
<div class="bg-background dark:bg-background">
  <!-- Same class works in both modes -->
</div>
```

### Responsive Design

```astro
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Mobile-first approach -->
</div>
```

### Animations (USAL)

```astro
<div data-usal="fade-up duration-600 delay-100">
  <!-- Animates on scroll -->
</div>
```

---

## Deployment Workflow

### Local Development

```bash
# Start dev server
bun run dev

# Check TypeScript
npx astro check

# Build for production
bun run build

# Preview build
bun run preview
```

### Production Deploy

```bash
# Build
bun run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=astro-shadcn
```

### Environment Variables

```env
# Site configuration
PUBLIC_SITE_URL=https://your-domain.com

# Auth (if using Better Auth)
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
GITHUB_CLIENT_ID=your-github-oauth-id
GITHUB_CLIENT_SECRET=your-github-oauth-secret
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret

# Email (if using Resend)
RESEND_API_KEY=your-resend-api-key
```

---

## Quick Reference

### File Locations

| Type              | Location                   | Example                |
| ----------------- | -------------------------- | ---------------------- |
| Landing Page      | `src/pages/`               | `tokens.astro`         |
| Blog Post         | `src/content/blog/`        | `my-post.md`           |
| App Page          | `src/pages/app/`           | `courses/[id].astro`   |
| Auth Page         | `src/pages/account/`       | `signin.astro`         |
| Feature Component | `src/components/features/` | `tokens/TokenCard.tsx` |
| UI Component      | `src/components/ui/`       | `button.tsx`           |
| Layout            | `src/layouts/`             | `AppLayout.astro`      |

### Commands

```bash
bun run dev              # Start dev server
npx astro sync           # Sync content types
npx astro check          # TypeScript check
bun run build            # Production build
bun test                 # Run tests
wrangler pages deploy    # Deploy to Cloudflare
```

### Key Patterns

- **Hydration:** `client:load` directive for interactive React components
- **Static Generation:** `export const prerender = true`
- **Dynamic Routes:** `getStaticPaths()` for parameterized pages
- **Content Collections:** `getCollection('blog')` for type-safe content
- **SSR Data:** Fetch data in frontmatter, pass as props to components
- **Component Props:** Pass data down, callbacks up
- **Form Handling:** Controlled components with local state

---

## Next Steps

1. **Clone `/frontend`** to new project directory
2. **Install dependencies** with `bun install`
3. **Map feature to ontology** (6 dimensions: Organizations, People, Things, Connections, Events, Knowledge)
4. **Choose page type:**
   - **Landing Pages** - Marketing, static content
   - **Blog Pages** - Content collections with search
   - **App Pages** - Authenticated, interactive
   - **Account Pages** - Auth flows
   - **API Routes** - Server-side endpoints
5. **Create pages** in `src/pages/` following patterns above
6. **Create components** in `src/components/features/` with props-based interface
7. **Style with Tailwind** using semantic color tokens
8. **Test locally** with `bun run dev`
9. **Build** with `bun run build`
10. **Deploy** to Cloudflare Pages with `wrangler pages deploy`

**Remember:** Every feature maps to the 6-dimension ontology. If you can't map it, rethink the feature.

---

## Resources & References

### Core Documentation

**6-Dimension Ontology:**

- **[one/knowledge/ontology.md](../ontology.md)** - Complete ontology specification
  - 66 thing types, 25 connection types, 67 event types
  - Organizations, People, Things, Connections, Events, Knowledge

**Frontend Reference:**

- `/frontend` - Reference implementation
  - Astro 5 + React 19 + shadcn/ui + Tailwind v4
  - 50+ UI components
  - Auth system, blog system
  - Content collections

### External Resources

**Astro:**

- https://docs.astro.build/ - Official Astro documentation
- File-based routing
- Content collections
- Server-side rendering
- Islands architecture

**React 19:**

- https://react.dev/ - Official React documentation
- Hooks and state management
- Component patterns

**shadcn/ui:**

- https://ui.shadcn.com/ - Component library
- Built on Radix UI primitives
- Tailwind CSS styling

**Tailwind CSS v4:**

- https://tailwindcss.com/ - Utility-first CSS
- CSS-based configuration
- Dark mode support

---

## Summary

**ONE Frontend Development Workflow**

**Key Principles:**

1. **6-Dimension Ontology** - Map all features to: Organizations, People, Things, Connections, Events, Knowledge
2. **Islands Architecture** - Static HTML with selective hydration for interactivity
3. **Type Safety** - TypeScript strict mode throughout
4. **Component-Based** - Reusable React components with props-based interface
5. **Performance First** - Minimal JavaScript, optimal loading

**Page Types:**

- **Landing** - Marketing, static, SEO-optimized
- **Blog** - Content collections with search
- **App** - Authenticated, interactive
- **Account** - Auth flows
- **API** - Server-side endpoints

**Result:** Fast, SEO-friendly websites with excellent developer experience and maintainable code.

**ONE platform: Build beautiful, performant frontends with Astro.**
