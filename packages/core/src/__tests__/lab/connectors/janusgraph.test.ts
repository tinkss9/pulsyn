// janusgraph Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/janusgraph';

const config: ConnectorTestConfig = {
  connectorId: 'test-janusgraph',
  connectorType: 'source',
  engine: 'janusgraph',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
