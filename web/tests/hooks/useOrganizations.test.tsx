/**
 * Tests for useOrganizations hooks
 *
 * Tests organization management hooks including:
 * - useOrganization
 * - useOrganizations
 * - useCreateOrganization
 * - useUpdateOrganization
 * - useDeleteOrganization
  *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach } from "vitest";
import { createRequire } from "module";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Effect, Layer } from 'effect';
import { DataProviderService, type DataProvider } from '../../src/providers/DataProvider';
import { DataProviderProvider } from '../../src/hooks/useDataProvider';
import {
  useOrganization,
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from '../../src/hooks/useOrganizations';

const require = createRequire(import.meta.url);

let renderHook: typeof import("@testing-library/react")["renderHook"];
let waitFor: typeof import("@testing-library/react")["waitFor"];
let hasTestingLibrary = true;

try {
  ({ renderHook, waitFor } = require("@testing-library/react"));
} catch {
  hasTestingLibrary = false;
}

const describeIfTestingLibrary = hasTestingLibrary ? describe : describe.skip;

// Mock DataProvider
const mockOrgs = [
  {
    _id: 'org1',
    type: 'organization',
    name: 'Acme Corp',
    properties: { slug: 'acme', plan: 'pro', status: 'active' },
    status: 'active' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    _id: 'org2',
    type: 'organization',
    name: 'TechStart',
    properties: { slug: 'techstart', plan: 'starter', status: 'active' },
    status: 'active' as const,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const mockProvider: DataProvider = {
  things: {
    get: (id: string) =>
      Effect.succeed(mockOrgs.find((o) => o._id === id) || null).pipe(
        Effect.flatMap((org) =>
          org ? Effect.succeed(org) : Effect.fail({ _tag: 'ThingNotFoundError', id })
        )
      ),
    list: (options) =>
      Effect.succeed(
        mockOrgs.filter(
          (o) => o.type === options?.type && (!options?.status || o.status === options.status)
        )
      ),
    create: (input) => Effect.succeed('new-org-id'),
    update: (id, input) => Effect.succeed(undefined),
    delete: (id) => Effect.succeed(undefined),
  },
  connections: {
    get: (id) => Effect.fail({ _tag: 'ConnectionNotFoundError', id }),
    list: () => Effect.succeed([]),
    create: () => Effect.succeed('new-conn-id'),
    delete: () => Effect.succeed(undefined),
  },
  events: {
    get: (id) => Effect.fail({ _tag: 'QueryError', message: 'Not implemented' }),
    list: () => Effect.succeed([]),
    create: () => Effect.succeed('new-event-id'),
  },
  knowledge: {
    get: (id) => Effect.fail({ _tag: 'KnowledgeNotFoundError', id }),
    list: () => Effect.succeed([]),
    create: () => Effect.succeed('new-knowledge-id'),
    link: () => Effect.succeed('new-link-id'),
    search: () => Effect.succeed([]),
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <DataProviderProvider provider={mockProvider}>{children}</DataProviderProvider>
      </QueryClientProvider>
    );
  };
}

describeIfTestingLibrary('useOrganizations hooks', () => {
  describe('useOrganization', () => {
    it('should fetch organization by ID', async () => {
      const { result } = renderHook(() => useOrganization('org1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.name).toBe('Acme Corp');
      expect(result.current.error).toBeNull();
    });

    it('should handle not found error', async () => {
      const { result } = renderHook(() => useOrganization('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeDefined();
    });

    it('should not fetch when ID is null', async () => {
      const { result } = renderHook(() => useOrganization(null), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBeNull();
    });
  });

  describe('useOrganizations', () => {
    it('should list all organizations', async () => {
      const { result } = renderHook(() => useOrganizations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('should filter by status', async () => {
      const { result } = renderHook(() => useOrganizations({ status: 'active' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.every((org) => org.status === 'active')).toBe(true);
    });
  });

  describe('useCreateOrganization', () => {
    it('should create organization', async () => {
      const { result } = renderHook(() => useCreateOrganization(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(false);

      let orgId: string | undefined;
      await waitFor(async () => {
        orgId = await result.current.mutate({
          name: 'New Corp',
          slug: 'newcorp',
          plan: 'enterprise',
        });
      });

      expect(orgId).toBe('new-org-id');
      expect(result.current.error).toBeNull();
    });
  });

  describe('useUpdateOrganization', () => {
    it('should update organization', async () => {
      const { result } = renderHook(() => useUpdateOrganization(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutate({
          id: 'org1',
          name: 'Updated Corp',
          plan: 'enterprise',
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('useDeleteOrganization', () => {
    it('should delete organization', async () => {
      const { result } = renderHook(() => useDeleteOrganization(), {
        wrapper: createWrapper(),
      });

      await waitFor(async () => {
        await result.current.mutate('org1');
      });

      expect(result.current.error).toBeNull();
    });
  });
});
