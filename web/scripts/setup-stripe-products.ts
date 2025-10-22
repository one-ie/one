/**
 * Stripe Product Setup Script
 * Creates products and prices in your Stripe test environment
 *
 * Usage:
 *   bun run scripts/setup-stripe-products.ts
 *
 * Requirements:
 *   - STRIPE_SECRET_KEY in .env.local
 */

import Stripe from 'stripe';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PRODUCTS = [
  {
    name: 'ONE Platform Course',
    description: 'Complete course on building with the ONE Platform - learn 6-dimension ontology, Astro, React, Convex, and more',
    images: ['https://one.ie/images/course-thumbnail.jpg'], // Update with your actual image URL
    defaultPrice: {
      currency: 'usd',
      unitAmount: 9700, // $97.00 in cents
      nickname: 'ONE Course - One-time Payment',
    },
  },
  // Add more products as needed
];

interface ProductConfig {
  name: string;
  productId: string;
  priceId: string;
  amount: number;
  currency: string;
}

async function setupStripeProducts() {
  // Get Stripe secret key from environment
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('   Add it to your .env.local file');
    process.exit(1);
  }

  // Check if this is a test key
  if (!stripeKey.startsWith('sk_test_')) {
    console.warn('⚠️  WARNING: You are using a LIVE Stripe key!');
    console.warn('   For development, use a test key (sk_test_...)');
    console.log('   Continuing in 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-09-30.clover',
  });

  console.log('🔧 Setting up Stripe products and prices...\n');

  const configs: ProductConfig[] = [];

  for (const productConfig of PRODUCTS) {
    try {
      // Create product
      console.log(`📦 Creating product: ${productConfig.name}`);
      const product = await stripe.products.create({
        name: productConfig.name,
        description: productConfig.description,
        images: productConfig.images,
        metadata: {
          created_by: 'setup-script',
          environment: stripeKey.startsWith('sk_test_') ? 'test' : 'live',
        },
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create price
      console.log(`💰 Creating price for ${productConfig.name}`);
      const price = await stripe.prices.create({
        product: product.id,
        currency: productConfig.defaultPrice.currency,
        unit_amount: productConfig.defaultPrice.unitAmount,
        nickname: productConfig.defaultPrice.nickname,
        metadata: {
          created_by: 'setup-script',
        },
      });

      console.log(`   ✅ Price created: ${price.id}`);
      console.log(`   💵 Amount: $${(price.unit_amount! / 100).toFixed(2)} ${price.currency.toUpperCase()}\n`);

      configs.push({
        name: productConfig.name,
        productId: product.id,
        priceId: price.id,
        amount: price.unit_amount!,
        currency: price.currency,
      });
    } catch (error) {
      console.error(`❌ Error creating product ${productConfig.name}:`, error);
      process.exit(1);
    }
  }

  // Save configuration to file
  const configPath = path.join(process.cwd(), '.stripe-config.json');
  fs.writeFileSync(
    configPath,
    JSON.stringify({
      environment: stripeKey.startsWith('sk_test_') ? 'test' : 'live',
      createdAt: new Date().toISOString(),
      products: configs,
    }, null, 2)
  );

  console.log('✅ All products and prices created successfully!\n');
  console.log('📄 Configuration saved to .stripe-config.json\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Environment Variables');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Add these to your .env.local file:\n');

  configs.forEach((config, index) => {
    const envVarName = index === 0
      ? 'STRIPE_COURSE_PRICE_ID'
      : `STRIPE_${config.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_PRICE_ID`;
    console.log(`${envVarName}=${config.priceId}`);
  });

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 Setup complete! You can now test your checkout flow.');
  console.log('   Visit: http://localhost:4321/pay-course\n');
}

// Run the setup
setupStripeProducts().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
