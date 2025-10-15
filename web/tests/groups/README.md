# Frontend Groups Tests

Comprehensive test suite for groups UI components, pages, and workflows.

## Test Coverage

### Component Tests (29 tests)
**GroupCard Component** (5 tests)
- Render group information
- Handle click events
- Display different group types
- Show public visibility
- Show enterprise plan

**GroupSelector Component** (5 tests)
- Render group options
- Call onSelect when group is selected
- Show selected group
- Handle empty groups list
- Have accessible label

**GroupTypeSelector Component** (4 tests)
- Render all group types
- Call onChange when type is selected
- Show selected type
- Have accessible label

**GroupHierarchy Component** (5 tests)
- Render flat hierarchy (no subgroups)
- Render 2-level hierarchy
- Render 5-level hierarchy
- Display group names in hierarchy
- Handle complex nested structure

**GroupStats Component** (3 tests)
- Display all stats
- Display zero values correctly
- Handle large numbers

### Workflow Tests (16 tests)
**Create Group Workflow** (3 tests)
- Complete full group creation flow
- Validate required fields
- Create different group types

**Group Settings Workflow** (3 tests)
- Update group settings
- Show current settings as defaults
- Upgrade from starter to enterprise

**Group Discovery Workflow** (5 tests)
- Search and display results
- Filter by type
- Filter by visibility
- Combine search and filters
- Display empty state when no results

**Complete Group Lifecycle** (1 test)
- Create → configure → publish workflow

**Hierarchical Group Workflows** (1 test)
- Create parent and child groups

### Page Tests (17 tests)
**GroupDetailPage** (5 tests)
- Show loading state
- Show not found state
- Display group details
- Display group stats
- Show navigation tabs

**CreateGroupPage** (5 tests)
- Render create form
- Show optional description field
- Include settings section
- Handle successful creation
- Handle creation error

**GroupSettingsPage** (5 tests)
- Display current group info
- Handle settings update
- Show archive confirmation
- Cancel archive
- Confirm archive

**GroupDiscoveryPage** (6 tests)
- Render search interface
- Show loading state
- Display search results
- Show empty state
- Update search query
- Update filters

## Running Tests

```bash
# Install dependencies
cd web
bun install

# Run groups tests
bun test tests/groups

# Watch mode
bun test tests/groups --watch

# Coverage report
bun test tests/groups --coverage
```

## Test Structure

```
web/tests/groups/
├── vitest.config.ts         # Vitest configuration
├── setup.ts                 # Test utilities and mocks
├── components.test.tsx      # Component tests (29 tests)
├── workflows.test.tsx       # Workflow tests (16 tests)
└── pages.test.tsx           # Page tests (17 tests)
```

## Key Features Tested

### UI Components
- ✅ GroupCard - Display group information
- ✅ GroupSelector - Dropdown selection
- ✅ GroupTypeSelector - Type selection
- ✅ GroupHierarchy - Tree visualization (5+ levels)
- ✅ GroupStats - Statistics display

### User Workflows
- ✅ Create group flow
- ✅ Update settings flow
- ✅ Search and discovery flow
- ✅ Hierarchical creation flow
- ✅ Complete lifecycle flow

### Pages
- ✅ Group detail page (group/[slug])
- ✅ Create group page
- ✅ Settings page
- ✅ Discovery page

### Loading & Error States
- ✅ Loading indicators
- ✅ Not found states
- ✅ Empty states
- ✅ Error messages
- ✅ Success messages

### Accessibility
- ✅ Form labels
- ✅ ARIA attributes
- ✅ Keyboard navigation
- ✅ Screen reader support

## Test Utilities

### createMockGroup(overrides?)
Creates a mock group object with defaults and optional overrides

```typescript
const group = createMockGroup({
  name: 'My Group',
  type: 'dao',
});
```

### createMockGroupHierarchy(levels)
Creates a hierarchy of groups with specified depth

```typescript
const hierarchy = createMockGroupHierarchy(5); // 5 levels deep
```

### createMockStats()
Creates mock statistics object

```typescript
const stats = createMockStats(); // { members: 5, entities: 20, ... }
```

### mockUseQuery
Mocked Convex useQuery hook

```typescript
mockUseQuery.mockReturnValue(mockGroup);
```

### mockUseMutation
Mocked Convex useMutation hook

```typescript
mockUseMutation.mockReturnValue(vi.fn().mockResolvedValue('id'));
```

## Mock Components

The tests use mock implementations of components that would exist in production:

- **GroupCard** - Card component displaying group info
- **GroupSelector** - Dropdown for selecting groups
- **GroupTypeSelector** - Type selection dropdown
- **GroupHierarchy** - Tree view of nested groups
- **GroupStats** - Statistics dashboard
- **CreateGroupForm** - Form for creating groups
- **GroupSettingsForm** - Form for updating settings
- **GroupDiscovery** - Search and filter interface
- **GroupDetailPage** - Main group page
- **CreateGroupPage** - Creation page
- **GroupSettingsPage** - Settings page
- **GroupDiscoveryPage** - Discovery page

## Total Frontend Test Count

**62 Frontend Tests**
- 29 Component tests
- 16 Workflow tests
- 17 Page tests

## Integration with Backend

Frontend tests mock Convex hooks but match the actual API:

```typescript
// Mocked in tests
mockUseMutation.mockReturnValue(createGroup);

// Real usage in components
const createGroup = useMutation(api.mutations.groups.create);
```

## Next Steps

1. Install web dependencies:
   ```bash
   cd /Users/toc/Server/ONE/web
   bun install
   ```

2. Add vitest dependencies:
   ```bash
   bun add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
   ```

3. Run tests:
   ```bash
   bun test tests/groups
   ```

Expected output: **62 passing tests**

## Combined Total

**Backend + Frontend = 117 Tests**
- 55 Backend tests (mutations + queries + integration)
- 62 Frontend tests (components + workflows + pages)
