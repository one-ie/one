---
title: Getting Started with ONE
description: Learn how to set up and start building with the ONE framework
date: 2024-02-02
tags:
  - agents
order: 1
---
**ONE Agent System - Software Documentation (Draft v0.1)**

**1. Introduction & System Overview**

*   **Purpose:** This document outlines the architecture, functionality, and workflow of the ONE Agent System. This system leverages a team of specialized AI agents, guided by the **Elevate Ecommerce Framework** and utilizing the **ONE AI Prompt Playbook**, to assist users (e.g., Ecom Owners, Marketers, Students) in navigating the customer journey and executing marketing/growth strategies.
*   **Core Concept:** Instead of a single general AI, the system employs a collaborative team of distinct AI agents, each with a specific role and expertise. These agents interact with the user and potentially each other, orchestrated by a lead agent (**Director**), to provide guidance and generate assets aligned with the Elevate Framework.
*   **Technology Stack:** Built using [Specify key frontend tech - e.g., Astro, React, TailwindCSS], connected to a [Specify key backend - e.g., Convex] backend for state management and AI orchestration, and leveraging AI models via [Specify primary API provider(s) - e.g., OpenAI, Anthropic, Google Gemini via appropriate APIs/SDKs].
*   **Deployment:** Successfully tested in local development environments and deployed via Vercel.

**2. System Architecture**

*   **Frontend (`/src`):**
    *   **UI Components (`/src/components/ui`):** Reusable Shadcn UI components for the interface.
    *   **Authenticated Views (`/src/components/authenticated`):** Components managing the main user experience, including:
        *   Chat Interface (`chat/`): Handles message display, input, agent/user mentions.
        *   Sidebar (`sidebar/`): Manages navigation between conversations, agent profiles.
        *   Agent Profiles (`agents/`): Displays information and potentially configuration for individual agents.
        *   Conversation Management (`conversations/`): Lists and handles conversation selection.
    *   **Unauthenticated Views (`/src/components/unauthenticated`):** Handles sign-in/sign-up flows.
    *   **State Management:** Primarily managed via Convex backend, with React hooks (`useQuery`, `useMutation`) for frontend interaction. Potentially uses React Context (`ChatContext`) for localized UI state.
    *   **Routing:** Handled by `type-route` (`/src/routes.ts`).
*   **Backend (`/convex`):**
    *   **Database Schema (`/convex/schema.ts`):** Defines tables for users, conversations, agents, participants, messages, etc. using Convex schema definitions.
    *   **Authentication (`/convex/auth.ts`, `auth.config.ts`):** Manages user authentication using `@convex-dev/auth`.
    *   **Core Logic (Mutations & Queries):** Functions organised by feature (e.g., `/convex/agents/mutations.ts`, `/convex/conversations/queries.ts`) handling data operations and business logic.
    *   **AI Agent Logic (`/convex/ai/`):**
        *   Contains internal actions and functions for processing messages, interacting with AI models, handling tool usage, managing history, and applying specific agent instructions/personalities.
        *   Orchestration likely involves internal actions calling specific AI generation functions (e.g., `agentReplyToMessage`, potentially new ones per agent role).
    *   **HTTP Endpoints (`/convex/http.ts`):** Handles any necessary webhooks or external API integrations.
*   **Shared Utilities (`/shared`):** Common functions and types (e.g., mentions parsing, tools definitions) used by both frontend and backend.

**3. The Agent Team Architecture**

The core innovation is the replacement of a generic "triage" agent with a more sophisticated team structure, led by a **Director**.

*   **3.1. Agent: Director (Lead Orchestrator)**
    *   **ROLE:** Chief Strategy Officer & Journey Conductor. Oversees the user's progress through the Elevate Framework.
    *   **OBJECTIVE:** To understand the user's overall goals, guide them sequentially through the framework steps (Foundation to SHARE), delegate specific tasks to appropriate specialist agents, and synthesize information for the user. Takes the place of the initial Triage concept but with broader strategic oversight.
    *   **INTERACTION:** Likely initiates conversations, asks clarifying questions about goals, introduces framework steps, calls upon other agents (@mentions), and summarizes progress. Monitors conversation flow for strategic coherence.
*   **3.2. Agent: Sage (Knowledge Base)**
    *   **ROLE:** Omniscient Internal Consultant. Possesses deep, structured knowledge of the user's specific **Foundation Blueprint** (Company, Market, Customer data painstakingly entered or analysed), Elevate Framework principles, Playbook contents (conceptually), relevant analytics, and potentially stakeholder information.
    *   **OBJECTIVE:** To provide **accurate, context-specific information** from the Foundation or framework knowledge base when requested by the user or other agents. Acts as the single source of truth for strategic context. Does *not* generate new creative content but retrieves and presents existing knowledge.
    *   **INTERACTION:** Primarily responds to direct queries (@Sage) about Foundation data ("What were Customer X's main pains?") or framework logic ("Remind me of the goal of the ENGAGE step"). May proactively offer relevant context if prompted by Director.
*   **3.3. Agent: Teacher (Framework Educator)**
    *   **ROLE:** Expert Instructor on the Elevate Framework and underlying marketing/CRO principles.
    *   **OBJECTIVE:** To explain the *concepts*, *strategies*, and *reasoning* behind each Elevate Framework step and associated best practices. Teaches the 'Why' and 'How'.
    *   **INTERACTION:** Activated by Director or user questions (@Teacher) asking for clarification on a framework step ("Can you explain the Value Equation for the SELL step?") or strategy ("Why is NURTURE important?"). Delivers educational content.
*   **3.4. Agent: Writer (Content Creator)**
    *   **ROLE:** Versatile Copywriter and Content Generator. Master of adapting **Brand Voice**.
    *   **OBJECTIVE:** To generate high-quality *draft* marketing assets (headlines, emails, descriptions, posts, scripts) based on specific ROCKET prompts incorporating Foundation context, typically triggered by prompts from the Playbook or instructions from the Director/Marketer.
    *   **INTERACTION:** Takes specific content generation requests (@Writer "Draft 3 HOOK headlines targeting Pain X using Y Brand Voice") and returns draft copy for user refinement.
*   **3.5. Agent: Marketer (Campaign Strategist)**
    *   **ROLE:** General Marketing Strategist, bridging framework steps and campaign execution.
    *   **OBJECTIVE:** To help translate framework objectives into actionable campaign ideas, suggest appropriate angles/tactics for specific steps (HOOK angles, GIFT ideas, NURTURE sequence themes), and potentially analyze high-level performance data provided by the user.
    *   **INTERACTION:** Works closely with Director. Responds to requests (@Marketer "Suggest 3 GIFT ideas for this audience pain") or proactively offers tactical suggestions within the context of a framework step discussion.
*   **3.6. Agent: Search Engine Optimiser (UK English Focus)**
    *   **ROLE:** SEO Specialist with expertise in keyword research, on-page optimization, and content strategy for organic visibility. **Always uses UK English spelling and grammar conventions.**
    *   **OBJECTIVE:** To provide SEO recommendations, generate SEO-focused content ideas/titles/meta descriptions, analyze keyword relevance (based on user-provided data/tools), and advise on optimizing website content for search engines within the context of specific Elevate steps (especially FIND elements in Foundation, HOOK for content titles, potentially GIFT/SELL pages).
    *   **INTERACTION:** Responds to specific SEO queries (@Search Engine Optimiser "Suggest keywords for HOOK content targeting X") or provides SEO feedback on drafted content. Emphasises UK English.
*   **3.7. Agent: Researcher (Information Gatherer)**
    *   **ROLE:** Targeted Information Retrieval Specialist (utilising *provided* browsing/scraping tools).
    *   **OBJECTIVE:** To execute specific, directed research tasks based on user/Director instructions (e.g., "Research competitor X's pricing page," "Find recent articles on trend Y," "Summarize discussion themes from provided forum link text") using the available tools. *Does not strategize, only fetches/summarizes based on explicit instruction.*
    *   **INTERACTION:** Takes direct research commands (@Researcher "Summarise the key points from this text about market trends: [Pasted Text]") and returns factual summaries or extracted data.
*   **3.8. Agent: Connector (Integration Specialist)**
    *   **ROLE:** Technical API and Workflow Specialist. Understands how different systems can integrate.
    *   **OBJECTIVE:** To (conceptually) handle interactions with external APIs (e.g., fetching analytics data *if integrated*, triggering actions in other tools *if integrated*) and explain technical integration possibilities or requirements between platforms (e.g., "Connecting your ESP to your CRM").
    *   **INTERACTION:** Responds to technical queries (@Connector "How can I pass lead data from my form to Klaviyo?") or executes pre-defined technical tasks/tool calls instructed by the Director.
*   **3.9. Agent: Seller (Conversion Closer)**
    *   **ROLE:** Persuasion and Conversion Optimization Specialist focused on the **SELL** and **ENGAGE** steps. Deep understanding of sales psychology and closing techniques.
    *   **OBJECTIVE:** To help craft highly persuasive sales copy, design effective calls-to-action, structure sales pages for maximum impact, and generate scripts/responses aimed directly at overcoming objections and closing the sale (for ENGAGE).
    *   **INTERACTION:** Activated during SELL/ENGAGE discussions (@Seller "Help refine this CTA," "Draft a response to the price objection"). Focuses purely on conversion elements.
*   **3.10. Agent: Media Buyer (Paid Traffic Specialist)**
    *   **ROLE:** Paid Advertising Campaign Strategist (Facebook Ads, Google Ads etc.).
    *   **OBJECTIVE:** To advise on ad campaign structures, targeting strategies, bid optimizations, and creative testing approaches relevant to the **HOOK** and **NURTURE** (Retargeting) steps. Analyzes user-provided ad performance data.
    *   **INTERACTION:** Responds to paid media queries (@Media Buyer "Suggest targeting for this HOOK campaign," "Analyze this ROAS data").
*   **3.11. Agent: Advocate (Community & Social Proof Builder)**
    *   **ROLE:** Customer Marketing and Brand Advocacy Specialist focused on the **SHARE** step.
    *   **OBJECTIVE:** To generate strategies and assets for encouraging reviews, testimonials, UGC, and referrals, and leveraging that social proof effectively.
    *   **INTERACTION:** Activated during SHARE discussions (@Advocate "Draft a review request email," "Suggest ways to showcase testimonials").
*   **3.12. Agent: Guide (User Journey Navigator)**
    *   **ROLE:** User Onboarding and Progress Tracker. Focused on user experience *within the ONE Agent system itself* and the customer's journey *through the Elevate framework*.
    *   **OBJECTIVE:** To orient the user within the framework, explain the current step, track progress (if system allows), clarify where the user/customer is in the overall journey, and guide them to the next logical step or resource. Knows where different stakeholders (user, their customer) are in the process.
    *   **INTERACTION:** Proactively offers guidance ("We just finished HOOK, next is GIFT..."), answers user questions about the framework process itself (@Guide "Where are we in the journey?", "What's the output needed for SELL?").
    * Okay, let's differentiate and define the roles and core functionalities of the **Teacher Agent** (for the course student using the ONE Playbook system) and the **Guide Agent** (conceptually representing the system guiding the *end customer* through the journey *implemented by the student*).

---

**Agent Profile: Teacher Agent**

*   **ROLE:** Expert Educator & Course Facilitator for the Elevate Ecommerce Framework & AI Prompt Playbook.
*   **OBJECTIVE:** To guide the **course student (the user of the ONE system)** sequentially through the Elevate Framework modules (0-9), explain concepts clearly, demonstrate AI prompt usage, answer questions about the framework/playbook, and ensure the student understands the objectives and required outputs for each step.
*   **TARGET USER:** The student enrolled in the "AI Prompt Playbook for Ecom Growth" course, interacting within the ONE Agent System.
*   **KEY INTERACTIONS & CAPABILITIES:**
    1.  **Module Introduction:** Introduce each module (Foundation, Hook, Gift, etc.), stating its objective and place within the framework.
    2.  **Concept Explanation:** Clearly explain the strategic principles, psychological concepts, and tactical importance of each framework step (e.g., "Explain the Value Equation as applied to the SELL step," "Why is IBB crucial for NURTURE?").
    3.  **Playbook Guidance:** Explain *how* to use specific AI prompts from the Playbook for the current step. Clarify *which* Foundation context is needed for *which* prompt. Demonstrate example prompt construction and refinement (potentially via pre-recorded snippets or textual examples).
    4.  **Process Clarification:** Answer student questions about the framework logic, the purpose of specific exercises/grids, or the expected outputs.
    5.  **Connecting Steps:** Explain how the outputs of the current step feed into the next step in the framework.
    6.  **Motivation & Encouragement:** Provide positive reinforcement and guidance if the student expresses difficulty or confusion.
*   **INTERACTION EXAMPLE (Student Query):** "@Teacher, I'm confused about how to apply my Brand Voice from the Foundation to the HOOK prompts."
    *   **Teacher Response:** "Great question! When using prompts like H1 (Pain-Focused Headlines), look for the part of the prompt that asks for Tone/Voice. Instead of just saying 'friendly,' input the *specific adjectives* you defined in your Company Context Grid (Foundation Module 0), like '[Adjective1, Adjective2]'. For example, instructing the AI to use a 'Confident and Direct' voice for a Pain hook will yield very different results than a 'Warm and Empathetic' voice. Let's try running H1 with *your* defined adjectives..."
*   **TOOLS (Conceptual):** Access to the Elevate Framework course content, examples, potentially the AI Prompt Playbook definitions (to explain usage, not just execute). *Does NOT execute creative prompts directly* (that's the Writer agent's job) but *explains how the student should use them*.

---

**4. Workflow & Orchestration**

*   **User Initiates:** User starts a conversation or project related to Ecom growth.
*   **Director Engages:** The Director agent greets the user, seeks to understand their primary goal, and introduces the relevant stage of the Elevate Framework (starting with Foundation if new).
*   **Task Delegation:** Based on the user's needs or the current framework step, the Director (or user directly) invokes specific specialist agents via @mentions.
    *   *Example:* Director: "@Sage, please retrieve the top 3 Customer Pains we identified for Avatar X." Sage responds. Director: "Okay, @Writer, using those pains and our [Authoritative] Brand Voice, draft 3 HOOK headline options for Facebook Ads." Writer responds.
*   **Information Retrieval:** Agents needing Foundation data query the @Sage agent.
*   **Asset Generation:** The @Writer or other specialized agents generate draft assets based on instructions and context.
*   **Guidance & Education:** The @Teacher explains concepts; the @Guide keeps the user oriented.
*   **Execution Support:** Agents like @Seller, @Media Buyer, @Search Engine Optimiser provide tactical advice for specific steps.
*   **User Refinement:** The user reviews all AI outputs, provides feedback (potentially using the @Rewriter agent concept), makes decisions, and performs the actual implementation in their external tools.
*   **Progression:** The @Director guides the user to the next logical step in the framework once tasks are complete.

**5. Key Technologies & Implementation Notes**

*   **Convex Backend:** Ideal for managing agent state, conversation history, potentially storing Foundation data linked to users/conversations, and orchestrating internal function calls between agent logic.
*   **Agent Identification & Mentioning:** Requires robust parsing (@mentions - as potentially implemented in `shared/mentions.ts`) and routing logic within Convex internal actions to invoke the correct agent's processing function.
*   **Agent Specialization:** Achieved through carefully crafted **Master System Prompts** for each agent role (like the examples we've written), defining their expertise, objectives, constraints, and how they use Foundation context.
*   **Context Management:** Leveraging potentially large context windows (like Gemini 1.5/2.5 Pro) or advanced RAG (Retrieval-Augmented Generation) via Convex Vector Search is crucial for the @Sage agent and for maintaining overall conversational context for the @Director and other agents.
*   **Tool Integration (Researcher/Connector):** Requires secure and robust mechanisms (Convex HTTP actions, potentially external services) for the AI to interact with external APIs or execute browsing/scraping tasks as directed. *This remains the most complex part to implement reliably and ethically.*

**6. Future Enhancements**

*   Visual progress tracking through the framework.
*   Direct integration with Ecom platforms/analytics for data retrieval/analysis (requires significant API work).
*   More sophisticated inter-agent collaboration protocols.
*   User-customizable agent personalities and toolsets.

**7. Conclusion**

The ONE Agent Team architecture transforms the application from a simple chatbot into a collaborative, multi-expert AI system designed to guide users systematically through the complexities of the Elevate Ecommerce Framework. Led by the strategic Director and supported by specialists like the Sage, Teacher, and Writer, this system aims to provide profound insights and accelerate the implementation of proven growth strategies.

---

This documentation provides a clear blueprint for the intended agentic system, outlining roles, workflow, and key considerations for development. Remember to keep this updated as the system evolves!