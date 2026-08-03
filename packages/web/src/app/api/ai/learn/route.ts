// Self-Learning LLM API — Pulsyn AI that learns from pipeline behavior
// v2: Full self-learning engine with pattern recognition, anomaly detection, predictions
import { NextRequest, NextResponse } from 'next/server';
import { getLLM } from '@/lib/ai/self-learning-llm';

// GET /api/ai/learn — Get AI insights from pipeline data
export async function GET() {
  try {
    const llm = getLLM();

    // Run learning cycle
    const data = await llm.learn();

    // Generate insights
    const insights = await llm.generateInsights();

    // Get model status
    const status = llm.getStatus();

    return NextResponse.json({
      ai: {
        version: status.version,
        lastTrained: data.cdcEvents.totalEvents > 0 ? new Date().toISOString() : null,
        modelStatus: 'active',
        dataPoints: {
          connectors: data.connectors.reduce((sum, c) => sum + c.totalCount, 0),
          pipelines: data.pipelines.reduce((sum, p) => sum + p.count, 0),
          cdcEvents: data.cdcEvents.totalEvents,
          marketplaceConnectors: data.marketplace.topConnectors.length,
          feedbackEntries: data.feedback.length,
          anomaliesDetected: data.anomalies.length,
          predictionsGenerated: data.predictions.length,
          insightsGenerated: insights.length,
        },
        learning: {
          status: 'active',
          dataCollected: data.cdcEvents.totalEvents > 0,
          modelVersion: status.version,
          learningRate: status.learningRate,
          nextTraining: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          historySize: status.dataPoints,
        },
        insights: {
          connectorPerformance: data.connectors.map(c => ({
            engine: c.engine,
            total: c.totalCount,
            connected: c.connectedCount,
            errors: c.errorCount,
            successRate: c.successRate.toFixed(1) + '%',
          })),
          pipelineHealth: data.pipelines.map(p => ({
            status: p.status,
            count: p.count,
            avgAgeHours: p.avgAgeHours.toFixed(1),
          })),
          cdcPatterns: {
            totalEvents: data.cdcEvents.totalEvents,
            eventsPerHour: data.cdcEvents.eventsPerHour.toFixed(0),
            throughputTrend: data.cdcEvents.throughputTrend,
            peakHours: data.cdcEvents.peakHours,
            topTables: data.cdcEvents.topTables.slice(0, 5),
            operations: data.cdcEvents.operations,
          },
          marketplacePopularity: data.marketplace.topConnectors.slice(0, 5),
        },
        anomalies: data.anomalies,
        predictions: data.predictions,
        aiInsights: insights,
        recommendations: insights.flatMap(i => i.actionItems).slice(0, 10),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/ai/learn — Submit feedback for AI learning
export async function POST(req: NextRequest) {
  try {
    const { type, feedback, context, rating } = await req.json();

    const llm = getLLM();
    const feedbackId = `fb-${Date.now()}`;

    await llm.incorporateFeedback({
      id: feedbackId,
      type: type || 'general',
      feedback: feedback || '',
      context: context || '',
      rating: rating || 0,
      timestamp: new Date().toISOString(),
      incorporated: false
    });

    console.log(`[Pulsyn AI] Feedback incorporated: ${feedbackId}, type: ${type}, rating: ${rating}`);

    return NextResponse.json({
      data: {
        feedbackId,
        status: 'incorporated',
        message: 'Thank you! Your feedback has been incorporated into Pulsyn AI\'s learning pipeline.',
        impact: 'This feedback will influence future recommendations and insights.',
        nextCycle: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
