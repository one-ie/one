# discord.md — Discord channel

Discord is the second chat channel for claw. Messages from Discord channels
arrive via a webhook (`POST /webhook/discord`), pass through the `ToolLoopAgent`
loop, and replies are posted back to the originating channel via the Discord REST
API. Each Discord channel (`channel_id`) becomes its own substrate group with
separate conversation history and pheromone paths.

---

## Features

### Messaging
- Text messages from any Discord channel the bot has access to
- Bot messages are silently ignored (prevents loops with other bots)
- Conversation history stored in D1 (last 20 messages fed as agent context)
- Discord ping verification handled automatically (`type: 1` → immediate `{type:1}` response)
- Agent replies posted to the same channel the message came from

### Memory commands
Same slash commands as Telegram — usable in any Discord channel the bot is in:

| Command | What it does |
|---|---|
| `/memory` | Shows learned facts + confidence levels + interest paths + message count |
| `/forget` | Starts a 5-minute confirmation window |
| `/forget confirm` | Irreversibly erases paths, hypotheses, and history for that user |
| `/explore` | Suggests 3 unexplored topic directions |

### Group scoping
Each Discord channel gets its own context:

```
Discord channel_id 1234  →  substrate group dc-1234
Discord channel_id 5678  →  substrate group dc-5678
```

Separate history, paths, and memory per channel. Users who interact in multiple channels
build separate context per channel.

---

## Architecture

```
Discord → POST /webhook/discord
              ↓
          ping check (type:1 → 200 immediately)
          bot check  (author.bot → skip)
              ↓
          normalizeDiscord()         parse message → Signal
              ↓
          runAgent(signal, 'discord', env)
              ↓  (web/src/lib/handler.ts)
          POST claw/message          calls ToolLoopAgent
              ↓
          sendDiscord(env, group, response)
              ↓
          Discord REST API  POST /channels/:id/messages
```

The `/webhook/discord` route lives in `web/src/pages/api/webhook/discord.ts`.
It delegates to `claw` for the agent call and posts the reply back to Discord.

---

## Setup

Discord bots use **outgoing webhooks** (the bot pushes events to your URL) rather than
Discord's native Incoming Webhooks. You need a bot application, not a webhook URL.

### 1. Create a Discord application and bot

```
1. Go to https://discord.com/developers/applications
2. New Application → name it
3. Bot → Add Bot → copy the token
4. Bot → enable "Message Content Intent" (required to read message text)
5. OAuth2 → URL Generator → scopes: bot → permissions: Send Messages, Read Message History
6. Copy the generated URL → open it → add the bot to your server
```

### 2. Set secrets in claw

```bash
cd claw
wrangler secret put DISCORD_TOKEN   # paste the bot token
```

### 3. Deploy claw

```bash
bun run deploy
# → https://claw.<account>.workers.dev
```

### 4. Register the outgoing webhook in Discord

Discord doesn't support arbitrary webhook URLs for bot message events the same way Telegram
does. You need to use the **Interactions Endpoint URL** for slash commands, or set up a
**bot** that listens via the Gateway. For a simple message-response bot:

**Option A — Discord bot gateway (recommended for production)**

Run a small gateway relay (Node.js or a second Worker) that connects to Discord's WebSocket
gateway and forwards messages to your claw `/webhook/discord` URL. This is the standard
production pattern.

**Option B — Direct HTTP interactions (slash commands only)**

1. Dashboard → General Information → Interactions Endpoint URL →
   `https://claw.<account>.workers.dev/webhook/discord`
2. Discord will send `POST` with `type:1` (ping) — claw handles this automatically
3. Register slash commands via the Discord REST API and route them through claw

### 5. Test

Send a message in a channel your bot has access to. It should reply within ~1s.

---

## Env vars

| Var | Required | Purpose |
|---|---|---|
| `DISCORD_TOKEN` | yes | Bot token for posting replies |
| `BOT_PERSONA` | no | Key from `personas.ts` — overrides persona for the whole worker |
| `OPENROUTER_API_KEY` | yes | LLM provider (default) |
| `GROQ_API_KEY` | no | Enables Groq models via `groq/` prefix |
| `GATEWAY_URL` | no | TypeDB substrate proxy; degrades gracefully if absent |

---

## Limitations

- Text only — embeds, attachments, reactions not handled (extend `normalizeDiscord` to add these)
- One reply per message — no streaming (Discord has no SSE; agent runs to completion then posts)
- No Discord-native slash command registration — `/memory` etc. work as plain text, not Discord slash commands
- Single bot token — one Discord application per worker (unlike Telegram's multi-bot support)
- Bot requires Message Content Intent enabled in the developer portal — Discord requires this for reading message body

---

## Comparison: Telegram vs Discord

| | Telegram | Discord |
|---|---|---|
| Webhook type | URL registered via BotFather API | Interactions endpoint or gateway relay |
| Multi-bot | Built-in (`TELEGRAM_TOKEN_<NAME>`) | Separate workers or gateway relay |
| Ping verification | Not needed | Automatic (`type:1` → `{type:1}`) |
| Reply format | Markdown via `parse_mode` | Plain text (Discord renders its own markdown) |
| Group scoping | `tg-<chat_id>` | `dc-<channel_id>` |
| Memory commands | Plain text `/memory` etc. | Plain text `/memory` etc. |
| Setup friction | Low — BotFather + one API call | Medium — Developer Portal + Intent + OAuth |

---

## See also

- `claw/src/channels.ts` — `normalizeDiscord`, `sendDiscord`
- `claw/src/memory.ts` — `/memory`, `/forget`, `/explore` handlers
- `web/src/pages/api/webhook/discord.ts` — webhook route
- `web/src/lib/handler.ts` — `runAgent()` shared with Telegram
- `telegram.md` — Telegram channel (simpler setup)
