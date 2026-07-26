import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

// Vercel Cron endpoint for automatic CDC replication
// Runs on schedule defined in vercel.json
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a Vercel cron invocation (or allow manual trigger)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, verify the request
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also allow Vercel's internal cron headers
    if (!req.headers['x-vercel-cron']) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    // Check if there are unprocessed changes first
    const pendingResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE'
    );
    const pendingCount = parseInt(pendingResult.rows[0].count);

    if (pendingCount === 0) {
      return res.json({
        data: {
          processed: 0,
          errors: 0,
          pendingChanges: 0,
          message: 'No pending changes',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Process changes
    const result = await query('SELECT * FROM process_pulsyn_changes()');
    const { processed_count, error_count } = result.rows[0];

    // Get remaining count
    const remainingResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE'
    );
    const remaining = parseInt(remainingResult.rows[0].count);

    return res.json({
      data: {
        processed: parseInt(processed_count),
        errors: parseInt(error_count),
        pendingChanges: remaining,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
