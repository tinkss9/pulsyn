// AI Chat API — Context-aware chat using Pulsyn's self-learning engine
import { NextRequest, NextResponse } from 'next/server';
import { getLLM } from '@/lib/ai/self-learning-llm';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    const llm = getLLM();
    const data = await llm.learn();
    const insights = await llm.generateInsights();

    const context = buildContext(data, insights);
    const response = generateResponse(message, context);

    // Return as streaming text
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const chunks = response.match(/.{1,80}/gs) ?? [response];
        let i = 0;

        function push() {
          if (i < chunks.length) {
            controller.enqueue(encoder.encode(chunks[i]));
            i++;
            setTimeout(push, 30);
          } else {
            controller.close();
          }
        }
        push();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function buildContext(data: any, insights: any[]): string {
  const parts: string[] = [];

  if (data.connectors?.length) {
    const summary = data.connectors
      .map((c: any) => `${c.engine}: ${c.connectedCount}/${c.totalCount} connected, ${c.successRate.toFixed(1)}% success`)
      .join('; ');
    parts.push(`Connectors: ${summary}`);
  }

  if (data.pipelines?.length) {
    const summary = data.pipelines
      .map((p: any) => `${p.status}: ${p.count} pipelines, avg ${p.avgAgeHours.toFixed(1)}h old`)
      .join('; ');
    parts.push(`Pipelines: ${summary}`);
  }

  if (data.cdcEvents) {
    parts.push(
      `CDC: ${data.cdcEvents.totalEvents} total events, ${data.cdcEvents.eventsPerHour.toFixed(0)}/hr, trend: ${data.cdcEvents.throughputTrend}`
    );
  }

  if (data.anomalies?.length) {
    parts.push(
      `Anomalies: ${data.anomalies.map((a: any) => `[${a.severity}] ${a.type}: ${a.description}`).join('; ')}`
    );
  }

  if (data.predictions?.length) {
    parts.push(
      `Predictions: ${data.predictions.map((p: any) => `${p.type}: ${p.prediction} (${(p.confidence * 100).toFixed(0)}%)`).join('; ')}`
    );
  }

  if (insights?.length) {
    parts.push(
      `Insights: ${insights.slice(0, 5).map((i: any) => `${i.title}: ${i.description}`).join('; ')}`
    );
  }

  return parts.join('\n');
}

function generateResponse(question: string, context: string): string {
  const q = question.toLowerCase();

  // Parse context for relevant data
  const connectorMatch = context.match(/Connectors: (.+)/);
  const pipelineMatch = context.match(/Pipelines: (.+)/);
  const cdcMatch = context.match(/CDC: (.+)/);
  const anomalyMatch = context.match(/Anomalies: (.+)/);
  const predictionMatch = context.match(/Predictions: (.+)/);
  const insightMatch = context.match(/Insights: (.+)/);

  if (q.includes('bottleneck') || q.includes('slow') || q.includes('lag') || q.includes('performance')) {
    const parts = ['Based on your current pipeline data:\n'];
    if (cdcMatch) parts.push(`**CDC Activity:** ${cdcMatch[1]}`);
    if (pipelineMatch) parts.push(`**Pipeline Health:** ${pipelineMatch[1]}`);
    if (anomalyMatch) parts.push(`**Active Anomalies:** ${anomalyMatch[1]}`);
    parts.push('\nRecommendations:\n- Monitor pipeline throughput trends\n- Check connector error rates for degradation\n- Review checkpoint intervals for optimal recovery');
    return parts.join('\n');
  }

  if (q.includes('connector') || q.includes('health') || q.includes('success rate')) {
    if (connectorMatch) {
      return `**Connector Health Status:**\n\n${connectorMatch[1]}\n\nTips:\n- Check error logs for failing connectors\n- Verify network connectivity to source/target databases\n- Review connection pool settings`;
    }
    return 'No connector data available yet. Create some connectors to see health status.';
  }

  if (q.includes('predict') || q.includes('capacity') || q.includes('storage') || q.includes('future') || q.includes('next month')) {
    if (predictionMatch) {
      return `**AI Predictions:**\n\n${predictionMatch[1]}\n\nThese predictions are based on your historical usage patterns. Confidence levels indicate the certainty of each prediction.`;
    }
    return 'Not enough historical data for predictions yet. Continue using Pulsyn to build prediction models. We typically need 7+ days of pipeline activity.';
  }

  if (q.includes('anomal') || q.includes('alert') || q.includes('issue') || q.includes('concern') || q.includes('security')) {
    if (anomalyMatch) {
      return `**Detected Anomalies:**\n\n${anomalyMatch[1]}\n\nEach anomaly includes a suggested action. Address critical and high-severity items first.`;
    }
    return 'No anomalies detected. Your system is running within normal parameters. The AI continuously monitors for unusual patterns.';
  }

  if (q.includes('optim') || q.includes('improve') || q.includes('recommend') || q.includes('suggest') || q.includes('better')) {
    const parts = ['**Optimization Recommendations:**\n'];
    if (insightMatch) parts.push(insightMatch[1]);
    parts.push('\nGeneral best practices:\n- Use batch processing for high-volume tables\n- Set checkpoint intervals based on your SLA requirements\n- Monitor connector success rates and auto-retry on transient failures\n- Use masking rules for sensitive columns');
    return parts.join('\n');
  }

  if (q.includes('repl') || q.includes('lag') || q.includes('cdc') || q.includes('event')) {
    if (cdcMatch) {
      return `**CDC Replication Status:**\n\n${cdcMatch[1]}\n\nTips for reducing lag:\n- Increase batch size for high-volume tables\n- Use parallel replication for independent tables\n- Check source database WAL/binlog settings`;
    }
    return 'No CDC event data available. Create a pipeline and start replication to see event metrics.';
  }

  // Default response with full context summary
  const parts = ['Here is a summary of your Pulsyn system:\n'];
  if (connectorMatch) parts.push(`**Connectors:** ${connectorMatch[1]}`);
  if (pipelineMatch) parts.push(`**Pipelines:** ${pipelineMatch[1]}`);
  if (cdcMatch) parts.push(`**CDC Events:** ${cdcMatch[1]}`);
  if (anomalyMatch) parts.push(`**Anomalies:** ${anomalyMatch[1]}`);
  if (predictionMatch) parts.push(`**Predictions:** ${predictionMatch[1]}`);
  parts.push('\nAsk me about connectors, pipelines, CDC events, anomalies, predictions, or optimization recommendations for more details.');
  return parts.join('\n');
}
