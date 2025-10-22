# Playbook Stripe Integration - Setup Summary

Complete summary of the playbook product integration with Stripe.

## What Was Created

### 1. Stripe Product

**Product Details:**
- Name: `ONE Platform Playbook`
- Description: Complete playbook for building AI-native platforms with the 6-dimension ontology
- Product ID: `prod_THAlCa6tZvadtR`
- Price ID: `price_0SKcPaqs14Mpveu1NRULjmwD`
- Amount: **$47.00 USD** (one-time payment)
- Status: Active

### 2. Pages Created

**Pay Page** (`/pay-playbook`)
- File: `src/pages/pay-playbook.astro`
- Purpose: Creates Stripe checkout session and redirects to Stripe
- Features:
  - Server-side rendering (SSR)
  - Environment variable configuration
  - Error handling with user-friendly messages
  - Loading state while redirecting

**Thank You Page** (`/thankyou-playbook`)
- File: `src/pages/thankyou-playbook.astro`
- Purpose: Confirmation page after successful payment
- Features:
  - Retrieves session details from Stripe
  - Displays customer information
  - Download button for playbook
  - What's inside preview
  - Lifetime access notice

### 3. Scripts Created

**Create Playbook Product** (`scripts/create-playbook-product.ts`)
- Creates the playbook product in Stripe
- Sets up pricing
- Updates `.stripe-config.json`
- Outputs environment variables

**List Products** (`scripts/list-stripe-products.ts`)
- Lists all products in your Stripe account
- Shows prices and active status
- Useful for finding product IDs

**Fetch Product** (`scripts/fetch-stripe-product.ts`)
- Fetches details for a specific product
- Shows all prices
- Outputs environment variable format

### 4. Environment Variables

Added to `.env.local`:

```bash
STRIPE_PLAYBOOK_PRICE_ID=price_0SKcPaqs14Mpveu1NRULjmwD
```

Added to `.env.example`:

```bash
STRIPE_PLAYBOOK_PRICE_ID=price_...           # Playbook price ID
```

### 5. Configuration Files Updated

**`.stripe-config.json`**
```json
{
  "environment": "live",
  "createdAt": "2025-10-21T09:55:43.049Z",
  "updatedAt": "2025-10-21T10:05:12.049Z",
  "products": [
    {
      "name": "ONE Platform Course",
      "productId": "prod_THAdytWWNfieJ0",
      "priceId": "price_0SKcI6qs14Mpveu16vIPzJbH",
      "amount": 9700,
      "currency": "usd"
    },
    {
      "name": "ONE Platform Playbook",
      "productId": "prod_THAlCa6tZvadtR",
      "priceId": "price_0SKcPaqs14Mpveu1NRULjmwD",
      "amount": 4700,
      "currency": "usd"
    }
  ]
}
```

**`package.json`** - Added scripts:
```json
{
  "scripts": {
    "stripe:setup": "bun run scripts/setup-stripe-products.ts",
    "stripe:list": "bun run scripts/list-stripe-products.ts",
    "stripe:fetch": "bun run scripts/fetch-stripe-product.ts"
  }
}
```

## Usage

### Testing the Playbook Checkout

1. **Start dev server:**
   ```bash
   bun run dev
   ```

2. **Visit the pay page:**
   ```
   http://localhost:4321/pay-playbook
   ```

3. **You'll be redirected to Stripe Checkout**

4. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any ZIP code (e.g., `12345`)

5. **After payment:**
   - Redirected to `/thankyou-playbook?session_id=...`
   - See confirmation and download button

### Managing Stripe Products

**List all products:**
```bash
bun run stripe:list
```

**Fetch specific product:**
```bash
bun run stripe:fetch prod_THAlCa6tZvadtR
```

**Create new products:**
Edit `scripts/setup-stripe-products.ts` and add to the `PRODUCTS` array, then:
```bash
bun run stripe:setup
```

## File Structure

```
web/
├── src/
│   └── pages/
│       ├── pay-playbook.astro          # Checkout page
│       └── thankyou-playbook.astro     # Success page
├── scripts/
│   ├── setup-stripe-products.ts        # Create products (original)
│   ├── create-playbook-product.ts      # Create playbook (standalone)
│   ├── list-stripe-products.ts         # List all products
│   ├── fetch-stripe-product.ts         # Fetch product details
│   └── README.md                       # Scripts documentation
├── .stripe-config.json                  # Product configuration (git-ignored)
├── .env.local                          # Environment variables (git-ignored)
├── .env.example                        # Environment template
└── STRIPE-SETUP-GUIDE.md               # Complete Stripe guide
```

## Product Comparison

| Feature | Course | Playbook |
|---------|--------|----------|
| **Price** | $97.00 | $47.00 |
| **Type** | One-time | One-time |
| **Page** | `/pay-course` | `/pay-playbook` |
| **Success** | `/thankyou-course` | `/thankyou-playbook` |
| **Cancel** | `/stripe` | `/playbook` |
| **Product ID** | `prod_THAdytWWNfieJ0` | `prod_THAlCa6tZvadtR` |
| **Price ID** | `price_0SKcI6qs14Mpveu16vIPzJbH` | `price_0SKcPaqs14Mpveu1NRULjmwD` |

## Key Differences from Course

**Playbook-Specific Features:**

1. **Instant Download** (vs. Course start date)
2. **Lifetime Updates** (vs. Fixed course content)
3. **Money-Back Guarantee** badge
4. **Download button** on thank you page
5. **Different benefits** displayed:
   - Instant Download
   - Lifetime Updates
   - Money-Back Guarantee

**Course-Specific Features:**

1. **Start Date** (June 1st, 2025)
2. **Calendar integration** messaging
3. **Login credentials** mention
4. **Different benefits** displayed:
   - Instant Access
   - Premium Support
   - Cancel Anytime

## API Version Update

Fixed TypeScript error by updating Stripe API version across all files:

**Before:**
```typescript
apiVersion: '2025-02-24.acacia'  // ❌ Type error
```

**After:**
```typescript
apiVersion: '2025-09-30.clover'  // ✅ Correct
```

**Updated Files:**
- `src/pages/pay-course.astro`
- `src/pages/pay-playbook.astro`
- `scripts/setup-stripe-products.ts`
- `scripts/create-playbook-product.ts`
- `scripts/list-stripe-products.ts`
- `scripts/fetch-stripe-product.ts`

## Next Steps

### 1. Add Playbook Download Functionality

Currently, the download button is a placeholder. Implement actual download:

```typescript
// Option 1: Store file in Convex
// Option 2: Use Cloudflare R2
// Option 3: Send download link via email
```

### 2. Add Webhook Handler

For production, verify payments via webhooks:

```typescript
// src/pages/api/webhooks/stripe.ts
export const POST: APIRoute = async ({ request }) => {
  const event = await stripe.webhooks.constructEvent(
    await request.text(),
    request.headers.get('stripe-signature')!,
    import.meta.env.STRIPE_WEBHOOK_SECRET!
  );

  if (event.type === 'checkout.session.completed') {
    // Grant access to playbook
    // Send download email
  }
};
```

### 3. Track Purchases in Convex

Store purchase records:

```typescript
// backend/convex/mutations/purchases.ts
export const recordPlaybookPurchase = mutation({
  args: {
    sessionId: v.string(),
    email: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('purchases', {
      productType: 'playbook',
      stripeSessionId: args.sessionId,
      customerEmail: args.email,
      amountPaid: args.amount,
      purchasedAt: Date.now(),
    });
  },
});
```

### 4. Email Integration

Send download link via Resend:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'ONE Platform <noreply@one.ie>',
  to: customerEmail,
  subject: 'Your ONE Platform Playbook',
  html: `<a href="${downloadUrl}">Download Playbook</a>`,
});
```

### 5. Add to Main Navigation

Link to `/playbook` page from your main navigation to drive traffic.

## Testing Checklist

- [x] Stripe product created
- [x] Environment variables configured
- [x] Pay page redirects to Stripe
- [x] Thank you page displays after payment
- [x] Test card payment succeeds
- [ ] Download button works
- [ ] Webhook receives events
- [ ] Purchase recorded in Convex
- [ ] Email sent with download link
- [ ] Live mode tested with real card

## Support

For issues or questions:

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Documentation**: See `STRIPE-SETUP-GUIDE.md`
- **Scripts Help**: See `scripts/README.md`

---

**Setup completed successfully!** 🎉

You can now sell the ONE Platform Playbook at `http://localhost:4321/pay-playbook`
