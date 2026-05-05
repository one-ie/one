---
agentmd: "0.1"
name: skill-creator
title: Skill Creator
version: 1.0.0
summary: Create new skills, modify and improve existing ones, and measure performance through eval-driven iteration.
description: |
  Use this skill when the user wants to create a skill from scratch, edit or
  optimize an existing skill, run evals to test a skill's outputs, benchmark
  skill performance with variance analysis, or optimize a skill's description
  for better triggering accuracy. Reach for it whenever the user is describing
  a reusable capability they want the model to perform consistently — even if
  they don't explicitly say "skill," "evaluation," or "benchmark." If they say
  things like "I keep asking for X — can we make this repeatable?" or "this
  output isn't reliable," that's also a signal to use this skill.
license: Apache-2.0
compatibility: |
  Requires the chat surface (`/u/<slug>/chat`) or any client with the `eval`
  and `write` tools. Workspace lives in R2 at `<slug>/skills/_workspace/`.
tags: [meta, evals, iteration, authoring, quality]
trigger: semantic
---

# Skill Creator

A skill for creating new skills and iteratively improving them through measured eval loops.

> **Forked from Anthropic's [skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator)** (Apache-2.0). Three deltas adapted to our chat-driven sandbox:
> 1. The eval reviewer renders **inline as `<EvalCard>` in the chat**, not in a browser HTTP server.
> 2. Workspace paths are **R2 keys under `<slug>/skills/_workspace/<skill>/iteration-N/`**, not filesystem siblings.
> 3. Paid skills run in **dry-run mode by default** — eval uses free/test models; production-paid runs require an explicit opt-in Face ID per session.
>
> Everything else — interview flow, lean-prompt principle, explain-the-why, look-for-repeated-work, parallel-spawn-in-same-turn, draft-assertions-while-running, train/validation split, 5-iteration cap — fork verbatim.

At a high level, the process of creating a skill goes like this:

- Decide what you want the skill to do and roughly how it should do it
- Write a draft of the skill
- Create a few test prompts and run the chat-with-skill on them
- Help the user evaluate the results both qualitatively and quantitatively
  - While runs happen in parallel, draft quantitative assertions (or review existing ones, or modify if needed). Explain them to the user.
  - Render the `<EvalCard>` review inline so the user can flip through outputs and leave per-case feedback
- Rewrite the skill based on the user's feedback and any glaring flaws in the quantitative benchmark
- Repeat until satisfied
- Optionally expand the test set and run again at larger scale
- Finally, optimize the description for activation accuracy

Your job when using this skill is to figure out where the user is in this process and then help them progress. *"I want to make a skill for X"* — narrow it down, write a draft, write test cases, run them, review with them, iterate. *"Here's my draft skill"* — go straight to the eval-iterate loop. The user says *"just vibe with me, I don't need a benchmark"* — do that instead.

After the skill is in good shape, run the description optimizer to improve activation triggering.

---

## Communicating with the user

The skill creator is used by people across a wide range of familiarity with technical jargon — from professional skill authors to first-time users who just want their site to work. Pay attention to context cues to calibrate vocabulary:

- "evaluation" and "benchmark" are usually fine
- "JSON," "assertion," and "rubric" need cues that the user already knows them, or a brief one-line definition the first time
- "stddev," "train/validation split," "trigger rate" — explain in plain language unless the user used the term first

Brief mid-flow definitions are welcome. Don't lecture. Don't assume.

---

## Creating a skill

### Capture intent

The current chat may already contain a workflow the user wants to capture (*"turn this into a skill"*). If so, extract from history first — tools used, sequence of steps, corrections the user made, input/output formats. Then ask the user to fill the gaps and confirm before proceeding.

Four questions:

1. What should this skill enable Claude to do?
2. When should this skill trigger? (what user phrases or contexts)
3. What's the expected output format?
4. Should we set up test cases? Skills with objectively verifiable outputs (file transforms, data extraction, code generation, fixed workflows) benefit from them. Skills with subjective outputs (writing style, art) often don't. Suggest a default; let the user decide.

### Interview and research

Proactively ask about edge cases, input/output formats, example files, success criteria, dependencies. Do this *before* writing test prompts — you'll need this context to write good ones.

If `crawl` is available and useful (looking up a third-party API, finding similar skills), call it in parallel with continued interview questions. Come prepared.

### Write the SKILL.md

Based on the interview, fill in:

- **`name`** — slug, lowercase + hyphens, matches the directory name
- **`summary`** — one human-readable line (≤200 chars)
- **`description`** — the routing trigger (≤1024 chars). Include both *what the skill does* and *specific contexts for when to use it*. All "when to use" info goes here, not in the body.

  The model has a tendency to **undertrigger** — to skip skills that would help. Lean toward "pushy" descriptions. Instead of *"How to build a fast dashboard"*, write *"How to build a fast dashboard. Use whenever the user mentions dashboards, data visualization, internal metrics, or wants to display any kind of company data — even if they don't explicitly ask for a dashboard."*

- **`compatibility`** — tools or runtime requirements (only when non-default)
- **The body** — the actual instructions. See the Skill Writing Guide below.

### Skill Writing Guide

#### Anatomy of a skill

```
skill-name/
├── SKILL.md                    # Required. Frontmatter + markdown body.
├── scripts/                    # Optional. Executable code for deterministic work.
├── references/                 # Optional. Docs loaded into context as needed.
└── assets/                     # Optional. Templates, icons, fonts used in output.
```

#### Progressive disclosure

The runtime loads skills in three tiers:

1. **Metadata** (`name` + `description`) — always in context, ~100 tokens per skill.
2. **SKILL.md body** — loaded when the skill activates. Keep under 500 lines / ~5000 tokens.
3. **Bundled resources** — loaded only when the body references them by path.

**Key patterns:**

- Cap SKILL.md at ~500 lines. If you're approaching the limit, add hierarchy and clear "load X when Y" pointers into `references/`.
- Reference files explicitly: *"Read `references/api-errors.md` if the API returns a non-200 status."* Vague *"see references/ for details"* wastes the disclosure mechanism.
- For large reference files (>300 lines), include a table of contents at the top.

**Domain organization** — when a skill supports multiple variants (cloud providers, frameworks, regions), organize by variant in `references/` and let the body select:

```
cloud-deploy/
├── SKILL.md           # Workflow + selection logic
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

The body says *"Read `references/<provider>.md` based on the user's stated cloud provider."* Only the relevant file loads.

#### Principle of lack of surprise

A skill must never contain malware, exploit code, or content that compromises the user's system. Its contents must not surprise the user given the description. Decline requests for skills designed for unauthorized access, exfiltration, or other malicious purposes. Roleplay skills (*"act as Y"*) are fine; misleading skills are not.

#### Writing patterns

Prefer the imperative form. *"Read the schema from `references/schema.yaml`"* beats *"You should read the schema."*

**Defining output formats:**

```markdown
## Report structure
Use this exact template:
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**Examples (concrete + observable):**

```markdown
## Commit message format
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

#### Writing style

Explain *why*, don't shout. Heavy-handed `MUST` and `NEVER` is a yellow flag — when you see yourself typing it, try to reframe with the reasoning. The model has good theory of mind; instructions paired with their *purpose* generalize better than rigid directives.

Write a draft. Look at it again with fresh eyes. Improve.

### Test cases

After the draft, come up with 2-3 realistic test prompts — the kind of thing a real user would actually type. Show them to the user: *"Here are a few test cases I'd like to try. Look right? Want to add more?"* Then run them.

Save to `evals/evals.json`. Don't write assertions yet — you'll draft them while the runs execute.

```json
{
  "skill_name": "example-skill",
  "evals": [
    { "id": 1, "prompt": "User's task prompt", "expected_output": "Description of expected result", "files": [] }
  ]
}
```

See `references/schemas.md` for the full schema.

---

## Running and evaluating test cases

This section is one continuous sequence — don't stop partway through.

Workspace lives at `<slug>/skills/_workspace/<skill-name>/iteration-N/` in R2. Each test case gets a directory `eval-<descriptive-name>/`. Inside that, `with_skill/` and `without_skill/` (or `old_skill/` when improving an existing skill).

Don't create the whole tree upfront — write directories as runs land.

### Step 1: Spawn all runs in the same turn

For each test case, fire two subagent runs in **the same turn**: one with the skill, one as a baseline. Don't spawn with-skill first and circle back for baselines later — launch everything together so they finish around the same time.

**With-skill run:**

```
Execute this task in fresh context:
- Skill path: <slug>/skills/<skill-name>/
- Task: <eval prompt>
- Input files: <eval files, or "none">
- Save outputs to: <slug>/skills/_workspace/<skill-name>/iteration-<N>/eval-<name>/with_skill/outputs/
- What we care about: <e.g., "the .docx file", "the final CSV with the new column">
```

**Baseline run** — depends on context:

- *Creating a new skill*: no skill at all. Same prompt, no skill path, save to `without_skill/outputs/`.
- *Improving an existing skill*: snapshot the prior version first (R2 versioning makes this one PUT), then point the baseline at the snapshot. Save to `old_skill/outputs/`.

For each test case, write `eval_metadata.json` (assertions can be empty for now). Use a descriptive name (`eval-clean-missing-emails`, not `eval-0`):

```json
{
  "eval_id": 0,
  "eval_name": "clean-missing-emails",
  "prompt": "The user's task prompt",
  "assertions": []
}
```

### Step 2: While runs are in progress, draft assertions

Don't just wait — use the time. Draft quantitative assertions for each test case and explain them to the user. If assertions already exist, review them and explain what they check.

**Good assertions:** objectively verifiable, descriptively named so they read clearly in the EvalCard summary. *"Output includes a bar chart image file."* *"The chart shows exactly 3 months."*

**Subjective skills** (writing style, design quality) are better evaluated qualitatively — don't force assertions onto things that need human judgment.

Update `eval_metadata.json` and `evals/evals.json` once drafted. Tell the user what they'll see in the EvalCard — both qualitative outputs and quantitative grades.

### Step 3: As runs complete, capture timing data

When each subagent finishes, you receive a notification with `total_tokens` and `duration_ms`. Save immediately to `timing.json` in the run directory:

```json
{ "total_tokens": 84852, "duration_ms": 23332, "total_duration_seconds": 23.3 }
```

This is the **only opportunity** to capture this data — it isn't persisted elsewhere. Process each notification as it arrives; don't try to batch.

### Step 4: Grade, aggregate, and surface the EvalCard

Once all runs are done:

1. **Grade each run** — spawn a grader subagent (or grade inline) following `agents/grader.md`. Read each assertion against the outputs. Save to `grading.json` with fields exactly named `text`, `passed`, and `evidence` (the EvalCard depends on these names). For mechanical assertions (file exists, valid JSON, correct row count), write a script — scripts are faster, more reliable, and reusable across iterations.

2. **Aggregate into benchmark** — call the platform `eval` chat tool, which uses `web/src/lib/eval/aggregate.ts` (shipped in C2):

   ```ts
   const benchmark = await tools.eval({ skill, iteration: N })
   // returns { pass_rate, time, tokens, delta } per configuration (mean ± stddev)
   ```

   No bundled script needed — the runtime owns aggregation. Put `with_skill` before its baseline counterpart in the rendered EvalCard.

3. **Analyst pass** — read the benchmark and surface patterns the headline pass-rate hides. Read `agents/analyzer.md` for what to look for: assertions that pass regardless of skill (non-discriminating), high-variance evals (flaky or ambiguous), tradeoffs between time / tokens / quality.

4. **Render the EvalCard inline** — the chat surface includes an `<EvalCard>` component. Pass the benchmark + outputs + grading. **Do not generate custom HTML; use EvalCard.** The card has two tabs:

   - **Outputs** — one test case at a time. Prompt, output (rendered inline where possible), previous-output comparison (iterations 2+), formal grades (collapsible), feedback textbox (auto-saves), previous feedback shown below.
   - **Benchmark** — pass rates, timing, token usage per configuration, per-eval breakdown, analyst observations.

   Navigation is prev/next buttons or arrow keys. When the user clicks **"Submit All Reviews,"** the card emits a chat message with `feedback.json` attached and the timeline closes.

5. **Tell the user:** *"The eval card is rendered above. The Outputs tab walks each test case — leave feedback per case. The Benchmark tab shows the quantitative comparison. When you're done, click Submit All Reviews and we'll read your feedback."*

### Step 5: Read the feedback

When the user submits, parse `feedback.json`:

```json
{
  "reviews": [
    { "run_id": "eval-top-months-chart-with_skill", "feedback": "chart missing axis labels and months are alphabetical not chronological", "timestamp": "..." },
    { "run_id": "eval-clean-emails-with_skill", "feedback": "", "timestamp": "..." },
    { "run_id": "eval-merge-csvs-with_skill", "feedback": "perfect, love this", "timestamp": "..." }
  ],
  "status": "complete"
}
```

Empty feedback means the user thought it was fine. Focus your improvements on the cases with specific complaints.

---

## Improving the skill

This is the heart of the loop. The user has reviewed; now make the skill better.

### How to think about improvements

1. **Generalize from feedback.** A skill is used many times across many prompts. Iterating on a few examples is fast for the user, but if the skill works only for those examples, it's useless. Avoid fiddly overfitting changes and oppressively constrictive `MUST`s. If you're stuck, branch — try different metaphors, different patterns of working. Cheap to try.

2. **Keep the prompt lean.** Remove things that aren't pulling weight. Read the transcripts, not just the final outputs. If the agent wasted time on unproductive steps, the instructions making it do that should probably go.

3. **Explain the why.** Today's models are smart. They have theory of mind. When you write `ALWAYS` or `NEVER` in all caps, that's a yellow flag — reframe with the reasoning. *"Use parameterized queries because string interpolation makes SQL injection trivial"* generalizes better than *"NEVER use string interpolation in SQL."*

4. **Look for repeated work across test cases.** Read the transcripts. If three runs all independently wrote a similar `build_chart.py` or `parse_form.py`, that's a strong signal to bundle the script. Write it once, put it in `scripts/`, tell the body to use it. Future invocations skip the rebuild.

This is high-value work. Your thinking time is not the blocker. Take your time, mull. Write a revision draft, look at it fresh, improve again.

### The iteration loop

After improving:

1. Apply the improvements (chat surface — `write` proposal → owner Face ID → R2 PUT).
2. Rerun all test cases into a new `iteration-<N+1>/` directory, including baselines. For new skills the baseline is always *no skill* (stays the same across iterations). For existing-skill improvements, decide: original version or previous iteration.
3. Render the EvalCard with `--previous-workspace iteration-<N>` so the user sees the diff.
4. Wait for "Submit All Reviews."
5. Read the new feedback, improve again, repeat.

**Stop when:**
- The user says they're happy.
- All feedback is empty (everything looks good).
- You're not making meaningful progress (two iterations of zero improvement).

Five iterations is usually enough. If pass rate isn't moving, the issue is the test set (too easy, too hard, poorly labeled) or the skill is over-constrained. Try *removing* instructions and rerunning; pass rate often holds or improves.

---

## Paid skills: dry-run mode (default) and production runs

Skills with `accepts[]` (paid x402 skills) have a special concern: every benchmark run consumes real LLM tokens that the owner pays for. To avoid surprise bills:

- **Default: dry-run mode.** Eval runs use a free/test model (e.g. the Workers AI fallback in `web/src/pages/api/chat.ts`). Outputs are still graded; assertions still pass/fail; benchmark numbers are real. Only the *cost* differs from production.
- **Production-paid mode is opt-in per session.** When the owner explicitly says *"run a production benchmark"* or *"benchmark with the real model,"* prompt for a single Face ID approval that authorizes production-mode runs for the rest of the iteration. Each individual eval still emits a per-run audit row in `<slug>/skills/_workspace/<skill>/iteration-N/audit.json`.
- **Token budget caps.** If the projected total cost of a benchmark run exceeds $1 (default; configurable via owner settings), pause and confirm before spawning.

Free skills (no `accepts`) skip this entirely.

---

## Advanced: Blind comparison

For rigorous comparisons between two skill versions (e.g. *"is the new version actually better?"*), there's a blind A/B system. Read `agents/comparator.md` and `agents/analyzer.md` for details.

The basic idea: give two outputs to an independent agent without revealing which is which, let it judge quality on a rubric, then analyze why the winner won. Optional. Most users won't need it — the human review loop is usually sufficient.

---

## Description optimization

The `description` field is the primary mechanism that determines whether the skill activates. After creating or improving a skill, offer to optimize the description for triggering accuracy.

### Step 1: Generate trigger eval queries

Create 20 queries — a mix of should-trigger and should-not-trigger. Save as JSON:

```json
[
  { "query": "ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think", "should_trigger": true },
  { "query": "I need to update formulas in my Excel budget spreadsheet", "should_trigger": false }
]
```

Queries must be realistic — what a real user would type. File paths, personal context, column names, company names, URLs. Some lowercase, some with abbreviations, some with typos. Mix lengths. **Focus on edge cases over clear-cut ones.**

For the **should-trigger** queries (8-10): different phrasings of the same intent — formal, casual, with-keyword, without-keyword. Cases where another skill competes with this one but this one should win.

For the **should-not-trigger** queries (8-10): the most valuable are **near-misses** — queries that share keywords with the skill but actually need something different. Adjacent domains, ambiguous phrasings where naive keyword matching would trigger but shouldn't, contexts where another tool is more appropriate.

**Avoid:** obviously irrelevant should-not-trigger queries. *"Write a fibonacci function"* as a negative for a CSV-analyzer skill is too easy. Make negatives genuinely tricky.

### Step 2: Review with the user

Present the eval set to the user via the chat. Render an inline editable list — they can edit queries, toggle should-trigger, add/remove entries, then click "Confirm." This step matters; bad queries make bad descriptions.

### Step 3: Run the optimization loop

Tell the user: *"This will take some time — running the optimization loop in the background."*

```ts
const result = await tools.eval.optimizeDescription({
  skill: '<slug>/skills/<skill>',
  evalSet: 'trigger-eval.json',
  model: '<model-id-of-current-session>',
  maxIterations: 5,
})
```

Use the model ID from your current session so the triggering test matches the user's actual experience. The runtime (C2 `web/src/lib/eval/runner.ts`) splits the eval set 60% train / 40% held-out test, evaluates the current description (each query 3×), proposes improvements based on failures, and iterates up to 5 times. Returns `best_description` selected by **test score** (not train) to avoid overfitting.

### Step 4: Apply the result

Update the skill's `description` frontmatter via the standard `write` proposal flow. Show the user before/after and report the train and test scores.

---

## How skill triggering actually works

Understanding the mechanism helps design better eval queries. Skills appear in the model's `available_skills` block with their `name` + `description`. The model decides whether to consult a skill based on the description.

The important thing to know: the model only consults skills for tasks it can't easily handle alone. Simple, one-step queries (*"read this PDF"*) may not trigger a skill even if the description matches perfectly — the model handles them with basic tools. Complex, multi-step, or specialized queries reliably trigger skills when the description matches.

This means trigger eval queries should be substantive enough that the model would actually benefit from consulting a skill. Trivial queries are poor test cases — they won't trigger regardless of description quality.

---

## Reference files

`agents/` contains specialized sub-agent instructions:
- `agents/grader.md` — How to evaluate assertions against outputs
- `agents/comparator.md` — Blind A/B comparison
- `agents/analyzer.md` — Pattern analysis on benchmark data

`references/` has additional schemas:
- `references/schemas.md` — JSON shapes for `evals.json`, `grading.json`, `benchmark.json`, `feedback.json`

Bundled tooling lives in the platform runtime (no per-skill scripts):
- `web/src/lib/eval/runner.ts` — Eval execution + description optimizer (C2)
- `web/src/lib/eval/aggregate.ts` — Benchmark aggregation (C2)
- `web/src/lib/pack/build.ts` — Bundle a skill directory into a `.skill` archive (C2)

Skill authors invoke these via chat tools (`tools.eval.*`, `tools.pack.*`); no shell scripts ship with the skill.

---

## The core loop, repeated for emphasis

- Figure out what the skill is about
- Draft or edit the skill
- Run the chat with the skill on test prompts (parallel with-skill + without-skill in the same turn)
- With the user, evaluate:
  - Render `<EvalCard>` inline so the user reviews outputs and leaves feedback
  - Read the quantitative benchmark (pass_rate delta, time delta, token delta)
- Repeat until satisfied
- Optimize the description for triggering
- Ship

If the user asks you to skip the eval loop and just write the skill from instinct, that's fine — but offer to run the eval loop later when they're ready.

Good luck.

---

*Forked from [anthropics/skills/skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) (Apache-2.0). See `LICENSE-NOTICE.md` for full attribution and the deltas applied for this fork.*
