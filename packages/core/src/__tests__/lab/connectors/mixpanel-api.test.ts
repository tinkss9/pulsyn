// Mixpanel API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mixpanel-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-mixpanel-api',
  connectorType: 'source',
  engine: 'mixpanel-api',
  config: { host: 'https://mixpanel.com/api/2.0' },
  testTables: ['events'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
