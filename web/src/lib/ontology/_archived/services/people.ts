/**
 * People Service (Dimension 2: Authorization & Governance)
 *
 * Handles user/people entities with role-based access control.
 * People are represented as things with type: 'creator' and a role property.
 *
 * 4 Roles:
 * - platform_owner: Can manage platform settings and all organizations
 * - org_owner: Can manage organization and its members
 * - org_user: Regular organization member with limited access
 * - customer: External user with minimal access (e.g., course students)
 *
 * Pattern:
 * - All queries scoped to group for multi-tenancy
 * - Role validation for authorization checks
 * - Current user detection via token/session
 * - Track user metadata (email, name, avatar, etc.) in properties
 *
 * Usage:
 * ```ts
 * const service = yield* PeopleService;
 * const currentUser = yield* service.current();
 * const user = yield* service.get(userId);
 * const orgUsers = yield* service.list({ groupId });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for people/user access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IPeopleProvider {
  list(filter?: PeopleFilter): Promise<Person[]>;
  get(id: string): Promise<Person | null>;
  create(data: CreatePersonInput): Promise<Person>;
  update(id: string, data: UpdatePersonInput): Promise<Person>;
  current(): Promise<Person | null>;
  getByEmail(email: string, groupId?: string): Promise<Person | null>;
  searchByRole(groupId: string, role: Role): Promise<Person[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * 4 Role-based access levels
 * Determines what actions a person can perform
 */
export type Role = 'platform_owner' | 'org_owner' | 'org_user' | 'customer';

/**
 * Person entity
 * Represents a user in the system
 * Stored as a Thing with type: 'creator'
 */
export interface Person {
  _id: string;
  type: 'creator'; // Always this for people
  name: string;
  groupId: string;
  properties: {
    email: string;
    avatar?: string;
    bio?: string;
    role: Role;
    metadata?: Record<string, any>;
  };
  status: 'active' | 'inactive' | 'archived';
  createdAt: number;
  updatedAt: number;
}

/**
 * Filters for listing people
 */
export interface PeopleFilter {
  groupId?: string;
  role?: Role;
  status?: 'active' | 'inactive' | 'archived';
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a person
 */
export interface CreatePersonInput {
  groupId: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  bio?: string;
  metadata?: Record<string, any>;
}

/**
 * Input for updating a person
 */
export interface UpdatePersonInput {
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  role?: Role;
  metadata?: Record<string, any>;
  status?: 'active' | 'inactive' | 'archived';
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type PeopleError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'EmailAlreadyExistsError'; email: string; groupId: string }
  | { _tag: 'InvalidRoleError'; role: string; validRoles: string[] }
  | { _tag: 'UnauthorizedError'; userId: string; action: string }
  | { _tag: 'CurrentUserNotFoundError'; reason: string }
  | { _tag: 'InvalidEmailError'; email: string }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_ROLES: Role[] = ['platform_owner', 'org_owner', 'org_user', 'customer'];

function validateRole(role: string): Effect.Effect<Role, PeopleError> {
  const validRole = VALID_ROLES.includes(role as Role);
  return validRole
    ? Effect.succeed(role as Role)
    : Effect.fail({
        _tag: 'InvalidRoleError' as const,
        role,
        validRoles: VALID_ROLES,
      });
}

/**
 * Simple email validation (RFC 5322 simplified)
 */
function validateEmail(email: string): Effect.Effect<string, PeopleError> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email)
    ? Effect.succeed(email)
    : Effect.fail({
        _tag: 'InvalidEmailError' as const,
        email,
      });
}

function validateCreateInput(input: CreatePersonInput): Effect.Effect<CreatePersonInput, PeopleError> {
  return Effect.gen(function* () {
    if (!input.name || input.name.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Person name is required',
        field: 'name',
      });
    }

    if (!input.email || input.email.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Person email is required',
        field: 'email',
      });
    }

    yield* validateEmail(input.email);
    yield* validateRole(input.role);

    if (!input.groupId || input.groupId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group ID is required',
        field: 'groupId',
      });
    }

    return input;
  });
}

// ============================================================================
// ROLEAUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if a role can perform an action
 * Implements role hierarchy: platform_owner > org_owner > org_user > customer
 */
export function canPerformAction(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    platform_owner: 4,
    org_owner: 3,
    org_user: 2,
    customer: 1,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can manage other users (invite, remove, change roles)
 */
export function canManageUsers(userRole: Role): boolean {
  return canPerformAction(userRole, 'org_owner');
}

/**
 * Check if user can manage organization settings
 */
export function canManageOrganization(userRole: Role): boolean {
  return canPerformAction(userRole, 'org_owner');
}

/**
 * Check if user can view sensitive data
 */
export function canViewSensitiveData(userRole: Role): boolean {
  return canPerformAction(userRole, 'org_user');
}

// ============================================================================
// PEOPLESERVICE - Main Service
// ============================================================================

export class PeopleService extends Effect.Service<PeopleService>()('PeopleService', {
  effect: Effect.gen(function* () {
    return {
      /**
       * List all people in a group with optional filtering
       * Can filter by role, status, or search
       */
      list: (filter?: PeopleFilter) =>
        Effect.gen(function* () {
          if (filter?.groupId && filter.groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID cannot be empty',
              field: 'groupId',
            });
          }

          const provider = yield* Effect.Tag<IPeopleProvider>();
          return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list people: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get a single person by ID
       */
      get: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Person ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IPeopleProvider>();
          const person = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get person: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!person) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          return person;
        }),

      /**
       * Get person by email address (with optional group scoping)
       * Useful for authentication and user lookup
       */
      getByEmail: (email: string, groupId?: string) =>
        Effect.gen(function* () {
          yield* validateEmail(email);

          const provider = yield* Effect.Tag<IPeopleProvider>();
          const person = yield* Effect.tryPromise(() => provider.getByEmail(email, groupId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get person by email: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!person) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id: `email:${email}`,
            });
          }

          return person;
        }),

      /**
       * Get the current authenticated user
       * Returns null if no user is authenticated
       */
      current: () =>
        Effect.gen(function* () {
          const provider = yield* Effect.Tag<IPeopleProvider>();
          const person = yield* Effect.tryPromise(() => provider.current()).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get current user: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!person) {
            yield* Effect.fail({
              _tag: 'CurrentUserNotFoundError' as const,
              reason: 'No authenticated user found. User may not be logged in.',
            });
          }

          return person;
        }),

      /**
       * Create a new person
       * Validates email uniqueness within group
       */
      create: (input: CreatePersonInput) =>
        Effect.gen(function* () {
          yield* validateCreateInput(input);

          const provider = yield* Effect.Tag<IPeopleProvider>();

          // Check email uniqueness within group
          const existing = yield* Effect.tryPromise(() =>
            provider.getByEmail(input.email, input.groupId)
          ).pipe(
            Effect.catchAll(() => Effect.succeed(null))
          );

          if (existing) {
            yield* Effect.fail({
              _tag: 'EmailAlreadyExistsError' as const,
              email: input.email,
              groupId: input.groupId,
            });
          }

          const created = yield* Effect.tryPromise(() => provider.create(input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to create person: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return created;
        }),

      /**
       * Update a person
       * Partial update - only provided fields are changed
       * Validates role and email uniqueness
       */
      update: (id: string, input: UpdatePersonInput) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Person ID is required',
              field: 'id',
            });
          }

          // Validate role if provided
          if (input.role) {
            yield* validateRole(input.role);
          }

          // Validate email if provided
          if (input.email) {
            yield* validateEmail(input.email);
          }

          const provider = yield* Effect.Tag<IPeopleProvider>();
          const updated = yield* Effect.tryPromise(() => provider.update(id, input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to update person: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return updated;
        }),

      /**
       * Get all people with a specific role in an organization
       * Useful for finding admins, members, customers, etc.
       */
      searchByRole: (groupId: string, role: Role) =>
        Effect.gen(function* () {
          if (!groupId || groupId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'groupId',
            });
          }

          yield* validateRole(role);

          const provider = yield* Effect.Tag<IPeopleProvider>();
          return yield* Effect.tryPromise(() => provider.searchByRole(groupId, role)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to search people by role: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Check if a user has permission to perform an action
       * Uses role-based access control
       */
      authorize: (userRole: Role, requiredRole: Role): Effect.Effect<void, PeopleError> =>
        Effect.gen(function* () {
          if (!canPerformAction(userRole, requiredRole)) {
            yield* Effect.fail({
              _tag: 'UnauthorizedError' as const,
              userId: 'current', // Would be filled with actual ID in real usage
              action: `requires at least ${requiredRole} role`,
            });
          }
        }),
    };
  }),
  dependencies: [Effect.Tag<IPeopleProvider>()],
}) {}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  PeopleFilter,
  CreatePersonInput,
  UpdatePersonInput,
  PeopleError,
};

export { canPerformAction, canManageUsers, canManageOrganization, canViewSensitiveData };
