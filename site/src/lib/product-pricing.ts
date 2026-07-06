/**
 * Server-side price resolution for the products content collection — the
 * catalog sibling of plan-pricing.ts's resolvePlan(). link.ts resolves a
 * product's price from here, never from the client, so a buyer can never
 * tamper with a catalog product's price.
 */
import { getCollection, type CollectionEntry } from 'astro:content'

export interface Product {
  slug: string
  cents: number
  label: string
}

export async function resolveProduct(productId: string | undefined | null): Promise<Product | null> {
  if (!productId) return null
  const entries = await getCollection('products')
  const entry = entries.find((e: CollectionEntry<'products'>) => e.id === productId)
  if (!entry) return null
  return { slug: entry.id, cents: entry.data.priceCents, label: entry.data.name }
}
