# Building Enterprise SaaS with the 6-Dimension Ontology

## Introduction: Enterprise-Grade Architecture

The ONE Platform's 6-dimension ontology provides a complete foundation for building enterprise SaaS platforms that scale from startups to global enterprises. Unlike traditional architectures that require hundreds of tables and complex schemas, the 6-dimension model delivers:

**Key Enterprise Benefits:**

- **Perfect Multi-Tenant Isolation:** Each customer organization has completely isolated data
- **Clear Ownership & Governance:** Role-based access control with audit trails
- **Infinite Scalability:** Add customers without schema changes or architectural refactoring
- **Cost Attribution:** Per-organization billing, quotas, and usage tracking
- **AI-Native Design:** Built-in knowledge layer for intelligent features
- **Compliance Ready:** GDPR, SOC2, HIPAA-compatible architecture

This example demonstrates building a complete CRM SaaS platform using the 6-dimension ontology, showcasing multi-tenancy, authorization, and enterprise features.

---

## The 6 Dimensions (Enterprise Version)

### 1. Organizations - Multi-Tenant Isolation Boundary

Organizations are the fundamental partitioning unit for multi-tenant SaaS. Every resource (thing, connection, event, knowledge) belongs to exactly one organization, providing perfect data isolation.

**Enterprise Value:**

- Each customer company is an organization
- Zero cross-tenant data leaks (enforced at database level)
- Independent billing, quotas, and rate limits
- Custom branding and feature flags per organization
- Platform-level services with centralized infrastructure

**Organization Schema:**

```typescript
interface Organization {
  _id: Id<"organizations">;
  name: string; // "Acme Corporation"
  slug: string; // "acme-corp" (URL-friendly)
  domain?: string; // "crm.acme.com" (custom domain)
  status: "active" | "suspended" | "trial" | "cancelled";
  plan: "starter" | "pro" | "enterprise";

  // Resource Limits
  limits: {
    users: number; // Max users in organization
    storage: number; // GB
    apiCalls: number; // Per month
    inference: number; // LLM calls per month
  };

  // Current Usage
  usage: {
    users: number;
    storage: number;
    apiCalls: number;
    inference: number;
  };

  // Billing Integration
  billing: {
    customerId?: string; // Stripe customer ID
    subscriptionId?: string; // Stripe subscription ID
    billingEmail?: string;
  };

  // Organization Settings
  settings: {
    allowSignups: boolean;
    requireEmailVerification: boolean;
    enableTwoFactor: boolean;
    customBranding?: {
      logo?: string;
      primaryColor?: string;
      accentColor?: string;
    };
  };

  createdAt: number;
  updatedAt: number;
  trialEndsAt?: number;
}
```

### 2. People - Authorization & Governance Layer

People define who can do what within the system. In the 6-dimension architecture, people are represented as things with `type: 'creator'` and a `role` property, providing a flexible yet type-safe authorization model.

**Four Enterprise Roles:**

1. **Platform Owner**

   - Owns the entire SaaS platform infrastructure
   - Can access all organizations (for support and debugging)
   - Manages platform-level services and billing
   - Revenue: 100% of platform fees + revenue share from organizations

2. **Org Owner**

   - Owns and manages one or more customer organizations
   - Full control over users, permissions, and billing within their org
   - Can customize AI agents, branding, and features
   - Revenue: Percentage share of org subscription fees

3. **Org User**

   - Works within a specific organization
   - Limited permissions defined by org owner
   - Can create content, manage leads, run AI agents (within quotas)
   - No billing or administrative access

4. **Customer**
   - External user consuming services (e.g., lead in CRM)
   - No administrative access
   - Purchases products or services
   - Tracked for analytics and billing

**Person Schema (as Thing):**

```typescript
interface PersonThing {
  _id: Id<"things">;
  thingType: "creator";
  name: string; // "Jane CEO"
  organizationId: Id<"organizations">;

  properties: {
    email: string;
    username: string;
    displayName: string;

    // CRITICAL: Role determines access level
    role: "platform_owner" | "org_owner" | "org_user" | "customer";

    // Organization memberships (can belong to multiple orgs)
    organizations: Id<"organizations">[];
    permissions?: string[]; // Custom permissions array

    // Profile information
    bio?: string;
    avatar?: string;
    timezone?: string;

    // Authentication metadata
    authProvider?: string;
    lastLoginAt?: number;
  };

  status: "active" | "inactive" | "suspended";
  createdAt: number;
  updatedAt: number;
}
```

### 3. Things - Domain Entities

Things represent all entities in your CRM: leads, accounts, opportunities, AI agents, products, etc. The 66 pre-defined thing types cover most use cases, with extensibility via metadata.

**Relevant Thing Types for CRM:**

- `creator` - People (employees, customers)
- `sales_agent` - AI-powered sales assistants
- `support_agent` - AI-powered support agents
- `lead` - Sales leads
- `account` - Customer accounts
- `opportunity` - Sales opportunities
- `product` - Products or services
- `task` - Action items
- `email` - Email messages
- `note` - Notes and memos

### 4. Connections - Business Relationships

Connections define how entities relate to each other. In a CRM, this includes ownership, communication, task assignment, and deal stages.

**Relevant Connection Types for CRM:**

- `owns` - Person owns account/opportunity
- `member_of` - Person is member of organization
- `assigned_to` - Task assigned to person
- `communicated` - Agent communicated with lead
- `related_to` - Opportunity related to account
- `purchased` - Customer purchased product

### 5. Events - Complete Audit Trail

Events record every action in the system, providing compliance, analytics, and debugging capabilities.

**Key Event Types for CRM:**

- `user_created` - New user registered
- `org_created` - New organization created
- `communication_event` - Email/call/meeting logged
- `deal_stage_changed` - Opportunity progressed
- `task_completed` - Task marked done
- `content_viewed` - User viewed content
- `inference_request` - AI agent invoked

### 6. Knowledge - Intelligence Layer

Knowledge stores vectors, embeddings, and semantic search capabilities, enabling AI agents to provide context-aware assistance.

**Knowledge Types:**

- `label` - Tags and categories
- `vector` - Embeddings for semantic search
- `chunk` - Text chunks for RAG (Retrieval Augmented Generation)
- `summary` - Generated summaries

---

## Example: Building a CRM SaaS Platform

This complete example demonstrates implementing a multi-tenant CRM SaaS using the 6-dimension ontology.

### Step 1: Customer Signs Up (Create Organization)

When a new customer signs up, create their organization with appropriate limits and settings.

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrganization = mutation({
  args: {
    name: v.string(),
    ownerEmail: v.string(),
    plan: v.optional(
      v.union(v.literal("starter"), v.literal("pro"), v.literal("enterprise"))
    ),
  },
  handler: async (ctx, args) => {
    // Define plan limits
    const planLimits = {
      starter: { users: 5, storage: 10, apiCalls: 10000, inference: 5000 },
      pro: { users: 25, storage: 100, apiCalls: 100000, inference: 50000 },
      enterprise: {
        users: 1000,
        storage: 1000,
        apiCalls: 1000000,
        inference: 500000,
      },
    };

    const plan = args.plan || "starter";
    const slug = args.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: args.name,
      slug,
      status: "trial",
      plan,
      limits: planLimits[plan],
      usage: { users: 0, storage: 0, apiCalls: 0, inference: 0 },
      billing: { billingEmail: args.ownerEmail },
      settings: {
        allowSignups: true,
        requireEmailVerification: true,
        enableTwoFactor: false,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trialEndsAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14-day trial
    });

    // Create org owner (person)
    const ownerId = await ctx.db.insert("things", {
      thingType: "creator",
      name: args.ownerEmail.split("@")[0],
      organizationId: orgId,
      properties: {
        email: args.ownerEmail,
        username: args.ownerEmail.split("@")[0],
        displayName: args.ownerEmail.split("@")[0],
        role: "org_owner",
        organizations: [orgId],
        permissions: ["*"], // Full access
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create membership connection
    await ctx.db.insert("connections", {
      fromThingId: ownerId,
      toThingId: orgId as any, // Note: In practice, you'd use a thing representing the org
      relationshipType: "member_of",
      organizationId: orgId,
      metadata: { role: "org_owner" },
      createdAt: Date.now(),
    });

    // Log organization creation event
    await ctx.db.insert("events", {
      eventType: "org_created",
      actorId: ownerId,
      organizationId: orgId,
      metadata: {
        plan,
        trialDays: 14,
      },
      timestamp: Date.now(),
    });

    // Increment usage
    await ctx.db.patch(orgId, {
      usage: { users: 1, storage: 0, apiCalls: 0, inference: 0 },
    });

    return { orgId, ownerId };
  },
});
```

### Step 2: Create AI Sales Agent

Set up an AI-powered sales agent for the organization.

```typescript
export const createSalesAgent = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    systemPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authorization: Require org owner
    await requireOrgAccess(ctx, args.orgId, "org_owner");

    const userId = await getUserId(ctx);

    // Default system prompt if not provided
    const defaultPrompt = `You are a friendly and professional sales assistant for ${args.name}.
Your goals are to:
1. Qualify leads by understanding their needs and budget
2. Provide helpful information about products and services
3. Schedule meetings with the sales team when appropriate
4. Maintain a warm, consultative tone

Always be helpful, never pushy. Focus on understanding the customer's challenges before pitching solutions.`;

    // Create sales agent
    const agentId = await ctx.db.insert("things", {
      thingType: "sales_agent",
      name: args.name,
      organizationId: args.orgId,
      properties: {
        systemPrompt: args.systemPrompt || defaultPrompt,
        temperature: 0.7,
        maxTokens: 1000,
        model: "claude-3-5-sonnet-20250101",
        capabilities: ["email", "chat", "calendar_scheduling"],
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create ownership connection
    await ctx.db.insert("connections", {
      fromThingId: userId,
      toThingId: agentId,
      relationshipType: "owns",
      organizationId: args.orgId,
      metadata: {},
      createdAt: Date.now(),
    });

    // Log agent creation
    await ctx.db.insert("events", {
      eventType: "agent_created",
      actorId: userId,
      thingId: agentId,
      organizationId: args.orgId,
      metadata: { agentType: "sales_agent" },
      timestamp: Date.now(),
    });

    return agentId;
  },
});
```

### Step 3: Import Leads

Add leads to the CRM system.

```typescript
export const createLead = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    phone: v.optional(v.string()),
    budget: v.optional(v.number()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Authorization: Require org user or owner
    await requireOrgAccess(ctx, args.orgId, "org_user");

    const userId = await getUserId(ctx);

    // Create lead as a thing
    const leadId = await ctx.db.insert("things", {
      thingType: "creator", // Using creator for customer/lead
      name: args.name,
      organizationId: args.orgId,
      properties: {
        email: args.email,
        username: args.email,
        displayName: args.name,
        role: "customer",
        company: args.company,
        phone: args.phone,
        budget: args.budget,
        source: args.source || "manual",
        status: "new",
        qualificationScore: 0,
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Assign lead to user
    await ctx.db.insert("connections", {
      fromThingId: userId,
      toThingId: leadId,
      relationshipType: "owns",
      organizationId: args.orgId,
      metadata: { assignedAt: Date.now() },
      createdAt: Date.now(),
    });

    // Log lead creation
    await ctx.db.insert("events", {
      eventType: "user_created",
      actorId: userId,
      thingId: leadId,
      organizationId: args.orgId,
      metadata: {
        leadSource: args.source || "manual",
        company: args.company,
      },
      timestamp: Date.now(),
    });

    // Generate knowledge chunks for RAG
    const leadContext = `Lead: ${args.name} from ${
      args.company || "unknown company"
    }.
Email: ${args.email}. Budget: $${args.budget || "unknown"}. Source: ${
      args.source || "manual"
    }.`;

    await generateKnowledge(ctx, {
      orgId: args.orgId,
      sourceThingId: leadId,
      text: leadContext,
    });

    return leadId;
  },
});
```

### Step 4: AI Agent Communicates with Lead

AI sales agent sends personalized outreach based on lead profile.

```typescript
export const sendAIOutreach = mutation({
  args: {
    orgId: v.id("organizations"),
    agentId: v.id("things"),
    leadId: v.id("things"),
  },
  handler: async (ctx, args) => {
    // Authorization
    await requireOrgAccess(ctx, args.orgId, "org_user");

    // Get agent and lead details
    const agent = await ctx.db.get(args.agentId);
    const lead = await ctx.db.get(args.leadId);

    if (!agent || agent.thingType !== "sales_agent") {
      throw new Error("Invalid sales agent");
    }

    if (!lead) {
      throw new Error("Lead not found");
    }

    // Query knowledge for relevant context
    const relevantContext = await queryKnowledge(ctx, {
      organizationId: args.orgId,
      query: `sales outreach ${lead.properties.company} ${lead.properties.source}`,
      k: 5,
    });

    // Generate personalized email using LLM
    const emailContent = await generateEmail(ctx, {
      systemPrompt: agent.properties.systemPrompt,
      leadName: lead.name,
      leadCompany: lead.properties.company,
      context: relevantContext,
    });

    // Create email thing
    const emailId = await ctx.db.insert("things", {
      thingType: "email",
      name: `Outreach to ${lead.name}`,
      organizationId: args.orgId,
      properties: {
        from: agent.name,
        to: lead.properties.email,
        subject: emailContent.subject,
        body: emailContent.body,
        status: "sent",
        sentAt: Date.now(),
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create communication connection
    await ctx.db.insert("connections", {
      fromThingId: args.agentId,
      toThingId: args.leadId,
      relationshipType: "communicated",
      organizationId: args.orgId,
      metadata: {
        protocol: "email",
        emailId,
        subject: emailContent.subject,
      },
      createdAt: Date.now(),
    });

    // Log communication event
    await ctx.db.insert("events", {
      eventType: "communication_event",
      actorId: args.agentId,
      thingId: args.leadId,
      organizationId: args.orgId,
      metadata: {
        protocol: "email",
        messageType: "outreach",
        emailId,
        sentiment: "positive",
      },
      timestamp: Date.now(),
    });

    // Update inference usage
    await incrementUsage(ctx, args.orgId, "inference", 1);

    return { emailId, emailContent };
  },
});
```

### Step 5: Track Lead Progression

Monitor and update lead status as they move through the sales pipeline.

```typescript
export const updateLeadStatus = mutation({
  args: {
    orgId: v.id("organizations"),
    leadId: v.id("things"),
    newStatus: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "org_user");

    const userId = await getUserId(ctx);
    const lead = await ctx.db.get(args.leadId);

    if (!lead || lead.organizationId !== args.orgId) {
      throw new Error("Lead not found or access denied");
    }

    const oldStatus = lead.properties.status;

    // Update lead status
    await ctx.db.patch(args.leadId, {
      properties: {
        ...lead.properties,
        status: args.newStatus,
        lastUpdatedBy: userId,
      },
      updatedAt: Date.now(),
    });

    // Create note if provided
    if (args.notes) {
      const noteId = await ctx.db.insert("things", {
        thingType: "note",
        name: `Note: ${lead.name} status change`,
        organizationId: args.orgId,
        properties: {
          content: args.notes,
          authorId: userId,
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Link note to lead
      await ctx.db.insert("connections", {
        fromThingId: noteId,
        toThingId: args.leadId,
        relationshipType: "related_to",
        organizationId: args.orgId,
        metadata: {},
        createdAt: Date.now(),
      });
    }

    // Log status change event
    await ctx.db.insert("events", {
      eventType: "deal_stage_changed",
      actorId: userId,
      thingId: args.leadId,
      organizationId: args.orgId,
      metadata: {
        oldStatus,
        newStatus: args.newStatus,
        notes: args.notes,
      },
      timestamp: Date.now(),
    });

    return { success: true, oldStatus, newStatus: args.newStatus };
  },
});
```

### Step 6: Query Organization Data

Retrieve CRM data with proper multi-tenant scoping.

```typescript
import { query } from "./_generated/server";

export const getLeads = query({
  args: {
    orgId: v.id("organizations"),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Authorization: Require org access
    await requireOrgAccess(ctx, args.orgId, "org_user");

    // Query leads scoped to organization
    let leadsQuery = ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q.eq("organizationId", args.orgId).eq("thingType", "creator")
      )
      .filter((q) => q.eq(q.field("properties").role, "customer"));

    // Optional status filter
    if (args.status) {
      leadsQuery = leadsQuery.filter((q) =>
        q.eq(q.field("properties").status, args.status)
      );
    }

    const leads = await leadsQuery.order("desc").take(args.limit || 50);

    // Get assigned users for each lead
    const leadsWithOwners = await Promise.all(
      leads.map(async (lead) => {
        const ownerConnection = await ctx.db
          .query("connections")
          .withIndex("by_to", (q) => q.eq("toThingId", lead._id))
          .filter((q) => q.eq(q.field("relationshipType"), "owns"))
          .first();

        const owner = ownerConnection
          ? await ctx.db.get(ownerConnection.fromThingId)
          : null;

        return {
          ...lead,
          owner: owner
            ? {
                id: owner._id,
                name: owner.name,
                email: owner.properties.email,
              }
            : null,
        };
      })
    );

    return leadsWithOwners;
  },
});

export const getOrganizationStats = query({
  args: {
    orgId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "org_owner");

    const org = await ctx.db.get(args.orgId);

    if (!org) {
      throw new Error("Organization not found");
    }

    // Count entities by type
    const leads = await ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q.eq("organizationId", args.orgId).eq("thingType", "creator")
      )
      .filter((q) => q.eq(q.field("properties").role, "customer"))
      .collect();

    const agents = await ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q.eq("organizationId", args.orgId).eq("thingType", "sales_agent")
      )
      .collect();

    const events = await ctx.db
      .query("events")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .collect();

    // Calculate conversion metrics
    const convertedLeads = leads.filter(
      (lead) => lead.properties.status === "won"
    ).length;

    const conversionRate =
      leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

    return {
      organization: {
        name: org.name,
        plan: org.plan,
        status: org.status,
      },
      usage: org.usage,
      limits: org.limits,
      stats: {
        totalLeads: leads.length,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        activeAgents: agents.filter((a) => a.status === "active").length,
        totalEvents: events.length,
      },
    };
  },
});
```

---

## Multi-Tenancy Benefits

### 1. Perfect Data Isolation

The 6-dimension architecture enforces data isolation at the database level through organization scoping.

**Example: Cross-Org Query Prevention**

```typescript
// SAFE: All queries automatically scoped to organization
export const getLeads = query({
  args: { orgId: v.id("organizations") },
  handler: async (ctx, args) => {
    // This query can ONLY return leads from args.orgId
    const leads = await ctx.db
      .query("things")
      .withIndex("by_org_type", (q) =>
        q
          .eq("organizationId", args.orgId) // Enforces isolation
          .eq("thingType", "creator")
      )
      .collect();

    return leads;
  },
});

// UNSAFE PATTERN (avoided in our architecture)
// const allLeads = await ctx.db.query("things").collect();
// This would violate multi-tenancy!
```

**Benefits:**

- Zero chance of cross-organization data leaks
- Compliance with data privacy regulations (GDPR, CCPA)
- Customer trust and confidence
- Simplified security audits

### 2. Independent Scaling & Resource Management

Each organization has independent quotas and billing.

```typescript
export const checkQuota = async (
  ctx: any,
  orgId: Id<"organizations">,
  resourceType: "users" | "storage" | "apiCalls" | "inference"
) => {
  const org = await ctx.db.get(orgId);

  if (!org) {
    throw new Error("Organization not found");
  }

  const current = org.usage[resourceType];
  const limit = org.limits[resourceType];

  if (current >= limit) {
    throw new Error(
      `${resourceType} quota exceeded. Current: ${current}, Limit: ${limit}`
    );
  }

  return {
    current,
    limit,
    available: limit - current,
    percentUsed: Math.round((current / limit) * 100),
  };
};

export const incrementUsage = async (
  ctx: any,
  orgId: Id<"organizations">,
  resourceType: "users" | "storage" | "apiCalls" | "inference",
  amount: number = 1
) => {
  const org = await ctx.db.get(orgId);

  if (!org) {
    throw new Error("Organization not found");
  }

  // Check quota before incrementing
  await checkQuota(ctx, orgId, resourceType);

  // Increment usage
  await ctx.db.patch(orgId, {
    usage: {
      ...org.usage,
      [resourceType]: org.usage[resourceType] + amount,
    },
  });
};
```

**Benefits:**

- Per-organization billing and invoicing
- Prevent resource abuse and overages
- Upgrade/downgrade plans without affecting others
- Clear cost attribution for platform economics

### 3. Customization & White-Labeling

Organizations can customize their experience independently.

```typescript
export const updateBranding = mutation({
  args: {
    orgId: v.id("organizations"),
    logo: v.optional(v.string()),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "org_owner");

    const org = await ctx.db.get(args.orgId);

    if (!org) {
      throw new Error("Organization not found");
    }

    await ctx.db.patch(args.orgId, {
      settings: {
        ...org.settings,
        customBranding: {
          logo: args.logo || org.settings.customBranding?.logo,
          primaryColor:
            args.primaryColor || org.settings.customBranding?.primaryColor,
          accentColor:
            args.accentColor || org.settings.customBranding?.accentColor,
        },
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const customizeAIAgent = mutation({
  args: {
    orgId: v.id("organizations"),
    agentId: v.id("things"),
    systemPrompt: v.string(),
    temperature: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "org_owner");

    const agent = await ctx.db.get(args.agentId);

    if (!agent || agent.organizationId !== args.orgId) {
      throw new Error("Agent not found or access denied");
    }

    await ctx.db.patch(args.agentId, {
      properties: {
        ...agent.properties,
        systemPrompt: args.systemPrompt,
        temperature: args.temperature || agent.properties.temperature,
        customizedBy: await getUserId(ctx),
        customizedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
```

**Benefits:**

- Each customer can brand their CRM instance
- Custom AI agent personalities per organization
- Feature flags and custom workflows
- White-label deployment options

### 4. Platform Revenue & Economics

Clear revenue attribution through the organization dimension.

```typescript
export const calculateRevenue = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    // Platform owner only
    const userId = await getUserId(ctx);
    const user = await ctx.db.get(userId);

    if (user?.properties.role !== "platform_owner") {
      throw new Error("Platform owner access required");
    }

    // Get all active organizations
    const orgs = await ctx.db
      .query("organizations")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    // Calculate revenue by plan
    const revenueByPlan = {
      starter: { count: 0, mrr: 0 },
      pro: { count: 0, mrr: 0 },
      enterprise: { count: 0, mrr: 0 },
    };

    const planPricing = {
      starter: 29,
      pro: 99,
      enterprise: 499,
    };

    orgs.forEach((org) => {
      revenueByPlan[org.plan].count += 1;
      revenueByPlan[org.plan].mrr += planPricing[org.plan];
    });

    // Calculate inference costs
    const totalInferenceCalls = orgs.reduce(
      (sum, org) => sum + org.usage.inference,
      0
    );

    const costPerInference = 0.01; // $0.01 per call
    const inferenceCosts = totalInferenceCalls * costPerInference;

    // Platform revenue = subscription fees + inference markup
    const subscriptionRevenue = Object.values(revenueByPlan).reduce(
      (sum, plan) => sum + plan.mrr,
      0
    );

    const inferenceRevenue = inferenceCosts * 0.3; // 30% markup

    const totalRevenue = subscriptionRevenue + inferenceRevenue;

    return {
      period: { startDate: args.startDate, endDate: args.endDate },
      organizations: {
        total: orgs.length,
        byPlan: revenueByPlan,
      },
      revenue: {
        subscriptions: subscriptionRevenue,
        inference: inferenceRevenue,
        total: totalRevenue,
      },
      costs: {
        inference: inferenceCosts,
      },
      profit: totalRevenue - inferenceCosts,
    };
  },
});
```

**Benefits:**

- Clear revenue attribution per organization
- Track costs (inference, storage, API calls)
- Revenue sharing between platform and org owners
- Financial analytics for business decisions

---

## Security & Compliance

### GDPR Compliance - Right to Erasure

The organization dimension makes GDPR compliance straightforward.

```typescript
export const deleteOrganizationData = mutation({
  args: {
    orgId: v.id("organizations"),
    confirmationCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Platform owner or org owner only
    const userId = await getUserId(ctx);
    const user = await ctx.db.get(userId);

    const isPlatformOwner = user?.properties.role === "platform_owner";
    const isOrgOwner =
      user?.properties.role === "org_owner" &&
      user?.organizationId === args.orgId;

    if (!isPlatformOwner && !isOrgOwner) {
      throw new Error(
        "Unauthorized: Only platform or org owner can delete org data"
      );
    }

    // Verify confirmation code
    const expectedCode = `DELETE-${args.orgId.slice(0, 8)}`;
    if (args.confirmationCode !== expectedCode) {
      throw new Error("Invalid confirmation code");
    }

    // Delete all organization data
    const deletionCounts = {
      things: 0,
      connections: 0,
      events: 0,
      knowledge: 0,
    };

    // Delete things
    const things = await ctx.db
      .query("things")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .collect();

    for (const thing of things) {
      await ctx.db.delete(thing._id);
      deletionCounts.things += 1;
    }

    // Delete connections
    const connections = await ctx.db
      .query("connections")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .collect();

    for (const connection of connections) {
      await ctx.db.delete(connection._id);
      deletionCounts.connections += 1;
    }

    // Delete events
    const events = await ctx.db
      .query("events")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .collect();

    for (const event of events) {
      await ctx.db.delete(event._id);
      deletionCounts.events += 1;
    }

    // Delete knowledge
    const knowledge = await ctx.db
      .query("knowledge")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .collect();

    for (const k of knowledge) {
      await ctx.db.delete(k._id);
      deletionCounts.knowledge += 1;
    }

    // Delete organization itself
    await ctx.db.delete(args.orgId);

    // Log deletion (to a separate audit table not shown here)
    console.log(
      `Organization ${args.orgId} deleted by ${userId}`,
      deletionCounts
    );

    return {
      success: true,
      deletionCounts,
      message: "All organization data permanently deleted",
    };
  },
});
```

### Audit Trails - Complete Event Logging

Every action is logged with actor, timestamp, and organization context.

```typescript
export const getAuditLog = query({
  args: {
    orgId: v.id("organizations"),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    eventType: v.optional(v.string()),
    actorId: v.optional(v.id("things")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Org owner only
    await requireOrgAccess(ctx, args.orgId, "org_owner");

    // Query events for organization
    let eventsQuery = ctx.db
      .query("events")
      .withIndex("by_org", (q) => q.eq("organizationId", args.orgId))
      .order("desc");

    // Apply filters
    if (args.eventType) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("eventType"), args.eventType)
      );
    }

    if (args.actorId) {
      eventsQuery = eventsQuery.filter((q) =>
        q.eq(q.field("actorId"), args.actorId)
      );
    }

    if (args.startDate) {
      eventsQuery = eventsQuery.filter((q) =>
        q.gte(q.field("timestamp"), args.startDate!)
      );
    }

    if (args.endDate) {
      eventsQuery = eventsQuery.filter((q) =>
        q.lte(q.field("timestamp"), args.endDate!)
      );
    }

    const events = await eventsQuery.take(args.limit || 100);

    // Enrich with actor and thing details
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        const actor = await ctx.db.get(event.actorId);
        const thing = event.thingId ? await ctx.db.get(event.thingId) : null;

        return {
          ...event,
          actor: actor
            ? {
                id: actor._id,
                name: actor.name,
                email: actor.properties.email,
                role: actor.properties.role,
              }
            : null,
          thing: thing
            ? {
                id: thing._id,
                name: thing.name,
                type: thing.thingType,
              }
            : null,
        };
      })
    );

    return enrichedEvents;
  },
});
```

### Access Control - Role-Based Permissions

Implement fine-grained access control using the people dimension.

```typescript
// Authorization middleware
export async function requireOrgAccess(
  ctx: any,
  orgId: Id<"organizations">,
  requiredRole: "org_owner" | "org_user"
) {
  const userId = await getUserId(ctx);
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Platform owner can access everything
  if (user.properties.role === "platform_owner") {
    return true;
  }

  // Check if user belongs to organization
  const membership = await ctx.db
    .query("connections")
    .withIndex("from_type", (q) =>
      q.eq("fromThingId", userId).eq("relationshipType", "member_of")
    )
    .filter((q) => q.eq(q.field("metadata").organizationId, orgId))
    .first();

  if (!membership) {
    throw new Error("User not member of organization");
  }

  // Check role
  const userRole = user.properties.role;

  if (requiredRole === "org_owner" && userRole !== "org_owner") {
    throw new Error("Organization owner access required");
  }

  return true;
}

// Permission check for specific actions
export async function checkPermission(
  ctx: any,
  userId: Id<"things">,
  permission: string
): Promise<boolean> {
  const user = await ctx.db.get(userId);

  if (!user) {
    return false;
  }

  // Platform owner has all permissions
  if (user.properties.role === "platform_owner") {
    return true;
  }

  // Check if user has specific permission
  const permissions = user.properties.permissions || [];

  // Wildcard permission
  if (permissions.includes("*")) {
    return true;
  }

  // Exact match
  if (permissions.includes(permission)) {
    return true;
  }

  // Pattern match (e.g., "leads.*" matches "leads.create", "leads.update")
  const hasMatch = permissions.some((p) => {
    if (p.endsWith("*")) {
      const prefix = p.slice(0, -1);
      return permission.startsWith(prefix);
    }
    return false;
  });

  return hasMatch;
}
```

### Data Encryption & Privacy

Implement organization-scoped encryption for sensitive data.

```typescript
export const encryptSensitiveData = async (
  ctx: any,
  orgId: Id<"organizations">,
  data: string
): Promise<string> => {
  // In production, use org-specific encryption keys
  // Stored securely in a key management service (KMS)
  const orgKey = await getOrganizationEncryptionKey(orgId);

  // Encrypt data using AES-256
  const encrypted = await encrypt(data, orgKey);

  return encrypted;
};

export const decryptSensitiveData = async (
  ctx: any,
  orgId: Id<"organizations">,
  encryptedData: string
): Promise<string> => {
  const orgKey = await getOrganizationEncryptionKey(orgId);
  const decrypted = await decrypt(encryptedData, orgKey);

  return decrypted;
};

// Example: Storing encrypted customer data
export const createLeadWithEncryption = mutation({
  args: {
    orgId: v.id("organizations"),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    ssn: v.optional(v.string()), // Sensitive data
  },
  handler: async (ctx, args) => {
    await requireOrgAccess(ctx, args.orgId, "org_user");

    const userId = await getUserId(ctx);

    // Encrypt sensitive data
    const encryptedSSN = args.ssn
      ? await encryptSensitiveData(ctx, args.orgId, args.ssn)
      : undefined;

    const leadId = await ctx.db.insert("things", {
      thingType: "creator",
      name: args.name,
      organizationId: args.orgId,
      properties: {
        email: args.email,
        phone: args.phone,
        encryptedSSN, // Stored encrypted
        role: "customer",
      },
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return leadId;
  },
});
```

---

## Conclusion

The 6-dimension ontology provides a complete, production-ready foundation for building enterprise SaaS platforms:

**Key Takeaways:**

1. **Organizations** provide perfect multi-tenant isolation at the database level
2. **People** enable role-based access control and governance
3. **Things, Connections, Events** model all business entities and relationships
4. **Knowledge** powers AI-driven features with RAG and semantic search
5. **Security & Compliance** are built-in, not bolted-on
6. **Infinite Scalability** without schema changes or architectural refactoring

**What You Can Build:**

- CRM platforms (demonstrated in this example)
- Project management tools
- E-commerce marketplaces
- Content management systems
- Customer support platforms
- Analytics and BI tools
- And any other multi-tenant SaaS application

**Next Steps:**

1. Review the [6-Dimension Ontology specification](/Users/toc/Server/ONE/one/knowledge/ontology.md)
2. Explore the [Architecture documentation](/Users/toc/Server/ONE/one/knowledge/architecture.md)
3. Study additional [enterprise examples](/Users/toc/Server/ONE/one/examples/enterprise/)
4. Start building your own SaaS platform with the ONE Platform

The 6-dimension architecture proves you don't need hundreds of tables or complex schemas to build enterprise-grade software. You need clarity, simplicity, and a reality-aware model that scales infinitely.

**Build smarter. Build with ONE.**
