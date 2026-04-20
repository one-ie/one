---
title: Dashboard Template (todo.md)
type: dashboard
version: 4.1.0
status: TEMPLATE
---

# Dashboard Template — `todo.md`

> **What this is.** The shape of every group's `todo.md` — a live operational
> dashboard rendered from TypeDB. Source of truth is the `thing` tree; this
> markdown is a view. `/todo` regenerates it. Don't hand-edit — your changes
> will be overwritten on the next refresh.
>
> **Where this lives.** At the root of each group. For the default world:
> `/todo.md`. For a sub-group: `plans/<group>/todo.md`. Agents and humans
> both read it.
>
> **Not a plan.** Plans are in `plans/<group>/<slug>.md` using `template-plan.md`.
> This dashboard aggregates across all plans.

---

## Frontmatter (auto-generated)

```yaml
---
type: dashboard
group: {group-id}
refreshed_at: {ISO-8601}
refreshed_by: {"/todo" | "/do plan-x" | "/close task-y" | "cron"}
plans_active: {N}
tasks_open: {N}
tasks_picked: {N}
tasks_verified_lifetime: {N}
escape_alerts: {N}
rubric_avg_7d: {0..1}
capabilities_live: {N}
revenue_7d: {$}
---
```

---

## 1 — Active plans

```tql
# Source query
match $p isa thing,
  has thing-type "plan",
  has status "RUNNING",
  has goal ?goal,
  has cycles-planned ?total;
# joined with cycle completion count + rubric avg + escape risk
```

| Plan | Goal | Cycles done / total | Rubric (7d) | Escape risk | Next wave | Open this cycle |
|------|------|---------------------|-------------|-------------|-----------|-----------------|
| `{slug}` | {goal} | {n}/{N} | {0.XX} ({±trend}) | {low\|med\|high} | C{n}/W{m} | {count} |
| ... | | | | | | |

*Clicking a plan slug opens `plans/{group}/{slug}.md` (the full plan doc).*

---

## 2 — Tasks by status

```tql
match $t isa thing, has thing-type "task", has task-status ?s;
group ?s; count;
```

| Status | Count | Notes |
|--------|------:|-------|
| `open` | {N} | available for any agent to pick |
| `blocked` | {N} | waiting on {unique-blockers} unique blockers |
| `picked` | {N} | claimed, LLM currently executing |
| `done` | {N} | awaiting W4 verify |
| `verified` | {N} | closed this cycle |
| `failed` | {N} | escalated to chairman |
| `dissolved` | {N} | missing unit/capability — retry target |

**Lifetime verified:** {N} tasks across {N} plans.

---

## 3 — Rubric trend (last 7 cycles closed)

```tql
match $t isa thing, has thing-type "task", has task-status "verified",
  has verified-at ?at, has rubric-fit ?f, has rubric-form ?fm,
  has rubric-truth ?tr, has rubric-taste ?ta;
where ?at >= now() - 7d;
group by cycle; avg(?f, ?fm, ?tr, ?ta);
```

```
cycle   fit   form  truth  taste  avg   Δ
─────  ─────  ──── ───── ────── ────  ────
 C-6    0.72  0.81  0.88  0.76  0.79   —
 C-5    0.74  0.80  0.85  0.78  0.79  =
 C-4    0.78  0.82  0.89  0.80  0.82  +0.03
 C-3    0.82  0.84  0.91  0.81  0.85  +0.03
 C-2    0.84  0.85  0.90  0.83  0.86  +0.01
 C-1    0.85  0.85  0.89  0.84  0.86   —
  C0    0.87  0.86  0.92  0.85  0.88  +0.02  ← now
```

**Trend:** {improving | stable | degrading}. {≥ 0.65 for N cycles → capability promotion eligible.}

---

## 4 — Pheromone heatmap (top 20 tag paths)

```tql
match $p isa path, has tag ?tag, has strength ?s, has resistance ?r;
where (?s - ?r) > 0;
order by ?s desc limit 20;
```

| Tag path | Strength | Resistance | Net | Status |
|----------|---------:|-----------:|----:|--------|
| `substrate→routing` | 82 | 3 | **79** | highway |
| `marketing→chat` | 47 | 8 | **39** | fresh |
| `recon→file-read` | 34 | 2 | **32** | fresh |
| ... | | | | |

**Toxic paths** (resistance > strength × 2 + sample > 5):

```tql
match $p isa path, has strength ?s, has resistance ?r;
where ?r > (?s * 2) and (?r + ?s) > 5;
```

| Tag path | Strength | Resistance | Why |
|----------|---------:|-----------:|-----|
| {path} | {s} | {r} | {inferred reason} |

---

## 5 — Escape alerts

```tql
match $p isa thing, has thing-type "plan", has escape-condition ?c;
# cross-check against recent rubric trend
```

- [ ] **{plan-slug}** — {rubric-avg} for {N} cycles, threshold {0.50}. Action: {escape.action}
- [ ] ... (none = no alerts)

---

## 6 — Capabilities live (marketplace)

```tql
match (provider: $u, offered: $s) isa capability,
  $s has scope "public", has price ?p;
# joined with settlement count over last 7d
```

| Capability | Provider | Price | 7d txns | 7d revenue | Scope | Chat URL |
|------------|----------|------:|--------:|-----------:|-------|----------|
| `{skill-id}` | `{unit}` | {$} | {N} | {$} | public | [/chat/{unit}/{skill}](/chat/{unit}/{skill}) |
| ... | | | | | | |

**Pending pitch:** {N} capabilities at highway status but not yet published.

---

## 7 — Revenue (7d)

```tql
match $sig isa signal, has kind "settle", has value ?v, has ts ?t;
where ?t >= now() - 7d;
sum ?v;
```

```
routing      ${n}     (Layer 1: per-signal fee)
discovery    ${n}     (Layer 2: per-follow query)
infra        ${n}     (Layer 3: capability hosting)
marketplace  ${n}     (Layer 4: take on settlement)
intelligence ${n}     (Layer 5: federation access)
─────────────────
TOTAL        ${n}
```

---

## 8 — Next actions (ranked by priority × pheromone × unblocked)

```tql
match $t isa thing, has thing-type "task", has task-status "open",
  has task-priority ?p, has task-value ?v, has tag ?tag;
# score = (priority × value) × pheromone-match(?tag) × un-blocked(?t)
# exclude tasks with any blocker not in "verified"
order by score desc limit 5;
```

1. `/do plans/{group}/{slug}.md` — {next wave, why} *(score: {X.XX})*
2. `/close {task-id}` — {deliverable, rubric status} *(score: {X.XX})*
3. `/review plans/{group}/{slug}.md` — {rubric trend plateau / escape near} *(score: {X.XX})*
4. ... (up to 5)

---

## 9 — In-flight (picked but not closed)

```tql
match $t isa thing, has thing-type "task", has task-status "picked",
  has started-at ?at;
# flag if ?at older than wave's typical duration × 2
```

| Task ID | Wave | Agent (inferred) | Picked at | Stale? |
|---------|------|------------------|-----------|--------|
| `{id}` | W{n} | `{unit}` (pheromone match) | {ts} | {no \| yes → re-enqueue} |

Stale tasks get auto-re-enqueued after 2× expected wave duration — `task-status` reverts to `open`, a warn(0.5) fires on the picking agent's path.

---

## 10 — Recent closes (last 24h)

```tql
match $t isa thing, has thing-type "task", has task-status "verified",
  has closed-at ?at;
where ?at >= now() - 24h;
order by ?at desc limit 20;
```

| Task ID | Rubric avg | Closed at | Produced skill? |
|---------|-----------:|-----------|-----------------|
| `{id}` | {0.XX} | {relative-time} | `{skill-id}` or — |
| ... | | | |

---

## 11 — How this dashboard updates

| Trigger | What changes | Latency |
|---------|-------------|---------|
| `/plan sync <file>` | Active plans, tasks by status, next actions | immediate |
| `/do <task-id>` | In-flight, tasks by status | immediate |
| `/close <task-id>` | Rubric trend, recent closes, tasks by status, next actions, capabilities, revenue | immediate |
| L3 fade tick (every 5 min) | Pheromone heatmap | 5 min |
| Settlement signal | Revenue, capabilities 7d txns | immediate |
| Escape trigger fires | Escape alerts section | immediate |

`/todo` forces a full refresh on demand. Generally unnecessary — every
state-changing command refreshes its affected sections atomically.

---

## 12 — How agents + humans share this view

| Who | How they read | How they write |
|-----|---------------|----------------|
| **Human in the repo** | Open `todo.md` in editor | `/plan sync`, `/do`, `/close` (commands write TypeDB → dashboard re-renders) |
| **Human on the web** | `/tasks` page (same queries, different render) | UI buttons trigger the same commands |
| **Human on mobile** | Mobile-friendly `/tasks` | claws push signals when escape fires or settlement arrives |
| **Agent in a chat** | Asks "what's next?" → agent runs TQL → formats reply | Agent emits `{receiver:"loop:tasks", kind:"pick"}` signal → TypeDB update |
| **Agent programmatic** | `import { nextTask } from '@oneie/sdk'` | SDK calls hit the same API the UI uses |
| **MCP tool** | `task_list({status, plan, tags})` — returns JSON | `task_pick()`, `task_close()` — atomic via TQL |

**The dashboard is never the authority.** TypeDB is. The dashboard is
the rendering both species happen to prefer.

---

## See also

- `one/template-plan.md` — how to write a plan that feeds this dashboard
- `one/task.md` — task entity spec, state machine, ID shape
- `one/dictionary.md` — canonical names, 6 verbs, 4 outcomes
- `one/routing.md` — `select()` formula that drives the next-actions ranking
- `one/revenue.md` — five revenue layers aggregated in §7
- `.claude/commands/todo.md` — `/todo` refresh command
- `.claude/commands/do.md` — wave orchestration (writes here)
- `.claude/commands/close.md` — atomic close (writes here)
- `.claude/commands/see.md` — `/see tasks` is a read of the same queries

---

*One view. Two species. Same state. The dashboard is just how both happen
to see TypeDB without running TQL themselves.*
