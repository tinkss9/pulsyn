// Advice Slip Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/advice-slip-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-advice-slip-random',
  connectorType: 'source',
  engine: 'advice-slip-random',
  config: { host: 'https://api.adviceslip.com' },
  testTables: ['advice'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
