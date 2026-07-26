import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  try {
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
