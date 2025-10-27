/**
 * Events API - List & Record
 *
 * Dimension 5: Events (actions and state changes)
 * Endpoints for recording and querying event logs.
 *
 * GET  /api/events              - List all events (audit log)
 * POST /api/events              - Record a new event
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/events
 * List all events (complete audit trail) with filtering
 *
 * Query Parameters:
 * - type: Filter by event type (entity_created, course_enrolled, etc.)
 * - actorId: Filter by actor (who performed the action)
 * - targetId: Filter by target (what was affected)
 * - groupId: Filter by group ID
 * - startTime: Filter by start timestamp (milliseconds)
 * - endTime: Filter by end timestamp (milliseconds)
 * - limit: Number of results (default 50, max 1000)
 * - offset: Pagination offset (default 0)
 * - sort: Sort order ('asc' or 'desc', default 'desc')
 *
 * Returns:
 * - List of events with full audit trail
 * - Timestamps for all events
 * - Actor and target information
 *
 * @example
 * ```bash
 * # List all events
 * curl http://localhost:4321/api/events
 *
 * # Filter by event type
 * curl http://localhost:4321/api/events?type=entity_created
 *
 * # Filter by actor (user)
 * curl http://localhost:4321/api/events?actorId=user_123
 *
 * # Filter by target and time range
 * curl "http://localhost:4321/api/events?targetId=course_456&startTime=1234567890&endTime=1234567999"
 *
 * # Paginate through events
 * curl "http://localhost:4321/api/events?limit=20&offset=0"
 * ```
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Parse query parameters
    const type = url.searchParams.get('type');
    const actorId = url.searchParams.get('actorId');
    const targetId = url.searchParams.get('targetId');
    const groupId = url.searchParams.get('groupId');
    const startTime = url.searchParams.get('startTime')
      ? parseInt(url.searchParams.get('startTime')!)
      : undefined;
    const endTime = url.searchParams.get('endTime')
      ? parseInt(url.searchParams.get('endTime')!)
      : undefined;
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50'),
      1000
    );
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const sort = (url.searchParams.get('sort') || 'desc') as 'asc' | 'desc';

    // Build filter
    const filter: Record<string, any> = {};
    if (type) filter.type = type;
    if (actorId) filter.actorId = actorId;
    if (targetId) filter.targetId = targetId;
    if (groupId) filter.groupId = groupId;
    if (startTime) filter.since = startTime;
    if (endTime) filter.until = endTime;

    // List events via provider and extract Effect value
    let events = await Effect.runPromise(provider.events.list(filter));

    // Sort by timestamp
    events.sort((a, b) =>
      sort === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
    );

    // Paginate
    const paginated = events.slice(offset, offset + limit);

    return new Response(
      JSON.stringify(
        successResponse({
          events: paginated,
          total: events.length,
          limit,
          offset,
        })
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=30, public',
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
 * POST /api/events
 * Record a new event (log action)
 *
 * Request Body:
 * ```json
 * {
 *   "type": "entity_created",
 *   "actorId": "user_123",
 *   "targetId": "course_456",
 *   "groupId": "group_789",
 *   "metadata": {
 *     "entityType": "course",
 *     "entityName": "Python Basics"
 *   }
 * }
 * ```
 *
 * Common Event Types:
 * - entity_created: An entity was created
 * - entity_updated: An entity was updated
 * - entity_deleted: An entity was deleted
 * - course_enrolled: User enrolled in course
 * - course_completed: User completed course
 * - lesson_started: User started lesson
 * - lesson_completed: User completed lesson
 * - payment_received: Payment received
 * - user_registered: New user registered
 * - connection_created: Relationship created
 *
 * Returns: Created Event with _id and timestamp
 *
 * @example
 * ```bash
 * curl -X POST http://localhost:4321/api/events \
 *   -H 'Content-Type: application/json' \
 *   -d '{
 *     "type": "entity_created",
 *     "actorId": "user_123",
 *     "targetId": "course_456",
 *     "groupId": "group_789",
 *     "metadata": {
 *       "entityType": "course",
 *       "entityName": "Python Basics"
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

    if (!body.actorId || typeof body.actorId !== 'string') {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'actorId is required and must be a string'
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

    // Record event and extract Effect value
    const eventId = await Effect.runPromise(
      provider.events.create({
        type: body.type,
        actorId: body.actorId,
        targetId: body.targetId,
        groupId: body.groupId,
        metadata: body.metadata || {},
      })
    );

    return new Response(JSON.stringify(successResponse({ _id: eventId })), {
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
