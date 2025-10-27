/**
 * Things API - Get & Update Single Thing
 *
 * GET /api/things/[id]    - Get a single thing
 * PUT /api/things/[id]    - Update a thing
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/things/[id]
 * Retrieve a single thing by ID
 *
 * Returns:
 * - Thing entity with all properties
 * - Metadata (creation time, status, etc.)
 *
 * @example
 * ```bash
 * curl http://localhost:4321/api/things/thing_123
 * ```
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');
    const id = params.id;

    if (!id) {
      const response = errorResponse('BAD_REQUEST', 'Thing ID is required');
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const thing = await Effect.runPromise(provider.things.get(id));

    if (!thing) {
      const response = errorResponse(
        'NOT_FOUND',
        `Thing with ID ${id} not found`
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(successResponse(thing)), {
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

/**
 * PUT /api/things/[id]
 * Update a thing
 *
 * Request Body:
 * ```json
 * {
 *   "name": "Updated Name",
 *   "status": "published",
 *   "properties": {
 *     "description": "Updated description",
 *     "difficulty": "advanced"
 *   }
 * }
 * ```
 *
 * Note: Properties are merged (not replaced).
 * Only provide fields you want to update.
 *
 * @example
 * ```bash
 * curl -X PUT http://localhost:4321/api/things/thing_123 \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "name": "Advanced Python",
 *     "status": "published",
 *     "properties": {
 *       "level": "advanced"
 *     }
 *   }'
 * ```
 */
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');
    const id = params.id;

    if (!id) {
      const response = errorResponse('BAD_REQUEST', 'Thing ID is required');
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify thing exists and extract Effect value
    const existing = await Effect.runPromise(provider.things.get(id));
    if (!existing) {
      const response = errorResponse(
        'NOT_FOUND',
        `Thing with ID ${id} not found`
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Update thing and extract Effect value
    await Effect.runPromise(
      provider.things.update(id, {
        name: body.name || existing.name,
        properties: body.properties
          ? { ...existing.properties, ...body.properties }
          : existing.properties,
        status: body.status || existing.status,
      })
    );

    return new Response(
      JSON.stringify(
        successResponse({
          _id: id,
          name: body.name || existing.name,
          properties: body.properties
            ? { ...existing.properties, ...body.properties }
            : existing.properties,
          status: body.status || existing.status,
        })
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
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
