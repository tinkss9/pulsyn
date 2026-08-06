// HTTP Redirect — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/redirect';

const config: ConnectorTestConfig = {
  connectorId: 'test-redirect',
  connectorType: 'source',
  engine: 'redirect',
  config: { host: 'https://httpbin.org' },
  testTables: ['redirect'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
