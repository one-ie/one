# Convert and refine your agents to ONE spec

You are about to take a set of existing agent definitions — markdown files, system prompts, character cards, framework configs, scattered notes — and turn them into agents that comply with [`agent-spec.md`](agent-spec.md). Your job is not to translate mechanically. Your job is to **make these the best agents in the world**: sharp, narrow, discoverable, priced, signed, and ready to ship.

You will be given source material. Read the spec first. Apply the seven-step workflow below. Hold yourself to the quality bar at the end.

---

## What you're aiming at

```
                    a great agent
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
     SHARP            DISCOVERABLE       VALUABLE
   one job, well     LLM routes to it    priced for what
   said, in body     by description      it's worth
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    HONEST · COMPOSABLE
                guardrails, escalation,    bureau, peers,
                lifecycle, version          shared skills
```

Mediocre agents are vague generalists. Great agents are surgeons. They know exactly when they should be called, exactly what they will do, and exactly when to delegate or refuse.

---

## The seven-step conversion

### 1. Read the spec, then read the source

Open [`agent-spec.md`](agent-spec.md) end-to-end. Pay particular attention to:
- The **One rule** (natural-language fields are LLM calls at runtime)
- The **Three concepts** (agent / skill / tool — what belongs where)
- The **Artifacts** table (what flips on with each field)
- The **Semantics** table (what every field actually does)

Then inventory what the user has given you:
- Existing agent files (`character.json`, `agent.yaml`, system prompts in code, etc.)
- Existing skills or tools (custom or implied by the prompts)
- Existing pricing or business model
- Channels they use (web, Telegram, Discord)
- Whether they want chain-anchored identity (DID, ERC-8004)

If anything is unclear, **stop and ask**. Don't invent the user's pricing, don't guess their wallet address, don't fabricate identities. The list of when-to-ask is at the end of this doc.

### 2. Decompose: one agent → one persona → many sharp skills

The single biggest mistake in existing agent definitions is the **god-agent** — one persona that does everything. Split aggressively.

```
BEFORE                              AFTER
──────────────────────────          ────────────────────────────
agent.md (1 file)                   agent.md             (default)
  - sales lead qualification        agents/support.md    (existing customer)
  - customer support                agents/sales.md      (prospect)
  - billing inquiries               agents/billing.md    (invoice/refund)
  - technical troubleshooting       agents/tech.md       (debugging)
  - 4500-word system prompt         skills/qualify-lead.md
                                    skills/handle-complaint.md
                                    skills/lookup-invoice.md
                                    skills/diagnose-error.md
```

**Heuristic**: if you can name two distinct user-intents an agent serves, split it. Personas come and go; skills accumulate. One skill can be reused across many agents.

For each skill, ask: *"In one sentence starting with **Use when…**, when should the LLM router call this?"* If you can't answer in one sentence, the skill is too big.

### 3. Fill the schema (flat, never nested)

Frontmatter is flat. Use the exact fields from the spec — don't invent variants. The minimum viable agent is two fields; the typical one is ten. Anything more is suspicious.

| Field | Rule of thumb |
| --- | --- |
| `agentmd: "0.1"` | Always. First line of frontmatter. |
| `name` | `^[a-z][a-z0-9-]{0,62}$`. Match the filename. |
| `title` | Human-readable. Sentence case. |
| `model` | OpenRouter ID. `anthropic/claude-haiku-4-5` is a sensible default for general-purpose; bigger models for reasoning-heavy work. |
| `summary` | ≤200 chars. Tagline a stranger would understand. *"Here to help you solve problems quickly."* |
| `description` | ≤1024 chars. Starts with **"Use when…"** — this is what the LLM router reads to pick the agent. |
| `starters` | 3-5 prompt chips. Real user flows, not hypotheticals. |
| `skills` | 1-7 sharp skills. Reference by `name`. |
| `tools` | Whitelist. Principle of least privilege. Omit only if you mean "all platform tools." |
| `channels` | Default `[web]`. Add `telegram` / `discord` only if claw is wired for that channel. |
| `wallet` | Required if any skill is paid. Sui or EVM address. |

### 4. Price every skill structurally

Don't write `price: 0.02` on a serious skill. Write `accepts[]`. Multi-chain readiness is one structural change, never a refactor.

```yaml
accepts:
  - scheme: exact
    network: "eip155:8453"          # Base
    asset:   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"  # USDC
    max:     "0.02"
  - scheme: exact
    network: sui:mainnet
    asset:   "0x2::sui::SUI"
    max:     "0.02"
```

**Pricing heuristics:**
- Free skills (`price: 0` or no `accepts`): triage, escalation, navigation, "is this in scope?"
- $0.005-$0.05: single LLM call, fast, deterministic outputs.
- $0.10-$1.00: multi-step reasoning, tool calls, document processing.
- $1.00-$50.00: tasks requiring expensive context, search, multi-agent orchestration.
- > $50: human-in-the-loop, billed escalation; consider a quote-first flow instead.

**Test:** would you pay this for the value you'd get? If no, lower it. If you'd pay 10× more, raise it.

### 4.5 Start from real expertise, not generic prompts

The single biggest failure mode in agent creation is generating skills from an LLM's general knowledge ("handle errors appropriately," "follow best practices for authentication"). The result is vague, unhelpful, and indistinguishable from a thousand other skills.

**Three sources of real expertise — use whichever you have:**

| Source | What you're capturing |
| --- | --- |
| Hands-on task in conversation with an agent | The corrections you made, the edge cases you flagged, the libraries you preferred — extract these into the skill |
| Existing artifacts (runbooks, incident reports, code-review comments, version-control history) | Real schemas, real failure modes, real recovery procedures — *not* generic articles |
| Fresh execution traces of the draft skill | What the agent did wrong without your intervention. Add corrections to the *Gotchas* section |

If a skill could have been generated by anyone with no domain knowledge, it has no domain knowledge. Reject those drafts and re-derive from real material.

### 5. Write the body like you'd write a one-page memo

The body is the system prompt. It runs verbatim on every call. Three rules:

**Be terse.** Long system prompts dilute. A 400-word agent body usually beats a 2000-word one. Cut anything that says *"please be helpful"* or *"think step by step"* — the model already knows.

**Use H2 sections by convention** (the runtime doesn't enforce them, but readers and LLMs benefit):

```markdown
## Role
You are a Customer Support agent. Resolve issues end-to-end or escalate cleanly.

## Tone
Professional, warm, never defensive. Short sentences.

## Boundaries
- Never promise refunds beyond policy.
- Never reveal another customer's data.
- If asked something outside support, say so and offer to transfer.

## Escalation
If the user is angry, the issue is over $500, or you've made one full attempt
without resolution, call the `escalate` skill.

## Examples
**Input:** My order hasn't arrived in 14 days.
**Output:** I'm sorry — let me find your order. (Calls `lookup-order`...)
```

**Anchor with examples.** One or two `**Input:** / **Output:**` pairs do more than a paragraph of "be helpful." Pick edge cases, not happy paths.

### 6. Turn on the right artifacts

Every agent ships A2A AgentCard discovery. That's free. The other artifacts are choices:

| You want… | Set this | Cost |
| --- | --- | --- |
| Discoverable by A2A clients | `discovery.agentCard: true` | None — flipped on by default for chat-built sandboxes |
| Listed in MCP Registry | `discovery.mcp: true` + run `oneie publish --mcp` | Public listing |
| DID-anchored identity | `did: did:web:<host>:<name>` | One DNS record |
| On-chain identity (ERC-8004) | `ercAgent: { chainId, identityRegistry, agentId }` + run `oneie publish --erc8004` | One on-chain tx |
| Cryptographic signature on every release | `trust.sign: keyless` | Sigstore Fulcio + Rekor (free) |
| Reachable from Agentverse | `mailbox: true` + `agentverse: true` + AGENTVERSE_API_KEY | Agentverse account |

**Default for chat-built sandboxes:** A2A on, everything else off. Turn things on only when there's a concrete user reason.

### 7. Validate, sign, ship

Before shipping, every agent passes these checks:

```bash
oneie agent validate agents/support.md         # Zod + cross-link
oneie agent lint     agents/support.md         # style + spec rules
oneie agent eval     agents/support.md         # run examples + rubrics
oneie agent compile  agents/support.md --target a2a    # confirm artifact emits
```

If any of these fail, fix the source. Don't suppress, don't `--no-verify`. The runtime refuses to register a uAgents Protocol when the schema digest changed without a version bump — that's a feature, not a problem.

For paid skills: also run `oneie skill publish` against staging first, watch one real x402 payment land, then promote.

---

## Best practices (the secret sauce)

These separate good agents from great ones.

### On personas

- **One job per agent.** "Customer support" is one job. "Sales and support and billing" is three.
- **Voice over rules.** A vivid voice ("warm, brisk, never defensive") outperforms a 200-word policy list. The LLM imitates voice better than it follows rules.
- **Body length: 200-600 words.** Shorter feels thin; longer dilutes. If your body is over 800 words, you have skills hiding inside the prompt.

### On skills

- **`description` starts with "Use when…"** — this is the routing instruction, not the marketing copy. It is the *only* thing the LLM router sees when deciding to call you.
- **Sharp `inputSchema`.** Required fields only. No `additionalProperties: true` unless you genuinely accept anything. Tighten until the schema is one screen.
- **Output what you promised.** If `outputSchema` says `{ resolution, escalated }`, your skill body must produce those keys. Lazy outputs make composition impossible.
- **Free triage, paid resolution.** A `triage` skill at $0 that decides which paid skill to call is worth more than a single $1 god-skill that does everything badly.

### On pricing

- **Price the value, not the cost.** Inference is cheap. The skill is the value. A skill that saves a user 30 minutes is worth more than the LLM tokens it consumes.
- **Round prices.** $0.02 not $0.0237. Users glance at prices; uglies feel sneaky.
- **Multi-chain from day one.** USDC on Base + SUI on Sui covers 90% of crypto-paying users. Add more chains as users ask.

### On tools

- **Whitelist always.** `tools: []` ≠ `tools: undefined`. The first means "no tools"; the second means "all platform tools." Be explicit.
- **Custom tools live in `tools/`** and are bundled at build time (Workers can't dynamic-import). Reference them by `./tools/<file>` in `tools:` arrays.
- **MCP-imported tools** use `@scope/server#name` namespacing. Three forms in one whitelist is fine.

### On bodies

- **No `please`.** No `kindly`. No `try to`. The model is your agent, not a contractor — give it instructions, not requests.
- **One example beats one paragraph of theory.** Put the example in the body, mark it `**Input:** / **Output:**`.
- **Boundaries before behavior.** State what the agent will *not* do before what it will. Models follow negative constraints more reliably than positive ones.

### Body craft (the patterns that separate great skills from mediocre ones)

The body loads in full when a skill activates. Every token competes with conversation history. Apply these patterns; cut anything that doesn't earn its tokens.

**Add what the agent lacks, omit what it knows.** Don't explain what a PDF is. Don't define HTTP. Jump straight to the project-specific facts: which library, which schema, which edge case.

```markdown
<!-- Bad — verbose, agent already knows this -->
PDF (Portable Document Format) files are a common file format... To extract
text, you'll need a library. pdfplumber is recommended because it handles
most cases well.

<!-- Good — straight to what the agent wouldn't know -->
Use pdfplumber. For scanned documents, fall back to pdf2image + pytesseract.
```

**Match specificity to fragility.** Loose where multiple approaches work; prescriptive where order matters or operations are destructive.

```markdown
## Code review (loose — describe what to look for)
1. Check queries for SQL injection (parameterized only).
2. Verify auth on every endpoint.
3. Look for races in concurrent paths.

## Database migration (prescriptive — exact sequence)
Run exactly: `python scripts/migrate.py --verify --backup`
Do not modify the command. Do not add flags.
```

**Provide defaults, not menus.** Pick one, name alternatives briefly.

```markdown
<!-- Bad -->
You can use pypdf, pdfplumber, PyMuPDF, or pdf2image…

<!-- Good -->
Use pdfplumber. For scanned PDFs, use pdf2image + pytesseract instead.
```

**Procedures over declarations.** Teach the *method*, not the answer to one instance.

```markdown
<!-- Bad — answers one task, not a class of them -->
Join `orders` to `customers` on `customer_id`, filter `region='EMEA'`,
sum `amount`.

<!-- Good — generalizes -->
1. Read schema from `references/schema.yaml` to find relevant tables.
2. Join via the `_id` foreign-key convention.
3. Apply filters as WHERE clauses.
4. Aggregate numerics; output as markdown table.
```

**Gotchas section.** The highest-value content in any skill. Concrete corrections to mistakes the agent *will* make without being told. When you correct the agent in real testing, that correction goes here.

```markdown
## Gotchas
- The `users` table uses soft deletes. Always include `WHERE deleted_at IS NULL`.
- User ID is `user_id` in the DB, `uid` in auth, `accountId` in billing — same value.
- `/health` returns 200 if the web server is up, even with no DB. Use `/ready` for full health.
```

**Templates over prose.** When you need a specific output shape, show the shape.

```markdown
## Report structure

```markdown
# [Title]

## Executive summary
[one paragraph]

## Key findings
- [finding with supporting data]

## Recommendations
1. [actionable]
```
```

**Checklists for multi-step.** Force progress tracking; prevent skipped steps.

```markdown
## Form processing
- [ ] Step 1: Analyze form (`scripts/analyze_form.py`)
- [ ] Step 2: Map fields (edit `fields.json`)
- [ ] Step 3: Validate (`scripts/validate_fields.py`)
- [ ] Step 4: Fill (`scripts/fill_form.py`)
- [ ] Step 5: Verify (`scripts/verify_output.py`)
```

**Validation loops.** Do work → validate → fix → repeat. Closes the loop on agent self-correction.

```markdown
## Editing workflow
1. Make edits.
2. Run `python scripts/validate.py output/`.
3. If it fails: read the error, fix, re-run.
4. Proceed only when validation passes.
```

**Plan-validate-execute.** For batch or destructive ops, force a written plan checked against ground truth before action.

```markdown
1. Extract form fields → `form_fields.json` (source of truth).
2. Write `field_values.json` mapping each field name to its value.
3. Validate: `scripts/validate_fields.py form_fields.json field_values.json`.
4. If validation fails, revise and re-validate.
5. Execute: `scripts/fill_form.py input.pdf field_values.json output.pdf`.
```

The validation step (3) prevents destructive errors and gives the agent specific, recoverable feedback.

**Progressive disclosure.** Keep `SKILL.md` body under 500 lines / ~5000 tokens. Move heavy reference material to `references/` files and tell the agent *when* to load each:

```markdown
For uncommon API errors, read `references/api-errors.md`.
For edge cases in the form schema, read `references/form-edge-cases.md`.
```

A vague "see references/ for details" wastes the disclosure mechanism — the agent doesn't know when to look.

**Bundle scripts when you see repetition.** Reading agent traces across runs and noticing the same logic being re-derived (chart building, format parsing, validation) is the signal to write a script in `scripts/`. Tested code beats re-derived prompts.

### On scripts (when you bundle them)

Agentic execution has hard rules. Scripts that violate them silently waste turns or hang.

| Rule | Why |
| --- | --- |
| **Non-interactive only** | Agents can't respond to TTY prompts. Accept all input via flags, env vars, or stdin. A blocking prompt hangs forever. |
| **`--help` is the contract** | The `--help` output is how the agent learns the script. Brief description + flags + examples. Keep it tight; it lands in the agent's context. |
| **Helpful errors** | "Error: invalid input" wastes a turn. "Error: --format must be one of: json, csv, table. Received 'xml'" lets the agent self-correct on the next try. |
| **Structured output** | JSON / CSV / TSV over free-form text. The agent and `jq` / `awk` can both consume it. |
| **stdout = data, stderr = diagnostics** | Lets the agent capture clean output while still seeing progress and warnings. |
| **Idempotency** | Agents retry. "Create if not exists" beats "create-and-fail-on-duplicate." |
| **`--dry-run` for destructive ops** | Lets the agent preview before committing. |
| **Predictable output size** | Many harnesses truncate at 10-30K chars. Default to a summary; support `--offset` / `--output FILE` for large results. |
| **Pinned versions** | `npx eslint@9.0.0`, `uvx ruff@0.8.0`. Reproducible runs across time. |
| **Distinct exit codes** | Different codes for different failure types (not-found, auth, invalid args). Document them in `--help`. |

If a script grows complex, move it from inline `bash scripts/foo.sh` into a self-contained file with inline dependency declarations (PEP 723 for Python, similar for Deno/Bun). The agent runs one command; the runtime resolves the deps.

### Importing third-party skills (agentskills.io)

Don't reinvent skills the ecosystem already has. If `pdf-processing`, `web-search`, or `data-analysis` exist in agentskills.io, import them rather than rewriting.

```yaml
# in agent.md
skills:
  - handle-complaint                                # native — written by you
  - https://agentskills.io/skill/pdf-processing     # remote — fetched, cached, signed
  - github:org/repo/skills/data-analysis@v1.2       # versioned, pinned
```

**Three rules when importing:**

1. **Pin the version.** A floating reference (`@latest`, no fragment) means a third party can change behavior in your agent without you knowing. Pin a tag, commit, or hash.
2. **Read the body before adopting.** Imported instructions become the agent's instructions when the skill activates. Treat each import as you'd treat a code dependency — review the body, especially Gotchas, before shipping.
3. **Override only when you must.** If you find yourself needing to fork an imported skill, first ask whether a `references/` override file solves it (your skill body says "consult `references/our-overrides.md` for project-specific exceptions"). Forks accumulate maintenance debt; references compose.

When the import fails (URL down, package missing), the runtime warns and excludes the skill from the catalog. The agent runs without it; missing imports never crash the conversation.

### Test the description (don't ship a description you haven't validated)

A skill that doesn't trigger is a skill that doesn't exist. The `description` field carries the entire burden of triggering — it's the only thing the LLM router sees when deciding whether to load the skill. Test it.

**Build a 20-query eval set:**

```jsonc
[
  // 8-10 should-trigger queries — vary phrasing, explicitness, detail, complexity
  { "query": "got a spreadsheet ~/data/q4.xlsx, can you add a profit margin col?",
    "should_trigger": true },
  { "query": "my boss wants a chart from this data file",   // doesn't name CSV
    "should_trigger": true },
  // 8-10 should-not-trigger queries — near-misses with shared keywords
  { "query": "I need to update formulas in my Excel budget",   // Excel != CSV analysis
    "should_trigger": false },
  { "query": "write a python script that uploads csv rows to postgres",   // ETL, not analysis
    "should_trigger": false }
]
```

The valuable negative cases are **near-misses** — queries that share keywords but actually need a different skill. They test whether the description is *precise*, not just *broad*.

**Run each query 3× through the agent.** Compute trigger rate. Pass if `should_trigger=true` ∧ rate > 0.5, or `should_trigger=false` ∧ rate < 0.5.

**Split the queries 60/40 into train and validation sets** *before* iterating. Use the train set to identify failures and revise the description; only check validation results to confirm changes generalize. Optimizing against the full set overfits — your description triggers perfectly on those exact phrasings and fails on real users.

**Iterate on failures, not keywords.**
- *Missed should-trigger*: too narrow — broaden the scope or add when-to-use context.
- *Hit should-not-trigger*: too broad — add specificity or boundary clauses ("does not handle Excel editing — use the `excel-editor` skill instead").
- *Don't paste failed-query keywords into the description*. That's overfitting. Generalize the *category* the failure belongs to.

Five iterations is usually enough. Stay under 1024 chars (descriptions tend to grow during optimization). Pick the iteration with the best *validation* pass rate, which often isn't the last.

### Test the outputs (the second eval — does the skill actually work?)

A skill that triggers reliably and produces mediocre outputs is still a bad skill. The trigger eval was about *getting called*. This one is about *delivering value*.

**Test cases live in `evals` (frontmatter) or `evals/evals.json`** — three fields per case (prompt, expected, files), assertions added later:

```yaml
evals:
  - id: top-months-chart
    prompt: "got a CSV in data/sales.csv — top 3 months by revenue, make a bar chart"
    expected: A bar chart image showing the top 3 months by revenue, labeled axes.
    files: [evals/files/sales.csv]
    assertions: []      # add after first run — you don't know "good" until you see "bad"
```

**Designing the cases:**

- Start with **2-3 cases**. Don't over-invest before the first results.
- **Vary phrasing** — casual ("hey can you clean up this csv"), precise ("Parse data/in.csv, drop rows where col B is null, write to data/out.csv"), with typos, with realistic file paths and column names.
- **Cover edge cases** — at least one boundary condition (malformed input, ambiguous request, unusual data shape).
- **Realistic context** — real users mention paths, names, backstory ("my boss wants…"). "process this data" tests nothing.

**Run with-skill AND without-skill (baseline).** This is non-negotiable. The without-skill run tells you what the model already does well. If the delta is small, the skill isn't earning its tokens — improve it or delete it.

```
csv-analyzer-workspace/iteration-1/
├── eval-top-months-chart/
│   ├── with_skill/    {outputs/, timing.json, grading.json}
│   └── without_skill/ {outputs/, timing.json, grading.json}
└── benchmark.json     ← {pass_rate, tokens, time, delta} per configuration
```

Each run starts in **fresh context** — no leaked state from the development conversation. Subagent isolation does this naturally; without subagents, use a separate session per run.

**Capture timing.** `total_tokens` and `duration_ms` per run. A skill that lifts pass rate 50 points at 2× tokens is worth it. One that doubles tokens for a 2-point lift is theater.

**Write assertions after the first run.** You don't know what "good" looks like until the skill has produced something. After the first iteration:

| Good assertions | Weak assertions |
| --- | --- |
| `output is valid JSON` | `output is good` |
| `bar chart has labeled axes` | `chart looks nice` |
| `report includes ≥3 recommendations` | `output uses exactly the phrase 'Total: $X'` (brittle) |

Mechanical checks → scripts. Soft checks → LLM judge. Same `grading.json` shape either way:

```json
{ "text": "Both axes are labeled",
  "passed": false,
  "evidence": "Y-axis labeled 'Revenue ($)' but X-axis has no label" }
```

**Grade strictly.** Don't give the benefit of the doubt. If an assertion says "includes a summary" and the output has a section titled *Summary* with one vague sentence, that's a FAIL — the label is there but the substance isn't.

**Pattern-mine the benchmark, don't just read pass rate:**

- *Always passes in both configs* → assertion too easy; drop it.
- *Always fails in both* → assertion broken or test too hard; fix it.
- *Passes with, fails without* → the skill is earning its tokens here. Understand why; preserve it.
- *High `stddev` across runs* → ambiguous instructions; tighten with examples.
- *Token outliers* → read the transcript for that run; usually one fuzzy step.

**Human review catches what assertions miss.** For each test case, write `feedback.json` with one actionable sentence (or empty string = looks good):

```json
{ "eval-top-months-chart": "Months are alphabetical instead of chronological; X-axis unlabeled.",
  "eval-clean-emails":     "" }
```

"Looks bad" doesn't help. "Months alphabetical instead of chronological" tells the next iteration what to fix.

**The iteration loop:**

```
1. Run with/without; grade; aggregate.
2. Hand failed assertions + human feedback + transcripts + current SKILL.md to an LLM.
3. Ask for proposed edits. (Generalize from feedback; don't paste failure-specific keywords.)
4. Apply via the chat (proposal → Face ID → R2 PUT).
5. Rerun into iteration-<N+1>/. Compare benchmark deltas.
6. Stop when feedback is empty across runs OR improvements plateau across iterations.
```

**Five iterations is usually enough.** If pass rate isn't moving, the issue is the test set (too easy / too hard / poorly labeled), not the skill. Rebuild the cases.

**When iterating, two signals to act on hard:**
- Trace shows the agent re-deriving the same logic across runs (chart builder, parser, validator). Bundle it as a script in `scripts/`.
- Pass rate plateaus while the skill keeps growing. The skill is over-constrained. Try *removing* instructions and see if results hold.

**Stopping rules:**
- Pass rate ≥ your target (often 0.85+) on the validation set.
- Human feedback is empty across all cases for two consecutive iterations.
- Two iterations of zero improvement.

The chat surface includes a `read-only` `eval` tool that runs this loop end-to-end and returns the benchmark inline. Use it. Don't ship a skill whose pass rate you can't quote.

### On natural-language YAML fields

Remember: `intervals[].task`, `endpoints[].request/response`, `startup`, `shutdown` are LLM calls at runtime against `agent.model`, with the agent's body as system prompt. Write them like prompts:

```yaml
# Good
intervals:
  - period: 300
    task: |
      Pull the last 5 unresolved tickets from `lookup-tickets`.
      For each, write one sentence: { id, customer, age_hours, blocker }.
      Save the summary as a memory note.

# Bad (vague — runtime can't act on this)
intervals:
  - period: 300
    task: Check tickets.
```

Specificity in English produces specificity in behavior. The natural-language field is a prompt, not a label.

### On discovery and identity

- **Set `did: did:web:<host>:<name>`** for any agent shared outside your sandbox. It's free and it grounds the agent's identity.
- **Sign every release.** `trust.sign: keyless` adds a Sigstore bundle. Free, fast, real provenance.
- **Use `lifecycle: deprecated`** for old agents you want to keep callable but not discoverable. `retired` removes them from the Almanac and rejects new calls.

### On composition

- **Bureau for tightly-coupled siblings.** A `support` agent that hands off to `escalate` agent is one bureau, not two unrelated processes.
- **Peers for loose coupling.** A `citation-validator` running on someone else's host is a peer, not a sub-agent. Reference by URL.
- **Skills are the unit of reuse.** If you find yourself copy-pasting prompt text between agents, that text wants to be a skill.

---

## Quality bar (the checklist)

A converted agent is **done** when every box is checked. Not before.

```
identity
  [ ] agentmd: "0.1" present
  [ ] name matches filename, ^[a-z][a-z0-9-]{0,62}$
  [ ] version is real semver, not "0.0.1" forever
  [ ] author / wallet present if shared or paid

description
  [ ] summary ≤ 200 chars, makes sense to a stranger
  [ ] description ≤ 1024 chars, starts with "Use when…"
  [ ] starters are 3-5 *real* prompts (not "Hello!")
  [ ] tags chosen for discovery, not vanity

body
  [ ] 200-600 words for agents; ≤500 lines / ~5000 tokens for skills
  [ ] H2 sections (Role / Tone / Boundaries / Examples at minimum)
  [ ] at least one **Input:**/**Output:** example
  [ ] no "please", no "kindly", no padding
  [ ] boundaries listed before behavior
  [ ] Gotchas section if the skill has any environment-specific traps
  [ ] specificity matched to fragility (loose where flexible, prescriptive where fragile)
  [ ] one default named for any choice (no menus)
  [ ] long reference material moved to references/ with explicit "load when X" hints

skills
  [ ] one job per skill
  [ ] description starts with "Use when…"
  [ ] inputSchema is tight (required-only when possible)
  [ ] paid skills use `accepts[]`, not flat `price`
  [ ] free triage skill exists if total skill count > 3

interface
  [ ] tools whitelist explicit (never undefined unless deliberate)
  [ ] channels set (default [web] is fine)
  [ ] sensitivity reflects reality (1 only if really private)

discovery
  [ ] discovery.agentCard: true (default for chat-built; explicit otherwise)
  [ ] did set if shared outside sandbox
  [ ] mcp / erc8004 / agentverse on only when there's a real reason

trust
  [ ] trust.sign: keyless on any release published to a registry
  [ ] lifecycle accurate (active / deprecated / retired)

economic
  [ ] wallet set if any skill priced > 0
  [ ] accepts[] entries match wallets you actually control
  [ ] prices passed the "would I pay this?" test

scripts (when bundled)
  [ ] non-interactive (no TTY prompts)
  [ ] --help documents flags and shows examples
  [ ] errors say what was expected and what was received
  [ ] structured output (JSON/CSV) on stdout; diagnostics on stderr
  [ ] versions pinned
  [ ] --dry-run for destructive operations

description triggering (does it activate?)
  [ ] 20-query eval set (10 should-trigger, 10 should-not, with near-misses)
  [ ] 60/40 train/validation split, fixed
  [ ] ≥80% pass rate on the validation set (3 runs each)
  [ ] description ≤1024 chars after optimization

output quality (does it work when activated?)
  [ ] 2-3+ test cases in `evals` with prompt + expected + files
  [ ] each case has 3-5 specific, observable assertions
  [ ] every case ran with_skill AND without_skill in fresh context
  [ ] benchmark.json shows positive delta on pass_rate
  [ ] token / time costs justified by quality lift
  [ ] human feedback empty (or addressed) for all cases
  [ ] no assertion always-passes-in-both (drop) or always-fails-in-both (fix)
  [ ] stopping rule met (target hit, feedback empty, or plateau across 2 iterations)

ops
  [ ] agent validate passes
  [ ] agent lint passes
  [ ] one example runs end-to-end (use agent eval)
  [ ] schema digest hasn't changed without version bump
```

If any box is unchecked, the agent is a draft. Don't ship drafts.

---

## Worked example: before and after

**Before** (a real-world ElizaOS character.json, condensed):

```json
{
  "name": "support_bot",
  "modelProvider": "anthropic",
  "settings": { "model": "claude-3-5-sonnet" },
  "system": "You are a customer support agent. Be helpful and friendly. You can help with orders, refunds, technical issues, and billing. If a user is angry, calm them down. Always apologize for any inconvenience. Try to resolve their issue if possible. Don't be rude.",
  "bio": ["A customer support agent."],
  "messageExamples": []
}
```

**Issues**: god-agent (4 jobs), generic prompt, "be helpful" padding, no skills, no examples, no pricing, no boundaries, deprecated model.

**After** — split into one agent + four skills:

```yaml
---
agentmd: "0.1"
name: support
title: Customer Support
version: 1.0.0
model: anthropic/claude-haiku-4-5
summary: Resolves order, billing, and product issues end-to-end.
description: Use when an existing customer reports a problem, asks about a refund, can't access their account, or needs status on an order.
starters:
  - My order hasn't arrived
  - I need a refund
  - I can't log in
  - When will my package ship?
skills: [lookup-order, process-refund, reset-access, escalate]
tools: [crawl]
channels: [web, telegram]
wallet: "0x209693Bc6afc0C5328bA36FaF03C514EF312287C"
discovery:
  agentCard: true
trust:
  sign: keyless
---

# Customer Support

## Role
Resolve customer issues end-to-end or escalate cleanly. You serve existing
customers — sales prospects belong to the `sales` agent.

## Tone
Warm, brisk, specific. Apologize once, then act. Never defensive.

## Boundaries
- Never approve refunds over $500 — escalate those.
- Never reveal another customer's data, even if asked by name.
- If the request is outside support (sales, partnerships), say so and transfer.

## Procedure
1. Confirm what the customer is asking for in one sentence.
2. Look up their record (`lookup-order` or by email).
3. Take the appropriate action (`process-refund` / `reset-access`).
4. If you can't resolve in two turns, call `escalate`.

## Examples
**Input:** My order hasn't arrived in 14 days. Order #A4291.
**Output:** I'm sorry that's still pending — let me check. *(calls `lookup-order` with id A4291)* I see it's stuck in customs. I can issue a replacement that ships today, or refund. Which do you prefer?

**Input:** This is unacceptable, I want to speak to your manager.
**Output:** That's fair — I'm escalating this now. *(calls `escalate` with full context)* A senior agent will respond within 1 hour.
```

And one of the skills:

```yaml
---
name: process-refund
title: Process a Refund
summary: Issues a refund within policy and notifies the customer.
description: Use when the user requests a refund AND the order is within the 30-day window AND total ≤ $500. For amounts over $500 or outside policy, call `escalate` instead.
tags: [billing, refund]
trigger: semantic
accepts:
  - scheme: exact
    network: "eip155:8453"
    asset:   "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
    max:     "0.05"
inputSchema:
  type: object
  required: [orderId, reason]
  properties:
    orderId: { type: string }
    reason:  { type: string, enum: [defective, late, wrong-item, dissatisfied] }
outputSchema:
  type: object
  properties:
    refundId:  { type: string }
    amountUsd: { type: number }
    notified:  { type: boolean }
---

Look up the order. Verify it's eligible (≤30 days, ≤$500, not previously refunded).
Call the refund API. Email the customer with the refund ID and timeline. Return
the structured output. Refuse and call `escalate` if any check fails.
```

That's a real agent. It's narrow, sharp, priced, signed, discoverable, and has a clear boundary with its sibling agents.

---

## Common mistakes (the anti-patterns)

| Mistake | Symptom | Fix |
| --- | --- | --- |
| God-agent | One persona claims four jobs in `description` | Split by user intent |
| Vague `description` | Starts with "I am…" or "This agent…" | Rewrite to start with "Use when…" |
| Padded body | "Please be helpful and friendly. Try to…" | Cut to imperatives |
| Free everything | All skills `price: 0` for an agent that earns | Identify the value step, charge for it |
| Single-chain pricing | `price: 0.02, currency: usd` | Use `accepts[]` from day one |
| No examples | Body has rules but no demonstrations | Add 1-2 `**Input:**/**Output:**` pairs |
| Stale model | `claude-3-5-sonnet`, `gpt-4` | Move to current OpenRouter ID |
| Tools wide open | `tools: undefined` for a financial agent | Whitelist explicitly |
| Lifecycle drift | Old version still `active`, new version also `active` | Old → `deprecated`, new → `active` |
| Schema break, no version bump | uAgents runtime refuses to register | Bump `version` and re-run |
| Generic prompt content | "Handle errors appropriately, follow best practices" | Re-derive from a real task or real artifact (runbooks, code review, traces) |
| Agent re-derives the same logic each run | Trace shows repeated chart-building, format-parsing, validation | Bundle as a tested script in `scripts/` |
| Description never tested | Skill rarely activates, or activates when it shouldn't | Build a 20-query eval set with near-misses; iterate with train/validation split |
| Menu instead of default | "You can use pypdf, pdfplumber, PyMuPDF…" | Pick one, name alternatives in one line |
| Specific answer where method belongs | "Join `orders` to `customers` on `customer_id`…" | Replace with the procedure that generalizes to any query |
| Vague "see references/ for details" | Agent doesn't load the files | Replace with explicit "Read `references/X.md` if Y happens" |
| No output evals — only "tried it once" | Pass rate unknown; quality unverified | Add 2-3 test cases with assertions; run with/without baseline |
| Eval ran but never compared to baseline | Can't tell if the skill is earning its tokens | Always run `without_skill` alongside; report the `delta`, not the absolute |
| Skill keeps growing, pass rate plateau | Over-constrained — instructions fight each other | *Remove* instructions and rerun; often pass rate holds or improves |
| Same logic re-derived across eval runs | Trace shows agent rebuilding chart code, parser, validator | Bundle as a tested script in `scripts/`; reference from body |

---

## When to ask the user

You will hit ambiguity. **Stop and ask** when:

1. **Pricing is implied but not stated.** "This skill is paid" → ask for currency, network, asset, amount.
2. **Wallets aren't provided** for paid agents. Don't make up addresses.
3. **DID / on-chain identity** is mentioned but no chain/registry given.
4. **Multiple personas hide in one prompt** but the user hasn't said how to split. Propose a split, ask if it matches their intent.
5. **A field's behavior is ambiguous** in the source — e.g. an existing `escalation_threshold: 500` could mean USD or count of attempts.
6. **Tools or skills are referenced** that you haven't been shown. Ask for them; don't infer their schemas.
7. **The user's existing channel wiring is unclear** — does `telegram` mean "deploy a Telegram bot" or "this agent already lives in Telegram"?
8. **Lifecycle decisions** — is this a v1 ship, a refactor of v1.x, or a deprecation of an existing agent?

Ask one batch of questions, then proceed. Don't ping-pong.

---

## Final test: the elevator pitch

Before you ship a converted agent, you should be able to say in 30 seconds:

> *"This agent is **\<name\>**. It's used when **\<one specific user intent\>**. It offers \<N\> skills: \<list\>. Skills cost between \<min\> and \<max\>. It hands off to \<sibling agent\> when \<edge case\>. It will refuse to \<boundary\>. Here's one example interaction: \<example\>. Trigger eval: \<X% on validation\>. Output eval: \<Y% pass rate, +Z% over baseline\>."*

If you stumble on any blank, the agent isn't done. The numbers at the end are the receipts that turn a draft into a shippable product.

---

*Sharp. Discoverable. Valuable. Honest. Composable. The best agents in the world are not the ones with the most fields filled — they're the ones where every field that's filled means something.*

---

## Patterns from building the system (C1–C7 retrospective)

These patterns emerged from building the agent-spec implementation end-to-end. They apply when converting or refining agents.

### On runtimes — don't compile, load

The single most common mistake when porting existing agents is trying to "compile" markdown into Python or TypeScript. Don't.

```
BAD:  generate a Python class from my agent.md
GOOD: run it directly — oneie run agent.md
```

Three of four runtimes (uAgents, MCP stdio, web) load the markdown file at runtime with no codegen step. The only emitted artifact is `SKILL.md` — because Claude Code expects files on disk. For every other runtime, if you find yourself generating `.py` or `.ts`, stop and use `oneie run` or `@oneie/mcp serve` instead.

### On templates — don't read from disk at runtime

If you scaffold templates in a CLI or tool, inline them as string constants. `tsc` does not copy `.md` files to `dist/`; a path that works in dev breaks silently in production.

```ts
// BAD — works in dev, breaks in prod (tsc doesn't copy .md)
const template = readFileSync(resolve(__dirname, 'templates/core.md'), 'utf8')

// GOOD — always works
export const TEMPLATES: Record<string, string> = {
  core: `---\nname: my-agent\n---\n...`,
}
```

### On Cloudflare Workers types — extend env.d.ts first

In Astro 6 on CF Workers, `Astro.locals.runtime.env` is removed. The only correct pattern is:

```ts
const env = (await import('cloudflare:workers' as string)).env as { DB?: D1Database; CONTENT?: R2Bucket }
```

And `KVNamespace`, `R2ObjectBody.body`, `R2ObjectBody.httpMetadata`, `ArrayBufferView` in `R2Bucket.put` must be declared in `env.d.ts` — they are not automatically available. Declare them once in `src/env.d.ts`; all files then get the types without local casts.

### On evals — the description field is the skill, not the body

The body is the system prompt; the description is the router. A skill that doesn't trigger in evals almost always has a vague description, not a weak body.

Build a 20-query eval set before writing the body:
- 8–10 should-trigger queries (vary phrasing)
- 4–6 should-not-trigger queries (adjacent but different)
- 2–4 edge cases

Run evals against description-only first. If trigger rate < 80%, rewrite the description. Only then write the body.

### On conflict safety — optimistic SHA gating

Any tool that writes to shared state should return the current SHA and accept `expectedSha` on the next write:

```ts
// write returns: { sha: "abc123" }
// next write sends: { ..., expectedSha: "abc123" }
// server: if actual sha ≠ expectedSha → 409 Conflict
```

This makes concurrent edits from multiple sessions detectable without locking. The client retries with a fresh read. One extra field, zero contention.

### On auth residue — one logout pattern only

When storing credentials in files (e.g. `~/.config/app/key`), delete the file on logout — don't zero-fill it. An empty file is harder to distinguish from a corrupt file than a missing file.

```ts
// BAD — leaves residue
writeFileSync(KEY_FILE, '', { mode: 0o600 })

// GOOD — clean state
unlinkSync(KEY_FILE)
```

### On middleware — guard prerender

Astro middleware runs during static prerendering as well as at request time. Any middleware that reads `request.headers` must guard against the prerender context:

```ts
export const onRequest = defineMiddleware(async (ctx, next) => {
  if (ctx.isPrerendered) return next()
  // ... safe to read ctx.request.headers
})
```

Without this guard, the build emits warnings and static pages may behave incorrectly.
