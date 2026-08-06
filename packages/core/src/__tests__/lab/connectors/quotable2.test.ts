// Quotable v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/quotable2';

const config: ConnectorTestConfig = {
  connectorId: 'test-quotable2',
  connectorType: 'source',
  engine: 'quotable2',
  config: { host: 'https://api.quotable.io' },
  testTables: ['random'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
