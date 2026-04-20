# /create

**Skills:** `/typedb` (write new entity) · `/signal` (emit creation, `ui:*` or `cli:create:*`)

Emit a new entity into the substrate.

## Nouns

| Noun | What | Loop |
|------|------|------|
| `task <name> [--tags T] [--weight W]` | Atomic task into TypeDB via API | L1 |
| `todo <source-doc?>` | TODO from template (Haiku extract + wave structure) | L1 |
| `agent <markdown-file>` | Parse agent.md frontmatter → TypeDB unit + skills | L1 |
| `signal <receiver> <data>` | Ad-hoc signal emission for testing | L1 |

## Routing

`/create` maps to `send()` — emit new entity or signal into the substrate.
Every noun writes to TypeDB and/or the in-memory queue.

| Noun | Primitive | Destination |
|------|-----------|-------------|
| task | `send()` | POST `/api/tasks` |
| todo | `send()` | Write `docs/TODO-{name}.md` + POST `/api/tasks/sync` |
| agent | `send()` | `agent-md.ts` → TypeDB unit + skills + capabilities |
| signal | `send()` | POST `/api/signal` |

## Steps

### task

1. Parse `$ARGUMENTS` into task fields:
   - id (kebab-case from name), name
   - value: critical / high / medium
   - phase: C1-C7
   - persona: ceo / dev / investor / gamer / kid / freelancer / agent
   - tags (space-separated), blocks (other task IDs), exit condition
2. Compute priority: value + phase + persona + blocking weight (max 115, min 35)
3. POST to `http://localhost:4321/api/tasks` with JSON body
4. Confirm created task: id, name, priority score + formula, tags
5. Suggest `/see tasks` to view ranked list

### todo

1. Resolve source doc from `$ARGUMENTS`: try full path → `docs/$ARGUMENTS` → `docs/$ARGUMENTS.md`
2. Run Haiku one-shot to extract raw tasks (~$0.004):
   - Read doc, extract actionable items as checkbox tasks with metadata
3. Load base context: `docs/DSL.md`, `docs/dictionary.md`, `docs/rubrics.md`, `docs/TODO-template.md`
4. Promote raw tasks into full wave template:
   - Group by cycles (Wire → Prove → Grow) and waves (W1=Haiku, W2=Opus, W3=Sonnet, W4=Sonnet)
   - Assign full metadata per task: id, value, effort, phase, persona, blocks, exit, tags
   - Include: routing diagram, schema reference, wave structure, rubric scoring in W4, self-checkoff
5. Write `docs/TODO-{docname}.md`
6. Verify: all tasks have 7 metadata fields, blocks references are valid, exit conditions are verifiable
7. Report: cycle count, tasks per cycle, critical path, cost estimate

### agent

1. Read `<markdown-file>` (frontmatter: name, model, channels, group, skills, sensitivity)
2. Parse via `src/engine/agent-md.ts` → `AgentSpec`
3. Sync to TypeDB:
   - Unit: uid, name, model, system-prompt, tags
   - Skills: skill-id, name, price, tags per skill
   - Capabilities: (provider: unit, offered: skill) relation
   - Group membership: (group: $g, member: unit) relation
4. Report: uid, model, skills count, group, TypeDB insert count

### signal

1. Parse `<receiver>` and `<data>` from `$ARGUMENTS`
   - receiver: string (e.g. `bob:schema`, `analyst`)
   - data: JSON or plain string
2. POST to `http://localhost:4321/api/signal` with `{ receiver, data }`
3. Report: signal sent, response outcome (result / timeout / dissolved / failure), any path marks triggered

---

*Every `/create` is a `send()` call — a new signal enters the world.*
