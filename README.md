> **Astro 7 · React 19 · shadcn/ui · Tailwind 4 · Cloudflare Workers**

**The open-source Astro starter you actually own.** Free forever, yours to sell at any price you set, with one obligation: keep the ONE brand, logo and link in your deployed product. Clone it, brand it in six tokens, ship it to Cloudflare's edge.

## 60 seconds to running

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
cd site && bun run dev          # → http://localhost:4321
```

**No account, no API key, no backend.** Better Auth and Cloudflare D1 handle sessions and data locally from the first run.

Prefer a single scaffold over the whole monorepo? Same shape, one command:

```bash
npx oneie create my-app         # .claude/ + .mcp.json included
```

Either way you get a real site, not a hello-world: a home page, blog, docs, a product catalog with checkout, auth pages, an SEO graph, and a design system — all wired, all yours.

## Free forever, and yours to sell

**100% free — not a trial, not a tier, not open-core.** The whole product is here: source, design system, plugins, agents, CLI. Clone it, read every line, modify it, brand it, and **sell what you build with it** at any price you set. No usage limits. No royalty fees.

**One obligation:** keep the ONE brand, logo and link in your deployed product. That is the whole catch, and it is stated here rather than left in a file for you to find. The [Enterprise License](LICENSE-ENTERPRISE.md) removes it.

[The ONE License v1.0](LICENSE) grants everything else, in perpetuity and irrevocably: commercial use, derivative works, software as a service, AI training, sublicensing, distribution, resale, and patents on what you build. No copyleft. You own your modifications. You never have to share your code or data. It is compatible with MIT, Apache, GPL, BSD and MPL.

---

## Why this one

**Every business is already telling a story. Most of them are telling it one customer at a time.** This repo is what happens when you tell it once, to a machine that holds the shape: seven beats, a promise with one checkable proof, and a site and a team of agents that tell it everywhere, forever. [How that works →](#tell-it-once--the-story-layer)

Three things make it different from every other starter:

1. **It runs standalone.** No account, no API key, no backend. Sessions, auth, and data work locally from your first `bun run dev`.
2. **It scales into a platform.** Set one environment variable and the same site gains the full ONE backend — AI, CRM, payments, agents — with zero rewrites.
3. **It knows what a story is.** Not a blog folder — a `story` type, a storyteller agent, a registry of every framework that has survived, and a funnel that ends at the only growth number worth having.

Real numbers, verified against a production build, not asserted: **100 on Lighthouse (Accessibility · Best Practices · SEO) · LCP 137 ms · CLS 0.00.** [See how to check it yourself.](#performance)

---

## Two ways to run it — you choose, any time

The site has **two independent switches**. Neither is required. You can flip them separately, and flip them back.

```
   ┌─────────────────────────┐        ┌─────────────────────────────────┐
   │      SITE ONLY          │  ───►  │        SITE + BACKEND           │
   │      (the default)      │        │       (one env var away)        │
   ├─────────────────────────┤        ├─────────────────────────────────┤
   │  Astro + React + shadcn │        │  everything on the left, plus:  │
   │  Better Auth + D1       │        │  AI chat · CRM · analytics      │
   │  Blog · docs · products │        │  agents · workflows · wallet    │
   │  Stripe checkout        │        │  credit metering · lifecycles   │
   │  100 % local, 100 % free│        │  the ONE backend behind it      │
   └─────────────────────────┘        └─────────────────────────────────┘
```

**Switch 1 — the backend.** Without `ONE_API_KEY` the app runs standalone (local auth + D1). Add the key and it connects to `https://one.ie` — AI chat, analytics, CRM, agents, credit metering. Nothing about your code changes; the plugins just start talking to a backend.

**Switch 2 — which widgets ship.** Every plugin is a build-time Astro integration you list in `site/one.config.ts`. Add `chat()` and a chat widget mounts; remove it and it's gone. A key alone never mounts anything you didn't ask for.

You can build and sell a whole business on the left column and never touch the right. Or grow into it the day you need to. **No lock-in, no rewrite, no rug pull.**

---

## What's in the box

Everything below ships in this repo, free, working:

**The site**
- Astro 7 + React 19 islands + shadcn/ui + Tailwind 4, SSR on Cloudflare Workers
- Static-first — most pages ship **zero JavaScript**, which is *why* it's fast
- Content collections for **blog**, **docs**, and **products** — write Markdown, get routes
- Auth pages + Better Auth + D1 sessions that work with no backend at all
- Error pages, RSS, sitemaps, and a full **SEO structured-data graph** (schema.org JSON-LD, git-based `lastmod`)

**Commerce, built in**
- Products priced **server-side** — nobody pays less than you set, whatever they send
- Stripe checkout and a crypto **wallet** (self-custody keys via `one wallet keygen`)
- Payment events that settle to your treasury — no ONE credits, no custody change

**Design system**
- **Six tokens rebrand the entire site** — swap six HSL values, everything follows
- Showcase pages included: `/design`, `/components`, `/motion`, `/patterns`

**AI-native from the first commit**
- `.claude/` (hooks, rules, skills, commands) + `.mcp.json` at the repo root
- The `one` / `oneie` CLI — every command is one typed call, no separate API to learn
- `ai/` folder: agents, skills, tools, and workflows as plain Markdown + TOML

**Story, as a first-class type**
- `ai/skills/story/` — the six tests a story has to pass, the seven beats, the arc, and the refusals
- `ai/skills/story/frameworks.md` — **a registry, not a rulebook**: Labov, StoryBrand, Kishōtenketsu, the Story Circle, quest grammar and a dozen more, each mapped onto the same seven beats. Adding a framework is adding a row
- `ai/skills/story/mediums.md` — one renderer per surface. The beats never change; the order they're spoken in does
- `ai/agents/storyteller.md` — the agent that listens, files beats, speaks the spine back, and then goes quiet
- `data/types/story.toml` + `data/lifecycles/story.toml` — the story as a typed entity, and the ten steps of its life after it ships

**Nine free plugins**
- auth · backend · chat · track · blog · booking · docs · mail · media

---

## Knows · grows · shows

The repo is three folders, one idea:

```
  ai/ ─────────► data/ ─────────► site/
 knows           grows            shows
```

```
.claude/         Claude Code setup — hooks, rules, skills, commands
.mcp.json        MCP server — every ONE verb as a native tool
ai/              knows  → agents · skills · tools · workflows · context.md
data/            grows  → types · content · lifecycles
site/            shows  → Astro + shadcn + plugins (one.config.ts)
workspace.toml   who you are
packages/        paid plugin stubs only — see Paid plugins below
```

**Knows.** Your agents, skills, tools, and workflows — plain Markdown and TOML. An agent reads `ai/context.md` on every turn, so it always knows your business.

**Grows.** Your data model and your lifecycles — the stages a contact, deal, or agent moves through. Declare a type once; it's typed everywhere.

**Shows.** The site people see. Astro 7, React 19, shadcn/ui, on Cloudflare's edge.

`CLAUDE.md` is the operating manual; `AGENTS.md` is the briefing an AI agent reads before it touches anything.

---

## Tell it once — the story layer

A form is not a story. Every starter on the internet gives you a blog folder and
calls that content. This one gives you the craft that goes around it, as files an
agent reads — never as a paragraph buried in a prompt.

### Six tests, run at intake

A story that fails one is named in a sentence and handed back. It is never
quietly padded until it passes.

| Test | Fails when |
|---|---|
| Someone wants something | there is no Want — it's a description |
| The want is hard to get | nothing stands in the way — it's a shopping list |
| Things cause other things | it's a sequence, not a chain |
| Something is at stake | nothing is lost if the Want fails |
| Something changes | the world at the end is the world at the start |
| It is specific | it's true and general — "we struggled" instead of one detail |

### Seven beats

**World · Cast · Knock · Want · Way · Turn · Lesson.** That's the whole form. A
child, a founder or an agent can fill it in, and nobody has to learn a new
vocabulary on either side.

The storyteller only ever *asks* for two of them — the **Want** and the
**Knock**. The Way, the Turn and the Lesson are supplied by the work and
recognised by the teller. It never asks what you'll learn from this; nobody
knows, and asking makes a machine sound like a school.

### Promise · progress · payoff

The arc, and the one rule a reader won't forgive you breaking.

```
  promise  ─────────►  progress  ─────────►  payoff
  terms + one proof    the board walking      the proof passed
  frozen at "yes"      settles, not effort    the Turn you promised
```

**Pay off what was promised, not something else.** The proof is written down at
the moment you agree and can never be swapped for an easier one afterwards.
That's the reason to trust the thing, and it's a shell command, not a claim.

### A registry, not a rulebook

`ai/skills/story/frameworks.md` holds one row per framework, each mapping its own
stops onto the same seven beats, with the kind of teller it serves:

| Beat | Story Spine | Story Circle | Kishōtenketsu | Quest grammar |
|---|---|---|---|---|
| World | once upon a time | you | ki | the world |
| Knock | one day | need | shō | the call |
| Want | *(in "one day")* | go | shō | objective |
| Way | because of that… | search / find | shō | the obstacle |
| Turn | until finally | take / return | **ten** | the reward |
| Lesson | ever since then | change | ketsu | experience |

**Adding a framework is adding a row.** Labov for listening to a real person.
StoryBrand when the teller sells and the customer is the hero. Raskin's
strategic narrative for a founder with a pitch. Kishōtenketsu for a Turn with no
enemy — which is most real tellers, because a mover in Austin isn't fighting
anyone. The agent states its pick in one sentence so you can overrule it.

### One story, every surface

The beats never change between media. The order they're spoken in does, and
`ai/skills/story/mediums.md` says how: the headline as promise and the proof
block as payoff for a **page**, a cold open on the Knock for **voice**, the Turn
in the first five seconds for **video**, the spine for a **conversation**. A
medium with no renderer is named, not faked.

### Speak it back

```
Once upon a time there was a mover in Austin.
Every day she told her story to one customer at a time.
One day she told it once, to ONE.
Because of that, a promise was made.
Because of that, the agents built the page.
Until finally the proof passed.
Ever since then, the page has told it for her.
```

That's the story spine — the one grammar that forces causation, because you
can't say "because of that" without naming a cause. It's the first thing the
storyteller says back after intake, before anything is promised, and then it
asks the only question that matters: **does this promise tell your story?**

### The story is alive

Shipping is where it starts working, not where it ends. `data/lifecycles/story.toml`
tracks ten steps:

```
told → framed → promised → building → settled
     → viewed → completed → shared → converted → retold
```

Each one is an ordinary tracked event. **Views to completes** is whether the
medium holds attention. **Views to shares** is organic reach. **Views to
conversions** is sales. And **retells over stories told is the k-factor** — above
one and every story you tell produces more than one more.

When a story converts, the framework and the medium that earned it get the
credit, and frames that stop converting fade on their own. Two frames for one
story is two stories with different tags and the stronger one wins the next
pick. That's an A/B test, and you didn't have to build a testing product to get
it.

### The refusals

These are load-bearing, not decoration. A machine that can make any story
persuasive has to be allowed to decline.

- No **Want with no observable** — if nothing could check it, it isn't a Want.
- No story told **for someone else** without their name on the Cast and their consent.
- No **status claim that wasn't measured**.
- No **framework chosen that the teller didn't see**.
- No **Lesson invented** by the machine.
- A decline is **recorded with its reason**, never a silent stall.

> If the story cannot help, at least it must not hurt.

---

## Clients — one folder, three ideas, scoped

`clients/<slug>/` is the same `ai/ · data/ · site/` shape as the root, holding
everything about one client and nothing about anyone else:

```
clients/ehc/
  workspace.toml     who they are
  ai/                their agents, their skills, their context.md
  data/              their types and their lifecycles
  site/              their one.config.ts, their brand tokens, their content
  source/            raw material, gitignored — never shipped
```

A client folder is **portable and inspectable**: everything an agent needs to
speak for that business is text you can read, in a folder you can hand over. The
brand tokens live in the client's own `one.config.ts`, so the same site
component tree repaints per client without a fork.

---

## Free plugins

```
[✓] auth   [✓] backend   [✓] chat   [✓] track
[✓] blog   [✓] booking   [✓] docs   [✓] mail   [✓] media
```

| Package | What |
|---|---|
| `@oneie/plugin-auth` | better-auth client — sign-in works standalone, auth server optional |
| `@oneie/plugin-backend` | `@oneie/sdk` client + React 19 hooks |
| `@oneie/plugin-chat` | Served AI chat widget — zero bundle |
| `@oneie/plugin-track` | Served analytics pixel — zero bundle |
| `@oneie/plugin-blog` | Markdown blog, zero config |
| `@oneie/plugin-booking` | Booking / scheduling widget |
| `@oneie/plugin-docs` | Docs site, same content pipeline as this repo |
| `@oneie/plugin-mail` | Transactional email |
| `@oneie/plugin-media` | Media upload + serve |

Install from npm — `bun add @oneie/plugin-chat` — no monorepo checkout needed. `@oneie/frontend` and `@oneie/design` are free too; `site/` depends on all of it via real semver.

---

## Brand it in six tokens

`site/one.config.ts` is the single control surface. Six HSL tokens repaint the whole site; the plugin list decides which widgets ship.

```ts
import { defineOne } from '@oneie/frontend'
import { auth } from '@oneie/plugin-auth'
import { track } from '@oneie/plugin-track'
import { chat } from '@oneie/plugin-chat'

export default defineOne({
  backend: {
    baseUrl: 'https://one.ie',
    // apiKey loaded from a Cloudflare binding at runtime — never committed.
    // No ONE_API_KEY set? The site runs standalone. This block is inert.
  },
  brand: {
    tokens: {
      primary:    'hsl(216 55% 25%)',
      secondary:  'hsl(219 14% 28%)',
      tertiary:   'hsl(105 22% 25%)',
      background: 'hsl(0 0% 93%)',
      foreground: 'hsl(0 0% 100%)',
      font:       'hsl(0 0% 13%)',
    },
  },
  plugins: [
    auth(),
    track({ ws: 'your-workspace' }),
    chat({ agent: 'your-agent' }),
  ],
})
```

Don't want the backend? Don't add the plugins. Nothing here requires it.

---

## Sell something, get paid, watch it happen

Write a product as a Markdown file in `site/src/content/products/`:

```markdown
---
name: Sticker Pack
priceCents: 1200
description: Five vinyl stickers, shipped worldwide.
---
```

It's for sale — priced **server-side**, so nobody can pay less than `priceCents` no matter what they send. `bun run deploy` puts it on your own domain.

Money lands straight in the wallet from `one wallet keygen` — self-custody, your keys. Nothing above this line needs an account. Run `one onboard` once, though, and the moment someone pays it shows up in your workspace inbox:

```
  ● pay-open · Sticker Pack · $12.00 · SUI
    settled 0.4s ago → your treasury (no ONE credits, no custody change)
```

One command connects it. Zero commands are required to sell without it.

---

## The `one` CLI — teach a human or an agent in one screen

`npm install -g @oneie/cli` gives you `one` and `oneie` — same binary, either name. Every command is one typed call into the same API, so there is no second interface to learn, and it behaves identically whether a human types it or an agent runs it headless.

**Bootstrap, once**

```bash
npx oneie create <name>         # scaffold this repo shape — or git clone it
one onboard [--name N]          # provision a workspace + agent identity, no prep
one whoami                      # who this key is, which workspace — the footing check
one doctor                      # config, key, reachability — exit 0/1, safe for CI
```

**Operate**

```bash
one push [path] [--dry-run]     # upsert your agents + skills, then close the loop
one deploy                      # wrangler pages deploy site/
one status                      # your usage — credits, meters, plan
one ship "<message>"            # git add + commit + push in one step
```

**Grow**

```bash
one market [query]              # browse the capability market
one hire <skillId> --budget 50  # hire a peer agent for a skill
one earn                        # accept payment for work you do
one staff invite [--role R]     # invite a human to this workspace
one plugin list                 # what's free, what's paid — then plugin buy <name>
```

**Discover the rest** — the whole API is one command away, grouped by recipe:

```bash
one catalog                     # every capability, grouped by recipe
one ask <receiver> {json}       # typed pass-through — validated before it hits the network
```

`--dry-run` projects the outcome and writes nothing. Dry-run-first on every irreversible verb.

---

## AI-ready — the repo Claude Code understands

Open the root in Claude Code and it's fully wired — `.claude/` and `.mcp.json` live at the root.

- **`.claude/`** teaches your AI assistant to build here correctly: file conventions, plugin patterns, design rules, hard constraints. Works with Claude Code, Cursor, and any editor that reads `CLAUDE.md`.
- **`.mcp.json`** exposes the whole ONE API — signal, ask, catalog, and every domain verb — as native MCP tools, no wrapper needed. It reads `ONE_API_KEY` from your shell:

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' site/.env.local | cut -d= -f2)
```

`npx oneie create <name>` downloads this same shape — a freshly scaffolded node is AI-connected from its first `git init`.

---

## Performance

Measured against a production build (`astro build` + `astro preview`), not dev mode, with Chrome's Lighthouse and performance-trace tooling:

```
 Lighthouse — production build
 ──────────────────────────────
 Accessibility   ██████████ 100
 Best Practices  ██████████ 100
 SEO             ██████████ 100
 ──────────────────────────────
 LCP  137ms        CLS  0.00
```

Static-first Astro, zero JavaScript by default, deployed to Cloudflare's edge — that's the mechanism, not a marketing line. Check it yourself: `cd site && bun run build && bun run preview`, then run Lighthouse against `localhost:4322`.

---

## Develop

```bash
bun install              # install all workspaces
cd site && bun run dev   # dev server — no backend needed
bun run typecheck        # astro check (root)
bun run setup            # optional — mints ONE_API_KEY into site/.env.local
bun run deploy           # ship site/ to Cloudflare
```

Contributions welcome — open an issue or a PR at [github.com/one-ie/one](https://github.com/one-ie/one).

---

## Paid plugins

```
[$] admin, course, dashboard, shop — everything else on this page is [✓] free
```

Everything above is free. This is the one section that isn't.

| Package | What |
|---|---|
| `@oneie/plugin-admin` | Admin Console — served via x402, gated by an `admin` entitlement |

Paid plugins ship as thin stubs in `packages/` — never published — built on `@oneie/plugin-premium`'s entitlement gate. They load the real UI from `one.ie/x/<plugin>.js` after payment. `one plugin buy <name>` unlocks one; nothing ships to your repo before you do.

---

## The licence

[The ONE License v1.0](LICENSE), in one line: **everything, in perpetuity, for free — keep the ONE brand, logo and link in your deployed product.** [The full grant is at the top of this page.](#free-forever-and-yours-to-sell)

The ONE backend itself is not distributed. This repo is the fully functional client, and it runs without that backend. Read the [full license](LICENSE) before you rely on it.

Free hosting on Cloudflare's global edge. Free design system. 100 on Lighthouse, measured, not claimed. **This is yours.**
