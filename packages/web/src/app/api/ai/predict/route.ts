// Prediction API — Pulsyn AI Track C
// GET /api/ai/predict?metric=capacity&days=30
//     ?metric=performance&hours=24
//     ?metric=cost&months=3
//     ?metric=growth&days=90
//     ?metric=reliability
import { NextRequest, NextResponse } from 'next/server';
import { getPredictionEngine, type PredictionResult, type TimeSeriesPoint, type PipelineUsage } from '@/lib/ai/prediction-engine';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Require authentication
  const apiKey = req.headers.get('x-api-key') ?? req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!apiKey) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get('metric') || 'capacity';
    const engine = getPredictionEngine();

    let prediction: PredictionResult;

    switch (metric) {
      case 'capacity': {
        const days = parseInt(searchParams.get('days') || '30', 10);
        const history = await loadCapacityHistory();
        prediction = engine.forecastCapacity(history, days);
        break;
      }

      case 'performance': {
        const hours = parseInt(searchParams.get('hours') || '24', 10);
        const history = await loadPerformanceHistory();
        prediction = engine.forecastPerformance(history, hours);
        break;
      }

      case 'cost': {
        const pipelines = await loadPipelineUsage();
        prediction = engine.forecastCost(pipelines);
        break;
      }

      case 'growth': {
        const days = parseInt(searchParams.get('days') || '90', 10);
        const history = await loadGrowthHistory();
        prediction = engine.forecastGrowth(history, days);
        break;
      }

      case 'reliability': {
        const history = await loadErrorRateHistory();
        prediction = engine.predictFailure(history);
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown metric: ${metric}. Use: capacity, performance, cost, growth, reliability` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      predictions: [prediction],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- Data loaders (gracefully return empty on missing tables) ---

async function loadCapacityHistory(): Promise<TimeSeriesPoint[]> {
  try {
    const result = await query(`
      SELECT
        DATE(created_at) as day,
        COUNT(*) as count
      FROM connectors
      GROUP BY DATE(created_at)
      ORDER BY day ASC
      LIMIT 90
    `);
    return result.rows.map((r: any) => ({
      timestamp: r.day,
      value: parseInt(r.count),
    }));
  } catch {
    return [];
  }
}

async function loadPerformanceHistory(): Promise<TimeSeriesPoint[]> {
  try {
    const result = await query(`
      SELECT
        DATE_TRUNC('hour', changed_at) as hour,
        COUNT(*) as count
      FROM _pulsyn_changes
      WHERE changed_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('hour', changed_at)
      ORDER BY hour ASC
    `);
    return result.rows.map((r: any) => ({
      timestamp: r.hour,
      value: parseInt(r.count),
    }));
  } catch {
    return [];
  }
}

async function loadPipelineUsage(): Promise<PipelineUsage[]> {
  try {
    const result = await query(`
      SELECT
        id,
        COALESCE(array_length(tables, 1), 0) as tables_count,
        status,
        EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600 as hours_running
      FROM pipelines
    `);
    return result.rows.map((r: any) => ({
      id: r.id,
      tablesCount: parseInt(r.tables_count) || 0,
      eventsPerHour: 0, // would come from metrics in production
      hoursRunning: parseFloat(r.hours_running) || 0,
      status: r.status,
    }));
  } catch {
    return [];
  }
}

async function loadGrowthHistory(): Promise<TimeSeriesPoint[]> {
  try {
    const result = await query(`
      SELECT
        DATE(created_at) as day,
        COUNT(*) as count
      FROM connectors
      GROUP BY DATE(created_at)
      ORDER BY day ASC
    `);
    // Cumulative sum for growth curve
    let cumulative = 0;
    return result.rows.map((r: any) => {
      cumulative += parseInt(r.count);
      return { timestamp: r.day, value: cumulative };
    });
  } catch {
    return [];
  }
}

async function loadErrorRateHistory(): Promise<TimeSeriesPoint[]> {
  try {
    const result = await query(`
      SELECT
        DATE_TRUNC('hour', updated_at) as hour,
        COUNT(CASE WHEN status = 'error' THEN 1 END)::float / NULLIF(COUNT(*), 0) as error_rate
      FROM connectors
      WHERE updated_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('hour', updated_at)
      ORDER BY hour ASC
    `);
    return result.rows.map((r: any) => ({
      timestamp: r.hour,
      value: parseFloat(r.error_rate) || 0,
    }));
  } catch {
    return [];
  }
}
