# /claw

**Skills:** `/sui` (agent wallet derivation via `addressFor(uid)`) · `/cloudflare` (Worker deploy + secrets) · `/signal` (webhook channel routing, `ui:*` + `hook:*`)

Add a NanoClaw (edge worker with LLM + substrate tools) to any agent.

## Usage

```
/claw <agent-id>              Deploy claw for an agent from agents/*.md
/claw <agent-id> --token T    Deploy with Telegram bot token
/claw --list                  List available agents
/claw --dry-run <agent-id>    Show config without deploying
```

## What is a Claw?

A **NanoClaw** is a Cloudflare Worker that gives any agent:
- LLM access (via OpenRouter — any model)
- Substrate tools (signal, discover, remember, recall, highways, mark, warn)
- Channel adapters (Telegram, Discord, Web)
- Queue for async processing

## Steps

### 1. Check if agent exists

First, verify the agent exists in `agents/` directory:

```bash
ls agents/*.md agents/**/*.md
```

If the agent doesn't exist, create one first:
```bash
cat > agents/<name>.md << 'EOF'
---
name: <name>
model: anthropic/claude-haiku-4-5
---

Your system prompt here.
EOF
```

### 2. Generate claw config

Use the API to generate the config:

```bash
curl -X POST http://localhost:4321/api/claw \
  -H "Content-Type: application/json" \
  -d '{"agentId": "<agent-id>"}'
```

This returns:
- `persona` — the agent's name, model, system prompt
- `wranglerConfig` — ready-to-use wrangler.toml
- `personaEntry` — code to add to personas.ts
- `deployCommands` — step-by-step deploy instructions
- `quickDeploy` — one-liner to deploy

### 3. Deploy the claw

**Option A: Quick deploy (recommended)**

```bash
bun run scripts/setup-nanoclaw.ts --name <name> --agent <agent-id>
```

Add `--token <telegram-token>` if you want a Telegram bot.

**Option B: Manual deploy**

1. Add persona to `nanoclaw/src/personas.ts`
2. Create `nanoclaw/wrangler.<name>.toml`
3. Deploy:
   ```bash
   cd nanoclaw
   wrangler deploy --config wrangler.<name>.toml
   wrangler secret put OPENROUTER_API_KEY --config wrangler.<name>.toml
   ```
4. Register Telegram webhook (optional):
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<name>-claw.oneie.workers.dev/webhook/telegram"
   ```

### 4. Test the claw

```bash
# Web message
curl -X POST https://<name>-claw.oneie.workers.dev/message \
  -H "Content-Type: application/json" \
  -d '{"group": "test", "text": "Hello!"}'

# Health check
curl https://<name>-claw.oneie.workers.dev/health
```

## Available Tools

Every claw has access to these substrate tools:

| Tool | What it does |
|------|-------------|
| `signal` | Emit a signal to another agent or skill |
| `discover` | Find agents by tag or capability |
| `remember` | Store an insight in TypeDB |
| `recall` | Retrieve learned patterns |
| `highways` | Get proven paths (highest pheromone) |
| `mark` | Strengthen a path (positive feedback) |
| `warn` | Weaken a path (negative feedback) |

## Examples

```bash
# Deploy claw for the tutor agent
/claw tutor

# Deploy with Telegram bot
/claw tutor --token 1234567890:ABC...

# Deploy for a marketing agent
/claw marketing/creative

# Just show config
/claw tutor --dry-run
```

## See Also

- `scripts/setup-nanoclaw.ts` — Full deploy script
- `nanoclaw/src/personas.ts` — Persona definitions
- `nanoclaw/src/lib/tools.ts` — Substrate tool implementations
- `/api/claw` — Config generation API
