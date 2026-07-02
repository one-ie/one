# @oneie/plugin-docs

ONE docs plugin — Astro content collection with sidebar nav, search, code blocks, and versioning. Ships full source to your repo (free tier).

## Install

```bash
bun add @oneie/plugin-docs
```

## one.config.ts

```ts
import { defineOne } from '@oneie/frontend'
import { docs } from '@oneie/plugin-docs'

export default defineOne({
  plugins: [
    docs({
      docsDir: 'src/content/docs',       // default
      injectRoutes: true,                 // default
      editBaseUrl: 'https://github.com/your-org/your-repo/edit/main',
      sidebar: [
        { folder: 'getting-started', label: 'Getting Started', icon: '🚀' },
        { folder: 'guides',          label: 'Guides',          icon: '📖' },
        { folder: 'reference',       label: 'Reference',       icon: '📐' },
      ],
    }),
  ],
})
```

## Content collection schema

Create `src/content/config.ts` (or add to your existing one):

```ts
import { defineCollection, z } from 'astro:content'

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    /** Numeric sort order within the folder. Lower = first. */
    order: z.number().optional(),
    /** Optional category tag for filtering */
    category: z.string().optional(),
  }),
})

export const collections = { docs }
```

Files live at `src/content/docs/**/*.md` or `.mdx`. The first path segment becomes the sidebar folder:

```
src/content/docs/
  getting-started/
    introduction.md      # slug: getting-started/introduction
    installation.md      # slug: getting-started/installation
  guides/
    deployment.md        # slug: guides/deployment
  reference/
    api.md               # slug: reference/api
```

## Usage — [slug].astro

Create `src/pages/docs/[slug].astro`:

```astro
---
import { getCollection, getEntry } from 'astro:content'
import DocsLayout from '@oneie/plugin-docs/DocsLayout.astro'

export async function getStaticPaths() {
  const docs = await getCollection('docs')
  return docs.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }))
}

const { entry } = Astro.props
const allDocs = await getCollection('docs')
const { Content, headings } = await entry.render()
---

<DocsLayout
  entry={entry}
  entries={allDocs}
  headings={headings}
  editBaseUrl="https://github.com/your-org/your-repo/edit/main/src/content/docs"
  sidebar={[
    { folder: 'getting-started', label: 'Getting Started' },
    { folder: 'guides', label: 'Guides' },
    { folder: 'reference', label: 'Reference' },
  ]}
>
  <Content />
</DocsLayout>
```

## Docs landing page — /docs/index.astro

```astro
---
import DocsIndex from '@oneie/plugin-docs/DocsIndex.astro'
---

<DocsIndex
  title="Documentation"
  description="Everything you need to get up and running."
/>
```

## Sidebar order

Folders render in the order declared in the `sidebar` array. Entries within each folder sort by `order` (frontmatter) then alphabetically by title. Folders not listed in `sidebar` append after the configured ones.

## editBaseUrl — GitHub edit links

Set `editBaseUrl` to the raw path of your docs directory on GitHub:

```
https://github.com/your-org/your-repo/edit/main/src/content/docs
```

An "Edit this page on GitHub" link appears at the bottom of every doc, pointing to `editBaseUrl/entry.id`.

## Components (standalone use)

```tsx
import { DocSearch } from '@oneie/plugin-docs/DocSearch.tsx'
import { SidebarDocs } from '@oneie/plugin-docs/SidebarDocs.tsx'
import { CodeBlock } from '@oneie/plugin-docs/CodeBlock.tsx'

// Search bar
<DocSearch value={currentSearch} placeholder="Search…" />

// Sidebar (requires React state for collapsible folders)
<SidebarDocs entries={entries} currentSlug={slug} sidebar={sidebarConfig} />

// Code block with copy button
<CodeBlock code={`const x = 1`} language="ts" filename="example.ts" />
```

## License

ONE License — full commercial use, keep the ONE brand link. See [LICENSE](./LICENSE).
