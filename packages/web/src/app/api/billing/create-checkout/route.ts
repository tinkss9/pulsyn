// Stripe Billing API — Create checkout session
import { NextRequest, NextResponse } from 'next/server';
import { PRICING_TIERS } from '@/lib/pricing';

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

    // Calculate price (annual = 20% off)
    const unitAmount = billingPeriod === 'annual'
      ? Math.round(tier.price * 12 * 0.8 * 100) // cents
      : tier.price * 100; // cents

    const interval: 'month' | 'year' = billingPeriod === 'annual' ? 'year' : 'month';

    // If Stripe is configured, create checkout session
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Use Stripe price ID if configured, otherwise create ad-hoc price
        const lineItems = tier.priceId.startsWith('price_')
          ? [{ price: tier.priceId, quantity: 1 }]
          : [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Pulsyn ${tier.name}`,
                  description: `${tier.name} plan — ${billingPeriod === 'annual' ? 'annual' : 'monthly'} billing`,
                },
                unit_amount: unitAmount,
                recurring: { interval },
              },
              quantity: 1,
            }];

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulsynai.com';

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'subscription',
          success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/billing/canceled`,
          metadata: {
            tierId,
            billingPeriod: billingPeriod || 'monthly',
          },
          subscription_data: {
            metadata: {
              tierId,
              billingPeriod: billingPeriod || 'monthly',
            },
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError: any) {
        console.error('[Stripe Checkout] Error:', stripeError.message);
        // Fall through to signup redirect
      }
    }

    // If no Stripe key or Stripe failed, redirect to signup with tier info
    return NextResponse.json({
      url: `/signup?plan=${tierId}&billing=${billingPeriod || 'monthly'}`,
      message: 'Redirecting to signup',
    });
  } catch (error) {
    console.error('[Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
