---
name: agent-frontend:create-page
description: Generate Astro 5 pages with SSR, React islands, Convex queries, and 6-dimension ontology data binding
---

# Agent-Frontend: Create Page

## Purpose

Generate production-ready Astro pages that:
- Use server-side rendering (SSR) for fast initial load
- Fetch ontology data at build time
- Render static HTML when possible
- Use strategic React islands for interactivity
- Achieve 90+ Lighthouse scores
- Implement role-based access control

## When to Use This Skill

- Creating new pages for features
- Building public-facing pages with SSR
- Implementing list pages, detail pages, forms
- Integrating Convex data
- Optimizing Core Web Vitals

## Instructions

### 1. Understand Astro Islands Architecture

```
Page Structure:
├── Astro Component (SSR, runs at build time)
│   ├── Fetch data from Convex
│   ├── Render static HTML
│   └── Embed React islands for interactivity
└── React Islands (client-side, hydrated on demand)
    ├── Forms and inputs
    ├── Real-time updates
    └── User interactions
```

### 2. SSR Data Fetching Pattern

```astro
---
// This runs at build time (server-side)
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import { CourseCard } from '@/components/CourseCard';
import { EnrollButton } from '@/components/EnrollButton';

// Get organization from URL params
const { orgId } = Astro.params;

// Fetch data at build time
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const courses = await convex.query(api.queries.entities.list, {
  groupId: orgId,
  type: 'course',
  status: 'published',
});

const metadata = {
  title: 'Courses',
  description: 'Browse available courses',
};
---

<Layout {...metadata}>
  <div class="course-grid">
    {courses.map(course => (
      <article class="course-card">
        <!-- Static content (no JS needed) -->
        <CourseCard course={course} />

        <!-- Interactive island (hydrated only when needed) -->
        <EnrollButton client:load courseId={course._id} />
      </article>
    ))}
  </div>
</Layout>
```

### 3. Hydration Directive Selection

| Directive | Use Case | When Hydrated |
|-----------|----------|---------------|
| `client:load` | Critical interactivity | Immediately (blocks rendering) |
| `client:idle` | Non-critical features | When browser idle |
| `client:visible` | Below-fold content | When visible in viewport |
| `client:media` | Responsive features | When media query matches |
| `client:only` | Framework-specific | Never SSR |

**Rule:** Use the laziest directive that still works.

```astro
---
// Every interactive element needs a directive
---

<div>
  <!-- Static: No directive needed -->
  <h1>{course.name}</h1>
  <p>{course.properties.description}</p>

  <!-- Critical: Use client:load -->
  <EnrollButton client:load courseId={course._id} />

  <!-- Search/filter: Use client:idle -->
  <SearchBox client:idle />

  <!-- Comments section: Use client:visible -->
  <CommentsSection client:visible courseId={course._id} />

  <!-- Mobile menu: Use client:media -->
  <MobileNav client:media query="(max-width: 768px)" />
</div>
```

### 4. Organization Scoping

```astro
---
// ALWAYS scope to organization
const { orgId } = Astro.params;

// Validate organization access
const org = await convex.query(api.queries.organizations.get, { id: orgId });
if (!org || org.status === "inactive") {
  return Astro.redirect('/404');
}

// Fetch org-scoped data
const courses = await convex.query(api.queries.entities.list, {
  groupId: orgId,  // REQUIRED: Always filter by organization
  type: 'course',
});
---
```

### 5. Role-Based Rendering

```astro
---
const { userId, userRole } = Astro.locals;

// Query to get user's role in organization
const userOrg = await convex.query(api.queries.people.getInOrg, {
  userId,
  orgId,
});
---

<div>
  <!-- Everyone sees this -->
  <CourseInfo course={course} />

  <!-- Only org_owner sees this -->
  {userOrg.role === 'org_owner' && (
    <AdminPanel course={course} client:load />
  )}

  <!-- Only org_user or higher sees this -->
  {['org_owner', 'org_user'].includes(userOrg.role) && (
    <EditButton course={course} client:idle />
  )}
</div>
```

### 6. Performance Optimization

```astro
---
// Image optimization
import { Image } from 'astro:assets';
import thumbnail from '@/images/course-thumb.jpg';

// Responsive images
const imageOptions = {
  widths: [300, 600, 900],
  formats: ['webp', 'jpeg'],
};
---

<!-- Optimized image: lazy loaded, WebP format, responsive -->
<Image
  src={thumbnail}
  alt="Course thumbnail"
  {...imageOptions}
  loading="lazy"
/>

<!-- Critical image: load immediately -->
<Image
  src={logo}
  alt="Logo"
  loading="eager"
/>
```

### 7. Template: List Page

```astro
---
// pages/[orgId]/courses/index.astro
import Layout from '@/layouts/Layout.astro';
import { CourseCard } from '@/components/CourseCard';
import { CreateCourseButton } from '@/components/CreateCourseButton';

const { orgId } = Astro.params;

// Fetch courses at build time
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const courses = await convex.query(api.queries.entities.list, {
  groupId: orgId,
  type: 'course',
  status: 'published',
});

const metadata = {
  title: 'Courses',
  description: 'Explore our course catalog',
};
---

<Layout {...metadata}>
  <div class="courses-header">
    <h1>Courses</h1>
    <!-- Interactive button: hydrate on load for org_owner -->
    <CreateCourseButton client:load orgId={orgId} />
  </div>

  <div class="course-grid">
    {courses.map(course => (
      <CourseCard key={course._id} course={course} />
    ))}
  </div>
</Layout>
```

### 8. Template: Detail Page

```astro
---
// pages/[orgId]/courses/[courseId]/index.astro
import Layout from '@/layouts/Layout.astro';
import { CourseDetail } from '@/components/CourseDetail';
import { EnrollButton } from '@/components/EnrollButton';

const { orgId, courseId } = Astro.params;

// Fetch course at build time
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const course = await convex.query(api.queries.entities.get, {
  id: courseId,
  groupId: orgId,
});

if (!course) {
  return Astro.redirect('/404');
}

// Fetch related entities
const lessons = await convex.query(api.queries.entities.list, {
  groupId: orgId,
  type: 'lesson',
  properties: { courseId },
});
---

<Layout title={course.name} description={course.properties.description}>
  <article class="course-detail">
    <!-- Static content -->
    <CourseDetail course={course} lessons={lessons} />

    <!-- Interactive enrollment (client island) -->
    <EnrollButton client:load courseId={courseId} />
  </article>
</Layout>
```

## Critical Rules

1. **Fetch at build time** - Use `await` in Astro frontmatter, not useEffect
2. **Static first** - Render HTML statically, add JS only when needed
3. **Scope by organization** - Always include `groupId` in queries
4. **Validate access** - Check org status and user role
5. **Lazy load islands** - Use `client:visible` or `client:idle` when possible
6. **Optimize images** - Use Astro Image component with responsive formats
7. **Test performance** - Aim for 90+ Lighthouse score

## Example: Full Course Page

```astro
---
// pages/[orgId]/courses/[courseId].astro
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import Layout from '@/layouts/Layout.astro';
import { CourseHeader } from '@/components/course/Header';
import { LessonList } from '@/components/course/LessonList';
import { EnrollmentCard } from '@/components/course/EnrollmentCard';
import { ReviewsSection } from '@/components/course/ReviewsSection';
import { RelatedCourses } from '@/components/course/RelatedCourses';

const { orgId, courseId } = Astro.params;

// Initialize Convex client
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);

// Fetch course
const course = await convex.query(api.queries.entities.get, {
  id: courseId,
  groupId: orgId,
});

if (!course) {
  return Astro.redirect('/404');
}

// Fetch lessons (static)
const lessons = await convex.query(api.queries.connections.getRelated, {
  fromThingId: courseId,
  relationshipType: 'contains',
  targetType: 'lesson',
});

// Fetch reviews (static)
const reviews = await convex.query(api.queries.events.getByTarget, {
  targetId: courseId,
  eventType: 'course_reviewed',
  limit: 10,
});

// Fetch related courses (static)
const relatedCourses = await convex.query(api.queries.entities.list, {
  groupId: orgId,
  type: 'course',
  status: 'published',
  limit: 3,
});
---

<Layout
  title={course.name}
  description={course.properties.description}
  image={course.properties.thumbnail}
>
  <!-- Header: Static content -->
  <CourseHeader course={course} />

  <div class="course-container">
    <!-- Lessons: Static list -->
    <section class="lessons">
      <h2>Course Content</h2>
      <LessonList lessons={lessons} />
    </section>

    <!-- Enrollment: Interactive island -->
    <aside class="enrollment-sidebar">
      <EnrollmentCard
        client:load
        courseId={courseId}
        price={course.properties.price}
      />
    </aside>
  </div>

  <!-- Reviews: Interactive below-fold -->
  <ReviewsSection
    client:visible
    courseId={courseId}
    reviews={reviews}
  />

  <!-- Related: Static cards -->
  <section class="related">
    <h2>More Courses</h2>
    <RelatedCourses courses={relatedCourses} />
  </section>
</Layout>

<style>
  .course-container {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    .course-container {
      grid-template-columns: 1fr;
    }
  }
</style>
```

## Related Skills

- `agent-frontend:create-component` - Build React components for islands
- `agent-frontend:optimize-performance` - Improve Lighthouse scores
- `agent-frontend:implement-forms` - Build form components

## Related Documentation

- [Astro SSR](https://docs.astro.build/en/guides/server-side-rendering/)
- [Islands Architecture](https://docs.astro.build/en/concepts/islands/)
- [Frontend Agent](../agents/agent-frontend.md)

## Version History

- **1.0.0** (2025-10-27): Initial implementation with islands architecture
