// Activity Suggestion — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/activity-suggestion';

const config: ConnectorTestConfig = {
  connectorId: 'test-activity-suggestion',
  connectorType: 'source',
  engine: 'activity-suggestion',
  config: {
    host: 'https://www.boredapi.com/api',
  },
  testTables: ['activities'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
