// JSONPlaceholder Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsonplaceholder';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsonplaceholder',
  connectorType: 'source',
  engine: 'jsonplaceholder',
  config: {
    host: 'https://jsonplaceholder.typicode.com',
  },
  testTables: ['posts', 'comments', 'users'],
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
