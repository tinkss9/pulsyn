// Unified change event format — Debezium-inspired schema for all connectors
// Ported from DMS Replicate src/replication/events.py

export type Operation = 'I' | 'U' | 'D' | 'S'; // Insert, Update, Delete, Snapshot

export interface UnifiedChangeEvent {
  op: Operation;
  table: string;
  after: Record<string, any> | null;
  before: Record<string, any> | null;
  ts: Date;
  watermark: string | null;
  sourceMetadata: Record<string, any>;
}

export function createEvent(partial: Partial<UnifiedChangeEvent> & { op: Operation; table: string }): UnifiedChangeEvent {
  return {
    op: partial.op,
    table: partial.table,
    after: partial.after ?? null,
    before: partial.before ?? null,
    ts: partial.ts ?? new Date(),
    watermark: partial.watermark ?? null,
    sourceMetadata: partial.sourceMetadata ?? {},
  };
}

export function eventKey(event: UnifiedChangeEvent): string | null {
  return event.sourceMetadata?.pk ?? null;
}

export function eventToDict(event: UnifiedChangeEvent): Record<string, any> {
  return {
    op: event.op,
    table: event.table,
    before: event.before,
    after: event.after,
    ts: event.ts.toISOString(),
    watermark: event.watermark,
    source_metadata: event.sourceMetadata,
  };
}

export function dictToEvent(data: Record<string, any>): UnifiedChangeEvent {
  return {
    op: data.op as Operation,
    table: data.table,
    before: data.before ?? null,
    after: data.after ?? null,
    ts: data.ts ? new Date(data.ts) : new Date(),
    watermark: data.watermark ?? null,
    sourceMetadata: data.source_metadata ?? {},
  };
}
