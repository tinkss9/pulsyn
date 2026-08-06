// ISS Location v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/opennotify2';

const config: ConnectorTestConfig = {
  connectorId: 'test-opennotify2',
  connectorType: 'source',
  engine: 'opennotify2',
  config: { host: 'http://api.open-notify.org' },
  testTables: ['iss'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
