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

  // Enable CDC triggers on source tables
  const tables: string[] = pipeline.tables || [];
  const enabledTables: string[] = [];

  for (const table of tables) {
    try {
      await query('SELECT enable_cdc_on_table($1)', [table]);
      enabledTables.push(table);
    } catch {
      // Table might not exist or trigger already set
    }
  }

  // Update pipeline status
  await query(
    `UPDATE pipelines SET status = 'running', started_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [pipelineId]
  );

  // Create/update CDC engine record
  const engineId = `engine-${pipelineId}`;
  await query(
    `INSERT INTO cdc_engines (id, pipeline_id, status, started_at, events_processed, batches_committed, errors)
     VALUES ($1, $2, 'running', NOW(), 0, 0, 0)
     ON CONFLICT (id) DO UPDATE SET status = 'running', started_at = NOW(), updated_at = NOW()`,
    [engineId, pipelineId]
  );

  return NextResponse.json({
    data: {
      engineId,
      pipelineId,
      status: 'running',
      enabledTables,
      message: `CDC engine started. Triggers enabled on ${enabledTables.length} table(s).`,
    },
  });
}
