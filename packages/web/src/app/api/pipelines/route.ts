import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

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
  const result = await query('SELECT * FROM pipelines ORDER BY created_at DESC');
  return NextResponse.json({
    data: result.rows.map(maskPipeline),
    total: result.rowCount,
  });
}

export async function POST(req: NextRequest) {
  const { name, source, target, tables, config } = await req.json();
  const id = `pipeline-${Date.now()}`;

  const result = await query(
    `INSERT INTO pipelines (id, name, source, target, tables, config)
     VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb) RETURNING *`,
    [id, name, JSON.stringify(source), JSON.stringify(target), JSON.stringify(tables || []), JSON.stringify(config || {})]
  );

  return NextResponse.json({ data: result.rows[0] }, { status: 201 });
}
