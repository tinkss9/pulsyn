// DEV.to Articles — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/devto-articles';

const config: ConnectorTestConfig = {
  connectorId: 'test-devto-articles',
  connectorType: 'source',
  engine: 'devto-articles',
  config: { host: 'https://dev.to/api' },
  testTables: ['articles'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
