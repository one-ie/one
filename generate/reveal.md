Creating a Slide repository with Astro and Reveal.js
#
astro
#
webdev
#
javascript
#
revealjs
Reveal.js is a powerful tool for creating beautiful slide presentations using web technologies. However, managing individual repositories for each presentation becomes increasingly difficult as the collection expands.

Enter Astro - the modern framework for content-driven websites. Astro delivers zero-JS-by-default, Islands Architecture for partial hydration, file-based routing, TS and multi-framework (React, Vue, Svelte, etc.) support. These features make it a perfect tool for what we'll be building.

Goal
We'll create an Astro website that:

Centralizes all Reveal.js presentations in one place
Provides a main page listing all available slides
Supports multiple UI frameworks for interactive demos
Let's Get Started!
1. Create an Astro Project
First, let's scaffold a new Astro project with pnpm:

pnpm create astro@latest
2. Create a Reveal.js Layout
We'll create a reusable layout component for our slides:

---
export interface Props {
    title: "string;"
    authors: string[];
    description?: string;
}
import Layout from "./BaseLayout.astro";
import "reveal.js/dist/reveal.css";
import "reveal.js/plugin/highlight/monokai.css";

const { title, authors, description } = Astro.props;
---

{/* See Layout at https://github.com/hnrq/slides/blob/main/src/layouts/SlideLayout.astro */}
<Layout {title}>
  <Fragment slot="head">
    {description && <meta name="description" content={description} />}
    {authors.map((author) => <meta name="author" content={author} />)}
  </Fragment>

  <div class="reveal">
      <div class="slides"><slot /></div>
  </div>
</Layout>

<script>
  import Reveal from "reveal.js";
  import Highlight from "reveal.js/plugin/highlight/highlight.esm.js";

  let deck = new Reveal({ plugins: [Highlight] });
  deck.initialize();
</script>
3. Creating Individual Slides
Each slide is an .astro file in src/slides with frontmatter metadata:

---
import CSSPropertyDemo from "./components/CSSPropertyDemo.svelte";

export const title = "CSS Flexbox";
export const authors = ["Henrique Ramos"];
export const publishedAt = "2025-01-27";
export const description = "Do you even flex?";
export const draft = true;
---

<section>
  <h2>What is Flexbox?</h2>
  <ul>
    <li>One-dimensional layout model</li>
    <li>Distributes space along a single direction</li>
    <li>Powerful alignment capabilities</li>
  </ul>
</section>
4. Leveraging Astro Islands
One of the coolest features of Astro is being any UI framework for interactive components. For example, we can create a Svelte component for demonstrating CSS properties and append it to the slide.

5. Building the Homepage
Since Astro doesn't yet support .astro content collections, we'll create a utility to load and validate our slides:

import type { AstroInstance } from "astro";
import { type } from "arktype";

type Opts<T extends Record<string, unknown>> = {
  files: Record<string, T>;
  schema: type;
};

const astroPageType = type({
  "draft?": "boolean",
});

const getAstroPages = <T extends Record<string, unknown> & AstroInstance>({
  files,
  schema,
}: Opts<T>) => {
  // ... implementation
};

export default getAstroPages;
And create a slides getter:

const schema = type({
  title: "string",
  description: "string",
  authors: "string[]",
  publishedAt: "string",
});

type Slide = AstroInstance & typeof schema.infer & { [key: string]: unknown };

export const getSlides = () =>
  getAstroPages<Slide>({
    files: import.meta.glob<true, string, Slide>(
      ["@slides/**/index.astro", "@slides/*.astro"],
      { eager: true },
    ),
    schema,
  });

Finally, implement the homepage:

---
import { getSlides } from "@utils/getSlides";

const slides = getSlides()
  .filter(({ draft }) => !draft)
  .sort((c1, c2) => (c1.title > c2.title ? -1 : 1));
---

<h1>Slides</h1>
<p>Here you can find a list of all available slides:</p>
{
  slides.map((slide) => (
    <a href={`/${slide.id}`}>
      <h2>{slide.title}</h2>
      <p>{slide.description}</p>
      <small>{new Date(slide.publishedAt).toLocaleDateString()}</small>
    </a>
  ))
}
Future Improvements
Here are some ideas to improve:

Make Reveal.js plugins configurable through props
Improve code block highlighting in client-side components
Add presentation themes and customization options
Conclusion
By combining Astro with Reveal.js, we've created a modern, maintainable system for managing presentations, allowing us to centralize and enhance our slides with Interactivity Islands.

What do you think? Share your thoughts and ideas in the comments below!

Live demo and Code.