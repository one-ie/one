---
title: Analytics
description: Elevate KPIs
date: 2024-02-02
tags:
  - agents
order: 1
---
# Schema

This proposed schema uses Convex `defineTable` and `v` (validators) syntax, assuming a Convex backend, but the principles can be adapted to other database systems. It aims to capture user progress, Foundation data, generated assets, and link them conceptually to Ecom funnel performance (though actual funnel tracking often resides more heavily in Analytics/CRM systems).

**Key Considerations:**

*   **Granularity:** Balancing detail with usability. Too granular is hard to manage; too high-level lacks insight.
*   **Relational Links:** Using Convex `Id` types extensively to link related data (User -> Foundation -> Prompt Execution -> Asset -> Funnel Stage Performance).
*   **Ecom Data Source:** This schema assumes the Ecom funnel data (Leads, Sales, etc.) might be *summarized* or *referenced* here, but the primary source-of-truth for raw transaction/analytics data is likely the Ecom platform (Shopify, etc.) and Analytics tools (GA4). Deep integration would require webhooks or APIs.
*   **Flexibility:** Using `v.any()` for AI outputs or complex objects allows flexibility but reduces type safety. Specific validators (`v.object`, `v.array`) are preferred where structure is known.

---

**Proposed Convex Schema: Elevate Playbook & Ecom Funnel Integration**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

//Validators reused across tables
const elevateStepValidator = v.union(
  v.literal("Foundation"), // Module 0 is technically Foundation
  v.literal("Hook"),       // Step 1
  v.literal("Gift"),       // Step 2
  v.literal("Identify"),   // Step 3
  v.literal("Engage"),     // Step 4
  v.literal("Sell"),       // Step 5
  v.literal("Nurture"),    // Step 6
  v.literal("Upsell"),     // Step 7
  v.literal("Educate"),    // Step 8
  v.literal("Share")       // Step 9
);

// --- Core Elevate Playbook & Course Structure ---

export const playbookPrompts = defineTable({
  step: elevateStepValidator, // Which framework step it belongs to
  promptCode: v.string(), // e.g., "H1", "G3", "S2"
  title: v.string(),      // User-friendly title
  description: v.string(),// Brief explanation of purpose
  rocketTemplate: v.string(), // The full ROCKET prompt structure w/ placeholders
  requiredContext: v.array(v.string()), // List of Foundation elements needed (e.g., "Customer Pain", "Brand Voice")
  outputType: v.string(), // Expected output format (e.g., "List", "Email Draft", "JSON")
}).index("by_step", ["step"]);

export const courseModules = defineTable({
  moduleNumber: v.union(v.number(), v.literal(0)), // 0 for Foundation, 1-9 for steps
  step: elevateStepValidator,
  title: v.string(),
  objective: v.string(),
  videoUrl: v.optional(v.string()),
  textContent: v.optional(v.string()), // Summary or full text
  gridDefinition: v.optional(v.any()), // Store grid structure/explanation
  checklistItems: v.optional(v.array(v.string())),
  worksheetUrl: v.optional(v.string()), // Link to downloadable worksheet
  exampleImageUrl: v.optional(v.string()),
  exampleText: v.optional(v.string()),
  implementationGuide: v.optional(v.string()),
}).index("by_moduleNumber", ["moduleNumber"]);

// --- User Specific Data & Progress ---

export const users = defineTable({
  // From Convex Auth - typically includes name, email, picture, etc.
  ...authTables.users.validator.fields,
  // Additional custom user fields if needed
  onboardingStatus: v.optional(v.string()), // e.g., 'Not Started', 'Foundation Complete', 'Course Complete'
});
// Add Indexes from authTables if necessary for queries
// .index("by_email", ["email"])

export const userFoundations = defineTable({
  userId: v.id("users"),
  // Store structured Foundation data based on the grids
  companyContext: v.object({
      coreOffers: v.optional(v.string()),
      uniqueMechanism: v.optional(v.string()),
      valueProposition: v.optional(v.string()),
      brandPillars: v.optional(v.string()),
      brandVoiceAdjectives: v.optional(v.array(v.string())),
      positioningPrice: v.optional(v.string()),
      missionVision: v.optional(v.string()),
      brandStoryPersonality: v.optional(v.string()),
      // ... potentially add all grid cells as optional fields
  }),
  marketAwareness: v.object({
      competitors: v.optional(v.array(v.object({ name: v.string(), weakness: v.string() }))),
      differentiation: v.optional(v.string()),
      marketTrends: v.optional(v.string()),
      channelAnalysis: v.optional(v.string()),
      // ...
  }),
  customerAvatar: v.object({
      profileSummary: v.optional(v.string()),
      pains: v.optional(v.array(v.string())),
      fears: v.optional(v.array(v.string())),
      goals: v.optional(v.array(v.string())),
      dreams: v.optional(v.array(v.string())),
      needs: v.optional(v.array(v.string())),
      wateringHoles: v.optional(v.string()),
      // ...
  }),
  strategicBlueprintSummary: v.optional(v.string()), // Overall alignment summary
  lastUpdatedAt: v.number(),
}).index("by_userId", ["userId"]);

export const userPromptExecutions = defineTable({
  userId: v.id("users"),
  promptCode: v.string(), // Reference to playbookPrompts.promptCode
  elevateStep: elevateStepValidator,
  inputContextSnapshot: v.any(), // Snapshot of Foundation data USED for this run
  aiRequestTimestamp: v.number(),
  aiResponse: v.optional(v.any()), // The raw AI output
  aiResponseTimestamp: v.optional(v.number()),
  status: v.union(v.literal("Pending"), v.literal("Success"), v.literal("Error")),
  refinedOutputAssetId: v.optional(v.id("userGeneratedAssets")), // Link to the final refined asset
}).index("by_user_step", ["userId", "elevateStep"]);

export const userGeneratedAssets = defineTable({
  userId: v.id("users"),
  promptExecutionId: v.optional(v.id("userPromptExecutions")), // Link back to prompt run
  elevateStep: elevateStepValidator,
  assetType: v.string(), // e.g., "Ad Headline", "Email Subject", "Sales Page Section"
  content: v.string(), // The refined, user-approved content
  channel: v.optional(v.string()), // e.g., "Facebook Ads", "Klaviyo", "Website"
  status: v.union(v.literal("Draft"), v.literal("Implemented"), v.literal("Archived")),
  createdAt: v.number(),
  lastUpdatedAt: v.number(),
}).index("by_user_step", ["userId", "elevateStep"]);

export const userModuleProgress = defineTable({
    userId: v.id("users"),
    moduleId: v.id("courseModules"),
    status: v.union(v.literal("Not Started"), v.literal("In Progress"), v.literal("Completed")),
    completedAt: v.optional(v.number()),
    notes: v.optional(v.string()), // User notes for the module
}).index("by_user_module", ["userId", "moduleId"]);


// --- Ecom Funnel Performance Data (Conceptual - Summarized/Referenced) ---
// NOTE: Real-time, granular funnel data typically lives in Analytics (GA4)
// and the Ecom Platform (Shopify, Woo). This table might store
// user-inputted summaries or potentially integrated data for dashboarding.

export const userFunnelSnapshots = defineTable({
  userId: v.id("users"),
  snapshotDate: v.number(), // Timestamp for the data period start/end
  timePeriod: v.string(), // e.g., "Last 7 Days", "Last 30 Days", "Month of April"

  // ATTRACT Metrics
  hook_AvgCTR: v.optional(v.number()),
  gift_OptInRate: v.optional(v.number()),
  gift_CPL: v.optional(v.number()), // Cost Per Lead
  attract_LeadsTotal: v.optional(v.number()),

  // CONVERT Metrics
  engage_AssistedConversionRate: v.optional(v.number()),
  sell_ConversionRate: v.optional(v.number()), // e.g., Lead -> Sale Rate
  sell_AOV_Initial: v.optional(v.number()), // AOV before upsell
  nurture_EmailConvRate: v.optional(v.number()),
  nurture_RetargetingROAS: v.optional(v.number()),
  convert_TotalSales: v.optional(v.number()),
  convert_CPA: v.optional(v.number()), // Cost Per Acquisition

  // GROW Metrics
  upsell_TakeRate: v.optional(v.number()),
  upsell_AOV_Final: v.optional(v.number()), // AOV including upsell
  educate_RepeatPurchaseRate: v.optional(v.number()),
  educate_CSAT_NPS: v.optional(v.number()), // Could be avg score
  share_ReviewRate: v.optional(v.number()), // % requests resulting in review
  grow_CLTV_Estimate: v.optional(v.number()), // Customer Lifetime Value

  // Overall
  overallROI: v.optional(v.number()),
  notes: v.optional(v.string()), // User notes about this snapshot

}).index("by_user_date", ["userId", "snapshotDate"]);


// Schema Definition
export default defineSchema({
  // Include base auth tables
  ...authTables,

  // Elevate Framework / Playbook Structure
  playbookPrompts,
  courseModules,

  // User Data & Progress
  // Note: 'users' table now includes auth fields directly
  userFoundations,
  userPromptExecutions,
  userGeneratedAssets,
  userModuleProgress,

  // Conceptual Ecom Funnel Data
  userFunnelSnapshots,

  // Need tables from previous chat schema if integrating that fully
  // agents, conversations, conversationParticipants, conversationMessages, etc.
  // (Omitted here for focus, but would be needed for a full chat/agent system)

});

```

**Explanation and Integration:**

1.  **Playbook Structure (`playbookPrompts`, `courseModules`):** Defines the static content of the course and the prompt library itself. Links prompts to specific framework steps.
2.  **User Data (`users`, `userFoundations`):** Stores core user info (via `authTables`) and, crucially, their specific, structured **Foundation Blueprint** data. This is the context source.
3.  **User Activity (`userPromptExecutions`, `userGeneratedAssets`, `userModuleProgress`):** Tracks how users interact with the course and playbook.
    *   `userPromptExecutions`: Logs *when* a user runs a specific prompt and *what Foundation context was used at that time* (snapshotting is important as Foundation might evolve). It also stores the raw AI response and links to the refined asset.
    *   `userGeneratedAssets`: Stores the final, **user-refined** pieces of content (headlines, emails) generated for each step, linked back to the prompt execution that created the draft.
    *   `userModuleProgress`: Tracks course completion.
4.  **Ecom Funnel Data (`userFunnelSnapshots`):** This table is **conceptual** and likely requires the user to *manually input* summarized KPIs from their external analytics tools (GA4, Shopify Analytics, Ad Platforms) periodically, or requires complex API integrations (beyond the scope of a simple schema definition). It provides the data needed for the Student Analytics Dashboard. Linking specific `userGeneratedAssets` to performance changes in `userFunnelSnapshots` allows for assessing the impact of implementing the framework.

**Seamless Integration:**

*   The `userFoundations` table provides the **persistent context** required by prompts defined in `playbookPrompts`.
*   When a user triggers a prompt via the UI (interacting with `courseModules` content), the system fetches their current `userFoundations` data, structures it according to the `playbookPrompts.requiredContext`, executes the prompt, and logs it in `userPromptExecutions`.
*   The user refines the AI output and saves the final version in `userGeneratedAssets`, linking it back.
*   The `userFunnelSnapshots` table (populated manually or via integration) provides the performance data against which the effectiveness of the implemented assets (`userGeneratedAssets`) and overall framework adoption (`userModuleProgress`) can be measured.

This schema provides a robust structure for managing the course content, user-specific data, AI interactions, and performance metrics, enabling the integrated Elevate system experience.

Okay, let's define schemas for a `persons` table (representing human individuals interacting with or relevant to the system) and refine the existing `agents` schema to clearly delineate the team members you described.

This assumes the `users` table (from `authTables`) represents *authenticated login accounts*, while the `persons` table represents *actual human entities* who might *also* be authenticated users, or might be team members, contacts, or even stakeholder profiles defined within the Foundation.

We will incorporate this into the main schema definition.

---

**Refined Convex Schema with `persons` and Updated `agents` Table**

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server"; // Assuming you use convex/auth

// --- Reusable Validators ---

const elevateStepValidator = v.union(
  v.literal("Foundation"), v.literal("Hook"), v.literal("Gift"),
  v.literal("Identify"), v.literal("Engage"), v.literal("Sell"),
  v.literal("Nurture"), v.literal("Upsell"), v.literal("Educate"),
  v.literal("Share")
);

// --- NEW: Person Schema ---
// Represents human individuals involved (Users, Team Members, Contacts)
export const persons = defineTable({
  userId: v.optional(v.id("users")), // Link to auth user record IF they log in
  name: v.string(),                 // Full name
  firstName: v.optional(v.string()),
  lastName: v.optional(v.string()),
  email: v.optional(v.string()),     // Primary email, might differ from login email
  role: v.optional(v.string()),      // Role within ONE system context (e.g., "Student", "Admin", "Team Member")
  organizationId: v.optional(v.id("organizations")), // Link if part of a team/company
  avatarUrl: v.optional(v.string()), // Profile picture URL
  metadata: v.optional(v.any()),     // For any other relevant person details
}).index("by_userId", ["userId"])
  .index("by_email", ["email"]) // Add index if searching by email is common
  .index("by_organization", ["organizationId"]); // Add index if filtering by org

// --- REFINED: Agent Schema ---
// Defines both AI agents created by users and specialized system agents
const commonAgentFields = {
  name: v.string(),                     // Agent's display name
  description: v.string(),              // What the agent does
  personality: v.string(),              // Core persona description / guiding principles
  avatarUrl: v.string(),                // URL for the agent's avatar
  tools: v.optional(v.array(v.string())), // List of tool names agent can use (from shared/tools.ts)
  lastActiveTime: v.optional(v.number()),// Timestamp of last known activity
};

// Define specialized System Agent roles (extensible)
const systemAgentRoleValidator = v.union(
  v.literal("Director"),    // Orchestrates the user's journey through Elevate
  v.literal("Sage"),        // Foundation knowledge base expert
  v.literal("Teacher"),     // Elevate framework & Playbook educator
  v.literal("Writer"),      // Content generation specialist
  v.literal("Marketer"),    // Campaign strategy & tactics advisor
  v.literal("SEO"),         // Search Engine Optimiser (UK English focus)
  v.literal("Researcher"),  // Directed information gathering (via tools)
  v.literal("Connector"),   // API / Integration specialist
  v.literal("Seller"),      // Conversion optimization / Closing expert
  v.literal("MediaBuyer"),  // Paid traffic specialist
  v.literal("Advocate"),    // SHARE step / Community specialist
  v.literal("Guide")        // User journey / Customer state navigator
  // Add other system roles as needed
);

export const agents = defineTable(
  v.union(
    // Agents created by users
    v.object({
      kind: v.literal("user_agent"),
      createdBy: v.id("users"),        // Link to the user who created it
      configuration: v.optional(v.any()), // Specific settings or loaded prompts
      ...commonAgentFields
    }),
    // Pre-defined system agents with specific roles
    v.object({
      kind: v.literal("system_agent"),
      systemRole: systemAgentRoleValidator, // Defines the agent's specific function
      baseInstructions: v.optional(v.string()), // Core prompt instructions for this role
      configuration: v.optional(v.any()), // Role-specific configuration
      ...commonAgentFields
    })
  )
).index("by_creator", ["createdBy", "kind"]) // Find agents created by a specific user
 .index("by_systemRole", ["systemRole", "kind"]); // Easily find specific system agents like the Director

// --- Conceptual Organization Schema (Example) ---
// Optional, only if you need multi-user/team structures
export const organizations = defineTable({
  name: v.string(),
  ownerId: v.id("users"),
  // add subscription details etc. if needed
}).index("by_owner", ["ownerId"]);

// --- Other Existing Tables (Keep as previously defined) ---

export const playbookPrompts = defineTable({ /* ... as before ... */ })
  .index("by_step", ["step"]);
export const courseModules = defineTable({ /* ... as before ... */ })
  .index("by_moduleNumber", ["moduleNumber"]);
export const userFoundations = defineTable({ /* ... as before ... */ })
  .index("by_userId", ["userId"]);
export const userPromptExecutions = defineTable({ /* ... as before ... */ })
  .index("by_user_step", ["userId", "elevateStep"]);
export const userGeneratedAssets = defineTable({ /* ... as before ... */ })
  .index("by_user_step", ["userId", "elevateStep"]);
export const userModuleProgress = defineTable({ /* ... as before ... */ })
  .index("by_user_module", ["userId", "moduleId"]);
export const userFunnelSnapshots = defineTable({ /* ... as before ... */ })
  .index("by_user_date", ["userId", "snapshotDate"]);

// Potentially add chat-related tables if integrating directly
// conversations, conversationParticipants, conversationMessages

// --- Schema Definition ---
export default defineSchema({
  // Include base auth tables if using convex/auth
  ...authTables, // Includes the 'users' table

  // Core Person & Agent Schemas
  persons, // Represents humans
  agents, // Represents AI agents (user & system)
  organizations, // Optional for team structures

  // Elevate Framework / Playbook Structure
  playbookPrompts,
  courseModules,

  // User Data & Progress
  userFoundations,
  userPromptExecutions,
  userGeneratedAssets,
  userModuleProgress,

  // Conceptual Ecom Funnel Data
  userFunnelSnapshots,

  // Add chat-related tables if applicable
  // conversations,
  // conversationParticipants,
  // conversationMessages,
});
```

**Explanation of Changes & "Beautiful Person" Schema:**

1.  **`persons` Table:**
    *   Creates a distinct table to represent *human individuals*.
    *   `userId` (optional `Id<"users">`): This is the critical link. If a person is also an authenticated user, this field connects their person record to their login account (`users` table from `authTables`). It's optional because you might store info about team members or contacts who don't log in.
    *   `name`, `firstName`, `lastName`, `email`, `avatarUrl`: Standard contact information.
    *   `role`: Important for defining their relationship to the system/course (e.g., "Student," "Admin," "Prospect Contact").
    *   `organizationId`: Allows grouping people into teams or companies (requires the simple `organizations` table).
    *   `metadata`: Flexible field for additional unstructured info.

2.  **`agents` Table Refined:**
    *   **`commonAgentFields`:** Extracted common fields for better structure.
    *   **`user_agent` kind:** Remains largely the same, clearly linked to a `createdBy` user (`Id<"users">`). Added `configuration` field for potential user-specific settings or prompt overrides.
    *   **`system_agent` kind:** Replaced the generic `systemAgentKind` with a more descriptive `systemRole` validator. This **explicitly lists the different system agent types** you defined (Director, Sage, Teacher, Writer, SEO, Researcher, Connector, Seller, MediaBuyer, Advocate, Guide). This makes querying for specific system agents much easier and the schema more self-documenting. Added `baseInstructions` to potentially store core role-defining prompts directly in the DB.

3.  **`organizations` Table (Conceptual):** Added a simple table to support grouping `persons` if needed for team features later.

**Integration & How it Works:**

*   When a user signs up/logs in via `authTables`, you might create a corresponding entry in the `persons` table, linking it via the `userId`.
*   The `agents` table clearly distinguishes between AI agents created *by* users (`user_agent`) and the specialized system agents (`system_agent`) that facilitate the ONE Playbook experience.
*   The `Director` agent (`systemRole: "Director"`) orchestrates interactions, potentially mentioning (`@`) specific system agents like `@Teacher` or `@Writer`, or user-created `@UserAgentName`.
*   The `@Sage` agent (`systemRole: "Sage"`) would query the specific user's `userFoundations` table to retrieve context.
*   Other agents take instructions based on their `systemRole` and associated `baseInstructions`/`configuration`.

This structure provides a clear distinction between human entities (`persons`, `users`) and AI entities (`agents`), while allowing for specialized roles within the AI team to guide the student effectively through the Elevate Framework.