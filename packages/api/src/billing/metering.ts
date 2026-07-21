// Pulsyn Usage Metering
// Tracks and enforces usage limits per subscription

export interface UsageRecord {
  organizationId: string;
  metric: UsageMetric;
  quantity: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export type UsageMetric =
  | 'rows_replicated'
  | 'api_calls'
  | 'pipeline_hours'
  | 'storage_bytes';

export interface UsageSummary {
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    rowsReplicated: { used: number; limit: number; unit: string };
    apiCalls: { used: number; limit: number; unit: string };
    pipelineHours: { used: number; limit: number; unit: string };
    storageBytes: { used: number; limit: number; unit: string };
  };
}

// In-memory usage store (would be Redis/DB in production)
const usageStore: Map<string, UsageRecord[]> = new Map();

export function recordUsage(record: UsageRecord): void {
  const key = record.organizationId;
  if (!usageStore.has(key)) {
    usageStore.set(key, []);
  }
  usageStore.get(key)!.push(record);
}

export function getUsage(organizationId: string, metric: UsageMetric, since: Date): number {
  const records = usageStore.get(organizationId) || [];
  return records
    .filter(r => r.metric === metric && r.timestamp >= since)
    .reduce((sum, r) => sum + r.quantity, 0);
}

export function getUsageSummary(organizationId: string, planLimits: {
  maxRowsPerDay: number;
  apiCallsPerDay: number;
  pipelineHoursPerMonth: number;
  storageGb: number;
}): UsageSummary {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    organizationId,
    period: {
      start: monthStart,
      end: now,
    },
    metrics: {
      rowsReplicated: {
        used: getUsage(organizationId, 'rows_replicated', dayStart),
        limit: planLimits.maxRowsPerDay,
        unit: 'rows/day',
      },
      apiCalls: {
        used: getUsage(organizationId, 'api_calls', dayStart),
        limit: planLimits.apiCallsPerDay,
        unit: 'calls/day',
      },
      pipelineHours: {
        used: getUsage(organizationId, 'pipeline_hours', monthStart),
        limit: planLimits.pipelineHoursPerMonth,
        unit: 'hours/month',
      },
      storageBytes: {
        used: getUsage(organizationId, 'storage_bytes', monthStart),
        limit: planLimits.storageGb * 1024 * 1024 * 1024,
        unit: 'bytes',
      },
    },
  };
}

export function checkLimit(
  organizationId: string,
  metric: UsageMetric,
  limit: number,
  since: Date
): { allowed: boolean; current: number; limit: number } {
  const current = getUsage(organizationId, metric, since);
  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export function incrementUsage(
  organizationId: string,
  metric: UsageMetric,
  quantity: number
): void {
  recordUsage({
    organizationId,
    metric,
    quantity,
    timestamp: new Date(),
  });
}

// Calculate overage charges (in cents)
export function calculateOverage(
  used: number,
  freeAllowance: number,
  perUnitCents: number,
  unitSize: number
): number {
  if (used <= freeAllowance) return 0;
  const overage = used - freeAllowance;
  const units = Math.ceil(overage / unitSize);
  return units * perUnitCents;
}
