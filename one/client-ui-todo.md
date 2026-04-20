---
title: TODO Client UI
type: roadmap
version: 3.0.0
priority: Wire → Prove → Grow
total_tasks: 12
completed: 12
status: COMPLETE
source: docs/client-ui.md
---

# TODO: Client UI (multi-tenant web client on Cloudflare)

> **Time units:** plan in **tasks → waves → cycles** only. Never days, hours,
> weeks, or sprints. Width = tasks-per-wave. Depth = waves-per-cycle. Learning
> = cycles-per-path. (See `.claude/rules/engine.md` → The Three Locked Rules.)
>
> **Parallelism directive:** **Maximize agents per wave.** Single message, many
> tool calls. W1 ≥ 4 Haiku (one per read target), W2 ≥ 2 Opus shards when
> findings > ~20, W3 = one Sonnet per file, W4 ≥ 2 Sonnet verifiers sharded
> by check type. Sequential between waves, maximum parallel within waves.
>
> **Goal:** Ship a multi-tenant web client where users and agents own groups,
> manage the six dimensions, chat live, bring their own keys, deploy claws,
> and embed chat anywhere — all on Cloudflare free tier until opt-in.
>
> **Source of truth:** [client-ui.md](client-ui.md) — 29-section design spec,
> [DSL.md](one/DSL.md) — the signal language,
> [dictionary.md](dictionary.md) — everything named,
> [naming.md](naming.md) — the 6 dimensions (locked),
> [rubrics.md](rubrics.md) — fit/form/truth/taste → mark
>
> **Shape:** 3 cycles, four waves each. Each cycle bundles ~4 of the 12
> source cycles in `client-ui.md` §13 + §22 as waved sub-deliverables.
>
> **Schema:** No `one.tql` changes required. UI projects existing entities:
> `group`, `actor`, `thing`, `path`, `signal`, `hypothesis`. Brand is a
> `thing` with `thing-type="brand"` (see `src/engine/brand.ts`).
>
> **Ontology is navigation.** The URL structure IS the six dimensions —
> there is no parallel IA. Tabs map to dims 2–6 (`actors`, `things`, `paths`,
> `events`, `learning`) + `chat` (dim 5 live). Verb routes are path-typed
> projections of dim 4: **`/buy`** = inbound path offers (capabilities I can
> hire), **`/sell`** = outbound path offers (capabilities I publish),
> **`/dashboard`** = rollup of dims 5+6 (signals + hypotheses → KPIs). No
> route exists that isn't a projection of `one.tql`. No hidden menu, no
> "marketplace" that lives outside the graph — `/buy` and `/sell` are the
> graph, filtered by the `capability` relation's direction.

## Deliverables

Every TODO emits two tiers. **Wave deliverables** are universal (same four
artifacts ship at the end of every wave). **Cycle deliverables** are the
concrete UI surfaces this TODO exists to ship. Both carry a rubric weight
vector (fit / form / truth / taste, sums to 1.0) that tilts W4 scoring.

### Wave Deliverables (universal — every cycle emits these four)

| Wave | Deliverable | Goal | Rubric (fit/form/truth/taste) | Exit |
|------|-------------|------|-------------------------------|------|
| **W1** | Recon reports (N parallel) | Inventory reusable code + anchors with line numbers | 0.15 / 0.10 / **0.65** / 0.10 | ≥ (N-1)/N agents returned `result`; every finding cites file:line |
| **W2** | Diff spec set + component map | Decide route shape, component split, layout strategy per finding | **0.40** / 0.15 / **0.35** / 0.10 | Every W1 finding has a spec OR explicit "keep" rationale |
| **W3** | Applied edits (M parallel) | Land edits per spec without collateral drift | 0.30 / 0.25 / **0.35** / 0.10 | All anchors matched; zero files modified outside spec set |
| **W4** | Verification report | Prove rubric ≥ 0.65, tests green, perf budgets met | 0.25 / 0.15 / **0.45** / 0.15 | 4 rubric dims ≥ 0.65 AND `bun run verify` green AND perf budgets met |

**Truth dominates early waves** (recon must match disk). **Fit dominates W2**
(right route shape / component split). **W4 balances** because it judges all
four dimensions at cycle close.

### Cycle Deliverables

Each cycle below lists its concrete artifacts (files, endpoints, embeds). Every
cycle deliverable owns a `skill` on its unit — future `select()` routes toward
the path that shipped the strongest version.

## Routing

```
    signal DOWN                     result UP
    ──────────                      ─────────
    /do TODO-client-ui.md           result + 4 tagged marks
         │                               │
         ▼                               │
    ┌─────────┐                          │
    │  W1     │  Haiku recon ────────────┤ mark(edge:fit, score)
    │  read   │  → reuse existing code?  │ mark(edge:form, score)
    └────┬────┘                          │ mark(edge:truth, score)
         │                               │ mark(edge:taste, score)
         ▼                               │
    ┌─────────┐                          │
    │  W2     │  Opus decide             │ weak dim?
    │  fold   │  → route + component map │   → signal to specialist
    └────┬────┘                          │   → mark specialist path
         │                               │
         ▼                               │
    ┌─────────┐                          │
    │  W3     │  Sonnet edit             │
    │  apply  │  → Astro pages + islands │
    └────┬────┘                          │
         │                               │
         ▼                               │
    ┌─────────┐                          │
    │  W4     │  Sonnet verify ──────────┘
    │  score  │  → TTI budget + rubric
    └─────────┘    each dim marks a tagged edge
```

**Context accumulates down. Quality marks flow up. Weights route sideways.**

## Testing — The Deterministic Sandwich

```
    PRE (before W1)                    POST (after W4)
    ───────────────                    ────────────────
    bun run verify                     bun run verify
    ├── biome check .                  ├── biome check .
    ├── tsc --noEmit                   ├── tsc --noEmit
    └── vitest run                     ├── vitest run
                                       └── new tests for new islands
```

### W0 — Baseline

```bash
bun run verify
```

Record: passing test count, any known-flaky allowlisted. If baseline fails,
fix first. **Performance gates** specific to this TODO (from §11):

- TTI group view **< 200ms** (p50)
- Signal round-trip (keystroke → WS → DO → UI) **< 300ms** (p50)
- Chat streaming first-token **< 500ms** (p50)
- Bundle per route **< 100kb gz**
- 100-path graph paint **< 16ms**

### Cycle Gate = Tests Green + Budgets Met

- [ ] All baseline tests still pass (no regressions)
- [ ] New tests cover new islands/routes
- [ ] `biome check .` clean
- [ ] `tsc --noEmit` clean
- [ ] W4 rubric score ≥ 0.65 on all dimensions
- [ ] Performance budgets verified with Lighthouse + perf traces

**Verifier-script convention.** Each cycle's gate block references scripts
(`scripts/lighthouse.ts`, `scripts/grep-for-plaintext-keys.ts`,
`scripts/bundle-size.ts`, `scripts/test-embed-on-external-domain.ts`,
`scripts/test-bounty-e2e.ts`). These are **aspirational verifiers** — if a
script doesn't exist yet, authoring it is part of that cycle's W3 edits.
A cycle cannot mark its gate complete using "script missing, skipped" —
Rule 3 (deterministic results) says the verifier must run and produce
numbers. Existing verifiers already in `scripts/`: `test-ws-integration.ts`,
`e2e-test.ts`, `bench-routing.ts`, `speed-report.ts`.

---

```
   CYCLE 1: WIRE                 CYCLE 2: PROVE                CYCLE 3: GROW
   Shell + 6 tabs live           BYO keys + claws + prices     Brand + API + agency +
   ─────────────────             + public landing              embed + marketplace
   ~20 files, ~60 edits          ──────────────────            ─────────────────────────
                                 ~18 files, ~65 edits          ~31 files, ~100 edits
        │                              │                              │
        ▼                              ▼                              ▼
   ┌─W1─W2─W3─W4─┐              ┌─W1─W2─W3─W4─┐              ┌─W1─W2─W3─W4─┐
   │ H   O  S  S  │  ────────►  │ H   O  S  S  │  ────────►  │ H   O  S  S  │
   └──────────────┘              └──────────────┘              └──────────────┘

   H = Haiku (recon)    O = Opus (decide)    S = Sonnet (edit + verify)
```

---

## How Loops Drive This Roadmap

| Cycle | What changes | Loops activated |
|-------|-------------|-----------------|
| **WIRE** | 3-pane shell, 6 tabs project from TypeDB, chat live via WsHub | L1 (signal), L2 (path marking), L3 (fade) |
| **PROVE** | Users bring keys, create groups, invite members, deploy claws | L4 (economic — claw price, BYO keys) joins L1-L3 |
| **GROW** | Per-group brand + visitor view, per-group API/MCP, agency dashboard, ChatShell refactor, universal embed | L5-L7 (evolution, learning, frontier) join L1-L4 |

---

## Source of Truth

**[client-ui.md](client-ui.md)** — 29 sections, 12 source cycles + marketplace + public landing, locked principles
**[DSL.md](one/DSL.md)** — `{receiver, data}` signal grammar
**[dictionary.md](dictionary.md)** — canonical names
**[naming.md](naming.md)** — the 6 dimensions permanently named 2026-04-13
**[rubrics.md](rubrics.md)** — fit/form/truth/taste scoring

| Concept | Canonical | Source cycle (client-ui.md) |
|---------|-----------|-----------------------------|
| 3-pane shell | groups / tabs / inspector | §4, Cycle 1 |
| Chat primitive | `ChatStream` island → WsHub DO | §5.1, §20, Cycle 2 + 11 |
| Six tabs | Chat + Actors + Things + Paths + Events + Learning | §5, map 1:1 to dimensions 2–6 |
| Brand | `thing(thing-type="brand")` via `src/engine/brand.ts` | §14, Cycle 8 |
| Per-group API | `/api/g/:gid/*` | §16, Cycle 9 |
| Universal chat | `<ChatShell>` × 4 frames × target-agnostic | §20, Cycle 12 |

---

## Cycle 1: WIRE — Shell, tabs, chat, live events

**Bundles source cycles 1–4:** Skeleton, Chat+Events, Actors+Things, Paths+Learning.

**Files:** `src/pages/app/[groupId]/index.astro`, left/right panes, `ChatStream`,
`EventTable`, `ActorsTable`, `ThingsTable`, `ActorInspector`, `PathsGraph`,
`LearningPanel`. Reuse: `/world` page work, `useTaskWebSocket` hook, `/reactflow`
skill, shadcn components.

**Why first:** No UI without the shell. Every later cycle adds behind existing
panes. Ship the 6-tab projection of `one.tql` and the system becomes visible.

### Cycle 1 Deliverables

| # | Deliverable | Goal | Rubric (fit/form/truth/taste) | Exit | Skill |
|---|-------------|------|-------------------------------|------|-------|
| 1 | 3-pane shell | `/app/:gid` renders groups / tabs / inspector | 0.30/0.25/0.30/0.15 | `curl /app/demo` TTI p50 < 200ms (Lighthouse) | `client-ui:shell` |
| 2 | Six tabs from TypeDB | Chat + Actors + Things + Paths + Events + Learning project dim 2–6 | **0.40**/0.15/**0.35**/0.10 | no mock data: `grep -r "mock\|fixture" src/components/app/` returns 0 | `client-ui:tabs` |
| 3 | ChatStream live | keystroke → WS → DO → UI round-trip p50 < 300ms | 0.25/0.15/**0.45**/0.15 | `bun run scripts/test-ws-integration.ts` 11/11 | `client-ui:chat-stream` |
| 4 | PathsGraph (dagre, 100 edges) | paint < 16ms for 100-path graph | 0.20/0.25/0.35/**0.20** | perf-trace paint < 16ms on 100-edge fixture | `client-ui:paths-graph` |
| 5 | Learning panel | `reveal/forget/frontier/recall` surfaced per actor | 0.30/0.20/0.35/0.15 | `curl /api/memory/reveal/:uid` renders in panel | `client-ui:learning` |

---

### Wave 1 — Recon (parallel Haiku ≥ 4)

Spawn all in ONE message, one target per agent. Report verbatim, ≤ 300 words each.

| Agent | Target | What to look for |
|-------|--------|-----------------|
| R1 | `src/pages/world.astro` + `src/components/WorldMap/*` | Reusable shell primitives, dagre/force layout code |
| R2 | `src/lib/use-task-websocket.ts` + `gateway/` | WS reconnection, DO broadcast contract, auth |
| R3 | `src/components/ui/*` + shadcn installs | Components already available vs. needed |
| R4 | `src/pages/api/export/*` + TypeDB query helpers | CRUD endpoints present for actors/things/paths/events/learning |
| R5 | `src/components/ai/chat-v3/` (WIP, in git status) | Existing chat primitives, streaming state, what to reuse |
| R6 | `src/engine/persist.ts` | `reveal`/`forget`/`frontier`/`recall` surface for Learning tab |

**Outcome model:** `result` = report in. `timeout` = re-spawn once. `dissolved` =
target missing, drop. Advance when 5/6 reports are in.

**W1 self-score** (truth-heavy, deterministic): fit=scope matched target?
form=under 300 words? truth=% findings citing `file:line`? taste=findings
ordered by relevance? Emit `loop:feedback` per agent with `tags:
[...task.tags, 'wave:1', 'model:haiku']`. `mark('wave:1:{path}', s × 5)` on
pass; `warn(1)` + one re-spawn on fail.

---

### Wave 2 — Decide (Opus, shard if findings > 20)

**Context loaded:** DSL.md + dictionary.md + naming.md + client-ui.md §§1–13
+ hypotheses from `recall('ui')`.

Decide:
1. Route shape: `/app/[groupId]/[tab]` vs. `/app/[groupId]?tab=` (chosen: path
   segment for sharable URLs).
2. Which tabs ship as Astro pages vs. a single island swapping content
   (chosen: one page, one `<TabShell client:load>` island, tabs lazy-load).
3. Inspector: drawer vs. modal vs. third column (chosen per §4: third column).
4. PathsGraph layout default: dagre vs. force (chosen per §13 Cycle 4: dagre).

**Output:** M edit prompts — one per file touched. Each names anchor, action,
new text, rationale.

**W2 self-score** (fit-heavy, semi-deterministic): fit=% W1 findings with a
spec or "keep"? form=% specs with all 5 fields (TARGET/ANCHOR/ACTION/NEW/RATIONALE)?
truth=anchors are exact substrings (grep-verifiable)? taste=rationales one
sentence, no hedging? Emit `loop:feedback` per Opus shard with `tags:
[...task.tags, 'wave:2', 'model:opus']`. On fail re-shard once; second
failure halts.

---

### Wave 3 — Edits (parallel Sonnet, M = files touched, ~20)

One agent per file, all spawned in one message. Use `Edit` with exact anchors.
Dissolved if anchor doesn't match.

| Job | File | Est. edits |
|-----|------|-----------|
| E1 | `src/pages/app/[groupId]/index.astro` | new file |
| E2 | `src/components/app/GroupTree.tsx` | new file |
| E3 | `src/components/app/TabShell.tsx` | new file |
| E4 | `src/components/app/ChatStream.tsx` | new file (reuse `chat-v3/`) |
| E5 | `src/components/app/EventTable.tsx` | new |
| E6 | `src/components/app/ActorsTable.tsx` | new |
| E7 | `src/components/app/ThingsTable.tsx` | new |
| E8 | `src/components/app/Inspector.tsx` | new |
| E9 | `src/components/app/PathsGraph.tsx` | new (reuse WorldMap) |
| E10 | `src/components/app/LearningPanel.tsx` | new (wrap reveal/recall) |
| ... | data-loader modules, test files | ~10 more |

**W3 self-score** (truth + form, fully deterministic): fit=every spec
attempted? form=edits via `Edit` tool (no full rewrites)? truth=% anchors
matched first try? taste=zero lines touched outside spec (git diff word
count)? Emit `loop:feedback` per Sonnet editor with `tags:
[...task.tags, 'wave:3', 'model:sonnet', 'file:{path}']`. Anchor miss →
`warn(0.5)` + one re-spawn with fresher anchor.

---

### Wave 4 — Verify (parallel Sonnet ≥ 4 by check type)

| Shard | Owns | Reads |
|-------|------|-------|
| V1 | Consistency (naming per `naming.md`, no dead names) | all touched files |
| V2 | Cross-references (links, imports, route targets) | touched + referrers |
| V3 | Performance (TTI < 200ms, bundle < 100kb gz, 100-path < 16ms) | Lighthouse output + bundle analyzer |
| V4 | Rubric (fit 0.35 / form 0.20 / truth 0.30 / taste 0.15) | all touched + `rubrics.md` |

**If inconsistencies:** spawn micro-edits in parallel (Wave 3.5), re-verify.
Max 3 loops.

**W4 per-shard self-score** (meta — verifiers are scored on defect-catch rate):
fit=shard stayed in its lane? form=report uses rubric vocabulary from
`rubrics.md`? truth=% defects flagged that a re-edit confirmed real? taste=zero
noise-flags? Emit `loop:feedback` per verifier shard with `tags:
[...task.tags, 'wave:4', 'shard:{consistency|xref|perf|rubric}']`. Verifiers
that consistently catch real defects accumulate pheromone and win
`select('wave:4')` in future cycles. **The verifier learns to be useful.**

**Self-checkoff:** On clean verify → `markTaskDone('client-ui:cycle-1')` →
tick box below → `mark('loop→client-ui:cycle-1', 5)` → unblock Cycle 2 →
**emit cycle feedback signal** (see Feedback Signal Contract at end of doc).

### Cycle 1 Gate

```bash
bun run verify                                           # all green
bun run build && bun run scripts/lighthouse.ts /app/demo # TTI < 200ms, Lighthouse ≥ 90
bun run scripts/test-ws-integration.ts                   # WS live
```

```
  [ ] 3-pane shell renders on /app/:groupId
  [ ] All six tabs project from TypeDB (no mock data)
  [ ] Chat streams via WsHub, signal RT < 300ms
  [ ] PathsGraph renders 100 paths < 16ms
  [ ] Lighthouse ≥ 90, bundle < 100kb gz per route
```

---

## Cycle 2: PROVE — BYO keys, groups, invites, claws

**Bundles source cycles 5–7 (BYO Keys, Groups+Invites+Connections, Claws
from UI) plus cycle 8 partial (brand foundation).**

**Depends on:** Cycle 1 complete. Shell + tabs must exist before users can
configure keys, invite members, or launch claws from within a group view.

**Files:** `src/pages/settings/keys.astro`, `src/lib/crypto/key-wrap.ts`,
`src/pages/app/[groupId]/settings.astro`, `src/pages/api/invites/*`,
`src/components/app/AddClawWizard.tsx`, `src/pages/api/claw.ts` (wrap
existing), migration for user DEK + ciphertext keys.

### Cycle 2 Deliverables

| # | Deliverable | Goal | Rubric (fit/form/truth/taste) | Exit | Skill |
|---|-------------|------|-------------------------------|------|-------|
| 1 | BYO keys settings page | AES-GCM DEK per user, zero plaintext at rest | 0.25/0.15/**0.50**/0.10 | `bun run scripts/grep-for-plaintext-keys.ts` → 0 hits | `client-ui:keys` |
| 2 | Group + invite flow | Create group → stateless HMAC invite → accept → membership persists | **0.35**/0.20/0.35/0.10 | `curl POST /api/invites/create` + `/accept` → membership in TypeDB | `client-ui:invites` |
| 3 | AddClawWizard | New user deploys working Telegram claw in < 5 min | **0.40**/0.20/0.30/0.10 | manual smoke: fresh user → /webhook/telegram replies | `client-ui:claw-wizard` |
| 4 | Skill price UI | Set price + pricing mode + visibility on a capability (marketplace prereq) | **0.40**/0.15/0.35/0.10 | `PATCH /api/skills/:sid/price` updates `capability.price` | `client-ui:skill-price` |
| 5 | Public landing `/` | Hero + two-audience + trust bar + dual CTA, 100/100/100/100 Lighthouse | 0.30/0.20/0.30/**0.20** | `scripts/lighthouse.ts /` = 100/100/100/100; first-paint JS = 0KB except `client:visible` trust bar | `client-ui:landing` |
| 6 | Dual-CTA onboarding | `?intent=human` → template picker; `?intent=agent-owner` → editor + wallet | 0.35/0.20/0.30/0.15 | both routes land on intent-correct view in one click | `client-ui:signup` |

### Wave 1 — Recon (Haiku ≥ 6)

| Agent | Target |
|-------|--------|
| R1 | `src/lib/auth.ts` (BetterAuth + TypeDB adapter) |
| R2 | `migrations/*.sql` — find a slot for secrets table |
| R3 | `src/engine/agent-md.ts` + `scripts/setup-nanoclaw.ts` — claw deploy path |
| R4 | `nanoclaw/src/personas.ts` + wrangler configs — persona routing |
| R5 | CF docs on Secrets Store availability (web) |
| R6 | `docs/landing-page.md` + current `src/pages/index.astro` — landing structure, trust-bar wiring, dual CTA (client-ui.md §27) |

### Wave 2 — Decide (Opus)

1. AES-GCM per-user DEK wrapping (KEK from user password via Argon2) vs. CF
   Secrets Store (chosen: DEK in D1 ciphertext, KEK derived from session JWT
   signed over Better Auth cookie — no password replay for key access).
2. Invite token: stateless HMAC with `{gid, role, exp}` (chosen).
3. Claws: shared worker persona-routed by default; new worker only if user
   wants their own Telegram token (chosen per §13 Cycle 7).

### Wave 3 — Edits (Sonnet, M = files touched)

| Job | File |
|-----|------|
| E1 | `migrations/0008_user_secrets.sql` (new) |
| E2 | `src/lib/crypto/key-wrap.ts` (new) |
| E3 | `src/pages/settings/keys.astro` (new) |
| E4 | `src/pages/api/settings/keys.ts` (new) |
| E5 | `src/pages/api/invites/create.ts` (new) |
| E6 | `src/pages/api/invites/accept.ts` (new) |
| E7 | `src/components/app/AddClawWizard.tsx` (new) |
| E8 | `src/pages/api/claw.ts` (edit — wrap existing setup script) |
| E9 | `nanoclaw/src/workers/router.ts` (edit — resolve user-provided keys) |
| E10 | `src/components/app/SkillInspector.tsx` (new — price field, pricing-mode dropdown, visibility toggle) — marketplace step 2 (see client-ui.md §25.5, §25.8) |
| E11 | `src/pages/api/skills/[sid]/price.ts` (new — update capability.price) |
| E12 | `src/pages/index.astro` (edit/replace — public landing per client-ui.md §27, sourced from `landing-page.md`) |
| E13 | `src/components/landing/TrustBar.tsx` (new — `client:visible` island reading `/api/export/highways.json` + `/api/stats/live`) |
| E14 | `src/pages/api/stats/live.ts` (new — ~20 lines aggregating highway count, active worlds, signals-last-hour) |
| E15 | `src/pages/signup.astro` (new — intent-aware routing: `?intent=human` → template picker, `?intent=agent-owner` → agent editor + wallet setup) |
| ... | tests, settings page for group |

### Wave 4 — Verify (Sonnet ≥ 5)

| Shard | Owns |
|-------|------|
| V1 | Security (no plaintext keys in logs, DB, TypeDB attrs) |
| V2 | Flow (signup → create group → add agent → deploy claw → Telegram reply in < 5 min) |
| V3 | Landing (`/` Lighthouse 100/100/100/100 target; 0KB JS on first paint except `client:visible` trust bar; dual-CTA routes to intent-correct onboarding) |
| V4 | Consistency (naming, error paths, zero-return rule) |
| V5 | Rubric scoring |

### Cycle 2 Gate

```bash
bun run verify
bun run scripts/grep-for-plaintext-keys.ts    # must find zero hits
# manual: end-to-end claw deploy smoke
```

```
  [ ] /settings/keys: add key, rotate key, key never in plaintext at rest
  [ ] Create group → invite → accept → membership persists in TypeDB
  [ ] Nested groups ≥ 5 deep, cross-group paths roundtrip
  [ ] "Add claw" wizard: end-to-end in < 5 min for a new user
  [ ] L4 (economic) signal fires: capability price on claw deploy
  [ ] Skill inspector: set price + pricing mode + visibility (marketplace prerequisite)
  [ ] Public landing at `/` ships: hero + two-audience + trust bar + dual CTA
  [ ] Landing Lighthouse: 100/100/100/100 (0KB JS on first paint except trust bar)
  [ ] Dual CTA routes: `?intent=human` → §23 template picker; `?intent=agent-owner` → agent editor + wallet setup
```

---

## Cycle 3: GROW — Brand, per-group API, agency, universal chat, /buy, /sell, /dashboard

**Bundles source cycles 8–12 + marketplace + KPI rollup** (Brand + Visitor View,
Per-Group API + MCP, Agency Template + Dashboard, ChatShell Refactor,
Universal Chat, **Skill Marketplace projected as `/buy` + `/sell`** per
`docs/marketplace.md` and `client-ui.md` §25, **KPI Dashboard** as `/dashboard`
rolling up dims 5+6).

**Navigation is the ontology.** `/buy` and `/sell` are not a parallel
marketplace — they are dim-4 projections (`capability` relation, filtered by
direction). `/dashboard` is not a separate surface — it is dim-5 + dim-6
rolled up into KPI cards. Every route resolves to a TypeDB query over
`one.tql`; no hidden data store.

**Depends on:** Cycle 2 complete. Can't white-label without auth + groups;
can't expose per-group API without keys; can't ship universal embed without
the ChatShell refactor; can't list skills on `/market` without the price
UI shipped in Cycle 2.

**Files:** `src/engine/brand.ts` (edit), `src/pages/:groupId/*` (visitor view),
`src/pages/api/g/[gid]/*` (new namespace), `src/components/ai/chat-v3/*`
(refactor per `chat-ui-upgrade.md`), `public/chat.js` (embed SDK),
`src/components/chat/ChatShell.tsx` + 4 frames, `src/pages/market/*`
(marketplace listing + bounty flow), `src/engine/human.ts` (extend for
human-receiver bounty delivery).

### Cycle 3 Deliverables

| # | Deliverable | Goal | Rubric (fit/form/truth/taste) | Exit | Skill |
|---|-------------|------|-------------------------------|------|-------|
| 1 | Brand cascade | Visitor view on `/:gid` paints from nearest `thing(thing-type="brand")` up the hierarchy | 0.30/**0.30**/0.25/0.15 | two nested groups resolve different brands; fallback to parent works | `client-ui:brand` |
| 2 | Per-group API `/api/g/:gid/*` | Every group exposes signal + export + MCP under its own namespace | **0.35**/0.20/0.35/0.10 | `curl /api/g/demo/signal` with bearer → mark() observed in TypeDB | `client-ui:group-api` |
| 3 | Agency dashboard (two clients) | Sub-groups isolated, zero data leakage between clients | **0.40**/0.15/**0.35**/0.10 | cross-client query from client-A context returns 0 rows for client-B | `client-ui:agency` |
| 4 | ChatShell refactor | `ChatClientV2` → `<ChatShell>` < 300 lines, 4 frames reuse one component | 0.25/**0.30**/0.30/0.15 | `wc -l src/components/chat/ChatShell.tsx` < 300; FCP < 200ms; TTI < 500ms | `client-ui:chat-shell` |
| 5 | Universal chat embed (`chat.js`) | Shadow-DOM widget on non-ONE domain round-trips signal → reply | 0.30/0.20/**0.35**/0.15 | `scripts/test-embed-on-external-domain.ts` passes; `bundle-size.ts` < 30KB gz | `client-ui:embed` |
| 6 | `/buy` — inbound path offers | Projection of `capability` relation where `current-actor` is buyer-side; 4 discovery lenses (Highways / Frontier / Toxic / Tags) | **0.40**/0.15/0.30/0.15 | `lighthouse.ts /buy` TTI < 200ms; filters query `capability` + joins provider stats; no separate market store | `client-ui:buy` |
| 7 | `/sell` — outbound path offers | Author + publish my `capability`s (price, rubric thresholds, visibility); edits flow into same TypeDB capability rows as §25 | **0.40**/0.15/0.30/0.15 | `POST /api/capabilities` lands in TypeDB; listing appears on `/buy` for other actors within 1 signal tick | `client-ui:sell` |
| 8 | `/dashboard` — KPI rollup | Projection of dim 5 (signals) + dim 6 (hypotheses) into closed-loop rate, median settlement, take-rate, highways count, frontier coverage, toxic-path trend | 0.30/**0.30**/**0.30**/0.10 | 7 KPI cards render from `/api/export/*` only; all numbers tie back to deterministic signals (no vibes); refresh < 500ms p50 | `client-ui:dashboard` |
| 9 | Bounty flow (escrow on Sui) | Post on `/buy` → route → deliver → rubric → Sui release (or refund on warn) | **0.35**/0.15/**0.40**/0.10 | `scripts/test-bounty-e2e.ts` green; Sui tx hash returned on post | `client-ui:bounty` |
| 10 | Human-receiver bounty ack | Telegram/Discord accept signal closes the loop, delivery triggers rubric scorer | 0.30/0.20/**0.40**/0.10 | integration test: bounty → Telegram ack → delivery → rubric → mark() | `client-ui:human-bounty` |
| 11 | Anti-goals enforced | No 5-star rating component, no platform-token balance UI, Export-markdown on every listing | 0.25/0.20/0.30/**0.25** | `grep -r "rating\|stars\|balance" src/components/buy src/components/sell` = 0 non-test hits; every row has export button | `client-ui:anti-goals` |

### Wave 1 — Recon (Haiku ≥ 8)

| Agent | Target |
|-------|--------|
| R1 | `src/engine/brand.ts` + any existing CSS-var injection |
| R2 | `src/pages/api/export/*` — patterns to mirror for `/api/g/:gid/*` |
| R3 | `agents/donal/` — the agency template source |
| R4 | `docs/chat-ui-upgrade.md` — the refactor plan (ChatClientV2, 2776 lines) |
| R5 | `docs/chat-universal.md` — the 4-frame contract |
| R6 | `gateway/` — origin allowlist, SSE proxy for embeds |
| R7 | `docs/marketplace.md` + `client-ui.md §25` — 9 SKU classes, 5 pricing modes, 4 discovery lenses, bounty flow |
| R8 | `src/move/one/sources/one.move` + `src/engine/bridge.ts` + `src/engine/human.ts` — existing escrow + Sui release + human-receiver patterns the marketplace reuses |

### Wave 2 — Decide (Opus ≥ 2 shards)

**Shard A — brand + API + agency:**
1. Brand as `thing(thing-type="brand")` vs. attrs on group (chosen per §14: thing).
2. API namespace: `/api/g/:gid/*` (chosen per §16 Cycle 9).
3. Agency client isolation: sub-groups + `hierarchy` checks at middleware.

**Shard B — ChatShell refactor + universal:**
1. Target file layout `chat-v3/` + `hooks/ai/` + `lib/chat/`.
2. State: `useReducer` (ChatClientV2 has 24 useStates — collapse).
3. Four frames (`FullPageFrame`, `SplitPaneFrame`, `WidgetFrame`, `InlineFrame`)
   share one `<ChatShell>`, differ only in layout + frame chrome.
4. `target="person:*"` vs. `target="group:*"` routing via `src/engine/human.ts`.
5. `chat.js` SDK: shadow DOM, gzipped < 30KB.

**Shard C — marketplace (new; see `client-ui.md` §25):**
1. Route shape: `/market` (world scope) vs. `/g/:gid/market` (per-group scope) — chosen: both, `/market` for world, `/g/:gid/market` auto-filtered to providers with `membership` in `:gid`.
2. Discovery: four tabs (Highways, Frontier, Toxic owner-only, Tags) back onto existing `/api/export/*` and `persist.frontier/blocked` — no new storage.
3. Bounty flow: reuse `src/move/one/sources/one.move` escrow primitive; `POST /market/bounty` creates the signal + Sui lock in one call.
4. Human-receiver: extend `src/engine/human.ts` to accept a bounty acknowledgement signal (`{bountyId, accept: true}`) from Telegram/Discord; delivery is a standard signal reply.
5. Rubric picker: reuse `rubrics.md` dimensions (fit / form / truth / taste); UI shows four sliders defaulting to 0.7.
6. Anti-goals enforced in code: no 5-star rating component; `↑strength ↓resistance` only. No platform-token balance field anywhere. "Export as markdown" button on every listing row.

**Reconcile:** main context merges all three shards — universal chat reuses
per-group API for read endpoints, agency dashboard reuses ChatShell for
per-client chat, marketplace reuses the same per-group API plus `/market`
as a world-scope superview.

### Wave 3 — Edits (parallel Sonnet, M = files touched, ~25)

One file per agent. Spawn all in one message.

Representative jobs:

| Job | File |
|-----|------|
| E1 | `src/engine/brand.ts` (edit — visitor fallback cascade) |
| E2 | `src/pages/[groupId]/index.astro` (new — public visitor route) |
| E3 | `src/pages/api/g/[gid]/signal.ts` (new) |
| E4 | `src/pages/api/g/[gid]/mcp.ts` (new — MCP manifest) |
| E5 | `src/pages/api/agency/create.ts` (new — port `agents/donal/`) |
| E6 | `src/components/agency/Dashboard.tsx` (new) |
| E7-E15 | `chat-v3/` refactor: split `ChatClientV2` → `ChatShell` (<300 lines), extract SSE parser, data loader, hooks |
| E16 | `src/components/chat/FullPageFrame.tsx` (new) |
| E17 | `src/components/chat/SplitPaneFrame.tsx` (new) |
| E18 | `src/components/chat/WidgetFrame.tsx` (new) |
| E19 | `src/components/chat/InlineFrame.tsx` (new) |
| E20 | `public/chat.js` (new — SDK loader, shadow DOM) |
| E21 | `gateway/src/index.ts` (edit — widen origin allowlist for embeds) |
| E22 | `src/pages/buy/index.astro` (new — inbound capability listings, 4 discovery lenses; replaces `/market`) |
| E23 | `src/pages/buy/[sid].astro` (new — capability detail + Hire / Post bounty buttons) |
| E24 | `src/pages/sell/index.astro` (new — my published `capability`s: add / edit / set price / rubric threshold / visibility) |
| E25 | `src/pages/sell/new.astro` (new — publish flow: pick skill → set price → set rubric gates → submit) |
| E26 | `src/pages/dashboard/index.astro` (new — KPI rollup of dims 5+6: closed-loop rate, median settlement, take-rate, highways, frontier coverage, toxic-path trend, revenue/hour) |
| E27 | `src/components/paths/PathOfferRow.tsx` (new — shared by `/buy` and `/sell`: kind-pill, SKU-class chip, ↑↓ marks, price, Export-markdown) |
| E28 | `src/components/buy/BountyComposer.tsx` (new — price + rubric sliders + deadline + tags) |
| E29 | `src/components/buy/BountyCard.tsx` (new — live status chip: posted → accepted → delivered → scoring → paid/refunded) |
| E30 | `src/components/dashboard/KpiCard.tsx` (new — one metric, one sparkline, one delta vs. last cycle; 7 instances render the dashboard) |
| E31 | `src/pages/api/capabilities/list.ts` (new — query by direction: `?as=buyer` → offers I can hire, `?as=seller` → offers I publish) |
| E32 | `src/pages/api/capabilities/publish.ts` (new — `/sell` writes `capability` + `skill` in one call) |
| E33 | `src/pages/api/dashboard/kpis.ts` (new — aggregates `/api/export/*` into 7 KPI shapes; cached 30s) |
| E34 | `src/pages/api/buy/hire.ts` (new — opens chat + creates `membership(role="guest")` scoped to one signal) |
| E35 | `src/pages/api/buy/bounty.ts` (new — escrowed signal via `one.move`; return bounty id + Sui tx hash) |
| E36 | `src/engine/human.ts` (edit — accept `{bountyId, accept}` signal from Telegram/Discord; wire delivery back to rubric scorer) |
| E37 | `src/move/one/sources/one.move` (edit — verify rubric-gated release path exists; extend if needed) |

### Wave 4 — Verify (parallel Sonnet ≥ 6)

| Shard | Owns |
|-------|------|
| V1 | Consistency + naming across new routes/components |
| V2 | Cross-refs (`chat.js` → Gateway → DO → UI path unbroken) |
| V3 | Performance budgets (ChatClientV2 → ChatShell < 300 lines; FCP < 200ms; TTI < 500ms; embed gz < 30KB; widget FCP < 200ms; visitor RT < 500ms; `/claim` < 10s; `/buy` + `/sell` TTI < 200ms; `/dashboard` TTI < 300ms; bounty post → Sui lock < 2s) |
| V4 | Isolation (two-client agency: zero data leaks between clients; `/buy` world-scope query never reads tenant pheromone; `/sell` writes scoped to current actor) |
| V5 | Ontology-as-navigation (every route resolves to a one.tql query; no separate market store; `/dashboard` KPIs trace to deterministic signals in dim 5/6) |
| V6 | Marketplace end-to-end (post bounty on `/buy` → route to human via Telegram → deliverable → rubric score → `mark()` → Sui release; also `warn()` → refund; anti-goals hold: no 5-star UI, no platform-token balance, Export-markdown works) |
| V7 | Rubric scoring (fit/form/truth/taste per `rubrics.md`) |

### Cycle 3 Gate

```bash
bun run verify
bun run build
bun run scripts/bundle-size.ts public/chat.js          # < 30KB gz
bun run scripts/test-embed-on-external-domain.ts       # RT signal + reply
bun run scripts/lighthouse.ts /:demo-group             # visitor view perf
bun run scripts/lighthouse.ts /buy                     # /buy TTI < 200ms
bun run scripts/lighthouse.ts /sell                    # /sell TTI < 200ms
bun run scripts/lighthouse.ts /dashboard               # KPI dashboard TTI < 300ms
bun run scripts/test-bounty-e2e.ts                     # bounty → human → mark → Sui release
```

```
  [ ] Visitor can chat on /:groupId, brand cascades from group → parent
  [ ] External MCP client hits /api/g/:gid/* with bearer, gets mark()
  [ ] Agency template spawns two clients, zero data leakage
  [ ] ChatClientV2 < 300 lines, FCP < 200ms, TTI < 500ms
  [ ] Every chat turn emits chat:outcome signal with {outcome, ms, tokens, model}
  [ ] chat.js embed on non-ONE domain signals + reply roundtrip works
  [ ] /buy lists inbound `capability` offers (world + current group) with 4 discovery lenses
  [ ] /sell publishes a new `capability` and it appears on another actor's /buy within one signal tick
  [ ] /dashboard renders 7 KPI cards from /api/export/* only; every number ties to a deterministic signal
  [ ] Ontology-as-navigation holds: every route is a query over one.tql (no hidden data store)
  [ ] Bounty end-to-end: post → route → deliver → rubric → Sui release (or refund on warn)
  [ ] Human receiver accepts bounty via Telegram, delivery closes the loop
  [ ] Anti-goals hold: no 5-star component anywhere, no platform-token balance UI, Export-markdown works on every row
```

---

## Cost Discipline

| Cycle | Wave | Agents | Model | Est. cost share |
|-------|------|--------|-------|-----------------|
| 1 | W1 | 6 Haiku | Haiku | ~5% |
| 1 | W2 | 1 Opus | Opus | ~20% |
| 1 | W3 | ~20 Sonnet | Sonnet | ~25% |
| 1 | W4 | 4 Sonnet | Sonnet | ~10% |
| 2 | W1 | 6 Haiku | Haiku | ~4% |
| 2 | W2 | 1 Opus | Opus | ~11% |
| 2 | W3 | ~18 Sonnet | Sonnet | ~15% |
| 2 | W4 | 5 Sonnet | Sonnet | ~6% |
| 3 | W1 | 8 Haiku | Haiku | ~5% |
| 3 | W2 | 3 Opus shards | Opus | ~22% (biggest decide — brand/API/agency + chat + /buy+/sell+/dashboard) |
| 3 | W3 | ~37 Sonnet | Sonnet | ~26% |
| 3 | W4 | 7 Sonnet | Sonnet | ~11% |

**Hard stop:** if any Wave 4 loops more than 3 times, halt and escalate.
**Parallelism is cheap, serial is expensive** — per-token billing means 25
Sonnet in parallel costs the same as one Sonnet sequential, at 1/25 wall-time.

---

## Feedback Signal Contract

Every wave and every cycle close MUST emit one `loop:feedback` signal. This
is the return-path pheromone — without it, paths never strengthen and future
`select()` calls have no memory of what worked on UI work.

```typescript
// POST /api/signal — the ant lays pheromone on the way home
{
  receiver: 'loop:feedback',
  data: {
    tags: [...task.tags, 'ui', `cycle:${cycle}`, `wave:${N}`],
    strength: rubricAvg,        // avg of fit/form/truth/taste (0–1)
    content: {
      task_id: 'client-ui:cycle-N',
      cycle,
      wave: N,
      rubric: { fit, form, truth, taste },
      path: `${from}→${to}`,
      outcome: 'result'         // result | timeout | dissolved | failure
    }
  }
}
```

The `loop:feedback` unit (registered in `boot.ts`) deposits `mark(tag_edge, strength)`
for each tag in `task.tags`. Future `select()` with matching tags follows this trail.
Feedback signals are `scope: private` — never surface in group queries or `know()`
unless L6 explicitly promotes them.

| Outcome | Strength | Effect on tag paths |
|---------|---------:|---------------------|
| `result` + rubric ≥ 0.65 | `rubricAvg × 5` | `mark()` on each tag — trail strengthens |
| `result` + rubric 0.50–0.64 | `rubricAvg × 2` | mild `mark()` — fan out to specialist for next wave |
| `result` + rubric < 0.50 | — | `warn(1)` on each tag — chain breaks, L5 evolution eligible |
| `timeout` | — | neutral — not the agent's fault |
| `dissolved` | — | `warn(0.5)` — path doesn't exist yet |
| `failure` | — | `warn(1)` — chain breaks |

**Always emit. Even on timeout. Even on dissolved. Every loop closes.**

---

## Status

- [x] **Cycle 1: WIRE** — shell + 6 tabs + chat live
  - [x] W1 — Recon (Haiku × 6, parallel)
  - [x] W2 — Decide (Opus × 1)
  - [x] W3 — Edits (Sonnet × ~20, parallel)
  - [x] W4 — Verify (Sonnet × 4, parallel by check type)
- [x] **Cycle 2: PROVE** — BYO keys + groups + invites + claws + skill price UI + public landing
  - [x] W1 — Recon (Haiku × 6, parallel)
  - [x] W2 — Decide (Opus × 1) — W1 found prior cycles shipped E1–E15; W2 collapsed to verify-only
  - [x] W3 — Edits (Sonnet × 1, grep-for-plaintext-keys.ts script)
  - [x] W4 — Verify (Sonnet × 4, parallel by check type) — rubric fit=0.79 form=0.83 truth=0.83 taste=0.79, all ≥ 0.65
- [x] **Cycle 3: GROW** — brand + per-group API + agency + universal chat + /buy + /sell + /dashboard
  - [x] W1 — Recon (Haiku × 8, parallel) — found Cycle 3 ~65% pre-built (brand, /api/g, /buy, dashboard, ChatShell existed)
  - [x] W2 — Decide (Opus × 3 shards, main context) — narrowed edits to 12 new + 2 edits (gap set)
  - [x] W3 — Edits (Sonnet × 12, parallel) + W3.5 fix-loop (Sonnet × 3, schema+contract alignment)
  - [x] W4 — Verify (Sonnet × 4, parallel by check type) — rubric fit=0.83 form=0.87 truth=0.86 taste=0.81, all ≥ 0.65

---

## Execution

```bash
/do TODO-client-ui.md        # run next wave
/do TODO-client-ui.md --auto # drive W1→W4 until cycle done
/see highways                # proven paths after each cycle
/see tasks --tag ui          # open UI tasks
```

### How `/do` Orchestrates

```
/do TODO-client-ui.md
  │
  ├── reads TODO, finds current cycle + wave
  │
  ├── Wave 1? → spawn N ≥ 4 Haiku in ONE message (one per target)
  │
  ├── Wave 2? → if findings > 20: spawn ≥ 2 Opus shards
  │             else: synthesize in main context
  │
  ├── Wave 3? → spawn M Sonnet (M = files touched) in ONE message
  │             one agent per file — never batch, never split
  │
  └── Wave 4? → spawn K ≥ 2 Sonnet verifiers in ONE message
                 (consistency / cross-ref / performance / rubric)
```

---

## Reuse

This TODO is specific to the UI build but follows the template shape exactly.
The `Cycle N → 4 source cycles` bundling pattern is reusable for any large
roadmap where the source design doc already has its own cycle numbering.

---

## See Also

- [client-ui.md](client-ui.md) — 29-section design spec (source of truth; §25 = marketplace UI projection)
- [marketplace.md](marketplace.md) — strategy source for Cycle 3 marketplace shard (9 SKU classes, 5 pricing modes, 4 discovery lenses, revenue model)
- [landing-page.md](landing-page.md) — copy and structure for Cycle 2 public landing at `/` (hero, two-audience table, trust bar, dual CTA)
- [DSL.md](one/DSL.md) — signal grammar (loaded in every W2)
- [dictionary.md](dictionary.md) — canonical names (loaded in every W2)
- [naming.md](naming.md) — 6 dimensions permanently named
- [rubrics.md](rubrics.md) — fit/form/truth/taste scoring
- [chat-ui-upgrade.md](chat-ui-upgrade.md) — prerequisite for Cycle 3 (ChatShell refactor)
- [chat-universal.md](chat-universal.md) — foundation for Cycle 3 (4 frames, one shell)
- [chat-memory.md](chat-memory.md) — what chat surfaces read from
- [memory.md](memory.md) — reveal/forget/frontier API used in Learning tab
- [CHAT_ARCHITECTURE.md](CHAT_ARCHITECTURE.md) — shipped (pre-refactor) architecture
- [world-map-page.md](world-map-page.md) — earlier sketch, PathsGraph reuse
- [AUTONOMOUS_ORG.md](AUTONOMOUS_ORG.md) — the executable task graph this UI surfaces
- [TODO-template.md](one/TODO-template.md) — template this TODO instantiates
- [TODO-task-management.md](TODO-task-management.md) — self-learning task system
- `src/schema/one.tql` — ontology this UI projects
- `src/lib/auth.ts` — Better Auth + TypeDB adapter (Cycle 2)
- `src/engine/brand.ts` — server-side brand injection (Cycle 3)
- `src/engine/human.ts` — humans as substrate units (Cycle 3, `target="person:*"`)
- `src/lib/use-task-websocket.ts` — WS reconnection pattern (Cycle 1)
- `gateway/` — origin allowlist, WsHub DO, SSE proxy for embeds (Cycle 3)
- `nanoclaw/` — edge agent pattern reused for claws (Cycle 2)

---

*3 cycles. Four waves each. Haiku reads, Opus decides, Sonnet writes,
Sonnet checks. Same loop as the substrate, different receivers.*
