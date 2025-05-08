---
title: "Generate our book"
description: "✅ Successfully implemented book generation with Astro content collections and Pandoc. The book is now properly integrated with both Astro's content system and generates a beautifully formatted EPUB with proper metadata, styling, and content structure."
tags: ["ONE", "ebook", "astro", "pandoc", "completed"]
date: 2024-05-08
status: "public"
---

# Implementation Success 🎉

We have successfully:
1. Integrated book content with Astro's content collections
2. Created a proper BookSchema with validation
3. Set up metadata for both Astro and EPUB
4. Generated a properly formatted EPUB with:
   - Custom styling using Apple system fonts
   - Proper chapter structure
   - Working table of contents
   - Cover image
   - Complete metadata

# Todo List

## Setup & Infrastructure
- [x] Install Pandoc (/opt/homebrew/opt/pandoc)
- [x] Set up project directory (/src/content/book/)
- [x] Create basic file structure
- [x] Configure Astro content collections for book content

## Content Organization
- [x] Create metadata.yaml template
- [x] Define chapter structure
- [x] Set up assets directory structure
- [x] Implement BookSchema in config.ts

## Content Creation
- [x] Consolidate all chapter drafts
- [x] Extract content from Astro components
- [x] Integrate Figma designs and diagrams
- [x] Format all content in standard Markdown
- [x] Add proper image references
- [x] Create consistent chapter breaks

## Ebook Generation
- [x] Finalize metadata.yaml
- [x] Generate Table of Contents
- [x] Create cover image
- [x] Run Pandoc conversion
- [x] Review and refine EPUB output
- [x] Generate initial ebook from all files in /src/content/book/ using Pandoc

## Course Website
- [ ] Set up course metadata
- [ ] Create module structure
- [ ] Generate course-specific content
- [ ] Implement interactive elements

## Implementation Details

### Content Collection Setup
```typescript
// src/content/config.ts
const BookSchema = z.object({
  ...CommonFields,
  author: z.string(),
  language: z.string(),
  publisher: z.string(),
  rights: z.string(),
  identifier: z.object({
    scheme: z.string(),
    text: z.string()
  }),
  creator: z.string(),
  contributor: z.string(),
  subject: z.string(),
  css: z.string().optional(),
  coverImage: z.string().optional(),
  chapter: z.number().optional(),
  order: z.number().optional(),
  status: z.enum(['draft', 'review', 'published']).default('draft')
});
```

### Metadata Configuration
```yaml
# src/content/book/metadata.yaml
---
title: 'Elevate Ecommerce: The Proven Framework for AI-Powered Growth'
description: 'A comprehensive guide to building AI-powered ecommerce businesses'
date: '2024-05-08'
status: 'published'
tags: ['ecommerce', 'ai', 'business', 'growth']
image: 'assets/Playbook.png'

# Book specific fields
author: 'Anthony O''Connell'
language: 'en-US'
publisher: 'ONE Publishing'
rights: '© 2024 Anthony O''Connell. All rights reserved.'
identifier:
  scheme: 'ISBN-13'
  text: '978-1-916-12345-6'
creator: 'Anthony O''Connell'
contributor: 'ONE Team'
subject: 'Ecommerce, AI, Business Growth, Digital Marketing'

# Optional fields
css: 'epub-style.css'
coverImage: 'assets/Playbook.png'
chapter: 0
order: 0
---
```

### Pandoc Generation Command
```bash
pandoc metadata.yaml \
  "0. Introduction.md" \
  "1. Architecture.md" \
  "2. Foundation.md" \
  "3.  Company.md" \
  "4. Market.md" \
  "5. Customer.md" \
  "6. Alignment.md" \
  "7.  Attract.md" \
  "8. Hook.md" \
  "9. Gift.md" \
  "10.  Identify.md" \
  "11. Convert.md" \
  "12. Engage.md" \
  "13.  Sell.md" \
  "14.  Nurture.md" \
  "15. Upsell.md" \
  "16.  Educate.md" \
  "17.  Share.md" \
  "18. Optimise.md" \
  --resource-path=.:assets \
  --toc \
  --toc-depth=2 \
  --split-level=1 \
  --css=epub-style.css \
  --epub-cover-image=assets/Playbook.png \
  -o Elevate_Playbook_New.epub
```

### CSS Styling
```css
/* src/content/book/epub-style.css */
body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    line-height: 1.5;
    color: #333;
    margin: 0;
    padding: 1em;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
    color: #000;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.2;
}

/* ... rest of the CSS ... */
```

## Next Steps

1. **Course Website Integration**
   - [ ] Convert book content to course modules
   - [ ] Add interactive elements
   - [ ] Implement progress tracking
   - [ ] Add quizzes and exercises

2. **Content Enhancement**
   - [ ] Add more diagrams and illustrations
   - [ ] Create video tutorials
   - [ ] Develop interactive examples
   - [ ] Add downloadable resources

3. **Distribution**
   - [ ] Set up automated build process
   - [ ] Create distribution channels
   - [ ] Implement version control
   - [ ] Add update notifications

4. **Analytics**
   - [ ] Track reading progress
   - [ ] Monitor engagement
   - [ ] Collect feedback
   - [ ] Measure completion rates