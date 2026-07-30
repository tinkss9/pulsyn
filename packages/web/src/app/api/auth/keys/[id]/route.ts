import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/auth/keys/[id] — list keys for organization
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const result = await query(
      `SELECT id, name, is_active, created_at, last_used_at, expires_at FROM api_keys WHERE organization_id = $1 ORDER BY created_at DESC`,
      [id]
    );
    return NextResponse.json({ data: result.rows });
  } catch (err) {
    console.error('[Auth] Key list error:', err);
    return NextResponse.json({ error: 'Failed to list API keys' }, { status: 500 });
  }
}

// DELETE /api/auth/keys/[id] — revoke API key
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await query('UPDATE api_keys SET is_active = false WHERE id = $1', [id]);
    return NextResponse.json({ message: 'API key revoked' });
  } catch (err) {
    console.error('[Auth] Key revocation error:', err);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
