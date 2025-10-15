# Connecting ONE to WordPress Backend

**Using WordPress + WooCommerce as your ONE backend**

---

## Executive Summary

This guide shows you how to connect the ONE platform frontend to a **WordPress + WooCommerce backend**, turning WordPress into a full-featured backend for the ONE ontology.

**What You Get:**
- ✅ Use existing WordPress infrastructure
- ✅ Leverage WordPress posts, pages, users, custom post types
- ✅ WooCommerce for products and e-commerce
- ✅ WordPress plugins ecosystem
- ✅ Familiar WordPress admin interface
- ✅ WordPress REST API as backend

**Architecture:**
```
┌────────────────────────────────────────────────┐
│         ONE Frontend (Astro + React)           │
│  - Renders UI                                  │
│  - Calls DataProvider interface                │
│  - Backend-agnostic                            │
└────────────────┬───────────────────────────────┘
                 │ DataProvider Interface
                 ↓
┌────────────────────────────────────────────────┐
│         WordPressProvider                      │
│  - Implements DataProvider interface           │
│  - Translates ONE ontology → WordPress API     │
│  - Maps things → posts/pages/products          │
│  - Maps connections → relationships            │
└────────────────┬───────────────────────────────┘
                 │ WordPress REST API
                 ↓
┌────────────────────────────────────────────────┐
│         WordPress Backend                      │
│  - wp_posts (posts, pages, products)           │
│  - wp_postmeta (properties)                    │
│  - wp_users (people)                           │
│  - wp_term_relationships (connections)         │
│  - wp_comments (events)                        │
│  - WooCommerce tables (orders, products)       │
└────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [WordPress Setup](#wordpress-setup)
3. [Authentication](#authentication)
4. [Ontology Mapping](#ontology-mapping)
5. [WordPressProvider Implementation](#wordpressprovider-implementation)
6. [Configuration](#configuration)
7. [Usage Examples](#usage-examples)
8. [WooCommerce Integration](#woocommerce-integration)
9. [Custom Post Types](#custom-post-types)
10. [Limitations and Workarounds](#limitations-and-workarounds)
11. [Deployment](#deployment)

---

## Prerequisites

**WordPress Requirements:**
- WordPress 5.0+ (REST API built-in)
- PHP 7.4+
- WooCommerce 5.0+ (optional, for e-commerce)
- Application Passwords enabled (WP 5.6+)

**Recommended Plugins:**
- **WooCommerce** - E-commerce functionality
- **Advanced Custom Fields (ACF)** - Extend post meta (optional)
- **Custom Post Type UI** - Create custom post types (optional)
- **JWT Authentication for WP REST API** - Better auth (optional)

**Frontend Requirements:**
- Node.js 18+
- ONE frontend setup (see ontology-frontend.md)

---

## WordPress Setup

### 1. Enable REST API

WordPress REST API is enabled by default in WordPress 5.0+. Test it:

```bash
# Test your WordPress REST API
curl https://yoursite.com/wp-json/wp/v2/posts
```

### 2. Enable Application Passwords

**In WordPress Admin:**
1. Go to **Users → Your Profile**
2. Scroll to **Application Passwords**
3. Enter name: "ONE Platform"
4. Click **Add New Application Password**
5. **Copy the generated password** (save it securely)

### 3. Install WooCommerce (Optional)

```bash
# Via WordPress Admin
Plugins → Add New → Search "WooCommerce" → Install → Activate

# Or via WP-CLI
wp plugin install woocommerce --activate
```

### 4. Configure Permalinks

**Ensure pretty permalinks are enabled:**

WordPress Admin → Settings → Permalinks → Select **Post name**

---

## Authentication

### Method 1: Application Passwords (Recommended)

```typescript
// frontend/.env
WORDPRESS_URL=https://yoursite.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
```

```typescript
// frontend/src/providers/wordpress/auth.ts
export function createAuthHeaders(username: string, password: string) {
  const credentials = btoa(`${username}:${password}`)
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json'
  }
}
```

### Method 2: JWT Authentication (More Secure)

**Install JWT Plugin:**
```bash
wp plugin install jwt-authentication-for-wp-rest-api --activate
```

**Configure wp-config.php:**
```php
// wp-config.php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

**.htaccess:**
```apache
# Add to .htaccess
RewriteEngine on
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
```

**Get JWT Token:**
```typescript
// frontend/src/providers/wordpress/auth.ts
import { Effect } from 'effect'

export function getJWTToken(username: string, password: string) {
  return Effect.tryPromise({
    try: async () => {
      const response = await fetch('https://yoursite.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()
      return data.token
    },
    catch: (error) => new Error(String(error))
  })
}

export function createJWTHeaders(token: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}
```

---

## Ontology Mapping

**How ONE ontology maps to WordPress:**

### Things → WordPress Content Types

| ONE Thing Type | WordPress Type | REST Endpoint | Notes |
|----------------|----------------|---------------|-------|
| `post` | Post | `/wp/v2/posts` | Blog posts |
| `page` | Page | `/wp/v2/pages` | Static pages |
| `person` | User | `/wp/v2/users` | WordPress users |
| `product` | WooCommerce Product | `/wc/v3/products` | Requires WooCommerce |
| `course` | Custom Post Type | `/wp/v2/course` | Create custom type |
| `lesson` | Custom Post Type | `/wp/v2/lesson` | Create custom type |
| `event` | Custom Post Type | `/wp/v2/event` | Create custom type |
| `organization` | Custom Post Type | `/wp/v2/organization` | Create custom type |

### Connections → WordPress Relationships

| ONE Connection | WordPress Implementation | Notes |
|----------------|-------------------------|-------|
| `created_by` | Post author | `post.author` field |
| `part_of` | Post parent | `post.parent` field |
| `tagged_with` | Tags | `post.tags` array |
| `categorized_as` | Categories | `post.categories` array |
| `enrolled_in` | User meta | Custom meta: `user_meta.enrolled_courses` |
| `purchased` | WooCommerce orders | `order.line_items` |

### Events → WordPress Activity

| ONE Event Type | WordPress Implementation | Notes |
|----------------|-------------------------|-------|
| `thing_created` | Post published | Hook: `publish_post` |
| `thing_updated` | Post modified | Hook: `save_post` |
| `thing_viewed` | WP Statistics | Plugin or custom table |
| `comment_added` | Comments | `wp_comments` table |
| `user_login` | User login | Hook: `wp_login` |

### Knowledge → WordPress Search

| ONE Feature | WordPress Implementation | Notes |
|-------------|-------------------------|-------|
| Embeddings | External service | Use Pinecone/Weaviate |
| Search | WordPress search | `/wp/v2/search` endpoint |
| Vector search | ElasticSearch | Plugin integration |

---

## WordPressProvider Implementation

### Core Provider Class

```typescript
// frontend/src/providers/wordpress/WordPressProvider.ts
import { Effect, Layer } from 'effect'
import { DataProvider, ThingNotFoundError, ConnectionCreateError } from '../DataProvider'
import { createAuthHeaders } from './auth'

export class WordPressProvider implements DataProvider {
  private headers: Record<string, string>

  constructor(
    private baseUrl: string,
    private username: string,
    private password: string
  ) {
    this.headers = createAuthHeaders(username, password)
  }

  things = {
    get: (id: string) =>
      Effect.gen(this, function* () {
        // Determine post type from ID or fetch generically
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
              headers: this.headers
            }),
          catch: (error) => new Error(String(error))
        })

        if (!response.ok) {
          if (response.status === 404) {
            return yield* Effect.fail(new ThingNotFoundError(id))
          }
          return yield* Effect.fail(new Error(`HTTP ${response.status}`))
        }

        const post = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform WordPress post → ONE thing
        return {
          _id: post.id.toString(),
          type: this.mapPostTypeToThingType(post.type),
          name: post.title.rendered,
          properties: {
            content: post.content.rendered,
            excerpt: post.excerpt.rendered,
            slug: post.slug,
            status: post.status,
            author: post.author.toString(),
            featuredImage: post.featured_media,
            categories: post.categories,
            tags: post.tags,
            // Custom fields from ACF or post meta
            ...post.meta
          },
          status: post.status === 'publish' ? 'active' : 'inactive',
          createdAt: new Date(post.date).getTime(),
          updatedAt: new Date(post.modified).getTime(),
          createdBy: post.author.toString()
        }
      }),

    list: (params) =>
      Effect.gen(this, function* () {
        const endpoint = this.getEndpointForType(params.type)

        const query = new URLSearchParams({
          per_page: String(params.limit || 10),
          page: String(params.page || 1),
          status: 'publish'
        })

        // Add filters
        if (params.filters?.author) {
          query.append('author', params.filters.author)
        }
        if (params.filters?.category) {
          query.append('categories', params.filters.category)
        }
        if (params.filters?.search) {
          query.append('search', params.filters.search)
        }

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/${endpoint}?${query}`, {
              headers: this.headers
            }),
          catch: (error) => new Error(String(error))
        })

        const posts = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        // Transform WordPress posts → ONE things
        return posts.map((post: any) => ({
          _id: post.id.toString(),
          type: params.type,
          name: post.title.rendered,
          properties: {
            excerpt: post.excerpt.rendered,
            slug: post.slug,
            featuredImage: post.featured_media
          },
          status: post.status === 'publish' ? 'active' : 'inactive',
          createdAt: new Date(post.date).getTime(),
          updatedAt: new Date(post.modified).getTime()
        }))
      }),

    create: (input) =>
      Effect.gen(this, function* () {
        const endpoint = this.getEndpointForType(input.type)

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/${endpoint}`, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify({
                title: input.name,
                content: input.properties.content || '',
                excerpt: input.properties.excerpt || '',
                status: 'draft',
                meta: input.properties
              })
            }),
          catch: (error) => new ConnectionCreateError(String(error))
        })

        if (!response.ok) {
          return yield* Effect.fail(
            new ConnectionCreateError(`Failed to create: ${response.status}`)
          )
        }

        const post = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new ConnectionCreateError(String(error))
        })

        return post.id.toString()
      }),

    update: (id, updates) =>
      Effect.gen(this, function* () {
        const endpoint = this.getEndpointForType(updates.type || 'post')

        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/${endpoint}/${id}`, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify({
                title: updates.name,
                content: updates.properties?.content,
                status: updates.status === 'active' ? 'publish' : 'draft',
                meta: updates.properties
              })
            }),
          catch: (error) => new Error(String(error))
        })
      }),

    delete: (id) =>
      Effect.gen(this, function* () {
        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${id}`, {
              method: 'DELETE',
              headers: this.headers,
              body: JSON.stringify({ force: true })
            }),
          catch: (error) => new Error(String(error))
        })
      })
  }

  connections = {
    create: (input) =>
      Effect.gen(this, function* () {
        // WordPress connections via relationships
        switch (input.relationshipType) {
          case 'part_of':
            // Use post parent
            yield* Effect.tryPromise({
              try: () =>
                fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${input.fromThingId}`, {
                  method: 'POST',
                  headers: this.headers,
                  body: JSON.stringify({
                    parent: parseInt(input.toThingId)
                  })
                }),
              catch: (error) => new ConnectionCreateError(String(error))
            })
            return `${input.fromThingId}-${input.toThingId}-parent`

          case 'tagged_with':
            // Use tags
            const post = yield* this.things.get(input.fromThingId)
            const currentTags = post.properties.tags || []
            yield* Effect.tryPromise({
              try: () =>
                fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${input.fromThingId}`, {
                  method: 'POST',
                  headers: this.headers,
                  body: JSON.stringify({
                    tags: [...currentTags, parseInt(input.toThingId)]
                  })
                }),
              catch: (error) => new ConnectionCreateError(String(error))
            })
            return `${input.fromThingId}-${input.toThingId}-tag`

          case 'enrolled_in':
            // Use user meta
            yield* Effect.tryPromise({
              try: () =>
                fetch(`${this.baseUrl}/wp-json/wp/v2/users/${input.fromThingId}`, {
                  method: 'POST',
                  headers: this.headers,
                  body: JSON.stringify({
                    meta: {
                      enrolled_courses: [input.toThingId]
                    }
                  })
                }),
              catch: (error) => new ConnectionCreateError(String(error))
            })
            return `${input.fromThingId}-${input.toThingId}-enrollment`

          default:
            // Store in custom table or post meta
            return yield* this.createCustomConnection(input)
        }
      }),

    getRelated: (params) =>
      Effect.gen(this, function* () {
        switch (params.relationshipType) {
          case 'part_of':
            // Get children via parent query
            const response = yield* Effect.tryPromise({
              try: () =>
                fetch(
                  `${this.baseUrl}/wp-json/wp/v2/posts?parent=${params.thingId}`,
                  { headers: this.headers }
                ),
              catch: (error) => new Error(String(error))
            })
            const children = yield* Effect.tryPromise({
              try: () => response.json(),
              catch: (error) => new Error(String(error))
            })
            return children.map((post: any) => this.transformPostToThing(post))

          case 'tagged_with':
            // Get posts by tag
            const tagResponse = yield* Effect.tryPromise({
              try: () =>
                fetch(
                  `${this.baseUrl}/wp-json/wp/v2/posts?tags=${params.thingId}`,
                  { headers: this.headers }
                ),
              catch: (error) => new Error(String(error))
            })
            const posts = yield* Effect.tryPromise({
              try: () => tagResponse.json(),
              catch: (error) => new Error(String(error))
            })
            return posts.map((post: any) => this.transformPostToThing(post))

          default:
            // Query custom connections table
            return []
        }
      }),

    getCount: (thingId, relationshipType) =>
      Effect.gen(this, function* () {
        const related = yield* this.connections.getRelated({
          thingId,
          relationshipType,
          direction: 'both'
        })
        return related.length
      }),

    delete: (id) =>
      Effect.gen(this, function* () {
        // Delete connection (implementation depends on storage method)
        // For parent: update post to remove parent
        // For tags: remove tag from post
        // For user meta: remove from meta array
      })
  }

  events = {
    log: (event) =>
      Effect.gen(this, function* () {
        // Option 1: Use WordPress comments as event log
        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/comments`, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify({
                post: event.targetId,
                author: event.actorId,
                content: JSON.stringify({
                  type: event.type,
                  metadata: event.metadata
                }),
                meta: {
                  event_type: event.type,
                  event_metadata: event.metadata
                }
              })
            }),
          catch: (error) => new Error(String(error))
        })

        // Option 2: Custom REST endpoint with custom table
        // Option 3: External logging service
      }),

    query: (params) =>
      Effect.gen(this, function* () {
        // Query comments table or custom events table
        const query = new URLSearchParams()
        if (params.actorId) query.append('author', params.actorId)
        if (params.targetId) query.append('post', params.targetId)

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/comments?${query}`, {
              headers: this.headers
            }),
          catch: (error) => new Error(String(error))
        })

        const comments = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return comments.map((comment: any) => ({
          _id: comment.id.toString(),
          type: comment.meta.event_type || 'comment_added',
          actorId: comment.author.toString(),
          targetId: comment.post?.toString(),
          metadata: comment.meta.event_metadata || {},
          timestamp: new Date(comment.date).getTime()
        }))
      })
  }

  knowledge = {
    embed: (params) =>
      Effect.gen(this, function* () {
        // WordPress doesn't have native vector embeddings
        // Option 1: Use external service (Pinecone, Weaviate)
        // Option 2: ElasticSearch plugin
        // Option 3: Store embeddings in post meta, search externally

        // Example: Store in post meta for later external processing
        yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wp/v2/posts/${params.sourceThingId}`, {
              method: 'POST',
              headers: this.headers,
              body: JSON.stringify({
                meta: {
                  embedding_text: params.text,
                  embedding_labels: params.labels
                }
              })
            }),
          catch: (error) => new Error(String(error))
        })

        return params.sourceThingId
      }),

    search: (query, limit = 10) =>
      Effect.gen(this, function* () {
        // Use WordPress built-in search
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(
              `${this.baseUrl}/wp-json/wp/v2/search?search=${encodeURIComponent(query)}&per_page=${limit}`,
              { headers: this.headers }
            ),
          catch: (error) => new Error(String(error))
        })

        const results = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return results.map((result: any) => ({
          thingId: result.id.toString(),
          score: 0.9, // WordPress doesn't return relevance scores
          text: result.title,
          metadata: {
            type: result.subtype,
            url: result.url
          }
        }))
      })
  }

  // Helper methods
  private mapPostTypeToThingType(postType: string): string {
    const mapping: Record<string, string> = {
      'post': 'post',
      'page': 'page',
      'product': 'product',
      'course': 'course',
      'lesson': 'lesson'
    }
    return mapping[postType] || 'post'
  }

  private getEndpointForType(type: string): string {
    const endpoints: Record<string, string> = {
      'post': 'wp/v2/posts',
      'page': 'wp/v2/pages',
      'person': 'wp/v2/users',
      'product': 'wc/v3/products',
      'course': 'wp/v2/course',
      'lesson': 'wp/v2/lesson'
    }
    return endpoints[type] || 'wp/v2/posts'
  }

  private transformPostToThing(post: any) {
    return {
      _id: post.id.toString(),
      type: this.mapPostTypeToThingType(post.type),
      name: post.title.rendered,
      properties: {
        content: post.content.rendered,
        excerpt: post.excerpt.rendered
      },
      status: 'active',
      createdAt: new Date(post.date).getTime(),
      updatedAt: new Date(post.modified).getTime()
    }
  }

  private createCustomConnection(input: any) {
    // Implement custom connection storage
    // Option 1: Post meta array
    // Option 2: Custom database table
    // Option 3: Taxonomy terms
    return Effect.succeed(`${input.fromThingId}-${input.toThingId}`)
  }
}

// Factory function
export function wordpressProvider(config: {
  url: string
  username: string
  password: string
}) {
  return Layer.succeed(
    DataProvider,
    new WordPressProvider(config.url, config.username, config.password)
  )
}
```

---

## Configuration

### Astro Config

```typescript
// frontend/astro.config.ts
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { one } from '@one/astro-integration'
import { wordpressProvider } from './src/providers/wordpress'

export default defineConfig({
  integrations: [
    react(),
    one({
      // ✅ Use WordPress as backend
      provider: wordpressProvider({
        url: import.meta.env.WORDPRESS_URL,
        username: import.meta.env.WORDPRESS_USERNAME,
        password: import.meta.env.WORDPRESS_APP_PASSWORD
      })
    })
  ]
})
```

### Environment Variables

```bash
# frontend/.env
WORDPRESS_URL=https://yoursite.com
WORDPRESS_USERNAME=your_username
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx

# Or with JWT
WORDPRESS_JWT_TOKEN=your_jwt_token_here
```

---

## Usage Examples

### Example 1: List WordPress Posts

```tsx
// frontend/src/components/BlogList.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ThingClientService } from '@/services/ThingClientService'
import { Effect } from 'effect'
import { useEffect, useState } from 'react'

export function BlogList() {
  const { run, loading } = useEffectRunner()
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const program = Effect.gen(function* () {
      const thingService = yield* ThingClientService

      // Fetch posts from WordPress
      return yield* thingService.list('post')
    })

    run(program, {
      onSuccess: setPosts
    })
  }, [])

  if (loading) return <div>Loading posts...</div>

  return (
    <div>
      {posts.map(post => (
        <article key={post._id}>
          <h2>{post.name}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.properties.excerpt }} />
          <a href={`/posts/${post._id}`}>Read more</a>
        </article>
      ))}
    </div>
  )
}
```

### Example 2: Create WordPress Post

```tsx
// frontend/src/components/PostForm.tsx
import { useEffectRunner } from '@/hooks/useEffectRunner'
import { ThingClientService } from '@/services/ThingClientService'
import { Effect } from 'effect'
import { useState } from 'react'

export function PostForm() {
  const { run, loading, error } = useEffectRunner()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const program = Effect.gen(function* () {
      const thingService = yield* ThingClientService

      // Create post in WordPress
      const postId = yield* thingService.create({
        type: 'post',
        name: title,
        properties: {
          content,
          excerpt: content.substring(0, 150)
        }
      })

      return postId
    })

    run(program, {
      onSuccess: (id) => {
        console.log('Post created:', id)
        window.location.href = `/posts/${id}`
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Post Title"
        required
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Post Content"
        rows={10}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Post'}
      </button>

      {error && <div className="error">{error}</div>}
    </form>
  )
}
```

---

## WooCommerce Integration

### WooCommerce Provider Extension

```typescript
// frontend/src/providers/wordpress/WooCommerceExtension.ts
import { Effect } from 'effect'

export class WooCommerceExtension {
  constructor(
    private baseUrl: string,
    private consumerKey: string,
    private consumerSecret: string
  ) {}

  private get authParams() {
    return `consumer_key=${this.consumerKey}&consumer_secret=${this.consumerSecret}`
  }

  products = {
    list: (params: { limit?: number; category?: string }) =>
      Effect.gen(this, function* () {
        const query = new URLSearchParams({
          per_page: String(params.limit || 10),
          ...(params.category && { category: params.category })
        })

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(
              `${this.baseUrl}/wp-json/wc/v3/products?${query}&${this.authParams}`
            ),
          catch: (error) => new Error(String(error))
        })

        const products = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return products.map((product: any) => ({
          _id: product.id.toString(),
          type: 'product',
          name: product.name,
          properties: {
            description: product.description,
            price: product.price,
            regularPrice: product.regular_price,
            salePrice: product.sale_price,
            sku: product.sku,
            stock: product.stock_quantity,
            images: product.images.map((img: any) => img.src),
            categories: product.categories.map((cat: any) => cat.name)
          },
          status: product.status === 'publish' ? 'active' : 'inactive',
          createdAt: new Date(product.date_created).getTime(),
          updatedAt: new Date(product.date_modified).getTime()
        }))
      }),

    create: (input: {
      name: string
      price: number
      description: string
      sku?: string
    }) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wc/v3/products?${this.authParams}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: input.name,
                type: 'simple',
                regular_price: input.price.toString(),
                description: input.description,
                sku: input.sku
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const product = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return product.id.toString()
      })
  }

  orders = {
    list: (customerId?: string) =>
      Effect.gen(this, function* () {
        const query = customerId ? `customer=${customerId}&` : ''

        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(
              `${this.baseUrl}/wp-json/wc/v3/orders?${query}${this.authParams}`
            ),
          catch: (error) => new Error(String(error))
        })

        const orders = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return orders.map((order: any) => ({
          _id: order.id.toString(),
          type: 'order',
          customerId: order.customer_id.toString(),
          items: order.line_items.map((item: any) => ({
            productId: item.product_id.toString(),
            quantity: item.quantity,
            price: item.price
          })),
          total: order.total,
          status: order.status,
          createdAt: new Date(order.date_created).getTime()
        }))
      }),

    create: (input: {
      customerId: string
      items: Array<{ productId: string; quantity: number }>
    }) =>
      Effect.gen(this, function* () {
        const response = yield* Effect.tryPromise({
          try: () =>
            fetch(`${this.baseUrl}/wp-json/wc/v3/orders?${this.authParams}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer_id: parseInt(input.customerId),
                line_items: input.items.map(item => ({
                  product_id: parseInt(item.productId),
                  quantity: item.quantity
                }))
              })
            }),
          catch: (error) => new Error(String(error))
        })

        const order = yield* Effect.tryPromise({
          try: () => response.json(),
          catch: (error) => new Error(String(error))
        })

        return order.id.toString()
      })
  }
}
```

---

## Custom Post Types

### Create Custom Post Types for ONE

```php
// wp-content/themes/your-theme/functions.php
// Or create a custom plugin

function one_register_custom_post_types() {
  // Course post type
  register_post_type('course', [
    'label' => 'Courses',
    'public' => true,
    'show_in_rest' => true, // ✅ REQUIRED for REST API
    'rest_base' => 'course',
    'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    'has_archive' => true,
    'rewrite' => ['slug' => 'courses']
  ]);

  // Lesson post type
  register_post_type('lesson', [
    'label' => 'Lessons',
    'public' => true,
    'show_in_rest' => true,
    'rest_base' => 'lesson',
    'supports' => ['title', 'editor', 'custom-fields'],
    'hierarchical' => true, // Allows parent/child
    'rewrite' => ['slug' => 'lessons']
  ]);

  // Event post type
  register_post_type('event', [
    'label' => 'Events',
    'public' => true,
    'show_in_rest' => true,
    'rest_base' => 'event',
    'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    'rewrite' => ['slug' => 'events']
  ]);

  // Organization post type
  register_post_type('organization', [
    'label' => 'Organizations',
    'public' => true,
    'show_in_rest' => true,
    'rest_base' => 'organization',
    'supports' => ['title', 'editor', 'thumbnail', 'custom-fields'],
    'rewrite' => ['slug' => 'organizations']
  ]);
}
add_action('init', 'one_register_custom_post_types');

// Add custom fields support to REST API
function one_register_custom_fields() {
  register_post_meta('course', 'price', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'number'
  ]);

  register_post_meta('course', 'duration', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'string'
  ]);

  register_post_meta('lesson', 'video_url', [
    'show_in_rest' => true,
    'single' => true,
    'type' => 'string'
  ]);
}
add_action('init', 'one_register_custom_fields');
```

---

## Limitations and Workarounds

### WordPress Limitations

| Limitation | Workaround |
|------------|-----------|
| **No native graph relationships** | Use post parent, taxonomies, or custom tables |
| **No vector embeddings** | Integrate external service (Pinecone, Weaviate) |
| **No real-time subscriptions** | Poll API or use WordPress webhooks |
| **Limited query flexibility** | Create custom REST endpoints |
| **No multi-tenancy** | Use WordPress Multisite or organization taxonomy |

### Custom REST Endpoints

```php
// Add custom endpoint for complex queries
function one_register_custom_endpoints() {
  register_rest_route('one/v1', '/courses/(?P<id>\d+)/lessons', [
    'methods' => 'GET',
    'callback' => 'one_get_course_lessons',
    'permission_callback' => '__return_true'
  ]);
}
add_action('rest_api_init', 'one_register_custom_endpoints');

function one_get_course_lessons($request) {
  $course_id = $request['id'];

  $lessons = get_posts([
    'post_type' => 'lesson',
    'post_parent' => $course_id,
    'posts_per_page' => -1
  ]);

  return array_map(function($lesson) {
    return [
      'id' => $lesson->ID,
      'title' => $lesson->post_title,
      'content' => $lesson->post_content,
      'video_url' => get_post_meta($lesson->ID, 'video_url', true)
    ];
  }, $lessons);
}
```

---

## Deployment

### 1. Deploy WordPress

**Recommended Hosting:**
- **WP Engine** - Managed WordPress (premium)
- **Kinsta** - Managed WordPress (premium)
- **SiteGround** - Affordable, good performance
- **Digital Ocean** - VPS with WordPress droplet
- **AWS Lightsail** - WordPress instance ($10/mo)

### 2. Configure WordPress

```bash
# Install WordPress via WP-CLI
wp core install \
  --url="https://yoursite.com" \
  --title="ONE Backend" \
  --admin_user="admin" \
  --admin_email="admin@yoursite.com"

# Install required plugins
wp plugin install woocommerce --activate
wp plugin install jwt-authentication-for-wp-rest-api --activate

# Set up permalinks
wp rewrite structure '/%postname%/' --hard

# Create application password
wp user application-password create admin "ONE Platform"
```

### 3. Deploy Frontend

```bash
# Frontend (separate deployment)
cd frontend
npm run build
# Deploy to Cloudflare Pages / Vercel / Netlify

# Set environment variables in hosting platform
WORDPRESS_URL=https://yoursite.com
WORDPRESS_USERNAME=admin
WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

### 4. Configure CORS (if needed)

```php
// wp-content/themes/your-theme/functions.php
function one_add_cors_headers() {
  header('Access-Control-Allow-Origin: https://your-frontend.com');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
}
add_action('rest_api_init', 'one_add_cors_headers');
```

---

## Summary

### ✅ WordPress as ONE Backend: Pros

- **Familiar** - Use WordPress admin, existing knowledge
- **Plugins** - Thousands of WordPress plugins available
- **WooCommerce** - Built-in e-commerce functionality
- **Hosting** - Many affordable hosting options
- **Content Management** - Mature content editing tools
- **SEO** - WordPress SEO plugins (Yoast, Rank Math)

### ⚠️ WordPress as ONE Backend: Cons

- **No Real-Time** - Poll API or use webhooks
- **Limited Relationships** - Need workarounds for graph connections
- **Performance** - Slower than purpose-built backends (Convex, Supabase)
- **No Vector Search** - Requires external integration
- **PHP Required** - Need to write PHP for custom endpoints
- **Scaling** - WordPress can struggle at very large scale

### When to Use WordPress Backend

✅ **Good For:**
- Existing WordPress sites migrating to ONE
- Teams familiar with WordPress
- Organizations needing WordPress admin UI
- E-commerce sites using WooCommerce
- Content-heavy sites (blogs, magazines)
- Budget-conscious projects

❌ **Not Ideal For:**
- Real-time applications (use Convex or Supabase)
- Complex graph relationships (use Neo4j or Convex)
- High-performance requirements (use Convex)
- Vector search/AI features (use Pinecone + Convex)

---

## Next Steps

1. **Set up WordPress** with REST API and Application Passwords
2. **Install WooCommerce** (if doing e-commerce)
3. **Create custom post types** for your ONE thing types
4. **Implement WordPressProvider** in frontend
5. **Configure Astro** to use `wordpressProvider`
6. **Test CRUD operations** with WordPress REST API
7. **Add custom endpoints** for complex queries
8. **Deploy** WordPress backend and ONE frontend

---

## Resources

### WordPress REST API
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)
- [Custom Post Types](https://developer.wordpress.org/plugins/post-types/)

### WooCommerce REST API
- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Authentication](https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication)

### Related ONE Guides
- **ontology-frontend.md** - Frontend implementation (this guide references)
- **ontology-backend.md** - Backend patterns
- **Ontology.md** - Complete ontology specification

---

**WordPress → ONE = Familiar CMS + Modern Frontend Architecture**
