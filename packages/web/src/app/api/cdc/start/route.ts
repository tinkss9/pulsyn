import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { pipelineId } = await req.json();
  if (!pipelineId) {
    return NextResponse.json({ error: 'Missing pipelineId' }, { status: 400 });
  }

  const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }

  await query(`UPDATE pipelines SET status = 'running', started_at = NOW(), updated_at = NOW() WHERE id = $1`, [pipelineId]);

  return NextResponse.json({
    data: { engineId: `engine-${pipelineId}`, pipelineId, status: 'running', message: 'CDC engine started.' },
  });
}
