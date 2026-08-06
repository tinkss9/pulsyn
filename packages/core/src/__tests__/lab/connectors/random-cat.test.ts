// Random Cat — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/random-cat';

const config: ConnectorTestConfig = {
  connectorId: 'test-random-cat',
  connectorType: 'source',
  engine: 'random-cat',
  config: { host: 'https://aws.random.cat' },
  testTables: ['cats'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
