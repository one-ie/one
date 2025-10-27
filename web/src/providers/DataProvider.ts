/**
 * DataProvider Interface - Backend-Agnostic Data Access Layer
 *
 * This interface abstracts all 6 dimensions of the ONE ontology,
 * enabling multiple backend implementations (Convex, WordPress, Notion, etc.)
 * while maintaining a single frontend codebase.
 *
 * Uses Effect.ts for typed errors and dependency injection.
 */

import { Effect, Context } from "effect";

// ============================================================================
// ERROR TYPES
// ============================================================================

export class ThingNotFoundError {
  readonly _tag = "ThingNotFoundError";
  constructor(readonly id: string, readonly message?: string) {}
}

export class ThingCreateError {
  readonly _tag = "ThingCreateError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class ThingUpdateError {
  readonly _tag = "ThingUpdateError";
  constructor(readonly id: string, readonly message: string, readonly cause?: unknown) {}
}

export class ConnectionNotFoundError {
  readonly _tag = "ConnectionNotFoundError";
  constructor(readonly id: string, readonly message?: string) {}
}

export class ConnectionCreateError {
  readonly _tag = "ConnectionCreateError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class EventCreateError {
  readonly _tag = "EventCreateError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class KnowledgeNotFoundError {
  readonly _tag = "KnowledgeNotFoundError";
  constructor(readonly id: string, readonly message?: string) {}
}

export class GroupNotFoundError {
  readonly _tag = "GroupNotFoundError";
  constructor(readonly id: string, readonly message?: string) {}
}

export class GroupCreateError {
  readonly _tag = "GroupCreateError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

export class QueryError {
  readonly _tag = "QueryError";
  constructor(readonly message: string, readonly cause?: unknown) {}
}

// ============================================================================
// AUTH ERROR TYPES
// ============================================================================

export class InvalidCredentialsError {
  readonly _tag = "InvalidCredentials";
  constructor(readonly message: string = "Invalid email or password") {}
}

export class UserNotFoundError {
  readonly _tag = "UserNotFound";
  constructor(readonly message: string = "User not found") {}
}

export class EmailAlreadyExistsError {
  readonly _tag = "EmailAlreadyExists";
  constructor(readonly message: string = "Email already registered") {}
}

export class WeakPasswordError {
  readonly _tag = "WeakPassword";
  constructor(readonly message: string = "Password must be at least 8 characters") {}
}

export class InvalidTokenError {
  readonly _tag = "InvalidToken";
  constructor(readonly message: string = "Invalid or expired token") {}
}

export class TokenExpiredError {
  readonly _tag = "TokenExpired";
  constructor(readonly message: string = "Token has expired") {}
}

export class NetworkError {
  readonly _tag = "NetworkError";
  constructor(readonly message: string = "Network connection error") {}
}

export class RateLimitExceededError {
  readonly _tag = "RateLimitExceeded";
  constructor(readonly message: string = "Too many requests, please wait") {}
}

export class EmailNotVerifiedError {
  readonly _tag = "EmailNotVerified";
  constructor(readonly message: string = "Email address not verified") {}
}

export class TwoFactorRequiredError {
  readonly _tag = "TwoFactorRequired";
  constructor(readonly message: string = "Two-factor authentication required") {}
}

export class Invalid2FACodeError {
  readonly _tag = "Invalid2FACode";
  constructor(readonly message: string = "Invalid 2FA code") {}
}

export type AuthError =
  | InvalidCredentialsError
  | UserNotFoundError
  | EmailAlreadyExistsError
  | WeakPasswordError
  | InvalidTokenError
  | TokenExpiredError
  | NetworkError
  | RateLimitExceededError
  | EmailNotVerifiedError
  | TwoFactorRequiredError
  | Invalid2FACodeError;

export type DataProviderError =
  | ThingNotFoundError
  | ThingCreateError
  | ThingUpdateError
  | ConnectionNotFoundError
  | ConnectionCreateError
  | EventCreateError
  | KnowledgeNotFoundError
  | GroupNotFoundError
  | GroupCreateError
  | QueryError
  | AuthError;

// ============================================================================
// CORE TYPES (Match Convex Schema)
// ============================================================================

export type ThingStatus = "active" | "inactive" | "draft" | "published" | "archived";

export type GroupType = "friend_circle" | "business" | "community" | "dao" | "government" | "organization";
export type GroupStatus = "active" | "archived";

export interface Group {
  _id: string;
  slug: string;
  name: string;
  type: GroupType;
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
  status: GroupStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Thing {
  _id: string;
  type: string;
  name: string;
  properties: Record<string, any>;
  status: ThingStatus;
  groupId?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export type ConnectionType =
  | "owns"
  | "created_by"
  | "clone_of"
  | "trained_on"
  | "powers"
  | "authored"
  | "generated_by"
  | "published_to"
  | "part_of"
  | "references"
  | "member_of"
  | "following"
  | "moderates"
  | "participated_in"
  | "manages"
  | "reports_to"
  | "collaborates_with"
  | "holds_tokens"
  | "staked_in"
  | "earned_from"
  | "purchased"
  | "enrolled_in"
  | "completed"
  | "teaching"
  | "transacted"
  | "notified"
  | "referred"
  | "communicated"
  | "delegated"
  | "approved"
  | "fulfilled";

export interface Connection {
  _id: string;
  fromEntityId: string;
  toEntityId: string;
  relationshipType: ConnectionType;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  groupId?: string;
  createdAt: number;
  updatedAt?: number;
  deletedAt?: number;
}

export interface Event {
  _id: string;
  type: string;
  actorId: string;
  targetId?: string;
  timestamp: number;
  groupId?: string;
  metadata?: Record<string, any>;
}

export type KnowledgeType = "label" | "document" | "chunk" | "vector_only";

export interface Knowledge {
  _id: string;
  knowledgeType: KnowledgeType;
  text?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDim?: number;
  sourceThingId?: string;
  sourceField?: string;
  chunk?: {
    index: number;
    start?: number;
    end?: number;
    tokenCount?: number;
    overlap?: number;
  };
  labels?: string[];
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface ThingKnowledge {
  _id: string;
  thingId: string;
  knowledgeId: string;
  role?: "label" | "summary" | "chunk_of" | "caption" | "keyword";
  metadata?: Record<string, any>;
  createdAt: number;
}

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface CreateThingInput {
  type: string;
  name: string;
  properties: Record<string, any>;
  status?: ThingStatus;
  groupId?: string;
}

export interface UpdateThingInput {
  name?: string;
  properties?: Record<string, any>;
  status?: ThingStatus;
}

export interface CreateConnectionInput {
  fromEntityId: string;
  toEntityId: string;
  relationshipType: ConnectionType;
  metadata?: Record<string, any>;
  strength?: number;
  validFrom?: number;
  validTo?: number;
  groupId?: string;
}

export interface CreateEventInput {
  type: string;
  actorId: string;
  targetId?: string;
  groupId?: string;
  metadata?: Record<string, any>;
}

export interface CreateGroupInput {
  slug: string;
  name: string;
  type: GroupType;
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
}

export interface CreateKnowledgeInput {
  knowledgeType: KnowledgeType;
  text?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingDim?: number;
  sourceThingId?: string;
  sourceField?: string;
  chunk?: Knowledge["chunk"];
  labels?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// QUERY OPTIONS
// ============================================================================

export interface ListGroupsOptions {
  type?: GroupType;
  status?: GroupStatus;
  parentGroupId?: string;
  limit?: number;
  offset?: number;
}

export interface UpdateGroupInput {
  name?: string;
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
  status?: GroupStatus;
}

export interface ListThingsOptions {
  type?: string;
  status?: ThingStatus;
  groupId?: string;
  limit?: number;
  offset?: number;
}

export interface ListConnectionsOptions {
  fromEntityId?: string;
  toEntityId?: string;
  relationshipType?: ConnectionType;
  limit?: number;
  offset?: number;
}

export interface ListEventsOptions {
  type?: string;
  actorId?: string;
  targetId?: string;
  since?: number;
  until?: number;
  limit?: number;
  offset?: number;
}

export interface SearchKnowledgeOptions {
  query?: string;
  embedding?: number[];
  sourceThingId?: string;
  knowledgeType?: KnowledgeType;
  limit?: number;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

export interface AuthResult {
  success: boolean;
  token?: string;
  userId?: string;
  user?: User;
}

export interface TwoFactorStatus {
  enabled: boolean;
  hasSetup: boolean;
}

export interface TwoFactorSetup {
  secret: string;
  backupCodes: string[];
}

export interface LoginArgs {
  email: string;
  password: string;
}

export interface SignupArgs {
  email: string;
  password: string;
  name?: string;
}

export interface MagicLinkArgs {
  token: string;
}

export interface PasswordResetArgs {
  email: string;
}

export interface PasswordResetCompleteArgs {
  token: string;
  newPassword: string;
}

export interface VerifyEmailArgs {
  token: string;
}

export interface Verify2FAArgs {
  code: string;
}

export interface Disable2FAArgs {
  password: string;
}

// ============================================================================
// DATA PROVIDER INTERFACE
// ============================================================================

export interface DataProvider {
  // ===== GROUPS =====
  groups: {
    get: (id: string) => Effect.Effect<Group, GroupNotFoundError>;
    getBySlug: (slug: string) => Effect.Effect<Group, GroupNotFoundError>;
    list: (options?: ListGroupsOptions) => Effect.Effect<Group[], QueryError>;
    create: (input: CreateGroupInput) => Effect.Effect<string, GroupCreateError>;
    update: (id: string, input: UpdateGroupInput) => Effect.Effect<void, DataProviderError>;
    delete: (id: string) => Effect.Effect<void, GroupNotFoundError>;
  };

  // ===== THINGS =====
  things: {
    get: (id: string) => Effect.Effect<Thing, ThingNotFoundError>;
    list: (options?: ListThingsOptions) => Effect.Effect<Thing[], QueryError>;
    create: (input: CreateThingInput) => Effect.Effect<string, ThingCreateError>;
    update: (id: string, input: UpdateThingInput) => Effect.Effect<void, ThingUpdateError>;
    delete: (id: string) => Effect.Effect<void, ThingNotFoundError>;
  };

  // ===== CONNECTIONS =====
  connections: {
    get: (id: string) => Effect.Effect<Connection, ConnectionNotFoundError>;
    list: (options?: ListConnectionsOptions) => Effect.Effect<Connection[], QueryError>;
    create: (input: CreateConnectionInput) => Effect.Effect<string, ConnectionCreateError>;
    delete: (id: string) => Effect.Effect<void, ConnectionNotFoundError>;
  };

  // ===== EVENTS =====
  events: {
    get: (id: string) => Effect.Effect<Event, DataProviderError>;
    list: (options?: ListEventsOptions) => Effect.Effect<Event[], QueryError>;
    create: (input: CreateEventInput) => Effect.Effect<string, EventCreateError>;
  };

  // ===== KNOWLEDGE =====
  knowledge: {
    get: (id: string) => Effect.Effect<Knowledge, KnowledgeNotFoundError>;
    list: (options?: SearchKnowledgeOptions) => Effect.Effect<Knowledge[], QueryError>;
    create: (input: CreateKnowledgeInput) => Effect.Effect<string, DataProviderError>;
    link: (thingId: string, knowledgeId: string, role?: ThingKnowledge["role"]) => Effect.Effect<string, DataProviderError>;
    search: (embedding: number[], options?: SearchKnowledgeOptions) => Effect.Effect<Knowledge[], QueryError>;
  };

  // ===== AUTH =====
  auth: {
    login: (args: LoginArgs) => Effect.Effect<AuthResult, AuthError>;
    signup: (args: SignupArgs) => Effect.Effect<AuthResult, AuthError>;
    logout: () => Effect.Effect<void, AuthError>;
    getCurrentUser: () => Effect.Effect<User | null, AuthError>;
    magicLinkAuth: (args: MagicLinkArgs) => Effect.Effect<AuthResult, AuthError>;
    passwordReset: (args: PasswordResetArgs) => Effect.Effect<void, AuthError>;
    passwordResetComplete: (args: PasswordResetCompleteArgs) => Effect.Effect<void, AuthError>;
    verifyEmail: (args: VerifyEmailArgs) => Effect.Effect<AuthResult, AuthError>;
    get2FAStatus: () => Effect.Effect<TwoFactorStatus, AuthError>;
    setup2FA: () => Effect.Effect<TwoFactorSetup, AuthError>;
    verify2FA: (args: Verify2FAArgs) => Effect.Effect<void, AuthError>;
    disable2FA: (args: Disable2FAArgs) => Effect.Effect<void, AuthError>;
  };
}

// ============================================================================
// DEPENDENCY INJECTION TAG
// ============================================================================

export class DataProviderService extends Context.Tag("DataProvider")<
  DataProviderService,
  DataProvider
>() {}
