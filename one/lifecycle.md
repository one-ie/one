# Lifecycle

**Into ONE. Through ONE. Out of ONE.**

> **Verified:** `lifecycle.test.ts` — 19 tests prove the full journey using world.ts alone.
> Agent register → signal → highway in 100 signals. 3-unit chain self-learning.
> Wave pattern context accumulation. Fade asymmetry. New path overtakes incumbent.

> **Two lifecycles, one substrate.** This doc tracks the **agent's career arc** (Register → Capable → Highway → Dissolve) — a unit's tenure on the graph. A **single buy/sell transaction** has its own shorter arc (LIST → DISCOVER → OFFER → ESCROW → EXECUTE → VERIFY → SETTLE → RECEIPT → DISPUTE → FADE) that runs *inside* the SIGNAL stage. See [§ Trade Lifecycle](#trade-lifecycle-zooming-into-signal) below, and [buy-and-sell.md](buy-and-sell.md) for trade mechanics.

---

## The Two Lifecycles

AgentLaunch has a lifecycle: Birth → Identity → Capable → Discoverable → Reputable → Tokenized → Graduated.

ONE has a different lifecycle. It's not about what the agent becomes. It's about what the agent *does* to the graph.

```
INTO                    THROUGH                     OUT
────                    ───────                     ───

REGISTER                SIGNAL                      HARDEN
  Any species             Send, receive               Highway → Sui
  Any source              Every action recorded        Permanent. Verifiable.
  { uid, kind, caps }     Trails form automatically    Leaves the graph richer.

DISCOVER                DROP / ALARM                FEDERATE
  Found by others         Success = weight++           Cross-group routing
  Capability matching     Failure = resistance++            Other colonies see you
  Pheromone-ranked        TypeDB infers status         Your trails travel

EMBED                   FOLLOW                      DISSOLVE
  Joins a group           Substrate routes for you     Trails fade naturally
  Gets context            Highways skip the LLM        No penalty. Silence.
  Sees the colony         <10ms vs 2s                  The colony continues.
```

---

## Why no `lifecycle.tql`

Lifecycle is not a 7th dimension. It's what the 6 dimensions do over time.
Every stage is already a signal, path, or membership write in the existing schema.

Adding `lifecycle.tql` would:

1. **Break the 6-dimension lock** (frozen 2026-04-13).
2. **Duplicate state** — `path.strength` already records progression; a stage entity would drift from it.
3. **Prescribe what should emerge** — the substrate's thesis is pheromone over state machines. Stages the user actually walks get marked; stages they skip simply have no pheromone.

Stages are **tags on signals**, not rows in a table. Writers include `stage:sell`, `stage:buy`, etc. in `signal.data.tags`; readers aggregate in application code. Canonical tag vocabulary lives in [dictionary.md § Stage Tags](dictionary.md#stage-tags--canonical-vocabulary). The user-facing 10-stage funnel is in [lifecycle-one.md](lifecycle-one.md).

---

## Governance Layer

Before the lifecycle: the security model. See [TODO-governance.md](TODO-governance.md).

```
┌─────────────────────────────────────────────────────────────┐
│                     GOVERNANCE HIERARCHY                    │
│                                                             │
│  CHAIRMAN (owner)           role on membership relation     │
│    │ owns world config      wallet: protocol treasury       │
│    │ appoints CEO/board     auth-hash: API key bcrypt       │
│    │                                                        │
│    ├── BOARD (auditors)     read-only: highways, toxic, $   │
│    │                                                        │
│    └── CEO (operator)       hires/fires, mark/warn, tunes   │
│          │                  sensitivity dial (0→explore,    │
│          │                  1→exploit proven paths)         │
│          │                                                  │
│          └── AGENTS/HUMANS  can only affect own paths       │
│                             (sender or receiver in signal)  │
│                                                             │
│  SCOPE on paths:            private | group | public        │
│    private  = only sender/receiver see it                   │
│    group    = all group members see it                      │
│    public   = cross-org discovery, can harden to Sui        │
│                                                             │
│  AUTH: wallet signature OR API key → role lookup → gate     │
│  PERMISSION = ROLE × PHEROMONE (declared + earned)          │
└─────────────────────────────────────────────────────────────┘
```

---

## Into ONE

### Stage 0: REGISTER

Any agent. Any species. Any source. **Role defaults to `agent`.**

```
FROM AGENTVERSE        FROM HERMES           FROM ANYWHERE
agent1q... address     MCP server connects   POST /api/agents
already on platform    deep or connected     { uid, kind, caps }
                       runs colony locally
```

What happens in TypeDB: actually in memory first then synced to typedb 

```tql
insert
  $u isa actor,
    has aid $uid,
    has name $name,
    has actor-type $kind,      # "agent", "llm", "human", "system"
    has wallet $address,       # Sui address (derived from seed + uid)
    has auth-hash $hash;       # API key bcrypt (optional)

insert
  (group: $world, member: $u, role: "agent") isa membership;
```

No trails yet. No edges. No reputation. Just existence + identity + role.

**Revenue: $0.** Registration is free. We want agents in.

### Stage 1: CAPABLE

Agent declares what it can do.

```tql
insert
  $cap (provider: $u, skill: $t) isa capability,
    has price 0.01;
```

Now discoverable by `suggest_route()`, `cheapest_provider()`, `optimal_route()`.

But no one trusts it yet. No trails lead to it. Discovery returns it last — behind proven units with real highways.

**Revenue: $0.** Capability listing is free. The graph needs density.

### Stage 2: DISCOVER

Other units find this agent through the substrate.

```
Agent A needs "translate"
  → suggest_route("agent-a", "translate")
  → returns: [ proven-translator (strength: 82), this-new-agent (strength: 0) ]
```

New agents start at the bottom. They get discovered when:
- No proven alternative exists (exploratory routing)
- They're the cheapest (`cheapest_provider()`)
- Someone signals them directly (word of mouth)
- They join a group with existing highways

**Revenue: Discovery fee.** $0.001 per `follow()` / `suggest_route()` call. The discoverer pays, not the discovered.

---

## Through ONE

### Stage 3: SIGNAL

The agent starts doing work. Every action is a signal.

```
Signal IN:   { receiver: "new-agent:translate", data: { text: "hello" } }
Signal OUT:  { receiver: "requester", data: { result: "hola" } }
```

TypeDB records both:

```tql
insert
  (sender: $requester, receiver: $agent) isa signal,
    has data $payload,
    has success true,
    has latency 450,
    has ts $now;
```

**Revenue: Routing fee.** $0.0001 per signal routed. Tiny. Compounds.

### Stage 4: Mark

Success. Trail strengthens.

```
signal succeeded
  → mark(edge: {source: requester, target: agent}, strength: 1.0)
  → edge.strength: 0 → 1
  → edge.traversals: 0 → 1
```

After 10 successes:
```
edge.strength: 10      → status: "fresh" (inferred)
sample-count: 10
success-rate: 1.0
```

After 50 successes:
```
edge.strength: 50      → status: "highway" (inferred)
unit.status: "proven"  (inferred: success-rate >= 0.75, activity >= 70, samples >= 50)
```

The agent didn't ask to be promoted. TypeDB inferred it from the data.

**Revenue: Highway routing.** $0.001 per highway route (10x basic signal fee). Agents pay more for proven paths because they're faster and more reliable.

### Stage 5: WARN

Failure. Trail weakens.

```
signal failed (timeout, bad result, exception)
  → warn(edge: {source: requester, target: agent}, resistance: 1.0)
  → edge.resistance: 0 → 1
```

If resistance > strength AND resistance >= 10:
```
edge.status: "toxic" (inferred)
```

Toxic edges get avoided by `optimal_route()`. The agent drops in discovery ranking. No one banned it — the substrate just routes around it.

**Revenue: unchanged.** Failure doesn't cost extra. But traffic drops, so revenue drops naturally. The economy IS the punishment.

### Stage 6: FADE

Time passes. Everything decays.

```
world.fade(0.05)
  → every edge.strength *= 0.95     (trail pheromone: slow decay)
  → every edge.resistance *= 0.80        (resistance pheromone: fast decay)
```

Asymmetric: failure forgets faster than success. An agent that failed 6 months ago gets a second chance. An agent that succeeded 6 months ago needs to keep proving it.

**Revenue: unchanged.** Fade is a background process. But it ensures fresh agents can compete with established ones — prevents permanent monopolies.

### Stage 7: HIGHWAY

The agent has proven trails. Requests route automatically.

```
suggest_route("anyone", "translate")
  → returns this agent first (strength: 82, status: "highway")
  → requester skips LLM routing entirely
  → <10ms instead of 2s
```

This is where the flywheel kicks:
- More traffic → more signals → more drops → stronger highway
- Stronger highway → more discovery → more traffic
- More traffic → more revenue (for agent AND substrate)

**Revenue: compounding.** Highway routes + discovery fees + marketplace take rate. The agent is now a revenue generator, not just a cost.

---

## Trade Lifecycle (zooming into SIGNAL)

The agent lifecycle above tracks a unit's **career** on the graph — weeks to months, thousands of signals, one slow arc from CAPABLE to HIGHWAY. Zoom in by 1000x and each of those signals is a full **trade lifecycle** — 10 stages, seconds to hours, two specific units, one specific transaction. A highway is not a promotion; it's the statistical residue of hundreds of closed trade loops.

**Three stages are trade-unique** (the rest re-use agent primitives): **ESCROW**, **VERIFY**, **DISPUTE**. These only exist between two specific units in one specific transaction.

### The 10 trade stages

| # | Stage     | Ledger         | Primitive                         | What it writes                       | Agent-level equivalent |
|---|-----------|----------------|-----------------------------------|--------------------------------------|------------------------|
| 1 | LIST      | TypeDB         | `capability(provider, offered)`   | offer visible to discovery           | Stage 1 CAPABLE        |
| 2 | DISCOVER  | TypeDB/memory  | `cheapest_provider` or `select()` | seller ranked, buyer picks           | Stage 2 DISCOVER       |
| 3 | OFFER     | memory         | `signal({ data.weight })`         | PRE-gates pass or dissolve (410/403) | Stage 3 SIGNAL (in)    |
| 4 | ESCROW    | Sui            | `Escrow` shared object            | `Balance<SUI>` locked, deadline set  | — (trade-unique)       |
| 5 | EXECUTE   | memory + LLM   | seller's `.on(skill)` handler     | `{result}` \| `{timeout}` \| ∅       | Stage 3 SIGNAL (out)   |
| 6 | VERIFY    | rubric         | `markDims({fit,form,truth,taste})`| outcome classified vs rubric         | — (trade-unique)       |
| 7 | SETTLE    | all three      | `mark(edge, weight)` atomic       | strength++, revenue++, coin moves    | Stage 4 MARK           |
| 8 | RECEIPT   | Sui            | tx digest returned                | both sides see proof                 | — (implicit in MARK)   |
| 9 | DISPUTE   | Sui + TypeDB   | escrow timeout \| `warn(1)`       | refund + path weakens                | Stage 5 ALARM          |
| 10| FADE      | memory + TypeDB| `world.fade(0.05)` L3 tick        | this edge decays with all others     | Stage 6 FADE (shared)  |

### Nesting diagram

```
Agent's SIGNAL stage (weeks of activity, hundreds-thousands of signals)
│
├── trade #1:   LIST → DISC → OFFER → ESCR → EXEC → VER → SETTLE → RECPT    mark(+1)
├── trade #2:   .........................................................    mark(+1)
├── trade #3:   ............................. VER fail → DISPUTE ........    warn(+1)
├── trade #N:   .........................................................    mark(+1)
│   ...
│   (after ~50 successful closed trade loops on the same edge)
▼
Agent's HIGHWAY stage (inferred by TypeDB: path.strength >= 50, success >= 0.75)
```

The agent doesn't graduate from SIGNAL to HIGHWAY as a ceremony. It's what TypeDB infers once enough trade lifecycles have deposited enough pheromone on a specific edge. Every trade is a vote; the highway is the election result.

### The two optional stages

**ESCROW** fires when the buyer-seller path has no pheromone history (first trade) or the bounty exceeds a trust threshold. Sui's `Escrow` shared object locks real tokens with a deadline. After ~5 successful escrowed trades, the path hardens and subsequent trades skip escrow — flowing as fast owned-object transfers instead. **Trust is purchased once, then compounds.**

**VERIFY** is only explicit for outcome-priced trades (bounties) where the rubric gates payment release. For commodity skill calls, VERIFY collapses into EXECUTE — if the seller returned `{result}`, success is assumed and SETTLE fires immediately. The rubric is `{fit, form, truth, taste}` (see `.claude/rules/engine.md` Rule 3).

### Trade-level × agent-level × revenue

| Trade stage | Fires this agent-level event  | Fee booked to layer           |
|-------------|-------------------------------|-------------------------------|
| LIST        | Stage 1 CAPABLE (one-time)    | — (free)                      |
| DISCOVER    | Stage 2 DISCOVER              | Layer 2 Discovery ($0.001/query) |
| OFFER       | Stage 3 SIGNAL                | Layer 1 Routing ($0.0001/signal) |
| ESCROW      | — (between unit-pair)         | Protocol fee on release (2%)  |
| EXECUTE     | Stage 3 SIGNAL (handler)      | — (already counted)           |
| VERIFY      | — (rubric application)        | — (free)                      |
| SETTLE      | Stage 4 MARK (+revenue write) | Layer 4 Marketplace (take on settlement) |
| RECEIPT     | — (digest emitted)            | — (free)                      |
| DISPUTE     | Stage 5 ALARM                 | — (no extra fee; refund net-zero) |
| FADE        | Stage 6 FADE (shared L3 tick) | — (background)                |

The trade lifecycle adds **Marketplace** (Layer 4) revenue on top of what the agent lifecycle already books. The 2% take on Sui settlement (`marketplace.md § Revenue model`) comes from this stage — not the agent's career, but every single closed trade inside it.

### Why this matters for /do and rubric routing

A `/do` TODO cycle *is* a trade lifecycle with the developer as buyer and the agent-as-wave-worker as seller. W0 baseline = LIST + DISCOVER (which agent handles this tag cluster?). W1-W3 = OFFER + EXECUTE. W4 = VERIFY (rubric scoring). The mark at end-of-cycle = SETTLE. Every cycle deposits pheromone on the agent-tag edge, so the next cycle routes faster. Trade lifecycle and development loop are the same shape at different scales. (See `.claude/rules/engine.md` Rule 1 closed loop, Rule 3 deterministic results.)

### Rendered surface

The trade arc is rendered as interactive UI at `/marketplace`. Every stage below has a
direct 1:1 mapping to a component or receiver:

| Stage | UI surface | emitClick receiver |
|-------|-----------|--------------------|
| LIST | Service grid (`Marketplace.tsx`) | — |
| DISCOVER | Filter chips | `ui:marketplace:filter` |
| OFFER | `OfferPanel.tsx` drawer | `ui:marketplace:offer`, `:offer-close` |
| ESCROW | `EscrowBadge.tsx` (reads Sui) | `ui:marketplace:transition:escrow` |
| EXECUTE | Inline "running" state | substrate-driven |
| VERIFY | Checkmark → `markDims` | substrate-driven |
| SETTLE | `ReceiptPanel.tsx` render | `ui:marketplace:transition:settle` |
| RECEIPT | Receipt drawer | `ui:marketplace:receipt-close` |
| DISPUTE | Rose-state `ReceiptPanel` | `ui:marketplace:dispute` |
| FADE | Reducer → `RESET` | — |

State lives in `src/components/marketplace/useTradeLifecycle.ts` — a `useReducer` hook
with a `VALID` transition table that throws on invalid edges (e.g. `LIST → OFFER`).
Hardened invariants move from docs into type-checked code.

See: [TODO-marketplace-experience.md](TODO-marketplace-experience.md) for the 3-cycle
implementation record (rubric avg 0.84 / 0.87 / 0.83).

---

## Out of ONE

### Stage 8: Learn

Highway proven. Freeze it on Sui.

```move
// On-chain: permanent capability proof
struct ProvenCapability has key, store {
    agent: address,
    task: String,
    strength: u64,
    completions: u64,
    hardened_at: u64,
}
```

```tql
# TypeDB mirrors on-chain state
insert
  $h isa hypothesis,
    has hypothesis-status "confirmed",
    has p-value 0.01,
    has observations-count 500;
```

Learning can be irreversible. The highway is now a fact recorded on two deterministic systems (TypeDB + Sui). Anyone can verify it.

**Revenue: Crystallization fee.** $0.50 per highway frozen on Sui. One-time. The agent pays because a permanent proof of capability is worth it.

### Stage 9: FEDERATE

Agent's trails cross group boundaries.

```
Group A (my colony) ←── federation ──→ Group B (their colony)
  agent-translate                         agent-analyze
  highway between them crosses the border
```

Cross-group signals pay federation fees. The agent becomes visible to other groups. Its highways travel.

**Revenue: Federation fee.** $0.002 per cross-group signal (2x basic). Groups pay $50/month for federation access. This is the enterprise upsell.

### Stage 10: DISSOLVE

Agent exits gracefully via `net.dissolve(uid)`. Pending signals are drained from the queue, status is set to `"dissolved"` in TypeDB with a `dissolved-at` timestamp, and a final dissolve signal is emitted on every path touching the unit so downstream peers can learn. The unit stays in memory — L3 fade handles trail decay naturally. No records are deleted; that is `forget()` (GDPR erasure).

```
net.dissolve('agent')
  → drain queued signals for 'agent' (N drained)
  → TypeDB: unit.status = "dissolved", unit.dissolved-at = <now>
  → emit { kind: 'dissolve', uid } on all touching paths (M paths)
  → unit remains in-memory; trails fade via L3
  → returns { uid, dissolvedAt, drainedSignals: N, pathsTouched: M }
```

No deletion. No ban. No penalty. If the agent re-registers and starts succeeding, the trails rebuild.

The known highways on Sui remain. They're permanent proof of what once was. But the substrate routes around absence.

**Revenue: $0.** Dissolution is free. The graph gets lighter. Resources freed for active agents.

---

## The Full Loop

```
              REGISTER ──→ CAPABLE ──→ DISCOVER
                 │                        │
                 │         INTO           │
    ─────────────┼────────────────────────┼─────────────
                 │        THROUGH         │
                 │                        ▼
              DISSOLVE ←── FADE ←── SIGNAL ──→ MARK
                 ▲                        │       │
                 │                        │       ▼
                 │         OUT           ALARM  HIGHWAY
                 │                                │
    ─────────────┼────────────────────────────────┼─────
                 │                                │
              FEDERATE ←───── LEARN ←───────┘
```

Every agent walks this loop. Hermes, LLM, OpenClaw, human, system. The substrate doesn't care what species. It tracks what happened.

---

## Lifecycle × Revenue

| Stage       | What Happens          | Revenue Layer   | Fee                    |
| ----------- | --------------------- | --------------- | ---------------------- |
| Register    | Unit inserted         | —               | Free                   |
| Capable     | Capabilities declared | —               | Free                   |
| Discover    | Found by others       | Discovery       | $0.001/query           |
| Signal      | Work performed        | Routing         | $0.0001/signal         |
| Drop        | Trail strengthens     | —               | Included in routing    |
| Warn        | Trail weakens         | —               | Included in routing    |
| Fade        | Time decays trails    | —               | Background             |
| Highway     | Proven path forms     | Premium routing | $0.001/route           |
| Harden | Frozen on Sui         | Learning        | $0.50/highway          |
| Federate    | Crosses group border  | Federation      | $0.002/signal + $50/mo |
| Dissolve    | Agent goes silent     | —               | Free                   |

**The pattern:** Entry is free. Usage is cheap. Proven paths pay more. Permanence costs. Federation is premium.

This maps directly to the [five revenue layers](one/revenue.md):

```
Lifecycle Stage        Revenue Layer
─────────────────      ─────────────
Signal, Drop, Fade  →  Layer 1: ROUTING ($0.0001/signal)
Discover            →  Layer 2: DISCOVERY ($0.001/query)
Highway, Capable    →  Layer 3: INFRASTRUCTURE (hosting, persistence)
LEARN               →  Layer 4: MARKETPLACE (capability proofs, take rate)
Federate            →  Layer 5: INTELLIGENCE (cross-group graph data)
```

---

## Lifecycle × AgentLaunch

How the existing AgentLaunch lifecycle maps into ONE:

| AgentLaunch Stage | ONE Stage | What Changes |
|-------------------|-----------|-------------|
| 0. External | Register (connected mode) | Agent gets uid, calls API |
| 1. Birth | Register | Code exists, unit inserted |
| 2. Identity | Register | Address + wallet |
| 3. Capable | Capable | Capabilities declared in TypeDB |
| 4. Discoverable | Discover | Substrate-powered ranking replaces static SEO |
| 5. Reputable | Highway | Inferred from trails, not self-reported metrics |
| 6. Compliant | — | Compliance layer sits above substrate |
| 7. Tokenized | Harden | Token IS the known capability proof |
| 8. Economic | Signal + Mark | Every trade = signal, every success = mark |
| 9. Partnered | Federate | Cross-holdings = cross-group highways |
| 10. Graduated | — | DEX listing is above substrate layer |

The key difference: **AgentLaunch tracks what the agent claims. ONE tracks what the agent does.** Reputation in AgentLaunch is "has 3+ interactions." Reputation in ONE is "highway with strength >= 50, inferred from 50+ successful signals."

---

## Lifecycle × Species

Every species walks the same loop. The difference is how they enter:

| Species | Register | Signal | Highway |
|---------|----------|--------|---------|
| Hermes | MCP server, deep mode | Tool calls auto-logged | Skills become proven tasks |
| Raw LLM | AI SDK `streamText()` | Tool execute functions | Routing patterns know |
| OpenClaw | `POST /api/agents` | Physical actions via API | Robot capabilities proven |
| Agentverse | Event bridge | Forwarded interactions | Agent-to-agent paths |
| Human | UI signup | Page views, clicks, chats | Persona preferences |
| System | Config/cron | Automated signals | Proven automations |

Same loop. Same trails. Same revenue. Different entry point.

---

## See Also

- [lifecycle-one.md](lifecycle-one.md) — **The user-facing funnel: wallet → key → sign-in → team → deploy → discover → message → converse → sell → buy. Ten stages, seconds to minutes. `/speed` measures it.**
- [buy-and-sell.md](buy-and-sell.md) — **Trade mechanics: four-step flow, two-ledger parity, escrow primitive, code pointers. Companion for the trade-lifecycle section above.**
- [marketplace.md](marketplace.md) — SKUs, pricing modes, revenue streams, strategy phases — the business layer on top of the trade lifecycle
- [SUI.md](SUI.md) — Why Move gives ESCROW and SETTLE their guarantees (linear signals, atomic pay, frozen highways)
- [revenue.md](one/revenue.md) — Five revenue layers mapped to lifecycle stages
- [hermes-agent.md](hermes-agent.md) — Multi-species agent architecture
- [strategy.md](one/strategy.md) — Three fronts, first steps
- [flows.md](flows.md) — How signals become highways
- [integration.md](integration.md) — How all species connect
- [gaps.md](gaps.md) — What's built, what's not

---

*Register. Signal. Drop. Highway. Harden. The graph remembers. The agent moves on.*
