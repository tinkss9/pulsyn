import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

// Reset failed changes for retry
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query('SELECT reset_failed_changes() as count');
    const resetCount = parseInt(result.rows[0].count);

    return res.json({
      data: {
        reset: resetCount,
        message: `${resetCount} failed changes reset for retry.`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
