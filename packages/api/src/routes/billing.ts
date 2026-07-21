// Pulsyn Billing Routes
// Subscription management, usage tracking, and Stripe integration

import { Router, Request, Response } from 'express';
import { PLANS, getPlan, listPlans, formatPrice } from '../billing/plans';
import {
  createSubscription,
  getSubscription,
  getSubscriptionByOrg,
  updateSubscription,
  cancelSubscription,
  listSubscriptions,
} from '../billing/subscriptions';
import {
  getUsageSummary,
  incrementUsage,
  calculateOverage,
} from '../billing/metering';
import {
  isStripeConfigured,
  createCheckoutSession,
  createPortalSession,
} from '../billing/stripe';

export const billingRoutes = Router();

// ─── Plans ─────────────────────────────────────────────────────

// List all available plans
billingRoutes.get('/plans', (req: Request, res: Response) => {
  const plans = listPlans().map(plan => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    price: plan.price,
    priceFormatted: formatPrice(plan.price),
    interval: plan.interval,
    features: plan.features,
    limits: plan.limits,
  }));

  res.json({ data: plans });
});

// Get plan details
billingRoutes.get('/plans/:planId', (req: Request, res: Response) => {
  const plan = getPlan(req.params.planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  res.json({
    data: {
      ...plan,
      priceFormatted: formatPrice(plan.price),
    },
  });
});

// ─── Subscriptions ─────────────────────────────────────────────

// Get current subscription for an organization
billingRoutes.get('/subscriptions/:orgId', (req: Request, res: Response) => {
  const sub = getSubscriptionByOrg(req.params.orgId);
  if (!sub) {
    return res.status(404).json({ error: 'No active subscription found' });
  }

  const plan = getPlan(sub.planId);

  res.json({
    data: {
      ...sub,
      plan: plan ? {
        name: plan.name,
        price: plan.price,
        priceFormatted: formatPrice(plan.price),
        features: plan.features,
      } : null,
    },
  });
});

// Create a new subscription
billingRoutes.post('/subscriptions', (req: Request, res: Response) => {
  const { organizationId, planId, email, name } = req.body;

  if (!organizationId || !planId || !email) {
    return res.status(400).json({
      error: 'Missing required fields: organizationId, planId, email',
    });
  }

  const plan = getPlan(planId);
  if (!plan) {
    return res.status(400).json({ error: `Invalid plan: ${planId}` });
  }

  // Check for existing subscription
  const existing = getSubscriptionByOrg(organizationId);
  if (existing && existing.status === 'active') {
    return res.status(409).json({ error: 'Organization already has an active subscription' });
  }

  const subscription = createSubscription({
    organizationId,
    planId,
    email,
    name,
  });

  res.status(201).json({
    data: {
      ...subscription,
      plan: {
        name: plan.name,
        price: plan.price,
        priceFormatted: formatPrice(plan.price),
      },
    },
  });
});

// Update subscription (upgrade/downgrade)
billingRoutes.put('/subscriptions/:id', (req: Request, res: Response) => {
  const { planId, cancelAtPeriodEnd } = req.body;

  if (planId && !getPlan(planId)) {
    return res.status(400).json({ error: `Invalid plan: ${planId}` });
  }

  const sub = updateSubscription(req.params.id, { planId, cancelAtPeriodEnd });
  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  const plan = getPlan(sub.planId);

  res.json({
    data: {
      ...sub,
      plan: plan ? {
        name: plan.name,
        price: plan.price,
        priceFormatted: formatPrice(plan.price),
      } : null,
    },
  });
});

// Cancel subscription
billingRoutes.post('/subscriptions/:id/cancel', (req: Request, res: Response) => {
  const { immediate } = req.body;

  const sub = cancelSubscription(req.params.id, immediate);
  if (!sub) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  res.json({
    data: sub,
    message: immediate
      ? 'Subscription canceled immediately'
      : 'Subscription will cancel at period end',
  });
});

// ─── Usage ─────────────────────────────────────────────────────

// Get usage summary for an organization
billingRoutes.get('/usage/:orgId', (req: Request, res: Response) => {
  const sub = getSubscriptionByOrg(req.params.orgId);
  const plan = sub ? getPlan(sub.planId) : getPlan('starter');

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const summary = getUsageSummary(req.params.orgId, {
    maxRowsPerDay: plan.features.maxRowsPerDay,
    apiCallsPerDay: plan.limits.apiCallsPerMinute * 24 * 60,
    pipelineHoursPerMonth: plan.limits.pipelineHoursPerMonth,
    storageGb: plan.limits.storageGb,
  });

  res.json({ data: summary });
});

// Record usage (internal API or webhook)
billingRoutes.post('/usage', (req: Request, res: Response) => {
  const { organizationId, metric, quantity } = req.body;

  if (!organizationId || !metric || quantity === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: organizationId, metric, quantity',
    });
  }

  const validMetrics = ['rows_replicated', 'api_calls', 'pipeline_hours', 'storage_bytes'];
  if (!validMetrics.includes(metric)) {
    return res.status(400).json({
      error: `Invalid metric. Must be one of: ${validMetrics.join(', ')}`,
    });
  }

  incrementUsage(organizationId, metric, quantity);

  res.json({
    data: {
      organizationId,
      metric,
      quantity,
      recordedAt: new Date().toISOString(),
    },
  });
});

// Calculate overage charges
billingRoutes.get('/usage/:orgId/overage', (req: Request, res: Response) => {
  const sub = getSubscriptionByOrg(req.params.orgId);
  const plan = sub ? getPlan(sub.planId) : getPlan('starter');

  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const summary = getUsageSummary(req.params.orgId, {
    maxRowsPerDay: plan.features.maxRowsPerDay,
    apiCallsPerDay: plan.limits.apiCallsPerMinute * 24 * 60,
    pipelineHoursPerMonth: plan.limits.pipelineHoursPerMonth,
    storageGb: plan.limits.storageGb,
  });

  // Calculate overage for each metered metric
  const overage = {
    rowsReplicated: calculateOverage(
      summary.metrics.rowsReplicated.used,
      plan.metered.rowsReplicated.freePerDay,
      plan.metered.rowsReplicated.perUnit,
      plan.metered.rowsReplicated.unitSize
    ),
    apiCalls: calculateOverage(
      summary.metrics.apiCalls.used,
      plan.metered.apiCalls.freePerDay,
      plan.metered.apiCalls.perUnit,
      plan.metered.apiCalls.unitSize
    ),
    total: 0,
  };
  overage.total = overage.rowsReplicated + overage.apiCalls;

  res.json({
    data: {
      organizationId: req.params.orgId,
      plan: plan.name,
      overage: {
        rowsReplicated: {
          cents: overage.rowsReplicated,
          formatted: formatPrice(overage.rowsReplicated),
        },
        apiCalls: {
          cents: overage.apiCalls,
          formatted: formatPrice(overage.apiCalls),
        },
        total: {
          cents: overage.total,
          formatted: formatPrice(overage.total),
        },
      },
    },
  });
});

// ─── Stripe Checkout ───────────────────────────────────────────

// Create checkout session
billingRoutes.post('/checkout', async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({
      error: 'Stripe not configured. Set STRIPE_SECRET_KEY environment variable.',
    });
  }

  const { planId, email, organizationId } = req.body;

  const plan = getPlan(planId);
  if (!plan) {
    return res.status(400).json({ error: `Invalid plan: ${planId}` });
  }

  if (!plan.stripePriceId) {
    return res.status(400).json({
      error: `Plan "${planId}" does not have a Stripe price ID configured`,
    });
  }

  try {
    const session = await createCheckoutSession({
      customerEmail: email,
      priceId: plan.stripePriceId,
      successUrl: `${req.headers.origin || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${req.headers.origin || 'http://localhost:3000'}/billing/canceled`,
      metadata: {
        organizationId: organizationId || '',
        planId,
      },
    });

    res.json({
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to create checkout session',
    });
  }
});

// Create customer portal session
billingRoutes.post('/portal', async (req: Request, res: Response) => {
  if (!isStripeConfigured()) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }

  const { customerId } = req.body;

  if (!customerId) {
    return res.status(400).json({ error: 'Missing required field: customerId' });
  }

  try {
    const session = await createPortalSession(customerId);

    res.json({
      data: {
        url: session.url,
      },
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to create portal session',
    });
  }
});

// ─── Billing Status ────────────────────────────────────────────

// Get billing system status
billingRoutes.get('/status', (req: Request, res: Response) => {
  res.json({
    data: {
      stripeConfigured: isStripeConfigured(),
      plansAvailable: Object.keys(PLANS).length,
      plans: Object.keys(PLANS),
    },
  });
});
