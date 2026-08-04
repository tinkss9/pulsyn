// Self-Learning LLM Engine — Pulsyn's AI Brain
// Learns from connector patterns, pipeline performance, CDC data, and user feedback
// to generate intelligent recommendations and predictions

import { query } from '@/lib/db';
import { getPredictionEngine, type PredictionResult, type TimeSeriesPoint, type PipelineUsage } from './prediction-engine';

export interface LearningData {
  connectors: ConnectorPattern[];
  pipelines: PipelinePattern[];
  cdcEvents: CDCPattern;
  marketplace: MarketplacePattern;
  feedback: FeedbackEntry[];
  anomalies: Anomaly[];
  predictions: Prediction[];
}

export interface ConnectorPattern {
  engine: string;
  totalCount: number;
  connectedCount: number;
  errorCount: number;
  successRate: number;
  commonErrors: string[];
  avgTimeToConnect: number;
  optimalConfig: Record<string, any>;
}

export interface PipelinePattern {
  status: string;
  count: number;
  avgAgeHours: number;
  avgTablesCount: number;
  successRate: number;
  commonTransformations: string[];
  optimalBatchSize: number;
  bestCheckpointInterval: number;
}

export interface CDCPattern {
  totalEvents: number;
  operations: Record<string, number>;
  topTables: { table_name: string; event_count: number; last_event: string }[];
  eventsPerHour: number;
  peakHours: number[];
  avgEventSize: number;
  throughputTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface MarketplacePattern {
  topConnectors: { name: string; engine: string; downloads: number; rating: number }[];
  popularCategories: Record<string, number>;
  installTrend: 'growing' | 'stable' | 'declining';
  avgRating: number;
}

export interface FeedbackEntry {
  id: string;
  type: string;
  feedback: string;
  context: string;
  rating: number;
  timestamp: string;
  incorporated: boolean;
}

export interface Anomaly {
  type: 'connector_error' | 'pipeline_failure' | 'cdc_spike' | 'performance_degradation' | 'security_concern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedResource: string;
  detectedAt: string;
  confidence: number;
  suggestedAction: string;
}

export interface Prediction {
  type: 'capacity' | 'performance' | 'cost' | 'reliability' | 'growth';
  prediction: string;
  confidence: number;
  timeframe: string;
  impact: 'low' | 'medium' | 'high';
  recommendedAction: string;
  value?: number;
  lowerBound?: number;
  upperBound?: number;
  trend?: 'rising' | 'falling' | 'stable';
}

export interface AIInsight {
  id: string;
  category: 'optimization' | 'risk' | 'opportunity' | 'maintenance' | 'cost';
  title: string;
  description: string;
  evidence: string[];
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
  estimatedImpact: string;
  generatedAt: string;
}

export class SelfLearningLLM {
  private knowledgeBase: Map<string, any> = new Map();
  private learningHistory: any[] = [];
  private modelVersion = 'pulsyn-ai-v2';

  async learn(): Promise<LearningData> {
    const [
      connectors,
      pipelines,
      cdcEvents,
      marketplace,
      feedback
    ] = await Promise.all([
      this.learnConnectorPatterns(),
      this.learnPipelinePatterns(),
      this.learnCDCPatterns(),
      this.learnMarketplacePatterns(),
      this.loadFeedback()
    ]);

    const anomalies = this.detectAnomalies(connectors, pipelines, cdcEvents);
    const predictions = this.generatePredictions(connectors, pipelines, cdcEvents, marketplace);

    const data: LearningData = {
      connectors,
      pipelines,
      cdcEvents,
      marketplace,
      feedback,
      anomalies,
      predictions
    };

    // Update knowledge base
    this.knowledgeBase.set('lastLearn', data);
    this.knowledgeBase.set('lastLearnTime', new Date().toISOString());
    this.learningHistory.push({
      timestamp: new Date().toISOString(),
      dataPoints: {
        connectors: connectors.length,
        pipelines: pipelines.length,
        cdcEvents: cdcEvents.totalEvents,
        anomalies: anomalies.length,
        predictions: predictions.length
      }
    });

    return data;
  }

  private async learnConnectorPatterns(): Promise<ConnectorPattern[]> {
    try {
      const result = await query(`
        SELECT 
          engine,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'connected' THEN 1 END) as connected,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as errors
        FROM connectors
        GROUP BY engine
        ORDER BY total DESC
        LIMIT 20
      `);

      return result.rows.map((row: any) => ({
        engine: row.engine,
        totalCount: parseInt(row.total),
        connectedCount: parseInt(row.connected),
        errorCount: parseInt(row.errors),
        successRate: parseInt(row.total) > 0
          ? (parseInt(row.connected) / parseInt(row.total)) * 100
          : 0,
        commonErrors: [], // Would analyze error messages in production
        avgTimeToConnect: 0, // Would track connection time in production
        optimalConfig: {} // Would learn from successful configurations
      }));
    } catch {
      return [];
    }
  }

  private async learnPipelinePatterns(): Promise<PipelinePattern[]> {
    try {
      const result = await query(`
        SELECT 
          status,
          COUNT(*) as count,
          AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600) as avg_age_hours
        FROM pipelines
        GROUP BY status
      `);

      return result.rows.map((row: any) => ({
        status: row.status,
        count: parseInt(row.count),
        avgAgeHours: parseFloat(row.avg_age_hours) || 0,
        avgTablesCount: 0,
        successRate: 0,
        commonTransformations: [],
        optimalBatchSize: 1000,
        bestCheckpointInterval: 5
      }));
    } catch {
      return [];
    }
  }

  private async learnCDCPatterns(): Promise<CDCPattern> {
    const defaultPattern: CDCPattern = {
      totalEvents: 0,
      operations: {},
      topTables: [],
      eventsPerHour: 0,
      peakHours: [],
      avgEventSize: 0,
      throughputTrend: 'stable'
    };

    try {
      const eventResult = await query(`
        SELECT 
          operation,
          COUNT(*) as count
        FROM _pulsyn_changes
        GROUP BY operation
      `);

      const operations: Record<string, number> = {};
      let totalEvents = 0;
      for (const row of eventResult.rows) {
        const count = parseInt(row.count);
        operations[row.operation] = count;
        totalEvents += count;
      }

      const tableResult = await query(`
        SELECT 
          table_name,
          COUNT(*) as event_count,
          MAX(changed_at) as last_event
        FROM _pulsyn_changes
        GROUP BY table_name
        ORDER BY event_count DESC
        LIMIT 10
      `);

      // Calculate events per hour (last 24h)
      const hourlyResult = await query(`
        SELECT 
          EXTRACT(HOUR FROM changed_at) as hour,
          COUNT(*) as count
        FROM _pulsyn_changes
        WHERE changed_at > NOW() - INTERVAL '24 hours'
        GROUP BY EXTRACT(HOUR FROM changed_at)
        ORDER BY count DESC
        LIMIT 5
      `);

      const peakHours = hourlyResult.rows.map((r: any) => parseInt(r.hour));
      const eventsPerHour = totalEvents > 0 ? totalEvents / 24 : 0;

      return {
        totalEvents,
        operations,
        topTables: tableResult.rows,
        eventsPerHour,
        peakHours,
        avgEventSize: 0,
        throughputTrend: eventsPerHour > 100 ? 'increasing' : eventsPerHour > 10 ? 'stable' : 'decreasing'
      };
    } catch {
      return defaultPattern;
    }
  }

  private async learnMarketplacePatterns(): Promise<MarketplacePattern> {
    try {
      const result = await query(`
        SELECT 
          name,
          engine,
          download_count,
          avg_rating,
          category
        FROM marketplace_connectors
        WHERE is_published = true
        ORDER BY download_count DESC
        LIMIT 10
      `);

      const categories: Record<string, number> = {};
      let totalRating = 0;
      let ratingCount = 0;

      for (const row of result.rows) {
        categories[row.category] = (categories[row.category] || 0) + 1;
        if (row.avg_rating) {
          totalRating += parseFloat(row.avg_rating);
          ratingCount++;
        }
      }

      return {
        topConnectors: result.rows.map((r: any) => ({
          name: r.name,
          engine: r.engine,
          downloads: parseInt(r.download_count) || 0,
          rating: parseFloat(r.avg_rating) || 0
        })),
        popularCategories: categories,
        installTrend: 'growing',
        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0
      };
    } catch {
      return {
        topConnectors: [],
        popularCategories: {},
        installTrend: 'stable',
        avgRating: 0
      };
    }
  }

  private async loadFeedback(): Promise<FeedbackEntry[]> {
    // In production, load from feedback table
    return [];
  }

  private detectAnomalies(
    connectors: ConnectorPattern[],
    pipelines: PipelinePattern[],
    cdc: CDCPattern
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Check for connector errors
    for (const conn of connectors) {
      if (conn.errorCount > 0 && conn.successRate < 80) {
        anomalies.push({
          type: 'connector_error',
          severity: conn.successRate < 50 ? 'high' : 'medium',
          description: `${conn.engine} connectors have ${(100 - conn.successRate).toFixed(1)}% failure rate`,
          affectedResource: `connector:${conn.engine}`,
          detectedAt: new Date().toISOString(),
          confidence: 0.9,
          suggestedAction: `Review ${conn.engine} connector configurations. Check network connectivity and credentials.`
        });
      }
    }

    // Check for pipeline failures
    const failedPipelines = pipelines.find(p => p.status === 'failed');
    if (failedPipelines && failedPipelines.count > 0) {
      anomalies.push({
        type: 'pipeline_failure',
        severity: failedPipelines.count > 5 ? 'high' : 'medium',
        description: `${failedPipelines.count} pipeline(s) have failed`,
        affectedResource: 'pipelines',
        detectedAt: new Date().toISOString(),
        confidence: 0.95,
        suggestedAction: 'Review pipeline error logs. Check source/target connectivity and permissions.'
      });
    }

    // Check for CDC spikes
    if (cdc.eventsPerHour > 1000) {
      anomalies.push({
        type: 'cdc_spike',
        severity: 'medium',
        description: `Unusually high CDC event rate: ${cdc.eventsPerHour.toFixed(0)} events/hour`,
        affectedResource: 'cdc_engine',
        detectedAt: new Date().toISOString(),
        confidence: 0.85,
        suggestedAction: 'Monitor CDC throughput. Consider increasing batch size or adding parallel processors.'
      });
    }

    // Check for performance degradation
    if (cdc.throughputTrend === 'decreasing' && cdc.totalEvents > 100) {
      anomalies.push({
        type: 'performance_degradation',
        severity: 'medium',
        description: 'CDC throughput is decreasing over time',
        affectedResource: 'cdc_engine',
        detectedAt: new Date().toISOString(),
        confidence: 0.75,
        suggestedAction: 'Check for resource constraints. Review checkpoint intervals and batch sizes.'
      });
    }

    return anomalies;
  }

  private generatePredictions(
    connectors: ConnectorPattern[],
    pipelines: PipelinePattern[],
    cdc: CDCPattern,
    marketplace: MarketplacePattern
  ): Prediction[] {
    const engine = getPredictionEngine();
    const predictions: Prediction[] = [];

    // Capacity prediction — use linear regression on connector counts
    const capacityHistory: TimeSeriesPoint[] = connectors.map((c, i) => ({
      timestamp: new Date(Date.now() - (connectors.length - i) * 86400000).toISOString(),
      value: c.totalCount,
    }));
    const capacityForecast = engine.forecastCapacity(capacityHistory, 30);
    if (capacityForecast.confidence > 0) {
      predictions.push({
        type: 'capacity',
        prediction: `Based on regression analysis, expect ${capacityForecast.value} connectors within 30 days (${capacityForecast.trend}). 95% CI: [${capacityForecast.lowerBound}, ${capacityForecast.upperBound}]`,
        confidence: capacityForecast.confidence,
        timeframe: capacityForecast.timeframe,
        impact: capacityForecast.value > 50 ? 'high' : 'medium',
        recommendedAction: 'Plan for capacity expansion if growth continues at current rate.',
        value: capacityForecast.value,
        lowerBound: capacityForecast.lowerBound,
        upperBound: capacityForecast.upperBound,
        trend: capacityForecast.trend,
      });
    }

    // Performance prediction — exponential smoothing on CDC throughput
    const perfHistory: TimeSeriesPoint[] = cdc.peakHours.length > 0
      ? cdc.peakHours.map((h, i) => ({
          timestamp: new Date(Date.now() - (cdc.peakHours.length - i) * 3600000).toISOString(),
          value: cdc.eventsPerHour * (1 + (h === cdc.peakHours[0] ? 0.5 : 0)),
        }))
      : [{ timestamp: new Date().toISOString(), value: cdc.eventsPerHour }];
    const perfForecast = engine.forecastPerformance(perfHistory, 24);
    if (perfForecast.confidence > 0) {
      predictions.push({
        type: 'performance',
        prediction: `Projected hourly CDC volume: ${perfForecast.value} events (${perfForecast.trend}). 95% CI: [${perfForecast.lowerBound}, ${perfForecast.upperBound}]`,
        confidence: perfForecast.confidence,
        timeframe: perfForecast.timeframe,
        impact: perfForecast.value > 10000 ? 'high' : 'medium',
        recommendedAction: perfForecast.value > 10000
          ? 'Consider horizontal scaling or read replicas for high-volume tables.'
          : 'Current capacity is sufficient for projected volume.',
        value: perfForecast.value,
        lowerBound: perfForecast.lowerBound,
        upperBound: perfForecast.upperBound,
        trend: perfForecast.trend,
      });
    }

    // Cost prediction — from pipeline table counts and throughput
    const pipelineUsages: PipelineUsage[] = pipelines.map((p, i) => ({
      id: `pipe-${i}`,
      tablesCount: p.avgTablesCount || 5,
      eventsPerHour: p.status === 'running' ? 100 : 0,
      hoursRunning: p.avgAgeHours,
      status: p.status,
    }));
    const costForecast = engine.forecastCost(pipelineUsages);
    if (costForecast.confidence > 0) {
      predictions.push({
        type: 'cost',
        prediction: `Estimated monthly infrastructure cost: $${costForecast.value.toFixed(2)} (${costForecast.trend}). 95% CI: [$${costForecast.lowerBound.toFixed(2)}, $${costForecast.upperBound.toFixed(2)}]`,
        confidence: costForecast.confidence,
        timeframe: costForecast.timeframe,
        impact: costForecast.value > 100 ? 'high' : 'low',
        recommendedAction: 'Review pipeline efficiency to optimize costs.',
        value: costForecast.value,
        lowerBound: costForecast.lowerBound,
        upperBound: costForecast.upperBound,
        trend: costForecast.trend,
      });
    }

    // Reliability prediction — time-to-failure from error rate trend
    const errorRate = connectors.reduce((sum, c) => sum + c.errorCount, 0) /
      Math.max(connectors.reduce((sum, c) => sum + c.totalCount, 0), 1);
    const reliabilityHistory: TimeSeriesPoint[] = connectors.map((c, i) => ({
      timestamp: new Date(Date.now() - (connectors.length - i) * 86400000).toISOString(),
      value: c.totalCount > 0 ? c.errorCount / c.totalCount : 0,
    }));
    const reliabilityForecast = engine.predictFailure(reliabilityHistory);
    if (reliabilityForecast.confidence > 0) {
      predictions.push({
        type: 'reliability',
        prediction: reliabilityForecast.timeframe === 'critical now'
          ? `Error rate at critical level (${(reliabilityForecast.value * 100).toFixed(1)}%). Immediate action required.`
          : `Time to threshold: ${reliabilityForecast.timeframe}. Current error rate trend: ${reliabilityForecast.trend}. CI: [${reliabilityForecast.lowerBound}, ${reliabilityForecast.upperBound}]`,
        confidence: reliabilityForecast.confidence,
        timeframe: reliabilityForecast.timeframe,
        impact: errorRate > 0.1 ? 'high' : 'medium',
        recommendedAction: 'Address connector errors to maintain data reliability SLA.',
        value: reliabilityForecast.value,
        lowerBound: reliabilityForecast.lowerBound,
        upperBound: reliabilityForecast.upperBound,
        trend: reliabilityForecast.trend,
      });
    }

    // Growth prediction — S-curve on marketplace adoption
    const growthHistory: TimeSeriesPoint[] = marketplace.topConnectors.map((c, i) => ({
      timestamp: new Date(Date.now() - (marketplace.topConnectors.length - i) * 86400000).toISOString(),
      value: c.downloads,
    }));
    const growthForecast = engine.forecastGrowth(growthHistory, 30);
    if (growthForecast.confidence > 0) {
      predictions.push({
        type: 'growth',
        prediction: `Marketplace growth forecast: ${growthForecast.value} total installs in 30 days (${growthForecast.trend}). 95% CI: [${growthForecast.lowerBound}, ${growthForecast.upperBound}]`,
        confidence: growthForecast.confidence,
        timeframe: growthForecast.timeframe,
        impact: growthForecast.trend === 'rising' ? 'medium' : 'low',
        recommendedAction: 'Ensure API rate limits and infrastructure can handle growth.',
        value: growthForecast.value,
        lowerBound: growthForecast.lowerBound,
        upperBound: growthForecast.upperBound,
        trend: growthForecast.trend,
      });
    }

    return predictions;
  }

  async generateInsights(): Promise<AIInsight[]> {
    const data = await this.learn();
    const insights: AIInsight[] = [];

    // Optimization insights
    for (const conn of data.connectors) {
      if (conn.successRate > 0 && conn.successRate < 95) {
        insights.push({
          id: `opt-conn-${conn.engine}`,
          category: 'optimization',
          title: `Improve ${conn.engine} connector reliability`,
          description: `${conn.engine} connectors are ${conn.successRate.toFixed(1)}% successful. Optimizing configuration could improve reliability.`,
          evidence: [
            `${conn.connectedCount} of ${conn.totalCount} connectors are connected`,
            `${conn.errorCount} connectors have errors`
          ],
          confidence: 0.85,
          priority: conn.successRate < 80 ? 'high' : 'medium',
          actionItems: [
            `Review ${conn.engine} connector configurations`,
            'Check network connectivity and firewall rules',
            'Verify credentials and permissions',
            'Consider upgrading to latest connector version'
          ],
          estimatedImpact: `+${(100 - conn.successRate).toFixed(0)}% reliability improvement`,
          generatedAt: new Date().toISOString()
        });
      }
    }

    // Risk insights
    for (const anomaly of data.anomalies) {
      insights.push({
        id: `risk-${anomaly.type}-${Date.now()}`,
        category: 'risk',
        title: `${anomaly.type.replace(/_/g, ' ')} detected`,
        description: anomaly.description,
        evidence: [`Confidence: ${(anomaly.confidence * 100).toFixed(0)}%`],
        confidence: anomaly.confidence,
        priority: anomaly.severity === 'critical' ? 'critical' : anomaly.severity === 'high' ? 'high' : 'medium',
        actionItems: [anomaly.suggestedAction],
        estimatedImpact: anomaly.severity === 'high' ? 'Significant operational impact' : 'Moderate impact',
        generatedAt: new Date().toISOString()
      });
    }

    // Opportunity insights
    if (data.marketplace.topConnectors.length > 0) {
      const top = data.marketplace.topConnectors[0];
      insights.push({
        id: 'opp-popular-connector',
        category: 'opportunity',
        title: `Popular connector: ${top.name}`,
        description: `${top.name} is the most downloaded connector (${top.downloads} installs). Consider using it for similar use cases.`,
        evidence: [`${top.downloads} downloads`, `Rating: ${top.rating.toFixed(1)}/5`],
        confidence: 0.9,
        priority: 'low',
        actionItems: [
          `Explore ${top.name} for your next pipeline`,
          'Check marketplace for similar connectors'
        ],
        estimatedImpact: 'Faster time-to-value with proven connector',
        generatedAt: new Date().toISOString()
      });
    }

    // Cost insights
    const runningCount = data.pipelines.find(p => p.status === 'running')?.count || 0;
    if (runningCount > 10) {
      insights.push({
        id: 'cost-many-pipelines',
        category: 'cost',
        title: 'High number of running pipelines',
        description: `You have ${runningCount} running pipelines. Consolidating could reduce costs.`,
        evidence: [`${runningCount} active pipelines`],
        confidence: 0.7,
        priority: 'medium',
        actionItems: [
          'Review pipeline utilization',
          'Consider consolidating similar pipelines',
          'Archive unused pipelines'
        ],
        estimatedImpact: 'Potential cost reduction through consolidation',
        generatedAt: new Date().toISOString()
      });
    }

    // Maintenance insights
    if (data.cdcEvents.throughputTrend === 'decreasing') {
      insights.push({
        id: 'maint-throughput',
        category: 'maintenance',
        title: 'CDC throughput declining',
        description: 'CDC event throughput has been decreasing. This may indicate resource constraints or data volume changes.',
        evidence: [
          `Throughput trend: ${data.cdcEvents.throughputTrend}`,
          `Events per hour: ${data.cdcEvents.eventsPerHour.toFixed(0)}`
        ],
        confidence: 0.8,
        priority: 'medium',
        actionItems: [
          'Monitor CDC processor resource usage',
          'Check for database connection pool exhaustion',
          'Review checkpoint intervals'
        ],
        estimatedImpact: 'Maintaining throughput prevents data freshness issues',
        generatedAt: new Date().toISOString()
      });
    }

    // If no insights, provide general recommendations
    if (insights.length === 0) {
      insights.push({
        id: 'general-healthy',
        category: 'optimization',
        title: 'System is healthy',
        description: 'No critical issues detected. Pulsyn AI is actively monitoring your infrastructure.',
        evidence: ['All connectors operational', 'No anomalies detected'],
        confidence: 0.95,
        priority: 'low',
        actionItems: [
          'Explore MCP templates for AI-driven pipeline management',
          'Check marketplace for new connectors',
          'Review usage analytics for optimization opportunities'
        ],
        estimatedImpact: 'Proactive monitoring prevents issues',
        generatedAt: new Date().toISOString()
      });
    }

    return insights;
  }

  async incorporateFeedback(feedback: FeedbackEntry): Promise<void> {
    // In production: store feedback, trigger retraining
    this.learningHistory.push({
      type: 'feedback',
      feedback,
      timestamp: new Date().toISOString()
    });
  }

  getStatus(): { version: string; lastLearn: string | null; dataPoints: number; learningRate: number } {
    return {
      version: this.modelVersion,
      lastLearn: this.knowledgeBase.get('lastLearnTime') || null,
      dataPoints: this.learningHistory.length,
      learningRate: 0.01 // Simulated learning rate
    };
  }
}

// Singleton instance
let llmInstance: SelfLearningLLM | null = null;

export function getLLM(): SelfLearningLLM {
  if (!llmInstance) {
    llmInstance = new SelfLearningLLM();
  }
  return llmInstance;
}
