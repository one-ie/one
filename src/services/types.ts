/**
 * Service Layer Types
 *
 * Type definitions for backend-agnostic business logic services.
 * Includes error types, argument types, and result types for all 6-dimension operations.
 */

// ============================================================================
// ERROR TYPES (Tagged Unions for Effect.ts)
// ============================================================================

// ThingService Errors
export type ThingError =
  | { _tag: "ValidationError"; message: string; field?: string }
  | { _tag: "BusinessRuleError"; message: string; rule: string }
  | { _tag: "NotFoundError"; id: string; entityType: string }
  | { _tag: "UnauthorizedError"; userId: string; action: string }
  | { _tag: "LimitExceededError"; resource: string; limit: number; usage: number }
  | { _tag: "InvalidStatusTransitionError"; from: string; to: string }
  | { _tag: "InvalidTypeError"; type: string; validTypes: string[] };

// ConnectionService Errors
export type ConnectionError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "DuplicateConnectionError"; fromId: string; toId: string; type: string }
  | { _tag: "InvalidRelationshipTypeError"; type: string; validTypes: string[] }
  | { _tag: "ThingNotFoundError"; id: string };

// EventService Errors
export type EventError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "InvalidEventTypeError"; type: string; validTypes: string[] };

// OrganizationService Errors
export type OrganizationError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "NotFoundError"; id: string }
  | { _tag: "LimitExceededError"; resource: string }
  | { _tag: "InvalidPlanError"; plan: string };

// PeopleService Errors
export type PeopleError =
  | { _tag: "NotFoundError"; id: string }
  | { _tag: "UnauthorizedError"; userId: string; action: string }
  | { _tag: "InvalidRoleError"; role: string };

// KnowledgeService Errors
export type KnowledgeError =
  | { _tag: "ValidationError"; message: string }
  | { _tag: "EmbeddingError"; message: string }
  | { _tag: "NotFoundError"; id: string };

// ============================================================================
// SERVICE ARG TYPES
// ============================================================================

// Thing Args
export type CreateThingArgs = {
  type: string;
  name: string;
  organizationId?: string;
  creatorId?: string;
  properties: any;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
};

export type UpdateThingArgs = {
  name?: string;
  properties?: any;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
  actorId?: string;
};

export type ThingFilter = {
  type?: string;
  organizationId?: string;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
  createdAfter?: number;
  createdBefore?: number;
  limit?: number;
};

// Connection Args
export type CreateConnectionArgs = {
  fromThingId: string;
  toThingId: string;
  relationshipType: string;
  metadata?: any;
  validFrom?: number;
  validTo?: number;
  actorId?: string;
};

export type ConnectionFilter = {
  fromThingId?: string;
  toThingId?: string;
  relationshipType?: string;
  validAt?: number;
};

// Event Args
export type CreateEventArgs = {
  type: string;
  actorId: string;
  targetId?: string;
  timestamp?: number;
  metadata?: any;
};

export type EventFilter = {
  type?: string;
  actorId?: string;
  targetId?: string;
  timestampFrom?: number;
  timestampTo?: number;
  limit?: number;
  orderBy?: "timestamp";
  orderDirection?: "asc" | "desc";
  [key: string]: any; // For metadata filters
};

// Organization Args
export type CreateOrganizationArgs = {
  name: string;
  slug: string;
  plan?: "starter" | "pro" | "enterprise";
  creatorId?: string;
};

// Knowledge Args
export type CreateKnowledgeArgs = {
  knowledgeType: "label" | "document" | "chunk" | "vector_only";
  text?: string;
  embedding?: number[];
  embeddingModel?: string;
  sourceThingId?: string;
  sourceField?: string;
  labels?: string[];
  metadata?: any;
};

export type ChunkOptions = {
  size?: number; // Default: 800 tokens
  overlap?: number; // Default: 200 tokens
};

export type RAGResult = {
  chunks: any[];
  scores: number[];
  answer?: string;
};

// ============================================================================
// RESULT TYPES
// ============================================================================

export type EnrichedThing = {
  _id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  status: "active" | "inactive" | "draft" | "published" | "archived";
  createdAt: number;
  updatedAt: number;
  connections: {
    outgoing: any[];
    incoming: any[];
  };
};

export type GraphNode = {
  thing: any;
  connections: any[];
  depth: number;
};

export type TimeSeries = {
  timestamp: number;
  value: number;
  label: string;
};

export type EntityState = {
  currentState: any;
  eventHistory: any[];
};
