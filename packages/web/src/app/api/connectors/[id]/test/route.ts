import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Pool } from 'pg';

// SSRF protection — block internal/cloud metadata IPs
const BLOCKED_HOSTS = [
  '169.254.169.254',  // AWS metadata
  'metadata.google.internal',  // GCP metadata
  '169.254.169.253',  // Azure metadata
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
];

const BLOCKED_HOST_PATTERNS = [
  /^10\./,           // Private IP range
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // Private IP range
  /^192\.168\./,     // Private IP range
  /\.local$/,        // Local domains
  /\.internal$/,     // Internal domains
];

function isHostBlocked(host: string): boolean {
  if (!host) return false;
  const lower = host.toLowerCase();
  if (BLOCKED_HOSTS.includes(lower)) return true;
  return BLOCKED_HOST_PATTERNS.some(pattern => pattern.test(lower));
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('SELECT * FROM connectors WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  const connector = result.rows[0];
  const config = connector.config;
  const start = Date.now();
  let testPool: Pool | null = null;

  try {
    // SSRF protection — block internal hosts
    if (isHostBlocked(config.host)) {
      return NextResponse.json({
        error: 'Connection to internal/metadata hosts is not allowed',
        code: 'HOST_BLOCKED',
      }, { status: 400 });
    }

    testPool = new Pool({
      host: config.host || 'localhost',
      port: config.port || 5432,
      database: config.database || config.db,
      user: config.user || config.username,
      password: config.password,
      connectionTimeoutMillis: 5000,
      max: 1,
    });

    const client = await testPool.connect();
    const pgResult = await client.query('SELECT version()');
    client.release();

    await query(`UPDATE connectors SET status = 'connected', updated_at = NOW() WHERE id = $1`, [id]);

    return NextResponse.json({
      data: { connectorId: id, status: 'connected', latency: Date.now() - start, version: pgResult.rows[0]?.version, timestamp: new Date().toISOString() },
    });
  } catch (err: any) {
    await query(`UPDATE connectors SET status = 'error', updated_at = NOW() WHERE id = $1`, [id]);
    console.error('[Connector Test] Error:', err.message);
    return NextResponse.json({
      data: { connectorId: id, status: 'error', latency: Date.now() - start, timestamp: new Date().toISOString() },
    });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
}
