// Trump Says — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trump2';

const config: ConnectorTestConfig = {
  connectorId: 'test-trump2',
  connectorType: 'source',
  engine: 'trump2',
  config: { host: 'https://tronalddump.io' },
  testTables: ['random'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
