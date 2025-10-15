/**
 * KnowledgeService - Backend-Agnostic Knowledge Operations
 *
 * Handles embeddings, labels, and RAG using DataProvider interface.
 * Supports semantic search and knowledge graph operations.
 */

import { Effect } from "effect";
import {
  DataProviderService,
  type Knowledge,
  type CreateKnowledgeInput,
  type SearchKnowledgeOptions,
  type KnowledgeType,
  QueryError,
} from "../providers/DataProvider";

// ============================================================================
// KNOWLEDGE SERVICE
// ============================================================================

export class KnowledgeService {
  /**
   * Get a knowledge item by ID
   */
  static get = (id: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.knowledge.get(id);
    });

  /**
   * List knowledge items with filters
   */
  static list = (options?: SearchKnowledgeOptions) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.knowledge.list(options);
    });

  /**
   * Create a new knowledge item
   */
  static create = (input: CreateKnowledgeInput) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Validate input based on type
      if (input.knowledgeType === "label" && !input.text) {
        return yield* Effect.fail(new QueryError("Label knowledge requires text"));
      }

      if (input.knowledgeType === "chunk" && (!input.text || !input.embedding)) {
        return yield* Effect.fail(
          new QueryError("Chunk knowledge requires both text and embedding")
        );
      }

      if (input.knowledgeType === "vector_only" && !input.embedding) {
        return yield* Effect.fail(
          new QueryError("Vector-only knowledge requires embedding")
        );
      }

      return yield* provider.knowledge.create(input);
    });

  /**
   * Link knowledge to a thing
   */
  static link = (thingId: string, knowledgeId: string, role?: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.knowledge.link(thingId, knowledgeId, role as any);
    });

  /**
   * Search knowledge by embedding (semantic search)
   */
  static search = (embedding: number[], options?: SearchKnowledgeOptions) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.knowledge.search(embedding, options);
    });

  /**
   * Create label knowledge
   */
  static createLabel = (text: string, labels?: string[]) =>
    Effect.gen(function* () {
      return yield* KnowledgeService.create({
        knowledgeType: "label",
        text,
        labels,
      });
    });

  /**
   * Create chunk knowledge (for RAG)
   */
  static createChunk = (
    text: string,
    embedding: number[],
    sourceThingId: string,
    sourceField: string,
    chunkIndex: number,
    embeddingModel?: string
  ) =>
    Effect.gen(function* () {
      return yield* KnowledgeService.create({
        knowledgeType: "chunk",
        text,
        embedding,
        embeddingModel: embeddingModel || "text-embedding-3-large",
        embeddingDim: embedding.length,
        sourceThingId,
        sourceField,
        chunk: {
          index: chunkIndex,
          tokenCount: Math.ceil(text.length / 4), // Rough estimate
        },
      });
    });

  /**
   * Get knowledge for a thing
   */
  static getForThing = (thingId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      return yield* provider.knowledge.list({
        sourceThingId: thingId,
      });
    });

  /**
   * Get labels for a thing
   */
  static getLabels = (thingId: string) =>
    Effect.gen(function* () {
      const allKnowledge = yield* KnowledgeService.getForThing(thingId);
      return allKnowledge.filter((k) => k.knowledgeType === "label");
    });

  /**
   * Get chunks for a thing
   */
  static getChunks = (thingId: string) =>
    Effect.gen(function* () {
      const allKnowledge = yield* KnowledgeService.getForThing(thingId);
      return allKnowledge.filter((k) => k.knowledgeType === "chunk");
    });

  /**
   * Add labels to a thing
   */
  static addLabels = (thingId: string, labels: string[]) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;
      const results: string[] = [];

      for (const label of labels) {
        // Create label knowledge
        const knowledgeId = yield* KnowledgeService.createLabel(label, [label]);

        // Link to thing
        yield* provider.knowledge.link(thingId, knowledgeId, "label");

        results.push(knowledgeId);
      }

      return results;
    });

  /**
   * Chunk and embed content for RAG
   */
  static chunkAndEmbed = (
    content: string,
    sourceThingId: string,
    sourceField: string,
    embedFn: (text: string) => Effect.Effect<number[], QueryError>
  ) =>
    Effect.gen(function* () {
      // Simple chunking: split by paragraphs/newlines
      const chunks = content.split(/\n\n+/).filter((c) => c.trim().length > 0);

      const results: string[] = [];

      for (let i = 0; i < chunks.length; i++) {
        const text = chunks[i].trim();

        // Generate embedding
        const embedding = yield* embedFn(text);

        // Create chunk knowledge
        const knowledgeId = yield* KnowledgeService.createChunk(
          text,
          embedding,
          sourceThingId,
          sourceField,
          i
        );

        // Link to thing
        yield* KnowledgeService.link(sourceThingId, knowledgeId, "chunk_of");

        results.push(knowledgeId);
      }

      return results;
    });

  /**
   * RAG query: find relevant chunks
   */
  static ragQuery = (
    query: string,
    embedFn: (text: string) => Effect.Effect<number[], QueryError>,
    options?: Omit<SearchKnowledgeOptions, "embedding">
  ) =>
    Effect.gen(function* () {
      // Generate query embedding
      const queryEmbedding = yield* embedFn(query);

      // Search for similar chunks
      return yield* KnowledgeService.search(queryEmbedding, {
        ...options,
        knowledgeType: "chunk",
        limit: options?.limit || 5,
      });
    });

  /**
   * Get knowledge graph for a thing
   */
  static getGraph = (thingId: string) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get thing
      const thing = yield* provider.things.get(thingId);

      // Get all knowledge
      const knowledge = yield* KnowledgeService.getForThing(thingId);

      // Separate by type
      const labels = knowledge.filter((k) => k.knowledgeType === "label");
      const chunks = knowledge.filter((k) => k.knowledgeType === "chunk");
      const documents = knowledge.filter((k) => k.knowledgeType === "document");

      return {
        thing,
        knowledge: {
          labels,
          chunks,
          documents,
          total: knowledge.length,
        },
      };
    });

  /**
   * List knowledge by type
   */
  static listByType = (knowledgeType: KnowledgeType, limit?: number) =>
    Effect.gen(function* () {
      return yield* KnowledgeService.list({
        knowledgeType,
        limit,
      });
    });

  /**
   * Find similar knowledge (by embedding similarity)
   */
  static findSimilar = (knowledgeId: string, limit?: number) =>
    Effect.gen(function* () {
      const provider = yield* DataProviderService;

      // Get source knowledge
      const source = yield* provider.knowledge.get(knowledgeId);

      // Must have embedding
      if (!source.embedding) {
        return yield* Effect.fail(
          new QueryError("Knowledge item has no embedding for similarity search")
        );
      }

      // Search for similar
      const results = yield* KnowledgeService.search(source.embedding, {
        limit: (limit || 10) + 1, // +1 to account for self
      });

      // Filter out self
      return results.filter((k) => k._id !== knowledgeId);
    });
}
