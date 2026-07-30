// Pulsyn Stripe Integration
// Wraps Stripe SDK for billing operations

// Stripe is optional — only required when billing is enabled
let stripe: any = null;

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function getStripe(): any {
  if (!stripe && STRIPE_SECRET_KEY) {
    try {
      const Stripe = require('stripe');
      stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
      });
    } catch {
      console.warn('[Pulsyn Billing] Stripe SDK not installed. Run: npm install stripe');
    }
  }
  return stripe;
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

export function getWebhookSecret(): string | undefined {
  return STRIPE_WEBHOOK_SECRET;
}

// Customer management
export async function createCustomer(email: string, name?: string, metadata?: Record<string, string>) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.customers.create({
    email,
    name,
    metadata: metadata || {},
  });
}

export async function getCustomer(customerId: string) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  return s.customers.retrieve(customerId);
}

// Checkout sessions
export async function createCheckoutSession(params: {
  customerId?: string;
  customerEmail?: string;
  priceId?: string;
  priceData?: { amount: number; currency: string; productName: string; interval?: 'month' | 'year' };
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  mode?: 'subscription' | 'payment';
}) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  let lineItem: any;

  if (params.priceId) {
    // Use pre-configured price ID
    lineItem = { price: params.priceId, quantity: 1 };
  } else if (params.priceData) {
    // Create inline price data (no pre-configured price needed)
    lineItem = {
      price_data: {
        currency: params.priceData.currency,
        unit_amount: params.priceData.amount,
        product_data: { name: params.priceData.productName },
        ...(params.priceData.interval ? { recurring: { interval: params.priceData.interval } } : {}),
      },
      quantity: 1,
    };
  } else {
    throw new Error('Either priceId or priceData is required');
  }

  return s.checkout.sessions.create({
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [lineItem],
    mode: params.mode || 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });
}

// Subscription management
export async function createStripeSubscription(params: {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  const subParams: any = {
    customer: params.customerId,
    items: [{ price: params.priceId }],
    metadata: params.metadata || {},
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  };

  if (params.trialDays) {
    subParams.trial_period_days = params.trialDays;
  }

  if (params.paymentMethodId) {
    await s.paymentMethods.attach(params.paymentMethodId, {
      customer: params.customerId,
    });
    await s.customers.update(params.customerId, {
      invoice_settings: { default_payment_method: params.paymentMethodId },
    });
  }

  return s.subscriptions.create(subParams);
}

export async function cancelStripeSubscription(subscriptionId: string, immediate: boolean = false) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  if (immediate) {
    return s.subscriptions.cancel(subscriptionId);
  }
  return s.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function updateStripeSubscription(subscriptionId: string, priceId: string) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  const sub = await s.subscriptions.retrieve(subscriptionId);
  return s.subscriptions.update(subscriptionId, {
    items: [{
      id: sub.items.data[0].id,
      price: priceId,
    }],
    proration_behavior: 'always_invoice',
  });
}

// Customer portal
export async function createPortalSession(customerId: string, returnUrl?: string) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${FRONTEND_URL}/billing`,
  });
}

// Metered billing (usage records)
export async function reportUsage(params: {
  subscriptionItemId: string;
  quantity: number;
  timestamp?: number;
  idempotencyKey?: string;
}) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.subscriptionItems.createUsageRecord(params.subscriptionItemId, {
    quantity: params.quantity,
    timestamp: params.timestamp || Math.floor(Date.now() / 1000),
    action: 'increment',
  }, {
    idempotencyKey: params.idempotencyKey,
  });
}

// Invoices
export async function listInvoices(customerId: string, limit: number = 10) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.invoices.list({
    customer: customerId,
    limit,
  });
}

export async function getUpcomingInvoice(customerId: string) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.invoices.retrieveUpcoming({
    customer: customerId,
  });
}

// Webhook event construction
export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');
  if (!STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook secret not configured');

  return s.webhooks.constructEvent(payload, signature, STRIPE_WEBHOOK_SECRET);
}

// Product & Price creation (for setup)
export async function createProduct(name: string, description: string, metadata?: Record<string, string>) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.products.create({
    name,
    description,
    metadata: metadata || {},
  });
}

export async function createPrice(params: {
  productId: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
  nickname?: string;
  metadata?: Record<string, string>;
}) {
  const s = getStripe();
  if (!s) throw new Error('Stripe not configured');

  return s.prices.create({
    product: params.productId,
    unit_amount: params.unitAmount,
    currency: params.currency,
    recurring: { interval: params.interval },
    nickname: params.nickname,
    metadata: params.metadata || {},
  });
}
