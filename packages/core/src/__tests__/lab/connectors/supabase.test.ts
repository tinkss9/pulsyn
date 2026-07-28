// Supabase Connector — Full Lab Test Suite
// Supabase uses PostgreSQL, so we reuse the PostgreSQL connector
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/postgresql';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kclxnkrqhbvwbjlukdrs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Extract host from Supabase URL
const supabaseHost = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

const config: ConnectorTestConfig = {
  connectorId: 'test-supabase',
  connectorType: 'source',
  engine: 'postgresql',
  config: {
    host: `db.${supabaseHost}.supabase.co`,
    port: 5432,
    database: 'postgres',
    username: 'postgres',
    password: SUPABASE_KEY,
    ssl: true,
  },
  testTables: ['lab_users', 'lab_products', 'lab_orders'],
  skipCDC: true,
  skipBenchmark: true, // Skip benchmarks for Supabase (network latency)
  maxConnectionLatencyMs: 15000, // Higher timeout for cloud DB
  minExtractThroughput: 50, // Lower threshold for cloud DB
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
