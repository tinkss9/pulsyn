// JSONServer — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/jsonserver';

const config: ConnectorTestConfig = {
  connectorId: 'test-jsonserver',
  connectorType: 'source',
  engine: 'jsonserver',
  config: {
    host: 'https://jsonplaceholder.typicode.com',
  },
  testTables: ['posts', 'comments', 'albums', 'photos'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
