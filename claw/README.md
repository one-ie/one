# claw

Edge-native AI agents on Cloudflare Workers. Telegram + Discord webhooks → LLM → streaming reply, with substrate-backed memory and pheromone learning. Zero cold start.

Built on **AI SDK v6** (`ToolLoopAgent` + `createAgentUIStreamResponse`) — the `/message` route streams the full agent loop to the browser over SSE, with tool approval gates surfaced as interactive UI in the chat.

---

## What it does

- Receives messages from **Telegram**, **Discord**, or a direct **/message** API
- Runs a multi-step `ToolLoopAgent` loop (model → tool → model, up to `maxSteps`)
- **Streams** the agent loop token-by-token to the browser via AI SDK UIMessage protocol
- **Approval gates** — substrate write tools (`remember`, `mark`, `warn`) pause the loop and ask the user before running
- Strengthens / weakens substrate paths based on LLM outcome (mark / warn) — wired automatically via `substrateMiddleware`
- Exposes `/memory`, `/forget`, `/explore` slash commands in Telegram/Discord

No containers, no queues, no DOs, no orchestration layer.

---

## Routes

| Method | Path | Purpose |
|---|---|---|
| GET  | `/health` | Status + version |
| GET  | `/highways` | Top substrate paths (substrate visibility) |
| GET  | `/messages/:group` | Conversation history for a group |
| POST | `/message` | Direct API / web chat: streams AI SDK UIMessage SSE |
| POST | `/webhook/:channel` | Telegram / Discord ingress (`telegram`, `telegram-<name>`, `discord`) |

`API_KEY` env var: when set, all non-webhook routes require `Authorization: Bearer <key>`.

`/message` accepts `{group, text, sender?}` (plain text API) or `{group, messages: UIMessage[]}` (web chat).

---

## File map

```
src/
├── index.ts            # Hono router (the only entry point)
├── agents/
│   └── builder.ts      # makeAgent() — ToolLoopAgent per persona
├── aitools.ts          # v6 tool() map: 7 tools, approval gates on substrate writes
├── middleware.ts        # substrateMiddleware (pheromone) + provider routing
├── channels.ts         # telegram + discord normalize/send
├── personas.ts         # worker-level default personas (BOT_PERSONA env)
├── pipeline.ts         # ingest → recall → measure-outcome (webhook path)
├── prompt.ts           # render ContextPack into system prompt (webhook path)
├── classify.ts         # keyword tagger + valence detector
├── memory.ts           # /memory, /forget, /explore handlers
├── substrate.ts        # TypeDB via gateway (mark/warn/highways/recall)
├── tools.ts            # legacy tool definitions (webhook path)
├── browser.ts          # URL fetch + extract (cached 5 min in KV)
└── types.ts            # Env, CallOptions, GroupContext
```

---

## Setup

```bash
# 1. Provision D1 + KV
wrangler d1 create claw                     # → put database_id in wrangler.toml
wrangler kv namespace create claw           # → put id in wrangler.toml

# 2. Run migrations
bun run migrate

# 3. Set required secret
wrangler secret put OPENROUTER_API_KEY

# 4. Add at least one channel secret
wrangler secret put TELEGRAM_TOKEN          # @BotFather → /newbot
# OR
wrangler secret put DISCORD_TOKEN

# 5. Deploy
bun run deploy
```

Then point Telegram's webhook at `https://claw.<acct>.workers.dev/webhook/telegram`:

```bash
curl -F "url=https://claw.<acct>.workers.dev/webhook/telegram" \
  https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook
```

---

## Multi-bot

To run multiple Telegram bots off one Worker, set extra tokens with a name suffix:

```bash
wrangler secret put TELEGRAM_TOKEN_SUPPORT
wrangler secret put TELEGRAM_TOKEN_SALES
```

Webhook them at `/webhook/telegram-support`, `/webhook/telegram-sales`. Group ids will use prefixes `tg-support-`, `tg-sales-` and route via the matching token.

To make a bot use a specific persona, set `BOT_PERSONA` to a key from `src/personas.ts`. Or fork the worker and edit `personas.ts` to add your own.

---

## Provider routing

`resolveBaseModel` in `middleware.ts` picks the provider in order:

1. **Groq** — if model ID starts with `groq/` and `GROQ_API_KEY` is set
2. **OpenRouter** — if `OPENROUTER_API_KEY` is set (default for any model ID)
3. **AI SDK Gateway** — fallback

Swap the model string in `personas.ts` to use any OpenRouter-supported model. No code changes needed.

`substrateMiddleware` wraps every call: on success it `mark()`s with strength weighted by cache-hit ratio; on failure it `warn()`s. The substrate learns which models and groups work best automatically.

When `MODE=development`, `devToolsMiddleware` also attaches — the AI SDK DevTools browser panel shows full prompt/response/tool traces.

---

## Substrate (optional)

`GATEWAY_URL` points at a TypeDB proxy. If unreachable, claw still works — it falls back to D1-only mode. The substrate adds:

- **paths** — `mark()` after a good turn, `warn()` after a bad one. Asymmetric decay.
- **highways** — top paths visible at `GET /highways`
- **hypotheses** — facts stored via the `remember` tool, retrieved via `recall`
- **outcome valence** — incoming message valence (positive / negative) feeds back to the previous turn's tags

You can run claw without a substrate gateway; the calls degrade silently.

---

## License

MIT
