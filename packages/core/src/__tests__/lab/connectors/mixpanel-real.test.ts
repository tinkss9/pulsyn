// Mixpanel API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/mixpanel-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-mixpanel-real',
  connectorType: 'source',
  engine: 'mixpanel-real',
  config: { host: 'https://mixpanel.com/api/2.0' },
  testTables: ['events', 'cohorts', 'funnels'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
