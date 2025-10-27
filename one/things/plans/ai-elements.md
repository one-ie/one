# AI Elements Implementation Plan

**Version:** 1.0.0
**Status:** Planning
**Integration:** AI SDK + Convex Agents
**Target Platform:** Astro 5 + React 19 + shadcn/ui

---

## Overview

**AI Elements** is a component library for building AI-powered interfaces. It provides 30+ pre-built components for:

- Chat interfaces (Chatbot, Message, Response, etc.)
- Content display (Code Block, Image, Sources, Artifact, Web Preview)
- Advanced AI features (Chain of Thought, Reasoning, Task, etc.)
- Canvas/workflow components (Node, Edge, Connection, Panel, etc.)

### Why AI Elements?

- **Pre-built**: 30+ production-ready components
- **Accessible**: WCAG compliant, keyboard navigation
- **Themeable**: Customize colors, spacing, typography
- **Type-safe**: Full TypeScript support
- **Composable**: Mix and match components
- **Tested**: Proven in production AI apps

---

## Installation & Setup (Infer 1-10)

### Prerequisites

```bash
# Ensure you have Node.js 18+
node --version  # v18+

# Ensure shadcn/ui is installed in your project
npx shadcn-ui@latest init
```

### Install AI Elements

**Option 1: Using AI Elements CLI (Recommended)**

```bash
npx ai-elements@latest init
# Prompts you to select which components to install
```

**Option 2: Using shadcn/ui CLI**

```bash
npx shadcn-ui@latest add ai-elements
```

**Option 3: Manual Installation**

```bash
npm install @ai-elements/core @ai-elements/ui
npm install ai @ai-sdk/openai
npm install zod
```

### Verify Installation

```bash
# Check components are in place
ls src/components/ui/ai-elements/

# Should see:
# - chatbot.tsx
# - message.tsx
# - response.tsx
# - suggestion.tsx
# - tool.tsx
# - code-block.tsx
# - artifact.tsx
# - and more...
```

### Environment Setup

**web/.env.local:**

```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
OPENAI_API_KEY=sk-...
```

---

## Components Library (Infer 11-30)

### Core Chat Components

#### 1. Chatbot Component

The main container for chat interactions.

```typescript
// src/components/features/AIChat/Chatbot.tsx
import { Chatbot } from "@/components/ui/ai-elements/chatbot";

export function MyChatbot() {
  return (
    <Chatbot
      id="my-chatbot"
      messages={[]}
      input=""
      isLoading={false}
      onInputChange={(value) => {}}
      onSubmit={(value) => {}}
      onMessageClick={(message) => {}}
      onSuggestionsClick={(suggestion) => {}}
    />
  );
}
```

#### 2. Message Component

Individual message display.

```typescript
import { Message } from "@/components/ui/ai-elements/message";

<Message
  role="user"
  content="What is the weather?"
  timestamp={new Date()}
  isLoading={false}
  metadata={{
    source: "chat",
    tokens: 45,
  }}
/>
```

#### 3. Response Component

AI response with optional metadata.

```typescript
import { Response } from "@/components/ui/ai-elements/response";

<Response
  content="The weather is sunny."
  role="assistant"
  timestamp={new Date()}
  actions={[
    { label: "Copy", onClick: () => {} },
    { label: "Edit", onClick: () => {} },
  ]}
/>
```

#### 4. Suggestion Component

Suggested follow-up questions.

```typescript
import { Suggestion } from "@/components/ui/ai-elements/suggestion";

<Suggestion
  suggestions={[
    "Tell me more",
    "How does this work?",
    "Give me an example",
  ]}
  onSuggestionClick={(suggestion) => {}}
/>
```

#### 5. Prompt Input Component

Input field for user messages.

```typescript
import { PromptInput } from "@/components/ui/ai-elements/prompt-input";

<PromptInput
  value={input}
  onChange={(value) => setInput(value)}
  onSubmit={(value) => sendMessage(value)}
  isLoading={isLoading}
  placeholder="Ask me anything..."
  maxCharacters={1000}
  allowedMimeTypes={["text/plain", "application/pdf"]}
/>
```

---

### Content Display Components

#### 6. Code Block Component

Displays code with syntax highlighting.

```typescript
import { CodeBlock } from "@/components/ui/ai-elements/code-block";

<CodeBlock
  code={`function hello() {
  console.log("world");
}`}
  language="javascript"
  showLineNumbers={true}
  allowCopy={true}
  theme="dark"
  onCopy={() => navigator.clipboard.writeText(code)}
/>
```

#### 7. Image Component

Displays images with captions.

```typescript
import { Image } from "@/components/ui/ai-elements/image";

<Image
  src="https://example.com/image.jpg"
  alt="Example"
  caption="Generated image"
  width={400}
  height={300}
  allowDownload={true}
/>
```

#### 8. Artifact Component

Displays rich content (code, HTML, React components).

```typescript
import { Artifact } from "@/components/ui/ai-elements/artifact";

<Artifact
  type="code"
  content={`<div class="p-4 bg-blue-500">Hello World</div>`}
  language="html"
  title="HTML Preview"
  showCode={true}
  showPreview={true}
/>
```

#### 9. Web Preview Component

Renders web content in an iframe.

```typescript
import { WebPreview } from "@/components/ui/ai-elements/web-preview";

<WebPreview
  html={`<html><body><h1>Hello</h1></body></html>`}
  width={800}
  height={600}
  sandbox={true}
/>
```

#### 10. Sources Component

Display citations and sources.

```typescript
import { Sources } from "@/components/ui/ai-elements/sources";

<Sources
  sources={[
    {
      id: "src1",
      title: "Wikipedia",
      url: "https://en.wikipedia.org",
      excerpt: "World's largest encyclopedia",
    },
    {
      id: "src2",
      title: "Official Docs",
      url: "https://docs.example.com",
      excerpt: "Complete reference guide",
    },
  ]}
  onSourceClick={(source) => window.open(source.url)}
/>
```

#### 11. Inline Citation Component

Inline citations within text.

```typescript
import { InlineCitation } from "@/components/ui/ai-elements/inline-citation";

<div>
  According to recent studies<InlineCitation citationId="1" />,
  AI is transforming industries.
  <Sources citations={[{ id: "1", title: "Study", url: "#" }]} />
</div>
```

---

### Advanced AI Features

#### 12. Chain of Thought Component

Shows the AI's reasoning process.

```typescript
import { ChainOfThought } from "@/components/ui/ai-elements/chain-of-thought";

<ChainOfThought
  steps={[
    {
      step: 1,
      description: "Understanding the question",
      status: "completed",
    },
    {
      step: 2,
      description: "Searching for relevant information",
      status: "in_progress",
    },
    {
      step: 3,
      description: "Formulating the answer",
      status: "pending",
    },
  ]}
/>
```

#### 13. Reasoning Component

Displays multi-step reasoning.

```typescript
import { Reasoning } from "@/components/ui/ai-elements/reasoning";

<Reasoning
  reasoning={[
    "Step 1: Parse the input",
    "Step 2: Check constraints",
    "Step 3: Generate solution",
    "Step 4: Validate output",
  ]}
  expandable={true}
  collapsed={false}
/>
```

#### 14. Task Component

Shows progress of multi-step tasks.

```typescript
import { Task } from "@/components/ui/ai-elements/task";

<Task
  title="Generate Report"
  subtasks={[
    { title: "Collect data", completed: true },
    { title: "Analyze metrics", completed: true },
    { title: "Create visualizations", completed: false },
    { title: "Write summary", completed: false },
  ]}
  progress={50}
/>
```

#### 15. Plan Component

Displays execution plans.

```typescript
import { Plan } from "@/components/ui/ai-elements/plan";

<Plan
  planItems={[
    {
      id: "1",
      title: "Phase 1: Research",
      description: "Gather requirements",
      timeEstimate: "2 weeks",
    },
    {
      id: "2",
      title: "Phase 2: Design",
      description: "Create architecture",
      timeEstimate: "1 week",
    },
  ]}
/>
```

#### 16. Loader Component

Shows loading state with animations.

```typescript
import { Loader } from "@/components/ui/ai-elements/loader";

<Loader
  type="dots"
  message="AI is thinking..."
  size="medium"
/>
```

#### 17. Shimmer Component

Skeleton loader for content.

```typescript
import { Shimmer } from "@/components/ui/ai-elements/shimmer";

<Shimmer
  width="100%"
  height={20}
  count={3}
/>
```

#### 18. Branch Component

Shows decision branches in reasoning.

```typescript
import { Branch } from "@/components/ui/ai-elements/branch";

<Branch
  condition="Temperature > 20°C"
  trueBranch="Recommend outdoor activity"
  falseBranch="Recommend indoor activity"
/>
```

#### 19. Queue Component

Shows task queue.

```typescript
import { Queue } from "@/components/ui/ai-elements/queue";

<Queue
  items={[
    { id: "1", title: "Task 1", status: "processing" },
    { id: "2", title: "Task 2", status: "queued" },
  ]}
/>
```

#### 20. Context Component

Displays current context.

```typescript
import { Context } from "@/components/ui/ai-elements/context";

<Context
  items={{
    "User": "John Doe",
    "Group": "Engineering",
    "Project": "AI Platform",
  }}
/>
```

---

### Tool & Workflow Components

#### 21. Tool Component

Displays available tools.

```typescript
import { Tool } from "@/components/ui/ai-elements/tool";

<Tool
  name="Web Search"
  description="Search the internet"
  icon="🔍"
  onSelect={() => {}}
/>
```

#### 22. Actions Component

Display available actions.

```typescript
import { Actions } from "@/components/ui/ai-elements/actions";

<Actions
  actions={[
    { label: "Copy", onClick: () => {}, icon: "📋" },
    { label: "Share", onClick: () => {}, icon: "🔗" },
    { label: "Edit", onClick: () => {}, icon: "✏️" },
  ]}
/>
```

#### 23. Conversation Component

Full conversation container.

```typescript
import { Conversation } from "@/components/ui/ai-elements/conversation";

<Conversation
  id="conv-1"
  title="Project Discussion"
  messages={messages}
  onMessageAdd={(message) => {}}
/>
```

#### 24. Open In Chat Component

Links content to chat.

```typescript
import { OpenInChat } from "@/components/ui/ai-elements/open-in-chat";

<OpenInChat
  content="Summarize this document"
  onOpen={() => goToChat()}
/>
```

---

### Canvas & Visualization Components

#### 25. Node Component

Node in a graph/canvas.

```typescript
import { Node } from "@/components/ui/ai-elements/node";

<Node
  id="node-1"
  title="Start"
  position={{ x: 100, y: 100 }}
  onSelect={() => {}}
/>
```

#### 26. Edge Component

Connection between nodes.

```typescript
import { Edge } from "@/components/ui/ai-elements/edge";

<Edge
  from="node-1"
  to="node-2"
  label="depends on"
/>
```

#### 27. Connection Component

Visual connection.

```typescript
import { Connection } from "@/components/ui/ai-elements/connection";

<Connection
  source="node-1"
  target="node-2"
  animated={true}
/>
```

#### 28. Panel Component

Container for canvas controls.

```typescript
import { Panel } from "@/components/ui/ai-elements/panel";

<Panel position="top-left">
  <h3>Controls</h3>
  <button>Reset</button>
</Panel>
```

#### 29. Controls Component

Canvas control buttons.

```typescript
import { Controls } from "@/components/ui/ai-elements/controls";

<Controls
  onZoomIn={() => {}}
  onZoomOut={() => {}}
  onFit={() => {}}
  onReset={() => {}}
/>
```

#### 30. Toolbar Component

Toolbar for canvas operations.

```typescript
import { Toolbar } from "@/components/ui/ai-elements/toolbar";

<Toolbar
  items={[
    { label: "Select", icon: "✓", onClick: () => {} },
    { label: "Draw", icon: "✏️", onClick: () => {} },
    { label: "Delete", icon: "🗑️", onClick: () => {} },
  ]}
/>
```

---

## Fully Functional Chat UI (Infer 31-50)

### Complete Chat Component

```typescript
// src/components/features/AIChat/CompleteChatUI.tsx
import { useState } from "react";
import { useAIChat } from "@/lib/hooks/useAIChat";
import { Chatbot } from "@/components/ui/ai-elements/chatbot";
import { Message } from "@/components/ui/ai-elements/message";
import { Response } from "@/components/ui/ai-elements/response";
import { Suggestion } from "@/components/ui/ai-elements/suggestion";
import { PromptInput } from "@/components/ui/ai-elements/prompt-input";
import { CodeBlock } from "@/components/ui/ai-elements/code-block";
import { Artifact } from "@/components/ui/ai-elements/artifact";
import { ChainOfThought } from "@/components/ui/ai-elements/chain-of-thought";
import { Loader } from "@/components/ui/ai-elements/loader";
import { Sources } from "@/components/ui/ai-elements/sources";
import { Actions } from "@/components/ui/ai-elements/actions";

interface CompleteChatUIProps {
  groupId: string;
  agentId: string;
}

export function CompleteChatUI({ groupId, agentId }: CompleteChatUIProps) {
  const { messages, input, handleInputChange, isLoading, sendMessage } =
    useAIChat(groupId, agentId);

  const [showReasoning, setShowReasoning] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      handleInputChange({ target: { value: "" } } as any);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const suggestions = [
    "Explain how this works",
    "Give me an example",
    "What are the benefits?",
    "Show me the code",
  ];

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">AI Chat</h1>
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setShowReasoning(!showReasoning)}
        >
          {showReasoning ? "Hide" : "Show"} Reasoning
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Start a Conversation</h2>
              <p>Ask me anything or choose a suggestion below</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              onClick={() => setSelectedMessage(msg.id)}
            >
              <div
                className={`max-w-lg rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {/* Text Content */}
                <Message
                  role={msg.role}
                  content={msg.content}
                  timestamp={new Date(msg.createdAt || Date.now())}
                  isLoading={false}
                />

                {/* Code Block if Present */}
                {msg.metadata?.type === "code" && (
                  <CodeBlock
                    code={msg.metadata.code}
                    language={msg.metadata.language || "javascript"}
                    showLineNumbers={true}
                    allowCopy={true}
                    theme="dark"
                  />
                )}

                {/* Artifact if Present */}
                {msg.metadata?.type === "artifact" && (
                  <Artifact
                    type={msg.metadata.artifactType}
                    content={msg.metadata.content}
                    title={msg.metadata.title}
                    showCode={true}
                    showPreview={true}
                  />
                )}

                {/* Chain of Thought if Present */}
                {showReasoning && msg.metadata?.reasoning && (
                  <ChainOfThought
                    steps={msg.metadata.reasoning.steps}
                  />
                )}

                {/* Sources if Present */}
                {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                  <Sources sources={msg.metadata.sources} />
                )}

                {/* Message Actions */}
                {selectedMessage === msg.id && (
                  <Actions
                    actions={[
                      {
                        label: "Copy",
                        onClick: () => {
                          navigator.clipboard.writeText(msg.content);
                        },
                        icon: "📋",
                      },
                      {
                        label: "Share",
                        onClick: () => {
                          // Share message
                        },
                        icon: "🔗",
                      },
                      {
                        label: "Regenerate",
                        onClick: () => {
                          // Regenerate response
                        },
                        icon: "🔄",
                      },
                    ]}
                  />
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start">
            <Loader type="dots" message="AI is thinking..." />
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <Suggestion
          suggestions={suggestions}
          onSuggestionClick={(suggestion) => handleSendMessage(suggestion)}
        />
      )}

      {/* Input Area */}
      <div className="border-t pt-4">
        <PromptInput
          value={input}
          onChange={(value) => handleInputChange({ target: { value } } as any)}
          onSubmit={(value) => handleSendMessage(value)}
          isLoading={isLoading}
          placeholder="Ask me anything..."
          maxCharacters={2000}
        />
      </div>
    </div>
  );
}
```

### Astro Page Integration

```astro
---
// src/pages/chat/[threadId].astro
import Layout from "@/layouts/Layout.astro";
import CompleteChatUI from "@/components/features/AIChat/CompleteChatUI";
import { getThread } from "@convex-dev/client";

const { threadId } = Astro.params;

// Server-side data fetch
const thread = await getThread(threadId);

if (!thread) {
  return Astro.redirect("/chat");
}
---

<Layout title={thread.title}>
  <CompleteChatUI
    groupId={thread.groupId}
    agentId={thread.agentId}
    client:load
  />
</Layout>
```

---

## Styling & Theming (Infer 51-70)

### Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/@ai-elements/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ai-primary": "#3B82F6",
        "ai-secondary": "#10B981",
        "ai-accent": "#F59E0B",
      },
      spacing: {
        "chat-padding": "1rem",
        "message-gap": "0.5rem",
      },
      animation: {
        "pulse-subtle": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Custom Theme Provider

```typescript
// src/components/providers/AIElementsTheme.tsx
import { createContext, useContext } from "react";

interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  spacing: {
    padding: string;
    gap: string;
  };
}

const ThemeContext = createContext<Theme>({
  colors: {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
  },
  spacing: {
    padding: "1rem",
    gap: "0.5rem",
  },
});

export function AIElementsProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={/* theme */}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAITheme() {
  return useContext(ThemeContext);
}
```

### Dark Mode Support

```css
/* src/styles/ai-dark.css */
.dark {
  --ai-bg-primary: rgb(17 24 39 / 1);
  --ai-bg-secondary: rgb(31 41 55 / 1);
  --ai-text-primary: rgb(243 244 246 / 1);
  --ai-text-secondary: rgb(209 213 219 / 1);
  --ai-border: rgb(75 85 99 / 1);
}

.light {
  --ai-bg-primary: rgb(255 255 255 / 1);
  --ai-bg-secondary: rgb(249 250 251 / 1);
  --ai-text-primary: rgb(17 24 39 / 1);
  --ai-text-secondary: rgb(75 85 99 / 1);
  --ai-border: rgb(229 231 235 / 1);
}
```

---

## Integration with AI SDK & Convex (Infer 71-90)

### Hook for Complete Flow

```typescript
// src/lib/hooks/useCompleteChatFlow.ts
import { useChat } from "ai/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";

export function useCompleteChatFlow(groupId: string, agentId: string) {
  const [threadId, setThreadId] = useState<string>("");
  const [showReasoning, setShowReasoning] = useState(false);

  const createThread = useMutation(api.mutations.agentThreads.createThread);
  const sendMessage = useMutation(api.mutations.agentChat.sendMessage);
  const getThreadMessages = useQuery(api.queries.agentMessages.getThreadMessages,
    threadId ? { threadId } : "skip"
  );

  const { messages, input, handleInputChange, isLoading } = useChat({
    id: threadId || "new-thread",
  });

  const initializeChat = async () => {
    const newThreadId = await createThread({
      groupId,
      agentId,
      title: "New Conversation",
    });
    setThreadId(newThreadId);
  };

  const handleSubmit = async (content: string) => {
    if (!threadId) {
      await initializeChat();
    }

    await sendMessage({
      groupId,
      agentId,
      threadId: threadId || "",
      message: content,
    });
  };

  return {
    messages: getThreadMessages || [],
    input,
    handleInputChange,
    isLoading,
    handleSubmit,
    threadId,
    showReasoning,
    setShowReasoning,
  };
}
```

---

## Performance Optimization (Infer 91-100)

### Message Virtualization

```typescript
// src/components/features/AIChat/VirtualizedMessages.tsx
import { FixedSizeList as List } from "react-window";
import { Message } from "@/components/ui/ai-elements/message";

export function VirtualizedMessages({ messages }: { messages: any[] }) {
  return (
    <List
      height={600}
      itemCount={messages.length}
      itemSize={80}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <Message
            role={messages[index].role}
            content={messages[index].content}
            timestamp={new Date(messages[index].createdAt)}
          />
        </div>
      )}
    </List>
  );
}
```

### Lazy Loading Components

```typescript
import dynamic from "next/dynamic";

const CodeBlock = dynamic(
  () => import("@/components/ui/ai-elements/code-block"),
  { loading: () => <div>Loading...</div> }
);

const Artifact = dynamic(
  () => import("@/components/ui/ai-elements/artifact"),
  { loading: () => <div>Loading...</div> }
);
```

### Message Caching

```typescript
// src/lib/cache/messageCache.ts
const messageCache = new Map<string, any>();

export function getCachedMessage(id: string) {
  return messageCache.get(id);
}

export function setCachedMessage(id: string, message: any) {
  messageCache.set(id, message);
  // Auto-cleanup after 1 hour
  setTimeout(() => messageCache.delete(id), 3600000);
}
```

---

## Testing (Infer 101+)

### Component Tests

```typescript
// test/ai-elements/chatbot.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Chatbot } from "@/components/ui/ai-elements/chatbot";

test("renders chatbot with messages", () => {
  const messages = [
    { id: "1", role: "user", content: "Hello" },
    { id: "2", role: "assistant", content: "Hi there!" },
  ];

  render(
    <Chatbot
      messages={messages}
      onSubmit={() => {}}
      // ... other props
    />
  );

  expect(screen.getByText("Hello")).toBeInTheDocument();
  expect(screen.getByText("Hi there!")).toBeInTheDocument();
});

test("submits message on send", () => {
  const onSubmit = jest.fn();

  render(
    <Chatbot
      messages={[]}
      onSubmit={onSubmit}
      // ... other props
    />
  );

  const input = screen.getByRole("textbox");
  const button = screen.getByRole("button", { name: /send/i });

  fireEvent.change(input, { target: { value: "Test message" } });
  fireEvent.click(button);

  expect(onSubmit).toHaveBeenCalledWith("Test message");
});
```

---

## Component Import Reference

```typescript
// All AI Elements Components
export {
  // Chat Components
  Chatbot,
  Message,
  Response,
  Suggestion,
  PromptInput,
  Conversation,

  // Content Display
  CodeBlock,
  Image,
  Artifact,
  WebPreview,
  Sources,
  InlineCitation,

  // Advanced Features
  ChainOfThought,
  Reasoning,
  Task,
  Plan,
  Branch,
  Queue,
  Context,
  Loader,
  Shimmer,

  // Tools & Workflow
  Tool,
  Actions,
  OpenInChat,

  // Canvas & Visualization
  Node,
  Edge,
  Connection,
  Panel,
  Controls,
  Toolbar,
} from "@/components/ui/ai-elements";
```

---

## Feature Checklist

- [x] Install AI Elements
- [x] Set up all 30+ components
- [x] Create complete chat UI
- [x] Integrate with AI SDK hooks
- [x] Connect to Convex Agents
- [x] Style with Tailwind
- [x] Implement dark mode
- [x] Add message virtualization
- [x] Create custom hooks
- [x] Write tests
- [x] Optimize performance
- [x] Deploy to production

---

## Common Patterns

### Pattern: Message with Rich Content

```typescript
<Message
  role="assistant"
  content="Here's the solution:"
  metadata={{
    type: "code",
    code: "function hello() {...}",
    language: "javascript",
  }}
  timestamp={new Date()}
/>
```

### Pattern: Streaming Response

```typescript
const [streamingText, setStreamingText] = useState("");

const handleStream = async (prompt: string) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const text = decoder.decode(value);
    setStreamingText((prev) => prev + text);
  }
};
```

---

## Next Steps

1. Install AI Elements: `npx ai-elements@latest init`
2. Review all 30+ components
3. Build complete chat UI
4. Integrate with AI SDK
5. Connect to Convex Agents
6. Add custom theming
7. Test all features
8. Deploy to production
9. Monitor performance
10. Iterate based on user feedback

---

## References

- [AI Elements Documentation](https://ai-sdk.dev/elements/overview/setup)
- [AI Elements Components](https://ai-sdk.dev/elements)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)
- [AI SDK](./ai-sdk.md)
- [Convex Agents](./convex-agents.md)
