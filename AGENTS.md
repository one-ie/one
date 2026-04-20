# AGENTS.md — `one-ie/one`

This repo ships a substrate for running agents and a library of agent definitions.
Follows the cross-tool [AGENTS.md](https://agents.md) convention.

## Where to find agents

| Folder        | What                                                        |
|---------------|-------------------------------------------------------------|
| `agents/`     | Markdown agent definitions — parsed into TypeDB at deploy   |
| `.claude/agents/` | Claude Code subagents (internal tooling, not end-user)  |
| `web/src/engine/agent-md.ts` | Parser + TypeDB sync logic                   |
| `sdk/` | TypeScript SDK for any agent to call the substrate                |
| `mcp/` | MCP server exposing substrate verbs to Claude/Cursor              |

## Agent shape (markdown frontmatter)

```markdown
---
name: tutor
model: anthropic/claude-haiku-4-5
channels: [telegram, discord, web]
group: education
skills:
  - name: explain
    price: 0.01
    tags: [education, explain]
sensitivity: 0.6
---

You are a patient tutor...
```

Parse / sync / wire via `sdk`:

```ts
import { parse, syncAgent, wireAgent } from "@oneie/sdk";
const spec = parse(markdown);
await syncAgent(spec);         // write to TypeDB
const unit = wireAgent(spec);  // add to runtime world
```

## The 6 dimensions an agent touches

Every agent is an **actor** (dim 2), belongs to a **group** (dim 1), offers
**skills** (things, dim 3), builds **paths** through signals (dims 4, 5), and
eventually contributes **hypotheses** (dim 6). See `one/dictionary.md`.

## The 4 outcomes

Every task an agent runs closes with one of:

| Outcome     | What it means                       | Pheromone effect       |
|-------------|-------------------------------------|------------------------|
| `result`    | Success — payload returned          | `mark(edge, +depth)`   |
| `timeout`   | Slow but not broken                 | neutral                |
| `dissolved` | Capability missing                  | `warn(edge, 0.5)`      |
| (none)      | Failure — nothing produced          | `warn(edge, 1)`        |

Agents that can't close their loop leak learning. See `one/patterns.md`.

## Add an agent in 3 steps

1. Drop `<name>.md` in `agents/<group>/` with the frontmatter above
2. `bun run scripts/sync-agents.ts` (reads markdown → TypeDB)
3. Deploy any claw (edge worker) that should host it — see `.claude/commands/claw.md`

## See also

- `agents/README.md` — inventory of agents in this release
- `one/dictionary.md` — canonical names, dead names, 6 verbs
- `one/lifecycle.md` — register → signal → highway → harden
- `web/src/engine/agent-md.ts` — the parser itself
