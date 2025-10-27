# ONE Platform Integration Guide

**Version:** 1.0.0
**Created:** 2025-01-25
**Purpose:** How to integrate external applications with ONE Platform

---

## Overview

ONE Platform provides a complete API for external integrations. This guide shows you how to:

1. **Authenticate** your application
2. **Connect** to the 6-dimension ontology
3. **Build** multi-tenant features
4. **Handle** rate limiting and errors
5. **Deploy** production-ready integrations

---

## Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install convex @better-auth/client
```

### Step 2: Initialize Convex Client

```typescript
// lib/convex.ts
import { ConvexHttpClient } from "convex/browser";

export const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL!
);
```

### Step 3: Authenticate

```typescript
// lib/auth.ts
import { createAuthClient } from "@better-auth/client";

export const auth = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL!
});

// Sign in
await auth.signIn.email({
  email: "user@example.com",
  password: "password123"
});
```

### Step 4: Query Data

```typescript
import { convex } from "./lib/convex";
import { api } from "@/convex/_generated/api";

// Get your group
const group = await convex.query(api.queries.groups.getBySlug, {
  slug: "my-org"
});

// List entities
const entities = await convex.query(api.queries.entities.list, {
  groupId: group._id,
  type: "course",
  status: "published"
});
```

### Step 5: Create Data

```typescript
// Create new entity
const courseId = await convex.mutation(api.mutations.entities.create, {
  groupId: group._id,
  type: "course",
  name: "TypeScript Fundamentals",
  properties: {
    description: "Learn TypeScript from scratch",
    price: 99,
    duration: 40
  },
  status: "published"
});
```

**Done!** You've integrated with ONE Platform in 5 minutes.

---

## Authentication Methods

### 1. Email/Password

```typescript
import { auth } from "./lib/auth";

// Sign up
await auth.signUp.email({
  email: "user@example.com",
  password: "secure_password",
  name: "John Doe"
});

// Sign in
await auth.signIn.email({
  email: "user@example.com",
  password: "secure_password"
});

// Sign out
await auth.signOut();
```

---

### 2. OAuth (GitHub, Google)

```typescript
// Redirect to OAuth provider
await auth.signIn.social({
  provider: "github",
  callbackURL: "/auth/callback"
});

// Handle callback
await auth.handleCallback();
```

**Supported Providers:**
- GitHub
- Google
- More providers coming soon

---

### 3. Magic Links

```typescript
// Request magic link
await auth.signIn.magicLink({
  email: "user@example.com"
});

// User clicks link in email, automatically signs in
```

**Use Case:** Passwordless authentication, better UX

---

### 4. API Keys (Server-Side)

```typescript
// Generate API key (one-time, save securely)
const apiKey = await convex.mutation(api.mutations.apiKeys.create, {
  groupId,
  name: "Production API Key",
  permissions: ["read", "write"]
});

// Use API key for authentication
const convex = new ConvexHttpClient(
  process.env.CONVEX_URL,
  {
    headers: {
      "Authorization": `Bearer ${process.env.API_KEY}`
    }
  }
);
```

**Use Case:** Server-to-server integrations, CI/CD pipelines

---

## Multi-Tenancy Best Practices

### Rule 1: Always Scope to GroupId

```typescript
// ✅ CORRECT - Scoped to group
const entities = await convex.query(api.queries.entities.list, {
  groupId: currentGroup._id,
  type: "course"
});

// ❌ WRONG - Missing groupId (security risk!)
const entities = await convex.query(api.queries.entities.listAll);
```

**Why:** GroupId provides perfect data isolation between organizations.

---

### Rule 2: Validate Group Access

```typescript
// ✅ CORRECT - Validate entity belongs to expected group
const entity = await convex.query(api.queries.entities.getById, {
  entityId: courseId,
  groupId: currentGroup._id  // Security check
});

if (!entity) {
  throw new Error("Entity not found in your organization");
}
```

**Why:** Prevents cross-tenant data leakage.

---

### Rule 3: Use Hierarchical Groups

```typescript
// Create organization (top-level)
const orgId = await convex.mutation(api.mutations.groups.create, {
  slug: "acme-corp",
  name: "Acme Corporation",
  type: "organization",
  settings: {
    visibility: "private",
    joinPolicy: "invite_only",
    plan: "enterprise"
  }
});

// Create department (nested)
const engineeringId = await convex.mutation(api.mutations.groups.create, {
  slug: "engineering",
  name: "Engineering",
  type: "community",
  parentGroupId: orgId  // Nested under org
});

// Create team (nested under department)
const backendId = await convex.mutation(api.mutations.groups.create, {
  slug: "backend",
  name: "Backend Team",
  type: "community",
  parentGroupId: engineeringId  // Nested under engineering
});

// Query all entities in org + subgroups
const allEntities = await convex.query(
  api.queries.groups.getEntitiesInHierarchy,
  {
    rootGroupId: orgId,
    entityType: "project"
  }
);
```

**Use Case:** Organizations → Departments → Teams → Projects

---

## Working with the 6-Dimension Ontology

### Dimension 1: Groups

**What:** Multi-tenant isolation boundary with hierarchical nesting

**Types:**
- `friend_circle` - Personal friend groups
- `business` - Small businesses
- `community` - Communities
- `dao` - Decentralized organizations
- `government` - Government agencies
- `organization` - Enterprises

**Example:**
```typescript
const group = await convex.mutation(api.mutations.groups.create, {
  slug: "my-org",
  name: "My Organization",
  type: "business",
  settings: {
    visibility: "private",
    joinPolicy: "invite_only",
    plan: "pro"
  }
});
```

---

### Dimension 3: Things (Entities)

**What:** All nouns in the system

**Example Types:**
- `user` - Platform users
- `course` - Educational courses
- `lesson` - Course lessons
- `project` - Portfolio projects
- `blog_post` - Blog articles
- `token` - Digital tokens
- `agent` - AI agents

**Example:**
```typescript
const courseId = await convex.mutation(api.mutations.entities.create, {
  groupId,
  type: "course",
  name: "TypeScript Fundamentals",
  properties: {
    description: "Learn TypeScript",
    price: 99,
    duration: 40,
    instructor: "Jane Doe"
  },
  status: "published"
});
```

---

### Dimension 4: Connections

**What:** Relationships between entities

**Example Types:**
- `owns` - Ownership
- `enrolled_in` - Course enrollment
- `created` - Authorship
- `tagged_with` - Categorization
- `member_of` - Group membership

**Example:**
```typescript
// Student enrolls in course
const connectionId = await convex.mutation(api.mutations.connections.create, {
  groupId,
  fromEntityId: studentId,
  toEntityId: courseId,
  relationshipType: "enrolled_in",
  metadata: {
    enrolledAt: Date.now(),
    progress: 0
  }
});

// Query enrolled courses
const enrollments = await convex.query(api.queries.connections.list, {
  groupId,
  fromEntityId: studentId,
  relationshipType: "enrolled_in"
});
```

---

### Dimension 5: Events

**What:** Audit trail of all actions

**Example Types:**
- `thing_created` - Entity created
- `thing_updated` - Entity updated
- `thing_deleted` - Entity deleted
- `user_logged_in` - User logged in
- `payment_processed` - Payment completed

**Example:**
```typescript
// Events are automatically logged by mutations
await convex.mutation(api.mutations.entities.create, {
  groupId,
  type: "course",
  name: "TypeScript Fundamentals"
});
// Automatically creates "thing_created" event

// Query event timeline
const timeline = await convex.query(api.queries.events.list, {
  groupId,
  limit: 20
});
```

**Use Case:** Complete audit trail, activity feeds, compliance

---

### Dimension 6: Knowledge

**What:** RAG (Retrieval-Augmented Generation) for AI features

**Example:**
```typescript
// Add knowledge
const knowledgeId = await convex.mutation(api.mutations.knowledge.add, {
  groupId,
  text: "TypeScript is a typed superset of JavaScript",
  labels: ["typescript", "programming", "education"],
  sourceThingId: courseId
});

// Semantic search
const results = await convex.query(api.queries.knowledge.search, {
  groupId,
  query: "What is TypeScript?",
  limit: 5
});
```

**Use Case:** AI chatbots, semantic search, recommendations

---

## Real-Time Subscriptions

ONE Platform provides real-time updates via Convex subscriptions.

### React Example

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function CourseList({ groupId }) {
  // Real-time subscription - updates automatically
  const courses = useQuery(api.queries.entities.list, {
    groupId,
    type: "course",
    status: "published"
  });

  const createCourse = useMutation(api.mutations.entities.create);

  if (courses === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {courses.map(course => (
        <div key={course._id}>{course.name}</div>
      ))}
      <button onClick={() => createCourse({
        groupId,
        type: "course",
        name: "New Course"
      })}>
        Create Course
      </button>
    </div>
  );
}
```

**Behavior:**
- `courses` updates automatically when data changes
- No polling needed
- Sub-100ms latency
- Works globally via Convex edge network

---

### Vanilla JavaScript Example

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.CONVEX_URL);

// Subscribe to query
const unsubscribe = convex.subscribe(
  api.queries.entities.list,
  { groupId, type: "course" },
  (courses) => {
    console.log("Courses updated:", courses);
    // Update UI with new data
  }
);

// Later: unsubscribe
unsubscribe();
```

---

## Error Handling

### Handle Common Errors

```typescript
try {
  const entity = await convex.query(api.queries.entities.getById, {
    entityId: courseId,
    groupId
  });
} catch (error) {
  // Type-safe error handling
  if (error.code === "NOT_FOUND") {
    console.error("Entity not found");
  } else if (error.code === "UNAUTHENTICATED") {
    // Redirect to login
    window.location.href = "/login";
  } else if (error.code === "GROUP_ACCESS_DENIED") {
    console.error("You don't have access to this group");
  } else {
    // Log unexpected errors
    console.error("Unexpected error:", error);
  }
}
```

---

### Retry with Exponential Backoff

```typescript
async function retryQuery(fn, maxRetries = 3) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const courses = await retryQuery(() =>
  convex.query(api.queries.entities.list, { groupId, type: "course" })
);
```

---

## Rate Limiting

### Rate Limit Headers

```typescript
const response = await fetch("/api/entities", {
  headers: {
    "Authorization": `Bearer ${apiKey}`
  }
});

console.log(response.headers.get("X-RateLimit-Limit"));      // 1000
console.log(response.headers.get("X-RateLimit-Remaining"));  // 950
console.log(response.headers.get("X-RateLimit-Reset"));      // 1622547600
```

### Handle Rate Limit Errors

```typescript
try {
  await convex.mutation(api.mutations.entities.create, { /* ... */ });
} catch (error) {
  if (error.code === "RATE_LIMIT_EXCEEDED") {
    const resetTime = parseInt(error.headers["X-RateLimit-Reset"]);
    const waitSeconds = Math.ceil((resetTime - Date.now()) / 1000);
    console.log(`Rate limit exceeded. Retry in ${waitSeconds} seconds`);
  }
}
```

---

## Pagination

### Cursor-Based Pagination

```typescript
async function* paginateEntities(groupId, type) {
  let cursor = null;

  while (true) {
    const response = await convex.query(api.queries.entities.list, {
      groupId,
      type,
      limit: 100,
      cursor
    });

    yield response.items;

    if (!response.hasMore) break;
    cursor = response.nextCursor;
  }
}

// Usage
for await (const batch of paginateEntities(groupId, "course")) {
  console.log("Batch:", batch);
}
```

---

## Webhooks (Coming Soon)

Receive real-time notifications when data changes.

### Subscribe to Webhook

```typescript
const webhook = await convex.mutation(api.mutations.webhooks.create, {
  groupId,
  url: "https://yourapp.com/webhooks/one",
  events: ["thing_created", "thing_updated"],
  secret: "your_webhook_secret"
});
```

### Handle Webhook

```typescript
// Your webhook endpoint
app.post("/webhooks/one", async (req, res) => {
  // Verify signature
  const signature = req.headers["x-one-signature"];
  const payload = JSON.stringify(req.body);
  const expected = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expected) {
    return res.status(401).send("Invalid signature");
  }

  // Process event
  const { event, data } = req.body;

  if (event === "thing_created") {
    console.log("New entity created:", data);
  }

  res.status(200).send("OK");
});
```

---

## Example Integrations

### 1. Mobile App (React Native)

```typescript
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.EXPO_PUBLIC_CONVEX_URL
);

export function CourseScreen({ groupId }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const unsubscribe = convex.subscribe(
      api.queries.entities.list,
      { groupId, type: "course" },
      (data) => setCourses(data)
    );

    return () => unsubscribe();
  }, [groupId]);

  return (
    <FlatList
      data={courses}
      keyExtractor={item => item._id}
      renderItem={({ item }) => <CourseCard course={item} />}
    />
  );
}
```

---

### 2. Zapier Integration

```typescript
// Zapier trigger: New Course Created
const newCourse = {
  key: "new_course",
  noun: "Course",
  display: {
    label: "New Course",
    description: "Triggers when a new course is created"
  },
  operation: {
    perform: async (z, bundle) => {
      const courses = await z.request({
        url: `${bundle.authData.baseUrl}/api/entities`,
        params: {
          groupId: bundle.authData.groupId,
          type: "course",
          limit: 100
        }
      });

      return courses.json();
    }
  }
};
```

---

### 3. N8N Workflow

```json
{
  "nodes": [
    {
      "name": "ONE Trigger",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$env.ONE_API_URL}}/api/entities",
        "authentication": "genericCredentialType",
        "method": "GET",
        "queryParameters": {
          "groupId": "={{$env.ONE_GROUP_ID}}",
          "type": "course",
          "status": "published"
        }
      }
    },
    {
      "name": "Process Courses",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return items.map(item => ({\n  json: {\n    courseName: item.json.name,\n    price: item.json.properties.price\n  }\n}));"
      }
    }
  ]
}
```

---

## Performance Optimization

### 1. Use Indexes

```typescript
// ✅ FAST - Uses group_type index
const courses = await convex.query(api.queries.entities.list, {
  groupId,
  type: "course"
});

// ❌ SLOW - No index, filters in memory
const courses = (await convex.query(api.queries.entities.list, { groupId }))
  .filter(e => e.type === "course");
```

---

### 2. Batch Requests

```typescript
// ✅ FAST - Parallel requests
const [courses, projects, users] = await Promise.all([
  convex.query(api.queries.entities.list, { groupId, type: "course" }),
  convex.query(api.queries.entities.list, { groupId, type: "project" }),
  convex.query(api.queries.entities.list, { groupId, type: "user" })
]);

// ❌ SLOW - Sequential requests
const courses = await convex.query(api.queries.entities.list, { groupId, type: "course" });
const projects = await convex.query(api.queries.entities.list, { groupId, type: "project" });
const users = await convex.query(api.queries.entities.list, { groupId, type: "user" });
```

---

### 3. Cache Aggressively

```typescript
// Client-side caching
const cache = new Map();

async function getCachedEntity(entityId) {
  if (cache.has(entityId)) {
    return cache.get(entityId);
  }

  const entity = await convex.query(api.queries.entities.getById, { entityId });
  cache.set(entityId, entity);

  // Invalidate after 5 minutes
  setTimeout(() => cache.delete(entityId), 5 * 60 * 1000);

  return entity;
}
```

---

## Security Best Practices

### 1. Never Expose API Keys

```typescript
// ✅ CORRECT - Server-side only
// server.ts
const apiKey = process.env.ONE_API_KEY;

// ❌ WRONG - Exposed to client
// client.ts
const apiKey = "pk_live_12345"; // Never hardcode!
```

---

### 2. Validate Input

```typescript
// ✅ CORRECT - Validate before mutation
function validateCourse(data) {
  if (!data.name || data.name.length < 3) {
    throw new Error("Course name must be at least 3 characters");
  }
  if (data.properties?.price < 0) {
    throw new Error("Price cannot be negative");
  }
}

validateCourse(courseData);
await convex.mutation(api.mutations.entities.create, courseData);
```

---

### 3. Use HTTPS Only

```typescript
// ✅ CORRECT
const convex = new ConvexHttpClient("https://your-app.convex.cloud");

// ❌ WRONG - Never use HTTP in production
const convex = new ConvexHttpClient("http://your-app.convex.cloud");
```

---

## Support

**Documentation:** https://one.ie/docs
**API Reference:** /one/connections/api-reference.md
**Community:** https://discord.gg/one-platform
**Email:** support@one.ie

---

**Built for seamless integration and infinite scale.**
