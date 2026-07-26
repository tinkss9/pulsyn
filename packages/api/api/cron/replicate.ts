import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

// Vercel Cron endpoint for automatic CDC replication
// Runs every minute via vercel.json crons config
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret if set
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !req.headers['x-vercel-cron']) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Check pending changes
    const pendingResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count < max_retries'
    );
    const pendingCount = parseInt(pendingResult.rows[0].count);

    // Check failed changes (max retries exceeded)
    const failedResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count >= max_retries'
    );
    const failedCount = parseInt(failedResult.rows[0].count);

    if (pendingCount === 0 && failedCount === 0) {
      return res.json({
        data: {
          processed: 0,
          errors: 0,
          skipped: 0,
          pendingChanges: 0,
          failedChanges: 0,
          errorDetails: [],
          message: 'No pending changes',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Process changes (with retry logic)
    const result = await query('SELECT * FROM process_pulsyn_changes()');
    const row = result.rows[0];
    const processed = parseInt(row.processed_count);
    const errors = parseInt(row.error_count);
    const skipped = parseInt(row.skipped_count);
    const errorDetails = row.error_details || [];

    // Get updated counts
    const remainingResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count < max_retries'
    );
    const remaining = parseInt(remainingResult.rows[0].count);

    const nowFailedResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count >= max_retries'
    );
    const nowFailed = parseInt(nowFailedResult.rows[0].count);

    // Build response
    const response: any = {
      data: {
        processed,
        errors,
        skipped,
        pendingChanges: remaining,
        failedChanges: nowFailed,
        timestamp: new Date().toISOString(),
      },
    };

    // Include error details if there were errors
    if (errors > 0 && errorDetails.length > 0) {
      response.data.errorDetails = errorDetails;
      response.data.message = `${errors} error(s) during replication. ${skipped} skipped (max retries exceeded).`;
    } else if (skipped > 0) {
      response.data.message = `${processed} processed, ${skipped} skipped (max retries exceeded).`;
    } else {
      response.data.message = `${processed} changes replicated successfully.`;
    }

    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
