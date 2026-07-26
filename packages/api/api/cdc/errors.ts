import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

// View failed changes and error logs
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get failed changes (max retries exceeded)
    const failedResult = await query(
      `SELECT id, table_name, operation, row_data, retry_count, max_retries, error_message, failed_at, changed_at
       FROM _pulsyn_changes
       WHERE processed = FALSE AND retry_count >= max_retries
       ORDER BY id DESC
       LIMIT 50`
    );

    // Get recent errors
    const errorsResult = await query(
      `SELECT e.id, e.change_id, e.error_message, e.error_detail, e.retry_count, e.created_at,
              c.table_name, c.operation
       FROM _pulsyn_errors e
       LEFT JOIN _pulsyn_changes c ON c.id = e.change_id
       ORDER BY e.created_at DESC
       LIMIT 50`
    );

    // Get summary stats
    const statsResult = await query(`
      SELECT
        COUNT(*) FILTER (WHERE processed = TRUE) as total_processed,
        COUNT(*) FILTER (WHERE processed = FALSE AND retry_count < max_retries) as pending,
        COUNT(*) FILTER (WHERE processed = FALSE AND retry_count >= max_retries) as failed,
        MAX(changed_at) FILTER (WHERE processed = TRUE) as last_processed_at
      FROM _pulsyn_changes
    `);

    return res.json({
      data: {
        failedChanges: failedResult.rows,
        recentErrors: errorsResult.rows,
        stats: statsResult.rows[0],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
