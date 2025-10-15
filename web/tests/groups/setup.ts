/**
 * Test setup for groups frontend tests
 * Provides utilities and mocks for React component testing
 */

import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Convex hooks
export const mockUseQuery = vi.fn();
export const mockUseMutation = vi.fn();

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  ConvexProvider: ({ children }: any) => children,
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Test data generators
export function createMockGroup(overrides?: any) {
  return {
    _id: `group_${Math.random()}`,
    slug: 'test-group',
    name: 'Test Group',
    type: 'business',
    status: 'active',
    settings: {
      visibility: 'private',
      joinPolicy: 'invite_only',
      plan: 'starter',
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  };
}

export function createMockGroupHierarchy(levels: number) {
  const groups = [];
  let currentParentId = undefined;

  for (let i = 0; i < levels; i++) {
    const group = createMockGroup({
      slug: `level-${i}`,
      name: `Level ${i}`,
      parentGroupId: currentParentId,
    });
    groups.push(group);
    currentParentId = group._id;
  }

  return groups;
}

export function createMockStats() {
  return {
    members: 5,
    entities: 20,
    connections: 15,
    events: 50,
    knowledge: 10,
    subgroups: 3,
  };
}

// Reset mocks before each test
beforeEach(() => {
  mockUseQuery.mockReset();
  mockUseMutation.mockReset();
});
