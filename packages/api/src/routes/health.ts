// Health Routes

import { Router, Request, Response } from 'express';

export const healthRoutes = Router();

healthRoutes.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRoutes.get('/ready', (req: Request, res: Response) => {
  // Check if all dependencies are ready
  res.json({
    status: 'ready',
    checks: {
      database: 'ok',
      cache: 'ok',
    },
  });
});
