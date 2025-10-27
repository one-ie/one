/**
 * Things API - List & Create
 *
 * Dimension 3: Things (all entities)
 * Endpoints for managing entities (courses, products, users, agents, etc.)
 *
 * GET  /api/things              - List all things
 * POST /api/things              - Create a new thing
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/things
 * List all things with filtering and pagination
 *
 * Query Parameters:
 * - type: Filter by thing type (course, product, blog_post, etc.)
 * - groupId: Filter by group ID
 * - status: Filter by status (active, draft, published, archived)
 * - search: Search by name (partial match)
 * - limit: Number of results (default 50, max 1000)
 * - offset: Pagination offset (default 0)
 * - sort: Sort field (default 'createdAt')
 * - order: Sort order ('asc' or 'desc', default 'desc')
 *
 * @example
 * ```bash
 * # List all things
 * curl http://localhost:4321/api/things
 *
 * # Filter by type
 * curl http://localhost:4321/api/things?type=course
 *
 * # Filter by group and type
 * curl http://localhost:4321/api/things?type=product&groupId=group_123
 *
 * # Search and paginate
 * curl http://localhost:4321/api/things?search=python&limit=20&offset=0
 * ```
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Parse query parameters
    const type = url.searchParams.get('type');
    const groupId = url.searchParams.get('groupId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      1000
    );
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const sort = url.searchParams.get('sort') || 'createdAt';
    const order = (url.searchParams.get('order') || 'desc') as 'asc' | 'desc';

    // Build filter
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (groupId) filter.groupId = groupId;
    if (status) filter.status = status;

    // List things via provider and extract Effect value
    let things = await Effect.runPromise(provider.things.list(filter));

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      things = things.filter((thing) =>
        thing.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    const sorted = things.sort((a, b) => {
      const aVal = (a as any)[sort];
      const bVal = (b as any)[sort];

      if (typeof aVal === 'string') {
        return order === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }

      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });

    // Paginate
    const paginated = sorted.slice(offset, offset + limit);

    return new Response(
      JSON.stringify(
        successResponse({
          things: paginated,
          total: things.length,
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
 * POST /api/things
 * Create a new thing (entity)
 *
 * Request Body:
 * ```json
 * {
 *   "type": "course",
 *   "name": "Python Basics",
 *   "groupId": "group_123",
 *   "properties": {
 *     "description": "Learn Python",
 *     "duration": 40,
 *     "level": "beginner"
 *   },
 *   "status": "draft"
 * }
 * ```
 *
 * Returns: Created Thing with _id
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:4321/api/things \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "type": "course",
 *     "name": "Python Basics",
 *     "groupId": "group_123",
 *     "properties": {
 *       "description": "Learn Python"
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
    if (!body.type || typeof body.type !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'type is required and must be a string'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body.name || typeof body.name !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'name is required and must be a string'
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

    // Create thing and extract Effect value
    const thingId = await Effect.runPromise(
      provider.things.create({
        type: body.type,
        name: body.name,
        groupId: body.groupId,
        properties: body.properties || {},
        status: body.status || 'draft',
      })
    );

    return new Response(JSON.stringify(successResponse({ _id: thingId })), {
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
