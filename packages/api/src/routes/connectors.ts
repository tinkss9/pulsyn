// Connector Routes

import { Router, Request, Response } from 'express';

export const connectorRoutes = Router();

// In-memory store
const connectors: Map<string, any> = new Map();

// List all connectors
connectorRoutes.get('/', (req: Request, res: Response) => {
  const list = Array.from(connectors.values());
  res.json({
    data: list,
    total: list.length,
  });
});

// Get connector by ID
connectorRoutes.get('/:id', (req: Request, res: Response) => {
  const connector = connectors.get(req.params.id);
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' });
  }
  res.json({ data: connector });
});

// Create connector
connectorRoutes.post('/', (req: Request, res: Response) => {
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

  res.status(201).json({ data: connector });
});

// Test connector connection
connectorRoutes.post('/:id/test', (req: Request, res: Response) => {
  const connector = connectors.get(req.params.id);
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  // Mock connection test
  res.json({
    data: {
      connectorId: connector.id,
      status: 'connected',
      latency: 45,
      timestamp: new Date().toISOString(),
    },
  });
});

// Get connector tables
connectorRoutes.get('/:id/tables', (req: Request, res: Response) => {
  const connector = connectors.get(req.params.id);
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  // Mock tables
  res.json({
    data: [
      { name: 'users', columns: 5 },
      { name: 'orders', columns: 8 },
      { name: 'products', columns: 6 },
    ],
  });
});

// Get table schema
connectorRoutes.get('/:id/tables/:table/schema', (req: Request, res: Response) => {
  const connector = connectors.get(req.params.id);
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  // Mock schema
  res.json({
    data: {
      name: req.params.table,
      columns: [
        { name: 'id', type: 'integer', nullable: false },
        { name: 'name', type: 'varchar', nullable: false },
        { name: 'email', type: 'varchar', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: false },
      ],
      primaryKey: ['id'],
    },
  });
});

// Delete connector
connectorRoutes.delete('/:id', (req: Request, res: Response) => {
  if (!connectors.has(req.params.id)) {
    return res.status(404).json({ error: 'Connector not found' });
  }

  connectors.delete(req.params.id);

  res.status(204).send();
});
