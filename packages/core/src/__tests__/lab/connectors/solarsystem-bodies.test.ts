// Solar System Bodies — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/solarsystem-bodies';

const config: ConnectorTestConfig = {
  connectorId: 'test-solarsystem-bodies',
  connectorType: 'source',
  engine: 'solarsystem-bodies',
  config: { host: 'https://api.le-systeme-solaire.net/rest' },
  testTables: ['bodies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
