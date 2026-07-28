// monday Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/monday';

const config: ConnectorTestConfig = {
  connectorId: 'test-monday',
  connectorType: 'source',
  engine: 'monday',
  config: {
    host: 'api.monday.com',
    port: 443,
    database: '',
    username: '',
    password: process.env.TEST_MONDAY_API_KEY || '',
    ssl: true,
  },
  testTables: [],
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