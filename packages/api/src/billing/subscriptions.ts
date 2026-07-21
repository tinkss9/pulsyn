// Pulsyn Subscription Management
// Manages customer subscriptions and billing state

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface CreateSubscriptionInput {
  organizationId: string;
  planId: string;
  email: string;
  name?: string;
  paymentMethodId?: string;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
}

// In-memory store (would be database in production)
const subscriptions: Map<string, Subscription> = new Map();
const orgIndex: Map<string, string> = new Map(); // orgId -> subscriptionId

export function createSubscription(input: CreateSubscriptionInput): Subscription {
  const id = `sub-${Date.now()}`;
  const now = new Date();

  const subscription: Subscription = {
    id,
    organizationId: input.organizationId,
    planId: input.planId,
    status: 'active',
    currentPeriodStart: now,
    currentPeriodEnd: new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };

  subscriptions.set(id, subscription);
  orgIndex.set(input.organizationId, id);

  return subscription;
}

export function getSubscription(id: string): Subscription | undefined {
  return subscriptions.get(id);
}

export function getSubscriptionByOrg(organizationId: string): Subscription | undefined {
  const subId = orgIndex.get(organizationId);
  return subId ? subscriptions.get(subId) : undefined;
}

export function updateSubscription(id: string, input: UpdateSubscriptionInput): Subscription | undefined {
  const sub = subscriptions.get(id);
  if (!sub) return undefined;

  if (input.planId) sub.planId = input.planId;
  if (input.cancelAtPeriodEnd !== undefined) sub.cancelAtPeriodEnd = input.cancelAtPeriodEnd;
  sub.updatedAt = new Date();

  return sub;
}

export function cancelSubscription(id: string, immediate: boolean = false): Subscription | undefined {
  const sub = subscriptions.get(id);
  if (!sub) return undefined;

  if (immediate) {
    sub.status = 'canceled';
  } else {
    sub.cancelAtPeriodEnd = true;
  }
  sub.updatedAt = new Date();

  return sub;
}

export function listSubscriptions(): Subscription[] {
  return Array.from(subscriptions.values());
}

export function updateSubscriptionStatus(id: string, status: SubscriptionStatus): void {
  const sub = subscriptions.get(id);
  if (sub) {
    sub.status = status;
    sub.updatedAt = new Date();
  }
}

export function syncFromStripe(
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): void {
  // Find subscription by Stripe ID
  for (const sub of subscriptions.values()) {
    if (sub.stripeSubscriptionId === stripeSubscriptionId) {
      sub.status = status;
      sub.currentPeriodStart = currentPeriodStart;
      sub.currentPeriodEnd = currentPeriodEnd;
      sub.updatedAt = new Date();
      return;
    }
  }
}
