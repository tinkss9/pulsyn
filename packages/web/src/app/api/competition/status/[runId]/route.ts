import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { calculateCompetitionScore } from '@pulsyn/core';
import type { CompetitionMetrics } from '@pulsyn/core';

// Shared run store (imported from start endpoint — in production, use a database)
// For now, maintain a local mirror that the start endpoint populates
const runs: Map<string, {
  runId: string;
  competitorId: string;
  status: 'pending' | 'starting' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  resultsFile?: string;
  error?: string;
}> = new Map();

// Import shared runs from start endpoint
try {
  const startModule = await import('../start/route');
  if (startModule.runs) {
    for (const [key, value] of startModule.runs) {
      runs.set(key, value);
    }
  }
} catch {
  // Module not loaded yet — runs will be empty until populated
}

interface RouteParams {
  params: Promise<{ runId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { runId } = await params;

  const run = runs.get(runId);
  if (!run) {
    return NextResponse.json(
      { error: 'Run not found', runId },
      { status: 404 }
    );
  }

  // Build base response
  const response: Record<string, unknown> = {
    runId: run.runId,
    competitorId: run.competitorId,
    status: run.status,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    elapsedMs: Date.now() - new Date(run.startedAt).getTime(),
  };

  // If completed, try to load and score results
  if (run.status === 'completed' && run.resultsFile && existsSync(run.resultsFile)) {
    try {
      const raw = readFileSync(run.resultsFile, 'utf-8');
      const results = JSON.parse(raw);

      const metrics: CompetitionMetrics = {
        replicateRowsPerSecond: results.metrics?.replicateRowsPerSecond || 0,
        avgLatencyMs: results.metrics?.avgLatencyMs || 0,
        correctnessPercent: results.metrics?.correctnessPercent || 0,
        totalRows: results.metrics?.totalRows || results.config?.totalRows,
        replicateDurationMs: results.metrics?.replicateDurationMs,
        sourceRowCount: results.metrics?.sourceRowCount,
        targetRowCount: results.metrics?.targetRowCount,
        matchedRowCount: results.metrics?.matchedRowCount,
      };

      const score = calculateCompetitionScore(metrics);

      response.results = {
        metrics,
        score: {
          overall: score.overallScore,
          throughput: score.throughputScore,
          latency: score.latencyScore,
          correctness: score.correctnessScore,
          tier: score.tier,
          breakdown: score.breakdown,
        },
        config: results.config,
      };
    } catch (err) {
      response.resultsError = 'Failed to parse results file';
    }
  }

  // If failed, include error
  if (run.status === 'failed' && run.error) {
    response.error = run.error;
  }

  // Estimate progress for running status
  if (run.status === 'running') {
    const elapsed = Date.now() - new Date(run.startedAt).getTime();
    const estimatedDuration = 300_000; // 5 min default
    response.progress = Math.min(95, Math.round((elapsed / estimatedDuration) * 100));
  }

  return NextResponse.json(response);
}
