/**
 * Knowledge API - Search
 *
 * Dimension 6: Knowledge (labels, embeddings, RAG)
 * GET /api/knowledge/search - Semantic search
 */

import type { APIRoute } from 'astro';
import { getDefaultProvider } from '@/providers/factory';
import { successResponse, errorResponse, getStatusCode } from '../response';

/**
 * GET /api/knowledge/search
 * Perform semantic search on knowledge base
 *
 * Query Parameters:
 * - q: Search query (required, min 3 characters)
 * - limit: Number of results (default 10, max 100)
 * - threshold: Similarity threshold 0-1 (default 0.5)
 * - groupId: Filter by group ID (optional)
 * - type: Filter by knowledge type (optional)
 *
 * Returns:
 * - List of matching knowledge items
 * - Relevance scores
 * - Embeddings if available
 *
 * @example
 * ```bash
 * # Basic search
 * curl "http://localhost:4321/api/knowledge/search?q=python+tutorial"
 *
 * # Search with limit
 * curl "http://localhost:4321/api/knowledge/search?q=machine+learning&limit=20"
 *
 * # Search with minimum similarity
 * curl "http://localhost:4321/api/knowledge/search?q=deep+learning&threshold=0.7"
 *
 * # Search within group
 * curl "http://localhost:4321/api/knowledge/search?q=courses&groupId=group_123"
 * ```
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const provider = getDefaultProvider();
    const { Effect } = await import('effect');

    // Parse query parameters
    const query = url.searchParams.get('q');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '10'),
      100
    );
    const threshold = parseFloat(url.searchParams.get('threshold') || '0.5');
    const groupId = url.searchParams.get('groupId');
    const type = url.searchParams.get('type');

    // Validate search query
    if (!query || query.trim().length < 3) {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'Search query must be at least 3 characters'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate threshold
    if (threshold < 0 || threshold > 1) {
      const response = errorResponse(
        'VALIDATION_ERROR',
        'Threshold must be between 0 and 1'
      );
      return new Response(JSON.stringify(response), {
        status: getStatusCode(response.error),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // TODO: Implement embedding generation for semantic search
    // For now, use text-based search via knowledge.list() method
    // When full implementation needed: generate embedding from query string
    // then call: provider.knowledge.search(embedding, { limit, sourceThingId: groupId })

    let results = await Effect.runPromise(
      provider.knowledge.list({
        query: query.trim(),
        knowledgeType: type as any,
        limit: limit * 2, // Get extra to filter
      })
    );

    // Filter by threshold if provided
    if (threshold > 0) {
      results = results.filter(
        (item: any) => (item.score || 1) >= threshold
      );
    }

    // Filter by group if provided
    if (groupId) {
      results = results.filter((item: any) => item.sourceThingId === groupId);
    }

    // Limit results
    results = results.slice(0, limit);

    return new Response(
      JSON.stringify(
        successResponse({
          results,
          query: query.trim(),
          total: results.length,
          limit,
        })
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=300, public',
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
