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
  -o TheElevatePlaybook.epub

# Open the EPUB (macOS)
open TheElevatePlaybook.epub

# Open the EPUB (Linux)
xdg-open TheElevatePlaybook.epub

# Open the EPUB (Windows)
start TheElevatePlaybook.epub
```

### Opening the EPUB

The generated EPUB file can be opened using:

1. **macOS**:
   - Double-click the file to open in Books app
   - Or use `open TheElevatePlaybook.epub` in terminal

2. **Windows**:
   - Double-click to open in Microsoft Edge
   - Or use `start TheElevatePlaybook.epub` in command prompt

3. **Linux**:
   - Use `xdg-open TheElevatePlaybook.epub` in terminal
   - Or open with your preferred EPUB reader

4. **EPUB Readers**:
   - Apple Books (macOS/iOS)
   - Google Play Books (Android)
   - Calibre (Cross-platform)
   - Adobe Digital Editions (Cross-platform)
   - Kindle (with conversion)

### EPUB Features
- Interactive table of contents
- Custom styling with Apple system fonts
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