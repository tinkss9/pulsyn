// zenefits Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/zenefits';

const config: ConnectorTestConfig = {
  connectorId: 'test-zenefits',
  connectorType: 'source',
  engine: 'zenefits',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
