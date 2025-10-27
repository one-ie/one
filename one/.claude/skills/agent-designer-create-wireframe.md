---
name: agent-designer:create-wireframe
description: Generate wireframes from feature specs and tests that enable acceptance criteria to pass
---

# Agent-Designer: Create Wireframe

## Purpose

Generate test-driven wireframes that:
- Map directly to acceptance criteria
- Show all states (default, loading, error, success)
- Include responsive breakpoints (320px, 768px, 1024px, 1440px)
- Specify component hierarchy and layout
- Ensure WCAG 2.1 AA accessibility
- Enable implementation without ambiguity

## When to Use This Skill

- Converting test requirements to visual designs
- Designing new features before implementation
- Creating layout specifications
- Planning component structure
- Validating that designs enable tests to pass

## Instructions

### 1. Read Test Requirements First

Before wireframing, read the test specification:

```typescript
// From quality agent: test thing properties
{
  userFlows: [
    {
      name: "Create Course",
      steps: [
        "Click 'New Course' button",
        "Fill in course name",
        "Select difficulty level",
        "Click 'Create'"
      ],
      goal: "User creates new course"
    }
  ],
  acceptanceCriteria: [
    "User can create course with just name",
    "Form validates before submission",
    "Loading spinner shows during save",
    "Success message appears after creation",
    "User is redirected to course detail page"
  ],
  accessibility: "WCAG 2.1 AA"
}
```

### 2. Map Acceptance Criteria to UI Elements

Create a mapping table:

```
Acceptance Criterion → UI Element
"Create course with just name" → Input field (name, required)
"Form validates before submission" → Form validation on blur
"Loading spinner during save" → Button spinner + disabled state
"Success message appears" → Toast notification
"Redirected to detail page" → Automatic navigation
```

**Rule:** Every acceptance criterion must have a corresponding UI element. If not, the design is incomplete.

### 3. Wireframe Template Pattern

```markdown
### Screen: Create Course

**Path:** /courses/new
**Layout Pattern:** centered-form
**Primary Goal:** User creates new course with minimal friction

**Ontology Operations:**
- Things created: `course` (type: course)
- Connections created: `owns` (creator → course)
- Events logged: `course_created`, `entity_created`

**Components:**
```
Card (max-w-2xl)
├── CardHeader
│   └── h1: "Create Course"
├── CardContent
│   └── Form
│       ├── FormField
│       │   ├── Label: "Course Name"
│       │   └── Input (type: text, required, autofocus)
│       ├── FormField
│       │   ├── Label: "Description"
│       │   └── Textarea (optional, rows: 4)
│       ├── FormField
│       │   ├── Label: "Difficulty"
│       │   └── Select (beginner, intermediate, advanced)
│       └── FormField (form actions)
│           ├── Button (type: submit, "Create Course")
│           └── Button (type: button, variant: ghost, "Cancel")
└── CardFooter
    └── p: "Courses appear in draft status"
```

**Responsive:**
- Mobile (320px): Single column, p-4
- Tablet (768px): max-w-2xl, mx-auto, p-6
- Desktop (1024px+): max-w-2xl, mx-auto, p-8

**States:**
- Default: Form ready to submit
- Validating: Form validates on blur, shows errors below fields
- Submitting: Button shows spinner, form disabled, cursor: not-allowed
- Success: Toast shows "Course created!", redirect to /courses/[id]
- Error: Toast shows error message, form re-enabled
```

### 4. Specify All States

Every interactive element needs state specifications:

```
INPUT FIELD States:
- Default: Border gray-200, cursor text
- Focused: Border primary, ring blue-500
- Validating: Show spinner inside field
- Valid: Border green-500 (optional)
- Error: Border red-500, error text below

BUTTON States:
- Default: Background primary, cursor pointer
- Hovered: Background darker (primary-600)
- Focused: Ring-2 ring-offset-2
- Loading: Spinner inside button, disabled
- Disabled: Background gray-300, cursor not-allowed
- Success: Check icon appears
- Error: Text color error, appears 2s then fades
```

### 5. Mobile-First Responsive

Start with mobile (320px), then expand:

```
MOBILE (320px):
┌─────────────────┐
│ Create Course   │
├─────────────────┤
│ Name:           │
│ [      input  ] │
├─────────────────┤
│ Description:    │
│ [              ]│
│ [  textarea   ]│
├─────────────────┤
│ Difficulty:     │
│ [dropdown   ▼] │
├─────────────────┤
│ [Create Course] │
│ [Cancel       ] │
└─────────────────┘

TABLET (768px):
┌──────────────────────────────────┐
│   Create Course                  │
├──────────────────────────────────┤
│ Course Name:                     │
│ [          input               ] │
│                                  │
│ Description:                     │
│ [                              ] │
│ [       textarea                ]│
│ [                              ] │
│                                  │
│ Difficulty: [dropdown ▼]         │
│                                  │
│ [Create Course] [Cancel]         │
└──────────────────────────────────┘

DESKTOP (1024px+):
┌─────────────────────────────────────┐
│        Create Course                │
├─────────────────────────────────────┤
│ Course Name:                        │
│ [             input                ] │
│                                     │
│ Description (optional):             │
│ [                                  ] │
│ [          textarea                 ] │
│ [                                  ] │
│                                     │
│ Difficulty Level:                   │
│ [    Beginner ▼]                   │
│                                     │
│ [Create Course] [Cancel]            │
│                                     │
│ Courses appear as drafts initially. │
│ Edit to add content and publish.    │
└─────────────────────────────────────┘
```

### 6. Accessibility Checklist

For every wireframe, validate:

- [ ] Color contrast ≥ 4.5:1 for body text
- [ ] Color contrast ≥ 3:1 for large text (≥18px)
- [ ] Form labels associated with inputs
- [ ] ARIA labels on icon-only buttons
- [ ] Error messages announced to screen readers
- [ ] Focus states clearly visible (ring or outline)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Loading/success states communicated
- [ ] Color not the only way to convey meaning

### 7. Layout Pattern Selection

Choose based on use case:

| Pattern | Use Case | Example |
|---------|----------|---------|
| centered-form | Create/edit operations | Course form, user settings |
| 3-column-grid | Content-heavy pages | Blog with sidebar |
| dashboard-sidebar | Admin dashboards | Analytics, settings |
| grid-of-cards | List views | Course catalog, products |
| focus-area | Messaging/chat | Comments, email |

### 8. Example: Complete Wireframe

```markdown
### Screen: Course Enrollment

**Path:** /courses/[courseId]
**Layout Pattern:** 2-column with aside
**Goal:** User views course and enrolls

**Components:**
```
Container (gap-6)
├── Main (2/3 width)
│   ├── Image (responsive, 16:9)
│   ├── h1: Course title
│   ├── p: Description
│   └── Tabs
│       ├── Tab "Overview"
│       │   └── Content sections
│       ├── Tab "Lessons"
│       │   └── Collapsible lessons list
│       └── Tab "Reviews"
│           └── ReviewsSection (client:visible)
└── Aside (1/3 width)
    └── Card "Enrollment"
        ├── Price
        ├── Enrollment status
        ├── Button "Enroll Now" (client:load)
        ├── Stats (students, rating)
        └── Instructor info
```

**Responsive:**
- Mobile: Single column
- Desktop: 2 columns (main 2/3, aside 1/3)

**Interactive Elements:**
- Tabs: client:idle
- Enroll button: client:load
- Reviews: client:visible
- Share button: client:idle
```

## Design-to-Code Handoff

When design is complete, include implementation guidance:

```
IMPLEMENTATION NOTES:

1. Use shadcn/ui components:
   - Card, CardHeader, CardContent, CardFooter
   - Form, FormField, FormItem, FormLabel, FormControl, FormMessage
   - Input, Textarea, Select, Button
   - Toast for notifications
   - Dialog for confirmation modals

2. TypeScript props:
   interface CreateCourseFormProps {
     onSuccess?: (courseId: string) => void;
     onCancel?: () => void;
   }

3. State management:
   - useState for form data
   - useMutation for submission
   - Loading state: Button disabled + spinner

4. Validation:
   - React Hook Form for form state
   - Zod for schema validation
   - Show errors on blur, not submit

5. Styling:
   - Tailwind v4 CSS variables
   - Responsive: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
   - Dark mode: dark: variant

6. Accessibility:
   - FormLabel htmlFor input id
   - ARIA live regions for messages
   - Focus management: autofocus on first input
```

## Critical Rules

1. **Test-driven** - Every acceptance criterion has a UI element
2. **All states shown** - Default, loading, error, success, empty
3. **Mobile-first** - Design starts at 320px, scales up
4. **Accessibility first** - WCAG 2.1 AA minimum
5. **Components specified** - Exact component hierarchy
6. **Responsive specified** - Breakpoints: 320, 768, 1024, 1440px
7. **No ambiguity** - Implementation can proceed without design questions

## Related Skills

- `agent-designer:define-components` - Component specifications
- `agent-designer:set-design-tokens` - Design token generation
- `agent-designer:validate-accessibility` - WCAG compliance

## Related Documentation

- [WCAG 2.1 AA](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Designer Agent](../agents/agent-designer.md)

## Version History

- **1.0.0** (2025-10-27): Initial implementation with test-driven approach
