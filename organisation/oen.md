# oen

**Slug:** `oen`
**Domain:** one.ie
**Owner:** t' (100%)
**Status:** Active
**Plan:** Enterprise

---

## Identity

- **Name:** oen
- **Slug:** `oen`
- **Domain:** one.ie
- **Owner:** t'
- **Status:** Active
- **Plan:** Enterprise

---

## The Organization Entity

```typescript
{
  type: "organization",
  name: "oen",
  properties: {
    // Identity
    slug: "oen",
    domain: "one.ie",
    description: "Organization created via ONE CLI",

    // Status & Plan
    status: "active",
    plan: "enterprise",

    // Limits & Usage
    limits: {
      users: 1000,
      storage: 100000,
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },

    // Settings
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      inferenceEnabled: true,
    },

    // Public info
    website: "https://one.ie",
    createdAt: Date.now(),
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### t' Owns oen
`t` → `oen` via `owns`

```typescript
{
  fromThingId: tId,
  toThingId: oenId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "2025-10-15",
  },
  createdAt: Date.now(),
}
```

### t' is Member of oen
`t` → `oen` via `member_of`

```typescript
{
  fromThingId: tId,
  toThingId: oenId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
```

---

## Key Principles

- **Multi-Tenant Isolation** - Organization partitions the data space
- **Owner Control** - t' has full control (100% ownership)
- **Enterprise Plan** - Unlimited resources for growth
- **Ontology Mapping** - Dimension 1 (Organizations) in the 6-dimension model

---

## See Also

- [Owner Profile](../people/t.md)
- [Organization Structure](./organisation.md)
- [Multi-Tenancy](../connections/multitenant.md)
