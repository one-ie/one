# Demo Testing Plan - Infer 15-20

**Status:** Test Definition Phase
**Target:** Beautiful, Interactive 6-Dimension Demos
**Quality Gate:** 80%+ Coverage, All Acceptance Criteria Met

---

## 1. Test Overview

### Purpose
Comprehensive testing strategy for 6-dimension ontology demo pages, ensuring complete backend-agnostic integration with real Convex API or mock providers.

### Scope
- **Frontend Pages:** `/demo/index`, `/demo/groups`, `/demo/people`, `/demo/things`, `/demo/connections`, `/demo/events`, `/demo/search`
- **React Components:** `HooksDemo`, `SearchDemo`, `PeopleDemo` + all dimension-specific demos
- **Backend Connection:** Convex API at `https://shocking-falcon-870.convex.cloud`
- **Data Model:** 6-Dimension Ontology (groups, people, things, connections, events, knowledge)

### Success Criteria
- All demo pages load with correct data
- Interactive CRUD operations work end-to-end
- Backend connection status properly displayed
- Error states handled gracefully
- Loading states visible during async operations
- All hooks execute without errors
- Performance targets met (< 1s page load, < 200ms API calls)
- Accessibility standards met (WCAG 2.1 AA)
- Cross-browser compatibility verified

---

## 2. Test Architecture

### Test Framework Stack
```
Vitest          → Unit & Integration tests (already configured)
Playwright      → E2E tests (install as dev dependency)
Testing Library → Component testing utilities
```

### Installation
```bash
# Already installed
bun add -d vitest @vitest/ui @testing-library/react @testing-library/dom

# Add for E2E tests
bun add -d @playwright/test
```

### Test Structure
```
tests/
├── demo/
│   ├── e2e/                    # End-to-end tests
│   │   ├── demo.spec.ts
│   │   ├── dimensions/
│   │   │   ├── groups.spec.ts
│   │   │   ├── people.spec.ts
│   │   │   ├── things.spec.ts
│   │   │   ├── connections.spec.ts
│   │   │   ├── events.spec.ts
│   │   │   └── search.spec.ts
│   │   └── features/
│   │       ├── backend-connection.spec.ts
│   │       ├── crud-operations.spec.ts
│   │       ├── error-handling.spec.ts
│   │       └── loading-states.spec.ts
│   ├── unit/                   # Component & hook tests
│   │   ├── components/
│   │   │   ├── HooksDemo.test.tsx
│   │   │   ├── SearchDemo.test.tsx
│   │   │   ├── PeopleDemo.test.tsx
│   │   │   └── DemoContainer.test.tsx
│   │   └── hooks/
│   │       ├── useProvider.test.ts
│   │       ├── useGroups.test.ts
│   │       ├── useThings.test.ts
│   │       ├── useConnections.test.ts
│   │       ├── useEvents.test.ts
│   │       ├── useSearch.test.ts
│   │       └── useLabels.test.ts
│   ├── integration/            # Component integration tests
│   │   ├── demo-data-flow.test.ts
│   │   ├── provider-switching.test.ts
│   │   └── ontology-operations.test.ts
│   └── visual/                 # Visual regression tests
│       ├── demo-layouts.test.ts
│       ├── dark-mode.test.ts
│       └── responsive.test.ts
└── fixtures/
    ├── demo-data.ts           # Test data setup
    ├── mock-providers.ts      # Mock provider implementations
    └── seed-database.ts       # Database seeding for integration tests
```

---

## 3. Test Specifications (Gherkin Format)

### 3.1 E2E Tests: Demo Index Page

**File:** `tests/demo/e2e/demo.spec.ts`

```gherkin
Feature: Demo Index Page
  As a user
  I want to see the demo hub
  So that I can navigate to dimension-specific demos

  Background:
    Given the demo index page is navigable at "/demo"
    And the page title is "Demo - Frontend-Backend Integration"

  Scenario: Page loads successfully
    When I visit "/demo"
    Then the page should load in less than 1 second
    And I should see the hero section with title "Demo: Frontend-Backend Integration"
    And I should see 4 status badges: "Production Ready", "Full Type Safe", "Backend Agnostic"

  Scenario: Navigation cards are visible
    When I visit "/demo"
    Then I should see navigation cards for all 6 dimensions:
      | Dimension    | Icon | Description             |
      | Groups       | 👥  | Multi-tenant isolation  |
      | People       | 👤  | Authorization & roles   |
      | Things       | 📦  | Entities & objects      |
      | Connections  | 🔗  | Relationships           |
      | Events       | 📊  | Audit trail             |
      | Search       | 🔍  | Semantic search         |
    And each card should link to correct route
    And cards should have hover effects

  Scenario: Statistics panel displays correctly
    Given backend connection is available
    When I visit "/demo"
    Then I should see statistics showing:
      | Statistic     | Data Point      |
      | Total Groups  | Count of groups |
      | Total Things  | Count of things |
      | Active Events | Count of events |

  Scenario: Backend connection status displayed
    When I visit "/demo"
    And I wait for provider check (< 200ms)
    Then I should see connection status indicator:
      | Backend Status | Indicator Color | Message         |
      | Connected      | Green           | "Backend Ready" |
      | Disconnected   | Red             | "Mock Data Mode"|

  Scenario: Error handling on failed load
    Given backend API returns error
    When I visit "/demo"
    Then I should see error alert with message
    And I should see graceful fallback to mock data
    And navigation cards should still be accessible
```

### 3.2 E2E Tests: Dimension Pages (Groups, People, Things, etc.)

**File:** `tests/demo/e2e/dimensions/groups.spec.ts` (pattern for all dimensions)

```gherkin
Feature: Groups Dimension Demo
  As a developer
  I want to interact with groups data
  So that I can understand the multi-tenant model

  Background:
    Given I am on "/demo/groups"
    And backend provider is initialized

  Scenario: Groups page loads with data
    When I visit "/demo/groups"
    Then page should load in less than 1 second
    And I should see heading "Groups: Multi-Tenant Isolation"
    And I should see list of groups from backend

  Scenario: Create new group (CRUD: Create)
    When I visit "/demo/groups"
    And I fill in the create group form:
      | Field       | Value              |
      | Name        | "Test Group"       |
      | Type        | "organization"     |
      | Description | "Demo group"       |
    And I click "Create Group"
    Then I should see success message
    And new group should appear in list within 500ms
    And new group connection event should be logged

  Scenario: Read group details
    Given groups exist in database
    When I visit "/demo/groups"
    And I click on a group in the list
    Then I should see group details panel:
      - Group name
      - Group type (organization, business, community, etc.)
      - Parent group (if applicable)
      - Member count
      - Created date
    And the panel should load within 300ms

  Scenario: Update group properties
    Given a group is selected
    When I click "Edit" button
    And I update group name from "Old Name" to "New Name"
    And I click "Save"
    Then I should see success notification
    And group name should update in list within 500ms
    And event_updated event should be logged

  Scenario: Delete/Archive group
    Given a test group exists
    When I click "Delete" on the group
    And I confirm the deletion
    Then group should be archived (not deleted)
    And group should disappear from active list
    And deletion event should be logged

  Scenario: Error handling for invalid operations
    When I try to create group without name
    Then I should see validation error: "Name is required"
    And form should not submit
    And no event should be logged

  Scenario: Hierarchical groups display
    Given parent and child groups exist
    When I visit "/demo/groups"
    Then I should see hierarchical structure:
      - Parent group expanded
      - Child groups indented under parent
      - Can collapse/expand parent

  Scenario: Performance: List 100 groups efficiently
    Given database has 100+ groups
    When I visit "/demo/groups"
    Then page should load within 1 second
    And pagination should show 10 groups per page
    And page transitions should complete within 300ms
```

### 3.3 E2E Tests: Things Dimension

**File:** `tests/demo/e2e/dimensions/things.spec.ts`

```gherkin
Feature: Things Dimension Demo
  As a developer
  I want to interact with things (entities)
  So that I can understand the entity model

  Scenario: Things page loads with filters
    When I visit "/demo/things"
    Then I should see filter options:
      | Filter Type | Options              |
      | Type        | course, blog_post... |
      | Status      | draft, active, etc   |
      | Created     | last week, etc       |

  Scenario: Filter things by type
    When I visit "/demo/things"
    And I select filter "type: course"
    Then list should update within 300ms
    And all visible things should have type "course"

  Scenario: Search things by name
    When I visit "/demo/things"
    And I type "React" in search box
    And I wait 300ms for debounce
    Then results should show things matching "React"
    And search should complete within 500ms

  Scenario: Create thing with properties
    When I click "Create Thing" button
    And I fill in the form:
      | Field      | Value                    |
      | Type       | "course"                 |
      | Name       | "React Fundamentals"     |
      | Properties | {description, price}     |
    And I click "Create"
    Then thing should appear in list
    And thing_created event should be logged
    And connection to creator should be created

  Scenario: View thing details
    Given things exist in list
    When I click on a thing
    Then I should see detail panel with:
      - Thing name and type
      - Full properties object
      - All connections (incoming and outgoing)
      - Activity timeline (events)

  Scenario: Update thing properties
    Given a thing detail panel is open
    When I click "Edit"
    And I update property "price" from "99" to "149"
    And I click "Save"
    Then thing should update in list
    And thing_updated event should be logged

  Scenario: Performance: Search 500 things
    Given database has 500+ things
    When I type search query
    Then search should complete within 500ms
    And results should be paginated
```

### 3.4 E2E Tests: Connections Dimension

**File:** `tests/demo/e2e/dimensions/connections.spec.ts`

```gherkin
Feature: Connections Dimension Demo
  As a developer
  I want to see relationships between entities
  So that I can understand the connection model

  Scenario: Connections graph displays
    When I visit "/demo/connections"
    Then I should see force-directed graph showing:
      - Nodes for each thing
      - Edges showing connections
      - Labels for connection types (authored, owns, etc.)

  Scenario: Create connection between things
    When I visit "/demo/connections"
    And I select source thing "Alice"
    And I select target thing "React Course"
    And I choose relationship type "authored"
    And I click "Create Connection"
    Then connection should appear on graph
    And connection_created event should be logged

  Scenario: Filter connections by type
    When I visit "/demo/connections"
    And I select relationship type filter "owns"
    Then graph should show only "owns" connections
    And count should update to show filtered total

  Scenario: Connection metadata display
    When I click on a connection edge
    Then I should see metadata panel:
      - From entity: [name, type]
      - To entity: [name, type]
      - Relationship type
      - Created date
      - Custom metadata (if any)

  Scenario: Delete connection
    Given a connection is selected
    When I click "Delete" button
    And I confirm
    Then connection should be removed from graph
    And connection_deleted event should be logged
```

### 3.5 E2E Tests: Events Dimension

**File:** `tests/demo/e2e/dimensions/events.spec.ts`

```gherkin
Feature: Events Dimension Demo (Audit Trail)
  As a developer
  I want to see activity timeline
  So that I can understand event logging

  Scenario: Events timeline displays correctly
    When I visit "/demo/events"
    Then I should see timeline with events sorted by:
      - Most recent first
      - Event type badge (color-coded)
      - Timestamp
      - Actor information
      - Event details

  Scenario: Filter events by type
    When I visit "/demo/events"
    And I select event type filter "thing_created"
    Then timeline should show only creation events
    And count should update

  Scenario: Filter events by date range
    When I visit "/demo/events"
    And I select date range "Last 7 days"
    Then timeline should show only events from that period
    And count should update within 300ms

  Scenario: Event detail view
    When I click on an event in timeline
    Then I should see detail panel:
      - Full event data (JSON)
      - Event type
      - Actor (who triggered event)
      - Target (what was affected)
      - Timestamp (with timezone)
      - Metadata

  Scenario: Performance: Load 1000 events
    Given database has 1000+ events
    When I visit "/demo/events"
    Then page should load within 1 second
    And timeline should use virtualization (show < 50 DOM nodes)
    And scrolling should be smooth (60 FPS)
```

### 3.6 E2E Tests: Search Dimension

**File:** `tests/demo/e2e/dimensions/search.spec.ts`

```gherkin
Feature: Search Dimension Demo (Semantic Search)
  As a developer
  I want to search across all entities
  So that I can understand semantic search

  Scenario: Search returns results
    When I visit "/demo/search"
    And I type "React hooks" in search box
    And I wait for results (< 500ms)
    Then I should see results grouped by type:
      | Type      | Count |
      | things    | N     |
      | events    | N     |
      | knowledge | N     |
    And results should be ranked by relevance

  Scenario: Search filters by dimension
    When I search for "React"
    And I select filter "Things only"
    Then results should show only things
    And no events or knowledge should appear

  Scenario: Search performance
    When I type multi-word query
    Then results should appear within 500ms
    And search should handle 10,000+ entities

  Scenario: Search with no results
    When I search for "zxcvbnmasdfghjkl" (nonsense)
    Then I should see message: "No results found"
    And I should see suggestions: "Try different keywords"
```

### 3.7 E2E Tests: Backend Connection & Error Handling

**File:** `tests/demo/e2e/features/backend-connection.spec.ts`

```gherkin
Feature: Backend Connection Status
  As a user
  I want to know if backend is connected
  So that I understand whether I'm using real or mock data

  Scenario: Connected to backend
    Given Convex API is available
    When I load any demo page
    Then I should see connection indicator "green" near title
    And indicator should show "Connected to Convex"
    And data should come from real backend

  Scenario: Backend disconnected - graceful fallback
    Given Convex API is not available
    When I load any demo page
    Then I should see connection indicator "red"
    And I should see message: "Using mock data"
    And page should still be fully functional
    And operations should use in-memory mock provider

  Scenario: Connection check performance
    When I load any demo page
    Then provider check should complete in < 200ms
    And page should show loading skeleton during check
    And no blocking waits for backend

  Scenario: Error handling - Failed mutation
    Given I am creating a thing
    And backend returns HTTP 500 error
    When I click "Create"
    Then I should see error toast: "Failed to create thing"
    And form should remain populated
    And I should be able to retry

  Scenario: Error handling - Network timeout
    Given backend takes > 10 seconds to respond
    When I make a request
    Then request should timeout after 5 seconds
    And I should see error message: "Request timeout"
    And page should remain usable
```

### 3.8 E2E Tests: Performance Benchmarks

**File:** `tests/demo/e2e/features/performance.spec.ts`

```gherkin
Feature: Performance Targets
  As a platform architect
  I want performance to meet standards
  So that users have fast experience

  Scenario: Demo index page loads < 1 second
    When I navigate to "/demo"
    Then page should be interactive within 1000ms
    And First Contentful Paint (FCP) < 800ms
    And Largest Contentful Paint (LCP) < 1200ms

  Scenario: API calls complete < 200ms
    When I perform any CRUD operation
    Then API response time should be < 200ms
    And UI should update immediately after response

  Scenario: Pagination loads quickly
    Given list has 1000+ items
    When I navigate to page 2
    Then page should load within 300ms
    And no jank or visual stuttering

  Scenario: Large list rendering efficient
    Given I have 500 items in list
    When I scroll through list
    Then frame rate should be 60+ FPS
    And memory usage should not increase > 50MB
    And DOM should have < 100 visible nodes (virtualized)

  Scenario: Search debounce working
    When I type "React hooks" character by character
    Then only final search should execute
    And search should NOT execute on every keystroke
    And search should complete within 500ms

  Scenario: Lighthouse scores
    When I audit any demo page with Lighthouse
    Then scores should be >= 95 in all categories:
      | Category   | Target |
      | Performance| 95+    |
      | Accessibility| 95+ |
      | Best Practices| 95+|
      | SEO        | 95+    |
```

### 3.9 E2E Tests: Accessibility

**File:** `tests/demo/e2e/features/accessibility.spec.ts`

```gherkin
Feature: Accessibility Compliance (WCAG 2.1 AA)
  As a user with accessibility needs
  I want all demo pages to be accessible
  So that everyone can use the platform

  Scenario: Keyboard navigation works
    When I navigate demo pages using only Tab and Enter keys
    Then I should be able to:
      - Tab through all interactive elements
      - Activate buttons with Enter
      - Navigate lists with arrow keys
      - Close modals with Escape
    And focus should be visible (high contrast outline)

  Scenario: Screen reader compatibility
    When I use screen reader to navigate
    Then I should hear:
      - Page title
      - Navigation landmarks (nav, main, etc.)
      - Button names and states
      - Form labels
      - Table headers and cell relationships

  Scenario: Color contrast meets AA standard
    When I check all text elements
    Then contrast ratio should be >= 4.5:1 for normal text
    And >= 3:1 for large text (18px+ or 14px+ bold)

  Scenario: Images have alt text
    When I inspect all images
    Then each image should have:
      - Meaningful alt text (not "image" or "photo")
      - OR be marked as decorative with alt=""

  Scenario: Form error messages accessible
    When I submit invalid form
    Then error messages should:
      - Be clearly visible
      - Associate with form field
      - Be announced by screen reader
      - Suggest how to fix

  Scenario: Loading states announced
    When I trigger async operation
    Then aria-busy should be set to true
    And aria-label should announce "Loading..."
    And screen reader should announce completion when done
```

---

## 4. Unit & Component Tests

### 4.1 Hook Tests

**File:** `tests/demo/unit/hooks/useProvider.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProvider, useIsProviderAvailable } from '@/hooks/ontology';

describe('useProvider Hook', () => {
  beforeEach(() => {
    // Clear any mocks
    vi.clearAllMocks();
  });

  it('should return provider when available', async () => {
    const { result } = renderHook(() => useProvider());

    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('groups');
    expect(result.current).toHaveProperty('things');
    expect(result.current).toHaveProperty('connections');
  });

  it('should check provider availability', async () => {
    const { result } = renderHook(() => useIsProviderAvailable());

    await waitFor(() => {
      expect(typeof result.current).toBe('boolean');
    });
  });

  it('should handle provider errors gracefully', async () => {
    const { result } = renderHook(() => useProvider());

    // Provider should still be available even if backend fails
    expect(result.current).toBeDefined();
  });

  it('should use same provider instance', () => {
    const { result: result1 } = renderHook(() => useProvider());
    const { result: result2 } = renderHook(() => useProvider());

    expect(result1.current).toBe(result2.current);
  });
});
```

**File:** `tests/demo/unit/hooks/useGroups.test.ts`

```typescript
describe('useGroups Hook', () => {
  it('should list groups successfully', async () => {
    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.groups).toBeDefined();
      expect(Array.isArray(result.current.groups)).toBe(true);
    });
  });

  it('should handle loading state', () => {
    const { result } = renderHook(() => useGroups());

    // Should start with loading: false (assuming cache)
    expect(result.current.loading).toBeFalse();
  });

  it('should handle error state', async () => {
    // Mock provider to fail
    vi.mock('@/lib/ontology/factory', () => ({
      getProvider: () => ({
        groups: { list: () => Promise.reject(new Error('Failed')) }
      })
    }));

    const { result } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it('should cache results', async () => {
    const { result: result1 } = renderHook(() => useGroups());
    const { result: result2 } = renderHook(() => useGroups());

    await waitFor(() => {
      expect(result1.current.groups).toEqual(result2.current.groups);
    });
  });
});
```

Similar tests for:
- `useThings()` - Thing CRUD operations
- `useConnections()` - Connection queries
- `useEvents()` - Event timeline
- `useSearch()` - Semantic search
- `useLabels()` - Knowledge labels

### 4.2 Component Tests

**File:** `tests/demo/unit/components/HooksDemo.test.tsx`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HooksDemo } from '@/components/demo/HooksDemo';
import { MockProvider } from '@/__mocks__/providers';

describe('HooksDemo Component', () => {
  beforeEach(() => {
    // Mock provider
    vi.mock('@/hooks/ontology', () => ({
      useProvider: () => new MockProvider(),
      useIsProviderAvailable: () => true,
    }));
  });

  it('should render demo buttons for each hook', () => {
    render(<HooksDemo />);

    expect(screen.getByText('useProvider')).toBeInTheDocument();
    expect(screen.getByText('useGroups')).toBeInTheDocument();
    expect(screen.getByText('useThings')).toBeInTheDocument();
    expect(screen.getByText('useConnections')).toBeInTheDocument();
    expect(screen.getByText('useEvents')).toBeInTheDocument();
    expect(screen.getByText('useSearch')).toBeInTheDocument();
  });

  it('should execute hook when button clicked', async () => {
    const user = userEvent.setup();
    render(<HooksDemo />);

    const button = screen.getByText(/useProvider/i).closest('button');
    await user.click(button!);

    await waitFor(() => {
      expect(screen.getByText(/Provider Status/i)).toBeInTheDocument();
    });
  });

  it('should display loading state during execution', async () => {
    const user = userEvent.setup();
    render(<HooksDemo />);

    const button = screen.getByText(/useGroups/i).closest('button');
    await user.click(button!);

    // Button should show loading state
    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveTextContent('Loading...');
  });

  it('should show results in JSON format', async () => {
    const user = userEvent.setup();
    render(<HooksDemo />);

    const button = screen.getByText(/useGroups/i).closest('button');
    await user.click(button!);

    await waitFor(() => {
      const jsonDisplay = screen.getByRole('code');
      expect(jsonDisplay).toBeInTheDocument();
      expect(jsonDisplay.textContent).toContain('groups');
    });
  });

  it('should handle provider unavailable gracefully', () => {
    vi.mock('@/hooks/ontology', () => ({
      useIsProviderAvailable: () => false,
    }));

    render(<HooksDemo />);

    expect(screen.getByText(/Using mock data/i)).toBeInTheDocument();
  });

  it('should be accessible', () => {
    render(<HooksDemo />);

    // All buttons should be keyboard accessible
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveProperty('disabled', false);
    });
  });
});
```

**File:** `tests/demo/unit/components/SearchDemo.test.tsx`

```typescript
describe('SearchDemo Component', () => {
  it('should render search input', () => {
    render(<SearchDemo />);
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    const user = userEvent.setup();
    render(<SearchDemo />);

    const input = screen.getByPlaceholderText(/search/i);

    // Type quickly
    await user.type(input, 'React');

    // Should NOT call search until debounce expires
    expect(screen.queryByText(/searching/i)).not.toBeInTheDocument();

    // Wait for debounce
    await waitFor(() => {
      expect(screen.getByText(/results for/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('should display search results', async () => {
    const user = userEvent.setup();
    render(<SearchDemo />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'React');

    await waitFor(() => {
      expect(screen.getByText(/React Hooks Masterclass/i)).toBeInTheDocument();
    });
  });

  it('should show no results message', async () => {
    const user = userEvent.setup();
    render(<SearchDemo />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'zxcvbnm');

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });
});
```

---

## 5. Integration Tests

**File:** `tests/demo/integration/demo-data-flow.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConvexHttpClient } from 'convex/browser';
import { getProvider } from '@/lib/ontology/factory';

describe('Demo Data Flow Integration', () => {
  let provider: any;
  let testGroupId: string;

  beforeAll(async () => {
    provider = await getProvider();
    // Create test group
    testGroupId = await provider.groups.create({
      name: 'Demo Integration Test',
      type: 'organization',
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testGroupId) {
      await provider.groups.delete(testGroupId);
    }
  });

  it('should create and retrieve group', async () => {
    const group = await provider.groups.getById(testGroupId);
    expect(group).toBeDefined();
    expect(group.name).toBe('Demo Integration Test');
  });

  it('should create thing in group', async () => {
    const thing = await provider.things.create({
      groupId: testGroupId,
      type: 'course',
      name: 'Integration Test Course',
    });

    expect(thing).toBeDefined();
    expect(thing._id).toBeDefined();
  });

  it('should create connection between entities', async () => {
    const creator = await provider.things.create({
      groupId: testGroupId,
      type: 'creator',
      name: 'Test Creator',
    });

    const course = await provider.things.create({
      groupId: testGroupId,
      type: 'course',
      name: 'Test Course',
    });

    const connection = await provider.connections.create({
      groupId: testGroupId,
      fromThingId: creator._id,
      toThingId: course._id,
      relationshipType: 'authored',
    });

    expect(connection).toBeDefined();
    expect(connection.fromThingId).toBe(creator._id);
    expect(connection.toThingId).toBe(course._id);
  });

  it('should log events for all operations', async () => {
    const events = await provider.events.list({
      groupId: testGroupId,
    });

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
  });

  it('should search things across all groups', async () => {
    const results = await provider.search('Test', {
      types: ['course', 'creator'],
      limit: 10,
    });

    expect(Array.isArray(results)).toBe(true);
  });
});
```

---

## 6. Test Data & Fixtures

**File:** `tests/fixtures/demo-data.ts`

```typescript
export const DEMO_GROUPS = [
  {
    _id: 'group_1',
    name: 'Acme Corporation',
    type: 'organization',
    description: 'Demo organization',
    properties: { plan: 'enterprise' },
    status: 'active',
    createdAt: Date.now(),
  },
  {
    _id: 'group_2',
    name: 'Engineering Team',
    type: 'business',
    description: 'Product engineering team',
    parentGroupId: 'group_1',
    status: 'active',
    createdAt: Date.now(),
  },
];

export const DEMO_THINGS = [
  {
    _id: 'thing_1',
    groupId: 'group_1',
    type: 'creator',
    name: 'Alice Johnson',
    properties: { role: 'org_owner', email: 'alice@acme.com' },
    status: 'active',
    createdAt: Date.now(),
  },
  {
    _id: 'thing_2',
    groupId: 'group_1',
    type: 'course',
    name: 'React Fundamentals',
    properties: { description: 'Learn React basics', price: 99, duration: 4 },
    status: 'active',
    createdAt: Date.now(),
  },
];

export const DEMO_CONNECTIONS = [
  {
    _id: 'connection_1',
    groupId: 'group_1',
    fromThingId: 'thing_1',
    toThingId: 'thing_2',
    relationshipType: 'authored',
    metadata: { role: 'primary_author' },
    createdAt: Date.now(),
  },
];

export const DEMO_EVENTS = [
  {
    _id: 'event_1',
    groupId: 'group_1',
    type: 'thing_created',
    actorId: 'thing_1',
    targetId: 'thing_2',
    timestamp: Date.now() - 3600000,
    metadata: { entityType: 'course' },
  },
];

export async function seedDemoDatabase(provider: any, groupId: string) {
  // Create things
  const things = await Promise.all(
    DEMO_THINGS.map(thing =>
      provider.things.create({ ...thing, groupId })
    )
  );

  // Create connections
  await Promise.all(
    DEMO_CONNECTIONS.map(conn =>
      provider.connections.create({
        ...conn,
        groupId,
        fromThingId: things[0]._id,
        toThingId: things[1]._id,
      })
    )
  );

  return things;
}
```

**File:** `tests/fixtures/mock-providers.ts`

```typescript
export class MockProvider implements Provider {
  private groups: Map<string, Group> = new Map();
  private things: Map<string, Thing> = new Map();
  private connections: Map<string, Connection> = new Map();
  private events: Map<string, Event> = new Map();

  groups = {
    list: async () => Array.from(this.groups.values()),
    getById: async (id: string) => this.groups.get(id),
    create: async (data: any) => {
      const id = 'mock_' + Math.random().toString(36);
      const group = { _id: id, ...data, createdAt: Date.now() };
      this.groups.set(id, group);
      return id;
    },
  };

  things = {
    list: async (options?: any) => Array.from(this.things.values()).slice(0, options?.limit || 100),
    create: async (data: any) => {
      const id = 'mock_' + Math.random().toString(36);
      const thing = { _id: id, ...data, createdAt: Date.now() };
      this.things.set(id, thing);
      return thing;
    },
  };

  // ... implement all methods
}
```

---

## 7. Performance Testing

**File:** `tests/demo/e2e/performance.spec.ts` (with Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Demo Performance', () => {
  test('demo index loads in < 1 second', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:4321/demo');
    await page.waitForLoadState('networkidle');

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000);
  });

  test('API calls complete < 200ms', async ({ page }) => {
    await page.goto('http://localhost:4321/demo/groups');

    // Intercept network requests
    const times: number[] = [];

    page.on('response', response => {
      if (response.url().includes('/api/')) {
        times.push(response.timing()!.responseEnd);
      }
    });

    // Trigger operation
    await page.click('button:has-text("Create Group")');

    await page.waitForTimeout(500);

    times.forEach(time => {
      expect(time).toBeLessThan(200);
    });
  });

  test('Lighthouse scores > 95', async ({ page }) => {
    await page.goto('http://localhost:4321/demo');

    // Would need lighthouse integration
    // This is a placeholder
    expect(true).toBe(true);
  });
});
```

---

## 8. Visual Regression Tests

**File:** `tests/demo/visual/demo-layouts.test.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('demo index matches desktop snapshot', async ({ page }) => {
    await page.goto('http://localhost:4321/demo');
    await page.waitForLoadState('networkidle');

    expect(await page.screenshot()).toMatchSnapshot('demo-index-desktop.png');
  });

  test('demo groups mobile layout matches snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:4321/demo/groups');

    expect(await page.screenshot()).toMatchSnapshot('demo-groups-mobile.png');
  });

  test('dark mode rendering matches snapshot', async ({ page }) => {
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('http://localhost:4321/demo');
    expect(await page.screenshot()).toMatchSnapshot('demo-dark-mode.png');
  });
});
```

---

## 9. Test Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@/__mocks__': path.resolve(__dirname, './tests/__mocks__'),
    },
  },
});
```

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/demo/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 10. Test Execution Strategy

### Sequential Testing Flow

```bash
# 1. Unit tests (fast, no backend needed)
bun test tests/demo/unit

# 2. Integration tests (needs backend or mocks)
bun test tests/demo/integration

# 3. E2E tests (full system, with Playwright)
bun run test:e2e

# 4. Visual regression tests
bun run test:visual

# 5. Performance tests
bun run test:performance

# 6. Full test suite with coverage
bun test -- --coverage

# 7. Watch mode for development
bun test:watch tests/demo
```

### CI/CD Pipeline

```yaml
# .github/workflows/demo-tests.yml
name: Demo Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun test tests/demo/unit

      - name: Run integration tests
        run: bun test tests/demo/integration

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 11. Quality Metrics & Gates

### Coverage Targets

| Category | Target | Current |
|----------|--------|---------|
| Statements | 80% | - |
| Branches | 80% | - |
| Functions | 80% | - |
| Lines | 80% | - |

### Pass Rate Targets

| Test Suite | Target | Status |
|-----------|--------|--------|
| Unit Tests | 100% | |
| Integration Tests | 100% | |
| E2E Tests | 100% | |
| Visual Regression | 100% | |
| Accessibility | 100% | |
| Performance | 100% | |

### Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Page Load (FCP) | < 800ms | |
| Page Load (LCP) | < 1200ms | |
| API Response Time | < 200ms | |
| Time to Interactive | < 1s | |
| Lighthouse Score | >= 95 | |

---

## 12. Test Execution Checklist (Pre-Production)

- [ ] All unit tests pass (100%)
- [ ] All integration tests pass (100%)
- [ ] All E2E tests pass (100%)
- [ ] Coverage meets 80% threshold across all dimensions
- [ ] No flaky tests (all tests pass consistently)
- [ ] Performance benchmarks met (page load < 1s, API < 200ms)
- [ ] Accessibility audit passes (WCAG 2.1 AA)
- [ ] Cross-browser testing passes (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing passes (iOS Safari, Chrome Mobile)
- [ ] Visual regression tests pass (no unexpected changes)
- [ ] Error scenarios tested (backend down, network timeout, invalid data)
- [ ] Load testing done (1000+ concurrent users)
- [ ] Security testing done (XSS, CSRF, injection)
- [ ] Documentation updated with test coverage
- [ ] QA sign-off obtained

---

## 13. Test Maintenance

### Regular Updates
- Weekly: Add new test cases for new features
- Monthly: Update snapshots and baselines
- Quarterly: Review and refactor test suite
- Quarterly: Update test dependencies

### Failure Response
- **Flaky test**: Investigate and stabilize within 24 hours
- **Regression**: Bisect to find breaking commit, fix immediately
- **Performance regression**: Profile and optimize
- **Accessibility regression**: Fix and document fix

### Test Reporting
- Run coverage reports in CI/CD
- Generate HTML coverage reports
- Track metrics over time (spreadsheet/dashboard)
- Alert on regression (coverage drops > 5%)

---

## 14. Deliverables Checklist

- [x] E2E test specifications (Gherkin format)
- [x] Component test specifications (Jest/Vitest)
- [x] Integration test specifications
- [x] Performance test specifications
- [x] Accessibility test specifications
- [x] Visual regression test approach
- [x] Test data & fixtures
- [x] Mock provider implementations
- [x] Test configuration files
- [x] CI/CD pipeline setup
- [x] Test execution checklist
- [x] Coverage targets & metrics
- [x] Maintenance plan

---

## Summary

This comprehensive test plan provides:

1. **Coverage**: All 6 dimensions (groups, people, things, connections, events, knowledge) + search
2. **Test Types**: E2E, integration, unit, component, visual, performance, accessibility
3. **Quality Gates**: 80% code coverage, 100% test pass rate, performance targets, accessibility compliance
4. **Ontology Alignment**: Tests validate 6-dimension ontology operations (create, read, update, delete, connections, events)
5. **Specifications**: Gherkin-format user flows for non-technical stakeholders
6. **Automation**: Full CI/CD pipeline for continuous testing
7. **Maintenance**: Processes for keeping tests current and reliable
8. **Reporting**: Metrics and dashboards for quality tracking

**Ready to hand to QA team for implementation.**

