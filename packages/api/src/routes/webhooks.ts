// Pulsyn Stripe Webhook Handler
// Processes Stripe events for subscription lifecycle

import { Router, Request, Response } from 'express';
import { getWebhookSecret, constructWebhookEvent } from '../billing/stripe';
import {
  updateSubscriptionStatus,
  syncFromStripe,
  getSubscriptionByOrg,
} from '../billing/subscriptions';
import { incrementUsage } from '../billing/metering';

export const webhookRoutes = Router();

// Stripe requires raw body for webhook signature verification
webhookRoutes.post('/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  if (!getWebhookSecret()) {
    console.warn('[Pulsyn Webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature verification');
  }

  let event: any;

  try {
    if (getWebhookSecret()) {
      event = constructWebhookEvent(req.body, signature);
    } else {
      // Development mode — parse without verification
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }
  } catch (err) {
    console.error('[Pulsyn Webhook] Signature verification failed:', err);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  console.log(`[Pulsyn Webhook] Received: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ─── Subscription Events ───────────────────────────────
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;

      // ─── Invoice Events ────────────────────────────────────
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object);
        break;

      // ─── Checkout Events ───────────────────────────────────
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      // ─── Usage Events ──────────────────────────────────────
      case 'usage_record.created':
        await handleUsageRecord(event.data.object);
        break;

      default:
        console.log(`[Pulsyn Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[Pulsyn Webhook] Error handling ${event.type}:`, err);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ─── Event Handlers ─────────────────────────────────────────────

async function handleSubscriptionCreated(subscription: any) {
  console.log(`[Pulsyn Webhook] Subscription created: ${subscription.id}`);

  // Sync subscription status from Stripe
  syncFromStripe(
    subscription.id,
    mapStripeStatus(subscription.status),
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000)
  );
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log(`[Pulsyn Webhook] Subscription updated: ${subscription.id}, status: ${subscription.status}`);

  syncFromStripe(
    subscription.id,
    mapStripeStatus(subscription.status),
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000)
  );
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log(`[Pulsyn Webhook] Subscription deleted: ${subscription.id}`);

  syncFromStripe(
    subscription.id,
    'canceled',
    new Date(subscription.current_period_start * 1000),
    new Date(subscription.current_period_end * 1000)
  );
}

async function handleTrialWillEnd(subscription: any) {
  console.log(`[Pulsyn Webhook] Trial ending soon: ${subscription.id}`);

  // Could send email notification here
  // For now, just log
  const trialEnd = new Date(subscription.trial_end * 1000);
  console.log(`[Pulsyn Webhook] Trial ends at: ${trialEnd.toISOString()}`);
}

async function handlePaymentSucceeded(invoice: any) {
  console.log(`[Pulsyn Webhook] Payment succeeded for invoice: ${invoice.id}`);

  // Mark subscription as active if it was past_due
  if (invoice.subscription) {
    syncFromStripe(
      invoice.subscription,
      'active',
      new Date(invoice.period_start * 1000),
      new Date(invoice.period_end * 1000)
    );
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log(`[Pulsyn Webhook] Payment failed for invoice: ${invoice.id}`);

  // Mark subscription as past_due
  if (invoice.subscription) {
    syncFromStripe(
      invoice.subscription,
      'past_due',
      new Date(invoice.period_start * 1000),
      new Date(invoice.period_end * 1000)
    );
  }

  // Could send dunning email here
}

async function handleInvoiceFinalized(invoice: any) {
  console.log(`[Pulsyn Webhook] Invoice finalized: ${invoice.id}`);
  // Could send invoice email here
}

async function handleCheckoutCompleted(session: any) {
  console.log(`[Pulsyn Webhook] Checkout completed: ${session.id}`);

  const { organizationId, planId } = session.metadata || {};

  if (organizationId && planId) {
    // Link Stripe subscription to our subscription
    const sub = getSubscriptionByOrg(organizationId);
    if (sub) {
      (sub as any).stripeSubscriptionId = session.subscription;
      (sub as any).stripeCustomerId = session.customer;
    }
  }
}

async function handleUsageRecord(record: any) {
  console.log(`[Pulsyn Webhook] Usage record: ${record.quantity} units`);
  // Usage records are already tracked in our metering system
}

// ─── Helpers ────────────────────────────────────────────────────

function mapStripeStatus(stripeStatus: string): 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | 'unpaid' {
  const statusMap: Record<string, any> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    trialing: 'trialing',
    incomplete: 'incomplete',
    incomplete_expired: 'canceled',
    unpaid: 'unpaid',
    paused: 'active',
  };
  return statusMap[stripeStatus] || 'active';
}

// Need to import express for raw body parsing
import express from 'express';
