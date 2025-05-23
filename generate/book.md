# EPUB & Astro Metadata Plan (Revised)

## 1. **Metadata Strategy: Single Source of Truth, Dual Compatibility**
- **Goal:** Publish your book as both a beautiful Astro website and a standards-compliant EPUB, with no metadata conflicts or linter errors.

## 2. **metadata.yaml: Global Book Metadata for Pandoc & Astro**
- **Purpose:**
  - `metadata.yaml` is the single source of truth for all book-level metadata (title, author, ISBN, etc.) for EPUB generation.
  - Astro can also import and use this file for global book info (e.g., in layouts, SEO, or TOC pages).
- **Structure:**
  - Only include fields defined in your `BookMetadataSchema` (see below for example).
  - Do **not** include arbitrary comments or section headers (these cause YAML and TypeScript errors).

## 3. **Chapter Frontmatter: Minimal, Schema-Driven**
- **Purpose:**
  - Astro content collections require per-chapter frontmatter for navigation, slugs, and display.
  - Only include fields defined in the `BookSchema` in `config.ts`.
- **Best Practice:**
  - **Do NOT repeat book-level metadata** (author, ISBN, etc.) in chapters unless required by Astro for web display.
  - If you must include book-level fields for Astro, keep them in sync with `metadata.yaml` and use only the allowed schema fields.

## 4. **Pandoc Workflow**
- Always pass `metadata.yaml` as the first argument to Pandoc in your build script.
- Pandoc will use only `metadata.yaml` for global metadata; chapter frontmatter is ignored for book-level fields.
- You may leave book-level metadata in chapters for Astro, but it will be ignored by Pandoc if `metadata.yaml` is first.

## 5. **Astro Workflow**
- Astro uses per-chapter frontmatter for navigation, slugs, and display.
- For book-level info (author, publisher, etc.), import and use `metadata.yaml` in your layouts/pages.
- Keep your `BookSchema` and `BookMetadataSchema` in sync for type safety and validation.

## 6. **Example: metadata.yaml (Book-level, for Pandoc & Astro)**
```yaml
title: 'The Elevate Playbook'
description: 'A comprehensive guide to building AI-powered ecommerce businesses'
date: '2024-05-22'
status: 'published'
author: "Anthony O'Connell"
language: 'en-US'
publisher:
  name: 'ONE Publishing'
  url: 'https://one.ie'
  '@type': 'Organization'
rights: "© 2024 Anthony O'Connell. All rights reserved."
identifier:
  scheme: 'ISBN-13'
  text: '978-1-916-12345-6'
creator: "Anthony O'Connell"
contributor: 'ONE Team'
subject: 'Ecommerce, AI, Business Growth, Digital Marketing'
css: 'epub-style.css'
coverImage: 'assets/Playbook.png'
image: 'assets/Playbook.png'
bookFormat: 'EBook'
inLanguage: 'en-US'
datePublished: '2024-05-22'
tags:
  - 'ecommerce'
  - 'ai'
  - 'business'
  - 'growth'
```

## 7. **Example: Chapter Frontmatter (Minimal, for Astro)**
```yaml
---
title: "The Introduction"
description: "Intro to the Elevate Playbook"
chapter: 0
order: 0
tags:
  - introduction
  - framework
---
```

## 8. **Best Practices & Troubleshooting**
- **Keep schemas in sync:** Update both `BookSchema` (Astro) and `BookMetadataSchema` (TypeScript) when adding new fields.
- **No comments or section headers in YAML:** Only use valid YAML keys/values.
- **For web:** Use Astro's import of `metadata.yaml` for global info, and per-chapter frontmatter for navigation.
- **For EPUB:** Only `metadata.yaml` is used for book-level metadata; chapter frontmatter is ignored for these fields.
- **If you get linter errors:**
  - Remove comments and section headers from YAML.
  - Only use fields defined in your schema.
- **If Pandoc uses the wrong metadata:**
  - Ensure `metadata.yaml` is the first argument in your build script.

---

Book Publishing TODO
[ ] Ensure metadata.yaml contains all book-level metadata (title, author, ISBN, etc.) and matches your Zod schema (no comments or section headers).
[ ] Use minimal, schema-driven frontmatter in each chapter for Astro (title, description, chapter, order, tags).
[ ] Do NOT repeat book-level metadata in chapters unless required for Astro web display, and keep in sync with metadata.yaml.
[ ] Always pass metadata.yaml as the first argument to Pandoc in your build script.
[ ] For Astro, import and use metadata.yaml for layouts/pages; use chapter frontmatter for navigation and display.
[ ] Keep BookSchema (Astro) and BookMetadataSchema (TypeScript) in sync for type safety and validation.
[ ] Remove comments and section headers from YAML files to avoid linter/TypeScript errors.
[ ] If Pandoc uses the wrong metadata, check that metadata.yaml is the first argument in your build script.
[ ] Convert all Obsidian-style image embeds (![[filename.png]]) to standard Markdown image syntax:
Replace: ![[Architecture.png]]
With: ![Alt text](assets/Architecture.png)
[ ] Check all image paths to ensure they are correct for both Astro (web) and Pandoc (EPUB).
[ ] Generate a script/tool to automate the conversion of Obsidian image links to standard Markdown if needed.
---

**Summary:**
- Use `metadata.yaml` for all book-level metadata (for both Astro and Pandoc).
- Use minimal, schema-driven frontmatter in chapters for Astro navigation.
- Keep everything in sync with your Zod schemas for type safety and validation.
- Use standard Markdown image syntax for all images to ensure compatibility with Astro and Pandoc.
- Automate the conversion process if you have many files.
