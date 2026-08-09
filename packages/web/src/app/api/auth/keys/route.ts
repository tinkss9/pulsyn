import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

// POST /api/auth/keys — create a new API key (authenticated)
export async function POST(req: NextRequest) {
  const { name } = await req.json();

  // Get API key from header
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = req.headers.get('x-api-key') || bearerKey;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  try {
    // Look up organization by API key (ownership verification)
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyResult = await query(
      `SELECT organization_id FROM api_keys WHERE key_hash = $1 AND is_active = true`,
      [keyHash]
    );

    if (keyResult.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const organizationId = keyResult.rows[0].organization_id;
    const newApiKey = `pulsyn_${crypto.randomBytes(32).toString('hex')}`;
    const newKeyHash = crypto.createHash('sha256').update(newApiKey).digest('hex');
    const keyId = `key-${crypto.randomUUID()}`;

    await query(
      `INSERT INTO api_keys (id, organization_id, key_hash, name, is_active, created_at) VALUES ($1, $2, $3, $4, true, NOW())`,
      [keyId, organizationId, newKeyHash, name || 'API Key']
    );

    return NextResponse.json({
      data: { keyId, apiKey: newApiKey, name: name || 'API Key', message: 'Save your API key — it cannot be retrieved later.' },
    }, { status: 201 });
  } catch (err) {
    console.error('[Auth] Key generation error:', err);
    return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 });
  }
}

// GET /api/auth/keys — list API keys (authenticated)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = req.headers.get('x-api-key') || bearerKey;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  try {
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const keyResult = await query(
      `SELECT organization_id FROM api_keys WHERE key_hash = $1 AND is_active = true`,
      [keyHash]
    );

    if (keyResult.rowCount === 0) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const organizationId = keyResult.rows[0].organization_id;
    const keys = await query(
      `SELECT id, name, is_active, created_at FROM api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [organizationId]
    );

    return NextResponse.json({ data: keys.rows });
  } catch (err) {
    console.error('[Auth] Key list error:', err);
    return NextResponse.json({ error: 'Failed to list API keys' }, { status: 500 });
  }
}
