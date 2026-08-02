// Random User API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/randomuser';

const config: ConnectorTestConfig = {
  connectorId: 'test-randomuser',
  connectorType: 'source',
  engine: 'randomuser',
  config: {
    host: 'https://randomuser.me',
  },
  testTables: ['users'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 5000,
  minExtractThroughput: 100,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();
