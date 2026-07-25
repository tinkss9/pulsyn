import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

// Active CDC engines (in-memory for serverless — resets on cold start)
const activeEngines: Map<string, any> = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pipelineId } = req.body;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  try {
    // Check pipeline exists
    const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
    if (pipelineResult.rowCount === 0) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const pipeline = pipelineResult.rows[0];

    // Update pipeline status
    await query(
      `UPDATE pipelines SET status = 'running', started_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [pipelineId]
    );

    // Register engine
    const engineId = `engine-${pipelineId}`;
    activeEngines.set(engineId, {
      pipelineId,
      status: 'running',
      startedAt: new Date().toISOString(),
      stats: { eventsProcessed: 0, batchesCommitted: 0, errors: 0 },
    });

    return res.json({
      data: {
        engineId,
        pipelineId,
        status: 'running',
        message: 'CDC engine started. Changes tracked via database triggers.',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
