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
};
