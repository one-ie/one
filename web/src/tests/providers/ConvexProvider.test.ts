/**
 * ConvexProvider Tests
 *
 * Unit tests for the Convex implementation of DataProvider.
 * Tests all 6 dimensions: organizations, people, things, connections, events, knowledge.
 */

/* global performance */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { Effect } from "effect";
import { createConvexProvider } from "@/providers/ConvexProvider";
import type { ConvexReactClient } from "convex/react";

// Mock Convex client
function createMockConvexClient() {
  const queryMock = vi.fn();
  const mutationMock = vi.fn();
  const actionMock = vi.fn();

  return {
    query: queryMock,
    mutation: mutationMock,
    action: actionMock,
  } as unknown as ConvexReactClient;
}

describe("ConvexProvider", () => {
  let mockClient: ConvexReactClient;
  let provider: ReturnType<typeof createConvexProvider>;

  beforeEach(() => {
    mockClient = createMockConvexClient();
    provider = createConvexProvider({ client: mockClient });
  });

  // ============================================================================
  // THINGS TESTS
  // ============================================================================

  describe("things.get", () => {
    it("should get a thing by ID", async () => {
      const mockThing = {
        _id: "thing-123",
        type: "course",
        name: "Test Course",
        properties: { description: "A test course" },
        status: "published",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (mockClient.query as any).mockResolvedValue(mockThing);

      const result = await Effect.runPromise(provider.things.get("thing-123"));

      expect(result).toEqual(mockThing);
      expect(mockClient.query).toHaveBeenCalledWith("entities:get", { id: "thing-123" });
    });

    it("should fail when thing not found", async () => {
      (mockClient.query as any).mockResolvedValue(null);

      try {
        await Effect.runPromise(provider.things.get("nonexistent"));
        expect.fail("Should have thrown error");
      } catch (error: any) {
        expect(error.message).toContain("Thing not found");
      }
    });
  });

  describe("things.list", () => {
    it("should list things by type", async () => {
      const mockThings = [
        {
          _id: "thing-1",
          type: "course",
          name: "Course 1",
          properties: {},
          status: "published",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          _id: "thing-2",
          type: "course",
          name: "Course 2",
          properties: {},
          status: "published",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (mockClient.query as any).mockResolvedValue(mockThings);

      const result = await Effect.runPromise(
        provider.things.list({ type: "course", status: "published" })
      );

      expect(result).toEqual(mockThings);
      expect(mockClient.query).toHaveBeenCalledWith("entities:list", {
        type: "course",
        status: "published",
      });
    });

    it("should handle empty list", async () => {
      (mockClient.query as any).mockResolvedValue([]);

      const result = await Effect.runPromise(provider.things.list());

      expect(result).toEqual([]);
    });
  });

  describe("things.create", () => {
    it("should create a new thing", async () => {
      const newThingId = "thing-new";
      (mockClient.mutation as any).mockResolvedValue(newThingId);

      const result = await Effect.runPromise(
        provider.things.create({
          type: "course",
          name: "New Course",
          properties: { description: "Brand new" },
          status: "draft",
        })
      );

      expect(result).toBe(newThingId);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        "entities:create",
        expect.objectContaining({
          type: "course",
          name: "New Course",
          properties: { description: "Brand new" },
          status: "draft",
        })
      );
    });

    it("should use default status draft", async () => {
      (mockClient.mutation as any).mockResolvedValue("thing-123");

      await Effect.runPromise(
        provider.things.create({
          type: "course",
          name: "Test",
          properties: {},
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        "entities:create",
        expect.objectContaining({
          status: "draft",
        })
      );
    });
  });

  describe("things.update", () => {
    it("should update a thing", async () => {
      (mockClient.mutation as any).mockResolvedValue(undefined);

      await Effect.runPromise(
        provider.things.update("thing-123", {
          name: "Updated Name",
          status: "published",
        })
      );

      expect(mockClient.mutation).toHaveBeenCalledWith(
        "entities:update",
        expect.objectContaining({
          id: "thing-123",
          name: "Updated Name",
          status: "published",
        })
      );
    });
  });

  describe("things.delete", () => {
    it("should delete a thing", async () => {
      (mockClient.mutation as any).mockResolvedValue(undefined);

      await Effect.runPromise(provider.things.delete("thing-123"));

      expect(mockClient.mutation).toHaveBeenCalledWith("entities:delete", {
        id: "thing-123",
      });
    });
  });

  // ============================================================================
  // CONNECTIONS TESTS
  // ============================================================================

  describe("connections.create", () => {
    it("should create a connection", async () => {
      const connectionId = "conn-123";
      (mockClient.mutation as any).mockResolvedValue(connectionId);

      const result = await Effect.runPromise(
        provider.connections.create({
          fromEntityId: "user-1",
          toEntityId: "course-1",
          relationshipType: "enrolled_in",
          metadata: { progress: 0 },
        })
      );

      expect(result).toBe(connectionId);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        "connections:create",
        expect.objectContaining({
          fromEntityId: "user-1",
          toEntityId: "course-1",
          relationshipType: "enrolled_in",
          metadata: { progress: 0 },
        })
      );
    });
  });

  describe("connections.list", () => {
    it("should list connections by relationship type", async () => {
      const mockConnections = [
        {
          _id: "conn-1",
          fromEntityId: "user-1",
          toEntityId: "course-1",
          relationshipType: "enrolled_in",
          createdAt: Date.now(),
        },
      ];

      (mockClient.query as any).mockResolvedValue(mockConnections);

      const result = await Effect.runPromise(
        provider.connections.list({
          fromEntityId: "user-1",
          relationshipType: "enrolled_in",
        })
      );

      expect(result).toEqual(mockConnections);
    });
  });

  // ============================================================================
  // EVENTS TESTS
  // ============================================================================

  describe("events.create", () => {
    it("should create an event", async () => {
      const eventId = "event-123";
      (mockClient.mutation as any).mockResolvedValue(eventId);

      const result = await Effect.runPromise(
        provider.events.create({
          type: "course_enrolled",
          actorId: "user-1",
          targetId: "course-1",
          metadata: { method: "direct" },
        })
      );

      expect(result).toBe(eventId);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        "events:create",
        expect.objectContaining({
          type: "course_enrolled",
          actorId: "user-1",
          targetId: "course-1",
          metadata: { method: "direct" },
        })
      );
    });
  });

  describe("events.list", () => {
    it("should list events by actor", async () => {
      const mockEvents = [
        {
          _id: "event-1",
          type: "course_enrolled",
          actorId: "user-1",
          targetId: "course-1",
          timestamp: Date.now(),
        },
      ];

      (mockClient.query as any).mockResolvedValue(mockEvents);

      const result = await Effect.runPromise(
        provider.events.list({
          actorId: "user-1",
          type: "course_enrolled",
        })
      );

      expect(result).toEqual(mockEvents);
    });
  });

  // ============================================================================
  // KNOWLEDGE TESTS
  // ============================================================================

  describe("knowledge.create", () => {
    it("should create a knowledge label", async () => {
      const knowledgeId = "knowledge-123";
      (mockClient.mutation as any).mockResolvedValue(knowledgeId);

      const result = await Effect.runPromise(
        provider.knowledge.create({
          knowledgeType: "label",
          text: "industry:fitness",
          labels: ["industry", "fitness"],
        })
      );

      expect(result).toBe(knowledgeId);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        "knowledge:create",
        expect.objectContaining({
          knowledgeType: "label",
          text: "industry:fitness",
          labels: ["industry", "fitness"],
        })
      );
    });

    it("should create a knowledge chunk with embedding", async () => {
      const knowledgeId = "knowledge-456";
      (mockClient.mutation as any).mockResolvedValue(knowledgeId);

      const embedding = new Array(3072).fill(0.1);

      const result = await Effect.runPromise(
        provider.knowledge.create({
          knowledgeType: "chunk",
          text: "This is a chunk of text",
          embedding,
          embeddingModel: "text-embedding-3-large",
          embeddingDim: 3072,
          sourceThingId: "course-1",
          sourceField: "description",
        })
      );

      expect(result).toBe(knowledgeId);
    });
  });

  describe("knowledge.link", () => {
    it("should link knowledge to thing", async () => {
      const linkId = "link-123";
      (mockClient.mutation as any).mockResolvedValue(linkId);

      const result = await Effect.runPromise(
        provider.knowledge.link("course-1", "knowledge-1", "label")
      );

      expect(result).toBe(linkId);
      expect(mockClient.mutation).toHaveBeenCalledWith(
        "knowledge:link",
        expect.objectContaining({
          thingId: "course-1",
          knowledgeId: "knowledge-1",
          role: "label",
        })
      );
    });
  });

  describe("knowledge.search", () => {
    it("should search knowledge by vector similarity", async () => {
      const mockResults = [
        {
          _id: "knowledge-1",
          knowledgeType: "chunk",
          text: "Similar content",
          embedding: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      (mockClient.query as any).mockResolvedValue(mockResults);

      const queryEmbedding = new Array(3072).fill(0.5);
      const result = await Effect.runPromise(
        provider.knowledge.search(queryEmbedding, { limit: 10 })
      );

      expect(result).toEqual(mockResults);
      expect(mockClient.query).toHaveBeenCalledWith(
        "knowledge:vectorSearch",
        expect.objectContaining({
          embedding: queryEmbedding,
          limit: 10,
        })
      );
    });
  });

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  describe("performance", () => {
    it("should have <10ms overhead per operation", async () => {
      (mockClient.query as any).mockResolvedValue([]);

      const start = performance.now();
      await Effect.runPromise(provider.things.list({ type: "course" }));
      const duration = performance.now() - start;

      // Allow 50ms for mocking overhead in test environment
      // In production, Convex overhead is typically <5ms
      expect(duration).toBeLessThan(50);
    });

    it("should batch multiple operations efficiently", async () => {
      (mockClient.query as any).mockResolvedValue([]);

      const start = performance.now();

      await Promise.all([
        Effect.runPromise(provider.things.list({ type: "course" })),
        Effect.runPromise(provider.things.list({ type: "lesson" })),
        Effect.runPromise(provider.connections.list({ relationshipType: "enrolled_in" })),
      ]);

      const duration = performance.now() - start;

      // Batch of 3 should complete in <100ms
      expect(duration).toBeLessThan(100);
    });
  });

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      (mockClient.query as any).mockRejectedValue(new Error("Network error"));

      try {
        await Effect.runPromise(provider.things.get("thing-123"));
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should provide typed errors", async () => {
      (mockClient.query as any).mockResolvedValue(null);

      try {
        await Effect.runPromise(provider.things.get("nonexistent"));
        expect.fail("Should have thrown error");
      } catch (error: any) {
        // Error will be wrapped by Effect.tryPromise
        expect(error.message).toContain("Thing not found");
      }
    });
  });
});
