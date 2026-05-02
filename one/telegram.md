# telegram.md — Telegram channel

Telegram is the primary chat channel for claw. Messages arrive via a webhook
(`POST /webhook/telegram`), pass through the `ToolLoopAgent` loop, and the
reply is sent back via `sendMessage`. Each chat (group or DM) becomes its
own substrate group with its own conversation history, pheromone paths, and
memory profile.

---

## Features

### Messaging
- Text messages only — non-text updates (photos, stickers, commands without text) are ignored
- Conversation history stored in D1 (last 20 messages fed to the agent as context)
- Reply threading: `reply_to_message` preserved in the signal, available in context
- Agent responses sent with `parse_mode: Markdown` — bold, italic, code blocks work

### Memory commands (slash commands)
Users can inspect and manage their memory profile from within Telegram:

| Command | What it does |
|---|---|
| `/memory` | Shows hypotheses (high/medium confidence) + top interest paths + message count |
| `/forget` | Starts a 5-minute confirmation window |
| `/forget confirm` | Irreversibly erases paths, hypotheses, and conversation history for that user |
| `/explore` | Suggests 3 unexplored topic directions based on the world's skill tags vs. the user's paths |

### Multi-bot
One worker, multiple Telegram bots. Each bot gets its own token secret and webhook path:

```
TELEGRAM_TOKEN            → /webhook/telegram        → group prefix: tg-<chat_id>
TELEGRAM_TOKEN_SUPPORT    → /webhook/telegram-support → group prefix: tg-support-<chat_id>
TELEGRAM_TOKEN_SALES      → /webhook/telegram-sales   → group prefix: tg-sales-<chat_id>
```

Bot token is resolved at send time from the group ID prefix — no per-message routing config needed.

### Persona routing
Set `BOT_PERSONA` env var to a key from `claw/src/personas.ts` to make the entire worker
use a specific persona. For per-bot personas without separate workers, prefix the group:
group IDs starting `tg-<name>-` match personas by convention in `loadContext`.

---

## Architecture

```
Telegram → POST /webhook/telegram
              ↓
          normalizeTelegram()          parse update → Signal
              ↓
          runAgent(signal, 'telegram', env)
              ↓  (web/src/lib/handler.ts)
          POST claw/message            calls ToolLoopAgent
              ↓
          sendTelegram(env, group, response)
              ↓
          Telegram sendMessage API
```

The `/webhook/telegram` route lives in `web/src/pages/api/webhook/telegram.ts`.
It delegates to `claw` for the agent call and handles send back to Telegram.

---

## Setup

### 1. Create a bot

```
1. Open Telegram → search @BotFather
2. /newbot → follow prompts → copy the token
```

### 2. Set secrets in claw

```bash
cd claw
wrangler secret put TELEGRAM_TOKEN   # paste the token from BotFather
```

### 3. Deploy claw

```bash
bun run deploy
# → https://claw.<account>.workers.dev
```

### 4. Register the webhook

```bash
curl -F "url=https://claw.<account>.workers.dev/webhook/telegram" \
  https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook
```

Verify it's registered:

```bash
curl https://api.telegram.org/bot<TELEGRAM_TOKEN>/getWebhookInfo
```

### 5. Test

Send a message to your bot in Telegram. You should get a reply within ~1s.

---

## Multi-bot setup

To run a second bot (e.g. a support bot):

```bash
# 1. Create another bot via @BotFather → copy token
# 2. Set the named secret
wrangler secret put TELEGRAM_TOKEN_SUPPORT

# 3. Register the second webhook at the named path
curl -F "url=https://claw.<account>.workers.dev/webhook/telegram-support" \
  https://api.telegram.org/bot<SUPPORT_TOKEN>/setWebhook
```

Group IDs for the support bot will be prefixed `tg-support-<chat_id>` — separate
conversation history, separate substrate paths, same worker.

---

## Env vars

| Var | Required | Purpose |
|---|---|---|
| `TELEGRAM_TOKEN` | yes (for default bot) | Default bot token |
| `TELEGRAM_TOKEN_<NAME>` | no | Additional named bot; uppercased in env key |
| `BOT_PERSONA` | no | Key from `personas.ts` — overrides persona for the whole worker |
| `OPENROUTER_API_KEY` | yes | LLM provider (default) |
| `GROQ_API_KEY` | no | Enables Groq models via `groq/` prefix |
| `GATEWAY_URL` | no | TypeDB substrate proxy; degrades gracefully if absent |

---

## Limitations

- Text only — no image/file/voice handling (extend `normalizeTelegram` to add these)
- One reply per message — no streaming (Telegram has no SSE; the agent runs to completion then sends)
- No inline buttons / keyboard markup in replies (extend `sendTelegram` to add these)
- Bot token is per-worker-secret — production multi-tenant would need a separate routing layer

---

## See also

- `claw/src/channels.ts` — `normalizeTelegram`, `sendTelegram`
- `claw/src/memory.ts` — `/memory`, `/forget`, `/explore` handlers
- `web/src/pages/api/webhook/telegram.ts` — webhook route
- `web/src/lib/handler.ts` — `runAgent()` shared with Discord
- `discord.md` — Discord channel equivalent
