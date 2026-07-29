// Stripe Webhook Handler — Process subscription events
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Pulsyn Webhook] Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: any;

    // Verify signature if webhook secret is configured
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error('[Pulsyn Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // Development mode — parse without verification
      console.warn('[Pulsyn Webhook] STRIPE_WEBHOOK_SECRET not set — skipping verification');
      event = JSON.parse(body);
    }

    console.log(`[Pulsyn Webhook] Received: ${event.type} (${event.id})`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { tierId, billingPeriod } = session.metadata || {};
        console.log(`[Pulsyn Webhook] Checkout completed: ${session.customer_email} -> ${tierId}`);

        // TODO: Write to database when Supabase/Postgres is wired
        // For now, store in a simple KV or just log
        // In production: create subscription record, link Stripe customer ID
        break;
      }

      case 'customer.subscription.created': {
        const sub = event.data.object;
        console.log(`[Pulsyn Webhook] Subscription created: ${sub.id}, status: ${sub.status}`);
        // TODO: Update subscription status in DB
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        console.log(`[Pulsyn Webhook] Subscription updated: ${sub.id}, status: ${sub.status}`);
        // TODO: Update subscription status in DB
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`[Pulsyn Webhook] Subscription deleted: ${sub.id}`);
        // TODO: Downgrade user to free tier
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object;
        const trialEnd = new Date(sub.trial_end * 1000);
        console.log(`[Pulsyn Webhook] Trial ending soon: ${sub.id} at ${trialEnd.toISOString()}`);
        // TODO: Send trial ending email
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`[Pulsyn Webhook] Payment succeeded: ${invoice.id}`);
        // TODO: Mark subscription as active in DB
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log(`[Pulsyn Webhook] Payment failed: ${invoice.id}`);
        // TODO: Mark subscription as past_due, send dunning email
        break;
      }

      default:
        console.log(`[Pulsyn Webhook] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Pulsyn Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
