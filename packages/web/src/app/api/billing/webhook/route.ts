// Stripe Webhook Handler — Process subscription events
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function generateId(): string {
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: any;

    if (process.env.STRIPE_WEBHOOK_SECRET) {
      try {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err: any) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      event = JSON.parse(body);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { tierId, billingPeriod } = session.metadata || {};
        const customerEmail = session.customer_email || session.customer_details?.email;
        const stripeCustomerId = session.customer;
        const stripeSubId = session.subscription;

        // Find or create organization by email
        let orgResult = await query('SELECT id FROM organizations WHERE email = $1', [customerEmail]);
        let orgId: string;

        if (orgResult.rowCount === 0) {
          orgId = `org-${Date.now()}`;
          await query(
            `INSERT INTO organizations (id, name, email, plan_id) VALUES ($1, $2, $3, $4)`,
            [orgId, customerEmail?.split('@')[0] || 'Customer', customerEmail, tierId || 'pro']
          );

          // Create API key for new org
          const { randomBytes, createHash } = await import('crypto');
          const rawKey = `pulsyn_${randomBytes(32).toString('hex')}`;
          const keyHash = createHash('sha256').update(rawKey).digest('hex');
          await query(
            `INSERT INTO api_keys (id, organization_id, key_hash, name, plan_id) VALUES ($1, $2, $3, 'Default Key', $4)`,
            [`key-${Date.now()}`, orgId, keyHash, tierId || 'pro']
          );
        } else {
          orgId = orgResult.rows[0].id;
          await query('UPDATE organizations SET plan_id = $1, updated_at = NOW() WHERE id = $2', [tierId || 'pro', orgId]);
        }

        // Create subscription record
        await query(
          `INSERT INTO subscriptions (id, organization_id, plan_id, status, stripe_subscription_id, stripe_customer_id, current_period_start, current_period_end)
           VALUES ($1, $2, $3, 'active', $4, $5, NOW(), NOW() + INTERVAL '30 days')
           ON CONFLICT (id) DO NOTHING`,
          [generateId(), orgId, tierId || 'pro', stripeSubId, stripeCustomerId]
        );

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const tierId = sub.metadata?.tierId || 'pro';
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'trialing' ? 'trialing'
          : sub.status === 'canceled' ? 'canceled'
          : 'active';

        // Update subscription by stripe_subscription_id
        await query(
          `UPDATE subscriptions SET status = $1, plan_id = $2, current_period_start = to_timestamp($3), current_period_end = to_timestamp($4), updated_at = NOW()
           WHERE stripe_subscription_id = $5`,
          [status, tierId, sub.current_period_start, sub.current_period_end, sub.id]
        );

        // Update org plan
        const orgResult = await query(
          `SELECT organization_id FROM subscriptions WHERE stripe_subscription_id = $1`,
          [sub.id]
        );
        if (orgResult.rowCount > 0) {
          await query('UPDATE organizations SET plan_id = $1, updated_at = NOW() WHERE id = $2',
            [tierId, orgResult.rows[0].organization_id]);
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await query(
          `UPDATE subscriptions SET status = 'canceled', updated_at = NOW() WHERE stripe_subscription_id = $1`,
          [sub.id]
        );

        // Downgrade org to community
        const orgResult = await query(
          `SELECT organization_id FROM subscriptions WHERE stripe_subscription_id = $1`,
          [sub.id]
        );
        if (orgResult.rowCount > 0) {
          await query('UPDATE organizations SET plan_id = $1, updated_at = NOW() WHERE id = $2',
            ['community', orgResult.rows[0].organization_id]);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await query(
            `UPDATE subscriptions SET status = 'active', updated_at = NOW() WHERE stripe_subscription_id = $1`,
            [invoice.subscription]
          );
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        if (invoice.subscription) {
          await query(
            `UPDATE subscriptions SET status = 'past_due', updated_at = NOW() WHERE stripe_subscription_id = $1`,
            [invoice.subscription]
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}
