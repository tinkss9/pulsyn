// Solar System API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/solarsystem';

const config: ConnectorTestConfig = {
  connectorId: 'test-solarsystem',
  connectorType: 'source',
  engine: 'solarsystem',
  config: {
    host: 'https://api.le-systeme-solaire.net/rest',
  },
  testTables: ['bodies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
