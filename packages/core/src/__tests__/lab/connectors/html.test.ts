// HTML Page — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/html';

const config: ConnectorTestConfig = {
  connectorId: 'test-html',
  connectorType: 'source',
  engine: 'html',
  config: { host: 'https://httpbin.org' },
  testTables: ['html'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
