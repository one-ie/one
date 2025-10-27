/**
 * Connections API - List & Create
 *
 * Dimension 4: Connections (relationships between things)
 * Endpoints for managing relationships between entities.
 *
 * GET  /api/connections              - List all connections
 * POST /api/connections              - Create a new connection
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/connections
 * List all connections with filtering
 *
 * Query Parameters:
 * - type: Filter by relationship type (owns, enrolled_in, follows, etc.)
 * - fromEntityId: Filter by source entity ID
 * - toEntityId: Filter by target entity ID
 * - groupId: Filter by group ID
 * - limit: Number of results (default 50, max 1000)
 * - offset: Pagination offset (default 0)
 *
 * Returns:
 * - List of connections with relationship metadata
 *
 * @example
 * ```bash
 * # List all connections
 * curl http://localhost:4321/api/connections
 *
 * # Filter by relationship type
 * curl http://localhost:4321/api/connections?type=owns
 *
 * # Filter by source entity
 * curl http://localhost:4321/api/connections?fromEntityId=thing_123
 *
 * # Filter by target entity
 * curl http://localhost:4321/api/connections?toEntityId=thing_456
 * ```
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Parse query parameters
    const type = url.searchParams.get('type');
    const fromEntityId = url.searchParams.get('fromEntityId');
    const toEntityId = url.searchParams.get('toEntityId');
    const groupId = url.searchParams.get('groupId');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      1000
    );
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build filter
    const filter: Record<string, any> = {};
    if (type) filter.relationshipType = type;
    if (fromEntityId) filter.fromEntityId = fromEntityId;
    if (toEntityId) filter.toEntityId = toEntityId;
    if (groupId) filter.groupId = groupId;

    // List connections via provider and extract Effect value
    const connections = await Effect.runPromise(provider.connections.list(filter));

    // Paginate
    const paginated = connections.slice(offset, offset + limit);

    return new Response(
      JSON.stringify(
        successResponse({
          connections: paginated,
          total: connections.length,
          limit,
          offset,
        })
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=60, public',
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

/**
 * POST /api/connections
 * Create a new connection (relationship)
 *
 * Request Body:
 * ```json
 * {
 *   "fromEntityId": "thing_123",
 *   "toEntityId": "thing_456",
 *   "relationshipType": "owns",
 *   "groupId": "group_789",
 *   "metadata": {
 *     "since": 1234567890,
 *     "strength": 5
 *   }
 * }
 * ```
 *
 * Common Relationship Types:
 * - owns: X owns Y
 * - enrolled_in: X is enrolled in Y
 * - follows: X follows Y
 * - member_of: X is member of Y
 * - transacted: X transacted with Y
 * - authored: X authored Y
 * - part_of: X is part of Y
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:4321/api/connections \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "fromEntityId": "user_123",
 *     "toEntityId": "course_456",
 *     "relationshipType": "enrolled_in",
 *     "groupId": "group_789",
 *     "metadata": {
 *       "enrolledAt": 1234567890
 *     }
 *   }'
 * ```
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');
    const body = await request.json();

    // Validate required fields
    if (!body.fromEntityId || typeof body.fromEntityId !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'fromEntityId is required and must be a string'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.toEntityId || typeof body.toEntityId !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'toEntityId is required and must be a string'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.relationshipType || typeof body.relationshipType !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'relationshipType is required and must be a string'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.groupId || typeof body.groupId !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'groupId is required and must be a string'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create connection and extract Effect value
    const connectionId = await Effect.runPromise(
      provider.connections.create({
        fromEntityId: body.fromEntityId,
        toEntityId: body.toEntityId,
        relationshipType: body.relationshipType,
        groupId: body.groupId,
        metadata: body.metadata || {},
      })
    );

    return new Response(JSON.stringify(successResponse({ _id: connectionId })), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
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
