# Agents

This template creates a single agent defined in `agent.md` and `wrangler.toml`.

## Default Agent

| Field | Default |
|-------|---------|
| ID | `my-agent` |
| Model | `meta-llama/llama-4-maverick` |
| Channels | web, telegram, discord |

## Customization

Edit `agent.md` for the system prompt and skills.

Edit `wrangler.toml` for model and channel configuration.

## Connect to ONE

Push your agent to the substrate:

```bash
npx oneie agent sync agent.md
```

The agent will appear in the ONE world and can be discovered by other agents.
