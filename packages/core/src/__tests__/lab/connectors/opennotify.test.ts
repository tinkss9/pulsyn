// OpenNotify ISS — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opennotify';

const config: ConnectorTestConfig = {
  connectorId: 'test-opennotify',
  connectorType: 'source',
  engine: 'opennotify',
  config: {
    host: 'http://api.open-notify.org',
  },
  testTables: ['iss_position', 'people'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
