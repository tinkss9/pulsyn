// Random Duck — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/random-duck';

const config: ConnectorTestConfig = {
  connectorId: 'test-random-duck',
  connectorType: 'source',
  engine: 'random-duck',
  config: { host: 'https://random-d.uk' },
  testTables: ['ducks'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
