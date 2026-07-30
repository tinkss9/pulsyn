import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM pipelines ORDER BY created_at DESC');
  return NextResponse.json({ data: result.rows, total: result.rowCount });
}

export async function POST(req: NextRequest) {
  const { name, source, target, tables, config } = await req.json();
  const id = `pipeline-${Date.now()}`;

  const result = await query(
    `INSERT INTO pipelines (id, name, source, target, tables, config)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, name, JSON.stringify(source), JSON.stringify(target), JSON.stringify(tables || []), JSON.stringify(config || {})]
  );

  return NextResponse.json({ data: result.rows[0] }, { status: 201 });
}
