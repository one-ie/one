import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Use string type instead of backend Id type to avoid import issues during build
type GroupId = string;

interface ResolverOptions {
  groupId?: GroupId;
  fallbackToGlobal?: boolean;
}

/**
 * Resolve file path with hierarchical group support
 *
 * Resolution order:
 * 1. Most specific group path (e.g., /acme/groups/engineering/frontend/file.md)
 * 2. Parent group paths (walk up hierarchy)
 * 3. Installation root (e.g., /acme/file.md)
 * 4. Global fallback (e.g., /one/file.md)
 */
export async function resolveFilePath(
  relativePath: string,
  options: ResolverOptions = {}
): Promise<string | null> {
  const installationName = import.meta.env.INSTALLATION_NAME;

  // Validate path (prevent directory traversal)
  if (relativePath.includes('..')) {
    console.error('Path traversal not allowed:', relativePath);
    return null;
  }

  // If groupId provided, try group-specific paths
  if (options.groupId && installationName) {
    const groupPath = await getGroupPath(options.groupId);
    if (groupPath) {
      const groupFile = path.join('/', installationName, 'groups', groupPath, relativePath);

      if (existsSync(groupFile)) {
        return groupFile;
      }

      // Walk up parent groups
      const parentPath = await getParentGroupPath(options.groupId);
      if (parentPath) {
        const parentFile = path.join('/', installationName, 'groups', parentPath, relativePath);
        if (existsSync(parentFile)) {
          return parentFile;
        }
      }
    }
  }

  // Try installation root
  if (installationName) {
    const installFile = path.join('/', installationName, relativePath);
    if (existsSync(installFile)) {
      return installFile;
    }
  }

  // Fallback to global
  if (options.fallbackToGlobal !== false) {
    const globalFile = path.join('/one', relativePath);
    if (existsSync(globalFile)) {
      return globalFile;
    }
  }

  return null;
}

/**
 * Load file content with hierarchical resolution
 */
export async function loadFileContent(
  relativePath: string,
  options: ResolverOptions = {}
): Promise<string | null> {
  const filePath = await resolveFilePath(relativePath, options);

  if (!filePath) {
    return null;
  }

  try {
    return await readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${filePath}`, error);
    return null;
  }
}

/**
 * Helper: Get group hierarchy path from Convex
 */
async function getGroupPath(groupId: GroupId): Promise<string | null> {
  try {
    // Query Convex backend for group path
    const { ConvexHttpClient } = await import('convex/browser');
    const client = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || 'https://shocking-falcon-870.convex.cloud'
    );

    // Dynamic import - this will fail gracefully if API doesn't exist
    // For now, return null since backend API may not have this query yet
    console.warn('getGroupPath not yet implemented - backend API query needed');
    return null;
  } catch (error) {
    console.error('Failed to get group path:', error);
    return null;
  }
}

/**
 * Helper: Get parent group path from Convex
 */
async function getParentGroupPath(groupId: GroupId): Promise<string | null> {
  try {
    const { ConvexHttpClient } = await import('convex/browser');
    const client = new ConvexHttpClient(
      import.meta.env.PUBLIC_CONVEX_URL || 'https://shocking-falcon-870.convex.cloud'
    );

    // Dynamic import - this will fail gracefully if API doesn't exist
    // For now, return null since backend API may not have this query yet
    console.warn('getParentGroupPath not yet implemented - backend API query needed');
    return null;
  } catch (error) {
    console.error('Failed to get parent group path:', error);
    return null;
  }
}

/**
 * Security: Validate installation name to prevent directory traversal
 */
export function isValidInstallationName(name: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
}

/**
 * Cache layer for file resolution (in-memory)
 */
const fileCache = new Map<string, string>();

export async function resolveFilePathCached(
  relativePath: string,
  options: ResolverOptions = {}
): Promise<string | null> {
  const installationName = import.meta.env.INSTALLATION_NAME;
  const cacheKey = `${installationName || 'global'}:${options.groupId || 'root'}:${relativePath}`;

  if (fileCache.has(cacheKey)) {
    return fileCache.get(cacheKey)!;
  }

  const resolved = await resolveFilePath(relativePath, options);
  if (resolved) {
    fileCache.set(cacheKey, resolved);
  }

  return resolved;
}

/**
 * Clear file cache (useful after content updates)
 */
export function clearFileCache() {
  fileCache.clear();
}
