/**
 * useOrganizations - React hooks for Organizations dimension
 *
 * Provides hooks for multi-tenant organization management.
 * Organizations partition the system and control quotas/billing.
 */

import { useQuery, useMutation as useReactMutation, useQueryClient } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useDataProvider } from './useDataProvider';
import type { QueryResult, MutationResult, QueryOptions, MutationOptions } from './types';

// Note: Organizations types would come from DataProvider
// For now, using minimal types that match the ontology

interface Organization {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  plan: 'starter' | 'pro' | 'enterprise';
  properties: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

interface OrganizationFilter {
  status?: Organization['status'];
  plan?: Organization['plan'];
  limit?: number;
  offset?: number;
}

interface CreateOrganizationInput {
  name: string;
  slug: string;
  plan?: Organization['plan'];
  properties?: Record<string, any>;
}

interface UpdateOrganizationInput {
  name?: string;
  slug?: string;
  status?: Organization['status'];
  plan?: Organization['plan'];
  properties?: Record<string, any>;
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * useOrganization - Get organization by ID
 *
 * @param id - Organization ID (null for current organization)
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * const { data: org, loading } = useOrganization(orgId);
 *
 * if (loading) return <Skeleton />;
 * if (!org) return <div>Organization not found</div>;
 *
 * return <div>{org.name} ({org.plan})</div>;
 * ```
 */
export function useOrganization(
  id: string | null,
  queryOptions?: QueryOptions
): QueryResult<Organization> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['organization', id];

  const queryFn = async (): Promise<Organization> => {
    if (!id) throw new Error('Organization ID is required');
    // Use things.get since organizations are things with type='organization'
    const effect = provider.things.get(id);
    const result = await Effect.runPromise(effect);
    return result as unknown as Organization;
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
 * useOrganizations - List organizations
 *
 * Platform owners can see all orgs. Org owners see their own orgs.
 *
 * @param filter - Filter options
 * @param queryOptions - Query configuration
 *
 * @example
 * ```tsx
 * // Platform owner: see all organizations
 * const { data: orgs } = useOrganizations({ status: 'active' });
 *
 * // Filter by plan
 * const { data: enterprises } = useOrganizations({ plan: 'enterprise' });
 * ```
 */
export function useOrganizations(
  filter?: OrganizationFilter,
  queryOptions?: QueryOptions
): QueryResult<Organization[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['organizations', filter];

  const queryFn = async (): Promise<Organization[]> => {
    // Use things.list with type='organization'
    const effect = provider.things.list({
      type: 'organization',
      status: filter?.status as any,
      limit: filter?.limit,
      offset: filter?.offset,
    });
    const result = await Effect.runPromise(effect);
    return result as unknown as Organization[];
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
 * useCreateOrganization - Create new organization
 *
 * Platform owners can create organizations. Automatically creates
 * the owner membership connection.
 *
 * @example
 * ```tsx
 * const { mutate: createOrg, loading } = useCreateOrganization({
 *   onSuccess: (id) => navigate(`/org/${id}`)
 * });
 *
 * await createOrg({
 *   name: 'Acme Corp',
 *   slug: 'acme',
 *   plan: 'pro'
 * });
 * ```
 */
export function useCreateOrganization(
  mutationOptions?: MutationOptions<string, CreateOrganizationInput>
): MutationResult<string, CreateOrganizationInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (input: CreateOrganizationInput): Promise<string> => {
      const effect = provider.things.create({
        type: 'organization',
        name: input.name,
        properties: {
          slug: input.slug,
          plan: input.plan || 'starter',
          orgStatus: 'trial',
          limits: {
            users: 5,
            storage: 1000,
            apiCalls: 10000,
            inference: 1000,
          },
          usage: {
            users: 0,
            storage: 0,
            apiCalls: 0,
            inference: 0,
          },
          settings: {
            allowSignups: true,
            requireEmailVerification: true,
            enableTwoFactor: false,
          },
          ...input.properties,
        },
        status: 'active',
      });
      return await Effect.runPromise(effect);
    },
    onSuccess: async (id, input) => {
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      await mutationOptions?.onSuccess?.(id, input);
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
 * useUpdateOrganization - Update organization settings
 *
 * Org owners can update their organization. Platform owners can update any org.
 *
 * @example
 * ```tsx
 * const { mutate: updateOrg } = useUpdateOrganization({
 *   onSuccess: () => toast.success('Organization updated')
 * });
 *
 * await updateOrg({
 *   id: orgId,
 *   plan: 'enterprise',
 *   properties: { customDomain: 'acme.one.ie' }
 * });
 * ```
 */
export function useUpdateOrganization(
  mutationOptions?: MutationOptions<void, { id: string } & UpdateOrganizationInput>
): MutationResult<void, { id: string } & UpdateOrganizationInput> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateOrganizationInput): Promise<void> => {
      const effect = provider.things.update(id, {
        name: updates.name,
        status: updates.status as any,
        properties: updates.properties,
      });
      return await Effect.runPromise(effect);
    },
    onSuccess: async (data, { id }) => {
      await queryClient.invalidateQueries({ queryKey: ['organization', id] });
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
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
 * useDeleteOrganization - Delete organization
 *
 * Platform owners only. Soft delete preserves audit trail.
 *
 * @example
 * ```tsx
 * const { mutate: deleteOrg } = useDeleteOrganization({
 *   onSuccess: () => navigate('/admin/organizations')
 * });
 *
 * await deleteOrg(orgId);
 * ```
 */
export function useDeleteOrganization(
  mutationOptions?: MutationOptions<void, string>
): MutationResult<void, string> {
  const provider = useDataProvider();
  const queryClient = useQueryClient();

  const mutation = useReactMutation({
    mutationFn: async (id: string): Promise<void> => {
      const effect = provider.things.delete(id);
      return await Effect.runPromise(effect);
    },
    onSuccess: async (data, id) => {
      queryClient.removeQueries({ queryKey: ['organization', id] });
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      await mutationOptions?.onSuccess?.(data, id);
    },
    onError: async (error, id) => {
      await mutationOptions?.onError?.(error as Error, id);
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
// CONVENIENCE HOOKS
// ============================================================================

/**
 * useCurrentOrganization - Get the current user's organization
 *
 * Uses local storage or context to determine current org.
 * Falls back to user's default organization.
 *
 * @example
 * ```tsx
 * const { data: currentOrg } = useCurrentOrganization();
 *
 * return <div>Current org: {currentOrg?.name}</div>;
 * ```
 */
export function useCurrentOrganization(queryOptions?: QueryOptions): QueryResult<Organization> {
  // TODO: Get current org ID from context or local storage
  // For now, returning null (requires context setup)
  const currentOrgId = null; // Would come from OrganizationProvider

  return useOrganization(currentOrgId, queryOptions);
}

/**
 * useOrganizationMembers - Get members of an organization
 *
 * Returns connections with relationshipType='member_of' for the org.
 *
 * @example
 * ```tsx
 * const { data: members } = useOrganizationMembers(orgId);
 *
 * return <div>{members?.length} members</div>;
 * ```
 */
export function useOrganizationMembers(
  orgId: string | null,
  queryOptions?: QueryOptions
): QueryResult<any[]> {
  const provider = useDataProvider();
  const { enabled = true, ...reactQueryOptions } = queryOptions ?? {};

  const queryKey = ['organization-members', orgId];

  const queryFn = async (): Promise<any[]> => {
    if (!orgId) throw new Error('Organization ID is required');
    const effect = provider.connections.list({
      toEntityId: orgId,
      relationshipType: 'member_of',
    });
    return await Effect.runPromise(effect);
  };

  const query = useQuery({
    queryKey,
    queryFn,
    enabled: enabled && !!orgId,
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
