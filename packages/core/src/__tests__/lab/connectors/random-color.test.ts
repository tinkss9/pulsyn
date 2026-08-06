// Random Color — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/random-color';

const config: ConnectorTestConfig = {
  connectorId: 'test-random-color',
  connectorType: 'source',
  engine: 'random-color',
  config: { host: 'https://x-colors.yurace.pro/api' },
  testTables: ['color'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
