/**
 * People Hook
 *
 * Operations on people (authorization, governance, roles)
 * within groups in the 6-dimension ontology.
 *
 * @example
 * ```tsx
 * import { useCurrentUser, usePeople } from '@/hooks/ontology/usePerson';
 *
 * function Dashboard() {
 *   const { user, loading } = useCurrentUser();
 *   const { hasPermission } = usePerson();
 *
 *   if (!user) return <div>Not logged in</div>;
 *
 *   return (
 *     <div>
 *       Welcome, {user.name}!
 *       {hasPermission('admin') && <AdminPanel />}
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
 * Role-based access levels
 * These are stored in the Thing entity with type: 'creator' or 'audience_member'
 * and properties.role field
 */
export type UserRole = 'platform_owner' | 'org_owner' | 'org_user' | 'customer';

/**
 * Person entity (represented as Thing with special role metadata)
 */
export interface Person {
  _id: Id<'entities'>;
  _creationTime: number;
  type: 'creator' | 'audience_member';
  name: string;
  properties: {
    email?: string;
    role?: UserRole;
    groupId?: Id<'groups'>;
    metadata?: Record<string, any>;
  };
  status: 'active' | 'inactive' | 'draft' | 'archived';
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for creating/inviting a person
 */
export interface CreatePersonInput {
  name: string;
  email?: string;
  role?: UserRole;
  groupId?: Id<'groups'>;
}

/**
 * Hook for person operations
 *
 * @returns Person CRUD operations and state
 *
 * @example
 * ```tsx
 * const { get, list, hasPermission } = usePerson();
 *
 * if (hasPermission('org_owner')) {
 *   const members = await list({ groupId });
 * }
 * ```
 */
export function usePerson() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();

  /**
   * Get a specific person by ID
   */
  const get = useCallback(
    async (
      id: Id<'entities'>,
      options?: {
        onSuccess?: (person: Person) => void;
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
        // return yield* provider.people.get(id);
        return null as unknown as Person;
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * List people (optionally filtered by group)
   */
  const list = useCallback(
    async (
      filter?: { groupId?: Id<'groups'>; role?: UserRole },
      options?: {
        onSuccess?: (people: Person[]) => void;
        onError?: (error: unknown) => void;
      }
    ) => {
      if (!isProviderAvailable) {
        options?.onError?.(new Error('Provider not available'));
        return [];
      }

      const program = Effect.gen(function* () {
        // TODO: Implement with actual DataProvider
        // const provider = yield* DataProvider;
        // return yield* provider.people.list(filter);
        return [] as Person[];
      });

      return run(program, options);
    },
    [isProviderAvailable, run]
  );

  /**
   * Check if current user has a specific permission
   *
   * Maps role to permissions:
   * - platform_owner: all permissions
   * - org_owner: org management + content creation
   * - org_user: content creation + member management
   * - customer: read-only
   */
  const hasPermission = useCallback(
    (permission: string, userRole?: UserRole): boolean => {
      const role = userRole || 'customer';

      const rolePermissions: Record<UserRole, string[]> = {
        platform_owner: ['*'],
        org_owner: ['org_manage', 'content_create', 'member_invite'],
        org_user: ['content_create', 'member_invite'],
        customer: ['read'],
      };

      const permissions = rolePermissions[role] || [];
      return permissions.includes('*') || permissions.includes(permission);
    },
    []
  );

  return {
    get,
    list,
    hasPermission,
    loading,
    error,
  };
}

/**
 * Hook for current authenticated user
 *
 * @returns Current user (null if not authenticated)
 *
 * @example
 * ```tsx
 * const { user, loading, isAuthenticated } = useCurrentUser();
 *
 * if (loading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <LoginPage />;
 * return <Dashboard user={user} />;
 * ```
 */
export function useCurrentUser() {
  const { run, loading, error } = useEffectRunner<unknown, any>();
  const isProviderAvailable = useIsProviderAvailable();
  const [user, setUser] = useState<Person | null>(null);

  useEffect(() => {
    if (!isProviderAvailable) {
      setUser(null);
      return;
    }

    const program = Effect.gen(function* () {
      // TODO: Implement with actual DataProvider
      // const provider = yield* DataProvider;
      // return yield* provider.people.current();
      return null as unknown as Person;
    });

    run(program, {
      onSuccess: (data) => setUser(data),
      onError: () => setUser(null),
    });
  }, [isProviderAvailable, run]);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
  };
}

/**
 * Hook to check if current user has a specific role
 *
 * @param requiredRole - Role to check
 * @returns true if user has the role
 *
 * @example
 * ```tsx
 * const isAdmin = useHasRole('org_owner');
 *
 * if (!isAdmin) {
 *   return <AccessDenied />;
 * }
 * ```
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const { user } = useCurrentUser();

  if (!user) return false;

  const userRole = user.properties.role || 'customer';
  return userRole === requiredRole;
}

/**
 * Hook to check if current user can perform an action
 *
 * @param permission - Permission to check
 * @returns true if user has permission
 *
 * @example
 * ```tsx
 * const canManageOrg = useCanAccess('org_manage');
 *
 * return (
 *   <div>
 *     {canManageOrg && <OrgSettings />}
 *   </div>
 * );
 * ```
 */
export function useCanAccess(permission: string): boolean {
  const { user } = useCurrentUser();
  const { hasPermission } = usePerson();

  if (!user) return false;

  const userRole = user.properties.role || 'customer';
  return hasPermission(permission, userRole);
}

/**
 * Hook for listing people in a group (members)
 *
 * @param groupId - Group ID to list members for
 * @returns Group members
 *
 * @example
 * ```tsx
 * const { people: members } = useGroupMembers(organizationId);
 * ```
 */
export function useGroupMembers(groupId: Id<'groups'>) {
  const { list, loading, error } = usePerson();
  const [members, setMembers] = useState<Person[]>([]);

  useEffect(() => {
    list({ groupId }, {
      onSuccess: setMembers,
    });
  }, [groupId, list]);

  return {
    members,
    loading,
    error,
  };
}

/**
 * Hook for user profile data
 *
 * @param userId - User ID (optional, defaults to current user)
 * @returns User profile
 *
 * @example
 * ```tsx
 * const { profile } = useUserProfile(userId);
 * return <ProfileCard user={profile} />;
 * ```
 */
export function useUserProfile(userId?: Id<'entities'>) {
  const { get } = usePerson();
  const currentUser = useCurrentUser();
  const [profile, setProfile] = useState<Person | null>(null);

  useEffect(() => {
    const id = userId || currentUser.user?._id;
    if (!id) return;

    get(id, {
      onSuccess: setProfile,
    });
  }, [userId, currentUser.user?._id, get]);

  return {
    profile,
    isCurrentUser: profile?._id === currentUser.user?._id,
  };
}
