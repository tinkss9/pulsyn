// Random Number — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/random-num';

const config: ConnectorTestConfig = {
  connectorId: 'test-random-num',
  connectorType: 'source',
  engine: 'random-num',
  config: { host: 'https://www.random.org' },
  testTables: ['numbers'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
