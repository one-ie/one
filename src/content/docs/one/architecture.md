---
title: Getting Started with ONE
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
tags:
  - agents
order: 1
---
Architecture

This section describes the overall structure and design of the Agent Inbox application, covering the frontend, backend, database, AI integration, and data flow.

5.1. **Frontend (Client-Side)**

*   **Type:** Single Page Application (SPA).
*   **Framework/Library:** React 19.
*   **Build Tool:** Vite provides a fast development server with Hot Module Replacement (HMR) and optimized production builds.
*   **Language:** TypeScript for static typing and improved developer experience.
*   **Styling:**
    *   Tailwind CSS is used for utility-first styling. Configuration is in `tailwind.config.js` and `postcss.config.js`.
    *   Base styles, theme variables (CSS custom properties for light/dark mode), and Tailwind imports are managed in `src/index.css`.
*   **UI Components:** Primarily uses shadcn/ui (`src/components/ui/`), which provides accessible and customizable components built on Radix UI and styled with Tailwind. Custom components are built compositionally using these primitives (`src/components/authenticated/`, `src/components/unauthenticated/`).
*   **Routing:** `type-route` (`src/routes.ts`) manages browser history and provides type-safe navigation between different views (Home, Conversation, Agent Profile).
*   **State Management:**
    *   **Server State:** Primarily managed by Convex. The `convex/react` hooks (`useQuery`, `useMutation`) handle fetching data, subscribing to real-time updates, and triggering backend operations. Convex automatically keeps the client in sync with relevant database changes.
    *   **UI State:** Local component state managed using React hooks (`useState`, `useRef`, `useEffect`).
    *   **Cross-Component State (Specific):** React Context (`ChatContext.tsx`) is used for specific cases like coordinating focus on the chat input after a reply action.
    *   **Caching:** `convex-helpers/react/cache` (`ConvexQueryCacheProvider` in `src/App.tsx`) is included, potentially for optimizing repeated Convex queries, though its specific usage impact might require deeper analysis.
*   **Backend Communication:** Exclusively through the `convex/react` hooks, which interact with the public API defined by Convex queries and mutations.

5.2. **Backend (Server-Side - Convex)**

*   **Platform:** Convex Serverless Backend Platform.
*   **Execution Model:** Functions (`query`, `mutation`, `action`) run on demand in Convex's managed infrastructure.
*   **Language:** TypeScript.
*   **Function Types:**
    *   **Queries (`query`, `internalQuery`):** Read-only functions for fetching data from the Convex database. They are reactive; clients using `useQuery` automatically re-run the query and update when underlying data changes. `internalQuery` functions are only callable from other backend functions.
    *   **Mutations (`mutation`, `internalMutation`):** Functions for writing data to the database. They are transactional, ensuring atomicity (all changes succeed or none do). `internalMutation` functions are only callable from other backend functions.
    *   **Actions (`action`, `internalAction`):** Designed for side effects, non-deterministic operations, and interacting with third-party services.
        *   Can run in a standard V8 environment or a Node.js environment (indicated by `"use node";` at the top of the file, necessary for using Node built-ins or libraries like `exa-js`, `resend`, `@ai-sdk/openai`).
        *   Cannot directly access the database (`ctx.db`). They interact with data by calling queries (`ctx.runQuery`) and mutations (`ctx.runMutation`).
        *   Used extensively for AI logic (`convex/ai/`) and processing messages (`convex/conversationMessages/internalActions.ts`).
        *   `internalAction` functions are only callable from other backend functions.
*   **HTTP Endpoints (`convex/http.ts`):** While primarily API-driven via WebSockets, Convex also supports traditional HTTP endpoints. This project uses them mainly for the authentication flows provided by `@convex-dev/auth`.

5.3. **Database (Convex)**

*   **Type:** Integrated, serverless, transactional NoSQL database.
*   **Schema:** Defined explicitly in `convex/schema.ts` using `defineSchema` and `defineTable`. This provides strong typing and allows defining indexes for efficient querying. Key tables include `users`, `conversations`, `agents`, `conversationParticipants`, and `conversationMessages`. Auth tables are included via `authTables`.
*   **Real-time:** The database is inherently real-time. Frontend components subscribed via `useQuery` automatically receive updates when data they depend on changes in the database, without needing manual polling or refresh logic.
*   **Transactions:** Mutations operate within transactions, guaranteeing atomic writes.

5.4. **AI Integration**

*   **Orchestration:** Handled within Convex Actions (`convex/ai/`). This keeps complex AI logic, API key management, and interactions with external services on the backend.
*   **AI SDK (Vercel):** The `ai` SDK (`@ai-sdk/openai`) simplifies communication with the OpenAI API. It manages:
    *   Constructing API requests (model, messages, tools).
    *   Defining available tools with descriptions and Zod schemas (`convex/ai/tools.ts`, `shared/tools.ts`).
    *   Handling the tool-calling loop (AI requests tool -> backend executes tool -> result sent back to AI -> AI generates final response).
    *   Parsing the AI's response (text and tool calls).
*   **Models:** Currently configured to use OpenAI's `gpt-4o` (`convex/ai/agentReplyToMessage.ts`, `convex/ai/triageMessage.ts`).
*   **External APIs:**
    *   **OpenAI:** For language model inference and tool use decisions.
    *   **Exa:** Called by the `webSearch` tool (`convex/ai/tools.ts`) using `exa-js`.
    *   **Resend:** Called by the `sendEmail` tool (`convex/ai/tools.ts`) using the `resend` library.
*   **Context Management:** Conversation history is fetched using internal queries (`convex/ai/history.ts`, `convex/conversationMessages/internalQueries.ts`) and formatted for the AI model (`convex/ai/messages.ts`). System instructions (`convex/ai/instructions.ts`) provide persistent guidance and context about the agent's role, capabilities, and the current situation.

5.5. **Data Flow Example (User sends message *without* mention):**

1.  **Frontend:** User types "Summarize the latest AI news" in `ChatInput.tsx` and hits Send.
2.  **Frontend -> Backend (Mutation):** `ChatInput.tsx` calls the `sendFromMe` mutation (`convex/conversationMessages/mutations.ts`) with the content and `conversationId`.
3.  **Backend (Mutation):**
    *   `sendFromMe` gets the user's participant ID (`getMyParticipant`).
    *   Calls `addMessageToConversationFromUserOrAgent` (`convex/conversationMessages/model.ts`).
    *   This inserts the `participant` message into `conversationMessages` table.
    *   Patches the `lastMessageTime` on the `conversations` table.
    *   Schedules the `processMessage` internal action (`convex/conversationMessages/internalActions.ts`), passing the newly created message and conversation documents.
4.  **Backend (Action - `processMessage`):**
    *   Receives the message and conversation.
    *   Parses mentions using `parseMentionsFromMessageContent` (`shared/mentions.ts`). Finds no mentions.
    *   Fetches the author details (User) using `getParticipantUserOrAgent` internal query.
    *   Calls the `triageMessage` action (`convex/ai/triageMessage.ts`).
5.  **Backend (Action - `triageMessage`):**
    *   Gets the Triage system agent and ensures it's a participant (`getTriageAgentAndEnsureItIsJoinedToConversation` utility).
    *   Sets the Triage agent's status to `thinking` (via mutation).
    *   Constructs the system prompt using `constructTriageInstructions`.
    *   Gathers message history using `gatherMessages`.
    *   Defines available tools for the Triage agent using `createToolsForAgent` (which includes `listAgents`, `messageAnotherAgent`, etc.).
    *   Calls `generateText` from the `ai` SDK, passing the model, messages, and tools.
6.  **AI Interaction (via AI SDK):**
    *   OpenAI (`gpt-4o`) receives the prompt and history.
    *   Based on the triage instructions, it might decide to:
        *   **(Scenario A) Use a tool:** e.g., call `listAgents` to see available agents. The SDK executes the tool (runs the `listAgents` internal query), sends the result back to GPT-4o.
        *   **(Scenario B) Directly respond (less likely for triage):** Generate text containing a mention.
    *   Assume it decides to use the "Research Navigator" agent. It generates a tool call for `messageAnotherAgent`, specifying the Research Navigator's ID and a message like "Please summarize the latest AI news."
7.  **Backend (Action - `triageMessage` continues):**
    *   The AI SDK receives the `messageAnotherAgent` tool call.
    *   It executes the tool's implementation (`convex/ai/tools.ts`), which calls the `sendFromAgent` internal mutation.
    *   `sendFromAgent` stores a *new* message in `conversationMessages`, authored by the Triage agent participant, with content like `@[Research Navigator](agent:...) Please summarize the latest AI news.`. This *new* message also schedules `processMessage`.
    *   `triageMessage` might receive a final text response from the AI (e.g., "Okay, I've asked Research Navigator to look into that.") or maybe just the tool call result. It processes this using `processAgentAIResult`. If there's text, it sends *another* message via `sendFromTriageAgent`.
    *   Finally, sets the Triage agent's status back to `inactive`.
8.  **Backend (Action - `processMessage` - *Second Invocation*):**
    *   This action is now triggered for the message sent *by the Triage agent* (mentioning Research Navigator).
    *   It parses the mention, finding the Research Navigator agent ID.
    *   It calls `agentReplyToMessage` for the Research Navigator.
9.  **Backend (Action - `agentReplyToMessage` - Research Navigator):**
    *   Sets Research Navigator's status to `thinking`.
    *   Gathers history, constructs prompt (`constructAgentReplyInstructions`).
    *   Defines tools (including `webSearch`).
    *   Calls `generateText`.
    *   GPT-4o likely decides to use the `webSearch` tool with query "latest AI news".
    *   The SDK executes the tool (calls Exa API).
    *   Exa results are returned to GPT-4o.
    *   GPT-4o generates the summary based on search results.
    *   `agentReplyToMessage` receives the text summary.
    *   Calls `sendFromAgent` mutation to store Research Navigator's response.
    *   Sets Research Navigator's status to `inactive`.
10. **Frontend:** The `useQuery` hooks in `ChatArea.tsx` subscribing to `api.conversationMessages.queries.listForMe` receive the new messages (User's original, Triage agent's mention, Research Navigator's summary) in real-time, causing the UI to update and display the full interaction.

---