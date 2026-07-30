import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ pipelineId: string }> }) {
  const { pipelineId } = await params;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '100');

  const pipelineResult = await query('SELECT id FROM pipelines WHERE id = $1', [pipelineId]);
  if (pipelineResult.rowCount === 0) {
    return NextResponse.json({ error: 'Pipeline not found' }, { status: 404 });
  }

  try {
    const changesResult = await query(
      `SELECT id, table_name, operation, row_data, old_data, changed_at FROM _pulsyn_changes ORDER BY id DESC LIMIT $1`,
      [limit]
    );
    return NextResponse.json({
      data: changesResult.rows.map(row => ({
        id: row.id, table: row.table_name, operation: row.operation,
        data: row.row_data, oldData: row.old_data, timestamp: row.changed_at,
      })),
    });
  } catch {
    return NextResponse.json({ data: [], message: 'Change tracking not configured' });
  }
}
