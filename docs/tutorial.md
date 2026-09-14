# Tutorial: from empty folder to deployed site

About 20 minutes. You will clone the repo, run it, change its colours, publish a
post, put a product up for sale, and take it through the build gate.

Everything below was run before it was written. Where a step needs a restart, it
says so, because that is the part a tutorial usually gets wrong.

**Prerequisites:** [Bun](https://bun.sh) 1.3 or newer. Nothing else. No account,
no API key, no card.

- [Step 1: Get it running](#step-1-get-it-running)
- [Step 2: Look around](#step-2-look-around)
- [Step 3: Change the colours](#step-3-change-the-colours)
- [Step 4: Publish a post](#step-4-publish-a-post)
- [Step 5: Sell something](#step-5-sell-something)
- [Step 6: Pass the gate](#step-6-pass-the-gate)
- [Step 7: Ship it](#step-7-ship-it)
- [Where to go next](#where-to-go-next)

---

## Step 1: Get it running

```bash
git clone https://github.com/one-ie/one my-app
cd my-app
bun install
```

`bun install` covers every workspace in one pass: 585 installs across 693
packages. A first run has to download them, so give it a moment.

Now start the dev server:

```bash
cd site
bun run dev
```

```
astro  v7.3.2 ready in 1963 ms
┃ Local    http://localhost:4321/
```

Open **http://localhost:4321**. You have a full site: home, blog, docs, products,
auth pages, a design system and four showcase pages.

The dev server runs in the background and has its own controls:

```bash
bun x astro dev status    # is it up, and on which port
bun x astro dev logs      # what it has been serving
bun x astro dev stop      # stop it
```

> **If the port is busy.** Astro will tell you a server is already running and
> print its port. Stop it with `bun x astro dev stop`, or leave it and use the
> port it names.

---

## Step 2: Look around

Every one of these is a real page in `site/src/pages/`. Visit them before you
change anything, so you can see what your edits do.

| Page | What it is |
|---|---|
| `/` | The home page, and the hero you saw in the README |
| `/design` | The six tokens, live and clickable |
| `/components` | Every block, in all its variants |
| `/motion` | Four motion primitives |
| `/patterns` | Six background textures |
| `/blog` · `/docs` | Two content collections, Markdown in, routes out |
| `/products` | The catalog. Prices resolve server-side |
| `/speed` | The Lighthouse run, with the date it was measured |

---

## Step 3: Change the colours

Six tokens carry the whole site: `primary`, `secondary`, `tertiary`,
`background`, `foreground`, `font`. Every component reads them, so you restyle
the tokens rather than the components.

### The no-code way

Go to **http://localhost:4321/design** and click a swatch. The picks apply to the
whole site immediately and persist across page loads. Use this to find the colour
you want.

### The way that ships

`site/src/lib/themes.ts` is the single source of truth for all 14 theme presets.
Open it and find `navy`, the default:

```ts
{
  key: 'navy',
  name: 'Navy',
  light: { primary: '216 55% 25%', secondary: '219 14% 28%', tertiary: '105 22% 25%', background: '216 20% 92%', foreground: '216 12% 99%' },
  dark:  { primary: '216 55% 65%', secondary: '219 14% 65%', tertiary: '105 22% 65%', background: '216 24% 9%',  foreground: '216 18% 15%' },
  swatch: '216 55% 35%',
  pattern: 'grid',
  patternTone: 'primary',
  nav: true,
},
```

Change the light-mode `primary` to a warm orange:

```ts
light: { primary: '14 90% 52%', /* … leave the rest … */ },
```

Save. **The running dev server repaints in about four seconds.** No restart. Every
button, link, focus ring and filled surface on every page follows, because they
were all reading the token already.

> **Colour format.** Each value is a bare `H S% L%` triplet with no `hsl()`
> wrapper. `Layout.astro` adds the wrapper when it injects them.
>
> **Keep the lightness in band.** Light-mode brand tokens sit around 22–38% L and
> dark-mode around 58–68%. The site picks label contrast (white or black) from
> the mode, not per theme, so a light-mode `primary` at 80% L will put white text
> on a pale fill.

Undo the change before moving on, or keep it. It is your site now.

---

## Step 4: Publish a post

Create `site/src/content/blog/my-first-post.md`:

```markdown
---
title: "My first post"
description: A post written during the tutorial.
date: 2026-09-14
---

If you can read this at /blog, the content pipeline works.
```

Three fields are required: `title`, `description`, `date`. Optional: `category`,
`tags`, `image`, and a `seo` block.

Give it a few seconds. The post appears on **http://localhost:4321/blog** and at
**http://localhost:4321/blog/my-first-post**. The filename is the slug. No
restart, no registration step, no route to write.

`site/src/content/docs/` works the same way, with `order` instead of `date`.

> **The SEO graph is watching.** The build validates H1s, internal links, image
> alt text and metadata length and uniqueness on every page, and fails loudly
> when one is wrong. A `description` under 15 characters will be caught at
> Step 6, not in production.

---

## Step 5: Sell something

A product is a Markdown file too. Create
`site/src/content/products/sticker-pack.md`:

```markdown
---
name: Sticker Pack
priceCents: 1200
description: Five vinyl stickers, shipped worldwide.
---
```

Three required fields: `name`, `priceCents`, `description`. Add `tagline` and a
`bullets` array if you want the full product landing page.

**This one needs a restart.** The products collection does not hot-reload the way
blog and docs do:

```bash
bun x astro dev stop
bun run dev
```

Now **http://localhost:4321/products** lists it, and
**http://localhost:4321/products/sticker-pack** renders at $12.00 with a buy box.

### Why the price is safe

`priceCents` is read server-side, from the collection, by `resolveProduct()`. A
buyer's browser never supplies the amount, so it can never be tampered with. That
is the whole reason the price lives in a Markdown file rather than in the page.

Card payments need Stripe keys in the environment. Crypto payment links are signed
against `pay.one.ie`. Neither is needed for the catalog to render.

---

## Step 6: Pass the gate

Two commands stand between you and a deploy.

```bash
cd site
bun run typecheck
```

```
Result (130 files):
- 0 errors
- 0 warnings
- 14 hints
```

That is `astro check`: types across every `.astro`, `.ts` and `.tsx` file. It
takes about ten seconds. Hints are fine. Errors are not.

```bash
bun run build
```

The build prerenders your static pages, bundles the server entrypoints for
Cloudflare, and runs the SEO validators:

```
[@jdevalk/astro-seo-graph] H1 validation: 14 pages checked, all good.
[@jdevalk/astro-seo-graph] Internal links: 14 pages checked, all good.
[@jdevalk/astro-seo-graph] Image alt validation: 14 pages checked, all good.
[@jdevalk/astro-seo-graph] Metadata length: 14 pages checked, all good.
[@jdevalk/astro-seo-graph] Metadata uniqueness: 14 pages checked, all good.
[build] Complete!
```

A cold build finishes in a few seconds. If a validator fails, it names the page.

Look at the real thing before you ship it:

```bash
bun run preview
```

Preview serves the production build at **http://localhost:4321**, the same port
the dev server uses, so stop one before starting the other. This is also the
build to point Lighthouse at, since dev mode is not representative of anything.

---

## Step 7: Ship it

```bash
cd site
bun run deploy
```

That is `astro build && wrangler deploy`. You need a Cloudflare account and
`wrangler` logged in; everything before this step did not.

CI runs the same gate on every push and pull request: build, typecheck, and then
a second build with `ONE_API_KEY=""` to prove the site still works standalone.

---

## Where to go next

**Turn plugins on and off.** `site/one.config.ts` decides which integrations
compile in. Remove `blog()` and the blog routes stop existing. Add
`booking()` after `bun add @oneie/plugin-booking` and a scheduling widget
appears. Ten plugins are on npm and free.

**Connect the backend.** Set `ONE_API_KEY` and the same code talks to the ONE
backend: AI chat, CRM, analytics, agents, credit metering. Nothing about your code
changes. Leave it unset and everything above keeps working forever.

**Use the CLI.** `npm install -g @oneie/cli`, then `one doctor` to check your
footing and `one catalog` to see the whole API surface grouped by recipe.

**Let an agent build with you.** `.claude/` and `.mcp.json` are at the repo root.
Open the folder in Claude Code and it already knows the file conventions, the
plugin patterns and the design rules.

**Tell your story once.** `ai/skills/story/` holds the seven beats, the framework
registry and the refusals. `ai/agents/storyteller.md` is the agent that reads
them.

---

Back to the [README](../README.md).
