# Chat Implementation Guide

## Overview
The chat system uses frontmatter configuration to determine whether to:
1. Call an N8N webhook
2. Call the OpenRouter API

## Example Frontmatter Configurations

### 1. N8N Example (ai.md)
```yaml
---
layout: ../layouts/Chat.astro
title: AI Chat Demo
provider: n8n
apiEndpoint: https://n8n.agentc.app/webhook/chat
addSystemPrompt: true
addBusinessPrompt: true
systemPrompt: |
  You are ONE's AI assistant.
---
```

### 2. OpenRouter Example (index.astro)
```yaml
---
layout: ../layouts/Chat.astro
title: Chat with AI
provider: openrouter
model: google/gemini-2.0-flash-001
addSystemPrompt: true
addBusinessPrompt: false
systemPrompt: |
  Help users with their questions.
---
```

## System Files Used

1. System Prompts:
```
src/content/prompts/
├── system.md    # Base system instructions
└── business.md  # Business-specific instructions
```

2. API Routes:
```
src/pages/api/
├── n8n.ts       # Handles N8N webhook calls
└── chat.ts # Handles AI provider calls
```

3. Chat Library:
```
src/components/chat/
├── route.ts     # Routes based on provider
├── types.ts     # Type definitions
├── prompts.ts     # Assembles Prompt from business.md and system.md (if addSystemPrompt and add BusinessPrompt addContentToPrompt are true)
└── hooks/
    └── use-chat.ts # React hook
```

## Message Flow

1. User sends message
2. Check frontmatter provider
3. Route to appropriate API:
   - N8N: Sends to webhook with combined prompts
   - OpenRouter: Calls AI provider with combined prompts
4. Return response to chat interface

## Example Usage

```typescript
// In your page component:
const chatConfig = {
  provider: 'n8n', // or 'openrouter'
  apiEndpoint: 'https://your-webhook-url',
  addSystemPrompt: true,
  addBusinessPrompt: true,
  systemPrompt: 'Additional instructions'
};

<Chat chatConfig={chatConfig} />
```

The system automatically:
- Combines prompts from system.md and business.md if enabled
- Routes to correct endpoint based on provider
- Handles responses consistently