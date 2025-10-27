/**
 * WordPressProviderEnhanced - Complete WordPress Implementation with Custom Endpoints
 *
 * Maps WordPress + Advanced Custom Fields + Custom Tables to ONE ontology:
 * - WP Posts/Custom Post Types → things
 * - WP Users → things (type: "creator")
 * - Custom wp_one_connections table → connections
 * - Custom wp_one_events table → events
 * - WP Categories/Tags → knowledge (type: "label")
 *
 * Requires WordPress plugin: "one-platform-connector" for connections/events storage
 */

import { Effect, Layer } from "effect";
import type {
  Thing,
  Connection,
  Event,
  Knowledge,
  Group,
  ThingKnowledge,
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
  DataProvider,
} from "../DataProvider";
import {
  DataProviderService,
  ThingNotFoundError,
  ThingCreateError,
  ThingUpdateError,
  ConnectionNotFoundError,
  ConnectionCreateError,
  EventCreateError,
  QueryError,
  KnowledgeNotFoundError,
  GroupNotFoundError,
  GroupCreateError,
} from "../DataProvider";

// ============================================================================
// CONFIG
// ============================================================================

export interface WordPressProviderConfig {
  url: string; // Base WordPress URL (e.g., "https://example.com")
  apiKey: string; // WordPress Application Password
  username?: string; // WP username for auth
  organizationId: string; // ONE organization ID
  customPostTypes?: string[]; // Custom post types to support
}

// ============================================================================
// WORDPRESS API CLIENT
// ============================================================================

class WordPressAPI {
  private baseUrl: string;
  private apiKey: string;
  private username: string;

  constructor(url: string, apiKey: string, username: string = "admin") {
    this.baseUrl = `${url}/wp-json`;
    this.apiKey = apiKey;
    this.username = username;
  }

  async get(path: string): Promise<Response> {
    return this.request("GET", path);
  }

  async post(path: string, body?: any): Promise<Response> {
    return this.request("POST", path, body);
  }

  async delete(path: string): Promise<Response> {
    return this.request("DELETE", path);
  }

  private async request(method: string, path: string, body?: any): Promise<Response> {
    const url = `${this.baseUrl}${path}`;

    const credentials = btoa(`${this.username}:${this.apiKey}`);
    const headers: HeadersInit = {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`WordPress API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response;
  }
}

// ============================================================================
// WORDPRESS TYPES
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
  meta?: Record<string, any>; // ACF fields
}

interface WPUser {
  id: number;
  name: string;
  url: string;
  description: string;
  slug: string;
  avatar_urls: Record<string, string>;
  roles: string[];
  email?: string;
  registered_date?: string;
}

interface WPConnection {
  id: number;
  from_thing_id: string;
  to_thing_id: string;
  relationship_type: string;
  metadata?: string; // JSON string
  valid_from?: number;
  valid_to?: number;
  created_at: string;
}

interface WPEvent {
  id: number;
  type: string;
  actor_id?: string;
  target_id?: string;
  timestamp: string;
  metadata?: string; // JSON string
}

interface WPKnowledge {
  id: number;
  knowledge_type: string;
  text: string;
  embedding?: string; // JSON string
  embedding_model?: string;
  embedding_dim?: number;
  source_thing_id?: string;
  source_field?: string;
  labels?: string; // JSON string
  metadata?: string; // JSON string
  created_at: string;
  updated_at: string;
}

// ============================================================================
// WORDPRESS PROVIDER IMPLEMENTATION
// ============================================================================

export const makeWordPressProvider = (config: WordPressProviderConfig): DataProvider => {
  const api = new WordPressAPI(config.url, config.apiKey, config.username);

  // ===== ID CONVERTERS =====

  const wpIdToOneId = (postType: string, wpId: number): string => {
    return `wp_${postType}_${wpId}`;
  };

  const oneIdToWpId = (oneId: string): number => {
    const match = oneId.match(/^wp_[^_]+_(\d+)$/);
    if (!match) throw new Error(`Invalid ONE ID for WordPress: ${oneId}`);
    return parseInt(match[1], 10);
  };

  const parseOneId = (oneId: string): { wpId: number; postType: string } => {
    const match = oneId.match(/^wp_([^_]+)_(\d+)$/);
    if (!match) throw new Error(`Invalid ONE ID for WordPress: ${oneId}`);
    return {
      postType: match[1],
      wpId: parseInt(match[2], 10),
    };
  };

  // ===== STATUS MAPPERS =====

  const mapOntologyStatusToWP = (status: string): string => {
    const mapping: Record<string, string> = {
      draft: "draft",
      active: "publish",
      published: "publish",
      archived: "trash",
      pending: "pending",
    };
    return mapping[status] || "draft";
  };

  const mapWPStatusToOntology = (wpStatus: string): string => {
    const mapping: Record<string, string> = {
      draft: "draft",
      publish: "active",
      pending: "pending",
      private: "active",
      trash: "archived",
      "auto-draft": "draft",
    };
    return mapping[wpStatus] || "draft";
  };

  // ===== TYPE MAPPERS =====

  const mapOntologyTypeToWP = (type: string): string => {
    const mapping: Record<string, string> = {
      course: "course",
      lesson: "lesson",
      creator: "user",
      quiz: "quiz",
      certificate: "certificate",
      token: "product", // WooCommerce
      external_agent: "agent",
      external_workflow: "workflow",
      external_connection: "connection",
      blog_post: "post",
      page: "page",
    };
    return mapping[type] || "post";
  };

  const mapWPTypeToOntology = (wpType: string): string => {
    const mapping: Record<string, string> = {
      course: "course",
      lesson: "lesson",
      user: "creator",
      quiz: "quiz",
      certificate: "certificate",
      product: "token",
      agent: "external_agent",
      workflow: "external_workflow",
      connection: "external_connection",
      post: "blog_post",
      page: "page",
    };
    return mapping[wpType] || "blog_post";
  };

  // ===== MAPPERS =====

  const mapWPPostToThing = async (post: WPPost, thingType: string): Promise<Thing> => {
    // Get ACF fields if available
    let acfFields = {};
    try {
      const acfResponse = await api.get(`/acf/v3/posts/${post.id}`);
      const acfData = await acfResponse.json();
      acfFields = acfData.acf || {};
    } catch (e) {
      // ACF not available or no fields
    }

    return {
      _id: wpIdToOneId(post.type, post.id),
      type: thingType,
      name: typeof post.title === 'string' ? post.title : (post.title?.rendered || ''),
      status: mapWPStatusToOntology(post.status) as any,
      properties: {
        organizationId: post.meta?._one_organization_id || config.organizationId,
        content: post.content?.rendered || post.content,
        excerpt: post.excerpt?.rendered || post.excerpt,
        slug: post.slug,
        wpPostId: post.id,
        wpPostType: post.type,
        author: post.author,
        featuredImage: post.featured_media,
        categories: post.categories,
        tags: post.tags,
        ...transformACFToProperties(acfFields),
      },
      createdAt: new Date(post.date).getTime(),
      updatedAt: new Date(post.modified).getTime(),
    };
  };

  const mapWPUserToThing = (user: WPUser): Thing => ({
    _id: wpIdToOneId("user", user.id),
    type: "creator",
    name: user.name,
    status: "active" as any,
    createdAt: user.registered_date ? new Date(user.registered_date).getTime() : Date.now(),
    updatedAt: Date.now(),
    properties: {
      organizationId: config.organizationId,
      email: user.email,
      username: user.slug,
      bio: user.description,
      url: user.url,
      avatar: Object.values(user.avatar_urls)[0],
      wpUserId: user.id,
      role: mapWPRoleToONE(user.roles?.[0] || "subscriber"),
      registeredDate: user.registered_date,
    },
  });

  const transformPropertiesToACF = (properties: any): Record<string, any> => {
    const acfFields: Record<string, any> = {};

    // Map common fields
    if (properties.duration) acfFields.duration = properties.duration;
    if (properties.price) acfFields.price = properties.price;
    if (properties.currency) acfFields.currency = properties.currency;
    if (properties.difficulty) acfFields.difficulty = properties.difficulty;
    if (properties.videoUrl) acfFields.video_url = properties.videoUrl;
    if (properties.prerequisites) {
      acfFields.prerequisites = JSON.stringify(properties.prerequisites);
    }

    // Store full properties as JSON
    acfFields._one_properties = JSON.stringify(properties);

    return acfFields;
  };

  const transformACFToProperties = (acfFields: any): Record<string, any> => {
    const properties: Record<string, any> = {};

    // Parse stored properties JSON
    if (acfFields._one_properties) {
      try {
        Object.assign(properties, JSON.parse(acfFields._one_properties));
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Map known ACF fields
    if (acfFields.duration) properties.duration = acfFields.duration;
    if (acfFields.price) properties.price = acfFields.price;
    if (acfFields.currency) properties.currency = acfFields.currency;
    if (acfFields.difficulty) properties.difficulty = acfFields.difficulty;
    if (acfFields.video_url) properties.videoUrl = acfFields.video_url;
    if (acfFields.prerequisites) {
      try {
        properties.prerequisites = JSON.parse(acfFields.prerequisites);
      } catch (e) {
        properties.prerequisites = acfFields.prerequisites;
      }
    }

    return properties;
  };

  const mapWPRoleToONE = (wpRole: string): string => {
    const mapping: Record<string, string> = {
      administrator: "org_owner",
      editor: "org_user",
      author: "org_user",
      contributor: "org_user",
      subscriber: "customer",
    };
    return mapping[wpRole] || "customer";
  };

  const mapONERoleToWP = (oneRole: string): string => {
    const mapping: Record<string, string> = {
      org_owner: "administrator",
      org_user: "editor",
      customer: "subscriber",
    };
    return mapping[oneRole] || "subscriber";
  };

  // ============================================================================
  // DATAPROVIDER INTERFACE IMPLEMENTATION
  // ============================================================================

  return {
    auth: {} as any, // WordPress provider doesn't handle auth directly

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
            const { wpId, postType } = parseOneId(id);

            if (postType === "user") {
              const response = await api.get(`/wp/v2/users/${wpId}`);
              const user = await response.json();
              return mapWPUserToThing(user);
            } else {
              const response = await api.get(`/wp/v2/${postType}/${wpId}`);
              const post = await response.json();
              return mapWPPostToThing(post, mapWPTypeToOntology(postType));
            }
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),

      list: (options?: ListThingsOptions) =>
        Effect.tryPromise({
          try: async () => {
            if (!options?.type) {
              throw new QueryError("WordPress provider requires type for listing things");
            }

            const postType = mapOntologyTypeToWP(options.type);

            // Build WordPress query parameters
            const params = new URLSearchParams({
              per_page: String(options.limit || 10),
              page: String(((options.offset || 0) / (options.limit || 10)) + 1),
            });

            if (options.status) {
              params.append("status", mapOntologyStatusToWP(options.status));
            }

            // Make API request
            const response = await api.get(`/wp/v2/${postType}?${params.toString()}`);
            const wpPosts = await response.json();

            // Transform all posts
            return Promise.all(
              wpPosts.map((post: WPPost) => mapWPPostToThing(post, options.type!))
            );
          },
          catch: (error) => new QueryError("Failed to list WordPress posts", error),
        }),

      create: (input: CreateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const postType = mapOntologyTypeToWP(input.type);

            // Transform ontology thing to WordPress post
            const wpPost = {
              title: input.name,
              status: mapOntologyStatusToWP(input.status || "draft"),
              content: input.properties.content || "",
              excerpt: input.properties.excerpt || "",
              meta: {
                _one_thing_type: input.type,
                _one_organization_id: config.organizationId,
                ...transformPropertiesToACF(input.properties),
              },
            };

            // Create post in WordPress
            const response = await api.post(`/wp/v2/${postType}`, wpPost);
            const created = await response.json();

            return wpIdToOneId(postType, created.id);
          },
          catch: (error) => new ThingCreateError(String(error), error),
        }),

      update: (id: string, input: UpdateThingInput) =>
        Effect.tryPromise({
          try: async () => {
            const { wpId, postType } = parseOneId(id);

            const wpUpdates: any = {};

            if (input.name) wpUpdates.title = input.name;
            if (input.status) wpUpdates.status = mapOntologyStatusToWP(input.status);
            if (input.properties) {
              wpUpdates.meta = transformPropertiesToACF(input.properties);
            }

            await api.post(`/wp/v2/${postType}/${wpId}`, wpUpdates);
          },
          catch: (error) => new ThingUpdateError(id, String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const { wpId, postType } = parseOneId(id);
            await api.delete(`/wp/v2/${postType}/${wpId}?force=true`);
          },
          catch: (error) => new ThingNotFoundError(id, String(error)),
        }),
    },

    // ===== CONNECTIONS =====
    connections: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const wpId = oneIdToWpId(id);
            const response = await api.get(`/one/v1/connections/${wpId}`);
            const conn: WPConnection = await response.json();

            return {
              _id: id,
              fromEntityId: conn.from_thing_id,
              toEntityId: conn.to_thing_id,
              relationshipType: conn.relationship_type as any,
              metadata: conn.metadata ? JSON.parse(conn.metadata) : undefined,
              validFrom: conn.valid_from,
              validTo: conn.valid_to,
              createdAt: new Date(conn.created_at).getTime(),
            };
          },
          catch: (error) => new ConnectionNotFoundError(id, String(error)),
        }),

      list: (options?: ListConnectionsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const params = new URLSearchParams({
              from_thing_id: options?.fromEntityId || "",
              to_thing_id: options?.toEntityId || "",
              relationship_type: options?.relationshipType || "",
              per_page: String(options?.limit || 10),
            });

            const response = await api.get(`/one/v1/connections?${params.toString()}`);
            const wpConnections: WPConnection[] = await response.json();

            return wpConnections.map((conn) => ({
              _id: wpIdToOneId("connection", conn.id),
              fromEntityId: conn.from_thing_id,
              toEntityId: conn.to_thing_id,
              relationshipType: conn.relationship_type as any,
              metadata: conn.metadata ? JSON.parse(conn.metadata) : undefined,
              validFrom: conn.valid_from,
              validTo: conn.valid_to,
              createdAt: new Date(conn.created_at).getTime(),
            }));
          },
          catch: (error) => new QueryError("Failed to list WordPress connections", error),
        }),

      create: (input: CreateConnectionInput) =>
        Effect.tryPromise({
          try: async () => {
            const wpConnection = {
              from_thing_id: input.fromEntityId,
              to_thing_id: input.toEntityId,
              relationship_type: input.relationshipType,
              metadata: JSON.stringify(input.metadata || {}),
              valid_from: input.validFrom || Date.now(),
              valid_to: input.validTo,
            };

            const response = await api.post("/one/v1/connections", wpConnection);
            const created: WPConnection = await response.json();

            return wpIdToOneId("connection", created.id);
          },
          catch: (error) => new ConnectionCreateError(String(error), error),
        }),

      delete: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const wpId = oneIdToWpId(id);
            await api.delete(`/one/v1/connections/${wpId}`);
          },
          catch: (error) => new ConnectionNotFoundError(id, String(error)),
        }),
    },

    // ===== EVENTS =====
    events: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const wpId = oneIdToWpId(id);
            const response = await api.get(`/one/v1/events/${wpId}`);
            const event: WPEvent = await response.json();

            return {
              _id: id,
              type: event.type,
              actorId: event.actor_id || "",
              targetId: event.target_id,
              timestamp: new Date(event.timestamp).getTime(),
              metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
            };
          },
          catch: (error) => new QueryError(String(error), error),
        }),

      list: (options?: ListEventsOptions) =>
        Effect.tryPromise({
          try: async () => {
            const params = new URLSearchParams({
              type: options?.type || "",
              actor_id: options?.actorId || "",
              target_id: options?.targetId || "",
              from: String(options?.since || 0),
              to: String(options?.until || Date.now()),
              per_page: String(options?.limit || 10),
            });

            const response = await api.get(`/one/v1/events?${params.toString()}`);
            const wpEvents: WPEvent[] = await response.json();

            return wpEvents.map((event) => ({
              _id: wpIdToOneId("event", event.id),
              type: event.type,
              actorId: event.actor_id || "",
              targetId: event.target_id,
              timestamp: new Date(event.timestamp).getTime(),
              metadata: event.metadata ? JSON.parse(event.metadata) : undefined,
            }));
          },
          catch: (error) => new QueryError("Failed to list WordPress events", error),
        }),

      create: (input: CreateEventInput) =>
        Effect.tryPromise({
          try: async () => {
            const wpEvent = {
              type: input.type,
              actor_id: input.actorId,
              target_id: input.targetId,
              timestamp: new Date(input.metadata?.timestamp || Date.now()).toISOString(),
              metadata: JSON.stringify(input.metadata || {}),
            };

            const response = await api.post("/one/v1/events", wpEvent);
            const created: WPEvent = await response.json();

            return wpIdToOneId("event", created.id);
          },
          catch: (error) => new EventCreateError(String(error), error),
        }),
    },

    // ===== KNOWLEDGE =====
    knowledge: {
      get: (id: string) =>
        Effect.tryPromise({
          try: async () => {
            const wpId = oneIdToWpId(id);
            const response = await api.get(`/one/v1/knowledge/${wpId}`);
            const k: WPKnowledge = await response.json();

            return {
              _id: id,
              knowledgeType: k.knowledge_type as any,
              text: k.text,
              embedding: k.embedding ? JSON.parse(k.embedding) : undefined,
              embeddingModel: k.embedding_model,
              embeddingDim: k.embedding_dim,
              sourceThingId: k.source_thing_id,
              sourceField: k.source_field,
              labels: k.labels ? JSON.parse(k.labels) : undefined,
              metadata: k.metadata ? JSON.parse(k.metadata) : undefined,
              createdAt: new Date(k.created_at).getTime(),
              updatedAt: new Date(k.updated_at).getTime(),
            };
          },
          catch: (error) => new KnowledgeNotFoundError(id, String(error)),
        }),

      list: (options?: SearchKnowledgeOptions) =>
        Effect.tryPromise({
          try: async () => {
            const params = new URLSearchParams({
              knowledge_type: options?.knowledgeType || "",
              per_page: String(options?.limit || 10),
            });

            if (options?.query) {
              params.append("labels", options.query);
            }

            const response = await api.get(`/one/v1/knowledge?${params.toString()}`);
            const wpKnowledge: WPKnowledge[] = await response.json();

            return wpKnowledge.map((k) => ({
              _id: wpIdToOneId("knowledge", k.id),
              knowledgeType: k.knowledge_type as any,
              text: k.text,
              embedding: k.embedding ? JSON.parse(k.embedding) : undefined,
              embeddingModel: k.embedding_model,
              embeddingDim: k.embedding_dim,
              sourceThingId: k.source_thing_id,
              sourceField: k.source_field,
              labels: k.labels ? JSON.parse(k.labels) : undefined,
              metadata: k.metadata ? JSON.parse(k.metadata) : undefined,
              createdAt: new Date(k.created_at).getTime(),
              updatedAt: new Date(k.updated_at).getTime(),
            }));
          },
          catch: (error) => new QueryError("Failed to list WordPress knowledge", error),
        }),

      create: (input: CreateKnowledgeInput) =>
        Effect.tryPromise({
          try: async () => {
            const wpKnowledge = {
              knowledge_type: input.knowledgeType,
              text: input.text || "",
              embedding: input.embedding ? JSON.stringify(input.embedding) : undefined,
              embedding_model: input.embeddingModel,
              embedding_dim: input.embeddingDim,
              source_thing_id: input.sourceThingId,
              source_field: input.sourceField,
              labels: input.labels ? JSON.stringify(input.labels) : undefined,
              metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
            };

            const response = await api.post("/one/v1/knowledge", wpKnowledge);
            const created: WPKnowledge = await response.json();

            return wpIdToOneId("knowledge", created.id);
          },
          catch: (error) => new QueryError(String(error), error),
        }),

      link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) =>
        Effect.fail(
          new QueryError("WordPress provider does not support linking knowledge - implement via custom endpoint")
        ),

      search: (embedding: number[], options?: SearchKnowledgeOptions) =>
        Effect.fail(
          new QueryError("WordPress provider does not support vector search - use Convex hybrid approach")
        ),
    },
  };
};

// ============================================================================
// EFFECT LAYER
// ============================================================================

export const WordPressProviderEnhancedLive = (config: WordPressProviderConfig) =>
  Layer.succeed(DataProviderService, makeWordPressProvider(config));

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export const wordPressProviderEnhanced = (
  url: string,
  apiKey: string,
  organizationId: string,
  username?: string,
  customPostTypes?: string[]
) => makeWordPressProvider({ url, apiKey, organizationId, username, customPostTypes });
