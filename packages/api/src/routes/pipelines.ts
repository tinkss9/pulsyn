// Pipeline Routes — PostgreSQL backed

import { Router, Request, Response } from 'express';
import { query } from '../db';

export const pipelineRoutes = Router();

// List all pipelines
pipelineRoutes.get('/', async (req: Request, res: Response) => {
  const result = await query(
    'SELECT * FROM pipelines ORDER BY created_at DESC'
  );
  res.json({ data: result.rows, total: result.rowCount });
});

// Get pipeline by ID
pipelineRoutes.get('/:id', async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM pipelines WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: result.rows[0] });
});

// Create pipeline
pipelineRoutes.post('/', async (req: Request, res: Response) => {
  const { name, source, target, tables, config } = req.body;
  const id = `pipeline-${Date.now()}`;

  const result = await query(
    `INSERT INTO pipelines (id, name, source, target, tables, config)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [id, name, JSON.stringify(source), JSON.stringify(target), JSON.stringify(tables || []), JSON.stringify(config || {})]
  );

  res.status(201).json({ data: result.rows[0] });
});

// Update pipeline
pipelineRoutes.put('/:id', async (req: Request, res: Response) => {
  const { name, source, target, tables, config } = req.body;

  const result = await query(
    `UPDATE pipelines
     SET name = COALESCE($2, name),
         source = COALESCE($3, source),
         target = COALESCE($4, target),
         tables = COALESCE($5, tables),
         config = COALESCE($6, config),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [req.params.id, name, source ? JSON.stringify(source) : null, target ? JSON.stringify(target) : null, tables ? JSON.stringify(tables) : null, config ? JSON.stringify(config) : null]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: result.rows[0] });
});

// Delete pipeline
pipelineRoutes.delete('/:id', async (req: Request, res: Response) => {
  const result = await query('DELETE FROM pipelines WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.status(204).send();
});

// Start pipeline
pipelineRoutes.post('/:id/start', async (req: Request, res: Response) => {
  const result = await query(
    `UPDATE pipelines SET status = 'running', started_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: result.rows[0] });
});

// Stop pipeline
pipelineRoutes.post('/:id/stop', async (req: Request, res: Response) => {
  const result = await query(
    `UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: result.rows[0] });
});

// Pause pipeline
pipelineRoutes.post('/:id/pause', async (req: Request, res: Response) => {
  const result = await query(
    `UPDATE pipelines SET status = 'paused', updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [req.params.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: result.rows[0] });
});

// Get pipeline metrics
pipelineRoutes.get('/:id/metrics', async (req: Request, res: Response) => {
  const result = await query('SELECT id, status, stats FROM pipelines WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  const pipeline = result.rows[0];
  res.json({
    data: {
      pipelineId: pipeline.id,
      status: pipeline.status,
      stats: pipeline.stats,
      timestamp: new Date().toISOString(),
    },
  });
});

// Get pipeline checkpoints
pipelineRoutes.get('/:id/checkpoints', async (req: Request, res: Response) => {
  const pipelineCheck = await query('SELECT id FROM pipelines WHERE id = $1', [req.params.id]);
  if (pipelineCheck.rowCount === 0) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  const result = await query(
    'SELECT * FROM checkpoints WHERE pipeline_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.params.id]
  );

  res.json({ data: result.rows });
});
