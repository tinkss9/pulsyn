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

  const pipeline = pipelineResult.rows[0];

  // Disable CDC triggers on source tables
  const tables: string[] = pipeline.tables || [];
  for (const table of tables) {
    try {
      await query('SELECT disable_cdc_on_table($1)', [table]);
    } catch {
      // Ignore
    }
  }

  // Update pipeline status
  await query(
    `UPDATE pipelines SET status = 'idle', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [pipelineId]
  );

  // Update CDC engine state
  const engineId = `engine-${pipelineId}`;
  await query(
    `UPDATE cdc_engines SET status = 'stopped', stopped_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [engineId]
  );

  return NextResponse.json({
    data: { engineId, pipelineId, status: 'stopped', message: 'CDC engine stopped. Triggers removed.' },
  });
}
