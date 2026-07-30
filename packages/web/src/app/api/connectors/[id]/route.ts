import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('SELECT * FROM connectors WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }
  const connector = result.rows[0];
  if (connector.config?.password) {
    connector.config = { ...connector.config, password: '***' };
  }
  return NextResponse.json({ data: connector });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('DELETE FROM connectors WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Connector not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
