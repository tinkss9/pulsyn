// ClickUp API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/clickup-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-clickup-api',
  connectorType: 'source',
  engine: 'clickup-api',
  config: { host: 'https://api.clickup.com/api/v2' },
  testTables: ['tasks'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
