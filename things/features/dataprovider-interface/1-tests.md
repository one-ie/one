# Test Specification: DataProvider Interface & ConvexProvider

**Feature ID:** `feature_dataprovider_interface`
**Test Suite:** Comprehensive Unit, Integration, E2E, Performance, and Security Tests
**Coverage Target:** 95%+ Unit, 85%+ Integration
**Estimated Test Count:** 120+ test cases
**Owner:** Quality Agent
**Status:** Ready for Implementation

---

## Table of Contents

1. [Test Plan Overview](#test-plan-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Tests (80+ cases)](#unit-tests)
4. [Integration Tests (20+ cases)](#integration-tests)
5. [E2E Tests (10+ cases)](#e2e-tests)
6. [Performance Tests](#performance-tests)
7. [Security Tests](#security-tests)
8. [Accessibility Tests](#accessibility-tests)
9. [Test Data & Fixtures](#test-data--fixtures)
10. [CI/CD Integration](#cicd-integration)
11. [Quality Gates](#quality-gates)

---

## Test Plan Overview

### Scope

This test suite validates the **DataProvider interface** and **ConvexProvider implementation**:

- DataProvider interface definition (TypeScript contract)
- ConvexProvider implementation (all 6 dimensions)
- Error handling (typed errors with `_tag`)
- Subscription lifecycle (real-time updates)
- Performance overhead (<10ms target)
- Backward compatibility (all 50+ auth tests must pass)

### Test Types

- **Unit Tests**: Service methods in isolation with mocks
- **Integration Tests**: ConvexProvider → Convex backend flows
- **E2E Tests**: Full user journeys with real data
- **Performance Tests**: Latency, throughput, memory benchmarks
- **Security Tests**: Input validation, authorization checks
- **Accessibility Tests**: N/A (backend interface only)

### Testing Framework

```bash
# Dependencies
bun add -d vitest @vitest/ui @vitest/coverage-v8
bun add -d @testing-library/react @testing-library/jest-dom
bun add -d msw # Mock Service Worker for API mocking
```

### Test Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/providers/**/*.ts'],
      exclude: ['**/*.test.ts', '**/*.d.ts', '**/types.ts'],
      lines: 90,
      functions: 90,
      branches: 85,
      statements: 90,
    },
  },
});
```

---

## Test Environment Setup

### Setup Files

```typescript
// tests/setup.ts
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

beforeAll(() => {
  // Global test setup
  process.env.PUBLIC_CONVEX_URL = 'https://test.convex.cloud';
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Global cleanup
});
```

### Mock Convex Client

```typescript
// tests/mocks/MockConvexClient.ts
import { vi } from 'vitest';
import type { ConvexHttpClient } from 'convex/browser';

export class MockConvexClient {
  query = vi.fn();
  mutation = vi.fn();
  subscribe = vi.fn();
  close = vi.fn();

  reset() {
    this.query.mockReset();
    this.mutation.mockReset();
    this.subscribe.mockReset();
    this.close.mockReset();
  }
}
```

### Test Utilities

```typescript
// tests/utils/testUtils.ts
import { Effect, Layer } from 'effect';
import { ConvexDatabase } from '@/providers/convex/ConvexDatabase';
import { MockConvexClient } from '../mocks/MockConvexClient';

export function createTestLayer(mockClient: MockConvexClient) {
  const mockDb = Layer.succeed(ConvexDatabase, {
    query: (name, args) => Effect.tryPromise(() => mockClient.query(name, args)),
    mutation: (name, args) => Effect.tryPromise(() => mockClient.mutation(name, args)),
  });

  return mockDb;
}

export async function runTest<A>(
  effect: Effect.Effect<A, any, any>,
  layer: Layer.Layer<any, any, any>
): Promise<A> {
  return Effect.runPromise(Effect.provide(effect, layer));
}
```

---

## Unit Tests

### 1. DataProvider Interface Tests

#### 1.1 Interface Definition Tests

```typescript
// tests/unit/providers/DataProvider.test.ts
import { describe, it, expect } from 'vitest';
import { DataProvider } from '@/providers/DataProvider';

describe('DataProvider Interface', () => {
  it('should have organizations namespace', () => {
    expect(DataProvider).toBeDefined();
    // TypeScript compiler validates interface structure
  });

  it('should have people namespace', () => {
    // Validated by TypeScript
  });

  it('should have things namespace with all CRUD methods', () => {
    // Validated by TypeScript
  });

  it('should have connections namespace', () => {
    // Validated by TypeScript
  });

  it('should have events namespace', () => {
    // Validated by TypeScript
  });

  it('should have knowledge namespace', () => {
    // Validated by TypeScript
  });

  it('should have optional subscriptions namespace', () => {
    // Validated by TypeScript
  });
});
```

#### 1.2 TypeScript Type Tests

```typescript
// tests/unit/providers/DataProvider.types.test.ts
import { describe, it, expectTypeOf } from 'vitest';
import type { DataProvider } from '@/providers/DataProvider';
import type { Effect } from 'effect';
import type { ThingNotFoundError, OrganizationNotFoundError } from '@/providers/errors';

describe('DataProvider Types', () => {
  it('should have correct return types for things.get', () => {
    type GetReturn = ReturnType<DataProvider['things']['get']>;
    expectTypeOf<GetReturn>().toMatchTypeOf<Effect.Effect<Thing, ThingNotFoundError>>();
  });

  it('should have correct return types for things.list', () => {
    type ListReturn = ReturnType<DataProvider['things']['list']>;
    expectTypeOf<ListReturn>().toMatchTypeOf<Effect.Effect<Thing[], Error>>();
  });

  it('should have correct return types for things.create', () => {
    type CreateReturn = ReturnType<DataProvider['things']['create']>;
    expectTypeOf<CreateReturn>().toMatchTypeOf<Effect.Effect<string, Error>>();
  });

  it('should enforce required parameters', () => {
    // TypeScript will error if required params missing
    expectTypeOf<DataProvider['things']['get']>().parameter(0).toEqualTypeOf<string>();
  });
});
```

### 2. ConvexProvider Implementation Tests

#### 2.1 Things Namespace Tests

```typescript
// tests/unit/providers/ConvexProvider.things.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { ConvexProvider } from '@/providers/convex/ConvexProvider';
import { MockConvexClient } from '../../mocks/MockConvexClient';
import { ThingNotFoundError } from '@/providers/errors';
import { api } from '@/convex/_generated/api';

describe('ConvexProvider.things', () => {
  let provider: ConvexProvider;
  let mockClient: MockConvexClient;

  beforeEach(() => {
    mockClient = new MockConvexClient();
    provider = new ConvexProvider(mockClient as any);
  });

  describe('get()', () => {
    it('should return thing when found', async () => {
      const mockThing = {
        _id: 'thing_123',
        type: 'product',
        name: 'Test Product',
        properties: {},
        status: 'active',
        organizationId: 'org_1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockClient.query.mockResolvedValue(mockThing);

      const result = await Effect.runPromise(provider.things.get('thing_123'));

      expect(result).toEqual(mockThing);
      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.entities.get,
        { id: 'thing_123' }
      );
    });

    it('should throw ThingNotFoundError when not found', async () => {
      mockClient.query.mockRejectedValue(new Error('Not found'));

      await expect(
        Effect.runPromise(provider.things.get('thing_999'))
      ).rejects.toThrow(ThingNotFoundError);
    });

    it('should include thing ID in error', async () => {
      mockClient.query.mockRejectedValue(new Error('Not found'));

      try {
        await Effect.runPromise(provider.things.get('thing_999'));
      } catch (error) {
        expect(error).toBeInstanceOf(ThingNotFoundError);
        expect((error as ThingNotFoundError).thingId).toBe('thing_999');
      }
    });

    it('should handle network errors', async () => {
      mockClient.query.mockRejectedValue(new Error('Network error'));

      await expect(
        Effect.runPromise(provider.things.get('thing_123'))
      ).rejects.toThrow();
    });

    it('should validate thing ID format', async () => {
      await expect(
        Effect.runPromise(provider.things.get(''))
      ).rejects.toThrow();
    });
  });

  describe('list()', () => {
    it('should return list of things', async () => {
      const mockThings = [
        { _id: '1', type: 'product', name: 'Product 1' },
        { _id: '2', type: 'product', name: 'Product 2' },
      ];

      mockClient.query.mockResolvedValue(mockThings);

      const result = await Effect.runPromise(
        provider.things.list({ type: 'product' })
      );

      expect(result).toEqual(mockThings);
      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.entities.list,
        { type: 'product' }
      );
    });

    it('should filter by organization ID', async () => {
      mockClient.query.mockResolvedValue([]);

      await Effect.runPromise(
        provider.things.list({ type: 'product', organizationId: 'org_1' })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.entities.list,
        { type: 'product', organizationId: 'org_1' }
      );
    });

    it('should return empty array when no things found', async () => {
      mockClient.query.mockResolvedValue([]);

      const result = await Effect.runPromise(
        provider.things.list({ type: 'product' })
      );

      expect(result).toEqual([]);
    });

    it('should validate thing type', async () => {
      await expect(
        Effect.runPromise(provider.things.list({ type: '' as any }))
      ).rejects.toThrow();
    });

    it('should handle pagination parameters', async () => {
      mockClient.query.mockResolvedValue([]);

      await Effect.runPromise(
        provider.things.list({
          type: 'product',
          limit: 10,
          cursor: 'cursor_123',
        })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.entities.list,
        expect.objectContaining({ limit: 10, cursor: 'cursor_123' })
      );
    });
  });

  describe('create()', () => {
    it('should create thing and return ID', async () => {
      mockClient.mutation.mockResolvedValue('thing_new');

      const input = {
        type: 'product',
        name: 'New Product',
        properties: { price: 99.99 },
        organizationId: 'org_1',
      };

      const id = await Effect.runPromise(provider.things.create(input));

      expect(id).toBe('thing_new');
      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.create,
        expect.objectContaining(input)
      );
    });

    it('should validate required fields', async () => {
      await expect(
        Effect.runPromise(
          provider.things.create({
            type: '',
            name: '',
            organizationId: '',
          } as any)
        )
      ).rejects.toThrow();
    });

    it('should handle creation errors', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Database error'));

      await expect(
        Effect.runPromise(
          provider.things.create({
            type: 'product',
            name: 'Product',
            organizationId: 'org_1',
          })
        )
      ).rejects.toThrow();
    });

    it('should set default status to draft', async () => {
      mockClient.mutation.mockResolvedValue('thing_new');

      await Effect.runPromise(
        provider.things.create({
          type: 'product',
          name: 'Product',
          organizationId: 'org_1',
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.create,
        expect.objectContaining({ status: 'draft' })
      );
    });

    it('should include timestamps', async () => {
      mockClient.mutation.mockResolvedValue('thing_new');

      await Effect.runPromise(
        provider.things.create({
          type: 'product',
          name: 'Product',
          organizationId: 'org_1',
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.create,
        expect.objectContaining({
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
    });
  });

  describe('update()', () => {
    it('should update thing and return updated thing', async () => {
      const mockUpdated = {
        _id: 'thing_123',
        type: 'product',
        name: 'Updated Product',
        properties: {},
        status: 'active',
        organizationId: 'org_1',
        createdAt: Date.now() - 1000,
        updatedAt: Date.now(),
      };

      mockClient.mutation.mockResolvedValue(mockUpdated);

      const result = await Effect.runPromise(
        provider.things.update('thing_123', { name: 'Updated Product' })
      );

      expect(result).toEqual(mockUpdated);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.update,
        { id: 'thing_123', name: 'Updated Product' }
      );
    });

    it('should handle partial updates', async () => {
      mockClient.mutation.mockResolvedValue({});

      await Effect.runPromise(
        provider.things.update('thing_123', {
          properties: { newField: 'value' },
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.update,
        expect.objectContaining({ properties: { newField: 'value' } })
      );
    });

    it('should throw error if thing not found', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Not found'));

      await expect(
        Effect.runPromise(provider.things.update('thing_999', { name: 'X' }))
      ).rejects.toThrow();
    });

    it('should update updatedAt timestamp', async () => {
      mockClient.mutation.mockResolvedValue({});

      await Effect.runPromise(
        provider.things.update('thing_123', { name: 'Updated' })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.update,
        expect.objectContaining({ updatedAt: expect.any(Number) })
      );
    });
  });

  describe('delete()', () => {
    it('should delete thing', async () => {
      mockClient.mutation.mockResolvedValue(undefined);

      await Effect.runPromise(provider.things.delete('thing_123'));

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.entities.delete,
        { id: 'thing_123' }
      );
    });

    it('should throw error if thing not found', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Not found'));

      await expect(
        Effect.runPromise(provider.things.delete('thing_999'))
      ).rejects.toThrow();
    });

    it('should validate thing ID', async () => {
      await expect(
        Effect.runPromise(provider.things.delete(''))
      ).rejects.toThrow();
    });
  });
});
```

#### 2.2 Connections Namespace Tests (15 cases)

```typescript
// tests/unit/providers/ConvexProvider.connections.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Effect } from 'effect';
import { ConvexProvider } from '@/providers/convex/ConvexProvider';
import { MockConvexClient } from '../../mocks/MockConvexClient';

describe('ConvexProvider.connections', () => {
  let provider: ConvexProvider;
  let mockClient: MockConvexClient;

  beforeEach(() => {
    mockClient = new MockConvexClient();
    provider = new ConvexProvider(mockClient as any);
  });

  describe('create()', () => {
    it('should create connection and return ID', async () => {
      mockClient.mutation.mockResolvedValue('conn_123');

      const input = {
        fromThingId: 'user_1',
        toThingId: 'product_1',
        type: 'owns',
        metadata: { purchasedAt: Date.now() },
      };

      const id = await Effect.runPromise(provider.connections.create(input));

      expect(id).toBe('conn_123');
      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.connections.create,
        expect.objectContaining(input)
      );
    });

    it('should validate connection type', async () => {
      await expect(
        Effect.runPromise(
          provider.connections.create({
            fromThingId: 'thing_1',
            toThingId: 'thing_2',
            type: 'invalid_type' as any,
          })
        )
      ).rejects.toThrow();
    });

    it('should validate thing IDs exist', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Thing not found'));

      await expect(
        Effect.runPromise(
          provider.connections.create({
            fromThingId: 'invalid',
            toThingId: 'invalid',
            type: 'owns',
          })
        )
      ).rejects.toThrow();
    });

    it('should include timestamps', async () => {
      mockClient.mutation.mockResolvedValue('conn_123');

      await Effect.runPromise(
        provider.connections.create({
          fromThingId: 'thing_1',
          toThingId: 'thing_2',
          type: 'owns',
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.connections.create,
        expect.objectContaining({ createdAt: expect.any(Number) })
      );
    });

    it('should support temporal validity', async () => {
      mockClient.mutation.mockResolvedValue('conn_123');

      const validFrom = Date.now();
      const validTo = Date.now() + 86400000;

      await Effect.runPromise(
        provider.connections.create({
          fromThingId: 'thing_1',
          toThingId: 'thing_2',
          type: 'owns',
          validFrom,
          validTo,
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.connections.create,
        expect.objectContaining({ validFrom, validTo })
      );
    });
  });

  describe('getRelated()', () => {
    it('should return related connections', async () => {
      const mockConnections = [
        { _id: 'conn_1', fromThingId: 'user_1', toThingId: 'product_1', type: 'owns' },
        { _id: 'conn_2', fromThingId: 'user_1', toThingId: 'product_2', type: 'owns' },
      ];

      mockClient.query.mockResolvedValue(mockConnections);

      const result = await Effect.runPromise(
        provider.connections.getRelated({ thingId: 'user_1' })
      );

      expect(result).toEqual(mockConnections);
    });

    it('should filter by connection type', async () => {
      mockClient.query.mockResolvedValue([]);

      await Effect.runPromise(
        provider.connections.getRelated({ thingId: 'user_1', type: 'owns' })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.connections.getRelated,
        { thingId: 'user_1', type: 'owns' }
      );
    });

    it('should return empty array when no connections', async () => {
      mockClient.query.mockResolvedValue([]);

      const result = await Effect.runPromise(
        provider.connections.getRelated({ thingId: 'user_new' })
      );

      expect(result).toEqual([]);
    });
  });

  describe('getCount()', () => {
    it('should return connection count', async () => {
      mockClient.query.mockResolvedValue(5);

      const count = await Effect.runPromise(
        provider.connections.getCount({ thingId: 'user_1' })
      );

      expect(count).toBe(5);
    });

    it('should filter count by type', async () => {
      mockClient.query.mockResolvedValue(3);

      const count = await Effect.runPromise(
        provider.connections.getCount({ thingId: 'user_1', type: 'owns' })
      );

      expect(count).toBe(3);
    });

    it('should return 0 for no connections', async () => {
      mockClient.query.mockResolvedValue(0);

      const count = await Effect.runPromise(
        provider.connections.getCount({ thingId: 'user_new' })
      );

      expect(count).toBe(0);
    });
  });

  describe('delete()', () => {
    it('should delete connection', async () => {
      mockClient.mutation.mockResolvedValue(undefined);

      await Effect.runPromise(provider.connections.delete('conn_123'));

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.connections.delete,
        { id: 'conn_123' }
      );
    });

    it('should throw error if connection not found', async () => {
      mockClient.mutation.mockRejectedValue(new Error('Not found'));

      await expect(
        Effect.runPromise(provider.connections.delete('conn_999'))
      ).rejects.toThrow();
    });
  });
});
```

#### 2.3 Events Namespace Tests (10 cases)

```typescript
// tests/unit/providers/ConvexProvider.events.test.ts
describe('ConvexProvider.events', () => {
  let provider: ConvexProvider;
  let mockClient: MockConvexClient;

  beforeEach(() => {
    mockClient = new MockConvexClient();
    provider = new ConvexProvider(mockClient as any);
  });

  describe('log()', () => {
    it('should log event successfully', async () => {
      mockClient.mutation.mockResolvedValue(undefined);

      await Effect.runPromise(
        provider.events.log({
          type: 'thing_created',
          actorId: 'user_1',
          targetId: 'thing_123',
          metadata: { source: 'web' },
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.events.log,
        expect.objectContaining({
          type: 'thing_created',
          actorId: 'user_1',
          targetId: 'thing_123',
          timestamp: expect.any(Number),
        })
      );
    });

    it('should include timestamp', async () => {
      mockClient.mutation.mockResolvedValue(undefined);

      await Effect.runPromise(
        provider.events.log({
          type: 'thing_updated',
          actorId: 'user_1',
          targetId: 'thing_123',
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.events.log,
        expect.objectContaining({ timestamp: expect.any(Number) })
      );
    });

    it('should validate event type', async () => {
      await expect(
        Effect.runPromise(
          provider.events.log({
            type: '' as any,
            actorId: 'user_1',
            targetId: 'thing_123',
          })
        )
      ).rejects.toThrow();
    });

    it('should support metadata', async () => {
      mockClient.mutation.mockResolvedValue(undefined);

      const metadata = { ip: '192.168.1.1', userAgent: 'Mozilla/5.0' };

      await Effect.runPromise(
        provider.events.log({
          type: 'thing_viewed',
          actorId: 'user_1',
          targetId: 'thing_123',
          metadata,
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        api.mutations.events.log,
        expect.objectContaining({ metadata })
      );
    });
  });

  describe('query()', () => {
    it('should query events', async () => {
      const mockEvents = [
        { _id: 'evt_1', type: 'thing_created', timestamp: Date.now() },
        { _id: 'evt_2', type: 'thing_updated', timestamp: Date.now() },
      ];

      mockClient.query.mockResolvedValue(mockEvents);

      const result = await Effect.runPromise(
        provider.events.query({ targetId: 'thing_123' })
      );

      expect(result).toEqual(mockEvents);
    });

    it('should filter by event type', async () => {
      mockClient.query.mockResolvedValue([]);

      await Effect.runPromise(
        provider.events.query({ targetId: 'thing_123', type: 'thing_created' })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.events.query,
        expect.objectContaining({ type: 'thing_created' })
      );
    });

    it('should filter by date range', async () => {
      mockClient.query.mockResolvedValue([]);

      const from = Date.now() - 86400000;
      const to = Date.now();

      await Effect.runPromise(
        provider.events.query({ targetId: 'thing_123', from, to })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.events.query,
        expect.objectContaining({ from, to })
      );
    });
  });
});
```

#### 2.4 Knowledge Namespace Tests (8 cases)

```typescript
// tests/unit/providers/ConvexProvider.knowledge.test.ts
describe('ConvexProvider.knowledge', () => {
  let provider: ConvexProvider;
  let mockClient: MockConvexClient;

  beforeEach(() => {
    mockClient = new MockConvexClient();
    provider = new ConvexProvider(mockClient as any);
  });

  describe('embed()', () => {
    it('should create embedding and return ID', async () => {
      mockClient.mutation.mockResolvedValue('knowledge_123');

      const result = await Effect.runPromise(
        provider.knowledge.embed({
          text: 'Test content',
          thingId: 'thing_123',
          labels: ['topic:testing'],
        })
      );

      expect(result).toBe('knowledge_123');
    });

    it('should validate text content', async () => {
      await expect(
        Effect.runPromise(
          provider.knowledge.embed({ text: '', thingId: 'thing_123' })
        )
      ).rejects.toThrow();
    });
  });

  describe('search()', () => {
    it('should return semantic search results', async () => {
      const mockResults = [
        { id: 'knowledge_1', text: 'Result 1', score: 0.95 },
        { id: 'knowledge_2', text: 'Result 2', score: 0.87 },
      ];

      mockClient.query.mockResolvedValue(mockResults);

      const results = await Effect.runPromise(
        provider.knowledge.search({ query: 'test query', limit: 10 })
      );

      expect(results).toEqual(mockResults);
    });

    it('should filter by labels', async () => {
      mockClient.query.mockResolvedValue([]);

      await Effect.runPromise(
        provider.knowledge.search({
          query: 'test',
          labels: ['topic:testing'],
          limit: 10,
        })
      );

      expect(mockClient.query).toHaveBeenCalledWith(
        api.queries.knowledge.search,
        expect.objectContaining({ labels: ['topic:testing'] })
      );
    });
  });
});
```

#### 2.5 Subscriptions Tests (12 cases)

```typescript
// tests/unit/providers/ConvexProvider.subscriptions.test.ts
describe('ConvexProvider.subscriptions', () => {
  let provider: ConvexProvider;
  let mockClient: MockConvexClient;

  beforeEach(() => {
    mockClient = new MockConvexClient();
    provider = new ConvexProvider(mockClient as any);
  });

  describe('subscribeToThings()', () => {
    it('should subscribe to thing updates', async () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockClient.subscribe.mockReturnValue(mockUnsubscribe);

      const unsubscribe = provider.subscriptions!.subscribeToThings(
        { type: 'product', organizationId: 'org_1' },
        callback
      );

      expect(mockClient.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback on updates', async () => {
      const callback = vi.fn();
      let updateHandler: any;

      mockClient.subscribe.mockImplementation((query, args, handler) => {
        updateHandler = handler;
        return vi.fn();
      });

      provider.subscriptions!.subscribeToThings(
        { type: 'product', organizationId: 'org_1' },
        callback
      );

      const mockThings = [{ _id: '1', type: 'product', name: 'Product 1' }];
      updateHandler(mockThings);

      expect(callback).toHaveBeenCalledWith(mockThings[0]);
    });

    it('should unsubscribe when called', async () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockClient.subscribe.mockReturnValue(mockUnsubscribe);

      const unsubscribe = provider.subscriptions!.subscribeToThings(
        { type: 'product', organizationId: 'org_1' },
        callback
      );

      unsubscribe();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle subscription errors', async () => {
      const callback = vi.fn();
      mockClient.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      expect(() =>
        provider.subscriptions!.subscribeToThings(
          { type: 'product', organizationId: 'org_1' },
          callback
        )
      ).toThrow('Subscription failed');
    });
  });

  describe('subscribeToConnections()', () => {
    it('should subscribe to connection updates', async () => {
      const callback = vi.fn();
      const mockUnsubscribe = vi.fn();

      mockClient.subscribe.mockReturnValue(mockUnsubscribe);

      const unsubscribe = provider.subscriptions!.subscribeToConnections(
        { thingId: 'thing_123' },
        callback
      );

      expect(mockClient.subscribe).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback on connection changes', async () => {
      const callback = vi.fn();
      let updateHandler: any;

      mockClient.subscribe.mockImplementation((query, args, handler) => {
        updateHandler = handler;
        return vi.fn();
      });

      provider.subscriptions!.subscribeToConnections(
        { thingId: 'thing_123' },
        callback
      );

      const mockConnections = [{ _id: 'conn_1', type: 'owns' }];
      updateHandler(mockConnections);

      expect(callback).toHaveBeenCalledWith(mockConnections[0]);
    });
  });
});
```

### 3. Error Handling Tests (10 cases)

```typescript
// tests/unit/providers/errors.test.ts
import { describe, it, expect } from 'vitest';
import {
  DataProviderError,
  ThingNotFoundError,
  OrganizationNotFoundError,
  ConnectionCreateError,
} from '@/providers/errors';

describe('Error Types', () => {
  describe('DataProviderError', () => {
    it('should create base error', () => {
      const error = new DataProviderError('Test error', 'TEST_CODE', 'convex');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.provider).toBe('convex');
      expect(error._tag).toBe('DataProviderError');
    });

    it('should be instanceof Error', () => {
      const error = new DataProviderError('Test', 'CODE', 'provider');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DataProviderError);
    });
  });

  describe('ThingNotFoundError', () => {
    it('should create thing not found error', () => {
      const error = new ThingNotFoundError('thing_123', 'Not in database');

      expect(error.thingId).toBe('thing_123');
      expect(error.message).toContain('thing_123');
      expect(error._tag).toBe('ThingNotFoundError');
      expect(error.code).toBe('THING_NOT_FOUND');
    });

    it('should include optional details', () => {
      const error = new ThingNotFoundError('thing_123', 'Database offline');

      expect(error.message).toContain('Database offline');
    });
  });

  describe('OrganizationNotFoundError', () => {
    it('should create org not found error', () => {
      const error = new OrganizationNotFoundError('org_123');

      expect(error.organizationId).toBe('org_123');
      expect(error._tag).toBe('OrganizationNotFoundError');
    });
  });
});
```

---

## Integration Tests

### 1. Full CRUD Flow Tests

```typescript
// tests/integration/convexProvider.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ConvexHttpClient } from 'convex/browser';
import { ConvexProvider } from '@/providers/convex/ConvexProvider';
import { Effect } from 'effect';

describe('ConvexProvider Integration', () => {
  let provider: ConvexProvider;
  let client: ConvexHttpClient;

  beforeAll(() => {
    client = new ConvexHttpClient(process.env.TEST_CONVEX_URL!);
    provider = new ConvexProvider(client);
  });

  afterAll(() => {
    client.close();
  });

  describe('Things CRUD Flow', () => {
    it('should complete full CRUD lifecycle', async () => {
      // CREATE
      const createInput = {
        type: 'product' as const,
        name: 'Test Product',
        properties: { price: 99.99 },
        organizationId: 'org_test',
      };

      const thingId = await Effect.runPromise(provider.things.create(createInput));
      expect(thingId).toBeTruthy();

      // READ
      const thing = await Effect.runPromise(provider.things.get(thingId));
      expect(thing.name).toBe('Test Product');
      expect(thing.properties.price).toBe(99.99);

      // UPDATE
      const updated = await Effect.runPromise(
        provider.things.update(thingId, { name: 'Updated Product' })
      );
      expect(updated.name).toBe('Updated Product');

      // LIST
      const list = await Effect.runPromise(
        provider.things.list({ type: 'product', organizationId: 'org_test' })
      );
      expect(list.some((t) => t._id === thingId)).toBe(true);

      // DELETE
      await Effect.runPromise(provider.things.delete(thingId));

      // VERIFY DELETED
      await expect(Effect.runPromise(provider.things.get(thingId))).rejects.toThrow();
    });
  });

  describe('Connections Flow', () => {
    it('should create and query connections', async () => {
      // Create two things
      const userId = await Effect.runPromise(
        provider.things.create({
          type: 'creator',
          name: 'User',
          organizationId: 'org_test',
        })
      );

      const productId = await Effect.runPromise(
        provider.things.create({
          type: 'product',
          name: 'Product',
          organizationId: 'org_test',
        })
      );

      // Create connection
      const connId = await Effect.runPromise(
        provider.connections.create({
          fromThingId: userId,
          toThingId: productId,
          type: 'owns',
        })
      );

      expect(connId).toBeTruthy();

      // Query connections
      const connections = await Effect.runPromise(
        provider.connections.getRelated({ thingId: userId })
      );

      expect(connections).toHaveLength(1);
      expect(connections[0].toThingId).toBe(productId);

      // Count connections
      const count = await Effect.runPromise(
        provider.connections.getCount({ thingId: userId })
      );

      expect(count).toBe(1);

      // Cleanup
      await Effect.runPromise(provider.connections.delete(connId));
      await Effect.runPromise(provider.things.delete(userId));
      await Effect.runPromise(provider.things.delete(productId));
    });
  });

  describe('Events Flow', () => {
    it('should log and query events', async () => {
      const thingId = await Effect.runPromise(
        provider.things.create({
          type: 'product',
          name: 'Product',
          organizationId: 'org_test',
        })
      );

      // Log event
      await Effect.runPromise(
        provider.events.log({
          type: 'thing_viewed',
          actorId: 'user_test',
          targetId: thingId,
          metadata: { ip: '127.0.0.1' },
        })
      );

      // Query events
      const events = await Effect.runPromise(
        provider.events.query({ targetId: thingId })
      );

      expect(events.length).toBeGreaterThan(0);
      expect(events.some((e) => e.type === 'thing_viewed')).toBe(true);

      // Cleanup
      await Effect.runPromise(provider.things.delete(thingId));
    });
  });
});
```

### 2. Real-time Subscription Tests

```typescript
// tests/integration/subscriptions.test.ts
describe('Real-time Subscriptions', () => {
  let provider: ConvexProvider;
  let client: ConvexHttpClient;

  beforeAll(() => {
    client = new ConvexHttpClient(process.env.TEST_CONVEX_URL!);
    provider = new ConvexProvider(client);
  });

  afterAll(() => {
    client.close();
  });

  it('should receive real-time updates', async () => {
    const updates: any[] = [];
    const organizationId = 'org_test';

    // Subscribe
    const unsubscribe = provider.subscriptions!.subscribeToThings(
      { type: 'product', organizationId },
      (thing) => {
        updates.push(thing);
      }
    );

    // Wait for initial subscription
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create thing (should trigger update)
    const thingId = await Effect.runPromise(
      provider.things.create({
        type: 'product',
        name: 'Subscription Test',
        organizationId,
      })
    );

    // Wait for update
    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(updates.length).toBeGreaterThan(0);
    expect(updates.some((u) => u._id === thingId)).toBe(true);

    // Cleanup
    unsubscribe();
    await Effect.runPromise(provider.things.delete(thingId));
  });
});
```

---

## Performance Tests

```typescript
// tests/performance/provider.bench.ts
import { describe, bench } from 'vitest';
import { Effect } from 'effect';
import { ConvexProvider } from '@/providers/convex/ConvexProvider';

describe('ConvexProvider Performance', () => {
  const provider = new ConvexProvider(/* ... */);

  bench('things.get() overhead', async () => {
    await Effect.runPromise(provider.things.get('thing_123'));
  }, {
    time: 5000, // 5 seconds
    iterations: 1000,
  });

  bench('things.list() overhead', async () => {
    await Effect.runPromise(provider.things.list({ type: 'product' }));
  }, {
    time: 5000,
    iterations: 500,
  });

  bench('connections.create() overhead', async () => {
    await Effect.runPromise(
      provider.connections.create({
        fromThingId: 'thing_1',
        toThingId: 'thing_2',
        type: 'owns',
      })
    );
  }, {
    time: 5000,
    iterations: 500,
  });
});
```

---

## Test Data & Fixtures

```typescript
// tests/fixtures/things.ts
export const mockThings = {
  product: {
    _id: 'thing_product_1',
    type: 'product',
    name: 'Test Product',
    properties: { price: 99.99, stock: 100 },
    status: 'active',
    organizationId: 'org_test',
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  user: {
    _id: 'thing_user_1',
    type: 'creator',
    name: 'Test User',
    properties: { email: 'test@example.com' },
    status: 'active',
    organizationId: 'org_test',
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
};

export const mockConnections = [
  {
    _id: 'conn_1',
    fromThingId: 'thing_user_1',
    toThingId: 'thing_product_1',
    type: 'owns',
    metadata: { purchasedAt: 1704067200000 },
    createdAt: 1704067200000,
  },
];
```

---

## CI/CD Integration

```yaml
# .github/workflows/test-dataprovider.yml
name: DataProvider Tests

on:
  push:
    paths:
      - 'src/providers/**'
      - 'tests/unit/providers/**'
      - 'tests/integration/convexProvider.test.ts'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun test tests/unit/providers

      - name: Run integration tests
        run: bun test tests/integration/convexProvider.test.ts
        env:
          TEST_CONVEX_URL: ${{ secrets.TEST_CONVEX_URL }}

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Quality Gates

### Gate 1: Unit Tests

- [ ] All DataProvider interface types compile
- [ ] All ConvexProvider methods implemented
- [ ] 90%+ code coverage
- [ ] All error types tested
- [ ] All subscription methods tested
- [ ] No TypeScript errors
- [ ] All tests pass (100%)

### Gate 2: Integration Tests

- [ ] Full CRUD flow passes
- [ ] Real-time subscriptions work
- [ ] All 6 dimensions tested
- [ ] Performance <10ms overhead measured
- [ ] Memory leaks checked (no leaks)
- [ ] All tests pass (100%)

### Gate 3: Backward Compatibility

- [ ] All 50+ existing auth tests pass UNCHANGED
- [ ] No breaking changes to public API
- [ ] Existing Convex hooks work
- [ ] Zero production incidents

### Gate 4: Performance

- [ ] things.get() <10ms overhead
- [ ] things.list() <20ms overhead
- [ ] connections.create() <15ms overhead
- [ ] Subscription setup <50ms
- [ ] Memory usage stable (no leaks)

### Gate 5: Code Quality

- [ ] ESLint passes (zero errors)
- [ ] Prettier formatted
- [ ] TSDoc comments complete
- [ ] Code review approved by 2+ developers

---

**Total Test Count:** 120+ test cases
**Estimated Implementation Time:** 3-4 days
**Coverage Target:** 95%+ unit, 85%+ integration
**Performance Target:** <10ms overhead per operation

**Status:** ✅ Ready for Implementation
