/**
 * People API - Get Single Person
 *
 * GET /api/people/[id] - Get a person by ID
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/people/[id]
 * Retrieve a person by ID
 *
 * Note: People are represented as Things with type: 'creator'
 * in the ontology. This endpoint retrieves a person entity.
 *
 * Returns:
 * - Person entity (type: 'creator')
 * - Role and permissions in properties
 * - Organization membership
 *
 * @example
 * ```bash
 * curl http://localhost:4321/api/people/person_123
 * ```
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');
    const id = params.id;

    if (!id) {
      const response = errorResponse('BAD_REQUEST', 'Person ID is required');
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // People are Things with type: 'creator'
    const person = await Effect.runPromise(provider.things.get(id));

    if (!person) {
      const response = errorResponse(
        'NOT_FOUND',
        `Person with ID ${id} not found`
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify it's a person (type: 'creator')
    if (person.type !== 'creator') {
      const response = errorResponse(
        'BAD_REQUEST',
        `Entity ${id} is not a person (type: ${person.type})`
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(successResponse(person)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=300, public',
      },
    });
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
