# Claude Code Integration

How Claude Code uses the ONE substrate as its task management system.

---

## The Idea

Claude Code IS a unit in the world. Every conversation is a signal. Every completed task strengthens a path. Every failure deposits resistance. Over time, the colony learns which sequences of work succeed and routes future work accordingly.

```
User: "build the signup flow"
  → Claude Code reads /see tasks to see what's proven
  → picks the highest-pheromone approach
  → executes
  → /close reinforces the path
  → next time, the colony routes faster
```

---

## Slash Commands

| Command | What it does |
|---------|-------------|
| `/see tasks` | See all tasks grouped by category (attractive/ready/exploratory/repelled) |
| `/see tasks build P0` | Filter by tags |
| `/create task signup flow` | Create a new skill with auto-tagged metadata |
| `/close signup` | Mark complete, reinforce path (+5 strength), update success-rate |
| `/sync tick` | Run one growth tick — select, signal, decay, evolve, know |
| `/see highways` | See proven paths, toxic paths, and frontiers |

### Workflow

```
/see tasks                 # What's available?
/see tasks P0 build        # What's urgent and buildable?

# Work on something...
# ... edit files, run tests ...

/close api-endpoints       # Mark it complete
/see tasks                 # What unlocked? What's next?
/sync tick                 # Run a growth cycle, see what the colony learned
/see highways              # What paths are proven now?
```

### Creating Work

```
/create task build the signup flow with email + github auth

# Claude parses this into:
#   id: signup-flow
#   name: Build signup flow with email + github auth
#   tags: [build, onboard, P1, frontend]
#   unit: builder
```

Tags are extracted from context — the command figures out type, phase, priority, domain.

---

## How the World Learns from Claude Code

### Every `/close` teaches the colony

```
/close schema-design
  → path(previous-task→schema-design).strength += 5
  → unit(builder).success-rate recalculated
  → if this is the 10th success: trail approaches "attractive" threshold
  → future /see tasks will show schema-design as attractive

/close api-endpoints (after schema-design)
  → path(schema-design→api-endpoints).strength += 5
  → the colony now knows: "after schema, do api" is a good sequence
```

### Every failure teaches too

```
/close deploy --failed
  → path(previous→deploy).resistance += 8
  → deploy becomes "repelled" if resistance > strength
  → future /see tasks won't suggest deploy until resistance decays
  → but resistance decays 2x faster than strength — forgiveness built in
```

### Over many sessions

```
Session 1: /close schema → /close api → /close tests ✓
Session 2: /close schema → /close deploy ✗ (resistance)
Session 3: /close schema → /close api → /close tests → /close deploy ✓

World learns: schema → api → tests → deploy is the highway.
              schema → deploy (skipping tests) is repelled.
```

---

## Scaling to Multiple Agents

Claude Code is one unit. But the substrate supports many:

```
Tony (Claude Code)          David (Claude Code)
  ├─ /close schema           ├─ /close frontend-auth
  ├─ /close api              ├─ /close signup-ui
  └─ /close tests            └─ /close connect-flow

Both write to the same TypeDB.
Both strengthen the same paths.
The colony learns from everyone.
```

Multiple machines, one TypeDB instance = one shared world.
Tony's successes become David's highways.

---

## The Growth Loop Connection

When the dev server is running, the Dashboard polls `/api/tick` every 15 seconds. The tick:

1. **Selects** the highest-pheromone task (weighted random)
2. **Signals** it to the assigned unit
3. **Drains** the priority queue (P0 first)
4. **Fades** all paths every 5 min (trails 5%, alarms 10%)
5. **Evolves** struggling agents every 10 min (rewrites prompts)
6. **Hardens** proven paths every hour (permanent knowledge)
7. **Hypothesizes** about strong/fading paths (self-observation)
8. **Detects frontiers** from unexplored tag clusters

Claude Code's `/close` calls feed the pheromone. The tick loop turns that pheromone into intelligence. Over time, the colony routes work to the right agent via the right sequence.

---

## Without the Server

All commands work offline too. When the server isn't running:

- `/see tasks` reads from the code directly (schema, roadmap data)
- `/create task` writes to `import-roadmap.ts` for later seeding
- `/close` notes the completion for later recording
- `/sync tick` explains what the tick would do
- `/see highways` reads from docs

The commands degrade gracefully. The colony catches up when the server restarts.

---

## Files

| File | Purpose |
|------|---------|
| `.claude/commands/see.md` | `/see tasks` — see current task state |
| `.claude/commands/create.md` | `/create task` — create tagged skill |
| `.claude/commands/close.md` | `/close` — mark complete, reinforce path |
| `.claude/commands/sync.md` | `/sync tick` — run growth tick |
| `.claude/commands/see.md` | `/see highways` — see proven paths |
| `src/pages/api/tasks/` | Task API (skills + pheromone + tags) |
| `src/pages/api/tick.ts` | Growth loop endpoint |
| `src/pages/api/state.ts` | World state for visualization |
| `src/engine/loop.ts` | The 7-loop tick |
| `src/engine/one.ts` | World with TypeDB persistence |

---

*Claude Code is a unit. Every conversation is a signal. The colony learns.*
