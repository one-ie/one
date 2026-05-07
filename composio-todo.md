# composio-todo

> **Spec (source of truth):** [`composio.md`](composio.md)
> **Mode:** lean — spec locked, variance known, exit scalar, files known
> **Goal:** ship in **one /do cycle** — skill-first tool routing (nanoclaw.dev imports) with Composio as fallback for uncovered toolkits; web OAuth connect flow.
> **Width:** 6 parallel sonnets in W3 (3 claw files + 3 web files), 1 sonnet stitch in W3.5.

---

## Classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | `composio.md` names every file, every API call, every snippet |
| Variance known | YES | One shape per file; skill-first routing + composio fallback pattern is 1:1 from spec |
| Exit scalar | YES | `bun run build` green in claw + web · tsc clean · connect POST returns redirectUrl · callback GET → 302 · skill tool takes precedence over composio tool for covered toolkit |
| Files known | YES | 5 new files, 4 edits, 0 schema migrations |

`mode: lean` · `lifecycle: construction`

---

## Routing

```
W1 recon (haiku · 1 task)
  → confirms claw/src/agents/builder.ts tool wiring shape
  → checks claw/src/types.ts Env interface
  → checks web/src/pages/api/ route structure
  → reports: what's there, any gotchas (ToolLoopAgent tool shape, userId availability in prepareCall)
    → emits findings JSON

W2 decide (opus · 1 task)
  → consumes W1 findings + composio.md
  → resolves async composio.create() placement (prepareCall vs. build-time)
    → emits per-file diff specs (4 new + 4 edit specs)

W3 edit (sonnet × 6 in parallel · single message, 6 tool calls)
  → 5 new files (independent, no shared state)
  → 1 dependency-install task
    → all land before W3.5 starts

W3.5 stitch (sonnet · 1 task)
  → wires skill-first + composio fallback into builder.ts + types.ts + wrangler.toml (depends on W3 outputs)

W4 verify (opus · 1 task)
  → bun run build (claw + web), tsc --noEmit, manual checklist, rubric score
    → gate at rubric ≥ 0.65
```

**Parallel budget:** W3's 6 tasks are independent — no file overlaps. Spawn in a
single message with 6 Agent tool calls.

---

## Schema reference

None. No TypeDB entities, no D1 migrations. Composio holds connected-account
state; we store nothing locally. The `user_id` (wallet address) is the
durable key — already in `CallOptions.userId` in `claw/src/types.ts`.

---

## Source-of-truth docs (load every wave)

- `composio.md` — this plan; every snippet cited verbatim
- `one/dictionary.md` — `mark/warn` verb usage, signal shape
- `one/dsl.md` — Rule 1 closed-loop contract (composio results → mark/warn)
- `one/rubrics.md` — fit/form/truth/taste scoring
- `.claude/rules/engine.md` — Rule 1 (composio tool results MUST close the loop)
- `.claude/rules/ui.md` — `emitClick` if any connect button is added to web

---

## Waves

### W1 — recon (haiku · 1 task · ~30s)

| id | task | exit |
|----|------|------|
| `R1` | Read `claw/src/agents/builder.ts` (focus: `buildTools`, `prepareCall`, `ToolLoopAgent` signature); `claw/src/types.ts` (Env + CallOptions); `claw/src/aitools.ts` (lines 1-30, tool factory shape); `claw/wrangler.toml`; `web/src/pages/api/` directory listing; `web/src/lib/skill/` directory (does `loadSkill` exist? what shape?). Check: does `@composio/core` appear in `claw/package.json`? Is there an existing composio route in web? Report: `prepareCall` signature, `loadSkill` export shape (if present), whether `ToolLoopAgent.tools` accepts a per-call async merge, any gotchas. | findings.md emitted (≤200 lines, verbatim quotes from builder.ts + types.ts + loadSkill if present) |

**Agent type:** `w1-recon` · `model: haiku`

---

### W2 — decide (opus · 1 task · ~60s)

| id | task | exit |
|----|------|------|
| `D1` | Consume W1 findings + `composio.md`. Resolve two things: (a) where does the three-layer tool merge live — `buildTools` (sync, needs restructure) or `prepareCall` (async-friendly, preferred); (b) how does `loadSkillTools` read skill SKILL.md files from R2/KV in the claw Worker context (claw has KV, not R2 — W1 findings clarify). Per composio.md §"Wire into ToolLoopAgent", tool merge order is: substrate → skillTools → fallbackComposio. Map to exact `prepareCall` or builder override. Emit `w2-plan.json`: 5 new-file specs + 4 edit specs with exact anchors from W1 line numbers. Validate: no two tasks touch the same file. | `w2-plan.json` with 10 self-contained task specs; conflicts: 0 |

**Agent type:** `w2-decide` · `model: opus`

---

### W3 — edit (sonnet × 5 parallel · single message · ~90s)

All six tasks are file-independent. Spawn in **one message** with 6 Agent tool calls.

| id | task | files (write) | dep on | exit |
|----|------|---------------|--------|------|
| `E1` | Install deps | `claw/package.json`, `claw/bun.lock` | — | `cd claw && bun add @composio/core @composio/vercel` succeeds |
| `E2` | Create `composio.ts` | `claw/src/composio.ts` | — | matches composio.md §"Minimal integration" verbatim; exports `composioTools(userId, toolkits?)` + `SKILL_TOOLKIT_MAP`; tsc clean |
| `E3` | Create `composio-toolkits.ts` | `claw/src/composio-toolkits.ts` | — | matches composio.md §"Auth configs" `AUTH_CONFIGS` map + `SKILL_TOOLKIT_MAP` (skill-name → Composio toolkit id: `{ gmail: 'GMAIL', slack: 'SLACK', github: 'GITHUB', linear: 'LINEAR', 'google-calendar': 'GOOGLECALENDAR', discord: 'DISCORD' }`); tsc clean |
| `E4` | Create `skill-tools.ts` | `claw/src/skill-tools.ts` | — | exports `loadSkillTools(env, userId): Promise<Record<string,tool>>` — reads imported skill SKILL.md files from KV under `<userId>/skills/*/SKILL.md` pattern, wraps each as an AI SDK v6 `tool()` that calls the skill's `execute` function; tsc clean |
| `E5` | Create `connect.ts` API | `web/src/pages/api/composio/connect.ts` | — | matches composio.md §"Connect flow" step 1; POST → returns `{ redirectUrl }`; uses `locals.user.walletAddress` as userId; tsc clean |
| `E6` | Create `callback.ts` API | `web/src/pages/api/composio/callback.ts` | — | matches composio.md §"Connect flow" step 3; GET → 302 to `/settings?connected=…` or `/settings?error=connect_failed`; tsc clean |

**Agent type:** `w3-edit` × 6 · `model: sonnet`
**Spawn:** single message, 6 Agent tool calls, all `run_in_background: false`

---

### W3.5 — stitch (sonnet · 1 task · ~30s)

Only step that depends on W3 outputs landing.

| id | task | files (edit) | dep on | exit |
|----|------|--------------|--------|------|
| `S1` | Wire skill-first + composio fallback into agent builder + env | `claw/src/agents/builder.ts`, `claw/src/types.ts`, `claw/wrangler.toml` | E1-E6 | `types.ts` gains `COMPOSIO_API_KEY?: string` in Env; `builder.ts` wires three-layer merge (substrate → `loadSkillTools` → `composioTools` fallback) per W2 plan (prepareCall or buildTools — follow D1 decision); `wrangler.toml` adds `# COMPOSIO_API_KEY` secret comment; tsc clean |

**Agent type:** `w3-edit` · `model: sonnet`

---

### W4 — verify (opus · 1 task · ~60s)

| id | task | exit |
|----|------|------|
| `V1` | Run gate sequence: `cd claw && bun run build` (must succeed); `cd web && bun run build` (must succeed); `tsc --noEmit` in both (0 errors). Checklist: (a) `composio.ts` exports `composioTools` matching spec §Minimal integration; (b) `composio-toolkits.ts` has AUTH_CONFIGS with ≥4 toolkits; (c) `connect.ts` uses `locals.user.walletAddress` not email; (d) `callback.ts` redirects on success AND error; (e) `wrangler.toml` has COMPOSIO_API_KEY comment; (f) no `COMPOSIO_API_KEY` hardcoded (grep check). Score rubric. | `bun run build` exit 0 (both) · tsc clean (both) · checklist all 6 green · rubric ≥ 0.65 · receipts.json emitted |

**Agent type:** `w4-verify` · `model: opus`

---

## Task metadata (full table)

| id | wave | model | value | effort | persona | blocks | exit | tags |
|----|------|-------|-------|--------|---------|--------|------|------|
| R1 | W1 | haiku | 3 | 1 | recon | D1 | findings.md | recon, composio |
| D1 | W2 | opus | 5 | 2 | architect | E1-E6,S1 | w2-plan.json | decide, async-tools, skill-first |
| E1 | W3 | sonnet | 2 | 1 | builder | S1, V1 | bun add OK | deps |
| E2 | W3 | sonnet | 5 | 2 | builder | S1 | tsc clean | composio, claw |
| E3 | W3 | sonnet | 3 | 1 | builder | S1 | tsc clean | composio, config |
| E4 | W3 | sonnet | 5 | 2 | builder | S1 | tsc clean | skill-tools, claw |
| E5 | W3 | sonnet | 4 | 2 | builder | V1 | tsc clean | api, oauth, web |
| E6 | W3 | sonnet | 4 | 2 | builder | V1 | tsc clean | api, oauth, web |
| S1 | W3.5 | sonnet | 5 | 2 | builder | V1 | tsc clean | wire, env, builder, skill-first |
| V1 | W4 | opus | 5 | 2 | verifier | — | rubric ≥ 0.65 | gate |

**Critical path:** R1 → D1 → (E1‖E2‖E3‖E4‖E5‖E6) → S1 → V1
**Wall time estimate:** 30 + 60 + 90 + 30 + 60 = **~4.5 minutes** if W3 fans out cleanly.
**Without parallelism:** 30 + 60 + (6×90) + 30 + 60 = ~12.5 minutes. 2.8× speedup.

---

## Conflict matrix (verify D1 emits zero overlaps)

```
                 E1  E2  E3  E4  E5  E6  S1
package.json    E1   .   .   .   .   .   .
composio.ts      .  E2   .   .   .   .   .
composio-tk.ts   .   .  E3   .   .   .   .
skill-tools.ts   .   .   .  E4   .   .   .
connect.ts       .   .   .   .  E5   .   .
callback.ts      .   .   .   .   .  E6   .
builder.ts       .   .   .   .   .   .  S1
types.ts         .   .   .   .   .   .  S1
wrangler.toml    .   .   .   .   .   .  S1
```

Diagonal-only. Zero overlap. Safe to fan out W3.

---

## Spawn template (W3, copy-paste ready)

```
Agent({ subagent_type: 'w3-edit', model: 'sonnet',
        description: 'Create claw/src/composio.ts',
        prompt: 'Per w2-plan.json task E2 + composio.md §Minimal integration:
                 write claw/src/composio.ts exactly as specified — Composio
                 singleton + composioTools(userId, toolkits?) factory +
                 SKILL_TOOLKIT_MAP export.
                 After write, run `cd claw && bunx tsc --noEmit -p .`
                 and report exit code.' })
```

…repeat for E1, E3, E4, E5, E6. All in **one** message.

---

## Key design decisions (for W2)

**1. Three-layer merge placement.** `loadSkillTools` and `composioTools` are both async. `buildTools(env)` is sync. W2 must pick:
- **`prepareCall` override** — merge all three layers before each message. Cleanest; matches composio.md §"Per-request" and §"Wire into ToolLoopAgent". Preferred.
- **Async builder** — make `makeAgent` async and await all three before constructing `ToolLoopAgent`. Only if `prepareCall` can't override tools.

W1 reports the exact `prepareCall` signature and whether it can patch `tools`; W2 decides.

**2. `loadSkillTools` storage path in claw.** Claw has KV, not R2. Imported skills in `web/` are stored in R2. W2 must decide: does `loadSkillTools` call `api.one.ie` to resolve skills, or does claw get its own KV mirror of imported skills? W1 findings on `web/src/lib/skill/` shape will clarify.

**3. `SKILL_TOOLKIT_MAP` coverage.** Start with 6 entries (gmail, slack, github, linear, google-calendar, discord). Composio fallback handles anything not in the map. W2 expands the map if W1 finds more overlapping nanoclaw.dev skills.

---

## Self-checkoff

W4 stamps each row when its exit fires:

```
- [ ] R1 — recon · findings.md ≤ 200 lines
- [ ] D1 — decide · w2-plan.json · 0 conflicts · 3 design decisions resolved
- [ ] E1 — bun add @composio/core @composio/vercel OK
- [ ] E2 — composio.ts · tsc clean
- [ ] E3 — composio-toolkits.ts · tsc clean
- [ ] E4 — skill-tools.ts · tsc clean
- [ ] E5 — connect.ts · tsc clean
- [ ] E6 — callback.ts · tsc clean
- [ ] S1 — builder.ts + types.ts + wrangler.toml wired · skill-first routing confirmed · tsc clean
- [ ] V1 — bun run build OK (claw + web) · checklist 7/7 · rubric ≥ 0.65
```

---

## Rubric (W4 scoring · gate ≥ 0.65)

| Dim | What it measures | Min |
|-----|------------------|-----|
| **fit** | Spec satisfied: skill-first routing (loadSkillTools → composio fallback) · AUTH_CONFIGS ≥4 · connect POST returns redirectUrl · callback 302 on success+error · userId = walletAddress · SKILL_TOOLKIT_MAP dedup works | 0.7 |
| **form** | Rule 1 closed: both skill and composio tool results flow through mark/warn shim; COMPOSIO_API_KEY never in browser; `user_id` never shared across users | 0.7 |
| **truth** | Every snippet in `composio.md` literally present in committed files (W4 grep); skill-first routing matches composio.md §"Wire into ToolLoopAgent" three-layer pattern | 0.7 |
| **taste** | Consistent with neighboring claw/src/ files; no hardcoded auth config IDs; tight; `loadSkillTools` fails gracefully (returns `{}`) when KV has no skill keys | 0.6 |

If any dim < 0.6, dissolve and re-decide with failing dim as feedback.

---

## Pheromone close

On `V1` pass, emit:

```
mark('cycle:composio', amount=rubricAvg)
tag: mode:lean lifecycle:construction surface:byo-accounts
```

Append to `one/learnings.md`:

```
- 2026-MM-DD · cycle 1 · gate · composio BYO-accounts wired with skill-first routing (nanoclaw.dev skills → composio fallback), loadSkillTools + SKILL_TOOLKIT_MAP dedup, web OAuth connect/callback, userId=walletAddress · rubric=0.NN · source=cycle
```

---

## Don't

- **Don't serialize W3.** Single message, 5 tool calls.
- **Don't hardcode auth config IDs** in source — they go in env or a runtime-loaded map, not as literal strings in committed code.
- **Don't use email as user_id** — walletAddress only, per composio.md §user_id.
- **Don't expose COMPOSIO_API_KEY to the browser** — all `composio.create()` calls are Worker-side.
- **Don't skip W1.** The skill-first routing and async merge decisions both depend on reading the actual ToolLoopAgent + loadSkill signatures.
- **Don't approve W4 with rubric ≥ 0.65 if any single dim < 0.6.** Average can lie.

---

## See Also

- [`composio.md`](composio.md) — spec (source of truth)
- [`one/template-todo.md`](one/template-todo.md) — TODO shape
- [`one/rubrics.md`](one/rubrics.md) — scoring contract
- [`one/patterns.md`](one/patterns.md) — closed loop, Rule 1
- [`claw/src/agents/builder.ts`](claw/src/agents/builder.ts) — ToolLoopAgent factory (S1 target)
- [`claw/src/aitools.ts`](claw/src/aitools.ts) — existing AI SDK v6 tool map (reference shape for E4)
- [nanoclaw.dev/skills](https://nanoclaw.dev/skills) — 40+ skills catalog; Gmail/Slack/GitHub/Discord/Linear/GCal/Vercel all covered
- [`claw/src/types.ts`](claw/src/types.ts) — Env + CallOptions (S1 target)
