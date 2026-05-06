# Agent Spec

Three concepts. One language. Write markdown, deploy everywhere.

---

## The Three Concepts

```
agent    who they are and how they think
skill    what they offer to the world
tool     what they reach for to get things done
```

Each is a markdown file. YAML at the top defines the interface. Markdown below defines the mind. The split is intentional: machines read the YAML, humans write the markdown.

---

## One rule (covers most fields)

**Any natural-language string in YAML is an LLM call against `agent.model`, evaluated at runtime.** This applies to `intervals[].task`, `endpoints[].request`, `endpoints[].response`, `startup`, `shutdown`, and any future field of that shape. The agent's body is the system prompt; the field's text is the user message; the result is the field's value.

One rule, no per-field compilation logic. The English you write is the prompt that runs.

**Skill selection is automatic.** Each skill's `when_to_use` is auto-injected into the agent's system prompt as a routing line:

```
## Available skills
- handle-complaint  ($0.02)  When a user describes a problem with an order…
- escalate          (free)   When a user is angry or beyond your scope.
```

The LLM then calls skills as tool calls. No manual wiring.

**Identity is namespaced.** If `seed` is omitted (the default), the runtime derives it as `${owner}:${agent.name}`. Two users can both have an agent called `support` without colliding in the Almanac.

---

## Agent

An agent is a persona. It has a name, a voice, and a set of skills it offers.

**Minimum viable agent:**

```yaml
---
name: support
---

You are a helpful support agent.
```

**Typical agent:**

```yaml
---
agentmd: "0.1"
name: support
title: Customer Support
model: anthropic/claude-haiku-4-5
summary: Here to help you solve problems quickly.
description: Use when a user reports a problem with an order, product, or service.
starters:
  - My order hasn't arrived
  - I need a refund
skills: [handle-complaint, escalate]
tools: [crawl]
---

You are a Customer Support agent...
```

**The body is the system prompt.** Write it as you'd write any markdown document.
Use headings (`## Role`, `## Tone`, `## Boundaries`) to structure the agent's mind.
The headings are convention, not schema — write whatever serves the agent.

### Agent fields

| Field | Type | Default | Notes |
|---|---|---|---|
| `agentmd` | string | `"0.1"` | schema version stamp — required at top of every agent file |
| `name` | string | — | slug — URL param `?agent=name` and uAgents identity |
| `title` | string | capitalized name | display name |
| `version` | string | `1.0.0` | semver — also uAgents Protocol version |
| `model` | string | claude-haiku-4-5 | OpenRouter model ID |
| `summary` | string | — | ≤200 chars — human-facing tagline shown in greeting / cards / discovery |
| `description` | string | — | ≤1024 chars — model-facing routing trigger; *"Use when…"* phrasing |
| `starters` | string[] | — | prompt chips before first message |
| `skills` | string[] | — | refs to `skills/*.md` e.g. `[handle-complaint]` |
| `tools` | string[] | all | tool whitelist; refs use `name` (platform), `@scope/server#tool` (MCP-imported), or `./tools/<file>` (custom). Omit = all platform tools, `[]` = none |
| `channels` | string[] | `[web]` | web, telegram, discord |
| `sensitivity` | 0–1 | `0.5` | 0 = public, 1 = private |
| `group` | string | `default` | org/group scope |
| `wallet` | string | — | Sui/EVM address for payments |
| `lifecycle` | string | `active` | active, deprecated, retired |
| **uAgents** | | | |
| `seed` | string | — | deterministic identity seed → `agent.address` |
| `port` | number | `8000` | HTTP port for P2P |
| `agentverse` | string | — | Agentverse URL or `true` for default |
| `mailbox` | boolean | `false` | receive messages via Agentverse mailbox |
| `startup` | string | — | LLM instruction run on startup |
| `shutdown` | string | — | LLM instruction run on shutdown |
| `intervals` | Interval[] | — | periodic tasks (see below) |
| `endpoints` | Endpoint[] | — | REST handlers (see below) |
| `bureau` | string[] | — | sibling agents to run together in one process |

**Interval:**
```yaml
intervals:
  - period: 300          # seconds between ticks
    task: Check the queue for unresolved tickets and summarise them.
```

**Endpoint:**
```yaml
endpoints:
  - method: GET
    path: /status
    response: Return current agent health and uptime.
  - method: POST
    path: /intake
    request: A new complaint with a text field.
    response: Acknowledge receipt and return a ticket ID.
```

---

## Skill

A skill is a callable capability with a price. It lives in `skills/`.
Agents reference skills by name. Many agents can share one skill.

**Minimum viable skill:**

```yaml
---
name: handle-complaint
price: 0.02
tags: [support]
---

Resolve customer complaints end-to-end.
```

`price: 0.02` is sugar for `accepts: [{ scheme: exact, network: usd, max: "0.02" }]`. Use the structured form when you want multi-chain payments.

**Full skill:**

```yaml
---
name: handle-complaint
title: Handle Customer Complaint
summary: Receive and resolve a customer complaint end-to-end.
description: Use when a user describes a problem with an order, product, or service.
tags: [support, customer-service]
trigger: semantic                 # semantic | always | glob | manual
applyTo: ["**/*"]                 # glob filter (only when trigger=glob)
accepts:
  - scheme: exact
    network: "eip155:8453"        # Base
    asset:   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC
    max:     "0.02"               # USD-denominated; runtime quotes at call
  - scheme: exact
    network: sui:mainnet
    asset:   "0x2::sui::SUI"
    max:     "0.02"
inputSchema:
  type: object
  required: [complaint]
  properties:
    complaint: { type: string }
    orderId:   { type: string }
outputSchema:
  type: object
  properties:
    resolution: { type: string }
    escalated:  { type: boolean }
---

Listen carefully. Summarise the complaint back before proposing anything.
```

`inputSchema` and `outputSchema` are optional. Add them when the skill is sold in the marketplace or compiled to uAgents/MCP — they become the typed protocol interface.

### Skill fields

| Field | Type | Notes |
|---|---|---|
| `name` | string | slug — must match filename stem |
| `title` | string | display name (default: capitalized name) |
| `summary` | string | ≤200 chars — human-facing tagline |
| `description` | string | ≤1024 chars — *"Use when…"* routing trigger |
| `price` | number | USD shorthand → expanded to a one-row `accepts[]` |
| `accepts` | Accept[] | structured x402 payment options; one row per (network, asset). Wins over `price` if both present |
| `trigger` | enum | `semantic` (description match — default), `always`, `glob` (use `applyTo`), `manual` |
| `applyTo` | string[] | glob filter when `trigger=glob`, e.g. `["**/*.tsx"]` |
| `tags` | string[] | marketplace discovery tags |
| `when_to_use` | string | SKILL.md compat alias for `description` |
| `triggers` | string \| string[] | compat alias — appended to `description` for catalog injection (used by qodo-style skills) |
| `homepage` | string | OpenClaw passthrough — surfaced in UI as "Website" |
| `user-invocable` | boolean | OpenClaw passthrough — when `false`, skill is hidden from slash-command list (default `true`) |
| `disable-model-invocation` | boolean | OpenClaw passthrough — excludes from agent prompt; explicit `/skill` invoke still works |
| `command-dispatch` | enum | OpenClaw passthrough — `"tool"` bypasses the model and dispatches directly |
| `command-tool` | string | OpenClaw passthrough — tool name to invoke when `command-dispatch=tool` |
| `command-arg-mode` | enum | OpenClaw passthrough — `"raw"` forwards the raw argument string |
| `metadata` | object | OpenClaw passthrough — single-line JSON for gating, requirements, configuration |
| `inputSchema` | JSON Schema | MCP + uAgents compatible |
| `outputSchema` | JSON Schema | MCP + uAgents compatible |
| `version` | string | semver — changing schemas without bumping is rejected by `client.publish()` |
| `license` | string | SPDX expression or reference to a `LICENSE` file in the skill bundle |
| `compatibility` | string | ≤500 chars — environment requirements (runtimes, network access, system packages) |
| `scripts` | string[] | optional executable bundle: `['./extract.py', './validate.sh']`. On `oneie skill emit` they land in `scripts/` |
| `references` | string[] | optional docs loaded on demand: `['./api-errors.md']`. Land in `references/` |
| `assets` | string[] | optional templates/images: `['./report-template.md']`. Land in `assets/` |
| `evals` | Eval[] | inline test cases (alternative to `evals/evals.json` file). One row per test case. See *Skill output evaluation* below |

**Body length:** keep it under 500 lines / ~5000 tokens. The body loads in full when the skill activates, so every token competes with conversation history. Move detailed reference material into `references/` files and tell the agent *when* to load each one ("Read `references/api-errors.md` if the API returns a non-200 status").

**Currency is always USD.** On-chain payments quote the live rate at call time via x402; the rate freezes for the 60s payment window. Wallet (Sui/EVM) is on the agent, not the skill — one wallet per agent receives all skill revenue.

**Directory format on emit.** Source skills are flat (`skills/handle-complaint.md`); `oneie skill emit` produces the agentskills.io directory layout (`handle-complaint/SKILL.md` + `scripts/` + `references/` + `assets/`) for compatibility with Claude Code, Cursor, and any tool that reads the format.

---

## Tool

Tools are platform services the agent reaches for during execution.
They are not defined in markdown — they are implemented once and referenced by name.

**Reference in an agent:**

```yaml
tools: [crawl, image]        # only these two
tools: []                    # no tools
# omit entirely              # all platform tools available
```

**Built-in platform tools:**

| Name | What it does |
|---|---|
| `crawl` | Fetch a URL, return markdown (Cloudflare Browser Rendering) |
| `image` | Generate an image from a text prompt (CF Workers AI) |
| `search` | Web search *(roadmap)* |
| `email` | Send transactional email via Resend *(roadmap)* |
| `memory` | Read/write from agent KV store *(roadmap)* |

**Custom tools** are TypeScript files in `tools/`. They are bundled into the Worker at build time (Workers cannot import code at runtime) and registered by filename. Once bundled, they're whitelisted by name exactly like platform tools.

Hosts that share a single Worker across multiple users cannot accept user code at runtime, so only platform tools are available there. Custom tools are an SDK-mode feature — deploy your own Worker via `npx oneie deploy` and the `tools/` folder is bundled at build time.

---

## Folder Structure

Skills work in **two layouts**. The runtime accepts either; the emitter produces the directory layout for cross-client compatibility.

```
project/
├── agent.md
├── agents/
│   ├── support.md
│   └── sales.md
├── skills/                          # ← either layout works
│   ├── handle-complaint.md          # ← flat (native, R2-friendly)
│   └── qualify-lead/                # ← directory (agentskills.io)
│       ├── SKILL.md
│       ├── scripts/
│       │   └── score.py
│       └── references/
│           └── playbook.md
└── tools/
    └── lookup-order.ts
```

**Discovery paths** (SDK / self-hosted runtimes scan all of these in order; first-found wins within scope):

| Scope | Path | Notes |
| --- | --- | --- |
| Project | `<project>/skills/` | Native ONE location |
| Project | `<project>/.agents/skills/` | Cross-client convention — your skills are visible to Claude Code, Cursor, etc. |
| Project | `<project>/.claude/skills/` | Pragmatic compat — many existing skills live here |
| Project | `<project>/.openclaw/skills/` | OpenClaw compat |
| User | `~/.agents/skills/` | Cross-client user-level |
| User | `~/.claude/skills/` | Compat |
| User | `~/.openclaw/skills/` | OpenClaw user-level |
| Bundled | `@oneie/sdk/built-in-skills/` | Skills shipped with the SDK |

**Grouping.** A folder under any of the above may itself contain `<group>/<skill>/SKILL.md` (one nesting level — OpenClaw convention). Discovery walks recursively; pathStem is always the immediate parent of `SKILL.md`.

**Chat-built sandboxes** (`/u/<slug>`) skip filesystem discovery — the only source is R2 at `<slug>/skills/`. Importing a third-party skill is a chat command:

```
user: "import the pdf-processing skill from agentskills.io"
  ↓
model calls write({ slug, file: 'skills/pdf-processing', content: <fetched & validated> })
  ↓
preview → owner approves (auth per runtime — passkey in chat sandbox) → write lands
  ↓
skill is now part of Alice's site, behaves like any native skill
```

The `crawl` tool fetches the remote `SKILL.md`, the runtime parses it leniently (see below), the `write` tool stores it. One signed write = one new skill.

Drop a file in the right folder. It's live on the next deploy.

---

## Bidirectional compatibility with agentskills.io

We **emit** the agentskills.io directory format and we **read** it. Skills authored for Claude Code, Cursor, nanoclaw, or any agentskills.io-compliant client work in our runtimes without conversion. Our skills work in theirs without conversion. One spec, two directions.

**Verified compatibility** (sampled corpora, `oneie skill validate`):

| Source | Total | Strict pass | Recovered | Compatible |
| --- | ---: | ---: | ---: | ---: |
| nanoclaw — `qwibitai/nanoclaw/.claude/skills/` | 47 | 46 | 1 (no-frontmatter fallback) | 47/47 |
| openclaw — `openclaw/openclaw/**/skills/` | 33 | 33 | 0 | 33/33 |
| **Combined** | **80** | **79** | **1** | **80/80** |

Non-spec frontmatter keys observed across both corpora: `triggers` (aliased into description), `version` (native), `allowed-tools` (native), `user-invocable`, `metadata` (OpenClaw passthrough — see field table). No proprietary key broke loading.

### Parse: lenient by default

Skills are authored across many clients with slightly different YAML interpretations. The runtime is forgiving:

| Issue | Handling |
| --- | --- |
| Unquoted `:` in description (`description: Use this skill when: ...`) | Auto-quote retry, then accept |
| `name` doesn't match parent directory | Warn, load anyway |
| `name` exceeds 64 chars | Warn, load anyway |
| Missing frontmatter entirely | Derive `name` from path stem and `description` from the first paragraph of the body; flag via `oneie skill validate` |
| Missing `description` only | Use first paragraph of body if present, else skip with diagnostic |
| `triggers` field present | Append to `description` for catalog injection |
| Unparseable YAML | Skip, log diagnostic |
| Unknown frontmatter fields | Pass through to `metadata` (preserve, don't fail) |

Diagnostics are surfaced via `oneie skill validate` and `/u/<slug>/settings`, never silently dropped.

### Disclose: progressive, three tiers

This is how the runtime exposes skills to the LLM, matching the agentskills.io progressive-disclosure model:

| Tier | What's loaded | When | Cost |
| --- | --- | --- | --- |
| **Catalog** | `name` + `description` | At chat start (system prompt block) | ~50-100 tokens/skill |
| **Body** | Full `SKILL.md` body | When the LLM invokes the skill | ≤5000 tokens/skill |
| **Resources** | `scripts/`, `references/`, `assets/` | When the body references them by path | Per-file |

Catalog block injected into the agent's system prompt:

```
<available_skills>
  <skill name="handle-complaint">
    Use when a user describes a problem with an order, product, or service.
    ($0.02)
  </skill>
  <skill name="pdf-processing">
    Extract PDF text, fill forms, merge files. Use when handling PDFs.
  </skill>
</available_skills>
```

20 skills installed = ~1500 tokens upfront. Only the bodies of skills the LLM actually picks load into context.

### Activate: two paths, both supported

**File-read activation** — the LLM calls its standard read tool against the skill's path. Works when the model has filesystem access (SDK mode, MCP server runtime).

**Dedicated tool activation** (`activate_skill`) — used in the chat surface where the LLM doesn't read files directly:

```ts
activate_skill({ name: 'pdf-processing' })
  → returns wrapped body:
    <skill_content name="pdf-processing">
      [body markdown]
      Skill directory: <slug>/skills/pdf-processing
      <skill_resources>
        <file>scripts/extract.py</file>
        <file>references/spec-summary.md</file>
      </skill_resources>
    </skill_content>
```

The wrapping enables (a) clear identification during context compaction, (b) resource enumeration without eager loading, (c) absolute-path resolution for relative references in the body.

When the LLM is constrained to a skill enum, it can't hallucinate skill names. When no skills exist, the activation tool isn't registered at all (avoids confusing the model with an empty surface).

### Manage context: protect skill content from compaction

Skill bodies are durable behavioral guidance. Losing them mid-conversation silently degrades the agent. Two rules:

1. **Tool outputs from `activate_skill` are flagged `protected: true`** — context-pruning algorithms skip them.
2. **Activations are deduplicated** — re-asking for an already-loaded skill returns a cached pointer ("skill `X` is already in context"), not a re-injection.

### Permission allowlisting

When an agent has a permission system (e.g. tool-call confirmation prompts), skill directories are **automatically allowlisted**. Otherwise every reference to a bundled `scripts/extract.py` triggers a permission dialog and breaks the flow. The skill is the trust boundary, not each file inside it.

### Imports and remote skills

Skills can be referenced by URL or package ID, fetched and cached at runtime:

```yaml
# in agent.md
skills:
  - handle-complaint                                  # local
  - https://agentskills.io/skill/pdf-processing       # remote URL (fetched, cached, signed)
  - npm:@example/skill-pack/web-search                # npm package
  - github:owner/repo/skills/data-analysis@v1.2       # github
```

The fetcher follows the agentskills.io discovery convention (look for `SKILL.md` at the root of the resolved path or `<name>/SKILL.md` for directory-format), validates leniently, and caches under `<slug>/skills/_remote/<hash>/`. Imports refresh on `oneie skill refresh`.

### Trust gating for project-level skills

Skills loaded from a freshly cloned, untrusted repo could inject hostile instructions. SDK runtimes gate project-level skill loading on a trust check — `oneie trust <path>` marks a project trusted and persists the decision. Chat-built sandboxes are always trusted (the owner *is* the project). Imports via URL/npm/github prompt for confirmation on first use and remember the answer. `skill-creator` is auto-imported into every new sandbox at `<slug>/skills/skill-creator/` during provision — it's available in the owner's first conversation.

---

## Skill output evaluation (the second eval)

Triggering correctness only tells you the skill *activates*. Output evaluation tells you it *works*. Together they're the two halves of skill quality. Both run from the same place (`oneie skill eval <skill>`); both produce numeric receipts.

### Test cases live in the skill, in one of two places

```yaml
# Inline in frontmatter (works for flat or directory skills)
evals:
  - id: top-months-chart
    prompt: |
      I have a CSV of monthly sales in data/sales_2025.csv.
      Find the top 3 months by revenue and make a bar chart.
    expected: A bar chart image showing the top 3 months by revenue with labeled axes.
    files:    [evals/files/sales_2025.csv]
    assertions:
      - The output includes a bar chart image file
      - The chart shows exactly 3 months
      - Both axes are labeled
      - The chart title or caption mentions revenue
```

Or as a sidecar file inside a directory-format skill, matching agentskills.io exactly:

```
csv-analyzer/
├── SKILL.md
└── evals/
    ├── evals.json          # same shape as inline `evals:`
    └── files/
        └── sales_2025.csv
```

The runtime accepts either; flat-source emits to the sidecar form alongside the directory layout.

### How the loop runs

```
              ┌──────────────────┐
              │  oneie skill eval │
              └────────┬─────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
   with_skill run               without_skill run     (per test case)
   fresh context                 fresh context        (no leaked state)
   load skill body               no skill loaded
   produce outputs               produce outputs
         │                           │
         ▼                           ▼
   grade assertions             grade assertions
   record evidence              record evidence
         └─────────────┬─────────────┘
                       ▼
              aggregate → benchmark.json
              { pass_rate, time, tokens, delta }
                       │
                       ▼
              human review → feedback.json
                       │
                       ▼
              iterate → next iteration-N/
```

Every test case runs **with the skill** and **without it**. The delta tells you what the skill earns. A skill that lifts pass rate 50 points at 2× the tokens is worth it; one that doubles tokens for a 2-point lift isn't.

### Workspace layout (mirrors agentskills.io)

For SDK / local runtimes:
```
csv-analyzer/                      ← source
csv-analyzer-workspace/            ← results, never committed
└── iteration-1/
    ├── eval-top-months-chart/
    │   ├── with_skill/    {outputs/, timing.json, grading.json}
    │   └── without_skill/ {outputs/, timing.json, grading.json}
    └── benchmark.json
```

For chat-built sandboxes the workspace lives at `<slug>/skills/_workspace/<skill>/iteration-N/` in R2. Same shape; the runtime cleans iterations beyond the latest 5 unless pinned.

### What the runtime captures

| File | What it holds | Who writes it |
| --- | --- | --- |
| `outputs/` | Files the run produced | Agent (during execution) |
| `timing.json` | `{ total_tokens, duration_ms }` | Runtime |
| `grading.json` | `{ assertion_results: [{text, passed, evidence}], summary }` | LLM judge or verification scripts (configured per assertion) |
| `benchmark.json` | Aggregated `{ pass_rate, time, tokens, delta }` per configuration | Runtime |
| `feedback.json` | `{ <eval-id>: "actionable feedback" }` (empty string = LGTM) | Human reviewer |

### Assertion rules

| Good | Bad |
| --- | --- |
| Programmatically verifiable (`output is valid JSON`) | Vague (`output is good`) |
| Specific and observable (`bar chart has labeled axes`) | Brittle (`output uses exactly the phrase 'Total: $X'`) |
| Countable (`includes ≥3 recommendations`) | Tautological (`output exists`) |

Mechanical checks (file exists, valid JSON, row count) are graded by **scripts** — deterministic, reusable across iterations. Soft checks (well-organized, on-tone) are graded by an **LLM judge** with the assertion + outputs in context. Both produce the same `grading.json` shape.

For comparing skill versions, the runtime supports **blind A/B**: present both outputs to the judge without revealing which is which, score holistic qualities. Catches differences assertions miss.

### Pattern analysis (what to look at after an iteration)

The benchmark is the headline; the patterns are where the work is:

- **Always passes in both** → assertion is too easy, drop or replace
- **Always fails in both** → assertion is broken or test is too hard, fix before next round
- **Passes with skill, fails without** → exactly where the skill is earning its keep
- **High variance across runs** (`stddev`) → instructions are ambiguous; tighten with examples or remove flexibility
- **Token outliers** → read the execution transcript for that run; the bottleneck is usually one ambiguous step

### Iteration is the product

```
1. Read failed assertions + human feedback + execution transcripts
2. Hand all three to an LLM with the current SKILL.md, ask for edits
3. Apply the edits (model proposes → owner approves through the runtime's auth flow → write lands)
4. Rerun eval into iteration-<N+1>/
5. Compare benchmark deltas
6. Stop when feedback runs empty or improvements plateau
```

In a chat-driven host this is one loop: each round is a `write` proposal carrying the model's diff, one owner approval triggers the write, the next `eval` tool call produces the new benchmark. Pass rate climbs across iterations as one continuous chat. The auth flow that gates the write is the host's concern, not the format's.

### A new chat tool

Add `eval` to the read-only side of the chat tool surface:

```ts
eval({ skill: string, iteration?: number })
  // runs with/without baseline, grades, aggregates
  // returns { iteration, benchmark, failures, suggestions } for chat display
```

Read-only — no signature needed. Outputs land in R2 metadata; the chat shows the benchmark inline. The owner never leaves the conversation to see how their skill is doing.

---

## Runtimes (not compilers)

The same markdown runs in four different runtimes. **Three of them load the markdown at runtime — no codegen, no generated files to maintain.** Only `skillmd` emits files, because Claude Code reads from disk.

```
agent.md + skills/*.md
       │
       ├──→ ONE substrate    @oneie/sdk         JS runtime, TypeDB unit + pheromone
       ├──→ MCP server       @oneie/mcp         JS runtime, JSON-RPC over stdio/HTTP
       ├──→ uAgents          oneie-py           Python runtime, dynamic Pydantic from inputSchema
       └──→ SKILL.md         oneie skill emit   files on disk for Claude Code
```

The frontmatter is the contract; the runtimes are thin loaders. None generates source code.

### ONE substrate

```typescript
import { SubstrateClient } from '@oneie/sdk'

const client = SubstrateClient.fromApiKey(process.env.ONE_API_KEY)
await client.syncAgent('agents/support.md')
// → registers TypeDB unit + skill capabilities; chat target is built-in
```

The chat surface (`useChat` + `streamText`) **is** the AI SDK target — there's nothing separate to compile. The Worker reads the markdown, builds the system prompt, runs the model.

### MCP

```bash
npx @oneie/mcp serve agents/support.md
# stdio transport for Claude Desktop / Cursor
```

```typescript
import { mcpServer } from '@oneie/mcp'
const server = mcpServer({ agent: 'agents/support.md', skills: 'skills/' })
server.start()  // listens on stdio or HTTP
```

The runtime exposes each skill as a `tools/list` entry; `inputSchema` is the JSON Schema verbatim. Tool invocation runs the skill body as the system prompt against `agent.model`.

### uAgents (Python)

```bash
pip install oneie
oneie run agents/support.md
```

```python
from oneie import Agent
support = Agent.from_markdown('agents/support.md', skills='skills/')
support.run()
```

The Python runtime:
- Builds Pydantic models dynamically from each skill's `inputSchema` (`pydantic.create_model`).
- Registers each skill as a uAgents `Protocol`; the digest derives from the schema.
- Routes through OpenRouter using the `model` field — same model the chat uses, no provider drift.
- Emits the protocol manifest to the Almanac on `mailbox: true`.

If `inputSchema` changes without bumping `version`, the runtime refuses to register and prints the digest delta.

### Connect to Agentverse (in four lines)

```yaml
---
name: support
mailbox: true
agentverse: https://agentverse.ai   # or `true` for the default
---
```

Plus the API key, set once per host:

```bash
export AGENTVERSE_API_KEY=...        # from agentverse.ai → settings → API keys
oneie run agents/support.md
```

That's it. The runtime opens the mailbox, registers each skill's protocol in the Almanac, publishes the manifest, and refuses to re-register on schema break without a `version` bump. To go offline cleanly: `lifecycle: retired` → next run unregisters.

**Endpoint override.** `agentverse:` accepts any URL — useful for self-hosted or staging Almanacs. `true` is sugar for the production endpoint.

**Two paths for the API key:**

| Path | Where the key lives | When to use |
| --- | --- | --- |
| **SDK / self-hosted** | `AGENTVERSE_API_KEY` env on your host (`wrangler.toml` for Workers, `.env` for Python) | You run your own Worker / Python process |
| **Chat-built sandbox** (`/u/<slug>`) | `/u/<slug>/settings` — paste once, stored encrypted in D1 (`owners.agentverse_key_enc`) | You built your site through the chat — your account, your Agentverse |

Chat users default to **BYO key**: their agents register under their Agentverse account, their identity, their reputation. The platform never proxies. *Your agents, your Agentverse.*

---

### SKILL.md (the only target that emits files)

```bash
oneie skill emit skills/ --out ~/.claude/skills/
```

Each skill becomes a `.md` file in the Claude Code skills directory. Frontmatter is rewritten to SKILL.md's expected shape; body is verbatim.

---

## Artifacts (what the runtime emits when you opt in)

Set a field, get the artifact. Leave it unset, get nothing. The runtime is the producer; users never write these formats by hand.

| Set this | Runtime emits | Where it lands |
| --- | --- | --- |
| `discovery.agentCard: true` | A2A AgentCard JSON (v1.0) — built from `name`, `summary`, `description`, `skills`, `interface` | `/.well-known/agent-card.json` on the agent's host |
| `did: did:web:<host>:<name>` | DID document with the agent's pubkey | `/.well-known/did.json` |
| `ercAgent: { chainId, identityRegistry, agentId }` | ERC-8004 registration JSON + `register()` tx payload | `agent-registration.json` (IPFS or host); on-chain via `oneie publish --erc8004` |
| `mailbox: true` | uAgents Almanac registration + protocol manifests | Fetch.ai Almanac (auto, on `oneie run`) |
| `discovery.mcp: true` | MCP `server.json` for the public MCP Registry | `https://registry.modelcontextprotocol.io` via `oneie publish --mcp` |
| `trust.sign: keyless` | Sigstore Fulcio cert + Rekor entry | Bundle attached on next `oneie publish` |

The principle: **adopt the outputs, not the schema.** Users write our flat YAML; the runtime produces every standard's artifact when its hook is set. A2A clients discover us. ERC-8004 chains anchor us. The MCP registry lists us. Cost to the user: one boolean per artifact.

**Default:** every artifact is off. Chat-built sandboxes (`/u/<slug>`) get `discovery.agentCard: true` flipped on automatically — A2A compatibility is free for everyone, no setting required.

---

## Semantics (what each behavioral field actually does)

| Field | Reader | Effect |
| --- | --- | --- |
| `sensitivity: 1` | `discover()` | Excluded from search results (private) |
| `lifecycle: deprecated` | `discover()` | Excluded; existing callers continue to work |
| `lifecycle: retired` | runtime | New calls rejected; existing protocols unregistered from Almanac |
| `group: <name>` | `discover(skill, { group })` | Filters discovery to that group; default group is global |
| `agentverse: true` | uAgents runtime | Resolves to `https://agentverse.ai`; a string overrides |
| `bureau: [...]` | runtime | Cycle-detected at load — `A→B→A` errors before any agent starts |
| `seed` (omitted) | runtime | Defaults to `${owner}:${name}`; explicit seed overrides |
| `secrets` | runtime | Bound from platform env (`wrangler.toml` for Workers, `.env` for Python). Custom tools read via standard env APIs |
| `channels: [...]` | platform router | Each declared channel (`telegram`, `discord`, `web`) ingresses through `claw` and routes to this agent; omit or `[web]` = chat only. Wiring lives in `claw/`, not duplicated here |
| `ONE_API_KEY` | SDK | Issued at provision (`/get-yours` flow on `one.ie`) or via `oneie auth login`; stored in `~/.config/oneie/key` and exported as `ONE_API_KEY` |

These rules cover every field that's declared in the schema. No field is decorative.

### Write authentication is per-runtime

The format is auth-agnostic. There is no `passkey:` or `signature:` field in the schema, and the host's identity layer is **not part of this spec**. Each runtime authenticates writes its own way:

| Runtime | How writes are authenticated |
| --- | --- |
| Browser-hosted multi-tenant | Whatever the host chooses (typically passkey on an HMAC-bound challenge) — host docs, not this spec |
| SDK self-hosted (`npx oneie deploy`) | `ONE_API_KEY` env var (see *Semantics* table above) |
| MCP serve (stdio / streamable-http) | OS-level trust (Claude Desktop, Cursor); optional bearer token (per MCP transport) |
| uAgents Python (`oneie run`) | Seed-derived `agent.address` + Almanac registration (see *Runtimes — uAgents*) |
| agentskills.io import | Pinned version + trust gate on first use; read-only, no writes (see *Imports*) |

Whatever signs the bytes is upstream of the format. Read-only loaders (the chat catalog, the discovery index, the activation tool) need no auth at all.

---

## SDK

```typescript
import { SubstrateClient } from '@oneie/sdk'

const one = SubstrateClient.fromApiKey(apiKey)

// Sync
await one.syncAgent('agents/support.md')

// Discover agents by skill
const { agents } = await one.discover('handle-complaint')

// Hire
await one.hire(providerUid, 'handle-complaint', { initialMessage: '...' })

// Publish a skill
await one.publish({ skillId: 'handle-complaint', name: 'Handle Complaint', price: 0.02, tags: ['support'] })

// Close the loop
await one.mark(`${myUid}:${providerUid}`, { fit: 0.9, truth: 1.0 })
await one.warn(`${myUid}:${providerUid}`, { fit: 0.3 })

// Launch a token for the agent
import { launchToken } from '@oneie/sdk'
await launchToken(agentUid, { chain: 'sui' })
```

---

## CLI

```bash
# New agent or skill from template
npx oneie agent new support
npx oneie skill new handle-complaint

# Sync to ONE substrate
npx oneie agent sync agent.md
npx oneie agent sync agents/

# Run as a target (no codegen — runtime loads markdown)
oneie run agents/support.md                  # uAgents (Python)
npx @oneie/mcp serve agents/support.md       # MCP server
oneie skill emit skills/ --out ~/.claude/skills/   # SKILL.md (the only emitter)

# Publish skills to the marketplace
npx oneie skill publish skills/handle-complaint.md

# Deploy the web template
npx oneie deploy
```

---

## Design Decisions

**YAML frontmatter, markdown body.** YAML is the best human-writable structured format for configuration. Markdown is the best human-writable format for instructions. They compose perfectly: YAML defines the contract, markdown defines the behavior.

**Skills are separate files.** An agent is a persona; a skill is a capability. Personas come and go — skills accumulate. One skill can be offered by many agents and discovered by any buyer. Keeping them separate enables this economy.

**`skills: [name1, name2]`** — not a block of refs. The simplest reference is a name. When you need to go deeper (schema, pricing override), you already have the skill file. Don't pay the complexity cost until you need it.

**`tools: [name1]` is a whitelist, not a blacklist.** An agent should declare what it needs. Principle of least privilege — a support agent that can generate images is a surprise; one that explicitly enables `crawl` is an intention.

**The body compiles verbatim.** No transformation. The system prompt you write is exactly what reaches the LLM in every target. What you see is what runs.

**Runtime, not codegen.** Three of four targets load the markdown at runtime. No generated `.py` to debug, no version skew between source and emitted code, no escaping rules for triple quotes or backticks. The only emitted artifact is SKILL.md — because Claude Code expects files on disk, not because the format demands codegen. Less code, less drift, less to maintain.

**One rule for natural language.** Every English string in YAML (intervals, endpoints, startup, shutdown) runs as an LLM call against `agent.model`. No per-field compilation logic, no conditionals. The English is the prompt; the prompt is the program.

**Adopt the outputs, not the schema.** A2A AgentCard, ERC-8004 registration, DID document, MCP `server.json`, x402 multi-chain `accepts[]` — every ecosystem standard is reachable as a runtime artifact emitted from our flat frontmatter. Users keep one simple YAML; the runtime produces every artifact the open standards layer needs. We don't import their schemas — we *publish to them*.

**Bidirectional with agentskills.io.** We both emit and read the agentskills.io format. A user's skills travel between Claude Code, Cursor, and our runtimes without conversion. Importing a third-party skill is one signed `write` in the chat surface. Our skills are richer (pricing, schemas, multi-chain payment) but degrade gracefully — agentskills.io clients ignore our extras; ours adds value back.

---

## Status

All eight build cycles complete as of 2026-05-05. The system shipped end-to-end.

| Cycle | What shipped | Exit scalar | Rubric |
|-------|-------------|-------------|--------|
| C1 Foundation | Passkey provision/commit, R2 + D1, chat `write` tool, PreviewCard | Visitor signs, lands in `/u/<slug>/chat`, writes first page | 0.821 |
| C2 Eval | Runner, grader, benchmark loop, EvalCard, iterate tool | Skill pass rate 0.50 → 0.85 over 3 iterations | 0.821 |
| C2.5 Skill creator | Sub-agent grader/analyzer/comparator, `auto-import.ts`, `schemas.md` | Chat user runs end-to-end loop, ships skill ≥ 0.85 | 0.912 |
| C3 Bidirectional | Lenient SKILL.md parser, dir-format loader, import, emit, `skill/refresh` | Claude Code skill imports + runs unchanged | 0.912 |
| C4 Artifacts | A2A AgentCard v1.0, DID document, ERC-8004, MCP `server.json`, sigstore manifest | `agent-card.json` validates against A2A v1.0 schema | 0.910 |
| C5 Runtimes | Python uAgents package (`oneie run`), MCP `serveMd()`, SDK `AgentDefinitionSchema` + `AcceptSchema` | `oneie run agent.md` registers Almanac protocol | 0.889 |
| C6 CLI | `@oneie/cli` — 14 verbs across `agent`/`skill`/`auth` commands, templates inlined | 14 verbs all return numeric receipts in `--json` mode | 0.890 |
| C7 Polish | Custom domains (D1 + Astro middleware), settings page, HMAC magic-link recovery, binary media upload, SHA conflict gate on commit | `<slug>.one.ie` resolves; image in markdown post | 0.870 |

### What is live

- **`/api/provision`** — passkey registration, random slug, D1 insert
- **`/api/commit`** — HMAC + passkey assertion → R2 PUT; conflict gate (409 on SHA mismatch); `null` content = delete (R2 versioning preserves)
- **`/api/commit-media`** — base64 → Uint8Array → R2 with `httpMetadata`; SHA-256 immutable key
- **`/api/recover`** — HMAC-signed magic-link token, KV TTL 900s, one-time-use
- **`/api/settings`** — owner wallet + agentverse key (client-side encrypted before POST)
- **`/u/[slug]/.well-known/agent-card.json`** — A2A AgentCard v1.0 from `agent.md` frontmatter
- **`/u/[slug]/.well-known/did.json`** — DID document if `did:` field present
- **`/u/[slug]/media/[name]`** — immutable R2 serve, `cache-control: max-age=31536000`
- **Custom domains** — Astro middleware reads D1 `domains` table, rewrites host → `/u/<slug>`

### What is pending (integration tests, not code)

- Agentverse Almanac registration requires a live `AGENT_SECRET` seed — test in prod
- ERC-8004 on-chain tx requires a funded wallet — `oneie publish --erc8004` ready, tx not sent
- Sigstore Rekor bundle — `oneie publish` wired; Fulcio cert needs OIDC flow in CI
- Custom domain TXT verification — D1 schema and UI ready; CF API call for cert issuance not wired (v1 uses CF's automatic CNAME cert, owner adds CNAME only)

---

## See Also

- `dictionary.md` — canonical names and six verbs
- `dsl.md` — signal grammar
- `rubrics.md` — fit/form/truth/taste scoring
- `../sdk/src/client.ts` — full SubstrateClient (51 methods)
- `../claw/src/agents/builder.ts` — runtime wiring
- `../../apps/uagents/python/src/uagents/` — uAgents source
