import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query(
    'SELECT id, name, engine, status, created_at, updated_at FROM connectors ORDER BY created_at DESC'
  );
  return NextResponse.json({ data: result.rows, total: result.rowCount });
}

export async function POST(req: NextRequest) {
  const { name, engine, config } = await req.json();
  const id = `connector-${Date.now()}`;

  const result = await query(
    `INSERT INTO connectors (id, name, engine, config) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, name, engine, JSON.stringify(config)]
  );

  const connector = result.rows[0];
  if (connector.config?.password) {
    connector.config = { ...connector.config, password: '***' };
  }
  return NextResponse.json({ data: connector }, { status: 201 });
}
