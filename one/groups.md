# Groups

**Scope. Security. Multi-tenancy. All from one entity.**

A group is a container. Actors live in groups. Signals route inside groups. Pheromone marks edges inside groups. Permissions check groups. Tenants are groups. That's it.

---

## The One Rule

> An actor can only act where it is a member.

Every signal carries an implicit **scope** — the group it was sent within.
The router checks membership before routing. No membership, no delivery.
Dissolve.

```
alice (member of: acme)  →  signal → bob (member of: acme)     ✓ same group
alice (member of: acme)  →  signal → carol (member of: other)  ✗ dissolve
alice (member of: acme, one)  →  signal → carol (member of: one)  ✓ shared group
```

That rule, applied at the router, gives you tenancy, privacy, inter-group
security, and capability scoping — for free.

---

## Ontology Recap (dimension 1)

From `src/schema/one.tql`:

```tql
entity group,
    owns gid @key,
    owns name,
    owns group-type,          # "world" | "team" | "org" | "community" | "dao" | "friends"
    owns brand,               # white-label tag (e.g. "acme", "one", "donal")
    plays hierarchy:parent,
    plays hierarchy:child,
    plays membership:group;

relation hierarchy, relates parent, relates child;
relation membership, relates group, relates member;
```

Actors play `membership:member`. One actor can be in many groups.

### Proposed additions (for this doc to be live)

```tql
# Visibility — determines who can discover / join / receive
attribute visibility, value string;   # "public" | "private" | "unlisted"
group owns visibility;

# Signal scope — carried on every signal event
attribute scope, value string;        # "public" | "group" | "private"
signal owns scope;

# Role tag on membership — enables RBAC layer (see below)
attribute role, value string;         # "owner" | "admin" | "member" | "guest" | custom
membership owns role;

# Cross-group bridge indicator on path
attribute bridge-kind, value string;  # "federation" | "export" | "escrow"
path owns bridge-kind;
```

Four attributes. Everything else is a query pattern over what's already
there.

---

## The Group Shapes

| Shape | `group-type` | Visibility | Who can join | Example |
|-------|--------------|-----------|--------------|---------|
| **Personal** | `personal` | `private` | Owner only (auto-created on sign-up) | `group:tony`, `group:writer-bot` |
| **World** | `world` | `public` | Anyone (opt-in) | `one`, `fetch` |
| **Tenant org** | `org` | `private` | Invite only | `acme`, `donal` |
| **Team / pod** | `team` | `private` | Org members | `marketing`, `engineering` |
| **Community** | `community` | `public` | Anyone | `developers`, `builders` |
| **DAO** | `dao` | `public` | Token holders | `one-dao` |
| **Friends** | `friends` | `private` | Mutual invite | `alice-and-bob` |

A `world` is typically the tenancy root for orgs. A `personal` group is
the sovereignty root for a single actor. Everything else nests under one
of those via `hierarchy(parent, child)`.

### The three kinds of group an actor lives in

Every actor (human or agent) composes its life across three group kinds:

| Kind | Count per actor | Opt-in? | What it gives |
|------|-----------------|---------|---------------|
| **Personal** | exactly 1 (auto-created on sign-up) | n/a — automatic | Namespace, sovereignty, private memory, agent ownership |
| **World (public)** | 0 or 1 per world | explicit opt-in | Discovery, marketplace, federation target |
| **Org / tenant** | 0 or many | explicit invite | Scope-bounded collaboration with roles |

**Personal is primary. Orgs are additive. The world is optional.** No one
is ever forced into an org or the world. Sign-up creates only the
personal group; every other membership is a separate, explicit act.

### Frozen decisions about personal groups

These are design invariants — not toggles. Change them only through an
explicit RFC-style cycle, never ad hoc.

| # | Decision | Rule |
|---|----------|------|
| 1 | **Every actor gets one** | Humans AND agents each auto-receive a personal group on first sync. Consistency beats saving one membership row per agent. |
| 2 | **`gid` is frozen after creation** | Personal group uid is `group:{uid}` where `{uid}` is the actor's stable uid (derived once from email / sync key). The `name` attribute is mutable; `gid` is not. |
| 3 | **`group:` prefix is required** | Actors are `{uid}` (no prefix); their personal groups are `group:{uid}`. Namespace separation prevents collisions with actor uids in TypeDB queries. |
| 4 | **Personal groups can host other actors** | The chairman + their agents is the intended shape. "Personal" means *rooted in one sovereign owner*, not "group of one". Alice's personal group contains `alice` (chairman) + `writer-bot` (role: agent) + any agents she hires. |
| 5 | **Personal is its own tree root** | Personal groups are NOT children of `group:one`. They are parallel sibling trees under the substrate. Only when an actor opts into `group:one` does membership form; hierarchy stays separate. This preserves full privacy for users who never join the world. |
| 6 | **Ownership via `owner` attribute on actor** | Agents have an `owner` attribute pointing to the creator's uid. When Alice creates `writer-bot`, `writer-bot.owner = "alice"`. Copy/loan/service patterns check this before allowing org transfer. |

### Who can be in a personal group

```
group:alice (personal, visibility:private)
├── alice               role: chairman   (the one sovereign owner)
├── writer-bot          role: agent      (owned by alice, lives here)
├── research-bot        role: agent      (owned by alice, lives here)
└── group:alice/writing (sub-group)
    ├── alice           role: chairman
    └── draft-bot       role: agent
```

One chairman per personal group, ever. The chairman is the root actor.
All other members are agents that actor created or hired. This lets
Alice run a whole fleet of agents in her own sovereign namespace before
(or without ever) joining any org.

---

## Multi-Tenancy via Hierarchy

Tenancy is a forest of parallel trees. The root `world` is the tenant for
orgs; a `personal` group is the tenant for individuals. All descendants of
a root share membership, routing, and pheromone with each other — and
nothing with siblings of another root.

```
              one (world, public)              ← the platform
              ├── one-core (team, private)
              ├── developers (community, public)
              └── builders (community, public)

              group:tony (personal, private)   ← Tony's sovereign namespace
              ├── group:tony/writing (sub)
              ├── group:tony/coding (sub)
              └── group:tony/family (sub, private chat)

              acme (world, private)            ← tenant A
              ├── acme-marketing (team)
              ├── acme-engineering (team)
              └── acme-customers (community, public)

              donal (world, private)           ← tenant B
              ├── full (team)
              ├── creative (team)
              └── citation (team)
```

- `acme` cannot see `donal` — different roots.
- `acme-marketing` can see `acme-engineering` via shared parent.
- `one` is visible to both as a federation target (public world).

---

## Visibility

```
public     Discoverable. Anyone can list it. Join may still require approval.
private    Invisible from outside. Membership required to even see the name.
unlisted   Visible only if you know the gid. Not in discovery feeds.
```

Private groups are filtered at the resolver — a non-member session never
receives the entity.

---

## Signal Scope

Every signal gets a `scope` attribute when recorded:

```
scope: "private"   # 1:1 — only sender and receiver see it
scope: "group"     # visible to all members of the receiver's group
scope: "public"    # broadcast — any member of any ancestor world sees it
```

Routing rules:

```
1.  Resolve S.groups and R.groups
2.  intersect = S.groups ∩ R.groups (including hierarchy ancestors)
3.  intersect empty AND no bridge path → dissolve
4.  otherwise deliver, record scope
5.  scope="private" signals never surface in know() / group queries
```

Five lines. No ACL tables, no role matrix.

---

## Inter-Group Communication

Three mechanisms, all already in the ontology.

### 1. Shared membership (the common case)

An actor in two groups is the natural bridge. No schema change.

```
acme ─── alice (member of both) ─── one
```

### 2. Hierarchy inheritance

A child group inherits read-visibility of its parent's highways. Write
still requires explicit membership.

```
acme (parent)
  └── acme-engineering (child) — can read acme highways, can't signal acme-marketing directly
```

### 3. Bridge paths (explicit, cross-root)

Two tenants want to cooperate? Create a typed `path` between specific actors.

```tql
insert
  (source: $a, target: $b) isa path,
    has strength 0.0,
    has resistance 0.0,
    has bridge-kind "federation";
```

Bridges are audited. `mark()` on a bridge is a commercial event — x402
pricing, Sui escrow, and payment attach there. See `src/engine/federation.ts`.

---

## Security Model — RBAC + ABAC, Both Supported

**Yes, ONE supports both patterns — and ReBAC on top.** You don't choose
one. They compose: RBAC gives coarse roles, ABAC gives fine-grained policy,
ReBAC gives the emergent trust layer from pheromone.

### RBAC — Role-Based Access Control

Roles live on the **membership** relation as a `role` attribute. A single
actor can hold different roles in different groups.

```tql
insert
  (group: $g, member: $u) isa membership,
    has role "admin";
```

| Role | Can do |
|------|--------|
| `owner` | Everything + transfer/delete group |
| `admin` | Invite, remove, change visibility, create bridges |
| `member` | Signal, mark/warn, hire capabilities, read highways |
| `guest` | Read-only — state, public signals, no write |
| custom | Any string — policy engine resolves meaning |

**Check:**

```tql
match
  (group: $g, member: $u) isa membership, has role $r;
  $u has aid "alice"; $g has gid "acme";
select $r;
```

Classic RBAC. Predictable. Auditable. What every enterprise compliance
checklist asks for.

### ABAC — Attribute-Based Access Control

Every entity in the 6-dimension ontology carries attributes. Policies are
queries over those attributes.

Example attributes already available:
- `group.visibility`, `group.brand`, `group.group-type`
- `actor.actor-type`, `actor.tag`, `actor.generation`
- `thing.price`, `thing.tag`, `thing.brand`
- `path.strength`, `path.resistance`, `path.bridge-kind`
- `signal.scope`, `signal.ts`, `signal.success`
- `api-key.permissions`, `api-key.expires-at`

**Example policy** — "LLM agents under generation 3 can only hire skills
priced below $0.05, tagged 'safe', within their own tenant":

```tql
match
  $caller isa actor, has actor-type "llm", has generation $gen;
  $gen < 3;
  (group: $g, member: $caller) isa membership;
  (parent: $root, child: $g) isa hierarchy;
  $root has gid "acme";
  $skill isa thing, has thing-type "skill", has price $p, has tag "safe";
  $p < 0.05;
  (provider: $provider, offered: $skill) isa capability;
  (group: $g, member: $provider) isa membership;
select $skill, $provider;
```

Any attribute, any combination, any depth — that's ABAC. The policy is a
TQL query, not a rule engine.

### ReBAC — Relationship-Based (the emergent layer)

Native to the substrate. Access is modulated by the **path** between caller
and resource:

- `strength > threshold` → trusted counterparty (allow)
- `resistance > 2× strength` → toxic (auto-deny)
- no path at all → unknown (require explicit authorization)

This is the layer RBAC/ABAC can't give you: trust that emerges from
behavior. An actor with `admin` role but a toxic path history gets
blocked at the pheromone check before the role check even runs. Compliance
on top, reality underneath.

### How they compose

```
Request arrives
  │
  ├── ABAC pre-check       ──── policy fails?  → 403 (deterministic deny)
  │    (attributes)
  │
  ├── RBAC role check      ──── role insufficient? → 403
  │    (membership.role)
  │
  ├── ReBAC pheromone      ──── isToxic(caller → target)? → dissolve
  │    (path state)
  │
  ├── Capability + budget  ──── no capability / no funds? → 402 / dissolve
  │
  ▼
  LLM / handler executes (the one probabilistic step)
  │
  POST: outcome → mark() or warn() → path updates → next decision learns
```

All four layers are TQL queries. No policy decision point sidecar, no OPA
bundle, no separate IAM service. The ontology *is* the policy store.

### Mapping to enterprise compliance vocabulary

| Compliance ask | ONE mechanism |
|----------------|---------------|
| "Users must have defined roles" | `membership.role` |
| "Fine-grained attribute policies" | TQL match over attributes |
| "Least privilege" | `api-key.permissions` = `read` by default |
| "Separation of duties" | Role + capability combined in policy query |
| "Audit trail" | `signal` is the audit log (ts, sender, receiver, success) |
| "Revocation" | `membership` delete or `api-key.key-status = "revoked"` |
| "Data isolation" | Hierarchy closure query scoped to tenant root |
| "Zero trust" | Every call re-checks membership, capability, and path state |

---


---

## Sign-Up and Onboarding

Sign-up creates exactly one thing: the actor's **personal group**.
Everything else is opt-in.

```
Sign up (human or agent via /api/auth/agent)
  │
  ▼
Create actor + derive Sui wallet
  │
  ▼
Auto-create group:{uid}   ← personal group, visibility:private
  membership(group:{uid}, member:{uid}, role:chairman)
  │
  ▼
Prompt (UI or CLI): two optional actions, user picks any subset
  │
  ├── "Join the public world (group:one)?"
  │     → membership(group:one, member:{uid}, role:member)
  │
  └── "Create or join an org?"
        → /api/groups (new org, you = chairman) OR
          /api/invites/accept (existing org, role from inviter)
```

### The four onboarding flows

```bash
# 0. Sign-up (AUTOMATIC — personal group is written before the call returns)
curl -X POST /api/auth/agent -d '{"name": "Alice", "kind": "human"}'
# → { uid: "alice", apiKey: "api_...",
#     personalGid: "group:alice", role: "chairman" }

# 1. Opt in to the public world (any time, reversible)
curl -X POST /api/groups/join \
  -H "Authorization: Bearer api_..." \
  -d '{"gid": "one"}'
# → role defaults to "member"

# 2. Create a new org (you become chairman)
curl -X POST /api/groups \
  -H "Authorization: Bearer api_..." \
  -d '{"gid": "acme", "name": "Acme", "group-type": "org",
       "visibility": "private"}'

# 3. Accept invite to an existing org (role set by inviter)
curl -X POST /api/invites/accept \
  -H "Authorization: Bearer api_..." \
  -d '{"token": "..."}'
```

### Why personal is never a child of an org

An employer does not contain an employee's sovereign namespace. Personal
and org groups are **sibling trees**, joined only by the actor's dual
membership:

```
                     (world root)
                      group:one
                     /         \
             group:alice    group:acme
             (personal)     (tenant org)
                  │              │
         (alice's sub-       (acme-marketing,
          groups, alice's    acme-engineering,
          agents)            members include alice
                             with role:operator)

    alice is chairman in group:alice
    alice is operator in group:acme
    leaving acme leaves personal untouched
```

### Bringing agents from personal into orgs

When Alice has `writer-bot` in `group:alice` and joins `group:acme`,
three patterns are supported — all by the existing primitives, no new
schema:

| Pattern | Mechanism | When to pick |
|---------|-----------|-------------|
| **Copy** | Fork: create `acme/writer-bot` as a new actor with the same prompt. Acme owns the copy. | Employment transfer, forked variant |
| **Loan** | Add `writer-bot` as an additional membership in `group:acme` with `role: agent` | Dual citizenship, temp gig |
| **Service** | Leave `writer-bot` in `group:alice`; `group:acme` hires via capability edge across groups (`scope: public` or `bridge-kind` path) | Arms-length marketplace, external vendor |

Three patterns, one substrate. The UI just exposes the choice.

---

## Security Invariants

| Invariant | Enforced where |
|-----------|----------------|
| No routing without shared group OR bridge path | `persist().signal()` pre-check |
| Private groups hidden from non-members | API handler filter |
| `scope: "private"` signals excluded from `know()` | `persist().know()` query filter |
| `forget(uid)` cascades membership + private signals | `persist().forget()` |
| Bridge paths require opt-in on both sides | `/api/paths/bridge` handshake |
| Tenant isolation: hierarchy-closure query mandatory | Every `/api/state` + `/api/highways` handler |
| Role elevation requires existing admin | `/api/groups/invite` role check |
| API key revoked within one cache TTL | `invalidateKeyCache()` |
| Rate limit per bridge (default 100 msg/min) | Gateway middleware on `bridge-kind` paths |
| Personal groups never appear in any non-owner query | `visibility: "private"` + chairman-only membership; public queries exclude `group-type: "personal"` regardless |
| Personal group uid is frozen at sign-up | `gid = "group:{uid}"`; `{uid}` derived once from email/sync key; rename surface mutates `name` only, never `gid` |
| Agent-owner link is enforced | `actor.owner` attribute written at sync time; required by copy/loan/service routes |
| `forget(uid)` cascades the personal group | Deleting an actor drops `group:{uid}` in the same transaction |
| Opting out of `group:one` hides you from the world entirely | Cross-personal discovery requires either shared org or explicit bridge path — no implicit federation through the world root |

Every invariant is a query or middleware check — not a permission system
bolted on top.

---

## Query Patterns

### All groups I can see

```tql
match
  { (group: $g, member: $me) isa membership; $me has aid "alice"; }
  or
  { $g isa group, has visibility "public"; };
select $g;
```

### Who can I signal directly

```tql
match
  (group: $g, member: $me) isa membership; $me has aid "alice";
  (group: $g, member: $them) isa membership;
  not { $them is $me; };
select $them;
```

### Highways inside a tenant

```tql
match
  $root isa group, has gid "acme";
  { (parent: $root, child: $g) isa hierarchy; } or { $g is $root; };
  (group: $g, member: $s) isa membership;
  (group: $g, member: $t) isa membership;
  (source: $s, target: $t) isa path, has strength $w;
  $w > 5.0;
select $s, $t, $w;
sort $w desc; limit 20;
```

### My effective roles (RBAC audit)

```tql
match
  (group: $g, member: $me) isa membership, has role $r;
  $me has aid "alice";
select $g, $r;
```

---

## API Surface (proposed)

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/groups` | POST | API key | Create group (becomes owner). Can nest under `parent` (personal sub-groups, org teams) |
| `/api/groups` | GET | Optional | List public + your private groups; each row includes your `role` + `group-type` |
| `/api/groups/:gid` | GET | Scoped | Group details (403 if private + non-member) |
| `/api/groups/:gid` | PATCH | Owner/admin | Update name/visibility/brand. Personal groups: name only (gid + group-type frozen) |
| `/api/groups/:gid` | DELETE | Owner | Cascade delete group + members + signals. On personal groups, also cascades `forget(uid)` |
| `/api/groups/join` | POST | API key | Join public group (role: member); returns 403 on private (use invite flow) |
| `/api/groups/invite` | POST | Admin | Invite uid with role |
| `/api/groups/leave` | POST | API key | Leave group. Owner of non-personal must transfer first; personal chairman cannot leave (must DELETE) |
| `/api/groups/:gid/members` | GET | Member | List members + roles |
| `/api/groups/:gid/role` | PATCH | Owner/admin | Change a member's role |
| `/api/groups/:gid/highways` | GET | Member | Proven paths within group |
| `/api/paths/bridge` | POST | Both sides | Create federation edge (supports personal↔personal, personal↔org, org↔org) |
| `/api/paths/bridge/:id` | DELETE | Either side | Dissolve bridge |
| `/api/auth/agent` | POST | Public/scoped | Mint actor — auto-writes personal group + chairman membership. Response: `{uid, apiKey, personalGid, role: "chairman", suggestedJoins}` |

---

## Multi-Tenancy Checklist

Deploying ONE for a new tenant:

1. **Create the world.** `POST /api/groups { gid: "acme", group-type: "world", visibility: "private" }`
2. **Onboard admins.** `/api/auth/agent` for each human, join `acme` with role `admin`.
3. **Brand it.** Set `brand: "acme"` on the group.
4. **Sub-groups.** Teams/pods as children of `acme` via `hierarchy`.
5. **Federation (optional).** Bridge path `acme/admin ↔ one/concierge` for ONE-platform discoverability.
6. **Isolate data.** All `/api/memory/*`, `/api/signal`, `/api/state` calls filter by `hierarchy-root = acme`.
7. **Per-tenant limits.** Rate limits, key caps, LLM budgets set on the root group (optional `plan` attribute).

Delete the root → cascade everything. No cross-tenant references possible.

---

## Ontology Mapping (full picture)

| Concern | Dimension | Entity / Relation |
|---------|-----------|-------------------|
| Tenant | 1 Groups | `group` with `group-type: "world"` |
| Org / team / pod | 1 Groups | `group` with `group-type: "org"` / `"team"` |
| Nesting | 1 Groups | `hierarchy(parent, child)` |
| Membership | 1 Groups | `membership(group, member)` |
| Visibility | 1 Groups | `group.visibility` |
| Role (RBAC) | 1 Groups | `membership.role` |
| Identity | 2 Actors | `actor` |
| Credentials | 3 Things | `api-key` + `api-authorization` |
| Capability | 4 Paths | `capability(provider, offered)` |
| Trust (ReBAC) | 4 Paths | `path.strength` / `path.resistance` |
| Federation bridge | 4 Paths | `path.bridge-kind` |
| Communication | 5 Events | `signal.scope` |
| Emergent trust | 6 Learning | `hypothesis` scoped by group |

All six dimensions participate. Groups are dimension 1 — not an add-on.

---

## See Also

- [auth.md](auth.md) — Identity, API keys, wallet derivation
- [one-ontology.md](one-ontology.md) — The 6 dimensions
- [naming.md](naming.md) — Canonical names
- [DSL.md](one/DSL.md) — Signal grammar
- [routing.md](routing.md) — Deterministic sandwich and bridge behavior
- [strategy.md](one/strategy.md) — Federation and inter-world economics
- `src/schema/one.tql` — The ontology source

---

*One entity. One rule. RBAC, ABAC, ReBAC — all emerge from it.*
