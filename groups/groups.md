# Groups: Multi-Tenant Platform Structure

**Groups are the hierarchical isolation boundary for multi-tenancy in the ONE Platform.**

For details on the ONE group (vision, strategy, revenue), see **[ONE Group →](./one.md)**

## Overview

The ONE Platform operates as a multi-tenant system where:
- **Platform Owner (Anthony)** owns the infrastructure and smart contracts (100%)
- **Groups** are tenant containers for resources and users (with 6 types)
- **Group Owners** manage their groups and members
- **Group Users** have scoped access to group resources

## Table: `groups`

**Schema Structure:**
```typescript
{
  _id: Id<"groups">,
  name: string,
  type: "friend_circle" | "business" | "community" | "dao" | "government" | "organization",
  parentGroupId?: Id<"groups">,  // For hierarchical nesting
  properties: {
    // Identity
    slug?: string,              // URL-friendly (e.g., "acme")
    domain?: string,            // Custom domain (e.g., "acme.one.ie")
    logo?: string,
    description?: string,

    // Status & Plan (mainly for organizations)
    plan?: "starter" | "pro" | "enterprise",

    // Limits & Usage (mainly for organizations)
    limits?: {
      users: number,
      storage: number,         // GB
      apiCalls: number,        // Per month
      inferences: number,      // Per month
    },
    usage?: {
      users: number,
      storage: number,
      apiCalls: number,
      inferences: number,
    },

    // Billing (mainly for organizations)
    billing?: {
      customerId?: string,     // Stripe customer ID
      subscriptionId?: string,
      currentPeriodEnd?: number,
      // Blockchain billing
      cryptoEnabled?: boolean,
      treasuryAddress?: {
        sui?: string,
        solana?: string,
        base?: string,
      },
    },

    // Settings
    settings?: {
      allowSignups?: boolean,
      requireEmailVerification?: boolean,
      enableTwoFactor?: boolean,
      allowedDomains?: string[],
      // Inference settings
      inferenceEnabled?: boolean,
      inferenceModels?: string[],  // ["gpt-4", "claude-3.5", "llama-3"]
    },

    // Revenue share (if group generates platform revenue)
    revenueShare?: number,     // 0.0 to 1.0 (0 = platform keeps all)

    trialEndsAt?: number,
  },
  status: "draft" | "active" | "archived",
  createdAt: number,
  updatedAt: number,
}
```

## Group Types

### 1. **friend_circle**
Small groups of 2-10 people who know each other personally
- Family groups
- Close friend circles
- Small social groups

### 2. **business**
Commercial entities and teams
- Startups
- Small businesses
- Teams and departments

### 3. **community**
Open membership groups around shared interests
- Online communities
- Fan clubs
- Special interest groups

### 4. **dao**
Decentralized autonomous organizations
- Token-gated groups
- On-chain governance
- Treasury management

### 5. **government**
Public sector and civic groups
- Municipal services
- Public agencies
- Civic organizations

### 6. **organization**
Large-scale multi-tenant business entities
- Enterprise customers
- SaaS tenants
- White-label deployments

## Core Relationships (Connections)

**Membership:** `creator` → `group` via `member_of`
- `metadata.role`: `"group_owner"` | `"group_user"`
- `metadata.permissions`: Array of permission strings

**Ownership:** `creator` → `group` via `owns`
- Platform owner (Anthony) owns the ONE group at 100%
- Group owners may own their groups

**Hierarchy:** `group` → `group` via `parentGroupId`
- Groups can nest within groups
- Parent groups can access child group data (configurable)

**Resource Ownership:** `group` → resources via `owns`
- Content, workflows, tokens, products, websites
- All group resources link back to group via ownership connection

## Core Events

**Group Lifecycle:**
- `group_created` - When group is created
- `group_updated` - Settings, plan, or limits changed
- `user_invited_to_group` - Invitation sent
- `user_joined_group` - User accepts invitation
- `user_removed_from_group` - User removed from group

**Billing Events (mainly for organizations):**
- `payment_event` - Subscription payments (Stripe or crypto)
- `subscription_event` - Plan changes (starter → pro → enterprise)

**Inference Events:**
- `inference_request` - Group member requests inference
- `inference_completed` - Result delivered
- `inference_quota_exceeded` - Monthly limit hit

**Revenue Events:**
- `group_revenue_generated` - When group's activity generates platform revenue
- `revenue_share_distributed` - If group has revenue share agreement

## Code Examples

### Create ONE Platform Group (Anthony's)

```typescript
// Create the ONE group (owned by Anthony)
const oneGroupId = await db.insert("groups", {
  name: "ONE Platform",
  type: "organization",
  parentGroupId: undefined,  // Top-level group
  properties: {
    slug: "one",
    domain: "one.ie",
    plan: "enterprise",
    limits: {
      users: 1000000,      // Unlimited for platform
      storage: 1000000,    // 1PB
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },
    billing: {
      cryptoEnabled: true,
      treasuryAddress: {
        sui: process.env.PLATFORM_TREASURY_SUI,
        solana: process.env.PLATFORM_TREASURY_SOLANA,
        base: process.env.PLATFORM_TREASURY_BASE,
      },
    },
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      inferenceEnabled: true,
      inferenceModels: ["gpt-4", "claude-3.5", "llama-3"],
    },
    revenueShare: 0,  // Anthony keeps 100% of revenue
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Anthony owns the ONE group (100%)
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: oneGroupId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
  },
  createdAt: Date.now(),
});

// Anthony is also a member with group_owner role
await db.insert("connections", {
  fromThingId: anthonyId,
  toThingId: oneGroupId,
  relationshipType: "member_of",
  metadata: {
    role: "group_owner",
    permissions: ["*"],  // All permissions
  },
  createdAt: Date.now(),
});

// Log creation event
await db.insert("events", {
  groupId: oneGroupId,
  type: "group_created",
  actorId: anthonyId,
  targetId: oneGroupId,
  timestamp: Date.now(),
  metadata: {
    name: "ONE Platform",
    slug: "one",
    type: "organization",
    plan: "enterprise",
  },
});
```

### Create Customer Group (Multi-Tenant)

```typescript
// Customer creates their own group
const customerGroupId = await db.insert("groups", {
  name: "Acme Corp",
  type: "organization",
  parentGroupId: undefined,  // Top-level tenant
  properties: {
    slug: "acme",
    domain: "acme.one.ie",
    plan: "pro",
    limits: {
      users: 50,
      storage: 100,        // GB
      apiCalls: 100000,
      inferences: 10000,   // 10K inferences/month
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },
    billing: {
      customerId: "cus_stripe123",
      subscriptionId: "sub_stripe456",
      cryptoEnabled: false,
    },
    settings: {
      allowSignups: false,
      requireEmailVerification: true,
      enableTwoFactor: false,
      inferenceEnabled: true,
      inferenceModels: ["gpt-4", "claude-3.5"],
    },
    revenueShare: 0.1,  // Customer gets 10% revenue share if they refer users
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Customer is group_owner
await db.insert("connections", {
  fromThingId: customerId,
  toThingId: customerGroupId,
  relationshipType: "member_of",
  metadata: {
    role: "group_owner",
    permissions: ["read", "write", "admin", "billing"],
  },
  createdAt: Date.now(),
});
```

### Create Hierarchical Groups (Department within Organization)

```typescript
// Create parent organization
const orgId = await db.insert("groups", {
  name: "Tech Corp",
  type: "organization",
  parentGroupId: undefined,
  properties: {
    slug: "techcorp",
    plan: "enterprise",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create child business group (department)
const deptId = await db.insert("groups", {
  name: "Engineering Team",
  type: "business",
  parentGroupId: orgId,  // Nest within parent
  properties: {
    description: "Product engineering department",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Create friend circle within department (squad)
const squadId = await db.insert("groups", {
  name: "Backend Squad",
  type: "friend_circle",
  parentGroupId: deptId,  // Nest within department
  properties: {
    description: "Backend services team",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});
```

### Track Group Inference Usage

```typescript
// User in group requests inference
await db.insert("events", {
  groupId: customerGroupId,
  type: "inference_request",
  actorId: userId,
  targetId: inferenceRequestId,
  timestamp: Date.now(),
  metadata: {
    model: "gpt-4",
    cost: 0.045,
    price: 0.10,
  },
});

// Update group usage
const group = await db.get(customerGroupId);
await db.patch(customerGroupId, {
  properties: {
    ...group.properties,
    usage: {
      ...group.properties.usage,
      inferences: group.properties.usage.inferences + 1,
    },
  },
  updatedAt: Date.now(),
});

// Check if quota exceeded
if (group.properties.usage.inferences >= group.properties.limits.inferences) {
  await db.insert("events", {
    groupId: customerGroupId,
    type: "inference_quota_exceeded",
    actorId: "system",
    targetId: customerGroupId,
    timestamp: Date.now(),
    metadata: {
      limit: group.properties.limits.inferences,
      usage: group.properties.usage.inferences,
    },
  });
}
```

### Revenue Share Distribution

```typescript
// When customer group generates platform revenue
await db.insert("events", {
  groupId: customerGroupId,
  type: "group_revenue_generated",
  actorId: customerGroupId,
  targetId: anthonyId,  // Platform owner
  timestamp: Date.now(),
  metadata: {
    totalRevenue: 1000.00,     // $1K generated by group
    groupShare: 100.00,        // 10% to group
    platformShare: 900.00,     // 90% to Anthony
    revenueSharePercentage: 0.1,
  },
});

// Distribute revenue share (if configured)
if (group.properties.revenueShare > 0) {
  await db.insert("events", {
    groupId: customerGroupId,
    type: "revenue_share_distributed",
    actorId: anthonyId,
    targetId: customerId,
    timestamp: Date.now(),
    metadata: {
      amount: 100.00,
      percentage: 0.1,
      network: "sui",
      txDigest: "...",
    },
  });
}
```

## Queries

**List group members:**
```typescript
const members = await db
  .query("connections")
  .withIndex("to_type", q =>
    q.eq("toThingId", groupId)
     .eq("relationshipType", "member_of")
  )
  .collect();

const memberEntities = await Promise.all(
  members.map(m => db.get(m.fromThingId))
);
```

**List group resources:**
```typescript
const resources = await db
  .query("connections")
  .withIndex("from_type", q =>
    q.eq("fromThingId", groupId)
     .eq("relationshipType", "owns")
  )
  .collect();
```

**Get child groups (hierarchical query):**
```typescript
const childGroups = await db
  .query("groups")
  .filter(q => q.eq(q.field("parentGroupId"), groupId))
  .collect();
```

**Get group inference usage:**
```typescript
const group = await db.get(groupId);
const usage = group.properties.usage?.inferences || 0;
const limit = group.properties.limits?.inferences || 0;
const percentageUsed = (usage / limit) * 100;
```

**Recent group activity:**
```typescript
const events = await db
  .query("events")
  .withIndex("group_time", q => q.eq("groupId", groupId))
  .order("desc")
  .take(100)
  .collect();
```

**Calculate group revenue (for revenue share):**
```typescript
const revenueEvents = await db
  .query("events")
  .withIndex("type_time", q =>
    q.eq("type", "group_revenue_generated")
  )
  .filter(q => q.eq(q.field("actorId"), groupId))
  .collect();

const totalRevenue = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.totalRevenue,
  0
);
const groupShare = revenueEvents.reduce(
  (sum, e) => sum + e.metadata.groupShare,
  0
);
```

## Multi-Tenant Isolation

**Access Control Pattern:**
```typescript
// Check if user can access group resource
export const canAccess = async (
  userId: Id<"things">,
  groupId: Id<"groups">,
  requiredPermission: string
) => {
  const membership = await db
    .query("connections")
    .withIndex("from_type", q =>
      q.eq("fromThingId", userId)
       .eq("toThingId", groupId)
       .eq("relationshipType", "member_of")
    )
    .first();

  if (!membership) return false;

  const permissions = membership.metadata.permissions || [];
  return permissions.includes("*") || permissions.includes(requiredPermission);
};
```

## Notes

- **Platform Owner (Anthony)** - Owns ONE group at 100%, receives all platform revenue
- **Multi-tenant** - Each group isolated via membership connections
- **Hierarchical** - Groups can nest infinitely (friend circles → businesses → organizations)
- **6 group types** - friend_circle, business, community, dao, government, organization
- **Protocol-agnostic** - Blockchain interactions via `metadata.network`
- **Inference quotas** - Monthly limits enforced per group (mainly organizations)
- **Revenue share** - Optional revenue split for referring groups (configurable 0-100%)
- **Blockchain billing** - Groups can pay via crypto (SUI/Solana/Base)
- **Usage tracking** - All inference/API usage tracked in group properties
- **Event history** - Complete audit trail of group activity
- **Flexible scale** - From friend circles (2 people) to governments (billions) without schema changes
