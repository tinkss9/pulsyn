// justworks-hr Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/justworks-hr';

const config: ConnectorTestConfig = {
  connectorId: 'test-justworks-hr',
  connectorType: 'source',
  engine: 'justworks-hr',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
