/**
 * Astro Integration Helpers
 *
 * Utilities for using ontology data in Astro pages (.astro files)
 * Provides server-side data fetching and provider fallbacks
 *
 * @example
 * ```astro
 * ---
 * import { getProvider } from '@/lib/ontology/astro-helpers';
 *
 * const provider = await getProvider();
 * const course = await provider?.things.get(Astro.params.id);
 *
 * if (!course) {
 *   return Astro.redirect('/404');
 * }
 * ---
 *
 * <h1>{course.name}</h1>
 * ```
 */

import { features } from './features';

/**
 * Get provider instance for Astro SSR
 *
 * Called server-side in .astro frontmatter
 * Returns configured DataProvider or null
 *
 * @returns DataProvider instance or null if not available
 *
 * @example
 * ```astro
 * ---
 * const provider = await getProvider();
 *
 * if (!provider) {
 *   // Fall back to markdown/content collections
 *   const post = await getEntry('blog', Astro.params.slug);
 *   return Astro.redirect(`/blog/${Astro.params.slug}`);
 * }
 *
 * const thing = await provider.things.get(Astro.params.id);
 * ---
 * ```
 */
export async function getProvider() {
  // This would be implemented to return the actual provider
  // For now, it's a placeholder showing the pattern

  if (!features.connections) {
    return null;
  }

  // TODO: Initialize and return actual DataProvider
  // return convexProvider || notionProvider || null;

  return null;
}

/**
 * Get static paths for dynamic routes
 *
 * Pre-generates all possible routes at build time
 *
 * @param type - Thing type to generate routes for
 * @returns Array of static paths
 *
 * @example
 * ```astro
 * ---
 * // src/pages/things/[type]/[id].astro
 * import { getStaticPaths } from '@/lib/ontology/astro-helpers';
 *
 * export const getStaticPaths = () => getStaticPaths('course');
 * ---
 * ```
 */
export async function getStaticPaths(type?: string) {
  const provider = await getProvider();

  if (!provider) {
    // No provider - return empty (on-demand rendering)
    return [];
  }

  try {
    const things = await (provider as any).things.list({
      type,
      status: 'published',
    });

    return things.map((thing: any) => ({
      params: { id: thing._id, type: thing.type },
      props: { thing },
    }));
  } catch (error) {
    console.error('Failed to get static paths:', error);
    return [];
  }
}

/**
 * Fetch thing with fallback to content collections
 *
 * Tries provider first, falls back to markdown
 *
 * @param id - Thing ID or slug
 * @returns Thing data or null
 *
 * @example
 * ```astro
 * ---
 * import { getThingWithFallback } from '@/lib/ontology/astro-helpers';
 * import { getEntry } from 'astro:content';
 *
 * const thing = await getThingWithFallback(Astro.params.slug);
 *
 * if (!thing) {
 *   const post = await getEntry('blog', Astro.params.slug);
 *   // use post data
 * }
 * ---
 * ```
 */
export async function getThingWithFallback(id: string) {
  const provider = await getProvider();

  if (!provider) {
    return null;
  }

  try {
    return await (provider as any).things.get(id as any);
  } catch (error) {
    console.error(`Failed to fetch thing ${id}:`, error);
    return null;
  }
}

/**
 * Fetch things list with optional filtering
 *
 * Useful for listing pages (courses, blog posts, etc.)
 *
 * @param filter - Optional filters
 * @returns Array of things
 *
 * @example
 * ```astro
 * ---
 * import { getThings } from '@/lib/ontology/astro-helpers';
 *
 * const courses = await getThings({ type: 'course', status: 'published' });
 * ---
 * ```
 */
export async function getThings(filter?: {
  type?: string;
  status?: string;
  limit?: number;
}) {
  const provider = await getProvider();

  if (!provider) {
    return [];
  }

  try {
    return await (provider as any).things.list(filter);
  } catch (error) {
    console.error('Failed to fetch things:', error);
    return [];
  }
}

/**
 * Fetch related things (via connections)
 *
 * @param entityId - Entity to find relationships for
 * @param relationshipType - Type of relationship
 * @returns Array of related entities
 *
 * @example
 * ```astro
 * ---
 * // Get courses taught by an instructor
 * const courses = await getRelatedThings(instructorId, 'teaching');
 * ---
 * ```
 */
export async function getRelatedThings(
  entityId: string,
  relationshipType: string
) {
  const provider = await getProvider();

  if (!provider) {
    return [];
  }

  try {
    return await (provider as any).connections.list({
      fromEntityId: entityId as any,
      relationshipType: relationshipType as any,
    });
  } catch (error) {
    console.error('Failed to fetch related things:', error);
    return [];
  }
}

/**
 * Fetch current user (if authenticated)
 *
 * Server-side user detection for personalization
 *
 * @param request - Astro request object
 * @returns Current user or null
 *
 * @example
 * ```astro
 * ---
 * import { getCurrentUser } from '@/lib/ontology/astro-helpers';
 *
 * const user = await getCurrentUser(Astro.request);
 *
 * if (!user) {
 *   return Astro.redirect('/login');
 * }
 * ---
 * ```
 */
export async function getCurrentUser(request?: Request) {
  if (!features.auth) {
    return null;
  }

  const provider = await getProvider();

  if (!provider) {
    return null;
  }

  try {
    // TODO: Extract user from request headers/cookies and fetch
    // return await provider.people.current();
    return null;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
}

/**
 * Fetch group data
 *
 * NOTE: Groups are managed as things with type='group' in the DataProvider.
 * This helper is deprecated - use getThings({ type: 'group' }) instead.
 *
 * @deprecated Use getThings({ type: 'group' }) instead
 * @param groupId - Group ID
 * @returns Group data or null
 */
export async function getGroup(groupId: string) {
  // Groups are managed through the things dimension
  // Use getThings({ type: 'group' }) to fetch groups
  return null;
}

/**
 * Fetch search results
 *
 * Server-side full-text search for SEO-friendly search pages
 *
 * @param query - Search query
 * @param type - Optional entity type filter
 * @returns Search results
 *
 * @example
 * ```astro
 * ---
 * const query = Astro.url.searchParams.get('q');
 * const results = await searchThings(query, 'course');
 * ---
 * ```
 */
export async function searchThings(query: string, type?: string) {
  if (!features.search) {
    return [];
  }

  const provider = await getProvider();

  if (!provider) {
    return [];
  }

  try {
    return await (provider as any).knowledge.search(query, { type });
  } catch (error) {
    console.error('Failed to search:', error);
    return [];
  }
}

/**
 * Fetch recent events/activity
 *
 * @param limit - Number of events
 * @returns Array of events
 *
 * @example
 * ```astro
 * ---
 * const recentActivity = await getRecentEvents(20);
 * ---
 * ```
 */
export async function getRecentEvents(limit = 20) {
  if (!features.events) {
    return [];
  }

  const provider = await getProvider();

  if (!provider) {
    return [];
  }

  try {
    return await (provider as any).events.list({ limit });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return [];
  }
}

/**
 * Check if route is available based on feature flags
 *
 * Redirect to fallback if features disabled
 *
 * @param featureCheck - Function that checks feature requirements
 * @returns true if route should render
 *
 * @example
 * ```astro
 * ---
 * if (!shouldRenderRoute(() => features.auth && features.groups)) {
 *   return Astro.redirect('/standalone');
 * }
 * ---
 * ```
 */
export function shouldRenderRoute(
  featureCheck: () => boolean,
  fallbackRoute?: string
): boolean {
  if (!featureCheck()) {
    if (fallbackRoute) {
      // Astro can't redirect in this context, return false
      // and handle redirect in component
      return false;
    }
    return false;
  }
  return true;
}

/**
 * Cache control helpers for Astro responses
 */
export const cacheControl = {
  /** Static content (long TTL) */
  static: 'public, max-age=31536000, immutable',

  /** User-specific content (no cache) */
  private: 'private, no-cache, no-store, must-revalidate',

  /** Generated content (medium TTL) */
  generated: 'public, max-age=3600, s-maxage=3600',

  /** Real-time content (short TTL) */
  dynamic: 'public, max-age=60, s-maxage=60',
};

/**
 * HTTP status codes for error handling
 */
export const statusCodes = {
  ok: 200,
  created: 201,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  conflict: 409,
  serverError: 500,
};
