// Range Request — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/range';

const config: ConnectorTestConfig = {
  connectorId: 'test-range',
  connectorType: 'source',
  engine: 'range',
  config: { host: 'https://httpbin.org' },
  testTables: ['range'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
