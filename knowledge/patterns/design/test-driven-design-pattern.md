# Test-Driven Design Pattern

**Category:** Design
**Type:** UI/UX Design Process
**Used for:** Creating designs that enable tests to pass

---

## Pattern Overview

Design exists to make tests pass. Every design decision should reference a test criterion.

**Flow:**
1. Quality agent defines user flows
2. Quality agent writes acceptance criteria
3. **Design agent creates UI that enables criteria to pass**
4. Developer implements the design
5. Tests validate it works

## Design Process

### Step 1: Review Test Criteria

```markdown
## User Flow: Enroll in Course

1. User clicks "Browse Courses"
2. User sees list of available courses
3. User clicks "Enroll" on a course
4. User sees confirmation message
5. Course appears in "My Courses"

## Acceptance Criteria

AC1: Browse button is visible and accessible
AC2: Course list loads within 2 seconds
AC3: Each course shows name, description, and enroll button
AC4: Enroll button is disabled for already-enrolled courses
AC5: Confirmation message appears within 1 second
AC6: "My Courses" updates immediately after enrollment
```

### Step 2: Create Wireframe

```
┌─────────────────────────────────────┐
│ [Logo]  Browse Courses  My Courses  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Available Courses                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Introduction to TypeScript      │ │
│ │ Learn TypeScript basics         │ │
│ │                    [Enroll ⟶]  │ │  ← AC3: Shows name, description, button
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Advanced React Patterns         │ │
│ │ Master React architecture       │ │
│ │                    [Enrolled ✓] │ │  ← AC4: Disabled when enrolled
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Design Decisions:**
- AC1 → "Browse Courses" in main navigation
- AC2 → Loading skeleton while data fetches
- AC3 → Card layout with title, description, button
- AC4 → Button shows "Enrolled ✓" and is disabled
- AC5 → Toast notification on enrollment
- AC6 → Real-time subscription to "My Courses" query

### Step 3: Define Components

```typescript
// Component hierarchy that satisfies tests

<Layout>
  <Navigation>
    <NavLink to="/courses">Browse Courses</NavLink>  // AC1
    <NavLink to="/my-courses">My Courses</NavLink>
  </Navigation>

  <CourseList>                                       // AC2: Loading state
    <CourseCard                                      // AC3: Card structure
      title="..."
      description="..."
      isEnrolled={false}
      onEnroll={handleEnroll}
    />
  </CourseList>

  <Toast message="Enrolled successfully!" />         // AC5: Confirmation
</Layout>
```

### Step 4: Set Design Tokens

```css
/* Performance criteria drive token choices */

:root {
  /* AC2: Fast loading - lightweight animations */
  --animation-duration: 150ms;

  /* AC5: Immediate feedback - no delay */
  --toast-delay: 0ms;

  /* Accessibility - WCAG AA contrast */
  --button-primary: hsl(220 100% 50%);
  --button-disabled: hsl(220 20% 80%);
}
```

## When to Use

- After test criteria are defined
- Before writing any code
- When refining existing UIs
- When tests are failing due to UI issues

## Best Practices

1. **Start from tests** - Every design choice references a test
2. **Wireframe first** - Sketch before jumping to code
3. **Component hierarchy** - Define structure that satisfies criteria
4. **Set tokens** - Performance and accessibility drive choices
5. **Document decisions** - Explain why each design choice was made

## Common Mistakes

❌ **Don't:** Design without reading test criteria
✅ **Do:** Start by understanding what tests need to pass

❌ **Don't:** Create pretty designs that don't meet requirements
✅ **Do:** Design specifically to enable test success

❌ **Don't:** Skip wireframes and go straight to code
✅ **Do:** Wireframe → Component structure → Implementation

❌ **Don't:** Forget accessibility and performance
✅ **Do:** Build these requirements into design tokens

## Design Checklist

Before finalizing design, verify:

- [ ] Every acceptance criterion has a corresponding design element
- [ ] Performance requirements are reflected in design tokens
- [ ] Accessibility standards (WCAG AA) are met
- [ ] Loading states are defined for all async operations
- [ ] Error states are designed for failure cases
- [ ] Empty states are designed for zero-data scenarios
- [ ] Component hierarchy matches test structure

## Related Patterns

- [Design Agent Pattern](../../things/agents/agent-designer.md)
- [Quality Agent Pattern](../../things/agents/agent-quality.md)
- [Wireframe Template Pattern](./wireframe-template-pattern.md)
