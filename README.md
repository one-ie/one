<h1 align="center">ONE</h1>

<p align="center">
  <strong>Design beautiful websites with perfect Lighthouse scores.</strong><br>
  Astro 7 · React 19 · shadcn/ui · Tailwind 4 · Cloudflare Workers
</p>

<p align="center">
  <a href="https://github.com/one-ie/one/actions/workflows/ci.yml"><img alt="CI build status" src="https://github.com/one-ie/one/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Licensed under the ONE License v1.0" src="https://img.shields.io/badge/license-ONE%20v1.0-2b8a3e"></a>
  <a href="https://www.npmjs.com/package/@oneie/cli"><img alt="@oneie/cli on npm" src="https://img.shields.io/npm/v/%40oneie%2Fcli?label=%40oneie%2Fcli&color=0b7285"></a>
  <a href="https://www.npmjs.com/package/@oneie/frontend"><img alt="@oneie/frontend on npm" src="https://img.shields.io/npm/v/%40oneie%2Ffrontend?label=%40oneie%2Ffrontend&color=0b7285"></a>
</p>

A whole website in one repo: home, blog, docs, a product catalog that takes real
money, auth, an SEO graph, a design system, and a team of AI agents. It runs with
no account, no API key and no backend.

**Free. Yours to sell at any price you set. One obligation: keep the ONE brand,
logo and link in your deployed product.** That is the entire catch, and it is
[stated here](#the-one-licence) rather than left in a file for you to find.

![The ONE home page. A badge reads ASTRO 7 + REACT 19 above the headline "Design beautiful websites with perfect Lighthouse scores", with two buttons: Get started free, and See the design system. On the right, a dark card headed LIVE — NOT A MOCKUP, dated 2026-07-09, shows four green rings each reading 100, labelled Perf, A11y, Best and SEO, with the footnote "Desktop, this exact page. 86 on throttled Slow 4G."](.github/assets/01-hero.png)

---

## 60 seconds to running

```bash
git clone https://github.com/one-ie/one my-app
cd my-app && bun install
cd site && bun run dev
```

Open **http://localhost:4321**. That is the whole setup. Better Auth and
Cloudflare D1 give you sessions and data locally from the first run, so nothing
above needs a key, an account or a card.

Prefer one command to a clone? The scaffold pulls the same shape, `.claude/` and
`.mcp.json` included:

```bash
bunx oneie@latest create node my-app
```

**Next:** the [step-by-step tutorial](docs/tutorial.md) walks from empty folder to
deployed site — your first colour change, your first post, your first product,
and the build gate. About 20 minutes.

---

## Contents

- [Free forever, and yours to sell](#free-forever-and-yours-to-sell)
- [Two ways to run it](#two-ways-to-run-it)
- [What's in the box](#whats-in-the-box)
- [Brand it](#brand-it)
- [Sell something](#sell-something)
- [Motion and components](#motion-and-components)
- [Performance](#performance)
- [The `one` CLI](#the-one-cli)
- [Tell it once: the story layer](#tell-it-once-the-story-layer)
- [Plugins](#plugins)
- [AI-ready](#ai-ready)
- [The ONE Licence](#the-one-licence)

---

## Free forever, and yours to sell

Not a trial. Not a free tier. Not open-core. The whole product is in this repo:
source, design system, plugins, agents, CLI.

[The ONE License v1.0](LICENSE) grants, in perpetuity and irrevocably:

| You may | Without |
|---|---|
| Use it commercially, anywhere | Usage limits |
| Modify it and own your modifications | Royalty fees |
| **Sell and resell** what you build, at any price you set | Sharing your code or data |
| Sublicense and distribute it | Copyleft |
| Run it as a service | Asking permission |
| Train AI on it | Telling us |
| Patent what you invent on top of it | A contributor agreement |

It is compatible with MIT, Apache, GPL, BSD and MPL.

**The one obligation:** keep the ONE brand, logo and link in your deployed
product. The [Enterprise License](LICENSE-ENTERPRISE.md) removes it for
white-label work.

---

## Two ways to run it

The site has two independent switches. Neither is required, both flip back.

```
   ┌─────────────────────────┐        ┌─────────────────────────────────┐
   │      SITE ONLY          │  ───►  │        SITE + BACKEND           │
   │      (the default)      │        │       (one env var away)        │
   ├─────────────────────────┤        ├─────────────────────────────────┤
   │  Astro + React + shadcn │        │  everything on the left, plus:  │
   │  Better Auth + D1       │        │  AI chat · CRM · analytics      │
   │  Blog · docs · products │        │  agents · workflows · wallet    │
   │  Stripe checkout        │        │  credit metering · lifecycles   │
   │  100% local, 100% free  │        │  the ONE backend behind it      │
   └─────────────────────────┘        └─────────────────────────────────┘
```

**Switch 1: the backend.** Without `ONE_API_KEY` the app runs standalone on local
auth and D1. Add the key and the same code talks to `https://one.ie`. No rewrite.

**Switch 2: which widgets ship.** Every plugin is a build-time Astro integration
you list in `site/one.config.ts`. Add `chat()` and a chat widget mounts. Remove it
and it is gone. A key on its own never mounts anything you did not ask for.

You can build and sell a business on the left column and never touch the right.

---

## What's in the box

<details open>
<summary><strong>The parts people clone it for</strong></summary>

- Astro 7 + React 19 islands + shadcn/ui + Tailwind 4, SSR on Cloudflare Workers
- Static-first: most pages ship zero JavaScript, which is *why* it is fast
- Products priced **server-side**. `resolveProduct()` reads the catalog, never a
  client-sent amount, so a buyer cannot tamper with a price
- Stripe checkout, and a self-custody crypto wallet via `one wallet keygen`
- Six tokens in `site/src/lib/themes.ts` carry every component. Showcase pages
  at `/design`, `/components`, `/motion`, `/patterns`
- Content collections for blog, docs and products. Write Markdown, get routes
</details>

<details>
<summary><strong>And everything under it</strong></summary>

- Auth pages, Better Auth and D1 sessions that work with no backend at all
- Error pages, RSS, sitemaps, and a full SEO structured-data graph (schema.org
  JSON-LD, git-based `lastmod`). The build validates H1s, internal links, image
  alt text and metadata on every page, and fails loudly when one is wrong
- `.claude/` (hooks, rules, skills, commands) and `.mcp.json` at the repo root
- `ai/` holds agents, skills, tools and workflows as plain Markdown and TOML
- `data/` holds your types and lifecycles, declared once, typed everywhere
</details>

The repo is three folders and one idea:

```
  ai/ ─────────► data/ ─────────► site/
 knows           grows            shows
```

`CLAUDE.md` is the operating manual. `AGENTS.md` is the briefing an AI agent reads
before it touches anything.

---

## Brand it

Six tokens carry the whole site: `primary`, `secondary`, `tertiary`,
`background`, `foreground`, `font`. Every component is built on them, so changing
one value re-skins everything downstream of it.

![The ONE Design System page, with a Light / Dark / Reset toggle and a section headed "The 6 editable tokens". Live clickable swatches show background #11161C, foreground #1F252D, font #FFFFFF, primary #759CD7, secondary and tertiary #9CB992. The copy reads: Click any swatch to recolor live. Picks apply to the whole site and persist.](.github/assets/02-design.png)

**Two ways to change them.** Click the swatches on `/design` and the picks apply
live and persist, no code. Or edit a preset in `site/src/lib/themes.ts`, the
single source of truth for all 14 themes:

```ts
{
  key: 'navy',
  name: 'Navy',
  light: { primary: '216 55% 25%', secondary: '219 14% 28%', /* … */ },
  dark:  { primary: '216 55% 65%', secondary: '219 14% 65%', /* … */ },
}
```

Save the file and the running dev server repaints in about four seconds.

`site/one.config.ts` is the other control surface. It decides which plugins are
compiled in:

```ts
export default defineOne({
  backend: { baseUrl: 'https://one.ie' },
  plugins: [auth(), backend(), blog(), docs(), pages({ ws }), track({ ws })],
})
```

---

## Sell something

Write a product as a Markdown file in `site/src/content/products/`. Three fields
are required:

```markdown
---
name: Own Your Stack
priceCents: 2499
description: The technical playbook behind this exact site.
---
```

It is now for sale, priced server-side. Money lands in the wallet from
`one wallet keygen`. Your keys, your treasury, no custody change.

![A page headed "Two rails to get paid. Both live, right here." Four checks read: No custody ever, Signed server-side, Cards by Stripe, Zero config to start. Below is a working "Create a payment link" card with an Amount field set to 25 USD, a "For" field, currency chips for SUI, ETH, SOL and BTC, and a Create link button. The copy reads: Real, signed, live against pay.one.ie — not a mock.](.github/assets/03-payments.png)

---

## Motion and components

![A page headed MOTION SYSTEM · V1 with the headline "Crisp. Purposeful. Fast." The copy reads: Four primitives. One mental model. Ships near-zero JS until each island enters the viewport. Footer chips count 12 motion primitives and note WCAG AA.](.github/assets/04-motion.png)

Four motion primitives, one mental model. Nothing ships until the island it
belongs to enters the viewport, which is how a site this animated stays this
light.

![A page headed COMPONENT LIBRARY with the headline "Beautiful blocks, wired to your brand". The copy explains that every component is built on the same six tokens, so changing one value in one.config.ts re-skins all of them. Two buttons read Clone the template and See the tokens. Below, a Button block shows five variants across three sizes.](.github/assets/05-components.png)

Every block reads the same six tokens. That is the whole trick: you never restyle
components, you restyle the tokens they were already reading.

---

## Performance

![A page headed SPEED PROOF · 2026-07-10 with the headline "100 / 100 on Lighthouse. Against this repo's own build, not a marketing deck." The copy reads: Run today against a plain bun run build && astro preview of this starter — no CDN, no edge cache, no tuning pass. Lighthouse 13.x, headless Chrome. Re-run it in the next five minutes. Below, in large type: Speed is a measurement. Not a claim.](.github/assets/06-speed.png)

**100 on Lighthouse · LCP 137 ms · CLS 0.00, verified against a production
build.** That figure was measured on 2026-07-10 and is carried forward here. The
tree has since moved to Astro 7.3.2 with three adapters upgraded, and it has not
been re-measured since.

So do not take it from us. The mechanism is static-first Astro, zero JavaScript by
default and Cloudflare's edge, and the check is two commands:

```bash
cd site && bun run build && bun run preview   # → http://localhost:4321
```

Then point Lighthouse at it. A cold production build takes a few seconds.

---

## The `one` CLI

```bash
npm install -g @oneie/cli
```

You get `one` and `oneie`, the same binary under either name. Every command is one
typed call into the same API, so there is no second interface to learn and it
behaves identically whether a human types it or an agent runs it headless.

```bash
one whoami                      # who this key is, which workspace
one doctor                      # config, key, reachability — exit 0/1, CI-safe
one setup                       # provision a workspace, keyless, idempotent
one push [path]                 # compile ai/ + data/ and push to the substrate
one deploy                      # deploy site/ to Cloudflare via wrangler
```

<details>
<summary><strong>The rest of the surface</strong> (verified against <code>oneie --help</code> at v4.1.0)</summary>

```bash
# money
one wallet keygen               # generate or recover a self-hosted wallet locally
one wallet get                  # credits, ceiling, wallet rows, live chain balances
one wallet send <to>            # send crypto via pay.one.ie payment links
one earn                        # credit earned summary
one usage                       # credit usage dashboard
one status                      # agency P&L — pool, margin, per-client burns

# people and agents
one staff invite [email]        # invite a human; omit the email to get a URL
one staff add-agent <name>      # create an agent and print its key once
one market                      # discover agents and skills on the market
one hire <skillId>              # hire an agent for a skill (--dry-run to simulate)
one bounty <skillId>            # post a bounty for a skill

# the substrate, directly
one catalog                     # browse the receiver surface by recipe
one ask <receiver> {json}       # signal, then wait for the outcome
one signal <receiver> {json}    # fire and forget
one groups | actors | things | paths | events | learning

# scaffolding
one create node [name]          # this repo's shape, fresh
one ship "<message>"            # git add, commit, push
```

`--dry-run` projects the outcome and writes nothing. Dry-run first on every
irreversible verb.
</details>

---

## Tell it once: the story layer

Every starter gives you a blog folder and calls that content. This one gives you
the craft that goes around it, as files an agent reads.

**Seven beats: World · Cast · Knock · Want · Way · Turn · Lesson.** That is the
whole form. A child, a founder or an agent can fill it in, and nobody has to learn
a new vocabulary on either side. The storyteller only ever *asks* for two of them,
the Want and the Knock. The rest is supplied by the work and recognised by the
teller.

```
  promise  ─────────►  progress  ─────────►  payoff
  terms + one proof    the board walking      the proof passed
  frozen at "yes"      settles, not effort    the Turn you promised
```

Pay off what was promised, not something else. The proof is written down at the
moment you agree and can never be swapped for an easier one afterwards.

<details>
<summary><strong>The six tests, the framework registry, and the refusals</strong></summary>

A story that fails one test is named in a sentence and handed back, never quietly
padded until it passes.

| Test | Fails when |
|---|---|
| Someone wants something | there is no Want, it is a description |
| The want is hard to get | nothing stands in the way, it is a shopping list |
| Things cause other things | it is a sequence, not a chain |
| Something is at stake | nothing is lost if the Want fails |
| Something changes | the world at the end is the world at the start |
| It is specific | it is true and general: "we struggled" instead of one detail |

`ai/skills/story/frameworks.md` holds one row per framework, each mapping its own
stops onto the same seven beats:

| Beat | Story Spine | Story Circle | Kishōtenketsu | Quest grammar |
|---|---|---|---|---|
| World | once upon a time | you | ki | the world |
| Knock | one day | need | shō | the call |
| Want | *(in "one day")* | go | shō | objective |
| Way | because of that… | search / find | shō | the obstacle |
| Turn | until finally | take / return | **ten** | the reward |
| Lesson | ever since then | change | ketsu | experience |

Adding a framework is adding a row. Labov for listening to a real person.
StoryBrand when the teller sells and the customer is the hero. Kishōtenketsu for
a Turn with no enemy, which is most real tellers, because a mover in Austin is not
fighting anyone. The agent states its pick in one sentence so you can overrule it.

`ai/skills/story/mediums.md` says how the beats are ordered per surface: headline
as promise and proof block as payoff for a page, a cold open on the Knock for
voice, the Turn in the first five seconds for video. A medium with no renderer is
named, not faked.

**The refusals.** A machine that can make any story persuasive has to be allowed
to decline.

- No Want with no observable. If nothing could check it, it is not a Want.
- No story told for someone else without their name on the Cast and their consent.
- No status claim that was not measured.
- No framework chosen that the teller did not see.
- No Lesson invented by the machine.
- A decline is recorded with its reason, never a silent stall.

> If the story cannot help, at least it must not hurt.

**The story is alive.** `data/lifecycles/story.toml` tracks ten steps:
`told → framed → promised → building → settled → viewed → completed → shared →
converted → retold`. Retells over stories told is the k-factor. Above one, every
story you tell produces more than one more.
</details>

The files: `ai/skills/story/SKILL.md` · `frameworks.md` · `mediums.md` ·
`ai/agents/storyteller.md` · `data/types/story.toml` ·
`data/lifecycles/story.toml`.

---

## Plugins

Ten, all free, all on npm. Install one without checking out this repo:
`bun add @oneie/plugin-chat`. The ones marked *served* render from `one.ie`, so
nothing ships in your bundle and they need the backend switch on.

| Package | What |
|---|---|
| `@oneie/plugin-auth` | better-auth client. Sign-in works standalone, auth server optional |
| `@oneie/plugin-backend` | `@oneie/sdk` client plus React 19 hooks |
| `@oneie/plugin-blog` | Markdown blog, zero config |
| `@oneie/plugin-booking` | Appointment scheduling, Google Calendar and email confirmations |
| `@oneie/plugin-chat` | Served AI chat widget, zero bundle |
| `@oneie/plugin-docs` | Docs site, same content pipeline as this repo |
| `@oneie/plugin-mail` | Inbox UI, real-time through the channels worker |
| `@oneie/plugin-media` | Video gallery and player, Mux and YouTube |
| `@oneie/plugin-pages` | Renders a workspace's visually-edited Puck pages |
| `@oneie/plugin-track` | Served analytics pixel, zero bundle |

`@oneie/frontend` and `@oneie/design` are free too, and `site/` depends on all of
it via real semver.

**Paid, and clearly marked:** `admin`, `course`, `dashboard` and `shop` ship as
thin stubs in `packages/`, never published, built on `@oneie/plugin-premium`'s
entitlement gate. They load the real UI from `one.ie/x/<plugin>.js` after payment.
Nothing reaches your repo before you buy it.

---

## AI-ready

Open the root in Claude Code and it is already wired.

- **`.claude/`** teaches your assistant the file conventions, plugin patterns and
  design rules of this repo. Works with Claude Code, Cursor, and any editor that
  reads `CLAUDE.md`.
- **`.mcp.json`** exposes the whole ONE API as native MCP tools, no wrapper
  needed. It reads `ONE_API_KEY` from your shell.

```bash
export ONE_API_KEY=$(grep '^ONE_API_KEY=' site/.env.local | cut -d= -f2)
```

A node scaffolded with `oneie create node` is AI-connected from its first
`git init`.

---

## Develop

```bash
bun install                     # install all workspaces
cd site && bun run dev          # dev server, no backend needed → :4321
cd site && bun run typecheck    # astro check — 130 files, 0 errors
cd site && bun run build        # production build
cd site && bun run deploy       # astro build && wrangler deploy
```

CI runs the build, the typecheck, and a second build with `ONE_API_KEY=""` to
prove standalone mode still works. Contributions welcome: open an issue or a PR at
[github.com/one-ie/one](https://github.com/one-ie/one).

---

## The ONE Licence

In one line: **everything, in perpetuity, for free. Keep the ONE brand, logo and
link in your deployed product.**

The [full grant is above](#free-forever-and-yours-to-sell), and the
[licence itself](LICENSE) is short enough to read in two minutes. Read it before
you rely on it.

The ONE backend is not distributed. This repo is the fully functional client, and
it runs without that backend.

**Free hosting on Cloudflare's edge. Free design system. Yours to sell.**
