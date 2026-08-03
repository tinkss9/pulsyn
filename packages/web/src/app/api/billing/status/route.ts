// Billing Status API — Check organization's current subscription
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const orgId = request.nextUrl.searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
  }

  try {
    // Get organization
    const orgResult = await query('SELECT id, name, email, plan_id FROM organizations WHERE id = $1', [orgId]);
    if (orgResult.rowCount === 0) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const org = orgResult.rows[0];

    // Get active subscription
    const subResult = await query(
      `SELECT id, plan_id, status, stripe_subscription_id, current_period_start, current_period_end, cancel_at_period_end
       FROM subscriptions WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [orgId]
    );

    const subscription = subResult.rowCount > 0 ? subResult.rows[0] : null;

    // Get usage for current billing period
    let usage = { rowsReplicated: 0, apiCalls: 0 };
    try {
      const usageResult = await query(
        `SELECT metric, COALESCE(SUM(quantity), 0) as total
         FROM usage_records WHERE organization_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
         GROUP BY metric`,
        [orgId]
      );
      for (const row of usageResult.rows) {
        if (row.metric === 'rows_replicated') usage.rowsReplicated = parseInt(row.total) || 0;
        if (row.metric === 'api_calls') usage.apiCalls = parseInt(row.total) || 0;
      }
    } catch { /* usage_records may not exist */ }

    return NextResponse.json({
      organization: {
        id: org.id,
        name: org.name,
        email: org.email,
        plan: org.plan_id,
      },
      subscription: subscription ? {
        id: subscription.id,
        plan: subscription.plan_id,
        status: subscription.status,
        stripeSubscriptionId: subscription.stripe_subscription_id,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      } : null,
      usage,
    });
  } catch (error) {
    console.error('[Billing Status] Error:', error);
    return NextResponse.json({ error: 'Failed to get billing status' }, { status: 500 });
  }
}
