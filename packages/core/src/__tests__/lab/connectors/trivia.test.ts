// Trivia API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/trivia';

const config: ConnectorTestConfig = {
  connectorId: 'test-trivia',
  connectorType: 'source',
  engine: 'trivia',
  config: {
    host: 'https://opentdb.com/api.php',
  },
  testTables: ['questions'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
