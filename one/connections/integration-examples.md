# External Integration Examples

**Purpose:** Reference implementations for integrating ONE Platform with external systems
**Status:** Template patterns (implement when needed)
**Last Updated:** 2025-10-25

---

## Overview

This document provides copy-paste patterns for common external integrations. All patterns follow the 6-dimension ontology and use protocol metadata where applicable.

**Integration Categories:**

1. **Protocol-Based** - A2A, ACP, AP2, X402, AG-UI
2. **External Agents** - ElizaOS, ChatGPT plugins, custom agents
3. **External Workflows** - n8n, Zapier, Make automation
4. **External APIs** - Third-party services (Stripe, OpenAI, etc.)

---

## Pattern 1: A2A Protocol - Delegate Task to External Agent

**Use Case:** ONE agent delegates a task to an external ElizaOS agent

```typescript
// backend/convex/mutations/protocols/a2a.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Delegate task to external agent via A2A protocol
 *
 * Creates:
 * - external_agent entity (if doesn't exist)
 * - delegated connection (oneAgent → externalAgent)
 * - task_event with protocol: "a2a"
 */
export const delegateTask = mutation({
  args: {
    groupId: v.id("groups"),
    oneAgentId: v.id("entities"),
    externalPlatform: v.string(), // "elizaos", "chatgpt", etc.
    externalAgentId: v.string(),
    task: v.string(),
    parameters: v.any()
  },
  handler: async (ctx, args) => {
    // 1. Get or create external_agent entity
    let externalAgent = await ctx.db
      .query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", "external_agent")
      )
      .filter(q =>
        q.and(
          q.eq(q.field("properties.platform"), args.externalPlatform),
          q.eq(q.field("properties.agentId"), args.externalAgentId)
        )
      )
      .first();

    if (!externalAgent) {
      const externalAgentEntityId = await ctx.db.insert("entities", {
        groupId: args.groupId,
        type: "external_agent",
        name: `${args.externalPlatform} Agent (${args.externalAgentId})`,
        properties: {
          platform: args.externalPlatform,
          agentId: args.externalAgentId,
          protocol: "a2a",
          capabilities: [], // To be filled later
          status: "active"
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      externalAgent = await ctx.db.get(externalAgentEntityId);
    }

    if (!externalAgent) {
      throw new Error("Failed to create external agent entity");
    }

    // 2. Create delegated connection
    const connectionId = await ctx.db.insert("connections", {
      groupId: args.groupId,
      fromEntityId: args.oneAgentId,
      toEntityId: externalAgent._id,
      relationshipType: "delegated",
      metadata: {
        protocol: "a2a",
        task: args.task,
        parameters: args.parameters,
        status: "pending",
        delegatedAt: Date.now()
      },
      createdAt: Date.now()
    });

    // 3. Log task_event
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "task_event",
      actorId: args.oneAgentId,
      targetId: externalAgent._id,
      timestamp: Date.now(),
      metadata: {
        action: "delegated",
        protocol: "a2a",
        task: args.task,
        connectionId: connectionId,
        parameters: args.parameters
      }
    });

    // 4. Call external agent API
    try {
      const response = await fetch(
        `https://agent.${args.externalPlatform}.com/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env[`${args.externalPlatform.toUpperCase()}_API_KEY`]}`
          },
          body: JSON.stringify({
            task: args.task,
            parameters: args.parameters,
            callbackUrl: `${process.env.CONVEX_SITE_URL}/api/a2a/callback`
          })
        }
      );

      if (!response.ok) {
        throw new Error(`External agent API error: ${response.statusText}`);
      }

      const result = await response.json();

      // Update connection with external task ID
      await ctx.db.patch(connectionId, {
        metadata: {
          ...externalAgent.properties,
          externalTaskId: result.taskId,
          status: "in_progress"
        }
      });

      return {
        success: true,
        connectionId,
        externalTaskId: result.taskId
      };
    } catch (error) {
      // Log failure event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "task_event",
        actorId: args.oneAgentId,
        targetId: externalAgent._id,
        timestamp: Date.now(),
        metadata: {
          action: "delegation_failed",
          protocol: "a2a",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      throw error;
    }
  }
});

/**
 * Handle A2A callback from external agent
 *
 * Called by external agent when task is complete
 */
export const handleCallback = mutation({
  args: {
    connectionId: v.id("connections"),
    status: v.union(v.literal("completed"), v.literal("failed")),
    result: v.any()
  },
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (!connection) {
      throw new Error("Connection not found");
    }

    // Update connection status
    await ctx.db.patch(args.connectionId, {
      metadata: {
        ...connection.metadata,
        status: args.status,
        result: args.result,
        completedAt: Date.now()
      }
    });

    // Log completion event
    await ctx.db.insert("events", {
      groupId: connection.groupId,
      type: "task_event",
      actorId: connection.toEntityId,
      targetId: connection.fromEntityId,
      timestamp: Date.now(),
      metadata: {
        action: args.status === "completed" ? "task_completed" : "task_failed",
        protocol: "a2a",
        connectionId: args.connectionId,
        result: args.result
      }
    });

    return { success: true };
  }
});
```

**Frontend Usage:**

```tsx
// web/src/components/agents/TaskDelegation.tsx
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

export function TaskDelegation({ agentId, groupId }) {
  const delegateTask = useMutation(api.mutations.protocols.a2a.delegateTask);

  const handleDelegate = async () => {
    const result = await delegateTask({
      groupId,
      oneAgentId: agentId,
      externalPlatform: "elizaos",
      externalAgentId: "agent_research_123",
      task: "research_market_trends",
      parameters: {
        industry: "fitness",
        timeframe: "last_30_days",
        sources: ["google_trends", "social_media"]
      }
    });

    console.log("Task delegated:", result);
  };

  return (
    <Button onClick={handleDelegate}>
      Delegate Research Task to ElizaOS
    </Button>
  );
}
```

---

## Pattern 2: ACP Protocol - Agent-Initiated Purchase

**Use Case:** External agent (ChatGPT, Claude) purchases a product

```typescript
// backend/convex/mutations/protocols/acp.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Handle agent purchase via ACP protocol
 *
 * Creates:
 * - external_agent entity (if doesn't exist)
 * - transacted connection (agent → product)
 * - commerce_event with protocol: "acp"
 */
export const handleAgentPurchase = mutation({
  args: {
    productId: v.id("entities"),
    agentPlatform: v.string(), // "chatgpt", "claude", etc.
    agentUserId: v.string(),
    paymentMethod: v.string(),
    paymentDetails: v.any()
  },
  handler: async (ctx, args) => {
    // 1. Get product (must be type: "product")
    const product = await ctx.db.get(args.productId);
    if (!product || product.type !== "product") {
      throw new Error("Invalid product");
    }

    // 2. Get or create external_agent entity
    let agentThing = await ctx.db
      .query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", product.groupId).eq("type", "external_agent")
      )
      .filter(q =>
        q.and(
          q.eq(q.field("properties.platform"), args.agentPlatform),
          q.eq(q.field("properties.userId"), args.agentUserId)
        )
      )
      .first();

    if (!agentThing) {
      const agentEntityId = await ctx.db.insert("entities", {
        groupId: product.groupId,
        type: "external_agent",
        name: `${args.agentPlatform} Agent (${args.agentUserId})`,
        properties: {
          platform: args.agentPlatform,
          userId: args.agentUserId,
          protocol: "acp"
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      agentThing = await ctx.db.get(agentEntityId);
    }

    if (!agentThing) {
      throw new Error("Failed to create agent entity");
    }

    // 3. Log commerce event (purchase initiated)
    const eventId = await ctx.db.insert("events", {
      groupId: product.groupId,
      type: "commerce_event",
      actorId: agentThing._id,
      targetId: product._id,
      timestamp: Date.now(),
      metadata: {
        protocol: "acp",
        eventType: "purchase_initiated",
        agentPlatform: args.agentPlatform,
        productId: args.productId,
        amount: product.properties.price,
        currency: product.properties.currency || "USD"
      }
    });

    // 4. Process payment (integrate with Stripe, etc.)
    try {
      const paymentResult = await processPayment({
        amount: product.properties.price,
        currency: product.properties.currency || "USD",
        method: args.paymentMethod,
        details: args.paymentDetails
      });

      // 5. Create transacted connection
      await ctx.db.insert("connections", {
        groupId: product.groupId,
        fromEntityId: agentThing._id,
        toEntityId: product._id,
        relationshipType: "transacted",
        metadata: {
          protocol: "acp",
          transactionType: "purchase",
          amount: product.properties.price,
          currency: product.properties.currency || "USD",
          paymentId: paymentResult.id,
          status: "completed"
        },
        createdAt: Date.now()
      });

      // 6. Log completion event
      await ctx.db.insert("events", {
        groupId: product.groupId,
        type: "commerce_event",
        actorId: agentThing._id,
        targetId: product._id,
        timestamp: Date.now(),
        metadata: {
          protocol: "acp",
          eventType: "purchase_completed",
          paymentId: paymentResult.id,
          transactionId: paymentResult.transactionId
        }
      });

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        paymentId: paymentResult.id
      };
    } catch (error) {
      // Log failure event
      await ctx.db.insert("events", {
        groupId: product.groupId,
        type: "commerce_event",
        actorId: agentThing._id,
        targetId: product._id,
        timestamp: Date.now(),
        metadata: {
          protocol: "acp",
          eventType: "purchase_failed",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      throw error;
    }
  }
});

// Helper function (integrate with your payment provider)
async function processPayment(args: {
  amount: number;
  currency: string;
  method: string;
  details: any;
}) {
  // Stripe integration example
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const paymentIntent = await stripe.paymentIntents.create({ ... });
  // return { id: paymentIntent.id, transactionId: paymentIntent.id };

  return {
    id: `pay_${Date.now()}`,
    transactionId: `txn_${Date.now()}`
  };
}
```

**REST API Endpoint (when Hono is implemented):**

```typescript
// backend/convex/http.ts (Hono)
app.post("/api/protocols/acp/purchase", async (c) => {
  const body = await c.req.json();

  const result = await c.env.ctx.runMutation(
    api.mutations.protocols.acp.handleAgentPurchase,
    {
      productId: body.productId,
      agentPlatform: body.agentPlatform,
      agentUserId: body.agentUserId,
      paymentMethod: body.paymentMethod,
      paymentDetails: body.paymentDetails
    }
  );

  return c.json(result);
});
```

---

## Pattern 3: X402 Protocol - HTTP Micropayments

**Use Case:** Verify blockchain payment before granting API access

```typescript
// backend/convex/mutations/protocols/x402.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Verify X402 payment and grant API access
 *
 * Creates:
 * - payment_event with protocol: "x402"
 * - transacted connection (user → resource)
 */
export const verifyPayment = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("entities"),
    resourceId: v.id("entities"),
    payment: v.object({
      scheme: v.union(v.literal("permit"), v.literal("transfer")),
      network: v.string(), // "base", "ethereum", etc.
      amount: v.string(),
      signature: v.string(),
      permitData: v.optional(v.any())
    })
  },
  handler: async (ctx, args) => {
    // 1. Log payment request event
    const requestEventId = await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "payment_event",
      actorId: args.userId,
      targetId: args.resourceId,
      timestamp: Date.now(),
      metadata: {
        protocol: "x402",
        status: "requested",
        scheme: args.payment.scheme,
        network: args.payment.network,
        amount: args.payment.amount
      }
    });

    // 2. Verify payment on blockchain
    try {
      const isValid = await verifyX402Payment(args.payment);
      if (!isValid) {
        throw new Error("Invalid X402 payment signature");
      }

      // 3. Log payment verified event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "payment_event",
        actorId: args.userId,
        targetId: args.resourceId,
        timestamp: Date.now(),
        metadata: {
          protocol: "x402",
          status: "verified",
          requestEventId: requestEventId,
          transactionHash: args.payment.signature
        }
      });

      // 4. Create transacted connection
      await ctx.db.insert("connections", {
        groupId: args.groupId,
        fromEntityId: args.userId,
        toEntityId: args.resourceId,
        relationshipType: "transacted",
        metadata: {
          protocol: "x402",
          transactionType: "micropayment",
          amount: args.payment.amount,
          network: args.payment.network,
          transactionHash: args.payment.signature
        },
        createdAt: Date.now()
      });

      // 5. Grant access (return API token or execute request)
      return {
        accessGranted: true,
        token: generateApiToken(),
        expiresIn: 3600 // 1 hour
      };
    } catch (error) {
      // Log failure event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "payment_event",
        actorId: args.userId,
        targetId: args.resourceId,
        timestamp: Date.now(),
        metadata: {
          protocol: "x402",
          status: "verification_failed",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      throw error;
    }
  }
});

// Helper functions
async function verifyX402Payment(payment: any): Promise<boolean> {
  // Implement blockchain verification logic
  // Example: Verify permit signature with viem/ethers
  return true; // Placeholder
}

function generateApiToken(): string {
  // Generate temporary API token
  return `token_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
```

---

## Pattern 4: External Workflow Integration (n8n, Zapier)

**Use Case:** Trigger n8n workflow when event occurs

```typescript
// backend/convex/mutations/integrations/n8n.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Trigger n8n workflow
 *
 * Creates:
 * - external_workflow entity (if doesn't exist)
 * - workflow_triggered event
 */
export const triggerWorkflow = mutation({
  args: {
    groupId: v.id("groups"),
    workflowName: v.string(),
    webhookUrl: v.string(),
    payload: v.any()
  },
  handler: async (ctx, args) => {
    // 1. Get or create external_workflow entity
    let workflow = await ctx.db
      .query("entities")
      .withIndex("group_type", q =>
        q.eq("groupId", args.groupId).eq("type", "external_workflow")
      )
      .filter(q => q.eq(q.field("name"), args.workflowName))
      .first();

    if (!workflow) {
      const workflowId = await ctx.db.insert("entities", {
        groupId: args.groupId,
        type: "external_workflow",
        name: args.workflowName,
        properties: {
          platform: "n8n",
          webhookUrl: args.webhookUrl
        },
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      workflow = await ctx.db.get(workflowId);
    }

    if (!workflow) {
      throw new Error("Failed to create workflow entity");
    }

    // 2. Trigger webhook
    try {
      const response = await fetch(args.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(args.payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      // 3. Log workflow_triggered event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "workflow_event",
        actorId: workflow._id,
        timestamp: Date.now(),
        metadata: {
          action: "triggered",
          workflow: args.workflowName,
          platform: "n8n",
          payload: args.payload,
          status: "success"
        }
      });

      return { success: true };
    } catch (error) {
      // Log failure event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "workflow_event",
        actorId: workflow._id,
        timestamp: Date.now(),
        metadata: {
          action: "trigger_failed",
          workflow: args.workflowName,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      throw error;
    }
  }
});
```

---

## Pattern 5: External API Integration (Stripe, OpenAI)

**Use Case:** Call external API service (Stripe payment processing)

```typescript
// backend/convex/mutations/integrations/stripe.ts
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Process payment via Stripe
 *
 * Creates:
 * - transacted connection (user → product)
 * - payment_event
 */
export const processPayment = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("entities"),
    productId: v.id("entities"),
    amount: v.number(),
    currency: v.string(),
    paymentMethodId: v.string()
  },
  handler: async (ctx, args) => {
    // Get product
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Log payment initiated
    await ctx.db.insert("events", {
      groupId: args.groupId,
      type: "payment_event",
      actorId: args.userId,
      targetId: args.productId,
      timestamp: Date.now(),
      metadata: {
        action: "initiated",
        provider: "stripe",
        amount: args.amount,
        currency: args.currency
      }
    });

    try {
      // Call Stripe API
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(args.amount * 100), // Convert to cents
        currency: args.currency,
        payment_method: args.paymentMethodId,
        confirm: true
      });

      // Create transacted connection
      await ctx.db.insert("connections", {
        groupId: args.groupId,
        fromEntityId: args.userId,
        toEntityId: args.productId,
        relationshipType: "transacted",
        metadata: {
          provider: "stripe",
          paymentIntentId: paymentIntent.id,
          amount: args.amount,
          currency: args.currency,
          status: paymentIntent.status
        },
        createdAt: Date.now()
      });

      // Log success event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "payment_event",
        actorId: args.userId,
        targetId: args.productId,
        timestamp: Date.now(),
        metadata: {
          action: "completed",
          provider: "stripe",
          paymentIntentId: paymentIntent.id,
          amount: args.amount,
          currency: args.currency
        }
      });

      return {
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status
      };
    } catch (error) {
      // Log failure event
      await ctx.db.insert("events", {
        groupId: args.groupId,
        type: "payment_event",
        actorId: args.userId,
        targetId: args.productId,
        timestamp: Date.now(),
        metadata: {
          action: "failed",
          provider: "stripe",
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });

      throw error;
    }
  }
});
```

---

## Integration Testing Pattern

```typescript
// web/test/integration/external-api.test.ts
import { describe, it, expect } from "vitest";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../backend/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.PUBLIC_CONVEX_URL!);

describe("External Integration: A2A Protocol", () => {
  it("should delegate task to external agent", async () => {
    const result = await convex.mutation(
      api.mutations.protocols.a2a.delegateTask,
      {
        groupId: testGroupId,
        oneAgentId: testAgentId,
        externalPlatform: "elizaos",
        externalAgentId: "agent_research_123",
        task: "research_market_trends",
        parameters: {
          industry: "fitness",
          timeframe: "last_30_days"
        }
      }
    );

    expect(result.success).toBe(true);
    expect(result.connectionId).toBeDefined();
    expect(result.externalTaskId).toBeDefined();
  });

  it("should log protocol metadata in events", async () => {
    const events = await convex.query(api.queries.events.list, {
      groupId: testGroupId
    });

    const a2aEvent = events.find(e =>
      e.metadata?.protocol === "a2a" &&
      e.metadata?.action === "delegated"
    );

    expect(a2aEvent).toBeDefined();
    expect(a2aEvent?.metadata?.task).toBe("research_market_trends");
  });
});
```

---

## Key Principles

1. **Always create entities** - External systems represented as things (external_agent, external_workflow, external_connection)
2. **Use protocol metadata** - Store protocol identifier in metadata.protocol field
3. **Log all events** - Track every integration action with proper event types
4. **Handle errors gracefully** - Log failure events, implement retries
5. **Multi-tenant isolation** - All integrations scoped to groupId
6. **Test end-to-end** - Verify complete flows including external API calls

---

**Next Steps:**

1. Implement Hono REST API layer (when external API needed)
2. Add protocol-specific endpoints (A2A, ACP, X402, AP2)
3. Create SDKs for external developers
4. Write comprehensive integration tests
5. Document API patterns for partners

**See Also:**

- `/Users/toc/Server/ONE/one/connections/integration-phase2.md` - Integration layer documentation
- `/Users/toc/Server/ONE/one/connections/protocols.md` - Protocol specifications
- `/Users/toc/Server/ONE/one/knowledge/specifications.md` - Protocol integration patterns
