---
name: cloudflare
description: Cloudflare operations for ONE — Workers+Assets, wrangler 4, KV/D1/R2 bindings, tail/logs, secrets, rollback, custom domains. Post-Pages-migration era.
user-invocable: true
allowed-tools: Bash(*), Read(*), Write(*)
---

# /cloudflare — Workers + Static Assets

Manage ONE's Cloudflare deployment: credentials, secrets, KV/D1, monitoring, logs, rollback. Platform direction is **Workers with Static Assets** (unified with Pages free tier; new features land here). Pages project is in a rollback window; cutover tracked in `docs/TODO-cf-workers-migration.md`.

## Works With

| Skill      | Load when                                                                                      |
|------------|------------------------------------------------------------------------------------------------|
| `/deploy`  | Any push to Workers — bundle-size rules + Global API Key enforcement live in `.claude/commands/deploy.md`. |
| `/astro`   | SSR worker bundle — the 10 MiB ceiling needs `ssr.external` + `client:only="react"` (Astro-specific).       |
| `/sui`     | Workers signing on-chain txns — platform keypair lives in CF secrets (`SUI_SEED`), derived per-agent.       |
| `/typedb`  | Gateway proxies TypeDB Cloud at port 1729 — `/v1/` API prefix and credentials flow through CF secrets.      |
| `/signal`  | Post-deploy `deploy:success` / `deploy:degraded` signals + `/broadcast` WsHub DO auth (`X-Broadcast-Secret`). |

## Live Workers

| Worker | URL | Adapter | Role |
|---|---|---|---|
| Astro (one-substrate) | `dev.one.ie` (primary, CF Workers Static Assets) · `one-substrate.pages.dev` (legacy idle, rollback safety net) | `@astrojs/cloudflare@13` | SSR + static assets |
| Gateway | `api.one.ie` (custom domain) → `one-gateway.oneie.workers.dev` | vanilla Worker | TypeDB proxy + WsHub DO |
| Sync | `one-sync.oneie.workers.dev` | vanilla Worker | TypeDB → KV cron (1 min) |
| NanoClaw | `nanoclaw.oneie.workers.dev` | vanilla Worker | Edge agents (Telegram/Discord webhooks) |
| Donal-Claw | `donal-claw.oneie.workers.dev` | vanilla Worker | CMO bot (persona: donal) |
| Debby-Claw | `debby-claw.oneie.workers.dev` | vanilla Worker | Elevare works bot |

---

## Credentials — GLOBAL API KEY ONLY

**⚠ NON-NEGOTIABLE.** Scoped `CLOUDFLARE_API_TOKEN` is **forbidden** — lacks permissions for Workers deploy + custom domains + KV management + D1 create + Pages + secrets.

```bash
# .env (gitignored)
CLOUDFLARE_GLOBAL_API_KEY=<40-char-key>
CLOUDFLARE_EMAIL=tony@one.ie
CLOUDFLARE_ACCOUNT_ID=627e0c7ccbe735a4a7cabf91e377bbad
```

Scripts map `CLOUDFLARE_GLOBAL_API_KEY` → wrangler's `CLOUDFLARE_API_KEY` at runtime and **explicitly blank `CLOUDFLARE_API_TOKEN`** in the spawned env. See `scripts/deploy.ts:loadCredentials()`.

**Manual invocation (debugging only):**
```bash
export CLOUDFLARE_API_KEY=$(grep '^CLOUDFLARE_GLOBAL_API_KEY=' .env | cut -d= -f2-)
export CLOUDFLARE_EMAIL=$(grep '^CLOUDFLARE_EMAIL=' .env | cut -d= -f2-)
export CLOUDFLARE_ACCOUNT_ID=$(grep '^CLOUDFLARE_ACCOUNT_ID=' .env | cut -d= -f2-)
unset CLOUDFLARE_API_TOKEN    # MUST be unset, or wrangler prefers it
```

**Error decoder:**
- `Authentication failed [code: 9106]` → Global Key not in env
- `Invalid access token [code: 9109]` → `CLOUDFLARE_API_TOKEN` is set and invalid

**Always prefer `bun run deploy` over manual wrangler.**

---

## wrangler.toml — Workers + Assets Shape

### Astro SSR worker (the ONE pattern)

```toml
# wrangler.toml — current working config
name = "one-substrate"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

# @astrojs/cloudflare v13 auto-injects `main` + `[assets]` during build.
# Declaring them here fails at config-resolve time on fresh checkouts
# (vite plugin validates file existence BEFORE build runs).
# Trust the adapter.

[[kv_namespaces]]
binding = "KV"
id = "1c1dac4766e54a2c85425022a3b1e9da"

[env.production]
vars = { ENVIRONMENT = "production" }
```

**This is intentional.** Do NOT add `main = "./dist/_worker.js/index.js"` or `[assets] directory = "./dist"` — the Astro adapter injects them during build. Scar tissue from `29a7cbd`.

### Minimum vanilla Worker + Assets

```toml
name = "my-worker"
main = "./src/index.ts"
compatibility_date = "2026-04-17"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./public"
binding = "ASSETS"
not_found_handling = "single-page-application"   # SPA fallback to index.html

[observability]
enabled = true
```

### `[assets]` block reference

| Key | Values | Default | Notes |
|---|---|---|---|
| `directory` | path string | **required** | Where static files live |
| `binding` | string | optional | Conventionally `"ASSETS"`; needed for `env.ASSETS.fetch()` |
| `not_found_handling` | `"none"` \| `"404-page"` \| `"single-page-application"` | `"none"` | SPA = 200 + `index.html`; 404-page = nearest `404.html` |
| `run_worker_first` | `bool` \| `string[]` | `false` | `true` = worker for all requests; array = globs w/ `!` negation |
| `html_handling` | `"auto-trailing-slash"` \| `"force-trailing-slash"` \| `"drop-trailing-slash"` \| `"none"` | `"auto-trailing-slash"` | Trailing-slash normalization for `.html` lookups |

**Request flow (default):**
```
Request → asset exists in [assets].directory?
            ├── yes → serve asset (FREE, unlimited, doesn't count against quota)
            └── no  → invoke worker (main)
                       └── worker may call env.ASSETS.fetch(req) to serve asset manually
                       └── or returns Response
                       └── or falls through to not_found_handling
```

### Resource bindings

```toml
[[kv_namespaces]]
binding = "KV"
id = "1c1dac4766e54a2c85425022a3b1e9da"
preview_id = "..."

[[d1_databases]]
binding = "DB"
database_name = "one"
database_id = "0aa5fceb-667a-470e-b08c-40ead2f4525d"
migrations_dir = "migrations"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "..."

[[queues.producers]]
binding = "QUEUE"
queue = "nanoclaw-agents"

[[queues.consumers]]
queue = "nanoclaw-agents"
max_batch_size = 10
max_retries = 3
dead_letter_queue = "dlq"

[[durable_objects.bindings]]
name = "WSHUB"
class_name = "WsHub"

[[migrations]]
tag = "v1"
new_classes = ["WsHub"]
```

### `[env.production]` — inheritance rules

| Inheritable (top-level applies if omitted) | Non-inheritable (must re-declare) |
|---|---|
| `main`, `compatibility_date`, `compatibility_flags` | `vars`, `kv_namespaces`, `d1_databases` |
| `account_id`, `workers_dev`, `routes` | `r2_buckets`, `durable_objects.bindings` |
| `build`, `placement` | `queues`, `assets` |

### `[placement]` — Smart Placement (free, Workers-only)

```toml
[placement]
mode = "smart"
```

Available all plans. No extra cost. Analyzes ~15 min post-deploy. Applies to `fetch` handlers only (not RPC). Enable when your backend is distant or multi-region; skip for pure-CF stacks.

### `[observability]`

```toml
[observability]
enabled = true
head_sampling_rate = 1   # 0.0–1.0

[observability.logs]
invocation_logs = true
```

Retention: 3 days free, 7 days paid. 256 KB per log (truncated). 5B logs/day account cap.

---

## wrangler 4 CLI

### Deploy

```bash
bun wrangler deploy                  # deploy current config
bun wrangler deploy --dry-run        # validate bundle + bindings, no push
bun wrangler deploy --env production # select [env.production] block
bun wrangler deploy --name my-prod   # override worker name

# Versioned deploys (stage, then flip)
bun wrangler versions upload --tag=rc1 --message="..."  # no traffic
bun wrangler versions list
bun wrangler versions deploy <VERSION_ID>               # flip traffic
```

### Dev

```bash
bun wrangler dev              # localhost with local miniflare + local KV
bun wrangler dev --remote     # hits real CF resources (use with care)
bun wrangler dev --test-scheduled   # exposes /__scheduled for cron
```

### Tail / Logs

```bash
# Live streams — one worker at a time
cd gateway  && bun wrangler tail && cd ..
cd workers/sync && bun wrangler tail && cd ..
cd nanoclaw && bun wrangler tail && cd ..
bun wrangler tail --name=one-substrate

# Filters
bun wrangler tail --format=json | jq .
bun wrangler tail --status=error --sampling-rate=0.1
bun wrangler tail --search="deploy:" --method=POST
```

| Flag | Values |
|---|---|
| `--format` | `pretty` \| `json` |
| `--status` | `ok` \| `error` \| `canceled` |
| `--sampling-rate` | 0.0–1.0 |
| `--search` | free-text in `console.log` |
| `--method` | `GET`, `POST`, ... |

**Dashboard Observability tab:** Workers & Pages → (worker) → Observability → filter by status/outcome/trigger.

### Rollback

```bash
bun wrangler deployments list        # last 10 versions
bun wrangler deployments view <ID>
bun wrangler rollback [VERSION_ID] --message="revert bad deploy"
```

---

## Secrets

Per-worker. Set via wrangler:

```bash
# Gateway (TypeDB auth)
cd gateway
printf 'admin'              | bun wrangler secret put TYPEDB_USERNAME
printf 'your-typedb-pw'     | bun wrangler secret put TYPEDB_PASSWORD
printf "$(openssl rand -hex 32)" | bun wrangler secret put BROADCAST_SECRET
cd ..

# NanoClaw (LLM + channels)
cd nanoclaw
printf 'your-openrouter-key' | bun wrangler secret put OPENROUTER_API_KEY
printf 'your-tg-token'       | bun wrangler secret put TELEGRAM_TOKEN
cd ..

# Astro worker (if it reads secrets at runtime)
printf 'your-key' | bun wrangler secret put MY_SECRET
```

**List / delete:**
```bash
bun wrangler secret list
bun wrangler secret delete <NAME>
```

---

## KV Namespaces

Shared across workers (same ID in all `wrangler.toml` files). Binding name: `KV`. Namespace ID: `1c1dac4766e54a2c85425022a3b1e9da`.

**Snapshots written by sync worker:** `paths.json`, `units.json`, `skills.json`, `highways.json`, `toxic.json` (FNV-1a hash-gated writes, skipped if unchanged).

```bash
# Read key
bun wrangler kv key get --binding=KV paths.json

# Write key
bun wrangler kv key put --binding=KV test "hello"

# Delete key
bun wrangler kv key delete --binding=KV test

# List all keys
bun wrangler kv key list --binding=KV --namespace-id=1c1dac4766e54a2c85425022a3b1e9da
```

---

## D1 Database

Database: `one`. ID: `0aa5fceb-667a-470e-b08c-40ead2f4525d`. Stores signals, messages, sync logs (not the brain — TypeDB is).

```bash
bun wrangler d1 execute one --remote --command="SELECT COUNT(*) FROM signals"
bun wrangler d1 execute one --remote --file=migrations/0010_payment_columns.sql
bun wrangler d1 export one --output=/tmp/one-backup.sql
```

New D1 tables need manual migration — `try/catch` in migration code won't save you (feedback memory).

---

## Custom Domains

### Bind via `wrangler.toml`

```toml
# gateway/wrangler.toml
[[routes]]
pattern = "api.one.ie"
custom_domain = true
```

### Bind via Dashboard

1. https://dash.cloudflare.com → Workers & Pages → (worker) → Settings → Triggers
2. Add Custom Domain → `dev.one.ie` → Save
3. DNS records auto-created; propagates in ~30s

### Astro worker custom domain (Cycle 3 cutover)

`dev.one.ie` CNAME currently points at Pages project. Flip to Workers in CF dashboard:
1. Remove `dev.one.ie` from `one-substrate` Pages project
2. Add `dev.one.ie` to Astro worker (Workers project)
3. TTL matters — note it, don't time the cut

---

## Pricing (2026-04)

| | Workers Free | Workers Paid ($5/mo) |
|---|---|---|
| Base | $0 | $5/mo per account |
| Requests | 100k/day | 10M/mo incl.; $0.30/M overage |
| CPU time | **10 ms** cap/invocation | 30M ms/mo incl.; $0.02/M ms; up to 30s default |
| Bandwidth | Unlimited, free | Unlimited, free |
| **Static asset requests** | **FREE, unlimited** | **FREE, unlimited** |
| Duration wall-clock | No charge | Same |

**Free-tier math for ONE:**
- 100k req/day = ~3M/mo before hitting cap
- Static assets from `[assets]` binding **don't count** against quota — pre-render everything you can
- 10 ms CPU is tight for cold SSR — aggressive KV caching + `prerender = true` keep us in
- Observability: 3-day log retention; 5B logs/day account cap (sampling kicks in beyond)

---

## Pages → Workers Migration State

**Status (2026-04-18):** Cycles 1-3 shipped on main. Cutover is live — `dev.one.ie` now serves from the `one-substrate` Worker; Pages project paused as rollback safety net. Cutover tool: `bun run cf-cutover` (dry-run) / `--execute` (commit). Script in `scripts/cf-cutover.ts`.

| | CF Pages (old) | CF Workers + Assets (new) |
|---|---|---|
| Free tier | same | same |
| `*.pages.dev` URL | ✓ | ✓ (preserved by CF across migration) |
| Bindings | ✓ | ✓ |
| Smart Placement | ✗ | ✓ |
| Tail logs | Limited | Full |
| `wrangler deploy` | ✗ (uses `pages deploy`) | ✓ |
| New CF features | ✗ (frozen) | ✓ |

Cycle 3 steps (dashboard):
1. Create Workers project for Astro SSR
2. Push main branch → Workers deploys
3. Move `dev.one.ie` custom domain from Pages → Workers
4. Pause Pages project (rollback window: 1 cycle)
5. Archive Pages project after no-traffic confirmed

---

## Monitoring Commands

### Live logs (one worker at a time)

```bash
cd gateway  && bun wrangler tail && cd ..
cd workers/sync && bun wrangler tail && cd ..
cd nanoclaw && bun wrangler tail && cd ..
bun wrangler tail --name=one-substrate
```

### Health checks

```bash
time curl -s https://api.one.ie/health -o /dev/null            # expect <10ms
time curl -s https://dev.one.ie/ -o /dev/null                  # expect <500ms (Workers)
time curl -s https://nanoclaw.oneie.workers.dev/health -o /dev/null
```

### Deployment history

```bash
bun wrangler deployments list --name=one-gateway | head -10
bun wrangler deployments view <ID> --name=one-gateway
```

### Performance — TypeDB round-trip via gateway

```bash
time curl -X POST https://api.one.ie/typedb/query \
  -H 'Content-Type: application/json' \
  -d '{"query": "match $u isa unit; limit 1; select $u;", "transactionType": "read"}' \
  -o /dev/null
```

Expected: gateway <10ms, full TypeDB query <100ms.

---

## Troubleshooting

### `Authentication failed (status: 400)`

```bash
echo $CLOUDFLARE_GLOBAL_API_KEY   # should be 40 chars
echo $CLOUDFLARE_EMAIL
echo $CLOUDFLARE_ACCOUNT_ID       # should be 32 hex chars
set -a && source .env && set +a   # reload
```

### Slow worker startup (>400 ms)

Bundle too large. Check:
```bash
bun wrangler deploy --dry-run | grep "Total Upload"
```
>3 MiB needs trimming. For Astro worker, see `/astro` bundle rules.

### Gateway 502

TypeDB down or credentials wrong:
```bash
# Update TypeDB password
cd gateway && printf 'new-pw' | bun wrangler secret put TYPEDB_PASSWORD && cd ..
```

### Queue backed up (NanoClaw)

```bash
bun wrangler queues consumers list nanoclaw-agents
# No built-in purge — dashboard only, or drain via consumer
```

---

## GitHub Actions CI

Repo includes `.github/workflows/deploy.yml`.

**Required secrets** (Settings → Secrets → Actions):

| Secret | Value |
|---|---|
| `CLOUDFLARE_GLOBAL_API_KEY` | 40-char Global API Key from `.env` |
| `CLOUDFLARE_EMAIL` | `tony@one.ie` |
| `CLOUDFLARE_ACCOUNT_ID` | `627e0c7ccbe735a4a7cabf91e377bbad` |

**Do NOT set `CLOUDFLARE_API_TOKEN`** — workflow blanks it to force Global Key auth.

**Production gate** (Settings → Environments → `production`):
1. Deployment branches: `main` only
2. Required reviewers: add yourself (or team)

Behavior:
```
push feature/**  →  verify → deploy (auto-approved)
push main        →  verify → build → 🚦 reviewer → deploy
workflow_dispatch →  manual trigger
```

---

## Reference

- `docs/TODO-cf-workers-migration.md` — C1+C2+C3 shipped; cutover live on `dev.one.ie`
- `docs/deploy.md` — 8-step pipeline, bundle diagnosis, LOCKED rules
- `.claude/commands/deploy.md` — pipeline script + bundle rules + known-flaky + first-time setup (merged from skills/deploy.md 2026-04-19)
- [CF Workers Static Assets docs](https://developers.cloudflare.com/workers/static-assets/)
- [wrangler 4 configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)
- [CF Workers framework guide — Astro](https://developers.cloudflare.com/workers/frameworks/framework-guides/astro/)
- Dashboard: https://dash.cloudflare.com/627e0c7ccbe735a4a7cabf91e377bbad

---

**Version:** 2.0.0 — Workers + Static Assets (2026-04-18)
**Previous:** 1.0.0 (CF Pages era)
