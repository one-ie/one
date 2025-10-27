/**
 * DataProvider Usage Examples
 *
 * Real-world examples of using the DataProvider pattern in ONE Platform.
 */

import { Effect, Layer } from "effect";
import { convexProvider } from "../convex/ConvexProvider";
import { wordPressProvider } from "../wordpress/WordPressProvider";
import { compositeProvider } from "../composite/CompositeProvider";
import { DataProviderService } from "../DataProvider";
import { ThingService } from "../../services/ThingService";
import { ConnectionService } from "../../services/ConnectionService";
import { EventService } from "../../services/EventService";
import { KnowledgeService } from "../../services/KnowledgeService";

// ============================================================================
// EXAMPLE 1: Simple Convex Backend
// ============================================================================

export const example1_SimpleConvex = async () => {
  console.log("=== Example 1: Simple Convex Backend ===\n");

  // Setup provider
  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Create a blog post and log events
  const program = Effect.gen(function* () {
    // 1. Create a blog post
    console.log("Creating blog post...");
    const postId = yield* ThingService.create({
      type: "blog_post",
      name: "Getting Started with DataProvider",
      properties: {
        content: "This is a guide to using the DataProvider interface...",
        author: "system",
        tags: ["tutorial", "architecture"],
      },
    });

    console.log(`✓ Created post: ${postId}\n`);

    // 2. Retrieve the post
    const post = yield* ThingService.get(postId);
    console.log("Retrieved post:", post.name);
    console.log(`  Type: ${post.type}`);
    console.log(`  Status: ${post.status}\n`);

    // 3. Get post history
    const history = yield* ThingService.getHistory(postId);
    console.log(`Post has ${history.length} events in history\n`);

    return { postId, post, history };
  });

  // Run the program
  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  return result;
};

// ============================================================================
// EXAMPLE 2: Multi-Backend with CompositeProvider
// ============================================================================

export const example2_MultiBackend = async () => {
  console.log("=== Example 2: Multi-Backend Composite ===\n");

  // Setup composite provider
  const provider = compositeProvider([
    {
      name: "convex",
      provider: convexProvider(process.env.PUBLIC_CONVEX_URL!),
      thingTypes: ["creator", "course", "lesson", "token"],
      isDefault: true,
    },
    {
      name: "wordpress",
      provider: wordPressProvider("https://example.com/wp-json/wp/v2"),
      thingTypes: ["blog_post"],
      idPrefix: "wp-",
    },
  ]);

  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Query data from multiple backends
  const program = Effect.gen(function* () {
    // This goes to Convex (courses)
    console.log("Fetching courses from Convex...");
    const courses = yield* ThingService.list({ type: "course", limit: 5 });
    console.log(`✓ Found ${courses.length} courses\n`);

    // This goes to WordPress (blog posts)
    console.log("Fetching blog posts from WordPress...");
    const blogPosts = yield* ThingService.list({ type: "blog_post", limit: 5 });
    console.log(`✓ Found ${blogPosts.length} blog posts\n`);

    // Combined query - automatically routes to correct backend
    console.log("Fetching all published content...");
    const allPublished = yield* ThingService.list({ status: "published", limit: 20 });
    console.log(`✓ Found ${allPublished.length} published items across all backends\n`);

    return { courses, blogPosts, allPublished };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  return result;
};

// ============================================================================
// EXAMPLE 3: Course Enrollment Flow
// ============================================================================

export const example3_CourseEnrollment = async (userId: string, courseId: string) => {
  console.log("=== Example 3: Course Enrollment Flow ===\n");

  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Complete enrollment flow
  const program = Effect.gen(function* () {
    // 1. Verify course exists
    console.log("Verifying course...");
    const course = yield* ThingService.get(courseId);
    console.log(`✓ Course: ${course.name}\n`);

    // 2. Check if already enrolled
    console.log("Checking existing enrollment...");
    const alreadyEnrolled = yield* ConnectionService.exists(
      userId,
      courseId,
      "enrolled_in"
    );

    if (alreadyEnrolled) {
      console.log("⚠ User already enrolled\n");
      return { enrolled: false, reason: "already_enrolled" };
    }

    // 3. Create enrollment connection
    console.log("Creating enrollment connection...");
    const connectionId = yield* ConnectionService.create({
      fromEntityId: userId,
      toEntityId: courseId,
      relationshipType: "enrolled_in",
      metadata: {
        enrolledAt: Date.now(),
        progress: 0,
        status: "active",
      },
    });

    console.log(`✓ Enrollment connection: ${connectionId}\n`);

    // 4. Log enrollment event
    console.log("Logging enrollment event...");
    const eventId = yield* EventService.create({
      type: "course_enrolled",
      actorId: userId,
      targetId: courseId,
      metadata: {
        connectionId,
        source: "api",
      },
    });

    console.log(`✓ Event logged: ${eventId}\n`);

    return {
      enrolled: true,
      connectionId,
      eventId,
    };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  return result;
};

// ============================================================================
// EXAMPLE 4: Knowledge Graph & RAG
// ============================================================================

export const example4_KnowledgeRAG = async (
  courseId: string,
  embedFunction: (text: string) => Promise<number[]>
) => {
  console.log("=== Example 4: Knowledge Graph & RAG ===\n");

  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Build knowledge graph and perform RAG query
  const program = Effect.gen(function* () {
    // 1. Get course
    const course = yield* ThingService.get(courseId);
    console.log(`Course: ${course.name}\n`);

    // 2. Add labels to course
    console.log("Adding labels to course...");
    yield* KnowledgeService.addLabels(courseId, [
      "category:programming",
      "level:beginner",
      "topic:typescript",
    ]);
    console.log("✓ Labels added\n");

    // 3. Chunk and embed course content
    console.log("Chunking and embedding course content...");
    const content = course.properties.description || "";

    const embedFn = (text: string) =>
      Effect.tryPromise({
        try: () => embedFunction(text),
        catch: (error) => new Error(String(error)),
      });

    const chunkIds = yield* KnowledgeService.chunkAndEmbed(
      content,
      courseId,
      "description",
      embedFn as any
    );

    console.log(`✓ Created ${chunkIds.length} chunks\n`);

    // 4. Perform RAG query
    console.log('Performing RAG query: "How do I get started?"');
    const relevantChunks = yield* KnowledgeService.ragQuery(
      "How do I get started?",
      embedFn as any,
      {
        sourceThingId: courseId,
        limit: 3,
      }
    );

    console.log(`✓ Found ${relevantChunks.length} relevant chunks\n`);

    // 5. Get complete knowledge graph
    const graph = yield* KnowledgeService.getGraph(courseId);
    console.log("Knowledge graph:");
    console.log(`  Labels: ${graph.knowledge.labels.length}`);
    console.log(`  Chunks: ${graph.knowledge.chunks.length}`);
    console.log(`  Total: ${graph.knowledge.total}\n`);

    return { course, chunkIds, relevantChunks, graph };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  return result;
};

// ============================================================================
// EXAMPLE 5: Complex Queries with Relationships
// ============================================================================

export const example5_ComplexQueries = async (userId: string) => {
  console.log("=== Example 5: Complex Queries ===\n");

  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Get user's complete learning profile
  const program = Effect.gen(function* () {
    // 1. Get user thing
    const user = yield* ThingService.get(userId);
    console.log(`User: ${user.name}\n`);

    // 2. Get user's enrollments
    console.log("Fetching enrollments...");
    const enrollments = yield* ConnectionService.listFrom(userId, "enrolled_in");
    console.log(`✓ ${enrollments.length} active enrollments\n`);

    // 3. Get completed courses
    console.log("Fetching completed courses...");
    const completed = yield* ConnectionService.listFrom(userId, "completed");
    console.log(`✓ ${completed.length} completed courses\n`);

    // 4. Get user's activity timeline
    console.log("Fetching activity timeline...");
    const timeline = yield* EventService.getTimeline(userId);
    console.log(`✓ ${timeline.length} events in timeline\n`);

    // 5. Get connection graph (2 levels deep)
    console.log("Building connection graph...");
    const graph = yield* ConnectionService.getGraph(userId, 2);
    console.log(`✓ Built graph with ${Object.keys(graph).length} nodes\n`);

    // 6. Get event statistics
    console.log("Calculating statistics...");
    const stats = yield* EventService.getStatistics();
    console.log("Event statistics:");
    console.log(`  Total events: ${stats.total}`);
    console.log(`  Event types: ${Object.keys(stats.byType).length}\n`);

    return {
      user,
      enrollments,
      completed,
      timeline,
      graph,
      stats,
    };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)) as any);

  return result;
};

// ============================================================================
// EXAMPLE 6: Error Handling
// ============================================================================

export const example6_ErrorHandling = async (thingId: string) => {
  console.log("=== Example 6: Error Handling ===\n");

  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Handle errors gracefully
  const program = Effect.gen(function* () {
    // Attempt to get thing
    const result = yield* ThingService.get(thingId).pipe(
      Effect.catchTag("ThingNotFoundError", (error) => {
        console.log(`⚠ Thing not found: ${error.id}`);
        return Effect.succeed(null);
      })
    );

    if (!result) {
      console.log("Creating thing since it doesn't exist...\n");
      const newId = yield* ThingService.create({
        type: "blog_post",
        name: "Fallback Post",
        properties: {},
      });
      return yield* ThingService.get(newId);
    }

    return result;
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  console.log(`✓ Result: ${result.name}\n`);

  return result;
};

// ============================================================================
// EXAMPLE 7: Batch Operations
// ============================================================================

export const example7_BatchOperations = async () => {
  console.log("=== Example 7: Batch Operations ===\n");

  const provider = convexProvider(process.env.PUBLIC_CONVEX_URL!);
  const layer = Layer.succeed(DataProviderService, provider);

  // Program: Create multiple things in batch
  const program = Effect.gen(function* () {
    const posts = [
      { name: "Post 1", content: "Content 1" },
      { name: "Post 2", content: "Content 2" },
      { name: "Post 3", content: "Content 3" },
    ];

    console.log(`Creating ${posts.length} posts in batch...`);

    const ids = yield* ThingService.batchCreate(
      posts.map((post) => ({
        type: "blog_post",
        name: post.name,
        properties: { content: post.content },
      }))
    );

    console.log(`✓ Created ${ids.length} posts\n`);

    // Retrieve all created posts
    console.log("Retrieving created posts...");
    const created: any[] = [];

    for (const id of ids) {
      const thing = yield* ThingService.get(id);
      created.push(thing);
    }

    console.log(`✓ Retrieved ${created.length} posts\n`);

    return { ids, created };
  });

  const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

  return result;
};

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export const runAllExamples = async () => {
  try {
    await example1_SimpleConvex();
    // await example2_MultiBackend(); // Requires WordPress setup
    // await example3_CourseEnrollment("user-123", "course-456");
    // await example4_KnowledgeRAG("course-123", mockEmbedFunction);
    // await example5_ComplexQueries("user-123");
    // await example6_ErrorHandling("non-existent-id");
    // await example7_BatchOperations();

    console.log("\n✓ All examples completed successfully!");
  } catch (error) {
    console.error("\n✗ Example failed:", error);
  }
};

// Run examples if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}
