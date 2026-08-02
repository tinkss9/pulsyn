// dummyimage Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/dummyimage';

const config: ConnectorTestConfig = {
  connectorId: 'test-dummyimage',
  connectorType: 'source',
  engine: 'dummyimage',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
