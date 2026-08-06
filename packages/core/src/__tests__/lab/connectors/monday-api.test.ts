// Monday.com API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/monday-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-monday-api',
  connectorType: 'source',
  engine: 'monday-api',
  config: { host: 'https://api.monday.com/v2' },
  testTables: ['boards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
