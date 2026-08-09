import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { competitionRuns } from '../../state';

// Inline scoring to avoid @pulsyn/core import (not built on Vercel)
interface CompetitionMetrics {
  throughput: { rowsPerSecond: number };
  latency: { p99Ms: number; p50Ms: number };
  correctness: { dataIntegrity: number; eventOrdering: number };
}

function calculateCompetitionScore(metrics: CompetitionMetrics) {
  const weights = { throughput: 0.4, latency: 0.3, correctness: 0.3 };

  // Throughput: log scale, 100 rows/s = 0, 500K rows/s = 100
  const throughputScore = Math.min(100,
    Math.max(0, (Math.log10(Math.max(1, metrics.throughput.rowsPerSecond)) - 2) / (Math.log10(500000) - 2)) * 100
  );

  // Latency: linear, 0.1ms = 100, 5000ms = 0
  const latencyScore = Math.min(100,
    Math.max(0, ((5000 - metrics.latency.p99Ms) / 5000) * 100)
  );

  // Correctness: exponential penalty below 100%
  const avgCorrectness = (metrics.correctness.dataIntegrity + metrics.correctness.eventOrdering) / 2;
  const correctnessScore = avgCorrectness >= 100 ? 100 :
    avgCorrectness >= 99.9 ? 95 :
    avgCorrectness >= 99 ? 80 :
    Math.max(0, avgCorrectness * 0.8);

  const overallScore = Math.round(
    throughputScore * weights.throughput +
    latencyScore * weights.latency +
    correctnessScore * weights.correctness
  );

  const tier = overallScore >= 90 ? 'platinum' :
    overallScore >= 75 ? 'gold' :
    overallScore >= 60 ? 'silver' :
    overallScore >= 40 ? 'bronze' : 'uncertified';

  return { overallScore, throughputScore: Math.round(throughputScore), latencyScore: Math.round(latencyScore), correctnessScore: Math.round(correctnessScore), tier };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params;

    const run = competitionRuns.get(runId);
    if (!run) {
      return NextResponse.json(
        { error: 'Competition run not found' },
        { status: 404 }
      );
    }

    // If completed, load results and calculate score
    if (run.status === 'completed' && run.resultsFile && existsSync(run.resultsFile)) {
      const resultsData = JSON.parse(readFileSync(run.resultsFile, 'utf-8'));
      const metrics: CompetitionMetrics = resultsData.metrics || resultsData;
      const score = calculateCompetitionScore(metrics);

      return NextResponse.json({
        success: true,
        data: {
          ...run,
          metrics,
          score,
        },
      });
    }

    // Return current status
    return NextResponse.json({
      success: true,
      data: {
        runId: run.runId,
        competitorId: run.competitorId,
        status: run.status,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
        error: run.error,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get competition status' },
      { status: 500 }
    );
  }
}
