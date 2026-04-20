# /sync

**Skills:** `/typedb` (tick loops, query & write) · `/signal` (per-loop outcomes, L4 payment emissions)

Reconcile substrate state — tick loops, absorb markdown, propagate knowledge.

## Nouns

| Noun | What | Loop |
|------|------|------|
| *(default)* | Tick all loops + scan docs + todos + agents | L1-L7 |
| `tick` | Fire all L1-L7 loops once (one full growth cycle) | L1-L7 |
| `docs` | Scan `docs/*.md` → memory → TypeDB | L6 |
| `todos` | Scan `docs/TODO-*.md` → tasks → TypeDB + KV | L1 |
| `tasks [dir]` | Import reusable task templates from `tasks/` (or `[dir]`) → world-scoped tasks + skills + capabilities | L1 |
| `agents` | Scan `agents/**/*.md` → units → TypeDB | L1 |
| `fade` | Fire L3 only — asymmetric decay | L3 |
| `evolve` | Fire L5 only — rewrite struggling agents | L5 |
| `know` | Fire L6 only — harden highways + hypothesize | L6 |
| `frontier` | Fire L7 only — detect unexplored tag clusters | L7 |
| `pay <receiver> <amt>` | Emit L4 payment signal | L4 |
| `<path>` | Absorb any markdown file or directory into substrate | L6 |

## Routing

`/sync` maps to `tick()` + `know()` — running all seven loops and hardening highways.
Individual noun invocations target a single loop layer; default runs all of them.

| Noun | Primitive | L |
|------|-----------|---|
| default / tick | `tick()` all loops | L1-L7 |
| docs / todos / agents / tasks / `<path>` | `know()` absorption | L6 |
| fade | `fade()` | L3 |
| evolve | agent prompt rewrite | L5 |
| know | `know()` harden | L6 |
| frontier | frontier detection | L7 |
| pay | `send()` payment signal | L4 |

## Steps

### *(default)*

1. `bun run verify` — W0 gate (skip if already passed this session)
2. Scan `docs/TODO-*.md` → parse checkboxes → POST `/api/tasks/sync`
3. Scan `docs/*.md` → extract concepts → write to memory → TypeDB
4. Scan `agents/**/*.md` → parse frontmatter → sync units + skills
5. GET `http://localhost:4321/api/tick?interval=0` — fire all L1-L7 loops
6. Report:
   ```
   Tasks:    N synced  M hash-deltas  K KV writes
   Docs:     N scanned  M gaps found  K TypeDB writes
   Agents:   N synced  M skills
   Tick:     cycle=N  highways=M  evolved=K  hardened=J  hypotheses=I  frontiers=H
   L3 fade:  N paths decayed
   L5 evolve: N agents evaluated  M evolved
   L6 know:  N highways hardened  M hypotheses written
   L7 frontier: N clusters detected
   ```

### tick

1. GET `http://localhost:4321/api/tick?interval=0`
2. Report full tick output:
   ```
   Cycle:      N
   Highways:   N (strength ≥ 50)
   Evolved:    N agents rewrote prompts
   Hardened:   N paths promoted to permanent
   Hypotheses: N generated
   Frontiers:  N unexplored clusters
   Per-loop timings: L3 lastAtMs=N nextAtMs=M  L5 lastAtMs=N  L6 lastAtMs=N  L7 lastAtMs=N
   ```

### docs

1. Scan all `docs/*.md` files via `src/engine/doc-scan.ts`
2. Extract key concepts, verify doc-code alignment
3. Write to memory → TypeDB
4. Report: docs scanned, gaps found, TypeDB writes

### todos

1. Scan all `docs/TODO-*.md` files via `src/engine/task-parse.ts` (`scanTodos()`)
2. POST to `http://localhost:4321/api/tasks/sync` (hash-gated: skips if data unchanged)
3. KV update (~10ms), async TypeDB sync (~100ms)
4. Report:
   ```
   Tasks:   N synced across M TODO files
   Phases:  C1=N C2=M C3=K ...
   Top 10:  <task> priority=N, ...
   KV:      N writes (hash-gated)
   ```

### tasks

Import a reusable task catalog (markdown templates with frontmatter) into the
current world. Scopes every `template.id` to `{worldId}:{template.id}` so
multiple worlds can share a catalog without collisions. Idempotent — re-running
skips tasks that already exist.

1. Resolve catalog directory from `$ARGUMENTS` or default to `tasks/` at repo root
2. Load templates via `loadTemplates(dir)` (`src/engine/reusable-tasks.ts`)
3. Instantiate via `instantiateTemplates(templates, { worldId, providerUid })`
4. Hand off to `syncTasks()` for core TypeDB insert (task + skill + capability)
5. Layer on extension attributes — rubric weights, price, currency, template-source
6. Report:
   ```
   Templates: N loaded from <dir>
   Scoped:    {worldId}:<id> × N
   Inserted:  N tasks, N skills, N capabilities
   Skipped:   M (already exist — idempotent re-sync)
   Errors:    K (malformed frontmatter or missing required fields)
   Rubric:    N templates carried rubric weights
   Pricing:   N templates carried price + currency
   ```

**Template format:** see `tasks/README.md`. Required fields: `id`, `name`.
Optional: `description`, `tags`, `wave`, `value`, `effort`, `phase`, `persona`,
`rubric: { fit, form, truth, taste }`, `price`, `currency`, `blocks`.

**Example:**

```bash
/sync tasks                         # Import ./tasks into current world
/sync tasks ./my-catalog            # Import from a custom directory
/sync tasks ../shared/task-library  # Cross-repo catalog
```

**Why this noun exists:** Stage 1 (LIST) of the trade lifecycle needs inventory.
A new seller world with zero listings is a dead market. Reusable task templates
are pre-packaged LIST entries — import the catalog, your world has a starter
set of listings ready to receive offers. See `docs/TODO-trade-lifecycle.md § Cycle 6`.

### agents

1. Scan `agents/**/*.md` files
2. Parse frontmatter via `src/engine/agent-md.ts` → `AgentSpec[]`
3. Sync each to TypeDB: unit + skills + capabilities + group membership
4. Report: agents synced, skills synced, TypeDB insert count

### fade

1. GET `http://localhost:4321/api/tick?loops=L3`
2. Asymmetric decay: resistance forgives 2× faster than strength decays
3. Report: paths decayed, net strength/resistance changes

### evolve

1. GET `http://localhost:4321/api/tick?loops=L5`
2. For each unit with `success-rate < 0.50` AND `sample-count ≥ 20` AND last evolution > 24h ago:
   - Rewrite system prompt based on failure patterns
   - Increment `generation` counter
3. Report: agents evaluated, agents evolved, generation numbers

### know

1. GET `http://localhost:4321/api/tick?loops=L6`
2. Promote top highways (strength ≥ 50, consistent) to permanent TypeDB hypotheses
3. Auto-hypothesize patterns from accumulated path data
4. Report: highways hardened, hypotheses written, confidence scores

### frontier

1. GET `http://localhost:4321/api/tick?loops=L7`
2. Detect tag clusters with <10% traversal rate
3. Report: clusters detected, expected value per cluster

### pay

1. Parse `<receiver>` and `<amount>` from `$ARGUMENTS`
2. POST `http://localhost:4321/api/signal` with `{ receiver, data: { type: "payment", amount } }`
3. Revenue recorded on path
4. Report: payment signal sent, path updated, revenue total for that path

### `<path>`

1. Read markdown file or directory at `<path>` from `$ARGUMENTS`
2. If directory: scan all `*.md` files recursively
3. Parse content → extract concepts, tasks, or agent specs as appropriate
4. Write to memory → TypeDB
5. Report: files processed, entities written

---

*`/sync` is `tick()` + `know()` — seven loops, one command.*
