# Chat Content Integration

## Problem Identified

The system is not properly including page content in prompts:
```javascript
// Current output shows content issue
Chat component content type: string
Chat component content length: 15
Chat component content preview: [object Object]
```

## Solution

### 1. Content Processing in Text.astro
```typescript
// Get the raw content
const { frontmatter, content } = Astro.props;

// Process content properly
const rawContent = typeof content === 'object' 
  ? content.toString()
  : content;

// Clean content
const cleanContent = rawContent
  .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
  .trim();

// Pass to Chat component
<Chat 
  chatConfig={chatConfig} 
  content={cleanContent}
/>
```

### 2. Update Chat Component
```typescript
// src/components/Chat.tsx
interface ChatProps {
  chatConfig: ChatConfig;
  content: string;
}

// Log content properly
console.log('Content:', {
  type: typeof content,
  length: content.length,
  preview: content.substring(0, 100)
});

// Add content to system prompt
const systemPrompt = [
  chatConfig.systemPrompt,
  chatConfig.includeContent && {
    type: 'text' as const,
    text: `${chatConfig.contentPrefix || 'Content:'}\n${content}`
  }
].filter(Boolean);
```

### 3. API Integration
```typescript
// src/pages/api/chatsimple.ts
const messages = [
  {
    role: 'system',
    content: [
      ...systemPrompt,
      {
        type: 'text',
        text: config.includeContent 
          ? `${config.contentPrefix || 'Content:'}\n${config.content}`
          : ''
      }
    ].filter(text => text)
  }
];
```

## Implementation Steps

1. **Process Content First**
   - Convert content object to string
   - Remove frontmatter
   - Clean whitespace
   - Truncate if needed

2. **Update System Prompt**
   - Include base prompts (1.md, business.md)
   - Add page-specific prompt
   - Append cleaned content

3. **Send to API**
   - Combine all prompt parts
   - Include content section
   - Maintain proper structure

## Example Usage

```yaml
---
layout: ../layouts/Text.astro
title: Documentation
includeContent: true
contentPrefix: "Reference Material:"
systemPrompt: |
  You are a documentation expert.
  Use the following content to answer questions:
---

# Documentation Content

This content should be included in the prompt...
```

## Expected Output

```javascript
// Content logs should show:
Chat component content type: string
Chat component content length: 42
Chat component content preview: "# Documentation Content\n\nThis content should..."

// Final system message:
{
  role: 'system',
  content: [
    { type: 'text', text: '1.md content...' },
    { type: 'text', text: 'business.md content...' },
    { type: 'text', text: 'System prompt...' },
    { type: 'text', text: 'Reference Material:\n# Documentation Content...' }
  ]
}
```

## Debug Checklist

1. Check content object conversion
2. Verify frontmatter removal
3. Confirm content cleaning
4. Test prompt assembly
5. Validate API message structure