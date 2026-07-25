// Pulsyn Subscription Management — PostgreSQL backed

import { query } from '../db';

export interface Subscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
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

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const id = `sub-${Date.now()}`;
  const result = await query(
    `INSERT INTO subscriptions (id, organization_id, plan_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [id, input.organizationId, input.planId]
  );
  return result.rows[0];
}

export async function getSubscription(id: string): Promise<Subscription | undefined> {
  const result = await query('SELECT * FROM subscriptions WHERE id = $1', [id]);
  return result.rows[0] || undefined;
}

export async function getSubscriptionByOrg(organizationId: string): Promise<Subscription | undefined> {
  const result = await query('SELECT * FROM subscriptions WHERE organization_id = $1', [organizationId]);
  return result.rows[0] || undefined;
}

export async function updateSubscription(id: string, input: UpdateSubscriptionInput): Promise<Subscription | undefined> {
  const sets: string[] = ['updated_at = NOW()'];
  const params: any[] = [id];
  let paramIdx = 2;

  if (input.planId) {
    sets.push(`plan_id = $${paramIdx++}`);
    params.push(input.planId);
  }
  if (input.cancelAtPeriodEnd !== undefined) {
    sets.push(`cancel_at_period_end = $${paramIdx++}`);
    params.push(input.cancelAtPeriodEnd);
  }

  const result = await query(
    `UPDATE subscriptions SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
    params
  );
  return result.rows[0] || undefined;
}

export async function cancelSubscription(id: string, immediate: boolean = false): Promise<Subscription | undefined> {
  if (immediate) {
    const result = await query(
      `UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || undefined;
  } else {
    const result = await query(
      `UPDATE subscriptions SET cancel_at_period_end = TRUE, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || undefined;
  }
}

export async function listSubscriptions(): Promise<Subscription[]> {
  const result = await query('SELECT * FROM subscriptions ORDER BY created_at DESC');
  return result.rows;
}

export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<void> {
  await query(
    'UPDATE subscriptions SET status = $2, updated_at = NOW() WHERE id = $1',
    [id, status]
  );
}

export async function syncFromStripe(
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<void> {
  await query(
    `UPDATE subscriptions
     SET status = $2, current_period_start = $3, current_period_end = $4, updated_at = NOW()
     WHERE stripe_subscription_id = $1`,
    [stripeSubscriptionId, status, currentPeriodStart, currentPeriodEnd]
  );
}
