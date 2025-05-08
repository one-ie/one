---
title: Analytics
description: Elevate KPIs
date: 2024-02-02
tags:
  - agents
order: 1
---


---

**Proposed Convex Schema: ONE Agent System (Elevate Focus)**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server"; // If using convex/auth

// --- Reusable Validators ---

// Elevate Framework Steps (Used for linking content/prompts)
const elevateStepValidator = v.union(
  v.literal("Foundation"), v.literal("Hook"), v.literal("Gift"),
  v.literal("Identify"), v.literal("Engage"), v.literal("Sell"),
  v.literal("Nurture"), v.literal("Upsell"), v.literal("Educate"),
  v.literal("Share")
);

// --- People & Groups ---

export const persons = defineTable({
  // As defined previously: Links to users table, stores human details.
  userId: v.optional(v.id("users")),
  name: v.string(),
  email: v.optional(v.string()),
  role: v.optional(v.string()), // e.g., "Student", "Admin" within ONE system
  organizationId: v.optional(v.id("organizations")),
  avatarUrl: v.optional(v.string()),
  metadata: v.optional(v.any()),
})
  .index("by_userId", ["userId"])
  .index("by_organization", ["organizationId"]);

export const organizations = defineTable({ // Your "groups" concept
  name: v.string(),
  ownerUserId: v.id("users"),
  // Add subscription, settings, etc.
}).index("by_owner", ["ownerUserId"]);

// Users table (Leveraging Convex Auth standard or your definition)
// Assuming standard `authTables` for now
// export const users = defineTable({ ...authTables.users.validator.fields });

// --- Agents & Tools ---

const commonAgentFields = { /* ... as defined previously ... */
  name: v.string(),
  description: v.string(),
  personality: v.string(),
  avatarUrl: v.string(),
  tools: v.optional(v.array(v.string())), // List of tool names
  lastActiveTime: v.optional(v.number()),
  baseInstructions: v.optional(v.string()),
  configuration: v.optional(v.any()),
};

const systemAgentRoleValidator = v.union( /* ... Director, Sage, Teacher, etc. ... */
  v.literal("Director"), v.literal("Sage"), v.literal("Teacher"),
  v.literal("Writer"), v.literal("Marketer"), v.literal("SEO"),
  v.literal("Researcher"), v.literal("Connector"), v.literal("Seller"),
  v.literal("MediaBuyer"), v.literal("Advocate"), v.literal("Guide")
);

export const agents = defineTable( // Single table for all AI agent types
  v.union(
    // Agents created by users (Trainable potentially)
    v.object({
      kind: v.literal("user_agent"),
      createdBy: v.id("users"),
      organizationId: v.optional(v.id("organizations")),
      ...commonAgentFields
    }),
    // System agents performing specific Elevate-related roles
    v.object({
      kind: v.literal("system_agent"),
      systemRole: systemAgentRoleValidator, // Key discriminator
      // Role specific fields if needed, e.g.
      ukEnglishFocus: v.optional(v.boolean()), // For SEO agent
      ...commonAgentFields
    })
  )
).index("by_creator_kind", ["createdBy", "kind"])
 .index("by_systemRole_kind", ["systemRole", "kind"]);

// Optional: Separate table if tool definitions get complex or need management
export const tools = defineTable({
  name: v.string(), // Tool name (e.g., "webSearch", "scheduleTask")
  description: v.string(),
  parametersSchema: v.any(), // Could store Zod schema definition as JSON string/object
  requiresConfiguration: v.boolean(), // Does user need to set API keys etc.?
}).index("by_name", ["name"]);

// --- LEARN: Course / Playbook Structure ---

export const playbookPrompts = defineTable({ // The TRAIN component
  elevateStep: elevateStepValidator,
  promptCode: v.string(), // e.g., "H1", "G3"
  title: v.string(),
  description: v.string(),
  rocketTemplate: v.string(), // Store the ROCKET template structure
  requiredContext: v.array(v.string()), // e.g., "Customer Pain"
  outputType: v.string(), // e.g., "List", "Email Draft"
  // Example usage snippets might be stored here too
}).index("by_elevateStep", ["elevateStep"])
  .index("by_promptCode", ["promptCode"]); // Allow easy lookup

export const courseModules = defineTable({ // Structure for the LEARN pathway
  moduleNumber: v.union(v.number(), v.literal(0)), // 0 for Foundation
  elevateStep: elevateStepValidator,
  title: v.string(),
  objective: v.string(),
  // Fields to link/embed LEARN content blocks:
  videoBlockId: v.optional(v.id("blocks")), // Link to primary video block
  textSummaryBlockId: v.optional(v.id("blocks")), // Link to text summary block
  gridBlockId: v.optional(v.id("blocks")), // Link to the grid explanation block
  // ... links to other core component blocks
}).index("by_moduleNumber", ["moduleNumber"])
  .index("by_elevateStep", ["elevateStep"]);

// --- User Specific State & Data (Elevate Implementation) ---

export const userFoundations = defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  // Store the *user's specific answers* to the Foundation Grids
  companyContext: v.optional(v.any()), // Could be object matching grid structure
  marketAwareness: v.optional(v.any()), // Could be object matching grid structure
  customerAvatar: v.optional(v.any()), // Could be object matching grid structure
  // Maybe store FIND strategy outputs here:
  prioritizedChannels: v.optional(v.array(v.string())),
  lastUpdatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_organization", ["organizationId"]);

// Could combine prompt executions & generated assets with your 'blocks' concept
// Or keep them separate for clarity depending on how complex blocks get

// Option A: Keeping User Generated Assets separate
export const userGeneratedAssets = defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  promptExecutionId: v.optional(v.string()), // ID from AI interaction log
  elevateStep: elevateStepValidator,
  assetType: v.string(), // e.g., "Ad Headline", "Email Body", "Nurture Outline"
  content: v.string(),   // The refined, final text content
  status: v.union(v.literal("Draft"), v.literal("Implemented")),
  createdAt: v.number(),
}).index("by_user_step", ["userId", "elevateStep"]);

// Option B: Using a 'blocks' table like your example for EVERYTHING
// Zod schema for content types - MUST be kept in sync
// NOTE: Storing EVERYTHING here could become complex to query/manage if types diverge heavily.
const textBlockContentValidator = v.object({ /*...*/ });
const imageBlockContentValidator = v.object({ /*...*/ });
const aiPromptInputContentValidator = v.object({ /* Prompt details */ });
const aiResponseContentValidator = v.object({ /* AI output details */ });
const courseVideoContentValidator = v.object({ /* video URL, transcript ID? */ });
const frameworkGridContentValidator = v.object({ /* grid data/image URL */ });
// ... Add validators for ALL your content types (including Playbook prompts, generated assets etc.)

const blockContentValidator = v.discriminatedUnion("contentType", [
  v.object({ contentType: v.literal("Plain Text"), content: textBlockContentValidator }),
  v.object({ contentType: v.literal("Rich Text"), content: v.any() }), // For complex text
  v.object({ contentType: v.literal("Image"), content: imageBlockContentValidator }),
  v.object({ contentType: v.literal("Video"), content: courseVideoContentValidator }),
  v.object({ contentType: v.literal("Prompt Template"), content: v.object({ rocketTemplate: v.string(), promptCode: v.string() }) }), // Playbook Prompt Block
  v.object({ contentType: v.literal("Foundation Input"), content: v.any() }), // User's Foundation Grid Answers
  v.object({ contentType: v.literal("Generated Asset Draft"), content: v.object({ elevateStep: elevateStepValidator, assetType: v.string(), text: v.string() }) }), // AI output block
  v.object({ contentType: v.literal("Refined Asset"), content: v.object({ elevateStep: elevateStepValidator, assetType: v.string(), text: v.string() }) }), // Final asset block
  // ... many more block types
]);

export const blocks = defineTable({
  userId: v.optional(v.id("users")),        // Creator or associated user
  organizationId: v.optional(v.id("organizations")), // Group ownership
  pageId: v.optional(v.id("pages")),        // Link to a specific page/screen/module view
  parentBlockId: v.optional(v.id("blocks")),// For hierarchical structures
  blockType: v.string(),                   // High-level type from BlockTypeEnum concept (e.g., "LEARN", "TRAIN", "OUTPUT")
  contentType: v.string(),                 // Specific content type from the discriminated union key
  content: blockContentValidator,         // The structured content using discriminated union
  order: v.optional(v.number()),           // Order within a page/parent
  metadata: v.optional(v.any()),           // Timestamps, permissions, tags, elevateStep links etc.
  // Links array for relationships (like your example) could be added here if needed
  links: v.optional(v.array(v.id("blocks"))),
}).index("by_page", ["pageId", "order"])
  .index("by_user", ["userId", "blockType"])
  .index("by_organization", ["organizationId", "blockType"])
  .index("by_parent", ["parentBlockId"]);

export const pages = defineTable({ // Corresponds to your "screens"
  title: v.string(),
  userId: v.id("users"), // Author/Owner
  organizationId: v.optional(v.id("organizations")),
  pageType: v.string(), // e.g., "Course Module", "Foundation Workspace", "Agent Config"
  // Defines which blocks make up this page view
  layoutBlockIds: v.optional(v.array(v.id("blocks"))), // Sequence of top-level blocks on the page
  metadata: v.optional(v.any()), // Published status, slug etc.
}).index("by_user_type", ["userId", "pageType"])
  .index("by_organization_type", ["organizationId", "pageType"]);

// Schema Definition
export default defineSchema({
  ...authTables, // Includes the 'users' table
  persons,
  agents,
  organizations,
  tools, // Optional tools table
  playbookPrompts, // Specific to defining prompts
  courseModules, // Specific to defining course structure
  userFoundations, // User-specific strategic input
  // EITHER use separate userGeneratedAssets OR integrate into 'blocks'
  // userGeneratedAssets,
  blocks, // The core content/data/asset table using discriminated unions
  pages, // Represents screen views / documents composed of blocks
  userModuleProgress,
  userFunnelSnapshots, // Conceptual Ecom Data
});
```

**Explanation of Changes and Structure:**

1.  **Core Entities:** `persons` (humans), `users` (auth accounts, from authTables), `organizations` (your 'groups'), `agents` (user & system AI).
2.  **LEARN Structure (`courseModules`):** Defines the structure of the Elevate course. Instead of storing content directly, it *links* to specific `blocks` (using `pageId` on the blocks table or specific fields like `videoBlockId`) that hold the actual video, text, grid definitions etc. This makes the course content itself block-based and potentially reusable.
3.  **TRAIN Structure (`playbookPrompts`):** Specifically defines the *template* for each AI prompt within the Playbook using the ROCKET structure. These are static definitions.
4.  **FOUNDATION Data (`userFoundations`):** Holds the user's specific answers/inputs related to the Foundation Grids. This is crucial context.
5.  **Universal `blocks` Table (Inspired by your structure):**
    *   This attempts to unify different content types using a `blockType` (high-level category like 'LEARN', 'TRAIN', 'FOUNDATION_INPUT', 'AI_OUTPUT') and a `contentType` (specific format like 'Text', 'Image', 'PromptResult') with a `content` field validated by a **large Zod discriminated union (`blockContentValidator`)**.
    *   **Pros:** Potentially very flexible, everything is a "block". Allows complex relationships via `parentBlockId` or a `links` array.
    *   **Cons:** The `blockContentValidator` becomes *massive* and complex to maintain. Querying for specific *types* of information requires filtering on `blockType` or `contentType`, which might be less efficient than dedicated tables for highly structured data like prompt executions or user assets. **Decide if this unification is worth the complexity vs. keeping some distinct tables like `userGeneratedAssets`**.
6.  **`pages` Table (Your `screens`):** Defines a specific view or document composed of an ordered layout of `blocks`. This could represent a course module page, a user's foundation workspace, an agent configuration screen, etc.
7.  **Agent Schema (`agents`):** Clearly defines `user_agent` vs. `system_agent` and uses `systemRole` with `v.literal` for specific roles (Director, Teacher, Guide, etc.).
8.  **Tool Schema (`tools`):** Added optionally if tool definitions become complex or need to be managed dynamically.

**Which `blocks` approach?**

*   **Option A (Separate Tables - Easier Start):** Keep `userGeneratedAssets`, `userPromptExecutions` as separate tables. Use `blocks` mainly for *content* like course text, images, user notes, maybe Foundation grid *visuals*. This is simpler to query initially.
*   **Option B (Unified `blocks` - More Flexible/Complex):** Go all-in on the `blocks` table for nearly everything, using `blockType` and `contentType` discriminators. Requires meticulous definition of the `blockContentValidator` Zod schema but allows for highly flexible structures.

This schema provides a comprehensive starting point inspired by your structure, adapted for Convex, and incorporating the key elements for your ONE Agent System focused on the Elevate Playbook. Choose the `blocks` approach that best suits your expected complexity and querying needs.

Okay, that's a key feature – enabling **multi-user and multi-agent collaboration within conversations**, restricted by group membership. This significantly impacts the `conversations`, `conversationParticipants`, and potentially how agents are invoked.

Let's refine the schema and conceptual logic to support this:

**1. Schema Refinements:**

*   **`conversations` Table:** Needs to be linked to a `groupId`. Only users/agents within that group can potentially participate.
*   **`conversationParticipants` Table:**
    *   Needs robust handling for *both* `userId` (linking to `auth.users`) and `agentId`. A participant is *either* a user *or* an agent within that conversation context.
    *   Should store the `groupId` for easier RLS and querying (denormalization).
    *   Might need a status like `invited` vs. `active`.
*   **`agents` Table:** Should also be linked to a `groupId` (unless system agents are global or belong to a special "system group"). User-created agents definitely belong to a group.
*   **`persons` Table:** The link to `organizationId` (which we're calling `groupId`) becomes crucial for checking membership before allowing invites.

**Revised Convex Schema incorporating Group-Based Conversation Membership:**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// --- Reusable Validators ---
const elevateStepValidator = v.union( /* ... as before ... */ );

// --- People, Groups (Organizations), Users ---
export const organizations = defineTable({ // Represents a Group/Team/Tenant
  name: v.string(),
  ownerUserId: v.id("users"),
}).index("by_owner", ["ownerUserId"]);

export const persons = defineTable({
  userId: v.optional(v.id("users")), // Link to login account
  name: v.string(),
  email: v.optional(v.string()),
  organizationId: v.optional(v.id("organizations")), // **** LINK TO GROUP ****
  roleInOrg: v.optional(v.string()), // e.g., "Member", "Admin" of the org
  avatarUrl: v.optional(v.string()),
})
  .index("by_userId", ["userId"])
  .index("by_organization", ["organizationId"]); // ** Allows finding all people in a group

// --- Agents & Tools ---
const commonAgentFields = { /* ... as before ... */ };
const systemAgentRoleValidator = v.union( /* ... Director, Sage, etc. ... */ );

export const agents = defineTable(
  v.union(
    // User-Created Agents (Belong to a Group)
    v.object({
      kind: v.literal("user_agent"),
      createdBy: v.id("users"),
      organizationId: v.id("organizations"), // **** MUST BELONG TO A GROUP ****
      ...commonAgentFields
    }),
    // System Agents (May be global or belong to a system group/all groups)
    v.object({
      kind: v.literal("system_agent"),
      systemRole: systemAgentRoleValidator,
      // Decide if system agents need an org link or are globally accessible
      // organizationId: v.optional(v.id("organizations")),
      ...commonAgentFields
    })
  )
).index("by_creator_kind", ["createdBy", "kind"])
 .index("by_systemRole_kind", ["systemRole", "kind"])
 .index("by_organization", ["organizationId", "kind"]); // **** Find agents in a specific group ****

// --- Conversations & Participation ---
export const conversations = defineTable({
  title: v.string(),
  createdBy: v.id("users"),        // User who initiated
  organizationId: v.id("organizations"), // **** Conversation belongs to a GROUP ****
  lastMessageTime: v.number(),
  // Metadata for Elevate context? e.g., linkedElevateStep: v.optional(elevateStepValidator)
}).index("by_organization_user_time", ["organizationId", "createdBy", "lastMessageTime"]);

export const conversationParticipants = defineTable({
  conversationId: v.id("conversations"),
  organizationId: v.id("organizations"), // **** Denormalized Group ID for easier RLS/queries ****
  participantType: v.union(v.literal("user"), v.literal("agent")), // Clear discriminator
  userId: v.optional(v.id("users")),     // Link to auth user IF type is 'user'
  personId: v.optional(v.id("persons")),  // Link to person record IF type is 'user'
  agentId: v.optional(v.id("agents")),    // Link to agent IF type is 'agent'
  status: v.union(v.literal("invited"), v.literal("active"), v.literal("thinking"), v.literal("removed")),
  addedAt: v.number(),
  addedBy: v.optional(v.id("users")), // User who invited this participant
})
  .index("by_conversation", ["conversationId", "status"])
  .index("by_organization_conversation", ["organizationId", "conversationId"]) // Find all participants in a group's convo
  .index("by_user_in_conversation", ["userId", "conversationId"])   // Check if specific user is participant
  .index("by_agent_in_conversation", ["agentId", "conversationId"]); // Check if specific agent is participant

// --- Messages ---
export const conversationMessages = defineTable({
  conversationId: v.id("conversations"),
  organizationId: v.id("organizations"),      // **** Denormalized Group ID for RLS ****
  authorParticipantId: v.id("conversationParticipants"), // Who sent it
  content: v.string(),                         // The message text, potentially with @mentions
  kind: v.union(v.literal("participant"), v.literal("system")),
  mentions: v.optional(v.array(v.object({ // Store parsed mentions for easier processing
    kind: v.union(v.literal("user"), v.literal("agent")),
    id: v.string(), // Store the actual User ID or Agent ID
    display: v.string(),
  }))),
  metadata: v.optional(v.any()),              // System message details, tool calls etc.
}).index("by_conversation", ["conversationId"]);


// --- Other Tables (Keep as is unless relation needed) ---
// playbookPrompts, courseModules, userFoundations,
// userGeneratedAssets / blocks, pages, userModuleProgress, userFunnelSnapshots

// Schema Definition
export default defineSchema({
  ...authTables, // Includes 'users' table
  persons,
  organizations,
  agents,
  conversations,
  conversationParticipants,
  conversationMessages,
  // ... other Elevate specific tables
  playbookPrompts,
  courseModules,
  userFoundations,
  userGeneratedAssets, // Or integrate into blocks
  pages,
  userModuleProgress,
  userFunnelSnapshots,
});
```

**2. Key Logic/Mutations Needed for Invites:**

*   **`inviteUserToConversation(conversationId, targetPersonEmail)` Mutation:**
    *   Checks if the *inviting user* has permission within the `conversation.organizationId`.
    *   Finds the `persons` record for `targetPersonEmail`.
    *   Checks if the `targetPerson.organizationId` matches the `conversation.organizationId`. **Crucial security check.**
    *   Checks if the person (by `userId` or `personId`) isn't already an active participant.
    *   Creates a `conversationParticipants` entry with `status: "invited"`, linking `personId` and potentially `userId` if found.
    *   (Optional) Sends an invitation email/notification.
*   **`inviteAgentToConversation(conversationId, targetAgentId)` Mutation:**
    *   Checks inviter permissions.
    *   Fetches the `agents` record for `targetAgentId`.
    *   Checks if the `agent.organizationId` matches `conversation.organizationId` (or if it's a global system agent allowed in any org). **Crucial security check.**
    *   Checks if the agent isn't already active.
    *   Creates a `conversationParticipants` entry with `status: "invited"` (or potentially `active` immediately if agent auto-accepts) linking `agentId`.
*   **`acceptConversationInvite(conversationId)` Mutation:**
    *   Called by an invited *user* upon clicking an invite link/button.
    *   Verifies the user has a pending `invited` status for that `conversationId`.
    *   Updates the participant status to `"active"`.
    *   Potentially adds a system message: "[User Name] accepted the invite and joined."
*   **Agent Activation via @Mention:**
    *   When a message includes `@AgentName`, the backend logic (likely an internal action processing the message) finds the corresponding `agentId`.
    *   It checks if that `agentId` has a participant record for that `conversationId`.
    *   If the status is `"invited"`, it might automatically change it to `"active"` upon first valid mention.
    *   It then triggers the appropriate agent logic (e.g., `agentReplyToMessage`).

**3. Security & Permissions (RLS in Convex / Backend Logic):**

*   **Conversations:** Users should only be able to list/read conversations belonging to their `organizationId`. Create access requires org membership.
*   **Participants:** Users should only be able to list participants for conversations they are also a participant in *and* belong to the same `organizationId`. Inviting requires permissions within the organization.
*   **Messages:** Users should only read messages in conversations they are an active participant of *and* belong to the correct `organizationId`. Writing requires active participation status.
*   **Agents:** Users can list/manage agents belonging to *their* `organizationId` (or system agents if applicable).

**How this Stimulates Conversation:**

*   **Direct Invites:** Users can explicitly pull relevant team members (other users) or specialized AI agents into a conversation where their input is needed.
*   **@Mention Activation:** Agents mentioning other agents automatically brings them into the loop if they weren't already active, facilitating cross-functional AI collaboration.
*   **Group Context:** Keeping conversations within a group ensures discussions stay relevant to that team's context, data (via Sage), and objectives.
*   **Reduced Silos:** Allows blending human expertise and specialized AI capabilities within a single conversational thread focused on a specific task or Elevate Framework step.

This refined schema and logic provide the foundation for a collaborative multi-user, multi-agent chat system constrained by group membership, directly enabling the kind of dynamic conversations you envisioned.

Okay, let's outline a potential **Development Plan** starting from where your project seems to be (local setup working, deployed to Vercel, core Convex backend/React frontend established, considering agent teams) and moving towards implementing the sophisticated ONE Agent System integrated with the Elevate Framework.

This plan assumes an iterative approach, prioritizing core functionality and progressively adding complexity and agent capabilities.

**Current State Assumptions:**

*   Functional local development environment for Vite + Convex.
*   Successful deployment pipeline to Vercel.
*   Basic Convex schema exists (users, conversations, maybe initial agents/messages).
*   Frontend components for chat UI exist (possibly needing refinement for multi-agent).
*   Basic authentication is working (e.g., via `@convex-dev/auth`).
*   The concepts for the Elevate Framework, AI Prompt Playbook, and the specialized Agent Team are well-defined (as we've discussed).

---

**ONE Agent System - Development Plan (Phased Approach)**

**Phase 1: Foundational Refinement & Core Agent Implementation (Estimate: 2-4 Weeks)**

*   **Goal:** Solidify the database schema, implement basic agent interaction, and ensure the FOUNDATION module context can be stored and retrieved.
*   **Key Tasks:**
    1.  **Schema Finalization:**
        *   Implement the refined Convex schema we designed (`organizations`, `persons`, updated `agents` with system roles, updated `conversations`, `conversationParticipants` with group links & participant types, potentially `userFoundations` structure). Use `npx convex dev` to push schema changes.
        *   Define appropriate Convex database indexes for efficient querying (as discussed in schema).
    2.  **Foundation Data Storage:**
        *   Develop frontend UI (likely within authenticated section, perhaps a dedicated "Foundation" page/workspace) for users to input and manage their Company Context, Market Awareness, and Customer Avatar data (populating the `userFoundations` table).
        *   Write Convex mutations (`userFoundations/mutations.ts`) to save/update this data securely, linked to the `userId` and `organizationId`.
    3.  **Implement Group/Organization Structure:**
        *   Mutations to create organizations (`organizations/mutations.ts`).
        *   Logic to assign users to organizations upon sign-up or via invite.
        *   Update `persons` table to linkOkay, let's outline a phased **Development Plan** to build out the ONE Agent Team system, starting from your current position (local setup done to `organizationId`.
    4.  **Implement Core Agent Logic:**
        *   **Seed System Agents:** Create an initial mutation or seeding process to create the single instances of essential system agents (Director, Sage, Teacher, Writer) in the `agents` table upon deployment/setup.
        *   **Director Agent (Basic):** Implement initial logic (`ai, Vercel deployment successful, core schemas defined). This plan prioritizes building the core agent interaction functionality on top of your existing base.

**Current State:**

*   Local development environment operational.
*   Initial deployment to Vercel successful.
*   Core Convex schema defined (Users, Persons, Organizations, Agents, Conversations, Participants, Messages, Elevate content tables).
*   Frontend structure exists (Vite/React, UI components via Shadcn).
*   Basic/director.ts`?) for the Director to greet users, perhaps ask about their goals, and introduce the Foundation step. Needs to access basic user/conversation data.
        *   **Sage Agent (Basic):** Implement logic (`ai/sage.ts`?) to retrieve and display specific fields from the user's saved `userFoundations` table when @mentioned (e.g., "@Sage what's my Brand Voice?"). Requires read access based on conversation/user context.
        *   **Writer Agent (Basic):** Implement logic (`ai/writer.ts`?) to take chat interface potentially mocked up or partially functional.
*   Convex Auth likely set up for user login.

**Goal:** Implement the multi-agent system where the **Director** agent guides users through the **Elevate Framework**, delegating tasks to specialized **System Agents** (Sage, Teacher, Writer, etc.) based on user interaction and @mentions, all within the context of a user's organization/group.

---

**Development Plan: ONE Agent System Implementation**

**Phase 1: Core Agent Infrastructure & Director Agent (Estimated Time: ~2-4 Weeks)**

*   **Objective:** Establish the backend a *simple* hardcoded ROCKET prompt (e.g., generate 3 generic headlines, taking *only* Brand Voice from Sage as context), call an LLM API, and return the draft.
    5.  **Refine Chat UI:**
        *   Ensure `@mentions` functionality correctly parses user *and* agent names/IDs (`shared/mentions.ts`, `components/.../ChatInput.tsx`).
        *   Display messages clearly identifying the author (User, specific System Agent, or User Agent). Use distinct avatars/styling (`AgentAvatar.tsx`).
        *   Implement backend message processing (`conversationMessages/internalActions.ts`) to route mentions to the intended agent's logic.
    6.  **Security Rules (RLS/Backend Checks):** Implement initial Convex security rules or backend checks ensuring users logic for managing system agents, basic agent invocation, and implement the primary **Director** agent's introductory/guiding behavior.
*   **Key Tasks:**
    1.  **Agent Seeding/Management:**
        *   Implement Convex internal mutation/startup logic to ensure necessary **System Agents** (Director, Sage, Teacher, Writer initially) exist in the `agents` table upon deployment/setup (potentially linked to a global/system `organizationId`).
        *   Refine frontend (`AgentList.tsx`, `AgentProfile.tsx`) for users to view *their own* user-created agents (initially maybe just viewing system agents).
    2.  **Conversation Initiation & Director:**
        *   Modify `conversations/mutations.ts::create` so that when a *new* conversation is created by a user, the **Director System Agent** is automatically added as an *active* participant.
        *   Implement the initial can only access/modify data within their own `organizationId`.
*   **Milestone:** User can log in, define their Foundation context, start a conversation, interact minimally with the Director, ask the Sage for their saved Foundation data, and ask the Writer for a simple, context-aware content draft.

**Phase 2: Expanding Agent Capabilities & Playbook Integration (Estimate: 4-6 Weeks)**

*   **Goal:** Implement the core logic for the majority of the specialist agents and integrate the concept of the AI Prompt Playbook.
*   **Key Tasks:**
    1.  **Implement Remaining System Agents (Core Functionality):**
        *   **Teacher:** Logic to retrieve and explain concepts for specific Elevate steps based on module definitions (`courseModules` table).
        *   **Marketer:** Logic to suggest basic tactical ideas (e.g., GIFT brainstorming based on pain points from Sage).
        *   **SEO, Seller, MediaBuyer, Advocate, Guide:** Implement their core advisory functions based on specific user queries (@mentions) within relevant framework steps, retrieving necessary context from @Sage. Initially, focus on *providing advice* rather than complex execution.
         **Director Agent Logic** (likely within `/convex/ai/`):
            *   Define its base System Prompt (Role: Journey Conductor, Objective: Guide user via Elevate).
            *   Create an internal action triggered when the Director needs to respond (e.g., new convo, user message without @mention).
            *   Initial logic: Greet the user, assess if they have Foundation data (query `userFoundations`), guide them towards starting/completing Foundation, or identify the next Elevate step.
    2.  **Basic @Mention Processing:**
        *   Enhance `conversationMessages/internalActions::processMessage`: When a message contains `@AgentName`, identify the mentioned agent's `agentId`.
        *   If the mentioned agent is a *System Agent*: Trigger a specific internal action associated with that agent's role (e.g., `triggerTeacherResponse`, `triggerWriterTask`). Initially, these might just log the request or return a placeholder "Teacher agent acknowledges".
    3.  **Frontend Chat Update:** Ensure the chat interface correctly renders messages from different participant types (User, System Agent - maybe different styling). Display agent names clearly. `@Mentions` should be visually distinct (`AgentMention.tsx`, `UserMention.tsx`).
*   **Goal Check:** Users can create conversations. The Director agent joins automatically, offers*   **Researcher & Connector:** Implement *basic placeholders* for their functions, acknowledging current limitations (or initial integration if web browsing tools are ready).
    2.  **Playbook Prompt Storage & Retrieval:**
        *   Populate the `playbookPrompts` table with the finalized ROCKET prompts for each Elevate step.
        *   Develop UI for the user (or the Teacher/Director agent) to browse/select prompts relevant to the current framework step.
    3.  **Dynamic Prompt Execution (Writer Agent Enhancement):**
        *   Enhance the @Writer agent's logic. Instead of hardcoded prompts, it should:
            *   Receive a `promptCode` (referencing `playbookPrompts`) and any user overrides.
            *   Query the `playbookPrompts` table to get the ROCKET template.
            *   Query @Sage to fetch the *specific* Foundation context elements listed in `playbookPrompts.requiredContext`.
            *   Construct the final, context-rich prompt by injecting the fetched Foundation data into the ROCKET template.
            *   Call the LLM API with the constructed prompt.
            *   Return the formatted draft output.
    4.  **Asset Saving & Management:**
        *   Implement the `userGeneratedAssets` table (or block-based equivalent).
        *   Add UI functionality for the user to save, tag (by step/type), and potentially refine AI-generated drafts. Link saved assets back to the prompt execution log (`userPromptExecutions`).
    5.  **Conversation Context Management:** Ensure agents (especially Director, Sage) have access to relevant conversation history to maintain context during longer interactions (possibly using Convex's built-in vector initial guidance (start Foundation/next step). Users can @mention system agents (logging occurs backend).

**Phase 2: Implementing Core Specialist Agents (Sage, Teacher, Writer) (Estimated Time: ~3-5 Weeks)**

*   **Objective:** Build out the core functionality for the essential knowledge and content agents.
*   **Key Tasks:**
    1.  **Sage Agent (Knowledge Base):**
        *   Implement `convex/ai/sageAgentLogic.ts` internal action.
        *   Logic: Parse queries like "@Sage retrieve Customer Pain X". Query the specific user's `userFoundations` table (using auth context). Format and return the requested information clearly. Needs robust query parsing.
        *   Update `processMessage` to route @Sage mentions correctly.
    2.  **Teacher Agent (Framework Educator):**
        *   Implement `convex/ai/teacherAgentLogic.ts` internal action.
        *   Logic: Parse queries like "@Teacher explain search/RAG for long histories if needed).
*   **Milestone:** User can be guided by the Director, learn from the Teacher, get specific context from the Sage, select prompts from a Playbook UI, have the Writer generate context-rich draft assets for multiple Elevate steps, get basic tactical advice from other specialist agents, and save their refined assets.

**Phase 3: User Agent Creation, Collaboration & Optimization Tools (Estimate: 4-8 Weeks)**

*   **Goal:** Enable user-created agents, implement group-based collaboration features, and introduce analytics/optimization tools.
*   **Key Tasks:**
    1.  **User Agent Creation UI/Logic:**
        *   Frontend UI for users to define `user_agent` properties (name, description, personality, potentially custom instructions/base prompts, tool selection - linking to `tools` table if built).
        *   Convex mutations to create/update/delete `user_agents` linked to the `userId` and `organizationId`.
    2.  **Conversation Invites & Permissions:**
        *   Implement the `inviteUserToConversation` and `inviteAgentToConversation` mutations with proper group/permission checks (checking `organizationId` links).
        *   Implement the `acceptConversationInvite` logic.
        *   Update `conversationParticipants` schema/logic for `invited` status.
        *   Refine frontend UI to show participant lists and invite options within the group context.
    3.  **Inter-Agent Communication:** Refine backend logic to handle agents @ HOOK step". Retrieve conceptual info (potentially from a dedicated knowledge base table or embedded content) about the specified Elevate step/concept. Format as clear, educational response.
        *   Update `processMessage` routing.
    4.  **Writer Agent (Content Generation):**
        *   Implement `convex/ai/writerAgentLogic.ts` internal action.
        *   Logic: Parse requests like "@Writer draft 3 HOOK headlines for [context]...".
        *   Crucially, fetch relevant **Foundation context** (via @Sage or direct query) based on the user's current conversation/state.
        *   Construct the appropriate ROCKET prompt (from Playbook definitions - maybe stored in `playbookPrompts` table) injecting the fetched Foundation context.
        *   Call the external LLM API (e.g., OpenAI/Anthropic/Google).
        *   Format and return the generated *draft* content.
        *   Update `processMessage` routing.
    5.  **Playbook Prompt Integration:**
        *   Populate the `playbookPrompts` table with the initial set of core prompts (Foundation, Hook, Gift).
        *   Develop logic for the Writer (and other generator agents later) to retrieve the correct ROCKET template from this table.
    6.  **Foundation Data Input:** Create basic frontend forms/interfaces for users to *input* their Foundation Blueprint data into the `userFoundations` table.
*   **Goal Check:** Users can query @Sage for their Foundation data. They can ask @Teacher to explain framework steps. They can instruct @Writer (providing necessary context via prompt or relying on @Sage lookup) to generate draft assets for early framework steps.

**Phase 3: Expanding Agent Capabilities & User/Group Features (Estimated Time: ~4-6 Weeks)**

*   **Objective:** Implement remaining key agents (Marketer, SEO, Seller, etc.), User Agent Creation, and Group Invitation functionality.
*   **Key Tasks:**
    1.  **Implement Specialist Agents:** Build out the internal action logic and specific prompts/knowledge bases for:
        *   @Marketer (strategic campaign/tactic suggestions)
        *   @SEO (SEO advice, UK English enforcement)
        *   @Seller (conversion copy refinement, Value Eq. analysis)
        *   @MediaBuyer (ad strategy advice)
        *   @Advocate (SHARE step asset generation)
        *   @Guide (journey status updates, relies on tracking - see Phase 4)
    2.  **User Agent Creation/Management:**
        *   Build frontend UI for users to define `user_agent` types (Name, Descriptionmentioning other agents reliably (system or user agents within the same group), triggering their respective processing functions.
    3.  **Analytics Dashboard (Student View):**
        *   Design and implement the frontend dashboard visualizing key Elevate KPIs (requires student to integrate *their* analytics/Ecom data sources or input data manually into `userFunnelSnapshots`). Focus on the Funnel View and Level-Specific Drill-downs first.
        *   Write Convex queries to pull summarized data from `userFunnelSnapshots` (or integrated sources).
    4.  **Optimization Agent/Features (Integration with Analytics):**
        *   Implement logic for the @Guide agent (or Director) to analyze data from `userFunnelSnapshots` (provided by user/integration) and suggest potential bottlenecks or A/B testing opportunities based on the **Conversion Optimization Analysis Prompt** principles.
    5.  **Tool Integration (Researcher/Connector - Deeper):** If web browsing/API tools are now available, implement the logic for @Researcher and @Connector agents to utilize them based on Director/user instructions.
*   **Milestone:** Users can create custom agents, invite colleagues and agents (within their group) to collaborate in conversations, view performance analytics for their implemented framework, and receive basic AI-driven optimization suggestions.

**Phase 4: Refinement, Scaling & Advanced Features (Ongoing)**

*   **Goal:** Enhance usability, performance, AI capabilities, and add advanced features based on user feedback.
*   **Key Tasks:**
    *   **UI/UX Polish:** Refine workflows, improve component interactions, optimize mobile experience.
    *   **Performance Optimization:** Optimize Convex queries, manage database load, improve AI response times.
    *   **Advanced AI Features:** Explore vector search for knowledge retrieval (Sage), fine-tuning models (optional/complex), more sophisticated agent planning/orchestration (Director).
    *   **Deeper Integrations:** Build more robust integrations with Ecom platforms, Analytics tools, ESPs via APIs (Connector).
    *   **Collaboration Features:** Version history for Foundation/Assets, commenting, task assignments within the system.
    *   **Teacher/Admin Dashboard:** Build out the analytics described earlier for overseeing course usage.
    *   **Security Hardening:** Continuously review and strengthen RLS policies and backend security checks.
    *   **Documentation:** Maintain comprehensive user and developer documentation.

**Key Dependencies & Risks:**

*   **AI API Costs & Reliability:** Costs, Personality, potentially selecting base prompts/tools).
        *   Implement Convex mutations (`agents/mutations::create`, `updateMine`) for users to manage their agents (linked to their `organizationId`).
    3.  **Conversation Invites & Permissions:**
        *   Implement the `inviteUserToConversation` and `inviteAgentToConversation` mutations described previously, including group membership checks.
        *   Implement `acceptConversationInvite` logic.
        *   Refine Convex security rules or backend checks to enforce group-based access to conversations and participants.
        *   Update frontend UI to allow inviting existing group members (users/agents) to conversations.
    4.  **Expand Playbook:** Add prompts for the remaining Elevate steps (Identify through Share) to the `playbookPrompts` table.
*   **Goal Check:** Users can interact with the full suite of system agents. Users can create basic custom agents. Users can invite other group members (users/agents) into conversations. The full Playbook prompt set is available.

**Phase 4: Advanced Features, Integration & Optimization (Ongoing)**

*   **Objective:** Implement complex agents (Researcher, Connector), integrate analytics, refine workflows, and optimize performance.
*   **Key Tasks:**
    1.  **Implement Researcher/Connector Agents:**
        *   **Researcher:** Develop secure mechanism for directed web scraping/searching based on user requests (Requires careful design around tool execution, potentially using Vercel edge functions or Convex HTTP actions calling external services).
        *   **Connector:** Build integrations with key external APIs (e.g., GA4, Shopify) if planned, likely via HTTP Actions. Define specific tasks this agent can perform.
    2.  **Analytics Integration & Guide Agent Enhancement:**
        *   Develop method can escalate with usage; API availability/performance can vary.
*   **Context Window Limits:** Managing long conversation context effectively is crucial.
*   **AI Output Quality & Hallucinations:** Requires robust prompting and user oversight/refinement.
*   **Integration Complexity (Analytics/Ecom Platforms):** Connecting reliably to diverse external systems is challenging.
*   **User Adoption & Training:** Users need to understand the framework and how to effectively interact with the agent team. The Teacher agent is critical here.

This phased plan allows for iterative development, delivering core value early while progressively building towards the full vision of a sophisticated, multi-agent system guiding users through the Elevate Ecommerce Framework.

Okay, you're absolutely right. My apologies for not explicitly referencing the existing `Agent Inbox` codebase features from the Repomix output in the *previous* development plan. Knowing what's already built significantly changes the starting point and priorities.

Let's create a **Revised Development Plan** assuming the `Agent Inbox` codebase (as represented by the file list and content snippets) forms the baseline.

**Baseline Analysis (Based on Agent Inbox Code Structure):**

*   **Core Chat Functionality:** A functional chat interface exists (`ChatArea`, `ChatMessage`, `ChatInput`) with conversation management (`ConversationList`).
*   **User/Agent Distinction:** Schema and components handle both `user_agent` and `system_agent` types (`agents` schema, `AgentAvatar`).
*   **Mentions System:** A robust @mention system (`mentions.ts`, `AgentMention`, `UserMention`, `MentionsInput`) is implemented for tagging agents/users.
*   **Authentication:** Convex Auth with GitHub and potentially Password providers is set up (`auth.ts`, `SignInForm`).
*   **Participants Management:** Logic exists for adding/viewing conversation participants (`conversationParticipants` schema/queries/mutations, `ParticipantsDialog`).
*   **Agent Profiles:** Basic UI for viewing and likely editing agent details (`AgentProfile`, `AgentDescription`, `AgentPersonality`, `AgentTools`).
*   **AI Interaction (Basic):** Contains backend logic (`ai/` directory, `agentReplyToMessage`, `triageMessage`, `tools.ts`) suggesting mechanisms for:
    *   Agents replying to messages (likely triggered by mentions).
    *   A "Triage" concept (which we aim to replace/evolve).
    *   Integration with LLMs (OpenAI implied) and external tools (Exa for search, Resend for email via `ai/tools.ts`).
*   **Database Schema:** Core tables (`users`, `agents`, `conversations`, `conversationParticipants`, `conversationMessages`) are defined.
*   **Tech Stack:** Confirmed Astro/React frontend, Convex backend, Shadcn UI, TailwindCSS.

**Missing / Needs Development (Relative to ONE Agent Team Vision):**

*   **Elevate Framework Integration:** No explicit schema or logic representing the framework steps, course modules, or the Playbook itself.
*   **Specialized Agent Roles:** The current schema has `system_agent` but doesn't *enforce* specific roles (Director, Sage, Teacher, etc.) or link specific logic/prompts to those roles in a structured way. `triageMessage.ts` exists but needs replacing with the Director's orchestration logic.
*   **Foundation Blueprint:** No dedicated schema (`userFoundations`) or UI for capturing/managing the user's crucial Company, Market, and Customer context.
*   **Playbook Prompt Management:** No schema (`playbookPrompts`) or UI for storing, selecting, and dynamically constructing ROCKET prompts using Foundation context.
*   **User-Generated Assets:** No dedicated tracking (`userGeneratedAssets`) for the outputs created via prompts.
*   **Group/Organization Structure:** Current schema seems user-centric, lacking clear multi-tenant `organizations` table and links. Invite logic based on groups is missing.
*   **Guide Agent Logic:** No specific agent/logic focused on guiding the user through the framework steps or visualizing customer journey progress.
*   **Analytics Integration:** No schema (`userFunnelSnapshots`) or logic for capturing/displaying Ecom performance metrics linked to framework implementation.

---

**Revised Development Plan: Building ONE Agent Team on Agent Inbox Base**

**Phase 1: Framework Integration & Foundation Layer (Estimated Time: ~3-5 Weeks)**

*   **Objective:** Integrate the Elevate Framework structure, create the mechanism for storing user Foundation data, and implement the essential **Sage** agent for retrieving this context.
*   **Key Tasks:**
    1.  **Schema Updates:**
        *   Implement `playbookPrompts`, `courseModules`, and `userFoundations` tables in `convex/schema.ts`.
        *   Add `elevateStep` field to `playbookPrompts`, `courseModules`.
        *   Refine `agents` schema: Add `systemRole` validator (Director, Sage, Teacher etc.) within the `system_agent` kind object, deprecate `systemAgentKind` if exists.
        *   Add `organizationId` to `users` (via `persons` or directly if simplifying), `agents` (user agents), `conversations`, `conversationParticipants`, `userFoundations`. Implement `organizations` table.
        *   Add `pageId`, `blockType`, `contentType`, `content` (using discriminated union validator initially basic), `parentBlockId`, `order` etc. to create a flexible `blocks` table for storing course content, prompts, foundation elements etc. (or keep some separate like `userGeneratedAssets`). Implement `pages` table (for screens/modules).
    2.  **Foundation UI/Logic:**
        *   Create new frontend components/pages for users to view and **input/edit their Foundation data** (Company, Market, Customer grids).
        *   Write Convex mutations (`userFoundations/mutations.ts`) to save/update this data, linked to `userId` and `organizationId`. Ensure appropriate permissions.
    3.  **Sage Agent Implementation:**
        *   Create/Seed the "Sage" system agent (`systemRole: "Sage"`).
        *   Implement internal action logic (`ai/sageAgentLogic.ts`) for Sage to:
            *   Be invoked by `@Sage`.
            *   Parse the user's query (e.g., "What are my customer's pains?").
            *   Query the `userFoundations` table for the *requesting user's group/context*.
            *   Return the requested information clearly formatted.
        *   Update `processMessage` action to route @Sage mentions.
    4.  **Course/Playbook Content Structure:**
        *   Populate `courseModules` table with the 0-9 Elevate structure.
        *   Populate `playbookPrompts` table with the core ROCKET prompt *templates* and metadata.
        *   (Optional) Start migrating existing course text/video content into the `blocks` table structure, linked via `pages` or directly to `courseModules`.
*   **Goal Check:** Users can define and save their Foundation Blueprint. They can query the @Sage agent to retrieve parts of their blueprint within a chat. Core framework structures exist in the database. Group structure implemented.

**Phase 2: Director, Teacher, Writer Agents & Dynamic Prompting (Estimated Time: ~4-6 Weeks)**

*   **Objective:** Replace Triage with Director, implement core educational and content generation agents, and enable dynamic, context-aware prompt execution.
*   **Key Tasks:**
    1.  **Director Agent Implementation:**
        *   Create/Seed the "Director" system agent.
        *   Develop internal action logic (`ai/directorAgentLogic.ts`):
            *   Joins new conversations automatically.
            *   Greets user, checks Foundation status (via Sage query).
            *   Guides user towards next logical Elevate step based on progress (requires `userModuleProgress` table & logic - add schema).
            *   Can delegate tasks via @mentions to other agents based on keywords or user requests.
        *   **Remove/Deprecate** old `triageMessage.ts` logic in favor of Director orchestration.
    2.  **Teacher Agent Implementation:**
        *   Create/Seed the "Teacher" system agent.
        *   Implement internal action logic (`ai/teacherAgentLogic.ts`) for Teacher to:
            *   Be invoked by `@Teacher`.
            *   Parse request (e.g., "Explain HOOK").
            *   Retrieve relevant conceptual info from `courseModules` or linked `blocks`.
            *   Format and return clear explanations.
    3.  **Writer Agent & Dynamic Prompting:**
        *   Create/Seed the "Writer" system agent.
        *   Implement internal action logic (`ai/writerAgentLogic.ts`) for Writer to:
            *   Be invoked by `@Writer` potentially with a `promptCode` or description of the task.
            *   If `promptCode` given, retrieve template from `playbookPrompts`.
            *   Determine required context based on `playbookPrompts.requiredContext`.
            *   Query @Sage to get the necessary user-specific Foundation data.
            *   Construct the full ROCKET prompt by injecting context.
            *   Call LLM API.
            *   Return formatted draft content.
    4.  **UI Enhancements:**
        *   Integrate UI elements for users to easily browse/select prompts from the Playbook within the chat or a dedicated area, potentially suggesting relevant prompts based on the conversation's current Elevate step context (tracked perhaps via Director/Guide state).
        *   Develop UI for saving/managing `userGeneratedAssets`.
*   **Goal Check:** The Director guides the user. Teacher explains concepts. Sage provides context. Writer generates *contextually relevant* drafts based on Playbook prompts selected/triggered by the user or Director.

**Phase 3: Full Agent Team, Collaboration & Analytics V1 (Estimated Time: ~4-7 Weeks)**

*   **Objective:** Implement remaining specialist agents, enable group collaboration, and introduce initial student-facing analytics.
*   **Key Tasks:**
    1.  **Implement Specialist System Agents:** Build out logic for Marketer, SEO, Seller, MediaBuyer, Advocate, Guide based on their defined roles, using Sage for context and Writer/other tools for execution support.
    2.  **Collaboration Features:**
        *   Implement `inviteUserToConversation` and `inviteAgentToConversation` mutations with robust `organizationId` checks.
        *   Implement `acceptConversationInvite` logic.
        *   Refine UI participant lists and add "Invite" functionality within conversations (showing only users/agents from the same `organizationId`).
    3.  **Analytics Backend (Initial):**
        *   Implement `userFunnelSnapshots` table.
        *   Create a mechanism (initially maybe manual input via UI form) for students to record their key Ecom KPIs periodically.
    4.  **Analytics Dashboard (V1):**
        *   Develop frontend dashboard components to display data from `userFunnelSnapshots`. Focus on the main Elevate Funnel view and Level-specific KPIs.
    5.  **Guide Agent (Basic):** Implement initial logic for @Guide to report on current *framework step context* within a conversation, potentially pulling basic KPIs from the latest `userFunnelSnapshot`.
*   **Goal Check:** Full system agent team is functional. Users can invite collaborators within their group. Users can manually input and view basic performance analytics related to the framework stages.

**Phase 4: Advanced Features, Optimization & Tooling (Ongoing)**

*   **Objective:** Implement complex agent tools, enhance analytics, refine UI/UX, and optimize performance.
*   **Key Tasks:**
    *   **Researcher/Connector Implementation:** Build out the tool integrations for directed web research or API interactions (if planned).
    *   **Automated Analytics Integration:** Explore direct API connections to GA4, Shopify etc. to auto-populate `userFunnelSnapshots` (Complex).
    *   **Advanced Guide Agent:** Integrate Guide more tightly with analytics to provide proactive bottleneck identification or progress visualization based on *actual* customer journey data.
    *   **User Agent Customization:** Enhance UI for users to better define/train their custom agents.
    *   **UI/UX Polish:** Refine workflows, improve onboarding, add visual progress indicators for the framework.
    *   **Performance Tuning:** Optimize Convex queries, database indexes, LLM call efficiency.
    *   **(Teacher/Admin Dashboard):** Build the separate dashboard for overseeing course usage and student progress.

This revised plan leverages your existing `Agent Inbox` foundation and focuses development efforts on layering in the Elevate Framework structure, the specialized agent roles (replacing Triage with Director), the Foundation data system, dynamic playbook prompting, collaboration features, and finally, analytics integration.