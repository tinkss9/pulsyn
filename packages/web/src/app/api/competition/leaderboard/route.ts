import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);
  const offset = parseInt(searchParams.get('offset') || '0');
  const country = searchParams.get('country');
  const phase = searchParams.get('phase');
  const search = searchParams.get('search');

  try {
    // Build query
    let sql = `
      SELECT
        id, competitor_name, country_code, rows_per_sec, score,
        phase, week, data_integrity_pct, checkpoint_recovery_pct,
        masking_efficiency_pct, latency_p99_ms, error_rate,
        source_engine, target_engine, total_rows, duration_ms,
        verified, created_at
      FROM competition_leaderboard
      WHERE NOT disqualified
    `;
    const params: any[] = [];

    if (country) {
      params.push(country);
      sql += ` AND country_code = $${params.length}`;
    }
    if (phase) {
      params.push(phase);
      sql += ` AND phase = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND competitor_name ILIKE $${params.length}`;
    }

    sql += ` ORDER BY score DESC, rows_per_sec DESC`;
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM competition_leaderboard WHERE NOT disqualified`;
    const countParams: any[] = [];
    if (country) {
      countParams.push(country);
      countSql += ` AND country_code = $${countParams.length}`;
    }
    if (phase) {
      countParams.push(phase);
      countSql += ` AND phase = $${countParams.length}`;
    }
    if (search) {
      countParams.push(`%${search}%`);
      countSql += ` AND competitor_name ILIKE $${countParams.length}`;
    }
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get stats
    const statsResult = await query(`SELECT stat_key, stat_value FROM competition_stats`);
    const stats: Record<string, number> = {};
    for (const row of statsResult.rows) {
      stats[row.stat_key] = Number(row.stat_value);
    }

    // Format entries
    const entries = result.rows.map((row: any, index: number) => ({
      rank: offset + index + 1,
      id: row.id,
      name: row.competitor_name,
      rowsPerSec: Number(row.rows_per_sec),
      score: Number(row.score),
      country: row.country_code,
      phase: row.phase,
      week: row.week,
      metrics: {
        dataIntegrity: Number(row.data_integrity_pct),
        checkpointRecovery: Number(row.checkpoint_recovery_pct),
        maskingEfficiency: Number(row.masking_efficiency_pct),
      },
      latencyP99: Number(row.latency_p99_ms),
      errorRate: Number(row.error_rate),
      sourceEngine: row.source_engine,
      targetEngine: row.target_engine,
      totalRows: Number(row.total_rows),
      verified: row.verified,
      lastRun: row.created_at,
    }));

    return NextResponse.json({
      data: entries,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        updatedAt: new Date().toISOString(),
        week: 2,
        phase: 'Qualifiers',
        totalCompetitors: stats.total_competitors || 0,
        peakRowsPerSec: stats.peak_rows_per_sec || 0,
        totalCountries: stats.total_countries || 0,
        totalRowsReplicated: stats.total_rows_replicated || 0,
      },
    });
  } catch (err) {
    console.error('[Competition Leaderboard API] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}
