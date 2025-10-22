# Stripe Elements Checkout Integration

Complete Stripe Elements integration for secure payment processing on the ONE Platform.

## Overview

This integration provides a production-ready checkout experience with:

- ✅ **Stripe Elements** - PCI-compliant card input with automatic validation
- ✅ **Server-side amount calculation** - Never trust client-side prices
- ✅ **Type-safe API** - Full TypeScript support across frontend and backend
- ✅ **Error handling** - User-friendly error messages with retry logic
- ✅ **Security** - HTTPS-only in production, environment variable validation
- ✅ **Order confirmation** - Email receipts and order tracking
- ✅ **Test cards** - Easy testing with documented test card numbers

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CHECKOUT FLOW                              │
└──────────────────────────────────────────────────────────────┘

1. User adds items to cart
   └─> CartItem[] stored in state/localStorage

2. User navigates to checkout page
   └─> POST /api/checkout/create-intent
       ├─> Validates cart items against database
       ├─> Calculates total server-side (NEVER trust client)
       └─> Creates Stripe PaymentIntent
           └─> Returns clientSecret

3. Checkout page loads Stripe Elements
   └─> StripeProvider wraps PaymentForm
       ├─> Loads Stripe.js
       └─> Initializes Elements with clientSecret

4. User enters payment details
   └─> PaymentElement (card input)
   └─> BillingAddress (form fields)

5. User submits payment
   └─> stripe.confirmPayment()
       ├─> Stripe processes payment
       └─> Returns PaymentIntent

6. Frontend confirms order
   └─> POST /api/checkout/confirm
       ├─> Verifies PaymentIntent with Stripe
       ├─> Creates order record in database
       ├─> Sends confirmation email
       └─> Returns OrderConfirmation

7. User redirected to confirmation page
   └─> GET /api/checkout/status/[id]
       └─> Shows order details and status
```

## Setup Instructions

### 1. Get Stripe API Keys

1. Sign up at https://stripe.com
2. Go to **Developers → API Keys**
3. Copy your **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret key** (starts with `sk_test_` or `sk_live_`)

### 2. Configure Environment Variables

Add to `/Users/toc/Server/ONE/web/.env.local`:

```bash
# Stripe Payments
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...  # From Stripe dashboard
STRIPE_SECRET_KEY=sk_test_51...              # From Stripe dashboard
STRIPE_WEBHOOK_SECRET=whsec_...              # Optional (for webhooks)
```

**Security Notes:**

- `PUBLIC_STRIPE_PUBLISHABLE_KEY` is safe to expose client-side
- `STRIPE_SECRET_KEY` must NEVER be exposed client-side
- Never commit `.env.local` to version control
- Use test keys in development, live keys in production only

### 3. Install Dependencies

Already installed:

```bash
bun add stripe @stripe/stripe-js @stripe/react-stripe-js
```

### 4. Verify Setup

Check that environment variables are loaded:

```bash
cd /Users/toc/Server/ONE/web
bun run dev

# Visit http://localhost:4321/checkout
# Should load Stripe Elements (not show error)
```

## Usage

### Basic Checkout Page

```astro
---
// src/pages/checkout.astro
import { StripeProvider } from '@/components/ecommerce/payment/StripeProvider';
import { PaymentForm } from '@/components/ecommerce/payment/PaymentForm';
import { OrderSummary } from '@/components/ecommerce/payment/OrderSummary';

// Create PaymentIntent on server
const response = await fetch(`${Astro.url.origin}/api/checkout/create-intent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: [
      { productId: 'product-1', quantity: 2 },
      { productId: 'product-2', quantity: 1 },
    ],
  }),
});

const { clientSecret, amount, currency } = await response.json();

// Mock cart items for display
const cartItems = [
  {
    product: {
      id: 'product-1',
      name: 'Premium T-Shirt',
      price: 2999,
      images: ['/images/tshirt.jpg'],
    },
    quantity: 2,
  },
];

const calculation = {
  subtotal: 5998,
  shipping: 0,
  tax: 480,
  total: 6478,
  currency: 'usd',
};
---

<Layout>
  <div class="container mx-auto grid gap-8 py-8 lg:grid-cols-2">
    <!-- Order Summary -->
    <OrderSummary items={cartItems} calculation={calculation} />

    <!-- Payment Form -->
    <StripeProvider client:load clientSecret={clientSecret}>
      <PaymentForm
        client:load
        onSuccess={(orderId) => {
          window.location.href = `/orders/${orderId}`;
        }}
      />
    </StripeProvider>
  </div>
</Layout>
```

### Custom Appearance

Customize Stripe Elements to match your brand:

```tsx
import type { StripeElementsAppearance } from '@/types/stripe';

const customAppearance: StripeElementsAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0070f3',
    colorBackground: '#ffffff',
    colorText: '#000000',
    colorDanger: '#df1b41',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '8px',
  },
};

<StripeProvider clientSecret={clientSecret} appearance={customAppearance}>
  <PaymentForm />
</StripeProvider>
```

### API Routes

#### Create PaymentIntent

```typescript
POST /api/checkout/create-intent

Request:
{
  "items": [
    {
      "productId": "product-1",
      "quantity": 2,
      "selectedColor": "blue",
      "selectedSize": "M"
    }
  ],
  "currency": "usd",  // optional
  "metadata": {}      // optional
}

Response:
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx",
  "amount": 6478,
  "currency": "usd"
}
```

#### Confirm Payment

```typescript
POST /api/checkout/confirm

Request:
{
  "paymentIntentId": "pi_xxx",
  "billingAddress": {
    "name": "John Doe",
    "email": "john@example.com",
    "line1": "123 Main St",
    "line2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  }
}

Response:
{
  "success": true,
  "orderId": "pi_xxx",
  "orderNumber": "ONE-ABC123-XYZ",
  "amount": 6478,
  "currency": "usd",
  "items": [...],
  "billingAddress": {...},
  "createdAt": 1234567890,
  "estimatedDelivery": "2025-01-27"
}
```

#### Check Payment Status

```typescript
GET /api/checkout/status/[paymentIntentId]

Response:
{
  "status": "succeeded",  // pending | processing | succeeded | failed | canceled
  "paymentIntentId": "pi_xxx",
  "amount": 6478,
  "currency": "usd",
  "orderId": "pi_xxx",    // only if succeeded
  "error": "..."          // only if failed
}
```

## Test Cards

Use these test card numbers in **test mode** (with `pk_test_` and `sk_test_` keys):

| Card Number         | Scenario                          | Notes                          |
| ------------------- | --------------------------------- | ------------------------------ |
| 4242 4242 4242 4242 | Successful payment                | Default test card              |
| 4000 0000 0000 0002 | Card declined                     | Generic decline                |
| 4000 0027 6000 3184 | 3D Secure authentication required | Tests SCA flow                 |
| 4000 0000 0000 9995 | Insufficient funds                | Specific decline reason        |
| 4000 0000 0000 0341 | Charge succeeds, but fails later  | Tests disputed transactions    |
| 5555 5555 5555 4444 | Mastercard (successful)           | Alternative card brand         |
| 3782 822463 10005   | American Express (successful)     | Amex test card                 |

**Additional test details:**

- **Expiry Date:** Use any future date (e.g., 12/34)
- **CVC:** Use any 3 digits (e.g., 123) or 4 for Amex (e.g., 1234)
- **ZIP Code:** Use any 5 digits (e.g., 12345)

**Important:** Never use real card numbers in test mode. Stripe will reject them.

Full list: https://stripe.com/docs/testing

## Security Best Practices

### 1. Server-Side Amount Calculation

**NEVER trust client-side prices.** Always calculate order totals server-side:

```typescript
// ❌ WRONG - Client can manipulate this
const amount = clientProvidedAmount;

// ✅ CORRECT - Server calculates from database
async function calculateOrderTotal(items) {
  let total = 0;
  for (const item of items) {
    const product = await db.get(item.productId);
    total += product.price * item.quantity;
  }
  return total;
}
```

### 2. Validate Inventory

Check stock before creating PaymentIntent:

```typescript
for (const item of items) {
  const product = await db.get(item.productId);
  if (product.stock < item.quantity) {
    throw new Error(`Insufficient stock for ${product.name}`);
  }
}
```

### 3. HTTPS Only in Production

Stripe Elements require HTTPS in production. Local development works with HTTP.

### 4. Environment Variable Validation

```typescript
// Prevent test keys in production
const isProduction = import.meta.env.MODE === 'production';
const isTestKey = STRIPE_SECRET_KEY.startsWith('sk_test_');

if (isProduction && isTestKey) {
  throw new Error('Cannot use Stripe test keys in production');
}
```

### 5. Webhook Verification

For production, implement webhook handling:

```typescript
// POST /api/stripe/webhook
const signature = request.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  STRIPE_WEBHOOK_SECRET
);

if (event.type === 'payment_intent.succeeded') {
  // Handle successful payment
}
```

## Error Handling

### Client-Side Errors

```tsx
<PaymentForm
  onError={(error) => {
    // Display user-friendly error messages
    switch (error.type) {
      case 'card_error':
        // Card was declined
        showToast(error.message);
        break;
      case 'validation_error':
        // Invalid input (e.g., expired card)
        showToast(error.message);
        break;
      case 'api_error':
        // Stripe API error (rare)
        showToast('Payment system error. Please try again.');
        break;
      case 'network_error':
        // Connection issue
        showToast('Network error. Please check your connection.');
        break;
    }
  }}
/>
```

### Server-Side Errors

API routes return standardized error responses:

```typescript
{
  "error": "Card was declined",
  "type": "card_error",
  "code": "card_declined",
  "param": "payment_method"
}
```

## Future Integration Points

### WooCommerce Payment Gateway

```php
// plugins/woocommerce-one-gateway/
class WC_ONE_Gateway extends WC_Payment_Gateway {
  public function process_payment($order_id) {
    // Call ONE Platform API
    $response = wp_remote_post(ONE_API_URL . '/checkout/create-intent', [
      'body' => json_encode(['items' => $order_items])
    ]);
  }
}
```

### Shopify Checkout API

```javascript
// extensions/checkout-ui/
import { useApi } from '@shopify/checkout-ui-extensions-react';

export function CheckoutExtension() {
  const api = useApi();

  const handlePayment = async () => {
    // Call ONE Platform API
    const response = await fetch('/api/checkout/create-intent');
  };
}
```

### Alternative Payment Methods

Stripe Elements supports additional payment methods:

```tsx
const options = {
  clientSecret,
  appearance,
  paymentMethodTypes: [
    'card',
    'apple_pay',
    'google_pay',
    'klarna',
    'afterpay_clearpay',
  ],
};
```

## Troubleshooting

### Issue: "Stripe.js failed to load"

**Cause:** `PUBLIC_STRIPE_PUBLISHABLE_KEY` not set or invalid

**Solution:**

1. Check `.env.local` has `PUBLIC_STRIPE_PUBLISHABLE_KEY`
2. Restart dev server (`bun run dev`)
3. Verify key starts with `pk_test_` or `pk_live_`

### Issue: "PaymentIntent creation failed"

**Cause:** `STRIPE_SECRET_KEY` not set or invalid

**Solution:**

1. Check `.env.local` has `STRIPE_SECRET_KEY`
2. Verify key starts with `sk_test_` or `sk_live_`
3. Check Stripe dashboard for API errors

### Issue: "Card declined"

**Cause:** Using wrong test card or real card in test mode

**Solution:**

1. Use `4242 4242 4242 4242` for successful test
2. Use `4000 0000 0000 0002` to test decline handling
3. Check Stripe dashboard logs for decline reason

### Issue: "Payment succeeded but order not created"

**Cause:** Error in `/api/checkout/confirm` endpoint

**Solution:**

1. Check server logs for errors
2. Verify database connection
3. Check email service (Resend) configuration

## Components

### StripeProvider

Wraps checkout with Stripe Elements context.

**Props:**

- `children: ReactNode` - Child components (PaymentForm, etc.)
- `clientSecret: string` - From PaymentIntent API
- `appearance?: StripeElementsAppearance` - Custom styling

### PaymentForm

Complete payment form with card input and billing address.

**Props:**

- `onSuccess: (orderId: string) => void` - Called after successful payment
- `onError?: (error: StripeError) => void` - Called on payment error
- `returnUrl?: string` - Redirect URL for 3D Secure

### OrderSummary

Displays order line items and totals.

**Props:**

- `items: CartItem[]` - Cart items to display
- `calculation: OrderCalculation` - Subtotal, shipping, tax, total
- `showTitle?: boolean` - Show "Order Summary" title (default: true)

## Types

All TypeScript types are defined in `/Users/toc/Server/ONE/web/src/types/stripe.ts`:

- `PaymentIntentRequest`
- `PaymentIntentResponse`
- `BillingAddress`
- `PaymentConfirmationRequest`
- `OrderConfirmation`
- `OrderItem`
- `PaymentStatusResponse`
- `StripeError`
- `OrderCalculation`
- `StripeElementsAppearance`

## Files

```
web/
├── src/
│   ├── components/
│   │   └── ecommerce/
│   │       └── payment/
│   │           ├── StripeProvider.tsx      # Stripe Elements wrapper
│   │           ├── PaymentForm.tsx         # Payment form with card input
│   │           ├── OrderSummary.tsx        # Order display
│   │           └── README.md               # This file
│   ├── pages/
│   │   └── api/
│   │       └── checkout/
│   │           ├── create-intent.ts        # POST - Create PaymentIntent
│   │           ├── confirm.ts              # POST - Confirm payment
│   │           └── status/
│   │               └── [id].ts             # GET - Payment status
│   └── types/
│       └── stripe.ts                       # TypeScript types
└── .env.example                            # Environment variables template
```

## Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Elements:** https://stripe.com/docs/stripe-js
- **Test Cards:** https://stripe.com/docs/testing
- **API Reference:** https://stripe.com/docs/api
- **Webhooks:** https://stripe.com/docs/webhooks
- **Security:** https://stripe.com/docs/security

## Support

For issues with this integration:

1. Check this README for troubleshooting
2. Review Stripe Dashboard logs
3. Check server logs for API errors
4. Test with documented test cards
5. Verify environment variables are set correctly

---

**Built for ONE Platform** - Simple enough for children. Powerful enough for enterprises.
