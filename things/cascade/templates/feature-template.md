# Feature {plan_number}-{feature_number}: {Feature Name}

**Assigned to:** {Specialist Type} Agent
**Status:** Spec → Tests → Design → Implementation → Complete
**Plan:** {plan_number}-{plan-name}

---

## Feature Specification

**What:** {Brief description of what this feature does}

**Ontology Types:**

- **Things:** {thing_type} ({properties})
- **Connections:** {connection_type} ({from} → {to})
- **Events:** {event_type_1}, {event_type_2}, {event_type_3}

**Scope:**

- **Backend:** {Services, mutations, queries needed}
- **Frontend:** {Pages, components, UI needed}
- **Integration:** {Connections between systems}

**Success Criteria:** See tests (next phase)

---

## Tests (Quality Agent fills this section)

### User Flows

#### Flow 1: {User Goal}

**User goal:** {What the user wants to accomplish}
**Time budget:** {Expected time to complete}

**Steps:**

1. {Step 1}
2. {Step 2}
3. {Step 3}
4. {Step 4}
5. {Step 5}

**Acceptance Criteria:**

- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}
- [ ] Time to complete: < {time budget}

### Technical Tests

**Unit Tests:**

- [ ] {Service}.{method}() {expected behavior}
- [ ] {Service}.{method}() {expected behavior}

**Integration Tests:**

- [ ] API: {METHOD} {endpoint} → {expected status} + {expected response}
- [ ] Events logged to one/events/
- [ ] Data flows work correctly

**E2E Tests:**

- [ ] Complete Flow 1 in < {time budget}
- [ ] All acceptance criteria pass

---

## Design (Design Agent fills this section)

### Design Decisions

#### Decision 1: {Design Choice} (satisfies "{test requirement}")

**Test requirement:** {What test needs to pass}

**Design solution:**

- {Design element 1}
- {Design element 2}
- {Design element 3}

### Wireframes

```
{ASCII wireframe here}
```

### Component Architecture

```
{Component hierarchy}
```

### Design Tokens

```yaml
# Colors
primary: "{color}"
secondary: "{color}"

# Timing (satisfies tests)
{timing_variable}: {value}ms # {requirement}

# Spacing
{spacing_variable}: {value}px
```

---

## Implementation (Specialist fills this section)

### Backend Implementation

**Service:** `{ServiceName}.ts`

```typescript
// Effect.ts service with error handling
export class {ServiceName} {
  async {method}({params}) {
    // Implementation
  }
}
```

**Mutations:** `{feature-name}.ts`

```typescript
export const {mutationName} = mutation({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Call service
    // Log events
    // Return result
  }
});
```

**Queries:** `{feature-name}.ts`

```typescript
export const {queryName} = query({
  args: { /* args */ },
  handler: async (ctx, args) => {
    // Fetch data
    // Return result
  }
});
```

### Frontend Implementation

**Page:** `{page-name}.astro`

```astro
---
import { ConvexHttpClient } from "convex/browser";
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const data = await convex.query(api.queries.{queryName}, {});
---

<Layout>
  <Component client:load data={data} />
</Layout>
```

**Component:** `{ComponentName}.tsx`

```tsx
export function {ComponentName}({ data }) {
  // Implementation
}
```

---

## Validation (Quality Agent fills after implementation)

### Test Results

- [ ] All user flows pass
- [ ] All acceptance criteria met
- [ ] All technical tests pass (unit, integration, e2e)
- [ ] Implementation matches design

### Quality Check

- [ ] Ontology alignment validated
- [ ] No regressions introduced
- [ ] Performance acceptable
- [ ] Accessibility requirements met

---

## Documentation (Documenter fills after validation passes)

### Feature Documentation

{What this feature does and how to use it}

### API Documentation

```typescript
// Mutations
{mutationName}({args}): {returnType}

// Queries
{queryName}({args}): {returnType}
```

### User Guide

{Step-by-step guide for users}

---

## Lessons Learned (Specialist fills if problems occurred)

### Problem: {What went wrong}

**Solution:** {How it was fixed}

**Rule:** {Principle to follow}

**Example:**

```typescript
// Code snippet showing correct pattern
```

Added to: `one/knowledge/lessons-learned.md`

---

## Status Updates

- [ ] Feature specification complete
- [ ] Tests defined (Quality Agent)
- [ ] Design created (Design Agent)
- [ ] Implementation complete (Specialist)
- [ ] Tests pass (Quality Agent)
- [ ] Documentation complete (Documenter)
- [ ] Feature complete (Director marks complete)

---

## Events Logged

```typescript
// Track all workflow events
{ type: 'feature_assigned', actorId: 'director', targetId: '{plan_number}-{feature_number}-{feature-name}', metadata: { assignedTo: '{specialist}' } }
{ type: 'feature_started', actorId: '{specialist}', targetId: '{plan_number}-{feature_number}-{feature-name}' }
{ type: 'implementation_complete', actorId: '{specialist}', targetId: '{plan_number}-{feature_number}-{feature-name}' }
{ type: 'test_passed', actorId: 'quality', targetId: '{plan_number}-{feature_number}-{feature-name}' }
{ type: 'documentation_complete', actorId: 'documenter', targetId: '{plan_number}-{feature_number}-{feature-name}' }
{ type: 'feature_complete', actorId: 'director', targetId: '{plan_number}-{feature_number}-{feature-name}' }
```

---

**Template Version:** 1.0.0
**Source:** ONE Cascade Workflow System
**Usage:** Copy template, replace {placeholders}, follow 6-level flow
