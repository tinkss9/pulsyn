// Advice Slip — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/advice-slip';

const config: ConnectorTestConfig = {
  connectorId: 'test-advice-slip',
  connectorType: 'source',
  engine: 'advice-slip',
  config: {
    host: 'https://api.adviceslip.com',
  },
  testTables: ['advice'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
