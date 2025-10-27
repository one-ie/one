# AI Integration Architecture

**Complete integration of AI SDK + Convex Agents + AI Elements with Effect.ts**

**Version:** 1.0.0 (Effect.ts Refined)
**Status:** Planning
**Created:** 2025-10-24
**Patterns:** effect.md + effect-components.md

---

## Core Pattern: Effect.ts Service Layer

All AI functionality is implemented as **Effect.ts services** using `Context.Tag` and `Layer` for dependency injection. Convex components provide infrastructure; Effect provides business logic composition:

```typescript
// Layer 1: Error types (tagged classes)
class LLMError extends Data.TaggedError("LLMError")<{
  model: string
  provider: string
  cause: unknown
}> {}

class AgentError extends Data.TaggedError("AgentError")<{
  agentName: string
  cause: unknown
}> {}

class RAGError extends Data.TaggedError("RAGError")<{
  query: string
  cause: unknown
}> {}

// Layer 2: Service definitions
class LLMService extends Context.Tag("LLMService")<LLMService, { /* ... */ }>() {}
class AgentService extends Context.Tag("AgentService")<AgentService, { /* ... */ }>() {}
class RAGService extends Context.Tag("RAGService")<RAGService, { /* ... */ }>() {}

// Layer 3: Service implementations
const LLMServiceLive = Layer.effect(LLMService, /* ... */);
const AgentServiceLive = Layer.effect(AgentService, /* ... */);
const RAGServiceLive = Layer.effect(RAGService, /* ... */);

// Layer 4: Composition
const AppLayer = Layer.mergeAll(
  LLMServiceLive,
  AgentServiceLive,
  RAGServiceLive
);

// Usage in mutations/actions
export const myAction = action({
  handler: (ctx, args) =>
    Effect.gen(function* () {
      const llm = yield* LLMService;
      const agent = yield* AgentService;
      const rag = yield* RAGService;

      // Compose services with explicit error handling
      const context = yield* rag.search(args.query);
      const response = yield* agent.generateResponse(ctx, args.message, context);

      return response;
    }).pipe(
      Effect.provide(AppLayer),
      Effect.catchAll((error) => {
        // Handle errors explicitly
        return Effect.succeed({ error: true });
      })
    )
});
```

---

## Executive Summary

This document describes how three powerful technologies integrate into a seamless AI experience:

1. **AI SDK** (Vercel) - Unified LLM interface across 20+ providers
2. **Convex Agents** (Convex) - Backend agent orchestration with persistence
3. **AI Elements** (Vercel) - Pre-built production-ready UI components

**The Result:** A beautiful, type-safe, multi-tenant AI chat platform with:
- Real-time streaming conversations
- Tool execution with rich UI feedback
- RAG-powered knowledge retrieval
- Complete conversation history
- Token tracking and billing
- Enterprise-grade multi-tenancy

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Astro + React)                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          AI Elements Components (30+ UI elements)         │   │
│  │  - Chatbot, Message, Response, Code Block, Artifact, etc │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         React Hooks (useChat, useCompletion)             │   │
│  │          ↓                                                │   │
│  │    useCompleteChatFlow() [Custom Hook]                   │   │
│  │    ├─ Thread Management                                  │   │
│  │    ├─ Message State                                      │   │
│  │    └─ Streaming State                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                          ↓ (Convex Mutations)
┌──────────────────────────────────────────────────────────────────┐
│                  CONVEX BACKEND (Node.js)                         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Convex Mutations                             │   │
│  │  ├─ createThread()      - Create conversation thread     │   │
│  │  ├─ sendMessage()       - Add message to thread          │   │
│  │  ├─ streamResponse()    - Stream AI response             │   │
│  │  └─ executeTool()       - Execute agent tools            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │            Convex Agents Runtime                          │   │
│  │  ├─ Thread Management  (aiThreads table)                 │   │
│  │  ├─ Message Persistence (Convex Agents internal)         │   │
│  │  ├─ Tool Orchestration  (executeTools)                   │   │
│  │  └─ Streaming Pipeline  (WebSocket to client)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             AI SDK Core Functions                         │   │
│  │  ├─ generateText()    - Single response                  │   │
│  │  ├─ streamText()      - Streaming response               │   │
│  │  ├─ generateObject()  - Structured output                │   │
│  │  └─ Tool Calls        - Function execution               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                          ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Convex Database (5-Table Ontology)             │   │
│  │  ├─ groups      - Tenants                                │   │
│  │  ├─ things      - Agents, users, tasks                   │   │
│  │  ├─ connections - Relationships                          │   │
│  │  ├─ events      - Audit trail, usage                     │   │
│  │  ├─ knowledge   - Embeddings for RAG                     │   │
│  │  └─ aiCalls     - Token tracking, billing                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
                          ↓ (API Calls)
┌──────────────────────────────────────────────────────────────────┐
│               LLM PROVIDERS (External APIs)                       │
│  ├─ OpenAI (GPT-4, GPT-4o, GPT-4-turbo)                          │
│  ├─ Anthropic (Claude 3 Opus, Sonnet, Haiku)                     │
│  ├─ Google (Gemini Pro, Flash)                                   │
│  ├─ DeepSeek, Mistral, Groq, etc.                                │
│  └─ Custom models via API                                        │
└──────────────────────────────────────────────────────────────────┘
```

**Key Innovation: Effect.ts Service Layer**
- All business logic composed as Effect services
- Components handle infrastructure (Agent, RAG, Rate-Limiter)
- Service layer provides tagged errors, dependency injection, and testability
- Mutations are thin wrappers that call services with `Effect.provide(AppLayer)`

---

## Data Flow: Complete Chat Interaction

### Step 1: User Types and Sends Message

```
USER
 ↓
Chatbot Component (AI Elements)
 ├─ Captures text in PromptInput
 └─ Calls handleSubmit()
    ↓
useCompleteChatFlow Hook
 ├─ Validates input
 ├─ Creates thread (if needed)
 └─ Calls sendMessage mutation
    ↓
Convex Mutation (sendMessage)
 ├─ Verifies auth & group access
 ├─ Stores message in thread
 └─ Calls AI SDK streamText()
    ↓
AI SDK (streamText)
 ├─ Gets LLM model from agent config
 ├─ Includes conversation history
 ├─ Adds system prompt
 └─ Streams to Convex Agents runtime
    ↓
Convex Agents Runtime
 ├─ Manages LLM streaming
 ├─ Detects tool calls
 ├─ Executes tools (searchKnowledge, etc.)
 └─ Re-includes results in context
    ↓
LLM Provider API
 └─ Processes inference
    ↓
Stream Returns to Frontend
 ├─ Chunks received via WebSocket
 └─ UI updates in real-time
    ↓
Message Component (AI Elements)
 ├─ Displays streaming text
 ├─ Renders code blocks if present
 ├─ Shows artifact previews
 └─ Updates complete message
```

### Step 2: Agent Executes Tools

```
AI SDK detects tool call in response
 ↓
Tool Definition (e.g., searchKnowledge)
 ├─ Parameters: query, limit
 └─ Handler function
    ↓
Convex Agents executes tool
 ├─ Calls handler with context
 └─ Receives results
    ↓
Search Results
 ├─ Queries knowledge table via vector embeddings
 ├─ Returns relevant documents
 └─ Includes relevance scores
    ↓
Tool Results included in context
 ├─ Agent sees results
 ├─ Formulates response with citations
 └─ Includes in next message
    ↓
AI Elements Components
 ├─ Message with inline citations
 ├─ Sources component shows references
 └─ Links back to knowledge items
```

### Step 3: Complete Response and Logging

```
Stream completes
 ├─ Full message text captured
 ├─ Tool calls and results stored
 └─ Usage metrics calculated
    ↓
Log to aiCalls table
 ├─ Model, provider, tokens
 ├─ Duration, cost
 └─ Metadata (tools, reasoning, etc.)
    ↓
Log to events table
 ├─ Type: ai_response_completed
 ├─ Actor: user ID
 ├─ Metadata: tokens, model, tools used
 └─ Timestamp
    ↓
Update thread in aiThreads
 ├─ Set updatedAt
 ├─ Increment message count
 └─ Update status if needed
    ↓
UI Reflects Final State
 ├─ Message shows complete
 ├─ Streaming indicators hidden
 ├─ Action buttons available (copy, regenerate, etc.)
 └─ Ready for next message
```

---

## Data Model Integration

### How Ontology Dimensions Connect

```typescript
// Groups: Multi-tenancy
{
  _id: Id<"groups">,
  name: "Acme Corp",
  type: "organization",
  properties: { plan: "pro" }
}

// Things: Agents and Conversations
{
  _id: Id<"things">,
  type: "agent",
  groupId: Id<"groups">,
  name: "Customer Support Bot",
  properties: {
    model: "gpt-4-turbo",
    provider: "openai",
    systemPrompt: "You are helpful...",
    tools: ["searchKB", "createTicket"]
  }
}

// Connections: Relationships
{
  _id: Id<"connections">,
  type: "user_interacts_with_agent",
  groupId: Id<"groups">,
  from: "<user-id>",
  to: "<agent-id>",
  metadata: { lastInteraction: Date.now() }
}

// Events: Audit Trail
{
  _id: Id<"events">,
  type: "ai_response_completed",
  groupId: Id<"groups">,
  actorId: "<user-id>",
  targetId: "<agent-id>",
  metadata: {
    model: "gpt-4-turbo",
    tokensUsed: { input: 245, output: 1023 },
    toolsCalled: ["searchKB"],
    duration: 2340
  }
}

// Knowledge: RAG
{
  _id: Id<"knowledge">,
  groupId: Id<"groups">,
  title: "How to create a task",
  content: "Use the /task command...",
  embedding: [0.123, -0.456, ...], // 1536 dimensions
  relevance: 0.87,
  source: "<thing-id>"
}

// AI-Specific Tables
{
  // aiCalls: Token tracking for billing
  _id: Id<"aiCalls">,
  groupId: Id<"groups">,
  model: "gpt-4-turbo",
  provider: "openai",
  tokensUsed: { input: 245, output: 1023 },
  cost: 0.052,
  timestamp: Date.now()
}

{
  // aiThreads: Conversation threads
  _id: Id<"aiThreads">,
  groupId: Id<"groups">,
  agentId: Id<"things">,
  title: "Billing Question",
  status: "active",
  metadata: { createdBy: "<user-id>" },
  createdAt: Date.now()
}
```

---

## Technology Stack Integration

### Layer 1: Frontend (Astro Pages)

```astro
---
// src/pages/chat/[threadId].astro
import CompleteChatUI from "@/components/features/AIChat/CompleteChatUI";

// Server-side: Fetch thread data
const thread = await getThread(Astro.params.threadId);
---

<Layout title={thread.title}>
  <!-- Client-side: Interactive component -->
  <CompleteChatUI
    groupId={thread.groupId}
    agentId={thread.agentId}
    client:load
  />
</Layout>
```

### Layer 2: React Components (AI Elements)

```typescript
// src/components/features/AIChat/CompleteChatUI.tsx
import { Chatbot } from "@/components/ui/ai-elements/chatbot";
import { Message } from "@/components/ui/ai-elements/message";
import { CodeBlock } from "@/components/ui/ai-elements/code-block";
import { useCompleteChatFlow } from "@/lib/hooks/useCompleteChatFlow";

export function CompleteChatUI({ groupId, agentId }) {
  const {
    messages,
    input,
    handleInputChange,
    isLoading,
    handleSubmit,
  } = useCompleteChatFlow(groupId, agentId);

  return (
    <Chatbot
      messages={messages}
      input={input}
      onInputChange={handleInputChange}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      {messages.map(msg => (
        <Message
          key={msg.id}
          role={msg.role}
          content={msg.content}
          metadata={msg.metadata}
        />
      ))}
    </Chatbot>
  );
}
```

### Layer 3: Custom Hooks (AI SDK Integration)

```typescript
// src/lib/hooks/useCompleteChatFlow.ts
import { useChat } from "ai/react";
import { useMutation } from "convex/react";

export function useCompleteChatFlow(groupId: string, agentId: string) {
  const sendMessage = useMutation(api.mutations.agentChat.sendMessage);
  const { messages, input, handleInputChange, isLoading } = useChat();

  const handleSubmit = async (content: string) => {
    await sendMessage({
      groupId,
      agentId,
      threadId: currentThread,
      message: content,
    });
  };

  return { messages, input, handleInputChange, isLoading, handleSubmit };
}
```

### Layer 4: Convex Mutations (Backend Orchestration)

```typescript
// backend/convex/mutations/agentChat.ts
import { mutation } from "./_generated/server";
import { streamText } from "ai";
import { selectModel } from "../ai";

export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),
    agentId: v.id("things"),
    threadId: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get agent configuration from things table
    const agent = await ctx.db.get(args.agentId);

    // 2. Get conversation context from thread
    const messages = await getMessages(ctx, { threadId: args.threadId });

    // 3. Call AI SDK to generate response
    const { textStream, usage } = await streamText({
      model: selectModel(agent.properties.provider, "powerful"),
      system: agent.properties.systemPrompt,
      tools: loadAgentTools(agent),
      messages: [...messages, { role: "user", content: args.message }],
    });

    // 4. Log usage metrics
    await ctx.db.insert("aiCalls", {
      groupId: args.groupId,
      model: agent.properties.model,
      tokensUsed: usage,
      timestamp: Date.now(),
    });

    return { stream: textStream, threadId: args.threadId };
  },
});
```

### Layer 5: AI SDK (LLM Interface)

```typescript
// Unified API across providers
const { textStream, usage } = await streamText({
  // Works with ANY provider
  model: selectModel("openai", "powerful"), // or anthropic, google, etc.

  // System context
  system: "You are a helpful assistant...",

  // Conversation history
  messages: [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi!" },
    { role: "user", content: "What's your name?" },
  ],

  // Tool definitions
  tools: {
    searchKnowledge: {
      description: "Search knowledge base",
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => { /* RAG search */ }
    }
  },
});
```

### Layer 6: Convex Database (Data Persistence)

```typescript
// Automatic persistence by Convex Agents
tables: {
  groups,          // Tenants
  things,          // Agents, users, tasks
  connections,     // Relationships
  events,          // Audit trail
  knowledge,       // RAG vectors
  aiCalls,         // Token tracking
  aiThreads,       // Conversations
  // + Convex Agents internal tables for messages
}
```

### Layer 7: LLM Providers (Inference)

```typescript
// Supported providers via AI SDK
providers: [
  "openai",       // GPT-4, GPT-4o
  "anthropic",    // Claude
  "google",       // Gemini
  "azure",        // OpenAI Azure
  "cohere",       // Cohere
  "deepseek",     // DeepSeek
  "mistral",      // Mistral
  "groq",         // Groq
  "xai",          // xAI
  // ... and 10+ more
]
```

---

## Request/Response Flow (Complete Walkthrough)

### Sending a Message

```
1. USER
   └─ Types "What is machine learning?" in ChatBot

2. FRONTEND (React + AI Elements)
   └─ PromptInput captures input
   └─ handleInputChange updates state
   └─ onSubmit calls handleSubmit()

3. CUSTOM HOOK (useCompleteChatFlow)
   └─ Validates message not empty
   └─ Creates thread if first message
   └─ Calls sendMessage mutation

4. CONVEX MUTATION (sendMessage)
   └─ Verifies auth (user logged in)
   └─ Verifies group access (user member)
   └─ Fetches agent from things table
   └─ Fetches thread messages
   └─ Calls AI SDK streamText()

5. AI SDK (streamText)
   └─ Gets model: "openai/gpt-4-turbo"
   └─ Builds prompt:
      - System: agent.properties.systemPrompt
      - Messages: previous 10 messages + new message
      - Tools: ["searchKnowledge", "createTask"]

6. CONVEX AGENTS (Stream Management)
   └─ Handles real-time streaming
   └─ Detects tool calls in response
   └─ When tool called:
      a. Pauses main stream
      b. Executes tool (e.g., RAG search)
      c. Includes results in context
      d. Resumes generation

7. LLM PROVIDER (OpenAI API)
   └─ Processes request
   └─ Streams response tokens
   └─ Includes tool calls if applicable
   └─ Sends back token usage

8. CONVEX AGENTS (Response Processing)
   └─ Aggregates streamed chunks
   └─ Detects end of stream
   └─ Returns complete response

9. CONVEX MUTATION (Logging)
   └─ Inserts aiCall record:
      - model: "gpt-4-turbo"
      - tokensUsed: { input: 245, output: 1023 }
      - cost: $0.052
   └─ Inserts event record:
      - type: "ai_response_completed"
      - metadata: { model, tokensUsed, toolsCalled }
   └─ Updates aiThread:
      - updatedAt: Date.now()

10. FRONTEND (WebSocket)
    └─ Receives stream chunks via WebSocket
    └─ Message component updates in real-time
    └─ Shows streaming indicator
    └─ Renders content as it arrives

11. UI RENDERS (AI Elements)
    └─ Message component displays response
    └─ If code: CodeBlock with syntax highlighting
    └─ If artifact: Artifact with preview
    └─ If sources: Sources component with links
    └─ Actions available: Copy, Share, Regenerate
```

---

## Beautiful Integration Points

### 1. Streaming is Seamless

- AI SDK handles provider differences
- Convex Agents manages WebSocket streaming
- React components update in real-time
- UI feels instant and responsive

### 2. Tools Work Transparently

- Agent calls tool → AI SDK detects it
- Convex executes tool (e.g., RAG search)
- Results included automatically
- Agent continues with context
- User sees sources and citations

### 3. Multi-Tenancy is Built-In

- Every operation scoped to `groupId`
- Database queries filtered by group
- No cross-tenant data leakage
- Usage tracked per group
- Billing per group

### 4. Type Safety Throughout

```typescript
// Frontend ✓ Type-safe
const response = await sendMessage({
  groupId: "group_123",  // ✓ Id<"groups">
  agentId: "thing_456",  // ✓ Id<"things">
  threadId: "thread_789", // ✓ string
  message: "Hello",      // ✓ string
});

// Backend ✓ Type-safe
export const sendMessage = mutation({
  args: {
    groupId: v.id("groups"),      // ✓ Validates ID
    agentId: v.id("things"),       // ✓ Validates ID
    threadId: v.string(),          // ✓ Validates string
    message: v.string(),           // ✓ Validates string
  },
});

// AI SDK ✓ Type-safe
const model = openai("gpt-4-turbo");  // ✓ Typed model
const result = await generateText({
  model,              // ✓ Correct type
  prompt,             // ✓ string
  tools: {            // ✓ Tool definitions validated
    search: tool({ ... })
  }
});
```

### 5. Observability Built-In

- Every AI call logged to `aiCalls`
- Every action logged to `events`
- Tokens tracked for billing
- Latency measured
- Errors captured
- Complete audit trail

### 6. RAG Integration Natural

- Knowledge stored in `knowledge` table
- Vectors indexed for similarity search
- Tools access RAG automatically
- Citations linked back to source
- Embeddings updated continuously

---

## Performance Characteristics

| Operation | Latency | Why |
|-----------|---------|-----|
| Chat send | ~100ms | Frontend → Convex (fast) |
| LLM call | 2-5s | API call to provider |
| Stream start | ~200ms | WebSocket handshake |
| First token | 0.5-2s | Depends on model |
| Tool execute | 50-500ms | Search/compute time |
| UI update | <16ms | React re-render |
| Message save | ~50ms | Convex DB insert |
| Event log | ~50ms | Convex DB insert |

**Total: 2-5 seconds for complete interaction** (dominated by LLM inference time)

---

## Security Model

### Authentication
- Convex Auth validates every mutation
- User identity from auth context
- Sessions managed by Better Auth

### Authorization
- Group membership checked
- User can only access own group's data
- Agent access controlled per group
- Tenant isolation enforced

### Data Protection
- All LLM calls logged for audit
- API keys never exposed to frontend
- Encryption in transit (HTTPS/WSS)
- Encryption at rest (Convex Cloud)

### Rate Limiting
- Convex Rate Limiter on mutations
- Per-user rate limits
- Per-group quota enforcement
- Token usage tracking for billing

---

## Error Handling & Resilience

```typescript
// Graceful degradation
try {
  const response = await streamText({ /* ... */ });
} catch (error) {
  if (error.code === 'rate_limit_exceeded') {
    return { error: 'Please wait before trying again' };
  }
  if (error.code === 'context_length_exceeded') {
    return { error: 'Message too long for this model' };
  }
  if (error.code === 'api_error') {
    return { error: 'Service temporarily unavailable' };
  }
  return { error: 'Unexpected error. Please try again.' };
}

// Automatic retry
for (let i = 0; i < maxRetries; i++) {
  try {
    return await streamText({ /* ... */ });
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await delay(Math.pow(2, i) * 1000); // Exponential backoff
  }
}

// Fallback model
try {
  return await generateText({ model: primaryModel, /* ... */ });
} catch {
  return await generateText({ model: fallbackModel, /* ... */ });
}
```

---

## Example: Complete Chat Session

```
1. User visits /chat/thread_abc123
2. Astro page loads thread metadata
3. CompleteChatUI renders with groupId, agentId
4. useCompleteChatFlow initializes with zero messages
5. AI Elements Chatbot displays "Start a conversation"
6. User types: "What are the top 3 ML algorithms?"
7. Frontend sends message via Convex mutation
8. Mutation:
   - Gets agent config from things table
   - Calls AI SDK streamText()
   - Agent detects tool call: searchKnowledge
   - Tool returns 5 relevant documents
   - Agent generates response with citations
9. Response streams back to frontend
10. Message renders with:
    - Original response text
    - Inline citations [1], [2], [3]
    - Sources component showing papers
    - Suggestion buttons for follow-ups
11. Event logged: ai_response_completed
    - Tokens: input 245, output 1023
    - Cost: $0.052
    - Duration: 2.3s
12. Next message ready, full conversation history in context
```

---

## Configuration Reference

### Agent Thing Properties

```typescript
{
  type: "agent",
  properties: {
    model: "gpt-4-turbo",
    provider: "openai",
    systemPrompt: "You are a helpful...",
    temperature: 0.7,
    maxTokens: 2000,
    tools: [
      "searchKnowledge",
      "createTask",
      "updateProfile",
      "callHuman"
    ],
    ragEnabled: true,
    ragModel: "text-embedding-3-small",
    ragTopK: 5,
    toolCallTimeout: 5000,
    maxConsecutiveToolCalls: 5,
  }
}
```

### Environment Variables

```bash
# Backend (.env.local)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
CONVEX_DEPLOYMENT=prod:xxx

# Frontend (.env.local)
PUBLIC_CONVEX_URL=https://xxx.convex.cloud
CONVEX_DEPLOYMENT=prod:xxx
```

---

## Deployment Checklist

- [ ] Install all packages (ai, @ai-sdk/openai, ai-elements)
- [ ] Configure environment variables
- [ ] Update schema with ai tables
- [ ] Deploy backend mutations
- [ ] Create AI Elements components
- [ ] Build Astro pages
- [ ] Test end-to-end chat flow
- [ ] Verify streaming works
- [ ] Check tool execution
- [ ] Monitor token usage
- [ ] Deploy to production
- [ ] Set up billing alerts

---

## Next Steps: Implementation Order

1. **Week 1: Setup**
   - Install packages
   - Configure environment
   - Update schema

2. **Week 2: Backend**
   - Implement mutations
   - Set up AI SDK
   - Configure Convex Agents

3. **Week 3: Frontend**
   - Create AI Elements components
   - Build custom hooks
   - Implement streaming

4. **Week 4: Integration**
   - Test end-to-end
   - Add RAG integration
   - Implement tool calls

5. **Week 5: Production**
   - Performance optimization
   - Security audit
   - Deploy and monitor

---

## References

- **AI SDK**: [ai-sdk.md](./ai-sdk.md)
- **Convex Agents**: [convex-agents.md](./convex-agents.md)
- **AI Elements**: [ai-elements.md](./ai-elements.md)
- **Ontology**: [../knowledge/ontology.md](../knowledge/ontology.md)
- **Architecture**: [../knowledge/architecture.md](../knowledge/architecture.md)
- **Patterns**: [../connections/patterns.md](../connections/patterns.md)

---

## Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Chat response latency | <3s | - |
| Streaming start time | <500ms | - |
| Tool execution accuracy | >95% | - |
| RAG relevance score | >0.7 | - |
| Error rate | <0.1% | - |
| User satisfaction | >4.5/5 | - |
| Token usage tracking | 100% | - |

---

**Built with clarity, simplicity, and infinite scale in mind.**
