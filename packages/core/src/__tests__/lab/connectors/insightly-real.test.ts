// Insightly API v3.1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/insightly-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-insightly-real',
  connectorType: 'source',
  engine: 'insightly-real',
  config: { host: 'https://api.insight.ly/v3.1' },
  testTables: ['contacts', 'organisations', 'opportunities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
