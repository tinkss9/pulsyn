// Marketplace API — List, get, publish, install connectors
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/marketplace — List published connectors
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category');
  const search = req.nextUrl.searchParams.get('q');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

  let sql = `SELECT id, name, slug, description, engine, category, icon_url, version,
              is_verified, download_count, avg_rating, rating_count, price_cents, created_at
             FROM marketplace_connectors WHERE is_published = true`;
  const params: any[] = [];

  if (category) {
    params.push(category);
    sql += ` AND category = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    sql += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  sql += ` ORDER BY is_verified DESC, download_count DESC, avg_rating DESC`;
  params.push(limit);
  sql += ` LIMIT $${params.length}`;
  params.push(offset);
  sql += ` OFFSET $${params.length}`;

  const result = await query(sql, params);
  return NextResponse.json({ data: result.rows, total: result.rowCount });
}
