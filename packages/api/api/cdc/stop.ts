import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query, authenticate } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authenticated = await authenticate(req, res);
  if (!authenticated) return;

  const { pipelineId } = req.body;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  try {
    await query(
      `UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`,
      [pipelineId]
    );

    return res.json({
      data: {
        pipelineId,
        status: 'stopped',
        message: 'CDC engine stopped.',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
