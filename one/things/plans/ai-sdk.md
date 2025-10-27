# AI SDK Implementation Plan

**Version:** 1.0.0
**Status:** Planning
**Integration:** Convex Agents + AI Elements
**Target Platform:** Astro 5 + React 19 + Convex Backend

---

## Overview

The **AI SDK** (by Vercel) is a unified TypeScript toolkit for building AI-powered applications. It provides a single API across 20+ LLM providers, eliminating provider lock-in and simplifying model switching.

### Why AI SDK?

- **Provider Agnostic**: One API works with OpenAI, Anthropic, Google, Azure, DeepSeek, etc.
- **Unified Interface**: Generate text, objects, tool calls with consistent methods
- **React Hooks**: Built-in hooks for chat, streaming, and state management
- **Type-Safe**: Full TypeScript support with automatic type inference
- **Framework Support**: Works with React, Vue, Svelte, Node.js, and more

---

## Architecture: Where AI SDK Fits

```
User Interface (Astro + React 19)
        ↓
AI Elements Components (Pre-built UI)
        ↓
AI SDK Core + UI Hooks (generateText, useChat, etc.)
        ↓
Convex Backend (Mutations/Queries)
        ↓
Convex Agents (Thread management, persistence)
        ↓
LLM Providers (OpenAI, Anthropic, etc.)
```

**Layer Breakdown:**

1. **Frontend (Astro)**: Pages, layouts, static content
2. **React Components**: AI Elements UI + `client:load` interactive components
3. **AI SDK Hooks**: `useChat()`, `useCompletion()`, `useObject()` for real-time updates
4. **Convex Backend**: Mutations that call AI SDK `generateText()` or stream to clients
5. **Convex Agents**: Manage conversation threads, tool calls, message history
6. **LLM Providers**: Process inference requests

---

## Architecture: Effect.ts Service Layer Pattern

All AI operations are implemented as **Effect.ts services** for backend-agnostic integration:

```typescript
// Define domain errors as tagged classes
class LLMError extends Data.TaggedError("LLMError")<{
  model: string
  provider: string
  cause: unknown
}> {}

class RateLimitError extends Data.TaggedError("RateLimitError")<{
  retryAfter: number
}> {}

// Define service with Context.Tag
class LLMService extends Context.Tag("LLMService")<
  LLMService,
  {
    readonly generateText: (
      prompt: string,
      options?: { model?: string; provider?: string }
    ) => Effect.Effect<string, LLMError>

    readonly streamText: (
      prompt: string,
      onChunk: (chunk: string) => void
    ) => Effect.Effect<void, LLMError>

    readonly generateObject: <T extends Schema.Schema<any>>(
      prompt: string,
      schema: T
    ) => Effect.Effect<Schema.Type<T>, LLMError>
  }
>() {}

// Implement service
const LLMServiceLive = Layer.effect(
  LLMService,
  Effect.gen(function* () {
    return {
      generateText: (prompt, options) =>
        Effect.gen(function* () {
          const model = selectModel(options?.provider || "openai", "powerful");
          const result = yield* Effect.tryPromise({
            try: () => generateText({ model, prompt }),
            catch: (error) => new LLMError({
              model: options?.model || "gpt-4-turbo",
              provider: options?.provider || "openai",
              cause: error
            })
          });
          return result.text;
        }),

      streamText: (prompt, onChunk) => {
        // Implementation with streaming
      },

      generateObject: (prompt, schema) => {
        // Implementation with structured output
      }
    };
  })
);
```

---

## Implementation Phases

### Phase 1: Setup & Configuration (Infer 1-10)

#### Dependencies

```bash
npm install ai
npm install @ai-sdk/openai
npm install @ai-sdk/anthropic
npm install @ai-sdk/google
# Add other providers as needed
```

#### Environment Variables

**Backend (.env.local):**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
```

**Frontend (.env.local):**
```bash
# Not needed for server-side calls
# Only needed if calling AI SDK directly from browser
```

#### Provider Configuration (backend/convex/ai.ts)

```typescript
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

// Export default model (easy to switch)
export const defaultModel = openai("gpt-4-turbo");

// Export provider-specific models
export const models = {
  openai: {
    fast: openai("gpt-4o-mini"),
    powerful: openai("gpt-4-turbo"),
  },
  anthropic: {
    fast: anthropic("claude-3-haiku-20240307"),
    powerful: anthropic("claude-3-opus-20240229"),
  },
  google: {
    fast: google("gemini-1.5-flash"),
    powerful: google("gemini-1.5-pro"),
  },
};

export const selectModel = (provider: string, tier: "fast" | "powerful") => {
  return models[provider]?.[tier] || defaultModel;
};
```

---

### Phase 2: Convex Mutations (Infer 11-20)

#### Schema Extension

The Convex schema already has `events` table. Add AI-specific fields:

```typescript
// backend/convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables ...
  aiCalls: defineTable({
    groupId: v.id("groups"),
    actorId: v.optional(v.string()),
    model: v.string(),
    provider: v.string(),
    prompt: v.string(),
    result: v.string(),
    tokensUsed: v.optional(v.object({
      input: v.number(),
      output: v.number(),
    })),
    duration: v.number(),
    error: v.optional(v.string()),
    metadata: v.any(),
    timestamp: v.number(),
  }).index("by_groupId", ["groupId"]),

  aiThreads: defineTable({
    groupId: v.id("groups"),
    agentId: v.id("things"),
    title: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("completed")),
    metadata: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_groupId", ["groupId"]).index("by_agentId", ["agentId"]),
});
```

#### Mutations for Text Generation

```typescript
// backend/convex/mutations/ai.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { generateText } from "ai";
import { selectModel } from "../ai";

export const generateResponse = mutation({
  args: {
    groupId: v.id("groups"),
    prompt: v.string(),
    model: v.optional(v.string()),
    provider: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    try {
      const model = selectModel(args.provider || "openai", "powerful");
      const system = args.systemPrompt || "You are a helpful AI assistant.";

      const { text, usage } = await generateText({
        model,
        system,
        prompt: args.prompt,
      });

      // Log to aiCalls table
      await ctx.db.insert("aiCalls", {
        groupId: args.groupId,
        model: args.model || "gpt-4-turbo",
        provider: args.provider || "openai",
        prompt: args.prompt,
        result: text,
        tokensUsed: {
          input: usage?.promptTokens || 0,
          output: usage?.completionTokens || 0,
        },
        duration: Date.now() - startTime,
        metadata: {},
        timestamp: Date.now(),
      });

      // Log to events table
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "ai_generation_completed",
        actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
        targetId: null,
        timestamp: Date.now(),
        metadata: {
          model: args.model || "gpt-4-turbo",
          provider: args.provider || "openai",
          tokensUsed: usage,
        },
      });

      return { success: true, text, usage };
    } catch (error) {
      await ctx.db.insert("aiCalls", {
        groupId: args.groupId,
        model: args.model || "gpt-4-turbo",
        provider: args.provider || "openai",
        prompt: args.prompt,
        result: "",
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: {},
        timestamp: Date.now(),
      });

      throw error;
    }
  },
});
```

#### Mutations for Streaming (Agent Threads)

```typescript
// backend/convex/mutations/ai.ts (continued)
import { streamText } from "ai";

export const streamAgentResponse = mutation({
  args: {
    groupId: v.id("groups"),
    threadId: v.id("aiThreads"),
    message: v.string(),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const model = selectModel("openai", "powerful");
    const system = args.systemPrompt || "You are a helpful AI assistant.";

    // Stream via websocket (handled by Convex Agents)
    const { textStream, usage } = await streamText({
      model,
      system,
      prompt: args.message,
    });

    // Return stream for client consumption
    return {
      threadId: args.threadId,
      stream: textStream,
      usage,
    };
  },
});
```

---

### Phase 3: Frontend Integration (Infer 21-30)

#### useChat Hook Integration

```typescript
// web/src/lib/hooks/useAIChat.ts
import { useChat } from "ai/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAIChat(groupId: string, agentId: string) {
  const generateResponse = useMutation(api.mutations.ai.generateResponse);
  const streamResponse = useMutation(api.mutations.ai.streamAgentResponse);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat", // Not used with Convex, but useChat requires it
    id: `${groupId}-${agentId}`,
    onFinish: async (message) => {
      // Optional: Additional processing after generation
      console.log("Message finished:", message);
    },
  });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    sendMessage: async (content: string) => {
      // Call Convex mutation directly
      const response = await generateResponse({
        groupId,
        prompt: content,
        provider: "openai",
      });
      return response;
    },
  };
}
```

#### React Component Using useChat

```typescript
// web/src/components/features/AIChat.tsx
import { useAIChat } from "@/lib/hooks/useAIChat";
import { useState } from "react";

interface AIChatProps {
  groupId: string;
  agentId: string;
  systemPrompt?: string;
}

export function AIChat({ groupId, agentId, systemPrompt }: AIChatProps) {
  const { messages, input, handleInputChange, isLoading, sendMessage } = useAIChat(groupId, agentId);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    try {
      await sendMessage(input);
      handleInputChange({ target: { value: "" } } as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-xs rounded-lg px-4 py-2 ${
              msg.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-900"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-center text-gray-500">AI is thinking...</div>}
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 text-sm px-4">{error}</div>}

      {/* Input Form */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border rounded-lg disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

---

### Phase 4: Advanced Features (Infer 41-50)

#### Structured Output (Objects)

```typescript
// backend/convex/mutations/ai.ts (continued)
import { generateObject } from "ai";
import { z } from "zod";

const analyticsSchema = z.object({
  sentiment: z.enum(["positive", "neutral", "negative"]),
  topics: z.array(z.string()),
  urgency: z.number().min(0).max(10),
  action_items: z.array(z.string()),
});

export const analyzeMessage = mutation({
  args: {
    groupId: v.id("groups"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const model = selectModel("openai", "powerful");

    const { object, usage } = await generateObject({
      model,
      schema: analyticsSchema,
      prompt: `Analyze this message and extract insights:\n\n${args.message}`,
    });

    return { analysis: object, usage };
  },
});
```

#### Tool Calls (Function Calling)

```typescript
// backend/convex/mutations/ai.ts (continued)
import { generateText, tool } from "ai";

const tools = {
  getWeather: tool({
    description: "Get the current weather in a location",
    parameters: z.object({
      location: z.string().describe("The city and state, e.g. San Francisco, CA"),
    }),
    execute: async ({ location }) => {
      // Call weather API
      return `Weather in ${location}: 72°F, Sunny`;
    },
  }),

  createTask: tool({
    description: "Create a new task for the user",
    parameters: z.object({
      title: z.string(),
      description: z.string().optional(),
      dueDate: z.string().optional(),
    }),
    execute: async ({ title, description, dueDate }) => {
      // Create thing in database
      return `Task created: ${title}`;
    },
  }),
};

export const generateWithTools = mutation({
  args: {
    groupId: v.id("groups"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const model = selectModel("openai", "powerful");

    const result = await generateText({
      model,
      tools,
      prompt: args.prompt,
    });

    return result;
  },
});
```

---

### Phase 5: Monitoring & Observability (Infer 61-70)

#### Token Usage Tracking

```typescript
// web/src/lib/hooks/useTokenUsage.ts
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useTokenUsage(groupId: string) {
  const calls = useQuery(api.queries.ai.getCallsByGroup, { groupId });

  if (!calls) return null;

  const totalTokens = calls.reduce((sum, call) => {
    return sum + (call.tokensUsed?.input || 0) + (call.tokensUsed?.output || 0);
  }, 0);

  const totalCost = totalTokens * 0.00002; // Example: $0.02 per 1M tokens

  return {
    totalCalls: calls.length,
    totalTokens,
    estimatedCost: totalCost,
    averageLatency: calls.reduce((sum, call) => sum + call.duration, 0) / calls.length,
  };
}
```

#### Query for Analytics

```typescript
// backend/convex/queries/ai.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCallsByGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiCalls")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .take(100);
  },
});

export const getTokenUsageStats = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const calls = await ctx.db
      .query("aiCalls")
      .withIndex("by_groupId", (q) => q.eq("groupId", args.groupId))
      .collect();

    const groupedByProvider = calls.reduce((acc, call) => {
      if (!acc[call.provider]) {
        acc[call.provider] = { calls: 0, tokens: 0 };
      }
      acc[call.provider].calls += 1;
      acc[call.provider].tokens += (call.tokensUsed?.input || 0) + (call.tokensUsed?.output || 0);
      return acc;
    }, {} as Record<string, { calls: number; tokens: number }>);

    return groupedByProvider;
  },
});
```

---

## Integration with 6-Dimension Ontology

### Mapping to Ontology Dimensions

1. **Things**: AI `agent` entities with properties for model, provider, system prompt
2. **Connections**: `agent_owns`, `agent_trained_on`, `user_interacted_with_agent`
3. **Events**: `ai_generation_completed`, `ai_tool_called`, `ai_error_occurred`
4. **Knowledge**: Embeddings of generated content for RAG
5. **People**: Track which users interact with which agents
6. **Groups**: Multi-tenant AI access (each group has separate AI quotas/models)

### Schema for Agent Things

```typescript
// Agent as a "thing"
{
  _id: Id<"things">,
  groupId: Id<"groups">,
  type: "agent",
  name: "Customer Support Bot",
  status: "active",
  properties: {
    model: "gpt-4-turbo",
    provider: "openai",
    systemPrompt: "You are a helpful customer support agent...",
    tools: ["searchKB", "createTicket", "escalateToHuman"],
    temperature: 0.7,
    maxTokens: 2000,
  },
  createdAt: number,
  updatedAt: number,
}
```

---

## Configuration Reference

| Setting | Purpose | Default |
|---------|---------|---------|
| `model` | Which LLM model | `gpt-4-turbo` |
| `provider` | Which LLM provider | `openai` |
| `temperature` | Creativity (0-1) | `0.7` |
| `maxTokens` | Max response length | `2000` |
| `systemPrompt` | AI instructions | Generic |

---

## Common Patterns

### Pattern: Provider Agnostic Code

```typescript
// Good: Works with any provider
async function chat(message: string) {
  const model = selectModel(provider, tier);
  return generateText({ model, prompt: message });
}

// Bad: Locked to OpenAI
async function chat(message: string) {
  return openai("gpt-4").generateText({ prompt: message });
}
```

### Pattern: Error Handling

```typescript
try {
  const result = await generateText({ model, prompt });
  return { success: true, result };
} catch (error) {
  // Log to database
  await logError(groupId, error);

  // Re-throw with context
  throw new Error(`AI generation failed: ${error.message}`);
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// test/ai/generateResponse.test.ts
import { expect, test } from "bun:test";
import { generateResponse } from "@/convex/mutations/ai";

test("generateResponse returns text", async () => {
  const result = await generateResponse({
    groupId: "group_123",
    prompt: "What is 2+2?",
  });

  expect(result.success).toBe(true);
  expect(result.text).toBeDefined();
});
```

### Integration Tests

```typescript
// test/ai/integration.test.ts
test("chat flow with AI SDK and Convex", async () => {
  // 1. Create a group
  // 2. Create an agent thing
  // 3. Send message via mutation
  // 4. Verify event logged
  // 5. Verify tokens tracked
});
```

---

## Performance Considerations

- **Streaming**: Use `streamText()` for long responses
- **Caching**: Cache common prompts and responses
- **Rate Limiting**: Use Convex Rate Limiter for abuse prevention
- **Async**: Run AI calls asynchronously to not block UI
- **Token Budget**: Track tokens per group per month for cost control

---

## Next Steps

1. **Install dependencies**: `npm install ai @ai-sdk/openai`
2. **Set environment variables**: Add LLM provider keys
3. **Implement backend mutations**: Start with `generateResponse`
4. **Build frontend components**: Integrate `useChat` hook
5. **Add monitoring**: Track tokens and latency
6. **Test end-to-end**: Verify all flows work

---

## References

- [AI SDK Documentation](https://ai-sdk.dev/)
- [AI SDK React](https://ai-sdk.dev/docs/react)
- [Supported Models](https://ai-sdk.dev/docs/models)
- [Tool Calling](https://ai-sdk.dev/docs/tools-and-functions)
- [Streaming](https://ai-sdk.dev/docs/concepts/streaming)
