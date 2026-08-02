// Health Routes — real dependency checks + Brain pre-check

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import { query } from '../db';

export const healthRoutes = Router();

// Pulsyn Brain pre-check (Python self-coding module)
const BRAIN_CLI = process.env.PULSYN_BRAIN_CLI || 'python';
const BRAIN_SCRIPT = process.env.PULSYN_BRAIN_SCRIPT || 'shared/brain/wiring/pulsyn_cli.py';
const BRAIN_DATA_DIR = process.env.PULSYN_BRAIN_DATA || 'data/brain/pulsyn';

function brainHealth(connectorId: string, metrics: Record<string, number>): { healthy: boolean; reason: string } | null {
  try {
    const result = execSync(
      `${BRAIN_CLI} ${BRAIN_SCRIPT} health --connector ${connectorId} --throughput ${metrics.throughputRps || 0} --latency ${metrics.latencyMs || 0} --error-rate ${metrics.errorRatePct || 0} --data-dir ${BRAIN_DATA_DIR}`,
      { timeout: 5000, encoding: 'utf-8' }
    );
    return JSON.parse(result);
  } catch {
    return null; // Brain not available — fallback to legacy checks
  }
}

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

  // Brain connector health check
  const brainResult = brainHealth('pulsyn-db', {
    throughputRps: 100,
    latencyMs: checks.database === 'ok' ? 50 : 5000,
    errorRatePct: checks.database === 'ok' ? 0 : 100,
  });

  const brainMeta = brainResult ? {
    healthy: brainResult.healthy,
    reason: brainResult.reason,
  } : { healthy: null, reason: 'brain_unavailable' };

  const allOk = Object.values(checks).every(v => v === 'ok');

  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ready' : 'not_ready',
    checks,
    brain: brainMeta,
  });
});
