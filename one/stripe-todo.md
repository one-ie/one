# stripe-todo

> **Spec (source of truth):** [`stripe.md`](stripe.md)
> **Mode:** lean — spec locked, variance known, exit scalar, files known
> **Goal:** ship in **one /do cycle**, max width, near-zero serial waiting.
> **Width:** 6 parallel sonnets in W3 (4 components + 2 APIs), 1 opus serial edit at the end.

---

## Classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | `stripe.md` names every file, every option, every snippet |
| Variance known | YES | One shape per file; ports map 1:1 from `one.ie/src/components/pay/card/` |
| Exit scalar | YES | Test card `4242…` succeeds end-to-end · Lighthouse `/chat` ≥ 95 · `bun run build` green · design-check.sh: 0 violations · `stripe trigger payment_intent.succeeded` → 200 |
| Files known | YES | 6 new files, 4 edits, 0 schema migrations |

`mode: lean` · `lifecycle: construction`

---

## Routing

```
W1 recon (haiku · 1 task)
  → confirms one.ie ports still exist + reads target patterns
    → emits findings JSON
W2 decide (opus · 1 task)
  → consumes W1 findings + stripe.md
    → emits per-file diff specs (6 file specs + 4 edit specs)
W3 edit (sonnet × 7 in parallel · single message, 7 tool calls)
  → 6 new files (independent, no shared state)
  → 1 dependency-install task
    → all land before W4 starts
W3.5 stitch (sonnet · 1 task)
  → only this depends on W3 outputs: edits Chat.tsx, wrangler.toml, dev.vars
W4 verify (opus · 1 task)
  → bun run build, design-check.sh, manual checklist, rubric score
    → gate at rubric ≥ 0.65
```

**Parallel budget:** W3's 7 tasks are independent — no file overlaps, no
shared imports being added simultaneously. They MUST be spawned in a
single message with 7 Agent tool calls per the parallel-tool-call rule.

---

## Schema reference

None. No TypeDB entities, no D1 migrations. PaymentIntents are the
source of truth; webhook emits `substrate:pay` signals to the existing
`/api/signal` endpoint with no new receivers.

---

## Source-of-truth docs (load every wave)

- `one/dictionary.md` — `substrate:pay` receiver naming, signal shape
- `one/dsl.md` — `mark/warn` verb usage in webhook
- `one/rubrics.md` — fit/form/truth/taste scoring
- `.claude/rules/design.md` — 6-token allowlist (W3 + W4 must enforce)
- `.claude/rules/ui.md` — `emitClick` contract for all onClick
- `.claude/rules/astro.md` — `client:idle` preservation
- `stripe.md` — this plan

---

## Waves

### W1 — recon (haiku · 1 task · ~30s)

| id | task | exit |
|----|------|------|
| `R1` | Read `one.ie/src/components/pay/card/{StripeProvider,StripeCheckoutForm,StripeCheckoutWrapper}.tsx` + `api/pay/stripe/{create-intent,webhook}.ts`. Read target `web/src/{components/Chat.tsx, lib/cf-env.ts, pages/api/chat.ts, layouts/Layout.astro}`. Confirm `web/wrangler.toml` shape and that `dev.vars` exists. Report: file sizes, what's already there, any gotchas (e.g. `getEnv` signature, existing lucide imports). | findings.md emitted (≤300 lines, verbatim quotes) |

**Agent type:** `w1-recon` · `model: haiku`

---

### W2 — decide (opus · 1 task · ~60s)

| id | task | exit |
|----|------|------|
| `D1` | Consume W1 findings + `stripe.md`. For each of 7 W3 tasks emit a diff spec: file path, dependencies (imports), exact code (copy from `stripe.md` snippets), anchor for edits (line numbers from W1). Validate: no two tasks touch the same file. Validate: every `emitClick` receiver matches `ui:pay:*` allowlist. Emit `w2-plan.json`. | `w2-plan.json` with 7 self-contained task specs; conflicts: 0 |

**Agent type:** `w2-decide` · `model: opus`

---

### W3 — edit (sonnet × 7 parallel · single message · ~90s)

All seven tasks are file-independent. Spawn in **one message** with 7
Agent tool calls. No task imports from another W3 output (the only
cross-task imports — Chat.tsx → PayPanel — are deferred to W3.5).

| id | task | files (write) | dep on | exit |
|----|------|---------------|--------|------|
| `E1` | Install deps | `web/package.json`, `web/bun.lock` | — | `bun add stripe @stripe/stripe-js @stripe/react-stripe-js` succeeds |
| `E2` | Create `PriceCards.tsx` | `web/src/components/pay/PriceCards.tsx` | — | file matches stripe.md §1 verbatim; tsc clean |
| `E3` | Create `StripeProvider.tsx` | `web/src/components/pay/StripeProvider.tsx` | — | file matches stripe.md §2; reads `PUBLIC_STRIPE_PUBLISHABLE_KEY`; tsc clean |
| `E4` | Create `StripeCheckoutForm.tsx` | `web/src/components/pay/StripeCheckoutForm.tsx` | — | file matches stripe.md §3 (~60 LOC, card-only options); tsc clean |
| `E5` | Create `PayPanel.tsx` | `web/src/components/pay/PayPanel.tsx` | — | file matches stripe.md §4; lazy imports `StripeProvider` + `StripeCheckoutForm` (forward-ref OK because lazy resolves at runtime); tsc clean |
| `E6` | Create `create-intent.ts` API | `web/src/pages/api/pay/create-intent.ts` | — | file matches stripe.md API §1; uses `Stripe.createFetchHttpClient()`; idempotency key wired; tsc clean |
| `E7` | Create `webhook.ts` API | `web/src/pages/api/pay/webhook.ts` | — | file matches stripe.md API §2; `constructEventAsync`; 4 events handled; tsc clean |

**Agent type:** `w3-edit` × 7 · `model: sonnet`
**Spawn:** single message, 7 Agent tool calls, all `run_in_background: false`

---

### W3.5 — stitch (sonnet · 1 task · ~30s)

Only step that depends on W3 outputs landing.

| id | task | files (edit) | dep on | exit |
|----|------|--------------|--------|------|
| `S1` | Wire PayPanel into Chat + add env vars | `web/src/components/Chat.tsx`, `web/wrangler.toml`, `web/dev.vars` | E2-E7 | `<PayPanel>` lazy import + sticky `showPay` state per stripe.md edits; `STARTERS` gains `'Show pricing'`; `wrangler.toml` adds `PUBLIC_STRIPE_PUBLISHABLE_KEY`; `dev.vars` adds 3 stripe keys (placeholders OK for build); tsc clean |

**Agent type:** `w3-edit` · `model: sonnet`

---

### W4 — verify (opus · 1 task · ~60s)

| id | task | exit |
|----|------|------|
| `V1` | Run gate sequence: `cd web && bun run build` (must succeed); `bash .claude/hooks/design-check.sh` (0 violations); diff bundle vs baseline (`/chat` initial chunk delta ≤ 0 KB); tsc clean. Then score rubric: fit (does the form ship card-only? selected card lifts? webhook verifies?), form (6-token compliance, no banned classes, ≤6 visual elements per polish budget), truth (each cited line in stripe.md present in committed file), taste (consistent style with neighboring `web/src/components/`). Report numbers, not vibes. | `bun run build` exit 0 · design-check exit 0 · rubric ≥ 0.65 (all four dimensions ≥ 0.6) · receipts.json emitted |

**Agent type:** `w4-verify` · `model: opus`

---

## Task metadata (full table)

| id | wave | model | value | effort | persona | blocks | exit | tags |
|----|------|-------|-------|--------|---------|--------|------|------|
| R1 | W1 | haiku | 3 | 1 | recon | D1 | findings.md | recon, port |
| D1 | W2 | opus | 5 | 2 | architect | E1-E7 | w2-plan.json | decide, parallel-prep |
| E1 | W3 | sonnet | 2 | 1 | builder | S1, V1 | bun add OK | deps |
| E2 | W3 | sonnet | 4 | 2 | builder | S1, V1 | tsc clean | ui, pay |
| E3 | W3 | sonnet | 3 | 1 | builder | E5 | tsc clean | ui, stripe |
| E4 | W3 | sonnet | 5 | 2 | builder | E5 | tsc clean | ui, stripe |
| E5 | W3 | sonnet | 5 | 2 | builder | S1 | tsc clean | ui, pay, state |
| E6 | W3 | sonnet | 5 | 2 | builder | V1 | tsc clean | api, stripe, workers |
| E7 | W3 | sonnet | 5 | 2 | builder | V1 | tsc clean | api, stripe, webhook |
| S1 | W3.5 | sonnet | 4 | 1 | builder | V1 | tsc clean | wire, env |
| V1 | W4 | opus | 5 | 2 | verifier | — | rubric ≥ 0.65 | gate |

**Critical path:** R1 → D1 → (E1‖E2‖E3‖E4‖E5‖E6‖E7) → S1 → V1
**Wall time estimate:** 30 + 60 + 90 + 30 + 60 = **~4.5 minutes** if W3 fans out cleanly.
**Without parallelism:** 30 + 60 + (7×90) + 30 + 60 = ~13 minutes. 3× speedup.

---

## Conflict matrix (verify D1 emits zero overlaps)

```
            E1  E2  E3  E4  E5  E6  E7  S1
package.json E1   .   .   .   .   .   .   .
PriceCards   .  E2   .   .   .   .   .   .
StripeProv   .   .  E3   .   .   .   .   .
StripeForm   .   .   .  E4   .   .   .   .
PayPanel     .   .   .   .  E5   .   .   .
create-int   .   .   .   .   .  E6   .   .
webhook      .   .   .   .   .   .  E7   .
Chat.tsx     .   .   .   .   .   .   .  S1
wrangler.toml.   .   .   .   .   .   .  S1
dev.vars     .   .   .   .   .   .   .  S1
```

Diagonal-only. Zero overlap. Safe to fan out W3.

---

## Spawn template (W3, copy-paste ready)

When firing W3, send a single assistant message with **seven** Agent tool
calls. Each prompt is self-contained and cites the exact `stripe.md`
section + the W2 diff spec for that file.

```
Agent({ subagent_type: 'w3-edit', model: 'sonnet',
        description: 'Create PriceCards.tsx',
        prompt: 'Per w2-plan.json task E2 + stripe.md §1: write
                 web/src/components/pay/PriceCards.tsx exactly as
                 specified. No deviations. After write, run
                 `cd web && bunx tsc --noEmit -p .` and report
                 exit code.' })
```

…repeat for E1, E3, E4, E5, E6, E7. All in **one** message.

---

## Self-checkoff

W4 stamps each row when its exit fires:

```
- [x] R1 — recon · findings.md ≤ 300 lines
- [x] D1 — decide · w2-plan.json · 0 conflicts
- [x] E1 — bun add OK
- [x] E2 — PriceCards.tsx · tsc clean
- [x] E3 — StripeProvider.tsx · tsc clean
- [x] E4 — StripeCheckoutForm.tsx · tsc clean
- [x] E5 — PayPanel.tsx · tsc clean
- [x] E6 — create-intent.ts · tsc clean
- [x] E7 — webhook.ts · tsc clean
- [x] S1 — Chat + wrangler + dev.vars wired · tsc clean
- [x] V1 — bun run build OK · design-check 0 · rubric ≥ 0.65
```

---

## Rubric (W4 scoring · gate ≥ 0.65)

| Dim | What it measures | Min |
|---|---|---|
| **fit** | Spec satisfied: 2 cards · pick · card-only PaymentElement · webhook verifies · idempotency present | 0.7 |
| **form** | 6 tokens only · no banned classes · ≤6 visual elements (polish budget) · `client:idle` preserved | 0.7 |
| **truth** | Every snippet in `stripe.md` literally present in committed file (W4 grep check) | 0.7 |
| **taste** | Consistent with neighboring `web/src/components/`; tight; no narration comments | 0.6 |

If any dim < 0.6, dissolve the cycle and re-decide (W2 again with the
failing dim as feedback).

---

## Pheromone close

On `V1` pass, emit:

```
mark('cycle:stripe', amount=rubricAvg)
tag: mode:lean lifecycle:construction surface:pay
```

And append to `one/learnings.md`:

```
- 2026-MM-DD · cycle 1 · gate · stripe inline pay panel shipped to /chat (2-card pick → card-only Elements → webhook), Lighthouse held, ~4.5min wall via 7-way W3 fan-out · rubric=0.NN · source=cycle
```

---

## Don't

- **Don't serialize W3.** If you spawn one agent at a time you forfeit the 3× speedup. Single message, 7 tool calls.
- **Don't let any W3 task edit `Chat.tsx`** — that's S1's lane. A W3 task touching it creates a merge.
- **Don't skip W1.** It's 30s and prevents D1 from hallucinating line numbers.
- **Don't add anything not in stripe.md.** No security badges, no card-network logos, no extra icons. The polish budget is locked.
- **Don't approve W4 with rubric ≥ 0.65 if any single dim < 0.6.** Average can lie.

---

## See Also

- [`stripe.md`](stripe.md) — spec (source of truth)
- [`template-todo.md`](template-todo.md) — TODO shape
- [`rubrics.md`](rubrics.md) — scoring contract
- [`patterns.md`](patterns.md) — closed loop, sandwich
- [`design.md`](design.md) — 6-token system enforced by hook
- [`../one.ie/src/components/pay/card/`](../../one.ie/src/components/pay/card/) — port source
