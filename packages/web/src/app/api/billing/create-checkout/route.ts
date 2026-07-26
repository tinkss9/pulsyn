// Stripe Billing API — Create checkout session
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PRICING_TIERS } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { tierId, billingPeriod } = await request.json();

    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    // Free tier — redirect to signup
    if (tier.price === 0) {
      return NextResponse.json({ url: '/signup' });
    }

    // Enterprise — redirect to contact
    if (tier.enterprise) {
      return NextResponse.json({ url: '/contact' });
    }

    // Calculate price
    const price = billingPeriod === 'annual'
      ? Math.round(tier.price * 12 * 0.8) // 20% discount for annual
      : tier.price;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Pulsyn ${tier.name}`,
              description: `${tier.name} plan - ${tier.features.pipelines === -1 ? 'Unlimited' : tier.features.pipelines} pipelines, ${tier.features.connectors === -1 ? 'All 763' : tier.features.connectors} connectors`,
            },
            unit_amount: price * 100, // Stripe uses cents
            recurring: {
              interval: billingPeriod === 'annual' ? 'year' : 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        tierId: tier.id,
        billingPeriod,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
