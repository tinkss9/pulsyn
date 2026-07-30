import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query(
    `UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id]
  );
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  return NextResponse.json({ data: result.rows[0] });
}
