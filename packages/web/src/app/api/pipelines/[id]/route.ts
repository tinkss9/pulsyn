import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('SELECT * FROM pipelines WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  return NextResponse.json({ data: result.rows[0] });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, source, target, tables, config } = await req.json();

  const result = await query(
    `UPDATE pipelines SET name = COALESCE($2, name), source = COALESCE($3::jsonb, source),
     target = COALESCE($4::jsonb, target), tables = COALESCE($5::jsonb, tables),
     config = COALESCE($6::jsonb, config), updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, name, source ? JSON.stringify(source) : null, target ? JSON.stringify(target) : null,
     tables ? JSON.stringify(tables) : null, config ? JSON.stringify(config) : null]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  return NextResponse.json({ data: result.rows[0] });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('DELETE FROM pipelines WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
