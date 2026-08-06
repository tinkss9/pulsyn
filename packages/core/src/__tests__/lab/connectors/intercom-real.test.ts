// Intercom — Comprehensive Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/intercom-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-intercom-real',
  connectorType: 'source',
  engine: 'intercom-real',
  config: { host: 'https://api.intercom.io' },
  testTables: ['contacts', 'conversations', 'companies'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
