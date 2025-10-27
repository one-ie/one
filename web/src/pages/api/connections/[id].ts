/**
 * Connections API - Get Single Connection
 *
 * GET /api/connections/[id] - Get a single connection
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/connections/[id]
 * Retrieve a single connection by ID
 *
 * Returns:
 * - Connection with from/to thing IDs
 * - Relationship type and metadata
 * - Timestamps and validity window
 *
 * @example
 * ```bash
 * curl http://localhost:4321/api/connections/connection_123
 * ```
 */
export const GET: APIRoute = async ({ params }) => {
  try {
    const provider = getDefaultProvider();
    const id = params.id;

    if (!id) {
      const response = errorResponse('BAD_REQUEST', 'Connection ID is required');
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const connection = await provider.connections.get(id);

    if (!connection) {
      const response = errorResponse(
        'NOT_FOUND',
        `Connection with ID ${id} not found`
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(successResponse(connection)), {
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
