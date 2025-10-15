# Pattern: Wireframe Template

**Category:** Design
**Context:** When creating wireframes for features that need to pass user flow tests
**Problem:** Need consistent wireframe structure that shows UI elements, interactions, and maps to acceptance criteria

## Solution

Use ASCII/markdown wireframes for speed, show all interactive elements, annotate with acceptance criteria references, keep it simple.

## Template

```markdown
# Wireframe: {Feature Name}

**Feature:** {N}-{M}-{feature-name}
**Test Reference:** {N}-{M}-{feature-name}/tests.md
**Date:** YYYY-MM-DD

---

## Page/Component: {PageName}

**Route:** /{route}/[params]
**User Flow:** Flow {N} - {Goal}
**Acceptance Criteria:** AC-{N}, AC-{M}

### Layout

```
┌─────────────────────────────────────────────────────┐
│ Header                                              │
│ ┌────────────────┐  Profile ▼                      │
│ │ Logo           │                                  │
│ └────────────────┘                                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────┐      │
│  │ Page Title                               │      │
│  │ {EntityName} Management                  │      │
│  │                                          │      │
│  │ [+ New {EntityName}]  [Filter ▼] [⚙]   │      │
│  └──────────────────────────────────────────┘      │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ Card 1      │  │ Card 2      │  │ Card 3      ││
│  │             │  │             │  │             ││
│  │ [Action]    │  │ [Action]    │  │ [Action]    ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
│                                                     │
│  [Load More]                                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer                                              │
└─────────────────────────────────────────────────────┘
```

### Interactive Elements

1. **[+ New {EntityName}] Button**
   - **Action:** Opens create form modal
   - **AC Reference:** AC-1
   - **State:** Enabled when authenticated

2. **[Filter ▼] Dropdown**
   - **Action:** Filters list by status/type
   - **AC Reference:** AC-3
   - **Options:** All, Draft, Active, Archived

3. **Card [Action] Button**
   - **Action:** Opens detail view or triggers action
   - **AC Reference:** AC-4
   - **State:** Changes based on entity status

### States

**Loading State:**
```
┌─────────────────┐
│ ████████        │  (Skeleton loader)
│ ████            │
│ [Loading...]    │
└─────────────────┘
```

**Empty State:**
```
┌─────────────────────────────┐
│  📭                         │
│  No {entities} yet          │
│  Create your first {entity} │
│  [+ New {EntityName}]       │
└─────────────────────────────┘
```

**Error State:**
```
┌─────────────────────────────┐
│  ⚠️                         │
│  Failed to load {entities}  │
│  [Retry]                    │
└─────────────────────────────┘
```

### Responsive Behavior

**Desktop (> 768px):**
- 3 columns of cards
- Full header navigation
- Sidebar visible

**Tablet (768px - 1024px):**
- 2 columns of cards
- Collapsed header navigation
- Sidebar hidden

**Mobile (< 768px):**
- 1 column of cards
- Bottom navigation
- Sidebar drawer

### Acceptance Criteria Mapping

- **AC-1:** User can create new {entity}
  - Button: [+ New {EntityName}]
  - Opens: Create form modal

- **AC-2:** User can view list of {entities}
  - Component: Card grid
  - Shows: Name, description, status

- **AC-3:** User can filter {entities}
  - Control: [Filter ▼] dropdown
  - Options: By status, by type

- **AC-4:** User can view {entity} details
  - Action: Click card [Action] button
  - Route: /{entities}/[id]

---

## Design Decisions

### Why 3-column grid?
- **Test:** AC-2 requires scanning multiple {entities} quickly
- **Rationale:** 3 columns optimal for 1920px screens, reduces scrolling

### Why skeleton loaders?
- **Test:** Performance requirement < 500ms perceived load time
- **Rationale:** Immediate feedback, perceived performance improvement

### Why card-based layout?
- **Test:** AC-2 requires clear visual separation
- **Rationale:** Cards provide clear boundaries, scannable

---

## Component Hierarchy

```
└─ {EntityName}Page (Astro)
   ├─ PageHeader (React, client:load)
   │  ├─ CreateButton
   │  └─ FilterDropdown
   ├─ {EntityName}Grid (React, client:load)
   │  └─ {EntityName}Card[] (static or client:visible)
   │     ├─ CardHeader
   │     ├─ CardContent
   │     └─ CardActions
   └─ PageFooter (Astro, static)
```

---

## Notes

- All buttons must have loading states (AC-5: User receives feedback)
- All forms must have validation (AC-6: Errors are clear)
- All actions must have success/error toasts (AC-7: Feedback < 2 seconds)
```

## Variables

- `{Feature Name}` - Human-readable feature name
- `{N}-{M}-{feature-name}` - Feature ID
- `{PageName}` - Name of page/component being wireframed
- `{EntityName}` - PascalCase entity name
- `{entity}` - Lowercase entity name
- `{entities}` - Plural lowercase

## Usage

1. Copy template to `one/things/features/{N}-{M}-{feature-name}/wireframe.md`
2. Replace all variables
3. Draw ASCII layout showing structure
4. List all interactive elements with AC references
5. Show all states (loading, empty, error)
6. Map to acceptance criteria explicitly
7. Explain design decisions (reference tests)

## Common Mistakes

- **Mistake:** No acceptance criteria mapping
  - **Fix:** Every interactive element must reference an AC
- **Mistake:** Missing states (loading, empty, error)
  - **Fix:** Always show all three states in wireframe
- **Mistake:** No responsive behavior notes
  - **Fix:** Specify desktop/tablet/mobile differences
- **Mistake:** Design decisions not tied to tests
  - **Fix:** Explain every decision with test reference

## Related Patterns

- **component-architecture.md** - Component structure
- **user-flow-template.md** - Test reference
- **acceptance-criteria-template.md** - Criteria reference
