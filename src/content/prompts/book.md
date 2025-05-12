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
rights: '© 2025 Anthony O''Connell. All rights reserved.'
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
# Generate the EPUB
pandoc metadata.yaml \
  "0. Introduction.md" \
  "1. Architecture.md" \
  "2. Foundation.md" \
  "3.  Company.md" \
  "3.1. Company Worksheet.md" \
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
  --epub-cover-image=assets/book-cover.png \
  -o TheElevatePlaybook.epub && open TheElevatePlaybook.epub
```

### Opening the EPUB

The EPUB file will automatically open in your default EPUB reader after generation. If you need to open it manually:

## macOS
```bash
open TheElevatePlaybook.epub
```

## Windows
```bash
start TheElevatePlaybook.epub
```

## Linux
```bash
xdg-open TheElevatePlaybook.epub
```

You can also open the EPUB file using any of these readers:
- Apple Books (macOS)
- Google Play Books
- Calibre
- Adobe Digital Editions

# EPUB Features

The generated EPUB includes:
- Interactive table of contents
- Custom styling with epub-style.css
- High-resolution cover image
- Chapter navigation
- Responsive layout
- Search functionality
- Bookmark support

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

### Artwork Specifications

#### Cover Design Requirements
- **Front Cover**
  - Dimensions: 1600px × 2560px (2:3.2 ratio)
  - Resolution: 300 DPI minimum
  - Format: PNG or JPG (high quality)
  - Color Space: RGB
  - Safe Area: Keep important elements within 1400px × 2360px
  - Spine Width: 0.75 inches (adjust based on page count)
  - File Naming: `book-cover.png`

- **Back Cover**
  - Dimensions: 1600px × 2560px (2:3.2 ratio)
  - Resolution: 300 DPI minimum
  - Format: PNG or JPG (high quality)
  - Color Space: RGB
  - Safe Area: Keep important elements within 1400px × 2360px
  - File Naming: `book-cover-back.png`

#### Full-Page Images
- **Dimensions**: 1600px × 2560px (2:3.2 ratio)
- **Resolution**: 300 DPI minimum
- **Format**: PNG or JPG (high quality)
- **Color Space**: RGB
- **File Naming**: `chapter-{number}-image-{number}.png`

#### Chapter Header Images
- **Dimensions**: 1600px × 800px (2:1 ratio)
- **Resolution**: 300 DPI minimum
- **Format**: PNG or JPG (high quality)
- **Color Space**: RGB
- **File Naming**: `chapter-{number}-header.png`

#### Inline Images
- **Maximum Width**: 800px
- **Resolution**: 300 DPI minimum
- **Format**: PNG or JPG (high quality)
- **Color Space**: RGB
- **File Naming**: `chapter-{number}-inline-{number}.png`

### Artwork Directory Structure
```
src/content/book/
├── assets/
│   ├── book-cover.png
│   ├── book-cover-back.png
│   ├── chapter-1-image-1.png
│   ├── chapter-1-header.png
│   └── chapter-1-inline-1.png
```

### Pandoc Image Integration
```bash
pandoc metadata.yaml \
  --resource-path=.:assets \
  --epub-cover-image=assets/book-cover.png \
  --css=epub-style.css \
  # ... rest of the command ...
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

### Book Structure

#### Part 1: Welcome
- **Welcome Page**: Full-page design with book title and subtitle
- **About the Author**: Professional bio with photo
- **Foreword**: Introduction to the book's purpose
- **How to Use This Book**: Guide for readers

#### Part 2: You
- **Part Title Page**: Black page with "YOU" in large typography
- **Chapter 1**: Introduction
- **Chapter 2**: Architecture
- **Chapter 3**: Foundation
- **Chapter 4**: Company
- **Chapter 5**: Market
- **Chapter 6**: Customer
- **Chapter 7**: Alignment

#### Part 3: Attract
- **Part Title Page**: Black page with "ATTRACT" in large typography
- **Chapter 8**: Attract
- **Chapter 9**: Hook
- **Chapter 10**: Gift

#### Part 4: Convert
- **Part Title Page**: Black page with "CONVERT" in large typography
- **Chapter 11**: Identify
- **Chapter 12**: Convert
- **Chapter 13**: Engage
- **Chapter 14**: Sell

#### Part 5: Grow
- **Part Title Page**: Black page with "GROW" in large typography
- **Chapter 15**: Nurture
- **Chapter 16**: Upsell
- **Chapter 17**: Educate
- **Chapter 18**: Share
- **Chapter 19**: Optimise

### Enhanced Styling

```css
/* src/content/book/epub-style.css */

/* Part Title Pages */
.part-title {
    background-color: #000;
    color: #fff;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 2em;
}

.part-title h1 {
    font-size: 4em;
    font-weight: 900;
    letter-spacing: 0.1em;
    margin-bottom: 0.5em;
}

.part-title p {
    font-size: 1.5em;
    max-width: 600px;
    line-height: 1.4;
}

/* Chapter Title Pages */
.chapter-title {
    background-color: #000;
    color: #fff;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4em 2em;
}

.chapter-title h1 {
    font-size: 3em;
    font-weight: 800;
    text-align: center;
    margin-bottom: 1em;
}

.chapter-title p {
    font-size: 1.2em;
    max-width: 600px;
    text-align: center;
    line-height: 1.6;
}

.chapter-image {
    max-width: 80%;
    height: auto;
    margin: 2em auto;
}

/* Regular Content */
body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    line-height: 1.6;
    color: #333;
    margin: 0;
    padding: 2em;
}

h1, h2, h3, h4, h5, h6 {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif;
    color: #000;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    line-height: 1.2;
}

/* Typography */
h1 { font-size: 2.5em; }
h2 { font-size: 2em; }
h3 { font-size: 1.75em; }
h4 { font-size: 1.5em; }
h5 { font-size: 1.25em; }
h6 { font-size: 1.1em; }

/* Images */
img {
    max-width: 100%;
    height: auto;
    margin: 2em auto;
    display: block;
}

/* Blockquotes */
blockquote {
    border-left: 4px solid #000;
    margin: 2em 0;
    padding: 1em 2em;
    font-style: italic;
    background: #f9f9f9;
}

/* Code Blocks */
pre {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
}

code {
    font-family: "SF Mono", Menlo, Monaco, Consolas, monospace;
    font-size: 0.9em;
}

/* Lists */
ul, ol {
    margin: 1em 0;
    padding-left: 2em;
}

li {
    margin: 0.5em 0;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 2em 0;
}

th, td {
    padding: 0.75em;
    border: 1px solid #ddd;
}

th {
    background: #f5f5f5;
    font-weight: 600;
}
```

### Chapter Title Page Template

Each chapter should have a title page with the following structure:

```markdown
---
layout: chapter-title
title: "Chapter Title"
description: "Chapter description goes here"
image: "assets/chapter-title.png"
---

# Chapter Title

Chapter description goes here. This provides context and sets expectations for the chapter content.

![Chapter Title Image](assets/chapter-title.png)
```

### Part Title Page Template

Each part should have a title page with the following structure:

```markdown
---
layout: part-title
title: "PART TITLE"
description: "Part description goes here"
---

# PART TITLE

Part description goes here. This provides an overview of the section and its importance.
```

### Image Specifications

#### Chapter Title Images
- **Dimensions**: 1600px × 900px (16:9 ratio)
- **Resolution**: 300 DPI
- **Format**: PNG with transparency
- **Style**: Centered composition with chapter title and description
- **File Naming**: `chapter-{number}-title.png`

#### Part Title Images
- **Dimensions**: 1600px × 1600px (1:1 ratio)
- **Resolution**: 300 DPI
- **Format**: PNG with transparency
- **Style**: Bold typography with part title
- **File Naming**: `part-{number}-title.png`

### Pandoc Generation Command
```bash
# Generate the EPUB with enhanced styling
pandoc metadata.yaml \
  "welcome.md" \
  "part1-title.md" \
  "0. Introduction.md" \
  "1. Architecture.md" \
  "2. Foundation.md" \
  "3.  Company.md" \
  "3.1. Company Worksheet.md" \
  "4. Market.md" \
  "5. Customer.md" \
  "6. Alignment.md" \
  "part2-title.md" \
  "7.  Attract.md" \
  "8. Hook.md" \
  "9. Gift.md" \
  "part3-title.md" \
  "10.  Identify.md" \
  "11. Convert.md" \
  "12. Engage.md" \
  "13.  Sell.md" \
  "part4-title.md" \
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
  --epub-cover-image=assets/book-cover.png \
  -o TheElevatePlaybook.epub
```