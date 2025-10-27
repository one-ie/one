# Convex Agents Implementation Plan

**Version:** 1.0.0
**Status:** Planning
**Integration:** AI SDK + AI Elements
**Target Platform:** Convex Cloud + Astro + React 19

---

## Architecture: Effect.ts Wrapping Agent Component

Convex Agents component provides infrastructure (thread management, streaming, retries). We wrap it with **Effect.ts services** for type-safe business logic composition:

```typescript
// Tagged error types for agent operations
class AgentExecutionError extends Data.TaggedError("AgentExecutionError")<{
  agentName: string
  threadId: string
  cause: unknown
}> {}

class ThreadNotFoundError extends Data.TaggedError("ThreadNotFoundError")<{
  threadId: string
}> {}

// Define AgentService with Context.Tag
class AgentService extends Context.Tag("AgentService")<
  AgentService,
  {
    readonly createThread: (
      ctx: ActionCtx,
      agentId: string,
      initialMessage: string
    ) => Effect.Effect<{ threadId: string }, AgentExecutionError>

    readonly continueThread: (
      ctx: ActionCtx,
      threadId: string,
      message: string
    ) => Effect.Effect<{ response: string; threadId: string }, AgentExecutionError | ThreadNotFoundError>

    readonly getThreadMessages: (
      threadId: string
    ) => Effect.Effect<Message[], ThreadNotFoundError>
  }
>() {}

// Implement using Agent component
const AgentServiceLive = Layer.effect(
  AgentService,
  Effect.gen(function* () {
    const agent = new Agent(components.agent, {
      name: "Main Agent",
      chat: openai("gpt-4-turbo"),
      instructions: "You are a helpful AI assistant.",
      tools: {
        /* tools defined separately */
      }
    });

    return {
      createThread: (ctx, agentId, initialMessage) =>
        Effect.gen(function* () {
          const result = yield* Effect.tryPromise({
            try: () => agent.createThread(ctx, {
              messages: [{ role: "user", content: initialMessage }]
            }),
            catch: (error) => new AgentExecutionError({
              agentName: "Main Agent",
              threadId: "unknown",
              cause: error
            })
          });
          return { threadId: result.threadId };
        }),

      continueThread: (ctx, threadId, message) =>
        Effect.gen(function* () {
          const { thread } = yield* Effect.tryPromise({
            try: () => agent.continueThread(ctx, { threadId }),
            catch: (error) => new ThreadNotFoundError({ threadId })
          });

          const response = yield* Effect.tryPromise({
            try: () => thread.generateText({ prompt: message }),
            catch: (error) => new AgentExecutionError({
              agentName: "Main Agent",
              threadId,
              cause: error
            })
          });

          return { response: response.text, threadId };
        }),

      getThreadMessages: (threadId) =>
        Effect.tryPromise({
          try: () => agent.getMessages(threadId),
          catch: (error) => new ThreadNotFoundError({ threadId })
        })
    };
  })
);
```

---

## Overview

**Convex Agents** is a Convex component that manages AI agent workflows. It provides:

- Thread-based conversation management
- Automatic message persistence
- Tool call orchestration
- Real-time streaming via WebSockets
- Built-in RAG support for knowledge retrieval
- Multi-tenant isolation (per `groupId`)
- Usage tracking for billing

### Why Convex Agents?

- **Persistence**: All conversations automatically saved in Convex database
- **Scalability**: Handles thousands of concurrent agent threads
- **Real-time**: WebSocket streaming for instant client updates
- **Type-safe**: Full TypeScript support with auto-generated types
- **Integrated**: Works seamlessly with Convex functions, auth, and storage

---

## Architecture: Convex Agents in the Stack

```
AI Elements UI (Chat Interface)
        ↓
React Components + useChat Hook
        ↓
Convex Mutations (Agent Functions)
        ↓
Convex Agents Runtime
        ├─ Thread Management
        ├─ Message Persistence
        ├─ Tool Execution
        ├─ Streaming Pipeline
        └─ RAG Integration
        ↓
AI SDK (generateText, streamText)
        ↓
LLM Providers (OpenAI, Anthropic, etc.)
```

---

## Installation & Setup (Infer 1-10)

### Install Package

```bash
npm install @convex-dev/agent
```

### Add to Schema

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { agentTables } from "@convex-dev/agent";

export default defineSchema({
  // Existing tables...
  groups: defineTable({...}),
  things: defineTable({...}),
  connections: defineTable({...}),
  events: defineTable({...}),
  knowledge: defineTable({...}),

  // AI-specific tables
  aiCalls: defineTable({
    groupId: v.id("groups"),
    model: v.string(),
    provider: v.string(),
    prompt: v.string(),
    result: v.string(),
    tokensUsed: v.optional(v.object({ input: v.number(), output: v.number() })),
    duration: v.number(),
    timestamp: v.number(),
  }).index("by_groupId", ["groupId"]),

  // Agent tables (provided by Convex Agents component)
  ...agentTables(),
});
```

### Initialize Agent Runtime

```typescript
// backend/convex/agent.ts
import { defineAgent } from "@convex-dev/agent";
import { internal } from "./_generated/server";
import { openai } from "@ai-sdk/openai";

export const agentRuntime = defineAgent(async (ctx, params) => {
  const { groupId, agentId, message, threadId } = params;

  // Get agent configuration from things table
  const agent = await ctx.db.get(agentId);
  if (!agent || agent.type !== "agent") {
    throw new Error("Agent not found");
  }

  // Set up model based on agent configuration
  const model = openai(agent.properties.model || "gpt-4-turbo");

  return {
    model,
    systemPrompt: agent.properties.systemPrompt,
    tools: await loadAgentTools(ctx, groupId, agentId),
  };
});

async function loadAgentTools(ctx: any, groupId: string, agentId: string) {
  // Load tool definitions from agent configuration
  // Tools are defined in agent.properties.tools array
  return {};
}
```

---

## Thread Management (Infer 11-20)

### Create Agent Thread

```typescript
// backend/convex/mutations/agentThreads.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createThread = mutation({
  args: {
    groupId: v.id("groups"),
    agentId: v.id("things"),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a new thread in aiThreads table
    const threadId = await ctx.db.insert("aiThreads", {
      groupId: args.groupId,
      agentId: args.agentId,
      title: args.title || "New Conversation",
      status: "active",
      metadata: {
        createdBy: ctx.auth?.getUserIdentity()?.tokenIdentifier,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "agent_thread_created",
      actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
      targetId: threadId,
      timestamp: Date.now(),
      metadata: { agentId: args.agentId },
    });

    return threadId;
  },
});

export const listThreads = query({
  args: { groupId: v.id("groups"), agentId: v.id("things") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiThreads")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("agentId"), args.agentId))
      .order("desc")
      .collect();
  },
});

export const getThread = query({
  args: { threadId: v.id("aiThreads") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.threadId);
  },
});

export const archiveThread = mutation({
  args: { threadId: v.id("aiThreads") },
  handler: async (ctx, args) => {
    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error("Thread not found");

    await ctx.db.patch(args.threadId, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return args.threadId;
  },
});
```

### Message Management (via Convex Agents)

Convex Agents automatically manages messages within threads. Messages are:

- Stored in a Convex Agents internal table
- Keyed by `threadId`
- Accessible via `getMessages()` helper
- Automatically included in agent context

```typescript
// backend/convex/queries/agentMessages.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { getMessages } from "@convex-dev/agent";

export const getThreadMessages = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    // Retrieve all messages for a thread
    const messages = await getMessages(ctx, {
      threadId: args.threadId,
    });

    return messages;
  },
});

export const getThreadContext = query({
  args: { threadId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const messages = await getMessages(ctx, {
      threadId: args.threadId,
      limit: args.limit || 10,
    });

    // Return formatted for LLM context
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.createdAt,
    }));
  },
});
```

---

## Tool Integration (Infer 21-30)

### Define Agent Tools

```typescript
// backend/convex/agent/tools.ts
import { tool } from "ai";
import { z } from "zod";

export const agentTools = {
  searchKnowledge: tool({
    description: "Search the group's knowledge base for relevant information",
    parameters: z.object({
      query: v.string().describe("Search query"),
      limit: z.number().default(5),
    }),
    execute: async (input) => {
      // Implement RAG search against knowledge table
      return "Search results...";
    },
  }),

  createTask: tool({
    description: "Create a new task thing",
    parameters: z.object({
      title: z.string(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high"]),
    }),
    execute: async (input) => {
      // Create thing with type: "task"
      return { taskId: "task_123", created: true };
    },
  }),

  getContext: tool({
    description: "Get information about the current context",
    parameters: z.object({
      contextType: z.enum(["group", "user", "agent"]),
    }),
    execute: async (input) => {
      // Return context information
      return { context: "context_data" };
    },
  }),

  callHuman: tool({
    description: "Escalate to human support",
    parameters: z.object({
      reason: z.string().describe("Reason for escalation"),
    }),
    execute: async (input) => {
      // Create connection to human agent
      // Send notification
      return { escalationId: "esc_123", status: "waiting_for_human" };
    },
  }),
};
```

### Register Tools with Agent

```typescript
// backend/convex/agent.ts (updated)
import { agentTools } from "./agent/tools";

export const agentRuntime = defineAgent(async (ctx, params) => {
  const { groupId, agentId, message, threadId } = params;

  const agent = await ctx.db.get(agentId);
  if (!agent || agent.type !== "agent") {
    throw new Error("Agent not found");
  }

  const model = openai(agent.properties.model || "gpt-4-turbo");

  // Filter tools based on agent.properties.tools array
  const allowedTools = agent.properties.tools || [];
  const tools = Object.fromEntries(
    Object.entries(agentTools).filter(([name]) => allowedTools.includes(name))
  );

  return {
    model,
    systemPrompt: agent.properties.systemPrompt,
    tools,
    groupId,
    threadId,
  };
});
```

### Execute Tool Calls

Convex Agents automatically executes tool calls and manages the agentic loop. When the agent calls a tool:

1. Tool execution is triggered
2. Result is stored in thread context
3. Agent continues with result included
4. Client sees streamed updates

---

## Streaming Setup (Infer 31-40)

### Streaming Mutation

```typescript
// backend/convex/mutations/agentChat.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { streamText } from "ai";
import { agentRuntime } from "../agent";

export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    agentId: v.id("things"),
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Add message to thread
    const agent = await ctx.db.get(args.agentId);
    if (!agent) throw new Error("Agent not found");

    // Get agent configuration
    const config = await agentRuntime(ctx, {
      groupId: args.groupId,
      agentId: args.agentId,
      threadId: args.threadId,
      message: args.message,
    });

    // Get conversation context
    const messages = await getMessages(ctx, {
      threadId: args.threadId,
      limit: 20,
    });

    // Stream text response
    const { textStream, usage } = await streamText({
      model: config.model,
      system: config.systemPrompt,
      tools: config.tools,
      messages: [
        ...messages,
        { role: "user", content: args.message },
      ],
    });

    // Log AI call
    await ctx.db.insert("aiCalls", {
      groupId: args.groupId,
      model: agent.properties.model,
      provider: "openai",
      prompt: args.message,
      result: "", // Will be populated later
      tokensUsed: { input: 0, output: 0 },
      duration: 0,
      timestamp: Date.now(),
    });

    // Update thread
    await ctx.db.patch(args.threadId, {
      updatedAt: Date.now(),
    });

    return {
      threadId: args.threadId,
      stream: textStream,
      usage,
    };
  },
});
```

### WebSocket Streaming (Client)

```typescript
// web/src/lib/hooks/useAgentStream.ts
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function useAgentStream(groupId: string, agentId: string, threadId: string) {
  const sendMessage = useMutation(api.mutations.agentChat.sendMessage);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const stream = async (userMessage: string) => {
    setIsStreaming(true);
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await sendMessage({
        groupId,
        agentId,
        threadId,
        message: userMessage,
      });

      // Handle streaming response
      const reader = response.stream.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;

        // Update UI with streaming text
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg?.role === "assistant") {
            lastMsg.content = fullResponse;
          } else {
            updated.push({ role: "assistant", content: fullResponse });
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    isStreaming,
    stream,
  };
}
```

---

## RAG Integration (Infer 51-60)

### Connect Agent to Knowledge

```typescript
// backend/convex/agent/tools.ts (updated)
import { searchKnowledge } from "../services/rag";

export const agentTools = {
  searchKnowledge: tool({
    description: "Search the group's knowledge base",
    parameters: z.object({
      query: z.string(),
      limit: z.number().default(5),
    }),
    execute: async (input, { ctx, groupId }) => {
      const results = await searchKnowledge(ctx, {
        groupId,
        query: input.query,
        limit: input.limit,
      });

      return {
        results: results.map((r) => ({
          title: r.title,
          content: r.content,
          relevance: r.relevance,
        })),
      };
    },
  }),
};
```

### RAG Service

```typescript
// backend/convex/services/rag.ts
import { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export async function searchKnowledge(
  ctx: QueryCtx,
  args: {
    groupId: string;
    query: string;
    limit: number;
  }
) {
  // 1. Embed query using AI SDK
  const queryEmbedding = await embedText(args.query);

  // 2. Search knowledge table for similar embeddings
  const results = await ctx.db
    .query("knowledge")
    .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
    .collect();

  // 3. Calculate cosine similarity
  const scored = results
    .map((result) => ({
      ...result,
      relevance: cosineSimilarity(queryEmbedding, result.embedding),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, args.limit);

  return scored;
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitude = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0)) *
                    Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / magnitude;
}

async function embedText(text: string): Promise<number[]> {
  // Use OpenAI embeddings or similar
  // Return 1536-dimensional vector
  return [];
}
```

---

## Multi-Tenant Isolation (Infer 71-80)

### Group Scoping

All agent operations are scoped to `groupId`:

```typescript
// ✅ Good: Scoped to group
export const listAgents = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("things")
      .withIndex("by_type", (q) => q.eq("type", "agent"))
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();
  },
});

// ❌ Bad: Not scoped
export const listAllAgents = query({
  handler: async (ctx) => {
    return await ctx.db.query("things").collect();
  },
});
```

### Authorization

```typescript
// Verify user has access to group
async function verifyGroupAccess(ctx: any, groupId: string) {
  const userId = ctx.auth?.getUserIdentity()?.tokenIdentifier;
  if (!userId) throw new Error("Not authenticated");

  // Check if user is member of group
  const membership = await ctx.db
    .query("connections")
    .filter((q) =>
      q.and(
        q.eq(q.field("type"), "member_of"),
        q.eq(q.field("groupId"), groupId),
        q.eq(q.field("from"), userId)
      )
    )
    .first();

  if (!membership) throw new Error("Access denied");
  return true;
}
```

---

## Usage Tracking & Billing (Infer 81-90)

### Token Tracking

```typescript
// backend/convex/services/usage.ts
import { MutationCtx } from "./_generated/server";

export async function trackUsage(
  ctx: MutationCtx,
  args: {
    groupId: string;
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
  }
) {
  // Get group plan
  const group = await ctx.db.get(args.groupId);
  const plan = group?.properties?.plan || "starter";

  // Calculate cost
  const rates = {
    openai: { input: 0.005, output: 0.015 },
    anthropic: { input: 0.008, output: 0.024 },
  };

  const rate = rates[args.provider] || rates.openai;
  const cost = (args.inputTokens * rate.input + args.outputTokens * rate.output) / 1000;

  // Log usage event
  await ctx.db.insert("events", {
    groupId: args.groupId,
    type: "usage_tracked",
    actorId: null,
    targetId: null,
    timestamp: Date.now(),
    metadata: {
      model: args.model,
      provider: args.provider,
      tokens: args.inputTokens + args.outputTokens,
      cost,
      plan,
    },
  });

  return { cost, totalTokens: args.inputTokens + args.outputTokens };
}
```

### Usage Dashboard

```typescript
// backend/convex/queries/usage.ts
export const getGroupUsage = query({
  args: { groupId: v.id("groups"), period: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startTime = getPeriodStart(args.period, now);

    const events = await ctx.db
      .query("events")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("type"), "usage_tracked"))
      .filter((q) => q.gte(q.field("timestamp"), startTime))
      .collect();

    return {
      totalTokens: events.reduce((sum, e) => sum + (e.metadata.tokens || 0), 0),
      totalCost: events.reduce((sum, e) => sum + (e.metadata.cost || 0), 0),
      byModel: groupBy(events, (e) => e.metadata.model),
      byProvider: groupBy(events, (e) => e.metadata.provider),
    };
  },
});
```

---

## Error Handling & Recovery (Infer 91-100)

### Graceful Error Handling

```typescript
// backend/convex/mutations/agentChat.ts (updated)
export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    agentId: v.id("things"),
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // ... main flow ...
    } catch (error) {
      // Log error to events table
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "agent_error",
        actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
        targetId: args.agentId,
        timestamp: Date.now(),
        metadata: {
          error: error instanceof Error ? error.message : "Unknown error",
          threadId: args.threadId,
        },
      });

      // Return user-friendly error
      return {
        success: false,
        error: "Failed to generate response. Please try again.",
      };
    }
  },
});
```

### Retry Logic

```typescript
// web/src/lib/hooks/useAgentRetry.ts
export function useAgentRetry(maxRetries = 3) {
  return async (fn: () => Promise<any>) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;

        // Exponential backoff
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  };
}
```

---

## Performance Optimization

| Optimization | Impact | Implementation |
|--------------|--------|-----------------|
| Message pagination | Reduce context size | Load 10 messages initially, paginate |
| Embedding caching | Faster RAG | Cache query embeddings for 5 minutes |
| Tool call batching | Reduce API calls | Group multiple tool executions |
| Streaming chunking | Better UX | Stream 50-100 tokens at a time |
| Index optimization | Faster queries | Use proper indexes on groupId |

---

## Testing Strategy

### Unit Tests

```typescript
// test/agent/tools.test.ts
test("searchKnowledge returns relevant results", async () => {
  const results = await searchKnowledge(ctx, {
    groupId: "group_123",
    query: "how to create a task?",
    limit: 5,
  });

  expect(results).toHaveLength(5);
  expect(results[0].relevance).toBeGreaterThan(0.5);
});
```

### Integration Tests

```typescript
// test/agent/integration.test.ts
test("full agent conversation flow", async () => {
  // 1. Create group and agent
  // 2. Create thread
  // 3. Send message
  // 4. Verify response streamed
  // 5. Verify messages persisted
  // 6. Verify usage tracked
});
```

---

## Common Patterns

### Pattern: Agent Context Injection

```typescript
// Inject group context into all agent operations
type AgentContext = {
  groupId: string;
  agentId: string;
  userId: string;
  thread: any;
};

async function withAgentContext<T>(
  ctx: MutationCtx,
  args: any,
  handler: (context: AgentContext) => Promise<T>
): Promise<T> {
  const agent = await ctx.db.get(args.agentId);
  return handler({
    groupId: args.groupId,
    agentId: args.agentId,
    userId: ctx.auth?.getUserIdentity()?.tokenIdentifier || "",
    thread: args.threadId,
  });
}
```

### Pattern: Message Formatting

```typescript
// Format Convex messages for LLM
function formatMessagesForLLM(messages: any[]) {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content,
  }));
}
```

---

## Deployment Checklist

- [ ] Install `@convex-dev/agent` package
- [ ] Add agent tables to schema
- [ ] Create agent thing with properties
- [ ] Implement streaming mutations
- [ ] Set up RAG integration
- [ ] Configure rate limiting
- [ ] Add usage tracking
- [ ] Test multi-tenant isolation
- [ ] Deploy to production
- [ ] Monitor thread creation rate
- [ ] Track token usage per group

---

## Next Steps

1. Install Convex Agents: `npm install @convex-dev/agent`
2. Update schema with agent tables
3. Create agent threads management mutations
4. Implement streaming response mutations
5. Connect to AI SDK generateText/streamText
6. Add RAG search tool
7. Test end-to-end flow
8. Deploy to production

---

## References

- [Convex Agents Documentation](https://www.convex.dev/components/agent)
- [Convex Database](https://docs.convex.dev/database)
- [Convex Mutations](https://docs.convex.dev/functions/mutations)
- [AI SDK Integration](./ai-sdk.md)
- [6-Dimension Ontology](../knowledge/ontology.md)
