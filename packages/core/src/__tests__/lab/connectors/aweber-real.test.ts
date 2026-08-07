// AWeber API v1 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/aweber-real';

const config: ConnectorTestConfig = {
  connectorId: 'test-aweber-real',
  connectorType: 'source',
  engine: 'aweber-real',
  config: { host: 'https://api.aweber.com/1' },
  testTables: ['subscribers', 'lists', 'campaigns'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
