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
})

const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: ProductSchema,
})

export const collections = { products }
