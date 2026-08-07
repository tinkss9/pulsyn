// Box API v2.0 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/box-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-box-real',
  connectorType: 'source',
  engine: 'box-real',
  config: { host: 'https://api.box.com/2.0' },
  testTables: ['files', 'folders', 'collaborations'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
