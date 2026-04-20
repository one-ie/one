# Web Template

Astro + React chatbot template. One deploy covers web, Telegram, Discord.

## Structure

```
src/
  pages/
    index.astro          # Landing page with chat widget
    chat.astro           # Full-page chat
    api/
      chat.ts            # Web chat endpoint
      health.ts          # Status check
      webhook/
        telegram.ts      # Telegram webhook
        discord.ts       # Discord webhook
  components/
    Chat.tsx             # Chat UI
    ChatWidget.tsx       # Floating widget
    Hero.tsx             # Landing hero
    Features.tsx         # Feature grid
    Pricing.tsx          # Pricing cards
  lib/
    llm.ts               # OpenRouter / Groq calls
    channels.ts          # Channel adapters
    agent.ts             # Agent config loader
```

## Configuration

Edit `wrangler.toml`:

```toml
[vars]
AGENT_ID = "my-agent"
AGENT_NAME = "My Agent"
AGENT_MODEL = "meta-llama/llama-4-maverick"
```

Set secrets:

```bash
wrangler secret put OPENROUTER_API_KEY
wrangler secret put TELEGRAM_TOKEN        # Optional
wrangler secret put DISCORD_TOKEN         # Optional
```

## Commands

```bash
npm run dev      # Local development
npm run build    # Production build
npm run deploy   # Deploy to Cloudflare Workers
```

## Connect to ONE

```bash
npx oneie agent sync agent.md
```

Conversations on ONE mark/warn paths. The substrate learns which responses work.
