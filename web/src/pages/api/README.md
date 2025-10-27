---
layout: /src/layouts/Layout.astro
title: REST API Documentation
description: Complete REST API endpoints following the 6-dimension ontology structure
---

# REST API Documentation

Complete REST API endpoints following the 6-dimension ontology structure.

## Architecture Overview

The API is organized by the 6 dimensions of the ONE Platform ontology:

```
┌─────────────────────────────────────────────────────┐
│ REST API Layer (HTTP endpoints)                      │
│ /api/groups, /api/people, /api/things, etc.         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ Provider Factory (Backend abstraction)               │
│ getDefaultProvider() → DataProvider                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ DataProvider Interface (Unified abstraction)         │
│ .groups, .people, .things, .connections, etc.       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ Backend Implementation (Swappable)                   │
│ Convex | WordPress | Notion | Custom HTTP           │
└─────────────────────────────────────────────────────┘
```

## Response Format

All endpoints return a standardized response format:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": 1234567890
}
```

Errors:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Thing with ID xyz not found"
  },
  "timestamp": 1234567890
}
```

## HTTP Status Codes

- `200 OK` - Successful GET or PUT request
- `201 Created` - Successful POST request
- `400 Bad Request` - Validation error or missing required parameter
- `401 Unauthorized` - Authentication required (not signed in)
- `403 Forbidden` - Authenticated but not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists or conflict
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Backend provider unavailable

## Groups API (Dimension 1)

Manage hierarchical group containers (organizations, teams, communities).

### List Groups

```http
GET /api/groups
```

**Query Parameters:**
- `type` - Filter by group type (organization, business, community, etc.)
- `limit` - Number of results (default 50, max 1000)
- `offset` - Pagination offset (default 0)
- `sort` - Sort field (default 'createdAt')
- `order` - Sort order ('asc' or 'desc', default 'desc')

**Example:**
```bash
curl http://localhost:4321/api/groups
curl http://localhost:4321/api/groups?type=organization&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "_id": "group_123",
        "name": "Engineering",
        "type": "organization",
        "properties": {},
        "status": "active",
        "createdAt": 1234567890,
        "updatedAt": 1234567890
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "timestamp": 1234567890
}
```

### Create Group

```http
POST /api/groups
Content-Type: application/json

{
  "name": "Engineering",
  "type": "business",
  "parentGroupId": "group_parent",
  "properties": {
    "description": "Engineering team",
    "plan": "pro"
  }
}
```

**Required Fields:**
- `name` - Group name
- `type` - Group type

**Optional Fields:**
- `parentGroupId` - Parent group ID (for hierarchical groups)
- `properties` - Custom properties

**Example:**
```bash
curl -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Engineering",
    "type": "business",
    "properties": {
      "description": "Our engineering team"
    }
  }'
```

### Get Group

```http
GET /api/groups/{id}
```

**Example:**
```bash
curl http://localhost:4321/api/groups/group_123
```

### Update Group

```http
PUT /api/groups/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "properties": {
    "description": "Updated description"
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:4321/api/groups/group_123 \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Updated Engineering",
    "properties": {
      "description": "Updated description"
    }
  }'
```

## People API (Dimension 2)

Manage people and authorization (roles, permissions).

### Get Current User

```http
GET /api/people/me
```

**Example:**
```bash
curl http://localhost:4321/api/people/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "person_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "org_owner",
    "groupId": "group_456"
  },
  "timestamp": 1234567890
}
```

### Get Person

```http
GET /api/people/{id}
```

**Example:**
```bash
curl http://localhost:4321/api/people/person_123
```

## Things API (Dimension 3)

Manage entities (courses, products, blog posts, agents, tokens, etc.).

### List Things

```http
GET /api/things
```

**Query Parameters:**
- `type` - Filter by thing type (course, product, blog_post, etc.)
- `groupId` - Filter by group ID
- `status` - Filter by status (active, draft, published, archived)
- `search` - Search by name (partial match)
- `limit` - Number of results (default 50, max 1000)
- `offset` - Pagination offset (default 0)
- `sort` - Sort field (default 'createdAt')
- `order` - Sort order ('asc' or 'desc', default 'desc')

**Examples:**
```bash
curl http://localhost:4321/api/things
curl http://localhost:4321/api/things?type=course
curl http://localhost:4321/api/things?type=product&groupId=group_123&limit=20
curl http://localhost:4321/api/things?search=python&status=published
```

**Response:**
```json
{
  "success": true,
  "data": {
    "things": [
      {
        "_id": "thing_123",
        "type": "course",
        "name": "Python Basics",
        "groupId": "group_456",
        "status": "published",
        "properties": {
          "description": "Learn Python",
          "duration": 40,
          "level": "beginner"
        },
        "createdAt": 1234567890,
        "updatedAt": 1234567890
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "timestamp": 1234567890
}
```

### Create Thing

```http
POST /api/things
Content-Type: application/json

{
  "type": "course",
  "name": "Python Basics",
  "groupId": "group_123",
  "properties": {
    "description": "Learn Python",
    "duration": 40,
    "level": "beginner"
  },
  "status": "draft"
}
```

**Required Fields:**
- `type` - Thing type
- `name` - Thing name
- `groupId` - Group ID

**Optional Fields:**
- `properties` - Custom properties
- `status` - Status (draft, active, published, archived)

**Example:**
```bash
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
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

### Get Thing

```http
GET /api/things/{id}
```

**Example:**
```bash
curl http://localhost:4321/api/things/thing_123
```

### Update Thing

```http
PUT /api/things/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "status": "published",
  "properties": {
    "level": "advanced"
  }
}
```

**Example:**
```bash
curl -X PUT http://localhost:4321/api/things/thing_123 \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Advanced Python",
    "status": "published",
    "properties": {
      "level": "advanced"
    }
  }'
```

## Connections API (Dimension 4)

Manage relationships between entities (owns, enrolled_in, follows, etc.).

### List Connections

```http
GET /api/connections
```

**Query Parameters:**
- `type` - Filter by relationship type
- `fromThingId` - Filter by source thing
- `toThingId` - Filter by target thing
- `groupId` - Filter by group ID
- `limit` - Number of results (default 50, max 1000)
- `offset` - Pagination offset (default 0)

**Examples:**
```bash
curl http://localhost:4321/api/connections
curl http://localhost:4321/api/connections?type=owns
curl http://localhost:4321/api/connections?fromThingId=user_123
curl http://localhost:4321/api/connections?toThingId=course_456
```

### Create Connection

```http
POST /api/connections
Content-Type: application/json

{
  "fromThingId": "user_123",
  "toThingId": "course_456",
  "relationshipType": "enrolled_in",
  "groupId": "group_789",
  "metadata": {
    "enrolledAt": 1234567890
  }
}
```

**Required Fields:**
- `fromThingId` - Source thing ID
- `toThingId` - Target thing ID
- `relationshipType` - Type of relationship
- `groupId` - Group ID

**Optional Fields:**
- `metadata` - Relationship metadata

**Common Relationship Types:**
- `owns` - A owns B
- `enrolled_in` - A is enrolled in B
- `follows` - A follows B
- `member_of` - A is member of B
- `transacted` - A transacted with B
- `authored` - A authored B
- `part_of` - A is part of B

**Example:**
```bash
curl -X POST http://localhost:4321/api/connections \
  -H 'Content-Type: application/json' \
  -d '{
    "fromThingId": "user_123",
    "toThingId": "course_456",
    "relationshipType": "enrolled_in",
    "groupId": "group_789",
    "metadata": {
      "enrolledAt": 1234567890
    }
  }'
```

### Get Connection

```http
GET /api/connections/{id}
```

**Example:**
```bash
curl http://localhost:4321/api/connections/connection_123
```

## Events API (Dimension 5)

Record and query the complete audit trail of all actions.

### List Events

```http
GET /api/events
```

**Query Parameters:**
- `type` - Filter by event type
- `actorId` - Filter by actor (who performed the action)
- `targetId` - Filter by target (what was affected)
- `groupId` - Filter by group ID
- `startTime` - Filter by start timestamp (milliseconds)
- `endTime` - Filter by end timestamp (milliseconds)
- `limit` - Number of results (default 50, max 1000)
- `offset` - Pagination offset (default 0)
- `sort` - Sort order ('asc' or 'desc', default 'desc')

**Examples:**
```bash
curl http://localhost:4321/api/events
curl http://localhost:4321/api/events?type=entity_created
curl http://localhost:4321/api/events?actorId=user_123
curl http://localhost:4321/api/events?targetId=course_456&startTime=1234567890&endTime=1234567999
```

### Record Event

```http
POST /api/events
Content-Type: application/json

{
  "type": "entity_created",
  "actorId": "user_123",
  "targetId": "course_456",
  "groupId": "group_789",
  "metadata": {
    "entityType": "course",
    "entityName": "Python Basics"
  }
}
```

**Required Fields:**
- `type` - Event type
- `actorId` - Who performed the action
- `groupId` - Group ID

**Optional Fields:**
- `targetId` - What was affected
- `metadata` - Custom event data

**Common Event Types:**
- `entity_created` - Entity was created
- `entity_updated` - Entity was updated
- `entity_deleted` - Entity was deleted
- `course_enrolled` - User enrolled in course
- `course_completed` - User completed course
- `lesson_started` - User started lesson
- `lesson_completed` - User completed lesson
- `payment_received` - Payment received
- `user_registered` - New user registered
- `connection_created` - Relationship created

**Example:**
```bash
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "entity_created",
    "actorId": "user_123",
    "targetId": "course_456",
    "groupId": "group_789",
    "metadata": {
      "entityType": "course"
    }
  }'
```

## Knowledge API (Dimension 6)

Semantic search on knowledge base (RAG, vector search).

### Search Knowledge

```http
GET /api/knowledge/search
```

**Query Parameters:**
- `q` - Search query (required, min 3 characters)
- `limit` - Number of results (default 10, max 100)
- `threshold` - Similarity threshold 0-1 (default 0.5)
- `groupId` - Filter by group ID (optional)
- `type` - Filter by knowledge type (optional)

**Examples:**
```bash
curl "http://localhost:4321/api/knowledge/search?q=python+tutorial"
curl "http://localhost:4321/api/knowledge/search?q=machine+learning&limit=20"
curl "http://localhost:4321/api/knowledge/search?q=deep+learning&threshold=0.7"
curl "http://localhost:4321/api/knowledge/search?q=courses&groupId=group_123"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "knowledge_123",
        "title": "Python Tutorial",
        "content": "Learn Python basics...",
        "score": 0.95,
        "groupId": "group_456"
      }
    ],
    "query": "python tutorial",
    "total": 1,
    "limit": 10
  },
  "timestamp": 1234567890
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  },
  "timestamp": 1234567890
}
```

### Error Codes

- `VALIDATION_ERROR` - Input validation failed (400)
- `BAD_REQUEST` - Bad request format (400)
- `UNAUTHORIZED` - Authentication required (401)
- `FORBIDDEN` - Not authorized (403)
- `NOT_FOUND` - Resource not found (404)
- `CONFLICT` - Conflict (409)
- `RATE_LIMITED` - Too many requests (429)
- `INTERNAL_ERROR` - Server error (500)
- `SERVICE_UNAVAILABLE` - Backend unavailable (503)

## Caching Strategy

APIs use the following cache headers:

| Endpoint | Cache Control | TTL |
|----------|---------------|-----|
| GET `/api/groups` | max-age=60 | 1 minute |
| GET `/api/groups/{id}` | max-age=60 | 1 minute |
| GET `/api/people/{id}` | max-age=300 | 5 minutes |
| GET `/api/things` | max-age=60 | 1 minute |
| GET `/api/things/{id}` | max-age=300 | 5 minutes |
| GET `/api/connections` | max-age=60 | 1 minute |
| GET `/api/events` | max-age=30 | 30 seconds |
| GET `/api/knowledge/search` | max-age=300 | 5 minutes |
| POST/PUT | no-cache | - |

All POST and PUT requests bypass cache.

## Rate Limiting

Rate limits vary by endpoint:

| Endpoint | Limit |
|----------|-------|
| `/api/*/` | 100 requests/minute |
| `/api/*/search` | 50 requests/minute |
| `/api/*/events` | 200 requests/minute |

Rate limit headers:
- `X-RateLimit-Limit` - Maximum requests
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp

## Architecture: Provider Factory Pattern

The API uses a **provider factory pattern** for backend abstraction:

```typescript
// At app startup
const provider = createDataProvider({
  type: 'convex',
  client: convexClient
});

// All API routes use the same provider
export const GET: APIRoute = async ({ params }) => {
  const provider = getDefaultProvider(); // Get the configured provider
  const data = await provider.things.get(params.id); // Backend-agnostic call
  return response(data);
};
```

**Benefits:**

1. **Swap backends by changing one line** - Update provider configuration
2. **No vendor lock-in** - Switch from Convex to WordPress to Notion
3. **Consistent interface** - All providers implement `DataProvider`
4. **Type-safe** - Full TypeScript support across all backends
5. **Testable** - Mock provider for unit tests

## Switching Backends

To switch from Convex to WordPress:

```typescript
// Before: Convex
const provider = createDataProvider({
  type: 'convex',
  client: convexClient
});

// After: WordPress
const provider = createDataProvider({
  type: 'wordpress',
  url: 'https://example.com/wp-json',
  username: 'user',
  password: 'app_password'
});
```

All API endpoints continue to work unchanged!

## Development

### Start Development Server

```bash
cd web
bun run dev
```

### Test API Endpoints

```bash
# Test groups API
curl http://localhost:4321/api/groups

# Test things API
curl http://localhost:4321/api/things?type=course

# Test events API
curl http://localhost:4321/api/events

# Test knowledge search
curl "http://localhost:4321/api/knowledge/search?q=python"
```

### Check API Health

```bash
curl http://localhost:4321/api/health
```

## Integration with Frontend

### Using API in React Components

```typescript
import { useEffect, useState } from 'react';

export function ThingsList() {
  const [things, setThings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/things?type=course')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setThings(data.data.things);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {things.map(thing => (
        <li key={thing._id}>{thing.name}</li>
      ))}
    </ul>
  );
}
```

### Using API in Astro Pages

```astro
---
import { getDefaultProvider } from '@/providers/factory';

const provider = getDefaultProvider();
const things = await provider.things.list({ type: 'course' });
---

<div>
  {things.map(thing => (
    <h2>{thing.name}</h2>
  ))}
</div>
```

## Documentation

- **[Integration Plan](../../../one/things/plans/integrate-frontend-and-backend.md)** - Complete architecture overview
- **[Provider Factory](../providers/factory.ts)** - Backend abstraction
- **[CLAUDE.md](../../../CLAUDE.md)** - Development guidelines
- **[6-Dimension Ontology](../../../one/knowledge/ontology.md)** - Data model

## Changelog

### v1.0.0 (Phase 6)

- Created all 13 API endpoints following 6-dimension ontology
- Implemented standardized response format
- Added comprehensive query parameters and filtering
- Full error handling with typed error codes
- Integrated with provider factory for backend abstraction
- Complete documentation with examples
