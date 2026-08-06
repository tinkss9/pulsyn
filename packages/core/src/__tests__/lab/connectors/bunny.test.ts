// Random Bunny — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/bunny';

const config: ConnectorTestConfig = {
  connectorId: 'test-bunny',
  connectorType: 'source',
  engine: 'bunny',
  config: { host: 'https://api.bunnies.io/v2/loop' },
  testTables: ['bunnies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
