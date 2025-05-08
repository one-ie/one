---
title: Features
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
tags:
  - agents
order: 1
---
Okay, here's the content for **Section 1: Introduction** based on the outline:

---

# Introduction

1.1. **Overview**

Agent Inbox is a dynamic, multi-agent AI chat application designed to provide a seamless conversational experience between users and multiple specialized AI agents. Built with a modern tech stack centered around Convex for the backend and React for the frontend, it offers a familiar inbox-style interface for complex interactions.

1.2. **Core Idea**

The fundamental concept behind Agent Inbox is to move beyond single-chatbot interactions. It provides a collaborative environment where users can engage with various AI agents, each potentially possessing unique personalities and toolsets, within persistent conversation threads. Users can direct tasks to specific agents using mentions (`@`), and agents can interact with each other, manage tasks, and proactively contribute to the conversation based on their capabilities and the flow of the discussion.

1.3. **Key Features**

*   **Real-time Multi-Participant Conversations:** Supports simultaneous chat between one or more users and multiple AI agents within the same conversation.
*   **Agent Management:** Users can create new AI agents, customize their name, description, personality, and assigned tools, view them in a dedicated list, and delete them. System agents (like the Triage agent) operate internally.
*   **Mention System:** Allows users and agents to directly address (`@`) specific users or other agents, triggering relevant actions or responses.
*   **AI Message Triage:** An internal "Triage" agent automatically analyzes incoming user messages without specific mentions and routes them to the most appropriate agent(s) based on context.
*   **Agent Tooling:** Agents can be equipped with various tools to perform actions beyond simple text generation, including:
    *   Web Searching (via Exa)
    *   Task Scheduling
    *   Sending Emails (via Resend)
    *   Listing conversation participants
    *   Listing available agents
    *   Updating conversation titles
    *   Adding other agents to the conversation
*   **User Authentication:** Secure sign-in and sign-up options using GitHub OAuth or traditional Email/Password.
*   **Modern & Responsive UI:** Built with shadcn/ui and Tailwind CSS for a clean, adaptable user interface across different screen sizes.
*   **Persistent Conversations:** Chat history is stored and easily accessible through the conversation list.

1.4. **Live Application**

You can access and interact with the live, deployed version of Agent Inbox here:
[https://agents.one.ie](https://agents.one.ie)

1.5. **Technology Stack**

*   **Backend & Database:** Convex (Serverless Platform, Realtime Database, TypeScript SDK)
*   **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui
*   **Authentication:** `@convex-dev/auth` library (GitHub & Password providers)
*   **AI:** Vercel AI SDK (`ai`, `@ai-sdk/openai`), OpenAI API (GPT-4o)
*   **Tooling APIs:** Exa API (Web Search), Resend API (Email)
*   **Routing:** `type-route`
*   **Utilities:** `convex-helpers`, `zod`, `date-fns`, `react-mentions`, `react-markdown`

---