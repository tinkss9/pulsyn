// CDC Routes
// Control CDC engine for pipelines

import { Router, Request, Response } from 'express';
import { query } from '../db';

export const cdcRoutes = Router();

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

  // Persist CDC engine state to database
  const engineId = `engine-${pipelineId}`;
  await query(
    `INSERT INTO cdc_engines (id, pipeline_id, status, started_at, events_processed, batches_committed, errors)
     VALUES ($1, $2, 'running', NOW(), 0, 0, 0)
     ON CONFLICT (id) DO UPDATE SET status = 'running', started_at = NOW(), updated_at = NOW()`,
    [engineId, pipelineId]
  );

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

  // Update CDC engine state in database
  const engineId = `engine-${pipelineId}`;
  await query(
    `UPDATE cdc_engines SET status = 'stopped', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [engineId]
  );

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

  // Get CDC engine state from database
  const engineId = `engine-${pipelineId}`;
  let engine = null;
  try {
    const engineResult = await query('SELECT * FROM cdc_engines WHERE id = $1', [engineId]);
    if (engineResult.rowCount > 0) {
      engine = engineResult.rows[0];
    }
  } catch {
    // cdc_engines table may not exist yet
  }

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
        startedAt: engine.started_at,
        stats: {
          eventsProcessed: engine.events_processed || 0,
          batchesCommitted: engine.batches_committed || 0,
          errors: engine.errors || 0,
        },
      } : null,
      pendingChanges,
    },
  });
});

// Get all active CDC engines
cdcRoutes.get('/engines', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT id, pipeline_id, status, started_at, events_processed, batches_committed, errors
       FROM cdc_engines WHERE status = 'running' ORDER BY started_at DESC`
    );

    res.json({
      data: result.rows.map(row => ({
        id: row.id,
        pipelineId: row.pipeline_id,
        status: row.status,
        startedAt: row.started_at,
        stats: {
          eventsProcessed: row.events_processed || 0,
          batchesCommitted: row.batches_committed || 0,
          errors: row.errors || 0,
        },
      })),
      total: result.rowCount,
    });
  } catch {
    res.json({ data: [], total: 0 });
  }
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
