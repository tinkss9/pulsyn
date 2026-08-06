// Links Page — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/links';

const config: ConnectorTestConfig = {
  connectorId: 'test-links',
  connectorType: 'source',
  engine: 'links',
  config: { host: 'https://httpbin.org' },
  testTables: ['links'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
