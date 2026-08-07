// New Relic API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/newrelic-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-newrelic-real',
  connectorType: 'source',
  engine: 'newrelic-real',
  config: { host: 'https://api.newrelic.com/v2' },
  testTables: ['applications', 'alerts', 'dashboards'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
