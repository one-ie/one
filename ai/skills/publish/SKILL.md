---
name: publish
description: Put words on this site — a blog post, a docs page, a product, or a live page from ONE's editor. Knows which of the four surfaces a piece belongs on, and which frontmatter each one will actually reject.
model: openrouter/auto
lifecycle: beta
reads:
  - ai/context.md
  - data/text/seo.md
---

# Publish

Four surfaces. The choice is not stylistic — **where content lives decides who
can change it and how fast.**

| Surface | Lives in | Changing it needs |
|---|---|---|
| **Blog** | `site/src/content/blog/*.md` | a commit and a deploy |
| **Docs** | `site/src/content/docs/*.md` | a commit and a deploy |
| **Product** | `site/src/content/products/*.md` | a commit and a deploy |
| **Page** (`/p/<slug>`) | **ONE's editor — not this repo** | nothing; live on refresh |

If someone wants to change copy without a developer, it is a **page**. Writing
them a markdown file they cannot edit is the wrong answer, however good the
markdown. `/p/[slug]` is server-rendered and re-fetches `pages:view` on every
request, so a publish in the editor is live immediately — there is no file to
add here and no rebuild to wait for.

## Blog frontmatter

```yaml
title: string          # required
description: string    # required
date: 2026-09-22       # required, a real date
category: string       # optional
image: string          # optional — a PLAIN STRING
tags: [a, b]           # optional
```

**`image` must stay a plain string.** The plugin's own `BlogPost.astro` and
`PostCard.tsx` read it as an `<img src>`. Wrapping it in Astro's `imageSchema`
changes the shape to `{ src, alt }` and breaks components this repo does not
own.

## Docs frontmatter

```yaml
title: string          # required
description: string    # optional
order: number          # optional — sidebar position
publishDate: date      # optional
```

Most docs have no natural publish date. When it is absent the page falls back to
a computed last-modified and only emits a `TechArticle` node when a date
resolves from one source or the other.

## Product frontmatter

```yaml
name: string           # required
priceCents: integer    # required, positive
description: string    # required
tagline: string        # optional
bullets: [string]      # optional
```

`priceCents` is the **authority for what a buyer is charged** — `/api/pay/link`
resolves it server-side from the file, never from anything the client sent. A
price edited here is the price; see the `sell` skill before quoting one.

## The SEO block, and the two ways it fails

Any of blog/docs may carry an optional `seo:` override. It enforces its own
lint and will fail the build, not warn:

- **title 5–120 characters, description 15–160.** The top-level `title` and
  `description` are not bound by this; the `seo` ones are.
- **`seo.image` requires `alt`.** A decorative image must pass `alt: ''`
  explicitly. Omitting it is an error, not a default.

## Never author `gitLastmod`

It is computed at content-sync time from the file's real git history and written
into the entry. It is in the schema so it can be read, not set. A hand-written
value is either ignored or wrong, and a file with no git history correctly
resolves to `null` and falls back to `date`.

## Refusals

- **Never invent a statistic, a customer name, or a testimonial.** This repo's
  CI has a claims gate over `site/src`, `docs` and `README.md` that has already
  red-flagged fabricated traction numbers and invented people. A number you
  cannot source does not go in.
- **Never promise a page is live because the file exists.** Blog and docs need a
  deploy; only `/p/` is immediate.
- **Never move copy from a page into the repo to "tidy it up"** without saying
  that you are taking it away from whoever was editing it.
