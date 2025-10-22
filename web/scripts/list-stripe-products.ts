/**
 * List All Stripe Products
 * Shows all products and prices in your Stripe account
 *
 * Usage:
 *   bun run scripts/list-stripe-products.ts
 */

import Stripe from 'stripe';

async function listProducts() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-09-30.clover',
  });

  try {
    console.log('🔍 Fetching all products from Stripe...\n');

    const products = await stripe.products.list({
      limit: 100,
      expand: ['data.default_price'],
    });

    if (products.data.length === 0) {
      console.log('⚠️  No products found in your Stripe account');
      console.log('   Create products at: https://dashboard.stripe.com/products\n');
      return;
    }

    console.log(`📦 Found ${products.data.length} product(s):\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    for (const product of products.data) {
      console.log(`📦 ${product.name}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Description: ${product.description || 'N/A'}`);
      console.log(`   Active: ${product.active}`);

      // Fetch prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 10,
      });

      if (prices.data.length > 0) {
        console.log(`   Prices:`);
        prices.data.forEach(price => {
          const amount = price.unit_amount
            ? `$${(price.unit_amount / 100).toFixed(2)}`
            : 'N/A';
          const recurring = price.recurring
            ? ` (${price.recurring.interval}ly)`
            : ' (one-time)';
          console.log(`     - ${price.id}: ${amount} ${price.currency.toUpperCase()}${recurring} ${price.active ? '✓' : '✗ inactive'}`);
        });
      } else {
        console.log(`   ⚠️  No prices configured`);
      }

      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Tip: Use product IDs to fetch details:');
    console.log('   bun run scripts/fetch-stripe-product.ts prod_xxxxx');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`❌ Stripe Error: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

listProducts();
