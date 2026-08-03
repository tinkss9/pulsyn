import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body', code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const { pipelineId } = body;
  if (!pipelineId) {
    return NextResponse.json(
      { error: 'Missing required field: pipelineId', code: 'MISSING_FIELD' },
      { status: 400 }
    );
  }

  try {
    const pipelineResult = await query('SELECT * FROM pipelines WHERE id = $1', [pipelineId]);
    if (pipelineResult.rowCount === 0) {
      return NextResponse.json(
        { error: `Pipeline "${pipelineId}" not found`, code: 'PIPELINE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const pipeline = pipelineResult.rows[0];

    if (pipeline.status !== 'running') {
      return NextResponse.json(
        { error: `Pipeline "${pipelineId}" is not running (current status: ${pipeline.status})`, code: 'PIPELINE_NOT_RUNNING' },
        { status: 409 }
      );
    }

    // Disable CDC triggers on source tables
    const tables: string[] = pipeline.tables || [];
    for (const table of tables) {
      try {
        await query('SELECT disable_cdc_on_table($1)', [table]);
      } catch {
        // Best effort — table may have been dropped
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
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to stop CDC engine: ${err.message}`, code: 'CDC_STOP_FAILED' },
      { status: 500 }
    );
  }
}
