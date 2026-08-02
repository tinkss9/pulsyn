// Cat Facts API Connector — Full Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/catfacts';

const config: ConnectorTestConfig = {
  connectorId: 'test-catfacts',
  connectorType: 'source',
  engine: 'catfacts',
  config: {
    host: 'https://cat-fact.herokuapp.com',
  },
  testTables: ['facts'],
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
