// Quotable Random — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quotable-random';

const config: ConnectorTestConfig = {
  connectorId: 'test-quotable-random',
  connectorType: 'source',
  engine: 'quotable-random',
  config: { host: 'https://api.quotable.io' },
  testTables: ['random'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
