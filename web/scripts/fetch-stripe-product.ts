/**
 * Fetch Stripe Product Details
 * Retrieves product and price information from Stripe
 *
 * Usage:
 *   bun run scripts/fetch-stripe-product.ts prod_TH9LgvWohFIm0s
 */

import Stripe from 'stripe';

async function fetchProductDetails(productId: string) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-09-30.clover',
  });

  try {
    console.log(`🔍 Fetching product: ${productId}\n`);

    // Fetch product
    const product = await stripe.products.retrieve(productId);

    console.log('📦 Product Details:');
    console.log(`   Name: ${product.name}`);
    console.log(`   Description: ${product.description || 'N/A'}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Active: ${product.active}`);
    console.log(`   Images: ${product.images?.join(', ') || 'None'}\n`);

    // Fetch prices for this product
    const prices = await stripe.prices.list({
      product: productId,
      limit: 10,
    });

    if (prices.data.length === 0) {
      console.log('⚠️  No prices found for this product');
      console.log('   You need to create a price in the Stripe dashboard\n');
      return;
    }

    console.log('💰 Available Prices:');
    prices.data.forEach((price, index) => {
      const amount = price.unit_amount ? `$${(price.unit_amount / 100).toFixed(2)}` : 'N/A';
      const recurring = price.recurring
        ? ` (${price.recurring.interval}ly)`
        : ' (one-time)';

      console.log(`\n   Price ${index + 1}:`);
      console.log(`   - ID: ${price.id}`);
      console.log(`   - Amount: ${amount} ${price.currency.toUpperCase()}${recurring}`);
      console.log(`   - Active: ${price.active}`);
      console.log(`   - Nickname: ${price.nickname || 'N/A'}`);
    });

    // Show environment variable for the first active price
    const activePrice = prices.data.find(p => p.active);
    if (activePrice) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Environment Variable');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('Add this to your .env.local file:\n');

      const envVarName = product.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_');

      console.log(`STRIPE_${envVarName}_PRICE_ID=${activePrice.id}`);
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`❌ Stripe Error: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

// Get product ID from command line
const productId = process.argv[2];

if (!productId) {
  console.error('❌ Please provide a product ID');
  console.error('   Usage: bun run scripts/fetch-stripe-product.ts prod_xxxxx');
  process.exit(1);
}

fetchProductDetails(productId);
