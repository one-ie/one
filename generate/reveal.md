# Astro + Reveal.js Presentations System: Implementation Plan

A step-by-step checklist for building a robust, maintainable presentations system using Astro and Reveal.js. This plan covers content collections, dependency installation, component creation, embedding in courses, and advanced features.

---

## 📋 Project Tasks

### 1. Content Collections Setup
- [x] **Create `@config.ts` for Presentations**
  - [x] Define a new `presentations` collection schema using Zod in `src/content/config.ts` (or `@config.ts`).
    - Fields: `title`, `description`, `authors`, `publishedAt`, `draft`, `slides` (array of slide file paths or objects), `tags`, `coverImage`, etc.
    - _Schema will be added to `src/content/config.ts` using `defineCollection` and Zod, following the existing pattern._
  - [x] Export the collection and its inferred type.
- [x] **Add Example Presentation Content**
  - [x] Create a folder for presentations (e.g., `src/content/presentations/`).
    - _Folder `src/content/presentations` has been created._
  - [x] Add at least one example presentation using the new schema (YAML/MD/JSON/TS).
    - _Sample entry `src/content/presentations/example-presentation.md` has been created._

### 2. Install Reveal.js and Plugins
- [x] **Install Reveal.js and Types**
  - [x] Run: `pnpm add reveal.js`
    - _Reveal.js has been installed via pnpm._
  - [x] Run: `pnpm add -D @types/reveal.js` (if available)
    - _@types/reveal.js has been installed via pnpm._
- [x] **Install Highlight.js for Code Blocks**
  - [x] Run: `pnpm add highlight.js`
    - _Highlight.js has been installed via pnpm._
- [ ] **(Optional) Install Additional Reveal.js Plugins**
  - [ ] List and install any plugins needed (e.g., Markdown, Notes, Math, Zoom).

### 3. Astro Component for Presentations
- [x] **Create `Presentation.astro` Component**
  - [x] Presentation.tsx created as a React component for Reveal.js presentations.
    - _Component at `src/components/Presentation.tsx`._
  - [ ] Accept props: `slides`, `title`, `authors`, `description`, etc.
  - [ ] Render Reveal.js container and slides.
  - [ ] Import and initialize Reveal.js and plugins in a `<script>` block.
  - [ ] Support for code highlighting and plugin configuration.
  - [ ] Add fallback for SSR (e.g., static slide content if JS is disabled).
- [ ] **Create Slide Subcomponent (Optional)**
  - [ ] For modularity, create a `Slide.astro` or similar for individual slides.

### 4. Styling and Theming
- [x] **Import Reveal.js CSS**
  - [x] Add Reveal.js core and theme CSS in the component or global styles.
    - _Next: Import Reveal.js CSS in your Astro project for correct presentation rendering._
  - [x] Add Highlight.js or custom code block theme.
    - _monokai.css is imported in Presentation.tsx._
- [ ] **Support Custom Themes**
  - [ ] Allow theme selection via props or config.

### 5. Homepage and Presentation Index
- [ ] **Create Presentations Index Page**
  - [ ] List all presentations from the collection.
  - [ ] Show title, description, authors, cover image, and link to view.
- [ ] **Create Presentation Detail Page**
  - [ ] Dynamic route for each presentation (e.g., `/presentations/[slug].astro`).
  - [ ] Fetch presentation data and render with `Presentation.astro`.

### 6. Course Integration
- [ ] **Embed Presentations in Course Content**
  - [ ] Update course schema to reference presentations (by slug or ID).
  - [ ] In course pages, import and render the `Presentation.astro` component with the appropriate data.
  - [ ] Optionally, allow inline embedding of specific slides.

### 7. Advanced Features (Optional)
- [ ] **Configurable Reveal.js Plugins**
  - [ ] Allow plugin configuration via props or frontmatter.
- [ ] **Export/Download Slides**
  - [ ] Add button to export slides as PDF or HTML.
- [ ] **Analytics/Progress Tracking**
  - [ ] Track which slides have been viewed (for courses).

### 8. Testing and Documentation
- [ ] **Write Unit and Integration Tests**
  - [ ] Test collection schema validation.
  - [ ] Test presentation rendering and plugin initialization.
- [ ] **Document Usage**
  - [ ] Add README sections for:
    - How to add a new presentation
    - How to embed in courses
    - How to customize themes/plugins

---

## 🛠️ Next Steps

1. **Start with the content collection schema and example content.**
2. **Install dependencies.**
3. **Build the presentation component and test with sample data.**
4. **Integrate with course system and iterate.**