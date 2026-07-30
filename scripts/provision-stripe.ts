// scripts/provision-stripe.ts
// Creates Stripe products and prices for Pulsyn billing plans
// Run: npx tsx scripts/provision-stripe.ts
// Requires: STRIPE_SECRET_KEY environment variable

import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) {
  console.error('ERROR: STRIPE_SECRET_KEY not set. Export it and retry.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-06-20' });

interface PlanDef {
  id: string;
  name: string;
  description: string;
  price: number; // cents
  features: string[];
}

const PLANS: PlanDef[] = [
  {
    id: 'community',
    name: 'Pulsyn Community',
    description: 'For individual developers exploring CDC — free forever',
    price: 0,
    features: ['3 pipelines', '50K rows/day', '3 connectors', 'Checkpoint recovery'],
  },
  {
    id: 'pro',
    name: 'Pulsyn Pro',
    description: 'For growing teams running production pipelines',
    price: 30000,
    features: ['Unlimited pipelines', '5M rows/day', 'All connectors', 'Masking', 'MCP server', 'API access', 'Priority support'],
  },
  {
    id: 'business',
    name: 'Pulsyn Business',
    description: 'For production workloads with SLA requirements',
    price: 200000,
    features: ['Unlimited pipelines', '100M rows/day', 'All connectors', 'SSO', 'Audit logs', 'SLA'],
  },
  {
    id: 'enterprise',
    name: 'Pulsyn Enterprise',
    description: 'Custom pricing for large organizations — contact sales',
    price: 0,
    features: ['Custom limits', 'Dedicated support', 'Air-gapped deployment', 'Custom connectors'],
  },
];

async function provision() {
  console.log('Provisioning Stripe products and prices for Pulsyn...\n');

  const results: Record<string, { productId: string; priceId: string | null }> = {};

  for (const plan of PLANS) {
    if (plan.price === 0 && plan.id !== 'community') {
      console.log(`[${plan.id}] Free/enterprise plan — no Stripe price needed`);
      results[plan.id] = { productId: '', priceId: null };
      continue;
    }

    // Create product
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: { planId: plan.id },
    });
    console.log(`[${plan.id}] Product created: ${product.id}`);

    let priceId: string | null = null;

    if (plan.price > 0) {
      // Create recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { planId: plan.id },
      });
      priceId = price.id;
      console.log(`[${plan.id}] Price created: ${price.id} ($${plan.price / 100}/mo)`);
    }

    results[plan.id] = { productId: product.id, priceId };
  }

  console.log('\n─── Results ───────────────────────────────');
  console.log('Add these to packages/api/src/billing/plans.ts:\n');
  for (const [planId, { productId, priceId }] of Object.entries(results)) {
    if (priceId) {
      console.log(`  ${planId}: stripePriceId: '${priceId}',`);
    }
  }

  console.log('\nDone. Update the plans.ts file with the price IDs above.');
}

provision().catch(err => {
  console.error('Provisioning failed:', err.message);
  process.exit(1);
});
