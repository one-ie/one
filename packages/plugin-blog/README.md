# @oneie/plugin-blog

ONE blog — Astro content collection with post grid, client-side search, RSS, and MDX support. Source ships to your repo (free tier).

## Install

```bash
bun add @oneie/plugin-blog
```

## Setup

### 1. Register the plugin

```ts
// one.config.ts
import { defineOne } from '@oneie/frontend'
import { blog } from '@oneie/plugin-blog'

export default defineOne({
  plugins: [
    blog({
      postsDir: 'src/content/blog', // default
      rss: true,                    // emit /rss.xml
      injectRoutes: true,           // add /blog and /blog/[slug]
      postsPerPage: 12,
    }),
  ],
})
```

### 2. Define the content collection

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().optional(),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { blog }
```

### 3. Write posts

```
src/content/blog/
  hello-world.mdx
  second-post.md
```

Each file's frontmatter:

```yaml
---
title: Hello World
description: My first post on the ONE blog plugin.
date: 2026-01-15
category: Updates
image: /images/hello.jpg
tags: [one, astro, blog]
---
```

## Using the components directly

If you set `injectRoutes: false` (or want to customise the pages), import the components into your own pages.

### BlogIndex page

```astro
---
// src/pages/blog/index.astro
import BlogIndex from '@oneie/plugin-blog/BlogIndex.astro'
---

<BlogIndex title="Our Blog" description="The latest from the team." />
```

### BlogPost page

```astro
---
// src/pages/blog/[slug].astro
import { getCollection } from 'astro:content'
import BlogPost from '@oneie/plugin-blog/BlogPost.astro'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map((entry) => ({
    params: { slug: entry.slug },
    props: { entry },
  }))
}

const { entry } = Astro.props
const { headings } = await entry.render()
---

<BlogPost entry={entry} headings={headings} />
```

### PostCard and BlogSearch

```tsx
import { PostCard } from '@oneie/plugin-blog/PostCard.tsx'
import { BlogSearch } from '@oneie/plugin-blog/BlogSearch.tsx'
```

## RSS

When `rss: true` (the default), the plugin wires an RSS feed at `/rss.xml` via Astro's built-in RSS support. Link it in your `<head>`:

```html
<link rel="alternate" type="application/rss+xml" title="Blog RSS" href="/rss.xml" />
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `postsDir` | `string` | `'src/content/blog'` | Directory for blog MDX/MD files |
| `rss` | `boolean` | `true` | Emit an RSS feed at `/rss.xml` |
| `injectRoutes` | `boolean` | `true` | Auto-add `/blog` and `/blog/[slug]` routes |
| `postsPerPage` | `number` | `12` | Posts shown per page in the index grid |
