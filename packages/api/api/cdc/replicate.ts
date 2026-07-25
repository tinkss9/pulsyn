import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Call the replication processor function
    const result = await query('SELECT * FROM process_pulsyn_changes()');
    const { processed_count, error_count } = result.rows[0];

    // Get remaining unprocessed count
    const pendingResult = await query('SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE');
    const pending = parseInt(pendingResult.rows[0].count);

    return res.json({
      data: {
        processed: parseInt(processed_count),
        errors: parseInt(error_count),
        pendingChanges: pending,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
