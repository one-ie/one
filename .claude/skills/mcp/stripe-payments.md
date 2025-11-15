---
name: mcp:stripe-payments
description: Access Stripe API for payment processing, subscriptions, customers, and products. Use when implementing payment features or managing Stripe resources.
---

# Stripe Payments MCP

## Purpose

Provides on-demand access to Stripe's payment infrastructure for processing payments, managing subscriptions, customers, products, and more.

## When to Use

- Implementing payment processing
- Creating products and prices
- Managing customer subscriptions
- Generating payment links
- Handling refunds and disputes
- Searching Stripe documentation

## MCP Server Details

**Server:** `stripe`
**Type:** Remote HTTPS endpoint
**Status:** Available on-demand
**Token Cost:** ~2,500 tokens when loaded
**Authentication:** No API key required for public tools

## Available Tools

### 1. Documentation Search
Search Stripe documentation:
- API references
- Integration guides
- Best practices
- Code examples

### 2. Customer Management
Manage customers:
- Create and update customers
- View customer details
- Manage payment methods
- Track customer subscriptions

### 3. Product & Price Management
Product catalog:
- Create products
- Set up pricing tiers
- Manage recurring prices
- Update product details

### 4. Payment Processing
Handle payments:
- Create payment intents
- Generate payment links
- Process refunds
- View payment history

### 5. Subscription Management
Subscriptions:
- Create subscriptions
- Update billing cycles
- Handle upgrades/downgrades
- Cancel subscriptions

### 6. Invoice Management
Invoicing:
- Generate invoices
- Send customer invoices
- Track payment status
- Handle late payments

## Usage Pattern

**Common workflows:**
1. Search docs: "How do I create a subscription?"
2. Create product: "Create a product for my course"
3. Generate payment link: "Create a payment link for $99"
4. Manage subscription: "Cancel subscription for customer X"

## Examples

### Creating a Product with Price
```typescript
// MCP handles:
// 1. Create product
// 2. Create price ($99/month)
// 3. Return product and price IDs

// Use in your code:
const PRODUCT_ID = 'prod_xxx'
const PRICE_ID = 'price_xxx'
```

### Generating a Payment Link
```typescript
// MCP creates payment link:
// - One-time payment or subscription
// - Customizable success/cancel URLs
// - Returns shareable link
```

### Managing Subscriptions
```typescript
// MCP operations:
// - List customer subscriptions
// - Update subscription items
// - Cancel or pause subscription
// - Handle proration
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 2,500 tokens always consumed
- Usage: Even when not processing payments

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~600 tokens (instructions)
- Savings: ~1,900 tokens (76%)

## Integration

**Works with:**
- `agent-backend:create-mutation` - Backend payment processing
- `agent-frontend:create-page` - Payment UI pages
- Product landing templates - E-commerce pages

**Complements:**
- Better Auth (user authentication)
- Convex (order tracking)
- Email services (receipts)

## Related Skills

- `agent-backend:create-mutation` - Store payment data
- `mcp:stripe-docs` - Advanced Stripe features
- `agent-ops:deploy-web` - Deploy payment pages

## Best Practices

1. **Test mode first** - Always test before production
2. **Handle webhooks** - Listen for payment events
3. **Secure API keys** - Never expose in frontend
4. **Error handling** - Gracefully handle failed payments
5. **PCI compliance** - Use Stripe's hosted solutions

## Common Patterns

### E-commerce Product
```typescript
// 1. Create product in Stripe (via MCP)
// 2. Store product ID in Convex
// 3. Display product on frontend
// 4. Process payment via Stripe
// 5. Log purchase event
```

### Subscription Service
```typescript
// 1. Create subscription product (via MCP)
// 2. Set up recurring price
// 3. Create customer
// 4. Subscribe customer
// 5. Handle webhooks for renewals
```

## Troubleshooting

### API errors
- Check API key configuration
- Verify test vs production mode
- Review error messages in Stripe dashboard

### Payment failures
- Check card details
- Verify currency support
- Review fraud detection rules

### Webhook issues
- Verify webhook endpoint URL
- Check webhook signature validation
- Review webhook event logs

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only when processing payments, save ~1,900 tokens per session
