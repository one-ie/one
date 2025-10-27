/**
 * WordPressProvider - WordPress REST API Implementation of DataProvider
 *
 * Maps WordPress data structures to ONE ontology:
 * - WP Posts → things (type: "blog_post")
 * - WP Users → things (type: "creator")
 * - WP Categories/Tags → knowledge (type: "label")
 * - WP Comments → events (type: "content_interacted")
 *
 * Read-only initially, can be extended to full CRUD with WP Application Passwords.
 */

import { Effect, Layer } from "effect";
import {
  DataProviderService,
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionNotFoundError,
  ConnectionCreateError,
  EventCreateError,
  KnowledgeNotFoundError,
  GroupNotFoundError,
  GroupCreateError,
  QueryError,
} from "../DataProvider";
import type {
  DataProvider,
  Thing,
  Connection,
  Event,
  Knowledge,
  Group,
  CreateThingInput,
  UpdateThingInput,
  CreateConnectionInput,
  CreateEventInput,
  CreateKnowledgeInput,
  CreateGroupInput,
  UpdateGroupInput,
  ListThingsOptions,
  ListConnectionsOptions,
  ListEventsOptions,
  ListGroupsOptions,
  SearchKnowledgeOptions,
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface WordPressProviderConfig {
  baseUrl: string; // e.g., "https://example.com/wp-json/wp/v2"
  auth?: {
    username: string;
    applicationPassword: string; // WP Application Password
  };
}

// ============================================================================
// WORDPRESS API TYPES
// ============================================================================

interface WPPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: "publish" | "draft" | "pending" | "private";
  type: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
}

interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: Record<string, string>;
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface WPTag {
  id: number;
  name: string;
  slug: string;
  description: string;
}

// ============================================================================
// WORDPRESS PROVIDER IMPLEMENTATION
// ============================================================================

export const makeWordPressProvider = (config: WordPressProviderConfig): DataProvider => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.auth) {
    const credentials = btoa(`${config.auth.username}:${config.auth.applicationPassword}`);
    headers["Authorization"] = `Basic ${credentials}`;
  }

  const fetchWP = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers: { ...headers, ...options?.headers },
    });

    if (!response.ok) {
      throw new Error(`WordPress API error: ${response.statusText}`);
    }

    return response.json();
  };

  // ===== MAPPERS =====

  const mapPostToThing = (post: WPPost): Thing => ({
    _id: `wp-post-${post.id}`,
    type: "blog_post",
    name: post.title.rendered,
    properties: {
      slug: post.slug,
      content: post.content.rendered,
      excerpt: post.excerpt.rendered,
      authorId: post.author,
      featuredMedia: post.featured_media,
      categories: post.categories,
      tags: post.tags,
      wordpressId: post.id,
    },
    status: post.status === "publish" ? "published" : post.status as any,
    createdAt: new Date(post.date).getTime(),
    updatedAt: new Date(post.modified).getTime(),
  });

  const mapUserToThing = (user: WPUser): Thing => ({
    _id: `wp-user-${user.id}`,
    type: "creator",
    name: user.name,
    properties: {
      username: user.slug,
      bio: user.description,
      url: user.url,
      avatar: Object.values(user.avatar_urls)[0],
      wordpressId: user.id,
    },
    status: "active",
    createdAt: Date.now(), // WP doesn't expose user creation date
    updatedAt: Date.now(),
  });

  const mapCategoryToKnowledge = (category: WPCategory): Knowledge => ({
    _id: `wp-cat-${category.id}`,
    knowledgeType: "label",
    text: category.name,
    labels: [`category:${category.slug}`],
    metadata: {
      description: category.description,
      wordpressId: category.id,
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return {
    // ===== GROUPS =====
    groups: {
      get: (id: string) =>
        Effect.fail(
          new GroupNotFoundError(id, "WordPress provider does not support groups")
        ),

      getBySlug: (slug: string) =>
        Effect.fail(
          new GroupNotFoundError(slug, "WordPress provider does not support groups")
        ),

      list: () =>
        Effect.succeed([]),

      create: () =>
        Effect.fail(
          new GroupCreateError("WordPress provider does not support creating groups")
        ),

      update: () =>
        Effect.fail(
          new GroupNotFoundError("", "WordPress provider does not support updating groups")
        ),

      delete: () =>
        Effect.fail(
          new GroupNotFoundError("", "WordPress provider does not support deleting groups")
        ),
    },

    // ===== THINGS =====
    things: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            // Parse WordPress ID from thing ID
            const match = id.match(/^wp-post-(\d+)$/);
            if (!match) {
              throw new ThingNotFoundError(id, "Invalid WordPress thing ID");
            }

            const wpId = match[1];
            const post = await fetchWP(`/posts/${wpId}`);
            return mapPostToThing(post);
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),

      list: (options?: ListThingsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const params = new URLSearchParams();
            if (options?.status === "published") params.append("status", "publish");
            if (options?.limit) params.append("per_page", String(options.limit));

            const posts = await fetchWP(`/posts?${params.toString()}`);
            return posts.map(mapPostToThing);
          },
          catch: (error) => new QueryError("Failed to list WordPress posts", error),
        }),

      create: (input: CreateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            if (input.type !== "blog_post") {
              throw new ThingCreateError(
                "WordPress provider only supports creating blog_post things"
              );
            }

            const post = await fetchWP("/posts", {
              method: "POST",
              body: JSON.stringify({
                title: input.name,
                content: input.properties.content || "",
                status: input.status === "published" ? "publish" : "draft",
              }),
            });

            return `wp-post-${post.id}`;
          },
          catch: (error) => new ThingCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const match = id.match(/^wp-post-(\d+)$/);
            if (!match) {
              throw new Error("Invalid WordPress thing ID");
            }

            const wpId = match[1];
            await fetchWP(`/posts/${wpId}`, {
              method: "POST",
              body: JSON.stringify({
                title: input.name,
                content: input.properties?.content,
                status: input.status === "published" ? "publish" : "draft",
              }),
            });
          },
          catch: (error) => new ThingUpdateError(id, String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const match = id.match(/^wp-post-(\d+)$/);
            if (!match) {
              throw new Error("Invalid WordPress thing ID");
            }

            const wpId = match[1];
            await fetchWP(`/posts/${wpId}`, {
              method: "DELETE",
            });
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      get: (id: string) =>
        Effect.fail(
          new ConnectionNotFoundError(id, "WordPress provider does not support connections")
        ),

      list: (options?: ListConnectionsOptions) =>
        Effect.succeed([]), // WordPress doesn't have native connections

      create: (input: CreateConnectionInput) =>
        Effect.fail(
          new ConnectionCreateError("WordPress provider does not support creating connections")
        ),

      delete: (id: string) =>
        Effect.fail(
          new ConnectionNotFoundError(id, "WordPress provider does not support connections")
        ),
    },

    // ===== EVENTS =====
    events: {
      get: (id: string) =>
        Effect.fail(new QueryError("WordPress provider does not support events")),

      list: (options?: ListEventsOptions) =>
        Effect.succeed([]), // Could map comments to events in the future

      create: (input: CreateEventInput) =>
        Effect.fail(new EventCreateError("WordPress provider does not support creating events")),
    },

    // ===== KNOWLEDGE =====
    knowledge: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            // Parse category or tag ID
            const catMatch = id.match(/^wp-cat-(\d+)$/);
            if (catMatch) {
              const category = await fetchWP(`/categories/${catMatch[1]}`);
              return mapCategoryToKnowledge(category);
            }

            throw new Error("Invalid WordPress knowledge ID");
          },
          catch: (error) => new KnowledgeNotFoundError(id, String(error)),
        }),

      list: (options?: SearchKnowledgeOptions) =>
        Effect.tryPromise({
          try: async () => {
            const categories = await fetchWP("/categories");
            return categories.map(mapCategoryToKnowledge);
          },
          catch: (error) => new QueryError("Failed to list WordPress categories", error),
        }),

      create: (input: CreateKnowledgeInput) =>
        Effect.fail(
          new QueryError("WordPress provider does not support creating knowledge")
        ),

      link: (thingId: string, knowledgeId: string, role?: any) =>
        Effect.fail(
          new QueryError("WordPress provider does not support linking knowledge")
        ),

      search: (embedding: number[], options?: SearchKnowledgeOptions) =>
        Effect.fail(
          new QueryError("WordPress provider does not support embedding search")
        ),
    },

    // ===== AUTH =====
    // WordPress does not provide a built-in auth system via REST API
    // Authentication should be handled separately (e.g., via Better Auth)
    auth: {
      login: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      signup: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      logout: () =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      getCurrentUser: () =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      magicLinkAuth: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      passwordReset: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      passwordResetComplete: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      verifyEmail: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      get2FAStatus: () =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      setup2FA: () =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      verify2FA: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
      disable2FA: (args) =>
        Effect.fail(new QueryError("WordPress provider does not provide auth") as any),
    },
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const WordPressProviderLive = (config: WordPressProviderConfig) =>
  Layer.succeed(DataProviderService, makeWordPressProvider(config));

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const wordPressProvider = (baseUrl: string, auth?: WordPressProviderConfig["auth"]) =>
  makeWordPressProvider({ baseUrl, auth });
