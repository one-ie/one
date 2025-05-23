---
title: Book Publishing System
description: Guide to publishing books on the web and as EPUB using Astro, Pandoc, and ONE
---

# Book Publishing System

ONE provides a powerful, flexible system for publishing books both as beautiful web content and as professional EPUB ebooks. This guide covers everything you need to manage, structure, and publish your book using Astro content collections and Pandoc.

## Overview

- **Write once, publish everywhere:** Author your book in Markdown, manage content and metadata in a structured way, and publish to the web and EPUB with a single source of truth.
- **Modern stack:** Uses Astro content collections for web publishing and Pandoc for EPUB generation, with full support for metadata, styling, and automation.

---

## Directory Structure

Your book content and configuration live in:

```
src/content/book/
├── metadata.yaml        # Book metadata and configuration
├── chapters/            # Book chapters in markdown (or top-level .md files)
├── assets/              # Images and resources
├── epub-style.css       # EPUB-specific styling
├── metadata.config.ts   # Book schema configuration (Zod)
└── ...                  # EPUB, PDF, and other outputs
```

- **metadata.yaml**: All book metadata (title, author, ISBN, etc.)
- **.md files**: Each chapter as a Markdown file (e.g., `1.Introduction.md`)
- **assets/**: Images, cover, and other resources
- **epub-style.css**: Custom CSS for EPUB output
- **metadata.config.ts**: Zod schema for metadata validation

---

## Metadata & Schema

Book metadata is defined in `metadata.yaml` and validated with a Zod schema in `metadata.config.ts`.

**YAML Example:**
```yaml
# src/content/book/metadata.yaml
title: 'The Elevate Playbook'
description: 'A practical guide to building AI-powered businesses.'
date: '2024-05-22'
status: 'published'
author: "Anthony O'Connell"
publisher: 'ONE Publishing'
rights: "© 2024 Anthony O'Connell. All rights reserved."
creator: "Anthony O'Connell"
contributor: 'ONE Team'
identifier:
  scheme: 'ISBN-13'
  text: '978-1-916-12345-6'
subject: 'AI, Business, Automation'
language: 'en-US'
image: 'assets/cover.png'
coverImage: 'assets/cover.png'
css: 'epub-style.css'
chapter: 0
order: 0
'@type': 'Book'
'@context': 'https://schema.org'
bookFormat: 'EBook'
inLanguage: 'en-US'
datePublished: '2024-05-22'
```

**TypeScript Schema (Zod):**
```typescript
// src/content/book/metadata.config.ts
const BookSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date().or(z.string()),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  author: z.string().default("Anthony O'Connell"),
  publisher: z.string().default('ONE Publishing'),
  rights: z.string(),
  creator: z.string(),
  contributor: z.string(),
  identifier: z.object({
    scheme: z.string().default('ISBN-13'),
    text: z.string()
  }),
  subject: z.string(),
  language: z.string().default('en-US'),
  image: z.string().optional(),
  coverImage: z.string().optional(),
  css: z.string().optional(),
  chapter: z.number().optional(),
  order: z.number().optional(),
  '@type': z.literal('Book').optional(),
  '@context': z.literal('https://schema.org').optional(),
  bookFormat: z.enum(['EBook', 'Paperback', 'Hardcover']).optional(),
  inLanguage: z.string().optional(),
  datePublished: z.string().optional()
});
```

---

## Publishing on the Web

- **Astro Content Collections:**
  - Each chapter is a Markdown file in `src/content/book/`
  - Use Astro pages/components to render chapters, TOC, and metadata
  - Leverage Astro's static site generation for fast, SEO-friendly web books
- **Example:**
  - `src/pages/book/[slug].astro` renders individual chapters
  - `src/pages/book/index.astro` renders the book overview and TOC

---

## Generating EPUB with Pandoc

ONE automates EPUB generation using Pandoc, combining your Markdown, metadata, and assets into a professional ebook.

### 1. Install Pandoc
```bash
# macOS
brew install pandoc
# Ubuntu/Debian
sudo apt-get install pandoc
```

### 2. Generate EPUB
```bash
# Using the generate-epub.sh script
pnpm run generate:epub

# Manual command
pandoc \
  --resource-path=assets \
  --toc \
  --toc-depth=2 \
  --split-level=1 \
  --css=epub-style.css \
  --epub-cover-image=assets/cover.png \
  -o TheElevatePlaybook.epub \
  metadata.yaml \
  *.md
```

- **Custom CSS:** Style your EPUB with `epub-style.css`
- **Cover Image:** Set with `--epub-cover-image`
- **Table of Contents:** Generated automatically

---

## Styling & Customization

- **epub-style.css:**
  - Define fonts, colors, spacing for EPUB output
  - Example:
    ```css
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 1em;
    }
    h1, h2, h3 {
      font-family: 'SF Pro Display', sans-serif;
      color: #000;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      line-height: 1.2;
    }
    ```
- **Web Styling:** Use Tailwind CSS and Astro components for web output

---

## Best Practices

1. **Content Organization**
   - Use clear, consistent chapter naming (e.g., `1.Introduction.md`)
   - Keep images in `assets/` and use relative paths
   - Maintain consistent Markdown formatting
2. **Metadata Management**
   - Fill out all required fields in `metadata.yaml`
   - Use valid ISBNs and copyright info
   - Keep metadata in sync between web and EPUB
3. **Styling**
   - Use system fonts for compatibility
   - Test EPUB on multiple devices
   - Use Tailwind for web, CSS for EPUB
4. **Automation**
   - Use the provided scripts for repeatable builds
   - Version control your content and metadata

---

## Troubleshooting & Tips

- **Pandoc errors:** Check file paths, YAML syntax, and required fields
- **Missing images:** Ensure all assets are in the correct directory and referenced with relative paths
- **Metadata issues:** Validate against the Zod schema and check for typos
- **Web/EPUB differences:** Adjust styling as needed for each format

---

## Advanced Features

- **Multiple output formats:** Generate PDF, HTML, and more with Pandoc
- **Schema.org metadata:** Enhance discoverability with structured data
- **Custom automation:** Extend scripts for custom workflows

---

Built with 🚀 Astro, 🎨 Shadcn/UI, and Vercel AI SDK by [ONE](https://one.ie)
