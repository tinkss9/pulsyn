// ISS Location — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opennotify-iss';

const config: ConnectorTestConfig = {
  connectorId: 'test-opennotify-iss',
  connectorType: 'source',
  engine: 'opennotify-iss',
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
