// OpenNotify v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opennotify-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-opennotify-v2',
  connectorType: 'source',
  engine: 'opennotify-v2',
  config: { host: 'http://api.open-notify.org' },
  testTables: ['iss', 'people'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
