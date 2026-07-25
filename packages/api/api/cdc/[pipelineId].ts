import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract pipelineId from path: /api/cdc/status/[pipelineId]
  const pipelineId = req.query.pipelineId as string;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  try {
    const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
    if (pipelineResult.rowCount === 0) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const pipeline = pipelineResult.rows[0];

    // Get pending change count
    let pendingChanges = 0;
    try {
      const changeResult = await query(
        `SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE`
      );
      pendingChanges = parseInt(changeResult.rows[0]?.count || '0');
    } catch {
      // Change tracking table may not exist yet
    }

    return res.json({
      data: {
        pipelineId,
        status: pipeline.status,
        stats: pipeline.stats,
        startedAt: pipeline.started_at,
        pendingChanges,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
