// netsuite Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/netsuite';

const config: ConnectorTestConfig = {
  connectorId: 'test-netsuite',
  connectorType: 'source',
  engine: 'netsuite',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
