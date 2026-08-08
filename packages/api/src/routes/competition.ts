// Pulsyn Competition Leaderboard Routes
// Public API for reading leaderboard data, authenticated API for submitting scores

import { Router, Request, Response } from 'express';
import { query } from '../db';

export const competitionRoutes = Router();

// GET /api/competition/leaderboard — public, no auth required
competitionRoutes.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;
    const country = req.query.country as string;
    const phase = req.query.phase as string;

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

    sql += ` ORDER BY score DESC, rows_per_sec DESC`;
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
    params.push(offset);
    sql += ` OFFSET $${params.length}`;

    const result = await query(sql, params);

    // Assign ranks
    const entries = result.rows.map((row: any, index: number) => ({
      rank: offset + index + 1,
      name: row.competitor_name,
      rowsPerSec: Number(row.rows_per_sec),
      score: Number(row.score),
      country: row.country_code,
      phase: row.phase,
      week: row.week,
      dataIntegrity: Number(row.data_integrity_pct),
      checkpointRecovery: Number(row.checkpoint_recovery_pct),
      maskingEfficiency: Number(row.masking_efficiency_pct),
      latencyP99: Number(row.latency_p99_ms),
      errorRate: Number(row.error_rate),
      sourceEngine: row.source_engine,
      targetEngine: row.target_engine,
      totalRows: Number(row.total_rows),
      durationMs: row.duration_ms,
      verified: row.verified,
      createdAt: row.created_at,
    }));

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
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0]?.total || '0');

    res.json({ data: entries, total, limit, offset });
  } catch (err) {
    console.error('[Competition] Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/competition/stats — public
competitionRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    const result = await query(
      `SELECT stat_key, stat_value FROM competition_stats`
    );

    const stats: Record<string, number> = {};
    for (const row of result.rows) {
      stats[row.stat_key] = Number(row.stat_value);
    }

    res.json({
      totalCompetitors: stats.total_competitors || 0,
      peakRowsPerSec: stats.peak_rows_per_sec || 0,
      totalCountries: stats.total_countries || 0,
      totalRowsReplicated: stats.total_rows_replicated || 0,
    });
  } catch (err) {
    console.error('[Competition] Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/competition/submit — submit a benchmark result
competitionRoutes.post('/submit', async (req: Request, res: Response) => {
  try {
    const {
      competitorName, email, countryCode,
      rowsPerSec, score, phase, week,
      dataIntegrityPct, checkpointRecoveryPct, maskingEfficiencyPct,
      latencyP99Ms, errorRate,
      sourceEngine, targetEngine, totalRows, durationMs,
      benchmarkRunId,
    } = req.body;

    if (!competitorName || rowsPerSec === undefined || score === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: competitorName, rowsPerSec, score',
      });
    }

    const result = await query(`
      INSERT INTO competition_leaderboard (
        competitor_name, email, country_code,
        rows_per_sec, score, phase, week,
        data_integrity_pct, checkpoint_recovery_pct, masking_efficiency_pct,
        latency_p99_ms, error_rate,
        source_engine, target_engine, total_rows, duration_ms,
        benchmark_run_id
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      RETURNING id
    `, [
      competitorName, email || null, countryCode || null,
      rowsPerSec, score, phase || 'qualifiers', week || 1,
      dataIntegrityPct || 100, checkpointRecoveryPct || 100, maskingEfficiencyPct || 100,
      latencyP99Ms || 0, errorRate || 0,
      sourceEngine || null, targetEngine || null, totalRows || 0, durationMs || 0,
      benchmarkRunId || null,
    ]);

    // Refresh stats
    await query(`SELECT refresh_competition_stats()`);

    res.json({ data: { id: result.rows[0]?.id } });
  } catch (err) {
    console.error('[Competition] Submit error:', err);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// GET /api/competition/countries — list of countries with competitor counts
competitionRoutes.get('/countries', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT country_code, COUNT(*) as count
      FROM competition_leaderboard
      WHERE NOT disqualified AND country_code IS NOT NULL
      GROUP BY country_code
      ORDER BY count DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    console.error('[Competition] Countries error:', err);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});
