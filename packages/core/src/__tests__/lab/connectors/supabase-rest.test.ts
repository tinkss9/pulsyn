// Supabase REST API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/supabase';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://kclxnkrqhbvwbjlukdrs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const config: ConnectorTestConfig = {
  connectorId: 'test-supabase-rest',
  connectorType: 'source',
  engine: 'supabase',
  config: {
    host: SUPABASE_URL,
    password: SUPABASE_KEY,
    accessToken: SUPABASE_KEY,
  },
  testTables: ['target_users', 'api_keys', 'connectors'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
