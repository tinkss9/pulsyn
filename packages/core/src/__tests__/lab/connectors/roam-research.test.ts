// roam-research Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/roam-research';

const config: ConnectorTestConfig = {
  connectorId: 'test-roam-research',
  connectorType: 'source',
  engine: 'roam-research',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
