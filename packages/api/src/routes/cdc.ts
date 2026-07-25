// CDC Routes
// Control CDC engine for pipelines

import { Router, Request, Response } from 'express';
import { query } from '../db';

export const cdcRoutes = Router();

// Active CDC engines (in-memory for now)
const activeEngines: Map<string, any> = new Map();

// Start CDC for a pipeline
cdcRoutes.post('/start', async (req: Request, res: Response) => {
  const { pipelineId } = req.body;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  // Get pipeline from database
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

  // Simulate CDC engine start
  const engineId = `engine-${pipelineId}`;
  activeEngines.set(engineId, {
    pipelineId,
    status: 'running',
    startedAt: new Date(),
    stats: {
      eventsProcessed: 0,
      batchesCommitted: 0,
      errors: 0,
    },
  });

  res.json({
    data: {
      engineId,
      pipelineId,
      status: 'running',
      message: 'CDC engine started. Changes will be tracked via database triggers.',
    },
  });
});

// Stop CDC for a pipeline
cdcRoutes.post('/stop', async (req: Request, res: Response) => {
  const { pipelineId } = req.body;

  if (!pipelineId) {
    return res.status(400).json({ error: 'Missing pipelineId' });
  }

  // Update pipeline status
  await query(
    `UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [pipelineId]
  );

  // Remove engine
  const engineId = `engine-${pipelineId}`;
  activeEngines.delete(engineId);

  res.json({
    data: {
      engineId,
      pipelineId,
      status: 'stopped',
      message: 'CDC engine stopped.',
    },
  });
});

// Get CDC status for a pipeline
cdcRoutes.get('/status/:pipelineId', async (req: Request, res: Response) => {
  const { pipelineId } = req.params;

  // Get pipeline from database
  const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  const pipeline = pipelineResult.rows[0];
  const engineId = `engine-${pipelineId}`;
  const engine = activeEngines.get(engineId);

  // Get change count from source database
  let pendingChanges = 0;
  try {
    const changeResult = await query(`
      SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE
    `);
    pendingChanges = parseInt(changeResult.rows[0]?.count || '0');
  } catch {
    // Change tracking table may not exist
  }

  res.json({
    data: {
      pipelineId,
      status: pipeline.status,
      engine: engine ? {
        status: engine.status,
        startedAt: engine.startedAt,
        stats: engine.stats,
      } : null,
      pendingChanges,
    },
  });
});

// Get all active CDC engines
cdcRoutes.get('/engines', (req: Request, res: Response) => {
  const engines = Array.from(activeEngines.entries()).map(([id, engine]) => ({
    id,
    ...engine,
  }));

  res.json({
    data: engines,
    total: engines.length,
  });
});

// Get CDC events for a pipeline (recent changes)
cdcRoutes.get('/events/:pipelineId', async (req: Request, res: Response) => {
  const { pipelineId } = req.params;
  const limit = parseInt(req.query.limit as string) || 100;

  // Get pipeline
  const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  // Get recent changes
  try {
    const changesResult = await query(`
      SELECT id, table_name, operation, row_data, old_data, changed_at
      FROM _pulsyn_changes
      ORDER BY id DESC
      LIMIT $1
    `, [limit]);

    res.json({
      data: changesResult.rows.map(row => ({
        id: row.id,
        table: row.table_name,
        operation: row.operation,
        data: row.row_data,
        oldData: row.old_data,
        timestamp: row.changed_at,
      })),
    });
  } catch {
    res.json({ data: [], message: 'Change tracking not configured on source database' });
  }
});
