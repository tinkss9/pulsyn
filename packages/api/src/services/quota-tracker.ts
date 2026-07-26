// Quota tracking service for free tier limits
import { query } from '../db';

export interface QuotaStatus {
  used: number;
  limit: number;
  percentage: number;
  warning: boolean; // 80% threshold
  exceeded: boolean; // 100% threshold
  resetAt: string; // ISO timestamp when quota resets
}

// Free tier limits
const FREE_TIER_LIMITS = {
  maxPipelines: 1,
  maxConnectors: 3,
  maxRowsPerDay: 10000,
  maxApiCallsPerDay: 1000,
};

const PRO_TIER_LIMITS = {
  maxPipelines: 999,
  maxConnectors: 999,
  maxRowsPerDay: 5000000,
  maxApiCallsPerDay: 100000,
};

export async function getQuotaStatus(orgId: string, planId: string = 'community'): Promise<QuotaStatus> {
  const limits = planId === 'community' ? FREE_TIER_LIMITS : PRO_TIER_LIMITS;
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const resetAt = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  // Get today's row count
  const result = await query(
    `SELECT COALESCE(SUM(quantity), 0) as total
     FROM usage_records
     WHERE organization_id = $1
       AND metric = 'rows_replicated'
       AND created_at >= $2`,
    [orgId, dayStart.toISOString()]
  );

  const used = parseInt(result.rows[0]?.total || '0');
  const limit = limits.maxRowsPerDay;
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return {
    used,
    limit,
    percentage,
    warning: percentage >= 80,
    exceeded: percentage >= 100,
    resetAt: resetAt.toISOString(),
  };
}

export async function recordRowsReplicated(orgId: string, count: number): Promise<void> {
  await query(
    `INSERT INTO usage_records (organization_id, metric, quantity)
     VALUES ($1, 'rows_replicated', $2)`,
    [orgId, count]
  );
}

export async function checkAndNotifyQuota(orgId: string, userEmail: string, userName: string): Promise<{
  action: 'none' | 'warning' | 'paused';
  quota: QuotaStatus;
}> {
  const quota = await getQuotaStatus(orgId);

  if (quota.exceeded) {
    // Send exhaustion email
    await sendQuotaExhaustedEmail(userEmail, userName, quota);
    return { action: 'paused', quota };
  }

  if (quota.warning) {
    // Send warning email
    await sendQuotaWarningEmail(userEmail, userName, quota);
    return { action: 'warning', quota };
  }

  return { action: 'none', quota };
}

async function sendQuotaExhaustedEmail(email: string, name: string, quota: QuotaStatus): Promise<void> {
  // In production, this would call SendGrid/Resend/SES
  console.log(`[EMAIL] Quota exhausted for ${email}: ${quota.used}/${quota.limit} rows`);

  // Store notification to prevent spam
  await query(
    `INSERT INTO usage_records (organization_id, metric, quantity)
     VALUES ($1, 'quota_exhausted_email_sent', 1)`,
    [email]
  );
}

async function sendQuotaWarningEmail(email: string, name: string, quota: QuotaStatus): Promise<void> {
  console.log(`[EMAIL] Quota warning for ${email}: ${quota.percentage}% used (${quota.used}/${quota.limit})`);
}
