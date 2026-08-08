import { query } from '@/lib/db';
import LeaderboardClient from './LeaderboardClient';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  let entries: any[] = [];
  let stats = { totalCompetitors: 0, peakRowsPerSec: 0, totalCountries: 0, totalRowsReplicated: 0 };
  let error: string | null = null;

  try {
    // Fetch leaderboard data directly from Supabase
    const result = await query(`
      SELECT
        id, competitor_name, country_code, rows_per_sec, score,
        phase, week, data_integrity_pct, checkpoint_recovery_pct,
        masking_efficiency_pct, latency_p99_ms, error_rate,
        source_engine, target_engine, total_rows, duration_ms,
        verified, created_at
      FROM competition_leaderboard
      WHERE NOT disqualified
      ORDER BY score DESC, rows_per_sec DESC
      LIMIT 100
    `);

    entries = result.rows.map((row: any, index: number) => ({
      rank: index + 1,
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

    // Fetch stats
    const statsResult = await query(`SELECT stat_key, stat_value FROM competition_stats`);
    const statsMap: Record<string, number> = {};
    for (const row of statsResult.rows) {
      statsMap[row.stat_key] = Number(row.stat_value);
    }
    stats = {
      totalCompetitors: statsMap.total_competitors || 0,
      peakRowsPerSec: statsMap.peak_rows_per_sec || 0,
      totalCountries: statsMap.total_countries || 0,
      totalRowsReplicated: statsMap.total_rows_replicated || 0,
    };
  } catch (err: any) {
    console.error('[Leaderboard] Failed to fetch data:', err);
    error = err.message || 'Failed to load leaderboard data';
  }

  return <LeaderboardClient initialEntries={entries} initialStats={stats} error={error} />;
}
