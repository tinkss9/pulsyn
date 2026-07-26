// Pulsyn Core Types

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  username?: string; // Alias for user (Kiro compatibility)
  password: string;
  ssl?: boolean;
  watermarkColumn?: string; // CDC watermark column (Kiro compatibility)
  [key: string]: any; // Allow additional properties
}

export interface ConnectorConfig {
  id: string;
  name: string;
  type: 'source' | 'target';
  engine: 'postgresql' | 'mysql' | 'oracle' | 'sqlserver' | 'mongodb';
  config: DatabaseConfig;
  tables?: string[];
}

export interface PipelineConfig {
  id: string;
  name: string;
  source: ConnectorConfig;
  target: ConnectorConfig;
  tables: TableMapping[];
  masking?: MaskingConfig;
  options: PipelineOptions;
}

export interface TableMapping {
  sourceTable: string;
  targetTable: string;
  columns?: ColumnMapping[];
}

export interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
  transformation?: string;
}

export interface MaskingConfig {
  enabled: boolean;
  rules: MaskingRule[];
}

export interface MaskingRule {
  table: string;
  column: string;
  type: 'hash' | 'replace' | 'format-preserving' | 'redact';
  format?: string;
  salt?: string;
}

export interface PipelineOptions {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  checkpointInterval: number;
  exactlyOnce: boolean;
}

export type PipelineStatus = 'idle' | 'running' | 'paused' | 'error' | 'recovering';

export interface PipelineState {
  id: string;
  status: PipelineStatus;
  config: PipelineConfig;
  stats: PipelineStats;
  checkpoint?: Checkpoint;
  error?: string;
  startedAt?: Date;
  lastActivity?: Date;
}

export interface PipelineStats {
  rowsRead: number;
  rowsWritten: number;
  rowsPerSecond: number;
  lagMs: number;
  errors: number;
  lastError?: string;
}

export interface Checkpoint {
  id: string;
  pipelineId: string;
  lsn: string; // Log sequence number
  timestamp: Date;
  tables: Record<string, TableCheckpoint>;
}

export interface TableCheckpoint {
  tableName: string;
  lastLsn: string;
  rowsProcessed: number;
}

export interface CDCEvent {
  id: string;
  timestamp: Date;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema?: string;
  data: Record<string, unknown>;
  oldData?: Record<string, unknown>;
  before?: Record<string, unknown>; // Alias for oldData (Kiro compatibility)
  after?: Record<string, unknown>;  // Alias for data (Kiro compatibility)
  lsn: string;
}

export interface Connector {
  id: string;
  name: string;
  engine: string;
  config?: DatabaseConfig;
  connect(config: DatabaseConfig): Promise<void>;
  disconnect(): Promise<void>;
  testConnection(): Promise<boolean>;
  getTables(): Promise<string[]>;
  getTableSchema(table: string): Promise<TableSchema>;
  startCDC(callback: (event: CDCEvent) => void): Promise<void>;
  stopCDC(): Promise<void>;
}

export interface TableSchema {
  name: string;
  table?: string; // Alias for name (Kiro compatibility)
  columns: ColumnSchema[];
  primaryKey: string[];
  primaryKeys?: string[]; // Alias for primaryKey (Kiro compatibility)
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
}

export interface BenchmarkResult {
  connector: string;
  sourceEngine: string;
  targetEngine: string;
  rowsPerSecond: number;
  latencyMs: number;
  memoryMb: number;
  cpuPercent: number;
  testDuration: number;
  totalRows: number;
  errors: number;
  timestamp: Date;
}
