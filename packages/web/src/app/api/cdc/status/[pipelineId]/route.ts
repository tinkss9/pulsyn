import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ pipelineId: string }> }) {
  const { pipelineId } = await params;

  const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }

  const pipeline = pipelineResult.rows[0];
  let pendingChanges = 0;
  try {
    const changeResult = await query('SELECT COUNT(*) as count FROM _pulsyn_changes WHERE processed = FALSE');
    pendingChanges = parseInt(changeResult.rows[0]?.count || '0');
  } catch { /* change tracking table may not exist */ }

  return NextResponse.json({
    data: { pipelineId, status: pipeline.status, pendingChanges },
  });
}
