// jokeapi Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jokeapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-jokeapi',
  connectorType: 'source',
  engine: 'jokeapi',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
