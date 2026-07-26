// Stripe Webhook Handler — Process subscription events
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // TODO: Verify Stripe signature when STRIPE_WEBHOOK_SECRET is set
    // const sig = request.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Parse event (unverified for now — will verify in production)
    const event = JSON.parse(body);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout completed: ${session.customer_email} -> ${session.metadata?.tierId}`);
        // TODO: Update user in database
        break;
      }

      case 'customer.subscription.created': {
        console.log(`Subscription created: ${event.data.object.id}`);
        break;
      }

      case 'customer.subscription.updated': {
        console.log(`Subscription updated: ${event.data.object.id} - ${event.data.object.status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        console.log(`Subscription deleted: ${event.data.object.id}`);
        // TODO: Downgrade user to free tier
        break;
      }

      case 'invoice.payment_succeeded': {
        console.log(`Payment succeeded: ${event.data.object.id}`);
        break;
      }

      case 'invoice.payment_failed': {
        console.log(`Payment failed: ${event.data.object.id}`);
        // TODO: Notify user of failed payment
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
