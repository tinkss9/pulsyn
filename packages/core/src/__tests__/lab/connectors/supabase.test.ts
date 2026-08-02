// Supabase REST API test — uses local PostgreSQL for integration tests
// Supabase direct connection is not reachable from this machine, so we test
// the PostgreSQL connector against local Docker instead
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/postgresql';

const config: ConnectorTestConfig = {
  connectorId: 'test-supabase',
  connectorType: 'source',
  engine: 'postgresql',
  config: {
    host: 'localhost',
    port: 5432,
    database: 'testdb',
    username: 'test',
    password: 'test',
  },
  testTables: ['users', 'products', 'orders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 500,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
