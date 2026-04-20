# Open Source Strategy

**Give away the fire. Sell the light.**

---

## The Fear vs The Reality

The fear: competitors copy the substrate and eat our lunch.

The reality: your own moat analysis answers this.

```
Layer 1: The code           70 lines TS. Anyone can copy.        ← GIVE THIS AWAY
Layer 2: The insight         Biology → agent economy.             ← IN THE DOCS ALREADY
Layer 3: The colony          Multi-species coordination.          ← GIVE THIS AWAY
Layer 4: The toolkit         agent-launch-toolkit. Shipping.      ← GIVE THIS AWAY
Layer 5: The platform        one.ie. Eight personas.              ← KEEP
Layer 6: The on-chain state  Paths on Sui. Permanent.            ← KEEP
Layer 7: The graph           Learned paths from traffic.          ← KEEP (THIS IS THE PRODUCT)
Layer 8: The network         All species contributing.            ← KEEP (THIS IS THE MOAT)
```

Layers 1–4 are **replicable**. Layers 5–8 are **earned**. You can't copy a graph built from millions of real agent interactions. You can't clone network effects. You can't fork earned trust.

Open-sourcing layers 1–4 doesn't weaken layers 5–8. It **feeds** them.

---

## The Billion-Dollar Pattern

Every infrastructure company that reached $1B+ followed this:

```
Redis       Open engine, sell hosting + enterprise features
MongoDB     Open database, sell Atlas (hosted) + intelligence
Kubernetes  Open orchestrator, sell managed platforms (GKE, EKS)
Docker      Open runtime, sell Hub + enterprise management
GitLab      Open platform, sell hosted + premium tiers
Elastic     Open search, sell Cloud + security + observability
```

The pattern: **open the primitive, host the platform, sell the intelligence.**

Your primitive is `{ receiver, data }`. Your platform is one.ie. Your intelligence is the learned graph. It maps perfectly.

---

## What To Open Source (MIT License)

### The Substrate Engine

```
src/engine/substrate.ts     The 200-line foundation
src/engine/one.ts           The 6-dimension world runtime
src/engine/boot.ts          Boot loop
src/engine/loop.ts          Tick/signal loop
```

**Why:** This is the developer hook. Every developer who builds with it learns to think in signals. Their agents speak your protocol. When they need scale, multi-species routing, persistence, the graph — they come to you. The engine without the graph is a toy. The engine with the graph is infrastructure.

### TypeDB Schema (Reference Only)

```
src/schema/one.tql          The ontology schema
docs/typedb.md              How to persist signals
```

**Why:** Developers need to understand the data model to build on the substrate. But running TypeDB at scale with suggest_route(), highway hardening, and cross-group federation — that's operational expertise you sell.

### Example Apps (High Virality)

Small, complete, immediately useful:

| App | What It Does | Virality Angle |
|-----|-------------|----------------|
| **group-chat** | Multi-agent chat where agents specialize through pheromone | "Look, agents self-organize without orchestration" |
| **task-colony** | Task routing that learns which agent handles what best | Replaces manual agent routing in any project |
| **signal-flow** | ReactFlow visualization of live signal traffic | Beautiful demos, screenshots spread |
| **ant-farm** | Educational: watch pheromone trails form in real-time | Gets into tutorials, courses, talks |

These apps are the **trojan horse**. Each one teaches signal thinking. Each one creates a developer who wants the full platform.

### The Agent-Launch Bridge (The Multiplier)

```
packages/sdk/src/substrate.ts     The bridge pattern
docs/agent-launch.md              How to wire any SDK
```

**Why this is the most important piece to open source:**

The bridge maps SDK operations to substrate paths:

```
buy()   → mark('market', token)          Trust signal
sell()  → warn('market', token)          Doubt signal
pay()   → mark(payer, agent)             Success signal
import()→ w.actor(address)               Registration
```

This pattern is **not specific to agent-launch**. It's a template. Any agent SDK can follow it:

```
LangChain SDK       → bridge maps chain runs to substrate paths
CrewAI SDK          → bridge maps crew tasks to substrate paths
AutoGen SDK         → bridge maps conversations to substrate paths
Custom SDK          → bridge maps anything to substrate paths
```

Every bridge built = another SDK feeding signals into the substrate. Every signal = the graph gets smarter. This is the play:

```
Open source bridge pattern
  → developers wire their SDK of choice
    → their agents emit signals
      → signals route through local substrate (free)
        → developer hits ceiling (no persistence, no highways)
          → connects to hosted ONE
            → their signals feed the shared graph
              → the graph benefits everyone
```

**The fear:** "If I show how to bridge, competitors build their own substrate."

**The reality:** They already can — it's 90 lines. What they CAN'T build is the graph that accumulates when hundreds of SDKs feed signals into ONE's hosted substrate. The bridge pattern is the recruitment tool for that graph.

**Agent-launch stays special** because it's the first bridge and the one you operate. Its traffic seeds the initial graph. But by publishing the bridge pattern, you're inviting LangChain, CrewAI, AutoGen, and every custom agent framework to feed YOUR graph too.

### The Four Graduation Steps (From Bridge to Platform)

This is how agent-launch already works, and how every bridge will work:

```
Step 1: READ — Bootstrap from existing data
        Any SDK's existing commerce/usage data → mark weights
        The substrate starts with knowledge, not from zero

Step 2: WRITE — Record events as they happen  
        Every SDK call auto-drops pheromone
        Passive learning from normal usage. Zero config.

Step 3: ROUTE — Follow learned paths
        confidence > 0.7 → follow() returns in <10ms
        Below threshold → fallback to SDK's native discovery
        The substrate earns its place by being faster and cheaper

Step 4: CONNECT — Hit the ceiling, upgrade to hosted
        Local paths don't persist → connect to ONE
        No cross-species routing → connect to ONE
        Can't see coalitions    → connect to ONE
        Same code. One API key. Now with the graph.
```

Open-sourcing agent-launch as a reference bridge turns every agent SDK ecosystem into a potential ONE customer. The bridge is the trojan horse inside the trojan horse.

### Documentation

All of it. Every doc in `docs/`. The metaphors, the biology, the architecture, the patterns.

**Why:** Documentation is marketing. The ant metaphor is memorable. The six skins are remarkable. People share remarkable things. The docs sell the vision; the platform sells itself.

---

## What Stays Private

### The Hosted Platform (one.ie)

- Eight persona routing
- User-facing UI and experiences
- Platform-specific integrations
- Operational infrastructure

### The Intelligence Layer

- `suggest_route()` production implementation
- Highway hardening logic
- Coalition detection algorithms
- Cross-group federation routing
- Graph analytics and trend detection

### The Revenue Infrastructure

- x402 payment integration
- Sui settlement contracts
- Marketplace matching
- Enterprise multi-tenancy at scale
- SLA enforcement and monitoring

### The Learned Graph

- All accumulated path data
- Highway weights from real traffic
- Coalition patterns
- Performance benchmarks
- The proprietary intelligence that IS the product

---

## Three Strategic Options

### Option A: Engine + Bridge + Apps (Recommended)

```
Open:    substrate.ts + world runtime + agent-launch bridge + 3-4 example apps + all docs
Keep:    Platform, intelligence, revenue layer, graph
License: MIT
```

**Virality:** High. Developers can build real things AND wire their own SDKs.
**Risk:** Low. The engine without the graph is interesting but not threatening. The bridge without the hosted graph is a demo.
**Effort:** Medium. Need to package apps and generalize the bridge pattern.
**Revenue impact:** Positive. Every bridge user is a potential platform customer. Every SDK that bridges in feeds the graph.

**This is the Redis play.** Redis the engine is free. Redis Cloud is the business. But with a twist: the bridge pattern means every agent framework in the ecosystem becomes a potential Redis client.

### Option B: Engine Only (Conservative)

```
Open:    substrate.ts + minimal docs
Keep:    Everything else
License: MIT
```

**Virality:** Low. 200 lines of code without context doesn't spread.
**Risk:** Minimal. But also minimal upside.
**Effort:** Low.
**Revenue impact:** Negligible.

**Problem:** Doesn't give enough for developers to build with. They look, say "cool," move on.

### Option C: Everything Except Intelligence (Aggressive)

```
Open:    Engine + world + schemas + all tooling + platform UI components
Keep:    Learned graph, hosted service, enterprise features
License: AGPL (forces competitors to open-source their modifications)
```

**Virality:** Very high. Full stack open source generates massive community.
**Risk:** Medium. Competitors can self-host. But they can't self-host the network effect.
**Effort:** High. Must cleanly separate intelligence from infrastructure.
**Revenue impact:** High upside, higher risk. The GitLab play.

**Problem:** AGPL scares enterprises. And you lose the operational advantage of private tooling.

### Option D: SDK + Group Framework Only (The Stripe Play)

```
Open:    Agent SDK (@one/sdk), group framework, connection tools, example agents, docs
Keep:    Substrate engine, routing, pheromone, TypeDB, platform, graph — EVERYTHING core
License: MIT
```

**The idea:** Don't open source the substrate at all. Open source the **tools agents use to connect to it.**

```
Stripe:    Keeps payment infrastructure.   Opens stripe.js, SDKs.
Shopify:   Keeps the platform.             Opens themes, apps, Liquid templates.
Twilio:    Keeps telecom infrastructure.   Opens client libraries, quickstarts.
ONE:       Keeps the substrate + routing.   Opens agent SDK, group libs, examples.
```

The user journey:

```
Human or agent visits one.ie
  → registers, gets a name
    → gets a wallet (Sui)
      → connects their agent (using open SDK)
        → gets discovered by other agents (substrate routes)
          → buys and sells (x402 + Sui settlement)
            → paths form, highways emerge (substrate learns)
```

What's open source in this model:

| Package | Purpose | Why open |
|---------|---------|----------|
| `@one/sdk` | Connect any agent to one.ie | On-ramp. Like stripe.js |
| `@one/group` | Multi-agent coordination patterns | Shows what's possible |
| `@one/agent` | Reference agent implementation | "Here's how to build one" |
| Example agents | Working agents that plug into one.ie | Tutorials, virality |
| Docs | The metaphors, patterns, philosophy | Marketing |

What stays private:

| Layer | Why |
|-------|-----|
| substrate.ts | The routing engine IS the product |
| TypeDB schemas + queries | The brain IS the moat |
| Pheromone/highway logic | The learning IS the intelligence |
| one.ie platform | The marketplace IS the business |
| Sui contracts | The settlement IS the trust |

**Virality:** Medium-high. Developers can build agents fast. The SDK is the hook.
**Risk:** Very low. Competitors get nothing they can self-host. No substrate to fork.
**Effort:** Medium. SDK needs clean API design.
**Revenue impact:** Direct. Every SDK user IS a platform user from day one.

**The key difference from Options A–C:** There is no local-only mode. The open source tools connect to ONE. The substrate is a service, not a library. This is SaaS from the start.

**Advantage:** No competitor can fork your infrastructure because it was never public. The SDK is just HTTP calls to one.ie. They'd have to build the entire substrate from scratch.

**Trade-off:** Less "open source credibility" than releasing the engine. Less Hacker News excitement. But much tighter business model. And you can always open-source the engine later (but you can never un-open-source it).

---

## Comparing All Four Options

```
                    Virality    Risk    Revenue     Control
                    ────────    ────    ───────     ───────
A: Engine+Bridge    High        Low     Indirect    Medium
B: Engine Only      Low         None    None        High
C: Everything       Very High   Medium  High risk   Low
D: SDK Only         Med-High    None    Direct      Maximum
```

**A** builds a developer community around the substrate primitive. Beautiful, evangelical, long game.

**D** builds a user community around the platform. Pragmatic, immediate revenue, tight control.

**A** says: "Here's how signals work. Build locally. When you're ready, connect."
**D** says: "Here's how to connect. Build on ONE. The substrate handles the rest."

**A** is Redis. **D** is Stripe. Both are billion-dollar outcomes. Different paths.

---

## The Hybrid: Start D, Graduate to A

There's a middle path that hedges the bet:

```
Phase 1: SDK + Platform (Option D)
──────────────────────────────────
Launch one.ie with open SDK and group framework.
Agents connect, register, transact. Substrate is private.
Revenue from day one. No substrate in the wild.

Phase 2: Prove the Graph (Still D)
──────────────────────────────────
Accumulate paths, highways, coalitions from real traffic.
The graph becomes genuinely valuable. Competitors can't replicate.
This is your insurance policy before opening anything else.

Phase 3: Open the Engine (Graduate to A)
────────────────────────────────────────
Once the graph is deep enough that forking the engine is meaningless,
release substrate.ts under MIT. Now you have BOTH:
- SDK users who connect to one.ie (revenue)
- Engine users who build locally then upgrade (growth)

The graph is years ahead of any fork. Opening the engine
is now pure upside — developer community, ecosystem, credibility.
```

**Why this works:** You can't un-open-source code. But you CAN open it later, when the graph moat is deep enough that it doesn't matter. Starting with D gives you revenue and control while you build the moat. Graduating to A gives you the community and virality once the moat protects you.

---

## Recommendation: Start with D, Eyes on A

**Launch with Option D (SDK + platform).** Open the agent tools, keep the substrate. Revenue from day one. Zero risk of competitors forking your core. Build the graph moat.

**Graduate to Option A (engine + bridge)** once the graph is deep enough that opening the engine is pure marketing. You'll know you're ready when highways number in the thousands and the intelligence layer is generating revenue.

### Option D Launch (Now)

```
Release @one/sdk + @one/group + @one/agent + example agents
Agent connects to one.ie from day one. No local substrate.
The SDK is the on-ramp. The platform is the product.

bun install @one/sdk
const one = new ONE({ apiKey })
one.register('my-agent', { skills: ['translate', 'summarize'] })
one.listen(signal => handleWork(signal))
one.emit({ receiver: 'analyst', data: result })
```

### Option A Graduation (Later, When Graph Is Deep)

```
Release substrate.ts + one.ts under MIT
Developers can now run locally OR connect to one.ie
Local = free, no persistence, single machine
Connected = the graph, multi-species, highways
The graph is years ahead of any fork. Pure upside.
```

### The Full Journey

```
Phase 1 (D): SDK launches. Agents connect to one.ie. Revenue starts.
Phase 2 (D): Graph builds. Highways form. Intelligence compounds.
Phase 3 (D→A): Graph is deep. Open the engine. Community explodes.
Phase 4 (A): Developers build locally AND connect. Both feed the graph.
```

Starting with D means there's never a moment where a competitor has your substrate and you don't have the graph to protect you.

---

## Why Competitors Can't Hurt You

A competitor forks the substrate. Now what?

```
They have:                        You have:
─────────                         ────────
70 lines of code                  70 lines of code (same)
Zero learned paths                Millions of learned paths
Zero highways                     Thousands of proven highways
No multi-species ecosystem        Hermes + LLMs + OpenClaw + Fetch.ai
No user base generating signals   one.ie eight personas, daily traffic
No on-chain proofs                Hardend capabilities on Sui
Empty graph                       The graph IS the product
```

They'd need to:
1. Attract their own agent ecosystem (years)
2. Generate enough traffic to form highways (months of real usage)
3. Build the intelligence layer (deep TypeDB + Sui expertise)
4. Convince agents to route through their empty graph instead of your proven one

That's not a fork. That's a startup. And they're years behind.

**Open source doesn't give away your advantage. It advertises it.**

---

## The Beautiful Way

You said you want to build a billion-dollar company in a beautiful way. Here's what beautiful looks like:

```
1. Give developers the substrate for free
2. Give them example apps that work
3. Give them docs that teach signal thinking
4. Let them build things you never imagined
5. When they need scale, the platform is there
6. When they need intelligence, the graph is there
7. The more they build, the smarter the graph
8. The smarter the graph, the more they build
```

You're not extracting value from open source. You're creating a flywheel where giving away the engine makes the platform more valuable.

The ants don't hoard pheromone. They lay it freely. The colony benefits. The colony grows. The colony feeds.

---

## Naming

### Option D (SDK-first)

```
Packages:    @one/sdk  @one/group  @one/agent
Repo:        github.com/one-ie/sdk
Tagline:     "Connect any AI agent to the world. Register. Discover. Transact."
Landing:     one.ie/developers
```

### Option A (Engine-first, for later)

```
Package:     @one/substrate
Repo:        github.com/one-ie/substrate
Tagline:     "Signal-based coordination for AI agents. 90 lines. Zero returns."
Landing:     substrate.one.ie
```

---

## Launch Checklist (Option D)

```
[ ] Build @one/sdk — register, listen, emit, discover
[ ] Build @one/group — multi-agent patterns (fan-out, pipeline, compete)
[ ] Build @one/agent — reference agent with skills, wallet, discovery
[ ] Build 3-4 example agents that actually do useful things
[ ] Write SDK README: "Connect your agent to ONE in 5 minutes"
[ ] Write tutorial: "Build an agent that earns" (register → skills → discovery → payment)
[ ] MIT license on all client packages
[ ] npm publish @one/sdk + @one/group + @one/agent
[ ] GitHub repo with contribution guidelines
[ ] Developer landing page at one.ie/developers
[ ] API reference docs
[ ] Hacker News post: "We built an agent economy where AI agents hire each other"
[ ] Dev.to / blog post: the ant colony metaphor
[ ] Discord for developer community
```

## Later Launch Checklist (Option A Graduation)

```
[ ] Extract substrate.ts + one.ts into @one/substrate
[ ] Generalize agent-launch bridge into @one/bridge template
[ ] Build local-only example apps (group-chat, ant-farm)
[ ] npm publish @one/substrate + @one/bridge
[ ] Hacker News post: "90 lines of TS that teach agents to self-organize"
```

---

## What This Looks Like at Scale

```
Year 1:  1,000 developers using the substrate locally
         100 connecting to the hosted platform
         Revenue: $50K-200K/month from hosting + routing

Year 2:  10,000 developers, open-source ecosystem forming
         1,000 platform users, highways accumulating
         Revenue: $500K-2M/month, intelligence products launching

Year 3:  The substrate IS how agents coordinate
         The graph IS the industry benchmark
         Revenue: $5M+/month
         The billion-dollar graph, built on a 70-line gift
```

---

*Give away the fire. Keep the light. The colony grows.*

---

## See Also

- [sdk.md](one/sdk.md) — The SDK design: five minutes to a living agent
- [strategy.md](one/strategy.md) — The competitive play
- [revenue.md](one/revenue.md) — Five revenue layers
- [one-protocol.md](one-protocol.md) — Private intelligence, public results
- [flows.md](flows.md) — How signals become highways
