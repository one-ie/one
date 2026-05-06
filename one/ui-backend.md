# ui-backend.md — implementation plan

Companion to `ui.md`. This is the **wiring plan**: what to build, in
what order, against what we already have, to make the 7 surfaces +
11 moves real.

**Classifier** (per `template-plan.md` §0):
- Spec locked: ✓ — `ui.md` is the spec.
- Variance known: ✓ — most patterns reuse existing code (passkey, skills, chat stream).
- Exit scalar: ✓ — each wave has a deterministic gate (compile + route loads + click-test).
- Files known: ◐ — frontend components are new; backend mostly extends existing.

**Mode: mixed.** Full plan (recon-first, waved). Lean cycles per wave.

**Lifecycle: construction.**

---

## What we already have (don't rebuild)

| Capability | Where | Status |
| --- | --- | --- |
| Passkey + wallet provision | `web/src/pages/api/provision.ts`, `recover.ts` | ✓ M1 ready |
| Skill import + parse | `web/src/lib/skill/import.ts`, `web/src/pages/api/skill/import.ts`, `sdk/src/skills.ts` | ✓ |
| Skill frontmatter parser | `web/src/lib/skill/parser.ts` | ✓ M5 ready for skills |
| Chat streaming API | `web/src/pages/api/chat.ts` (with `STARTER_PROMPTS`) | ◐ exists; needs card-frame protocol |
| Design tokens + live editor | `web/src/layouts/Layout.astro`, `web/src/pages/design.astro` | ✓ |
| Stripe + pay SDK | `web/src/pages/api/pay/create-intent.ts`, `sdk/src/pay.ts` | ✓ M5 hooks for accept-link |
| MCP substrate tools | `mcp/src/tools/substrate.ts` | ✓ exposes `signal`/`mark`/`warn`/`ask`/`fade` |
| CLI verbs | `cli/src/index.ts` (agent · skill · auth · dev) | ✓ |
| D1 schema (identity) | `web/migrations/*.sql` (owners, keys, domains, notifications) | ✓ partial |
| Existing routes | `web/src/pages/{chat,agents,design}.astro` | ◐ need refresh to match `ui.md` |
| **UI signals plumbing** | `src/lib/ui-signal.ts` (`emitClick`), `.claude/rules/ui.md`, L1.5 prefetch in `src/engine/loop.ts` | ✓ complete (`ui-signals-todo.md`, all 3 cycles done). Every click → `ui:<surface>:<action>` → substrate mark → prefetch warms top-3 next clicks |

**The ui-signals work is upstream of every wave below.** Every action button
on every card and drawer in W1 must call `emitClick('ui:<surface>:<action>')`
before the local handler — that's the rule, not a guideline. The substrate
is already learning click→click paths in chat-v3; W1-W6 just extend the
coverage to the new surfaces.

---

## What we don't have (greenfield)

| Gap | Blocks | Move |
| --- | --- | --- |
| Drawer component | every per-item view | M3 |
| Card vocabulary (13 types) | generative UI replies | M11 |
| Viewer context | every surface | M2 |
| Surface context for chat dock | "rename this" working from any page | M4 |
| Workspace router middleware | end-user URLs | M10 |
| `agents` / `themes` / `tool_connections` tables | every per-item drawer | M5 (needs storage for frontmatter) |
| Trace / revenue / generations lenses | drawer tabs across surfaces | M8 |
| Adaptive starter + trailing-chip computation | M11 protocol | M11 |
| `/skills` `/tools` `/payments` `/settings` routes | the sidebar | (4 surfaces) |
| Mobile "open on desktop" handoff | M9 | M9 |

---

## Schema decisions (W2 work, design now)

The brain (TypeDB) already holds paths and signals. D1 holds
durable application records. New D1 tables:

```sql
-- agents: owner-scoped persona, frontmatter is the spec (M5)
CREATE TABLE agents (
  id           TEXT PRIMARY KEY,        -- ulid
  owner_id     TEXT NOT NULL,           -- → owners.id
  slug         TEXT NOT NULL,           -- url path under workspace
  name         TEXT NOT NULL,
  frontmatter  TEXT NOT NULL,           -- yaml as text — chat-edited (M5)
  body         TEXT NOT NULL,           -- markdown prose
  state        TEXT NOT NULL DEFAULT 'draft',  -- draft | live | paused | evolving
  generation   INTEGER NOT NULL DEFAULT 1,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL,
  UNIQUE(owner_id, slug)
);

-- agent_skills: which skills are enabled per agent
CREATE TABLE agent_skills (
  agent_id   TEXT NOT NULL,
  skill_name TEXT NOT NULL,             -- → skills (already imported via /api/skill/import)
  PRIMARY KEY (agent_id, skill_name)
);

-- tool_connections: OAuth identities per workspace (M6 connected zone)
CREATE TABLE tool_connections (
  id           TEXT PRIMARY KEY,
  owner_id     TEXT NOT NULL,
  provider     TEXT NOT NULL,           -- slack | stripe | shopify | composio:<app>
  account      TEXT NOT NULL,           -- e.g. workspace name or acct id
  scopes       TEXT NOT NULL,           -- json array
  refresh_at   INTEGER,
  created_at   INTEGER NOT NULL
);

-- themes: workspace's saved palettes (M5 + M6)
CREATE TABLE themes (
  id          TEXT PRIMARY KEY,
  owner_id    TEXT,                     -- null = community
  name        TEXT NOT NULL,
  tokens      TEXT NOT NULL,            -- json: {bg, fg, font, primary, secondary, tertiary}
  is_public   INTEGER NOT NULL DEFAULT 0,
  fork_of     TEXT,                     -- → themes.id
  created_at  INTEGER NOT NULL
);

-- agent_generations: every L5 evolution (M3 generations tab)
CREATE TABLE agent_generations (
  id           TEXT PRIMARY KEY,
  agent_id     TEXT NOT NULL,
  generation   INTEGER NOT NULL,
  frontmatter  TEXT NOT NULL,
  body         TEXT NOT NULL,
  reason       TEXT,                    -- why L5 fired
  created_at   INTEGER NOT NULL
);
```

**Skills already exist** (the registry is wherever `/api/skill/import` writes to — verify in W1 recon). **Conversations & substrate events** stay where they live (D1 messages table, TypeDB paths). The drawer "trace / chats / revenue" tabs are *queries*, not new tables (M8: substrate is the source).

**Domains, webhooks, notifications, members** — D1 tables already exist or are easy adds; defer to settings-surface work.

---

## The 6 waves

```
W1 primitives        W2 schema           W3 APIs              W4 routing          W5 surfaces          W6 chat protocol
(components, ctx)    (D1 migrations)     (CRUD + lenses)      (M10 middleware)    (route shells)       (cards + starters)
parallel ─────────── parallel ────────── needs W2 ────────── parallel ────────── needs W1+W3 ────────── needs W1+W3
```

W1, W2, W4 start in parallel. W3 starts when W2 lands. W5/W6 last.

---

### W1 — Primitives (frontend foundation)

**Tasks:**
1. `web/src/components/ui/Drawer.tsx` — slide-in right, ESC to close, keyboard tab nav, deep-link via `?drawer=<id>`. Used by every per-item view (M3).
2. `web/src/components/ui/EmptyCard.tsx` — card-shaped empty state with chat input slot (M7). Reused across all grids.
3. `web/src/components/cards/*.tsx` — the 13 card types from `ui.md` M11 vocabulary:
   - `AgentPreviewCard` · `DeployStatusCard` · `ResultCard` · `ChoiceChips` · `VerifyCard` · `PriceCard` · `BrandPalette` · `SkillToggleRow` · `MarketplaceMini` · `TraceMini` · `CompareCard` · `OnboardingChecklist` · `EmptyStateCard`
   - Each is a typed React component with `{ data, onAction }` props.
4. `web/src/lib/viewer.ts` — derive `viewer = creator | developer | end_user` from session role + workspace ownership (M2). No config; pure derivation.
5. `web/src/lib/surface-context.ts` — collect `{url, selection, brand, viewer}` from page state, expose a hook for the chat dock (M4).
6. `web/src/components/chat/ChatDock.tsx` — bottom-right collapsed/open states; cmd-K trigger; embeds the same chat island as `/chat`; injects surface-context as a system signal.

**Exit gate:**
- All 13 card components compile + render in `/design` showcase strip
- Drawer opens via test page with `?drawer=test`
- Chat dock cmd-K toggles open/close on every surface
- Lighthouse 100% on `/chat` preserved

**Reuses:** `web/src/components/ChatHost.tsx`, AI SDK v6 streaming, design tokens.

---

### W2 — Schema (D1 migration)

**Tasks:**
1. `web/migrations/00NN_agents_skills_tools_themes.sql` — the 5 tables above
2. `web/src/lib/db/agents.ts` — type-safe wrappers (`getAgent`, `listAgents`, `createAgent`, `patchAgentFrontmatter`)
3. `web/src/lib/db/themes.ts`, `tools.ts` — same shape per table
4. Verify wrangler D1 migration applies clean to local + production-like

**Exit gate:**
- `wrangler d1 migrations apply` succeeds on a fresh DB
- Round-trip test: `createAgent` → `getAgent` → `patchAgentFrontmatter` → `getAgent` returns updated frontmatter

**Reuses:** existing migration tooling, `owners` table for `owner_id` FK.

---

### W3 — API routes (the lenses)

**Tasks (per surface):**

`web/src/pages/api/agents/` — `index.ts` (GET list, POST create), `[id].ts` (GET, PATCH frontmatter, DELETE), `[id]/deploy.ts` (POST), `[id]/trace.ts` (GET — substrate query M8), `[id]/chats.ts` (GET — D1 messages join), `[id]/revenue.ts` (GET — x402 events filter), `[id]/generations.ts` (GET).

`web/src/pages/api/skills/` — `index.ts` (GET list — both registry + per-agent), `[name].ts` (GET detail), `[name]/enable.ts` (POST `{agent_id}`).

`web/src/pages/api/tools/` — `index.ts` (GET — connected + available), `[provider]/connect.ts` (POST → OAuth start), `[provider]/disconnect.ts` (POST), `[provider]/scopes.ts` (PATCH).

`web/src/pages/api/themes/` — `index.ts` (GET yours + community), `[id].ts` (GET, PATCH), `[id]/fork.ts` (POST), `[id]/share.ts` (POST → public URL).

`web/src/pages/api/payments/` — `wallet.ts` (GET balances), `txs.ts` (GET filterable), `accept-links/[slug].ts` (GET, PATCH frontmatter for pricing/embed/webhook).

`web/src/pages/api/notifications.ts` — GET high-salience substrate events (M8 lens).

**Exit gate:**
- Each route returns shape that matches the corresponding card/drawer's TypeScript prop type
- Smoke test: list → detail → patch → list reflects update for agents and themes

**Reuses:** existing `/api/skill/import`, `/api/pay/*`, `/api/provision`, MCP substrate tools (call internally where reasonable).

---

### W4 — Workspace routing (M10)

**Tasks:**
1. `web/src/middleware.ts` — host header parser:
   - `tony.one.ie/refunds` → `(workspace=tony, agent=refunds-bot, viewer=derived, brand=tony.theme)`
   - `tony.one.ie` → `(workspace=tony, viewer=derived, brand=tony.theme)`
   - `acme.com` (custom) → CNAME lookup → `(workspace, agent, ...)`
   - Sets context on `Astro.locals` for downstream
2. `/chat.astro` consumes `Astro.locals.context` and renders agent + viewer mask (M2)
3. `web/src/pages/api/domains/[domain]/verify.ts` — CNAME verification + cert auto-issue handshake

**Exit gate:**
- `curl -H "Host: tony.one.ie" /refunds` returns chat HTML with refunds-bot context loaded
- Theme tokens reflect workspace's saved theme (verified by inspecting `<style>` block)

**Reuses:** `domains` D1 table (already exists per audit), Cloudflare Workers host header access.

---

### W5 — Surface assembly

**Tasks (per route):**

1. **Refresh existing**: `chat.astro`, `agents.astro`, `design.astro` — wire Sidebar, ChatDock, EmptyCard, drawer.
2. **New shells**: `skills.astro`, `tools.astro`, `payments.astro`, `settings.astro` — Sidebar + Grid + Drawer + ChatDock per `ui.md` §each-surface.
3. **Sidebar**: `web/src/components/nav/Sidebar.tsx` — 7 items (excluding /chat which is its own context), 220px → 56px → hidden, viewer-mask aware.
4. **Mobile handoff**: `web/src/components/MobileHandoff.tsx` — shown on sm + developer/creator viewer accessing non-`/chat` route (M9).

**Exit gate per surface:**
- Loads in <300ms TTFB
- Click-test: open drawer → switch tabs → close
- Lighthouse ≥95 on each route in dark mode
- The friction map row for that surface passes (visit → primary action in ≤2 clicks)

**Reuses:** all of W1, all of W3.

---

### W6 — Chat protocol upgrade (M11)

**Tasks:**
1. **Card-frame stream protocol** — extend `web/src/pages/api/chat.ts` to emit typed frames:
   ```ts
   type ChatFrame =
     | { kind: 'text'; text: string }
     | { kind: 'card'; type: CardType; data: unknown }
     | { kind: 'chips'; placement: 'trailing' | 'onset'; chips: Chip[] }
   ```
   Frames are NDJSON over the existing SSE stream.
2. **Adaptive starter computation** — `web/src/lib/starters.ts`:
   ```ts
   computeStarters(ctx: { viewer, surface, selection, has_agents, has_revenue }): Chip[]
   ```
   Replaces hardcoded `STARTER_PROMPTS`. Initial implementation is a lookup table per `(surface, lifecycle stage)`. **The substrate then learns** — each chip is a `ui:chat:starter:<id>` receiver (existing pattern from `ui-signals-todo.md`); `emitClick` already marks the path on click. After ~100 chats per surface, replace the lookup with `world.select('ui:chat:starter:*')` filtered to the current `(surface, viewer, lifecycle stage)` — the substrate's own `select()` returns the chips with the highest mark-strength. Starters become *self-tuning*.
3. **Trailing-chip computation** — assistant prompt includes a system rule: *every reply must declare a `trailing_chips` array of next-intent chips (1-4 items)*. Schema-validated server-side; if missing, fallback to surface-context defaults. Each rendered chip emits `ui:chat:trailing:<id>` on click — same learning loop applies. The substrate learns *which trailing-chip patterns lead to closed loops* (mark strength compounds for chips that produce another `mark`, decays for chips that produce `warn` or silence).
4. **Card emission rules** — assistant tools register output schemas; certain tool results auto-render as cards (e.g. `agents.create` → `AgentPreviewCard`, `pay.create` → `ResultCard`).
5. **Frontend renderer** — `web/src/components/chat/MessageRenderer.tsx` switches on `frame.kind` and renders the matching component from W1. Every action button inside a card calls `emitClick('ui:card:<type>:<action>')` per `.claude/rules/ui.md`.

**The compounding payoff (why this isn't just "rich messages"):**

```
W1 cards emit clicks ────► substrate marks paths ───► L1.5 prefetch warms cache
                              │                          │
                              ▼                          ▼
                   L5 evolution rewrites               next click is faster
                   starter+trailing tables             (already proven in chat-v3)
                              │
                              ▼
                   chips users actually pick rise to top;
                   chips that lead to dead-ends drop out
```

This is the substrate's promise applied to the chat surface itself: **the
guidance UI gets smarter the more it's used**, without any rule changes.

**Exit gate:**
- Streamed reply for "build me a refund bot" produces: `{kind:'text'}` → `{kind:'card', type:'AgentPreviewCard'}` → `{kind:'chips', chips:[...]}`
- All 13 card types are reachable via at least one prompt path
- Every card action and chip click emits an `ui:*` signal (grep gate: `emitClick` calls ≥ rendered actions per surface)
- Click-test: the worked example in `ui.md` §Worked example flows end-to-end (1 starter + 3 card actions = agent built, deployed, saved, priced)
- Trailing chips appear on 100% of assistant replies in dev (no missing declarations)
- After 100 simulated chats per surface, `world.select('ui:chat:starter:*')` returns a non-trivial top-3 — proves the learning loop is closed

**Reuses:** AI SDK v6 streaming, existing chat API skeleton, M5 frontmatter editing path for `pay.create`/`agents.patch`. **Critically reuses `emitClick` + L1.5 prefetch from `ui-signals-todo.md` — no new substrate wiring needed.**

---

## Dependency graph

```
W1 primitives ──────┬──────────────────────► W5 surfaces
                    │                            ▲
W2 schema ──► W3 APIs ────────────────────────┤
                                                │
W4 routing ─────────────────────────────────────┤
                                                │
W1 + W3 ────────────────► W6 chat protocol ─────┘
```

Parallelizable starts: W1, W2, W4. W3 unblocks when W2 lands. W5 + W6 are the assembly waves.

---

## Reuse vs build (the tally)

| Layer | Reuse | Build |
| --- | --- | --- |
| Auth / wallet | 100% (passkey, recover, provision) | 0 |
| Skills registry | 100% (parser, import API, SDK) | 0 |
| Chat infra | ~70% (stream API exists; card protocol new) | card-frame protocol, starter computation |
| Payments | ~80% (stripe, sdk pay, x402 receive) | accept-link drawer wiring + trailing webhooks UI |
| Design tokens | 100% (Layout.astro, design.astro) | theme drawer + community grid |
| Schema | ~50% (identity tables exist) | agents, themes, tool_connections, agent_generations |
| Routing | ~30% (Astro routing exists) | M10 middleware (host header → context) |
| UI components | ~10% (chat island exists) | drawer, 13 cards, sidebar, viewer ctx, surface ctx |

**Most weight is W1 (UI primitives) + W6 (card protocol).** Schema and APIs are thin because the substrate already holds the interesting state.

---

## Anti-scope (NOT in this plan)

- New SDK methods beyond what surfaces need (defer)
- Python package changes (`python/` is independent)
- MCP tool additions (already sufficient)
- CLI new verbs (defer until after W5)
- Multi-region D1 (defer; Cloudflare handles)
- Real-time collab on agent editing (defer; per-user is fine)
- Audit log surface UI (W5 settings only the bare row; full surface later)
- Marketplace publishing flow for agents (community themes only in W5)

---

## Per-wave classifier

| Wave | Mode | Reason |
| --- | --- | --- |
| W1 primitives | full | many components, parallel; wide variance per card |
| W2 schema | lean | 5 tables, known shape, exit = migration applies |
| W3 APIs | mixed | thin wrappers (lean per route), but ~20 routes (full plan to sequence) |
| W4 routing | lean | one middleware file, known shape |
| W5 surfaces | full | 7 routes, each is its own composition |
| W6 chat protocol | full | new protocol + 13 card emissions + adaptive logic |

---

## Open questions (resolve before W3)

1. **Where does the skill registry live?** — `/api/skill/import` writes somewhere; need to confirm KV vs D1 vs TypeDB so `GET /api/skills` reads from the same place.
2. **Conversation storage** — is `/api/agents/[id]/chats` reading from D1 messages or substrate? Need the existing chat history schema.
3. **x402 event filter** — does `/api/agents/[id]/revenue` query substrate marks or a payments-events table? Audit said x402 receive is in `apps/one-core` (prod) — confirm where events are queryable from `web/`.
4. **Composio integration** — none today. W3 `/tools` plan assumes Composio SDK comes in; need to confirm scope (full Composio or start with native Slack/Stripe/GitHub).
5. **L5 evolution events** — does the substrate currently emit them? If not, W6 `connect` tab + generations table need the runtime hook first.

These belong in W1 recon (each one is a 5-minute file read).

---

*6 waves. Heavy reuse. The drawer + cards + chat protocol are the load-bearing greenfield. Everything else is glue.*
