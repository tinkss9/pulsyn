// hyperdrive Connector — Lab Test Suite
import { createConnectorTests, ConnectorTestConfig } from '../runners/connector.runner';
import '../../../connectors/hyperdrive';

const config: ConnectorTestConfig = {
  connectorId: 'test-hyperdrive',
  connectorType: 'source',
  engine: 'hyperdrive',
  config: {},
  testTables: [],
  skipCDC: true,
  skipBenchmark: false,
};

const runner = createConnectorTests(config);
runner.runUnitTests();
runner.runIntegrationTests();
runner.runE2ETests();
