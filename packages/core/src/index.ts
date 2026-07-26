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

// Events (DMS-ported)
export { createEvent, eventKey, eventToDict, dictToEvent } from './events';
export type { UnifiedChangeEvent, Operation } from './events';

// Connectors — Source
export { BaseConnector } from './connectors/base';
export { PostgreSQLConnector } from './connectors/postgresql';
export { MySQLConnector } from './connectors/mysql';
export { SQLServerConnector } from './connectors/sqlserver';
export { OracleConnector } from './connectors/oracle';
export { MongoDBConnector } from './connectors/mongodb';
export { RedisConnector } from './connectors/redis';
export { DynamoDBConnector } from './connectors/dynamodb';
export { KafkaConnector } from './connectors/kafka';
export { ElasticsearchConnector } from './connectors/elasticsearch';
export { MariaDBConnector } from './connectors/mariadb';
export { SupabaseConnector } from './connectors/supabase';
export { RedshiftConnector } from './connectors/redshift';
export { CassandraConnector } from './connectors/cassandra';
export { ClickHouseConnector } from './connectors/clickhouse';
export { DatabricksConnector } from './connectors/databricks';
export { SAPConnector } from './connectors/sap';
export { XeroConnector } from './connectors/xero';
export { HubSpotConnector } from './connectors/hubspot';
export { StripeConnector } from './connectors/stripe';
export { QuickBooksConnector } from './connectors/quickbooks';
export { ShopifyConnector } from './connectors/shopify';
export { SlackConnector } from './connectors/slack';
export { JiraConnector } from './connectors/jira';
export { SalesforceConnector } from './connectors/salesforce';
export { ServiceNowConnector } from './connectors/servicenow';
export { NetSuiteConnector } from './connectors/netsuite';
export { WorkdayConnector } from './connectors/workday';
export { NotionConnector } from './connectors/notion';
export { AirtableConnector } from './connectors/airtable';
export { ConnectorRegistry, registerSource, registerTarget } from './connectors/registry';

// Connectors — Target
export { SnowflakeTargetConnector } from './targets/snowflake';
export { BigQueryTargetConnector } from './targets/bigquery';

// Engine
export { CDCEngine } from './engine/cdc-engine';

// Certification
export { CertificationEngine } from './certification/engine';
export type { CertificationLevel as ConnectorCertLevel, TestResult as ConnectorTestResult, CertificationReport as ConnectorCertReport } from './certification/engine';

// Checkpoint
export { CheckpointManager } from './checkpoint/checkpoint-manager';
export { WatermarkTracker } from './checkpoint/watermark';

// Version
export const VERSION = '0.1.0';

// Brand
export const BRAND = {
  name: 'Pulsyn',
  tagline: 'The AI-Native CDC Platform',
  description: 'Real-time change data capture without the complexity',
};
