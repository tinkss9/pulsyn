// Base Connector Interface
// Enhanced with DMS Replicate Extractor/Writer patterns

import {
  DatabaseConfig,
  Connector,
  TableSchema,
  CDCEvent,
} from '../types';
import { UnifiedChangeEvent } from '../events';

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
  abstract connect(config: DatabaseConfig): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract testConnection(): Promise<boolean>;

  // Schema discovery
  abstract getTables(): Promise<string[]>;
  abstract getTableSchema(table: string): Promise<TableSchema>;

  // CDC methods
  abstract startCDC(callback: (event: CDCEvent) => void): Promise<void>;
  abstract stopCDC(): Promise<void>;

  // Extended methods (from DMS Extractor pattern)
  async extractFull(table: string): Promise<UnifiedChangeEvent[]> {
    throw new Error(`extractFull not implemented for ${this.engine}`);
  }

  async extractIncremental(table: string, watermark: string | null): Promise<UnifiedChangeEvent[]> {
    throw new Error(`extractIncremental not implemented for ${this.engine}`);
  }

  async estimateRowCount(table: string): Promise<number> {
    throw new Error(`estimateRowCount not implemented for ${this.engine}`);
  }

  async getPrimaryKey(table: string): Promise<string> {
    throw new Error(`getPrimaryKey not implemented for ${this.engine}`);
  }

  // Extended methods (from DMS Writer pattern)
  async writeBatch(table: string, events: UnifiedChangeEvent[]): Promise<number> {
    throw new Error(`writeBatch not implemented for ${this.engine}`);
  }

  async merge(table: string, events: UnifiedChangeEvent[], keyColumns: string[]): Promise<number> {
    throw new Error(`merge not implemented for ${this.engine}`);
  }

  async createTableIfNeeded(table: string, schema: Record<string, any>): Promise<void> {
    throw new Error(`createTableIfNeeded not implemented for ${this.engine}`);
  }

  // Utility
  isConnected(): boolean {
    return this.connected;
  }
}


