/**
 * DataProvider Tests
 *
 * Tests the DataProvider interface pattern and implementations.
 */

import { describe, it, expect, vi } from "vitest";
import { Effect, Layer } from "effect";
import {
  DataProviderService,
  type DataProvider,
  type CreateThingInput,
  ThingNotFoundError,
  ThingCreateError,
  QueryError,
} from "../DataProvider";

// ============================================================================
// MOCK PROVIDER
// ============================================================================

const createMockProvider = (): DataProvider => {
  const things = new Map<string, any>();
  const connections = new Map<string, any>();
  const events: any[] = [];
  const knowledge = new Map<string, any>();

  return {
    things: {
      get: (id: string) =>
        Effect.gen(function* () {
          const thing = things.get(id);
          if (!thing) {
            return yield* Effect.fail(new ThingNotFoundError(id));
          }
          return thing;
        }),

      list: (options) =>
        Effect.gen(function* () {
          let results = Array.from(things.values());

          if (options?.type) {
            results = results.filter((t) => t.type === options.type);
          }

          if (options?.status) {
            results = results.filter((t) => t.status === options.status);
          }

          if (options?.limit) {
            results = results.slice(0, options.limit);
          }

          return results;
        }),

      create: (input: CreateThingInput) =>
        Effect.gen(function* () {
          const id = `mock-${Date.now()}-${Math.random()}`;
          const thing = {
            _id: id,
            ...input,
            status: input.status || "draft",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          things.set(id, thing);
          return id;
        }),

      update: (id, input) =>
        Effect.gen(function* () {
          const thing = things.get(id);
          if (!thing) {
            return yield* Effect.fail(new ThingNotFoundError(id));
          }

          things.set(id, {
            ...thing,
            ...input,
            updatedAt: Date.now(),
          });
        }),

      delete: (id) =>
        Effect.gen(function* () {
          if (!things.has(id)) {
            return yield* Effect.fail(new ThingNotFoundError(id));
          }
          things.delete(id);
        }),
    },

    connections: {
      get: (id) => Effect.fail(new QueryError("Not implemented")),
      list: (options) => Effect.succeed([]),
      create: (input) => Effect.succeed(`conn-${Date.now()}`),
      delete: (id) => Effect.succeed(undefined),
    },

    events: {
      get: (id) => Effect.fail(new QueryError("Not implemented")),
      list: (options) => Effect.succeed(events),
      create: (input) =>
        Effect.gen(function* () {
          const event = {
            _id: `event-${Date.now()}`,
            ...input,
            timestamp: Date.now(),
          };
          events.push(event);
          return event._id;
        }),
    },

    knowledge: {
      get: (id) => Effect.fail(new QueryError("Not implemented")),
      list: (options) => Effect.succeed([]),
      create: (input) => Effect.succeed(`knowledge-${Date.now()}`),
      link: (thingId, knowledgeId, role) => Effect.succeed(`link-${Date.now()}`),
      search: (embedding, options) => Effect.succeed([]),
    },
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("DataProvider Interface", () => {
  it("should create and retrieve a thing", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Create thing
      const id = yield* provider.things.create({
        type: "blog_post",
        name: "Test Post",
        properties: { content: "Test content" },
      });

      // Retrieve thing
      const thing = yield* provider.things.get(id);

      return thing;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

    expect(result.name).toBe("Test Post");
    expect(result.type).toBe("blog_post");
    expect(result.properties.content).toBe("Test content");
  });

  it("should list things with filters", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Create multiple things
      yield* provider.things.create({
        type: "blog_post",
        name: "Post 1",
        properties: {},
        status: "published",
      });

      yield* provider.things.create({
        type: "blog_post",
        name: "Post 2",
        properties: {},
        status: "draft",
      });

      yield* provider.things.create({
        type: "course",
        name: "Course 1",
        properties: {},
        status: "published",
      });

      // List all blog_posts
      const blogPosts = yield* provider.things.list({ type: "blog_post" });

      // List published things
      const published = yield* provider.things.list({ status: "published" });

      return { blogPosts, published };
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

    expect(result.blogPosts.length).toBe(2);
    expect(result.published.length).toBe(2);
  });

  it("should update a thing", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Create thing
      const id = yield* provider.things.create({
        type: "blog_post",
        name: "Original Name",
        properties: {},
      });

      // Update thing
      yield* provider.things.update(id, {
        name: "Updated Name",
        status: "published",
      });

      // Retrieve updated thing
      const thing = yield* provider.things.get(id);

      return thing;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

    expect(result.name).toBe("Updated Name");
    expect(result.status).toBe("published");
  });

  it("should delete a thing", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Create thing
      const id = yield* provider.things.create({
        type: "blog_post",
        name: "To Delete",
        properties: {},
      });

      // Delete thing
      yield* provider.things.delete(id);

      // Try to retrieve deleted thing
      return yield* provider.things.get(id);
    });

    await expect(
      Effect.runPromise(program.pipe(Effect.provide(layer)))
    ).rejects.toThrow();
  });

  it("should create events", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Create thing
      const thingId = yield* provider.things.create({
        type: "blog_post",
        name: "Test Post",
        properties: {},
      });

      // Create event
      yield* provider.events.create({
        type: "entity_created",
        actorId: "user-1",
        targetId: thingId,
        metadata: { source: "test" },
      });

      // List events
      const events = yield* provider.events.list({});

      return events;
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

    expect(result.length).toBe(1);
    expect(result[0].type).toBe("entity_created");
    expect(result[0].actorId).toBe("user-1");
  });

  it("should handle errors correctly", async () => {
    const provider = createMockProvider();
    const layer = Layer.succeed(DataProviderService, provider);

    const program = Effect.gen(function* () {
      // Try to get non-existent thing
      return yield* provider.things.get("non-existent-id");
    });

    await expect(
      Effect.runPromise(program.pipe(Effect.provide(layer)))
    ).rejects.toThrow(/ThingNotFoundError/);
  });
});
