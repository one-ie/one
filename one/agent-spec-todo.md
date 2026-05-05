# agent-spec-todo

> **Spec (source of truth):** [`agent-spec.md`](agent-spec.md)
> **Companions:** [`agent-spec-prompt.md`](agent-spec-prompt.md) (conversion guide) · [`modify.md`](modify.md) (chat-driven mutation surface)
> **Mode:** mixed — meta-plan with seven sub-cycles, each lean once a `/do` agent picks it up
> **Lifecycle:** construction
>
> This is the **ledger**, not the work. Each cycle below is its own classifiable unit and gets its own `/do` cycle when picked.

---
use multiple agents in parallel do fast
## Overall classifier

| Prior | Answer | Justification |
|-------|--------|---------------|
| Spec locked | YES | `agent-spec.md` is frozen at v0.1; bidirectional, artifacts, evals all specified |
| Variance known | YES | Four surfaces (sdk, mcp, claw, web); cycles touch them in known files |
| Exit scalar | YES | End-to-end test (§ Integration test below) — visitor lands on `one.ie`, signs, writes a paid agent with skills, third-party imports it via Claude Code, both run and earn |
| Files known | YES per cycle, MIXED across the whole | Each cycle's file list is exhaustive; some cross-cycle integration discovered at boundaries |

**3.5 / 4 → `mode: mixed`.** Each cycle ships as `mode: lean` once dependencies clear. No cycle blocks more than one other.

---

## Routing (the system once complete)

```
visitor → one.ie/get-yours
   ↓ navigator.credentials.create()  → POST /api/provision
                                      → D1 INSERT owners(slug, pubkey, ts)
   ↓ redirect /u/<slug>/chat
visitor types: "create a customer-support agent that handles refunds"
   ↓ chat.ts loads slug context, injects existingFiles + agent catalog
   ↓ model calls write({ slug, file: 'agents/support', content })
   ↓ server returns { kind:'pending', challenge: HMAC(...) }
   ↓ <PreviewCard> renders → owner Face ID
   ↓ POST /api/commit { slug, file, content, challenge, assertion }
   ↓ verify HMAC + assertion → R2 PUT alice/agents/support.md  → cache purge
visitor: "test the refund skill"
   ↓ chat loads agents/support.md → skills/process-refund.md
   ↓ skill.accepts[] → x402 quote → owner wallet
   ↓ visitor signs micropayment → receipt verified → skill body runs
visitor: "evaluate this skill"
   ↓ eval tool runs evals/evals.json with_skill + without_skill in fresh contexts
   ↓ benchmark.json written to R2 _workspace/iteration-N/
   ↓ chat shows pass-rate delta inline
third-party Claude Code user: imports https://one.ie/u/alice/skills/process-refund
   ↓ runtime fetches SKILL.md (agentskills.io directory format) → caches → activates
   ↓ visitor's chat (their site) calls process-refund → x402 → alice's wallet earns
```

The whole system is one Worker. Slugs are R2 prefixes. Agents and skills are markdown. Everything signed, everything logged, everything paid.

---

## Schema reference

| Surface | Change | Migration |
|---------|--------|-----------|
| **D1 owners (MVP)** | `owners(slug PK, pubkey, credential_id, ts)` | `0001_owners.sql` |
| **D1 owners (Tier 2)** | adds `wallet`, `agentverse_key_enc` in C7 polish | `0002_owner_extras.sql` |
| **R2 layout** | `<slug>/{agent.md, agents/<n>.md, skills/<n>.md, blog/<n>.md, page/<n>.md, _workspace/<skill>/iteration-N/...}` | none — implicit on first PUT |
| **R2 metadata** | `customMetadata: { prevSha, ts, model }` on every signed write | runtime |
| **R2 versioning** | enabled on the `CONTENT` bucket | wrangler config |
| **TypeDB** | unchanged from current `syncAgent()` schema | none |
| **In-memory** | LRU `commit:nonce:*` (60s TTL, max 10k entries) for replay protection | runtime, single Worker |
| **KV `CHAT_CACHE`** | unchanged; persona-aware keys (`v1:<slug>:<agent>:<prompt>`) | runtime |

---

## Source of truth

| Doc | Locks |
|-----|-------|
| [`agent-spec.md`](agent-spec.md) | Schema, runtimes, artifacts, evals, bidirectional rules |
| [`agent-spec-prompt.md`](agent-spec-prompt.md) | Conversion + best practices for skill authors |
| [`modify.md`](modify.md) | Chat-driven website mutation, provision/commit flow, owner controls |
| [`adl-integration.md`](adl-integration.md) | `ui:*` receiver contract for tool-call observability |
| [`rubrics.md`](rubrics.md) | security / stability / simplicity / speed scoring (gate 0.65); code rubric + self-improvement loop |
| [`dictionary.md`](dictionary.md) | Canonical names, six verbs, four outcomes |
| [`patterns.md`](patterns.md) | Closed-loop, deterministic-sandwich, zero-returns |

---

## Documentation updates (every cycle's W2)

| Touched | Update |
|---------|--------|
| `agent-spec.md` | Append a *Status* row noting the cycle's exit-scalar number |
| `agent-spec-prompt.md` | Add new patterns / anti-patterns surfaced during W4 |
| `modify.md` | Reflect any field added to `owners` or new R2 prefix |
| Root `CLAUDE.md` | Note new public surface (CLI verb, API route, SDK export) |
| `dictionary.md` | Any term introduced (e.g. "activation envelope", "import refresh") |
| `learnings.md` | One-line entry per cycle close (date · cycle N · sentence · rubric · source) |

---

## Status

**Active cycle:** C2.5 — Skill creator

### Cycle 1 ✓

- [x] W0 baseline — tsc clean, no C1 files exist
- [x] W1 recon — wrangler has KV only (no R2/D1), chat.ts has no tools/slug/persist, no passkey/SimpleWebAuthn installed
- [x] W2 decide — cloudflare:workers pattern, AI SDK v6 inputSchema, no DOMPurify (Workers), nanoid slug
- [x] W3 edit — 15 files created/modified; fixed imports, tool API, locals→cloudflare:workers
- [x] W4 verify — tsc --noEmit passes clean; passkey registration works end-to-end locally (wrangler dev)

**Notes:** Vite pinned to 7.3.2 (rolldown incompatibility with workerd). `RP_ID=localhost` + `ORIGIN=http://localhost:8787` in wrangler.toml for dev; remove before production deploy. SERVER_SECRET lives in `.dev.vars` only (not [vars]). D1 migration applied locally via `wrangler d1 execute one-owners --local --file=migrations/0001_owners.sql`.

### Cycle 2 ✓

- [x] W0 baseline — tsc --noEmit passes clean; all 6 C2 target files MISSING (expected)
- [x] W1 recon — chat.ts has write tool/Groq/CONTENT; slug not forwarded to API; PreviewCard unconnected; eval lib absent
- [x] W2 decide — 9 files: 4 lib/eval, eval.ts API, EvalCard, chat.ts+Chat.tsx+MessageList patch
- [x] W3 edit — 9 agents all marked; W3.5 micro: wired onIterateEval→sendMessage (11 files total)
- [x] W4 verify — tsc clean; rubric fit=0.78 form=0.82 truth=0.88 taste=0.80 composite=0.821 ≥ 0.65; Playwright browser tests 7/7 pass; EvalCard confirmed rendering in browser

**Notes:** AI SDK v6 uses `maxOutputTokens` not `maxTokens`. Eval tool strips `skills/` prefix from model input (model tends to include it). Playwright `postData()` doesn't capture streaming POST bodies — use `page.route()` instead. Test cases loaded from `evals/evals.json` sidecar only (no inline YAML in Workers MVP).

### Cycle 2.5

- [x] W0 baseline — tsc clean; SKILL.md+LICENSE exist; 5 files missing (sub-agents, schemas, auto-import)
- [x] W1 recon — SKILL.md+LICENSE exist; 3 sub-agents+references/schemas+auto-import+2 doc edits needed
- [x] W2 decide — 9 ops: 4 new md files, auto-import.ts, astro.config.mjs fs.allow, provision.ts hook, agent-spec note, chat capabilities update
- [x] W3 edit — 9 agents all marked; grader/analyzer/comparator/schemas created; auto-import.ts wired to provision; 2 doc edits
- [x] W4 verify — tsc clean; rubric security=0.93 stability=0.88 simplicity=0.92 speed=0.90 composite=0.912 ≥ 0.65; micro-fix: schemas.md grading.json bare array shape

### Cycle 3

- [x] W0 baseline — tsc clean; all 5 C3 files missing (expected)
- [x] W1 recon — chat.ts has no skill discovery; auto-import.ts exists; sdk/types.ts lacks agentmd fields (C5 scope); 5 target files all missing
- [x] W2 decide — 5 new files: parser(28L), loader(38L), import(42L), emit(32L), refresh(22L); cloudflare:workers env pattern; pure-JS parser (no new dep)
- [ ] W3 edit
- [ ] W4 verify

### Cycle 4

- [ ] W0 baseline
- [ ] W1 recon
- [ ] W2 decide
- [ ] W3 edit
- [ ] W4 verify

### Cycle 5

- [ ] W0 baseline
- [ ] W1 recon
- [ ] W2 decide
- [ ] W3 edit
- [ ] W4 verify

### Cycle 6

- [ ] W0 baseline
- [ ] W1 recon
- [ ] W2 decide
- [ ] W3 edit
- [ ] W4 verify

### Cycle 7

- [ ] W0 baseline
- [ ] W1 recon
- [ ] W2 decide
- [ ] W3 edit
- [ ] W4 verify

---

## Cycle map (read top-down)

```
C1   Foundation          web/ R2+D1+chat write/commit/provision         exit: visitor signs, lands in chat, writes one page
C2   Eval framework      eval tool, benchmark, iteration loop            exit: skill goes from pass=0.50 → 0.85 over 3 iterations
C2.5 Skill creator       fork Anthropic's skill-creator + 3 deltas       exit: chat user runs end-to-end loop, ships skill ≥0.85
C3   Bidirectional       lenient parse, dir-format read, import, emit    exit: Claude Code skill imports + runs unchanged
C4   Artifacts           A2A card, DID, ERC-8004, MCP json, sigstore     exit: agentcard.json validates against A2A v1.0 schema
C5   Runtimes            uAgents py, MCP serve, SDK schema upgrade       exit: oneie run agent.md registers Almanac protocol
C6   CLI                 agent/skill/auth/eval/sign/verify verbs         exit: 14 verbs all return numeric receipts
C7   Polish              subdomain, custom slugs, image uploads          exit: <slug>.one.ie resolves; image in markdown
```

Dependencies: **C1 blocks C2.** **C2 blocks C2.5 + C3.** **C4, C5, C6 are independent of each other** but each needs C1+C3. **C7 is last.**

---

## Cycle 1 — Foundation: web sandbox

**Goal:** A stranger visits `one.ie/get-yours`, signs with passkey, lands on `/u/<slug>/chat`, writes their first page, and sees it live at `/u/<slug>/page/<name>` — all in under 5 seconds, all signed, all stored in R2.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors per `modify.md` § Build classifier.

**Files (with line budgets) — MVP only; Tier-2 features deferred to C7:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/wrangler.toml` | `CONTENT` (R2, versioned) + `DB` (D1) bindings + `SERVER_SECRET` | +5 |
| `web/migrations/0001_owners.sql` | `owners(slug PK, pubkey, credential_id, ts)` | 5 |
| `web/src/pages/api/provision.ts` | HMAC challenge → verify reg → D1 INSERT → redirect (stateless, no cookie) | 30 |
| `web/src/pages/api/commit.ts` | Verify HMAC + assertion → R2 PUT (with metadata) → cache purge | 50 |
| `web/src/pages/api/chat.ts` | + `slug` body, `existingFiles` in prompt, `write` tool returns `pending` | +30 |
| `web/src/pages/get-yours.astro` | Random challenge → button calls `startRegistration` | 25 |
| `web/src/pages/u/[slug]/index.astro` | `getSlugContext` + `<OwnerControls/>` + file list | 20 |
| `web/src/pages/u/[slug]/chat.astro` | Slug-scoped chat; reads `?seed=` | 20 |
| `web/src/pages/u/[slug]/[kind]/index.astro` | Index of pages / posts / agents / skills | 15 |
| `web/src/pages/u/[slug]/[kind]/[name].astro` | SSR R2 → markdown → owner-aware 404 | 25 |
| `web/src/components/chat/PreviewCard.tsx` | Approve/discard; `startAuthentication` on approve | 35 |
| `web/src/components/OwnerControls.tsx` | Silent probe + Edit/New buttons | 12 |
| `web/src/lib/markdown.ts` | `marked` + DOMPurify + frontmatter split | 20 |
| `web/src/lib/passkey.ts` | SimpleWebAuthn wrappers + HMAC + LRU replay | 25 |
| `web/src/lib/slug.ts` | `getSlugContext`, `listFiles`, random-slug + collision retry | 20 |

**13 files, ~317 lines.** Settings page, recovery codes, multi-key, magic link, API keys → C7.

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C1-T1 | high | S | `wrangler.toml` + migration applied; `wrangler d1 execute` succeeds | infra |
| C1-T2 | high | M | passkey lib + HMAC + LRU; both endpoints stateless | crypto |
| C1-T3 | high | M | `/api/provision` end-to-end; `curl … /provision` returns redirect | provision |
| C1-T4 | high | M | `write` tool returns `pending`; `/api/commit` verifies + writes R2 | commit |
| C1-T5 | high | S | `[slug]/[kind]/[name].astro` reads R2 → renders markdown | render |
| C1-T6 | high | S | OwnerControls silent probe shows ✏️ for owner only | ui |
| C1-T7 | med | S | empty-state CTA on fresh provision | ui |

**Exit scalar:** `oneie e2e` script — provisions a test slug, posts "write a page about X" via the chat API, signs the proposal, verifies R2 PUT happened with `customMetadata.sha` matching the content hash. **Pass = round-trip < 2s, content sha matches.**

**Rubric target:** security ≥ 0.90 / stability ≥ 0.85 / simplicity ≥ 0.85 / speed ≥ 0.80.
Token target: prompt cache hit ≥ 70%; no context stuffing in `/api/provision` or `/api/commit`.

---

## Cycle 2 — Eval framework

**Goal:** A skill author runs `oneie skill eval handle-complaint`, gets a `benchmark.json` with `with_skill` vs `without_skill` deltas, iterates 3× through the chat, and watches pass rate climb from baseline to ≥ 0.85.

**Classifier:** `mode: lean` · `lifecycle: construction`.

**Depends on:** C1 (R2 + chat surface).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/pages/api/eval.ts` | Read-only chat tool endpoint; orchestrates with/without runs | 80 |
| `web/src/lib/eval/runner.ts` | Fresh-context execution per test case; captures outputs + timing | 40 |
| `web/src/lib/eval/grader.ts` | LLM-judge for soft assertions; scripts for mechanical | 50 |
| `web/src/lib/eval/aggregate.ts` | Mean/stddev/delta into `benchmark.json` | 15 |
| `web/src/lib/eval/iterate.ts` | Bundle failures + transcripts → prompt for diff | 25 |
| `web/src/components/chat/EvalCard.tsx` | Inline benchmark + iteration sparkline | 30 |

**6 files, ~240 lines.** SDK API ships in C5; CLI verb ships in C6.

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C2-T1 | high | M | runner exec in fresh context with-skill or baseline | eval |
| C2-T2 | high | M | grader produces `grading.json` with `{passed, evidence}` | eval |
| C2-T3 | high | S | `benchmark.json` has `delta.{pass_rate,tokens,time}` | eval |
| C2-T4 | high | M | `eval` chat tool returns benchmark + suggestions inline | ui |
| C2-T5 | med | S | iterate tool emits diff proposal that flows through `write` | ui |
| C2-T6 | med | S | trigger eval reuses runner with 20-query set | eval |
| C2-T7 | med | S | EvalCard renders pass-rate sparkline across iterations | ui |

**Exit scalar:** Reference skill `csv-analyzer` (shipped in `examples/`) starts at pass-rate 0.50 baseline. After 3 chat-driven iterations, pass-rate ≥ 0.85 on the validation set. **The skill is the canary.**

**Rubric target:** security ≥ 0.90 / stability ≥ 0.85 / simplicity ≥ 0.85 / speed ≥ 0.80.
Token target: `benchmark.json` delta includes `tokens` field; eval runner reports tokens consumed per run.

---

## Cycle 2.5 — Skill creator (the executor)

**Goal:** Ship `skill-creator` as a built-in skill auto-imported into every chat-built sandbox at provision time. A user types *"make me a customer-support skill"* — the skill orchestrates interview → draft → 3 test cases → parallel runs (with/without baseline) → assertions drafted while runs execute → grade → benchmark → owner reviews inline → iterate ≤5× → trigger eval → ship. The skill body is an Apache-2.0 fork of Anthropic's [`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator) with three deltas adapted to our infrastructure.

**Classifier:** `mode: lean` · `lifecycle: construction` · 4/4 priors (spec is theirs + our deltas; variance pinned; exit scalar = end-to-end run on csv-analyzer; files known).

**Depends on:** C2 (eval runner, grader, aggregator already exist as the substrate this skill drives).

**The three deltas vs upstream:**

| Upstream | Ours | Why |
|----------|------|-----|
| `eval-viewer/generate_review.py` opens browser HTTP server | Inline `<EvalCard>` in chat conversation; "Submit All Reviews" is a chat message | Chat-built sandboxes have no shell/browser — the chat *is* the UI |
| Workspace at `<skill>-workspace/iteration-N/` (sibling) | R2 at `<slug>/skills/_workspace/<skill>/iteration-N/` | Sandboxes have no filesystem; R2 is the storage |
| Runs cost real LLM tokens (production model) | **Dry-run mode default for paid skills** — eval uses test/free models; production paid mode opt-in via owner Face ID | Paid skills' x402 gates would charge the owner real USDC for every benchmark run |

Everything else — interview flow, "lean prompt," "explain the why," "look for repeated work," parallel-spawn-in-same-turn, draft-assertions-while-runs-execute, train/validation 60/40 split, 5-iteration cap, grader → analyzer → comparator chain — fork verbatim.

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `agents/skill-creator/SKILL.md` | Forked body + 3 deltas (chat-card, R2 paths, dry-run) | 380 |
| `agents/skill-creator/agents/grader.md` | Sub-agent: assertion grading | 80 |
| `agents/skill-creator/agents/analyzer.md` | Sub-agent: pattern analysis | 60 |
| `agents/skill-creator/agents/comparator.md` | Sub-agent: blind A/B | 50 |
| `agents/skill-creator/references/schemas.md` | 20-line pointer to `lib/eval/*` types | 20 |
| `agents/skill-creator/LICENSE-NOTICE.md` | Apache-2.0 + delta inventory | 40 |
| `web/src/lib/skill/auto-import.ts` | On provision, copies skill-creator into `<slug>/skills/skill-creator/` | 25 |
| `agent-spec.md` | One-line note: skill-creator auto-imported | +3 |
| `create-websites-with-chat.md` | Mention "ask the chat to make me a skill" | +5 |

**7 files, ~655 lines.** No script ports — the skill body invokes our existing `eval` tool (C2). No HTML reviewer — chat surface uses `<EvalCard>` (C2). No `aggregate_benchmark`/`run_loop`/`package_skill` — already exist in C2's `lib/eval/*` and C3's emit.

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C25-T1 | high | M | Fork Anthropic skill-creator/SKILL.md + apply 3 deltas | fork+adapt |
| C25-T2 | high | S | Auto-import on provision: skill-creator lands in `<slug>/skills/` | infra |
| C25-T3 | med | S | Trigger eval activates on "make me a skill" / "improve this skill" | trigger |
| C25-T4 | med | S | Dry-run mode never bills owner during benchmark runs | safety |
| C25-T5 | low | S | LICENSE-NOTICE.md committed | legal |

**Exit scalar:** Reference run — owner provisions a fresh sandbox, types *"make me a skill that summarizes a CSV with citations"*. Skill-creator interviews, drafts, runs evals, iterates 3×, ships at pass-rate ≥ 0.85. The owner never leaves the chat. Total elapsed ≤ 10 minutes. Skill body ≤ 300 lines (token discipline: every activation pays the body size cost across all callers).

**Rubric target:** security ≥ 0.90 / stability ≥ 0.90 / simplicity ≥ 0.90 / speed ≥ 0.85.
Token target: SKILL.md body ≤ 300 lines; sub-agents ≤ 80 lines each; `benchmark.json` includes `tokens_per_run` baseline.

**License posture:** Anthropic's skill-creator is Apache-2.0. We fork verbatim, document the deltas in `LICENSE-NOTICE.md`, and submit our adaptations upstream as a PR (the dry-run-for-paid-skills pattern is generally useful; the chat-card adaptation is ours). The skill body itself is Apache-2.0; our scripts are Apache-2.0 + MIT dual.

---

## Cycle 3 — Bidirectional agentskills.io

**Goal:** A skill authored for Claude Code (`pdf-processing/SKILL.md` directory format, agentskills.io frontmatter) imports into our system unchanged. Reverse: our `oneie skill emit` produces a directory layout that runs in Claude Code without conversion.

**Classifier:** `mode: lean` · `lifecycle: construction`.

**Depends on:** C1 (write + R2).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/lib/skill/parser.ts` | `js-yaml` + ~10-line lenient retry; preserve unknown fields | 30 |
| `web/src/lib/skill/loader.ts` | Reads flat `.md` OR directory `<name>/SKILL.md` | 30 |
| `web/src/lib/skill/import.ts` | Fetch URL/npm/github → cache in R2 → sign | 50 |
| `web/src/lib/skill/emit.ts` | Flat → directory layout for `oneie skill emit` | 35 |
| `web/src/pages/api/skill/refresh.ts` | Re-fetch imported remote skills | 20 |

**5 files, ~165 lines.** SDK-mode `discovery.ts` lands in C5 (where SDK mode arrives). CLI verbs land in C6.

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C3-T1 | high | M | parser handles 5 known agentskills.io edge cases (test fixtures) | parse |
| C3-T2 | high | S | loader unifies flat + directory into one Skill type | parse |
| C3-T3 | high | M | imports fetch + cache + sign | net |
| C3-T4 | high | M | emit produces validated agentskills.io directory | emit |
| C3-T5 | med | S | refresh endpoint pulls remote diffs | net |
| C3-T6 | med | S | trust gate prompts on first use, persists answer | trust |

**Exit scalar:** Round-trip test: take Anthropic's reference `pdf-processing` skill, import via chat → run end-to-end. Then `oneie skill emit` → install in fresh Claude Code → run there. **Both runs produce identical output for the same input.**

**Rubric target:** security ≥ 0.90 / stability ≥ 0.88 / simplicity ≥ 0.88 / speed ≥ 0.80.
Token target: lenient parser adds zero tokens to activation path (parse happens at import time, not per-call).

---

## Cycle 4 — Open-standard artifacts

**Goal:** Any agent in our system that opts in (`discovery.agentCard: true`, `did: did:web:...`, `ercAgent: {...}`, `discovery.mcp: true`) auto-emits the corresponding artifact at the right URL or chain. **Adopt the outputs, not the schema.**

**Classifier:** `mode: lean` for individual emitters · `lifecycle: construction`.

**Depends on:** C1 (R2 + agent loading via C3).

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `web/src/lib/artifacts/a2a.ts` | Build A2A AgentCard JSON (v1.0) | 40 |
| `web/src/lib/artifacts/did.ts` | Build did:web document | 25 |
| `web/src/lib/artifacts/erc8004.ts` | Registration JSON + `register()` payload | 30 |
| `web/src/lib/artifacts/mcp-server-json.ts` | MCP `server.json` for registry | 30 |
| `web/src/lib/artifacts/sigstore.ts` | Thin shell-out to `cosign` | 15 |
| `web/src/pages/.well-known/agent-card/[slug].json.ts` | Serve agent-card.json | 15 |
| `web/src/pages/.well-known/did/[slug].json.ts` | Serve did.json | 15 |

**7 files, ~170 lines.** `agent-publish` CLI verb lands in C6.

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C4-T1 | high | M | A2A card validates against [a2a-1.0 JSON schema](https://a2a-protocol.org) | a2a |
| C4-T2 | med | S | did:web document resolves via universal-resolver | did |
| C4-T3 | med | M | ERC-8004 register() tx payload accepted by reference Solidity | erc |
| C4-T4 | med | S | MCP server.json passes registry submission validator | mcp |
| C4-T5 | med | S | Sigstore bundle attaches to release; `cosign verify` passes | trust |
| C4-T6 | high | S | chat-built sandboxes get agentCard:true by default; visitors can curl it | default |

**Exit scalar:** `curl https://one.ie/u/alice/.well-known/agent-card.json | a2a-validator` passes. **One artifact, validated by the standard's tool, on a real slug.**

**Rubric target:** security ≥ 0.92 / stability ≥ 0.88 / simplicity ≥ 0.88 / speed ≥ 0.78.
Token target: artifact emitters produce zero LLM calls — pure deterministic transforms.

---

## Cycle 5 — Runtimes (uAgents, MCP, SDK schema)

**Goal:** `pip install oneie && oneie run agent.md` registers an agent on Almanac. `npx @oneie/mcp serve agent.md` exposes the agent over MCP. The SDK accepts the new schema fields (`agentmd`, `summary`, `accepts[]`, `evals`).

**Classifier:** `mode: full` for the new Python runtime (cross-language, new package); `mode: lean` for SDK / MCP upgrades.

**Depends on:** C3 (parser + loader). Independent of C4.

**Files:**

| File | Purpose | Budget |
|------|---------|--------|
| `python/oneie/__init__.py` | Public surface (`Agent.from_markdown`) | 15 |
| `python/oneie/agent.py` | Loads markdown, builds Pydantic from `inputSchema`, registers Protocol | 80 |
| `python/oneie/openrouter.py` | OpenAI-compatible OpenRouter client | 30 |
| `python/oneie/almanac.py` | mailbox + agentverse + lifecycle hooks | 50 |
| `python/oneie/cli.py` | `oneie run` entry | 20 |
| `python/pyproject.toml` | PEP 621 packaging | 25 |
| `mcp/src/serve.ts` | Loads markdown, exposes `tools/list`, includes `activate_skill` with structured wrapping | 80 |
| `web/src/lib/skill/discovery.ts` | SDK-mode multi-path scan (moved from C3) | 30 |
| `sdk/src/schema.ts` | Add new fields | 30 |
| `sdk/src/compile.ts` | Update emitters; `price` → `accepts[]` sugar | 25 |

**10 files, ~385 lines.**

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C5-T1 | high | M | `oneie run agents/support.md` opens mailbox, registers Protocol on Almanac testnet | py |
| C5-T2 | high | M | OpenRouter client routes `anthropic/claude-haiku-4-5` correctly; fallback works | py |
| C5-T3 | high | S | uAgents Python runtime refuses to register on schema-break-without-version-bump | py |
| C5-T4 | high | M | MCP serve exposes each skill as a `tools/list` entry; tool invocation runs body | mcp |
| C5-T5 | med | S | `activate_skill` returns wrapped content + resource enumeration | mcp |
| C5-T6 | high | S | SDK schema accepts new fields; `client.publish()` enforces version-digest match | sdk |
| C5-T7 | med | S | `price: 0.02` sugar expands to `accepts: [{...USD}]` row | sdk |
| C5-T8 | low | S | scaffold tools (`oneie agent new`) emit current schema | cli |

**Exit scalar:** Reference agent `examples/research-assistant` (with three skills) runs in all three runtimes (chat, MCP, uAgents Python) from the same source markdown. **Same prompt, same response (within model variance), three transports.**

**Rubric target:** security ≥ 0.88 / stability ≥ 0.88 / simplicity ≥ 0.85 / speed ≥ 0.80.
Token target: MCP `serve` adds prompt-cache headers to every tool response; Python runtime reports tokens_used per invocation.

---

## Cycle 6 — CLI surface

**Goal:** `oneie` is a complete, ergonomic command-line tool with every verb in the spec, every output a numeric receipt, every command works offline (where possible) or with the substrate.

**Classifier:** `mode: lean` · `lifecycle: construction`.

**Depends on:** C1, C2, C3, C5.

**Verbs:**

| Verb | Purpose |
|------|---------|
| `oneie auth login / logout` | Provision API key (OAuth or paste) → `~/.config/oneie/key` |
| `oneie agent new <name>` | Scaffold from template; pick profile (core / commerce / asi) |
| `oneie agent validate <path>` | Zod + cross-link checks |
| `oneie agent lint <path>` | Style + spec rules (delegates to agent-spec-prompt.md checklist) |
| `oneie agent compile <path> --target <t>` | mcp · uagents · skillmd · a2a · erc8004 |
| `oneie agent serve <path>` | Local A2A + MCP server on port 8000 |
| `oneie agent publish <path>` | Sync to substrate; submit to registries based on `discovery` |
| `oneie agent sign <path>` | Sigstore keyless |
| `oneie agent verify <path-or-url>` | Check signatures + digests |
| `oneie agent eval <path>` | Run evals; print benchmark; gate on rubric |
| `oneie agent diff <a> <b>` | Semantic diff |
| `oneie skill new / emit / publish / refresh / import` | per spec |
| `oneie run <path>` | Python runtime entry (delegates to `oneie-py`) |
| `oneie deploy` | (legacy) self-hosted Worker deploy |

**Files (one per subcommand group, not one per verb):**

| File | Purpose | Budget |
|------|---------|--------|
| `cli/src/index.ts` | Commander entry; subcommand registry | 40 |
| `cli/src/agent.ts` | All agent verbs (new, validate, lint, compile, serve, publish, sign, verify, eval, diff) | 180 |
| `cli/src/skill.ts` | All skill verbs (new, emit, publish, refresh, import, eval) | 100 |
| `cli/src/auth.ts` | Login/logout, token storage at `~/.config/oneie/key` | 40 |
| `cli/src/templates/{core,commerce,asi}.md` | 3 scaffold profiles | 60 |

**7 files, ~420 lines** (down from ~24 files / ~565 lines).

**Tasks:**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C6-T1 | high | M | every verb prints `{ ok: true, … numeric receipts }` JSON in `--json` mode | cli |
| C6-T2 | high | S | exit codes distinct per failure type, documented in `--help` | cli |
| C6-T3 | high | S | scaffold templates pass `oneie agent validate` immediately | cli |
| C6-T4 | med | S | tab completion for bash/zsh | cli |
| C6-T5 | med | S | `oneie auth login` flow stores key with `0600` permissions | cli |

**Exit scalar:** All 14 verbs run on the reference agent and produce structured JSON when `--json` is passed. **Verb count × success = 14/14.**

**Rubric target:** security ≥ 0.88 / stability ≥ 0.88 / simplicity ≥ 0.88 / speed ≥ 0.82.
Token target: CLI startup ≤ 200ms (cold); every `--json` output ≤ 500 tokens of structured data.

---

## Cycle 7 — Polish

**Goal:** Custom slugs, wildcard subdomains, image uploads, conflict detection on writes — the cycle-3 polish list from `modify.md`.

**Classifier:** `mode: full` (subdomain DNS work has unknowns) · `lifecycle: construction`.

**Depends on:** C1, C4 (artifacts at the new URL shape).

**Files (absorbs C1-deferred items):**

| File | Purpose | Budget |
|------|---------|--------|
| `web/migrations/0002_owner_extras.sql` | Add `wallet`, `agentverse_key_enc` to `owners` | 5 |
| `web/src/pages/u/[slug]/settings.astro` | Manage wallet + agentverse key (passkey-derived encryption) | 30 |
| `web/migrations/0003_owners_keys.sql` | `owners_keys(slug, pubkey, label, registered_at)` for multi-device | 6 |
| `web/src/pages/api/recover.ts` | Magic-link enrolment endpoint | 35 |
| (subdomain / custom-slug / image-upload tasks below) | per task table | per file |

**Tasks (high level — full plan when scheduled):**

| id | value | effort | exit | tags |
|----|-------|--------|------|------|
| C7-T1 | high | M | wildcard `*.one.ie` → shared Worker; per-slug TLS via CF | dns |
| C7-T2 | high | M | custom slug claim via x402 micropayment ($1, refundable) | commerce |
| C7-T3 | med | M | image upload tool: write to `<slug>/media/<sha>.<ext>`, returns CDN URL | media |
| C7-T4 | med | S | sha-mismatch on commit → chat surfaces conflict | reliability |
| C7-T5 | low | S | `delete` flow via `write({ content: null })` + R2-versioning revert UI | ux |
| C7-T6 | med | S | Settings page (wallet + agentverse key) — deferred from C1 | ui |
| C7-T7 | med | S | Multi-key per slug + magic-link recovery — deferred from C1 | recovery |

**Exit scalar:** `https://alice.one.ie` resolves to alice's site. Custom slug claim flow accepts payment and provisions the redirect. **One paid claim, one resolved subdomain, one image rendered in a post.**

**Rubric target:** security ≥ 0.90 / stability ≥ 0.85 / simplicity ≥ 0.85 / speed ≥ 0.82.
Token target: subdomain routing adds zero LLM calls; image upload tool body ≤ 40 lines.

---

## Integration test (final acceptance)

The end-to-end test that proves the system as a whole. **All seven cycles must pass before this runs.**

```
1. PROVISION
   Visitor visits one.ie/get-yours, signs Touch ID, gets /u/<random-slug>/chat.
   Round-trip < 2s.

2. AUTHOR
   Owner types: "create a customer-support agent that handles complaints
                 and refunds; price refunds at $0.05 USDC on Base."
   Model proposes 1 agent.md + 2 skills/. Owner signs each. R2 PUTs land.

3. PUBLISH
   Owner: "make this discoverable on agentskills and A2A."
   Runtime emits /.well-known/agent-card.json + /.well-known/did.json,
   pushes SKILL.md to agentskills.io directory format in R2 _emit/.

4. EVAL
   Owner: "evaluate the refund skill with these 3 test cases."
   Runtime runs with/without baseline; benchmark.json shows positive delta.
   Owner: "iterate until pass-rate >= 0.85."  → 3 iterations.

5. DISCOVER
   Third-party: opens Claude Code, types: "import https://one.ie/u/<slug>/skills/process-refund"
   Claude Code reads agentskills.io directory format. Skill loads cleanly.

6. EARN
   Visitor on the third-party's site triggers the imported skill.
   x402 quote fires; visitor signs micropayment; asset lands in owner's wallet.
   Owner sees the receipt in /u/<slug>/settings.

7. UPGRADE
   Owner edits the skill body; bumps version. Almanac re-registers.
   Old protocol digest deprecated; new digest active. No callers break.

8. EVOLVE
   ASI agent on Agentverse hires the same skill via uAgents Protocol.
   `oneie run` validates its inputSchema against the protocol digest and accepts.
```

**Pass = all 8 steps complete in one session, all writes signed, all payments verified, all artifacts resolve.**
**Token pass = prompt cache hit ≥ 80% across the session; no skill body > 300 lines; total session tokens ≤ baseline × 1.1.**

---

## Rubric targets (overall)

`composite = 0.35·security + 0.30·stability + 0.25·simplicity + 0.10·speed`

| Cycle | security | stability | simplicity | speed | composite | token target |
|-------|----------|-----------|------------|-------|-----------|--------------|
| C1    | 0.90 | 0.85 | 0.85 | 0.80 | 0.86 | cache ≥ 70% |
| C2    | 0.90 | 0.85 | 0.85 | 0.80 | 0.86 | tokens/run tracked |
| C2.5  | 0.90 | 0.90 | 0.90 | 0.85 | 0.90 | skill ≤ 300 lines |
| C3    | 0.90 | 0.88 | 0.88 | 0.80 | 0.88 | parse: 0 tokens/call |
| C4    | 0.92 | 0.88 | 0.88 | 0.78 | 0.89 | emitters: 0 LLM calls |
| C5    | 0.88 | 0.88 | 0.85 | 0.80 | 0.87 | cache headers on MCP |
| C6    | 0.88 | 0.88 | 0.88 | 0.82 | 0.88 | CLI ≤ 200ms cold |
| C7    | 0.90 | 0.85 | 0.85 | 0.82 | 0.87 | routing: 0 LLM calls |
| **Min** | **0.88** | **0.85** | **0.85** | **0.78** | **0.86** | |

**Gate:** any cycle below 0.65 on any dimension — escalate before merge. Cycle does not close.
**Velocity:** each cycle should score higher than the previous. Flat for 2 consecutive → diagnostic in W1.

---

## Inventory snapshot (what exists pre-implementation)

For W1 of each cycle. Confirms expected starting state before edits.

| Surface | Has | Lacks |
|---------|-----|-------|
| `sdk/src/client.ts` | `signal/ask/mark/warn`, `syncAgent`, `discover`, `hire`, `publish`, `pay.{accept,request,status}`, `compile-agent` (uagents+mcp targets) | `agentmd`/`summary`/`accepts[]` schema, eval API, A2A card emitter, lenient parser, import-remote, agentskills.io bidirectional |
| `mcp/src/index.ts` | 42 tools across substrate/lifecycle/commerce/discovery/observability/groups; wraps `@oneie/sdk` | local agent.md/skill.md parsing, MCP `serve` runtime, `activate_skill` tool, scaffold tools, directory watcher |
| `claw/src/middleware.ts` + `agents/builder.ts` | `ToolLoopAgent` factory, `substrateMiddleware` (auto mark/warn), `discover/remember/recall/highways/mark/warn` AI SDK tools, OpenRouter routing | agent.md frontmatter parser, skill.md disk loader, `?agent=` URL routing, output eval hooks, x402 payment gate |
| `web/src/pages/api/chat.ts` + `lib/agents.ts` | `parseAgentMd` + `AgentMeta`, build-time skill registry via `import.meta.glob`, KV starter cache, raw SSE Groq streaming | R2/D1 bindings, `?agent=` URL load, `write` tool returning `pending`, `/api/commit`, x402 gate, `/u/<slug>/settings`, eval tool |

---

## See Also

- [`agent-spec.md`](agent-spec.md) — the spec itself
- [`agent-spec-prompt.md`](agent-spec-prompt.md) — conversion + best practices
- [`modify.md`](modify.md) — chat-driven mutation foundation
- [`adl-integration.md`](adl-integration.md) — `ui:*` receiver contract
- [`patterns.md`](patterns.md) — closed loop, deterministic sandwich
- [`rubrics.md`](rubrics.md) — scoring framework
- [`template-todo.md`](template-todo.md) — dashboard view this plan feeds when active

---

## Total budget after the trim

| Cycle | Files | Lines |
|-------|------:|------:|
| C1 Foundation | 13 | ~317 |
| C2 Eval | 6 | ~240 |
| C2.5 Skill creator | 7 | ~655 |
| C3 Bidirectional | 5 | ~165 |
| C4 Artifacts | 7 | ~170 |
| C5 Runtimes | 10 | ~385 |
| C6 CLI | 7 | ~420 |
| C7 Polish | varies | ~75 + subdomain work |
| **Total** | **~55** | **~2,425** |

Down from ~86 files / ~3,425 lines pre-trim. **30% fewer lines, 36% fewer files** for the same feature surface. Two principles drove the cuts: *files migrate to the cycle that owns them* (no premature SDK/CLI wiring in feature cycles) and *don't port what already exists* (skill-creator's bundled scripts are duplicates of C2's eval lib).

---

*Seven cycles. One spec. One Worker. Many runtimes. Adopt the outputs, not the schema. Every write signed. Every skill measured. Every artifact resolves. The smallest implementation that delivers it all.*
