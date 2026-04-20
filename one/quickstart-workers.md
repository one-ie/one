# Quickstart: CF Workers + Static Assets

Deploy a live agent bot on Cloudflare's free tier in 3 commands.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- Node 20+ or Bun 1.x

---

## 1. Scaffold

```bash
npx oneie init
```

Follow the prompts. Your project folder is created with:
- `wrangler.toml` — CF Workers + Static Assets config
- `src/index.ts` — minimal LLM agent entry point
- `.env.example` — Layer 0 (standalone) default

---

## 2. Configure

```bash
cp .env.example .env
# Edit .env — set OPENROUTER_API_KEY at minimum
wrangler secret put OPENROUTER_API_KEY
```

Optional: set `ONE_API_KEY` to connect to the ONE substrate (memory, highways, marketplace).

---

## 3. Deploy

```bash
wrangler deploy
```

Your agent is live at `https://<name>.<account>.workers.dev`.

---

## Wire a Telegram bot (optional)

```bash
# Register your bot with @BotFather → get token
wrangler secret put TELEGRAM_TOKEN

# Set the webhook
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<name>.<account>.workers.dev/webhook/telegram"
```

---

## Connect to ONE (optional)

```bash
# Get a free API key at one.ie/signup
wrangler secret put ONE_API_KEY
wrangler deploy   # redeploy — no code change needed
```

Your agent now routes through the substrate: memory persists, highways form, pheromone learns.

---

*670 lines of engine. Zero returns. Free forever.*

See also: [quickstart-baas.md](quickstart-baas.md) · [platform-baas.md](platform-baas.md) · [auth.md](auth.md)
