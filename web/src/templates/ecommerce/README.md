# E-commerce Template - Product Store Starter Kit

**Version**: 1.0.0
**Pages**: 3 (Home, Shop, Product Detail)
**Use Case**: Sell physical or digital products online

## What's Included

### Pages
1. **Homepage** (`pages/index.astro`)
   - Hero section with background image
   - New arrivals showcase (4 products)
   - Sale items section
   - Features grid (shipping, returns, security, quality)
   - Call-to-action section

2. **Shop Page** (`pages/shop.astro`)
   - Full product catalog with grid layout
   - Filter bar (All, New, Sale, Category)
   - Responsive grid (1-4 columns)
   - Product cards with hover effects

3. **Product Detail** (`pages/product/[id].astro`)
   - Image gallery with thumbnails
   - Size and color selection
   - Stock information
   - Add to cart functionality
   - Related products section
   - Product details tabs

### Features
- ✅ Shopping cart with localStorage persistence
- ✅ Real product images from Unsplash API
- ✅ Mobile-responsive design
- ✅ Product filtering by category
- ✅ Sale pricing with discounts
- ✅ Trust indicators (reviews, shipping, returns)
- ✅ Dark mode support
- ✅ TypeScript for type safety

## Quick Start

### 1. Copy Template Files

```bash
# From web/ directory
cd src/templates/ecommerce

# Copy to your project
cp pages/* ../../pages/
cp lib/* ../../lib/
cp config/site.ts ../../config/
```

### 2. Customize Branding

Edit `config/site.ts`:

```typescript
export const siteConfig = {
  name: 'Your Store Name',
  description: 'Your store description',
  url: 'https://yourstore.com',

  navigation: [
    { title: 'Category 1', path: '/shop?category=category1' },
    { title: 'Category 2', path: '/shop?category=category2' },
    // Add your categories...
  ],
}
```

### 3. Update Product Data

Edit `lib/products.ts`:

```typescript
export const products: Product[] = [
  {
    id: '1',
    name: 'Your Product Name',
    description: 'Product description',
    price: 29.99,
    category: 'your-category',
    subcategory: 'tops',
    // ... add your products
  },
]
```

### 4. Customize Colors

Edit `src/styles/global.css`:

```css
@theme {
  --color-primary: 0 0% 11%;        /* Your primary color */
  --color-secondary: 28 30% 64%;    /* Your secondary color */
  --color-accent: 276 30% 45%;      /* Your accent color */
}
```

## Product Data Structure

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory: string;
  sizes: string[];
  colors: string[];
  images: string[];  // Unsplash URLs
  isNew: boolean;
  isSale: boolean;
  stock: number;
}
```

## Examples Built with This Template

### Nine Padel (Padel Equipment)
- **Colors**: Dark navy, tan, purple, teal
- **Font**: Outfit (300, 400, 700, 900)
- **Categories**: Rackets, Bags, Shoes, Balls, Apparel
- **Products**: 12 padel items

### SHOS (Fashion Store)
- **Colors**: Similar scheme
- **Font**: Outfit
- **Categories**: Men, Women, Unisex, Accessories
- **Products**: 12 clothing items

## Customization Checklist

- [ ] Update site name and description (`config/site.ts`)
- [ ] Add your logo (`/public/logo.svg`, `/public/icon.svg`)
- [ ] Change color scheme (`src/styles/global.css`)
- [ ] Update navigation categories (`config/site.ts`)
- [ ] Add your products (`lib/products.ts`)
- [ ] Replace placeholder images with your photos
- [ ] Update footer content
- [ ] Configure payment integration (optional)
- [ ] Set up analytics (optional)

## Color Schemes

### Default (Nine Padel)
```css
Primary: #1D1D1D (Dark navy)
Secondary: #CEA177 (Tan)
Accent: #785499 (Purple) / #6EC1E4 (Teal)
Background: #F8F8F8 (Light gray)
```

### Fashion Store
```css
Primary: #000000 (Black)
Secondary: #FFFFFF (White)
Accent: #FF385C (Hot pink)
Background: #F7F7F7 (Off-white)
```

### Electronics
```css
Primary: #0A2540 (Navy blue)
Secondary: #635BFF (Stripe purple)
Accent: #00D4FF (Cyan)
Background: #FFFFFF (White)
```

## Font Options

- **Modern**: Outfit, Inter, Manrope
- **Classic**: Playfair Display, Crimson Pro
- **Playful**: Poppins, Raleway
- **Minimal**: Work Sans, DM Sans

## Image Sources

**Free Stock Photos**:
- Unsplash API (current default)
- Pexels API
- Pixabay

**Your Own Photos**:
Replace image URLs in `lib/products.ts` with your own hosted images.

## Next Steps

1. **Add Payment**: Integrate Stripe or PayPal
2. **Add Backend**: Connect to Convex for real-time cart sync
3. **Add Reviews**: Customer reviews and ratings
4. **Add Search**: Full-text product search
5. **Add Wishlist**: Save favorite products
6. **Add Checkout**: Complete checkout flow

## Support

- **Docs**: `/one/things/templates.md`
- **Issues**: GitHub Issues
- **Examples**: See `/apps/sho/` for Nine Padel implementation

---

**Built with Astro 5, React 19, Tailwind v4, and shadcn/ui**
