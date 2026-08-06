// Monday.com — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/monday-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-monday-real',
  connectorType: 'source',
  engine: 'monday-real',
  config: { host: 'https://api.monday.com/v2' },
  testTables: ['boards', 'items', 'updates'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
