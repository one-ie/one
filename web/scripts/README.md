# Scripts Directory

Automation scripts for ONE Platform development and deployment.

## Stripe Setup

### `setup-stripe-products.ts`

Automated Stripe product and price creation script.

**Purpose**: Creates products and prices in your Stripe account and generates the necessary environment variables.

**Usage**:

```bash
bun run stripe:setup
```

**What it does**:

1. Connects to Stripe using `STRIPE_SECRET_KEY` from `.env.local`
2. Creates products defined in the `PRODUCTS` array
3. Creates prices for each product
4. Saves configuration to `.stripe-config.json`
5. Outputs environment variables to add to `.env.local`

**Configuration**:

Edit the `PRODUCTS` array in the script to add/modify products:

```typescript
const PRODUCTS = [
  {
    name: 'ONE Platform Course',
    description: 'Complete course...',
    images: ['https://one.ie/images/course.jpg'],
    defaultPrice: {
      currency: 'usd',
      unitAmount: 9700, // $97.00 in cents
      nickname: 'ONE Course - One-time Payment',
    },
  },
  // Add more products here
];
```

**Output**:

- `.stripe-config.json` - Product and price configuration (git-ignored)
- Environment variable assignments to copy to `.env.local`

**Requirements**:

- Stripe account
- `STRIPE_SECRET_KEY` in `.env.local`
- Bun runtime

**Example Output**:

```
🔧 Setting up Stripe products and prices...

📦 Creating product: ONE Platform Course
   ✅ Product created: prod_THAdytWWNfieJ0
💰 Creating price for ONE Platform Course
   ✅ Price created: price_0SKcI6qs14Mpveu16vIPzJbH
   💵 Amount: $97.00 USD

✅ All products and prices created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add these to your .env.local file:

STRIPE_COURSE_PRICE_ID=price_0SKcI6qs14Mpveu16vIPzJbH
```

**See Also**: [STRIPE-SETUP-GUIDE.md](../STRIPE-SETUP-GUIDE.md) for complete Stripe integration documentation.

## Other Scripts

Additional scripts will be documented here as they are added.
