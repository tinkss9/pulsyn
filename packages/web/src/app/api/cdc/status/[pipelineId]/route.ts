import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ pipelineId: string }> }) {
  const { pipelineId } = await params;

  // Get pipeline
  const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }

  const pipeline = pipelineResult.rows[0];

  // Get CDC engine state
  const engineId = `engine-${pipelineId}`;
  let engine = null;
  try {
    const engineResult = await query('SELECT * FROM cdc_engines WHERE id = $1', [engineId]);
    if (engineResult.rowCount > 0) {
      engine = engineResult.rows[0];
    }
  } catch { /* no engine yet */ }

  // Get real CDC stats
  let stats = { pending_changes: 0, processed_changes: 0, failed_changes: 0, total_changes: 0 };
  try {
    const statsResult = await query('SELECT * FROM get_cdc_stats($1)', [pipelineId]);
    if (statsResult.rowCount > 0) {
      stats = statsResult.rows[0];
    }
  } catch { /* stats function may not exist */ }

  return NextResponse.json({
    data: {
      pipelineId,
      status: pipeline.status,
      engine: engine ? {
        status: engine.status,
        startedAt: engine.started_at,
        stats: {
          eventsProcessed: engine.events_processed || 0,
          batchesCommitted: engine.batches_committed || 0,
          errors: engine.errors || 0,
        },
      } : null,
      changes: {
        pending: parseInt(String(stats.pending_changes)) || 0,
        processed: parseInt(String(stats.processed_changes)) || 0,
        failed: parseInt(String(stats.failed_changes)) || 0,
        total: parseInt(String(stats.total_changes)) || 0,
      },
    },
  });
}
