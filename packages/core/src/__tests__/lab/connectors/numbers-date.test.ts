// Numbers Date — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/numbers-date';

const config: ConnectorTestConfig = {
  connectorId: 'test-numbers-date',
  connectorType: 'source',
  engine: 'numbers-date',
  config: { host: 'http://numbersapi.com' },
  testTables: ['date'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
