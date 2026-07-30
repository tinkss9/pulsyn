import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Pool } from 'pg';

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
    return NextResponse.json({
      data: { connectorId: id, status: 'error', error: err.message, latency: Date.now() - start, timestamp: new Date().toISOString() },
    });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
}
