import type { VercelRequest, VercelResponse } from '@vercel/node';
import { query } from '../_db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pipelineId = req.query.pipelineId as string;
  const limit = parseInt(req.query.limit as string) || 100;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  try {
    // Check pipeline exists
    const pipelineResult = await query('SELECT id FROM pipelines WHERE id = $1', [pipelineId]);
    if (pipelineResult.rowCount === 0) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Get recent changes from change tracking table
    const changesResult = await query(
      `SELECT id, table_name, operation, row_data, old_data, changed_at
       FROM _pulsyn_changes
       ORDER BY id DESC
       LIMIT $1`,
      [limit]
    );

    return res.json({
      data: changesResult.rows.map(row => ({
        id: row.id,
        table: row.table_name,
        operation: row.operation,
        data: row.row_data,
        oldData: row.old_data,
        timestamp: row.changed_at,
      })),
    });
  } catch (err: any) {
    // If table doesn't exist, return empty
    return res.json({
      data: [],
      message: 'Change tracking not configured on source database',
    });
  }
}
