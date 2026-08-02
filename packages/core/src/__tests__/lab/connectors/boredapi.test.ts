// boredapi Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/boredapi';

const config: ConnectorTestConfig = {
  connectorId: 'test-boredapi',
  connectorType: 'source',
  engine: 'boredapi',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
