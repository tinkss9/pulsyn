// Pulsyn Pipeline Monitor — Real-time metrics and alerts
export interface PipelineMetrics {
  pipelineId: string;
  timestamp: Date;
  latency: number; // ms
  throughput: number; // rows/sec
  errors: number;
  rowsProcessed: number;
  bytesProcessed: number;
  status: 'running' | 'paused' | 'error' | 'completed';
  health: number; // 0-100
}

export interface Alert {
  id: string;
  pipelineId: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  currentValue: number;
  triggered: boolean;
  triggeredAt?: Date;
  message: string;
}

export interface PipelineHealth {
  pipelineId: string;
  name: string;
  status: string;
  health: number;
  uptime: number; // seconds
  lastSync: Date;
  totalRows: number;
  totalBytes: number;
  errorRate: number;
  avgLatency: number;
  alerts: Alert[];
}

export class PipelineMonitor {
  private metrics: Map<string, PipelineMetrics[]> = new Map();
  private alerts: Map<string, Alert[]> = new Map();
  private healthCache: Map<string, PipelineHealth> = new Map();

  /**
   * Record metrics for a pipeline
   */
  recordMetrics(metrics: PipelineMetrics): void {
    const existing = this.metrics.get(metrics.pipelineId) || [];
    existing.push(metrics);

    // Keep last 1000 metrics per pipeline
    if (existing.length > 1000) {
      existing.splice(0, existing.length - 1000);
    }

    this.metrics.set(metrics.pipelineId, existing);

    // Check alerts
    this.checkAlerts(metrics);

    // Update health cache
    this.updateHealth(metrics.pipelineId);
  }

  /**
   * Get metrics for a pipeline
   */
  getMetrics(pipelineId: string, timeRange: '1h' | '24h' | '7d' | '30d'): PipelineMetrics[] {
    const allMetrics = this.metrics.get(pipelineId) || [];
    const now = new Date();
    let cutoff: Date;

    switch (timeRange) {
      case '1h': cutoff = new Date(now.getTime() - 60 * 60 * 1000); break;
      case '24h': cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case '7d': cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
    }

    return allMetrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Set an alert for a pipeline
   */
  setAlert(pipelineId: string, metric: string, threshold: number, condition: 'above' | 'below'): Alert {
    const alert: Alert = {
      id: `${pipelineId}-${metric}-${Date.now()}`,
      pipelineId,
      metric,
      threshold,
      condition,
      currentValue: 0,
      triggered: false,
      message: `Alert: ${metric} ${condition} ${threshold}`,
    };

    const existing = this.alerts.get(pipelineId) || [];
    existing.push(alert);
    this.alerts.set(pipelineId, existing);

    return alert;
  }

  /**
   * Get alerts for a pipeline
   */
  getAlerts(pipelineId: string): Alert[] {
    return this.alerts.get(pipelineId) || [];
  }

  /**
   * Get pipeline health
   */
  getHealth(pipelineId: string): PipelineHealth | null {
    return this.healthCache.get(pipelineId) || null;
  }

  /**
   * Get all pipeline health statuses
   */
  getAllHealth(): PipelineHealth[] {
    return Array.from(this.healthCache.values());
  }

  /**
   * Check alerts against new metrics
   */
  private checkAlerts(metrics: PipelineMetrics): void {
    const alerts = this.alerts.get(metrics.pipelineId) || [];

    for (const alert of alerts) {
      let value: number;

      switch (alert.metric) {
        case 'latency': value = metrics.latency; break;
        case 'throughput': value = metrics.throughput; break;
        case 'errors': value = metrics.errors; break;
        case 'health': value = metrics.health; break;
        default: continue;
      }

      alert.currentValue = value;

      if (alert.condition === 'above' && value > alert.threshold) {
        if (!alert.triggered) {
          alert.triggered = true;
          alert.triggeredAt = new Date();
          console.warn(`[ALERT] ${alert.message} — Current: ${value}`);
        }
      } else if (alert.condition === 'below' && value < alert.threshold) {
        if (!alert.triggered) {
          alert.triggered = true;
          alert.triggeredAt = new Date();
          console.warn(`[ALERT] ${alert.message} — Current: ${value}`);
        }
      } else {
        alert.triggered = false;
      }
    }
  }

  /**
   * Update health cache for a pipeline
   */
  private updateHealth(pipelineId: string): void {
    const metrics = this.metrics.get(pipelineId) || [];
    if (metrics.length === 0) return;

    const latest = metrics[metrics.length - 1];
    const last1h = metrics.filter(m => m.timestamp >= new Date(Date.now() - 60 * 60 * 1000));

    const avgLatency = last1h.length > 0
      ? last1h.reduce((sum, m) => sum + m.latency, 0) / last1h.length
      : 0;

    const totalRows = metrics.reduce((sum, m) => sum + m.rowsProcessed, 0);
    const totalBytes = metrics.reduce((sum, m) => sum + m.bytesProcessed, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errors, 0);
    const errorRate = totalRows > 0 ? totalErrors / totalRows : 0;

    const health: PipelineHealth = {
      pipelineId,
      name: `Pipeline ${pipelineId}`,
      status: latest.status,
      health: latest.health,
      uptime: metrics.length * 5, // Assume 5s intervals
      lastSync: latest.timestamp,
      totalRows,
      totalBytes,
      errorRate,
      avgLatency,
      alerts: this.alerts.get(pipelineId) || [],
    };

    this.healthCache.set(pipelineId, health);
  }

  /**
   * Generate health report
   */
  generateReport(): {
    totalPipelines: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    totalRows: number;
    totalBytes: number;
    avgLatency: number;
    alerts: Alert[];
  } {
    const allHealth = this.getAllHealth();
    const allAlerts = Array.from(this.alerts.values()).flat();

    return {
      totalPipelines: allHealth.length,
      healthy: allHealth.filter(h => h.health >= 80).length,
      degraded: allHealth.filter(h => h.health >= 50 && h.health < 80).length,
      unhealthy: allHealth.filter(h => h.health < 50).length,
      totalRows: allHealth.reduce((sum, h) => sum + h.totalRows, 0),
      totalBytes: allHealth.reduce((sum, h) => sum + h.totalBytes, 0),
      avgLatency: allHealth.length > 0
        ? allHealth.reduce((sum, h) => sum + h.avgLatency, 0) / allHealth.length
        : 0,
      alerts: allAlerts.filter(a => a.triggered),
    };
  }
}
