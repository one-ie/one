/**
 * usePeople - React hooks for People dimension
 *
 * Provides hooks for user management, authentication, and role-based access.
 * People dimension controls authorization and governance.
 */

import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';

// Note: People types would come from DataProvider
// For now, using minimal types that match the ontology

type Role = 'platform_owner' | 'org_owner' | 'org_user' | 'customer';

interface Person {
  _id: string;
  email: string;
  username: string;
  displayName: string;
  role: Role;
  organizationId?: string;
  organizations: string[];
  permissions?: string[];
  properties: Record<string, any>;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

interface PeopleFilter {
  role?: Role;
  organizationId?: string;
  status?: Person['status'];
  limit?: number;
  offset?: number;
}

interface UpdatePersonInput {
  displayName?: string;
  properties?: Record<string, any>;
  permissions?: string[];
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useCurrentUser - Get authenticated user (person)
 *
 * Returns the currently logged-in user. Essential for role-based UI rendering.
 *
 * @example
 * ```tsx
 * const { data: user, loading } = useCurrentUser();
 *
 * if (loading) return <Skeleton />;
 * if (!user) return <SignInPrompt />;
 *
 * return (
 *   <div>
 *     Welcome, {user.displayName}!
 *     {user.role === 'org_owner' && <AdminLink />}
 *   </div>
 * );
 * ```
 */
export function useCurrentUser(queryOptions?: QueryOptions): QueryResult<Person> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['currentUser'];

  const queryFn = async (): Promise<Person> => {
    // TODO: Get current user ID from auth context
    // This would typically come from Better Auth session
    // For now, throwing an error that needs auth integration
    throw new Error('useCurrentUser requires auth integration');
    
    // When integrated with auth:
    // const userId = await getAuthUserId();
    // const effect = provider.things.get(userId);
    // return await Effect.runPromise(effect) as Person;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 60000, // Cache for 1 minute (user data rarely changes)
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
 * usePerson - Get person by ID
 *
 * @param id - Person ID (thing ID with type='creator' or 'audience_member')
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const { data: person } = usePerson(userId);
 *
 * return (
 *   <div>
 *     <Avatar src={person?.properties.avatar} />
 *     <div>{person?.displayName}</div>
 *     <Badge>{person?.role}</Badge>
 *   </div>
 * );
 * ```
 */
export function usePerson(
  id: string | null,
  queryOptions?: QueryOptions
): QueryResult<Person> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['person', id];

  const queryFn = async (): Promise<Person> => {
    if (!id) throw new Error('Person ID is required');
    const effect = provider.things.get(id);
    const result = await Effect.runPromise(effect);
    return result as unknown as Person;
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
 * usePeople - List people in organization
 *
 * Returns people filtered by organization and/or role.
 * Useful for team member lists, role management, etc.
 *
 * @param filter - Filter options
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * // List all org owners
 * const { data: orgOwners } = usePeople({ role: 'org_owner' });
 *
 * // List people in specific org
 * const { data: teamMembers } = usePeople({ organizationId: currentOrgId });
 * ```
 */
export function usePeople(
  filter: PeopleFilter,
  queryOptions?: QueryOptions
): QueryResult<Person[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['people', filter];

  const queryFn = async (): Promise<Person[]> => {
    // Get all creators/audience_members, then filter
    // In production, backend should support these filters natively
    const effect = provider.things.list({
      type: 'creator', // or 'audience_member'
      status: filter.status,
      limit: filter.limit,
      offset: filter.offset,
    });
    const result = await Effect.runPromise(effect);

    // Client-side filtering (should be backend in production)
    let people = result as unknown as Person[];
    
    if (filter.role) {
      people = people.filter(p => p.properties.role === filter.role);
    }
    
    if (filter.organizationId) {
      people = people.filter(p => 
        p.properties.organizationId === filter.organizationId ||
        p.properties.organizations?.includes(filter.organizationId)
      );
    }
    
    return people;
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
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

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * useUpdatePerson - Update person profile
 *
 * Users can update their own profile. Org owners can update org members.
 * Platform owners can update anyone.
 *
 * @example
 * ```tsx
 * const { mutate: updateProfile } = useUpdatePerson({
 *   onSuccess: () => toast.success('Profile updated!')
 * });
 *
 * await updateProfile({
 *   id: userId,
 *   displayName: 'New Name',
 *   properties: { avatar: 'https://...' }
 * });
 * ```
 */
export function useUpdatePerson(
  mutationOptions?: MutationOptions<void, { id: string } & UpdatePersonInput>
): MutationResult<void, { id: string } & UpdatePersonInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdatePersonInput): Promise<void> => {
      const effect = provider.things.update(id, {
        properties: updates.properties,
      });
      return await Effect.runPromise(effect);
    },
    onSuccess: async (data, { id }) => {
      // Invalidate person cache
      await queryClient.invalidateQueries({ queryKey: ['person', id] });
      
      // If updating current user, invalidate currentUser
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      
      // Invalidate people lists
      await queryClient.invalidateQueries({ queryKey: ['people'] });
      
      await mutationOptions?.onSuccess?.(data, { id });
    },
    onError: async (error, input) => {
      await mutationOptions?.onError?.(error as Error, input);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    data: mutation.data ?? null,
  };
}

/**
 * useInvitePerson - Invite person to organization
 *
 * Org owners can invite new members. Creates invitation token and sends email.
 *
 * @example
 * ```tsx
 * const { mutate: inviteMember } = useInvitePerson({
 *   onSuccess: () => toast.success('Invitation sent!')
 * });
 *
 * await inviteMember({
 *   email: 'newuser@example.com',
 *   organizationId: currentOrgId,
 *   role: 'org_user'
 * });
 * ```
 */
export function useInvitePerson(
  mutationOptions?: MutationOptions<
    string,
    { email: string; organizationId: string; role: Role }
  >
): MutationResult<string, { email: string; organizationId: string; role: Role }> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async ({
      email,
      organizationId,
      role,
    }: {
      email: string;
      organizationId: string;
      role: Role;
    }): Promise<string> => {
      // TODO: Implement invitation logic
      // This would create an invitation token and send email
      // For now, returning a placeholder
      throw new Error('useInvitePerson not yet implemented');
      
      // When implemented:
      // 1. Create invitation token thing
      // 2. Create connection: inviter -> token
      // 3. Log user_invited_to_org event
      // 4. Send email via backend
    },
    onSuccess: async (inviteId, input) => {
      await queryClient.invalidateQueries({ queryKey: ['people'] });
      await mutationOptions?.onSuccess?.(inviteId, input);
    },
    onError: async (error, input) => {
      await mutationOptions?.onError?.(error as Error, input);
    },
  });

  return {
    mutate: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    data: mutation.data ?? null,
  };
}

// ============================================================================
// ROLE & PERMISSION HELPERS
// ============================================================================

/**
 * useHasPermission - Check if current user has a specific permission
 *
 * @example
 * ```tsx
 * const { data: canManageUsers } = useHasPermission('users:manage');
 *
 * return (
 *   <div>
 *     {canManageUsers && <Button>Manage Users</Button>}
 *   </div>
 * );
 * ```
 */
export function useHasPermission(
  permission: string,
  queryOptions?: QueryOptions
): QueryResult<boolean> {
  const { data: user } = useCurrentUser(queryOptions);

  const queryKey = ['permission', permission, user?._id];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      
      // Platform owners have all permissions
      if (user.role === 'platform_owner') return true;
      
      // Check permissions array
      return user.permissions?.includes(permission) ?? false;
    },
    enabled: !!user,
    staleTime: 60000,
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
 * useHasRole - Check if current user has a specific role
 *
 * @example
 * ```tsx
 * const { data: isOrgOwner } = useHasRole('org_owner');
 *
 * if (isOrgOwner) {
 *   return <AdminDashboard />;
 * }
 * ```
 */
export function useHasRole(
  role: Role | Role[],
  queryOptions?: QueryOptions
): QueryResult<boolean> {
  const { data: user } = useCurrentUser(queryOptions);

  const roles = Array.isArray(role) ? role : [role];
  const queryKey = ['role', roles.join(','), user?._id];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    enabled: !!user,
    staleTime: 60000,
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
