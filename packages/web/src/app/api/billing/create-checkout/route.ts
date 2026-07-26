// Stripe Billing API — Create checkout session
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tierId, billingPeriod } = await request.json();

    // Pricing tiers (inline to avoid import issues)
    const tiers: Record<string, { name: string; price: number; enterprise?: boolean }> = {
      free: { name: 'Free', price: 0 },
      starter: { name: 'Starter', price: 99 },
      pro: { name: 'Pro', price: 499 },
      business: { name: 'Business', price: 1999 },
      enterprise: { name: 'Enterprise', price: 9999, enterprise: true },
      datamesh: { name: 'Data Mesh', price: 24999, enterprise: true },
    };

    const tier = tiers[tierId];
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

    // If Stripe is configured, create checkout session
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('expired')) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Pulsyn ${tier.name}`,
                  description: `${tier.name} plan`,
                },
                unit_amount: price * 100,
                recurring: {
                  interval: billingPeriod === 'annual' ? 'year' : 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulsynai.com'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://pulsynai.com'}/pricing`,
          metadata: {
            tierId: tierId,
            billingPeriod,
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError: any) {
        console.error('Stripe error:', stripeError.message);
        // Fall through to signup redirect
      }
    }

    // If no Stripe key or Stripe failed, redirect to signup with tier info
    return NextResponse.json({ 
      url: `/signup?plan=${tierId}&billing=${billingPeriod}`,
      message: 'Redirecting to signup' 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
