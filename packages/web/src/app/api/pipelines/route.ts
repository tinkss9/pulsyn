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

  // Use JSONB approach to avoid 6-param limit
  const pipelineData = JSON.stringify({
    id, name,
    source: source || {},
    target: target || {},
    tables: tables || [],
    config: config || {},
  });

  const result = await query(
    `INSERT INTO pipelines (id, name, source, target, tables, config)
     SELECT p->>'id', p->>'name', (p->'source')::jsonb, (p->'target')::jsonb, (p->'tables')::jsonb, (p->'config')::jsonb
     FROM (SELECT $1::jsonb AS p) sub
     RETURNING *`,
    [pipelineData]
  );

  return NextResponse.json({ data: maskPipeline(result.rows[0]) }, { status: 201 });
}
