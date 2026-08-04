// Per-org spending limits — prevents runaway API costs
import { query } from '@/lib/db';

const DEFAULT_DAILY_LIMIT = 10.00;   // $10/day
const DEFAULT_MONTHLY_LIMIT = 100.00; // $100/month
const COST_PER_1K_TOKENS = 0.002;     // ~DeepSeek pricing

export interface SpendingCheck {
  allowed: boolean;
  dailyRemaining: number;
  monthlyRemaining: number;
  dailySpend: number;
  monthlySpend: number;
  reason?: string;
}

export async function checkSpendingLimit(orgId: string): Promise<SpendingCheck> {
  try {
    const result = await query(
      `SELECT daily_limit_usd, monthly_limit_usd, daily_spend_usd, monthly_spend_usd,
              daily_reset_at, monthly_reset_at
       FROM ai_spending_limits WHERE org_id = $1`,
      [orgId]
    );

    if (result.rows.length === 0) {
      // New org — create default limits
      await query(
        `INSERT INTO ai_spending_limits (org_id, daily_limit_usd, monthly_limit_usd)
         VALUES ($1, $2::numeric, $3::numeric)`,
        [orgId, DEFAULT_DAILY_LIMIT, DEFAULT_MONTHLY_LIMIT]
      );
      return {
        allowed: true,
        dailyRemaining: DEFAULT_DAILY_LIMIT,
        monthlyRemaining: DEFAULT_MONTHLY_LIMIT,
        dailySpend: 0,
        monthlySpend: 0,
      };
    }

    const row = result.rows[0];
    const now = new Date();

    let dailySpend = parseFloat(row.daily_spend_usd) || 0;
    let monthlySpend = parseFloat(row.monthly_spend_usd) || 0;
    const dailyLimit = parseFloat(row.daily_limit_usd) || DEFAULT_DAILY_LIMIT;
    const monthlyLimit = parseFloat(row.monthly_limit_usd) || DEFAULT_MONTHLY_LIMIT;
    const dailyResetAt = new Date(row.daily_reset_at);
    const monthlyResetAt = new Date(row.monthly_reset_at);

    // Reset daily if window expired
    if (now > dailyResetAt) {
      dailySpend = 0;
      await query(
        `UPDATE ai_spending_limits SET daily_spend_usd = 0, daily_reset_at = NOW() + INTERVAL '1 day' WHERE org_id = $1`,
        [orgId]
      );
    }

    // Reset monthly if window expired
    if (now > monthlyResetAt) {
      monthlySpend = 0;
      await query(
        `UPDATE ai_spending_limits SET monthly_spend_usd = 0, monthly_reset_at = NOW() + INTERVAL '30 days' WHERE org_id = $1`,
        [orgId]
      );
    }

    const dailyRemaining = dailyLimit - dailySpend;
    const monthlyRemaining = monthlyLimit - monthlySpend;

    if (dailySpend >= dailyLimit) {
      return {
        allowed: false,
        dailyRemaining: 0,
        monthlyRemaining,
        dailySpend,
        monthlySpend,
        reason: `Daily spending limit reached ($${dailyLimit.toFixed(2)}). Resets at ${dailyResetAt.toISOString()}.`,
      };
    }

    if (monthlySpend >= monthlyLimit) {
      return {
        allowed: false,
        dailyRemaining,
        monthlyRemaining: 0,
        dailySpend,
        monthlySpend,
        reason: `Monthly spending limit reached ($${monthlyLimit.toFixed(2)}). Resets at ${monthlyResetAt.toISOString()}.`,
      };
    }

    return {
      allowed: true,
      dailyRemaining,
      monthlyRemaining,
      dailySpend,
      monthlySpend,
    };
  } catch (err) {
    console.error('[SpendingLimits] Error:', err);
    // Fail open — allow request if spending check fails
    return {
      allowed: true,
      dailyRemaining: DEFAULT_DAILY_LIMIT,
      monthlyRemaining: DEFAULT_MONTHLY_LIMIT,
      dailySpend: 0,
      monthlySpend: 0,
    };
  }
}

export async function recordSpending(orgId: string, tokensIn: number, tokensOut: number): Promise<void> {
  const cost = ((tokensIn + tokensOut) / 1000) * COST_PER_1K_TOKENS;
  try {
    await query(
      `UPDATE ai_spending_limits
       SET daily_spend_usd = daily_spend_usd + $2::numeric,
           monthly_spend_usd = monthly_spend_usd + $2::numeric,
           updated_at = NOW()
       WHERE org_id = $1`,
      [orgId, cost]
    );
  } catch (err) {
    console.error('[SpendingLimits] Failed to record spending:', err);
  }
}
