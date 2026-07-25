// Pulsyn Usage Metering — PostgreSQL backed

import { query } from '../db';

export interface UsageRecord {
  organization_id: string;
  metric: UsageMetric;
  quantity: number;
  created_at?: Date;
}

export type UsageMetric =
  | 'rows_replicated'
  | 'api_calls'
  | 'pipeline_hours'
  | 'storage_bytes';

export interface UsageSummary {
  organizationId: string;
  period: { start: Date; end: Date };
  metrics: {
    rowsReplicated: { used: number; limit: number; unit: string };
    apiCalls: { used: number; limit: number; unit: string };
    pipelineHours: { used: number; limit: number; unit: string };
    storageBytes: { used: number; limit: number; unit: string };
  };
}

export async function recordUsage(organizationId: string, metric: UsageMetric, quantity: number): Promise<void> {
  await query(
    'INSERT INTO usage_records (organization_id, metric, quantity) VALUES ($1, $2, $3)',
    [organizationId, metric, quantity]
  );
}

export async function getUsage(organizationId: string, metric: UsageMetric, since: Date): Promise<number> {
  const result = await query(
    `SELECT COALESCE(SUM(quantity), 0) as total
     FROM usage_records
     WHERE organization_id = $1 AND metric = $2 AND created_at >= $3`,
    [organizationId, metric, since]
  );
  return Number(result.rows[0].total);
}

export async function getUsageSummary(organizationId: string, planLimits: {
  maxRowsPerDay: number;
  apiCallsPerDay: number;
  pipelineHoursPerMonth: number;
  storageGb: number;
}): Promise<UsageSummary> {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [rowsReplicated, apiCalls, pipelineHours, storageBytes] = await Promise.all([
    getUsage(organizationId, 'rows_replicated', dayStart),
    getUsage(organizationId, 'api_calls', dayStart),
    getUsage(organizationId, 'pipeline_hours', monthStart),
    getUsage(organizationId, 'storage_bytes', monthStart),
  ]);

  return {
    organizationId,
    period: { start: monthStart, end: now },
    metrics: {
      rowsReplicated: { used: rowsReplicated, limit: planLimits.maxRowsPerDay, unit: 'rows/day' },
      apiCalls: { used: apiCalls, limit: planLimits.apiCallsPerDay, unit: 'calls/day' },
      pipelineHours: { used: pipelineHours, limit: planLimits.pipelineHoursPerMonth, unit: 'hours/month' },
      storageBytes: { used: storageBytes, limit: planLimits.storageGb * 1024 * 1024 * 1024, unit: 'bytes' },
    },
  };
}

export async function checkLimit(
  organizationId: string,
  metric: UsageMetric,
  limit: number,
  since: Date
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const current = await getUsage(organizationId, metric, since);
  return { allowed: current < limit, current, limit };
}

export async function incrementUsage(organizationId: string, metric: UsageMetric, quantity: number): Promise<void> {
  await recordUsage(organizationId, metric, quantity);
}

export function calculateOverage(used: number, freeAllowance: number, perUnitCents: number, unitSize: number): number {
  if (used <= freeAllowance) return 0;
  const overage = used - freeAllowance;
  const units = Math.ceil(overage / unitSize);
  return units * perUnitCents;
}
