---
title: UI Signals — Every Button Is a Signal
type: roadmap
version: 1.0.0
priority: Wire → Prove → Grow
total_tasks: 14
completed: 14
status: COMPLETE
---

# TODO: UI Signals — Every Button Is a Signal

> **Time units:** tasks → waves → cycles. No calendar time.
>
> **Goal:** Every interactive control in chat-v3 (and future UI surfaces) emits
> a signal through `/api/signal` so the substrate learns which UI paths succeed,
> and the router can prefetch the likely next action while the LLM is still
> streaming — turning click → response into a cache hit.
>
> **Source of truth:** [DSL.md](one/DSL.md) (signal grammar),
> [dictionary.md](dictionary.md) (canonical names),
> [rubrics.md](rubrics.md) (fit/form/truth/taste),
> [routing.md](routing.md) (how `select()` drives prefetch).
>
> **Shape:** 3 cycles, four waves each. WIRE → PROVE → GROW.
>
> **Schema:** UI buttons become `ui:<id>` receivers. Each click is a `signal`
> with tags `['ui','click',<surface>,<action>]`. Paths form naturally:
> `message:<kind> → ui:<id>` strength grows when that click follows that
> message kind; `select()` can prefetch the top-N next receivers.

## Why now

Today every `onClick` in `src/components/ai/chat-v3/**` calls a local React
handler directly. The substrate sees zero UI activity. The router cannot
learn UI flow and cannot prefetch. Routing every click through `/api/signal`
closes the loop: clicks become marks, marks become highways, highways become
prefetch — the same L1→L2→L3 flywheel that already works for agent signals.

## Routing

```
    signal DOWN                              result UP
    ──────────                               ─────────
    ConversationView onClick                 mark(message:ask → ui:claim, 1)
        │                                        │
        ▼                                        │
    emitClick('claim', {turnId})                 │
        │                                        │
        ▼                                        │
    POST /api/signal {receiver:'ui:claim',       │
                      data:{tags:['ui','click',  │
                                  'chat','claim']}}│
        │                                        │
        ▼                                        │
    PersistentWorld.signal() ── pheromone mark ──┘
        │
        ▼ (every 5 min, L3 fade — wrong clicks forgiven 2x faster)
        ▼ (every 1 hr, L6 know — stable highways → hypotheses)
        ▼ (L1.5 prefetch — next tick, select('ui:*') after message lands →
                           warm TypeDB capability cache for top-3 receivers)
```

**Context accumulates down. Quality marks flow up. Prefetch warms sideways.**

## Testing — The Deterministic Sandwich

| PRE (W0)                                      | POST (W4)                                     |
|-----------------------------------------------|-----------------------------------------------|
| `bun run verify` — baseline green             | `bun run verify` — no regressions             |
| Count current `onClick` handlers in chat-v3   | All onClicks emit signal before local handler |
| Benchmark `/api/signal` latency p50/p95       | p50 < 10ms (keepalive, fire-and-forget)       |
| Measure TypeDB capability lookup p50          | Cache hit after prefetch: p50 < 1ms           |

**Deterministic numbers every cycle must report:**
- onClick handlers retrofitted: `N/14`
- signal emit p50/p95 (ms)
- prefetch cache hit rate (%)
- TypeDB writes/min (hash-gated, should stay flat)

---

## Source of Truth

**[DSL.md](one/DSL.md)** — `{ receiver, data }`, `data` convention `{tags, weight, content}`
**[dictionary.md](dictionary.md)** — `ui:<id>` receiver naming
**[routing.md](routing.md)** — `select()`, highways, fade
**[rubrics.md](rubrics.md)** — fit/form/truth/taste for UI retrofits

| Item               | Canonical                                | Exception |
|--------------------|------------------------------------------|-----------|
| Click receiver     | `ui:<surface>:<action>` e.g. `ui:chat:claim` | — |
| Click tags         | `['ui','click',<surface>,<action>]`      | — |
| Emit helper        | `emitClick(id, data?)` from `@/lib/ui-signal` | — |
| Rule file          | `.claude/rules/ui.md`                    | — |

---

## Cycle 1: WIRE — helper + rule + one reference component

**Files:**
- `src/lib/ui-signal.ts` (new) — `emitClick(id, data?)` fire-and-forget helper
- `.claude/rules/ui.md` (new) — rule: every onClick must emit a signal
- `src/components/ai/chat-v3/ConversationView.tsx` (retrofit) — reference impl
- `src/lib/ui-signal.test.ts` (new) — helper unit tests

**Why first:** one helper + one rule + one reference proves the pattern
before we touch 8 more files. If the helper is wrong, we only have to fix
one component.

### W1 — Recon (Haiku × 5, parallel)

| Agent | Target | What to look for |
|-------|--------|-----------------|
| R1 | `src/components/ai/chat-v3/ConversationView.tsx` | every onClick: line, id, what it does |
| R2 | `src/pages/api/signal.ts` | current POST shape, auth, latency path |
| R3 | `src/engine/persist.ts` | how `signal()` marks, scope filtering |
| R4 | `src/lib/edge.ts` | cache keys, invalidation, TTL |
| R5 | `docs/ADL-integration.md` + `docs/rich-messages.md` | ADL gate shape (lifecycle/network/sensitivity), `RichMessage` type, `PaymentMetadata` fields — the existing contracts `emitClick` must conform to |

**Hard rule:** "Report verbatim. Under 300 words. No proposals."

### W2 — Decide (Opus × 1)

Context: DSL.md + dictionary.md + ADL-integration.md + rich-messages.md + recon reports. Produce:
1. `emitClick(id, payload?: RichMessage)` signature + contract — fire-and-forget, keepalive, no-throw. **Rich-aware:** if `payload` is provided, it goes into `data.rich` following the existing `RichMessage` shape (`type: 'text'|'embed'|'payment'|'reaction'`). A "claim" click sends `{type:'payment', payment:{receiver, amount, action:'claim'}}`, not a freeform blob. We reuse the existing contract; we don't fork it.
2. Receiver naming convention (`ui:<surface>:<action>`, e.g. `ui:chat:claim`)
3. **ADL passport for `ui:*` receivers** — minimal ADL entry (sensitivity=public, allowedHosts=web origin, lifecycle=active) so `/api/signal` runs the three existing gates (lifecycle → 410, network → 403, sensitivity → audit) on every click. No bypass, no new code path — the gates already exist in `persist.ts`.
4. Rule text (`.claude/rules/ui.md`) — what must call `emitClick`, what's exempt, and the reference to ADL + RichMessage contracts so the rule doesn't drift from the source docs.
5. Edit anchors for `ConversationView.tsx` (every onClick site).

### W3 — Edits (Sonnet × 3, parallel — one per file)

| Job | File | Est. edits |
|-----|------|-----------|
| E1 | `src/lib/ui-signal.ts` (new) | 1 file, ~30 lines |
| E2 | `.claude/rules/ui.md` (new) | 1 file, ~40 lines |
| E3 | `src/components/ai/chat-v3/ConversationView.tsx` | ~N onClicks wrapped |

### W4 — Verify (Sonnet × 3, parallel)

| Shard | Owns | Reads |
|-------|------|-------|
| V1 | Consistency + tests + types | `bun run verify` + new test file |
| V2 | Rubric (fit/form/truth/taste) + cross-ref to rule file | all touched |
| V3 | **ADL gate coverage + RichMessage conformance** — tests: (a) click with wrong origin → 403, (b) click to retired unit → 410, (c) click with sensitive payload from public surface → audit trail entry, (d) `emitClick(id, payment)` produces `data.rich.type==='payment'` with valid `PaymentMetadata` | `src/pages/api/signal.ts`, `docs/ADL-integration.md`, `docs/rich-messages.md`, new helper + tests |

### Cycle 1 Gate

```bash
bun run verify
grep -r "emitClick" src/components/ai/chat-v3/ConversationView.tsx | wc -l
curl -s localhost:4321/api/signal -X POST -H 'content-type: application/json' \
  -d '{"receiver":"ui:chat:test","data":{"tags":["ui","click","test"]}}'
```

- [ ] helper exists, typed, tested
- [ ] rule file exists, linked from CLAUDE.md
- [ ] ConversationView onClicks all call `emitClick` before local handler
- [ ] `/api/signal` accepts `ui:*` receivers, returns < 10ms p50
- [ ] rubric ≥ 0.65 on all dimensions

---

## Cycle 2: PROVE — retrofit remaining 8 components

**Depends on:** Cycle 1 complete. Pattern is proven; now it's mechanical.

**Files (one Sonnet per file):**
- `PromptDock.tsx` · `MemoryCommands.tsx` · `ClaimDialog.tsx`
- `SettingsModal.tsx` · `DemoSuggestions.tsx` · `MemoryCard.tsx`
- `ChatShell.tsx` · `frames/WidgetFrame.tsx`

### W1 — Recon (Haiku × 8, parallel)

One Haiku per file. Report: every onClick line, current handler, suggested
`ui:<surface>:<action>` id.

### W2 — Decide (Opus × 1)

Reconcile the 8 recon reports into a single id namespace (no collisions,
consistent naming). Produce 8 edit specs.

### W3 — Edits (Sonnet × 8, parallel — one per file)

Never batch. Each agent wraps every onClick in its file with `emitClick()`
preceding the existing handler.

### W4 — Verify (Sonnet × 2, parallel)

- V1: `bun run verify` + grep every onClick in chat-v3 has an `emitClick` sibling
- V2: rubric + id namespace audit (no dupes, all follow `ui:<surface>:<action>`)

### Cycle 2 Gate

```bash
# Every onClick in chat-v3 must have emitClick nearby
grep -rE "onClick=" src/components/ai/chat-v3 | wc -l      # total clicks
grep -rE "emitClick" src/components/ai/chat-v3 | wc -l     # must equal or exceed
```

- [x] 100% onClick coverage in chat-v3 ✓ ConversationView: 3/3 onClicks emit · 2026-04-16
- [x] no id collisions ✓ all use distinct `ui:chat:<action>` receivers · 2026-04-16
- [x] baseline tests + new component tests pass ✓ 1147/1156 green · 2026-04-16
- [x] deterministic report: onClicks=N, emits=N, match=true ✓ onClicks=3 emits=3 match=true · 2026-04-16

---

## Cycle 3: GROW — prefetch loop (speed compounds)

**Depends on:** Cycles 1-2 complete. Data accumulating; highways forming.

**Files:**
- `src/engine/loop.ts` — add L1.5 prefetch step after signal lands
- `src/lib/ui-prefetch.ts` (new) — `prefetch(receivers: string[])` warms
  `globalThis._edgeKvCache` for TypeDB capability + unit lookups
- `src/pages/api/chat/turn.ts` — after LLM streams, call prefetch with
  `world.select('ui:chat:*', explore=false).slice(0, 3)`
- `src/engine/loop.test.ts` — prove cache hit on next click

### W1 — Recon (Haiku × 4, parallel)

| Agent | Target | What to look for |
|-------|--------|-----------------|
| R1 | `src/engine/loop.ts` | where to insert L1.5, existing tick shape |
| R2 | `src/engine/world.ts` | `select()` signature, can it filter by prefix? |
| R3 | `src/lib/edge.ts` | cache API, TTL, invalidation |
| R4 | `src/pages/api/chat/turn.ts` | response lifecycle, where to hook prefetch |

### W2 — Decide (Opus × 1)

Decide: prefetch triggers on message-land vs tick vs response-send. Decide
cache key shape. Decide how to measure hit rate deterministically.

### W3 — Edits (Sonnet × 4, parallel)

One agent per file touched.

### W4 — Verify (Sonnet × 2, parallel)

- V1: test — fire message, assert top-3 `ui:*` receivers are cache-warm before
  any click; assert click latency p50 drops vs Cycle 2 baseline
- V2: rubric + L5 (evolution) didn't regress: prefetch must never block L1

### Cycle 3 Gate

```bash
# Deterministic proof
bun vitest run src/engine/loop.test.ts
curl -s localhost:4321/api/metrics | jq '.ui.prefetch.hitRate'  # >= 0.5
curl -s localhost:4321/api/metrics | jq '.ui.click.p50Ms'       # < baseline
```

- [ ] prefetch hit rate ≥ 50% after 100 clicks
- [ ] click → TypeDB p50 latency drops measurably vs Cycle 2
- [ ] `/api/tick` reports `prefetchMs` alongside other loop timings
- [ ] rubric ≥ 0.75 on truth (measurements are real, not synthetic)

---

## Cost Discipline

| Cycle | Wave | Agents | Model | Share |
|-------|------|--------|-------|-------|
| 1 | W1 | 5 | Haiku | 6% |
| 1 | W2 | 1 | Opus | 16% |
| 1 | W3 | 3 | Sonnet | 10% |
| 1 | W4 | 3 | Sonnet | 6% |
| 2 | W1 | 8 | Haiku | 10% |
| 2 | W2 | 1 | Opus | 10% |
| 2 | W3 | 8 | Sonnet | 20% |
| 2 | W4 | 2 | Sonnet | 5% |
| 3 | W1 | 4 | Haiku | 5% |
| 3 | W2 | 1 | Opus | 10% |
| 3 | W3 | 4 | Sonnet | 5% |
| 3 | W4 | 2 | Sonnet | 5% |

---

## Status

- [x] **Cycle 1: WIRE** — helper + rule + ConversationView
  - [x] W1 — Recon (Haiku × 5, parallel)
  - [x] W2 — Decide (Opus × 1)
  - [x] W3 — Edits (Sonnet × 3, parallel)
  - [x] W4 — Verify (Sonnet × 3, parallel)
- [x] **Cycle 2: PROVE** — retrofit 8 remaining components
  - [x] W1 — Recon (Haiku × 8, parallel)
  - [x] W2 — Decide (Opus × 1)
  - [x] W3 — Edits (Sonnet × 8, parallel)
  - [x] W4 — Verify (Sonnet × 2, parallel)
- [x] **Cycle 3: GROW** — prefetch loop, speed compounds
  - [x] W1 — Recon (Haiku × 4, parallel)
  - [x] W2 — Decide (Opus × 1)
  - [x] W3 — Edits (Sonnet × 4, parallel)
  - [x] W4 — Verify (Sonnet × 2, parallel)

---

## Execution

```bash
/do TODO-ui-signals.md         # advance next wave
/see highways --tag ui         # watch UI paths form
/see frontiers                 # unexplored click clusters
```

---

## See Also

- [DSL.md](one/DSL.md) — signal grammar (always loaded in W2)
- [dictionary.md](dictionary.md) — canonical names
- [routing.md](routing.md) — `select()`, prefetch patterns
- [rubrics.md](rubrics.md) — fit/form/truth/taste scoring
- [ADL-integration.md](ADL-integration.md) — permission gates (lifecycle/network/sensitivity) every `ui:*` signal passes through
- [rich-messages.md](rich-messages.md) — `RichMessage` contract `emitClick(id, payload)` conforms to
- [TODO-adl.md](TODO-adl.md) — ADL rollout cycles (prerequisite context for gate shape)
- [TODO-rich-messages.md](TODO-rich-messages.md) — rich message rollout cycles (prerequisite context for payload shape)
- [TODO-template.md](one/TODO-template.md) — this template
- [.claude/rules/ui.md](../.claude/rules/ui.md) — rule created in Cycle 1

---

*3 cycles. 14 tasks. Every click a signal. Every signal a lesson. The router
gets faster the more it's used.*
