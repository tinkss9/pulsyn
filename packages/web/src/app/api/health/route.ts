import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  const checks: Record<string, string> = {};

  try {
    await query('SELECT 1');
    checks.database = 'ok';
  } catch {
    checks.database = 'error';
  }

  return NextResponse.json({
    status: checks.database === 'ok' ? 'healthy' : 'degraded',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    latencyMs: Date.now() - start,
  });
}
