import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
    const result = await query('SELECT * FROM process_pulsyn_changes()');
    const row = result.rows[0];
    const processed = parseInt(row.processed_count);
    const errors = parseInt(row.error_count);
    const skipped = parseInt(row.skipped_count);
    const errorDetails = row.error_details || [];

    const pendingResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count < max_retries'
    );
    const pending = parseInt(pendingResult.rows[0].count);

    const failedResult = await query(
      'SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE AND retry_count >= max_retries'
    );
    const failed = parseInt(failedResult.rows[0].count);

    let recentErrors: any[] = [];
    if (req.query.includeErrors === 'true') {
      const errorsResult = await query(
        `SELECT e.*, c.table_name, c.operation
         FROM _pulsyn_errors e
         JOIN _pulsyn_changes c ON c.id = e.change_id
         ORDER BY e.created_at DESC
         LIMIT 20`
      );
      recentErrors = errorsResult.rows;
    }

    const response: any = {
      data: {
        processed,
        errors,
        skipped,
        pendingChanges: pending,
        failedChanges: failed,
        errorDetails,
        timestamp: new Date().toISOString(),
      },
    };

    if (recentErrors.length > 0) {
      response.data.recentErrors = recentErrors;
    }

    return res.json(response);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
