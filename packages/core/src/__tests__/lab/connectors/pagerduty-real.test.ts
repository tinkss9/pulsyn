// PagerDuty API v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pagerduty-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-pagerduty-real',
  connectorType: 'source',
  engine: 'pagerduty-real',
  config: { host: 'https://api.pagerduty.com' },
  testTables: ['incidents', 'services', 'schedules'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
