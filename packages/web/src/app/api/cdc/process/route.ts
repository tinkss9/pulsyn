import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/cdc/process — Process pending CDC changes
// Call this via cron or manually to replicate changes from source to target
export async function POST() {
  try {
    const result = await query('SELECT * FROM process_pulsyn_changes()');
    const stats = result.rows[0] || {};

    return NextResponse.json({
      data: {
        processed: parseInt(String(stats.processed_count)) || 0,
        errors: parseInt(String(stats.error_count)) || 0,
        skipped: parseInt(String(stats.skipped_count)) || 0,
        errorDetails: stats.error_details || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Process failed: ${error.message}` },
      { status: 500 }
    );
  }
}
