# /close

**Skills:** `/signal` (4-outcome grammar: result / timeout / dissolved / failure) · `/typedb` (mark-dims, rubric scoring, write completion)

Mark a result — close the signal loop.

## Flags

| Flag | Signal | Outcome | Loop |
|------|--------|---------|------|
| `<task-id>` | mark() | result — chain strengthens | L2 |
| `<task-id> --fail` | warn(1) | failure — full warn, chain breaks | L2 |
| `<task-id> --dissolved` | warn(0.5) | dissolved — mild warn | L2 |
| `<task-id> --timeout` | neutral | timeout — slow, not bad | L2 |
| *(no arg)* | mark() + tick | session report — record all outcomes | L2, L6 |
| `--todo <slug> --wave N` | emit `do:close` | wave close (soft gate) — append learnings.md; next wave proceeds if skipped | L1, L6 |
| `--todo <slug> --cycle N` | emit `do:close` | cycle close (**hard gate**) — verify learnings grew; block next cycle if missing | L1, L2, L6 |
| `--todo <slug> --cycle N --wave N` | emit `do:close` | specific wave of a cycle — used for re-running a failed close | L1 |

## Routing

`/close` maps to `mark()` or `warn()` — the human emitting the Four Outcomes
signal back into the substrate. Rule 1 (Closed Loop): every signal must close.
Without `/close`, paths cannot learn.

## Four Outcomes Reference (smoke)

The four flags map 1:1 to the Four Outcomes from routing.md:

```
result     → /close <id>              mark()    strength++   chain strengthens
timeout    → /close <id> --timeout    neutral   no change    chain continues
dissolved  → /close <id> --dissolved  warn(0.5) resist+=0.5  mild — path missing
failure    → /close <id> --fail       warn(1)   resist+=1    full — agent failed
```

Every possible outcome has a corresponding `/close` flag. No outcome goes unmarked.
This is Rule 1 enforced at the human boundary.

## Steps

### `<task-id>` — success

1. Run W4 gate — score rubric (each dimension 0–1):
   - **fit**: does it solve the stated problem?
   - **form**: is code clean, tests passing, no regressions?
   - **truth**: are claims accurate, no hallucinated APIs?
   - **taste**: is style consistent with the codebase?
2. POST `http://localhost:4321/api/tasks/{id}/complete`
3. POST `http://localhost:4321/api/loop/mark-dims` with `{ fit, form, truth, taste }`:
   - Dim ≥ 0.5 → mark() on that dimension path (strength++)
   - Dim < 0.5 → warn() on that dimension path (resistance++)
4. Self-checkoff: update task checkbox in the TODO file `[ ]` → `[x]`
5. **Emit feedback signal** — POST `http://localhost:4321/api/signal`:
   ```json
   {
     "receiver": "loop:feedback",
     "data": {
       "tags": ["<task-tags>"],
       "strength": "<rubric-avg 0–1>",
       "content": {
         "task_id": "<id>",
         "rubric": { "fit": X, "form": Y, "truth": Z, "taste": W },
         "outcome": "result"
       }
     }
   }
   ```
   This is the return-path pheromone. Future agents with matching tags follow this trail.
   `strength >= 0.65` → mark each tag path. `strength < 0.65` → warn(0.5) each tag path.
6. Report unlocked tasks (tasks where this was in their `blocks` list)
7. Report:
   ```
   mark(+5) on <from>→<to>
   Rubric: fit=X  form=Y  truth=Z  taste=W
   Feedback: signal emitted → loop:feedback  tags=[<tags>]  strength=X
   Unlocked: N tasks
   ```

### `--fail`

1. POST `http://localhost:4321/api/tasks/{id}/complete` with `{ failed: true }`
2. warn(1) — resistance += 1 on the path. Full failure, chain breaks.
3. Report:
   ```
   warn(1) on <from>→<to>
   Full failure — resistance++. Chain breaks.
   ```

### `--dissolved`

1. POST `http://localhost:4321/api/tasks/{id}/complete` with `{ dissolved: true }`
2. warn(0.5) — resistance += 0.5. Mild warn — path doesn't exist yet.
3. Report:
   ```
   warn(0.5) on <from>→<to>
   Dissolved — missing unit/capability. Mild warn. Chain breaks.
   ```

### `--timeout`

1. POST `http://localhost:4321/api/tasks/{id}/complete` with `{ timeout: true }`
2. No mark, no warn — neutral. Slow, not bad.
3. Report:
   ```
   neutral on <from>→<to>
   Timeout — slow, not bad. Chain continues.
   ```

### *(no arg)* — session report

1. Read git diff: `git diff --stat HEAD` — what changed this session
2. For each completed task this session: POST `/api/tasks/{id}/complete`
3. POST `http://localhost:4321/api/tick` — process accumulated pheromone
4. Report session outcomes (numbers first):
   ```
   Session:    N tasks completed  M tests  K commits
   Pheromone:  N marks  M warns this session
   Rubric:     fit=X  form=Y  truth=Z  taste=W  (session averages)
   Hardened:   N highways promoted to permanent (L6)
   Frontiers:  N new unexplored clusters (L7)
   Next:       1. <task>  priority=N  2. <task>  priority=M  3. <task>  priority=K
   ```

---

*`/close` is `mark()` made human-readable. Every outcome must close its loop.*
