/**
 * DataProvider Interface
 *
 * Abstract interface for backend data access.
 * Implementations can be for Convex, WordPress, Supabase, etc.
 *
 * All methods return Effect.Effect for composability and error handling.
 */

import { Effect } from 'effect';
import type { Id } from './convex';

/**
 * Thing (Entity) operations
 */
export interface ThingOperations {
  list: (args: {
    type?: string;
    status?: string;
    organizationId?: Id<'entities'>;
    limit?: number;
    offset?: number;
  }) => Effect.Effect<Thing[], DataProviderError, never>;

  get: (id: Id<'entities'>) => Effect.Effect<Thing, DataProviderError, never>;

  create: (args: {
    type: string;
    name: string;
    properties: Record<string, any>;
    status?: string;
    organizationId?: Id<'entities'>;
  }) => Effect.Effect<Id<'entities'>, DataProviderError, never>;

  update: (args: {
    id: Id<'entities'>;
    name?: string;
    properties?: Record<string, any>;
    status?: string;
  }) => Effect.Effect<Thing, DataProviderError, never>;

  delete: (id: Id<'entities'>) => Effect.Effect<void, DataProviderError, never>;
}

/**
 * Connection (Relationship) operations
 */
export interface ConnectionOperations {
  list: (args: {
    fromEntityId?: Id<'entities'>;
    toEntityId?: Id<'entities'>;
    relationshipType?: string;
    organizationId?: Id<'entities'>;
  }) => Effect.Effect<Connection[], DataProviderError, never>;

  get: (id: Id<'connections'>) => Effect.Effect<Connection, DataProviderError, never>;

  getRelated: (args: {
    entityId: Id<'entities'>;
    relationshipType: string;
    direction?: 'from' | 'to' | 'both';
  }) => Effect.Effect<Thing[], DataProviderError, never>;

  create: (args: {
    fromEntityId: Id<'entities'>;
    toEntityId: Id<'entities'>;
    relationshipType: string;
    metadata?: Record<string, any>;
    strength?: number;
    validFrom?: number;
    validTo?: number;
  }) => Effect.Effect<Id<'connections'>, DataProviderError, never>;

  update: (
    id: Id<'connections'>,
    args: {
      metadata?: Record<string, any>;
      strength?: number;
      validFrom?: number;
      validTo?: number;
    }
  ) => Effect.Effect<Connection, DataProviderError, never>;

  delete: (id: Id<'connections'>) => Effect.Effect<void, DataProviderError, never>;
}

/**
 * Event operations
 */
export interface EventOperations {
  list: (args: {
    type?: string;
    actorId?: Id<'entities'>;
    targetId?: Id<'entities'>;
    startTime?: number;
    endTime?: number;
    limit?: number;
  }) => Effect.Effect<Event[], DataProviderError, never>;

  get: (id: Id<'events'>) => Effect.Effect<Event, DataProviderError, never>;

  create: (args: {
    type: string;
    actorId: Id<'entities'>;
    targetId?: Id<'entities'>;
    metadata?: Record<string, any>;
  }) => Effect.Effect<Id<'events'>, DataProviderError, never>;
}

/**
 * Knowledge operations (for RAG and semantic search)
 */
export interface KnowledgeOperations {
  search: (args: {
    query: string;
    limit?: number;
    threshold?: number;
  }) => Effect.Effect<KnowledgeItem[], DataProviderError, never>;

  create: (args: {
    knowledgeType: 'label' | 'document' | 'chunk' | 'vector_only';
    text?: string;
    embedding?: number[];
    sourceThingId?: Id<'entities'>;
    metadata?: Record<string, any>;
  }) => Effect.Effect<Id<'knowledge'>, DataProviderError, never>;

  linkToThing: (args: {
    thingId: Id<'entities'>;
    knowledgeId: Id<'knowledge'>;
    role?: string;
  }) => Effect.Effect<void, DataProviderError, never>;
}

/**
 * Complete DataProvider interface
 */
export interface DataProvider {
  things: ThingOperations;
  connections: ConnectionOperations;
  events: EventOperations;
  knowledge: KnowledgeOperations;
}

/**
 * Data types matching the backend schema
 */
export interface Thing {
  _id: Id<'entities'>;
  _creationTime: number;
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Connection {
  _id: Id<'connections'>;
  _creationTime: number;
  fromEntityId: Id<'entities'>;
  toEntityId: Id<'entities'>;
  relationshipType: string;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface Event {
  _id: Id<'events'>;
  _creationTime: number;
  type: string;
  actorId: Id<'entities'>;
  targetId?: Id<'entities'>;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface KnowledgeItem {
  _id: Id<'knowledge'>;
  _creationTime: number;
  knowledgeType: 'label' | 'document' | 'chunk' | 'vector_only';
  text?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDim?: number;
  sourceThingId?: Id<'entities'>;
  sourceField?: string;
  chunk?: any;
  labels?: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Error types for DataProvider operations
 */
export type DataProviderError =
  | { _tag: 'NetworkError'; message: string; cause?: unknown }
  | { _tag: 'NotFoundError'; entityId: string }
  | { _tag: 'ValidationError'; message: string; errors: Record<string, string[]> }
  | { _tag: 'UnauthorizedError'; message: string }
  | { _tag: 'RateLimitError'; retryAfter: number }
  | { _tag: 'ServerError'; message: string; status: number };

/**
 * Helper functions for creating errors
 */
export const DataProviderErrorHelpers = {
  network: (message: string, cause?: unknown): DataProviderError => ({
    _tag: 'NetworkError',
    message,
    cause
  }),

  notFound: (entityId: string): DataProviderError => ({
    _tag: 'NotFoundError',
    entityId
  }),

  validation: (message: string, errors: Record<string, string[]>): DataProviderError => ({
    _tag: 'ValidationError',
    message,
    errors
  }),

  unauthorized: (message: string): DataProviderError => ({
    _tag: 'UnauthorizedError',
    message
  }),

  rateLimit: (retryAfter: number): DataProviderError => ({
    _tag: 'RateLimitError',
    retryAfter
  }),

  server: (message: string, status: number): DataProviderError => ({
    _tag: 'ServerError',
    message,
    status
  })
};

/**
 * Provider configuration
 */
export interface ProviderConfig {
  type: 'convex' | 'wordpress' | 'supabase' | 'custom';
  config: Record<string, any>;
}

/**
 * Factory function type for creating providers
 */
export type ProviderFactory = (config: Record<string, any>) => DataProvider;
