// Verify Stripe checkout session — used by success page to poll subscription status
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const subscription = session.subscription as any;
    const customer = session.customer as any;

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      email: session.customer_email || customer?.email,
      planName: session.metadata?.tierId
        ? session.metadata.tierId.charAt(0).toUpperCase() + session.metadata.tierId.slice(1)
        : 'Pro',
      subscriptionId: subscription?.id,
      subscriptionStatus: subscription?.status,
      currentPeriodEnd: subscription?.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    });
  } catch (err: any) {
    console.error('[Verify Session] Error:', err.message);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
