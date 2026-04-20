---
name: ai-elements
description: Build advanced AI UIs with agent reasoning, tool visualization, generative UI components, and composable AI Elements for agentic interfaces
---

# AI Elements - Advanced AI UI Components

Build production-ready agentic interfaces with reasoning traces, tool calls, generative UI, and composable AI Elements.

## Works With

| Skill      | Load when                                                                                 |
|------------|-------------------------------------------------------------------------------------------|
| `/react19` | AI Elements are React components — use Actions, `use()`, transitions for streaming.        |
| `/shadcn`  | Reasoning cards, tool-call blocks, message bubbles compose shadcn primitives + dark theme. |
| `/ai-sdk`  | Structured tool outputs (`generateObject` + Zod) feed the Tool/Reasoning display shapes.   |
| `/signal`  | Every tool-call button, approval gate, retry — emit `ui:<surface>:<action>` via `emitClick`. |
| `/astro`   | Chat pages that host agent UIs — pick hydration (`client:load` for interactive streams).   |

## When to Use This Skill

Use this skill when you need to:
- Build agentic interfaces with tool calling visualization
- Display AI reasoning traces and chain-of-thought
- Create generative UI that AI can dynamically render
- Implement multi-step workflows with progress indicators
- Show tool execution states and approvals
- Build chat interfaces with advanced agent features

## Core Concepts

### 1. Agentic UI
Interfaces that visualize autonomous agent behavior:
- **Tool Calls**: Display function calls and results
- **Reasoning Traces**: Show AI thinking process
- **Multi-Step Workflows**: Visualize agent planning
- **Approval Gates**: Request human confirmation

### 2. Generative UI
AI generates structured UI components dynamically:
- **Component Registry**: Map AI output to React components
- **Type-Safe Rendering**: Validate AI-generated structures
- **Dynamic Charts/Tables**: Render data visualizations
- **Interactive Elements**: Buttons, forms, products

### 3. AI Elements
Composable primitives for AI interfaces:
- **Conversation**: Auto-scrolling chat container
- **Message**: Formatted message bubbles
- **Tool**: Collapsible tool call display
- **Reasoning**: Expandable thinking traces
- **Loader/Shimmer**: Loading states

## Existing AI Components

### Chat Components

**ChatClient** (`/web/src/components/ai/ChatClient.tsx`)
```tsx
// Premium chat with agent features
import { ChatClient } from '@/components/ai/ChatClient';

<ChatClient
  client:only="react"
  apiEndpoint="/api/chat"
  initialMessages={[]}
/>
```

**Features:**
- Agent reasoning visualization
- Tool call display
- Model selector (50+ models)
- Extended message types (text, reasoning, tool_call, ui)
- Streaming support
- Premium indicators

### Tool System

**ToolSelector** (`/web/src/components/ai/ToolSelector.tsx`)
```tsx
import { ToolSelector } from '@/components/ai/ToolSelector';

const tools = [
  { id: 'web_search', name: 'Web Search', icon: <Search />, description: '...' },
  { id: 'google_sheets', name: 'Google Sheets', icon: <FileSpreadsheet />, ... },
  { id: 'weather', name: 'Weather', icon: <CloudSun />, ... },
  { id: 'create_chart', name: 'Create Chart', icon: <Table2 />, ... },
];

<ToolSelector
  selectedTool={selectedTool}
  onToolSelect={handleToolSelect}
/>
```

**ToolCall** (`/web/src/components/ai/ToolCall.tsx`)
Displays tool execution with states:
- `input-streaming`: Tool input being generated
- `input-available`: Ready to execute
- `approval-requested`: Awaiting human approval
- `output-available`: Completed successfully
- `output-error`: Execution failed

### Reasoning Components

**Reasoning** (`/web/src/components/ai/elements/reasoning.tsx`)
```tsx
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/components/ai/elements/reasoning';

<Reasoning isStreaming={isLoading} open={showReasoning}>
  <ReasoningTrigger />
  <ReasoningContent>
    {reasoningText}
  </ReasoningContent>
</Reasoning>
```

**Features:**
- Auto-opens when streaming starts
- Auto-closes after completion (with delay)
- Duration tracking
- Collapsible/expandable
- Markdown rendering with Streamdown

**Simple Reasoning** (`/web/src/components/ai/Reasoning.tsx`)
```tsx
import { Reasoning } from '@/components/ai/Reasoning';

const steps = [
  { step: 1, title: 'Analyzing request', description: '...', completed: true },
  { step: 2, title: 'Calling web search', description: '...', completed: true },
  { step: 3, title: 'Generating response', description: '...', completed: false },
];

<Reasoning steps={steps} />
```

## Generative UI Pattern

### Architecture

```
AI Model                  GenerativeUIRenderer              React Components
────────                  ────────────────────             ─────────────────
Generate JSON      →      Parse & Validate          →      Render Component
{                         switch(component)                <DynamicCard />
  component: "card",      case "card":                     <DynamicTable />
  data: {...}             return <DynamicCard />           <DynamicChart />
}                                                          etc.
```

### GenerativeUIRenderer

**Main Renderer** (`/web/src/components/generative-ui/GenerativeUIRenderer.tsx`)
```tsx
import { GenerativeUIRenderer } from '@/components/generative-ui/GenerativeUIRenderer';

interface UIPayload {
  component: 'chart' | 'table' | 'card' | 'form' | 'list' | 'timeline' | 'button' | 'product' | 'checkout';
  data: any;
  layout?: any;
}

const payload: UIPayload = {
  component: 'card',
  data: {
    title: 'Weather Update',
    description: 'Current conditions',
    content: '72°F, Sunny',
  },
};

<GenerativeUIRenderer payload={payload} />
```

### Available Dynamic Components

#### DynamicCard
```tsx
<GenerativeUIRenderer payload={{
  component: 'card',
  data: {
    title: 'Title',
    description: 'Subtitle',
    content: 'Content here',
    actions: [
      { label: 'View', variant: 'default' },
      { label: 'Share', variant: 'outline' },
    ],
  },
}} />
```

#### DynamicTable
```tsx
<GenerativeUIRenderer payload={{
  component: 'table',
  data: {
    headers: ['Name', 'Price', 'Stock'],
    rows: [
      ['Product A', '$29.99', '50'],
      ['Product B', '$49.99', '23'],
    ],
  },
}} />
```

#### DynamicChart
```tsx
<GenerativeUIRenderer payload={{
  component: 'chart',
  data: {
    type: 'bar' | 'line' | 'pie',
    data: [
      { name: 'Jan', value: 100 },
      { name: 'Feb', value: 150 },
    ],
    xKey: 'name',
    yKey: 'value',
  },
}} />
```

#### DynamicList
```tsx
<GenerativeUIRenderer payload={{
  component: 'list',
  data: {
    items: ['Item 1', 'Item 2', 'Item 3'],
    ordered: false,
  },
}} />
```

#### DynamicForm
```tsx
<GenerativeUIRenderer payload={{
  component: 'form',
  data: {
    fields: [
      { name: 'email', type: 'email', label: 'Email', required: true },
      { name: 'message', type: 'textarea', label: 'Message' },
    ],
    submitLabel: 'Send',
  },
}} />
```

#### DynamicProduct
```tsx
<GenerativeUIRenderer payload={{
  component: 'product',
  data: {
    title: 'Premium Coffee Mug',
    description: 'Hand-crafted ceramic mug',
    price: 29.99,
    originalPrice: 49.99,
    image: '/mug.jpg',
    rating: 4.5,
    reviewCount: 120,
    stock: 50,
    badge: 'Bestseller',
    category: 'Kitchen',
  },
  onAddToCart: (data, quantity) => {
    // Handle cart logic
  },
}} />
```

**Features:**
- Stripe checkout integration
- Quantity selector
- Stock tracking
- Reviews and ratings
- Discount badges
- Auto-checkout flow

#### DynamicCheckout
```tsx
<GenerativeUIRenderer payload={{
  component: 'checkout',
  data: {
    items: [
      { title: 'Product', price: 29.99, quantity: 2 },
    ],
    total: 59.98,
  },
}} />
```

#### DynamicTimeline
```tsx
<GenerativeUIRenderer payload={{
  component: 'timeline',
  data: {
    events: [
      { date: '2024-01-01', title: 'Event 1', description: '...' },
      { date: '2024-01-15', title: 'Event 2', description: '...' },
    ],
  },
}} />
```

#### DynamicButton
```tsx
<GenerativeUIRenderer payload={{
  component: 'button',
  data: {
    label: 'Click Me',
    variant: 'default' | 'outline' | 'destructive',
    onClick: () => console.log('clicked'),
  },
}} />
```

## AI Elements Library

### Conversation Elements

**Conversation** (`/web/src/components/ai/elements/conversation.tsx`)
```tsx
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai/elements/conversation';

<Conversation>
  <ConversationContent>
    {messages.map(msg => <Message key={msg.id} {...msg} />)}
  </ConversationContent>
  <ConversationScrollButton />
</Conversation>
```

**Features:**
- Auto-scrolling
- Scroll-to-bottom button
- Virtualization support

### Message Elements

**Message** (`/web/src/components/ai/elements/message.tsx`)
```tsx
import { Message, MessageContent, MessageActions, MessageAction } from '@/components/ai/elements/message';

<Message role="assistant">
  <MessageContent>
    {content}
  </MessageContent>
  <MessageActions>
    <MessageAction icon={<Copy />} onClick={handleCopy} />
    <MessageAction icon={<ThumbsUp />} onClick={handleLike} />
  </MessageActions>
</Message>
```

### Tool Elements

**Tool** (`/web/src/components/ai/elements/tool.tsx`)
```tsx
import { Tool, ToolHeader, ToolContent } from '@/components/ai/elements/tool';

<Tool>
  <ToolHeader
    title="web_search"
    type="tool-call"
    state="output-available"
  />
  <ToolContent>
    {toolResult}
  </ToolContent>
</Tool>
```

**States:**
- `input-streaming`: Pending
- `input-available`: Running
- `approval-requested`: Awaiting Approval
- `approval-responded`: Responded
- `output-available`: Completed
- `output-error`: Error
- `output-denied`: Denied

### Model Selector

**ModelSelector** (`/web/src/components/ai/elements/model-selector.tsx`)
```tsx
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorList,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
} from '@/components/ai/elements/model-selector';

<ModelSelector>
  <ModelSelectorTrigger>
    <ModelSelectorLogo model="claude-3-5-sonnet" />
    Claude 3.5 Sonnet
  </ModelSelectorTrigger>
  <ModelSelectorContent>
    <ModelSelectorList>
      <ModelSelectorGroup heading="Anthropic">
        <ModelSelectorItem value="claude-3-5-sonnet">
          Claude 3.5 Sonnet
        </ModelSelectorItem>
      </ModelSelectorGroup>
    </ModelSelectorList>
  </ModelSelectorContent>
</ModelSelector>
```

### Prompt Input

**PromptInput** (`/web/src/components/ai/elements/prompt-input.tsx`)
```tsx
import { PromptInput, PromptInputSpeechButton } from '@/components/ai/elements/prompt-input';

<PromptInput
  value={input}
  onChange={handleChange}
  onSubmit={handleSubmit}
  disabled={isLoading}
>
  <PromptInputSpeechButton />
</PromptInput>
```

### Loading Elements

**Loader** (`/web/src/components/ai/elements/loader.tsx`)
```tsx
import { Loader } from '@/components/ai/elements/loader';

<Loader />
```

**Shimmer** (`/web/src/components/ai/elements/shimmer.tsx`)
```tsx
import { Shimmer } from '@/components/ai/elements/shimmer';

<Shimmer />
```

### Task & Queue Elements

**Task** (`/web/src/components/ai/elements/task.tsx`)
Multi-step task visualization

**Queue** (`/web/src/components/ai/elements/queue.tsx`)
Task queue management

**Checkpoint** (`/web/src/components/ai/elements/checkpoint.tsx`)
Workflow checkpoints

## Complete Example: Agentic Chat Interface

```tsx
import { useState } from 'react';
import { useChat } from 'ai/react';
import { ChatClient } from '@/components/ai/ChatClient';
import { ToolSelector } from '@/components/ai/ToolSelector';
import { Reasoning } from '@/components/ai/elements/reasoning';
import { Tool } from '@/components/ai/elements/tool';
import { GenerativeUIRenderer } from '@/components/generative-ui/GenerativeUIRenderer';

export function AgenticChat() {
  const [selectedTool, setSelectedTool] = useState('none');
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: '/api/agent-chat',
    body: {
      tool: selectedTool,
    },
  });

  return (
    <div className="flex flex-col h-screen">
      {/* Tool Selector */}
      <div className="p-4 border-b">
        <ToolSelector
          selectedTool={selectedTool}
          onToolSelect={(tool) => setSelectedTool(tool.id)}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id}>
            {/* Regular message */}
            {msg.type === 'text' && (
              <div className={msg.role === 'user' ? 'text-right' : ''}>
                <div className="inline-block px-4 py-2 rounded-lg bg-muted">
                  {msg.content}
                </div>
              </div>
            )}

            {/* Reasoning trace */}
            {msg.type === 'reasoning' && (
              <Reasoning isStreaming={isLoading}>
                {msg.content}
              </Reasoning>
            )}

            {/* Tool call */}
            {msg.type === 'tool_call' && (
              <Tool>
                <ToolHeader
                  title={msg.toolName}
                  type="tool-call"
                  state={msg.state}
                />
                <ToolContent>
                  {JSON.stringify(msg.result, null, 2)}
                </ToolContent>
              </Tool>
            )}

            {/* Generative UI */}
            {msg.type === 'ui' && (
              <GenerativeUIRenderer payload={msg.payload} />
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Ask anything..."
        />
      </form>
    </div>
  );
}
```

## Best Practices

1. **Component Composition**: Use AI Elements as building blocks
2. **Type Safety**: Validate AI-generated UI payloads
3. **Progressive Disclosure**: Show reasoning/tools on demand
4. **Streaming Support**: Display partial results in real-time
5. **Error Handling**: Show friendly errors for failed tools
6. **Accessibility**: ARIA labels for tool states
7. **Loading States**: Use Shimmer for skeleton screens

## Integration with Convex

Store agent traces and tool calls:

```typescript
// Store reasoning trace
await ctx.db.insert('events', {
  groupId: user.groupId,
  type: 'agent_reasoning',
  actorId: user._id,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    steps: reasoningSteps,
    duration: 2.5,
  },
});

// Store tool call
await ctx.db.insert('events', {
  groupId: user.groupId,
  type: 'tool_executed',
  actorId: user._id,
  targetId: conversationId,
  timestamp: Date.now(),
  metadata: {
    toolName: 'web_search',
    input: { query: 'AI news' },
    output: { results: [...] },
    duration: 1.2,
  },
});
```

## Common Patterns

### Pattern 1: Tool-Enhanced Chat
```tsx
<ChatClient withTools={true} />
```

### Pattern 2: Reasoning-First Agent
```tsx
<Reasoning isStreaming={isLoading} defaultOpen={true}>
  {thinkingProcess}
</Reasoning>
```

### Pattern 3: Generative UI Response
```tsx
{message.type === 'ui' && (
  <GenerativeUIRenderer payload={message.payload} />
)}
```

### Pattern 4: Multi-Step Workflow
```tsx
<Task steps={workflowSteps} currentStep={2} />
```

## Related Files

- AI Components: `/web/src/components/ai/`
- AI Elements: `/web/src/components/ai/elements/`
- Generative UI: `/web/src/components/generative-ui/`
- Chat API: `/web/src/pages/api/chat.ts`

## Token Budget

- Metadata: ~100 tokens
- Instructions: ~2800 tokens
- Examples: ~1500 tokens
- Total: ~4400 tokens

---

**Version**: 1.0.0
**Last Updated**: 2025-12-12
**Maintained By**: AI Team
