// Numbers Math — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/numbers-math';

const config: ConnectorTestConfig = {
  connectorId: 'test-numbers-math',
  connectorType: 'source',
  engine: 'numbers-math',
  config: { host: 'http://numbersapi.com' },
  testTables: ['math'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
