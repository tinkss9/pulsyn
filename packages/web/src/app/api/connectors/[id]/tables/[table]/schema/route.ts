import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Pool } from 'pg';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; table: string }> }) {
  const { id, table } = await params;
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
    const columnsResult = await client.query(`
      SELECT column_name as name, data_type as type, is_nullable as nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position
    `, [table]);

    const pkResult = await client.query(`
      SELECT a.attname as name FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = $1::regclass AND i.indisprimary
    `, [table]);
    client.release();

    return NextResponse.json({
      data: {
        name: table,
        columns: columnsResult.rows.map((c: any) => ({ name: c.name, type: c.type, nullable: c.nullable === 'YES' })),
        primaryKey: pkResult.rows.map((r: any) => r.name),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to fetch schema: ${err.message}` }, { status: 500 });
  } finally {
    if (testPool) await testPool.end().catch(() => {});
  }
}
