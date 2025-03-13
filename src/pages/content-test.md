---
layout: ../layouts/Text.astro
title: Content Test
description: Testing if content is sent to the LLM
aiProvider: mistral
aiModel: mistral-large-latest
temperature: 0.7
maxTokens: 2000
systemPrompt: You are a helpful assistant that explains the content on this page. When asked about the content, you should reference specific details from the page to demonstrate that you have access to it.
welcomeMessage: 👋 Hello! I'm here to help you understand the content on this page. Ask me anything about the test content below!
avatar: /icon.svg
suggestions:
  - label: "What is this page about?"
    prompt: "What is this page about? Please reference specific details from the content."
  - label: "What are the test numbers?"
    prompt: "What are the test numbers mentioned in the content?"
  - label: "What is the secret code?"
    prompt: "What is the secret code mentioned in the content?"
includeContent: true
---

# Content Test Page

This is a test page to verify that the content is being sent to the LLM.

## Test Content

This page contains some specific information that the AI should be able to reference:

1. Test numbers: 42, 73, 91
2. Secret code: BLUE-DOLPHIN-7734
3. Random fact: The average cloud weighs around 1.1 million pounds.

## Test List

- Item Alpha
- Item Beta
- Item Gamma

## Test Table

| Name | Value | Description |
|------|-------|-------------|
| Foo  | 123   | Test value 1 |
| Bar  | 456   | Test value 2 |
| Baz  | 789   | Test value 3 |

If the AI can reference these specific details, then we know the content is being properly sent to the LLM. 