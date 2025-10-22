// Product types for ecommerce templates
// Maps to ecommerce ontology: products, categories, collections

import type { CollectionEntry } from 'astro:content';

// Core product types from content collections
export type Product = CollectionEntry<'products'>['data'] & {
  id?: string; // Optional ID (defaults to slug if not provided)
};
export type ProductVariant = NonNullable<Product['variants']>[number];
export type Category = CollectionEntry<'categories'>['data'];
export type ProductCollection = CollectionEntry<'collections'>['data'];

// Extended product with slug and body
export interface ProductWithContent extends Product {
  slug: string;
  body: string;
}

// Shopping cart types (thing type: shopping_cart in ontology)
export interface CartItem {
  productSlug: string;
  productName: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
  selectedColor?: string;
  selectedSize?: string;
  image: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}

// Order types (thing type: order in ontology)
export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Payment types (thing type: payment in ontology)
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'paypal' | 'crypto' | 'bank_transfer';
  transactionId?: string;
  createdAt: number;
}

// Customer review types (thing type: customer_review in ontology)
export interface Review {
  id: string;
  productSlug: string;
  customerId: string;
  customerName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  createdAt: number;
}

// Discount types (thing type: discount_code in ontology)
export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minPurchase?: number;
  expiresAt?: number;
  usageLimit?: number;
  usageCount: number;
  active: boolean;
}
