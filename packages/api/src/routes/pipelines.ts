// Pipeline Routes

import { Router, Request, Response } from 'express';

export const pipelineRoutes = Router();

// In-memory store (would be database in production)
const pipelines: Map<string, any> = new Map();

// List all pipelines
pipelineRoutes.get('/', (req: Request, res: Response) => {
  const list = Array.from(pipelines.values());
  res.json({
    data: list,
    total: list.length,
  });
});

// Get pipeline by ID
pipelineRoutes.get('/:id', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }
  res.json({ data: pipeline });
});

// Create pipeline
pipelineRoutes.post('/', (req: Request, res: Response) => {
  const { name, source, target, tables } = req.body;

  const pipeline = {
    id: `pipeline-${Date.now()}`,
    name,
    source,
    target,
    tables,
    status: 'idle',
    stats: {
      rowsRead: 0,
      rowsWritten: 0,
      rowsPerSecond: 0,
      lagMs: 0,
      errors: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  pipelines.set(pipeline.id, pipeline);

  res.status(201).json({ data: pipeline });
});

// Update pipeline
pipelineRoutes.put('/:id', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  const updated = {
    ...pipeline,
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  pipelines.set(req.params.id, updated);

  res.json({ data: updated });
});

// Delete pipeline
pipelineRoutes.delete('/:id', (req: Request, res: Response) => {
  if (!pipelines.has(req.params.id)) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  pipelines.delete(req.params.id);

  res.status(204).send();
});

// Start pipeline
pipelineRoutes.post('/:id/start', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  pipeline.status = 'running';
  pipeline.startedAt = new Date().toISOString();

  res.json({ data: pipeline });
});

// Stop pipeline
pipelineRoutes.post('/:id/stop', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  pipeline.status = 'idle';
  pipeline.stoppedAt = new Date().toISOString();

  res.json({ data: pipeline });
});

// Pause pipeline
pipelineRoutes.post('/:id/pause', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  pipeline.status = 'paused';

  res.json({ data: pipeline });
});

// Get pipeline metrics
pipelineRoutes.get('/:id/metrics', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

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
pipelineRoutes.get('/:id/checkpoints', (req: Request, res: Response) => {
  const pipeline = pipelines.get(req.params.id);
  if (!pipeline) {
    return res.status(404).json({ error: 'Pipeline not found' });
  }

  // Mock checkpoints (would come from checkpoint manager in production)
  res.json({
    data: [
      {
        id: `checkpoint-${Date.now()}`,
        pipelineId: pipeline.id,
        lsn: '0/1234567',
        timestamp: new Date().toISOString(),
        tables: {},
      },
    ],
  });
});
