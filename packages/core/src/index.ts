// Pulsyn Core
// The AI-Native CDC Platform

// Types
export type {
  DatabaseConfig,
  ConnectorConfig,
  PipelineConfig,
  TableMapping,
  ColumnMapping,
  MaskingConfig,
  MaskingRule,
  PipelineOptions,
  PipelineStatus,
  PipelineState,
  PipelineStats,
  Checkpoint,
  TableCheckpoint,
  CDCEvent,
  Connector,
  TableSchema,
  ColumnSchema,
  BenchmarkResult,
} from './types';

// API Client
export { PulsynApiClient, ApiError } from './api-client';

// Benchmark
export { DEFAULT_SUITE, CERTIFICATION_THRESHOLDS, calculateScore, runBenchmark } from './benchmark/engine';
export { generateReportSummary, generateReportMarkdown } from './benchmark/runner';
export type { BenchmarkConfig, BenchmarkSuite, BenchmarkTest, BenchmarkTestResult, BenchmarkReport, CertificationLevel } from './benchmark/engine';

// Connectors
export { BaseConnector } from './connectors/base';
export { PostgreSQLConnector } from './connectors/postgresql';
export { MySQLConnector } from './connectors/mysql';

// Engine
export { CDCEngine } from './engine/cdc-engine';

// Checkpoint
export { CheckpointManager } from './checkpoint/checkpoint-manager';

// Version
export const VERSION = '0.1.0';

// Brand
export const BRAND = {
  name: 'Pulsyn',
  tagline: 'The AI-Native CDC Platform',
  description: 'Real-time change data capture without the complexity',
};
