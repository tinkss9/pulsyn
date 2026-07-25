import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all running pipelines as "active engines"
    const result = await query(
      `SELECT id, name, status, started_at, stats FROM pipelines WHERE status = 'running'`
    );

    const engines = result.rows.map(row => ({
      engineId: `engine-${row.id}`,
      pipelineId: row.id,
      name: row.name,
      status: row.status,
      startedAt: row.started_at,
      stats: row.stats,
    }));

    return res.json({
      data: engines,
      total: engines.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
