# Connecting ONE to Any Backend

**Universal backend adapter pattern for ONE platform**

---

## Executive Summary

ONE's frontend is **100% backend-agnostic**. This guide shows how to connect to **any backend** (databases, APIs, CMS platforms, SaaS tools) by implementing the universal `DataProvider` interface.

**Key Principle:** Frontend talks to `DataProvider` interface. You implement `DataProvider` for your backend. Done.

**Supported Backends:**
- ✅ **Databases**: Convex, Supabase, Neon, PlanetScale, MongoDB, PostgreSQL, MySQL
- ✅ **CMS**: WordPress, Strapi, Contentful, Sanity, Ghost, Prismic
- ✅ **Headless**: Notion, Airtable, Google Sheets, Excel Online
- ✅ **SaaS APIs**: Salesforce, HubSpot, Shopify, Stripe
- ✅ **Custom**: Your own REST/GraphQL API

**What This Achieves:**
- Change backend with ONE line of code
- Use multiple backends simultaneously
- Mix backends (WordPress + Supabase + Custom API)
- No vendor lock-in

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [DataProvider Interface](#dataprovider-interface)
3. [Implementation Patterns](#implementation-patterns)
4. [Database Backends](#database-backends)
5. [CMS Backends](#cms-backends)
6. [SaaS API Backends](#saas-api-backends)
7. [Custom Backends](#custom-backends)
8. [Multi-Backend Setup](#multi-backend-setup)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Architecture Overview

### The Universal Pattern

```
┌────────────────────────────────────────────────┐
│         ONE Frontend (Astro + React)           │
│  ✅ Renders UI                                 │
│  ✅ Calls DataProvider interface               │
│  ✅ Backend-agnostic components                │
│  ❌ NO backend-specific code                   │
└────────────────┬───────────────────────────────┘
                 │ DataProvider Interface
                 │ (Universal API = ONE Ontology)
                 ↓
┌────────────────────────────────────────────────┐
│           Provider Layer (You Implement)       │
│  - things.get(id)                              │
│  - things.list(type)                           │
│  - things.create(data)                         │
│  - connections.create(from, to)                │
│  - events.log(event)                           │
│  - knowledge.search(query)                     │
└────────────────┬───────────────────────────────┘
                 │ Backend-Specific Implementation
     ┌───────────┼───────────┬───────────┬───────────┐
     ↓           ↓           ↓           ↓           ↓
┌─────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Convex  │ │Supabase │ │WordPress │ │ Notion   │ │  Custom  │
│         │ │         │ │          │ │          │ │   API    │
└─────────┘ └─────────┘ └──────────┘ └──────────┘ └──────────┘
```

**Key Insight:** Frontend never imports backend-specific code. Only imports `DataProvider` interface.

---

## DataProvider Interface

### The Contract

```typescript
// frontend/src/providers/DataProvider.ts
import { Effect } from 'effect'
import { ThingType, ConnectionType, EventType } from '@/ontology/types'

// Error types (universal)
export class ThingNotFoundError {
  readonly _tag = 'ThingNotFoundError'
  constructor(readonly thingId: string) {}
}

export class UnauthorizedError {
  readonly _tag = 'UnauthorizedError'
}

export class ConnectionCreateError {
  readonly _tag = 'ConnectionCreateError'
  constructor(readonly reason: string) {}
}

// Thing (universal data structure)
export interface Thing {
  _id: string
  type: ThingType
  name: string
  properties: Record<string, any>
  status: 'active' | 'inactive' | 'archived'
  createdAt: number
  updatedAt: number
  createdBy?: string
  organizationId?: string
}

// Connection (universal relationship)
export interface Connection {
  _id: string
  fromThingId: string
  toThingId: string
  relationshipType: ConnectionType
  metadata?: Record<string, any>
  createdAt: number
}

// Event (universal activity)
export interface Event {
  _id: string
  type: EventType
  actorId: string
  targetId?: string
  metadata?: Record<string, any>
  timestamp: number
}

// Knowledge (universal search result)
export interface KnowledgeMatch {
  thingId: string
  score: number
  text: string
  metadata?: Record<string, any>
}

// ============================================
// DataProvider Interface
// ============================================
export interface DataProvider {
  // Things operations
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError | UnauthorizedError>

    list: (params: {
      type: ThingType
      organizationId?: string
      filters?: Record<string, any>
      limit?: number
      offset?: number
    }) => Effect.Effect<Thing[], Error>

    create: (input: {
      type: ThingType
      name: string
      properties: Record<string, any>
      organizationId?: string
    }) => Effect.Effect<string, ConnectionCreateError>

    update: (
      id: string,
      updates: Partial<Thing>
    ) => Effect.Effect<void, Error>

    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Connections operations
  connections: {
    create: (input: {
      fromThingId: string
      toThingId: string
      relationshipType: ConnectionType
      metadata?: Record<string, any>
    }) => Effect.Effect<string, ConnectionCreateError>

    getRelated: (params: {
      thingId: string
      relationshipType: ConnectionType
      direction: 'from' | 'to' | 'both'
    }) => Effect.Effect<Thing[], Error>

    getCount: (
      thingId: string,
      relationshipType: ConnectionType
    ) => Effect.Effect<number, Error>

    delete: (id: string) => Effect.Effect<void, Error>
  }

  // Events operations
  events: {
    log: (event: {
      type: EventType
      actorId: string
      targetId?: string
      metadata?: Record<string, any>
    }) => Effect.Effect<void, Error>

    query: (params: {
      type?: EventType
      actorId?: string
      targetId?: string
      from?: Date
      to?: Date
    }) => Effect.Effect<Event[], Error>
  }

  // Knowledge operations
  knowledge: {
    embed: (params: {
      text: string
      sourceThingId: string
      labels?: string[]
    }) => Effect.Effect<string, Error>

    search: (
      query: string,
      limit?: number
    ) => Effect.Effect<KnowledgeMatch[], Error>
  }

  // Optional: Real-time subscriptions
  subscriptions?: {
    watchThing: (id: string) => Effect.Effect<Observable<Thing>, Error>
    watchList: (type: ThingType) => Effect.Effect<Observable<Thing[]>, Error>
  }
}
```

**That's it!** Implement this interface for ANY backend.

---

## Implementation Patterns

### Pattern 1: REST API Backend

```typescript
// frontend/src/providers/rest/RestProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider, Thing, ThingNotFoundError } from '../DataProvider'

export class RestProvider implements DataProvider {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/things/${id}`, {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              }
            }),
          catch: (error) => new Error(String(error))
        })

        if (!response.ok) {
          if (response.status === 404) {
            return yield* Effect.fail(new ThingNotFoundError(id))
          }
          return yield* Effect.fail(new Error(`HTTP ${response.status}`))
        }

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform API response → ONE Thing
        return this.transformToThing(data)
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const query = new URLSearchParams({
          type: params.type,
          limit: String(params.limit || 10),
          ...(params.organizationId && { org: params.organizationId })
        })

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/things?${query}`, {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`
              }
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return data.items.map((item: any) => this.transformToThing(item))
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/things`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                type: input.type,
                name: input.name,
                properties: input.properties,
                organizationId: input.organizationId
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return data.id
      }),

    update: (id, updates) =>
      Effect.gen(this, function* () {
        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/things/${id}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updates)
            }),
          catch: (error) => new Error(String(error))
        })
      }),

    delete: (id) =>
      Effect.gen(this, function* () {
        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/things/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${this.apiKey}`
              }
            }),
          catch: (error) => new Error(String(error))
        })
      })
  }

  connections = {
    // Similar REST API implementations
    create: (input) => { /* POST /connections */ },
    getRelated: (params) => { /* GET /things/:id/related */ },
    getCount: (thingId, type) => { /* GET /things/:id/connections/count */ },
    delete: (id) => { /* DELETE /connections/:id */ }
  }

  events = {
    log: (event) => { /* POST /events */ },
    query: (params) => { /* GET /events */ }
  }

  knowledge = {
    embed: (params) => { /* POST /knowledge/embed */ },
    search: (query, limit) => { /* GET /knowledge/search */ }
  }

  // Helper: Transform API data → ONE Thing
  private transformToThing(data: any): Thing {
    return {
      _id: data.id,
      type: data.type,
      name: data.name || data.title,
      properties: data.attributes || data.properties || {},
      status: data.status || 'active',
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
      createdBy: data.created_by,
      organizationId: data.organization_id
    }
  }
}

// Factory function
export function restProvider(config: { url: string; apiKey: string }) {
  return Layer.succeed(DataProvider, new RestProvider(config.url, config.apiKey))
}
```

### Pattern 2: GraphQL Backend

```typescript
// frontend/src/providers/graphql/GraphQLProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider, Thing } from '../DataProvider'

export class GraphQLProvider implements DataProvider {
  constructor(
    private endpoint: string,
    private headers: Record<string, string>
  ) {}

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const query = `
          query GetThing($id: ID!) {
            thing(id: $id) {
              id
              type
              name
              properties
              status
              createdAt
              updatedAt
            }
          }
        `

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(this.endpoint, {
              method: 'POST',
              headers: {
                ...this.headers,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                query,
                variables: { id }
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        if (data.errors) {
          return yield* Effect.fail(new Error(data.errors[0].message))
        }

        return this.transformToThing(data.data.thing)
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const query = `
          query ListThings($type: String!, $limit: Int, $orgId: ID) {
            things(type: $type, limit: $limit, organizationId: $orgId) {
              nodes {
                id
                type
                name
                properties
                status
                createdAt
                updatedAt
              }
            }
          }
        `

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(this.endpoint, {
              method: 'POST',
              headers: {
                ...this.headers,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                query,
                variables: {
                  type: params.type,
                  limit: params.limit || 10,
                  orgId: params.organizationId
                }
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return data.data.things.nodes.map((node: any) =>
          this.transformToThing(node)
        )
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const mutation = `
          mutation CreateThing($input: CreateThingInput!) {
            createThing(input: $input) {
              id
            }
          }
        `

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(this.endpoint, {
              method: 'POST',
              headers: {
                ...this.headers,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                query: mutation,
                variables: {
                  input: {
                    type: input.type,
                    name: input.name,
                    properties: input.properties,
                    organizationId: input.organizationId
                  }
                }
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return data.data.createThing.id
      }),

    update: (id, updates) => { /* Similar mutation */ },
    delete: (id) => { /* Similar mutation */ }
  }

  // connections, events, knowledge...

  private transformToThing(data: any): Thing {
    return {
      _id: data.id,
      type: data.type,
      name: data.name,
      properties: JSON.parse(data.properties || '{}'),
      status: data.status,
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime()
    }
  }
}

// Factory
export function graphqlProvider(config: {
  endpoint: string
  headers: Record<string, string>
}) {
  return Layer.succeed(
    DataProvider,
    new GraphQLProvider(config.endpoint, config.headers)
  )
}
```

### Pattern 3: SQL Database (Direct)

```typescript
// frontend/src/providers/postgres/PostgresProvider.ts
import { Effect, Layer } from 'effect'
import { Pool } from 'pg'
import { DataProvider, Thing } from '../DataProvider'

export class PostgresProvider implements DataProvider {
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString })
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            this.pool.query('SELECT * FROM things WHERE id = $1', [id]),
          catch: (error) => new Error(String(error))
        })

        if (result.rows.length === 0) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }

        return this.rowToThing(result.rows[0])
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const query = `
          SELECT * FROM things
          WHERE type = $1
          ${params.organizationId ? 'AND organization_id = $2' : ''}
          LIMIT $${params.organizationId ? '3' : '2'}
        `

        const values = [
          params.type,
          ...(params.organizationId ? [params.organizationId] : []),
          params.limit || 10
        ]

        const result = yield* Effect.tryPromise({
          try: () => this.pool.query(query, values),
          catch: (error) => new Error(String(error))
        })

        return result.rows.map(row => this.rowToThing(row))
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            this.pool.query(
              `INSERT INTO things (type, name, properties, organization_id, status, created_at, updated_at)
               VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
               RETURNING id`,
              [
                input.type,
                input.name,
                JSON.stringify(input.properties),
                input.organizationId,
                'active'
              ]
            ),
          catch: (error) => new Error(String(error))
        })

        return result.rows[0].id
      }),

    update: (id, updates) => { /* UPDATE query */ },
    delete: (id) => { /* DELETE query */ }
  }

  connections = {
    create: (input) =>
      Effect.gen(this, function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            this.pool.query(
              `INSERT INTO connections (from_thing_id, to_thing_id, relationship_type, metadata, created_at)
               VALUES ($1, $2, $3, $4, NOW())
               RETURNING id`,
              [
                input.fromThingId,
                input.toThingId,
                input.relationshipType,
                JSON.stringify(input.metadata || {})
              ]
            ),
          catch: (error) => new Error(String(error))
        })

        return result.rows[0].id
      }),

    getRelated: (params) => { /* JOIN query */ },
    getCount: (thingId, type) => { /* COUNT query */ },
    delete: (id) => { /* DELETE query */ }
  }

  events = {
    log: (event) => { /* INSERT INTO events */ },
    query: (params) => { /* SELECT FROM events */ }
  }

  knowledge = {
    embed: (params) => { /* Store embedding, use pgvector */ },
    search: (query, limit) => { /* Vector similarity search */ }
  }

  private rowToThing(row: any): Thing {
    return {
      _id: row.id,
      type: row.type,
      name: row.name,
      properties: JSON.parse(row.properties || '{}'),
      status: row.status,
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
      organizationId: row.organization_id
    }
  }
}

// Factory
export function postgresProvider(config: { connectionString: string }) {
  return Layer.succeed(
    DataProvider,
    new PostgresProvider(config.connectionString)
  )
}
```

---

## Database Backends

### Supabase

```typescript
// frontend/src/providers/supabase/SupabaseProvider.ts
import { createClient } from '@supabase/supabase-js'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class SupabaseProvider implements DataProvider {
  private supabase

  constructor(url: string, anonKey: string) {
    this.supabase = createClient(url, anonKey)
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const { data, error } = yield* Effect.tryPromise({
          try: () =>
            this.supabase.from('things').select('*').eq('id', id).single(),
          catch: (err) => new Error(String(err))
        })

        if (error) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }

        return this.transformToThing(data)
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        let query = this.supabase
          .from('things')
          .select('*')
          .eq('type', params.type)

        if (params.organizationId) {
          query = query.eq('organization_id', params.organizationId)
        }

        const { data, error } = yield* Effect.tryPromise({
          try: () => query.limit(params.limit || 10),
          catch: (err) => new Error(String(err))
        })

        if (error) {
          return yield* Effect.fail(new Error(error.message))
        }

        return data.map(row => this.transformToThing(row))
      }),

    // create, update, delete...
  }

  // ✅ Supabase supports real-time!
  subscriptions = {
    watchThing: (id: string) =>
      Effect.gen(this, function* () {
        // Supabase real-time subscription
        const channel = this.supabase
          .channel(`thing:${id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'things',
            filter: `id=eq.${id}`
          }, (payload) => {
            // Emit updates via Observable
          })

        yield* Effect.tryPromise({
          try: () => channel.subscribe(),
          catch: (err) => new Error(String(err))
        })

        // Return observable
      })
  }

  // ... rest of implementation
}

export function supabaseProvider(config: { url: string; anonKey: string }) {
  return Layer.succeed(
    DataProvider,
    new SupabaseProvider(config.url, config.anonKey)
  )
}
```

### Neon (Serverless Postgres)

```typescript
// frontend/src/providers/neon/NeonProvider.ts
import { neon } from '@neondatabase/serverless'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class NeonProvider implements DataProvider {
  private sql

  constructor(connectionString: string) {
    this.sql = neon(connectionString)
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const rows = yield* Effect.tryPromise({
          try: () => this.sql`SELECT * FROM things WHERE id = ${id}`,
          catch: (error) => new Error(String(error))
        })

        if (rows.length === 0) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }

        return this.transformToThing(rows[0])
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const rows = yield* Effect.tryPromise({
          try: () => this.sql`
            SELECT * FROM things
            WHERE type = ${params.type}
            ${params.organizationId ? this.sql`AND organization_id = ${params.organizationId}` : this.sql``}
            LIMIT ${params.limit || 10}
          `,
          catch: (error) => new Error(String(error))
        })

        return rows.map(row => this.transformToThing(row))
      }),

    // create, update, delete...
  }

  // ... rest of implementation
}

export function neonProvider(config: { connectionString: string }) {
  return Layer.succeed(DataProvider, new NeonProvider(config.connectionString))
}
```

### PlanetScale (MySQL)

```typescript
// frontend/src/providers/planetscale/PlanetScaleProvider.ts
import { connect } from '@planetscale/database'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class PlanetScaleProvider implements DataProvider {
  private db

  constructor(config: { host: string; username: string; password: string }) {
    this.db = connect({
      host: config.host,
      username: config.username,
      password: config.password
    })
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            this.db.execute('SELECT * FROM things WHERE id = ?', [id]),
          catch: (error) => new Error(String(error))
        })

        if (result.rows.length === 0) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }

        return this.transformToThing(result.rows[0])
      }),

    // ... rest of implementation
  }
}

export function planetscaleProvider(config: {
  host: string
  username: string
  password: string
}) {
  return Layer.succeed(
    DataProvider,
    new PlanetScaleProvider(config)
  )
}
```

### MongoDB

```typescript
// frontend/src/providers/mongo/MongoProvider.ts
import { MongoClient } from 'mongodb'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class MongoProvider implements DataProvider {
  private client: MongoClient
  private db

  constructor(connectionString: string, dbName: string) {
    this.client = new MongoClient(connectionString)
    this.db = this.client.db(dbName)
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const thing = yield* Effect.tryPromise({
          try: () =>
            this.db.collection('things').findOne({ _id: id }),
          catch: (error) => new Error(String(error))
        })

        if (!thing) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }

        return thing as Thing
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const filter: any = { type: params.type }

        if (params.organizationId) {
          filter.organizationId = params.organizationId
        }

        const things = yield* Effect.tryPromise({
          try: () =>
            this.db
              .collection('things')
              .find(filter)
              .limit(params.limit || 10)
              .toArray(),
          catch: (error) => new Error(String(error))
        })

        return things as Thing[]
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const result = yield* Effect.tryPromise({
          try: () =>
            this.db.collection('things').insertOne({
              type: input.type,
              name: input.name,
              properties: input.properties,
              organizationId: input.organizationId,
              status: 'active',
              createdAt: Date.now(),
              updatedAt: Date.now()
            }),
          catch: (error) => new Error(String(error))
        })

        return result.insertedId.toString()
      }),

    // update, delete...
  }

  // connections, events, knowledge...
}

export function mongoProvider(config: {
  connectionString: string
  dbName: string
}) {
  return Layer.succeed(
    DataProvider,
    new MongoProvider(config.connectionString, config.dbName)
  )
}
```

---

## CMS Backends

See detailed guides:
- **wordpress.md** - WordPress + WooCommerce backend
- **cms.md** - Strapi, Contentful, Sanity, Ghost, Prismic

Quick examples:

### Strapi

```typescript
// frontend/src/providers/strapi/StrapiProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class StrapiProvider implements DataProvider {
  constructor(private baseUrl: string, private apiKey: string) {}

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/api/${this.getCollectionName(type)}/${id}`, {
              headers: { 'Authorization': `Bearer ${this.apiKey}` }
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform Strapi data → ONE Thing
        return {
          _id: data.data.id.toString(),
          type: data.data.attributes.__component,
          name: data.data.attributes.title || data.data.attributes.name,
          properties: data.data.attributes,
          status: data.data.attributes.publishedAt ? 'active' : 'inactive',
          createdAt: new Date(data.data.attributes.createdAt).getTime(),
          updatedAt: new Date(data.data.attributes.updatedAt).getTime()
        }
      }),

    // ... rest
  }

  private getCollectionName(type: string): string {
    // Map ONE types → Strapi collections
    const mapping = {
      'post': 'articles',
      'course': 'courses',
      'product': 'products'
    }
    return mapping[type] || type + 's'
  }
}

export function strapiProvider(config: { url: string; apiKey: string }) {
  return Layer.succeed(DataProvider, new StrapiProvider(config.url, config.apiKey))
}
```

### Contentful

```typescript
// frontend/src/providers/contentful/ContentfulProvider.ts
import { createClient } from 'contentful'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class ContentfulProvider implements DataProvider {
  private client

  constructor(spaceId: string, accessToken: string) {
    this.client = createClient({
      space: spaceId,
      accessToken: accessToken
    })
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const entry = yield* Effect.tryPromise({
          try: () => this.client.getEntry(id),
          catch: (error) => new Error(String(error))
        })

        return {
          _id: entry.sys.id,
          type: entry.sys.contentType.sys.id,
          name: entry.fields.title || entry.fields.name,
          properties: entry.fields,
          status: 'active',
          createdAt: new Date(entry.sys.createdAt).getTime(),
          updatedAt: new Date(entry.sys.updatedAt).getTime()
        }
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const entries = yield* Effect.tryPromise({
          try: () =>
            this.client.getEntries({
              content_type: params.type,
              limit: params.limit || 10
            }),
          catch: (error) => new Error(String(error))
        })

        return entries.items.map(entry => ({
          _id: entry.sys.id,
          type: entry.sys.contentType.sys.id,
          name: entry.fields.title || entry.fields.name,
          properties: entry.fields,
          status: 'active',
          createdAt: new Date(entry.sys.createdAt).getTime(),
          updatedAt: new Date(entry.sys.updatedAt).getTime()
        }))
      }),

    // Contentful is read-only via API (use Management API for writes)
    create: () => Effect.fail(new Error('Use Contentful Management API')),
    update: () => Effect.fail(new Error('Use Contentful Management API')),
    delete: () => Effect.fail(new Error('Use Contentful Management API'))
  }

  // ... rest
}

export function contentfulProvider(config: {
  spaceId: string
  accessToken: string
}) {
  return Layer.succeed(
    DataProvider,
    new ContentfulProvider(config.spaceId, config.accessToken)
  )
}
```

---

## SaaS API Backends

### Notion

```typescript
// frontend/src/providers/notion/NotionProvider.ts
import { Client } from '@notionhq/client'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class NotionProvider implements DataProvider {
  private notion: Client

  constructor(apiKey: string, private databaseId: string) {
    this.notion = new Client({ auth: apiKey })
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const page = yield* Effect.tryPromise({
          try: () => this.notion.pages.retrieve({ page_id: id }),
          catch: (error) => new Error(String(error))
        })

        return {
          _id: page.id,
          type: 'document',
          name: (page.properties.Name as any).title[0]?.plain_text || '',
          properties: page.properties,
          status: 'active',
          createdAt: new Date(page.created_time).getTime(),
          updatedAt: new Date(page.last_edited_time).getTime()
        }
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            this.notion.databases.query({
              database_id: this.databaseId,
              page_size: params.limit || 10
            }),
          catch: (error) => new Error(String(error))
        })

        return response.results.map((page: any) => ({
          _id: page.id,
          type: params.type,
          name: page.properties.Name?.title[0]?.plain_text || '',
          properties: page.properties,
          status: 'active',
          createdAt: new Date(page.created_time).getTime(),
          updatedAt: new Date(page.last_edited_time).getTime()
        }))
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const page = yield* Effect.tryPromise({
          try: () =>
            this.notion.pages.create({
              parent: { database_id: this.databaseId },
              properties: {
                Name: {
                  title: [{ text: { content: input.name } }]
                }
              }
            }),
          catch: (error) => new Error(String(error))
        })

        return page.id
      }),

    // update, delete...
  }

  // ... rest
}

export function notionProvider(config: { apiKey: string; databaseId: string }) {
  return Layer.succeed(
    DataProvider,
    new NotionProvider(config.apiKey, config.databaseId)
  )
}
```

### Airtable

```typescript
// frontend/src/providers/airtable/AirtableProvider.ts
import Airtable from 'airtable'
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class AirtableProvider implements DataProvider {
  private base

  constructor(apiKey: string, baseId: string) {
    const airtable = new Airtable({ apiKey })
    this.base = airtable.base(baseId)
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const record = yield* Effect.tryPromise({
          try: () => this.base('Things').find(id),
          catch: (error) => new Error(String(error))
        })

        return {
          _id: record.id,
          type: record.fields.Type,
          name: record.fields.Name,
          properties: record.fields,
          status: 'active',
          createdAt: new Date(record.fields.Created).getTime(),
          updatedAt: new Date(record.fields.Modified).getTime()
        }
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const records = yield* Effect.tryPromise({
          try: () =>
            this.base('Things')
              .select({
                filterByFormula: `{Type} = '${params.type}'`,
                maxRecords: params.limit || 10
              })
              .all(),
          catch: (error) => new Error(String(error))
        })

        return records.map(record => ({
          _id: record.id,
          type: record.fields.Type,
          name: record.fields.Name,
          properties: record.fields,
          status: 'active',
          createdAt: new Date(record.fields.Created).getTime(),
          updatedAt: new Date(record.fields.Modified).getTime()
        }))
      }),

    // create, update, delete...
  }

  // ... rest
}

export function airtableProvider(config: { apiKey: string; baseId: string }) {
  return Layer.succeed(
    DataProvider,
    new AirtableProvider(config.apiKey, config.baseId)
  )
}
```

---

## Custom Backends

### Your Own API

```typescript
// frontend/src/providers/custom/CustomProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider } from '../DataProvider'

export class CustomProvider implements DataProvider {
  constructor(
    private config: {
      baseUrl: string
      authToken: string
      // Add your custom config
    }
  ) {}

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        // Your API call
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.config.baseUrl}/v1/entities/${id}`, {
              headers: {
                'X-API-Key': this.config.authToken
              }
            }),
          catch: (error) => new Error(String(error))
        })

        const data = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform YOUR data → ONE Thing
        return {
          _id: data.entity_id,
          type: data.entity_type,
          name: data.display_name,
          properties: data.metadata,
          status: data.is_active ? 'active' : 'inactive',
          createdAt: data.created_timestamp,
          updatedAt: data.updated_timestamp
        }
      }),

    // Implement all other methods...
  }

  connections = {
    // Your relationship API calls...
  }

  events = {
    // Your analytics/logging API calls...
  }

  knowledge = {
    // Your search API calls...
  }
}

export function customProvider(config: any) {
  return Layer.succeed(DataProvider, new CustomProvider(config))
}
```

---

## Multi-Backend Setup

### Use Multiple Backends Simultaneously

```typescript
// frontend/astro.config.ts
import { defineConfig } from 'astro/config'
import { one } from '@one/astro-integration'
import { convexProvider } from './src/providers/convex'
import { supabaseProvider } from './src/providers/supabase'
import { wordpressProvider } from './src/providers/wordpress'

export default defineConfig({
  integrations: [
    one({
      // ✅ Use multiple providers!
      providers: {
        // Primary: Convex for real-time data
        primary: convexProvider({
          url: import.meta.env.PUBLIC_CONVEX_URL
        }),

        // Content: WordPress for blog
        content: wordpressProvider({
          url: import.meta.env.WORDPRESS_URL,
          username: import.meta.env.WORDPRESS_USERNAME,
          password: import.meta.env.WORDPRESS_APP_PASSWORD
        }),

        // Analytics: Supabase for analytics
        analytics: supabaseProvider({
          url: import.meta.env.PUBLIC_SUPABASE_URL,
          anonKey: import.meta.env.PUBLIC_SUPABASE_ANON_KEY
        })
      }
    })
  ]
})
```

### Route Requests to Different Backends

```typescript
// frontend/src/services/ThingClientService.ts
import { Effect } from 'effect'
import { DataProvider } from '@/providers/DataProvider'

export class ThingClientService extends Effect.Service<ThingClientService>()(
  'ThingClientService',
  {
    effect: Effect.gen(function* () {
      // Get all configured providers
      const providers = yield* Effect.all({
        primary: DataProvider.fromTag('primary'),
        content: DataProvider.fromTag('content'),
        analytics: DataProvider.fromTag('analytics')
      })

      return {
        get: (id: string, type: string) =>
          Effect.gen(function* () {
            // Route based on thing type
            if (type === 'post' || type === 'page') {
              // Blog content → WordPress
              return yield* providers.content.things.get(id)
            } else if (type === 'event') {
              // Events → Analytics backend
              return yield* providers.analytics.things.get(id)
            } else {
              // Everything else → Primary backend
              return yield* providers.primary.things.get(id)
            }
          }),

        list: (type: string, orgId?: string) =>
          Effect.gen(function* () {
            // Similar routing logic
            const provider = this.selectProvider(type)
            return yield* provider.things.list({ type, organizationId: orgId })
          })
      }
    })
  }
) {}
```

---

## Testing

### Mock Provider for Testing

```typescript
// frontend/src/providers/__tests__/MockProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider, Thing } from '../DataProvider'

export class MockProvider implements DataProvider {
  private storage = new Map<string, Thing>()

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        const thing = this.storage.get(id)
        if (!thing) {
          return yield* Effect.fail(new ThingNotFoundError(id))
        }
        return thing
      }),

    list: (params) =>
      Effect.succeed(
        Array.from(this.storage.values()).filter(
          thing => thing.type === params.type
        )
      ),

    create: (input) =>
      Effect.gen(this, function* () {
        const id = `mock_${Date.now()}`
        const thing: Thing = {
          _id: id,
          type: input.type,
          name: input.name,
          properties: input.properties,
          status: 'active',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        this.storage.set(id, thing)
        return id
      }),

    update: (id, updates) =>
      Effect.gen(this, function* () {
        const thing = this.storage.get(id)
        if (!thing) {
          return yield* Effect.fail(new Error('Not found'))
        }
        this.storage.set(id, { ...thing, ...updates })
      }),

    delete: (id) =>
      Effect.gen(this, function* () {
        this.storage.delete(id)
      })
  }

  connections = { /* mock implementations */ }
  events = { /* mock implementations */ }
  knowledge = { /* mock implementations */ }
}

export function mockProvider() {
  return Layer.succeed(DataProvider, new MockProvider())
}
```

### Test with Mock Provider

```typescript
// frontend/src/components/__tests__/ThingList.test.tsx
import { describe, it, expect } from 'vitest'
import { Effect } from 'effect'
import { ThingClientService } from '@/services/ThingClientService'
import { mockProvider } from '@/providers/__tests__/MockProvider'

describe('ThingList', () => {
  it('lists things from provider', async () => {
    const program = Effect.gen(function* () {
      const thingService = yield* ThingClientService

      // Create test data
      yield* thingService.create({
        type: 'course',
        name: 'Test Course',
        properties: {}
      })

      // List things
      const things = yield* thingService.list('course')

      return things
    })

    // Run with mock provider
    const things = await Effect.runPromise(
      program.pipe(
        Effect.provide(ThingClientService.Default),
        Effect.provide(mockProvider())
      )
    )

    expect(things).toHaveLength(1)
    expect(things[0].name).toBe('Test Course')
  })
})
```

---

## Deployment

### Environment Configuration

```bash
# frontend/.env

# ========================================
# Provider Selection
# ========================================
PUBLIC_DATA_PROVIDER=convex  # convex | supabase | wordpress | notion | custom

# ========================================
# Convex
# ========================================
PUBLIC_CONVEX_URL=https://your-convex.convex.cloud

# ========================================
# Supabase
# ========================================
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ========================================
# WordPress
# ========================================
WORDPRESS_URL=https://yoursite.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx

# ========================================
# Notion
# ========================================
NOTION_API_KEY=secret_xxx
NOTION_DATABASE_ID=your-database-id

# ========================================
# Custom API
# ========================================
CUSTOM_API_URL=https://api.yoursite.com
CUSTOM_API_KEY=your-api-key
```

### Deploy Frontend

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Cloudflare Pages / Vercel / Netlify
# Set environment variables in hosting platform

# Frontend connects to backend via DataProvider
# Backend can be anywhere (Convex, Supabase, your API, etc.)
```

---

## Summary

### Key Principles

1. **Universal Interface**: DataProvider works with ANY backend
2. **Backend-Agnostic Frontend**: Components never know which backend
3. **Easy Switching**: Change ONE line to swap backends
4. **Multi-Backend**: Use multiple backends simultaneously
5. **Type-Safe**: Effect.ts ensures correctness
6. **Testable**: Mock providers for testing

### Implementation Checklist

- [ ] Define DataProvider interface
- [ ] Implement provider for your backend
- [ ] Transform backend data → ONE Things
- [ ] Configure Astro to use provider
- [ ] Test CRUD operations
- [ ] Deploy frontend + backend

### Next Steps

1. Choose your backend(s)
2. Implement DataProvider for it
3. Update Astro config
4. Test with your data
5. Deploy

---

**ONE Frontend + ANY Backend = Unlimited Flexibility**

Zero lock-in. Maximum flexibility. One interface.
