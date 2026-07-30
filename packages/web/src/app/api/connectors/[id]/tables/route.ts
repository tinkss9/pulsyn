import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Pool } from 'pg';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('SELECT * FROM connectors WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }

  const connector = result.rows[0];
  const config = connector.config;
  let testPool: Pool | null = null;

  try {
    testPool = new Pool({
      host: config.host || 'localhost', port: config.port || 5432,
      database: config.database || config.db, user: config.user || config.username,
      password: config.password, connectionTimeoutMillis: 5000, max: 1,
    });

    const client = await testPool.connect();
    const tablesResult = await client.query(`
      SELECT table_name as name,
             (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
      FROM information_schema.tables t WHERE table_schema = 'public' ORDER BY table_name
    `);
    client.release();
    return NextResponse.json({ data: tablesResult.rows });
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to fetch tables: ${err.message}` }, { status: 500 });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
}
