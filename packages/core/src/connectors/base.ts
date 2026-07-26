// Base Connector Interface
// Enhanced with DMS Replicate Extractor/Writer patterns

import {
  DatabaseConfig,
  Connector,
  TableSchema,
  CDCEvent,
} from '../types';
import { UnifiedChangeEvent } from '../events';

export interface WriteBatchResult {
  inserted: number;
  errors: number;
  deleted: number;
  merged: number;
  failedRecords: any[];
}

export interface SchemaDiff {
  added: { name: string; type: string }[];
  modified: { name: string; oldType: string; newType: string }[];
  removed: { name: string; type: string }[];
  renamed?: { from: string; to: string }[];
}

export abstract class BaseConnector implements Connector {
  id: string;
  name: string;
  engine: string;
  config: DatabaseConfig;
  batchSize: number;
  protected connected: boolean = false;

  constructor(id: string, name: string, engine: string, config: DatabaseConfig, batchSize: number = 10000) {
    this.id = id;
    this.name = name;
    this.engine = engine;
    this.config = config;
    this.batchSize = batchSize;
  }

  // Core connection methods
  abstract connect(config?: DatabaseConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;

  // Schema discovery
  abstract getTables(): Promise<string[]>;
  abstract getTableSchema(table: string): Promise<TableSchema>;

  // CDC methods
  abstract startCDC(callback: (event: CDCEvent) => void): Promise<void>;
  abstract stopCDC(): Promise<void>;

  // Config (masks sensitive fields)
  getConfig(): Record<string, any> {
    const { password, ...rest } = this.config;
    return { ...rest, password: password ? '***' : undefined };
  }

  // Extended methods (from DMS Extractor pattern)
  async extractFull(table: string, opts?: { limit?: number; offset?: number }): Promise<UnifiedChangeEvent[]> {
    throw new Error(`extractFull not implemented for ${this.engine}`);
  }

  async extractIncremental(table: string, opts?: { watermarkColumn?: string; watermarkValue?: string }): Promise<UnifiedChangeEvent[]> {
    throw new Error(`extractIncremental not implemented for ${this.engine}`);
  }

  async estimateRowCount(table: string): Promise<number> {
    throw new Error(`estimateRowCount not implemented for ${this.engine}`);
  }

  async getPrimaryKey(table: string): Promise<string> {
    throw new Error(`getPrimaryKey not implemented for ${this.engine}`);
  }

  // Extended methods (from DMS Writer pattern)
  async writeBatch(table: string, events: UnifiedChangeEvent[], opts?: { mode?: string }): Promise<WriteBatchResult> {
    throw new Error(`writeBatch not implemented for ${this.engine}`);
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    throw new Error(`merge not implemented for ${this.engine}`);
  }

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<{ created: boolean }> {
    throw new Error(`createTableIfNeeded not implemented for ${this.engine}`);
  }

  // Schema diff
  async detectSchemaChanges(oldSchema: TableSchema, newSchema: TableSchema): Promise<SchemaDiff> {
    const added: { name: string; type: string }[] = [];
    const modified: { name: string; oldType: string; newType: string }[] = [];
    const removed: { name: string; type: string }[] = [];

    const oldCols = new Map(oldSchema.columns.map(c => [c.name, c]));
    const newCols = new Map(newSchema.columns.map(c => [c.name, c]));

    for (const [name, col] of newCols) {
      if (!oldCols.has(name)) {
        added.push({ name, type: col.type });
      } else if (oldCols.get(name)!.type !== col.type) {
        modified.push({ name, oldType: oldCols.get(name)!.type, newType: col.type });
      }
    }

    for (const [name, col] of oldCols) {
      if (!newCols.has(name)) {
        removed.push({ name, type: col.type });
      }
    }

    return { added, modified, removed };
  }

  // Utility
  isConnected(): boolean {
    return this.connected;
  }
}
