---
layout: /src/layouts/Layout.astro
title: API Examples & Testing Guide
description: Complete curl command examples for testing all REST API endpoints
---

# API Examples & Testing Guide

Complete curl command examples for testing all REST API endpoints.

## Quick Setup

Ensure the development server is running:

```bash
cd web
bun run dev
# Server running at http://localhost:4321
```

## Groups API Examples

### 1. List All Groups

```bash
curl http://localhost:4321/api/groups
```

Response:
```json
{
  "success": true,
  "data": {
    "groups": [],
    "total": 0,
    "limit": 50,
    "offset": 0
  },
  "timestamp": 1698765432100
}
```

### 2. List Groups by Type

```bash
curl "http://localhost:4321/api/groups?type=organization"
```

### 3. Create a Group

```bash
curl -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Corp",
    "type": "organization",
    "properties": {
      "description": "Acme Corporation",
      "plan": "pro",
      "industry": "Technology"
    }
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "group_abc123",
    "name": "Acme Corp",
    "type": "organization",
    "properties": {
      "description": "Acme Corporation",
      "plan": "pro",
      "industry": "Technology"
    },
    "status": "active",
    "createdAt": 1698765432100,
    "updatedAt": 1698765432100
  },
  "timestamp": 1698765432100
}
```

### 4. Get a Specific Group

```bash
# Replace {group_id} with actual ID from previous response
GROUP_ID="group_abc123"
curl "http://localhost:4321/api/groups/${GROUP_ID}"
```

### 5. Update a Group

```bash
GROUP_ID="group_abc123"
curl -X PUT "http://localhost:4321/api/groups/${GROUP_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Corporation Updated",
    "properties": {
      "description": "Updated Acme Corp description",
      "plan": "enterprise"
    }
  }'
```

## Things API Examples

### 1. List All Things

```bash
curl http://localhost:4321/api/things
```

### 2. Create a Course

```bash
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"course\",
    \"name\": \"Python Fundamentals\",
    \"groupId\": \"${GROUP_ID}\",
    \"properties\": {
      \"description\": \"Learn Python basics in 40 hours\",
      \"duration\": 40,
      \"level\": \"beginner\",
      \"instructor\": \"Jane Smith\",
      \"price\": 99.99
    },
    \"status\": \"draft\"
  }"
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "thing_def456",
    "type": "course",
    "name": "Python Fundamentals",
    "groupId": "group_abc123",
    "properties": {
      "description": "Learn Python basics in 40 hours",
      "duration": 40,
      "level": "beginner",
      "instructor": "Jane Smith",
      "price": 99.99
    },
    "status": "draft",
    "createdAt": 1698765432100,
    "updatedAt": 1698765432100
  },
  "timestamp": 1698765432100
}
```

### 3. Create a Product

```bash
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"product\",
    \"name\": \"Python Course Bundle\",
    \"groupId\": \"${GROUP_ID}\",
    \"properties\": {
      \"description\": \"Complete Python learning bundle\",
      \"price\": 199.99,
      \"stock\": 100,
      \"sku\": \"PY-BUNDLE-001\",
      \"category\": \"Education\"
    },
    \"status\": \"active\"
  }"
```

### 4. Search for Things

```bash
curl "http://localhost:4321/api/things?search=python&type=course&limit=20"
```

### 5. Get a Specific Thing

```bash
THING_ID="thing_def456"
curl "http://localhost:4321/api/things/${THING_ID}"
```

### 6. Update a Thing

```bash
THING_ID="thing_def456"
curl -X PUT "http://localhost:4321/api/things/${THING_ID}" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Advanced Python Fundamentals",
    "status": "published",
    "properties": {
      "level": "intermediate",
      "price": 149.99
    }
  }'
```

### 7. Filter Things by Status

```bash
curl "http://localhost:4321/api/things?status=published&limit=10"
```

### 8. Paginate Through Things

```bash
# Get first 10
curl "http://localhost:4321/api/things?limit=10&offset=0"

# Get next 10
curl "http://localhost:4321/api/things?limit=10&offset=10"

# Get next 10
curl "http://localhost:4321/api/things?limit=10&offset=20"
```

## Connections API Examples

### 1. List All Connections

```bash
curl http://localhost:4321/api/connections
```

### 2. Create a Connection (Enrollment)

```bash
USER_ID="thing_user123"      # Thing ID for a user
COURSE_ID="thing_def456"     # Thing ID for a course
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/connections \
  -H 'Content-Type: application/json' \
  -d "{
    \"fromThingId\": \"${USER_ID}\",
    \"toThingId\": \"${COURSE_ID}\",
    \"relationshipType\": \"enrolled_in\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"enrolledAt\": $(date +%s)000,
      \"status\": \"active\",
      \"progress\": 0
    }
  }"
```

### 3. Create a Connection (Ownership)

```bash
OWNER_ID="thing_owner123"
COURSE_ID="thing_def456"
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/connections \
  -H 'Content-Type: application/json' \
  -d "{
    \"fromThingId\": \"${OWNER_ID}\",
    \"toThingId\": \"${COURSE_ID}\",
    \"relationshipType\": \"owns\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"since\": $(date +%s)000
    }
  }"
```

### 4. List Connections of a Specific Type

```bash
curl "http://localhost:4321/api/connections?type=enrolled_in"
```

### 5. List All Enrollments for a User

```bash
USER_ID="thing_user123"
curl "http://localhost:4321/api/connections?fromThingId=${USER_ID}&type=enrolled_in"
```

### 6. List All Things a User Owns

```bash
OWNER_ID="thing_owner123"
curl "http://localhost:4321/api/connections?fromThingId=${OWNER_ID}&type=owns"
```

### 7. Get a Specific Connection

```bash
CONNECTION_ID="conn_xyz789"
curl "http://localhost:4321/api/connections/${CONNECTION_ID}"
```

## People API Examples

### 1. Get Current User

```bash
# Requires authentication cookie from Better Auth
curl http://localhost:4321/api/people/me \
  -H "Cookie: better-auth-session=..."
```

### 2. Get a Specific Person

```bash
PERSON_ID="person_user123"
curl "http://localhost:4321/api/people/${PERSON_ID}"
```

## Events API Examples

### 1. List All Events (Audit Log)

```bash
curl http://localhost:4321/api/events
```

### 2. Record a "Course Created" Event

```bash
COURSE_ID="thing_def456"
CREATOR_ID="person_creator123"
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"entity_created\",
    \"actorId\": \"${CREATOR_ID}\",
    \"targetId\": \"${COURSE_ID}\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"entityType\": \"course\",
      \"entityName\": \"Python Fundamentals\",
      \"status\": \"draft\"
    }
  }"
```

### 3. Record an "Enrollment" Event

```bash
USER_ID="person_user123"
COURSE_ID="thing_def456"
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"course_enrolled\",
    \"actorId\": \"${USER_ID}\",
    \"targetId\": \"${COURSE_ID}\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"enrollmentDate\": $(date +%s)000
    }
  }"
```

### 4. Record a "Lesson Completed" Event

```bash
USER_ID="person_user123"
LESSON_ID="thing_lesson789"
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"lesson_completed\",
    \"actorId\": \"${USER_ID}\",
    \"targetId\": \"${LESSON_ID}\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"duration\": 3600,
      \"score\": 95,
      \"completedAt\": $(date +%s)000
    }
  }"
```

### 5. Record a "Payment" Event

```bash
USER_ID="person_user123"
COURSE_ID="thing_def456"
GROUP_ID="group_abc123"
curl -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"payment_received\",
    \"actorId\": \"${USER_ID}\",
    \"targetId\": \"${COURSE_ID}\",
    \"groupId\": \"${GROUP_ID}\",
    \"metadata\": {
      \"amount\": 99.99,
      \"currency\": \"USD\",
      \"paymentId\": \"pay_stripe_123\",
      \"status\": \"success\"
    }
  }"
```

### 6. List Events for a Specific User

```bash
USER_ID="person_user123"
curl "http://localhost:4321/api/events?actorId=${USER_ID}&limit=20"
```

### 7. List Events for a Specific Course

```bash
COURSE_ID="thing_def456"
curl "http://localhost:4321/api/events?targetId=${COURSE_ID}&limit=20"
```

### 8. List Events in Time Range

```bash
START_TIME=$(($(date +%s) - 86400))000  # 24 hours ago
END_TIME=$(date +%s)000                  # now
curl "http://localhost:4321/api/events?startTime=${START_TIME}&endTime=${END_TIME}"
```

### 9. List Specific Event Type

```bash
curl "http://localhost:4321/api/events?type=course_enrolled&limit=50"
```

## Knowledge API Examples

### 1. Search Knowledge Base

```bash
curl "http://localhost:4321/api/knowledge/search?q=python+tutorial"
```

Response:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "_id": "knowledge_001",
        "title": "Python Tutorial",
        "content": "Python is a high-level programming language...",
        "score": 0.95,
        "groupId": "group_abc123"
      }
    ],
    "query": "python tutorial",
    "total": 1,
    "limit": 10
  },
  "timestamp": 1698765432100
}
```

### 2. Search with More Results

```bash
curl "http://localhost:4321/api/knowledge/search?q=machine+learning&limit=20"
```

### 3. Search with Similarity Threshold

```bash
curl "http://localhost:4321/api/knowledge/search?q=deep+learning&threshold=0.8"
```

### 4. Search Within Group

```bash
GROUP_ID="group_abc123"
curl "http://localhost:4321/api/knowledge/search?q=courses&groupId=${GROUP_ID}"
```

## Complete End-to-End Example

Full workflow: Create group → Create courses → Enroll user → Record events

```bash
#!/bin/bash

# 1. Create an organization
echo "1. Creating organization..."
ORG_RESPONSE=$(curl -s -X POST http://localhost:4321/api/groups \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Tech Academy",
    "type": "organization",
    "properties": {
      "description": "Online technology academy"
    }
  }')
ORG_ID=$(echo $ORG_RESPONSE | jq -r '.data._id')
echo "Organization created: $ORG_ID"

# 2. Create a course
echo "2. Creating course..."
COURSE_RESPONSE=$(curl -s -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"course\",
    \"name\": \"Python 101\",
    \"groupId\": \"${ORG_ID}\",
    \"properties\": {
      \"description\": \"Learn Python basics\",
      \"duration\": 40,
      \"level\": \"beginner\"
    }
  }")
COURSE_ID=$(echo $COURSE_RESPONSE | jq -r '.data._id')
echo "Course created: $COURSE_ID"

# 3. Create a user
echo "3. Creating user..."
USER_RESPONSE=$(curl -s -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"creator\",
    \"name\": \"Alice Johnson\",
    \"groupId\": \"${ORG_ID}\",
    \"properties\": {
      \"email\": \"alice@example.com\",
      \"role\": \"org_user\"
    }
  }")
USER_ID=$(echo $USER_RESPONSE | jq -r '.data._id')
echo "User created: $USER_ID"

# 4. Enroll user in course
echo "4. Creating enrollment connection..."
CONN_RESPONSE=$(curl -s -X POST http://localhost:4321/api/connections \
  -H 'Content-Type: application/json' \
  -d "{
    \"fromThingId\": \"${USER_ID}\",
    \"toThingId\": \"${COURSE_ID}\",
    \"relationshipType\": \"enrolled_in\",
    \"groupId\": \"${ORG_ID}\",
    \"metadata\": {
      \"enrolledAt\": $(date +%s)000
    }
  }")
CONN_ID=$(echo $CONN_RESPONSE | jq -r '.data._id')
echo "Enrollment created: $CONN_ID"

# 5. Record enrollment event
echo "5. Recording enrollment event..."
EVENT_RESPONSE=$(curl -s -X POST http://localhost:4321/api/events \
  -H 'Content-Type: application/json' \
  -d "{
    \"type\": \"course_enrolled\",
    \"actorId\": \"${USER_ID}\",
    \"targetId\": \"${COURSE_ID}\",
    \"groupId\": \"${ORG_ID}\",
    \"metadata\": {
      \"enrollmentDate\": $(date +%s)000
    }
  }")
EVENT_ID=$(echo $EVENT_RESPONSE | jq -r '.data._id')
echo "Event recorded: $EVENT_ID"

# 6. List all events
echo "6. Listing all events..."
curl -s "http://localhost:4321/api/events" | jq '.'

# 7. List user's enrollments
echo "7. Listing user's enrollments..."
curl -s "http://localhost:4321/api/connections?fromThingId=${USER_ID}&type=enrolled_in" | jq '.'

echo "Done!"
```

Save as `test-api.sh`, then run:

```bash
chmod +x test-api.sh
./test-api.sh
```

## Testing with Postman

Import this collection into Postman:

```json
{
  "info": {
    "name": "ONE Platform API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Groups",
      "item": [
        {
          "name": "List Groups",
          "request": {
            "method": "GET",
            "url": "http://localhost:4321/api/groups"
          }
        },
        {
          "name": "Create Group",
          "request": {
            "method": "POST",
            "url": "http://localhost:4321/api/groups",
            "body": {
              "mode": "raw",
              "raw": "{\"name\":\"Test Group\",\"type\":\"organization\"}"
            }
          }
        }
      ]
    },
    {
      "name": "Things",
      "item": [
        {
          "name": "List Things",
          "request": {
            "method": "GET",
            "url": "http://localhost:4321/api/things?type=course"
          }
        }
      ]
    },
    {
      "name": "Connections",
      "item": [
        {
          "name": "List Connections",
          "request": {
            "method": "GET",
            "url": "http://localhost:4321/api/connections"
          }
        }
      ]
    },
    {
      "name": "Events",
      "item": [
        {
          "name": "List Events",
          "request": {
            "method": "GET",
            "url": "http://localhost:4321/api/events"
          }
        }
      ]
    },
    {
      "name": "Knowledge",
      "item": [
        {
          "name": "Search",
          "request": {
            "method": "GET",
            "url": "http://localhost:4321/api/knowledge/search?q=python"
          }
        }
      ]
    }
  ]
}
```

## Troubleshooting

### 400 Bad Request - Missing Field

**Error:** `"name is required and must be a string"`

**Solution:** Ensure all required fields are included in request body:
- `name` and `type` for groups
- `type`, `name`, and `groupId` for things
- All required connection fields

### 404 Not Found

**Error:** `"Thing with ID xyz not found"`

**Solution:** Verify the ID exists:
```bash
# Get the actual ID from creation response
curl "http://localhost:4321/api/things?limit=1"
```

### 500 Internal Server Error

**Error:** Backend provider unavailable

**Solution:**
1. Check provider is initialized
2. Verify environment variables are set
3. Check backend service is running

### Validation Errors

Ensure request body is valid JSON:
```bash
# ✅ Correct - properly formatted JSON
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d '{"type":"course","name":"Test","groupId":"group_123"}'

# ❌ Wrong - missing quotes
curl -X POST http://localhost:4321/api/things \
  -H 'Content-Type: application/json' \
  -d '{type:course,name:Test}'
```

## Next Steps

1. Test endpoints with curl examples above
2. Integrate into React components using fetch
3. Add error handling and loading states
4. Implement pagination UI
5. Add filtering and search UI
6. Set up real-time subscriptions (if using Convex)
