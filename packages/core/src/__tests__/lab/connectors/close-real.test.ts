// Close API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/close-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-close-real',
  connectorType: 'source',
  engine: 'close-real',
  config: { host: 'https://api.close.com/api/v1' },
  testTables: ['lead', 'contact', 'opportunity'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
