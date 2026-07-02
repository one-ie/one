# @oneie/plugin-course

ONE course — LMS with enrollment, lesson gating, and progress tracking, served via x402. Course content, payment processing, and completion certificates are handled entirely server-side. Zero LMS source code ships to your repo.

## Install

```bash
npm install @oneie/plugin-course
```

## one.config.ts

```ts
import { defineOne } from '@oneie/frontend'
import { course } from '@oneie/plugin-course'

export default defineOne({
  plugins: [
    course({
      ws: 'my-workspace',
      provider: 'stripe',
      progressTracking: true,
      completionCertificate: true,
    }),
  ],
})
```

## Usage

### Course catalog or overview — `OneCourse`

Drop onto your `/courses` page to show the full course catalog, or pass `courseId` to show a single course's curriculum and enrollment CTA.

```astro
---
// src/pages/courses/index.astro
import Layout from '@/layouts/Layout.astro'
import OneCourse from '@oneie/plugin-course/OneCourse.astro'
---

<Layout title="Courses">
  <main class="max-w-4xl mx-auto py-16 px-4">
    <h1 class="text-3xl font-semibold mb-10">All Courses</h1>
    <OneCourse ws="my-workspace" />
  </main>
</Layout>
```

Pass `courseId` to scope the widget to a single course:

```astro
<OneCourse ws="my-workspace" courseId="intro-to-typescript" />
```

### Individual lesson player — `OneLesson`

Place on your dynamic lesson route. The widget streams content only to enrolled users; everyone else sees a teaser and a link to enroll.

```astro
---
// src/pages/courses/[courseId]/[lessonId].astro
import Layout from '@/layouts/Layout.astro'
import OneLesson from '@oneie/plugin-course/OneLesson.astro'

const { courseId, lessonId } = Astro.params
---

<Layout title="Lesson">
  <main class="max-w-3xl mx-auto py-12 px-4">
    <OneLesson
      ws="my-workspace"
      courseId={courseId}
      lessonId={lessonId}
    />
  </main>
</Layout>
```

The widget handles:
- Video or text content (served and gated by enrollment status)
- Per-lesson progress marking
- Previous / next lesson navigation
- Notes sidebar (persisted per enrolled user)

### Enrollment and pricing widget — `OneEnroll`

The sticky buy bar and pricing table. Place it on the course landing page alongside `OneCourse`. Enrolled users see their progress summary instead of the CTA.

```astro
---
// src/pages/courses/[courseId].astro
import Layout from '@/layouts/Layout.astro'
import OneCourse from '@oneie/plugin-course/OneCourse.astro'
import OneEnroll from '@oneie/plugin-course/OneEnroll.astro'

const { courseId } = Astro.params
---

<Layout title="Course">
  <main class="max-w-4xl mx-auto py-12 px-4">
    <OneCourse ws="my-workspace" courseId={courseId} />
  </main>

  <!-- Sticky buy bar fixed to the bottom of the viewport -->
  <OneEnroll
    ws="my-workspace"
    courseId={courseId}
    price={199}
    currency="USD"
    provider="stripe"
    spotsTotal={100}
    spotsRemaining={12}
  />
</Layout>
```

## Enrollment gate

Unenrolled visitors see a teaser preview of the first lesson and the pricing widget with a CTA. On successful payment (Stripe or x402), the server marks the actor as enrolled and the full course unlocks immediately — no page reload required.

## Completion certificate

Set `completionCertificate: true` in `one.config.ts` to issue a signed certificate when a student completes all lessons (100% progress). The certificate is generated server-side and linked from the student's profile. Download and share links are shown in the `OneLesson` widget after the final lesson.

## ONE workspace setup

1. Go to **one.ie → your workspace → Settings → Payments**.
2. Connect **Stripe** (for card payments) or enable **x402** (for crypto).
3. Add your courses under **Settings → Courses** — set modules, lessons, and content.
4. Optionally enable completion certificates under **Settings → Courses → Certificates**.

## Options

### `OneCourse`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ws` | `string` | — | Workspace slug (required) |
| `courseId` | `string` | — | Specific course — omit to show the catalog |
| `provider` | `'stripe' \| 'x402' \| 'both'` | `'stripe'` | Payment provider for enrollment CTA |
| `completionCertificate` | `boolean` | `false` | Show certificate badge on the overview |
| `progressTracking` | `boolean` | `true` | Show progress bar for enrolled users |
| `endpoint` | `string` | — | Override the default API endpoint |
| `integrity` | `string` | — | SRI hash for version pinning |

### `OneLesson`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ws` | `string` | — | Workspace slug (required) |
| `courseId` | `string` | — | Course identifier (required) |
| `lessonId` | `string` | — | Lesson identifier (required) |
| `endpoint` | `string` | — | Override the default API endpoint |
| `integrity` | `string` | — | SRI hash for version pinning |

### `OneEnroll`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `ws` | `string` | — | Workspace slug (required) |
| `courseId` | `string` | — | Course to enroll in (required) |
| `price` | `number` | — | Enrollment price (required) |
| `currency` | `string` | `'USD'` | ISO 4217 currency code |
| `provider` | `'stripe' \| 'x402' \| 'both'` | `'stripe'` | Payment provider |
| `spotsTotal` | `number` | — | Total available spots (omit for unlimited) |
| `spotsRemaining` | `number` | — | Remaining spots — shows urgency cue when low |
| `integrity` | `string` | — | SRI hash for version pinning |

## Subresource Integrity (SRI)

Pin a specific widget version and verify its integrity:

```astro
<OneCourse
  ws="my-workspace"
  integrity="sha384-<hash>"
/>
```

Generate the hash after downloading the pinned script:

```bash
curl -s https://one.ie/x/course@1.2.3.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Pass the same `integrity` prop to `OneLesson` and `OneEnroll` — all three widgets load the same `course.js` bundle.
