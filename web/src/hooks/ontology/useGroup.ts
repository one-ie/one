/**
 * Groups Hook
 *
 * Operations on groups (multi-tenancy, hierarchical containers)
 * for organizing things, people, connections, events, and knowledge.
 *
 * @example
 * ```tsx
 * import { useGroup, useGroups } from '@/hooks/ontology/useGroup';
 *
 * function GroupSelector() {
 *   const { groups, loading } = useGroups();
 *   const { get, create } = useGroup();
 *
 *   return (
 *     <div>
 *       {groups?.map(g => (
 *         <GroupCard key={g._id} group={g} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */

import { useCallback, useEffect, useState } from 'react';
import { Effect } from 'effect';
import type { Id } from '@/types/convex';
import { useEffectRunner } from '../useEffectRunner';
import { useIsProviderAvailable } from './useProvider';

/**
 * Group types (6 types total)
 */
export type GroupType =
  | 'friend_circle'
  | 'business'
  | 'community'
  | 'dao'
  | 'government'
  | 'organization';

/**
 * Pricing plans for organizations
 */
export type GroupPlan = 'starter' | 'pro' | 'enterprise';

/**
 * Group entity from ontology
 */
export interface Group {
  _id: Id<'groups'>;
  _creationTime: number;
  name: string;
  type: GroupType;
  parentGroupId?: Id<'groups'>;
  properties: {
    description?: string;
    plan?: GroupPlan;
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
  };
  status: 'draft' | 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for creating a new group
 */
export interface CreateGroupInput {
  name: string;
  type: GroupType;
  description?: string;
  plan?: GroupPlan;
  parentGroupId?: Id<'groups'>;
}

/**
 * Input for updating a group
 */
export interface UpdateGroupInput {
  name?: string;
  description?: string;
  plan?: GroupPlan;
  status?: 'draft' | 'active' | 'archived';
}

/**
 * Query filters for listing groups
 */
export interface GroupFilter {
  type?: GroupType;
  parentGroupId?: Id<'groups'>;
  status?: 'draft' | 'active' | 'archived';
  limit?: number;
  offset?: number;
}

/**
 * Hook for group operations (get, list, create, update)
 *
 * @returns Group CRUD operations and state
 *
 * @example
 * ```tsx
 * const { get, create, update, loading, error } = useGroup();
 *
 * const handleCreate = async () => {
 *   const newGroup = await create({
 *     name: 'My Organization',
 *     type: 'organization',
 *     plan: 'pro'
 *   });
 * };
 * ```
 */
export function useGroup() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();

  /**
   * Get a single group by ID
   */
  const get = useCallback(
    async (
      id: Id<'groups'>,
      options?: {
        onSuccess?: (group: Group) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.groups.get(id);
        return null as unknown as Group;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Create a new group
   */
  const create = useCallback(
    async (
      input: CreateGroupInput,
      options?: {
        onSuccess?: (group: Group) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.groups.create(input);
        return null as unknown as Group;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Update an existing group
   */
  const update = useCallback(
    async (
      id: Id<'groups'>,
      input: UpdateGroupInput,
      options?: {
        onSuccess?: (group: Group) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return null;
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.groups.update(id, input);
        return null as unknown as Group;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  return {
    get,
    create,
    update,
    loading,
    error,
  };
}

/**
 * Hook for listing groups with filtering
 *
 * @param filter - Optional filters (type, parent, status)
 * @returns Groups array and loading/error state
 *
 * @example
 * ```tsx
 * const { groups, loading } = useGroups({
 *   type: 'organization',
 *   status: 'active'
 * });
 *
 * if (loading) return <div>Loading...</div>;
 *
 * return (
 *   <ul>
 *     {groups?.map(g => <li key={g._id}>{g.name}</li>)}
 *   </ul>
 * );
 * ```
 */
export function useGroups(filter?: GroupFilter) {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!isProviderAvailable) {
      setGroups([]);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.groups.list(filter);
      return [] as Group[];
    });

    run(program, {
      onSuccess: (data) => setGroups(data),
    });
  }, [isProviderAvailable, filter?.type, filter?.parentGroupId, run]);

  return {
    groups,
    loading,
    error,
  };
}

/**
 * Hook to get current group (usually from context/route)
 *
 * @param groupId - Group ID to load
 * @returns Current group and state
 *
 * @example
 * ```tsx
 * const groupId = useParams().groupId;
 * const { group, loading } = useCurrentGroup(groupId);
 *
 * if (!group) return <div>Group not found</div>;
 * return <h1>{group.name}</h1>;
 * ```
 */
export function useCurrentGroup(groupId?: Id<'groups'>) {
  const { groups, loading, error } = useGroups();
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  useEffect(() => {
    if (!groupId || !groups) {
      setCurrentGroup(null);
      return;
    }

    const group = groups.find((g) => g._id === groupId);
    setCurrentGroup(group || null);
  }, [groupId, groups]);

  return {
    group: currentGroup,
    loading,
    error,
  };
}

/**
 * Hook for child groups of a parent (hierarchical)
 *
 * @param parentGroupId - Parent group ID
 * @returns Child groups list
 *
 * @example
 * ```tsx
 * const { groups: children } = useChildGroups(organizationId);
 * // Returns all departments under organization
 * ```
 */
export function useChildGroups(parentGroupId: Id<'groups'>) {
  return useGroups({
    parentGroupId,
    status: 'active',
  });
}
