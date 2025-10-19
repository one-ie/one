export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: 'men' | 'women' | 'unisex';
  subcategory: 'tops' | 'bottoms' | 'outerwear' | 'accessories' | 'shoes';
  sizes: string[];
  colors: string[];
  images: string[];
  isNew: boolean;
  isSale: boolean;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}
