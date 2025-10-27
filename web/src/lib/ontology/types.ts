/**
 * Ontology Provider Interfaces
 *
 * Core types for the 6-dimension ontology provider system.
 * All backend implementations (Convex, Markdown, HTTP, etc.) must implement IOntologyProvider.
 */

// ============================================================================
// Core Ontology Types
// ============================================================================

export interface Group {
  _id: string;
  slug: string;
  name: string;
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization";
  parentGroupId?: string;
  description?: string;
  metadata?: Record<string, any>;
  settings?: {
    visibility?: "public" | "private";
    joinPolicy?: "open" | "invite_only" | "approval_required";
    plan?: "starter" | "pro" | "enterprise";
    limits?: {
      users?: number;
      storage?: number;
      apiCalls?: number;
    };
  };
  status: "active" | "archived";
  createdAt: number;
  updatedAt: number;
}

export interface Person {
  _id: string;
  groupId: string;
  email: string;
  name?: string;
  role: "platform_owner" | "org_owner" | "org_user" | "customer";
  properties?: Record<string, any>;
  status: "active" | "inactive";
  createdAt: number;
  updatedAt: number;
}

export interface Thing {
  _id: string;
  groupId: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Connection {
  _id: string;
  groupId: string;
  fromThingId: string;
  toThingId: string;
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
  _id: string;
  groupId: string;
  type: string;
  actorId?: string;
  targetId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface Knowledge {
  _id: string;
  groupId: string;
  thingId: string;
  label: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  createdAt: number;
}

// ============================================================================
// Input Types for Create Operations
// ============================================================================

export interface CreateGroupInput {
  slug: string;
  name: string;
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization";
  parentGroupId?: string;
  description?: string;
  metadata?: Record<string, any>;
  settings?: Group["settings"];
}

export interface UpdateGroupInput {
  name?: string;
  description?: string;
  metadata?: Record<string, any>;
  settings?: Group["settings"];
  status?: "active" | "archived";
}

export interface CreatePersonInput {
  groupId: string;
  email: string;
  name?: string;
  role: "platform_owner" | "org_owner" | "org_user" | "customer";
  properties?: Record<string, any>;
}

export interface UpdatePersonInput {
  name?: string;
  role?: "platform_owner" | "org_owner" | "org_user" | "customer";
  properties?: Record<string, any>;
  status?: "active" | "inactive";
}

export interface CreateThingInput {
  groupId: string;
  type: string;
  name: string;
  properties?: Record<string, any>;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
}

export interface UpdateThingInput {
  name?: string;
  properties?: Record<string, any>;
  status?: "active" | "inactive" | "draft" | "published" | "archived";
}

export interface CreateConnectionInput {
  groupId: string;
  fromThingId: string;
  toThingId: string;
  relationshipType: string;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
}

export interface CreateEventInput {
  groupId: string;
  type: string;
  actorId?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}

export interface CreateKnowledgeInput {
  groupId: string;
  thingId: string;
  label: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

// ============================================================================
// Filter Types for List Operations
// ============================================================================

export interface Filter {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GroupFilter extends Filter {
  type?: string;
  status?: "active" | "archived";
  parentGroupId?: string;
}

export interface PersonFilter extends Filter {
  groupId?: string;
  role?: string;
  status?: "active" | "inactive";
}

export interface ThingFilter extends Filter {
  groupId?: string;
  type?: string;
  status?: string;
  search?: string;
}

export interface ConnectionFilter extends Filter {
  groupId?: string;
  fromThingId?: string;
  toThingId?: string;
  relationshipType?: string;
}

export interface EventFilter extends Filter {
  groupId?: string;
  type?: string;
  actorId?: string;
  targetId?: string;
  startTime?: number;
  endTime?: number;
}

export interface KnowledgeFilter extends Filter {
  groupId?: string;
  thingId?: string;
  label?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export class OntologyError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "OntologyError";
  }
}

export class EntityNotFoundError extends OntologyError {
  constructor(entityType: string, id: string) {
    super("ENTITY_NOT_FOUND", `${entityType} not found: ${id}`, { entityType, id });
    this.name = "EntityNotFoundError";
  }
}

export class ValidationError extends OntologyError {
  constructor(field: string, message: string) {
    super("VALIDATION_ERROR", `Validation error on ${field}: ${message}`, { field });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends OntologyError {
  constructor(message: string = "Unauthorized") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}

export class NotImplementedError extends OntologyError {
  constructor(method: string) {
    super("NOT_IMPLEMENTED", `Method not implemented: ${method}`, { method });
    this.name = "NotImplementedError";
  }
}

// ============================================================================
// Provider Interface
// ============================================================================

export interface IOntologyProvider {
  // Groups dimension
  groups: {
    list(filter?: GroupFilter): Promise<Group[]>;
    get(id: string): Promise<Group | null>;
    create(data: CreateGroupInput): Promise<Group>;
    update(id: string, data: UpdateGroupInput): Promise<Group>;
    delete(id: string): Promise<void>;
  };

  // People dimension
  people: {
    list(filter?: PersonFilter): Promise<Person[]>;
    get(id: string): Promise<Person | null>;
    create(data: CreatePersonInput): Promise<Person>;
    update(id: string, data: UpdatePersonInput): Promise<Person>;
    current(): Promise<Person | null>;
    delete(id: string): Promise<void>;
  };

  // Things dimension (entities)
  things: {
    list(filter?: ThingFilter): Promise<Thing[]>;
    get(id: string): Promise<Thing | null>;
    create(data: CreateThingInput): Promise<Thing>;
    update(id: string, data: UpdateThingInput): Promise<Thing>;
    delete(id: string): Promise<void>;
  };

  // Connections dimension (relationships)
  connections: {
    list(filter?: ConnectionFilter): Promise<Connection[]>;
    get(id: string): Promise<Connection | null>;
    create(data: CreateConnectionInput): Promise<Connection>;
    delete(id: string): Promise<void>;
  };

  // Events dimension (actions)
  events: {
    list(filter?: EventFilter): Promise<Event[]>;
    record(data: CreateEventInput): Promise<Event>;
  };

  // Knowledge dimension (vectors/search)
  knowledge: {
    list(filter?: KnowledgeFilter): Promise<Knowledge[]>;
    search(query: string, groupId: string, limit?: number): Promise<Knowledge[]>;
    embed(text: string): Promise<number[]>;
    create(data: CreateKnowledgeInput): Promise<Knowledge>;
  };
}

// ============================================================================
// Provider Factory Type
// ============================================================================

export type ProviderConfig = {
  type: "convex" | "markdown" | "http" | "composite";
  [key: string]: any;
};

export type ProviderFactory = (config: ProviderConfig) => Promise<IOntologyProvider>;
