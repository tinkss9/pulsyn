// Sentry API v0 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sentry-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-sentry-real',
  connectorType: 'source',
  engine: 'sentry-real',
  config: { host: 'https://sentry.io/api/0' },
  testTables: ['issues', 'events', 'projects'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
