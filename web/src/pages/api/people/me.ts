/**
 * People API - Current User
 *
 * Dimension 2: People (authorization & governance)
 * GET /api/people/me - Get current authenticated user
 *
 * This endpoint returns the currently authenticated user's profile.
 * Requires authentication via Better Auth cookie.
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/people/me
 * Get current authenticated user profile
 *
 * Returns:
 * - User entity (type: 'creator')
 * - Role information (in properties)
 * - Organization memberships (via connections)
 *
 * Requires authentication via Better Auth session cookie.
 *
 * @example
 * ```bash
 * curl http://localhost:4321/api/people/me \
 *   -H 'Cookie: better-auth-session=...'
 * ```
 */
export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Get current authenticated user via auth provider
    const currentUser = await Effect.runPromise(
      provider.auth.getCurrentUser()
    );

    if (!currentUser) {
      const response = errorResponse(
        'UNAUTHORIZED',
        'No authenticated user found. Please sign in.'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return user as a person object
    // Note: In a real implementation, you might want to fetch
    // additional profile data from Things (type: 'creator')
    return new Response(
      JSON.stringify(
        successResponse({
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          emailVerified: currentUser.emailVerified,
        })
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=60',
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const response = errorResponse('INTERNAL_ERROR', message);
    const status = getStatusCode(response.error);

    return new Response(JSON.stringify(response), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
