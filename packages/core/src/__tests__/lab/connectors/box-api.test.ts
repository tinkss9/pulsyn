// Box API — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/box-api';

const config: ConnectorTestConfig = {
  connectorId: 'test-box-api',
  connectorType: 'source',
  engine: 'box-api',
  config: { host: 'https://api.box.com/2.0' },
  testTables: ['files'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
