/**
 * Convex API for SSR (Astro pages only)
 *
 * **For React Components:** Use domain hooks instead:
 * - import { useGroups } from "@/hooks/useGroups"
 * - import { useThings } from "@/hooks/useThings"
 * - import { useConnections } from "@/hooks/useConnections"
 *
 * **For Astro SSR:** This file is OK to use with ConvexHttpClient
 *
 * See DECOUPLING.md for full architecture.
 */

// For SSR: Import directly from backend (relative path)
// Frontend stays decoupled via PUBLIC_CONVEX_URL env var
export { api } from '../../../backend/convex/_generated/api.js';
