# Connections Demo - Interactive Guide

## Overview

The Connections demo page (`/demo/connections`) provides a comprehensive, interactive exploration of the **Connections dimension** - the fourth dimension of the ONE Platform's 6-dimension ontology.

A Connection represents a **relationship between two Things (entities)**. It's the edge in your graph database, storing how entities relate to each other with optional metadata, strength indicators, and temporal validity.

## What's Implemented

### 1. Educational Content (Static)

The page includes extensive documentation about connections:

- **What Are Connections?** - Core concept explanation
- **Connection Structure** - TypeScript interface documentation
- **25+ Relationship Types** - Organized by category:
  - Ownership (owns, created_by)
  - AI Relationships (clone_of, trained_on, powers)
  - Content (authored, generated_by, published_to, part_of, references)
  - Community (member_of, following, moderates, participated_in)
  - Business (manages, reports_to, collaborates_with)
  - Tokens (holds_tokens, staked_in, earned_from)
  - Products (purchased, enrolled_in, completed, teaching)
  - Consolidated (transacted, notified, referred, communicated, delegated, approved, fulfilled)

- **Bidirectional Relationships** - How to query from either direction
- **Temporal Validity** - Managing relationship lifecycles with validFrom/validTo
- **REST API Examples** - List, get, create, update connections
- **Protocol-Agnostic Design** - Storing protocol identity in metadata

### 2. Interactive React Component (ConnectionsDemo.tsx)

A fully featured interactive playground with:

#### Filtering & Search
- **Text Search**: Search connections by entity name (from or to)
- **Relationship Type Filter**: Filter by any of 31 relationship types
- **Strength Range Slider**: Filter connections by relationship strength (0-1 scale)
- **Sort Options**: Sort by created date, strength, or entity name
- **Reset Button**: Clear all filters with one click

#### Data Display
- **Responsive Table**: Shows all connections matching current filters
- **Column Headers**:
  - From Entity (name + type)
  - Relationship Type (color-coded badge)
  - To Entity (name + type)
  - Strength (visual bar + numeric value)
  - Created Date
  - Actions (view details, delete)

#### Interactive Features
- **Connection Details Modal**: Click eye icon to view full connection details
  - From entity information
  - Relationship type with strength visualization
  - To entity information
  - Temporal validity (validFrom/validTo)
  - Metadata as formatted JSON
  - Creation/update timestamps

- **Create Connection Form**: Dialog to create new connections
  - Entity selection (from/to)
  - Relationship type dropdown
  - Strength slider (0-1)
  - JSON metadata editor

- **Loading States**: Skeleton loaders while data fetches
- **Real-time Sync**: Shows "Syncing..." indicator during updates
- **Dark Mode Support**: Full dark/light theme compatibility

#### Color-Coded Relationships
Each relationship type has a unique badge color for quick visual identification:
- Blue (owns, created_by)
- Purple (AI relationships)
- Green (content relationships)
- Orange (community)
- Red (tokens/financial)
- Indigo (consolidated)

### 3. Code Examples (React Hooks)

Four practical code examples showing real-world patterns:

1. **List Connections from an Entity**
   - Use `api.connections.listFrom` to get outgoing connections
   - Filter by relationship type
   - Access metadata

2. **Filter by Relationship Type**
   - Query token holders with `listTo`
   - Access metadata for business logic

3. **Create Connections with Metadata**
   - Enroll students in courses
   - Store progress, dates, and status in metadata
   - Set strength for relationship importance

4. **Bidirectional Queries**
   - Find connections between two specific entities
   - Access relationship-specific data

### 4. Backend Integration

The page fetches real connection data from the backend:

```typescript
// Fetch from Convex backend
const convexUrl = import.meta.env.PUBLIC_CONVEX_URL || 'https://veracious-marlin-319.convex.cloud';
const response = await fetch(`${convexUrl}/api/connections?limit=20`);
```

In standalone mode (no backend), the page gracefully shows sample data with a helpful message.

## File Locations

### Component
- **File**: `/Users/toc/Server/ONE/web/src/components/demo/ConnectionsDemo.tsx`
- **Type**: React component with `'use client'` directive
- **Size**: ~450 lines
- **Features**: Filtering, search, sorting, details modal, create form

### Page
- **File**: `/Users/toc/Server/ONE/web/src/pages/demo/connections.astro`
- **Type**: Astro SSR page
- **Fetches**: Real connection data at build time
- **Passes**: Data as props to React island

## Architecture

### Static-First, Hydrated Islands

1. **Astro Page** (.astro) - Server-side only
   - Fetches connection data at build time
   - Renders static content (documentation, examples)
   - No JavaScript overhead

2. **React Island** (.tsx) - Hydrated on demand
   - `client:load` - Loads immediately (interactive filters need immediate JS)
   - Handles user interactions (filtering, searching, sorting)
   - Shows/hides modals
   - Renders connection table dynamically

### Data Flow

```
Backend (Convex)
    ↓
Astro Page (fetches via ConvexHttpClient)
    ↓
Passes demoConnections prop
    ↓
React Component (ConnectionsDemo)
    ↓
User Interactions (filters, search, modals)
```

## Relationship Types (31 Total)

### By Category

**Ownership (2)**
- `owns` - A owns B
- `created_by` - A was created by B

**AI (3)**
- `clone_of` - AI clone of person
- `trained_on` - AI trained on knowledge
- `powers` - AI powers feature

**Content (5)**
- `authored` - Person authored content
- `generated_by` - Content generated by AI
- `published_to` - Content published to platform
- `part_of` - Content part of collection
- `references` - Content references other content

**Community (4)**
- `member_of` - Person member of org/community
- `following` - Person follows person
- `moderates` - Person moderates community
- `participated_in` - Person participated in conversation

**Business (3)**
- `manages` - Person manages person/team
- `reports_to` - Person reports to person
- `collaborates_with` - Person collaborates with person

**Tokens (3)**
- `holds_tokens` - Person holds tokens
- `staked_in` - Tokens staked in pool
- `earned_from` - Tokens earned from activity

**Products (4)**
- `purchased` - Person purchased product
- `enrolled_in` - Person enrolled in course
- `completed` - Person completed course
- `teaching` - AI teaching course

**Consolidated (7)** - Use metadata for variants
- `transacted` - Payment/subscription
- `notified` - Notifications
- `referred` - Referrals
- `communicated` - Agent/protocol communication
- `delegated` - Task/workflow delegation
- `approved` - Approvals
- `fulfilled` - Fulfillment

## Metadata Structure

Connections can store relationship-specific data in metadata:

```typescript
// Token holding
{
  balance: 1000,
  network: "sui",
  acquiredAt: Date.now()
}

// Course enrollment
{
  progress: 0.45,      // 45% complete
  enrolledAt: Date.now(),
  lastAccessedAt: Date.now()
}

// Organization membership
{
  role: "org_owner",
  permissions: ["read", "write", "admin"],
  joinedAt: Date.now()
}

// Payment transaction
{
  transactionType: "payment",
  amount: 99.00,
  currency: "USD",
  paymentId: "pi_123456",
  status: "completed",
  protocol: "stripe"
}

// Agent communication
{
  protocol: "a2a",
  messageType: "task_delegation",
  task: "research_market_trends",
  messagesExchanged: 42
}
```

## Strength Indicator

Connections have an optional `strength` field (0-1 scale):
- **0.0** = Weak/new relationship
- **0.5** = Moderate relationship
- **1.0** = Strong relationship

The demo visualizes strength as a progress bar:
- Green bar showing relative strength
- Numeric value (0.0-1.0)
- Used for relationship importance weighting

## Temporal Validity

Track relationship lifecycles:

```typescript
{
  validFrom: 1704067200000,  // When relationship started
  validTo: 1735689600000,    // When relationship ended (optional)
}
```

**Use Cases**:
- Contract periods (employment dates)
- Subscription cancellations
- Project timeline completion
- Relationship history tracking

## Query Examples

### From Backend

```typescript
// List all connections FROM a user
const connections = await convex.query(api.connections.listFrom, {
  fromEntityId: userId,
  relationshipType: 'owns'
});

// List all connections TO an entity
const owners = await convex.query(api.connections.listTo, {
  toEntityId: contentId,
  relationshipType: 'owns'
});

// Find relationship between two specific entities
const relationship = await convex.query(api.connections.listBetween, {
  fromEntityId: personA,
  toEntityId: personB,
  relationshipType: 'collaborates_with'
});

// List by type with limit
const tokenConnections = await convex.query(
  api.connections.listByType,
  {
    relationshipType: 'holds_tokens',
    limit: 100
  }
);
```

### In React Components

```typescript
// Hook pattern
const connections = useQuery(api.connections.listFrom, {
  fromEntityId: entityId,
  relationshipType: 'enrolled_in'
});

if (connections === undefined) return <Loading />;

return connections.map(conn => (
  <div key={conn._id}>
    <p>{conn.relationshipType}</p>
    {conn.metadata?.progress && (
      <ProgressBar value={conn.metadata.progress} />
    )}
  </div>
));
```

## Indexing Strategy

The `connections` table uses these indexes for efficient queries:

| Index | Fields | Use Case |
|-------|--------|----------|
| `from_entity` | fromEntityId | "What does X own?" |
| `to_entity` | toEntityId | "Who owns X?" |
| `from_type` | fromEntityId, relationshipType | "What courses is user enrolled in?" |
| `to_type` | toEntityId, relationshipType | "Who is enrolled in this course?" |
| `bidirectional` | fromEntityId, toEntityId, relationshipType | "Direct relationship check" |
| `group_type` | groupId, relationshipType | "All transactions in org" |
| `by_created` | createdAt | "Newest connections" |

## Performance Considerations

- **Indexed Queries**: O(log n) for all lookups
- **Bidirectional**: Query equally fast in both directions
- **Metadata**: No performance penalty (stored with connection)
- **Strength**: Indexed filtering supported
- **Pagination**: Use limit parameter for large result sets

## Integration with 6-Dimension Ontology

**Connections** (Dimension 4) links **Things** (Dimension 3) with typed relationships.

Complete flow:
```
Groups (Dimension 1)
    ↓ (isolation boundary)
  Things (Dimension 3) ← Entities in your system
    ↓ (relationships)
  Connections (Dimension 4) ← How they relate
    ↓ (changes)
  Events (Dimension 5) ← Audit trail
    ↓ (categorization)
  Knowledge (Dimension 6) ← Labels & embeddings
```

## Troubleshooting

### No Data Showing?

1. **Check Backend**: Ensure Convex backend is running
2. **Check URL**: Verify `PUBLIC_CONVEX_URL` is set correctly
3. **Check Data**: Backend must have entities and connections created first

### Filters Not Working?

1. **Clear Filters**: Use "Reset Filters" button
2. **Check Search**: Only searches entity names
3. **Check Strength**: Range must match connection strength values

### Modal Not Closing?

1. **Click Outside**: Click outside the modal to close
2. **Keyboard**: Press Escape key
3. **Button**: Use close button in modal header (X)

## Future Enhancements

Potential features for future iterations:

1. **Graph Visualization**: Force-directed graph showing connection network
2. **Batch Operations**: Create multiple connections at once
3. **Import/Export**: CSV import/export of connections
4. **Relationship Analytics**: Statistics on connection types and strength distribution
5. **Connection History**: Timeline view of relationship changes
6. **Advanced Filtering**: Filter by metadata fields
7. **Relationship Templates**: Pre-configured metadata templates by type
8. **Performance Metrics**: Query latency visualization
9. **Connection Strength ML**: Auto-calculate strength based on interaction

## Code Examples Summary

### Pattern 1: List from Entity
```tsx
const connections = useQuery(api.connections.listFrom, {
  fromEntityId: entityId,
  relationshipType: 'owns'
});
```

### Pattern 2: List to Entity
```tsx
const holders = useQuery(api.connections.listTo, {
  toEntityId: tokenId,
  relationshipType: 'holds_tokens'
});
```

### Pattern 3: Create with Metadata
```tsx
const enrollStudent = useMutation(api.connections.create);
await enrollStudent({
  fromEntityId: userId,
  toEntityId: courseId,
  relationshipType: 'enrolled_in',
  metadata: {
    progress: 0,
    enrolledAt: Date.now(),
    status: 'active'
  },
  strength: 0.5
});
```

### Pattern 4: Bidirectional Query
```tsx
const collaboration = useQuery(api.connections.listBetween, {
  fromEntityId: personA,
  toEntityId: personB,
  relationshipType: 'collaborates_with'
});
```

## Related Pages

- **[Things Demo](/demo/things)** - Learn about entities (Dimension 3)
- **[Events Demo](/demo/events)** - Learn about actions (Dimension 5)
- **[Knowledge Demo](/demo/search)** - Learn about labels & embeddings (Dimension 6)
- **[Groups Demo](/demo/groups)** - Learn about multi-tenancy (Dimension 1)
- **[People Demo](/demo/people)** - Learn about authorization (Dimension 2)

## File Structure

```
/web/
├── src/
│   ├── pages/
│   │   └── demo/
│   │       └── connections.astro          ← Main page (SSR)
│   └── components/
│       └── demo/
│           └── ConnectionsDemo.tsx        ← Interactive component
└── CONNECTIONS_DEMO.md                    ← This file
```

## Development Commands

```bash
# View the demo
bun run dev
# Visit http://localhost:4321/demo/connections

# Build for production
bun run build

# Type check
bunx astro check
```

## Summary

The Connections demo provides a **complete learning and interactive experience** for understanding relationships in the ONE Platform:

1. **Educational** - 10+ sections explaining connections
2. **Interactive** - Real-time filtering, search, and sorting
3. **Practical** - 4 code examples showing real patterns
4. **Beautiful** - Dark mode, responsive design, intuitive UI
5. **Connected** - Real backend data integration
6. **Helpful** - Graceful degradation in standalone mode

Perfect for developers who want to understand how to model, query, and leverage relationships in their ONE Platform applications.
