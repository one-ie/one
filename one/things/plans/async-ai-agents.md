Here’s a **detailed and production-ready “build-agents” prompt** that you can give to **Claude Code, Codex, or any autonomous builder agent** to implement AI systems like those described by Ian from Convex.
It’s written in a _mission / story / task_ structure optimized for your Codex + ElizaOS workflow.

---

# 🧭 Prompt: Build Async AI Agents with Convex

## 🎯 Mission

Create a fully asynchronous AI agent system built on **Convex** that demonstrates how LLM-driven workflows, database persistence, and real-time reactivity combine into a durable, resilient architecture for AI applications.

The goal is to move away from long-running synchronous API calls toward a **persistent async model**:
LLMs write and read from a reactive database, enabling background processing, live UI updates, and fault-tolerant task orchestration.

---

## 🪶 Story Context

You are building an **AI agent orchestration framework** on top of **Convex**, inspired by Ian’s async talk.

Imagine two developers opening the same chat app:

- User A sends a prompt to an AI agent.
- User B, connected via a separate WebSocket session, instantly sees the streaming response as it’s generated.
- The backend processes the AI reasoning asynchronously — retrying, journaling, or resuming even if the client disconnects.

This system will support **AI agents that persist, resume, and self-coordinate**, without relying on synchronous HTTP calls.

---

## 🧩 Core Architecture Overview

### 1. **Frontend**

- Built with React or SvelteKit.
- Uses Convex React hooks (`useQuery`, `useMutation`) for live data.
- Messages are displayed reactively from the database (no polling).
- Supports “optimistic UI” for pending messages.

### 2. **Convex Backend**

- Located in `/convex/`.
- Contains:
  - `schema.ts`: Defines message, agent, and workflow collections.
  - `functions/`: Contains queries, mutations, and async workflows.
  - `ai/`: Manages async calls to OpenAI, Anthropic, or other LLMs.

### 3. **Database Schema (schema.ts)**

```ts
export default defineSchema({
  messages: defineTable({
    threadId: v.string(),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("system")
    ),
    content: v.string(),
    status: v.optional(v.string()), // "pending" | "completed" | "error"
    createdAt: v.number(),
  }),
  threads: defineTable({
    title: v.string(),
    lastUpdated: v.number(),
  }),
  workflows: defineTable({
    step: v.string(),
    status: v.string(), // "running", "paused", "failed", "done"
    data: v.any(),
  }),
});
```

---

## ⚙️ Implementation Tasks

### **Task 1: Reactive Queries**

- Create `getMessages` query:
  - Returns all messages for a thread.
  - Automatically re-runs whenever a new message is added.

- Frontend subscribes via `useQuery`.

### **Task 2: Message Mutations**

- `sendMessage`: Insert user prompt with `status = "pending"`.
- `updateMessage`: Update assistant’s response progressively as tokens stream in.

### **Task 3: Async AI Workflow**

- Create `functions/ai/runAgent.ts`:
  - Triggered by `sendMessage`.
  - Uses `convex.workflow` or `convex.backgroundFunction`.
  - Journals progress and retries automatically.
  - Calls an LLM (e.g., OpenAI, Claude) asynchronously.
  - Writes partial responses (`sentence by sentence`) into the database.
  - Supports resumable checkpoints.

```ts
export const runAgent = async (ctx, { threadId, messageId }) => {
  await ctx.db.patch(messageId, { status: "running" });
  const prompt = await ctx.db.get(messageId);

  for await (const chunk of streamLLM(prompt.content)) {
    await ctx.db.patch(messageId, { content: chunk });
  }

  await ctx.db.patch(messageId, { status: "completed" });
};
```

---

### **Task 4: Durable Workflows**

- Implement Convex Workflows (durable journaled tasks).
- Automatically resume after server restart.
- Support “pause for human input” or “schedule resume” after hours.

Example:

```ts
export const workflow = convex.workflow(async (ctx, { input }) => {
  await ctx.step("analyze", async () => analyzePrompt(input));
  await ctx.step("generate", async () => callLLM(input));
  await ctx.step("finalize", async () => saveToDB(ctx, result));
});
```

---

### **Task 5: Multi-Agent Coordination**

- Allow multiple agents to operate on shared threads.
- Use separate collections or namespaces for each.
- Agents can append or edit messages based on system prompts.
- Implement an “agent router” that dispatches tasks to specialized agents.

---

### **Task 6: Fault Tolerance**

- If client disconnects → background task continues.
- On error → automatic retry.
- Support resumable async steps.
- Logs and metrics are written to `workflows` table.

---

### **Task 7: Developer Ergonomics**

- Type-safe schema validation (runtime + compile-time).
- Type propagation to frontend.
- Automatic schema validation on deploy (Convex blocks schema mismatch).

---

## 🧠 Key Concepts to Demonstrate

| Concept                       | Description                            | Implementation                             |
| ----------------------------- | -------------------------------------- | ------------------------------------------ |
| **Reactive DB**               | Queries auto-update when data changes  | `useQuery`, Convex reactive subscriptions  |
| **Async AI Execution**        | LLM runs in background, updates DB     | Workflows or background functions          |
| **Optimistic UI**             | Frontend updates before LLM response   | `optimisticUpdate` pattern                 |
| **Durable Tasks**             | Retryable, journaled async logic       | `convex.workflow`                          |
| **Multi-Agent Collaboration** | Several async tasks update same thread | Multiple workflows writing to shared table |
| **Failure Resilience**        | Retries, resumption after failure      | Built-in Convex durability                 |
| **Real-time UX**              | WebSockets auto-sync UI state          | Convex reactive queries                    |

---

## 🧪 Demo Plan

1. Open two browser tabs with same chat thread.
2. User A sends a prompt.
3. LLM begins generating message asynchronously.
4. Both UIs update live (sentence-level streaming).
5. User B aborts the generation → both sessions reflect cancellation.
6. Task retries automatically if a worker fails.

---

## 🧰 Tech Stack

- **Frontend:** React + Convex React hooks + Tailwind + Shadcn
- **Backend:** Convex TypeScript functions + workflows
- **LLM API:** OpenAI / Claude / Anthropic SDK
- **Infra:** Convex hosted runtime
- **Optional:** Supabase for external analytics or embeddings

---

## 📜 Deliverables

- [ ] `convex/schema.ts`
- [ ] `convex/functions/ai/runAgent.ts`
- [ ] `convex/functions/messages.ts`
- [ ] `convex/workflows/agentWorkflow.ts`
- [ ] React frontend (`Chat.tsx`, `MessageList.tsx`, `MessageInput.tsx`)
- [ ] Documentation (README.md explaining async architecture)
- [ ] Demo: two users, reactive streaming, cancel + resume behavior

---

## 🧩 Extension Ideas

- Add **agent memory** (embed messages into vector store).
- Add **tools** (API calling, web search, code execution).
- Add **multi-threaded reasoning** (agents coordinating across tables).
- Add **scheduler** for long-running jobs (e.g., every hour).

---
