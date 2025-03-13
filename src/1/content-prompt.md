# Content Prompt System

## Overview

A simple system to include page content in chat system prompts.

## Implementation Plan

1. **Content Extraction**
   - Get raw content from markdown file
   - Strip frontmatter
   - Clean any special characters/formatting

2. **Configuration Options**
   ```yaml
   includeContent: true            # Enable/disable content inclusion
   contentPrefix: "Context:"       # Prefix for content section
   contentMaxLength: 2000         # Maximum content length
   ```

3. **Prompt Assembly Order**
   1. System prompt (if addSystemPrompt: true)
   2. Business prompt (if addBusinessPrompt: true)
   3. Page specific prompt (if systemPrompt exists)
   4. Content section (if includeContent: true)
      ```
      Context:
      [Cleaned page content here]
      ```

4. **Usage in Frontmatter**
   ```yaml
   ---
   layout: ../layouts/Text.astro
   title: Some Page
   description: Description
   includeContent: true
   contentPrefix: "Reference Material:"
   systemPrompt: "You are a helpful assistant..."
   ---
   ```

## Components to Update

1. `src/schema/chat.ts`
   - Add content handling options to schema
   - Update prompt assembly logic

2. `src/layouts/Text.astro`
   - Pass cleaned content to chat component
   - Handle content truncation

3. `src/components/Chat.tsx`
   - Use assembled prompt including content
   - Handle content updates

## Benefits
- Simple opt-in content inclusion
- Configurable per page
- Clear separation of concerns
- Easy to extend
