// Intercom API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/intercom-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-intercom-api',
  connectorType: 'source',
  engine: 'intercom-api',
  config: { host: 'https://api.intercom.io' },
  testTables: ['contacts', 'conversations'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
