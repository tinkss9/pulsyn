import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory store (resets between cold starts in serverless)
const pipelines: Map<string, any> = new Map();

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const list = Array.from(pipelines.values());
      return res.json({ data: list, total: list.length });
    }
    case 'POST': {
      const { name, source, target, tables } = req.body;
      const pipeline = {
        id: `pipeline-${Date.now()}`,
        name,
        source,
        target,
        tables,
        status: 'idle',
        stats: { rowsRead: 0, rowsWritten: 0, rowsPerSecond: 0, lagMs: 0, errors: 0 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      pipelines.set(pipeline.id, pipeline);
      return res.status(201).json({ data: pipeline });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
