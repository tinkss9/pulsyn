// Random Dog — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/random-dog';

const config: ConnectorTestConfig = {
  connectorId: 'test-random-dog',
  connectorType: 'source',
  engine: 'random-dog',
  config: { host: 'https://random.dog' },
  testTables: ['dogs'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
