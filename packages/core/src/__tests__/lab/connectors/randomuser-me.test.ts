// RandomUser.me — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/randomuser-me';

const config: ConnectorTestConfig = {
  connectorId: 'test-randomuser-me',
  connectorType: 'source',
  engine: 'randomuser-me',
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
