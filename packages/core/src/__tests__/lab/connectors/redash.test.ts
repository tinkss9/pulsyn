// redash Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/redash';

const config: ConnectorTestConfig = {
  connectorId: 'test-redash',
  connectorType: 'source',
  engine: 'redash',
  config: { host: 'localhost', port: 3000, database: '', username: '', password: 'test', ssl: false },
  testTables: [],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 15000,
  minExtractThroughput: 50,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
runner.runBenchmarkTests();