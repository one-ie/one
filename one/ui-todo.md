---
title: UI — 7 surfaces, 11 moves, 4 primitives, parallel build
type: roadmap
version: 1.0.0
priority: W1+W2+W4 parallel · W3 after W2 · W5+W6 last
total_tasks: 49
completed: 0
status: OPEN
mode: mixed
lifecycle: construction
spec: one/ui.md
plan: one/ui-backend.md
---

# TODO: UI — `ui.md` × `ui-backend.md`

> **Time units:** tasks → waves → cycles. No calendar time.
>
> **Goal:** Ship the 7 surfaces (`/chat`, `/agents`, `/skills`, `/tools`,
> `/payments`, `/design`, `/settings`) with 11 elegance moves and the
> M11 chat protocol. Spec is [`ui.md`](ui.md). Plan is [`ui-backend.md`](ui-backend.md).
>
> **Spawn shape:** 6 waves. Each task names a tier (`haiku`/`sonnet`/`opus`)
> and a fan-out group. `/do` reads the tier and spawns the matching subagent
> in parallel within each group.
>
> **Source of truth:** [DSL.md](DSL.md), [dictionary.md](dictionary.md),
> [rubrics.md](rubrics.md), [`.claude/rules/ui.md`](../.claude/rules/ui.md),
> [`.claude/rules/design.md`](../.claude/rules/design.md), [`.claude/rules/astro.md`](../.claude/rules/astro.md).

---

## Tier map (which model gets which kind of task)

```
haiku   recon, audits, file reads, schema introspection,
        small scaffolds, migration files, type wrappers
        — cheap, fast, parallelisable to N

sonnet  edits, component implementation, API route handlers,
        astro page shells, test wiring, click-test scripts
        — the default workhorse

opus    architectural decisions, protocol design, schema choices,
        adaptive starter algorithm, viewer-mask derivation,
        cross-wave reconciliation
        — load-bearing thinking
```

Within a wave, **same-tier tasks fan out in parallel** (one Agent call per task,
all sent in one message). Cross-tier order is recon → decide → edit → verify
inside each cycle, just like `/do`.

---

## Routing

```
   signal DOWN                                      result UP
   ──────────                                       ─────────
   /do ui-todo.md
       │
       ▼
   for each W in [W1, W2, W4]  (parallel start)
       │
       ▼ haiku recon ── parallel ──→ opus decide ── parallel ──→ sonnet edit
                                                                       │
   W3 unblocks when W2 lands ──┐                                       │
   W5/W6 unblock when W1+W3   ┘                                       │
                                                                       │
                                                                       ▼
                                                               sonnet verify
                                                                       │
                                                                       ▼
                                                          mark(plan→ui-todo, depth)
```

**Context accumulates down. Quality marks flow up. Width compounds when every
parallel branch deposits a mark.**

---

## Testing — The Deterministic Sandwich

| PRE (W0)                                              | POST (W4)                                                |
|-------------------------------------------------------|----------------------------------------------------------|
| `bun run verify` baseline green                       | `bun run verify` green; no regressions                   |
| Lighthouse 100% on `/chat` (project memory)           | Lighthouse 100% on `/chat` preserved                     |
| Count routes loading in `web/src/pages`               | All 7 surface routes load <300ms TTFB                    |
| Count drawer/card component files (=0)                | 13 cards + 1 drawer + EmptyCard render in `/design`      |
| `emitClick` call count in chat-v3 (existing)          | Every action button on every new card calls `emitClick`  |
| D1 migrations applied count                           | New migration applies clean to fresh DB                  |
| `STARTER_PROMPTS` hardcoded count                     | Replaced by `computeStarters(ctx)` lookup                |

**Deterministic numbers every cycle must report:**
- Components shipped: `N/13` cards + drawer + EmptyCard
- Routes shipped: `N/7` surfaces
- API routes shipped: `N/~20`
- D1 tables added: `N/5`
- Lighthouse on `/chat`: `100`
- Click-test: worked example (`ui.md` §Worked example) passes end-to-end
- `emitClick` coverage: `actions_emitting / actions_rendered` per surface

---

## Source of Truth

**[ui.md](ui.md)** — surfaces, moves, primitives, friction map.
**[ui-backend.md](ui-backend.md)** — wave plan, schema, reuse tally.
**[`.claude/rules/ui.md`](../.claude/rules/ui.md)** — every onClick → `emitClick('ui:<surface>:<action>')`.
**[`.claude/rules/design.md`](../.claude/rules/design.md)** — 6 tokens, 3 depths; build kills wrong colors.
**[`.claude/rules/astro.md`](../.claude/rules/astro.md)** — islands, lazy imports, dark contrast.

| Item                  | Canonical                                                | Exception |
|-----------------------|----------------------------------------------------------|-----------|
| Click receiver        | `ui:<surface>:<action>`                                  | —         |
| Card emit             | `emitClick('ui:card:<type>:<action>')`                   | —         |
| Drawer route          | `?drawer=<id>` query param, never new path               | —         |
| Frontmatter edits     | chat-driven, M5; never settings forms per agent          | —         |
| Detail views          | drawer over grid, M3; never new route                    | —         |
| Marketplace           | `available` zone of surface, M6; never `/marketplace`    | —         |

---

## Wave dependency graph

```
W1 primitives (frontend)  ─┬─────────────────────────► W5 surfaces
                           │                                ▲
W2 schema (D1)  ──► W3 APIs (lenses) ───────────────────────┤
                                                            │
W4 routing (M10) ───────────────────────────────────────────┤
                                                            │
W1 + W3 ──────────────────────► W6 chat protocol (M11) ─────┘
```

**Parallelisable starts:** W1, W2, W4. **W3** unblocks when W2 lands.
**W5, W6** are the assembly waves.

---

## Cycle 0 — Resolve open questions (haiku, parallel × 5)

`ui-backend.md` §Open questions lists 5 file reads. Knock them out before W3.

| id  | model   | task                                                                                       | exit                                                  |
|-----|---------|--------------------------------------------------------------------------------------------|-------------------------------------------------------|
| Q1  | haiku   | Find skill registry storage (KV / D1 / TypeDB) — read `web/src/pages/api/skill/import.ts`  | One-line note appended to ui-backend.md               |
| Q2  | haiku   | Locate conversation storage schema — find D1 messages table or substrate path              | One-line note appended to ui-backend.md               |
| Q3  | haiku   | Locate x402 receive event source for `/api/agents/[id]/revenue`                            | One-line note appended to ui-backend.md               |
| Q4  | haiku   | Confirm Composio integration scope (none today; native Slack/Stripe/GitHub start?)         | One-line note appended to ui-backend.md               |
| Q5  | haiku   | Verify L5 evolution events emitted by runtime (`src/engine/loop.ts`)                       | One-line note appended to ui-backend.md               |

### Conditional follow-through (spawned only if the answer requires it)

| id   | model   | trigger                          | task                                                                            | exit                                |
|------|---------|----------------------------------|---------------------------------------------------------------------------------|-------------------------------------|
| Q4F  | sonnet  | Q4 = "native start"              | Stub `tool_connections` provider adapter for Slack/Stripe/GitHub only           | W3E3 unblocks                       |
| Q4F2 | opus    | Q4 = "Composio in scope"         | Decide Composio SDK integration shape; freeze adapter contract                  | W3E3 unblocks                       |
| Q5F  | sonnet  | Q5 = "events not emitted"        | Add L5 evolution event hook in `src/engine/loop.ts` per dictionary.md           | W6 generations tab unblocks         |

**Exit:** all 5 notes land. Spawn all 5 in one message. Conditional tasks queued
based on Q answers and unblocked at the next phase.

---

## W1 — Primitives (frontend foundation)

**Mode:** full. Wide variance per card. Many parallel tasks.

### W1.recon (haiku, parallel × 3)

| id    | model | task                                                                  | exit                         |
|-------|-------|-----------------------------------------------------------------------|------------------------------|
| W1R1  | haiku | Audit existing UI primitives in `web/src/components/ui/`              | List what exists vs needed   |
| W1R2  | haiku | Audit `ChatHost.tsx`, `MessageRenderer.tsx`, AI SDK v6 stream surface | Report current frame shape   |
| W1R3  | haiku | Read `.claude/rules/ui.md` + `design.md` + `astro.md`; report invariants for cards/drawer | Constraint list back to W1.decide |

### W1.decide (opus, sequential after W1.recon)

| id    | model | task                                                                                | exit                                |
|-------|-------|-------------------------------------------------------------------------------------|-------------------------------------|
| W1D1  | opus  | Decide Drawer API: props, deep-link via `?drawer=`, focus trap, ESC, keyboard tabs  | Drawer.tsx prop spec frozen         |
| W1D2  | opus  | Decide 13-card prop schema (one shape: `{ data, onAction, surface }` discriminated) | One union type emitted to `lib/cards.ts` |
| W1D3  | opus  | Decide viewer derivation rules (`viewer.ts`): no passkey → end_user; owner → developer; staff → creator | Pure function, no config |
| W1D4  | opus  | Decide surface-context payload shape `{url, selection, brand, viewer}` and signal emission contract | Hook spec for ChatDock |
| W1D5  | opus  | **Doc plan** per `.claude/rules/documentation.md` — list every doc touched per wave (`dictionary.md`: 13 card names, `Drawer`, `ChatDock`, `ChatFrame`, `computeStarters`, `trailing_chips`, viewer mask names; `lifecycle.md`: agent state machine `draft→live→paused→evolving`; `routing.md`: M10 host→context; new `web/src/components/CLAUDE.md` for card vocabulary) | Doc-edit table emitted; consumed by W2/W3/W5/W6 edit tasks |

### W1.edit (sonnet, parallel × 8)

| id    | model  | task                                                                       | exit                                              |
|-------|--------|----------------------------------------------------------------------------|---------------------------------------------------|
| W1E1  | sonnet | `web/src/components/ui/Drawer.tsx` per W1D1                                | Compiles; `?drawer=test` opens it                 |
| W1E2  | sonnet | `web/src/components/ui/EmptyCard.tsx` (M7 — chat-input-shaped empty)       | Renders with chat input slot                      |
| W1E3  | sonnet | `web/src/components/cards/AgentPreviewCard` + `DeployStatusCard` + `ResultCard` | Render in `/design` showcase strip            |
| W1E4  | sonnet | `web/src/components/cards/ChoiceChips` + `VerifyCard` + `PriceCard`        | Render in `/design` showcase strip                |
| W1E5  | sonnet | `web/src/components/cards/BrandPalette` + `SkillToggleRow` + `MarketplaceMini` | Render in `/design` showcase strip            |
| W1E6  | sonnet | `web/src/components/cards/TraceMini` + `CompareCard` + `OnboardingChecklist` + `EmptyStateCard` | Render in `/design` showcase strip |
| W1E7  | sonnet | `web/src/lib/viewer.ts` + `web/src/lib/surface-context.ts`                 | Unit tests pass for derivation table              |
| W1E8  | sonnet | `web/src/components/chat/ChatDock.tsx` (cmd-K, slide-up, surface ctx signal) | Toggles open on every surface; emits `ui:dock:*` |
| W1E9  | sonnet | `web/src/components/auth/PasskeyKeepThis.tsx` — M1 "Touch ID to keep this" card; fires when ephemeral wallet has equity (an agent or balance > 0); calls existing `/api/provision` | Renders in `/design` showcase; click triggers passkey ceremony |

### W1.verify (sonnet)

| id    | model  | task                                                                              | exit                                            |
|-------|--------|-----------------------------------------------------------------------------------|-------------------------------------------------|
| W1V1  | sonnet | Run `bun run verify`; render `/design` showcase; click-test cmd-K on /chat        | All compile; cmd-K toggles; Lighthouse `/chat`=100 |

**Exit gate:** 13 cards + Drawer + EmptyCard + ChatDock compile and render. Every card action calls `emitClick`. Lighthouse `/chat`=100 preserved.

---

## W2 — Schema (D1 migration)

**Mode:** lean. 5 tables, exit = migration applies + round-trip works.

### W2.edit (parallel × 2)

| id    | model  | task                                                                              | exit                                              |
|-------|--------|-----------------------------------------------------------------------------------|---------------------------------------------------|
| W2E1  | haiku  | Write `web/migrations/00NN_agents_skills_tools_themes.sql` (5 tables per ui-backend.md §Schema decisions) | `wrangler d1 migrations apply` succeeds |
| W2E2  | sonnet | `web/src/lib/db/{agents,themes,tools}.ts` — typed wrappers (`get`, `list`, `create`, `patchFrontmatter`) | Round-trip test passes                |

### W2.verify

| id    | model  | task                                                                              | exit                                            |
|-------|--------|-----------------------------------------------------------------------------------|-------------------------------------------------|
| W2V1  | sonnet | Round-trip: `createAgent` → `getAgent` → `patchAgentFrontmatter` → `getAgent`     | Returned frontmatter matches patch              |

**Exit gate:** migration applies clean. Round-trip works for agents + themes.

---

## W4 — Workspace routing (M10)

**Mode:** lean. Starts in parallel with W1/W2.

### W4.edit (sonnet)

| id    | model  | task                                                                                      | exit                                                  |
|-------|--------|-------------------------------------------------------------------------------------------|-------------------------------------------------------|
| W4E1  | sonnet | `web/src/middleware.ts` — host header → `(workspace, agent, viewer, brand)` on `Astro.locals` | `curl -H "Host: tony.one.ie" /refunds` returns chat HTML |
| W4E2  | sonnet | `chat.astro` consumes `Astro.locals.context`; theme tokens reflect workspace               | `<style>` block changes per host                      |
| W4E3  | sonnet | `web/src/pages/api/domains/[domain]/verify.ts` — CNAME + cert handshake                    | Verify endpoint returns ok for known CNAME            |

### W4.verify

| id    | model  | task                                                                                  | exit                                          |
|-------|--------|---------------------------------------------------------------------------------------|-----------------------------------------------|
| W4V1  | sonnet | curl-test 3 hosts: `one.ie`, `tony.one.ie/refunds`, custom CNAME → context correct    | Each route resolves to the right context      |

**Exit gate:** middleware sets context for all 3 host shapes. Theme follows workspace.

---

## W3 — API routes (the lenses)

**Unblocks when W2 lands.** Mode: mixed. Many thin routes; sequence with care.

### W3.recon (haiku, parallel × 2)

| id    | model | task                                                                            | exit                                       |
|-------|-------|---------------------------------------------------------------------------------|--------------------------------------------|
| W3R1  | haiku | Audit `/api/skill/import`, `/api/pay/*`, `/api/provision` — what shape do they return | Reuse table for W3 routes              |
| W3R2  | haiku | Read MCP substrate tools (`mcp/src/tools/substrate.ts`) — what's reusable from `web/` | Reuse table for trace/revenue tabs    |

### W3.edit (sonnet, parallel × 6, one group per surface)

| id    | model  | task                                                                                                              | exit                                            |
|-------|--------|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| W3E1  | sonnet | `web/src/pages/api/agents/{index,[id],[id]/deploy,[id]/trace,[id]/chats,[id]/revenue,[id]/generations}.ts`        | Route shapes match drawer prop types            |
| W3E2  | sonnet | `web/src/pages/api/skills/{index,[name],[name]/enable}.ts`                                                        | List + detail + enable flow works               |
| W3E3  | sonnet | `web/src/pages/api/tools/{index,[provider]/connect,[provider]/disconnect,[provider]/scopes}.ts`                   | Connect → list shows connected                  |
| W3E4  | sonnet | `web/src/pages/api/themes/{index,[id],[id]/fork,[id]/share}.ts`                                                   | Fork creates new row with `fork_of`             |
| W3E5  | sonnet | `web/src/pages/api/payments/{wallet,txs,accept-links/[slug]}.ts`                                                  | Wallet + txs + accept-link round-trip           |
| W3E6  | sonnet | `web/src/pages/api/notifications.ts` — substrate `mark`/`warn` filtered by salience                               | Returns top-N high-salience events              |
| W3E7  | sonnet | **Deploy gate + state machine** — `[id]/deploy.ts` runs 3-prompt eval *before* state flip; auto-transitions `draft→live`, `live→paused` (>10% error/100 chats), `live→evolving` (L5 fires); transitions emit substrate `mark`/`warn`; `chats` table column for error rollup | Eval failure blocks deploy with failing prompt as chat reply; transitions visible in agent drawer |

### W3.verify

| id    | model  | task                                                                                       | exit                                           |
|-------|--------|--------------------------------------------------------------------------------------------|------------------------------------------------|
| W3V1  | sonnet | Smoke-test: list → detail → patch → list reflects update for agents + themes               | All assertions pass                            |

**Exit gate:** each route returns a shape matching the corresponding card/drawer's TS prop type.

---

## W5 — Surface assembly

**Unblocks when W1 + W3 land.** Mode: full. 7 routes, each its own composition.

### W5.recon (haiku, parallel × 2)

| id    | model | task                                                                            | exit                                       |
|-------|-------|---------------------------------------------------------------------------------|--------------------------------------------|
| W5R1  | haiku | Audit `chat.astro`, `agents.astro`, `design.astro` — what to refresh vs replace | Refresh-vs-rebuild table                   |
| W5R2  | haiku | Read `Sidebar` audit — current state, viewer-mask hooks                         | Sidebar prop spec                          |

### W5.edit (sonnet, parallel × 7 per route + 1 sidebar + 1 mobile)

| id    | model  | task                                                                                              | exit                                            |
|-------|--------|---------------------------------------------------------------------------------------------------|-------------------------------------------------|
| W5E1  | sonnet | Refresh `chat.astro` — Sidebar + ChatDock + EmptyCard + viewer mask                               | Loads <300ms; Lighthouse=100                    |
| W5E2  | sonnet | Refresh `agents.astro` — Grid + EmptyCard + drawer trigger via `?drawer=<agent-id>`               | Loads <300ms; cards render                      |
| W5E2b | sonnet | `web/src/components/agents/AgentDrawer.tsx` — 6 tabs (definition · chats · trace · revenue · generations · connect); fetches W3E1 endpoints per tab | Drawer opens; all 6 tabs render real data       |
| W5E3  | sonnet | New `skills.astro` — agent picker + two-zone grid + skill drawer (4 tabs)                         | Toggle skill on agent works                     |
| W5E4  | sonnet | New `tools.astro` — connected/available zones + tool drawer (4 tabs)                              | OAuth flow stub round-trips                     |
| W5E5  | sonnet | New `payments.astro` — wallet card + revenue card + tx grid + 3 drawer types                      | Tx drawer shows substrate trace                 |
| W5E6  | sonnet | Refresh `design.astro` — live preview + theme drawer + community grid                             | "make it warm" via dock applies                 |
| W5E7  | sonnet | New `settings.astro` — left rail + 12 categories (forms + collection drawers)                     | Profile + Keys & devices reachable              |
| W5E8  | sonnet | `web/src/components/nav/Sidebar.tsx` — 220→56→hidden, viewer-aware                                | Width responds to viewport; hides on sm         |
| W5E9  | sonnet | `web/src/components/MobileHandoff.tsx` — sm + developer/creator non-`/chat` route                 | Toast renders with handoff URL                  |
| W5E10 | sonnet | **Dock badge + cmd-K search** — subscribe ChatDock to `/api/notifications`; render count badge; opening dock emits "⌬ N things happened" system reply with deep-links; cmd-K with text query routes through assistant ("opening refunds-bot drawer", highlight, summarize) | Badge updates on substrate mark/warn; cmd-K query opens correct drawer |

### W5.verify (sonnet, parallel × 7, one per surface)

| id     | model  | task                                                                                  | exit                                           |
|--------|--------|---------------------------------------------------------------------------------------|------------------------------------------------|
| W5V1-7 | sonnet | Click-test each surface: open drawer → switch tabs → close; primary action ≤2 clicks | Friction-map row passes per surface; LH≥95     |
| W5V8   | sonnet | **emitClick coverage gate** — grep every new surface: count action buttons vs `emitClick` calls; fail if any action button doesn't emit `ui:<surface>:<action>` first | `actions_emitting === actions_rendered` per surface |
| W5V9   | sonnet | **Cross-surface context verify (M3 + M4 killer demo)** — script: visit `/agents`, click refunds-bot card → drawer opens → open ChatDock → type "rename this to refund-buddy" → assert chat tool call patches `agents.refunds-bot.frontmatter.name` → drawer reflects new name | End-to-end pass; surface-context payload visible in network tab |

**Exit gate:** 7 surfaces ship. Each <300ms TTFB. Lighthouse ≥95 each. Friction map passes end-to-end. Every action button emits a signal. The "rename this" demo works from any surface.

---

## W6 — Chat protocol upgrade (M11)

**Unblocks when W1 + W3 land.** Mode: full. Load-bearing.

### W6.recon (haiku)

| id    | model | task                                                                          | exit                                       |
|-------|-------|-------------------------------------------------------------------------------|--------------------------------------------|
| W6R1  | haiku | Read `web/src/pages/api/chat.ts`, `STARTER_PROMPTS`, AI SDK v6 stream surface | Frame-injection points listed              |

### W6.decide (opus)

| id    | model | task                                                                                                                                  | exit                                            |
|-------|-------|---------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------|
| W6D1  | opus  | Card-frame stream protocol (NDJSON over SSE) — `{kind:'text'|'card'|'chips'}` schema, server validation, fallback rules               | Schema frozen in `lib/chat-frames.ts`           |
| W6D2  | opus  | Adaptive starter algorithm — lookup table → `world.select('ui:chat:starter:*')` filtered by `(surface, viewer, lifecycle)` once mark count ≥ N | Algorithm spec frozen in `lib/starters.ts` |
| W6D3  | opus  | Trailing-chip system rule — assistant declares `trailing_chips[]` per reply; schema-validated; fallback to surface-context defaults  | Prompt rule frozen                              |

### W6.edit (sonnet, parallel × 4)

| id    | model  | task                                                                                          | exit                                            |
|-------|--------|-----------------------------------------------------------------------------------------------|-------------------------------------------------|
| W6E1  | sonnet | Extend `web/src/pages/api/chat.ts` to emit typed frames per W6D1                              | Smoke: frames stream in order                   |
| W6E2  | sonnet | `web/src/lib/starters.ts` — `computeStarters(ctx)` per W6D2; replace `STARTER_PROMPTS`        | Onset chips change per `(surface, viewer)`      |
| W6E3  | sonnet | `web/src/components/chat/MessageRenderer.tsx` — switch on `frame.kind`; render W1 cards       | Card actions emit `ui:card:<type>:<action>`     |
| W6E4  | sonnet | Tool result auto-render rules (e.g. `agents.create` → `AgentPreviewCard`)                     | Worked example flow lands all 4 cards           |
| W6E5  | sonnet | **M5 chat-edit-frontmatter loop** — register `agents.patchFrontmatter`, `themes.patch`, `accept-link.patch`, `pay.create` as assistant tools; tool call → W3 PATCH endpoint → optimistic UI update → server reconciles → drawer/card rerender; "raise price to $1" / "make it warm" / "make it $10 monthly" all complete in chat | Three flows pass: agent rename, theme retint, accept-link price change |

### W6.verify

| id    | model  | task                                                                                                              | exit                                                |
|-------|--------|-------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| W6V1  | sonnet | Streamed reply for "build me a refund bot" produces text → AgentPreviewCard → trailing chips                      | All 3 frames observed in NDJSON stream              |
| W6V2  | sonnet | All 13 card types reachable via at least one prompt path                                                          | Coverage script passes                              |
| W6V3  | sonnet | grep-gate: `emitClick` calls per surface ≥ rendered actions                                                       | gate green                                          |
| W6V4  | sonnet | Worked example end-to-end: 1 starter + 3 card actions = agent built/deployed/saved/priced                         | Click-test passes                                   |
| W6V5  | sonnet | Trailing chips on 100% of assistant replies in dev                                                                | No missing `trailing_chips` declarations            |
| W6V6  | sonnet | After 100 simulated chats per surface, `world.select('ui:chat:starter:*')` returns non-trivial top-3              | Substrate learning loop closed                      |

**Exit gate:** all 6 verify subtasks pass. Compounding payoff demonstrated — chips users pick rise; dead-end chips drop out.

---

## W7 — Docs reconciliation

**Per `.claude/rules/documentation.md`:** W2 plan (W1D5) → W3 alongside-edit
threaded through every sonnet edit task → W7 verify consistency.

**Mode:** lean. Exit = grep finds zero stale terms; cross-references resolve.

### W7.edit (haiku, parallel × 4 — one per doc family)

| id    | model  | task                                                                                                                              | exit                                                |
|-------|--------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------|
| W7E1  | haiku  | Update `one/dictionary.md` — add 13 card names, `Drawer`, `ChatDock`, `ChatFrame`, `computeStarters`, `trailing_chips`, `viewer={creator,developer,end_user}` | Terms canonicalised; dead-name list updated         |
| W7E2  | haiku  | Update `one/lifecycle.md` — agent state machine `draft→live→paused→evolving`; viewer-mask derivation                              | State diagram added                                 |
| W7E3  | haiku  | Update `one/routing.md` — M10 host→`(workspace, agent, viewer, brand)` middleware path                                            | M10 entry lands                                     |
| W7E4  | haiku  | Create `web/src/components/CLAUDE.md` — directory contract for cards, drawer, EmptyCard, ChatDock                                 | File exists; auto-loads when working in `web/src/components/` |

### W7.verify (sonnet)

| id    | model  | task                                                                                                                            | exit                                          |
|-------|--------|---------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------|
| W7V1  | sonnet | Doc consistency — `grep -r` for dead names; `markdown-link-check` on all touched docs; verify TS interfaces in examples match `web/src/lib/cards.ts` and `web/src/types/*.ts` | Zero dead names; zero broken links; examples compile |
| W7V2  | sonnet | Append learnings entry to `one/learnings.md` per `.claude/rules/documentation.md` §Loop Close                                   | One-line entry per cycle closed               |

**Exit gate:** docs match code. No drift. Code rubric (security/stability/simplicity/speed) applies to docs — no sensitive data, no broken links, no bloat.

---

## Spawn protocol — how `/do` reads this file

```
/do one/ui-todo.md
   ↓
Phase 0: spawn 5 haiku in parallel for Q1-Q5 (one message, 5 Agent calls)
   ↓ (all return; conditional follow-throughs queued)
Phase 0b: spawn Q4F|Q4F2 + Q5F if their triggers fired
   ↓
Phase 1: W1.recon (3 haiku) + W2.edit.W2E1 (haiku) + W4.edit (sonnet)
         all in one message — parallel across waves
   ↓
Phase 2: W1.decide (opus, sequential 5 — W1D1..W1D5 chain via context)
         W2.edit.W2E2 (sonnet) starts when W2E1 lands
   ↓
Phase 3: W1.edit (9 sonnet in parallel, one message — incl W1E9 PasskeyKeepThis)
         W3.recon (2 haiku in parallel)
   ↓
Phase 4: W3.edit (7 sonnet in parallel — incl W3E7 deploy gate)
   ↓
Phase 5: W5.recon (2 haiku) + W6.recon (1 haiku)
   ↓
Phase 6: W6.decide (opus, 3 sequential)
   ↓
Phase 7: W5.edit (10 sonnet) + W6.edit (5 sonnet incl W6E5)
         — 15 sonnet across two messages (cap = 13/message)
   ↓
Phase 8: All verify tasks run (W1V1, W2V1, W3V1, W4V1, W5V1-9, W6V1-6)
         compute deterministic numbers; mark or warn paths
   ↓
Phase 9: W7 docs reconciliation — 4 haiku in parallel + W7V1-2 sonnet verify
```

**Per-message parallelism cap:** ≤ 13 Agent calls per message. Beyond that, batch
across two messages — context cost outweighs the speedup.

**Cross-tier ordering rule:** within a wave, opus decides → sonnet edits → sonnet
verifies. haiku recon can run before opus or in parallel with another wave's edit.

**Closing rule:** every spawned agent MUST call `mark(edge, depth)` on success or
`warn(edge, 1)` on failure — width only compounds if every branch deposits.

---

## Anti-scope (NOT in this plan, per ui-backend.md)

- New SDK methods beyond surface needs · Python changes · MCP additions
- New CLI verbs · multi-region D1 · real-time agent-edit collab
- Audit log surface UI (only the bare row in W5) · agent marketplace publishing

---

## See also

- [ui.md](ui.md) — surfaces, moves, primitives (the spec)
- [ui-backend.md](ui-backend.md) — wave plan, schema, reuse tally (the plan)
- [ui-signals-todo.md](ui-signals-todo.md) — `emitClick` substrate (upstream of W1)
- [template-plan.md](template-plan.md) — classifier, mode/lifecycle conventions
- [template-todo.md](template-todo.md) — dashboard view (this TODO contributes to it)
- [`.claude/commands/do.md`](../.claude/commands/do.md) — wave orchestration
- [`.claude/rules/ui.md`](../.claude/rules/ui.md) — every onClick → signal
- [`.claude/rules/design.md`](../.claude/rules/design.md) — 6 tokens enforced at build
- [`.claude/rules/astro.md`](../.claude/rules/astro.md) — islands, lazy, dark contrast
- [`.claude/rules/documentation.md`](../.claude/rules/documentation.md) — W2 plan → W3 alongside → W7 verify
- [learnings.md](learnings.md) — append-only log; W7V2 writes here

---

*49 tasks. 7 waves. 3 tiers. Width = parallel sonnet edits. Depth = waves × cycles.
Docs and code edited in parallel. Every branch marks. The substrate learns the
chat surface itself.*
