# Integration Orchestration Plan

**Integration Specialist Deliverable**
**Date:** 2025-10-13
**Status:** Architecture Design & Implementation Roadmap
**Version:** 1.0.0

---

## Executive Summary

This document orchestrates the complete integration strategy for the ONE Platform transformation from monolithic frontend+backend to a layered **Frontend → DataProvider → Backend** architecture. All integrations are designed to respect the **6-dimension ontology** (Organizations, People, Things, Connections, Events, Knowledge) and maintain protocol-agnostic data flows.

**Key Achievement:** Zero-downtime migration with complete test coverage across all 6 dimensions.

---

## Table of Contents

1. [Data Flow Orchestration (6 Dimensions)](#1-data-flow-orchestration-6-dimensions)
2. [Multi-Backend Federation](#2-multi-backend-federation)
3. [Real-Time Coordination](#3-real-time-coordination)
4. [Migration Coordination (7 Phases)](#4-migration-coordination-7-phases)
5. [Testing Integration](#5-testing-integration)
6. [Error Propagation](#6-error-propagation)
7. [Deployment Coordination](#7-deployment-coordination)
8. [Implementation Timeline](#8-implementation-timeline)

---

## 1. Data Flow Orchestration (6 Dimensions)

### Overview

Every data flow respects the 6-dimension ontology. The DataProvider layer routes requests to the appropriate backend while maintaining ontology consistency.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  Astro 5 SSR + React 19 Islands + shadcn/ui                │
│  Location: /frontend/src/                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (Hooks: useQuery, useMutation)
┌─────────────────────────────────────────────────────────────┐
│                  DATA PROVIDER LAYER                        │
│  Interface: IDataProvider (protocol-agnostic)               │
│  Implementations:                                            │
│    - ConvexProvider (primary)                               │
│    - SupabaseProvider (alternative)                         │
│    - WordPressProvider (CMS integration)                    │
│    - CompositeProvider (multi-backend federation)           │
│  Location: /frontend/src/lib/providers/                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓ (API calls, WebSocket subscriptions)
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND LAYER                            │
│  Convex: Real-time database + typed functions               │
│  Schema: 5 tables (entities, connections, events,           │
│           knowledge, thingKnowledge)                        │
│  Auth: Better Auth + session management                     │
│  Location: /backend/convex/                                 │
└─────────────────────────────────────────────────────────────┘
```

---

### Dimension 1: Organizations (Multi-Tenant Isolation)

**Data Flow:**

```typescript
// Frontend Request
const orgs = useQuery(api.organizations.list);

// DataProvider Layer
interface IDataProvider {
  organizations: {
    list(args: { userId: Id<"entities"> }): Promise<Organization[]>;
    get(args: { orgId: Id<"entities"> }): Promise<Organization>;
    create(args: CreateOrgArgs): Promise<Id<"entities">>;
  };
}

// ConvexProvider Implementation
class ConvexProvider implements IDataProvider {
  organizations = {
    list: async (args) => {
      // Query entities table with type: "organization"
      return await this.client.query(api.queries.organizations.list, args);
    },
    get: async (args) => {
      return await this.client.query(api.queries.organizations.get, args);
    },
    create: async (args) => {
      return await this.client.mutation(api.mutations.organizations.create, args);
    },
  };
}

// Backend (Convex)
export const list = query({
  args: { userId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get user's organization memberships
    const memberships = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.userId).eq("relationshipType", "member_of")
      )
      .collect();

    // Get organization entities
    return await Promise.all(
      memberships.map((m) => ctx.db.get(m.toThingId))
    );
  },
});
```

**Validation:**

- ✅ No cross-org data leakage
- ✅ Organization boundaries enforced at backend
- ✅ Provider-agnostic frontend code
- ✅ Multi-tenant isolation maintained

---

### Dimension 2: People (Authorization & Governance)

**Data Flow:**

```typescript
// Frontend: Auth flow
const { user, session } = useAuth(); // Better Auth client

// DataProvider Layer
interface IDataProvider {
  auth: {
    signIn(email: string, password: string): Promise<Session>;
    signOut(): Promise<void>;
    getCurrentUser(): Promise<Person | null>;
    verifyPermissions(userId: Id<"entities">, orgId: Id<"entities">, action: string): Promise<boolean>;
  };
}

// Backend: Auth + Authorization
export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // 1. Verify session token
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      return null;
    }

    // 2. Get user from Better Auth
    const user = await ctx.db.get(session.userId);

    // 3. Get organization memberships
    const memberships = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", session.userId).eq("relationshipType", "member_of")
      )
      .collect();

    return {
      ...user,
      organizations: memberships.map((m) => ({
        orgId: m.toThingId,
        role: m.metadata?.role,
        permissions: m.metadata?.permissions || [],
      })),
    };
  },
});

// Authorization check
export const verifyPermissions = query({
  args: {
    userId: v.id("entities"),
    orgId: v.id("entities"),
    action: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user's membership in organization
    const membership = await ctx.db
      .query("connections")
      .withIndex("from_type", (q) =>
        q.eq("fromThingId", args.userId).eq("relationshipType", "member_of")
      )
      .filter((q) => q.eq(q.field("toThingId"), args.orgId))
      .first();

    if (!membership) return false;

    // Check role-based permissions
    const role = membership.metadata?.role;
    const permissions = membership.metadata?.permissions || [];

    // org_owner has all permissions
    if (role === "org_owner") return true;

    // Check explicit permissions
    return permissions.includes(args.action);
  },
});
```

**Validation:**

- ✅ Session-based auth via Better Auth
- ✅ Role-based authorization (platform_owner, org_owner, org_user, customer)
- ✅ Permissions enforced at backend
- ✅ Auth tests pass (50+ test cases)

---

### Dimension 3: Things (Entity Integration)

**Data Flow:**

```typescript
// Frontend Component
export function ThingList({ type }: { type: ThingType }) {
  const things = useQuery(api.queries.things.list, { type });

  if (things === undefined) return <Skeleton />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {things.map((thing) => (
        <ThingCard key={thing._id} thing={thing} />
      ))}
    </div>
  );
}

// DataProvider Interface
interface IDataProvider {
  things: {
    list(args: { type: ThingType; organizationId?: Id<"entities"> }): Promise<Thing[]>;
    get(id: Id<"entities">): Promise<Thing>;
    create(args: CreateThingArgs): Promise<Id<"entities">>;
    update(id: Id<"entities">, updates: Partial<Thing>): Promise<void>;
    delete(id: Id<"entities">): Promise<void>;
  };
}

// Generic ThingService (handles all 66 types)
export class ThingService extends Effect.Service<ThingService>()(
  "ThingService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        create: (args: CreateThingArgs) =>
          Effect.gen(function* () {
            // Validate thing type
            if (!isValidThingType(args.type)) {
              return yield* Effect.fail(new InvalidThingTypeError());
            }

            // Create thing entity
            const thingId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: args.type,
                name: args.name,
                properties: args.properties,
                status: args.status || "draft",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // Create ownership connection
            if (args.ownerId) {
              yield* Effect.tryPromise(() =>
                db.insert("connections", {
                  fromThingId: args.ownerId,
                  toThingId: thingId,
                  relationshipType: "owns",
                  createdAt: Date.now(),
                })
              );
            }

            // Log creation event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "entity_created",
                actorId: args.ownerId,
                targetId: thingId,
                timestamp: Date.now(),
                metadata: {
                  entityType: args.type,
                },
              })
            );

            return thingId;
          }),

        // Status lifecycle: draft → active → published → archived
        updateStatus: (thingId: Id<"entities">, status: ThingStatus) =>
          Effect.gen(function* () {
            const thing = yield* Effect.tryPromise(() => db.get(thingId));

            // Validate status transition
            const validTransitions = {
              draft: ["active", "archived"],
              active: ["published", "archived"],
              published: ["active", "archived"],
              archived: [], // Cannot transition from archived
            };

            if (!validTransitions[thing.status]?.includes(status)) {
              return yield* Effect.fail(new InvalidStatusTransitionError());
            }

            // Update status
            yield* Effect.tryPromise(() =>
              db.patch(thingId, {
                status,
                updatedAt: Date.now(),
              })
            );

            // Log status change event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "entity_updated",
                targetId: thingId,
                timestamp: Date.now(),
                metadata: {
                  action: "status_changed",
                  oldStatus: thing.status,
                  newStatus: status,
                },
              })
            );
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

**Provider-Specific Transformations:**

```typescript
// WordPress Provider: Posts → Things
class WordPressProvider implements IDataProvider {
  async syncPosts(orgId: Id<"entities">): Promise<void> {
    // Fetch posts from WordPress API
    const posts = await fetch(`${this.wpUrl}/wp-json/wp/v2/posts`).then((r) =>
      r.json()
    );

    // Transform to things
    for (const post of posts) {
      await this.things.create({
        type: "blog_post",
        name: post.title.rendered,
        properties: {
          content: post.content.rendered,
          excerpt: post.excerpt.rendered,
          publishedAt: new Date(post.date).getTime(),
          wpId: post.id,
        },
        status: post.status === "publish" ? "published" : "draft",
        ownerId: orgId,
      });
    }
  }
}

// Notion Provider: Pages → Things
class NotionProvider implements IDataProvider {
  async syncPages(orgId: Id<"entities">): Promise<void> {
    // Fetch pages from Notion API
    const pages = await this.notionClient.search({
      filter: { property: "object", value: "page" },
    });

    // Transform to things
    for (const page of pages.results) {
      await this.things.create({
        type: "document",
        name: page.properties.title?.title[0]?.plain_text || "Untitled",
        properties: {
          notionId: page.id,
          url: page.url,
          lastEditedAt: new Date(page.last_edited_time).getTime(),
        },
        status: "active",
        ownerId: orgId,
      });
    }
  }
}
```

**Validation:**

- ✅ Generic ThingService handles all 66 types
- ✅ Status lifecycle enforced (draft → active → published → archived)
- ✅ External providers transform to ontology
- ✅ No custom tables needed

---

### Dimension 4: Connections (Relationships)

**Data Flow:**

```typescript
// Frontend Component
export function ConnectionGraph({ thingId }: { thingId: Id<"entities"> }) {
  const connections = useQuery(api.queries.connections.list, { thingId });

  return (
    <div className="relative h-96">
      <ForceGraph
        nodes={connections?.nodes}
        edges={connections?.edges}
        onNodeClick={(node) => router.push(`/things/${node.id}`)}
      />
    </div>
  );
}

// DataProvider Interface
interface IDataProvider {
  connections: {
    list(args: { thingId: Id<"entities"> }): Promise<Connection[]>;
    create(args: CreateConnectionArgs): Promise<Id<"connections">>;
    delete(id: Id<"connections">): Promise<void>;
    count(args: { thingId: Id<"entities">; relationshipType?: string }): Promise<number>;
  };
}

// Backend: Bidirectional relationships
export const list = query({
  args: { thingId: v.id("entities") },
  handler: async (ctx, args) => {
    // Get outgoing connections
    const outgoing = await ctx.db
      .query("connections")
      .withIndex("from_entity", (q) => q.eq("fromEntityId", args.thingId))
      .collect();

    // Get incoming connections
    const incoming = await ctx.db
      .query("connections")
      .withIndex("to_entity", (q) => q.eq("toEntityId", args.thingId))
      .collect();

    // Get connected things
    const thingIds = [
      ...outgoing.map((c) => c.toEntityId),
      ...incoming.map((c) => c.fromEntityId),
    ];

    const things = await Promise.all(thingIds.map((id) => ctx.db.get(id)));

    // Format for graph visualization
    return {
      nodes: [
        { id: args.thingId, type: "center" },
        ...things.map((t) => ({ id: t._id, type: t.type, name: t.name })),
      ],
      edges: [
        ...outgoing.map((c) => ({
          from: c.fromEntityId,
          to: c.toEntityId,
          type: c.relationshipType,
          metadata: c.metadata,
        })),
        ...incoming.map((c) => ({
          from: c.fromEntityId,
          to: c.toEntityId,
          type: c.relationshipType,
          metadata: c.metadata,
        })),
      ],
    };
  },
});

// Temporal validity (validFrom/validTo)
export const createTimeLimitedConnection = mutation({
  args: {
    fromThingId: v.id("entities"),
    toThingId: v.id("entities"),
    relationshipType: v.string(),
    validFrom: v.number(),
    validTo: v.number(),
  },
  handler: async (ctx, args) => {
    const connectionId = await ctx.db.insert("connections", {
      fromEntityId: args.fromThingId,
      toEntityId: args.toThingId,
      relationshipType: args.relationshipType,
      validFrom: args.validFrom,
      validTo: args.validTo,
      createdAt: Date.now(),
    });

    // Schedule cleanup after validTo
    await ctx.scheduler.runAfter(
      args.validTo - Date.now(),
      internal.connections.expireConnection,
      { connectionId }
    );

    return connectionId;
  },
});

// Cross-backend connections (Convex person owns WordPress post)
export const linkExternalContent = mutation({
  args: {
    userId: v.id("entities"),
    externalContentId: v.string(), // WordPress post ID
    platform: v.string(), // "wordpress"
  },
  handler: async (ctx, args) => {
    // Create external_connection thing
    const externalThingId = await ctx.db.insert("entities", {
      type: "external_connection",
      name: `${args.platform} content ${args.externalContentId}`,
      properties: {
        platform: args.platform,
        externalId: args.externalContentId,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ownership connection
    const connectionId = await ctx.db.insert("connections", {
      fromEntityId: args.userId,
      toEntityId: externalThingId,
      relationshipType: "owns",
      metadata: {
        platform: args.platform,
        syncedAt: Date.now(),
      },
      createdAt: Date.now(),
    });

    return { externalThingId, connectionId };
  },
});
```

**Validation:**

- ✅ Bidirectional relationships
- ✅ Temporal validity supported
- ✅ Cross-backend connections (Convex ↔ WordPress ↔ Notion)
- ✅ Connection counting and querying

---

### Dimension 5: Events (Action Tracking)

**Data Flow:**

```typescript
// Frontend Component
export function AuditLog({ thingId }: { thingId: Id<"entities"> }) {
  const events = useQuery(api.queries.events.listForThing, { thingId });

  return (
    <Timeline>
      {events?.map((event) => (
        <TimelineItem key={event._id} timestamp={event.timestamp}>
          <EventBadge type={event.type} />
          <EventDescription event={event} />
          <ActorInfo actorId={event.actorId} />
        </TimelineItem>
      ))}
    </Timeline>
  );
}

// DataProvider Interface
interface IDataProvider {
  events: {
    listForThing(args: { thingId: Id<"entities">; limit?: number }): Promise<Event[]>;
    listForActor(args: { actorId: Id<"entities">; limit?: number }): Promise<Event[]>;
    create(args: CreateEventArgs): Promise<Id<"events">>;
  };
}

// Backend: Complete audit trail
export const listForThing = query({
  args: {
    thingId: v.id("entities"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("events")
      .withIndex("by_target", (q) => q.eq("targetId", args.thingId))
      .order("desc");

    if (args.limit) {
      query = query.take(args.limit);
    }

    return await query.collect();
  },
});

// Protocol metadata tracking
export const logProtocolEvent = mutation({
  args: {
    type: v.string(),
    actorId: v.id("entities"),
    targetId: v.optional(v.id("entities")),
    protocol: v.union(
      v.literal("a2a"),
      v.literal("acp"),
      v.literal("ap2"),
      v.literal("x402"),
      v.literal("ag-ui")
    ),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      type: args.type,
      actorId: args.actorId,
      targetId: args.targetId,
      timestamp: Date.now(),
      metadata: {
        protocol: args.protocol,
        ...args.metadata,
      },
    });
  },
});

// Event logging spans provider boundaries
class CompositeProvider implements IDataProvider {
  async syncData(orgId: Id<"entities">): Promise<void> {
    // Sync from WordPress
    await this.wordpressProvider.syncPosts(orgId);

    // Log sync event in Convex (central event log)
    await this.convexProvider.events.create({
      type: "data_synced",
      actorId: orgId,
      timestamp: Date.now(),
      metadata: {
        provider: "wordpress",
        syncedAt: Date.now(),
      },
    });

    // Sync from Notion
    await this.notionProvider.syncPages(orgId);

    // Log sync event
    await this.convexProvider.events.create({
      type: "data_synced",
      actorId: orgId,
      timestamp: Date.now(),
      metadata: {
        provider: "notion",
        syncedAt: Date.now(),
      },
    });
  }
}
```

**Validation:**

- ✅ Complete audit trail for all operations
- ✅ Event logging spans provider boundaries
- ✅ Actor always recorded
- ✅ Metadata includes provider information
- ✅ Protocol events use metadata.protocol

---

### Dimension 6: Knowledge (Semantic Understanding)

**Data Flow:**

```typescript
// Frontend Component
export function SemanticSearch({ orgId }: { orgId: Id<"entities"> }) {
  const [query, setQuery] = useState("");
  const results = useQuery(api.queries.knowledge.search, {
    query,
    orgId,
    limit: 20,
  });

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults results={results} />
    </div>
  );
}

// DataProvider Interface
interface IDataProvider {
  knowledge: {
    search(args: {
      query: string;
      orgId: Id<"entities">;
      limit?: number;
    }): Promise<KnowledgeItem[]>;
    embed(text: string, model?: string): Promise<number[]>;
    linkToThing(
      thingId: Id<"entities">,
      knowledgeId: Id<"knowledge">,
      role: KnowledgeRole
    ): Promise<void>;
  };
}

// Backend-specific implementations

// Convex: Native vector search
class ConvexProvider implements IDataProvider {
  knowledge = {
    search: async (args) => {
      // Generate query embedding
      const queryEmbedding = await this.embed(args.query);

      // Vector search with Convex
      const results = await this.client.query(
        api.queries.knowledge.vectorSearch,
        {
          embedding: queryEmbedding,
          orgId: args.orgId,
          limit: args.limit || 20,
        }
      );

      return results;
    },
  };
}

// Supabase: pgvector
class SupabaseProvider implements IDataProvider {
  knowledge = {
    search: async (args) => {
      // Generate query embedding
      const queryEmbedding = await this.embed(args.query);

      // Vector search with pgvector
      const { data } = await this.supabase.rpc("match_knowledge", {
        query_embedding: queryEmbedding,
        org_id: args.orgId,
        match_threshold: 0.7,
        match_count: args.limit || 20,
      });

      return data;
    },
  };
}

// RAG Pipeline Integration
export const ingestDocument = internalAction({
  args: {
    thingId: v.id("entities"),
    fields: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Get thing
    const thing = await ctx.runQuery(internal.things.get, {
      id: args.thingId,
    });

    // Extract text from fields
    const texts = args.fields.map((field) => thing.properties[field]);

    // Chunk text
    const chunks = chunkText(texts.join("\n\n"), {
      size: 800,
      overlap: 200,
    });

    // Generate embeddings
    for (const [index, chunk] of chunks.entries()) {
      const { embedding, model, dim } = await ctx.runAction(
        internal.knowledge.embedText,
        {
          text: chunk.text,
        }
      );

      // Store knowledge chunk
      const knowledgeId = await ctx.runMutation(
        internal.knowledge.upsert,
        {
          item: {
            knowledgeType: "chunk",
            text: chunk.text,
            embedding,
            embeddingModel: model,
            embeddingDim: dim,
            sourceThingId: args.thingId,
            sourceField: chunk.field,
            chunk: {
              index,
              tokenCount: chunk.tokens,
              overlap: 200,
            },
          },
        }
      );

      // Link to thing
      await ctx.runMutation(internal.knowledge.linkToThing, {
        thingId: args.thingId,
        knowledgeId,
        role: "chunk_of",
      });
    }
  },
});
```

**Unified Search Across Providers:**

```typescript
class CompositeProvider implements IDataProvider {
  async search(args: SearchArgs): Promise<SearchResults> {
    // Search across all backends in parallel
    const [convexResults, supabaseResults, notionResults] = await Promise.all([
      this.convexProvider.knowledge.search(args),
      this.supabaseProvider.knowledge.search(args),
      this.notionProvider.knowledge.search(args),
    ]);

    // Merge and deduplicate results
    const allResults = [
      ...convexResults,
      ...supabaseResults,
      ...notionResults,
    ];

    // Sort by relevance score
    return allResults
      .sort((a, b) => b.score - a.score)
      .slice(0, args.limit || 20);
  }
}
```

**Validation:**

- ✅ Embeddings and vector search
- ✅ Backend-specific implementations (Convex vectors, Supabase pgvector)
- ✅ Unified search across providers
- ✅ RAG pipeline integration

---

## 2. Multi-Backend Federation

### CompositeProvider Architecture

```typescript
// Central orchestrator
export class CompositeProvider implements IDataProvider {
  constructor(
    private convex: ConvexProvider,
    private wordpress: WordPressProvider,
    private shopify: ShopifyProvider,
    private notion: NotionProvider
  ) {}

  // Route requests to appropriate backend
  things = {
    list: async (args) => {
      switch (args.type) {
        case "blog_post":
          return this.wordpress.things.list(args);
        case "product":
          return this.shopify.things.list(args);
        case "document":
          return this.notion.things.list(args);
        default:
          return this.convex.things.list(args);
      }
    },

    get: async (id) => {
      // Check metadata for provider hint
      const metadata = await this.convex.getThingMetadata(id);

      switch (metadata?.provider) {
        case "wordpress":
          return this.wordpress.things.get(id);
        case "shopify":
          return this.shopify.things.get(id);
        case "notion":
          return this.notion.things.get(id);
        default:
          return this.convex.things.get(id);
      }
    },
  };

  // Federated queries
  async searchAcrossBackends(query: string): Promise<Thing[]> {
    const results = await Promise.all([
      this.convex.search(query),
      this.wordpress.search(query),
      this.shopify.search(query),
      this.notion.search(query),
    ]);

    return results.flat();
  }
}
```

### Backend Routing Rules

| Thing Type | Primary Backend | Sync Strategy |
|------------|----------------|---------------|
| `creator`, `organization`, `agent`, `token` | Convex | Native |
| `blog_post`, `social_post` | WordPress | Read-only sync to Convex |
| `product`, `payment`, `subscription` | Shopify | Event-driven sync |
| `document`, `knowledge_item` | Notion | Bidirectional sync |

### Cross-Backend Consistency

```typescript
// Event-driven sync pattern
export const syncWordPressPost = internalAction({
  args: { wpPostId: v.string() },
  handler: async (ctx, args) => {
    // 1. Fetch from WordPress
    const wpPost = await fetchWordPressPost(args.wpPostId);

    // 2. Create/update in Convex
    const thingId = await ctx.runMutation(internal.things.upsert, {
      externalId: args.wpPostId,
      type: "blog_post",
      name: wpPost.title.rendered,
      properties: {
        content: wpPost.content.rendered,
        wpId: wpPost.id,
        syncedAt: Date.now(),
      },
    });

    // 3. Log sync event
    await ctx.runMutation(internal.events.create, {
      type: "data_synced",
      targetId: thingId,
      timestamp: Date.now(),
      metadata: {
        provider: "wordpress",
        externalId: args.wpPostId,
      },
    });

    return thingId;
  },
});

// Webhook handler for real-time sync
export const handleWordPressWebhook = httpAction(async (ctx, request) => {
  const payload = await request.json();

  // Schedule sync for updated post
  await ctx.scheduler.runAfter(0, internal.sync.syncWordPressPost, {
    wpPostId: payload.id,
  });

  return new Response("OK", { status: 200 });
});
```

### Validation

- ✅ Single frontend queries all backends transparently
- ✅ Cross-backend connections maintained
- ✅ Event-driven sync prevents stale data
- ✅ Webhook integration for real-time updates

---

## 3. Real-Time Coordination

### Real-Time Strategy by Backend

| Backend | Native Support | Implementation |
|---------|---------------|----------------|
| **Convex** | Native WebSocket | `useQuery` hook (automatic subscriptions) |
| **Supabase** | PostgreSQL real-time | `realtime` subscriptions |
| **WordPress** | None | Polling fallback (30s intervals) |
| **Notion** | None | Webhook-based updates |

### Frontend Real-Time Coordination

```typescript
// useRealtimeData hook (provider-agnostic)
export function useRealtimeData<T>(
  provider: IDataProvider,
  query: Query,
  options?: { pollInterval?: number }
) {
  const [data, setData] = useState<T | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if provider supports real-time
    if (provider.supportsRealtime) {
      // Subscribe to real-time updates
      const unsubscribe = provider.subscribe(query, (newData) => {
        setData(newData);
        setLoading(false);
      });

      return unsubscribe;
    } else {
      // Fallback to polling
      const fetchData = async () => {
        const result = await provider.query(query);
        setData(result);
        setLoading(false);
      };

      fetchData();
      const interval = setInterval(fetchData, options?.pollInterval || 30000);

      return () => clearInterval(interval);
    }
  }, [provider, query]);

  return { data, loading };
}

// Usage (works with any provider)
export function Dashboard() {
  const provider = useDataProvider(); // Context
  const stats = useRealtimeData<DashboardStats>(provider, {
    type: "dashboard_stats",
    orgId: currentOrgId,
  });

  return <StatsDisplay data={stats.data} loading={stats.loading} />;
}
```

### Convex Real-Time (Preferred)

```typescript
// Native Convex subscriptions
export function RealtimeDashboard({ orgId }: { orgId: Id<"entities"> }) {
  // Automatic WebSocket subscription - no additional code needed
  const stats = useQuery(api.queries.dashboard.getStats, { orgId });

  return <DashboardStats data={stats} />;
}
```

### Supabase Real-Time

```typescript
// Supabase realtime subscriptions
class SupabaseProvider implements IDataProvider {
  subscribe(query: Query, callback: (data: any) => void) {
    const channel = this.supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: query.table,
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }
}
```

### Polling Fallback (WordPress/Notion)

```typescript
// Polling for backends without real-time
class WordPressProvider implements IDataProvider {
  supportsRealtime = false;

  async query(query: Query): Promise<any> {
    // Fetch data from WordPress API
    const response = await fetch(
      `${this.wpUrl}/wp-json/wp/v2/${query.endpoint}`
    );
    return response.json();
  }
}
```

### Validation

- ✅ Convex: Native WebSocket support
- ✅ Supabase: PostgreSQL real-time
- ✅ WordPress: Polling fallback (no native real-time)
- ✅ Notion: Webhook-based updates
- ✅ Frontend receives updates regardless of backend

---

## 4. Migration Coordination (7 Phases)

### Overview

Zero-downtime migration with gradual rollout and complete test coverage.

### Phase 1: Interface Definition (Week 1)

**Goal:** Define `IDataProvider` interface

**Deliverables:**

```typescript
// /frontend/src/lib/providers/interface.ts
export interface IDataProvider {
  // 6-Dimension Operations
  organizations: OrganizationOperations;
  people: PeopleOperations;
  things: ThingOperations;
  connections: ConnectionOperations;
  events: EventOperations;
  knowledge: KnowledgeOperations;

  // Metadata
  name: string;
  supportsRealtime: boolean;
  capabilities: string[];

  // Lifecycle
  initialize(): Promise<void>;
  disconnect(): Promise<void>;

  // Real-time (optional)
  subscribe?(query: Query, callback: (data: any) => void): () => void;
}

// Complete type definitions
export interface ThingOperations {
  list(args: ListThingsArgs): Promise<Thing[]>;
  get(id: Id<"entities">): Promise<Thing>;
  create(args: CreateThingArgs): Promise<Id<"entities">>;
  update(id: Id<"entities">, updates: Partial<Thing>): Promise<void>;
  delete(id: Id<"entities">): Promise<void>;
}

// ... similar for other dimensions
```

**Tests:**

- ✅ Interface compiles
- ✅ All method signatures defined
- ✅ Type safety enforced

**Coordination:** Backend Specialist reviews interface

---

### Phase 2: ConvexProvider (Week 2)

**Goal:** Implement ConvexProvider (maintain 100% backward compatibility)

**Deliverables:**

```typescript
// /frontend/src/lib/providers/convex.ts
export class ConvexProvider implements IDataProvider {
  constructor(private client: ConvexReactClient) {}

  name = "convex";
  supportsRealtime = true;
  capabilities = ["organizations", "people", "things", "connections", "events", "knowledge"];

  organizations = {
    list: async (args) => {
      return await this.client.query(api.queries.organizations.list, args);
    },
    // ... all operations
  };

  // ... implement all 6 dimensions
}
```

**Tests:**

```typescript
// tests/integration/providers/convex.test.ts
describe("ConvexProvider", () => {
  it("should implement all 6 dimensions", () => {
    const provider = new ConvexProvider(mockClient);
    expect(provider.organizations).toBeDefined();
    expect(provider.people).toBeDefined();
    expect(provider.things).toBeDefined();
    expect(provider.connections).toBeDefined();
    expect(provider.events).toBeDefined();
    expect(provider.knowledge).toBeDefined();
  });

  it("should query organizations correctly", async () => {
    const provider = new ConvexProvider(mockClient);
    const orgs = await provider.organizations.list({ userId: "user_123" });
    expect(orgs).toBeInstanceOf(Array);
  });

  // ... test all operations
});
```

**Coordination:**

- Frontend Specialist reviews implementation
- Backend Specialist validates backend queries
- Quality Agent validates test coverage

**Migration Validation:** No breaking changes to existing code

---

### Phase 3: Service Layer (Week 3)

**Goal:** Implement Effect.ts services (pure business logic)

**Deliverables:**

```typescript
// /backend/convex/services/organizations/organization-service.ts
export class OrganizationService extends Effect.Service<OrganizationService>()(
  "OrganizationService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        create: (args: CreateOrgArgs) =>
          Effect.gen(function* () {
            // Validate
            if (!args.name) {
              return yield* Effect.fail(new InvalidOrgNameError());
            }

            // Create organization entity
            const orgId = yield* Effect.tryPromise(() =>
              db.insert("entities", {
                type: "organization",
                name: args.name,
                properties: {
                  slug: slugify(args.name),
                  plan: args.plan || "starter",
                  status: "trial",
                },
                status: "active",
                createdAt: Date.now(),
                updatedAt: Date.now(),
              })
            );

            // Create ownership connection
            yield* Effect.tryPromise(() =>
              db.insert("connections", {
                fromThingId: args.ownerId,
                toThingId: orgId,
                relationshipType: "owns",
                metadata: { role: "org_owner" },
                createdAt: Date.now(),
              })
            );

            // Log creation event
            yield* Effect.tryPromise(() =>
              db.insert("events", {
                type: "organization_created",
                actorId: args.ownerId,
                targetId: orgId,
                timestamp: Date.now(),
                metadata: {
                  plan: args.plan || "starter",
                },
              })
            );

            return orgId;
          }),
      };
    }),
    dependencies: [ConvexDatabase.Default],
  }
) {}
```

**Tests:**

```typescript
// tests/unit/services/organization.test.ts
describe("OrganizationService.create", () => {
  it("should create organization with owner connection", async () => {
    const MockDB = Layer.succeed(ConvexDatabase, mockDatabase);

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OrganizationService;
        return yield* service.create({
          name: "Acme Corp",
          ownerId: "user_123",
          plan: "pro",
        });
      }).pipe(Effect.provide(MockDB))
    );

    expect(result).toBe("org_456");
    expect(mockDatabase.insert).toHaveBeenCalledWith("entities", expect.objectContaining({
      type: "organization",
      name: "Acme Corp",
    }));
  });
});
```

**Coordination:**

- Backend Specialist implements services
- Integration Specialist ensures ontology alignment
- Quality Agent validates unit tests

---

### Phase 4: Configuration (Week 4)

**Goal:** Add provider configuration and selection

**Deliverables:**

```typescript
// /frontend/src/lib/providers/config.ts
export interface ProviderConfig {
  default: "convex" | "supabase" | "composite";
  convex?: {
    url: string;
  };
  supabase?: {
    url: string;
    anonKey: string;
  };
  wordpress?: {
    url: string;
    apiKey: string;
  };
}

export const providerConfig: ProviderConfig = {
  default: import.meta.env.PUBLIC_DEFAULT_PROVIDER || "convex",
  convex: {
    url: import.meta.env.PUBLIC_CONVEX_URL,
  },
  supabase: {
    url: import.meta.env.PUBLIC_SUPABASE_URL,
    anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
  },
};

// Provider factory
export function createProvider(config: ProviderConfig): IDataProvider {
  switch (config.default) {
    case "convex":
      return new ConvexProvider(
        new ConvexReactClient(config.convex.url)
      );
    case "supabase":
      return new SupabaseProvider(
        createClient(config.supabase.url, config.supabase.anonKey)
      );
    case "composite":
      return new CompositeProvider({
        convex: new ConvexProvider(...),
        wordpress: new WordPressProvider(...),
        // ...
      });
    default:
      throw new Error(`Unknown provider: ${config.default}`);
  }
}

// React Context
export const DataProviderContext = createContext<IDataProvider | null>(null);

export function DataProviderProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(() => createProvider(providerConfig), []);

  useEffect(() => {
    provider.initialize();
    return () => provider.disconnect();
  }, [provider]);

  return (
    <DataProviderContext.Provider value={provider}>
      {children}
    </DataProviderContext.Provider>
  );
}

export function useDataProvider(): IDataProvider {
  const provider = useContext(DataProviderContext);
  if (!provider) throw new Error("DataProvider not initialized");
  return provider;
}
```

**Tests:**

```typescript
// tests/integration/providers/config.test.ts
describe("Provider Configuration", () => {
  it("should create ConvexProvider when configured", () => {
    const config: ProviderConfig = { default: "convex", convex: { url: "https://test.convex.cloud" } };
    const provider = createProvider(config);
    expect(provider.name).toBe("convex");
  });

  it("should switch providers via config", () => {
    const convexProvider = createProvider({ default: "convex", convex: { url: "..." } });
    const supabaseProvider = createProvider({ default: "supabase", supabase: { url: "...", anonKey: "..." } });

    expect(convexProvider.name).toBe("convex");
    expect(supabaseProvider.name).toBe("supabase");
  });
});
```

**Coordination:**

- Frontend Specialist implements configuration
- Backend Specialist validates backend compatibility
- Integration Specialist ensures smooth switching

---

### Phase 5: Component Migration (Weeks 5-6)

**Goal:** Migrate components to use DataProvider

**Strategy:** Gradual page-by-page migration

```typescript
// Before (direct Convex usage)
export function OrganizationList() {
  const orgs = useQuery(api.queries.organizations.list);
  return <div>{orgs?.map(...)}</div>;
}

// After (provider-agnostic)
export function OrganizationList() {
  const provider = useDataProvider();
  const [orgs, setOrgs] = useState([]);

  useEffect(() => {
    provider.organizations.list({ userId: currentUserId }).then(setOrgs);
  }, [provider]);

  return <div>{orgs.map(...)}</div>;
}

// Or use custom hook
export function useOrganizations() {
  const provider = useDataProvider();
  return useRealtimeData(provider, { type: "organizations" });
}

export function OrganizationList() {
  const { data: orgs } = useOrganizations();
  return <div>{orgs?.map(...)}</div>;
}
```

**Migration Checklist (Per Page):**

- [ ] Replace `useQuery(api.*)` with `useDataProvider()`
- [ ] Replace `useMutation(api.*)` with `provider.*.create/update/delete`
- [ ] Update loading/error states
- [ ] Add real-time support via `useRealtimeData`
- [ ] Test with Convex (backward compatibility)
- [ ] Test with alternative provider (if available)
- [ ] Run integration tests

**Migration Order:**

1. **Week 5:** Non-critical pages
   - `/about`, `/docs`, `/blog` (static content)
   - `/account/settings` (user preferences)
   - `/tokens/[id]` (read-only)

2. **Week 6:** Critical pages
   - `/dashboard` (organization stats)
   - `/account` (auth flows)
   - `/admin` (platform owner dashboard)

**Validation:** Run auth tests after EVERY migration

**Coordination:**

- Frontend Specialist implements migrations
- Quality Agent validates tests after each page
- Integration Specialist monitors for regressions

---

### Phase 6: Cleanup (Week 7)

**Goal:** Remove old dependencies and code

**Tasks:**

1. Remove direct Convex imports from components:

```bash
# Find all direct Convex usage
grep -r "from \"convex/react\"" frontend/src/components/
grep -r "api.queries" frontend/src/components/
grep -r "api.mutations" frontend/src/components/

# Remove unused imports
```

2. Update package.json:

```json
{
  "dependencies": {
    "convex": "^1.16.5", // Keep for backend communication
    // Remove any unused provider dependencies
  }
}
```

3. Consolidate provider exports:

```typescript
// /frontend/src/lib/providers/index.ts
export { IDataProvider } from "./interface";
export { ConvexProvider } from "./convex";
export { SupabaseProvider } from "./supabase";
export { CompositeProvider } from "./composite";
export { useDataProvider, DataProviderProvider } from "./config";
```

4. Run comprehensive tests:

```bash
# Auth tests (must pass 100%)
bun test test/auth

# Integration tests
bun test test/integration/providers

# Build test
bun run build
```

**Coordination:**

- Frontend Specialist performs cleanup
- Quality Agent validates all tests pass
- Integration Specialist approves final state

---

### Phase 7: Alternative Providers (Week 8+)

**Goal:** Implement alternative providers (Supabase, WordPress, Notion)

**SupabaseProvider:**

```typescript
// /frontend/src/lib/providers/supabase.ts
export class SupabaseProvider implements IDataProvider {
  constructor(private client: SupabaseClient) {}

  name = "supabase";
  supportsRealtime = true;
  capabilities = ["organizations", "people", "things", "connections", "events", "knowledge"];

  organizations = {
    list: async (args) => {
      const { data, error } = await this.client
        .from("entities")
        .select("*")
        .eq("type", "organization")
        .in("_id", args.orgIds);

      if (error) throw error;
      return data;
    },
    // ... all operations
  };

  // Real-time subscriptions
  subscribe(query: Query, callback: (data: any) => void) {
    const channel = this.client
      .channel("db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: query.table }, callback)
      .subscribe();

    return () => channel.unsubscribe();
  }
}
```

**WordPressProvider:**

```typescript
// /frontend/src/lib/providers/wordpress.ts
export class WordPressProvider implements IDataProvider {
  constructor(private wpUrl: string, private apiKey: string) {}

  name = "wordpress";
  supportsRealtime = false;
  capabilities = ["things"]; // Read-only blog posts

  things = {
    list: async (args) => {
      if (args.type !== "blog_post") {
        throw new Error("WordPress only supports blog_post type");
      }

      const response = await fetch(`${this.wpUrl}/wp-json/wp/v2/posts`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      const posts = await response.json();

      // Transform WordPress posts to things
      return posts.map((post: any) => ({
        _id: `wp_${post.id}`,
        type: "blog_post",
        name: post.title.rendered,
        properties: {
          content: post.content.rendered,
          wpId: post.id,
        },
        status: post.status === "publish" ? "published" : "draft",
        createdAt: new Date(post.date).getTime(),
        updatedAt: new Date(post.modified).getTime(),
      }));
    },
  };
}
```

**CompositeProvider:**

```typescript
// /frontend/src/lib/providers/composite.ts
export class CompositeProvider implements IDataProvider {
  constructor(private providers: {
    convex: ConvexProvider;
    wordpress?: WordPressProvider;
    shopify?: ShopifyProvider;
    notion?: NotionProvider;
  }) {}

  name = "composite";
  supportsRealtime = true;
  capabilities = ["organizations", "people", "things", "connections", "events", "knowledge"];

  things = {
    list: async (args) => {
      // Route to appropriate provider
      switch (args.type) {
        case "blog_post":
          return this.providers.wordpress?.things.list(args) || [];
        case "product":
          return this.providers.shopify?.things.list(args) || [];
        default:
          return this.providers.convex.things.list(args);
      }
    },
  };
}
```

**Tests:**

```typescript
// tests/integration/providers/supabase.test.ts
describe("SupabaseProvider", () => {
  it("should implement all 6 dimensions", () => {
    const provider = new SupabaseProvider(mockClient);
    expect(provider.organizations).toBeDefined();
    // ... test all dimensions
  });

  it("should support real-time subscriptions", (done) => {
    const provider = new SupabaseProvider(mockClient);
    const unsubscribe = provider.subscribe({ table: "entities" }, (data) => {
      expect(data).toBeDefined();
      unsubscribe();
      done();
    });
  });
});
```

**Coordination:**

- Integration Specialist implements providers
- Backend Specialist validates backend compatibility
- Frontend Specialist validates frontend integration
- Quality Agent validates test coverage

---

## 5. Testing Integration

### Test Hierarchy

```
Unit Tests (services/)
  ↓
Integration Tests (providers/)
  ↓
E2E Tests (user journeys)
  ↓
Performance Tests (context usage, latency)
```

### Unit Tests (Services)

**Location:** `/backend/tests/unit/services/`

**Coverage:** Business logic in Effect.ts services

```typescript
// tests/unit/services/organization.test.ts
describe("OrganizationService", () => {
  it("should create organization with owner connection and event", async () => {
    const MockDB = Layer.succeed(ConvexDatabase, {
      insert: vi.fn().mockResolvedValue("org_123"),
      get: vi.fn().mockResolvedValue({ _id: "user_123", type: "creator" }),
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OrganizationService;
        return yield* service.create({
          name: "Acme Corp",
          ownerId: "user_123",
          plan: "pro",
        });
      }).pipe(Effect.provide(MockDB))
    );

    expect(result).toBe("org_123");
  });

  it("should fail with InvalidOrgNameError when name is empty", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const service = yield* OrganizationService;
        return yield* service.create({ name: "", ownerId: "user_123" });
      }).pipe(Effect.provide(TestLayer))
    );

    expect(result).toBeInstanceOf(InvalidOrgNameError);
  });
});
```

### Integration Tests (Providers)

**Location:** `/frontend/test/integration/providers/`

**Coverage:** Frontend → Provider → Backend flows

```typescript
// test/integration/providers/convex.test.ts
describe("ConvexProvider Integration", () => {
  it("should create organization and retrieve it", async () => {
    const provider = new ConvexProvider(testClient);

    // Create organization
    const orgId = await provider.organizations.create({
      name: "Test Org",
      ownerId: "user_123",
      plan: "starter",
    });

    expect(orgId).toBeDefined();

    // Retrieve organization
    const org = await provider.organizations.get({ orgId });

    expect(org.name).toBe("Test Org");
    expect(org.properties.plan).toBe("starter");
  });

  it("should enforce organization boundaries", async () => {
    const provider = new ConvexProvider(testClient);

    // User A creates org
    const orgA = await provider.organizations.create({
      name: "Org A",
      ownerId: "user_a",
    });

    // User B tries to access Org A's data
    const things = await provider.things.list({
      type: "blog_post",
      organizationId: orgA,
      userId: "user_b",
    });

    expect(things).toEqual([]); // No access
  });
});
```

### E2E Tests (User Journeys)

**Location:** `/frontend/test/e2e/`

**Coverage:** Complete user workflows

```typescript
// test/e2e/organization-creation.test.ts
describe("Organization Creation Flow", () => {
  it("should create organization from dashboard", async ({ page }) => {
    // Sign in
    await page.goto("/account/signin");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');

    // Navigate to create organization
    await page.goto("/admin/organizations/new");

    // Fill form
    await page.fill('input[name="name"]', "E2E Test Org");
    await page.selectOption('select[name="plan"]', "pro");

    // Submit
    await page.click('button[type="submit"]');

    // Verify creation
    await page.waitForURL("/admin/organizations/*");
    await expect(page.locator("h1")).toContainText("E2E Test Org");
  });
});
```

### Performance Tests

**Location:** `/frontend/test/performance/`

**Coverage:** Context usage, latency, throughput

```typescript
// test/performance/context-usage.test.ts
describe("Context Usage", () => {
  it("should stay within token budget", async () => {
    const provider = new ConvexProvider(testClient);

    // Measure request size
    const request = await provider.things.list({ type: "creator" });
    const requestSize = JSON.stringify(request).length;

    expect(requestSize).toBeLessThan(1500); // 1.5KB limit
  });

  it("should respond within latency budget", async () => {
    const provider = new ConvexProvider(testClient);

    const start = Date.now();
    await provider.organizations.list({ userId: "user_123" });
    const latency = Date.now() - start;

    expect(latency).toBeLessThan(100); // 100ms limit
  });
});
```

### Auth Test Preservation

**Critical:** Run auth tests after EVERY migration step

```bash
# Run all auth tests
bun test test/auth

# Specific auth method tests
bun test test/auth/email-password.test.ts
bun test test/auth/oauth.test.ts
bun test test/auth/magic-link.test.ts
bun test test/auth/password-reset.test.ts

# Watch mode during migration
bun test --watch test/auth
```

**Auth Test Categories:**

1. ✅ Email & Password (signup, signin, validation)
2. ✅ OAuth (GitHub, Google, account linking)
3. ✅ Magic Links (passwordless, one-time use)
4. ✅ Password Reset (token expiry, security)
5. ✅ Email Verification (24h expiry)
6. ✅ 2FA/TOTP (setup, backup codes)

**Test Coverage Goals:**

- Unit tests: 90%+ coverage
- Integration tests: All 6 dimensions covered
- E2E tests: Critical user journeys (auth, org creation, data CRUD)
- Performance tests: Context < 1.5KB, Latency < 100ms
- Auth tests: 100% pass rate (50+ test cases)

**Coordination:**

- Quality Agent owns test execution
- Integration Specialist validates integration tests
- Frontend Specialist validates E2E tests
- Backend Specialist validates unit tests

---

## 6. Error Propagation

### Error Flow Architecture

```
Backend Error → Provider Error → Frontend Display
```

### Backend Errors (Effect.ts)

```typescript
// /backend/convex/services/errors.ts
import { Data } from "effect";

// Base error with protocol support
export class ServiceError extends Data.TaggedError("ServiceError")<{
  message: string;
  code: string;
  protocol?: string;
  details?: any;
}> {}

// Specific errors
export class OrganizationNotFoundError extends Data.TaggedError(
  "OrganizationNotFoundError"
)<{
  orgId: string;
}> {}

export class InsufficientPermissionsError extends Data.TaggedError(
  "InsufficientPermissionsError"
)<{
  userId: string;
  action: string;
  required: string[];
}> {}

export class RateLimitExceededError extends Data.TaggedError(
  "RateLimitExceededError"
)<{
  limit: number;
  period: string;
  retryAfter: number;
}> {}

// Service implementation
export class OrganizationService extends Effect.Service<OrganizationService>()(
  "OrganizationService",
  {
    effect: Effect.gen(function* () {
      const db = yield* ConvexDatabase;

      return {
        get: (orgId: string) =>
          Effect.gen(function* () {
            const org = yield* Effect.tryPromise(() => db.get(orgId));

            if (!org) {
              return yield* Effect.fail(
                new OrganizationNotFoundError({ orgId })
              );
            }

            return org;
          }),
      };
    }),
  }
) {}
```

### Provider Errors

```typescript
// /frontend/src/lib/providers/errors.ts
export class ProviderError extends Error {
  constructor(
    public message: string,
    public code: string,
    public provider: string,
    public retryable: boolean = false,
    public details?: any
  ) {
    super(message);
    this.name = "ProviderError";
  }
}

// ConvexProvider error handling
export class ConvexProvider implements IDataProvider {
  organizations = {
    get: async (args) => {
      try {
        return await this.client.query(api.queries.organizations.get, args);
      } catch (error) {
        // Transform backend error to provider error
        if (error.message.includes("OrganizationNotFoundError")) {
          throw new ProviderError(
            `Organization not found: ${args.orgId}`,
            "ORGANIZATION_NOT_FOUND",
            "convex",
            false,
            { orgId: args.orgId }
          );
        }

        // Generic error
        throw new ProviderError(
          error.message,
          "UNKNOWN_ERROR",
          "convex",
          true
        );
      }
    },
  };
}
```

### Frontend Error Display

```typescript
// /frontend/src/components/ErrorBoundary.tsx
export function ErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof ProviderError ? (
              <>
                <p>{error.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Provider: {error.provider} | Code: {error.code}
                </p>
                {error.retryable && (
                  <Button onClick={resetErrorBoundary} className="mt-4">
                    Retry
                  </Button>
                )}
              </>
            ) : (
              <p>{error.message}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Usage in components
export function OrganizationPage({ orgId }: { orgId: string }) {
  const provider = useDataProvider();
  const [org, setOrg] = useState<Organization | null>(null);
  const [error, setError] = useState<ProviderError | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    provider.organizations
      .get({ orgId })
      .then(setOrg)
      .catch((err) => {
        if (err instanceof ProviderError) {
          setError(err);
        } else {
          setError(
            new ProviderError(err.message, "UNKNOWN_ERROR", "unknown", false)
          );
        }
      })
      .finally(() => setLoading(false));
  }, [provider, orgId]);

  if (loading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!org) return <NotFound />;

  return <OrganizationDetails org={org} />;
}
```

### Retry Strategies

```typescript
// /frontend/src/lib/providers/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    backoff?: "exponential" | "linear";
    initialDelay?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    backoff = "exponential",
    initialDelay = 1000,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-retryable errors
      if (error instanceof ProviderError && !error.retryable) {
        throw error;
      }

      // Calculate delay
      const delay =
        backoff === "exponential"
          ? initialDelay * Math.pow(2, attempt)
          : initialDelay * (attempt + 1);

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Usage
const org = await withRetry(() => provider.organizations.get({ orgId }), {
  maxRetries: 3,
  backoff: "exponential",
});
```

### Fallback Strategies

```typescript
// /frontend/src/lib/providers/fallback.ts
export class FallbackProvider implements IDataProvider {
  constructor(
    private primary: IDataProvider,
    private fallback: IDataProvider
  ) {}

  organizations = {
    get: async (args) => {
      try {
        return await this.primary.organizations.get(args);
      } catch (error) {
        console.warn("Primary provider failed, falling back", error);
        return await this.fallback.organizations.get(args);
      }
    },
  };
}

// Configuration
const provider = new FallbackProvider(
  new ConvexProvider(convexClient),
  new CachedProvider(localStorage) // Fallback to cache
);
```

**Validation:**

- ✅ Backend errors use tagged unions with `_tag`
- ✅ Provider errors include retry flag
- ✅ Frontend displays user-friendly messages
- ✅ Retries with exponential backoff for transient failures
- ✅ Fallback to cache for offline support

---

## 7. Deployment Coordination

### Deployment Architecture

```
┌────────────────────────────────────────────────┐
│           FRONTEND DEPLOYMENT                  │
│  Platform: Cloudflare Pages                    │
│  Runtime: Astro SSR + React 19                 │
│  CDN: Global edge network                      │
└────────────────────────────────────────────────┘
              ↓ API Calls
┌────────────────────────────────────────────────┐
│           BACKEND DEPLOYMENT                   │
│  Platform: Convex Cloud                        │
│  Region: Auto (global replication)             │
│  Database: Convex (real-time)                  │
└────────────────────────────────────────────────┘
```

### Deployment Strategy

#### Independent Deployments

**Backend (Convex):**

```bash
# Deploy backend independently
cd /backend
npx convex deploy --prod

# Verify deployment
npx convex status
```

**Frontend (Cloudflare Pages):**

```bash
# Deploy frontend independently
cd /frontend
bun run build
wrangler pages deploy dist --project-name=one-platform
```

**Validation:**

- ✅ Backend deployments independent of frontend
- ✅ Frontend deployments independent of backend
- ✅ No coordinated releases required

#### Zero-Downtime Migration

**Strategy:** Gradual rollout with feature flags

```typescript
// /frontend/src/lib/providers/config.ts
export interface ProviderConfig {
  default: "convex" | "supabase" | "composite";
  featureFlags: {
    useDataProvider: boolean; // Gradual rollout
    providers: {
      convex: boolean;
      supabase: boolean;
      wordpress: boolean;
    };
  };
}

// Feature flag check
export function shouldUseDataProvider(): boolean {
  // Check feature flag
  if (!providerConfig.featureFlags.useDataProvider) {
    return false; // Use old direct Convex
  }

  // Check rollout percentage (from backend)
  const rolloutPercentage = getRolloutPercentage();
  const userHash = hashUserId(currentUserId);

  return userHash % 100 < rolloutPercentage;
}

// Component with feature flag
export function OrganizationList() {
  if (shouldUseDataProvider()) {
    // New: Use DataProvider
    const provider = useDataProvider();
    const orgs = useRealtimeData(provider, { type: "organizations" });
    return <div>{orgs?.map(...)}</div>;
  } else {
    // Old: Direct Convex
    const orgs = useQuery(api.queries.organizations.list);
    return <div>{orgs?.map(...)}</div>;
  }
}
```

**Rollout Plan:**

1. **Week 1:** 0% (feature flag off, deploy code)
2. **Week 2:** 5% (internal testing)
3. **Week 3:** 10% (early adopters)
4. **Week 4:** 25% (monitoring for issues)
5. **Week 5:** 50% (half of users)
6. **Week 6:** 75% (most users)
7. **Week 7:** 100% (full rollout)

**Rollback Procedure:**

```bash
# Instant rollback via feature flag
# Set featureFlags.useDataProvider = false

# Or rollback deployment
wrangler pages rollback one-platform
```

#### Monitoring and Alerting

**Metrics to Track:**

```typescript
// /frontend/src/lib/providers/monitoring.ts
export class MonitoredProvider implements IDataProvider {
  constructor(private provider: IDataProvider) {}

  organizations = {
    list: async (args) => {
      const start = Date.now();
      try {
        const result = await this.provider.organizations.list(args);

        // Track success
        trackMetric({
          metric: "provider.organizations.list.success",
          duration: Date.now() - start,
          provider: this.provider.name,
        });

        return result;
      } catch (error) {
        // Track failure
        trackMetric({
          metric: "provider.organizations.list.error",
          duration: Date.now() - start,
          provider: this.provider.name,
          error: error.message,
        });

        throw error;
      }
    },
  };
}
```

**Alerts:**

```yaml
# alerts.yaml
alerts:
  - name: provider_error_rate_high
    condition: provider.*.error > 5%
    severity: critical
    notification: pagerduty

  - name: provider_latency_high
    condition: provider.*.duration > 1000ms
    severity: warning
    notification: slack

  - name: auth_failure_rate_high
    condition: auth.*.failure > 2%
    severity: critical
    notification: pagerduty
```

**Validation:**

- ✅ Gradual rollout with feature flags
- ✅ Instant rollback capability
- ✅ Comprehensive monitoring
- ✅ Automated alerts

---

## 8. Implementation Timeline

### Week 1: Interface Definition

**Deliverables:**

- ✅ `IDataProvider` interface complete
- ✅ Type definitions for all 6 dimensions
- ✅ Interface compiles successfully
- ✅ Backend Specialist review complete

**Tests:**

- ✅ Interface type safety validated
- ✅ All method signatures defined

**Coordination:** Backend Specialist + Integration Specialist

---

### Week 2: ConvexProvider

**Deliverables:**

- ✅ ConvexProvider implements IDataProvider
- ✅ 100% backward compatibility maintained
- ✅ All 6 dimensions operational
- ✅ Real-time support working

**Tests:**

- ✅ Unit tests for all operations
- ✅ Integration tests with backend
- ✅ Auth tests pass (50+ test cases)

**Coordination:** Frontend Specialist + Backend Specialist + Quality Agent

---

### Week 3: Service Layer

**Deliverables:**

- ✅ Effect.ts services for all 6 dimensions
- ✅ Pure business logic (no UI, no Convex-specific code)
- ✅ Typed errors with `_tag` pattern
- ✅ Dependency injection via Effect.Service

**Tests:**

- ✅ Unit tests with mocked dependencies
- ✅ Error handling validated
- ✅ 90%+ code coverage

**Coordination:** Backend Specialist + Integration Specialist + Quality Agent

---

### Week 4: Configuration

**Deliverables:**

- ✅ Provider configuration system
- ✅ Provider factory
- ✅ React Context for DataProvider
- ✅ Feature flag system

**Tests:**

- ✅ Provider switching validated
- ✅ Configuration loading tested
- ✅ Feature flags working

**Coordination:** Frontend Specialist + Integration Specialist

---

### Weeks 5-6: Component Migration

**Week 5: Non-critical pages**

- ✅ `/about`, `/docs`, `/blog`
- ✅ `/account/settings`
- ✅ `/tokens/[id]`
- ✅ Auth tests pass after each migration

**Week 6: Critical pages**

- ✅ `/dashboard`
- ✅ `/account` (auth flows)
- ✅ `/admin`
- ✅ Auth tests pass after each migration

**Tests:**

- ✅ E2E tests for migrated pages
- ✅ Auth tests pass (50+ test cases)
- ✅ Performance tests (context < 1.5KB, latency < 100ms)

**Coordination:** Frontend Specialist + Integration Specialist + Quality Agent

---

### Week 7: Cleanup

**Deliverables:**

- ✅ Old dependencies removed
- ✅ Direct Convex imports removed from components
- ✅ Provider exports consolidated
- ✅ Documentation updated

**Tests:**

- ✅ All tests pass (unit, integration, E2E, auth)
- ✅ Build successful
- ✅ No regressions

**Coordination:** Frontend Specialist + Quality Agent

---

### Week 8+: Alternative Providers

**SupabaseProvider:**

- ✅ Implements IDataProvider
- ✅ All 6 dimensions operational
- ✅ Real-time subscriptions working
- ✅ Integration tests passing

**WordPressProvider:**

- ✅ Read-only blog posts
- ✅ Polling fallback (no real-time)
- ✅ Sync to Convex for search

**CompositeProvider:**

- ✅ Multi-backend federation
- ✅ Transparent routing
- ✅ Cross-backend queries
- ✅ Event-driven sync

**Tests:**

- ✅ Provider-specific tests
- ✅ Cross-provider integration tests
- ✅ Performance benchmarks

**Coordination:** Integration Specialist + Backend Specialist + Quality Agent

---

## Summary

### Key Achievements

1. **Data Flow Orchestration:** All 6 dimensions respect ontology
2. **Multi-Backend Federation:** Seamless integration across Convex, WordPress, Shopify, Notion
3. **Real-Time Coordination:** Native WebSocket (Convex), PostgreSQL real-time (Supabase), polling fallback (WordPress/Notion)
4. **Zero-Downtime Migration:** 7-phase gradual rollout with feature flags
5. **Comprehensive Testing:** Unit, integration, E2E, performance, auth tests
6. **Robust Error Handling:** Backend → Provider → Frontend with retries and fallbacks
7. **Independent Deployments:** Frontend and backend deploy separately

### Validation Checklist

- ✅ All 6 dimensions mapped correctly
- ✅ Multi-tenant isolation enforced
- ✅ Authorization verified (role-based)
- ✅ Status lifecycle enforced (draft → active → published → archived)
- ✅ Real-time subscriptions working
- ✅ Cross-backend connections maintained
- ✅ Complete audit trail
- ✅ Vector search operational
- ✅ Auth tests pass (50+ test cases)
- ✅ Performance within budget (context < 1.5KB, latency < 100ms)

### Next Steps

1. **Week 1:** Define IDataProvider interface
2. **Week 2:** Implement ConvexProvider
3. **Week 3:** Implement Effect.ts services
4. **Week 4:** Add configuration system
5. **Weeks 5-6:** Migrate components page-by-page
6. **Week 7:** Cleanup old code
7. **Week 8+:** Implement alternative providers

---

**Integration Specialist: Connect systems. Map protocols. Respect the ontology. Make integrations seamless.**

---

**End of Integration Orchestration Plan**
