// Joke One — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/joke-one';

const config: ConnectorTestConfig = {
  connectorId: 'test-joke-one',
  connectorType: 'source',
  engine: 'joke-one',
  config: { host: 'https://official-joke-api.appspot.com' },
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
