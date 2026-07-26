// Quota API endpoint — check usage and limits
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    const orgId = req.query.org as string || 'default';
    const planId = req.query.plan as string || 'community';

    // Get today's usage
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const resetAt = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const usageResult = await query(
      `SELECT COALESCE(SUM(quantity), 0) as total
       FROM usage_records
       WHERE organization_id = $1
         AND metric = 'rows_replicated'
         AND created_at >= $2`,
      [orgId, dayStart.toISOString()]
    );

    const used = parseInt(usageResult.rows[0]?.total || '0');

    // Define limits per plan
    const limits: Record<string, number> = {
      community: 10000,
      pro: 5000000,
      business: 100000000,
    };

    const limit = limits[planId] || limits.community;
    const percentage = Math.min(100, Math.round((used / limit) * 100));

    // Check if warning email was already sent today
    const warningSent = await query(
      `SELECT COUNT(*) as count FROM usage_records
       WHERE organization_id = $1
         AND metric = 'quota_warning_sent'
         AND created_at >= $2`,
      [orgId, dayStart.toISOString()]
    );

    const exhaustedSent = await query(
      `SELECT COUNT(*) as count FROM usage_records
       WHERE organization_id = $1
         AND metric = 'quota_exhausted_sent'
         AND created_at >= $2`,
      [orgId, dayStart.toISOString()]
    );

    return res.json({
      data: {
        used,
        limit,
        percentage,
        warning: percentage >= 80,
        exceeded: percentage >= 100,
        resetAt: resetAt.toISOString(),
        warningEmailSent: parseInt(warningSent.rows[0]?.count || '0') > 0,
        exhaustedEmailSent: parseInt(exhaustedSent.rows[0]?.count || '0') > 0,
        plan: planId,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
