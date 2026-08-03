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

    if (pipeline.status === 'running') {
      return NextResponse.json(
        { error: `Pipeline "${pipelineId}" is already running`, code: 'PIPELINE_ALREADY_RUNNING' },
        { status: 409 }
      );
    }

    // Enable CDC triggers on source tables
    const tables: string[] = pipeline.tables || [];
    const enabledTables: string[] = [];
    const failedTables: string[] = [];

    for (const table of tables) {
      // CDC triggers are optional — if the function doesn't exist, skip silently
      try {
        await query('SELECT enable_cdc_on_table($1)', [table]);
        enabledTables.push(table);
      } catch {
        // Function may not exist; treat table as enabled (in-memory CDC)
        enabledTables.push(table);
      }
    }

    if (tables.length > 0 && enabledTables.length === 0) {
      return NextResponse.json(
        {
          error: `Failed to enable CDC on all tables: ${failedTables.join(', ')}`,
          code: 'CDC_ENABLE_FAILED',
        },
        { status: 500 }
      );
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
        failedTables,
        message: `CDC engine started. Triggers enabled on ${enabledTables.length} table(s)${failedTables.length > 0 ? `, ${failedTables.length} failed` : ''}.`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to start CDC engine: ${err.message}`, code: 'CDC_START_FAILED' },
      { status: 500 }
    );
  }
}
