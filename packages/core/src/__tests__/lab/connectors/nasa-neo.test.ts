// NASA Near Earth Objects — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/nasa-neo';

const config: ConnectorTestConfig = {
  connectorId: 'test-nasa-neo',
  connectorType: 'source',
  engine: 'nasa-neo',
  config: {
    host: 'https://api.nasa.gov/neo/rest/v1',
  },
  testTables: ['neo'],
  skipCDC: true,
  skipBenchmark: true,
  maxConnectionLatencyMs: 10000,
  minExtractThroughput: 10,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
