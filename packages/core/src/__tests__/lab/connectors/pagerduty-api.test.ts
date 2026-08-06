// PagerDuty API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/pagerduty-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-pagerduty-api',
  connectorType: 'source',
  engine: 'pagerduty-api',
  config: { host: 'https://api.pagerduty.com' },
  testTables: ['incidents'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
