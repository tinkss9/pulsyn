// JokeAPI Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jokeapi-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-jokeapi-random',
  connectorType: 'source',
  engine: 'jokeapi-random',
  config: { host: 'https://v2.jokeapi.dev' },
  testTables: ['jokes'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
