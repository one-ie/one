# /do

**Skills:** `/signal` (mark/warn/dissolve outcomes) · `/typedb` (query tasks, write pheromone)

> **Before anything else:** Read `docs/TODO.md`.
> It is the mission briefing — active fronts, top priority, what's built, where we're going.
> Load it once per session. Let it orient the work.

Drive work through the substrate — select and execute.

## Modes

| Mode | What | Loop |
|------|------|------|
| `<intent>` | Natural language → find context → fastest path | L1, L2 |
| `<TODO-file>` | Advance next wave of the TODO (wave-at-a-time) | L1, L2 |
| `<TODO> --auto` | Run W1→W4 continuously until all cycles done | L1, L2 |
| `<TODO> --wave N` | Run a specific wave (override auto-detect) | L1, L2 |
| *(empty)* | Autonomous loop: pick → execute → mark → repeat | L1, L2 |
| `--once` | Single iteration of the autonomous loop | L1, L2 |

---

## Intent Mode — `/do <natural language>`

When arguments are NOT a TODO filename, --auto, --wave, --once, or empty,
treat them as **intent** and route to the fastest execution path.

### Step 1: Extract Topic

Parse the intent into a **topic slug** (kebab-case, 2-4 words max):

```
"create a landing page"     → landing-page
"fix the auth middleware"   → auth-middleware
"add payment tracking"      → payment-tracking
"refactor the loop"         → loop
```

### Step 2: Search for Context

Search for existing files matching the topic (run in parallel):

```bash
# Pattern 1: TODO files
glob "**/TODO*{topic}*.md" | head -5

# Pattern 2: Spec/plan docs
glob "**/*{topic}*.md" | head -10

# Pattern 3: Source files (for fix/refactor intents)
glob "**/*{topic}*" --type ts,tsx,astro | head -10

# Pattern 4: Task mentions in one/
glob "one/**/*{topic}*.md" | head -5
```

Collect: `{ todos: [], specs: [], sources: [], tasks: [] }`

### Step 3: Reflect — What Do We Have?

| Found | State | Fastest Path |
|-------|-------|--------------|
| TODO file exists | Execution queued | → Use existing TODO mode |
| Spec exists, no TODO | Spec defines scope | → Create TODO from spec, then execute |
| Sources exist, no spec | Code is the spec | → Direct execution (simple) or create TODO (complex) |
| Nothing exists | Greenfield | → Ask user for scope OR create minimal TODO |

**Complexity heuristic** (determines TODO vs direct):
- "create" / "add" / "build" → likely needs TODO (multi-wave)
- "fix" / "update" / "tweak" → likely direct execution
- "refactor" → read scope first, then decide

### Step 4: Report and Route

Output a reflection block before proceeding:

```
┌─ /do intent: "{original intent}"
│
│  Topic:   {topic-slug}
│  Found:   {N} TODOs, {M} specs, {K} sources
│
│  Context:
│    • {file1} — {one-line summary}
│    • {file2} — {one-line summary}
│    ...
│
│  Decision: {direct | create-todo | use-existing}
│  Rationale: {why this path is fastest}
│
└─ Proceeding with: {next action}
```

### Step 5: Execute

**If TODO exists:** Switch to `<TODO-file>` mode with that file.

**If spec exists, no TODO:**
1. Read the spec fully
2. Extract: goal, scope, constraints, exit criteria
3. Create `docs/TODO-{topic}.md` using the TODO template
4. Populate cycles/waves from spec structure
5. Switch to `<TODO-file>` mode with new TODO

**If sources exist, no spec (simple):**
1. Read the relevant source files
2. Execute the fix/update directly
3. Run `bun run verify`
4. Mark outcome via `/close`

**If sources exist, no spec (complex):**
1. Read the relevant source files
2. Create minimal TODO with one cycle
3. Switch to `<TODO-file>` mode

**If nothing exists:**
1. Ask: "No existing context for '{topic}'. What's the goal? (one sentence)"
2. Create `docs/TODO-{topic}.md` with user's answer as the goal
3. Switch to `<TODO-file>` mode

---

## Routing

`/do` maps to `select()` + the tick loop — driving signals through the
deterministic sandwich. Every execution closes its loop per Rule 1:
mark() on result, warn() on failure, warn(0.5) on dissolved, neutral on timeout.

| Mode | Primitive | Termination |
|------|-----------|-------------|
| `<intent>` | search → reflect → route | routes to one of below |
| `<TODO>` | wave handler | one wave completes |
| `--auto` | wave handler × N | all cycles complete |
| `--wave N` | wave handler | one wave completes |
| empty | `select()` | user interrupts |
| `--once` | `select()` | one task completes |

## Wave-Aware Model Routing

Every task has a `task-wave` attribute (W1/W2/W3/W4) that drives model selection:

| Wave | Model | Purpose |
|------|-------|---------|
| W1 | Haiku | Recon — fast parallel reads, pattern detection |
| W2 | Opus | Decide — complex reasoning, tradeoffs |
| W3 | Sonnet | Edit — precise refactors, code synthesis |
| W4 | Sonnet | Verify — consistency checks, rubric scoring |

When selecting next task, use `task.task-wave` to route the execution to the correct model.
Fallback to `EFFORT_MODEL` (Sonnet) if `task-wave` is absent.

---

## Skill Pre-flight Check

**Before executing ANY task**, verify required skills exist and are current.
This prevents mid-execution failures due to missing capabilities.

### Step 1: Infer Required Skills

Extract skills from task tags, intent, and file types:

```
Task tags: [ui, landing, astro]     → skills: [/astro, /shadcn, /react19]
Task tags: [typedb, schema]          → skills: [/typedb]
Task tags: [sui, wallet, bridge]     → skills: [/sui]
File types: *.astro, *.tsx           → skills: [/astro, /react19]
Intent: "create a landing page"      → skills: [/astro, /shadcn]
```

**Skill inference map:**

| Tag/Pattern | Required Skill | Why |
|-------------|----------------|-----|
| `ui`, `component`, `*.tsx` | `/react19` | React 19 patterns |
| `astro`, `page`, `*.astro` | `/astro` | Astro 6 + CF Workers |
| `shadcn`, `card`, `badge` | `/shadcn` | shadcn/ui components |
| `typedb`, `schema`, `tql` | `/typedb` | TypeDB 3.0 syntax |
| `sui`, `wallet`, `move` | `/sui` | Sui Move contracts |
| `graph`, `flow`, `node` | `/reactflow` | ReactFlow patterns |
| `deploy`, `worker`, `cf` | `/deploy` | Cloudflare deploy |
| `api`, `sdk`, `anthropic` | `/claude-api` | Claude API patterns |

### Step 2: Check Skill Status

For each required skill, check:

```bash
# Skill exists?
ls .claude/skills/{skill-name}/ 2>/dev/null

# Skill is current? (modified within 30 days)
find .claude/skills/{skill-name}/ -mtime -30 -type f | head -1
```

**Status categories:**

| Status | Meaning | Action |
|--------|---------|--------|
| `ready` | Skill exists, recently updated | Proceed |
| `stale` | Skill exists, > 30 days old | Suggest refresh |
| `missing` | Skill doesn't exist | Create or skip |
| `external` | Skill from MCP/plugin | Check MCP connection |

### Step 3: Report Skill Status

Output skill check before execution:

```
┌─ Skill Pre-flight
│
│  Required: /astro, /shadcn, /react19
│
│  Status:
│    ✓ /astro      ready    (updated 2d ago)
│    ✓ /shadcn     ready    (updated 5d ago)
│    ⚠ /react19    stale    (updated 45d ago)
│
│  Action: Proceed with warning — /react19 may need refresh
│
└─ Continuing...
```

### Step 4: Handle Missing Skills

**If skill is missing but required:**

```
┌─ Skill Pre-flight
│
│  Required: /sui
│
│  Status:
│    ✗ /sui        missing
│
│  Options:
│    1. Create skill: /skill new sui (scaffold from template)
│    2. Skip task: This task requires Sui knowledge
│    3. Proceed anyway: Risk of incorrect Move syntax
│
└─ Choice? [1/2/3]
```

**Auto-create for common patterns:**

If the missing skill matches a known template in `.claude/skills/templates/`:
- Offer to scaffold it immediately
- Or fetch from skill registry if available

### Step 5: Refresh Stale Skills

**If skill is stale (> 30 days):**

```
┌─ Skill Refresh Suggested
│
│  /react19 last updated 45 days ago
│
│  Recent changes in ecosystem:
│    • React 19.1 released (check for new patterns)
│    • use() hook behavior clarified
│
│  Options:
│    1. Refresh now: Re-read React 19 docs, update skill
│    2. Proceed: Use current skill (may be outdated)
│    3. Skip: Don't use this skill for this task
│
└─ Choice? [1/2/3]
```

### Integration with Execution

The skill check gates execution:

```
/do "create a landing page"
     │
     ▼
┌─ Intent Mode ─────────────────────┐
│  Topic: landing-page              │
│  Found: plan-landing.md           │
└───────────────────────────────────┘
     │
     ▼
┌─ Skill Pre-flight ────────────────┐
│  Required: /astro, /shadcn        │
│  Status: ✓ ready, ✓ ready         │
└───────────────────────────────────┘
     │
     ▼
┌─ Execute ─────────────────────────┐
│  Running W3 of plan-landing.md    │
└───────────────────────────────────┘
```

**If skills not ready, execution pauses** until resolved. This prevents:
- TypeDB 2.x syntax in a 3.x schema (missing `/typedb`)
- React class components in a hooks codebase (stale `/react19`)
- Move 1.0 patterns in a Move 2.0 contract (missing `/sui`)

---

## Steps

### `<TODO-file>` — Wave execution

Pass a TODO filename as `$ARGUMENTS` (e.g. `/do TODO-commands.md`).
If no argument given, use the most recently modified `docs/TODO-*.md` (excluding TODO-template.md).

Read `docs/<TODO-file>`. Find the current cycle and wave by scanning the Status section
for the first unchecked `- [ ]` wave entry. Execute that wave:

**W0 — Baseline (before first wave of any new cycle)**

```bash
bun run verify   # biome check . && tsc --noEmit && vitest run
```

Record: tests passed/total, any known failures. Fix before proceeding. Don't build on broken ground.

---

**W1 — Recon (Haiku, parallel)**

1. Read the TODO's Wave 1 section for the current cycle
2. Spawn ALL recon agents **in a single message** using the Agent tool with `model: "haiku"`
3. Each agent reads one file and reports findings verbatim with line numbers
4. Hard rule for each agent: "Report verbatim. Do not propose changes. Under 300 words."
5. Collect all reports
6. Mark Wave 1 complete in the Status section: `- [ ]` → `- [x]`

Log: `W1: tasks_parallel=N  marked=N  warned=N  dissolved=N`
CLOSE: `/close --todo <slug> --wave 1` — emit `do:close` [`cycle:N`, `wave:1`, `todo:<slug>`]; append to learnings.md (soft gate).

---

**W2 — Decide (Opus, main context)**

1. You ARE the decider. Do not delegate this wave.
2. Read all W1 reports + the source-of-truth doc referenced in the TODO
3. For each finding, decide: **Act** (produce anchor + new text) or **Keep** (it's an exception)
4. Output diff specs:
   ```
   TARGET:    docs/foo.md
   ANCHOR:    "<exact old text>"
   ACTION:    replace
   NEW:       "<new text>"
   RATIONALE: "<one sentence>"
   ```
5. Mark Wave 2 complete

Log: `W2: decisions=N  fan_out=N`
CLOSE: `/close --todo <slug> --wave 2` — emit `do:close` [`cycle:N`, `wave:2`, `todo:<slug>`]; append to learnings.md (soft gate).

---

**W3 — Edits (Sonnet, parallel)**

1. Read the diff specs from Wave 2
2. Spawn ALL edit agents **in a single message** using the Agent tool with `model: "sonnet"`
3. Each agent gets: file path, anchor (exact old_string), replacement, and the rule:
   "Use Edit tool with exact anchor as old_string. Do not modify anything else.
   If anchor doesn't match, report dissolved."
4. Collect results — mark successful edits, warn on anchor mismatches
5. Re-spawn dissolved agents once with corrected anchors (read the file first)
6. Mark Wave 3 complete

Log: `W3: edits_parallel=N  marked=N  warned=N  dissolved=N  reloops=N`
CLOSE: `/close --todo <slug> --wave 3` — emit `do:close` [`cycle:N`, `wave:3`, `todo:<slug>`]; append to learnings.md (soft gate).

---

**W4 — Verify (Sonnet, single)**

1. **Deterministic checks first:**
   ```bash
   bun run verify   # biome + tsc + vitest
   ```
   If any check fails on files touched in W3, route failure back to W3 (max 3 loops).

2. Spawn ONE verification agent (`model: "sonnet"`) — reads all touched files and checks
   cross-consistency per the TODO's verify checklist
3. Agent scores rubric: fit / form / truth / taste (each 0–1, gate at ≥ 0.65)
4. If clean → mark Wave 4 `[x]` → mark cycle `[x]`
5. If inconsistencies → spawn micro-edit agents (Wave 3.5) → re-verify (max 3 loops total)

Log: `W4: rubric={fit, form, truth, taste}  delta_vs_W0={...}  verify=green|red`
CLOSE: `/close --todo <slug> --wave 4` — emit `do:close` [`cycle:N`, `wave:4`, `todo:<slug>`]; append to learnings.md (soft gate).

---

**After each wave:**
- Update TODO Status section (`[x]`)
- Report: `{ marked: N, warned: N, dissolved: N }`
- If all 4 waves complete: run cycle close — `/close --todo <slug> --cycle N` (**hard gate**: emit `do:close` [`wave:gate`], verify learnings.md grew by 1 entry, block next cycle if skipped). Then report "Cycle N complete."
CLOSE: (cycle gate) `/close --todo <slug> --cycle N` — **hard gate**; missing close → `do:close-missing` dissolved; `/do --auto` halts.
- If all cycles complete: "All cycles complete."

**Rules:**
- Never skip W2. Understanding is not delegable.
- Always spawn W1 and W3 agents in a SINGLE message — this is how you get parallelism.
- W4 max 3 loops. If still failing after 3, halt and report to user.

---

### `--auto`

Same as `<TODO-file>` but runs W1→W2→W3→W4 continuously until all cycles are marked `[x]`.
Stop only if W4 loops > 3 (escalate to user). Report cycle completion after each.

### `--wave N`

Force a specific wave (1–4) regardless of the Status section.
Useful for re-running a failed wave or skipping ahead.

---

### *(empty)* — Autonomous loop

```
W0: bun run verify (once per session, skip if already passed)

ORIENT: Read docs/TODO.md
        → note the active front (Atomicity / Vocabulary / New Surfaces)
        → note the Top 15 priority list
        → let this shape which task you pick

loop:
  SENSE:    GET http://localhost:4321/api/tasks
            Sort by priority (effective = score + strength − resistance)
            Skip blocked tasks (blockedBy non-empty)

  SELECT:   Pick highest unblocked (P0 > P1, attractive > ready > exploratory)
            If all blocked: GET /api/state → follow pheromone highways (deadlock escape)

  EXECUTE:  Do the work (edit files, write code, run scripts as needed)

  VERIFY:   bun tsc --noEmit on touched files

  MARK:     POST http://localhost:4321/api/tasks/{id}/complete

  CLOSE:    POST http://localhost:4321/api/loop/close { score: rubric }
            Score rubric: fit / form / truth / taste (each 0–1)

  DIMS:     POST http://localhost:4321/api/loop/mark-dims { fit, form, truth, taste }
            Dims < 0.5 → warn on that dimension path
            Dims ≥ 0.5 → mark on that dimension path

  FEEDBACK: POST http://localhost:4321/api/signal {
              receiver: 'loop:feedback',
              data: {
                tags: task.tags,         // what kind of work this was
                strength: rubricAvg,     // how well it went (avg of 4 dims)
                content: { task_id, rubric, outcome: 'result' }
              }
            }
            // The return-path signal — lays pheromone on the trail home.
            // Future select() with matching tags follows this trail.
            // strength >= 0.65 → mark each tag path
            // strength < 0.65 → warn(0.5) each tag path (try specialist)
            // Always emit — even timeout, even dissolved. Every loop closes.

  GROW:     GET http://localhost:4321/api/highways → report learned paths

  → repeat
```

After each task: report name, strength, priority, tests passed, unlocked tasks.

### `--once`

Single iteration of the autonomous loop above.
Pick one task → execute → mark → stop.
Report: name, strength, priority, tests, deterministic outcome (result/timeout/dissolved/failure).

---

*`/do` is `select()` made human-readable. The path remembers every execution.*
