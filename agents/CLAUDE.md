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

## Two consumers, one file

Each `agents/<name>.md` is read by **both** `@oneie/sdk` and AI SDK v6. Neither
SDK wraps the other; the markdown is the contract.

```
agents/<file>.md
        │
        ├──→ @oneie/sdk (substrate layer)
        │     ├── parse()       → AgentSpec (typed)
        │     ├── toTypeDB()    → TQL insert statements
        │     ├── syncAgent()   → executed against TypeDB Cloud
        │     └── wireAgent()   → live unit in the running World
        │
        └──→ AI SDK v6 (LLM + wire layer)
              ├── model:        → gateway(spec.model) provider
              ├── body:         → ToolLoopAgent.instructions
              ├── skills[]:     → tool() definitions (paid → needsApproval: true)
              └── stopWhen:     → stepCountIs(spec.maxSteps ?? 5)
```

| Frontmatter field | `@oneie/sdk` consumes as | AI SDK v6 consumes as |
|---|---|---|
| `name` | unit id | (n/a) |
| `model` | (informational) | `gateway('<id>')` provider |
| `channels` | unit channel set | (n/a) |
| `group` | group membership | `callOptions.group` |
| `skills[]` | paid capability + price + tags → TypeDB | `tool({ inputSchema, needsApproval: price > 0, execute })` |
| `sensitivity` | ADL gate | (informational) |
| body (markdown) | (informational) | `ToolLoopAgent.instructions` |

The glue is `claw/src/agents/builder.ts` (~50 lines): reads markdown, builds
`ToolLoopAgent`, wires substrate middleware that auto-closes the loop via
`finishReason` + `usage` → `mark`/`warn`. Agent authors never write substrate
code; they write tools.

See [`one/aisdk.md`](../one/aisdk.md#seam-with-oneiesdk-the-agents-sdk) for the
full seam spec, [`one/sdk.md`](../one/sdk.md#composition-with-ai-sdk-v6) for the
inverse view.

## The 3 locked rules apply here

1. **Closed loop** — every agent handler MUST `mark`/`warn` on completion
2. **Structural time only** — no "by Friday" in agent prompts; use task/wave/cycle
3. **Deterministic results** — W4 verify reports numbers, not vibes

See `one/patterns.md` for code-level patterns, `one/dictionary.md` for names.

## Don't

- Don't rename fields without updating `one/dictionary.md` first
- Don't hardcode prompts that duplicate a skill defined elsewhere — compose
- Don't write agents that emit signals but never deposit pheromone
