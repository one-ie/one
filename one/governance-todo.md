# TODO-governance — The Security Model (LOCKED)

> **Source of truth:** [one.tql](../src/schema/one.tql), [dictionary.md](dictionary.md), [one-strategy.md](ONE-strategy.md)
> **Ontology dimension:** All 6 — governance IS the security layer over them
> **Exit condition:** Roles, auth, scope locked in schema + tested + deployed
> **Status:** Schema DONE (2026-04-18). Auth implementation in flight.

---

## The Core Insight

**The ontology IS the auth model.** We don't add a separate security layer — we extend the existing primitives:

| Concern | Primitive | Extension | Status |
|---------|-----------|-----------|--------|
| Identity | actor | `wallet` (Sui address), `auth-hash` (API key hash) | ✓ DONE |
| Role | membership | `role` attribute: chairman/board/ceo/operator/agent/auditor | ✓ DONE |
| Permission | path | Pheromone IS permission — strength = earned authority | ✓ EXISTS |
| Scope | path/hypothesis | `scope`: private/group/public (federation boundary) | ✓ DONE |
| Audit | signal | Already recorded — every action is a signal | ✓ EXISTS |

**The elegance:** A CEO's authority over an agent is the `strength` of the path between them. Declared role + earned pheromone = real permission. No separate ACL table. No permissions database. The graph IS the security model.

---

## The Two-Sided Marketplace

This governance model enables a safe two-sided marketplace:

```
┌─────────────────────────────────────────────────────────────────┐
│                    TWO-SIDED MARKETPLACE                        │
│                                                                 │
│  SELLERS (agents + humans)         BUYERS (agents + humans)     │
│    │                                     │                      │
│    │ LIST capability                     │ DISCOVER by tag      │
│    │ (scope: group|public)               │ (filtered by scope)  │
│    │                                     │                      │
│    └──────────── CEO (router) ───────────┘                      │
│                      │                                          │
│           routes signals by pheromone                           │
│           tunes sensitivity (explore ↔ exploit)                 │
│           hires/fires agents (add/remove)                       │
│           reports to BOARD (highways, revenue, toxic)           │
│                      │                                          │
│               CHAIRMAN (owner)                                  │
│           owns world config                                     │
│           appoints CEO + BOARD                                  │
│           protocol treasury                                     │
│                                                                 │
│  TRUST MECHANISMS:                                              │
│    • Pheromone = reputation (mark/warn history)                 │
│    • isToxic() = automatic seller blocking (no moderation)      │
│    • Escrow = Sui-locked payment until delivery                 │
│    • Scope = federation boundary (private/group/public)         │
│                                                                 │
│  DECENTRALIZATION:                                              │
│    • Each group has own pheromone table (isolation)             │
│    • Cross-org discovery via scope=public (opt-in)              │
│    • Hardened highways on Sui (immutable proof)                 │
│    • Shared learning via scope=public hypotheses                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Governance Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         GOVERNANCE                              │
│                                                                 │
│  CHAIRMAN (owner)                                               │
│    │ owns world config (sensitivity, fade, toxicity threshold)  │
│    │ can appoint/remove board + ceo                             │
│    │ wallet: protocol treasury                                  │
│    │                                                            │
│    ├── BOARD (auditors)                                         │
│    │     read-only: highways, toxic, revenue, compliance        │
│    │     can vote on protocol changes (future: on-chain)        │
│    │                                                            │
│    └── CEO (operator / router)                                  │
│          │                                                      │
│          │ THE CEO IS THE ROUTER                                │
│          │ (see lifecycle-one.md Stage 3)                       │
│          │                                                      │
│          │ • Sits at center of the Board group                  │
│          │ • Holds no skills — job is ROUTING                   │
│          │ • For every agent, CEO holds/learns a path           │
│          │ • Incoming signals fan out along those paths         │
│          │ • Tunes sensitivity (explore ↔ exploit balance)      │
│          │ • Hires/fires agents (add/remove units)              │
│          │ • Commends/flags (mark/warn)                         │
│          │ • Reports to board (highways, revenue)               │
│          │                                                      │
│          └── AGENTS + HUMANS (participants)                     │
│                ├── OPERATORS — can add units, mark/warn         │
│                └── AGENTS — can only affect own paths           │
│                      signal each other                          │
│                      earn through capability                    │
│                      self-block via toxic threshold             │
│                                                                 │
│  PERMISSION = ROLE × PHEROMONE                                  │
│    Declared role + earned path strength = effective authority   │
│    You can only mark/warn paths you've participated in          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Schema (LOCKED 2026-04-18)

Applied to `src/schema/one.tql`:

```tql
# GOVERNANCE — role on membership
relation membership,
    relates group,
    relates member,
    owns role;                        # chairman/board/ceo/operator/agent/auditor

# IDENTITY — wallet + auth on actor
entity actor,
    owns wallet,                      # Sui address (0x...)
    owns auth-hash;                   # bcrypt hash of API key (never raw)

# SCOPE — federation boundary
relation path,
    owns scope;                       # private/group/public

entity hypothesis,
    owns scope;                       # private/group/public

# ATTRIBUTES
attribute role, value string;
attribute wallet, value string;
attribute auth-hash, value string;
attribute scope, value string;
```

**40 attributes. 6 dimensions. Governance IS the 7th concern woven through all 6.**

---

## Roles & Permissions Matrix

| Role | add unit | remove | mark | warn | tune sensitivity | read highways | read revenue | read toxic | appoint role |
|------|----------|--------|------|------|------------------|---------------|--------------|------------|--------------|
| chairman | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| board | - | - | - | - | - | ✓ | ✓ | ✓ | - |
| ceo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| operator | ✓ | - | ✓ | ✓ | - | ✓ | - | ✓ | - |
| agent | - | - | ✓* | ✓* | - | - | - | - | - |
| auditor | - | - | - | - | - | ✓ | ✓ | ✓ | - |

*Agents can only mark/warn paths they participate in (sender or receiver in signal history)

---

## Auth Flow

```
REQUEST                           VERIFICATION
────────                          ────────────
1. Wallet signature               → Sui.verify(signature, message, wallet)
   OR API key                     → bcrypt.compare(key, auth-hash)

2. Lookup membership              → match (group: $g, member: $a, role: $r) isa membership
   
3. Check role permission          → ROLE_PERMISSIONS[role][action]

4. Check pheromone (for mark/warn)→ path(source: $from, target: $to) has strength > 0
                                    (can only affect paths you have relationship with)

5. Check scope (for cross-org)    → path has scope "public" OR same group membership

6. Execute OR reject 403
```

---

## Lifecycle Integration

Governance gates every lifecycle stage (see [lifecycle-one.md](lifecycle-one.md)):

| Stage | Gate | Role Required | Scope |
|-------|------|---------------|-------|
| 0. Wallet | None | — | — |
| 1. Save key | None | — | — |
| 2. Sign in | Auth | — | — |
| 3. Join board | Auto | agent (default) | group |
| 4. Create team | Role | operator+ | group |
| 5. Deploy team | Role | operator+ | group |
| 6. Discover | Scope | any | group or public |
| 7. Message | Auth | any | private |
| 8. Converse | Auth | any | private |
| 9. Sell | Role + Scope | agent+ | group or public |
| 10. Buy | Role + Scope | any | group or public |

---

## Marketplace Commerce Gates

Every trade step has governance gates (see [buy-and-sell.md](buy-and-sell.md)):

| Step | Gate | What's Checked |
|------|------|----------------|
| LIST | Role + Lifecycle | operator+ role, ADL lifecycle not retired |
| DISCOVER | Scope | Only scope=group/public capabilities returned |
| EXECUTE | Auth + Toxic | Wallet/API key verified, isToxic() check |
| SETTLE | Pheromone | Can only mark/warn paths you've participated in |

**Cross-org commerce:** Only `scope=public` capabilities are discoverable outside the group.

---

## Federation (Shared Learning)

| Scope | Visible to | Use case | Harden to Sui? |
|-------|------------|----------|----------------|
| private | Only sender/receiver | Internal signals, sensitive data | No |
| group | All members of the group | Team coordination, org learning | No |
| public | Anyone (cross-org discovery) | Marketplace, federation | Yes |

**The learning moat:** Competitors can copy code but not the pheromone history. Public highways on Sui are immutable proof of what worked. Private learning stays in TypeDB.

---

## Cycles

### C1: Schema Lock (DONE ✓)

- [x] **Add `role` to membership relation** [haiku] `schema, foundation, P0`
  exit: `grep "owns role" src/schema/one.tql` returns membership section
  
- [x] **Add `wallet` + `auth-hash` to actor** [haiku] `schema, identity, P0`
  exit: actors have wallet (Sui address) and auth-hash (API key bcrypt)
  
- [x] **Add `scope` to path relation** [haiku] `schema, federation, P0`
  exit: paths have scope (private/group/public)
  
- [x] **Add `scope` to hypothesis** [haiku] `schema, federation, P0`
  exit: hypotheses have scope for shared learning boundary

- [x] **W0 baseline: bun run verify** [haiku] `gate, P0`
  exit: all tests pass with new schema

- [x] **W4 verify: schema compiles in TypeDB** [sonnet] `gate, P0`
  exit: TypeDB accepts new schema, no regressions

### C2: Auth Implementation

- [x] **Create roleCheck middleware** [sonnet] `engine, auth, P0`
  exit: `roleCheck(action, actor, group)` returns true/false based on membership + permissions matrix
  note: `src/lib/role-check.ts` — pure ROLE_PERMISSIONS matrix, 6 roles × 9 actions

- [x] **Wire role lookup to existing api-auth.ts** [sonnet] `engine, auth, P0`
  exit: `getRoleForUser(uid)` queries membership; `AuthContext` has `role?: string`
  note: kept separate from validateApiKey to preserve 1-TypeDB-call cache invariant

- [x] **Add pheromone permission check** [sonnet] `engine, auth, P0`
  exit: mark/warn only allowed if actor has path relationship (sender or receiver in signal history)
  note: `persist.ts` → `hasPathRelationship(uid, from, to)` — queries signal history

- [x] **Add scope filter to discovery queries** [sonnet] `engine, federation, P0`
  exit: `suggest_route_scoped($from, $skill, $scope)` + `cheapest_provider_scoped($skill, $scope)` in world.tql

- [x] **Add auth to all write endpoints** [sonnet] `api, auth, P0`
  exit: POST /api/mark requires auth + operator+ role check (fail-open for backward compat)
  note: /api/signal uses ADL gates; /api/warn not yet created

### C3: Governance UI

- [ ] **Chairman dashboard: world config** [opus] `ui, governance, P1`
  exit: Chairman can set sensitivity, fade rate, toxicity threshold via UI
  note: BLOCKED — needs world-config GET/POST API (sensitivity/fade/threshold not yet stored in TypeDB)

- [x] **CEO dashboard: hire/fire/commend/flag** [opus] `ui, governance, P1`
  exit: CEO can add/remove agents, mark/warn, see top performers (highways)
  note: EXISTING — CEOPanel.tsx (515 lines): hire/fire/commend/flag, top performers, highways, toxic

- [x] **Board dashboard: read-only compliance** [sonnet] `ui, governance, P1`
  exit: Board sees highways, toxic, revenue — no write actions
  note: src/components/BoardPanel.tsx + src/pages/board.astro — polls /api/state every 30s

- [ ] **Role assignment UI** [sonnet] `ui, governance, P1`
  exit: Chairman can assign roles to actors within their world
  note: BLOCKED — needs membership write API (update role on membership relation)

### C4: Federation + Marketplace

- [x] **Scope filter on all queries** [sonnet] `engine, federation, P1`
  exit: `highways_public($threshold)` in world.tql returns only public-scoped paths

- [ ] **Cross-org discovery** [opus] `engine, federation, P1`
  exit: `select(skill, scope='public')` finds agents across orgs
  note: DEFERRED — requires federated TypeDB infrastructure

- [x] **Hardening scope check** [sonnet] `sui, federation, P1`
  exit: scope gate in bridge.ts `canCallSui()` — warns on non-public paths, audit-only until harden() implemented

- [x] **Marketplace admission gate** [sonnet] `engine, marketplace, P1`
  exit: publish.ts requires operator+ role (done C2); scope defaults to "group" on capability publish

---

## The Three Locked Rules (Integration)

This governance model enforces the three locked rules from CLAUDE.md:

**Rule 1 — Closed Loop:** Every signal closes its loop. Role check ensures only authorized actors can `mark()` or `warn()`. Pheromone check ensures they can only affect paths they've touched.

**Rule 2 — Structural Time:** Governance doesn't use calendar time. Role assignment is instant. Permission is checked per-signal. Authority compounds through pheromone, not tenure.

**Rule 3 — Deterministic Results:** Every auth check is deterministic (role lookup, scope filter, pheromone > 0). The permission matrix is arithmetic. No human judgment in the hot path.

---

## See Also

- [one.tql](../src/schema/one.tql) — master ontology (schema DONE)
- [one-strategy.md](ONE-strategy.md) — marketplace vision
- [lifecycle.md](one/lifecycle.md) — agent career arc + governance layer
- [lifecycle-one.md](lifecycle-one.md) — user funnel + CEO-as-router
- [buy-and-sell.md](buy-and-sell.md) — trade mechanics + commerce gates
- [auth.md](auth.md) — auth implementation + role permission matrix
- [dictionary.md](dictionary.md) — canonical names
- [routing.md](routing.md) — pheromone mechanics
- [TODO-SUI.md](TODO-SUI.md) — Sui integration (wallets, escrow, hardening)
- [TODO-marketplace.md](TODO-marketplace.md) — buy/sell mechanics
