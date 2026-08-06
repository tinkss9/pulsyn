// JokeAPI — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sv443';

const config: ConnectorTestConfig = {
  connectorId: 'test-sv443',
  connectorType: 'source',
  engine: 'sv443',
  config: { host: 'https://v2.jokeapi.dev' },
  testTables: ['jokes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
