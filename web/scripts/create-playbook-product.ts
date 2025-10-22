/**
 * Create Playbook Product in Stripe
 * Creates the ONE Platform Playbook product with pricing
 *
 * Usage:
 *   bun run scripts/create-playbook-product.ts
 */

import Stripe from 'stripe';

async function createPlaybookProduct() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-09-30.clover',
  });

  try {
    console.log('🔧 Creating Playbook product in Stripe...\n');

    // Create product
    const product = await stripe.products.create({
      name: 'ONE Platform Playbook',
      description: 'Complete playbook for building AI-native platforms with the 6-dimension ontology - strategies, patterns, and best practices',
      images: ['https://one.ie/images/playbook-thumbnail.jpg'],
      metadata: {
        created_by: 'create-playbook-script',
        category: 'playbook',
        environment: stripeKey.startsWith('sk_test_') ? 'test' : 'live',
      },
    });

    console.log(`✅ Product created: ${product.id}`);
    console.log(`   Name: ${product.name}\n`);

    // Create price - $47 one-time payment
    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: 4700, // $47.00 in cents
      nickname: 'Playbook - One-time Payment',
      metadata: {
        created_by: 'create-playbook-script',
      },
    });

    console.log(`✅ Price created: ${price.id}`);
    console.log(`   Amount: $${(price.unit_amount! / 100).toFixed(2)} ${price.currency.toUpperCase()}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Environment Variable');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Add this to your .env.local file:\n');
    console.log(`STRIPE_PLAYBOOK_PRICE_ID=${price.id}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Playbook product created successfully!');
    console.log('   Product ID: ' + product.id);
    console.log('   Price ID: ' + price.id);
    console.log('\n🎉 You can now use this in pay-playbook.astro\n');

    // Save to config
    const fs = await import('fs');
    const path = await import('path');
    const configPath = path.join(process.cwd(), '.stripe-config.json');

    let config: any = { products: [] };
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }

    config.products.push({
      name: product.name,
      productId: product.id,
      priceId: price.id,
      amount: price.unit_amount,
      currency: price.currency,
    });

    config.updatedAt = new Date().toISOString();

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('📄 Updated .stripe-config.json\n');

  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      console.error(`❌ Stripe Error: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
    process.exit(1);
  }
}

createPlaybookProduct();
