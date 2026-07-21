import type { VercelRequest, VercelResponse } from '@vercel/node';

const connectors: Map<string, any> = new Map();

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  switch (method) {
    case 'GET': {
      const list = Array.from(connectors.values());
      return res.json({ data: list, total: list.length });
    }
    case 'POST': {
      const { name, engine, config } = req.body;
      const connector = {
        id: `connector-${Date.now()}`,
        name,
        engine,
        config,
        status: 'disconnected',
        createdAt: new Date().toISOString(),
      };
      connectors.set(connector.id, connector);
      return res.status(201).json({ data: connector });
    }
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
