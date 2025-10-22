/**
 * ⚠️ DEPRECATED - DO NOT USE THIS FILE
 *
 * This file violates the backend separation principle.
 *
 * ❌ WRONG: Importing Convex API directly in frontend
 * ✅ CORRECT: Use backend-agnostic hooks instead
 *
 * Replace imports like this:
 *
 * Before:
 * import { api } from '@/lib/convex-api'
 * const data = await convex.query(api.things.list, {})
 *
 * After:
 * import { useThings } from '@/hooks/useThings'
 * const { things } = useThings({ groupId, type })
 *
 * See CLAUDE.md for complete architecture guidelines.
 */

// Stub export to prevent build errors temporarily
// TODO: Remove all usages and delete this file
export const api = {
  things: {
    list: () => { throw new Error('Use useThings hook instead') },
    get: () => { throw new Error('Use useThings hook instead') },
  },
  connections: {
    list: () => { throw new Error('Use useConnections hook instead') },
  },
  groups: {
    list: () => { throw new Error('Use useGroups hook instead') },
    get: () => { throw new Error('Use useGroups hook instead') },
  },
  queries: {
    groups: {
      list: () => { throw new Error('Use useGroups hook instead') },
      get: () => { throw new Error('Use useGroups hook instead') },
      getBySlug: () => { throw new Error('Use useGroups hook instead') },
      getById: () => { throw new Error('Use useGroups hook instead') },
      getSubgroups: () => { throw new Error('Use useGroups hook instead') },
      getHierarchy: () => { throw new Error('Use useGroups hook instead') },
      getStats: () => { throw new Error('Use useGroups hook instead') },
      getEventsInHierarchy: () => { throw new Error('Use useGroups hook instead') },
    },
    things: {
      list: () => { throw new Error('Use useThings hook instead') },
      get: () => { throw new Error('Use useThings hook instead') },
    },
    connections: {
      list: () => { throw new Error('Use useConnections hook instead') },
    },
  },
  mutations: {
    groups: {
      create: () => { throw new Error('Use mutation hook instead') },
      update: () => { throw new Error('Use mutation hook instead') },
      archive: () => { throw new Error('Use mutation hook instead') },
    },
  },
};

// Stub Id type for backward compatibility
export type Id<T extends string> = string & { __tableName: T };
