// Lab Access API — Live CDC demo with real data
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/lab/demo — Get live demo data with real CDC replication
export async function GET() {
  try {
    // Get lab pipeline
    const pipelines = await query(
      `SELECT id, name, status, source, target, tables, config, created_at
       FROM pipelines WHERE id LIKE 'lab-%' OR name LIKE '%Demo%' ORDER BY created_at DESC LIMIT 5`
    );

    // Get recent CDC events from lab tables
    const events = await query(
      `SELECT id, table_name, operation, row_data, changed_at
       FROM _pulsyn_changes WHERE table_name LIKE 'lab_%' ORDER BY id DESC LIMIT 10`
    );

    // Get live source data
    let labCustomers: any[] = [];
    let labOrders: any[] = [];
    let labProducts: any[] = [];
    try { labCustomers = (await query('SELECT * FROM lab_customers ORDER BY id')).rows; } catch {}
    try { labOrders = (await query('SELECT * FROM lab_orders ORDER BY id')).rows; } catch {}
    try { labProducts = (await query('SELECT * FROM lab_products ORDER BY id')).rows; } catch {}

    // Get replicated target data
    let analyticsCustomers: any[] = [];
    let analyticsOrders: any[] = [];
    try { analyticsCustomers = (await query('SELECT * FROM lab_customers_analytics ORDER BY id')).rows; } catch {}
    try { analyticsOrders = (await query('SELECT * FROM lab_orders_analytics ORDER BY id')).rows; } catch {}

    // Get CDC stats for lab tables
    let stats = { pending: 0, processed: 0, failed: 0 };
    try {
      const statsResult = await query(
        `SELECT 
           COUNT(CASE WHEN processed = FALSE AND retry_count < max_retries THEN 1 END) as pending,
           COUNT(CASE WHEN processed = TRUE THEN 1 END) as processed,
           COUNT(CASE WHEN processed = FALSE AND retry_count >= max_retries THEN 1 END) as failed
         FROM _pulsyn_changes WHERE table_name LIKE 'lab_%'`
      );
      if (statsResult.rowCount > 0) {
        stats = {
          pending: parseInt(statsResult.rows[0].pending) || 0,
          processed: parseInt(statsResult.rows[0].processed) || 0,
          failed: parseInt(statsResult.rows[0].failed) || 0,
        };
      }
    } catch {}

    // Get marketplace connectors (top 10 by downloads)
    const marketplace = await query(
      `SELECT id, name, engine, category, download_count, avg_rating
       FROM marketplace_connectors WHERE is_published = true ORDER BY download_count DESC LIMIT 10`
    );

    return NextResponse.json({
      demo: {
        pipelines: pipelines.rows.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          tables: p.tables,
          source: p.source?.engine || 'postgresql',
          target: p.target?.engine || 'postgresql',
        })),
        recentEvents: events.rows.map(e => ({
          id: e.id,
          table: e.table_name,
          operation: e.operation,
          data: e.row_data,
          timestamp: e.changed_at,
        })),
        cdcStats: stats,
        marketplace: marketplace.rows,
        liveData: {
          source: {
            customers: labCustomers,
            orders: labOrders,
            products: labProducts,
          },
          target: {
            customersAnalytics: analyticsCustomers,
            ordersAnalytics: analyticsOrders,
          },
        },
      },
      meta: {
        message: 'LIVE demo with real CDC replication. Source tables → _pulsyn_changes → target tables. Updates every 5 seconds via pg_cron.',
        pipeline: 'lab-demo-pipeline',
        howItWorks: [
          '1. Source tables (lab_customers, lab_orders, lab_products) have CDC triggers',
          '2. INSERT/UPDATE/DELETE captures changes to _pulsyn_changes',
          '3. pg_cron runs process_pulsyn_changes() every 5 seconds',
          '4. Changes replicated to target tables (lab_customers_analytics, lab_orders_analytics)',
          '5. This API shows both source and target data in real-time',
        ],
        tryIt: {
          insert: "INSERT INTO lab_customers (name, email, company, country) VALUES ('Test User', 'test@lab.io', 'Lab Co', 'US')",
          update: "UPDATE lab_customers SET company = 'Lab Corp' WHERE email = 'test@lab.io'",
          delete: "DELETE FROM lab_customers WHERE email = 'test@lab.io'",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
