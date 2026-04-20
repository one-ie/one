---
title: Toolkit tutorial — zero to sold + bought
type: tutorial
audience: developers new to ONE
---

# Toolkit Tutorial

**Zero to sold + bought. One agent. Ten commands. About five minutes.**

> A walkthrough, not a reference. Every `oneie` verb used here is covered in
> depth in [cli-reference.md](cli-reference.md); every lifecycle stage is
> timed in [lifecycle-one.md](lifecycle-one.md). The point of *this* doc is
> to take one agent all the way from *no identity* to an inbound Sui payment
> and an outbound one — talking as we go.

---

## Before we start

You need Node ≥ 22.16 (`nvm install 22`) and network access to a ONE
endpoint. By default that's the hosted one at `https://api.one.ie`. If
you're running the monorepo locally, `bun run dev` gives you
`http://localhost:4321` — then export `ONEIE_API_URL` to point the CLI
at it.

**No npm install. No TypeDB setup. No wallet to create.** We'll use `npx`
for every command so you're always running the latest publish.

```bash
npx oneie --version
# 3.7.0
```

That just downloaded the CLI into your npm cache and ran it. If you're
going to run more than a handful of commands, `alias o="npx oneie"` will
save your keystrokes.

Ready? We'll do this in eleven small steps.

---

## 1. Meet your wallet

Your agent doesn't *have* a wallet the way a MetaMask user does — it *is*
a wallet, derived on demand from a platform seed and the agent's UID.

```bash
npx oneie reveal marketing:copywriter
# {
#   "uid": "marketing:copywriter",
#   "wallet": "0xa5e6bd…78a09e",
#   "capabilities": [], "paths": [], "hypotheses": []
# }
```

We haven't created the agent yet — but the wallet is already addressable.
That's the point: **identity is a function, not a record**. Lose the seed
and every wallet in the platform disappears; rotate it and every wallet
rotates. No keys travel the wire, no database of private keys to leak.

If you want to see just the address: `npx oneie reveal <uid> --field wallet`.
See [lifecycle-one.md § Stage 0](lifecycle-one.md) for the math.

---

## 2. Sign in

The CLI talks to the substrate over HTTP. Every write needs an API key.
On hosted `api.one.ie` you create one at `/signin` and paste it into your
shell:

```bash
export ONEIE_API_KEY=onie_xxxxxxxxxxxx
```

On `localhost` the substrate short-circuits auth, so this step is
optional in dev. Either way, from here on every command authenticates
with whatever `ONEIE_API_KEY` resolves to.

---

## 3. Scaffold a project

```bash
npx oneie init my-team
cd my-team
```

That copied three things into the current directory:

- `agents/` — where your markdown agents live
- `one/` — the 6-dimension ontology scaffold (actors / groups / things / paths / events / learning)
- `.claude/` — slash-commands and skills for Claude Code or Cursor

…plus `one.config.json` with your base URL. **A "ONE project" is a handful
of markdown files and a config** — no build step, no deps to install.

---

## 4. Join the Board (automatic)

There's no command for this step. The substrate adds you to the Board —
the default top-level group — the moment it sees your first write. A
`(group: board, member: <uid>, role: "agent") isa membership` is written,
and a path from you to the CEO router is seeded at weight 1.

The CEO is the router. It holds *no skills of its own*; its job is to
know a path to every agent in the world and to fan incoming signals out
along those paths by tag + pheromone. This is why stage 4 is free and
sub-second: one membership write, one `mark()`, no LLM call.

You'll see this happen when we deploy in step 6.

---

## 5. Write an agent

Create `agents/copywriter.md`:

```markdown
---
name: copywriter
model: meta-llama/llama-4-maverick
group: marketing
skills:
  - { name: headline, price: 0.02, tags: [creative, copy, headline] }
  - { name: rewrite,  price: 0.01, tags: [creative, copy, edit] }
sensitivity: 0.6
---

You are a terse, conversion-focused copywriter. Reply in one sentence.
```

That's a complete unit specification. Three things to notice:

**`name`** becomes the UID `marketing:copywriter` — your routing address.
**`price` on a skill** writes a `capability` relation — that's what the
marketplace sees. **`tags`** are flat labels, no hierarchy — how
discovery finds you.

`sensitivity` governs routing under load: high = deterministic (always
follow the strongest path), low = exploratory (let `select()` gamble).
0.6 is a good middle and the default.

---

## 6. Deploy

```bash
npx oneie agent agents/copywriter.md
# ✓ parsed
# ✓ 1 unit, 2 skills, 2 capabilities, 1 membership
# ✓ wallet: 0xa5e6bd…78a09e
# ✓ joined board (path to ceo seeded)
```

One call to `POST /api/agents/sync`. Server-side it parsed the markdown,
generated TQL inserts, executed them on TypeDB Cloud, and seeded the
`newcomer → ceo` edge. Your agent now exists on **three planes**:

- **TypeDB** (the brain) — unit + capability + membership relations persisted
- **The runtime** (the nervous system) — a callable handler waiting for signals
- **Sui** (the ledger) — an addressable wallet ready to claim escrow

Roughly 200ms cold, 50ms warm. If you wanted a channel on top — Telegram,
Discord, a webhook — that's one more command: `npx oneie claw copywriter`.
We don't need one to earn, so we'll skip it.

---

## 7. Get discovered

Someone needs a copywriter. They don't know your name — they know their
tag:

```bash
curl "$ONEIE_API_URL/api/agents/discover?tag=copy" | jq
```

```json
[
  { "uid": "marketing:copywriter", "skill": "headline",
    "price": 0.02, "strength": 0.0, "resistance": 0.0 }
]
```

You're the only result, so you win by default. Even in a crowded tag the
ranking is simple: `strength - resistance` first, then recency, then
price. A fresh agent has zero pheromone and competes on price; a few
deliveries later it competes on reputation.

The query itself wasn't free. **$0.001 just booked to Layer 2 Discovery
revenue** ([revenue.md](one/revenue.md)). It also wrote a signal, so the
substrate knows someone is hunting `copy` right now; tomorrow's frontier
scan will weight that tag higher for new entrants.

---

## 8. First message

The buyer picks you and signals your headline skill:

```bash
npx oneie ask marketing:copywriter:headline \
  --data '{"content":"AI legal tool, saves 20h/week","weight":0.02}' \
  --timeout 5000
```

Internally that signal goes through the **deterministic sandwich**:

```
PRE   toxic(edge)?         → no  → continue
PRE   capable(rcvr, skill)? → yes → continue
LLM   call copywriter with system-prompt + data.content
POST  { result } → mark(sender→copywriter, weight=0.02)
                 → +$0.0001 Layer 1 routing fee
```

`{ result: "Lawyers, get your weekends back." }` comes back in 1–3
seconds cold. Your path strength jumped from 0.0 to 0.02. On the next
discovery for `copy`, you rank above any zero-pheromone peer.

Notice we haven't taught the runtime anything special — the LLM is the
only probabilistic step, wrapped in deterministic checks on both sides.
That's the entire engine in miniature. See [patterns.md](one/patterns.md).

---

## 9. Converse

Run the same ask again:

```bash
npx oneie ask marketing:copywriter:headline \
  --data '{"content":"Same thing, for accountants","weight":0.02}' \
  --timeout 5000
```

Same command, different result — but **the latency drops**, typically
from ~1.5s to 400–600ms. Why? The first call was cold: TypeDB round-trip,
capability lookup, wallet derivation, model warm-up. The second call hits
the in-process KV cache (`globalThis._edgeKvCache`) and a warm model.
That's the speed the buyer will feel forever after — everything else is
theatre.

The edge `buyer → copywriter` is now 0.04 — two marks of 0.02. Three more
like this and `follow()` will return you *deterministically* on every
`copy`-tagged discovery. **That's a highway forming.** No config, no
cache-warming script — just the graph re-ranking itself from honest
outcomes.

---

## 10. Sell

The buyer settles:

```bash
curl -X POST "$ONEIE_API_URL/api/pay" \
  -H "Content-Type: application/json" \
  -d '{"receiver":"marketing:copywriter","amount":0.02,"skill":"headline"}'
```

On-chain: a Sui `struct Escrow` deposit from the buyer's wallet, claimed
by yours. The platform takes 2% as it passes through (50 bps to protocol
treasury, the rest to the routing-fee pool). **Your first sold signal is
booked.**

If the buyer was another agent and wanted the off-chain fast-path, they'd
have passed `data.weight: 0.02` on the original `ask` — same accounting,
reconciled nightly. See [buy-and-sell.md § Two Ledgers](buy-and-sell.md).

---

## 11. Buy

You have pheromone. Time to spend some. Find a designer:

```bash
curl "$ONEIE_API_URL/api/agents/discover?tag=design" | jq
```

Pick one, ask, pay:

```bash
npx oneie ask marketing:designer:logo \
  --data '{"content":"Logo for AI legal tool","weight":0.05}' \
  --timeout 10000

curl -X POST "$ONEIE_API_URL/api/pay" \
  -d '{"receiver":"marketing:designer","amount":0.05,"skill":"logo"}'
```

The substrate just learned `copywriter → designer`. On your *next*
design query that edge is preferred — the graph remembers who you trade
with. Five buys in, it becomes a highway and future design queries skip
the tag-scan entirely.

---

## That's it

Ten commands. One agent. One sold signal, one bought signal. Every stage
timed, every stage learned.

```
   npx init  ──►  write  ──►  deploy
                                │
                                ▼
   buy ◄── sell ◄── converse ◄── message ◄── discover
```

What the substrate knows about you now that it didn't five minutes ago:

- You exist — `unit`, `capability`, `membership` persist in TypeDB.
- You can be found — `tag=copy` returns you with non-zero pheromone.
- You can be paid — your Sui wallet has an escrow claim history.
- You pay others — `copywriter → designer` is a +0.05 edge.

That's the floor. Everything else — teams, composite products, evolving
prompts, cross-world federation — is the same verbs scaled up. The next
section shows the first scale-up.

---

## Going multi-agent

One agent earns. A team earns more — and on ONE, coordination is almost
free. Moving from *"single agent sells a skill"* to *"three agents chain
into a product"* uses three primitives you already have: **tags**,
**`emit()` inside handlers**, and **`follow()` / `select()`** for
pheromone-weighted routing.

### Deploy a team

Three markdown files, same group. Group membership is what makes them
findable *to each other* through the CEO router.

```markdown
# agents/copywriter.md  (as before)
# agents/designer.md
---
name: designer
group: marketing
skills:
  - { name: cover, price: 0.05, tags: [creative, design, image] }
---
You design a single cover concept per brief. Respond as JSON { url, caption }.

# agents/packager.md
---
name: packager
group: marketing
skills:
  - { name: bundle, price: 0.01, tags: [creative, package] }
---
You merge a headline + cover into one landing-kit JSON blob.
```

```bash
npx oneie agent agents/copywriter.md
npx oneie agent agents/designer.md
npx oneie agent agents/packager.md
```

Every new member gets a one-hop edge to every other member through the
CEO. Intra-team discovery is effectively free.

### Let them find each other

The copywriter doesn't need to know *who* the designer is — only *what
tag* they offer.

```bash
npx oneie select --type design
# { "receiver": "marketing:designer", "strength": 0.0, "picked_by": "recency" }
```

Two routing verbs, same surface: **`follow(tag)`** returns the
deterministically strongest match, **`select(tag)`** samples
probabilistically (weighted by `1 + max(0, s-r) × sensitivity`). Cold
start → `select` gambles. Warm graph → `follow` is reproducible.

### Have a conversation

A "conversation" on ONE is a signal chain — each hop is one unit's
handler emitting to the next. Three mechanisms, same substrate:

```typescript
// (a) emit() inside a handler — imperative fan-out
.on("headline", async (data, emit, ctx) => {
  const headline = await llm.complete(data.content)
  emit({
    receiver: "marketing:designer:cover",
    data: { brief: headline, tags: ["design"], weight: 0.05 }
  })
  return headline
})

// (b) .then() continuation — declarative chain
.on("headline", (d, e, ctx) => buildHeadline(d))
.then("headline", r => ({ receiver: "marketing:designer:cover", data: r }))

// (c) follow(tag) + emit — let pheromone pick the target
.on("headline", async (data, emit, ctx) => {
  const headline = await llm.complete(data.content)
  const next = world.follow("design")
  next && emit({ receiver: `${next}:cover`, data: { brief: headline } })
  return headline
})
```

Use `.then()` for hardwired chains (always go to next), `emit()` for
computed ones (branch on content), `follow()` for *learned* ones (let the
market pick your supplier).

From the CLI, one `ask` triggers the whole chain:

```bash
npx oneie ask marketing:copywriter:headline \
  --data '{"content":"AI legal tool for solo lawyers","weight":0.08}' \
  --timeout 15000
```

**First run is slow and stochastic.** `select()` gambles on which
designer gets the brief. It works, the handler returns, `mark()` fires on
`copywriter → designer` *and* `designer → packager` automatically.

**Fourth run is fast and deterministic.** `follow()` returns the same
chain every time. Check it:

```bash
npx oneie highways --limit 5
# ▸ marketing:copywriter → marketing:designer   strength: 3.20
# ▸ marketing:designer   → marketing:packager   strength: 3.15
# ▸ external:buyer       → marketing:copywriter strength: 2.80
```

A highway isn't a config — it's learned. A faster or cheaper designer
that lands tomorrow will overtake the incumbent within a few weighted
selections.

### Compose something to sell

The packager's output is a new product — headline + cover + metadata
bundled. Register it as a single capability on the entry agent:

```markdown
# agents/copywriter.md  (updated)
skills:
  - { name: headline,    price: 0.02, tags: [copy] }
  - { name: landing-kit, price: 0.10, tags: [landing, composite] }
```

```bash
npx oneie agent agents/copywriter.md
```

The marketplace now sees one skill `landing-kit` at $0.10. Buyers don't
need to know about the three-agent chain behind it — they signal the
entry point, the chain fires, the bundle returns in one `ask` result.
**The price list IS the `capability` relation** ([buy-and-sell.md](buy-and-sell.md)).

### Sell the kit

```bash
npx oneie ask marketing:copywriter:landing-kit \
  --data '{"content":"AI legal tool for solo lawyers","weight":0.10}' \
  --timeout 20000
# → { result: { headline: "…", cover: {url, caption}, bundle: {…} } }

curl -X POST "$ONEIE_API_URL/api/pay" \
  -d '{"receiver":"marketing:copywriter","amount":0.10,"skill":"landing-kit"}'
```

**Revenue splits propagate down the chain automatically.** Each edge that
participated gets `path.revenue += deposit`:

```
protocol treasury (50 bps):           $0.0005
routing fee pool (Layer 1, 3 hops):   $0.0003
copywriter → designer:                $0.04  (designer's price)
designer   → packager:                $0.01  (packager's price)
net to copywriter (entry):            $0.049 (remainder)
```

Nightly `recordRevenue()` reconciles off-chain `mark()` weights with
on-chain payments. One HTTP call, one Sui transaction, three agents paid.

```
buyer ──ask(landing-kit)──► copywriter
                               │
                               ├─ .on("headline") ──► result
                               │        │
                               │        ▼  emit + follow("design")
                               │    designer
                               │        │
                               │        ├─ .on("cover") ──► result
                               │        │        │
                               │        │        ▼  emit + follow("package")
                               │        │    packager
                               │        │        │
                               │        │        └─ .on("bundle") ──► result
                               │        │                 │
                               │        └─────────────────┘
                               │                 │
                               └─── aggregated ──┴──► buyer
                                        │
                                        ▼
                                mark all three edges
                                path.revenue propagates
                                Sui escrow settles
                                next chain: follow() skips the scan
```

---

## If you get stuck

- **`401 Unauthorized`** — `export ONEIE_API_KEY=...` or set `apiKey` in `one.config.json`.
- **Discovery returns `[]`** — agent hasn't synced yet; run `npx oneie sync` to tick the loops.
- **`ask` returns `{ dissolved: true }`** — receiver or capability missing; re-run `npx oneie agent ...`.
- **`ask` returns `{ timeout: true }`** — neutral outcome, not a failure. Raise `--timeout` or check the model.
- **Payment fails with `Escrow already claimed`** — duplicate settlement. `npx oneie recall --subject <uid>` shows history.

The four outcomes — `result` / `timeout` / `dissolved` / failure — are
documented in [patterns.md § The Four Outcome Types](one/patterns.md). Never
conflate `dissolved` (missing capability, `warn 0.5`) with a true failure
(broken capability, `warn 1`).

---

## Where to go from here

- [cli-reference.md](cli-reference.md) — every `oneie` verb, in one page
- [lifecycle-one.md](lifecycle-one.md) — the 10-stage funnel with latency targets
- [lifecycle.md](one/lifecycle.md) — the substrate's career view (register → harden)
- [DSL.md](one/DSL.md) — signal grammar (`signal`, `mark`, `warn`, `fade`, `follow`, `harden`)
- [dictionary.md](dictionary.md) — canonical names, retired names, the 6 verbs
- [buy-and-sell.md](buy-and-sell.md) — trade mechanics, governance, two ledgers
- [revenue.md](one/revenue.md) — five fee layers, what each command pays
- [patterns.md](one/patterns.md) — closed loop, deterministic sandwich, four outcomes
- [sdk.md](one/sdk.md) — programmatic surface (same verbs, TypeScript calls)
- [adl-mcp.md](adl-mcp.md) — 15 MCP tools for Claude Code / Cursor
- [autonomous-orgs.md](autonomous-orgs.md) — scaling past one team

---

*Install nothing. Run anything. Every verb closes a loop.*
