# Pattern: Component Architecture Template

**Category:** Design
**Context:** When defining component structure and relationships for a feature
**Problem:** Need clear component hierarchy, data flow, and responsibilities to guide implementation

## Solution

Define component tree, specify Astro vs React, document data flow, assign responsibilities clearly.

## Template

```markdown
# Component Architecture: {Feature Name}

**Feature:** {N}-{M}-{feature-name}
**Test Reference:** {N}-{M}-{feature-name}/tests.md
**Design Reference:** {N}-{M}-{feature-name}/wireframe.md
**Date:** YYYY-MM-DD

---

## Component Tree

```
{EntityName}Page (Astro Page - SSR)
│
├─ Layout (Astro Layout - Static)
│  ├─ Header (Astro Component - Static)
│  └─ Footer (Astro Component - Static)
│
├─ PageHeader (React Component - client:load)
│  ├─ CreateButton (React - interactive)
│  ├─ FilterDropdown (React - interactive)
│  └─ SearchInput (React - interactive)
│
├─ {EntityName}Grid (React Component - client:load)
│  │
│  ├─ LoadingState (React - conditional)
│  │  └─ Skeleton × 6
│  │
│  ├─ EmptyState (React - conditional)
│  │  ├─ EmptyIcon
│  │  ├─ EmptyMessage
│  │  └─ CreateButton
│  │
│  └─ {EntityName}Card[] (React - client:visible)
│     ├─ CardHeader
│     │  ├─ Title
│     │  └─ StatusBadge
│     ├─ CardContent
│     │  ├─ Description
│     │  └─ Metadata
│     └─ CardActions
│        ├─ ViewButton
│        ├─ EditButton
│        └─ DeleteButton
│
└─ CreateModal (React Component - client:only)
   ├─ ModalHeader
   ├─ {EntityName}Form (React)
   │  ├─ FormField × N
   │  └─ SubmitButton
   └─ ModalFooter
```

---

## Component Details

### {EntityName}Page (Astro)

**Type:** Astro Page (SSR)
**Route:** `src/pages/{entities}/index.astro`
**Responsibility:** Server-side data fetching, SEO metadata, layout structure

**Data Fetching:**
```typescript
const convex = new ConvexHttpClient(import.meta.env.PUBLIC_CONVEX_URL);
const {entities} = await convex.query(api.queries.{entities}.list, {
  limit: 50
});
```

**Props Passed:**
- `initial{Entities}` to `{EntityName}Grid`

**Acceptance Criteria:** AC-1 (Page loads with data)

---

### PageHeader (React, client:load)

**Type:** React Component (Interactive)
**File:** `src/components/features/{EntityName}PageHeader.tsx`
**Responsibility:** User actions (create, filter, search)

**State:**
- `filterStatus: string`
- `searchQuery: string`

**Events:**
- `onCreateClick()` → Opens CreateModal
- `onFilterChange(status)` → Filters grid
- `onSearchChange(query)` → Searches entities

**Convex:** None (stateless UI component)

**Acceptance Criteria:** AC-2 (User can filter), AC-3 (User can search)

---

### {EntityName}Grid (React, client:load)

**Type:** React Component (Data-driven)
**File:** `src/components/features/{EntityName}Grid.tsx`
**Responsibility:** Display list, handle loading/empty/error states

**Props:**
- `initial{Entities}?: Entity[]` (from SSR)
- `filterStatus?: string`
- `searchQuery?: string`

**Convex Hooks:**
```typescript
const {entities} = useQuery(api.queries.{entities}.list, {
  status: filterStatus,
  limit: 100
});
```

**States:**
- Loading: `{entities} === undefined`
- Empty: `{entities}.length === 0`
- Success: `{entities}.length > 0`

**Acceptance Criteria:** AC-1 (Shows list), AC-4 (Real-time updates)

---

### {EntityName}Card (React, client:visible)

**Type:** React Component (Display + Actions)
**File:** `src/components/features/{EntityName}Card.tsx`
**Responsibility:** Display single entity, provide actions

**Props:**
- `{entity}: Entity`

**Events:**
- `onView()` → Navigate to detail page
- `onEdit()` → Opens edit modal
- `onDelete()` → Confirms and deletes

**Convex Hooks:**
```typescript
const delete{EntityName} = useMutation(api.mutations.{entities}.remove);
```

**Acceptance Criteria:** AC-5 (User can view), AC-6 (User can edit), AC-7 (User can delete)

---

### CreateModal (React, client:only)

**Type:** React Component (Modal)
**File:** `src/components/features/{EntityName}CreateModal.tsx`
**Responsibility:** Create new entity form

**Props:**
- `isOpen: boolean`
- `onClose: () => void`

**State:**
- Form values (via React Hook Form)
- Submission state

**Convex Hooks:**
```typescript
const create{EntityName} = useMutation(api.mutations.{entities}.create);
```

**Acceptance Criteria:** AC-8 (User can create), AC-9 (Validation works)

---

## Data Flow

```
Server (Astro)
   ↓ SSR fetch initial data
   ↓
{EntityName}Page
   ↓ Pass initial{Entities}
   ↓
{EntityName}Grid (React)
   ↓ useQuery (real-time updates)
   ↓
Convex Backend
   ↓ Watch for changes
   ↓
{EntityName}Grid (React)
   ↓ Re-render with new data
   ↓
{EntityName}Card[] (React)
```

**User Actions:**
```
User clicks [+ New]
   ↓
CreateButton emits onCreateClick
   ↓
CreateModal opens
   ↓
User submits form
   ↓
useMutation calls backend
   ↓
Convex mutation creates entity
   ↓
useQuery receives update
   ↓
{EntityName}Grid re-renders
   ↓
New card appears
```

---

## Client Directives Strategy

**client:load** (Critical, above fold):
- PageHeader (user actions)
- {EntityName}Grid (main content)

**client:visible** (Below fold):
- {EntityName}Card (optimize initial load)

**client:only** (Skip SSR):
- CreateModal (only rendered client-side)

**Static** (No JS needed):
- Layout, Header, Footer
- Static content sections

---

## State Management

**No global state needed.** Use:
1. Convex real-time queries (data sync)
2. Local component state (UI state)
3. URL state (filters, page number)

**Example:**
```typescript
// Filter state in URL
const [searchParams, setSearchParams] = useSearchParams();
const filterStatus = searchParams.get('status') || 'all';

// Update URL = update filter
function handleFilterChange(status: string) {
  setSearchParams({ status });
}
```

---

## Design Tokens

**Spacing:**
- Card gap: `gap-4` (1rem)
- Grid gap: `gap-6` (1.5rem)
- Section padding: `py-8` (2rem)

**Colors:**
- Primary: `hsl(var(--primary))`
- Background: `hsl(var(--background))`
- Card: `hsl(var(--card))`

**Typography:**
- Page title: `text-4xl font-bold`
- Card title: `text-xl font-semibold`
- Description: `text-sm text-muted-foreground`

**Timing:**
- Skeleton: 1.5s ease-in-out animation
- Modal: 200ms ease-in-out
- Toast: 3000ms duration

---

## Accessibility

**ARIA Labels:**
- All buttons have `aria-label`
- Modal has `role="dialog"` and `aria-modal="true"`
- Grid has `role="list"`, cards have `role="listitem"`

**Keyboard Navigation:**
- Tab order: Create button → Filter → Search → Cards
- Enter on card = View details
- Escape closes modals

**Screen Reader:**
- Loading state announces "Loading {entities}"
- Empty state announces "No {entities} found"
- Success announces "{N} {entities} loaded"

---

## Performance Targets

**Initial Load:**
- SSR renders page < 500ms
- First paint < 1s
- Interactive < 2s

**Runtime:**
- Filter response < 100ms
- Card action < 200ms
- Real-time update < 500ms

**Bundle Size:**
- Page JS < 50KB gzipped
- Critical CSS < 10KB

---

## Testing Strategy

**Component Tests:**
- {EntityName}Grid: loading, empty, success states
- {EntityName}Card: render, actions, delete confirmation
- CreateModal: validation, submission, error handling

**Integration Tests:**
- Create flow: Open modal → Fill form → Submit → See new card
- Filter flow: Select filter → Grid updates
- Delete flow: Click delete → Confirm → Card removed

---

## Implementation Order

1. **Layout + Page** (Astro, static)
2. **{EntityName}Grid** (React, data fetching)
3. **{EntityName}Card** (React, display)
4. **PageHeader** (React, filters)
5. **CreateModal + Form** (React, mutations)
6. **Polish** (loading states, error handling, accessibility)

---

## Success Criteria

- [ ] Component tree matches design
- [ ] All acceptance criteria mapped to components
- [ ] Data flow clearly documented
- [ ] Client directives optimized
- [ ] Performance targets specified
- [ ] Accessibility requirements defined
```

## Variables

- `{Feature Name}` - Human-readable feature name
- `{N}-{M}-{feature-name}` - Feature ID
- `{EntityName}` - PascalCase entity name
- `{entity}` - Lowercase entity name
- `{entities}` - Plural lowercase

## Usage

1. Copy template to `one/things/features/{N}-{M}-{feature-name}/component-architecture.md`
2. Replace all variables
3. Define component tree with Astro/React split
4. Document data flow (SSR → client → mutations)
5. Specify client directives for performance
6. Map components to acceptance criteria
7. Define implementation order

## Common Mistakes

- **Mistake:** Not specifying Astro vs React
  - **Fix:** Clearly mark component type in tree
- **Mistake:** No client directive strategy
  - **Fix:** Document when to use load/visible/only
- **Mistake:** Missing data flow
  - **Fix:** Show SSR → useQuery → useMutation flow
- **Mistake:** No acceptance criteria mapping
  - **Fix:** Reference ACs in each component section

## Related Patterns

- **wireframe-template.md** - Visual design reference
- **component-template.md** - React implementation
- **page-template.md** - Astro page implementation
