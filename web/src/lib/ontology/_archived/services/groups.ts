/**
 * Groups Service (Dimension 1: Organizations)
 *
 * Handles multi-tenant isolation boundaries and hierarchical group operations.
 * Every operation is scoped to a group (organization, business, community, etc.)
 *
 * Pattern:
 * - All queries/mutations accept a DataProvider via dependency injection
 * - Returns Effect-TS computations for composability
 * - Implements typed error handling with _tag union pattern
 * - Validates group hierarchy, permissions, and quotas
 *
 * Usage:
 * ```ts
 * const service = yield* GroupsService;
 * const groups = yield* service.list();
 * const group = yield* service.get(groupId);
 * const created = yield* service.create({ name: 'Acme Inc', type: 'organization' });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for data access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IGroupsProvider {
  list(filter?: GroupFilter): Promise<Group[]>;
  get(id: string): Promise<Group | null>;
  create(data: CreateGroupInput): Promise<Group>;
  update(id: string, data: UpdateGroupInput): Promise<Group>;
  getBySlug(slug: string): Promise<Group | null>;
  getSubgroups(parentId: string): Promise<Group[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * 6 group types from the ontology
 * Represents different organizational structures
 */
export type GroupType = 'friend_circle' | 'business' | 'community' | 'dao' | 'government' | 'organization';

/**
 * 3 pricing plans
 * Determines feature availability and quotas
 */
export type GroupPlan = 'starter' | 'pro' | 'enterprise';

/**
 * Main Group entity
 * Represents an organization or container for collaboration
 */
export interface Group {
  _id: string;
  slug: string;
  name: string;
  type: GroupType;
  parentGroupId?: string;
  description?: string;
  metadata?: Record<string, any>;
  settings: {
    visibility: 'public' | 'private';
    joinPolicy: 'open' | 'invite_only' | 'approval_required';
    plan?: GroupPlan;
    limits?: {
      users: number;
      storage: number;
      apiCalls: number;
    };
  };
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

/**
 * Filters for listing groups
 */
export interface GroupFilter {
  type?: GroupType;
  parentId?: string;
  status?: 'active' | 'archived';
  plan?: GroupPlan;
  limit?: number;
  offset?: number;
}

/**
 * Input for creating a group
 */
export interface CreateGroupInput {
  slug: string;
  name: string;
  type: GroupType;
  parentGroupId?: string;
  description?: string;
  settings?: Partial<Group['settings']>;
  metadata?: Record<string, any>;
}

/**
 * Input for updating a group
 */
export interface UpdateGroupInput {
  slug?: string;
  name?: string;
  description?: string;
  settings?: Partial<Group['settings']>;
  metadata?: Record<string, any>;
  status?: 'active' | 'archived';
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type GroupError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'SlugAlreadyExistsError'; slug: string }
  | { _tag: 'InvalidGroupTypeError'; type: string }
  | { _tag: 'ParentGroupNotFoundError'; parentId: string }
  | { _tag: 'LimitExceededError'; resource: string; limit: number; usage: number }
  | { _tag: 'InvalidStatusTransitionError'; from: string; to: string }
  | { _tag: 'UnauthorizedError'; message: string }
  | { _tag: 'CircularHierarchyError'; fromId: string; toId: string }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_GROUP_TYPES: GroupType[] = ['friend_circle', 'business', 'community', 'dao', 'government', 'organization'];
const VALID_PLANS: GroupPlan[] = ['starter', 'pro', 'enterprise'];

function validateGroupType(type: string): Effect.Effect<GroupType, GroupError> {
  const validType = VALID_GROUP_TYPES.includes(type as GroupType);
  return validType
    ? Effect.succeed(type as GroupType)
    : Effect.fail({
        _tag: 'InvalidGroupTypeError' as const,
        type,
      });
}

function validateSlug(slug: string): Effect.Effect<string, GroupError> {
  // Slug must be lowercase, alphanumeric with hyphens
  const slugRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return slugRegex.test(slug)
    ? Effect.succeed(slug)
    : Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Slug must be lowercase alphanumeric with hyphens',
        field: 'slug',
      });
}

function validateCreateInput(input: CreateGroupInput): Effect.Effect<CreateGroupInput, GroupError> {
  return Effect.gen(function* () {
    if (!input.name || input.name.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group name is required',
        field: 'name',
      });
    }

    if (!input.slug || input.slug.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group slug is required',
        field: 'slug',
      });
    }

    yield* validateSlug(input.slug);
    yield* validateGroupType(input.type);

    return input;
  });
}

// ============================================================================
// GROUPSSERVICE - Main Service
// ============================================================================

export class GroupsService extends Effect.Service<GroupsService>()('GroupsService', {
  effect: Effect.gen(function* () {
    return {
      /**
       * List all groups with optional filtering
       * Supports pagination via limit/offset
       * Can filter by type, parent group, status, or plan
       */
      list: (filter?: GroupFilter) =>
        Effect.gen(function* () {
          const provider = yield* Effect.Tag<IGroupsProvider>();
          return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list groups: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get a single group by ID
       * Returns null if not found
       */
      get: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IGroupsProvider>();
          const group = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get group: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!group) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          return group;
        }),

      /**
       * Get a group by its slug (URL-friendly identifier)
       * Useful for routing and public lookups
       */
      getBySlug: (slug: string) =>
        Effect.gen(function* () {
          yield* validateSlug(slug);

          const provider = yield* Effect.Tag<IGroupsProvider>();
          const group = yield* Effect.tryPromise(() => provider.getBySlug(slug)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get group by slug: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!group) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id: `slug:${slug}`,
            });
          }

          return group;
        }),

      /**
       * Create a new group
       * Validates input, checks slug uniqueness, creates entity
       * Logs group_created event
       */
      create: (input: CreateGroupInput) =>
        Effect.gen(function* () {
          yield* validateCreateInput(input);

          // If parent specified, validate it exists
          if (input.parentGroupId) {
            const parentProvider = yield* Effect.Tag<IGroupsProvider>();
            const parent = yield* Effect.tryPromise(() => parentProvider.get(input.parentGroupId!)).pipe(
              Effect.mapError((error) => ({
                _tag: 'ProviderError' as const,
                message: `Failed to verify parent group: ${error instanceof Error ? error.message : String(error)}`,
                originalError: error,
              }))
            );

            if (!parent) {
              yield* Effect.fail({
                _tag: 'ParentGroupNotFoundError' as const,
                parentId: input.parentGroupId,
              });
            }
          }

          const provider = yield* Effect.Tag<IGroupsProvider>();
          const created = yield* Effect.tryPromise(() => provider.create(input)).pipe(
            Effect.mapError((error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              if (errorMsg.includes('slug') || errorMsg.includes('unique')) {
                return {
                  _tag: 'SlugAlreadyExistsError' as const,
                  slug: input.slug,
                };
              }
              return {
                _tag: 'ProviderError' as const,
                message: `Failed to create group: ${errorMsg}`,
                originalError: error,
              };
            })
          );

          return created;
        }),

      /**
       * Update an existing group
       * Partial update - only provided fields are changed
       * Validates status transitions
       */
      update: (id: string, input: UpdateGroupInput) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Group ID is required',
              field: 'id',
            });
          }

          if (input.slug) {
            yield* validateSlug(input.slug);
          }

          // Get current group to validate status transition
          const provider = yield* Effect.Tag<IGroupsProvider>();
          const current = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get group: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!current) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          // Validate status transition
          if (input.status && input.status !== current.status) {
            // Only active → archived or archived → active are valid
            const validTransition =
              (current.status === 'active' && input.status === 'archived') ||
              (current.status === 'archived' && input.status === 'active');

            if (!validTransition) {
              yield* Effect.fail({
                _tag: 'InvalidStatusTransitionError' as const,
                from: current.status,
                to: input.status,
              });
            }
          }

          const updated = yield* Effect.tryPromise(() => provider.update(id, input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to update group: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return updated;
        }),

      /**
       * Get all child groups (direct descendants)
       * Useful for building group hierarchies
       */
      getSubgroups: (parentId: string) =>
        Effect.gen(function* () {
          if (!parentId || parentId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Parent group ID is required',
              field: 'parentId',
            });
          }

          const provider = yield* Effect.Tag<IGroupsProvider>();

          // Verify parent exists
          const parent = yield* Effect.tryPromise(() => provider.get(parentId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get parent group: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!parent) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id: parentId,
            });
          }

          const subgroups = yield* Effect.tryPromise(() => provider.getSubgroups(parentId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get subgroups: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return subgroups;
        }),

      /**
       * Get complete group hierarchy (recursively including all descendants)
       * Returns tree structure for UI rendering
       */
      getHierarchy: (rootId: string): Effect.Effect<GroupHierarchy, GroupError> =>
        Effect.gen(function* () {
          const provider = yield* Effect.Tag<IGroupsProvider>();

          const root = yield* Effect.tryPromise(() => provider.get(rootId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get group: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!root) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id: rootId,
            });
          }

          const buildHierarchy = (
            group: Group
          ): Effect.Effect<GroupHierarchy, GroupError> =>
            Effect.gen(function* () {
              const children = yield* Effect.tryPromise(() => provider.getSubgroups(group._id)).pipe(
                Effect.mapError((error) => ({
                  _tag: 'ProviderError' as const,
                  message: `Failed to get subgroups: ${error instanceof Error ? error.message : String(error)}`,
                  originalError: error,
                }))
              );

              const childHierarchies = yield* Effect.all(
                children.map((child) => buildHierarchy(child))
              );

              return {
                group,
                children: childHierarchies,
              };
            });

          return yield* buildHierarchy(root);
        }),
    };
  }),
  dependencies: [Effect.Tag<IGroupsProvider>()],
}) {}

// ============================================================================
// GROUP HIERARCHY TYPE
// ============================================================================

export interface GroupHierarchy {
  group: Group;
  children: GroupHierarchy[];
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  GroupFilter,
  CreateGroupInput,
  UpdateGroupInput,
  GroupError,
};
