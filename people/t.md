# t'

**Role:** Organization Owner (`org_owner`)
**Email:** t@one.ie
**Username:** t
**Website:** one.ie

---

## Identity

- **Name:** t'
- **Email:** t@one.ie
- **Username:** t
- **Role:** `org_owner`
- **Website:** one.ie

---

## The Person Entity

```typescript
{
  type: "creator",
  name: "t'",
  properties: {
    role: "org_owner",
    email: "t@one.ie",
    username: "t",
    displayName: "t'",
    bio: "Organization owner",
    website: "one.ie",

    // Permissions
    permissions: ["*"],  // All permissions as org owner

    // Organization context
    organizationId: null,  // Set when linked to organization
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
```

---

## Ownership Connections

### Owns Organization
`t` → `org` via `owns`

```typescript
{
  fromThingId: tId,
  toThingId: orgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "2025-10-15",
  },
  createdAt: Date.now(),
}
```

### Member of Organization
`t` → `org` via `member_of`

```typescript
{
  fromThingId: tId,
  toThingId: orgId,
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

- **Organization Owner** - Has full control over the organization
- **All Permissions** - `permissions: ["*"]` grants access to everything
- **Ontology Mapping** - Represented as a `creator` thing with role metadata
- **Connection-Based Access** - Access granted via `member_of` connection

---

## See Also

- [Organization Profile](../organisation/t.md)
- [People Roles](./people.md)
- [Organizations](../organisation/organisation.md)
