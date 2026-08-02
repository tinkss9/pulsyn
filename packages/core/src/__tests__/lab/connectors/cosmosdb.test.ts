// cosmosdb Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/cosmosdb';

const config: ConnectorTestConfig = {
  connectorId: 'test-cosmosdb',
  connectorType: 'source',
  engine: 'cosmosdb',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
