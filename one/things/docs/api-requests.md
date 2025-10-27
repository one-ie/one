# API Requests Guide

Complete reference for making HTTP requests to the ONE Platform APIs.

## Table of Contents

- [Backend API (Convex)](#backend-api-convex)
- [Frontend API (Astro)](#frontend-api-astro)
- [Authentication](#authentication)
- [Common Query Parameters](#common-query-parameters)
- [Error Handling](#error-handling)
- [Examples by Use Case](#examples-by-use-case)

---

## Backend API (Convex)

**Base URL:** `https://veracious-marlin-319.convex.site`

The backend implements the **6-dimension ontology** with HTTP endpoints for managing groups, things, connections, events, and knowledge.

### Health Check

```bash
curl https://veracious-marlin-319.convex.site/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1729878000000,
  "environment": "production"
}
```

---

## Dimension 1: Groups (Multi-tenancy)

Groups are hierarchical containers for data isolation. All other dimensions are scoped to a groupId.

### List Groups

```bash
curl https://veracious-marlin-319.convex.site/groups
```

**Query Parameters:**
- `type` - Filter by group type (organization, business, community, dao, friend_circle, government)
- `status` - Filter by status (active, draft, archived)
- `limit` - Results per page (default 50, max 1000)
- `offset` - Pagination offset

**Example:**
```bash
curl "https://veracious-marlin-319.convex.site/groups?type=organization&status=active&limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "group_123",
      "name": "Acme Corporation",
      "type": "organization",
      "parentGroupId": null,
      "status": "active",
      "properties": {
        "plan": "enterprise",
        "description": "Global tech company"
      },
      "createdAt": 1729878000000,
      "updatedAt": 1729878000000
    }
  ]
}
```

### Create Group

```bash
curl -X POST https://veracious-marlin-319.convex.site/groups \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering Department",
    "type": "organization",
    "parentGroupId": "group_123",
    "properties": {
      "description": "Engineering team",
      "budget": 500000
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "group_456"
  }
}
```

---

## Dimension 3: Things (All Entities)

Things represent all nouns in the system: users, courses, products, agents, content, tokens, etc.

### List Things

```bash
curl https://veracious-marlin-319.convex.site/things
```

**Query Parameters:**
- `groupId` - **Required** - Filter by group ID
- `type` - Filter by thing type (user, course, product, blog_post, agent, token, etc.)
- `status` - Filter by status (draft, active, published, archived)
- `search` - Search by name (partial match, case-insensitive)
- `limit` - Results per page (default 50, max 1000)
- `offset` - Pagination offset
- `sort` - Sort field (default 'createdAt', can be 'name', 'updatedAt')
- `order` - Sort order ('asc' or 'desc', default 'desc')

**Examples:**

List all things in a group:
```bash
curl "https://veracious-marlin-319.convex.site/things?groupId=group_123"
```

Filter by type:
```bash
curl "https://veracious-marlin-319.convex.site/things?groupId=group_123&type=course&status=active"
```

Search with pagination:
```bash
curl "https://veracious-marlin-319.convex.site/things?groupId=group_123&search=python&limit=20&offset=0"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "things": [
      {
        "_id": "thing_course_789",
        "groupId": "group_123",
        "type": "course",
        "name": "Python Fundamentals",
        "status": "active",
        "properties": {
          "description": "Learn Python basics",
          "level": "beginner",
          "duration": 40,
          "instructor": "Jane Doe"
        },
        "createdAt": 1729878000000,
        "updatedAt": 1729878000000
      }
    ],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Create Thing

```bash
curl -X POST https://veracious-marlin-319.convex.site/things \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "name": "Advanced Python",
    "groupId": "group_123",
    "properties": {
      "description": "Master Python programming",
      "level": "advanced",
      "duration": 80,
      "instructor": "John Smith",
      "price": 199
    },
    "status": "draft"
  }'
```

**Required Fields:**
- `type` - Thing type (string)
- `name` - Thing name (string)
- `groupId` - Group ID (string)

**Optional Fields:**
- `properties` - Flexible object for type-specific data
- `status` - Status (default 'draft')

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "thing_course_new"
  }
}
```

### Get Single Thing

```bash
curl "https://veracious-marlin-319.convex.site/things/thing_course_789?groupId=group_123"
```

---

## Dimension 4: Connections (Relationships)

Connections represent relationships between entities with optional metadata.

### List Connections

```bash
curl https://veracious-marlin-319.convex.site/connections
```

**Query Parameters:**
- `groupId` - **Required** - Filter by group ID
- `relationshipType` - Filter by relationship type (owns, enrolled_in, follows, member_of, transacted, authored, part_of, etc.)
- `fromThingId` - Filter by source entity
- `toThingId` - Filter by target entity
- `limit` - Results per page (default 50, max 1000)
- `offset` - Pagination offset

**Examples:**

List all connections in a group:
```bash
curl "https://veracious-marlin-319.convex.site/connections?groupId=group_123"
```

Filter by relationship type:
```bash
curl "https://veracious-marlin-319.convex.site/connections?groupId=group_123&relationshipType=enrolled_in"
```

Find connections from a specific entity:
```bash
curl "https://veracious-marlin-319.convex.site/connections?groupId=group_123&fromThingId=user_123"
```

Find connections to a specific entity:
```bash
curl "https://veracious-marlin-319.convex.site/connections?groupId=group_123&toThingId=course_456"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connections": [
      {
        "_id": "conn_123",
        "groupId": "group_123",
        "fromThingId": "user_456",
        "toThingId": "course_789",
        "relationshipType": "enrolled_in",
        "metadata": {
          "enrolledAt": 1729878000000,
          "progress": 45,
          "lastAccessedAt": 1729900000000
        },
        "createdAt": 1729878000000,
        "updatedAt": 1729900000000
      }
    ],
    "total": 250,
    "limit": 50,
    "offset": 0
  }
}
```

### Create Connection

```bash
curl -X POST https://veracious-marlin-319.convex.site/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromThingId": "user_456",
    "toThingId": "course_789",
    "relationshipType": "enrolled_in",
    "groupId": "group_123",
    "metadata": {
      "enrolledAt": 1729878000000,
      "progress": 0
    }
  }'
```

**Required Fields:**
- `fromThingId` - Source entity ID
- `toThingId` - Target entity ID
- `relationshipType` - Type of relationship
- `groupId` - Group ID

**Optional Fields:**
- `metadata` - Flexible object for relationship-specific data

**Common Relationship Types:**
- `owns` - X owns Y
- `enrolled_in` - X is enrolled in Y
- `follows` - X follows Y
- `member_of` - X is member of Y
- `transacted` - X transacted with Y
- `authored` - X authored Y
- `part_of` - X is part of Y
- `holds_tokens` - X holds tokens from Y
- `manages` - X manages Y
- `teaches` - X teaches Y

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "conn_new"
  }
}
```

---

## Dimension 5: Events (Audit Trail)

Events record all actions and state changes for complete audit trails.

### List Events

```bash
curl https://veracious-marlin-319.convex.site/events
```

**Query Parameters:**
- `groupId` - **Required** - Filter by group ID
- `eventType` - Filter by event type (thing_created, thing_updated, connection_created, enrollment_completed, etc.)
- `thingId` - Filter by thing ID
- `actorId` - Filter by actor (who performed the action)
- `limit` - Results per page (default 50, max 1000)
- `offset` - Pagination offset
- `startTime` - Filter events after timestamp
- `endTime` - Filter events before timestamp

**Examples:**

List all events in a group:
```bash
curl "https://veracious-marlin-319.convex.site/events?groupId=group_123"
```

Filter by event type:
```bash
curl "https://veracious-marlin-319.convex.site/events?groupId=group_123&eventType=thing_created"
```

Get event history for a specific thing:
```bash
curl "https://veracious-marlin-319.convex.site/events?groupId=group_123&thingId=course_789&limit=100"
```

Get events by a specific actor:
```bash
curl "https://veracious-marlin-319.convex.site/events?groupId=group_123&actorId=user_456"
```

Events in a time range:
```bash
curl "https://veracious-marlin-319.convex.site/events?groupId=group_123&startTime=1729800000000&endTime=1729900000000"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "event_123",
        "groupId": "group_123",
        "eventType": "enrollment_completed",
        "thingId": "course_789",
        "actorId": "user_456",
        "timestamp": 1729878000000,
        "metadata": {
          "enrollmentId": "conn_123",
          "completionTime": 3600000,
          "score": 95
        }
      }
    ],
    "total": 1000,
    "limit": 50,
    "offset": 0
  }
}
```

**Common Event Types:**
- `thing_created` - Entity was created
- `thing_updated` - Entity was updated
- `thing_deleted` - Entity was deleted
- `connection_created` - Relationship was created
- `connection_updated` - Relationship was updated
- `enrollment_completed` - User completed enrollment
- `tokens_purchased` - Tokens were purchased
- `payment_processed` - Payment was processed
- `knowledge_indexed` - Content was indexed for search

---

## Dimension 6: Knowledge (Semantic Search)

Knowledge base for embeddings and semantic search capabilities.

### Search Knowledge

```bash
curl -X POST https://veracious-marlin-319.convex.site/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python programming",
    "groupId": "group_123",
    "limit": 10,
    "threshold": 0.7
  }'
```

**Request Fields:**
- `query` - Search query (string) - **Required**
- `groupId` - Group ID - **Required**
- `limit` - Max results (default 10, max 100)
- `threshold` - Relevance threshold (0-1, default 0.5)
- `type` - Filter by thing type (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "knowledge_123",
        "thingId": "course_789",
        "thingName": "Python Fundamentals",
        "relevance": 0.95,
        "content": "Learn Python basics including variables, functions, and data structures",
        "tags": ["programming", "python", "beginner"]
      }
    ],
    "total": 25,
    "query": "python programming"
  }
}
```

### Index Content

```bash
curl -X POST https://veracious-marlin-319.convex.site/knowledge/index \
  -H "Content-Type: application/json" \
  -d '{
    "thingId": "course_789",
    "groupId": "group_123",
    "content": "Learn Python basics including variables, functions, and data structures",
    "tags": ["programming", "python", "beginner"]
  }'
```

---

## Frontend API (Astro)

**Base URL:** `http://localhost:4321` (development) or your deployed domain

The frontend provides convenience endpoints that wrap Convex functionality.

### List Things

```bash
curl http://localhost:4321/api/things
```

**Query Parameters:** Same as backend (groupId, type, status, search, limit, offset, sort, order)

### Create Thing

```bash
curl -X POST http://localhost:4321/api/things \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "name": "Python Basics",
    "groupId": "group_123",
    "properties": {
      "description": "Learn Python",
      "level": "beginner"
    }
  }'
```

### List Connections

```bash
curl http://localhost:4321/api/connections
```

### Create Connection

```bash
curl -X POST http://localhost:4321/api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromEntityId": "user_123",
    "toEntityId": "course_456",
    "relationshipType": "enrolled_in",
    "groupId": "group_789",
    "metadata": {
      "enrolledAt": 1729878000000
    }
  }'
```

### Search Knowledge

```bash
curl "http://localhost:4321/api/knowledge/search?q=python&limit=10"
```

---

## Authentication

### Option 1: Session Cookies (Browser)

When making requests from a browser, session cookies are automatically included:

```javascript
// In browser JavaScript
const response = await fetch('/api/things?groupId=group_123', {
  credentials: 'include', // Include cookies
});
const data = await response.json();
```

### Option 2: Bearer Token (API Clients)

For programmatic access, use Bearer tokens:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://veracious-marlin-319.convex.site/things?groupId=group_123
```

**Getting a Token:**

1. Sign in to the application
2. Navigate to Account Settings → API Tokens
3. Create a new token with required scopes
4. Use in Authorization header

### Option 3: API Key

For server-to-server communication:

```bash
curl -H "X-API-Key: your-api-key" \
  https://veracious-marlin-319.convex.site/things?groupId=group_123
```

---

## Common Query Parameters

### Pagination

```bash
curl "https://backend.api/things?groupId=group_123&limit=20&offset=40"
```

- `limit` - Results per page (default 50, max 1000)
- `offset` - Starting position (default 0)

### Sorting

```bash
curl "https://backend.api/things?groupId=group_123&sort=name&order=asc"
```

- `sort` - Field to sort by (createdAt, name, updatedAt)
- `order` - Sort direction (asc, desc)

### Filtering

```bash
curl "https://backend.api/things?groupId=group_123&type=course&status=active"
```

- `type` - Filter by entity type
- `status` - Filter by status
- `search` - Text search on name

### Relationships

```bash
curl "https://backend.api/connections?groupId=group_123&fromThingId=user_123&relationshipType=enrolled_in"
```

- `fromThingId` - Filter by source
- `toThingId` - Filter by target
- `relationshipType` - Filter by relationship type

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "groupId is required"
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

### Example Error Response

```bash
curl -X POST https://backend.api/things \
  -H "Content-Type: application/json" \
  -d '{"type": "course", "name": "Test"}'
```

**Response (missing groupId):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "groupId is required and must be a string"
  }
}
```

---

## Examples by Use Case

### Create a Course and Enroll Users

**Step 1: Create the course (thing)**
```bash
curl -X POST https://backend.api/things \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "name": "Python Fundamentals",
    "groupId": "group_123",
    "properties": {
      "description": "Learn Python",
      "level": "beginner",
      "duration": 40
    },
    "status": "active"
  }'
```

**Step 2: Create enrollment connections**
```bash
curl -X POST https://backend.api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromThingId": "user_456",
    "toThingId": "course_789",
    "relationshipType": "enrolled_in",
    "groupId": "group_123",
    "metadata": {
      "enrolledAt": 1729878000000,
      "progress": 0
    }
  }'
```

**Step 3: Track completion event**
```bash
curl -X POST https://backend.api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "enrollment_completed",
    "thingId": "course_789",
    "actorId": "user_456",
    "groupId": "group_123",
    "metadata": {
      "completionTime": 3600000,
      "score": 92
    }
  }'
```

### Build a Product Catalog with Recommendations

**Step 1: Create products**
```bash
curl -X POST https://backend.api/things \
  -H "Content-Type: application/json" \
  -d '{
    "type": "product",
    "name": "Premium Plan",
    "groupId": "group_123",
    "properties": {
      "price": 99,
      "features": ["unlimited access", "priority support"],
      "category": "subscription"
    },
    "status": "active"
  }'
```

**Step 2: Link related products**
```bash
curl -X POST https://backend.api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromThingId": "product_premium",
    "toThingId": "product_addon_storage",
    "relationshipType": "part_of",
    "groupId": "group_123",
    "metadata": {
      "order": 1
    }
  }'
```

**Step 3: Record purchases**
```bash
curl -X POST https://backend.api/connections \
  -H "Content-Type: application/json" \
  -d '{
    "fromThingId": "user_456",
    "toThingId": "product_premium",
    "relationshipType": "owns",
    "groupId": "group_123",
    "metadata": {
      "purchasedAt": 1729878000000,
      "renewalDate": 1737654000000
    }
  }'
```

### Search Content Recommendations

**Index content**
```bash
curl -X POST https://backend.api/knowledge/index \
  -H "Content-Type: application/json" \
  -d '{
    "thingId": "course_789",
    "groupId": "group_123",
    "content": "Learn Python fundamentals including variables, functions, decorators, and async programming",
    "tags": ["python", "programming", "backend", "advanced"]
  }'
```

**Search for recommendations**
```bash
curl -X POST https://backend.api/knowledge/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "async programming in Python",
    "groupId": "group_123",
    "limit": 5,
    "threshold": 0.8
  }'
```

### Monitor User Activity

**Get user's actions**
```bash
curl "https://backend.api/events?groupId=group_123&actorId=user_456&limit=50"
```

**Get entity's history**
```bash
curl "https://backend.api/events?groupId=group_123&thingId=course_789&limit=100"
```

**Get activity in time range**
```bash
curl "https://backend.api/events?groupId=group_123&startTime=1729800000000&endTime=1729900000000&limit=100"
```

---

## Best Practices

### 1. Always Include groupId

Every request to Things, Connections, Events, or Knowledge endpoints must filter by `groupId` for data isolation:

```bash
# ❌ WRONG - No groupId filter
curl https://backend.api/things

# ✅ CORRECT - Include groupId
curl "https://backend.api/things?groupId=group_123"
```

### 2. Use Pagination for Large Results

Don't fetch unlimited results. Always paginate:

```bash
# ✅ GOOD - Paginated
curl "https://backend.api/things?groupId=group_123&limit=50&offset=0"

# ❌ AVOID - Unbounded query
curl "https://backend.api/things?groupId=group_123"
```

### 3. Cache Responses When Appropriate

Use HTTP caching headers:

```bash
curl -H "Cache-Control: max-age=300" \
  "https://backend.api/things?groupId=group_123&type=course"
```

### 4. Use POST for Mutations, GET for Queries

```bash
# ✅ GET for reading
curl "https://backend.api/things?groupId=group_123"

# ✅ POST for creating
curl -X POST https://backend.api/things \
  -H "Content-Type: application/json" \
  -d '{...}'

# ✅ PATCH for updating
curl -X PATCH https://backend.api/things/thing_123 \
  -H "Content-Type: application/json" \
  -d '{...}'

# ✅ DELETE for removing
curl -X DELETE "https://backend.api/things/thing_123?groupId=group_123"
```

### 5. Validate Responses

Always check the `success` field:

```bash
curl https://backend.api/things | jq '.success'
```

### 6. Handle Rate Limiting

Respect rate limits:
- Wait on 429 status
- Use exponential backoff
- Cache results when possible

### 7. Log Audit Trail with Events

For important actions, create audit events:

```bash
# Always log significant changes
curl -X POST https://backend.api/events \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "thing_updated",
    "thingId": "course_789",
    "actorId": "user_456",
    "groupId": "group_123",
    "metadata": {
      "changedFields": ["description", "price"],
      "timestamp": 1729878000000
    }
  }'
```

---

## See Also

- [Ontology Reference](/one/knowledge/ontology.md) - Complete 6-dimension ontology
- [Architecture Guide](/one/knowledge/architecture.md) - System design
- [Error Codes Reference](/one/knowledge/errors.md) - Detailed error documentation
- [Webhook Events](/one/connections/webhooks.md) - Real-time event subscriptions
