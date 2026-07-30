import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipelineCheck = await query('SELECT id FROM pipelines WHERE id = $1', [id]);
  if (pipelineCheck.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  const result = await query(
    'SELECT * FROM checkpoints WHERE pipeline_id = $1 ORDER BY created_at DESC LIMIT 50',
    [id]
  );
  return NextResponse.json({ data: result.rows });
}
