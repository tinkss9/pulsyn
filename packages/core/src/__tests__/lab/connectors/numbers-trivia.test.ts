// Numbers Trivia — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/numbers-trivia';

const config: ConnectorTestConfig = {
  connectorId: 'test-numbers-trivia',
  connectorType: 'source',
  engine: 'numbers-trivia',
  config: { host: 'http://numbersapi.com' },
  testTables: ['trivia'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
