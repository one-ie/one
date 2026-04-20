# CLAUDE.md — `agents/`

Markdown agent definitions. Each `.md` file is a deployable agent — frontmatter
for structure, body for system prompt. The parser in `web/src/engine/agent-md.ts`
reads these and writes to TypeDB; `sdk/` exports the same API programmatically.

## File conventions

```
agents/
├── <agent>.md        # single-file agent at top level
├── <group>/          # group-scoped agents (marketing, donal, debby, ...)
│   ├── <agent>.md
│   └── README.md     # group overview
└── roles/            # reusable role templates (agent + role binding)
```

## Frontmatter contract (required fields)

```yaml
name: <string>              # unique within group
model: <openrouter-model>   # e.g., anthropic/claude-haiku-4-5
channels: [telegram, discord, web]
group: <group-id>
skills:
  - name: <skill-id>
    price: <USD>            # 0 = free
    tags: [<tag1>, <tag2>]
sensitivity: 0..1           # 0.5 public, 1.0 secret
```

Optional: `wallet` (Sui address), `tools` (MCP tool whitelist), `lifecycle` (active|deprecated|retired).

## How the substrate uses these files

```
agents/<file>.md
        │
        ├── parse()       → AgentSpec (typed)
        ├── toTypeDB()    → TQL insert statements
        ├── syncAgent()   → executed against TypeDB Cloud
        └── wireAgent()   → live unit in the running World
```

## The 3 locked rules apply here

1. **Closed loop** — every agent handler MUST `mark`/`warn` on completion
2. **Structural time only** — no "by Friday" in agent prompts; use task/wave/cycle
3. **Deterministic results** — W4 verify reports numbers, not vibes

See `one/patterns.md` for code-level patterns, `one/dictionary.md` for names.

## Don't

- Don't rename fields without updating `one/dictionary.md` first
- Don't hardcode prompts that duplicate a skill defined elsewhere — compose
- Don't write agents that emit signals but never deposit pheromone
