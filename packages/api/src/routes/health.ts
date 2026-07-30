// Health Routes — real dependency checks

import { Router, Request, Response } from 'express';
import { query } from '../db';

export const healthRoutes = Router();

healthRoutes.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

healthRoutes.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Check database connectivity
  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'failed';
  }

  const allOk = Object.values(checks).every(v => v === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ready' : 'not_ready',
    checks,
  });
});
