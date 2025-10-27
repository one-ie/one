/**
 * Knowledge Service (Dimension 6: RAG & Semantic Search)
 *
 * Handles vector embeddings, semantic search, and RAG (Retrieval-Augmented Generation).
 * Knowledge enables AI to understand and search the ontology intelligently.
 *
 * Knowledge Types:
 * - label: Single labels for categorization
 * - document: Full documents for chunking and embedding
 * - chunk: Pieces of documents (result of chunking)
 * - vector_only: Pure vector embeddings without source text
 *
 * Features:
 * - Vector embeddings for semantic search
 * - Document chunking for RAG
 * - Label taxonomy and categorization
 * - Junction table linking things to knowledge
 * - Embedding model tracking
 * - Full-text + semantic hybrid search
 * - Automatic chunk generation from source things
 *
 * Pattern:
 * - Store embeddings alongside text
 * - Link back to source thing via sourceThingId
 * - Support multiple embedding models
 * - Chunk documents for better RAG performance
 * - Track chunk metadata for source tracking
 * - Use for: AI search, RAG context, recommendations
 *
 * Usage:
 * ```ts
 * const service = yield* KnowledgeService;
 * const results = yield* service.search('machine learning', { limit: 10 });
 * const chunks = yield* service.chunk(documentId, { size: 800 });
 * const embedded = yield* service.embed(documentId);
 * const similar = yield* service.findSimilar(embedding, { limit: 5 });
 * ```
 */

import { Effect } from 'effect';

// ============================================================================
// SERVICE CONTEXT & PROVIDER INTERFACE
// ============================================================================

/**
 * Provider interface for knowledge/vector access
 * Implementations: Convex, Notion, Markdown, HTTP, etc.
 */
export interface IKnowledgeProvider {
  list(filter?: KnowledgeFilter): Promise<Knowledge[]>;
  get(id: string): Promise<Knowledge | null>;
  create(data: CreateKnowledgeInput): Promise<Knowledge>;
  update(id: string, data: UpdateKnowledgeInput): Promise<Knowledge>;
  delete(id: string): Promise<void>;
  search(query: string, filter?: KnowledgeFilter): Promise<SearchResult[]>;
  embed(text: string): Promise<number[]>;
  findSimilar(embedding: number[], filter?: KnowledgeFilter): Promise<SearchResult[]>;
  chunk(
    text: string,
    options?: ChunkOptions
  ): Promise<ChunkResult[]>;
  chunkAndEmbed(
    text: string,
    options?: ChunkOptions
  ): Promise<Knowledge[]>;
  listByThing(thingId: string): Promise<Knowledge[]>;
}

// ============================================================================
// TYPES & DATA STRUCTURES
// ============================================================================

/**
 * Knowledge type variants
 */
export type KnowledgeType = 'label' | 'document' | 'chunk' | 'vector_only';

/**
 * Main Knowledge entity
 * Represents vectors, embeddings, and knowledge records
 */
export interface Knowledge {
  _id: string;
  groupId: string;
  knowledgeType: KnowledgeType;
  text?: string; // Optional - vectors-only don't have text
  embedding?: number[]; // Vector embedding
  embeddingModel?: string; // Model used to create embedding (e.g., 'text-embedding-3-small')
  embeddingDim?: number; // Dimension of embedding
  sourceThingId?: string; // Which thing this came from
  sourceField?: string; // Which field of the thing (e.g., 'properties.content')
  chunk?: {
    // For chunked documents
    index: number; // Position in original document
    startPos: number; // Character position in original
    endPos: number; // Character position in original
  };
  labels?: string[]; // Tags/categories
  metadata?: Record<string, any>; // Additional context
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

/**
 * Search result with similarity score
 */
export interface SearchResult {
  knowledge: Knowledge;
  score: number; // 0-1 similarity score
  highlights?: string[]; // Matching text snippets
}

/**
 * Result of chunking a document
 */
export interface ChunkResult {
  text: string;
  index: number;
  startPos: number;
  endPos: number;
}

/**
 * Options for document chunking
 */
export interface ChunkOptions {
  size?: number; // Default: 800 tokens
  overlap?: number; // Default: 200 tokens
}

/**
 * Filters for listing knowledge
 */
export interface KnowledgeFilter {
  groupId?: string;
  knowledgeType?: KnowledgeType;
  sourceThingId?: string;
  labels?: string[];
  embeddingModel?: string;
  limit?: number;
  offset?: number;
}

/**
 * Input for creating knowledge
 */
export interface CreateKnowledgeInput {
  groupId: string;
  knowledgeType: KnowledgeType;
  text?: string;
  embedding?: number[];
  embeddingModel?: string;
  sourceThingId?: string;
  sourceField?: string;
  chunk?: Knowledge['chunk'];
  labels?: string[];
  metadata?: Record<string, any>;
}

/**
 * Input for updating knowledge
 */
export interface UpdateKnowledgeInput {
  text?: string;
  embedding?: number[];
  labels?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// ERROR TYPES (Tagged Unions)
// ============================================================================

export type KnowledgeError =
  | { _tag: 'ValidationError'; message: string; field?: string }
  | { _tag: 'NotFoundError'; id: string }
  | { _tag: 'InvalidKnowledgeTypeError'; type: string }
  | { _tag: 'EmbeddingError'; message: string; originalError?: unknown }
  | { _tag: 'ChunkingError'; message: string; originalError?: unknown }
  | { _tag: 'SearchError'; message: string; originalError?: unknown }
  | { _tag: 'InvalidEmbeddingDimensionError'; expected: number; got: number }
  | { _tag: 'TextTooLongError'; length: number; maxLength: number }
  | { _tag: 'ProviderError'; message: string; originalError?: unknown };

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_KNOWLEDGE_TYPES: KnowledgeType[] = ['label', 'document', 'chunk', 'vector_only'];
const MAX_TEXT_LENGTH = 1000000; // 1MB of text

function validateKnowledgeType(type: string): Effect.Effect<KnowledgeType, KnowledgeError> {
  const validType = VALID_KNOWLEDGE_TYPES.includes(type as KnowledgeType);
  return validType
    ? Effect.succeed(type as KnowledgeType)
    : Effect.fail({
        _tag: 'InvalidKnowledgeTypeError' as const,
        type,
      });
}

function validateEmbedding(embedding?: number[]): Effect.Effect<number[] | undefined, KnowledgeError> {
  if (!embedding) return Effect.succeed(undefined);

  if (!Array.isArray(embedding)) {
    return Effect.fail({
      _tag: 'ValidationError' as const,
      message: 'Embedding must be an array of numbers',
      field: 'embedding',
    });
  }

  if (embedding.length === 0) {
    return Effect.fail({
      _tag: 'ValidationError' as const,
      message: 'Embedding cannot be empty',
      field: 'embedding',
    });
  }

  if (!embedding.every((n) => typeof n === 'number')) {
    return Effect.fail({
      _tag: 'ValidationError' as const,
      message: 'Embedding must contain only numbers',
      field: 'embedding',
    });
  }

  return Effect.succeed(embedding);
}

function validateText(text?: string): Effect.Effect<string | undefined, KnowledgeError> {
  if (!text) return Effect.succeed(undefined);

  if (text.length > MAX_TEXT_LENGTH) {
    return Effect.fail({
      _tag: 'TextTooLongError' as const,
      length: text.length,
      maxLength: MAX_TEXT_LENGTH,
    });
  }

  return Effect.succeed(text);
}

function validateCreateInput(input: CreateKnowledgeInput): Effect.Effect<CreateKnowledgeInput, KnowledgeError> {
  return Effect.gen(function* () {
    yield* validateKnowledgeType(input.knowledgeType);

    if (!input.groupId || input.groupId.length === 0) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Group ID is required',
        field: 'groupId',
      });
    }

    // Validate text if provided
    if (input.text) {
      yield* validateText(input.text);
    }

    // Validate embedding if provided
    if (input.embedding) {
      yield* validateEmbedding(input.embedding);
    }

    // For chunk types, text is required
    if (input.knowledgeType === 'chunk' && !input.text) {
      yield* Effect.fail({
        _tag: 'ValidationError' as const,
        message: 'Text is required for chunk knowledge type',
        field: 'text',
      });
    }

    return input;
  });
}

// ============================================================================
// KNOWLEDGESERVICE - Main Service
// ============================================================================

export class KnowledgeService extends Effect.Service<KnowledgeService>()('KnowledgeService', {
  effect: Effect.gen(function* () {
    return {
      /**
       * List knowledge records with optional filtering
       */
      list: (filter?: KnowledgeFilter) =>
        Effect.gen(function* () {
          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.list(filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get a single knowledge record by ID
       */
      get: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Knowledge ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          const knowledge = yield* Effect.tryPromise(() => provider.get(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to get knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          if (!knowledge) {
            yield* Effect.fail({
              _tag: 'NotFoundError' as const,
              id,
            });
          }

          return knowledge;
        }),

      /**
       * Create a new knowledge record
       */
      create: (input: CreateKnowledgeInput) =>
        Effect.gen(function* () {
          yield* validateCreateInput(input);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          const created = yield* Effect.tryPromise(() => provider.create(input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to create knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return created;
        }),

      /**
       * Update a knowledge record
       * Partial update - only provided fields are changed
       */
      update: (id: string, input: UpdateKnowledgeInput) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Knowledge ID is required',
              field: 'id',
            });
          }

          if (input.text) {
            yield* validateText(input.text);
          }

          if (input.embedding) {
            yield* validateEmbedding(input.embedding);
          }

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          const updated = yield* Effect.tryPromise(() => provider.update(id, input)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to update knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          return updated;
        }),

      /**
       * Delete a knowledge record (soft delete - sets deletedAt)
       */
      delete: (id: string) =>
        Effect.gen(function* () {
          if (!id || id.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Knowledge ID is required',
              field: 'id',
            });
          }

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.delete(id)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to delete knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Full-text and semantic search
       * Returns ranked results with similarity scores
       */
      search: (query: string, filter?: KnowledgeFilter) =>
        Effect.gen(function* () {
          if (!query || query.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Search query is required',
              field: 'query',
            });
          }

          if (query.length > 10000) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Search query too long (max 10000 characters)',
              field: 'query',
            });
          }

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.search(query, filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'SearchError' as const,
              message: `Failed to search knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error instanceof Error ? error : undefined,
            }))
          );
        }),

      /**
       * Generate embedding for text
       * Uses provider's embedding model
       */
      embed: (text: string) =>
        Effect.gen(function* () {
          yield* validateText(text);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.embed(text)).pipe(
            Effect.mapError((error) => ({
              _tag: 'EmbeddingError' as const,
              message: `Failed to embed text: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Find similar knowledge records by embedding
       * Used for semantic search and recommendations
       */
      findSimilar: (embedding: number[], filter?: KnowledgeFilter) =>
        Effect.gen(function* () {
          yield* validateEmbedding(embedding);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.findSimilar(embedding, filter)).pipe(
            Effect.mapError((error) => ({
              _tag: 'SearchError' as const,
              message: `Failed to find similar knowledge: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error instanceof Error ? error : undefined,
            }))
          );
        }),

      /**
       * Chunk a document into smaller pieces
       * For RAG (Retrieval-Augmented Generation)
       */
      chunk: (text: string, options?: ChunkOptions) =>
        Effect.gen(function* () {
          yield* validateText(text);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.chunk(text, options)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ChunkingError' as const,
              message: `Failed to chunk text: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Chunk a document and embed all chunks
       * Combined operation for efficient RAG setup
       */
      chunkAndEmbed: (text: string, options?: ChunkOptions) =>
        Effect.gen(function* () {
          yield* validateText(text);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.chunkAndEmbed(text, options)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ChunkingError' as const,
              message: `Failed to chunk and embed: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Get all knowledge associated with a thing
       */
      listByThing: (thingId: string) =>
        Effect.gen(function* () {
          if (!thingId || thingId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Thing ID is required',
              field: 'thingId',
            });
          }

          const provider = yield* Effect.Tag<IKnowledgeProvider>();
          return yield* Effect.tryPromise(() => provider.listByThing(thingId)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ProviderError' as const,
              message: `Failed to list knowledge by thing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );
        }),

      /**
       * Generate embeddings and store for a thing
       * Automatically chunks large content
       */
      indexThing: (
        thingId: string,
        text: string,
        groupId: string,
        options?: ChunkOptions
      ): Effect.Effect<Knowledge[], KnowledgeError> =>
        Effect.gen(function* () {
          if (!thingId || thingId.length === 0) {
            yield* Effect.fail({
              _tag: 'ValidationError' as const,
              message: 'Thing ID is required',
              field: 'thingId',
            });
          }

          yield* validateText(text);

          const provider = yield* Effect.Tag<IKnowledgeProvider>();

          // Chunk the text
          const chunks = yield* Effect.tryPromise(() => provider.chunk(text, options)).pipe(
            Effect.mapError((error) => ({
              _tag: 'ChunkingError' as const,
              message: `Failed to chunk text for indexing: ${error instanceof Error ? error.message : String(error)}`,
              originalError: error,
            }))
          );

          // Create knowledge records for each chunk with embeddings
          // Note: Sequential processing for now (concurrency would require Effect.all which needs ES2024+)
          const results: Knowledge[] = [];

          for (const chunkResult of chunks) {
            const embedding = yield* (this as any).embed(chunkResult.text);
            const knowledge: CreateKnowledgeInput = {
              groupId,
              knowledgeType: 'chunk',
              text: chunkResult.text,
              embedding,
              embeddingModel: 'text-embedding-3-small', // Default model
              sourceThingId: thingId,
              chunk: {
                index: chunkResult.index,
                startPos: chunkResult.startPos,
                endPos: chunkResult.endPos,
              },
            };
            const created = yield* (this as any).create(knowledge);
            results.push(created);
          }

          return results;
        }),
    };
  }),
  dependencies: [Effect.Tag<IKnowledgeProvider>()],
}) {}

// ============================================================================
// SERVICE EXPORT
// ============================================================================

// KnowledgeService and types are exported above (lines 176-200, 330+)
