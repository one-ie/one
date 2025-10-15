/**
 * useGroups - React hooks for Groups dimension
 *
 * Provides hooks for hierarchical group management.
 * Groups are the primary organization unit in the 6-dimension ontology.
 */

import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';
import type { Id } from '@/types/convex';

// ============================================================================
// TYPES
// ============================================================================

export interface Group {
  _id: Id<"groups">;
  slug: string;
  name: string;
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization";
  parentGroupId?: Id<"groups">;
  description?: string;
  status: "draft" | "active" | "archived";
  settings: {
    visibility: "public" | "private";
    joinPolicy: "open" | "invite_only" | "approval_required";
    plan?: "starter" | "pro" | "enterprise";
  };
  createdAt: number;
  updatedAt: number;
}

export interface GroupFilter {
  type?: Group['type'];
  status?: Group['status'];
  parentGroupId?: Id<"groups">;
  visibility?: 'public' | 'private';
  limit?: number;
}

export interface CreateGroupInput {
  name: string;
  slug: string;
  type: Group['type'];
  parentGroupId?: Id<"groups">;
  description?: string;
  settings?: Partial<Group['settings']>;
}

export interface UpdateGroupInput {
  name?: string;
  slug?: string;
  description?: string;
  status?: Group['status'];
  settings?: Partial<Group['settings']>;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useGroup - Get group by ID
 *
 * @example
 * ```tsx
 * const { data: group, loading } = useGroup(groupId);
 *
 * if (loading) return <Skeleton />;
 * if (!group) return <div>Group not found</div>;
 *
 * return <GroupCard group={group} />;
 * ```
 */
export function useGroup(
  id: Id<"groups"> | null,
  queryOptions?: QueryOptions
): QueryResult<Group> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['group', id];

  const queryFn = async (): Promise<Group> => {
    if (!id) throw new Error('Group ID is required');
    const effect = provider.things.get(id);
    const result = await Effect.runPromise(effect);
    return result as unknown as Group;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!id,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

/**
 * useGroups - List groups
 *
 * @example
 * ```tsx
 * // Get all active groups
 * const { data: groups } = useGroups({ status: 'active' });
 *
 * // Get public communities
 * const { data: communities } = useGroups({
 *   type: 'community',
 *   visibility: 'public'
 * });
 *
 * // Get child groups
 * const { data: subgroups } = useGroups({ parentGroupId: parentId });
 * ```
 */
export function useGroups(
  filter?: GroupFilter,
  queryOptions?: QueryOptions
): QueryResult<Group[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['groups', filter];

  const queryFn = async (): Promise<Group[]> => {
    const effect = provider.things.list({
      type: filter?.type,
      status: filter?.status,
      limit: filter?.limit,
    });
    const results = await Effect.runPromise(effect);

    // Client-side filtering for nested/visibility properties
    let filtered = results as unknown as Group[];

    if (filter?.parentGroupId) {
      filtered = filtered.filter(g => g.parentGroupId === filter.parentGroupId);
    }

    if (filter?.visibility) {
      filtered = filtered.filter(g => g.settings?.visibility === filter.visibility);
    }

    return filtered;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

/**
 * useGroupBySlug - Get group by slug
 *
 * @example
 * ```tsx
 * const { data: group } = useGroupBySlug('my-organization');
 * ```
 */
export function useGroupBySlug(
  slug: string | null,
  queryOptions?: QueryOptions
): QueryResult<Group> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['group', 'slug', slug];

  const queryFn = async (): Promise<Group> => {
    if (!slug) throw new Error('Slug is required');

    // List all groups and find by slug (not ideal, but works with current DataProvider)
    const effect = provider.things.list({ limit: 1000 });
    const results = await Effect.runPromise(effect);
    const groups = results as unknown as Group[];
    const group = groups.find(g => g.slug === slug);

    if (!group) {
      throw new Error(`Group with slug "${slug}" not found`);
    }

    return group;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!slug,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

/**
 * useGroupStats - Get group statistics
 *
 * @example
 * ```tsx
 * const { data: stats } = useGroupStats(groupId);
 * console.log(stats.members, stats.entities, stats.events);
 * ```
 */
export function useGroupStats(
  groupId: Id<"groups"> | null,
  options?: { includeSubgroups?: boolean } & QueryOptions
): QueryResult<{
  members: number;
  entities: number;
  connections: number;
  events: number;
}> {
  const provider = useDataProvider();
  const { includeSubgroups = false, enabled = true, ...reactQueryOptions } = options ?? {};

  const queryKey = ['group', 'stats', groupId, { includeSubgroups }];

  const queryFn = async () => {
    if (!groupId) throw new Error('Group ID is required');

    // Get all entities, connections, events for this group
    const [entities, connections, events] = await Promise.all([
      Effect.runPromise(provider.things.list({ limit: 10000 })),
      Effect.runPromise(provider.connections.list({ limit: 10000 })),
      Effect.runPromise(provider.events.list({ limit: 10000 })),
    ]);

    // Count members (things with type='creator' connected to this group)
    const members = entities.filter((e: any) => e.type === 'creator').length;

    return {
      members,
      entities: entities.length,
      connections: connections.length,
      events: events.length,
    };
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!groupId,
    ...reactQueryOptions,
  });

  return {
    data: query.data ?? { members: 0, entities: 0, connections: 0, events: 0 },
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: async () => {
      await query.refetch();
    },
    refetching: query.isRefetching,
  };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useCreateGroup - Create a new group
 *
 * @example
 * ```tsx
 * const createGroup = useCreateGroup();
 *
 * const handleCreate = async () => {
 *   const result = await createGroup.mutate({
 *     name: 'My Organization',
 *     slug: 'my-org',
 *     type: 'organization',
 *     settings: { visibility: 'public', joinPolicy: 'open' }
 *   });
 *   console.log('Created group:', result.data);
 * };
 * ```
 */
export function useCreateGroup(
  mutationOptions?: MutationOptions<string, CreateGroupInput>
): MutationResult<string, CreateGroupInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateGroupInput) => {
      const effect = provider.things.create({
        type: input.type,
        name: input.name,
        properties: {
          slug: input.slug,
          parentGroupId: input.parentGroupId,
          description: input.description,
          settings: {
            visibility: input.settings?.visibility ?? 'public',
            joinPolicy: input.settings?.joinPolicy ?? 'open',
            plan: input.settings?.plan,
          },
        },
        status: 'active',
      });
      return await Effect.runPromise(effect);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      mutationOptions?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      mutationOptions?.onError?.(error as Error, variables);
    },
  });

  return {
    mutate: async (input: CreateGroupInput) => {
      return await mutation.mutateAsync(input);
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: () => mutation.reset(),
    data: mutation.data ?? null,
  };
}

/**
 * useUpdateGroup - Update existing group
 *
 * @example
 * ```tsx
 * const updateGroup = useUpdateGroup(groupId);
 *
 * const handleUpdate = async () => {
 *   await updateGroup.mutate({
 *     name: 'Updated Name',
 *     status: 'active'
 *   });
 * };
 * ```
 */
export function useUpdateGroup(
  groupId: Id<"groups"> | null,
  mutationOptions?: MutationOptions<void, UpdateGroupInput>
): MutationResult<void, UpdateGroupInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: UpdateGroupInput) => {
      if (!groupId) throw new Error('Group ID is required');

      const effect = provider.things.update(groupId, {
        name: input.name,
        properties: {
          slug: input.slug,
          description: input.description,
          settings: input.settings,
        },
        status: input.status,
      });
      await Effect.runPromise(effect);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      mutationOptions?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      mutationOptions?.onError?.(error as Error, variables);
    },
  });

  return {
    mutate: async (input: UpdateGroupInput) => {
      return await mutation.mutateAsync(input);
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: () => mutation.reset(),
    data: mutation.data ?? null,
  };
}

/**
 * useDeleteGroup - Delete a group
 *
 * @example
 * ```tsx
 * const deleteGroup = useDeleteGroup(groupId);
 *
 * const handleDelete = async () => {
 *   await deleteGroup.mutate();
 * };
 * ```
 */
export function useDeleteGroup(
  groupId: Id<"groups"> | null,
  mutationOptions?: MutationOptions<void, void>
): MutationResult<void, void> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error('Group ID is required');
      const effect = provider.things.delete(groupId);
      await Effect.runPromise(effect);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group'] });
      mutationOptions?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      mutationOptions?.onError?.(error as Error, variables);
    },
  });

  return {
    mutate: async () => {
      return await mutation.mutateAsync();
    },
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: () => mutation.reset(),
    data: mutation.data ?? null,
  };
}
