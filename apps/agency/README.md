# Agency Node

You already know Claude Code. You already know how to get code written fast. This repo is the next step: it gives you the tools and the vocabulary to understand what you're building, not just that it works. That's the difference between vibing and engineering — and it's a smaller gap than you think.

---

## What this is

Your agency node — three folders that declare everything your agency knows, grows, and shows. One CLI (`npx oneie`) operates it. No servers to run, no database to manage, no substrate code to write.

```
my-agency/              ← your agency (a node)
├── ai/                 knows  →  agents · skills · tools · workflows · context.md
├── data/               grows  →  types · content · lifecycles
├── site/               shows  →  Astro + shadcn + ONE plugins (one.config.ts)
├── agency.toml         who you are
└── clients/
    └── acme/           ← a client (same shape)
        ├── ai/ data/ site/
        └── client.toml
```

Every file compiles to one typed call on the ONE substrate. Every command calls a **receiver** — a named, typed action. That's the whole model.

**2-minute setup:**

```bash
# 1. Install the ONE CLI
npm install -g @oneie/cli        # gives you: one · oneie

# 2. Configure
cp .env.example .env.local
# Edit .env.local — set ONE_API_KEY and AGENCY_OWNER_EMAIL

# 3. Provision
one setup

# 4. You're live
one status                    # see your P&L
one client add acme           # add a client
one push                      # ship agents + skills
```

---

## The node shape

Three folders, one headline file each:

| Folder | Is | Headline file |
|--------|-----|---------------|
| `ai/` | what it knows | `ai/context.md` → agents read this every turn |
| `data/` | what it grows | `data/lifecycles/*.toml` → up to 5 funnels |
| `site/` | what it shows | `site/one.config.ts` → brand tokens + backend key |

A client inherits the agency's agents, skills, and lifecycles by sitting below it, and overrides by name. `one push clients/acme` merges `acme/ai/` over `ai/`; the client wins.

---

## The commands

**Build recipe** — provision and operate:

```bash
one setup                       # stand up your agency node (idempotent)
one client add <slug>           # managed client you own (atomic: workspace + credits + brand)
one client add <slug> --dry-run # see exactly what will happen before writing anything
one client invite <slug>        # self-serve — client owns their workspace, you keep the margin
one push [path] [--dry-run]     # upsert agents + skills, then close the loop
one status                      # funded · burned · margin · balance · cap
one deploy                      # wrangler pages deploy site/
```

**Everything else on ONE:**

```bash
one catalog [--goal G]          # list every receiver you can call, grouped by recipe
one ask <receiver> {json}       # call any receiver, payload validated before the network
one signal <receiver> {json}    # fire-and-forget variant
one market [query]              # list the capability market
one hire <skillId> --budget 50  # hire a peer agent for a skill
one bounty <skillId>            # post a bounty
one earn                        # accept payment
one usage                       # your plan metering
one recall [--about <slug>]     # cross-session memory
```

`--dry-run` injects `simulate: true` — projects the outcome, commits nothing. Dry-run-first on every irreversible verb.

---

## Why commands can't silently fail

Every `one` command enforces one rule: if the outcome isn't `result`, it throws.

| Outcome | Means |
|---------|-------|
| `result` | Worked. Here's the data. |
| `timeout` | The substrate didn't respond in time. |
| `dissolved` | The action was cancelled or pre-empted. |
| `failure` | Something went wrong. Here's why. |

Vibe coding ignores the last three. Engineering closes the loop.

---

## Two halves: `one` acts, `/do` builds

**`one`** (`@oneie/cli`) — reaches the world. Every command is one typed call to the ONE substrate via `@oneie/sdk`. Use it to provision, push, hire, earn.

**`/do`** — builds what acts. The `@oneie/claude` harness (a devDependency). Use it to write agents, fix code, and ship — gated by a quality rubric before anything lands.

```
        build with                   act with
   ┌────── /do ──────┐          ┌──── one ──────┐
   idea → spec → code             catalog → ask
   (W1 → W2 → W3 → W4)           (@oneie/sdk)
   └── rubric ≥ 0.65 ┘          └── result|timeout|… ┘
```

Drive it: `/do "add agent: customer onboarding"` — it walks the artifact spine and ships.

---

## Agency lifecycle — 5 steps

**Step 1 — create account [one.ie, 1 min]**

1. Sign up at [one.ie](https://one.ie), passkey only.
2. Upgrade to Agency plan (*Settings → Plan*). Unlocks client workspaces, white-label, revenue sharing.
3. Mint an API key (*Settings → API keys*) — scoped key for your subtree only.

**Step 2 — scaffold [terminal, 1 min]**

4. `npx oneie create agency my-agency --slug my-agency --name "My Agency"` — downloads this template, writes your slug + name into `agency.toml`
5. `cd my-agency && cp .env.example .env.local` — fill in `ONE_API_KEY` and `AGENCY_OWNER_EMAIL`
6. `one setup` — creates workspace + actor + scoped key (idempotent)

**Step 3 — verify [1 min]**

7. `one status` — see your agency P&L (0 clients, 0 balance until you fund)

**Step 4 — set economics [one.ie, optional]**

8. Configure `markup_pct`, `monthly_cap` in `agency.toml`
9. Fund your credit pool via one.ie (*Settings → Billing*)

**Step 5 — operate**

10. `one client add <slug>` — provision a client
11. Edit `ai/agents/*.md`, then `one push`
12. Watch `one status` as clients burn credits — margin flows automatically

---

## P&L

```
$ one status
Agency: My Agency (my-agency)  plan=agency  markup=20%  pool=4,820,000 cr

CLIENT  PLAN    FUNDED  BURNED  MARGIN(20%)  BALANCE  CAP
acme    studio  50,000  31,240  6,248        18,760   50,000
beta    studio  50,000   4,010    802        45,990   —

  total  burned 35,250  ·  margin 7,050  ← your margin this period
```

---

## What you cannot do from here

- Edit the ONE schema or write TypeDB directly — that's the monorepo.
- Provision outside your own subtree — the key is scoped to `$AGENCY_SLUG`.
- Set a client's margin to bill yourself — limits are server-side and signed.

---

## Site

`site/` is the [ONE Astro starter](https://github.com/one-ie/one) — shadcn/ui, React 19, Cloudflare Workers, pre-wired to ONE.

```bash
cd site && bun install && bun run dev    # local dev
one deploy                               # ship to Cloudflare Pages
```

Brand the site in `site/one.config.ts` — 6 tokens, everything rebrands.

---

## Staying connected — realtime signals

The agency runs on signals. `.claude/scripts/cc-connect.sh` keeps you live on every channel — client spaces, peer Claude Code sessions, Telegram — over the substrate's SSE stream. The channel pushes; nothing polls.

```bash
cc-connect listen                          # listen to every subscribed group
cc-connect send --to space:<client> "…"    # post into a client's inbox
cc-connect read --all                      # everything new, one view
```

**Always-on (macOS launchd).** Each channel gets a persistent listener (`cc-connect listen-fg <group>` + `KeepAlive`) that survives reboots — so a client message or a peer ping never waits. Add one: `cc-connect join <group>`, mirror a plist into `~/Library/LaunchAgents/`, then `launchctl bootstrap gui/$(id -u) <plist>`.

**Smart, actionable alerts.** Every incoming signal raises a macOS notification and a Telegram alert, auto-prioritised (🔴 urgent · 🟡 question · 🔵 fyi) and carrying the sender, a preview, a one-tap reply command, and the workspace-inbox link. Your own posts and bot senders are filtered, so it's signal, not noise.

**Broadcast.** One message, every channel: fan a `cc-connect send` across your groups (plus Telegram) to reach the whole agency at once. A `world:broadcast` primitive that does this in a single signal is the next build.

---

## Learn more

| Read | For |
|------|-----|
| [CLAUDE.md](CLAUDE.md) | Operating manual — the node shape, the commands, the rules |
| [AGENTS.md](AGENTS.md) | How an agent orients and builds in this repo |
| [clients/mover/README.md](clients/mover/README.md) | A worked vertical template — clone it per real operator |
| [clients/movers-demo/](clients/movers-demo/) | The same template, fully filled with fictional demo data |
