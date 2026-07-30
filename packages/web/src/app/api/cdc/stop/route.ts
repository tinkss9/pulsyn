import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { pipelineId } = await req.json();
  if (!pipelineId) {
    return NextResponse.json({ error: 'Missing pipelineId' }, { status: 400 });
  }

  await query(`UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`, [pipelineId]);

  return NextResponse.json({
    data: { engineId: `engine-${pipelineId}`, pipelineId, status: 'stopped', message: 'CDC engine stopped.' },
  });
}
