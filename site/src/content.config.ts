import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'zod'

// Products for sale on this site — one markdown file per product. Priced
// server-side only: link.ts's resolveProduct() reads this collection, never
// a client-sent amount, so a buyer can never tamper with a catalog price.
const ProductSchema = z.object({
  name: z.string(),
  priceCents: z.number().int().positive(),
  description: z.string(),
  // Optional richer fields for a full product landing page (src/pages/products/[slug].astro).
  // Absent on a minimal product — the catalog card and nav link still work with just the three above.
  tagline: z.string().optional(),
  bullets: z.array(z.string()).optional(),
})

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ProductSchema,
})

// Blog posts — powers @oneie/plugin-blog's injected /blog + /blog/[slug] routes.
const BlogSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.date(),
  category: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: BlogSchema,
})

// Docs — powers @oneie/plugin-docs' /docs + /docs/[slug] routes.
const DocsSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  order: z.number().optional(),
})

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: DocsSchema,
})

export const collections = { products, blog, docs }
