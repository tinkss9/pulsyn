// Lab Access API — Pre-seeded demo environment for prospects
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/lab/demo — Get demo data (pipelines, connectors, CDC events)
export async function GET() {
  try {
    // Get demo pipelines
    const pipelines = await query(
      `SELECT id, name, status, source, target, tables, config, created_at
       FROM pipelines ORDER BY created_at DESC LIMIT 5`
    );

    // Get demo connectors
    const connectors = await query(
      `SELECT id, name, engine, status, created_at
       FROM connectors ORDER BY created_at DESC LIMIT 5`
    );

    // Get recent CDC events
    const events = await query(
      `SELECT id, table_name, operation, row_data, changed_at
       FROM _pulsyn_changes ORDER BY id DESC LIMIT 10`
    );

    // Get CDC stats
    let stats = { pending: 0, processed: 0, failed: 0 };
    try {
      const statsResult = await query(
        `SELECT 
           COUNT(CASE WHEN processed = FALSE AND retry_count < max_retries THEN 1 END) as pending,
           COUNT(CASE WHEN processed = TRUE THEN 1 END) as processed,
           COUNT(CASE WHEN processed = FALSE AND retry_count >= max_retries THEN 1 END) as failed
         FROM _pulsyn_changes`
      );
      if (statsResult.rowCount > 0) {
        stats = {
          pending: parseInt(statsResult.rows[0].pending) || 0,
          processed: parseInt(statsResult.rows[0].processed) || 0,
          failed: parseInt(statsResult.rows[0].failed) || 0,
        };
      }
    } catch { /* table may not exist */ }

    // Get marketplace connectors
    const marketplace = await query(
      `SELECT id, name, engine, category, download_count, avg_rating
       FROM marketplace_connectors WHERE is_published = true LIMIT 6`
    );

    return NextResponse.json({
      demo: {
        pipelines: pipelines.rows.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          tables: p.tables,
          source: p.source?.engine || 'unknown',
          target: p.target?.engine || 'unknown',
        })),
        connectors: connectors.rows,
        recentEvents: events.rows.map(e => ({
          id: e.id,
          table: e.table_name,
          operation: e.operation,
          data: e.row_data,
          timestamp: e.changed_at,
        })),
        cdcStats: stats,
        marketplace: marketplace.rows,
      },
      meta: {
        message: 'This is a live demo environment. Data refreshes every 5 seconds via pg_cron.',
        docs: 'https://pulsynai.com/docs',
        api: 'https://pulsynai.com/api',
        mcp: 'https://pulsynai.com/mcp/templates',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
