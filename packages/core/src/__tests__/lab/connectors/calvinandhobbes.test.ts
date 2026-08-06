// Calvin and Hobbes — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/calvinandhobbes';

const config: ConnectorTestConfig = {
  connectorId: 'test-calvinandhobbes',
  connectorType: 'source',
  engine: 'calvinandhobbes',
  config: {
    host: 'https://calvinandhobbes.fandom.com/api.php',
  },
  testTables: ['comics'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
