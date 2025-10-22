/**
 * Ecommerce Type Definitions
 * Based on ONE Platform 6-dimension ecommerce ontology
 */

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  thumbnail: string;
  category: string;
  tags: string[];
  variants?: ProductVariant[];
  inStock: boolean;
  inventory?: number;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: 'size' | 'color' | 'material' | 'custom';
  options: VariantOption[];
}

export interface VariantOption {
  value: string;
  label: string;
  priceModifier?: number;
  inStock?: boolean;
  image?: string; // For color swatches
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  productCount: number;
  parentCategory?: string;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  products: string[]; // Product IDs
  featured?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: Date;
  verified?: boolean;
  helpful?: number;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  variant?: {
    size?: string;
    color?: string;
  };
}

export interface FilterOptions {
  categories?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  inStockOnly?: boolean;
  tags?: string[];
  rating?: number; // Minimum star rating (1-5)
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating';
}
