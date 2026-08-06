// RandomUser v2 — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/randomuser-v2';

const config: ConnectorTestConfig = {
  connectorId: 'test-randomuser-v2',
  connectorType: 'source',
  engine: 'randomuser-v2',
  config: { host: 'https://randomuser.me/api' },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 5,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
