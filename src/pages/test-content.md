---
layout: ../layouts/Text.astro
title: Content Understanding Test
description: Testing AI's ability to understand and reference page content
aiProvider: mistral
aiModel: mistral-large-latest
apiEndpoint: https://api.openai.com/v1
temperature: 0.7
maxTokens: 4000
includeContent: true
contentPrefix: "### Reference Content:"
addSystemPrompt: true
addBusinessPrompt: true
systemPrompt: "You are a knowledgeable assistant who helps explain concepts. When answering questions, refer specifically to sections from the provided reference content. If the information isn't in the content, say so clearly. Always cite the relevant section when providing information."
welcomeMessage: "👋 I'm here to help you understand this content. What would you like to know?"
suggestions:
  - "What is the main topic of this content?"
  - "What are the key sections?"
  - "Can you summarize this content?"
---

# Understanding Content-Aware AI Chats

## Introduction

Content-aware AI chat systems combine the power of large language models with specific page content to provide more accurate and contextual responses. This approach ensures that the AI assistant can reference and explain the exact information present on the page.

## Key Components

1. **Content Integration**
   - Page content is automatically included in the system prompt
   - Content is properly formatted and truncated if needed
   - Special markers help the AI identify the content section

2. **Configuration Options**
   - Enable/disable content inclusion with `includeContent`
   - Customize content prefix with `contentPrefix`
   - Control maximum content length
   - Adjust system prompt for specific use cases

3. **Enhanced Responses**
   - AI can quote specific sections
   - References are accurate and verifiable
   - Clear distinction between content knowledge and general knowledge

## Best Practices

When using content-aware chats:

1. Keep content focused and relevant
2. Structure content with clear headings
3. Use descriptive section titles
4. Include important details you want the AI to reference

## Technical Implementation

The system works by:

1. Reading page content during render
2. Processing and cleaning the content
3. Including it in the system prompt
4. Configuring the AI to reference this content

This creates a seamless experience where the AI can discuss the specific details of each page while maintaining its general knowledge capabilities.