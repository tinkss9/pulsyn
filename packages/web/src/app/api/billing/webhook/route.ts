// Stripe Webhook Handler — Process subscription events
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCreated(subscription);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(subscription);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(subscription);
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentSucceeded(invoice);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { tierId, billingPeriod } = session.metadata || {};
  
  // TODO: Update user in database
  // await db.users.update({
  //   where: { email: session.customer_email },
  //   data: {
  //     stripeCustomerId: session.customer as string,
  //     stripeSubscriptionId: session.subscription as string,
  //     tier: tierId,
  //     billingPeriod,
  //     status: 'active',
  //   },
  // });

  console.log(`Checkout completed: ${session.customer_email} -> ${tierId}`);
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log(`Subscription created: ${subscription.id}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Subscription updated: ${subscription.id} - ${subscription.status}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // TODO: Downgrade user to free tier
  console.log(`Subscription deleted: ${subscription.id}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`Payment succeeded: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // TODO: Notify user of failed payment
  console.log(`Payment failed: ${invoice.id}`);
}
