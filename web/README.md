# ONE Web Template

Astro 6 + React 19 + Cloudflare Workers chatbot template. Deploy an AI agent to the web in minutes. One codebase handles landing page, multi-agent chat, and optional Telegram/Discord webhooks.

## Quick Start

```bash
# Install
npm install

# Set your OpenRouter key
wrangler secret put OPENROUTER_API_KEY

# Run locally — Vite dev server (port 4321, no CF bindings)
npm run dev

# Run locally — full CF stack (D1 + KV + R2 + Workers, port 8787)
one dev                # build + wrangler dev with local bindings
one dev --skip-build   # skip rebuild
one dev --remote       # real D1/KV/R2 instead of local

# Deploy to Cloudflare Workers
npm run deploy
```

## Structure

```
web/
  src/
    pages/
      index.astro              # Landing page
      chat.astro               # Full-page chat (Agent-aware via ?agent= URL param)
      agents.astro             # Agent selection gallery
      api/
        chat.ts                # Chat streaming endpoint (AI SDK v6)
        openrouter-models.ts   # Model list
        webhook/
          telegram.ts          # Telegram webhook (optional)
          discord.ts           # Discord webhook (optional)
    components/
      Chat.tsx                 # Chat UI — agent selection, streaming, voice, tools
      ChatWidget.tsx           # Floating chat widget
      ChatLazy.tsx             # Lazy-load wrapper
      Hero.tsx                 # Landing page hero
      Features.tsx             # Feature grid
      Pricing.tsx              # Pricing cards
      chat/
        MessageList.tsx        # Message rendering
        VoiceMenu.tsx          # Voice selection
        AddMenu.tsx            # Attachment/tool menu
      pay/
        PayPanel.tsx           # Payment UI (optional)
      showcase/                # Demo agents and workflows
    lib/
      agent.ts                 # Agent config loader (legacy, simplified)
      agents.ts                # Agent registry — loads agents/*.md + skills/*.md
      agent-md.ts              # YAML frontmatter parser for agents/skills
      llm.ts                   # OpenRouter / Groq API wrapper
      ui-signal.ts             # emitClick() for telemetry
      types.ts                 # TypeScript definitions
  agents/                      # Agent markdown definitions
    agent.md                   # Default agent (via import)
    support.md                 # Named agent (loaded via glob)
    sales.md                   # Another agent
  skills/                      # Shared skill definitions
    handle-complaint.md        # Skills referenced by agents
    escalate.md
    qualify-lead.md
    close-deal.md
  wrangler.toml               # Cloudflare Workers config
  package.json
```

## Agents

Agents are markdown files with YAML frontmatter + system prompt.

### Default Agent

The root `agent.md` (outside `agents/`) is the default. When a user visits `/chat`, they see this agent unless `?agent=<name>` is in the URL.

```yaml
---
name: agent
title: ONE Demo
model: meta-llama/llama-4-scout-17b-16e-instruct
tools: [crawl, image]
skills: [handle-complaint, escalate]
starters:
  - What is ONE?
  - How do I sell a skill?
---

You are a helpful assistant...
```

### Named Agents

Files in `agents/*.md` are discoverable:

```bash
agents/
  support.md      # ?agent=support → Customer Support agent
  sales.md        # ?agent=sales → Sales agent
```

Visit `/agents` to see a gallery of all agents. Click "Chat" on any agent to open `/chat?agent=<name>`.

### Agent Frontmatter

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Agent ID (used in URL) |
| `title` | string | Display name |
| `description` | string | Short bio shown in gallery |
| `model` | string | LLM model (default: `meta-llama/llama-4-maverick`) |
| `tools` | string[] | Platform tool whitelist: `crawl`, `image` (omit = all available) |
| `skills` | string[] | Skill references: `[handle-complaint, escalate]` |
| `starters` | string[] | Example prompts shown in UI |

### Models

Specify via `model` field in agent frontmatter or `AGENT_MODEL` in `wrangler.toml`.

| Model | Provider | Speed | Cost |
|-------|----------|-------|------|
| `meta-llama/llama-4-maverick` | OpenRouter | Fast | $0.15/1M tokens |
| `groq/meta-llama/llama-4-scout-17b` | Groq | Very fast | $0.10/1M tokens |
| `anthropic/claude-haiku-4-5` | OpenRouter | Balanced | $0.80/1M tokens |
| `anthropic/claude-sonnet-4-5` | OpenRouter | Slow | $3.00/1M tokens |

For Groq models, also set:

```bash
wrangler secret put GROQ_API_KEY
```

## Skills

Skills are markdown files in `skills/` with YAML frontmatter (no prompt body needed).

```yaml
---
name: handle-complaint
title: Handle Customer Complaint
description: Resolve customer issues step by step
price: 50
tags: [support, customer-service]
---
```

Agents reference skills by name in their frontmatter:

```yaml
skills: [handle-complaint, escalate]
```

Skills are discovered at build time via `import.meta.glob('../../skills/*.md')` in `agents.ts`. They're metadata-only; the LLM instructions live in the agent's system prompt.

## Configuration

### wrangler.toml

```toml
[vars]
AGENT_ID = "one-demo"
AGENT_NAME = "ONE Demo"
AGENT_MODEL = "meta-llama/llama-4-maverick"
ONE_API_URL = "https://dev.one.ie"  # Optional — for ONE substrate sync
```

### Secrets

```bash
wrangler secret put OPENROUTER_API_KEY    # Required
wrangler secret put GROQ_API_KEY          # Optional — if using Groq models
wrangler secret put TELEGRAM_TOKEN        # Optional — for Telegram webhook
wrangler secret put DISCORD_TOKEN         # Optional — for Discord webhook
```

## Chat Endpoint

The `/api/chat` endpoint powers both the web UI and webhook channels.

```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "..." }
  ],
  "agentId": "support",  # optional — defaults to agent.md
  "model": "anthropic/claude-haiku-4-5"  # optional — overrides agent frontmatter
}
```

Response is streamed via `ai` SDK v6's `createAgentUIStreamResponse`.

## Channels (Optional)

### Telegram

1. Create a bot with @BotFather, get token
2. `wrangler secret put TELEGRAM_TOKEN`
3. Deploy: `npm run deploy`
4. Set webhook:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-worker>.workers.dev/api/webhook/telegram"
```

### Discord

1. Create app at discord.com/developers
2. Add bot to your server, copy token
3. `wrangler secret put DISCORD_TOKEN`
4. Set interactions endpoint URL in Discord Developer Portal to:

```
https://<your-worker>.workers.dev/api/webhook/discord
```

## Design System

Uses 6 editable color tokens: `background`, `foreground`, `font`, `primary`, `secondary`, `tertiary` (defined in `src/layouts/Layout.astro`).

No Tailwind palette classes allowed — the build enforces this via `--color-*: initial` in `@theme`. Invalid colors silently emit no CSS, so always verify your styles work.

See `.claude/rules/design.md` for full token reference, depth levels, and patterns.

## UI Signals

Every `onClick` handler calls `emitClick()` for telemetry:

```tsx
import { emitClick } from '@/lib/ui-signal'

<button onClick={() => {
  emitClick('ui:chat:copy')
  handleCopy()
}}>Copy</button>
```

Format: `ui:<surface>:<action>` (all lowercase, colon-delimited).

## Compile & Deploy Agents

The `@oneie/sdk/compile` function (part of `one-ie/one`) can compile agents to multiple formats:

```bash
# From the root one-ie/one directory
npx tsx -e "
import { compile } from '@oneie/sdk/compile'
const agent = await compile('web/agents/support.md', 'uagents')  # Python uAgents
console.log(agent)
"
```

Supported formats: `uagents` (Python) · `mcp` (JSON) · `skill` (SKILL.md).

## Deploy

```bash
npm run deploy
```

Deploys to Cloudflare Workers with the Astro adapter (`@astrojs/cloudflare`). SSR for pages, static assets cached globally.

## Performance

- **Lighthouse 100%** on `/chat` (from memory constraint)
- **<10ms** gateway latency (Cloudflare)
- **<100ms** first token from LLM (streaming via AI SDK v6)

Uses:
- `client:load` for above-fold interactive UI
- `client:idle` for non-critical components
- `client:visible` for lazy-loaded galleries

## Files of Note

| File | Purpose |
|------|---------|
| `src/lib/agents.ts` | Build-time agent registry + skill resolver |
| `src/lib/agent-md.ts` | YAML frontmatter parser (handles `tools`, `skills`, `model`, etc.) |
| `src/pages/api/chat.ts` | AI SDK streaming endpoint |
| `wrangler.toml` | Worker secrets, KV bindings, custom domain |
| `.claude/rules/` | Design system, React 19, Astro rules for Claude Code |

## See Also

- **`agents/CLAUDE.md`** — agent markdown spec and templates
- **`one/dictionary.md`** — canonical names and terminology
- **Root `CLAUDE.md`** — workspace overview and operating rules

## License

MIT
