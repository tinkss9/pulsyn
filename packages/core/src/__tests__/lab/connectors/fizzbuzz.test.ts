// FizzBuzz API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/fizzbuzz';

const config: ConnectorTestConfig = {
  connectorId: 'test-fizzbuzz',
  connectorType: 'source',
  engine: 'fizzbuzz',
  config: {
    host: 'https://fizzbuzz-api.com',
  },
  testTables: ['fizzbuzz'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
