import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  validateString,
  validateEngine,
  validateRequiredObject,
  validateArray,
  collectErrors,
  validationErrorsResponse,
} from '@/lib/validate';

function maskConfig(config: any): any {
  if (!config) return config;
  const masked = { ...config };
  if (masked.password) masked.password = '***';
  return masked;
}

function maskPipeline(p: any): any {
  return {
    ...p,
    source: maskConfig(p.source),
    target: maskConfig(p.target),
  };
}

export async function GET() {
  try {
    const result = await query('SELECT * FROM pipelines ORDER BY created_at DESC');
    return NextResponse.json({
      data: result.rows.map(maskPipeline),
      total: result.rowCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Failed to fetch pipelines: ${err.message}`, code: 'PIPELINES_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

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

  // Resource limit: free tier max 5 pipelines
  const existingCount = await query('SELECT COUNT(*) as cnt FROM pipelines');
  const count = parseInt(existingCount.rows[0]?.cnt || '0');
  if (count >= 5) {
    return NextResponse.json(
      { error: 'Free tier limit reached (5 pipelines). Upgrade to Pro for unlimited.', code: 'LIMIT_REACHED' },
      { status: 403 }
    );
  }

  const { name, source, target, tables, config } = body;

  const errors = collectErrors(
    validateString(name, 'name', { maxLength: 100 }),
    validateRequiredObject(source, 'source', ['host', 'engine']),
    validateRequiredObject(target, 'target', ['host', 'engine']),
    validateArray(tables, 'tables'),
  );

  // Validate nested engine fields
  if (source && typeof source === 'object' && !Array.isArray(source)) {
    const sourceEngineErr = validateEngine(source.engine, 'source.engine');
    if (sourceEngineErr) errors.push(sourceEngineErr);
  }
  if (target && typeof target === 'object' && !Array.isArray(target)) {
    const targetEngineErr = validateEngine(target.engine, 'target.engine');
    if (targetEngineErr) errors.push(targetEngineErr);
  }

  if (errors.length > 0) {
    return validationErrorsResponse(errors);
  }

  const id = `pipeline-${Date.now()}`;

  try {
    // Use single JSONB param to avoid _pulsyn_exec parameter limit
    const pipelineData = JSON.stringify({
      id, name,
      source: source || {},
      target: target || {},
      tables: tables || [],
      config: config || {},
    });

    // Insert using JSONB extraction, then select back
    await query(
      `INSERT INTO pipelines (id, name, source, target, tables, config)
       SELECT p->>'id', p->>'name', (p->'source')::jsonb, (p->'target')::jsonb, (p->'tables')::jsonb, (p->'config')::jsonb
       FROM (SELECT $1::jsonb AS p) sub`,
      [pipelineData]
    );

    // Fetch the created pipeline
    const result = await query('SELECT * FROM pipelines WHERE id = $1', [id]);
    return NextResponse.json({ data: maskPipeline(result.rows[0]) }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: `Pipeline with name "${name}" already exists`, code: 'PIPELINE_ALREADY_EXISTS' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: `Failed to create pipeline: ${err.message}`, code: 'PIPELINE_CREATE_FAILED' },
      { status: 500 }
    );
  }
}
