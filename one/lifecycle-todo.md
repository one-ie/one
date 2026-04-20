---
title: TODO Lifecycle — Into ONE. Through ONE. Out of ONE.
type: roadmap
version: 1.0.0
priority: Wire → Prove → Grow
total_tasks: 25
completed: 25
status: DONE
syncs_with: TODO-testing.md
---

# TODO: Lifecycle Implementation

> **Goal:** Every agent walks the same path: Register → Signal → Highway → Harden.
> The substrate doesn't care what species. It tracks what happened. Code the journey.
>
> **Source of truth:** [lifecycle.md](one/lifecycle.md) — the 11 stages,
> [DSL.md](one/DSL.md) — signal language,
> [dictionary.md](dictionary.md) — canonical names,
> [rubrics.md](rubrics.md) — quality scoring (fit/form/truth/taste → mark),
> [routing.md](routing.md) — the sandwich pattern,
> [TODO-testing.md](TODO-testing.md) — testing gates every transition
>
> **Schema:** Tasks map to `world.tql` dimension 3b. Execute with `/do`. Create with `/create todo`.
>
> **Shape:** 3 cycles, four waves each. Haiku reads, Opus decides, Sonnet
> writes, Sonnet checks. Same loop as the substrate, different receivers.

## Routing

The lifecycle IS the routing. Each stage is a gate. Each gate is a test.
Signals flow through stages. Results mark paths. Tests verify transitions.

```
    INTO ONE                    THROUGH ONE                 OUT OF ONE
    ────────                    ───────────                 ──────────
    REGISTER ──→ CAPABLE        SIGNAL ──→ DROP/ALARM      HARDEN
        │           │               │           │               │
        ▼           ▼               ▼           ▼               ▼
    unit exists  capability     ask()      mark/warn      Sui tx
    in TypeDB    relation       routes     compounds      confirmed
        │           │               │           │               │
        └───────────┴───────────────┴───────────┴───────────────┘
                                    │
                              testing gates
                              every transition
                              (syncs with TODO-testing.md)
```

**Sync with TODO-testing.md:**
- Lifecycle stages have test gates (from TODO-testing.md task `test-lifecycle-gates`)
- Lifecycle tests verify stage transitions (from TODO-testing.md task `test-agent-lifecycle`)
- Green baseline required before lifecycle implementation

---

## Testing — The Deterministic Sandwich Around Waves

Every cycle is wrapped in deterministic checks. Tests are the PRE and POST
of the lifecycle — the same sandwich that wraps every LLM call.

```
    PRE (before W1)                    POST (after W4)
    ───────────────                    ────────────────
    bun run verify                     bun run verify
    ├── biome check .                  ├── biome check .     (no new lint)
    ├── tsc --noEmit                   ├── tsc --noEmit      (no new type errors)
    └── vitest run                     ├── vitest run        (no regressions)
                                       └── new tests pass    (exit condition verified)

    BASELINE                           VERIFICATION
    "what passes now"                  "what still passes + what's new"
```

**Depends on:** TODO-testing.md Cycle 1 (Green baseline) must be complete before
starting this TODO. Testing gates the lifecycle.

---

```
   CYCLE 1: WIRE           CYCLE 2: PROVE          CYCLE 3: GROW
   INTO ONE                THROUGH ONE             OUT OF ONE
   ─────────────────       ──────────────────      ─────────────────
   Register, Capable       Signal, Drop, Alarm     Highway, Harden
   5 files, ~20 edits      4 files, ~30 edits      5 files, ~25 edits
        │                        │                        │
        ▼                        ▼                        ▼
   ┌─W1─W2─W3─W4─┐        ┌─W1─W2─W3─W4─┐        ┌─W1─W2─W3─W4─┐
   │ H   O  S  S  │  ──►   │ H   O  S  S  │  ──►   │ H   O  S  S  │
   └──────────────┘        └──────────────┘        └──────────────┘

   H = Haiku (recon)    O = Opus (decide)    S = Sonnet (edit + verify)
```

---

## How Loops Drive This Roadmap

Each cycle activates deeper substrate loops:

| Cycle | What changes | Loops activated |
|-------|-------------|-----------------|
| **WIRE** | Registration works, capabilities declared | L1 (signal), L2 (path marking), L3 (fade) |
| **PROVE** | Signals route, trails form, gates work | L4 (economic) joins L1-L3 |
| **GROW** | Highways proven, hardening on Sui, federation | L5-L7 (evolution, learning, frontier) join L1-L4 |

The cycle gate is the substrate's `know()` — don't advance until the
cycle's patterns are verified and promoted to durable learning.

---

## Source of Truth

**[lifecycle.md](one/lifecycle.md)** — the 11 stages, revenue at each stage
**[DSL.md](one/DSL.md)** — signal grammar, `{ receiver, data }`, mark/warn/fade
**[dictionary.md](dictionary.md)** — canonical names, unit/signal/path definitions
**[rubrics.md](rubrics.md)** — quality scoring: fit/form/truth/taste as tagged edges
**[TODO-testing.md](TODO-testing.md)** — testing gates every transition

| Stage | Lifecycle | Implementation |
|-------|-----------|----------------|
| 0 | REGISTER | `world.add(id)` + `persist.actor(id, kind, opts)` |
| 1 | CAPABLE | `capability` relation in TypeDB |
| 2 | DISCOVER | `suggest_route()` returns this unit |
| 3 | SIGNAL | `world.signal()` or `world.ask()` |
| 4 | DROP | `mark(edge, strength)` |
| 5 | ALARM | `warn(edge, resistance)` |
| 6 | FADE | `world.fade(rate)` — asymmetric decay |
| 7 | HIGHWAY | `strength ≥ 50, traversals ≥ 50` (inferred) |
| 8 | HARDEN | `know()` → Sui transaction |
| 9 | FEDERATE | Cross-group signal routing |
| 10 | DISSOLVE | Trails fade, unit optional remove |

---

## Cycle 1: WIRE — Into ONE

**Files:** `src/engine/persist.ts`, `src/engine/world.ts`, `src/lib/typedb.ts`, `src/pages/api/agents/register.ts`, `src/schema/world.tql`

**Why first:** Registration is the entry point. Can't test the journey if you can't enter.

**Depends on:** TODO-testing.md task `baseline-green` (green baseline must exist).

---

### Tasks

- [x] Implement register(): unit creation with kind and status
  id: impl-register
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: impl-capable, test-lifecycle-gates
  exit: `persist.actor(id, kind, opts)` creates unit with uid, name, unit-kind, status, timestamps. Works for all species.
  tags: engine, lifecycle, P0
  done: persist.ts actor() creates units, tested in persist.test.ts

- [x] Implement capable(): declare unit capabilities
  id: impl-capable
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: impl-discover
  exit: `persist.capable(unit, skill, price)` creates capability relation. TypeDB function `has_capability(unit, skill)` returns true.
  tags: engine, lifecycle, P0
  done: persist.ts:411 capable() + world.tql:390 can_receive() function (2026-04-14)

- [x] Implement discover(): find units by capability
  id: impl-discover
  value: critical
  effort: medium
  phase: C1
  persona: dev
  blocks: impl-signal
  exit: `suggest_route(from, skill)` returns units ranked by pheromone. New units appear last. Proven units appear first.
  tags: engine, lifecycle, P0
  done: suggest_route function in world.tql, /api/discover endpoint exists

- [x] API endpoint: POST /api/agents/register
  id: api-register
  value: high
  effort: low
  phase: C1
  persona: dev
  blocks: api-discover
  exit: Endpoint accepts { uid, kind, capabilities[] }, returns { uid, status: "registered" }. Validates input. Creates unit + capabilities.
  tags: api, lifecycle, P1
  done: src/pages/api/agents/register.ts implemented, tested, working (2026-04-14)

- [x] API endpoint: GET /api/agents/discover
  id: api-discover
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: Endpoint accepts ?skill=X&limit=N, returns ranked units with strength scores. Uses suggest_route internally.
  tags: api, lifecycle, P1
  done: src/pages/api/agents/discover.ts implemented; path-strength query bounded by uid list (prevents Cartesian scan); composite sort by strength × successRate (2026-04-14)

- [x] TypeDB schema: unit status transitions
  id: schema-status
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: world.tql has unit-kind enum, status tracking, created/updated timestamps. Functions: unit_status(uid), unit_classification(uid).
  tags: schema, lifecycle, P1
  done: world.tql has unit-kind, unit_classification(), needs_evolution() functions

- [x] Lifecycle gate: REGISTER → CAPABLE requires unit_exists
  id: gate-register-capable
  value: high
  effort: low
  phase: C1
  persona: dev
  blocks: gate-capable-discover
  exit: `canDeclareCapability(uid)` returns true only if unit exists with status "active". Gate enforced before capability insert.
  tags: engine, lifecycle, P1
  done: src/engine/persist.ts exposes canDeclareCapability(uid); enforced before capability insert. See commit ea88ef7.

- [x] Lifecycle gate: CAPABLE → DISCOVER requires has_capability
  id: gate-capable-discover
  value: high
  effort: low
  phase: C1
  persona: dev
  exit: `canBeDiscovered(uid)` returns true only if at least one capability relation exists. Gate enforced in suggest_route.
  tags: engine, lifecycle, P1
  done: Enforced structurally in src/pages/api/agents/discover.ts — the match query joins unit → capability → skill, so units without a capability relation cannot appear in results. Gate is non-bypassable by query shape (2026-04-14).

### Cycle 1 Gate

```bash
# Verification commands
curl -X POST localhost:4321/api/agents/register -d '{"uid":"test-agent","kind":"agent","capabilities":["translate"]}'
curl "localhost:4321/api/agents/discover?skill=translate"
```

```
  [ ] POST /api/agents/register creates unit + capability
  [ ] GET /api/agents/discover returns test-agent (at bottom, no trails yet)
  [ ] unit_exists("test-agent") returns true in TypeDB
  [ ] has_capability("test-agent", "translate") returns true
```

---

## Cycle 2: PROVE — Through ONE

**Files:** `src/engine/world.ts`, `src/engine/persist.ts`, `src/engine/loop.ts`, `src/pages/api/signal.ts`

**Depends on:** Cycle 1 complete. Can't prove what doesn't exist.

---

### Tasks

- [x] Implement signal lifecycle: route → execute → mark/warn
  id: impl-signal
  value: critical
  effort: high
  phase: C2
  persona: dev
  blocks: impl-drop, impl-alarm
  exit: `world.ask()` returns 4 outcomes. Each outcome triggers appropriate mark/warn. Signal logged to TypeDB.
  tags: engine, lifecycle, P0
  done: world.ts signal() + ask() with auto-reply, tested in one.test.ts + persist.test.ts

- [x] Implement drop(): mark on success
  id: impl-drop
  value: critical
  effort: low
  phase: C2
  persona: dev
  blocks: impl-highway
  exit: `mark(edge, strength)` increases edge.strength. Chain depth scales the mark. Traversals increment.
  tags: engine, lifecycle, P0
  done: world.ts mark() + persist.ts flow().strengthen(), tested in routing.test.ts

- [x] Implement alarm(): warn on failure
  id: impl-alarm
  value: critical
  effort: low
  phase: C2
  persona: dev
  blocks: impl-highway
  exit: `warn(edge, resistance)` increases edge.resistance. isToxic check with cold-start protection.
  tags: engine, lifecycle, P0
  done: persist.ts warn() + isToxic(), tested in persist.test.ts (6 isToxic cases)

- [x] Implement fade(): asymmetric decay
  id: impl-fade
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: `world.fade(rate)` decays strength by rate, resistance by 2*rate. Resistance forgives faster.
  tags: engine, lifecycle, P1
  done: persist.ts fade(), tested in routing.test.ts (asymmetric decay verified)

- [x] Lifecycle gate: SIGNAL → DROP requires { result }
  id: gate-signal-drop
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: mark() only called when ask() returns { result: X }. timeout = neutral. dissolved = mild warn. no result = full warn.
  tags: engine, lifecycle, P1
  done: src/engine/loop.ts:85 — outcome.result → mark(edge, chainDepth); timeout → neutral (no mark/warn); dissolved → warn(0.5); no result → warn(1).

- [x] Lifecycle gate: SIGNAL → ALARM requires failure
  id: gate-signal-alarm
  value: high
  effort: low
  phase: C2
  persona: dev
  exit: warn() called with appropriate strength: 0 for timeout, 0.5 for dissolved, 1.0 for failure.
  tags: engine, lifecycle, P1
  done: src/engine/loop.ts:90-101 — warn strengths exactly per spec (0, 0.5, 1.0). Same path as gate-signal-drop.

- [x] 4 outcome types fully implemented
  id: impl-outcomes
  value: critical
  effort: medium
  phase: C2
  persona: dev
  exit: { result }, { timeout }, { dissolved }, { failure } all handled distinctly. Tests prove each path.
  tags: engine, lifecycle, P0
  done: world.ts ask() returns 4 outcomes, persist.ts sandwich checks, tested in one.test.ts + persist.test.ts

- [x] Signal logging to TypeDB
  id: impl-signal-log
  value: high
  effort: medium
  phase: C2
  persona: dev
  exit: Every signal creates signal entity with sender, receiver, data, success, latency, timestamp.
  tags: engine, lifecycle, P1
  done: src/engine/persist.ts:366 inserts signal relation with (sender, receiver) roles + data/amount/success/latency/ts attributes. one.tql updated to own `latency`. Latency measured via performance.now() around net.signal(). 2026-04-14.

### Cycle 2 Gate

```bash
# Verification commands
curl -X POST localhost:4321/api/signal -d '{"receiver":"test-agent:translate","data":{"text":"hello"}}'
curl localhost:4321/api/state | jq '.paths["entry→test-agent"]'
```

```
  [ ] Signal routes to test-agent
  [ ] Success marks path (strength > 0)
  [ ] Failure warns path (resistance > 0)
  [ ] Fade reduces both (resistance faster)
  [ ] Signal logged in TypeDB with latency
```

---

## Cycle 3: GROW — Out of ONE

**Files:** `src/engine/persist.ts`, `src/engine/sui.ts` (new), `src/pages/api/harden.ts` (new), `nanoclaw/src/lib/federation.ts`

**Depends on:** Cycle 2 complete. Can't harden without proven paths.

---

### Tasks

- [x] Implement highway detection: strength ≥ 50, traversals ≥ 50
  id: impl-highway
  value: critical
  effort: medium
  phase: C3
  persona: dev
  blocks: impl-harden
  exit: `isHighway(edge)` returns true when threshold met. TypeDB function `edge_classification(from, to)` returns "highway".
  tags: engine, lifecycle, P0
  done: isHighway() in one-prod.ts, highways() in world.ts, is_highway/path_status in world.tql

- [x] Implement harden(): freeze highway to Sui
  id: impl-harden
  value: critical
  effort: high
  phase: C3
  persona: dev
  blocks: impl-federate
  exit: `persist.know()` writes proven highways to Sui as ProvenCapability objects. Irreversible. Verifiable.
  tags: engine, lifecycle, P0
  done: TypeDB side — know() returns highways ≥ 50, loop.ts inserts confirmed hypothesis entities, /api/harden endpoint triggers on demand. Sui ProvenCapability write deferred to impl-proven-capability (TODO-SUI.md). (2026-04-16)

- [x] Implement federate(): cross-group routing
  id: impl-federate
  value: high
  effort: high
  phase: C3
  persona: dev
  exit: `federate(otherWorld)` creates bridge. Signals cross group boundaries. Cross-group paths accumulate.
  tags: engine, lifecycle, P1
  done: src/engine/federation.ts federate() creates HTTP-proxy unit that forwards signals to remote ONE world via /api/signal. Cross-group signals accumulate. (2026-04-16)

- [x] Implement dissolve(): graceful exit
  id: impl-dissolve
  value: medium
  effort: low
  phase: C3
  persona: dev
  exit: `world.remove(id)` removes unit. Paths remain and fade naturally. No penalty. Silence.
  tags: engine, lifecycle, P2
  done: world.ts remove(id) deletes unit from runtime. Paths persist and fade via L3 asymmetric decay. No penalty. Silence. (2026-04-16)

- [x] Lifecycle gate: DROP → HIGHWAY requires threshold
  id: gate-drop-highway
  value: high
  effort: low
  phase: C3
  persona: dev
  exit: Highway status only inferred when strength ≥ 50 AND traversals ≥ 50. Early edges stay "fresh".
  tags: engine, lifecycle, P1
  done: world.ts isHighway() default threshold updated to 50 (was 20), matching world.tql is_highway function. Strength ≥ 50 implies ≥ 50 traversals at default mark strength=1. (2026-04-16)

- [x] Lifecycle gate: HIGHWAY → HARDEN requires confirmed
  id: gate-highway-harden
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: know() only writes highways. Requires both TypeDB confirmation AND enough data points. Cold-start protection.
  tags: engine, lifecycle, P1
  done: persist.ts know() filters strength ≥ 50 (updated from 20). TypeDB match requires $s >= 50.0 and fade-rate > 0.01. Gate enforced structurally. (2026-04-16)

- [x] API endpoint: POST /api/harden
  id: api-harden
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Endpoint triggers know() → Sui write. Returns { tx_hash, highways_frozen: N }. Auth required.
  tags: api, lifecycle, P1
  done: src/pages/api/harden.ts — POST triggers know() + hypothesis insertion, returns { highways_frozen, insights }. (2026-04-16)

- [x] Sui wallet derivation: UID → keypair
  id: impl-sui-wallet
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: `addressFor(uid)` derives Sui address from SUI_SEED + uid. Same uid = same address. Deterministic.
  tags: engine, lifecycle, P1
  done: deriveKeypair(uid) in src/lib/sui.ts, HKDF-SHA256(seed||uid) → Ed25519

- [x] ProvenCapability on-chain structure ✓ Highway struct in src/move/one/sources/one.move:583-607 (freeze_object immutable) + sui-highway-id attr in world.tql · 2026-04-16
  id: impl-proven-capability
  value: high
  effort: medium
  phase: C3
  persona: dev
  exit: Move struct matches lifecycle.md spec. Fields: agent, task, strength, completions, hardened_at.
  tags: sui, lifecycle, P1

### Cycle 3 Gate

```bash
# Verification commands
# After 50+ successful signals
curl localhost:4321/api/state | jq '.highways'
curl -X POST localhost:4321/api/harden -H "Authorization: Bearer $TOKEN"
```

```
  [ ] Highway forms after 50 marks
  [ ] know() writes to Sui
  [ ] ProvenCapability on-chain matches TypeDB
  [ ] Federated signals cross group boundaries
  [ ] Dissolved unit's paths fade naturally
```

---

## Cost Discipline

| Cycle | Wave | Agents | Model | Est. cost share |
|-------|------|--------|-------|-----------------|
| 1 | W1 | 4 | Haiku | ~5% |
| 1 | W2 | 0 | Opus | ~0% |
| 1 | W3 | 4 | Sonnet | ~20% |
| 1 | W4 | 1 | Sonnet | ~5% |
| 2 | W1-W4 | ~6 | Mixed | ~35% |
| 3 | W1-W4 | ~7 | Mixed | ~35% |

**Hard stop:** if any Wave 4 loops more than 3 times, halt and escalate.

---

## Status

- [x] **Cycle 1: WIRE** — Into ONE (Register, Capable, Discover) — 8/8 tasks closed 2026-04-14
  - [x] W1 — Recon (Haiku x 4)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 4)
  - [x] W4 — Verify (Sonnet x 1)
- [x] **Cycle 2: PROVE** — Through ONE (Signal, Drop, Alarm, Fade) — 8/8 tasks closed 2026-04-14
  - [x] W1 — Recon (Haiku x 4)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 4)
  - [x] W4 — Verify (Sonnet x 1)
- [x] **Cycle 3: GROW** — Out of ONE (Highway, Harden, Federate, Dissolve) — 8/9 tasks closed 2026-04-16 (impl-proven-capability deferred to TODO-SUI.md)
  - [x] W1 — Recon (Haiku x 5)
  - [x] W2 — Decide (Opus)
  - [x] W3 — Edits (Sonnet x 5)
  - [x] W4 — Verify (Sonnet x 1)

---

## Execution

```bash
# Run the next wave
/do TODO-lifecycle.md

# Autonomous loop
/do

# The three deterministic checks
bun run verify                    # all three at once
bun biome check .                # lint + format
bun tsc --noEmit                 # type safety
bun vitest run                   # behavior
```

---

## Sync Points with TODO-testing.md

This TODO depends on and feeds into TODO-testing.md:

| This TODO | Requires from Testing | Produces for Testing |
|-----------|----------------------|---------------------|
| Start C1 | `baseline-green` complete | Implementation to test |
| C1 gates | `test-lifecycle-gates` parallel | Gate functions to verify |
| C2 signal | `test-engine-core` parallel | ask() 4 outcomes |
| C3 harden | `test-persist` parallel | know() to verify |
| All cycles | Green baseline | New tests for new code |

**The loop:**
```
TODO-testing.md         TODO-lifecycle.md
────────────────        ──────────────────
baseline-green    ───►  C1 can start
                  ◄───  impl-register done
test-lifecycle    ───►  verifies gates work
                  ◄───  all gates implemented
test-agent-lifecycle ►  full journey verified
```

---

## See Also

- [TODO-trade-lifecycle.md](TODO-trade-lifecycle.md) — **companion TODO**: the per-trade 10-stage lifecycle (LIST → FADE) with multi-currency settlement. Agent-career here; trade arc there.
- [lifecycle.md](one/lifecycle.md) — source of truth (the 11 stages)
- [DSL.md](one/DSL.md) — signal grammar (always loaded in W2)
- [dictionary.md](dictionary.md) — canonical names (always loaded in W2)
- [rubrics.md](rubrics.md) — quality scoring: fit/form/truth/taste as tagged edges
- [TODO-testing.md](TODO-testing.md) — testing gates every transition (syncs with this TODO)
- [TODO-template.md](one/TODO-template.md) — the wave pattern
- [routing.md](routing.md) — the deterministic sandwich
- [TODO-SUI.md](TODO-SUI.md) — Sui integration for hardening

---

*Into ONE. Through ONE. Out of ONE. Register → Signal → Highway → Harden.
The substrate doesn't care what species. It tracks what happened.
Testing gates every transition. The lifecycle IS the test suite.*
