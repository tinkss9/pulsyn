// ClickUp API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clickup-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-clickup-real',
  connectorType: 'source',
  engine: 'clickup-real',
  config: { host: 'https://api.clickup.com/api/v2' },
  testTables: ['tasks', 'lists', 'folders'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
