// New Relic API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/newrelic-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-newrelic-api',
  connectorType: 'source',
  engine: 'newrelic-api',
  config: { host: 'https://api.newrelic.com/v2' },
  testTables: ['applications'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
