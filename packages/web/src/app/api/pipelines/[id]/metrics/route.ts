import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await query('SELECT id, status, stats FROM pipelines WHERE id = $1', [id]);
  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }
  const pipeline = result.rows[0];
  return NextResponse.json({
    data: { pipelineId: pipeline.id, status: pipeline.status, stats: pipeline.stats, timestamp: new Date().toISOString() },
  });
}
