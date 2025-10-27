# Dashboard Wireframes - ONE Platform

**Version:** 1.0.0
**Created:** 2025-10-25
**Status:** Test-Driven Design
**Purpose:** Enable test flows from `backend/test/groups.test.ts` and `backend/test/things.test.ts`

## Design Requirements (From Tests)

### User Flows to Support

1. **Group Management** (from groups.test.ts)
   - Create organization with minimal/full fields
   - Create hierarchical groups (parent → child → grandchild)
   - List and filter groups (by type, status, with pagination)
   - Update group settings
   - Archive group

2. **Thing Management** (from things.test.ts)
   - Create things (66 types: creator, agent, content, etc.)
   - List and filter things (by type, status, group)
   - Update thing properties
   - Delete (soft delete) things
   - Group isolation visualization

## Wireframe 1: Dashboard Home

**Purpose:** Show overview of groups, things, and recent activity

**Layout Pattern:** Dashboard sidebar (proven pattern)

```
┌──────────────────────────────────────────────────────────────┐
│ [ONE Logo]                                    [User] [Theme] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║  Dashboard                                              ║  │
│  ╠═══════════════════════════════════════════════════════╣  │
│  ║                                                         ║  │
│  ║  Welcome back, [User Name]                            ║  │
│  ║                                                         ║  │
│  ║  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ║  │
│  ║  │ Groups      │  │ Things      │  │ Events      │  ║  │
│  ║  │ 5 active    │  │ 42 total    │  │ 128 today   │  ║  │
│  ║  └─────────────┘  └─────────────┘  └─────────────┘  ║  │
│  ║                                                         ║  │
│  ║  Recent Activity                                       ║  │
│  ║  ┌───────────────────────────────────────────────┐  ║  │
│  ║  │ • thing_created: Blog Post (2 min ago)        │  ║  │
│  ║  │ • group_created: Engineering Team (5 min ago) │  ║  │
│  ║  │ • thing_updated: Course Module (10 min ago)   │  ║  │
│  ║  └───────────────────────────────────────────────┘  ║  │
│  ║                                                         ║  │
│  ║  [View Groups]  [View Things]  [View Events]          ║  │
│  ║                                                         ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- Card (shadcn/ui)
- Button (shadcn/ui)
- Badge (for counts)
- Separator

**Responsive:**
- Mobile: Stack cards vertically
- Tablet: 2 columns
- Desktop: 3 columns

**Accessibility:**
- ARIA labels on stat cards
- Keyboard navigation for buttons
- Focus indicators on interactive elements

## Wireframe 2: Group Management

**Purpose:** Create, list, and manage hierarchical groups

**Layout Pattern:** List with sidebar filter

```
┌──────────────────────────────────────────────────────────────┐
│ Groups                                         [+ New Group] │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                 │
│ Filters     │  Acme Corporation                    [Edit]    │
│             │  └─ Engineering Team                  [Edit]    │
│ Type:       │     └─ Backend Team                   [Edit]    │
│ [All     ▼] │                                                 │
│             │  Startup Inc                         [Edit]    │
│ Status:     │  └─ Product Team                      [Edit]    │
│ [Active  ▼] │                                                 │
│             │  Community Group                     [Edit]    │
│             │                                                 │
│             │  [< Previous] Page 1 of 3 [Next >]             │
│             │                                                 │
└─────────────┴────────────────────────────────────────────────┘
```

**Components:**
- Select (for filters)
- Card (for each group)
- Button (Edit, New Group)
- Pagination
- Tree view indicator (└─ for hierarchy)

**Interactions:**
- Click group name → View group details
- Click Edit → Open group settings dialog
- Click "+ New Group" → Open create group dialog
- Filter changes → Update list immediately

**Empty State:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                                │
│                   No groups found                              │
│                                                                │
│           Create your first group to get started               │
│                                                                │
│                     [+ Create Group]                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Wireframe 3: Create/Edit Group Dialog

**Purpose:** Form for creating or editing group settings

**Layout Pattern:** Centered modal form

```
┌──────────────────────────────────────────────────────────────┐
│                      Create Group                      [×]    │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Name *                                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Acme Corporation                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Slug * (URL identifier)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ acme-corp                                             │  │
│  └──────────────────────────────────────────────────────┘  │
│  one.ie/groups/acme-corp                                      │
│                                                                │
│  Type *                                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Organization                                        ▼ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Parent Group (optional)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ None                                                ▼ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Description (optional)                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Settings                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Visibility: [Public ▼]  Join Policy: [Invite Only ▼] │  │
│  │ Plan: [Starter ▼]                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│                          [Cancel]  [Create Group]              │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- Dialog (shadcn/ui)
- Input (text fields)
- Select (dropdowns)
- Textarea (description)
- Button (Cancel, Create)
- Label (field labels)

**Validation:**
- Name: Required, max 100 chars
- Slug: Required, lowercase, alphanumeric + hyphens
- Type: Required, from enum
- Parent: Optional, must be valid group ID
- Real-time slug preview below input

**Loading State:**
- Disable all fields
- Show spinner on submit button
- Change button text to "Creating..."

**Error State:**
- Show error message above buttons
- Highlight invalid fields in red
- Display specific error (duplicate slug, invalid parent, etc.)

## Wireframe 4: Thing Management

**Purpose:** List, filter, and manage all entity types

**Layout Pattern:** Grid view with filters

```
┌──────────────────────────────────────────────────────────────┐
│ Things                                        [+ New Thing]  │
├─────────────┬────────────────────────────────────────────────┤
│             │                                                 │
│ Filters     │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│             │  │ Blog Post│  │ Course   │  │ Creator  │    │
│ Group:      │  │ "How to" │  │ "React"  │  │ "John"   │    │
│ [All     ▼] │  │ draft    │  │ active   │  │ active   │    │
│             │  │ [Edit]   │  │ [Edit]   │  │ [Edit]   │    │
│ Type:       │  └──────────┘  └──────────┘  └──────────┘    │
│ [All     ▼] │                                                 │
│             │  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│ Status:     │  │ Video    │  │ Token    │  │ Agent    │    │
│ [All     ▼] │  │ "Intro"  │  │ "ACME"   │  │ "AI Bot" │    │
│             │  │ published│  │ active   │  │ active   │    │
│ Search:     │  │ [Edit]   │  │ [Edit]   │  │ [Edit]   │    │
│ [_______]   │  └──────────┘  └──────────┘  └──────────┘    │
│             │                                                 │
│             │  [< Previous] Page 1 of 5 [Next >]             │
│             │                                                 │
└─────────────┴────────────────────────────────────────────────┘
```

**Components:**
- Card (for each thing)
- Select (filters)
- Input (search)
- Button (Edit, New Thing)
- Badge (status indicator)

**Thing Card Structure:**
```
┌──────────┐
│ [Icon]   │  ← Type indicator (blog, video, course, etc.)
│ Title    │
│ Status   │  ← Badge showing status
│ [Edit]   │
└──────────┘
```

**Filter Behavior:**
- All filters applied simultaneously (AND logic)
- Real-time update as filters change
- Search matches name and type
- Pagination resets to page 1 on filter change

## Wireframe 5: Thing Details/Edit

**Purpose:** View and edit thing properties

**Layout Pattern:** Tabbed interface with form

```
┌──────────────────────────────────────────────────────────────┐
│ Blog Post: "How to Build with ONE Platform"          [×]    │
├──────────────────────────────────────────────────────────────┤
│ [Details] [Properties] [Connections] [Events] [History]      │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Name *                                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ How to Build with ONE Platform                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Type: blog_post (cannot change)                              │
│                                                                │
│  Status *                                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Draft                                               ▼ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Properties (flexible JSON)                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ {                                                       │  │
│  │   "title": "How to Build...",                          │  │
│  │   "content": "Lorem ipsum...",                         │  │
│  │   "publishedAt": null                                  │  │
│  │ }                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Created: 2025-10-25 10:30 AM                                 │
│  Updated: 2025-10-25 11:45 AM                                 │
│                                                                │
│                [Cancel]  [Delete]  [Save Changes]             │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Tabs:**
- **Details:** Name, type, status, timestamps
- **Properties:** JSON editor for flexible properties
- **Connections:** Related things (from/to)
- **Events:** Audit trail of actions
- **History:** Change log

**Components:**
- Tabs (shadcn/ui)
- Input (name field)
- Select (status dropdown)
- Textarea (properties JSON)
- Button (Cancel, Delete, Save)
- AlertDialog (delete confirmation)

**Delete Confirmation:**
```
┌──────────────────────────────────────────────────────────────┐
│                      Delete Thing?                             │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Are you sure you want to delete "How to Build..."?          │
│                                                                │
│  This will soft-delete the thing. It can be restored later.  │
│                                                                │
│                          [Cancel]  [Delete]                    │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

## Wireframe 6: Connection Visualization

**Purpose:** Show relationships between things

**Layout Pattern:** Graph view with node details

```
┌──────────────────────────────────────────────────────────────┐
│ Connections                                [View List/Graph] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│           ┌─────────┐                                          │
│           │ Creator │                                          │
│           │  John   │                                          │
│           └────┬────┘                                          │
│                │                                                │
│          owns  │  authored                                     │
│                │                                                │
│    ┌───────────┴───────────┐                                  │
│    │                       │                                    │
│ ┌──▼──┐                 ┌──▼──┐                               │
│ │Token│                 │Blog │                               │
│ │ACME │                 │Post │                               │
│ └─────┘                 └─────┘                               │
│                                                                │
│  Selected: Creator → Token (owns)                             │
│  Created: 2025-10-25 10:00 AM                                 │
│                                                                │
│  [View Details]                                               │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Alternative: List View**
```
┌──────────────────────────────────────────────────────────────┐
│ From Thing      │ Relationship │ To Thing        │ Actions   │
├─────────────────┼──────────────┼─────────────────┼───────────┤
│ Creator (John)  │ owns         │ Token (ACME)    │ [View]    │
│ Creator (John)  │ authored     │ Blog Post       │ [View]    │
│ User (Alice)    │ holds_tokens │ Token (ACME)    │ [View]    │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- Toggle (List/Graph view)
- Custom graph component (React Flow or D3)
- Table (list view)
- Card (relationship details)

## Wireframe 7: Event Timeline

**Purpose:** Show audit trail of all actions

**Layout Pattern:** Vertical timeline

```
┌──────────────────────────────────────────────────────────────┐
│ Events                                       [Filter: All ▼] │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  Today                                                         │
│  ○─────────────────────────────────────────────────────────  │
│  │                                                             │
│  ├─ 11:45 AM - thing_updated                                 │
│  │  Blog Post "How to Build..." was updated by John           │
│  │  [View Details]                                            │
│  │                                                             │
│  ├─ 11:30 AM - thing_created                                 │
│  │  Course "React Advanced" was created by Alice              │
│  │  [View Details]                                            │
│  │                                                             │
│  └─ 10:00 AM - group_created                                 │
│     Engineering Team was created by Admin                     │
│     [View Details]                                            │
│                                                                │
│  Yesterday                                                     │
│  ○─────────────────────────────────────────────────────────  │
│  │                                                             │
│  ├─ 4:30 PM - thing_deleted                                  │
│  │  Token "OLD" was deleted by John                           │
│  │  [View Details]                                            │
│                                                                │
│  [Load More]                                                   │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- Card (for each event)
- Badge (event type)
- Button (View Details, Load More)
- Select (filter dropdown)

**Event Card Details:**
- Timestamp
- Event type (color-coded badge)
- Actor (who did it)
- Target (what was affected)
- Metadata (additional details)

## Wireframe 8: Knowledge Search

**Purpose:** Semantic search interface for labels and chunks

**Layout Pattern:** Search bar with results

```
┌──────────────────────────────────────────────────────────────┐
│ Knowledge Search                                              │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Search... (semantic search powered by embeddings)     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  Results for "how to build with ONE"                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Blog Post: "How to Build with ONE Platform"           │  │
│  │ ...build with ONE Platform using the 6-dimension...   │  │
│  │ Similarity: 92%  │  Created: 2025-10-25               │  │
│  │ [View Thing]                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Course: "ONE Platform Fundamentals"                   │  │
│  │ ...fundamentals of building on ONE with examples...   │  │
│  │ Similarity: 87%  │  Created: 2025-10-20               │  │
│  │ [View Thing]                                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                                │
│  [Show More Results]                                           │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

**Components:**
- Input (search bar with icon)
- Card (result cards)
- Progress (similarity score)
- Button (View Thing, Show More)

**Search Features:**
- Real-time search with debounce (300ms)
- Semantic similarity score
- Highlight matching text
- Filter by knowledge type (label, chunk)

## Design System

### Colors (from global.css)

**Light Mode:**
- Primary: `hsl(216 55% 25%)` - Professional blue
- Secondary: `hsl(219 14% 28%)` - Muted blue-gray
- Accent: `hsl(105 22% 25%)` - Green accent
- Background: `hsl(36 8% 88%)` - Warm off-white
- Foreground: `hsl(0 0% 13%)` - Near black

**Dark Mode:**
- Primary: `hsl(216 55% 25%)` - Same blue (consistent)
- Background: `hsl(0 0% 13%)` - Near black
- Foreground: `hsl(36 8% 96%)` - Near white

### Typography

- Headings: System font stack with fallback
- Body: 16px base, 1.5 line height
- Code: Monospace, `hsl(var(--color-sidebar-background))`

### Spacing (4px base unit)

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Border Radius

- sm: 0.375rem (6px)
- md: 0.75rem (12px)
- lg: 1.5rem (24px)

### Component Variants

**Buttons:**
- Primary: Solid primary color
- Secondary: Outline with primary border
- Ghost: Transparent with hover
- Destructive: Red for delete actions

**Cards:**
- Default: Background with border
- Elevated: Shadow for depth
- Outlined: Border only

**Badges:**
- Active: Green
- Draft: Yellow
- Archived: Gray
- Published: Blue

## Responsive Breakpoints

- Mobile: < 768px (single column)
- Tablet: 768px - 1024px (2 columns)
- Desktop: > 1024px (3 columns, full layout)

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Body text: ≥ 4.5:1
- Large text (≥18px): ≥ 3:1
- UI components: ≥ 3:1

**Keyboard Navigation:**
- All interactive elements: Tab order
- Dialogs: Trap focus, Escape to close
- Forms: Enter to submit
- Lists: Arrow keys for selection

**ARIA Labels:**
- Buttons: `aria-label` for icon-only
- Dialogs: `role="dialog"`, `aria-labelledby`
- Forms: Associate labels with inputs
- Status messages: `aria-live="polite"`

**Focus Management:**
- Visible focus indicators (ring)
- Skip to main content link
- Focus trap in modals
- Return focus on close

**Screen Readers:**
- Semantic HTML (`<nav>`, `<main>`, `<section>`)
- Alt text for icons/images
- Error messages announced
- Loading states announced

## Loading States

**Skeleton Screens:**
```
┌──────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ ░░░░░░░░░░░░░░░░  ░░░░░░░░░░░░░░  ░░░░░░░░░░░░░░░░        │
│ ░░░░░░░░░░░░░░░░  ░░░░░░░░░░░░░░  ░░░░░░░░░░░░░░░░        │
└──────────────────────────────────────────────────────────────┘
```

**Spinner (for actions):**
- Small spinner for button actions
- Full-page spinner for navigation
- Progress bar for long operations

## Error States

**Form Errors:**
- Red border on invalid field
- Error message below field
- Icon indicator (X)
- Focus invalid field

**API Errors:**
- Toast notification (top-right)
- Alert component (in-page)
- Retry button
- Clear error message text

**Empty States:**
- Illustration or icon
- Descriptive text
- Call-to-action button
- Help text or link

## Performance Targets

**Core Web Vitals:**
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Optimization Strategies:**
- Lazy load images (native loading="lazy")
- Code split by route (Astro automatic)
- Skeleton screens during load
- Debounce search inputs (300ms)
- Pagination for large lists (limit 20-50)
- Virtual scrolling for 1000+ items

## Component Mapping to Tests

### Groups Test (backend/test/groups.test.ts)

| Test User Flow | UI Component | Design Element |
|---|---|---|
| Create Organization | Create Group Dialog | Wireframe 3 |
| Hierarchical Groups | Group List with Tree | Wireframe 2 |
| List and Query | Group Filters | Wireframe 2 |
| Update Group | Edit Group Dialog | Wireframe 3 |
| Archive Group | Delete Confirmation | Wireframe 3 |

### Things Test (backend/test/things.test.ts)

| Test User Flow | UI Component | Design Element |
| Create Thing | Create Thing Dialog | Similar to Wireframe 3 |
| List and Filter | Thing Grid with Filters | Wireframe 4 |
| Update Thing | Thing Details Form | Wireframe 5 |
| Delete Thing | Delete Confirmation | Wireframe 5 |

## Next Steps

1. **Create Component Specs:** Detailed React component definitions
2. **Design Tokens:** Generate Tailwind config from design system
3. **Accessibility Audit:** Validate all WCAG requirements
4. **Performance Testing:** Measure against targets
5. **User Testing:** Validate flows with real users

---

**Designed to enable tests to pass. Every UI element maps to an acceptance criterion.**
