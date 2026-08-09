import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  validateString,
  validateEngine,
  validateRequiredObject,
  collectErrors,
  validationErrorsResponse,
} from '@/lib/validate';

export async function GET() {
  try {
    const result = await query(
      'SELECT id, name, engine, status, created_at, updated_at FROM connectors ORDER BY created_at DESC'
    );
    return NextResponse.json({ data: result.rows, total: result.rowCount });
  } catch (err: any) {
    console.error('[Connectors] Fetch error:', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch connectors', code: 'CONNECTORS_FETCH_FAILED' },
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

  // Resource limit: free tier max 3 connectors
  const existingCount = await query('SELECT COUNT(*) as cnt FROM connectors');
  const count = parseInt(existingCount.rows[0]?.cnt || '0');
  if (count >= 3) {
    return NextResponse.json(
      { error: 'Free tier limit reached (3 connectors). Upgrade to Pro for unlimited.', code: 'LIMIT_REACHED' },
      { status: 403 }
    );
  }

  const { name, engine, config } = body;

  const errors = collectErrors(
    validateString(name, 'name', { maxLength: 100 }),
    validateEngine(engine),
    validateRequiredObject(config, 'config'),
  );

  if (errors.length > 0) {
    return validationErrorsResponse(errors);
  }

  const id = `connector-${Date.now()}`;

  try {
    const result = await query(
      `INSERT INTO connectors (id, name, engine, config) VALUES ($1, $2, $3, $4::jsonb) RETURNING *`,
      [id, name, engine, JSON.stringify(config)]
    );

    const connector = result.rows[0];
    if (connector.config?.password) {
      connector.config = { ...connector.config, password: '***' };
    }
    return NextResponse.json({ data: connector }, { status: 201 });
  } catch (err: any) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: `Connector "${name}" already exists`, code: 'CONNECTOR_ALREADY_EXISTS' },
        { status: 409 }
      );
    }
    console.error('[Connectors] Create error:', err.message);
    return NextResponse.json(
      { error: 'Failed to create connector', code: 'CONNECTOR_CREATE_FAILED' },
      { status: 500 }
    );
  }
}
