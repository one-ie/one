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

export const collections = { products }
