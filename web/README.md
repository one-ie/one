# ONE Web Template

Integrated chatbot + landing page. One deploy. All channels.

## Quick Start

```bash
# Install
npm install

# Set your OpenRouter key
wrangler secret put OPENROUTER_API_KEY

# Edit agent config in wrangler.toml
# Edit landing page in src/components/

# Run locally
npm run dev

# Deploy
npm run deploy
```

## Structure

```
src/
  pages/
    index.astro             # Landing page with chat widget
    chat.astro              # Full-page chat
    api/
      chat.ts               # Web chat endpoint
      health.ts             # Status check
      webhook/
        telegram.ts         # Telegram webhook
        discord.ts          # Discord webhook
  components/
    Chat.tsx                # Chat UI
    ChatWidget.tsx          # Floating widget
    Hero.tsx                # Landing hero
    Features.tsx            # Feature grid
    Pricing.tsx             # Pricing cards
  lib/
    llm.ts                  # OpenRouter / Groq calls
    channels.ts             # Channel adapters
    agent.ts                # Agent config loader
    types.ts                # TypeScript types
```

## Configuration

Edit `wrangler.toml`:

```toml
[vars]
AGENT_ID = "my-agent"
AGENT_NAME = "My Agent"
AGENT_MODEL = "meta-llama/llama-4-maverick"
AGENT_CHANNELS = "web,telegram"
```

Set secrets:

```bash
wrangler secret put OPENROUTER_API_KEY    # Required
wrangler secret put TELEGRAM_TOKEN        # Optional
wrangler secret put DISCORD_TOKEN         # Optional
```

## Add Telegram

1. Create bot with @BotFather, get token
2. `wrangler secret put TELEGRAM_TOKEN`
3. Deploy: `npm run deploy`
4. Set webhook:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-worker>.workers.dev/api/webhook/telegram"
   ```

## Add Discord

1. Create app at discord.com/developers
2. Get bot token, add to server
3. `wrangler secret put DISCORD_TOKEN`
4. Set interactions endpoint URL to `https://<your-worker>.workers.dev/api/webhook/discord`

## Customize

- **Branding**: Edit Hero.tsx, Features.tsx, Pricing.tsx
- **Colors**: Tailwind (default: indigo accent, zinc backgrounds)
- **Model**: Change AGENT_MODEL (see lib/llm.ts for options)
- **Prompt**: Set AGENT_PROMPT in wrangler.toml or via secret

## Models

| Model | Cost | Best for |
|-------|------|----------|
| `meta-llama/llama-4-maverick` | $0.15/M | General chat (default) |
| `groq/meta-llama/llama-4-scout-17b-16e-instruct` | $0.10/M | Fast, cheap |
| `anthropic/claude-haiku-4-5` | $0.80/M | Quality, code |
| `anthropic/claude-sonnet-4-5` | $3.00/M | Complex reasoning |

For Groq models, also set `GROQ_API_KEY`.

## How It Works

```
Web:      /chat → /api/chat → LLM → response
Telegram: webhook → /api/webhook/telegram → LLM → sendMessage
Discord:  webhook → /api/webhook/discord → LLM → reply
```

One codebase, one deploy, all channels.

## Connect to ONE (Optional)

Push your agent to the ONE substrate for pheromone learning:

```bash
npx oneie agent sync agent.md
```

Conversations on ONE mark/warn paths. The substrate learns which responses work.

## License

MIT
