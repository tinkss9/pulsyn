// Sentry API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/sentry-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-sentry-api',
  connectorType: 'source',
  engine: 'sentry-api',
  config: { host: 'https://sentry.io/api/0' },
  testTables: ['issues'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
