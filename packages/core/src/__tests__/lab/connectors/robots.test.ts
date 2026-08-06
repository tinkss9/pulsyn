// Robots.txt — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/robots';

const config: ConnectorTestConfig = {
  connectorId: 'test-robots',
  connectorType: 'source',
  engine: 'robots',
  config: { host: 'https://httpbin.org' },
  testTables: ['robots'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
