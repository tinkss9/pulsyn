import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    const failedResult = await query(
      `SELECT id, table_name, operation, row_data, retry_count, max_retries, error_message, failed_at, changed_at
       FROM _pulsyn_changes
       WHERE processed = FALSE AND retry_count >= max_retries
       ORDER BY id DESC
       LIMIT 50`
    );

    const errorsResult = await query(
      `SELECT e.id, e.change_id, e.error_message, e.error_detail, e.retry_count, e.created_at,
              c.table_name, c.operation
       FROM _pulsyn_errors e
       LEFT JOIN _pulsyn_changes c ON c.id = e.change_id
       ORDER BY e.created_at DESC
       LIMIT 50`
    );

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
